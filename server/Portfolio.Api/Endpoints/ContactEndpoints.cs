using System.Text.Json;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Portfolio.Api.Contracts.Contact;
using Portfolio.Api.Contracts.SiteSettings;
using Portfolio.Api.Data;
using Portfolio.Api.Domain;
using Portfolio.Api.Services;

namespace Portfolio.Api.Endpoints;

public static class ContactEndpoints
{
    public static IEndpointRouteBuilder MapContactEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/public/contact", SubmitAsync)
           .WithTags("Public / Contact")
           .AllowAnonymous()
           .RequireRateLimiting("contact");

        var admin = app.MapGroup("/api/admin/messages")
                       .WithTags("Admin / Messages")
                       .RequireAuthorization();
        admin.MapGet("", ListAsync);
        admin.MapGet("{id:int}", GetAsync);
        admin.MapPut("{id:int}/read", ToggleReadAsync);
        admin.MapDelete("{id:int}", DeleteAsync);

        app.MapPost("/api/admin/messages/test-smtp", TestSmtpAsync)
           .WithTags("Admin / Messages")
           .RequireAuthorization();

        return app;
    }

    private static async Task<Results<NoContent, ValidationProblem>> SubmitAsync(
        [FromBody] ContactSubmitDto dto,
        HttpContext http,
        AppDbContext db,
        IValidator<ContactSubmitDto> validator,
        IEmailSender email,
        CancellationToken ct)
    {
        // Honeypot — bot filled `website`. Pretend success, drop silently.
        if (!string.IsNullOrWhiteSpace(dto.Website))
            return TypedResults.NoContent();

        var val = await validator.ValidateAsync(dto, ct);
        if (!val.IsValid) return TypedResults.ValidationProblem(val.ToDictionary());

        var msg = new ContactMessage
        {
            Name = dto.Name.Trim(),
            Email = dto.Email.Trim(),
            Message = dto.Message.Trim(),
            Lang = dto.Lang,
            IpAddress = http.Connection.RemoteIpAddress?.ToString(),
            UserAgent = http.Request.Headers.UserAgent.ToString(),
            CreatedAt = DateTime.UtcNow,
        };
        db.ContactMessages.Add(msg);
        await db.SaveChangesAsync(ct);

        // Fire off notifications — any failure is logged but not surfaced to the submitter.
        try { await NotifyAsync(email, db, msg, ct); }
        catch (Exception ex) { http.RequestServices.GetRequiredService<ILogger<ContactMessage>>().LogError(ex, "Failed to send contact notifications."); }

        return TypedResults.NoContent();
    }

    private static async Task NotifyAsync(IEmailSender email, AppDbContext db, ContactMessage msg, CancellationToken ct)
    {
        var row = await db.SiteSettings.AsNoTracking().FirstOrDefaultAsync(ct);
        if (row is null || row.CommunicationsJson.ValueKind != JsonValueKind.Object) return;

        var com = row.CommunicationsJson.Deserialize<CommunicationsDto>(new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
        if (com is null) return;

        // Notify admin
        if (!string.IsNullOrWhiteSpace(com.AdminNotifyEmail))
        {
            var body = $"New contact message from {msg.Name} <{msg.Email}> ({msg.Lang}):\n\n{msg.Message}\n\n" +
                       $"— Submitted {msg.CreatedAt:u} — IP {msg.IpAddress}";
            await email.SendAsync(com.AdminNotifyEmail, $"Portfolio contact: {msg.Name}", body, ct);
        }

        // Auto-reply to sender
        if (com.AutoReply.Enabled)
        {
            var subject = msg.Lang == "tr" ? com.AutoReply.Subject_tr : com.AutoReply.Subject_en;
            var body = msg.Lang == "tr" ? com.AutoReply.Body_tr : com.AutoReply.Body_en;
            body = body.Replace("{name}", msg.Name);
            await email.SendAsync(msg.Email, subject, body, ct);
        }
    }

    private static async Task<Ok<List<ContactMessageListItemDto>>> ListAsync(AppDbContext db, CancellationToken ct)
    {
        var list = await db.ContactMessages.AsNoTracking()
            .OrderByDescending(m => m.CreatedAt)
            .Select(m => new ContactMessageListItemDto(
                m.Id, m.Name, m.Email,
                m.Message.Length > 100 ? m.Message.Substring(0, 100) + "..." : m.Message,
                m.Lang, m.IsRead, m.CreatedAt))
            .ToListAsync(ct);
        return TypedResults.Ok(list);
    }

    private static async Task<Results<Ok<ContactMessageDto>, NotFound>> GetAsync(
        int id, AppDbContext db, CancellationToken ct)
    {
        var m = await db.ContactMessages.FindAsync([id], ct);
        if (m is null) return TypedResults.NotFound();
        if (!m.IsRead)
        {
            m.IsRead = true;
            await db.SaveChangesAsync(ct);
        }
        return TypedResults.Ok(new ContactMessageDto(m.Id, m.Name, m.Email, m.Message, m.Lang, m.IsRead, m.CreatedAt));
    }

    private static async Task<Results<Ok<ContactMessageDto>, NotFound>> ToggleReadAsync(
        int id, AppDbContext db, CancellationToken ct)
    {
        var m = await db.ContactMessages.FindAsync([id], ct);
        if (m is null) return TypedResults.NotFound();
        m.IsRead = !m.IsRead;
        await db.SaveChangesAsync(ct);
        return TypedResults.Ok(new ContactMessageDto(m.Id, m.Name, m.Email, m.Message, m.Lang, m.IsRead, m.CreatedAt));
    }

    private static async Task<Results<NoContent, NotFound>> DeleteAsync(
        int id, AppDbContext db, CancellationToken ct)
    {
        var m = await db.ContactMessages.FindAsync([id], ct);
        if (m is null) return TypedResults.NotFound();
        db.ContactMessages.Remove(m);
        await db.SaveChangesAsync(ct);
        return TypedResults.NoContent();
    }

    private static async Task<Results<Ok<object>, ValidationProblem, BadRequest<string>>> TestSmtpAsync(
        [FromBody] TestSmtpDto dto,
        AppDbContext db,
        IValidator<TestSmtpDto> validator,
        IEmailSender email,
        CancellationToken ct)
    {
        var val = await validator.ValidateAsync(dto, ct);
        if (!val.IsValid) return TypedResults.ValidationProblem(val.ToDictionary());

        var row = await db.SiteSettings.AsNoTracking().FirstOrDefaultAsync(ct);
        if (row is null || row.CommunicationsJson.ValueKind != JsonValueKind.Object)
            return TypedResults.BadRequest("SMTP config not found.");

        var com = row.CommunicationsJson.Deserialize<CommunicationsDto>(new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
        if (com is null) return TypedResults.BadRequest("SMTP config not found.");

        try
        {
            await email.SendWithConfigAsync(com.Smtp, dto.To, "Portfolio SMTP test", "This is a test message from your portfolio admin.", ct);
            return TypedResults.Ok<object>(new { sent = true, at = DateTime.UtcNow });
        }
        catch (Exception ex)
        {
            return TypedResults.BadRequest($"SMTP send failed: {ex.Message}");
        }
    }
}
