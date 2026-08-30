using System.Text.Json;

namespace Portfolio.Api.Domain;

public class Experience
{
    public int Id { get; set; }
    public int SortOrder { get; set; }
    public bool IsEducation { get; set; }

    /// <summary>Display-only period string, e.g. "06/2021 — Günümüz"</summary>
    public string Period { get; set; } = string.Empty;
    public bool IsPublished { get; set; } = true;

    // JSONB
    public List<string> Tech { get; set; } = new();
    public ExperienceLocale DataTr { get; set; } = new();
    public ExperienceLocale DataEn { get; set; } = new();

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class ExperienceLocale
{
    public string Title { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;  // "Full-time" / "Eğitim"
    // Rich document; a legacy plain string still deserialises into JsonElement.
    public JsonElement Desc { get; set; }

    /// <summary>Same story as ProjectLocale.Highlights: still read, never written.</summary>
    public List<string> Highlights { get; set; } = new();
}
