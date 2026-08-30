using System.Text.Json;

namespace Portfolio.Api.Domain;

public class Project : ISluggable
{
    public int Id { get; set; }
    public string Slug { get; set; } = default!;

    public int SortOrder { get; set; }
    public bool IsPublished { get; set; }

    public string Color { get; set; } = "#7c6fff";
    public string TypeKey { get; set; } = "Backend";
    public string? Github { get; set; }
    public string? Live { get; set; }

    // JSONB columns
    public List<string> Tags { get; set; } = new();
    public ProjectLocale DataTr { get; set; } = new();
    public ProjectLocale DataEn { get; set; } = new();

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class ProjectLocale
{
    public string Title { get; set; } = string.Empty;
    public string ShortDesc { get; set; } = string.Empty;
    // A rich document (ProseMirror JSON). JsonElement accepts both that and
    // the plain string legacy rows still hold, so no migration is needed.
    public JsonElement LongDesc { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Client { get; set; }

    /// <summary>
    /// Bullet points, from before they became part of the description.
    /// Nothing writes this any more — the editor folds it into
    /// <see cref="LongDesc"/> the first time a record is opened — but rows
    /// not yet re-saved still carry it, so it is still read and rendered.
    /// </summary>
    public List<string> Highlights { get; set; } = new();
}
