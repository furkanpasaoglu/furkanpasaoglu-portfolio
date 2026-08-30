using System.Text.Json;
using Portfolio.Api.Contracts.SiteSettings;
using Portfolio.Api.Validators;

namespace Portfolio.Api.Tests;

/// <summary>
/// The section toggles used to be a fixed record of the old site's section
/// names. Renaming a section in the front end then silently dropped its key
/// on the way through the API and set every unnamed one to false — the site
/// lost sections nobody had switched off. They are a keyed map now, and
/// these hold that shape in place.
/// </summary>
public class SectionsEnabledTests
{
    private static readonly OperationsValidator Validator = new();

    /// <summary>What ASP.NET uses: camelCase, case-insensitive.</summary>
    private static readonly JsonSerializerOptions Web = new(JsonSerializerDefaults.Web);

    private static OperationsDto Ops(Dictionary<string, bool> sections) =>
        new(false, "", "", sections, new AnalyticsDto(false, "", ""));

    [Fact]
    public void Keys_survive_a_round_trip_through_json()
    {
        var ops = Ops(new() { ["index"] = true, ["background"] = false, ["blog"] = true });

        var json = JsonSerializer.Serialize(ops, Web);
        var back = JsonSerializer.Deserialize<OperationsDto>(json, Web)!;

        Assert.Equal(3, back.SectionsEnabled.Count);
        Assert.True(back.SectionsEnabled["index"]);
        Assert.False(back.SectionsEnabled["background"]);
    }

    [Fact]
    public void An_unknown_key_is_kept_rather_than_dropped()
    {
        var back = JsonSerializer.Deserialize<OperationsDto>(
            """{"sectionsEnabled":{"somethingNew":false},"analytics":{}}""", Web)!;

        Assert.False(back.SectionsEnabled["somethingNew"]);
    }

    [Fact]
    public void No_keys_at_all_is_valid_and_means_everything_is_visible() =>
        Assert.True(Validator.Validate(Ops(new())).IsValid);

    [Theory]
    [InlineData("index")]
    [InlineData("background")]
    [InlineData("skill_2")]
    public void Accepts_a_front_end_section_key(string key) =>
        Assert.True(Validator.Validate(Ops(new() { [key] = true })).IsValid);

    [Theory]
    [InlineData("")]
    [InlineData("iki kelime")]
    [InlineData("bölüm")]
    public void Rejects_a_key_that_is_not_an_identifier(string key) =>
        Assert.False(Validator.Validate(Ops(new() { [key] = true })).IsValid);

    [Fact]
    public void Rejects_an_unbounded_number_of_keys()
    {
        var many = Enumerable.Range(0, 33).ToDictionary(i => $"s{i}", _ => true);
        Assert.False(Validator.Validate(Ops(many)).IsValid);
    }
}
