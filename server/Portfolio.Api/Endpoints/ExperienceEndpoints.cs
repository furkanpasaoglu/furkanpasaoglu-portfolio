using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Portfolio.Api.Common;
using Portfolio.Api.Contracts.Experience;
using Portfolio.Api.Data;
using Portfolio.Api.Domain;

namespace Portfolio.Api.Endpoints;

public static class ExperienceEndpoints
{
    public static IEndpointRouteBuilder MapExperienceEndpoints(this IEndpointRouteBuilder app)
    {
        var pub = app.MapGroup("/api/public/experience").WithTags("Public / Experience");
        pub.MapGet("", ListPublicAsync).AllowAnonymous();

        var admin = app.MapGroup("/api/admin/experience")
                       .WithTags("Admin / Experience")
                       .RequireAuthorization();
        admin.MapGet("", ListAdminAsync);
        admin.MapGet("{id:int}", GetAdminAsync);
        admin.MapPost("", CreateAsync);
        admin.MapPut("{id:int}", UpdateAsync);
        admin.MapDelete("{id:int}", DeleteAsync);
        admin.MapPost("{id:int}/publish", PublishAsync);

        return app;
    }

    private static async Task<Ok<List<ExperiencePublicDto>>> ListPublicAsync(
        [FromQuery] string? lang, AppDbContext db, CancellationToken ct)
    {
        var l = LangHelpers.Normalize(lang);
        var list = await db.Experiences.AsNoTracking()
                     .Where(x => x.IsPublished)
                     .OrderBy(x => x.SortOrder).ThenByDescending(x => x.UpdatedAt)
                     .ToListAsync(ct);
        return TypedResults.Ok(list.Select(x =>
        {
            var d = LangHelpers.PickLocale(l, x.DataTr, x.DataEn);
            return new ExperiencePublicDto(x.Id, x.SortOrder, x.IsEducation, x.Period, x.Tech,
                d.Title, d.Company, d.Type, d.Desc, d.Highlights);
        }).ToList());
    }

    private static async Task<Ok<List<ExperienceListItemDto>>> ListAdminAsync(
        AppDbContext db, CancellationToken ct)
    {
        var list = await db.Experiences.AsNoTracking()
            .OrderBy(x => x.SortOrder).ThenByDescending(x => x.UpdatedAt)
            .Select(x => new ExperienceListItemDto(
                x.Id, x.SortOrder, x.IsEducation, x.Period, x.IsPublished,
                x.DataTr.Title, x.DataEn.Title, x.UpdatedAt))
            .ToListAsync(ct);
        return TypedResults.Ok(list);
    }

    private static async Task<Results<Ok<ExperienceAdminDto>, NotFound>> GetAdminAsync(
        int id, AppDbContext db, CancellationToken ct)
    {
        var x = await db.Experiences.FindAsync([id], ct);
        return x is null ? TypedResults.NotFound() : TypedResults.Ok(ToAdminDto(x));
    }

    private static async Task<Results<Created<ExperienceAdminDto>, ValidationProblem>> CreateAsync(
        [FromBody] ExperienceUpsertDto dto,
        AppDbContext db,
        IValidator<ExperienceUpsertDto> validator,
        CancellationToken ct)
    {
        var val = await validator.ValidateAsync(dto, ct);
        if (!val.IsValid) return TypedResults.ValidationProblem(val.ToDictionary());

        var x = new Experience
        {
            SortOrder = dto.SortOrder,
            IsEducation = dto.IsEducation,
            Period = dto.Period,
            IsPublished = dto.IsPublished,
            Tech = dto.Tech,
            DataTr = dto.DataTr,
            DataEn = dto.DataEn,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };
        db.Experiences.Add(x);
        await db.SaveChangesAsync(ct);
        return TypedResults.Created($"/api/admin/experience/{x.Id}", ToAdminDto(x));
    }

    private static async Task<Results<Ok<ExperienceAdminDto>, NotFound, ValidationProblem>> UpdateAsync(
        int id,
        [FromBody] ExperienceUpsertDto dto,
        AppDbContext db,
        IValidator<ExperienceUpsertDto> validator,
        CancellationToken ct)
    {
        var val = await validator.ValidateAsync(dto, ct);
        if (!val.IsValid) return TypedResults.ValidationProblem(val.ToDictionary());

        var x = await db.Experiences.FindAsync([id], ct);
        if (x is null) return TypedResults.NotFound();
        x.SortOrder = dto.SortOrder;
        x.IsEducation = dto.IsEducation;
        x.Period = dto.Period;
        x.IsPublished = dto.IsPublished;
        x.Tech = dto.Tech;
        x.DataTr = dto.DataTr;
        x.DataEn = dto.DataEn;
        x.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        return TypedResults.Ok(ToAdminDto(x));
    }

    private static async Task<Results<NoContent, NotFound>> DeleteAsync(
        int id, AppDbContext db, CancellationToken ct)
    {
        var x = await db.Experiences.FindAsync([id], ct);
        if (x is null) return TypedResults.NotFound();
        db.Experiences.Remove(x);
        await db.SaveChangesAsync(ct);
        return TypedResults.NoContent();
    }

    private static async Task<Results<Ok<ExperienceAdminDto>, NotFound>> PublishAsync(
        int id, AppDbContext db, CancellationToken ct)
    {
        var x = await db.Experiences.FindAsync([id], ct);
        if (x is null) return TypedResults.NotFound();
        x.IsPublished = !x.IsPublished;
        x.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        return TypedResults.Ok(ToAdminDto(x));
    }

    private static ExperienceAdminDto ToAdminDto(Experience x) =>
        new(x.Id, x.SortOrder, x.IsEducation, x.Period, x.IsPublished, x.Tech,
            x.DataTr, x.DataEn, x.UpdatedAt);
}
