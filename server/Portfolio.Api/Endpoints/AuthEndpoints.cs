using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Portfolio.Api.Contracts.Auth;
using Portfolio.Api.Data;
using Portfolio.Api.Options;
using Portfolio.Api.Services;

namespace Portfolio.Api.Endpoints;

public static class AuthEndpoints
{
    private const string AccessCookie = "pf_access";
    private const string RefreshCookie = "pf_refresh";

    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/admin/auth").WithTags("Auth");

        group.MapPost("/login", LoginAsync)
             .RequireRateLimiting("login")
             .AllowAnonymous();

        group.MapPost("/refresh", RefreshAsync).AllowAnonymous();
        group.MapPost("/logout", LogoutAsync).AllowAnonymous();

        app.MapGet("/api/admin/me", MeAsync)
           .RequireAuthorization()
           .WithTags("Auth");

        return app;
    }

    private static async Task<Results<Ok<AuthResponse>, UnauthorizedHttpResult>> LoginAsync(
        [FromBody] LoginRequest req,
        AppDbContext db,
        IJwtService jwt,
        IOptions<JwtOptions> jwtOptions,
        HttpContext http,
        CancellationToken ct)
    {
        var user = await db.AdminUsers.FirstOrDefaultAsync(u => u.Username == req.Username, ct);
        if (user is null || !PasswordHasher.Verify(req.Password, user.PasswordHash))
        {
            return TypedResults.Unauthorized();
        }

        var (access, expiresAt) = jwt.CreateAccessToken(user.Id, user.Username);
        var refresh = jwt.CreateRefreshToken();

        user.RefreshTokenHash = jwt.HashRefreshToken(refresh);
        user.RefreshExpiresAt = DateTime.UtcNow.AddDays(jwtOptions.Value.RefreshTokenDays);
        user.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);

        WriteAccessCookie(http, access, expiresAt);
        WriteRefreshCookie(http, refresh, user.RefreshExpiresAt.Value);

        return TypedResults.Ok(new AuthResponse(user.Username, expiresAt));
    }

    private static async Task<Results<Ok<AuthResponse>, UnauthorizedHttpResult>> RefreshAsync(
        AppDbContext db,
        IJwtService jwt,
        IOptions<JwtOptions> jwtOptions,
        HttpContext http,
        CancellationToken ct)
    {
        if (!http.Request.Cookies.TryGetValue(RefreshCookie, out var refresh) || string.IsNullOrWhiteSpace(refresh))
        {
            return TypedResults.Unauthorized();
        }

        var hash = jwt.HashRefreshToken(refresh);
        var user = await db.AdminUsers.FirstOrDefaultAsync(u => u.RefreshTokenHash == hash, ct);

        if (user is null || user.RefreshExpiresAt is null || user.RefreshExpiresAt < DateTime.UtcNow)
        {
            ClearCookies(http);
            return TypedResults.Unauthorized();
        }

        // rotate refresh token
        var newRefresh = jwt.CreateRefreshToken();
        var (access, expiresAt) = jwt.CreateAccessToken(user.Id, user.Username);

        user.RefreshTokenHash = jwt.HashRefreshToken(newRefresh);
        user.RefreshExpiresAt = DateTime.UtcNow.AddDays(jwtOptions.Value.RefreshTokenDays);
        user.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);

        WriteAccessCookie(http, access, expiresAt);
        WriteRefreshCookie(http, newRefresh, user.RefreshExpiresAt.Value);

        return TypedResults.Ok(new AuthResponse(user.Username, expiresAt));
    }

    private static async Task<NoContent> LogoutAsync(
        AppDbContext db,
        IJwtService jwt,
        HttpContext http,
        CancellationToken ct)
    {
        if (http.Request.Cookies.TryGetValue(RefreshCookie, out var refresh) && !string.IsNullOrWhiteSpace(refresh))
        {
            var hash = jwt.HashRefreshToken(refresh);
            var user = await db.AdminUsers.FirstOrDefaultAsync(u => u.RefreshTokenHash == hash, ct);
            if (user is not null)
            {
                user.RefreshTokenHash = null;
                user.RefreshExpiresAt = null;
                await db.SaveChangesAsync(ct);
            }
        }
        ClearCookies(http);
        return TypedResults.NoContent();
    }

    private static Ok<MeResponse> MeAsync(HttpContext http)
    {
        var username = http.User.FindFirstValue(ClaimTypes.Name)
                    ?? http.User.Identity?.Name
                    ?? "admin";
        return TypedResults.Ok(new MeResponse(username));
    }

    private static void WriteAccessCookie(HttpContext http, string token, DateTime expiresAt)
    {
        http.Response.Cookies.Append(AccessCookie, token, new CookieOptions
        {
            HttpOnly = true,
            Secure = !http.Request.Host.Host.StartsWith("localhost", StringComparison.OrdinalIgnoreCase),
            SameSite = SameSiteMode.Strict,
            Path = "/api",
            Expires = expiresAt,
        });
    }

    private static void WriteRefreshCookie(HttpContext http, string token, DateTime expiresAt)
    {
        http.Response.Cookies.Append(RefreshCookie, token, new CookieOptions
        {
            HttpOnly = true,
            Secure = !http.Request.Host.Host.StartsWith("localhost", StringComparison.OrdinalIgnoreCase),
            SameSite = SameSiteMode.Strict,
            Path = "/api/admin/auth",
            Expires = expiresAt,
        });
    }

    private static void ClearCookies(HttpContext http)
    {
        http.Response.Cookies.Delete(AccessCookie, new CookieOptions { Path = "/api" });
        http.Response.Cookies.Delete(RefreshCookie, new CookieOptions { Path = "/api/admin/auth" });
    }
}
