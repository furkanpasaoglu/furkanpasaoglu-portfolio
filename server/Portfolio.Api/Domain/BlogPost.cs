namespace Portfolio.Api.Domain;

public class BlogPost : ISluggable
{
    public int Id { get; set; }
    public string Slug { get; set; } = default!;
    public int SortOrder { get; set; }

    public bool IsFeatured { get; set; }
    public bool IsPublished { get; set; } = true;

    public string Category { get; set; } = string.Empty;  // ".NET" | "AI / ML" | "DevOps"
    public string Color { get; set; } = "#7c6fff";
    public DateOnly? PublishedAt { get; set; }

    // JSONB
    public List<string> Tags { get; set; } = new();
    public BlogPostLocale DataTr { get; set; } = new();
    public BlogPostLocale DataEn { get; set; } = new();
    public List<BlogBlock> ContentTr { get; set; } = new();
    public List<BlogBlock> ContentEn { get; set; } = new();

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class BlogPostLocale
{
    public string Title { get; set; } = string.Empty;
    public string Excerpt { get; set; } = string.Empty;
    public string Date { get; set; } = string.Empty;    // display string like "15 Şubat 2026"
    public int ReadTime { get; set; }
}

public class BlogBlock
{
    /// <summary>"paragraph" | "heading" | "code" | "note"</summary>
    public string Type { get; set; } = "paragraph";
    public string Text { get; set; } = string.Empty;
    public string? Lang { get; set; }  // for code blocks, e.g. "csharp"
}
