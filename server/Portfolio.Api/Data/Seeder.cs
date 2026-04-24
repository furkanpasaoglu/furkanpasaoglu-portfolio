using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Portfolio.Api.Domain;
using Portfolio.Api.Options;
using Portfolio.Api.Services;

namespace Portfolio.Api.Data;

public interface ISeeder
{
    Task SeedAsync(CancellationToken ct = default);
}

public class Seeder(
    AppDbContext db,
    IOptions<AdminOptions> adminOptions,
    IWebHostEnvironment env,
    ILogger<Seeder> log) : ISeeder
{
    private readonly AdminOptions _admin = adminOptions.Value;

    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };

    public async Task SeedAsync(CancellationToken ct = default)
    {
        await SeedAdminUserAsync(ct);
        await SeedFromJsonAsync<ProjectSeedRow, Project>("projects.json", db.Projects, (r, now) => new Project
        {
            Slug = r.Slug, SortOrder = r.SortOrder, IsPublished = r.IsPublished,
            Color = r.Color, TypeKey = r.TypeKey, Github = r.Github, Live = r.Live,
            Tags = r.Tags ?? new(), DataTr = r.DataTr ?? new(), DataEn = r.DataEn ?? new(),
            CreatedAt = now, UpdatedAt = now,
        }, ct);

        await SeedFromJsonAsync<ExperienceSeedRow, Experience>("experience.json", db.Experiences, (r, now) => new Experience
        {
            SortOrder = r.SortOrder, IsEducation = r.IsEducation, Period = r.Period,
            IsPublished = r.IsPublished, Tech = r.Tech ?? new(),
            DataTr = r.DataTr ?? new(), DataEn = r.DataEn ?? new(),
            CreatedAt = now, UpdatedAt = now,
        }, ct);

        await SeedFromJsonAsync<SkillCategorySeedRow, SkillCategory>("skills.json", db.SkillCategories, (r, now) => new SkillCategory
        {
            SortOrder = r.SortOrder, Icon = r.Icon, TitleTr = r.TitleTr, TitleEn = r.TitleEn,
            IsPublished = r.IsPublished, Skills = r.Skills ?? new(),
            CreatedAt = now, UpdatedAt = now,
        }, ct);

        await SeedFromJsonAsync<BlogPostSeedRow, BlogPost>("blog.json", db.BlogPosts, (r, now) => new BlogPost
        {
            Slug = r.Slug, SortOrder = r.SortOrder, IsFeatured = r.IsFeatured, IsPublished = r.IsPublished,
            Category = r.Category, Color = r.Color, PublishedAt = r.PublishedAt, Tags = r.Tags ?? new(),
            DataTr = r.DataTr ?? new(), DataEn = r.DataEn ?? new(),
            ContentTr = r.ContentTr ?? new(), ContentEn = r.ContentEn ?? new(),
            CreatedAt = now, UpdatedAt = now,
        }, ct);

        await SeedTranslationsAsync(ct);
        await SeedPersonalAsync(ct);
        await SeedSiteSettingsAsync(ct);
    }

    private async Task SeedSiteSettingsAsync(CancellationToken ct)
    {
        var path = Path.Combine(env.ContentRootPath, "SeedData", "siteSettings.json");
        if (!File.Exists(path)) { log.LogWarning("siteSettings.json not found"); return; }

        using var doc = JsonDocument.Parse(await File.ReadAllTextAsync(path, ct));
        var root = doc.RootElement;
        var operations = root.TryGetProperty("operations", out var opEl) ? opEl.Clone() : ParseEmptyObject();
        var security = root.TryGetProperty("security", out var secEl) ? secEl.Clone() : ParseEmptyObject();
        var communications = root.TryGetProperty("communications", out var comEl) ? comEl.Clone() : ParseEmptyObject();

        var existing = await db.SiteSettings.FirstOrDefaultAsync(ct);
        if (existing is null)
        {
            db.SiteSettings.Add(new SiteSettings
            {
                Id = 1,
                DataTr = root.GetProperty("dataTr").Clone(),
                DataEn = root.GetProperty("dataEn").Clone(),
                BrandingJson = root.GetProperty("branding").Clone(),
                SchemaJson = root.GetProperty("schema").Clone(),
                OperationsJson = operations,
                SecurityJson = security,
                CommunicationsJson = communications,
                UpdatedAt = DateTime.UtcNow,
            });
            await db.SaveChangesAsync(ct);
            log.LogInformation("Seeded site settings.");
            return;
        }

        // Idempotent upgrade: if existing row has empty operations/security/communications, populate from seed.
        var changed = false;
        if (IsEmptyObject(existing.OperationsJson)) { existing.OperationsJson = operations; changed = true; }
        if (IsEmptyObject(existing.SecurityJson)) { existing.SecurityJson = security; changed = true; }
        if (IsEmptyObject(existing.CommunicationsJson)) { existing.CommunicationsJson = communications; changed = true; }
        if (changed)
        {
            existing.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync(ct);
            log.LogInformation("Upgraded site settings with operations/security defaults.");
        }
    }

    private static JsonElement ParseEmptyObject()
    {
        using var d = JsonDocument.Parse("{}");
        return d.RootElement.Clone();
    }

    private static bool IsEmptyObject(JsonElement el) =>
        el.ValueKind != JsonValueKind.Object || !el.EnumerateObject().Any();

    private async Task SeedAdminUserAsync(CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(_admin.Username) || string.IsNullOrWhiteSpace(_admin.Password))
        {
            log.LogWarning("Admin username/password not configured; skipping admin seeding.");
            return;
        }

        var existing = await db.AdminUsers.FirstOrDefaultAsync(u => u.Username == _admin.Username, ct);

        if (existing is null)
        {
            db.AdminUsers.Add(new AdminUser
            {
                Username = _admin.Username,
                PasswordHash = PasswordHasher.Hash(_admin.Password),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            });
            await db.SaveChangesAsync(ct);
            log.LogInformation("Seeded admin user '{Username}'.", _admin.Username);
            return;
        }

        if (_admin.Reset)
        {
            existing.PasswordHash = PasswordHasher.Hash(_admin.Password);
            existing.RefreshTokenHash = null;
            existing.RefreshExpiresAt = null;
            existing.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync(ct);
            log.LogWarning("Admin password RESET for user '{Username}'.", _admin.Username);
        }
    }

    /// <summary>Generic seeder. Idempotent: skips when any row exists.</summary>
    private async Task SeedFromJsonAsync<TRow, TEntity>(
        string file,
        DbSet<TEntity> set,
        Func<TRow, DateTime, TEntity> mapper,
        CancellationToken ct)
        where TEntity : class
    {
        if (await set.AnyAsync(ct))
        {
            log.LogDebug("{Set} not empty; skipping {File}.", typeof(TEntity).Name, file);
            return;
        }

        var path = Path.Combine(env.ContentRootPath, "SeedData", file);
        if (!File.Exists(path))
        {
            log.LogWarning("Seed file not found: {Path}", path);
            return;
        }

        var json = await File.ReadAllTextAsync(path, ct);
        var rows = JsonSerializer.Deserialize<List<TRow>>(json, JsonOpts) ?? new();
        var now = DateTime.UtcNow;
        foreach (var r in rows) set.Add(mapper(r, now));
        await db.SaveChangesAsync(ct);
        log.LogInformation("Seeded {Count} {Entity}.", rows.Count, typeof(TEntity).Name);
    }

    private async Task SeedTranslationsAsync(CancellationToken ct)
    {
        if (await db.Translations.AnyAsync(ct)) return;

        var path = Path.Combine(env.ContentRootPath, "SeedData", "translations.json");
        if (!File.Exists(path)) { log.LogWarning("translations.json not found"); return; }

        var rows = JsonSerializer.Deserialize<List<TranslationSeedRow>>(
            await File.ReadAllTextAsync(path, ct), JsonOpts) ?? new();
        var now = DateTime.UtcNow;
        foreach (var r in rows)
        {
            db.Translations.Add(new Translation
            {
                Section = r.Section,
                DataTr = r.DataTr,
                DataEn = r.DataEn,
                UpdatedAt = now,
            });
        }
        await db.SaveChangesAsync(ct);
        log.LogInformation("Seeded {Count} translations.", rows.Count);
    }

    private async Task SeedPersonalAsync(CancellationToken ct)
    {
        if (await db.Personals.AnyAsync(ct)) return;

        var path = Path.Combine(env.ContentRootPath, "SeedData", "personal.json");
        if (!File.Exists(path)) { log.LogWarning("personal.json not found"); return; }

        var row = JsonSerializer.Deserialize<PersonalSeedRow>(
            await File.ReadAllTextAsync(path, ct), JsonOpts);
        if (row is null) return;

        db.Personals.Add(new Personal
        {
            Id = 1,
            Name = row.Name,
            Email = row.Email,
            Location = row.Location,
            Github = row.Github,
            Linkedin = row.Linkedin,
            CvUrl = row.CvUrl,
            UpdatedAt = DateTime.UtcNow,
        });
        await db.SaveChangesAsync(ct);
        log.LogInformation("Seeded personal.");
    }

    // ── Seed row shapes ─────────────────────────────────────────────
    private class ProjectSeedRow
    {
        public string Slug { get; set; } = default!;
        public int SortOrder { get; set; }
        public bool IsPublished { get; set; }
        public string Color { get; set; } = "#7c6fff";
        public string TypeKey { get; set; } = "Backend";
        public string? Github { get; set; }
        public string? Live { get; set; }
        public List<string>? Tags { get; set; }
        public ProjectLocale? DataTr { get; set; }
        public ProjectLocale? DataEn { get; set; }
    }

    private class ExperienceSeedRow
    {
        public int SortOrder { get; set; }
        public bool IsEducation { get; set; }
        public string Period { get; set; } = string.Empty;
        public bool IsPublished { get; set; }
        public List<string>? Tech { get; set; }
        public ExperienceLocale? DataTr { get; set; }
        public ExperienceLocale? DataEn { get; set; }
    }

    private class SkillCategorySeedRow
    {
        public int SortOrder { get; set; }
        public string Icon { get; set; } = "dotnet";
        public string TitleTr { get; set; } = string.Empty;
        public string TitleEn { get; set; } = string.Empty;
        public bool IsPublished { get; set; }
        public List<SkillItem>? Skills { get; set; }
    }

    private class BlogPostSeedRow
    {
        public string Slug { get; set; } = default!;
        public int SortOrder { get; set; }
        public bool IsFeatured { get; set; }
        public bool IsPublished { get; set; }
        public string Category { get; set; } = string.Empty;
        public string Color { get; set; } = "#7c6fff";
        public DateOnly? PublishedAt { get; set; }
        public List<string>? Tags { get; set; }
        public BlogPostLocale? DataTr { get; set; }
        public BlogPostLocale? DataEn { get; set; }
        public List<BlogBlock>? ContentTr { get; set; }
        public List<BlogBlock>? ContentEn { get; set; }
    }

    private class TranslationSeedRow
    {
        public string Section { get; set; } = default!;
        public JsonElement DataTr { get; set; }
        public JsonElement DataEn { get; set; }
    }

    private class PersonalSeedRow
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string? Github { get; set; }
        public string? Linkedin { get; set; }
        public string? CvUrl { get; set; }
    }
}
