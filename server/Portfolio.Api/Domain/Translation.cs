using System.Text.Json;

namespace Portfolio.Api.Domain;

public class Translation
{
    public int Id { get; set; }

    /// <summary>"nav" | "hero" | "about" | "skills" | "projects" | "experience" | "blog" | "contact" | "footer" | "loading" | "common"</summary>
    public string Section { get; set; } = default!;

    // JSONB — free-form per section
    public JsonElement DataTr { get; set; }
    public JsonElement DataEn { get; set; }

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
