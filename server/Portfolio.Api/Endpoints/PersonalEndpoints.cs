using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Portfolio.Api.Common;
using Portfolio.Api.Contracts.Personal;
using Portfolio.Api.Data;
using Portfolio.Api.Domain;

namespace Portfolio.Api.Endpoints;

public static class PersonalEndpoints
{
    public static IEndpointRouteBuilder MapPersonalEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/public/personal", GetPublicAsync)
           .WithTags("Public / Personal")
           .AllowAnonymous();

        app.MapGet("/api/admin/personal", GetAdminAsync)
           .WithTags("Admin / Personal")
           .RequireAuthorization();

        app.MapPut("/api/admin/personal", UpdateAsync)
           .WithTags("Admin / Personal")
           .RequireAuthorization();

        return app;
    }

    /// <summary>
    /// The CV is picked here rather than in the browser: the visitor should
    /// get one link, already correct for the language they are reading.
    /// Falling back to the other language beats offering a dead link.
    /// </summary>
    private static string? CvFor(Personal p, string lang) =>
        lang == LangHelpers.Tr
            ? p.CvUrlTr ?? p.CvUrlEn
            : p.CvUrlEn ?? p.CvUrlTr;

    private static async Task<Ok<PersonalDto>> GetPublicAsync(
        [FromQuery] string? lang, AppDbContext db, CancellationToken ct)
    {
        var l = LangHelpers.Normalize(lang);
        var x = await db.Personals.AsNoTracking().FirstOrDefaultAsync(ct) ?? new Personal();
        return TypedResults.Ok(new PersonalDto(
            x.Name, x.Email, x.Location, x.Github, x.Linkedin, CvFor(x, l)));
    }

    private static async Task<Ok<PersonalAdminDto>> GetAdminAsync(AppDbContext db, CancellationToken ct)
    {
        var x = await db.Personals.AsNoTracking().FirstOrDefaultAsync(ct) ?? new Personal();
        return TypedResults.Ok(ToAdminDto(x));
    }

    private static async Task<Results<Ok<PersonalAdminDto>, ValidationProblem>> UpdateAsync(
        [FromBody] PersonalAdminDto dto,
        AppDbContext db,
        IValidator<PersonalAdminDto> validator,
        CancellationToken ct)
    {
        var val = await validator.ValidateAsync(dto, ct);
        if (!val.IsValid) return TypedResults.ValidationProblem(val.ToDictionary());

        var x = await db.Personals.FirstOrDefaultAsync(ct);
        if (x is null)
        {
            x = new Personal { Id = 1 };
            db.Personals.Add(x);
        }

        x.Name = dto.Name;
        x.Email = dto.Email;
        x.Location = dto.Location;
        x.Github = dto.Github;
        x.Linkedin = dto.Linkedin;
        x.CvUrlTr = dto.CvUrlTr;
        x.CvUrlEn = dto.CvUrlEn;
        x.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync(ct);
        return TypedResults.Ok(ToAdminDto(x));
    }

    private static PersonalAdminDto ToAdminDto(Personal x) =>
        new(x.Name, x.Email, x.Location, x.Github, x.Linkedin, x.CvUrlTr, x.CvUrlEn);
}
