namespace Portfolio.Api.Contracts.SiteSettings;

public record LocaleSeoDto(
    string Title,
    string Description,
    string Keywords,
    string OgTitle,
    string OgDescription,
    string OgImageAlt,
    string TwitterTitle,
    string TwitterDescription,
    string SiteName,
    string OgLocale
);

public record BrandingDto(
    string CanonicalBaseUrl,
    string ThemeColor,
    string FaviconUrl,
    string OgImageUrl,
    int OgImageWidth,
    int OgImageHeight,
    string TwitterImageUrl,
    string TwitterCard,
    string? GoogleSiteVerification,
    bool RobotsIndex,
    bool RobotsFollow,
    string SitemapChangefreq,
    decimal SitemapPriority
);

public record SchemaDto(
    string FirstName,
    string LastName,
    string Email,
    string AddressCountry,
    string DateCreated,
    string[] SameAs,
    string JobTitle_tr,
    string JobTitle_en,
    string PersonDescription_tr,
    string PersonDescription_en,
    string AddressLocality_tr,
    string AddressLocality_en,
    string[] KnowsAbout_tr,
    string[] KnowsAbout_en,
    string WorksForName_tr,
    string WorksForName_en,
    string AlumniOfName_tr,
    string AlumniOfName_en
);

public record SectionsEnabledDto(
    bool Hero, bool About, bool Skills, bool Projects,
    bool Experience, bool Blog, bool Contact
);

public record AnalyticsDto(
    bool Enabled,
    string Ga4MeasurementId,
    string GtmContainerId
);

public record OperationsDto(
    bool MaintenanceMode,
    string MaintenanceMessage_tr,
    string MaintenanceMessage_en,
    SectionsEnabledDto SectionsEnabled,
    AnalyticsDto Analytics
);

public record CspDto(
    string[] DefaultSrc,
    string[] ScriptSrc,
    string[] StyleSrc,
    string[] FontSrc,
    string[] ImgSrc,
    string[] ConnectSrc,
    string[] FrameSrc
);

public record SecurityDto(
    CspDto Csp,
    string[] RobotsExtraDirectives
);

public record SmtpConfigDto(
    bool Enabled,
    string Host,
    int Port,
    string Username,
    string Password,   // write-only; masked on GET
    string FromAddress,
    string FromName,
    bool UseStartTls
);

public record AutoReplyDto(
    bool Enabled,
    string Subject_tr,
    string Subject_en,
    string Body_tr,
    string Body_en
);

public record CommunicationsDto(
    SmtpConfigDto Smtp,
    AutoReplyDto AutoReply,
    string AdminNotifyEmail
);

public record SiteSettingsDto(
    LocaleSeoDto DataTr,
    LocaleSeoDto DataEn,
    BrandingDto Branding,
    SchemaDto Schema,
    OperationsDto Operations,
    SecurityDto Security,
    CommunicationsDto Communications
);

public record PublicSiteSettingsDto(
    string Lang,
    LocaleSeoDto Locale,
    BrandingDto Branding,
    SchemaDto Schema,
    OperationsDto Operations
);
