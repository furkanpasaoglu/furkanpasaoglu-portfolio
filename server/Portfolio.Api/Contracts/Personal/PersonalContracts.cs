namespace Portfolio.Api.Contracts.Personal;

public record PersonalDto(
    string Name,
    string Email,
    string Location,
    string? Github,
    string? Linkedin,
    string? CvUrl);
