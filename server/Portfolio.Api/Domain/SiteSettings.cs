using System.Text.Json;

namespace Portfolio.Api.Domain;

/// <summary>Singleton row (Id = 1). SEO/OG/Schema/branding for public site rendering.</summary>
public class SiteSettings
{
    public int Id { get; set; } = 1;

    public JsonElement DataTr { get; set; }
    public JsonElement DataEn { get; set; }
    public JsonElement BrandingJson { get; set; }
    public JsonElement SchemaJson { get; set; }
    public JsonElement OperationsJson { get; set; }
    public JsonElement SecurityJson { get; set; }
    public JsonElement CommunicationsJson { get; set; }

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
