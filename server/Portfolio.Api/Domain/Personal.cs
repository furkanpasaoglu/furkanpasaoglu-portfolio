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

    // One CV per language. Serving a Turkish CV to a foreign recruiter is
    // worse than serving none, so the two are stored separately. Either may
    // be unset; the public endpoint falls back to the other, because a
    // half-filled profile should still offer a working link.
    public string? CvUrlTr { get; set; }
    public string? CvUrlEn { get; set; }

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
