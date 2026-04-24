namespace Portfolio.Api.Contracts.Auth;

public record LoginRequest(string Username, string Password);

public record AuthResponse(string Username, DateTime ExpiresAt);

public record MeResponse(string Username);
