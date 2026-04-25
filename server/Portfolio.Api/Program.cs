using System.Security.Claims;
using System.Text.Json;
using System.Threading.RateLimiting;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Scalar.AspNetCore;
using Portfolio.Api.Data;
using Portfolio.Api.Endpoints;
using Portfolio.Api.Options;
using Portfolio.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// ── Options ──────────────────────────────────────────────────────────
builder.Services
    .AddOptions<KeycloakOptions>()
    .Bind(builder.Configuration.GetSection(KeycloakOptions.SectionName))
    .Validate(o => !string.IsNullOrWhiteSpace(o.Authority), "Keycloak:Authority must be configured.")
    .Validate(o => !string.IsNullOrWhiteSpace(o.ClientId), "Keycloak:ClientId must be configured.")
    .Validate(o => !string.IsNullOrWhiteSpace(o.ClientSecret), "Keycloak:ClientSecret must be configured.")
    .ValidateOnStart();

var keycloakSection = builder.Configuration.GetSection(KeycloakOptions.SectionName).Get<KeycloakOptions>()!;

// ── Database ─────────────────────────────────────────────────────────
var connectionString = builder.Configuration.GetConnectionString("Default")
    ?? throw new InvalidOperationException("ConnectionStrings:Default not configured.");

var npgsqlDataSourceBuilder = new NpgsqlDataSourceBuilder(connectionString);
npgsqlDataSourceBuilder.EnableDynamicJson(); // POCO <-> jsonb auto-serialize
var npgsqlDataSource = npgsqlDataSourceBuilder.Build();

builder.Services.AddSingleton(npgsqlDataSource);
builder.Services.AddDbContext<AppDbContext>(opts => opts.UseNpgsql(npgsqlDataSource));

// ── Services ─────────────────────────────────────────────────────────
builder.Services.AddScoped<ISeeder, Seeder>();
builder.Services.AddValidatorsFromAssembly(typeof(Program).Assembly);
builder.Services.AddHttpClient();

builder.Services.AddOptions<WebStaticOptions>()
    .Bind(builder.Configuration.GetSection(WebStaticOptions.SectionName));
builder.Services.AddScoped<ISiteRenderer, SiteRenderer>();
builder.Services.AddHostedService<SiteRendererBootstrap>();
builder.Services.AddMemoryCache();
builder.Services.AddScoped<IEmailSender, SmtpEmailSender>();
builder.Services.AddHostedService<MessageCleanupService>();

// ── Authentication (Keycloak JWT via httpOnly cookie) ────────────────
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o =>
    {
        o.Authority = keycloakSection.Authority;
        o.RequireHttpsMetadata = !builder.Environment.IsDevelopment();
        o.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = keycloakSection.Authority,
            // Keycloak access tokens carry the client_id in `azp`, not `aud`, by default.
            // We pin authorization to the client role check below instead of audience.
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            NameClaimType = "preferred_username",
            RoleClaimType = ClaimTypes.Role,
            ClockSkew = TimeSpan.FromSeconds(30),
        };

        o.Events = new JwtBearerEvents
        {
            OnMessageReceived = ctx =>
            {
                if (ctx.Request.Cookies.TryGetValue("pf_access", out var t) && !string.IsNullOrEmpty(t))
                {
                    ctx.Token = t;
                }
                return Task.CompletedTask;
            },
            OnTokenValidated = ctx =>
            {
                // Flatten Keycloak's resource_access.<client>.roles into ClaimTypes.Role
                if (ctx.Principal?.Identity is ClaimsIdentity identity)
                {
                    var ra = ctx.Principal.FindFirst("resource_access")?.Value;
                    if (!string.IsNullOrEmpty(ra))
                    {
                        try
                        {
                            using var doc = JsonDocument.Parse(ra);
                            if (doc.RootElement.TryGetProperty(keycloakSection.ClientId, out var clientEl) &&
                                clientEl.TryGetProperty("roles", out var rolesEl) &&
                                rolesEl.ValueKind == JsonValueKind.Array)
                            {
                                foreach (var role in rolesEl.EnumerateArray())
                                {
                                    var name = role.GetString();
                                    if (!string.IsNullOrEmpty(name))
                                    {
                                        identity.AddClaim(new Claim(ClaimTypes.Role, name));
                                    }
                                }
                            }
                        }
                        catch (JsonException) { /* malformed claim; treat as no roles */ }
                    }
                }
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization(opts =>
{
    // Default policy for [Authorize] / .RequireAuthorization() — must have admin role on this client.
    opts.DefaultPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .RequireRole("admin")
        .Build();
});

// ── Rate limiting (5/min on login) ───────────────────────────────────
builder.Services.AddRateLimiter(opts =>
{
    opts.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    opts.AddPolicy("login", http =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: http.Connection.RemoteIpAddress?.ToString() ?? "anonymous",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 5,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
                AutoReplenishment = true,
            }));
    opts.AddPolicy("contact", http =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: http.Connection.RemoteIpAddress?.ToString() ?? "anonymous",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 3,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
                AutoReplenishment = true,
            }));
});

// ── CORS (dev only: vite on 5173 talking to api on 8080) ─────────────
if (builder.Environment.IsDevelopment())
{
    builder.Services.AddCors(o => o.AddDefaultPolicy(p => p
        .WithOrigins("http://localhost:5173", "http://localhost:5174", "http://localhost:5175",
                     "http://localhost:5176", "http://localhost:5177", "http://localhost:5178",
                     "http://localhost:5179", "http://localhost:5180", "http://localhost:5181")
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials()));
}

builder.Services.AddOpenApi();

var app = builder.Build();

// ── Migrate + seed on startup ────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();

    var seeder = scope.ServiceProvider.GetRequiredService<ISeeder>();
    await seeder.SeedAsync();
    // No initial render here: nginx container seeds the volume with built index.html
    // (correct CSS/JS asset hashes). Admin save or explicit re-render triggers dynamic render
    // once the volume is known-populated.
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(options => options
        .WithTitle("Portfolio API")
        .WithTheme(ScalarTheme.DeepSpace)
        .WithDefaultHttpClient(ScalarTarget.Shell, ScalarClient.Curl));
    app.UseCors();
}

app.UseRateLimiter();

// Serve uploaded files at /media/* (e.g. /media/cv.pdf)
var uploadsPath = Path.Combine(app.Environment.ContentRootPath, "uploads");
Directory.CreateDirectory(uploadsPath);
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(uploadsPath),
    RequestPath = "/media",
});

app.UseAuthentication();
app.UseAuthorization();

app.UseMiddleware<MaintenanceMiddleware>();

// Health
app.MapGet("/api/health", async (AppDbContext db) =>
{
    try
    {
        var canConnect = await db.Database.CanConnectAsync();
        return Results.Ok(new { status = canConnect ? "ok" : "degraded", db = canConnect });
    }
    catch
    {
        return Results.Ok(new { status = "degraded", db = false });
    }
}).WithTags("Health");

app.MapAuthEndpoints();
app.MapProjectsEndpoints();
app.MapExperienceEndpoints();
app.MapSkillsEndpoints();
app.MapBlogEndpoints();
app.MapTranslationsEndpoints();
app.MapPersonalEndpoints();
app.MapUploadsEndpoints();
app.MapSiteSettingsEndpoints();
app.MapContactEndpoints();
app.MapSystemInfoEndpoints();

app.Run();
