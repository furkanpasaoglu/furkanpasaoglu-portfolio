namespace Portfolio.Api.Domain;

public class SkillCategory
{
    public int Id { get; set; }
    public int SortOrder { get; set; }

    /// <summary>Frontend icon key: "dotnet" | "database" | "devops" | …</summary>
    public string Icon { get; set; } = "dotnet";

    public string TitleTr { get; set; } = string.Empty;
    public string TitleEn { get; set; } = string.Empty;

    public bool IsPublished { get; set; } = true;

    // JSONB
    public List<SkillItem> Skills { get; set; } = new();

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class SkillItem
{
    public string Name { get; set; } = string.Empty;
    /// <summary>"expert" | "proficient" | "familiar"</summary>
    public string Tier { get; set; } = "proficient";
}
