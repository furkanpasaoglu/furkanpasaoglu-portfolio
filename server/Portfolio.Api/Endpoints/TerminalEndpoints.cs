using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Portfolio.Api.Common;
using Portfolio.Api.Contracts.Terminal;
using Portfolio.Api.Data;
using Portfolio.Api.Domain;

namespace Portfolio.Api.Endpoints;

public static class TerminalEndpoints
{
    public static IEndpointRouteBuilder MapTerminalEndpoints(this IEndpointRouteBuilder app)
    {
        var pub = app.MapGroup("/api/public/terminal-commands").WithTags("Public / Terminal");
        pub.MapGet("", ListPublicAsync).AllowAnonymous();

        var admin = app.MapGroup("/api/admin/terminal-commands")
                       .WithTags("Admin / Terminal")
                       .RequireAuthorization();
        admin.MapGet("", ListAdminAsync);
        admin.MapGet("{id:int}", GetAdminAsync);
        admin.MapPost("", CreateAsync);
        admin.MapPut("{id:int}", UpdateAsync);
        admin.MapDelete("{id:int}", DeleteAsync);
        admin.MapPost("{id:int}/publish", PublishAsync);

        return app;
    }

    private static async Task<Ok<List<TerminalCommandPublicDto>>> ListPublicAsync(
        [FromQuery] string? lang, AppDbContext db, CancellationToken ct)
    {
        var l = LangHelpers.Normalize(lang);
        var list = await db.TerminalCommands.AsNoTracking()
                     .Where(x => x.IsPublished)
                     .OrderBy(x => x.SortOrder).ThenBy(x => x.Name)
                     .ToListAsync(ct);
        return TypedResults.Ok(list.Select(x =>
        {
            var d = LangHelpers.PickLocale(l, x.DataTr, x.DataEn);
            return new TerminalCommandPublicDto(x.Name, d.Summary, d.Body);
        }).ToList());
    }

    private static async Task<Ok<List<TerminalCommandListItemDto>>> ListAdminAsync(
        AppDbContext db, CancellationToken ct)
    {
        var list = await db.TerminalCommands.AsNoTracking()
            .OrderBy(x => x.SortOrder).ThenBy(x => x.Name)
            .Select(x => new TerminalCommandListItemDto(
                x.Id, x.Name, x.SortOrder, x.IsPublished, x.DataTr.Summary, x.UpdatedAt))
            .ToListAsync(ct);
        return TypedResults.Ok(list);
    }

    private static async Task<Results<Ok<TerminalCommandAdminDto>, NotFound>> GetAdminAsync(
        int id, AppDbContext db, CancellationToken ct)
    {
        var x = await db.TerminalCommands.FindAsync([id], ct);
        return x is null ? TypedResults.NotFound() : TypedResults.Ok(ToAdminDto(x));
    }

    private static async Task<Results<Created<TerminalCommandAdminDto>, Conflict<string>, ValidationProblem>> CreateAsync(
        [FromBody] TerminalCommandUpsertDto dto,
        AppDbContext db,
        IValidator<TerminalCommandUpsertDto> validator,
        CancellationToken ct)
    {
        var val = await validator.ValidateAsync(dto, ct);
        if (!val.IsValid) return TypedResults.ValidationProblem(val.ToDictionary());

        if (await IsNameTakenAsync(db, dto.Name, excludeId: null, ct))
            return TypedResults.Conflict($"Command '{dto.Name}' already exists.");

        var x = new TerminalCommand
        {
            Name = dto.Name,
            SortOrder = dto.SortOrder,
            IsPublished = dto.IsPublished,
            DataTr = dto.DataTr,
            DataEn = dto.DataEn,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        db.TerminalCommands.Add(x);
        await db.SaveChangesAsync(ct);
        return TypedResults.Created($"/api/admin/terminal-commands/{x.Id}", ToAdminDto(x));
    }

    private static async Task<Results<Ok<TerminalCommandAdminDto>, NotFound, Conflict<string>, ValidationProblem>> UpdateAsync(
        int id,
        [FromBody] TerminalCommandUpsertDto dto,
        AppDbContext db,
        IValidator<TerminalCommandUpsertDto> validator,
        CancellationToken ct)
    {
        var val = await validator.ValidateAsync(dto, ct);
        if (!val.IsValid) return TypedResults.ValidationProblem(val.ToDictionary());

        var x = await db.TerminalCommands.FindAsync([id], ct);
        if (x is null) return TypedResults.NotFound();

        if (x.Name != dto.Name && await IsNameTakenAsync(db, dto.Name, excludeId: id, ct))
            return TypedResults.Conflict($"Command '{dto.Name}' already exists.");

        x.Name = dto.Name;
        x.SortOrder = dto.SortOrder;
        x.IsPublished = dto.IsPublished;
        x.DataTr = dto.DataTr;
        x.DataEn = dto.DataEn;
        x.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        return TypedResults.Ok(ToAdminDto(x));
    }

    private static async Task<Results<NoContent, NotFound>> DeleteAsync(
        int id, AppDbContext db, CancellationToken ct)
    {
        var x = await db.TerminalCommands.FindAsync([id], ct);
        if (x is null) return TypedResults.NotFound();
        db.TerminalCommands.Remove(x);
        await db.SaveChangesAsync(ct);
        return TypedResults.NoContent();
    }

    private static async Task<Results<Ok<TerminalCommandAdminDto>, NotFound>> PublishAsync(
        int id, AppDbContext db, CancellationToken ct)
    {
        var x = await db.TerminalCommands.FindAsync([id], ct);
        if (x is null) return TypedResults.NotFound();
        x.IsPublished = !x.IsPublished;
        x.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        return TypedResults.Ok(ToAdminDto(x));
    }

    private static Task<bool> IsNameTakenAsync(
        AppDbContext db, string name, int? excludeId, CancellationToken ct) =>
        db.TerminalCommands.AnyAsync(x => x.Name == name && (excludeId == null || x.Id != excludeId), ct);

    private static TerminalCommandAdminDto ToAdminDto(TerminalCommand x) =>
        new(x.Id, x.Name, x.SortOrder, x.IsPublished, x.DataTr, x.DataEn, x.UpdatedAt);
}
