namespace Portfolio.Api.Options;

public class AdminOptions
{
    public const string SectionName = "Admin";

    public string Username { get; set; } = "admin";
    public string Password { get; set; } = default!;
    public bool Reset { get; set; }
}
