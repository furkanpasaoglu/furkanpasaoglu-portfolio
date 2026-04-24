using System.Globalization;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Portfolio.Api.Data;
using Portfolio.Api.Domain;
using Portfolio.Api.Options;

namespace Portfolio.Api.Services;

public interface ISiteRenderer
{
    Task RenderAllAsync(CancellationToken ct = default);
    Task RenderSitemapAsync(CancellationToken ct = default);
    Task SeedFromTemplatesIfEmptyAsync(CancellationToken ct = default);
}

public class SiteRenderer(
    AppDbContext db,
    IOptions<WebStaticOptions> opts,
    IWebHostEnvironment env,
    ILogger<SiteRenderer> log) : ISiteRenderer
{
    private readonly WebStaticOptions _opts = opts.Value;
    private string? _cachedAssetMainJs;
    private string? _cachedAssetMainCssLink;

    private string OutDir => _opts.OutputPath;
    private string TemplatesDir => Path.IsPathRooted(_opts.TemplatesPath)
        ? _opts.TemplatesPath
        : Path.Combine(env.ContentRootPath, _opts.TemplatesPath);

    public async Task RenderAllAsync(CancellationToken ct = default)
    {
        var settings = await db.SiteSettings.AsNoTracking().FirstOrDefaultAsync(ct)
            ?? throw new InvalidOperationException("SiteSettings row missing.");

        Directory.CreateDirectory(OutDir);
        var indexHtml = IsMaintenanceMode(settings) ? RenderMaintenance(settings) : RenderIndex(settings);
        await WriteAtomicAsync("index.html", indexHtml, ct);
        await WriteAtomicAsync("robots.txt", RenderRobots(settings), ct);
        await WriteAtomicAsync("sitemap.xml", await RenderSitemapInternalAsync(settings, ct), ct);
        log.LogInformation("Rendered site static files to {Dir} (maintenance={Maintenance})",
            OutDir, IsMaintenanceMode(settings));
    }

    private static bool IsMaintenanceMode(SiteSettings s)
    {
        if (s.OperationsJson.ValueKind != JsonValueKind.Object) return false;
        return s.OperationsJson.TryGetProperty("maintenanceMode", out var m) && m.ValueKind == JsonValueKind.True;
    }

    public async Task RenderSitemapAsync(CancellationToken ct = default)
    {
        var settings = await db.SiteSettings.AsNoTracking().FirstOrDefaultAsync(ct);
        if (settings is null) { log.LogWarning("RenderSitemap skipped: no SiteSettings row."); return; }
        Directory.CreateDirectory(OutDir);
        await WriteAtomicAsync("sitemap.xml", await RenderSitemapInternalAsync(settings, ct), ct);
    }

    public Task SeedFromTemplatesIfEmptyAsync(CancellationToken ct = default)
    {
        Directory.CreateDirectory(OutDir);
        var indexPath = Path.Combine(OutDir, "index.html");
        if (File.Exists(indexPath)) return Task.CompletedTask;

        var seedDir = Path.Combine(TemplatesDir, "seed");
        foreach (var name in new[] { "index.html", "robots.txt", "sitemap.xml" })
        {
            var src = Path.Combine(seedDir, name);
            var dst = Path.Combine(OutDir, name);
            if (File.Exists(src) && !File.Exists(dst))
            {
                File.Copy(src, dst, overwrite: false);
                log.LogInformation("Seeded static file {Name} from templates/seed.", name);
            }
        }
        return Task.CompletedTask;
    }

    // ── Rendering ────────────────────────────────────────────────────
    private string RenderIndex(SiteSettings s)
    {
        var tr = s.DataTr;
        var en = s.DataEn;
        var b = s.BrandingJson;
        var sch = s.SchemaJson;

        var template = File.ReadAllText(Path.Combine(TemplatesDir, "index.html.template"));

        string S(JsonElement e, string key) => e.GetProperty(key).GetString() ?? string.Empty;
        int I(JsonElement e, string key) => e.GetProperty(key).GetInt32();
        bool Bl(JsonElement e, string key) => e.GetProperty(key).GetBoolean();

        string canonical = S(b, "canonicalBaseUrl").TrimEnd('/');
        string robotsMeta = $"{(Bl(b, "robotsIndex") ? "index" : "noindex")}, {(Bl(b, "robotsFollow") ? "follow" : "nofollow")}";
        string verification = S(b, "googleSiteVerification");
        string verificationMeta = string.IsNullOrWhiteSpace(verification)
            ? ""
            : $"<meta name=\"google-site-verification\" content=\"{System.Net.WebUtility.HtmlEncode(verification)}\" />";

        var replacements = new Dictionary<string, string>
        {
            ["{{SITE.FAVICON_URL}}"] = S(b, "faviconUrl"),
            ["{{SITE.TITLE_EN}}"] = S(en, "title"),
            ["{{SITE.DESC_EN}}"] = S(en, "description"),
            ["{{SITE.KEYWORDS_EN}}"] = S(en, "keywords"),
            ["{{SITE.OG_TITLE_EN}}"] = S(en, "ogTitle"),
            ["{{SITE.OG_DESC_EN}}"] = S(en, "ogDescription"),
            ["{{SITE.OG_IMAGE_ALT_EN}}"] = S(en, "ogImageAlt"),
            ["{{SITE.TWITTER_TITLE_EN}}"] = S(en, "twitterTitle"),
            ["{{SITE.TWITTER_DESC_EN}}"] = S(en, "twitterDescription"),
            ["{{SITE.SITE_NAME_EN}}"] = S(en, "siteName"),
            ["{{SITE.OG_LOCALE_EN}}"] = S(en, "ogLocale"),
            ["{{SITE.OG_LOCALE_TR}}"] = S(tr, "ogLocale"),
            ["{{SITE.OG_IMAGE_URL}}"] = S(b, "ogImageUrl"),
            ["{{SITE.OG_IMAGE_WIDTH}}"] = I(b, "ogImageWidth").ToString(),
            ["{{SITE.OG_IMAGE_HEIGHT}}"] = I(b, "ogImageHeight").ToString(),
            ["{{SITE.TWITTER_IMAGE_URL}}"] = S(b, "twitterImageUrl"),
            ["{{SITE.TWITTER_CARD}}"] = S(b, "twitterCard"),
            ["{{SITE.CANONICAL_BASE}}"] = canonical,
            ["{{SITE.THEME_COLOR}}"] = S(b, "themeColor"),
            ["{{SITE.ROBOTS_META}}"] = robotsMeta,
            ["{{SITE.GOOGLE_VERIFICATION_META}}"] = verificationMeta,
            ["{{SCHEMA.AUTHOR_NAME}}"] = $"{S(sch, "firstName")} {S(sch, "lastName")}",
            ["{{SCHEMA.FIRST_NAME}}"] = S(sch, "firstName"),
            ["{{SCHEMA.LAST_NAME}}"] = S(sch, "lastName"),
            ["{{SCHEMA.PROFILEPAGE_JSON}}"] = BuildProfilePageJson(s),
            ["{{SCHEMA.WEBSITE_JSON}}"] = BuildWebSiteJson(s),
            ["{{ASSET.MAIN_JS}}"] = GetAssetMainJs(),
            ["{{ASSET.MAIN_CSS_LINK}}"] = GetAssetMainCssLink(),
            ["{{SITE.CSP_CONTENT}}"] = BuildCspContent(s),
            ["{{SITE.ANALYTICS_HEAD}}"] = BuildAnalyticsHead(s),
            ["{{SITE.GTM_NOSCRIPT}}"] = BuildGtmNoscript(s),
        };

        var sb = new StringBuilder(template);
        foreach (var (k, v) in replacements) sb.Replace(k, v);
        return sb.ToString();
    }

    private string GetAssetMainJs()
    {
        if (_cachedAssetMainJs is not null) return _cachedAssetMainJs;

        // Try to read the hashed bundle name from a seeded index.html (produced by nginx container).
        foreach (var probe in ProbePaths())
        {
            if (!File.Exists(probe)) continue;
            var html = File.ReadAllText(probe);
            var match = Regex.Match(html, @"src=""(/assets/[^""]+\.js)""");
            if (match.Success) { _cachedAssetMainJs = match.Groups[1].Value; return _cachedAssetMainJs; }
        }
        _cachedAssetMainJs = "/src/main.jsx";
        return _cachedAssetMainJs;
    }

    private string GetAssetMainCssLink()
    {
        if (_cachedAssetMainCssLink is not null) return _cachedAssetMainCssLink;

        foreach (var probe in ProbePaths())
        {
            if (!File.Exists(probe)) continue;
            var html = File.ReadAllText(probe);
            var match = Regex.Match(html, @"<link[^>]*href=""(/assets/[^""]+\.css)""[^>]*>");
            if (match.Success) { _cachedAssetMainCssLink = match.Value; return _cachedAssetMainCssLink; }
        }
        _cachedAssetMainCssLink = "";
        return _cachedAssetMainCssLink;
    }

    private IEnumerable<string> ProbePaths()
    {
        yield return Path.Combine(OutDir, "index.html");
        yield return Path.Combine(TemplatesDir, "seed", "index.html");
    }

    private static readonly JsonSerializerOptions JsonPretty = new()
    {
        WriteIndented = true,
        Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
    };

    private static string BuildProfilePageJson(SiteSettings s)
    {
        var b = s.BrandingJson;
        var sch = s.SchemaJson;
        string canonical = (b.GetProperty("canonicalBaseUrl").GetString() ?? "").TrimEnd('/');

        var payload = new
        {
            context = "https://schema.org",
            type = "ProfilePage",
            dateCreated = sch.GetProperty("dateCreated").GetString(),
            dateModified = DateTime.UtcNow.ToString("yyyy-MM-dd"),
            url = $"{canonical}/",
            mainEntity = new
            {
                type = "Person",
                id = $"{canonical}/#person",
                name = $"{sch.GetProperty("firstName").GetString()} {sch.GetProperty("lastName").GetString()}",
                alternateName = "Furkan Pasaoglu",
                jobTitle = sch.GetProperty("jobTitle_en").GetString(),
                description = sch.GetProperty("personDescription_en").GetString(),
                url = canonical,
                email = sch.GetProperty("email").GetString(),
                image = b.GetProperty("ogImageUrl").GetString(),
                address = new
                {
                    type = "PostalAddress",
                    addressLocality = sch.GetProperty("addressLocality_en").GetString(),
                    addressCountry = sch.GetProperty("addressCountry").GetString(),
                },
                sameAs = sch.GetProperty("sameAs").EnumerateArray().Select(e => e.GetString()).ToArray(),
                knowsAbout = sch.GetProperty("knowsAbout_en").EnumerateArray().Select(e => e.GetString()).ToArray(),
                worksFor = new { type = "Organization", name = sch.GetProperty("worksForName_en").GetString() },
                alumniOf = new { type = "Organization", name = sch.GetProperty("alumniOfName_en").GetString() },
            }
        };
        return RewriteSchemaKeys(JsonSerializer.Serialize(payload, JsonPretty));
    }

    private static string BuildWebSiteJson(SiteSettings s)
    {
        var b = s.BrandingJson;
        var en = s.DataEn;
        string canonical = (b.GetProperty("canonicalBaseUrl").GetString() ?? "").TrimEnd('/');
        var payload = new
        {
            context = "https://schema.org",
            type = "WebSite",
            id = $"{canonical}/#website",
            url = $"{canonical}/",
            name = en.GetProperty("siteName").GetString(),
            description = en.GetProperty("description").GetString(),
            inLanguage = new[] { "en-US", "tr-TR" },
            author = new
            {
                type = "Person",
                id = $"{canonical}/#person",
                name = $"{s.SchemaJson.GetProperty("firstName").GetString()} {s.SchemaJson.GetProperty("lastName").GetString()}",
            },
        };
        return RewriteSchemaKeys(JsonSerializer.Serialize(payload, JsonPretty));
    }

    // JSON-LD requires @context/@type/@id — C# anonymous objects can't use '@' in property names, so we rewrite.
    private static string RewriteSchemaKeys(string json) =>
        json.Replace("\"context\":", "\"@context\":")
            .Replace("\"type\":", "\"@type\":")
            .Replace("\"id\":", "\"@id\":");

    private string RenderRobots(SiteSettings s)
    {
        var b = s.BrandingJson;
        var template = File.ReadAllText(Path.Combine(TemplatesDir, "robots.txt.template"));
        string directive = b.GetProperty("robotsIndex").GetBoolean() ? "Allow: /" : "Disallow: /";

        // Append extras from security_json
        var extraBlock = new StringBuilder();
        if (s.SecurityJson.ValueKind == JsonValueKind.Object
            && s.SecurityJson.TryGetProperty("robotsExtraDirectives", out var arr)
            && arr.ValueKind == JsonValueKind.Array)
        {
            foreach (var e in arr.EnumerateArray())
            {
                var line = e.GetString();
                if (!string.IsNullOrWhiteSpace(line)) extraBlock.AppendLine(line.Trim());
            }
        }

        var finalDirective = extraBlock.Length > 0
            ? directive + "\n\n" + extraBlock.ToString().TrimEnd()
            : directive;

        return template
            .Replace("{{ROBOTS.DIRECTIVE}}", finalDirective)
            .Replace("{{SITE.CANONICAL_BASE}}", (b.GetProperty("canonicalBaseUrl").GetString() ?? "").TrimEnd('/'));
    }

    private async Task<string> RenderSitemapInternalAsync(SiteSettings s, CancellationToken ct)
    {
        var b = s.BrandingJson;
        string canonical = (b.GetProperty("canonicalBaseUrl").GetString() ?? "").TrimEnd('/');
        string changefreq = b.GetProperty("sitemapChangefreq").GetString() ?? "monthly";
        decimal priority = b.GetProperty("sitemapPriority").GetDecimal();
        string today = DateTime.UtcNow.ToString("yyyy-MM-dd");

        var urls = new StringBuilder();
        urls.AppendLine("  <url>");
        urls.AppendLine($"    <loc>{canonical}/</loc>");
        urls.AppendLine($"    <lastmod>{today}</lastmod>");
        urls.AppendLine($"    <changefreq>{changefreq}</changefreq>");
        urls.AppendLine($"    <priority>{priority.ToString("0.0", CultureInfo.InvariantCulture)}</priority>");
        urls.AppendLine($"    <xhtml:link rel=\"alternate\" hreflang=\"en\" href=\"{canonical}/\" />");
        urls.AppendLine($"    <xhtml:link rel=\"alternate\" hreflang=\"tr\" href=\"{canonical}/\" />");
        urls.AppendLine("  </url>");

        var posts = await db.BlogPosts
            .Where(p => p.IsPublished)
            .Select(p => new { p.Slug, p.UpdatedAt })
            .ToListAsync(ct);

        foreach (var p in posts)
        {
            urls.AppendLine("  <url>");
            urls.AppendLine($"    <loc>{canonical}/blog/{p.Slug}</loc>");
            urls.AppendLine($"    <lastmod>{p.UpdatedAt:yyyy-MM-dd}</lastmod>");
            urls.AppendLine("    <changefreq>monthly</changefreq>");
            urls.AppendLine("    <priority>0.7</priority>");
            urls.AppendLine("  </url>");
        }

        var template = await File.ReadAllTextAsync(Path.Combine(TemplatesDir, "sitemap.xml.template"), ct);
        return template.Replace("{{SITEMAP.URLS}}", urls.ToString().TrimEnd());
    }

    // ── Phase 2: maintenance / analytics / CSP / robots extras ──────
    private string RenderMaintenance(SiteSettings s)
    {
        var template = File.ReadAllText(Path.Combine(TemplatesDir, "maintenance.html.template"));
        string Get(JsonElement root, string key, string fallback) =>
            root.ValueKind == JsonValueKind.Object && root.TryGetProperty(key, out var el) && el.ValueKind == JsonValueKind.String
                ? (el.GetString() ?? fallback) : fallback;

        var b = s.BrandingJson;
        var en = s.DataEn;
        var ops = s.OperationsJson;
        string titleEn = Get(en, "title", "Maintenance");
        string msgEn = Get(ops, "maintenanceMessage_en", "The site is currently under maintenance.");
        string msgTr = Get(ops, "maintenanceMessage_tr", "Site bakımda.");

        return template
            .Replace("{{SITE.TITLE_EN}}", System.Net.WebUtility.HtmlEncode(titleEn))
            .Replace("{{SITE.THEME_COLOR}}", Get(b, "themeColor", "#0ea5e9"))
            .Replace("{{SITE.FAVICON_URL}}", Get(b, "faviconUrl", "/favicon.svg"))
            .Replace("{{SITE.MAINTENANCE_MESSAGE_EN}}", System.Net.WebUtility.HtmlEncode(msgEn))
            .Replace("{{SITE.MAINTENANCE_MESSAGE_TR}}", System.Net.WebUtility.HtmlEncode(msgTr));
    }

    private static string BuildCspContent(SiteSettings s)
    {
        // Fallback to a safe default when security_json is empty.
        var defaults = new Dictionary<string, List<string>>
        {
            ["default-src"] = new() { "'self'" },
            ["script-src"] = new() { "'self'", "'unsafe-inline'" },
            ["style-src"] = new() { "'self'", "'unsafe-inline'", "https://fonts.googleapis.com" },
            ["font-src"] = new() { "'self'", "https://fonts.gstatic.com" },
            ["img-src"] = new() { "'self'", "data:", "https:" },
            ["connect-src"] = new() { "'self'" },
            ["frame-src"] = new(),
        };

        var csp = s.SecurityJson.ValueKind == JsonValueKind.Object && s.SecurityJson.TryGetProperty("csp", out var cspEl)
            ? cspEl : default;

        if (csp.ValueKind == JsonValueKind.Object)
        {
            Copy(csp, "defaultSrc", defaults["default-src"]);
            Copy(csp, "scriptSrc", defaults["script-src"]);
            Copy(csp, "styleSrc", defaults["style-src"]);
            Copy(csp, "fontSrc", defaults["font-src"]);
            Copy(csp, "imgSrc", defaults["img-src"]);
            Copy(csp, "connectSrc", defaults["connect-src"]);
            Copy(csp, "frameSrc", defaults["frame-src"]);
        }

        // Auto-extend for analytics
        if (AnalyticsEnabled(s, out _, out _))
        {
            AddIfMissing(defaults["script-src"], "https://www.googletagmanager.com", "https://www.google-analytics.com");
            AddIfMissing(defaults["connect-src"], "https://www.google-analytics.com", "https://*.analytics.google.com");
            AddIfMissing(defaults["img-src"], "https://www.google-analytics.com");
            AddIfMissing(defaults["frame-src"], "https://www.googletagmanager.com");
        }

        var sb = new StringBuilder();
        foreach (var (directive, values) in defaults)
        {
            if (values.Count == 0 && directive == "frame-src") continue; // skip empty frame-src
            sb.Append(directive);
            foreach (var v in values) { sb.Append(' ').Append(v); }
            sb.Append("; ");
        }
        return sb.ToString().TrimEnd();

        static void Copy(JsonElement csp, string key, List<string> target)
        {
            if (!csp.TryGetProperty(key, out var arr) || arr.ValueKind != JsonValueKind.Array) return;
            target.Clear();
            foreach (var e in arr.EnumerateArray()) { var s = e.GetString(); if (!string.IsNullOrWhiteSpace(s)) target.Add(s!); }
        }

        static void AddIfMissing(List<string> list, params string[] entries)
        {
            foreach (var e in entries) if (!list.Contains(e)) list.Add(e);
        }
    }

    private static bool AnalyticsEnabled(SiteSettings s, out string ga4, out string gtm)
    {
        ga4 = ""; gtm = "";
        if (s.OperationsJson.ValueKind != JsonValueKind.Object) return false;
        if (!s.OperationsJson.TryGetProperty("analytics", out var a) || a.ValueKind != JsonValueKind.Object) return false;
        if (!a.TryGetProperty("enabled", out var en) || en.ValueKind != JsonValueKind.True) return false;
        ga4 = a.TryGetProperty("ga4MeasurementId", out var g) ? (g.GetString() ?? "") : "";
        gtm = a.TryGetProperty("gtmContainerId", out var t) ? (t.GetString() ?? "") : "";
        return !string.IsNullOrWhiteSpace(ga4) || !string.IsNullOrWhiteSpace(gtm);
    }

    private static string BuildAnalyticsHead(SiteSettings s)
    {
        if (!AnalyticsEnabled(s, out var ga4, out var gtm)) return "";
        var sb = new StringBuilder();
        if (!string.IsNullOrWhiteSpace(gtm))
        {
            sb.AppendLine("<!-- Google Tag Manager -->");
            sb.AppendLine("<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':");
            sb.AppendLine("new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],");
            sb.AppendLine("j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=");
            sb.AppendLine($"'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);");
            sb.AppendLine($"}})(window,document,'script','dataLayer','{gtm}');</script>");
        }
        if (!string.IsNullOrWhiteSpace(ga4))
        {
            sb.AppendLine($"<script async src=\"https://www.googletagmanager.com/gtag/js?id={ga4}\"></script>");
            sb.AppendLine("<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}");
            sb.AppendLine($"gtag('js',new Date());gtag('config','{ga4}');</script>");
        }
        return sb.ToString();
    }

    private static string BuildGtmNoscript(SiteSettings s)
    {
        if (!AnalyticsEnabled(s, out _, out var gtm) || string.IsNullOrWhiteSpace(gtm)) return "";
        return $"<noscript><iframe src=\"https://www.googletagmanager.com/ns.html?id={gtm}\" height=\"0\" width=\"0\" style=\"display:none;visibility:hidden\"></iframe></noscript>";
    }

    private async Task WriteAtomicAsync(string fileName, string content, CancellationToken ct)
    {
        var finalPath = Path.Combine(OutDir, fileName);
        var tmpPath = finalPath + ".tmp";
        await File.WriteAllTextAsync(tmpPath, content, Encoding.UTF8, ct);
        File.Move(tmpPath, finalPath, overwrite: true);
    }
}
