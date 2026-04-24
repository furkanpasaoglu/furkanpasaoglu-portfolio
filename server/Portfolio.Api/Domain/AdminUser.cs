namespace Portfolio.Api.Domain;

public class AdminUser
{
    public int Id { get; set; }
    public string Username { get; set; } = default!;
    public string PasswordHash { get; set; } = default!;

    // Refresh token stored as sha256 hash (never the plaintext)
    public string? RefreshTokenHash { get; set; }
    public DateTime? RefreshExpiresAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
