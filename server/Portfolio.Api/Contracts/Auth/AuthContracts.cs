namespace Portfolio.Api.Contracts.Auth;

public record AuthResponse(string Username, DateTime ExpiresAt);

public record MeResponse(string Username);
