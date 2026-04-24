namespace Portfolio.Api.Options;

public class WebStaticOptions
{
    public const string SectionName = "WebStatic";
    public string OutputPath { get; set; } = "/app/web-static";
    public string TemplatesPath { get; set; } = "Templates";
    public string CanonicalBaseUrlFallback { get; set; } = "https://furkanpasaoglu.com";
}
