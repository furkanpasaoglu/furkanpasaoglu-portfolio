using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Portfolio.Api.Common;
using Portfolio.Api.Contracts.Skills;
using Portfolio.Api.Data;
using Portfolio.Api.Domain;

namespace Portfolio.Api.Endpoints;

public static class SkillsEndpoints
{
    public static IEndpointRouteBuilder MapSkillsEndpoints(this IEndpointRouteBuilder app)
    {
        var pub = app.MapGroup("/api/public/skills").WithTags("Public / Skills");
        pub.MapGet("", ListPublicAsync).AllowAnonymous();

        var admin = app.MapGroup("/api/admin/skill-categories")
                       .WithTags("Admin / Skills")
                       .RequireAuthorization();
        admin.MapGet("", ListAdminAsync);
        admin.MapGet("{id:int}", GetAdminAsync);
        admin.MapPost("", CreateAsync);
        admin.MapPut("{id:int}", UpdateAsync);
        admin.MapDelete("{id:int}", DeleteAsync);

        return app;
    }

    private static async Task<Ok<List<SkillCategoryPublicDto>>> ListPublicAsync(
        [FromQuery] string? lang, AppDbContext db, CancellationToken ct)
    {
        var l = LangHelpers.Normalize(lang);
        var list = await db.SkillCategories.AsNoTracking()
                     .Where(x => x.IsPublished)
                     .OrderBy(x => x.SortOrder)
                     .ToListAsync(ct);
        return TypedResults.Ok(list.Select(x => new SkillCategoryPublicDto(
            x.Id, x.SortOrder, x.Icon, LangHelpers.PickLocale(l, x.TitleTr, x.TitleEn), x.Skills)).ToList());
    }

    private static async Task<Ok<List<SkillCategoryAdminDto>>> ListAdminAsync(
        AppDbContext db, CancellationToken ct)
    {
        var list = await db.SkillCategories.AsNoTracking().OrderBy(x => x.SortOrder).ToListAsync(ct);
        return TypedResults.Ok(list.Select(ToAdminDto).ToList());
    }

    private static async Task<Results<Ok<SkillCategoryAdminDto>, NotFound>> GetAdminAsync(
        int id, AppDbContext db, CancellationToken ct)
    {
        var x = await db.SkillCategories.FindAsync([id], ct);
        return x is null ? TypedResults.NotFound() : TypedResults.Ok(ToAdminDto(x));
    }

    private static async Task<Results<Created<SkillCategoryAdminDto>, ValidationProblem>> CreateAsync(
        [FromBody] SkillCategoryUpsertDto dto,
        AppDbContext db,
        IValidator<SkillCategoryUpsertDto> validator,
        CancellationToken ct)
    {
        var val = await validator.ValidateAsync(dto, ct);
        if (!val.IsValid) return TypedResults.ValidationProblem(val.ToDictionary());

        var x = new SkillCategory
        {
            SortOrder = dto.SortOrder,
            Icon = dto.Icon,
            TitleTr = dto.TitleTr,
            TitleEn = dto.TitleEn,
            IsPublished = dto.IsPublished,
            Skills = dto.Skills,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        db.SkillCategories.Add(x);
        await db.SaveChangesAsync(ct);
        return TypedResults.Created($"/api/admin/skill-categories/{x.Id}", ToAdminDto(x));
    }

    private static async Task<Results<Ok<SkillCategoryAdminDto>, NotFound, ValidationProblem>> UpdateAsync(
        int id,
        [FromBody] SkillCategoryUpsertDto dto,
        AppDbContext db,
        IValidator<SkillCategoryUpsertDto> validator,
        CancellationToken ct)
    {
        var val = await validator.ValidateAsync(dto, ct);
        if (!val.IsValid) return TypedResults.ValidationProblem(val.ToDictionary());

        var x = await db.SkillCategories.FindAsync([id], ct);
        if (x is null) return TypedResults.NotFound();
        x.SortOrder = dto.SortOrder;
        x.Icon = dto.Icon;
        x.TitleTr = dto.TitleTr;
        x.TitleEn = dto.TitleEn;
        x.IsPublished = dto.IsPublished;
        x.Skills = dto.Skills;
        x.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        return TypedResults.Ok(ToAdminDto(x));
    }

    private static async Task<Results<NoContent, NotFound>> DeleteAsync(
        int id, AppDbContext db, CancellationToken ct)
    {
        var x = await db.SkillCategories.FindAsync([id], ct);
        if (x is null) return TypedResults.NotFound();
        db.SkillCategories.Remove(x);
        await db.SaveChangesAsync(ct);
        return TypedResults.NoContent();
    }

    private static SkillCategoryAdminDto ToAdminDto(SkillCategory x) =>
        new(x.Id, x.SortOrder, x.Icon, x.TitleTr, x.TitleEn, x.IsPublished, x.Skills, x.UpdatedAt);
}
