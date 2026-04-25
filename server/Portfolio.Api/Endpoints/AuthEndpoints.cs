using System.Net.Http.Json;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Portfolio.Api.Contracts.Auth;
using Portfolio.Api.Options;

namespace Portfolio.Api.Endpoints;

public static class AuthEndpoints
{
    private const string AccessCookie = "pf_access";
    private const string RefreshCookie = "pf_refresh";
    private const string StateCookie = "pf_oidc_state";

    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/admin/auth").WithTags("Auth");

        group.MapGet("/login", LoginAsync)
             .RequireRateLimiting("login")
             .AllowAnonymous();

        group.MapGet("/callback", CallbackAsync).AllowAnonymous();
        group.MapPost("/refresh", RefreshAsync).AllowAnonymous();
        group.MapPost("/logout", LogoutAsync).AllowAnonymous();

        app.MapGet("/api/admin/me", MeAsync)
           .RequireAuthorization()
           .WithTags("Auth");

        return app;
    }

    private static IResult LoginAsync(
        IOptions<KeycloakOptions> options,
        HttpContext http)
    {
        var opt = options.Value;
        var state = GenerateRandomString(32);
        var verifier = GenerateRandomString(64);
        var challenge = ComputeS256Challenge(verifier);

        WriteCookie(http, StateCookie, $"{state}|{verifier}",
            DateTimeOffset.UtcNow.AddMinutes(10), path: "/api/admin/auth");

        var redirectUri = BuildCallbackUri(opt, http);
        var authUrl = $"{opt.Authority.TrimEnd('/')}/protocol/openid-connect/auth" +
            $"?client_id={Uri.EscapeDataString(opt.ClientId)}" +
            $"&response_type=code" +
            $"&scope={Uri.EscapeDataString("openid profile email")}" +
            $"&redirect_uri={Uri.EscapeDataString(redirectUri)}" +
            $"&state={Uri.EscapeDataString(state)}" +
            $"&code_challenge={challenge}" +
            $"&code_challenge_method=S256";

        return Results.Redirect(authUrl);
    }

    private static async Task<IResult> CallbackAsync(
        [FromQuery] string? code,
        [FromQuery] string? state,
        [FromQuery] string? error,
        IOptions<KeycloakOptions> options,
        IHttpClientFactory httpClientFactory,
        HttpContext http,
        CancellationToken ct)
    {
        var opt = options.Value;

        if (!string.IsNullOrEmpty(error))
        {
            return Results.Redirect($"{opt.PostLogoutPath}?error={Uri.EscapeDataString(error)}");
        }

        if (string.IsNullOrEmpty(code) || string.IsNullOrEmpty(state))
        {
            return Results.BadRequest(new { error = "Missing code or state" });
        }

        if (!http.Request.Cookies.TryGetValue(StateCookie, out var stateCookie) ||
            string.IsNullOrEmpty(stateCookie))
        {
            return Results.BadRequest(new { error = "State expired or missing" });
        }

        var parts = stateCookie.Split('|');
        if (parts.Length != 2 || !CryptographicOperations.FixedTimeEquals(
                Encoding.UTF8.GetBytes(parts[0]), Encoding.UTF8.GetBytes(state)))
        {
            return Results.BadRequest(new { error = "Invalid state" });
        }

        var verifier = parts[1];
        http.Response.Cookies.Delete(StateCookie, new CookieOptions { Path = "/api/admin/auth" });

        var redirectUri = BuildCallbackUri(opt, http);
        var client = httpClientFactory.CreateClient();
        var tokenReq = new FormUrlEncodedContent(new Dictionary<string, string>
        {
            ["grant_type"] = "authorization_code",
            ["client_id"] = opt.ClientId,
            ["client_secret"] = opt.ClientSecret,
            ["code"] = code,
            ["redirect_uri"] = redirectUri,
            ["code_verifier"] = verifier,
        });

        var tokenResp = await client.PostAsync(
            $"{opt.Authority.TrimEnd('/')}/protocol/openid-connect/token", tokenReq, ct);

        if (!tokenResp.IsSuccessStatusCode)
        {
            return Results.Unauthorized();
        }

        var tokens = await tokenResp.Content.ReadFromJsonAsync<TokenResponse>(cancellationToken: ct);
        if (tokens is null || string.IsNullOrEmpty(tokens.AccessToken))
        {
            return Results.Unauthorized();
        }

        WriteAccessCookie(http, tokens.AccessToken, DateTimeOffset.UtcNow.AddSeconds(tokens.ExpiresIn));
        WriteRefreshCookie(http, tokens.RefreshToken, DateTimeOffset.UtcNow.AddSeconds(tokens.RefreshExpiresIn));

        return Results.Redirect(opt.PostLoginPath);
    }

    private static async Task<IResult> RefreshAsync(
        IOptions<KeycloakOptions> options,
        IHttpClientFactory httpClientFactory,
        HttpContext http,
        CancellationToken ct)
    {
        if (!http.Request.Cookies.TryGetValue(RefreshCookie, out var refresh) ||
            string.IsNullOrEmpty(refresh))
        {
            return Results.Unauthorized();
        }

        var opt = options.Value;
        var client = httpClientFactory.CreateClient();
        var req = new FormUrlEncodedContent(new Dictionary<string, string>
        {
            ["grant_type"] = "refresh_token",
            ["client_id"] = opt.ClientId,
            ["client_secret"] = opt.ClientSecret,
            ["refresh_token"] = refresh,
        });

        var resp = await client.PostAsync(
            $"{opt.Authority.TrimEnd('/')}/protocol/openid-connect/token", req, ct);

        if (!resp.IsSuccessStatusCode)
        {
            ClearCookies(http);
            return Results.Unauthorized();
        }

        var tokens = await resp.Content.ReadFromJsonAsync<TokenResponse>(cancellationToken: ct);
        if (tokens is null || string.IsNullOrEmpty(tokens.AccessToken))
        {
            ClearCookies(http);
            return Results.Unauthorized();
        }

        var expiresAt = DateTime.UtcNow.AddSeconds(tokens.ExpiresIn);
        WriteAccessCookie(http, tokens.AccessToken, expiresAt);
        WriteRefreshCookie(http, tokens.RefreshToken, DateTime.UtcNow.AddSeconds(tokens.RefreshExpiresIn));

        return Results.Ok(new AuthResponse(http.User.Identity?.Name ?? string.Empty, expiresAt));
    }

    private static async Task<IResult> LogoutAsync(
        IOptions<KeycloakOptions> options,
        IHttpClientFactory httpClientFactory,
        HttpContext http,
        CancellationToken ct)
    {
        if (http.Request.Cookies.TryGetValue(RefreshCookie, out var refresh) &&
            !string.IsNullOrEmpty(refresh))
        {
            var opt = options.Value;
            var client = httpClientFactory.CreateClient();
            var req = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["client_id"] = opt.ClientId,
                ["client_secret"] = opt.ClientSecret,
                ["refresh_token"] = refresh,
            });

            try
            {
                await client.PostAsync(
                    $"{opt.Authority.TrimEnd('/')}/protocol/openid-connect/logout", req, ct);
            }
            catch
            {
                // best effort — local cookies are cleared regardless
            }
        }

        ClearCookies(http);
        return Results.NoContent();
    }

    private static IResult MeAsync(HttpContext http)
    {
        var username = http.User.FindFirstValue("preferred_username")
                    ?? http.User.FindFirstValue(ClaimTypes.Name)
                    ?? http.User.Identity?.Name
                    ?? "admin";
        return Results.Ok(new MeResponse(username));
    }

    private static string BuildCallbackUri(KeycloakOptions opt, HttpContext http)
    {
        if (!string.IsNullOrWhiteSpace(opt.PublicOrigin))
        {
            return $"{opt.PublicOrigin.TrimEnd('/')}/api/admin/auth/callback";
        }

        var scheme = http.Request.Headers["X-Forwarded-Proto"].FirstOrDefault() ?? http.Request.Scheme;
        var host = http.Request.Headers["X-Forwarded-Host"].FirstOrDefault() ?? http.Request.Host.Value;
        return $"{scheme}://{host}/api/admin/auth/callback";
    }

    private static string GenerateRandomString(int byteLength)
    {
        var bytes = RandomNumberGenerator.GetBytes(byteLength);
        return Base64UrlEncoder.Encode(bytes);
    }

    private static string ComputeS256Challenge(string verifier)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(verifier));
        return Base64UrlEncoder.Encode(bytes);
    }

    private static void WriteAccessCookie(HttpContext http, string token, DateTimeOffset expiresAt) =>
        WriteCookie(http, AccessCookie, token, expiresAt, path: "/api");

    private static void WriteRefreshCookie(HttpContext http, string token, DateTimeOffset expiresAt) =>
        WriteCookie(http, RefreshCookie, token, expiresAt, path: "/api/admin/auth");

    private static void WriteCookie(HttpContext http, string name, string value, DateTimeOffset expiresAt, string path)
    {
        http.Response.Cookies.Append(name, value, new CookieOptions
        {
            HttpOnly = true,
            Secure = !http.Request.Host.Host.StartsWith("localhost", StringComparison.OrdinalIgnoreCase),
            // Lax (not Strict): the OIDC callback is a top-level cross-site GET back from Keycloak
            // and Strict would drop the state cookie before the handler can read it.
            SameSite = SameSiteMode.Lax,
            Path = path,
            Expires = expiresAt,
        });
    }

    private static void ClearCookies(HttpContext http)
    {
        http.Response.Cookies.Delete(AccessCookie, new CookieOptions { Path = "/api" });
        http.Response.Cookies.Delete(RefreshCookie, new CookieOptions { Path = "/api/admin/auth" });
    }

    private record TokenResponse(
        [property: JsonPropertyName("access_token")] string AccessToken,
        [property: JsonPropertyName("refresh_token")] string RefreshToken,
        [property: JsonPropertyName("expires_in")] int ExpiresIn,
        [property: JsonPropertyName("refresh_expires_in")] int RefreshExpiresIn,
        [property: JsonPropertyName("token_type")] string TokenType);
}
