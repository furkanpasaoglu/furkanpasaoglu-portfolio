using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Portfolio.Api.Common;
using Portfolio.Api.Data;
using Portfolio.Api.Domain;

namespace Portfolio.Api.Endpoints;

public static class UploadsEndpoints
{
    public record CvUploadResult(string CvUrl);

    private const long MaxBytes = 5 * 1024 * 1024; // 5 MB

    /// <summary>
    /// One file per language, named after it. The name is built from the
    /// normalised language rather than anything the request supplies, so no
    /// input reaches the path.
    /// </summary>
    private static string CvFileName(string lang) => $"cv-{lang}.pdf";

    public static IEndpointRouteBuilder MapUploadsEndpoints(this IEndpointRouteBuilder app)
    {
        var admin = app.MapGroup("/api/admin/uploads")
                       .WithTags("Admin / Uploads")
                       .RequireAuthorization()
                       .DisableAntiforgery();

        admin.MapPost("cv/{lang}", UploadCvAsync);
        admin.MapDelete("cv/{lang}", DeleteCvAsync);

        return app;
    }

    private static async Task<Results<Ok<CvUploadResult>, BadRequest<string>>> UploadCvAsync(
        string lang, HttpRequest req, AppDbContext db, IWebHostEnvironment env, CancellationToken ct)
    {
        var l = LangHelpers.Normalize(lang);

        if (!req.HasFormContentType)
            return TypedResults.BadRequest("multipart/form-data required");

        var form = await req.ReadFormAsync(ct);
        var file = form.Files.GetFile("file") ?? form.Files.FirstOrDefault();
        if (file is null || file.Length == 0)
            return TypedResults.BadRequest("No file provided");
        if (file.Length > MaxBytes)
            return TypedResults.BadRequest($"File exceeds {MaxBytes / 1024 / 1024}MB limit");
        if (!file.ContentType.Equals("application/pdf", StringComparison.OrdinalIgnoreCase)
            && !file.FileName.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase))
            return TypedResults.BadRequest("Only PDF files are allowed");

        var uploadsDir = Path.Combine(env.ContentRootPath, "uploads");
        Directory.CreateDirectory(uploadsDir);

        await using (var stream = File.Create(Path.Combine(uploadsDir, CvFileName(l))))
        {
            await file.CopyToAsync(stream, ct);
        }

        // The query string busts the CDN and browser cache: the path is stable
        // but the file behind it just changed.
        var url = $"/media/{CvFileName(l)}?v={DateTimeOffset.UtcNow.ToUnixTimeSeconds()}";

        var p = await db.Personals.FirstOrDefaultAsync(ct);
        if (p is null)
        {
            p = new Personal { Id = 1 };
            db.Personals.Add(p);
        }
        SetCv(p, l, url);
        p.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);

        return TypedResults.Ok(new CvUploadResult(url));
    }

    private static async Task<Results<NoContent, NotFound>> DeleteCvAsync(
        string lang, AppDbContext db, IWebHostEnvironment env, CancellationToken ct)
    {
        var l = LangHelpers.Normalize(lang);
        var target = Path.Combine(env.ContentRootPath, "uploads", CvFileName(l));
        var existed = File.Exists(target);
        if (existed) File.Delete(target);

        var p = await db.Personals.FirstOrDefaultAsync(ct);
        if (p is not null)
        {
            SetCv(p, l, null);
            p.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync(ct);
        }

        return existed ? TypedResults.NoContent() : TypedResults.NotFound();
    }

    private static void SetCv(Personal p, string lang, string? url)
    {
        if (lang == LangHelpers.Tr) p.CvUrlTr = url;
        else p.CvUrlEn = url;
    }
}
