namespace Portfolio.Api.Contracts.Contact;

public record ContactSubmitDto(
    string Name,
    string Email,
    string Message,
    string Lang,
    string? Website   // honeypot — must be null/empty
);

public record ContactMessageDto(
    int Id,
    string Name,
    string Email,
    string Message,
    string Lang,
    bool IsRead,
    DateTime CreatedAt
);

public record ContactMessageListItemDto(
    int Id,
    string Name,
    string Email,
    string Preview,
    string Lang,
    bool IsRead,
    DateTime CreatedAt
);

public record TestSmtpDto(string To);
