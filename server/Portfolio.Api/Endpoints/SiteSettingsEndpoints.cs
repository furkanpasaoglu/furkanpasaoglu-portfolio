using System.Text.Json;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Portfolio.Api.Contracts.SiteSettings;
using Portfolio.Api.Data;
using Portfolio.Api.Services;

namespace Portfolio.Api.Endpoints;

public static class SiteSettingsEndpoints
{
    public static IEndpointRouteBuilder MapSiteSettingsEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/public/site-settings", GetPublicAsync)
           .WithTags("Public / SiteSettings")
           .AllowAnonymous();

        app.MapGet("/api/admin/site-settings", GetAdminAsync)
           .WithTags("Admin / SiteSettings")
           .RequireAuthorization();

        app.MapPut("/api/admin/site-settings", UpdateAsync)
           .WithTags("Admin / SiteSettings")
           .RequireAuthorization();

        app.MapPost("/api/admin/site-settings/render", ManualRenderAsync)
           .WithTags("Admin / SiteSettings")
           .RequireAuthorization();

        return app;
    }

    private static async Task<Ok<PublicSiteSettingsDto>> GetPublicAsync(
        [FromQuery] string? lang, AppDbContext db, CancellationToken ct)
    {
        var row = await db.SiteSettings.AsNoTracking().FirstOrDefaultAsync(ct);
        var dto = ToFullDto(row);
        var effectiveLang = lang == "tr" ? "tr" : "en";
        var locale = effectiveLang == "tr" ? dto.DataTr : dto.DataEn;
        return TypedResults.Ok(new PublicSiteSettingsDto(effectiveLang, locale, dto.Branding, dto.Schema, dto.Operations));
    }

    private static async Task<Ok<SiteSettingsDto>> GetAdminAsync(AppDbContext db, CancellationToken ct)
    {
        var row = await db.SiteSettings.AsNoTracking().FirstOrDefaultAsync(ct);
        var dto = ToFullDto(row);
        // Mask SMTP password — it's write-only to the admin UI.
        var masked = dto with
        {
            Communications = dto.Communications with
            {
                Smtp = dto.Communications.Smtp with { Password = string.IsNullOrEmpty(dto.Communications.Smtp.Password) ? "" : MaskedPassword }
            }
        };
        return TypedResults.Ok(masked);
    }

    private static async Task<Results<Ok<SiteSettingsDto>, ValidationProblem>> UpdateAsync(
        [FromBody] SiteSettingsDto dto,
        AppDbContext db,
        IValidator<SiteSettingsDto> validator,
        ISiteRenderer renderer,
        ILogger<Portfolio.Api.Domain.SiteSettings> log,
        CancellationToken ct)
    {
        var val = await validator.ValidateAsync(dto, ct);
        if (!val.IsValid) return TypedResults.ValidationProblem(val.ToDictionary());

        var row = await db.SiteSettings.FirstOrDefaultAsync(ct);
        if (row is null) { row = new Domain.SiteSettings { Id = 1 }; db.SiteSettings.Add(row); }
        var incomingCommunications = PreserveSmtpPassword(dto.Communications, row.CommunicationsJson);

        row.DataTr = SerializeToJsonElement(dto.DataTr);
        row.DataEn = SerializeToJsonElement(dto.DataEn);
        row.BrandingJson = SerializeToJsonElement(dto.Branding);
        row.SchemaJson = SerializeToJsonElement(dto.Schema);
        row.OperationsJson = SerializeToJsonElement(dto.Operations);
        row.SecurityJson = SerializeToJsonElement(dto.Security);
        row.CommunicationsJson = SerializeToJsonElement(incomingCommunications);
        row.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);

        try { await renderer.RenderAllAsync(ct); }
        catch (Exception ex) { log.LogError(ex, "Site render failed after save — admin data persisted."); }

        return TypedResults.Ok(ToFullDto(row));
    }

    private static async Task<Ok<object>> ManualRenderAsync(ISiteRenderer renderer, CancellationToken ct)
    {
        await renderer.RenderAllAsync(ct);
        return TypedResults.Ok<object>(new { renderedAt = DateTime.UtcNow });
    }

    private const string MaskedPassword = "••••••••";

    /// <summary>Replaces empty/masked SMTP password with the previously stored value so admin doesn't overwrite it accidentally.</summary>
    private static CommunicationsDto PreserveSmtpPassword(CommunicationsDto incoming, JsonElement existing)
    {
        if (!string.IsNullOrEmpty(incoming.Smtp.Password) && incoming.Smtp.Password != MaskedPassword)
            return incoming;

        var existingPassword = "";
        if (existing.ValueKind == JsonValueKind.Object
            && existing.TryGetProperty("smtp", out var smtpEl)
            && smtpEl.TryGetProperty("password", out var pwdEl))
        {
            existingPassword = pwdEl.GetString() ?? "";
        }
        return incoming with { Smtp = incoming.Smtp with { Password = existingPassword } };
    }

    private static readonly JsonSerializerOptions CamelOpts = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
    };

    private static JsonElement SerializeToJsonElement<T>(T value)
    {
        var bytes = JsonSerializer.SerializeToUtf8Bytes(value, CamelOpts);
        using var doc = JsonDocument.Parse(bytes);
        return doc.RootElement.Clone();
    }

    private static SiteSettingsDto ToFullDto(Domain.SiteSettings? row)
    {
        if (row is null) return EmptyDto();
        return new SiteSettingsDto(
            DataTr: Deserialize<LocaleSeoDto>(row.DataTr) ?? EmptyLocale(),
            DataEn: Deserialize<LocaleSeoDto>(row.DataEn) ?? EmptyLocale(),
            Branding: Deserialize<BrandingDto>(row.BrandingJson) ?? EmptyBranding(),
            Schema: Deserialize<SchemaDto>(row.SchemaJson) ?? EmptySchema(),
            Operations: Deserialize<OperationsDto>(row.OperationsJson) ?? EmptyOperations(),
            Security: Deserialize<SecurityDto>(row.SecurityJson) ?? EmptySecurity(),
            Communications: Deserialize<CommunicationsDto>(row.CommunicationsJson) ?? EmptyCommunications());
    }

    private static T? Deserialize<T>(JsonElement el)
    {
        if (el.ValueKind == JsonValueKind.Undefined || el.ValueKind == JsonValueKind.Null) return default;
        return el.Deserialize<T>(CamelOpts);
    }

    private static SiteSettingsDto EmptyDto() => new(EmptyLocale(), EmptyLocale(), EmptyBranding(), EmptySchema(), EmptyOperations(), EmptySecurity(), EmptyCommunications());
    private static CommunicationsDto EmptyCommunications() => new(
        Smtp: new(false, "", 587, "", "", "", "", true),
        AutoReply: new(false, "", "", "", ""),
        AdminNotifyEmail: "");
    private static LocaleSeoDto EmptyLocale() => new("", "", "", "", "", "", "", "", "", "en_US");
    private static BrandingDto EmptyBranding() => new("https://example.com", "#000000", "", "", 1200, 630, "", "summary_large_image", null, true, true, "monthly", 1.0m);
    private static SchemaDto EmptySchema() => new("", "", "", "TR", "2025-01-01", Array.Empty<string>(),
        "", "", "", "", "", "", Array.Empty<string>(), Array.Empty<string>(), "", "", "", "");
    private static OperationsDto EmptyOperations() => new(
        MaintenanceMode: false,
        MaintenanceMessage_tr: "",
        MaintenanceMessage_en: "",
        SectionsEnabled: new(true, true, true, true, true, true, true),
        Analytics: new(false, "", ""));
    private static SecurityDto EmptySecurity() => new(
        Csp: new(
            DefaultSrc: new[] { "'self'" },
            ScriptSrc: new[] { "'self'", "'unsafe-inline'" },
            StyleSrc: new[] { "'self'", "'unsafe-inline'", "https://fonts.googleapis.com" },
            FontSrc: new[] { "'self'", "https://fonts.gstatic.com" },
            ImgSrc: new[] { "'self'", "data:", "https:" },
            ConnectSrc: new[] { "'self'" },
            FrameSrc: Array.Empty<string>()),
        RobotsExtraDirectives: Array.Empty<string>());
}
