using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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

    private static async Task<Ok<PersonalDto>> GetPublicAsync(AppDbContext db, CancellationToken ct)
    {
        var x = await db.Personals.AsNoTracking().FirstOrDefaultAsync(ct)
                ?? new Personal();
        return TypedResults.Ok(new PersonalDto(x.Name, x.Email, x.Location, x.Github, x.Linkedin, x.CvUrl));
    }

    private static async Task<Ok<PersonalDto>> GetAdminAsync(AppDbContext db, CancellationToken ct)
    {
        var x = await db.Personals.FirstOrDefaultAsync(ct) ?? new Personal();
        return TypedResults.Ok(new PersonalDto(x.Name, x.Email, x.Location, x.Github, x.Linkedin, x.CvUrl));
    }

    private static async Task<Results<Ok<PersonalDto>, ValidationProblem>> UpdateAsync(
        [FromBody] PersonalDto dto,
        AppDbContext db,
        IValidator<PersonalDto> validator,
        CancellationToken ct)
    {
        var val = await validator.ValidateAsync(dto, ct);
        if (!val.IsValid) return TypedResults.ValidationProblem(val.ToDictionary());

        var x = await db.Personals.FirstOrDefaultAsync(ct);
        if (x is null)
        {
            x = new Personal
            {
                Id = 1,
                Name = dto.Name,
                Email = dto.Email,
                Location = dto.Location,
                Github = dto.Github,
                Linkedin = dto.Linkedin,
                CvUrl = dto.CvUrl,
                UpdatedAt = DateTime.UtcNow,
            };
            db.Personals.Add(x);
        }
        else
        {
            x.Name = dto.Name;
            x.Email = dto.Email;
            x.Location = dto.Location;
            x.Github = dto.Github;
            x.Linkedin = dto.Linkedin;
            x.CvUrl = dto.CvUrl;
            x.UpdatedAt = DateTime.UtcNow;
        }
        await db.SaveChangesAsync(ct);
        return TypedResults.Ok(new PersonalDto(x.Name, x.Email, x.Location, x.Github, x.Linkedin, x.CvUrl));
    }
}
