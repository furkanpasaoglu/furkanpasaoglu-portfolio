using System.Text.Json;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Portfolio.Api.Common;
using Portfolio.Api.Data;
using Portfolio.Api.Domain;

namespace Portfolio.Api.Endpoints;

public static class TranslationsEndpoints
{
    public static IEndpointRouteBuilder MapTranslationsEndpoints(this IEndpointRouteBuilder app)
    {
        // ── Public ─────────────────────────────────────────────────
        var pub = app.MapGroup("/api/public/translations").WithTags("Public / Translations");
        pub.MapGet("", GetPublicAsync).AllowAnonymous();

        // ── Admin ──────────────────────────────────────────────────
        var admin = app.MapGroup("/api/admin/translations")
                       .WithTags("Admin / Translations")
                       .RequireAuthorization();
        admin.MapGet("", ListAdminAsync);
        admin.MapGet("{section}", GetAdminAsync);
        admin.MapPut("{section}", UpsertAsync);

        return app;
    }

    /// <summary>Returns a flat {section: {...}} object projected to one language.</summary>
    private static async Task<Ok<Dictionary<string, JsonElement>>> GetPublicAsync(
        [FromQuery] string? lang, AppDbContext db, CancellationToken ct)
    {
        var l = LangHelpers.Normalize(lang);
        var list = await db.Translations.AsNoTracking().ToListAsync(ct);
        var dict = list.ToDictionary(
            x => x.Section,
            x => LangHelpers.PickLocale(l, x.DataTr, x.DataEn));
        return TypedResults.Ok(dict);
    }

    public record TranslationAdminDto(string Section, JsonElement DataTr, JsonElement DataEn, DateTime UpdatedAt);
    public record TranslationUpsertDto(JsonElement DataTr, JsonElement DataEn);

    private static async Task<Ok<List<TranslationAdminDto>>> ListAdminAsync(
        AppDbContext db, CancellationToken ct)
    {
        var list = await db.Translations.OrderBy(x => x.Section).ToListAsync(ct);
        return TypedResults.Ok(list
            .Select(x => new TranslationAdminDto(x.Section, x.DataTr, x.DataEn, x.UpdatedAt))
            .ToList());
    }

    private static async Task<Results<Ok<TranslationAdminDto>, NotFound>> GetAdminAsync(
        string section, AppDbContext db, CancellationToken ct)
    {
        var x = await db.Translations.FirstOrDefaultAsync(t => t.Section == section, ct);
        return x is null
            ? TypedResults.NotFound()
            : TypedResults.Ok(new TranslationAdminDto(x.Section, x.DataTr, x.DataEn, x.UpdatedAt));
    }

    private static async Task<Results<Ok<TranslationAdminDto>, ValidationProblem>> UpsertAsync(
        string section,
        [FromBody] TranslationUpsertDto dto,
        AppDbContext db,
        IValidator<TranslationUpsertDto> validator,
        CancellationToken ct)
    {
        var val = await validator.ValidateAsync(dto, ct);
        if (!val.IsValid) return TypedResults.ValidationProblem(val.ToDictionary());

        var x = await db.Translations.FirstOrDefaultAsync(t => t.Section == section, ct);
        if (x is null)
        {
            x = new Translation { Section = section, DataTr = dto.DataTr, DataEn = dto.DataEn, UpdatedAt = DateTime.UtcNow };
            db.Translations.Add(x);
        }
        else
        {
            x.DataTr = dto.DataTr;
            x.DataEn = dto.DataEn;
            x.UpdatedAt = DateTime.UtcNow;
        }
        await db.SaveChangesAsync(ct);
        return TypedResults.Ok(new TranslationAdminDto(x.Section, x.DataTr, x.DataEn, x.UpdatedAt));
    }
}
