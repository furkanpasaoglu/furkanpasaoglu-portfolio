namespace Portfolio.Api.Domain;

/// <summary>Singleton row (Id = 1). Language-neutral profile + social links.</summary>
public class Personal
{
    public int Id { get; set; } = 1;

    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;

    public string? Github { get; set; }
    public string? Linkedin { get; set; }

    /// <summary>Relative path: /uploads/cv.pdf or /Furkan-...pdf for static.</summary>
    public string? CvUrl { get; set; }

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
