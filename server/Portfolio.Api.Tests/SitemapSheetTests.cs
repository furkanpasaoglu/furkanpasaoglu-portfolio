using System.Text.Json;
using Portfolio.Api.Domain;
using Portfolio.Api.Services;

namespace Portfolio.Api.Tests;

/// <summary>
/// Every sheet is its own address now, so every sheet belongs in the sitemap.
/// The list is only useful if it also honours the Operations switches — an
/// offered URL that answers with a fault sheet is worse than no URL.
/// </summary>
public class SitemapSheetTests
{
    private static SiteSettings WithOperations(string json) => new()
    {
        OperationsJson = JsonDocument.Parse(json).RootElement.Clone(),
    };

    [Fact]
    public void The_cover_is_not_among_the_sheet_urls() =>
        // It is the site root, listed on its own with the language alternates.
        Assert.DoesNotContain("index", SiteRenderer.SheetKeys);

    [Fact]
    public void Every_sheet_the_client_routes_is_listed()
    {
        string[] expected = { "about", "projects", "experience", "skills", "blog", "contact" };
        Assert.Equal(expected, SiteRenderer.SheetKeys);
    }

    [Fact]
    public void Nothing_is_switched_off_when_operations_is_empty() =>
        Assert.Empty(SiteRenderer.SectionsSwitchedOff(WithOperations("""{}""")));

    [Fact]
    public void Nothing_is_switched_off_when_the_settings_predate_the_key() =>
        Assert.Empty(SiteRenderer.SectionsSwitchedOff(
            WithOperations("""{"maintenanceMode":false}""")));

    [Fact]
    public void A_key_set_to_false_is_switched_off()
    {
        var off = SiteRenderer.SectionsSwitchedOff(
            WithOperations("""{"sectionsEnabled":{"skills":false,"blog":true}}"""));

        Assert.Contains("skills", off);
        Assert.DoesNotContain("blog", off);
    }

    [Fact]
    public void An_unset_operations_column_is_not_a_crash() =>
        Assert.Empty(SiteRenderer.SectionsSwitchedOff(new SiteSettings()));
}
