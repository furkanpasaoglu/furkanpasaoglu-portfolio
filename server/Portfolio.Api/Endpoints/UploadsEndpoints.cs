using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Portfolio.Api.Data;
using Portfolio.Api.Domain;

namespace Portfolio.Api.Endpoints;

public static class UploadsEndpoints
{
    public record CvUploadResult(string CvUrl);

    private const long MaxBytes = 5 * 1024 * 1024; // 5 MB
    private const string CvFileName = "cv.pdf";

    public static IEndpointRouteBuilder MapUploadsEndpoints(this IEndpointRouteBuilder app)
    {
        var admin = app.MapGroup("/api/admin/uploads")
                       .WithTags("Admin / Uploads")
                       .RequireAuthorization()
                       .DisableAntiforgery();

        admin.MapPost("cv", UploadCvAsync);
        admin.MapDelete("cv", DeleteCvAsync);

        return app;
    }

    private static async Task<Results<Ok<CvUploadResult>, BadRequest<string>>> UploadCvAsync(
        HttpRequest req, AppDbContext db, IWebHostEnvironment env, CancellationToken ct)
    {
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
        var target = Path.Combine(uploadsDir, CvFileName);

        await using (var stream = File.Create(target))
        {
            await file.CopyToAsync(stream, ct);
        }

        var url = $"/media/{CvFileName}?v={DateTimeOffset.UtcNow.ToUnixTimeSeconds()}";

        // Persist to personal.cv_url
        var p = await db.Personals.FirstOrDefaultAsync(ct);
        if (p is null)
        {
            p = new Personal { Id = 1, CvUrl = url, UpdatedAt = DateTime.UtcNow };
            db.Personals.Add(p);
        }
        else
        {
            p.CvUrl = url;
            p.UpdatedAt = DateTime.UtcNow;
        }
        await db.SaveChangesAsync(ct);

        return TypedResults.Ok(new CvUploadResult(url));
    }

    private static async Task<Results<NoContent, NotFound>> DeleteCvAsync(
        AppDbContext db, IWebHostEnvironment env, CancellationToken ct)
    {
        var target = Path.Combine(env.ContentRootPath, "uploads", CvFileName);
        var existed = File.Exists(target);
        if (existed) File.Delete(target);

        var p = await db.Personals.FirstOrDefaultAsync(ct);
        if (p is not null)
        {
            p.CvUrl = null;
            p.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync(ct);
        }

        return existed ? TypedResults.NoContent() : TypedResults.NotFound();
    }
}
