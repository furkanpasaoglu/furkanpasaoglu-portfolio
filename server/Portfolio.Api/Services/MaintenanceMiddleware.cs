using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Portfolio.Api.Data;

namespace Portfolio.Api.Services;

/// <summary>
/// Short-circuits public data endpoints with 503 when site is in maintenance mode.
/// Admin endpoints, health check, and the static render targets are unaffected.
/// </summary>
public class MaintenanceMiddleware(RequestDelegate next, IMemoryCache cache)
{
    private const string CacheKey = "site-settings:maintenance-mode";
    private static readonly TimeSpan CacheTtl = TimeSpan.FromSeconds(30);

    public async Task InvokeAsync(HttpContext ctx, AppDbContext db)
    {
        var path = ctx.Request.Path.Value ?? "";
        if (!path.StartsWith("/api/public/", StringComparison.OrdinalIgnoreCase))
        {
            await next(ctx);
            return;
        }

        // Always allow site-settings itself so the SPA can read the flag
        // and the public home can still render from cache.
        if (path.StartsWith("/api/public/site-settings", StringComparison.OrdinalIgnoreCase))
        {
            await next(ctx);
            return;
        }

        var isDown = await cache.GetOrCreateAsync(CacheKey, async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = CacheTtl;
            var row = await db.SiteSettings.AsNoTracking().FirstOrDefaultAsync();
            if (row is null) return false;
            if (row.OperationsJson.ValueKind != JsonValueKind.Object) return false;
            return row.OperationsJson.TryGetProperty("maintenanceMode", out var m) && m.ValueKind == JsonValueKind.True;
        });

        if (isDown)
        {
            ctx.Response.StatusCode = StatusCodes.Status503ServiceUnavailable;
            ctx.Response.Headers.RetryAfter = "3600";
            ctx.Response.ContentType = "application/json";
            await ctx.Response.WriteAsync("{\"status\":\"maintenance\"}");
            return;
        }

        await next(ctx);
    }
}
