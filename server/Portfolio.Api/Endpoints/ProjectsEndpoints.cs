using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Portfolio.Api.Common;
using Portfolio.Api.Contracts.Projects;
using Portfolio.Api.Data;
using Portfolio.Api.Domain;

namespace Portfolio.Api.Endpoints;

public static class ProjectsEndpoints
{
    public static IEndpointRouteBuilder MapProjectsEndpoints(this IEndpointRouteBuilder app)
    {
        // ── Public (unauthenticated, published only) ─────────────────
        var pub = app.MapGroup("/api/public/projects").WithTags("Public / Projects");

        pub.MapGet("", ListPublicAsync).AllowAnonymous();
        pub.MapGet("{slug}", GetPublicAsync).AllowAnonymous();

        // ── Admin (JWT-protected, all records) ───────────────────────
        var admin = app.MapGroup("/api/admin/projects")
                       .WithTags("Admin / Projects")
                       .RequireAuthorization();

        admin.MapGet("", ListAdminAsync);
        admin.MapGet("{id:int}", GetAdminAsync);
        admin.MapPost("", CreateAsync);
        admin.MapPut("{id:int}", UpdateAsync);
        admin.MapDelete("{id:int}", DeleteAsync);
        admin.MapPost("reorder", ReorderAsync);
        admin.MapPost("{id:int}/publish", PublishAsync);

        return app;
    }

    // ── Public handlers ─────────────────────────────────────────────
    private static async Task<Ok<List<ProjectPublicDto>>> ListPublicAsync(
        [FromQuery] string? lang,
        AppDbContext db,
        CancellationToken ct)
    {
        var language = NormalizeLang(lang);
        var list = await db.Projects.AsNoTracking()
            .Where(p => p.IsPublished)
            .OrderBy(p => p.SortOrder).ThenByDescending(p => p.UpdatedAt)
            .ToListAsync(ct);

        return TypedResults.Ok(list.Select(p => ToPublicDto(p, language)).ToList());
    }

    private static async Task<Results<Ok<ProjectPublicDto>, NotFound>> GetPublicAsync(
        string slug,
        [FromQuery] string? lang,
        AppDbContext db,
        CancellationToken ct)
    {
        var language = NormalizeLang(lang);
        var p = await db.Projects.AsNoTracking()
            .FirstOrDefaultAsync(x => x.Slug == slug && x.IsPublished, ct);
        return p is null ? TypedResults.NotFound() : TypedResults.Ok(ToPublicDto(p, language));
    }

    // ── Admin handlers ──────────────────────────────────────────────
    private static async Task<Ok<List<ProjectListItemDto>>> ListAdminAsync(
        AppDbContext db,
        CancellationToken ct)
    {
        var list = await db.Projects.AsNoTracking()
            .OrderBy(p => p.SortOrder).ThenByDescending(p => p.UpdatedAt)
            .Select(p => new ProjectListItemDto(
                p.Id, p.Slug, p.SortOrder, p.IsPublished, p.Color, p.TypeKey,
                p.DataTr.Title, p.DataEn.Title, p.UpdatedAt))
            .ToListAsync(ct);
        return TypedResults.Ok(list);
    }

    private static async Task<Results<Ok<ProjectAdminDto>, NotFound>> GetAdminAsync(
        int id, AppDbContext db, CancellationToken ct)
    {
        var p = await db.Projects.FindAsync([id], ct);
        return p is null ? TypedResults.NotFound() : TypedResults.Ok(ToAdminDto(p));
    }

    private static async Task<Results<Created<ProjectAdminDto>, ValidationProblem, Conflict<string>>> CreateAsync(
        [FromBody] ProjectUpsertDto dto,
        AppDbContext db,
        IValidator<ProjectUpsertDto> validator,
        CancellationToken ct)
    {
        var val = await validator.ValidateAsync(dto, ct);
        if (!val.IsValid) return TypedResults.ValidationProblem(val.ToDictionary());

        if (await db.Projects.IsSlugTakenAsync(dto.Slug, excludeId: null, ct))
            return TypedResults.Conflict($"Slug '{dto.Slug}' already exists.");

        var p = new Project
        {
            Slug = dto.Slug,
            SortOrder = dto.SortOrder,
            IsPublished = dto.IsPublished,
            Color = dto.Color,
            TypeKey = dto.TypeKey,
            Github = dto.Github,
            Live = dto.Live,
            Tags = dto.Tags,
            DataTr = dto.DataTr,
            DataEn = dto.DataEn,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        db.Projects.Add(p);
        await db.SaveChangesAsync(ct);

        return TypedResults.Created($"/api/admin/projects/{p.Id}", ToAdminDto(p));
    }

    private static async Task<Results<Ok<ProjectAdminDto>, NotFound, ValidationProblem, Conflict<string>>> UpdateAsync(
        int id,
        [FromBody] ProjectUpsertDto dto,
        AppDbContext db,
        IValidator<ProjectUpsertDto> validator,
        CancellationToken ct)
    {
        var val = await validator.ValidateAsync(dto, ct);
        if (!val.IsValid) return TypedResults.ValidationProblem(val.ToDictionary());

        var p = await db.Projects.FindAsync([id], ct);
        if (p is null) return TypedResults.NotFound();

        if (p.Slug != dto.Slug && await db.Projects.IsSlugTakenAsync(dto.Slug, excludeId: id, ct))
            return TypedResults.Conflict($"Slug '{dto.Slug}' already exists.");

        p.Slug = dto.Slug;
        p.SortOrder = dto.SortOrder;
        p.IsPublished = dto.IsPublished;
        p.Color = dto.Color;
        p.TypeKey = dto.TypeKey;
        p.Github = dto.Github;
        p.Live = dto.Live;
        p.Tags = dto.Tags;
        p.DataTr = dto.DataTr;
        p.DataEn = dto.DataEn;
        p.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync(ct);
        return TypedResults.Ok(ToAdminDto(p));
    }

    private static async Task<Results<NoContent, NotFound>> DeleteAsync(
        int id, AppDbContext db, CancellationToken ct)
    {
        var p = await db.Projects.FindAsync([id], ct);
        if (p is null) return TypedResults.NotFound();
        db.Projects.Remove(p);
        await db.SaveChangesAsync(ct);
        return TypedResults.NoContent();
    }

    private static async Task<Results<NoContent, ValidationProblem>> ReorderAsync(
        [FromBody] List<ReorderItem> items,
        AppDbContext db,
        CancellationToken ct)
    {
        if (items is null || items.Count == 0)
            return TypedResults.ValidationProblem(new Dictionary<string, string[]>
            {
                ["items"] = ["At least one reorder entry is required."]
            });

        if (items.Any(i => i.Id <= 0 || i.SortOrder < 0))
            return TypedResults.ValidationProblem(new Dictionary<string, string[]>
            {
                ["items"] = ["Id must be > 0 and SortOrder must be >= 0."]
            });

        var ids = items.Select(x => x.Id).ToHashSet();
        var projects = await db.Projects.Where(p => ids.Contains(p.Id)).ToListAsync(ct);
        foreach (var p in projects)
        {
            var target = items.FirstOrDefault(i => i.Id == p.Id);
            if (target is not null) { p.SortOrder = target.SortOrder; p.UpdatedAt = DateTime.UtcNow; }
        }
        await db.SaveChangesAsync(ct);
        return TypedResults.NoContent();
    }

    private static async Task<Results<Ok<ProjectAdminDto>, NotFound>> PublishAsync(
        int id, AppDbContext db, CancellationToken ct)
    {
        var p = await db.Projects.FindAsync([id], ct);
        if (p is null) return TypedResults.NotFound();
        p.IsPublished = !p.IsPublished;
        p.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        return TypedResults.Ok(ToAdminDto(p));
    }

    // ── Helpers ─────────────────────────────────────────────────────
    private static string NormalizeLang(string? lang) => LangHelpers.Normalize(lang);

    private static ProjectPublicDto ToPublicDto(Project p, string lang)
    {
        var d = LangHelpers.PickLocale(lang, p.DataTr, p.DataEn);
        return new ProjectPublicDto(
            p.Id, p.Slug, p.Color, p.TypeKey, p.Github, p.Live, p.Tags,
            d.Title, d.ShortDesc, d.LongDesc, d.Status, d.Client, d.Highlights);
    }

    private static ProjectAdminDto ToAdminDto(Project p) =>
        new(p.Id, p.Slug, p.SortOrder, p.IsPublished, p.Color, p.TypeKey,
            p.Github, p.Live, p.Tags, p.DataTr, p.DataEn, p.CreatedAt, p.UpdatedAt);
}
