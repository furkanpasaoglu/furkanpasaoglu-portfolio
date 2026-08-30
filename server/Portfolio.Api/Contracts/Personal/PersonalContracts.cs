namespace Portfolio.Api.Contracts.Personal;

/// <summary>What the public site reads. `CvUrl` is already language-picked.</summary>
public record PersonalDto(
    string Name,
    string Email,
    string Location,
    string? Github,
    string? Linkedin,
    string? CvUrl);

/// <summary>What the panel edits: both CVs, so either can be replaced.</summary>
public record PersonalAdminDto(
    string Name,
    string Email,
    string Location,
    string? Github,
    string? Linkedin,
    string? CvUrlTr,
    string? CvUrlEn);
