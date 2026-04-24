using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Portfolio.Api.Data;
using Portfolio.Api.Services;

namespace Portfolio.Api.Endpoints;

public static class SystemInfoEndpoints
{
    private static readonly DateTime StartedAt = DateTime.UtcNow;

    public record SystemInfoDto(
        string Version,
        string GitSha,
        DateTime? BuildTime,
        DateTime StartedAt,
        long UptimeSeconds,
        string Environment,
        string DotnetVersion,
        string? LastMigration,
        long UploadsSizeBytes,
        Counts Counts
    );

    public record Counts(int Projects, int BlogPosts, int Experiences, int SkillCategories, int ContactMessages, int UnreadMessages);

    public static IEndpointRouteBuilder MapSystemInfoEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/admin/system-info", GetAsync)
           .WithTags("Admin / System")
           .RequireAuthorization();

        app.MapPost("/api/admin/system-info/cache-clear", ClearCacheAsync)
           .WithTags("Admin / System")
           .RequireAuthorization();

        return app;
    }

    private static async Task<Ok<SystemInfoDto>> GetAsync(
        AppDbContext db,
        IWebHostEnvironment env,
        IConfiguration cfg,
        ILogger<SystemInfoDto> logger,
        CancellationToken ct)
    {
        var version = cfg["App:Version"] ?? typeof(SystemInfoEndpoints).Assembly.GetName().Version?.ToString() ?? "unknown";
        var gitSha = cfg["App:GitSha"] ?? Environment.GetEnvironmentVariable("APP_GIT_SHA") ?? "unknown";
        var buildTimeStr = cfg["App:BuildTime"] ?? Environment.GetEnvironmentVariable("APP_BUILD_TIME");
        DateTime? buildTime = DateTime.TryParse(buildTimeStr, out var bt) ? bt : null;

        string? lastMigration = null;
        try
        {
            var applied = await db.Database.GetAppliedMigrationsAsync(ct);
            lastMigration = applied.LastOrDefault();
        }
        catch (Exception ex) { logger.LogWarning(ex, "Failed to read applied migrations for system-info."); }

        long uploadsSize = 0;
        try
        {
            var uploadsPath = Path.Combine(env.ContentRootPath, "uploads");
            if (Directory.Exists(uploadsPath))
            {
                uploadsSize = new DirectoryInfo(uploadsPath)
                    .EnumerateFiles("*", SearchOption.AllDirectories)
                    .Sum(f => f.Length);
            }
        }
        catch (Exception ex) { logger.LogWarning(ex, "Failed to compute uploads directory size."); }

        var counts = new Counts(
            Projects: await db.Projects.CountAsync(ct),
            BlogPosts: await db.BlogPosts.CountAsync(ct),
            Experiences: await db.Experiences.CountAsync(ct),
            SkillCategories: await db.SkillCategories.CountAsync(ct),
            ContactMessages: await db.ContactMessages.CountAsync(ct),
            UnreadMessages: await db.ContactMessages.CountAsync(m => !m.IsRead, ct));

        var info = new SystemInfoDto(
            Version: version,
            GitSha: gitSha,
            BuildTime: buildTime,
            StartedAt: StartedAt,
            UptimeSeconds: (long)(DateTime.UtcNow - StartedAt).TotalSeconds,
            Environment: env.EnvironmentName,
            DotnetVersion: System.Runtime.InteropServices.RuntimeInformation.FrameworkDescription,
            LastMigration: lastMigration,
            UploadsSizeBytes: uploadsSize,
            Counts: counts);

        return TypedResults.Ok(info);
    }

    private static async Task<Ok<object>> ClearCacheAsync(
        IMemoryCache cache,
        ISiteRenderer renderer,
        ILogger<SystemInfoDto> logger,
        CancellationToken ct)
    {
        if (cache is MemoryCache mc) mc.Clear();
        try { await renderer.RenderAllAsync(ct); }
        catch (Exception ex) { logger.LogWarning(ex, "Cache clear rerender failed."); }
        return TypedResults.Ok<object>(new { cleared = true, at = DateTime.UtcNow });
    }
}
