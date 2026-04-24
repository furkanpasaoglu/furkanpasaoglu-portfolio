using FluentValidation;
using Portfolio.Api.Contracts.SiteSettings;

namespace Portfolio.Api.Validators;

public class SiteSettingsValidator : AbstractValidator<SiteSettingsDto>
{
    public SiteSettingsValidator()
    {
        RuleFor(x => x.DataTr).SetValidator(new LocaleSeoValidator());
        RuleFor(x => x.DataEn).SetValidator(new LocaleSeoValidator());
        RuleFor(x => x.Branding).SetValidator(new BrandingValidator());
        RuleFor(x => x.Schema).SetValidator(new SchemaValidator());
        RuleFor(x => x.Operations).SetValidator(new OperationsValidator());
        RuleFor(x => x.Security).SetValidator(new SecurityValidator());
        RuleFor(x => x.Communications).SetValidator(new CommunicationsValidator());
    }
}

public class CommunicationsValidator : AbstractValidator<CommunicationsDto>
{
    public CommunicationsValidator()
    {
        RuleFor(x => x.Smtp).NotNull().SetValidator(new SmtpConfigValidator());
        RuleFor(x => x.AutoReply).NotNull().SetValidator(new AutoReplyValidator());
        RuleFor(x => x.AdminNotifyEmail).NotEmpty().EmailAddress();
    }
}

public class SmtpConfigValidator : AbstractValidator<SmtpConfigDto>
{
    public SmtpConfigValidator()
    {
        RuleFor(x => x.Host).MaximumLength(200);
        RuleFor(x => x.Port).InclusiveBetween(1, 65535);
        RuleFor(x => x.Username).MaximumLength(200);
        RuleFor(x => x.Password).MaximumLength(500);
        RuleFor(x => x.FromAddress).MaximumLength(200)
            .Must(s => string.IsNullOrEmpty(s) || new System.ComponentModel.DataAnnotations.EmailAddressAttribute().IsValid(s))
            .WithMessage("FromAddress must be a valid email or empty.");
        RuleFor(x => x.FromName).MaximumLength(200);
        RuleFor(x => x)
            .Must(s => !s.Enabled || (!string.IsNullOrWhiteSpace(s.Host) && !string.IsNullOrWhiteSpace(s.FromAddress)))
            .WithMessage("SMTP enabled but host or from-address is empty.");
    }
}

public class AutoReplyValidator : AbstractValidator<AutoReplyDto>
{
    public AutoReplyValidator()
    {
        RuleFor(x => x.Subject_tr).MaximumLength(200);
        RuleFor(x => x.Subject_en).MaximumLength(200);
        RuleFor(x => x.Body_tr).MaximumLength(4000);
        RuleFor(x => x.Body_en).MaximumLength(4000);
        RuleFor(x => x)
            .Must(a => !a.Enabled
                      || (!string.IsNullOrWhiteSpace(a.Subject_tr) && !string.IsNullOrWhiteSpace(a.Body_tr)
                          && !string.IsNullOrWhiteSpace(a.Subject_en) && !string.IsNullOrWhiteSpace(a.Body_en)))
            .WithMessage("Auto-reply enabled but subject/body is missing for one language.");
    }
}

public class OperationsValidator : AbstractValidator<OperationsDto>
{
    public OperationsValidator()
    {
        RuleFor(x => x.MaintenanceMessage_tr).NotNull().MaximumLength(2000);
        RuleFor(x => x.MaintenanceMessage_en).NotNull().MaximumLength(2000);
        RuleFor(x => x.SectionsEnabled).NotNull();
        RuleFor(x => x.Analytics).NotNull().SetValidator(new AnalyticsValidator());
    }
}

public class AnalyticsValidator : AbstractValidator<AnalyticsDto>
{
    public AnalyticsValidator()
    {
        RuleFor(x => x.Ga4MeasurementId)
            .Matches("^(G-[A-Z0-9]{6,})?$")
            .WithMessage("GA4 ID must be empty or start with 'G-' followed by alphanumerics.");
        RuleFor(x => x.GtmContainerId)
            .Matches("^(GTM-[A-Z0-9]{5,})?$")
            .WithMessage("GTM ID must be empty or start with 'GTM-' followed by alphanumerics.");
        RuleFor(x => x)
            .Must(x => !x.Enabled || !string.IsNullOrWhiteSpace(x.Ga4MeasurementId) || !string.IsNullOrWhiteSpace(x.GtmContainerId))
            .WithMessage("Analytics enabled but neither GA4 nor GTM ID is set.");
    }
}

public class SecurityValidator : AbstractValidator<SecurityDto>
{
    private static readonly HashSet<string> CspLiterals = new(StringComparer.Ordinal)
    {
        "'self'", "'unsafe-inline'", "'unsafe-eval'", "'none'", "'strict-dynamic'",
        "data:", "blob:", "https:", "http:",
    };

    private static readonly string[] AllowedRobotsPrefixes =
        { "Allow:", "Disallow:", "Crawl-delay:", "User-agent:", "Sitemap:" };

    public SecurityValidator()
    {
        RuleFor(x => x.Csp).NotNull().SetValidator(new CspValidator());
        RuleFor(x => x.RobotsExtraDirectives).NotNull();
        RuleForEach(x => x.RobotsExtraDirectives)
            .Must(v => !string.IsNullOrWhiteSpace(v)
                      && v.Length <= 200
                      && AllowedRobotsPrefixes.Any(p => v.TrimStart().StartsWith(p, StringComparison.OrdinalIgnoreCase)))
            .WithMessage("Each robots directive must start with Allow:/Disallow:/Crawl-delay:/User-agent:/Sitemap: and be ≤200 chars.");
    }

    public class CspValidator : AbstractValidator<CspDto>
    {
        public CspValidator()
        {
            RuleFor(x => x.DefaultSrc).NotNull();
            RuleFor(x => x.ScriptSrc).NotNull();
            RuleFor(x => x.StyleSrc).NotNull();
            RuleFor(x => x.FontSrc).NotNull();
            RuleFor(x => x.ImgSrc).NotNull();
            RuleFor(x => x.ConnectSrc).NotNull();
            RuleFor(x => x.FrameSrc).NotNull();

            foreach (var name in new[] { "DefaultSrc", "ScriptSrc", "StyleSrc", "FontSrc", "ImgSrc", "ConnectSrc", "FrameSrc" })
            {
                RuleForEach(x => (string[])typeof(CspDto).GetProperty(name)!.GetValue(x)!)
                    .Must(BeValidCspEntry)
                    .WithMessage($"{name}: each entry must be a CSP literal (e.g. 'self') or an absolute URL.");
            }
        }

        private static bool BeValidCspEntry(string v)
        {
            if (string.IsNullOrWhiteSpace(v)) return false;
            if (CspLiterals.Contains(v)) return true;
            // allow scheme-only (https:, data: etc.) and absolute URLs
            if (v.EndsWith(':') && v.Length <= 8) return true;
            return System.Text.RegularExpressions.Regex.IsMatch(v, "^https?://[a-zA-Z0-9.*-]+(/.*)?$");
        }
    }
}

public class LocaleSeoValidator : AbstractValidator<LocaleSeoDto>
{
    public LocaleSeoValidator()
    {
        RuleFor(x => x.Title).NotEmpty().Length(10, 120);
        RuleFor(x => x.Description).NotEmpty().Length(50, 500);
        RuleFor(x => x.Keywords).MaximumLength(500);
        RuleFor(x => x.OgTitle).NotEmpty().MaximumLength(200);
        RuleFor(x => x.OgDescription).NotEmpty().MaximumLength(500);
        RuleFor(x => x.OgImageAlt).NotEmpty().MaximumLength(200);
        RuleFor(x => x.TwitterTitle).NotEmpty().MaximumLength(200);
        RuleFor(x => x.TwitterDescription).NotEmpty().MaximumLength(500);
        RuleFor(x => x.SiteName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.OgLocale).NotEmpty().Matches("^[a-z]{2}_[A-Z]{2}$");
    }
}

public class BrandingValidator : AbstractValidator<BrandingDto>
{
    public BrandingValidator()
    {
        RuleFor(x => x.CanonicalBaseUrl)
            .NotEmpty()
            .Must(u => u.StartsWith("https://") && Uri.TryCreate(u, UriKind.Absolute, out _))
            .WithMessage("Must be an absolute https:// URL.");
        RuleFor(x => x.ThemeColor).Matches("^#[0-9A-Fa-f]{6}$");
        RuleFor(x => x.FaviconUrl).NotEmpty().MaximumLength(500);
        RuleFor(x => x.OgImageUrl).NotEmpty().MaximumLength(500);
        RuleFor(x => x.OgImageWidth).GreaterThan(0).LessThanOrEqualTo(4096);
        RuleFor(x => x.OgImageHeight).GreaterThan(0).LessThanOrEqualTo(4096);
        RuleFor(x => x.TwitterImageUrl).NotEmpty().MaximumLength(500);
        RuleFor(x => x.TwitterCard).Must(v => v is "summary" or "summary_large_image");
        RuleFor(x => x.GoogleSiteVerification).MaximumLength(200);
        RuleFor(x => x.SitemapChangefreq)
            .Must(v => v is "always" or "hourly" or "daily" or "weekly" or "monthly" or "yearly" or "never");
        RuleFor(x => x.SitemapPriority).InclusiveBetween(0m, 1m);
    }
}

public class SchemaValidator : AbstractValidator<SchemaDto>
{
    public SchemaValidator()
    {
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.AddressCountry).NotEmpty().Length(2);
        RuleFor(x => x.DateCreated).Matches("^\\d{4}-\\d{2}-\\d{2}$");
        RuleFor(x => x.SameAs).NotNull();
        RuleForEach(x => x.SameAs).Must(u => Uri.TryCreate(u, UriKind.Absolute, out _));
        RuleFor(x => x.JobTitle_tr).NotEmpty().MaximumLength(200);
        RuleFor(x => x.JobTitle_en).NotEmpty().MaximumLength(200);
        RuleFor(x => x.PersonDescription_tr).NotEmpty().MaximumLength(2000);
        RuleFor(x => x.PersonDescription_en).NotEmpty().MaximumLength(2000);
        RuleFor(x => x.AddressLocality_tr).NotEmpty().MaximumLength(100);
        RuleFor(x => x.AddressLocality_en).NotEmpty().MaximumLength(100);
        RuleFor(x => x.KnowsAbout_tr).NotNull();
        RuleFor(x => x.KnowsAbout_en).NotNull();
        RuleFor(x => x.WorksForName_tr).NotEmpty().MaximumLength(200);
        RuleFor(x => x.WorksForName_en).NotEmpty().MaximumLength(200);
        RuleFor(x => x.AlumniOfName_tr).NotEmpty().MaximumLength(200);
        RuleFor(x => x.AlumniOfName_en).NotEmpty().MaximumLength(200);
    }
}
