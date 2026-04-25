namespace Portfolio.Api.Options;

public class KeycloakOptions
{
    public const string SectionName = "Keycloak";

    /// <summary>e.g. https://keycloak.furkanpasaoglu.com/realms/blog</summary>
    public string Authority { get; set; } = default!;
    public string ClientId { get; set; } = default!;
    public string ClientSecret { get; set; } = default!;

    /// <summary>Public origin of the API (used to build redirect_uri). e.g. https://furkanpasaoglu.com</summary>
    public string PublicOrigin { get; set; } = default!;

    /// <summary>Path to redirect to after successful login. Default /admin.</summary>
    public string PostLoginPath { get; set; } = "/admin";

    /// <summary>Path to redirect to after logout. Default /admin/login.</summary>
    public string PostLogoutPath { get; set; } = "/admin/login";
}
