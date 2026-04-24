using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Portfolio.Api.Common;
using Portfolio.Api.Contracts.Blog;
using Portfolio.Api.Data;
using Portfolio.Api.Domain;
using Portfolio.Api.Services;

namespace Portfolio.Api.Endpoints;

public static class BlogEndpoints
{
    public static IEndpointRouteBuilder MapBlogEndpoints(this IEndpointRouteBuilder app)
    {
        var pub = app.MapGroup("/api/public/blog").WithTags("Public / Blog");
        pub.MapGet("", ListPublicAsync).AllowAnonymous();
        pub.MapGet("{slug}", GetPublicAsync).AllowAnonymous();

        var admin = app.MapGroup("/api/admin/blog")
                       .WithTags("Admin / Blog")
                       .RequireAuthorization();
        admin.MapGet("", ListAdminAsync);
        admin.MapGet("{id:int}", GetAdminAsync);
        admin.MapPost("", CreateAsync);
        admin.MapPut("{id:int}", UpdateAsync);
        admin.MapDelete("{id:int}", DeleteAsync);
        admin.MapPost("{id:int}/publish", PublishAsync);

        return app;
    }

    private static async Task<Ok<List<BlogPostPublicDto>>> ListPublicAsync(
        [FromQuery] string? lang, AppDbContext db, CancellationToken ct)
    {
        var l = LangHelpers.Normalize(lang);
        var list = await db.BlogPosts.AsNoTracking()
                     .Where(x => x.IsPublished)
                     .OrderBy(x => x.SortOrder).ThenByDescending(x => x.PublishedAt)
                     .ToListAsync(ct);
        return TypedResults.Ok(list.Select(x => ToPublic(x, l, includeContent: false)).ToList());
    }

    private static async Task<Results<Ok<BlogPostPublicDto>, NotFound>> GetPublicAsync(
        string slug, [FromQuery] string? lang, AppDbContext db, CancellationToken ct)
    {
        var l = LangHelpers.Normalize(lang);
        var x = await db.BlogPosts.AsNoTracking()
            .FirstOrDefaultAsync(y => y.Slug == slug && y.IsPublished, ct);
        return x is null ? TypedResults.NotFound() : TypedResults.Ok(ToPublic(x, l, includeContent: true));
    }

    private static async Task<Ok<List<BlogPostListItemDto>>> ListAdminAsync(
        AppDbContext db, CancellationToken ct)
    {
        var list = await db.BlogPosts.AsNoTracking()
            .OrderBy(x => x.SortOrder).ThenByDescending(x => x.UpdatedAt)
            .Select(x => new BlogPostListItemDto(
                x.Id, x.Slug, x.SortOrder, x.IsFeatured, x.IsPublished,
                x.Category, x.Color, x.DataTr.Title, x.DataEn.Title, x.UpdatedAt))
            .ToListAsync(ct);
        return TypedResults.Ok(list);
    }

    private static async Task<Results<Ok<BlogPostAdminDto>, NotFound>> GetAdminAsync(
        int id, AppDbContext db, CancellationToken ct)
    {
        var x = await db.BlogPosts.FindAsync([id], ct);
        return x is null ? TypedResults.NotFound() : TypedResults.Ok(ToAdmin(x));
    }

    private static async Task<Results<Created<BlogPostAdminDto>, ValidationProblem, Conflict<string>>> CreateAsync(
        [FromBody] BlogPostUpsertDto dto,
        AppDbContext db,
        IValidator<BlogPostUpsertDto> validator,
        ISiteRenderer renderer,
        ILogger<BlogPost> logger,
        CancellationToken ct)
    {
        var val = await validator.ValidateAsync(dto, ct);
        if (!val.IsValid) return TypedResults.ValidationProblem(val.ToDictionary());

        if (await db.BlogPosts.IsSlugTakenAsync(dto.Slug, excludeId: null, ct))
            return TypedResults.Conflict($"Slug '{dto.Slug}' already exists.");

        var x = new BlogPost
        {
            Slug = dto.Slug,
            SortOrder = dto.SortOrder,
            IsFeatured = dto.IsFeatured,
            IsPublished = dto.IsPublished,
            Category = dto.Category,
            Color = dto.Color,
            PublishedAt = dto.PublishedAt,
            Tags = dto.Tags,
            DataTr = dto.DataTr,
            DataEn = dto.DataEn,
            ContentTr = dto.ContentTr,
            ContentEn = dto.ContentEn,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        db.BlogPosts.Add(x);
        await db.SaveChangesAsync(ct);
        try { await renderer.RenderSitemapAsync(ct); }
        catch (Exception ex) { logger.LogWarning(ex, "Sitemap re-render failed (non-fatal)."); }
        return TypedResults.Created($"/api/admin/blog/{x.Id}", ToAdmin(x));
    }

    private static async Task<Results<Ok<BlogPostAdminDto>, NotFound, ValidationProblem, Conflict<string>>> UpdateAsync(
        int id,
        [FromBody] BlogPostUpsertDto dto,
        AppDbContext db,
        IValidator<BlogPostUpsertDto> validator,
        ISiteRenderer renderer,
        ILogger<BlogPost> logger,
        CancellationToken ct)
    {
        var val = await validator.ValidateAsync(dto, ct);
        if (!val.IsValid) return TypedResults.ValidationProblem(val.ToDictionary());

        var x = await db.BlogPosts.FindAsync([id], ct);
        if (x is null) return TypedResults.NotFound();
        if (x.Slug != dto.Slug && await db.BlogPosts.IsSlugTakenAsync(dto.Slug, excludeId: id, ct))
            return TypedResults.Conflict($"Slug '{dto.Slug}' already exists.");
        x.Slug = dto.Slug;
        x.SortOrder = dto.SortOrder;
        x.IsFeatured = dto.IsFeatured;
        x.IsPublished = dto.IsPublished;
        x.Category = dto.Category;
        x.Color = dto.Color;
        x.PublishedAt = dto.PublishedAt;
        x.Tags = dto.Tags;
        x.DataTr = dto.DataTr;
        x.DataEn = dto.DataEn;
        x.ContentTr = dto.ContentTr;
        x.ContentEn = dto.ContentEn;
        x.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        try { await renderer.RenderSitemapAsync(ct); }
        catch (Exception ex) { logger.LogWarning(ex, "Sitemap re-render failed (non-fatal)."); }
        return TypedResults.Ok(ToAdmin(x));
    }

    private static async Task<Results<NoContent, NotFound>> DeleteAsync(
        int id, AppDbContext db, ISiteRenderer renderer, ILogger<BlogPost> logger, CancellationToken ct)
    {
        var x = await db.BlogPosts.FindAsync([id], ct);
        if (x is null) return TypedResults.NotFound();
        db.BlogPosts.Remove(x);
        await db.SaveChangesAsync(ct);
        try { await renderer.RenderSitemapAsync(ct); }
        catch (Exception ex) { logger.LogWarning(ex, "Sitemap re-render failed (non-fatal)."); }
        return TypedResults.NoContent();
    }

    private static async Task<Results<Ok<BlogPostAdminDto>, NotFound>> PublishAsync(
        int id, AppDbContext db, ISiteRenderer renderer, ILogger<BlogPost> logger, CancellationToken ct)
    {
        var x = await db.BlogPosts.FindAsync([id], ct);
        if (x is null) return TypedResults.NotFound();
        x.IsPublished = !x.IsPublished;
        x.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        try { await renderer.RenderSitemapAsync(ct); }
        catch (Exception ex) { logger.LogWarning(ex, "Sitemap re-render failed (non-fatal)."); }
        return TypedResults.Ok(ToAdmin(x));
    }

    private static BlogPostPublicDto ToPublic(BlogPost x, string lang, bool includeContent)
    {
        var d = LangHelpers.PickLocale(lang, x.DataTr, x.DataEn);
        return new BlogPostPublicDto(
            x.Id, x.Slug, x.SortOrder, x.IsFeatured, x.Category, x.Color, x.PublishedAt,
            x.Tags, d.Title, d.Excerpt, d.Date, d.ReadTime,
            includeContent ? LangHelpers.PickLocale(lang, x.ContentTr, x.ContentEn) : null);
    }

    private static BlogPostAdminDto ToAdmin(BlogPost x) =>
        new(x.Id, x.Slug, x.SortOrder, x.IsFeatured, x.IsPublished, x.Category, x.Color,
            x.PublishedAt, x.Tags, x.DataTr, x.DataEn, x.ContentTr, x.ContentEn, x.UpdatedAt);
}
