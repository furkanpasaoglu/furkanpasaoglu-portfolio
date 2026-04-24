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
    public string LongDesc { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? Client { get; set; }
    public List<string> Highlights { get; set; } = new();
}
