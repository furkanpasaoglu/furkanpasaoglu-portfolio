using System.Text.Json;
using Portfolio.Api.Validators;

namespace Portfolio.Api.Tests;

/// <summary>
/// The description fields hold a document, not HTML, so there is no markup to
/// sanitise — the client renders the node tree into React elements. What is
/// worth locking in is the required check, which has to keep accepting the
/// plain strings written before the editor existed while still rejecting a
/// document that only looks filled.
/// </summary>
public class RichDocRulesTests
{
    private static JsonElement Doc(string json) =>
        JsonDocument.Parse(json).RootElement.Clone();

    [Theory]
    [InlineData("\"Legacy plain text.\"")]
    [InlineData("{\"type\":\"doc\",\"content\":[{\"type\":\"paragraph\",\"content\":[{\"type\":\"text\",\"text\":\"Bir şey\"}]}]}")]
    public void HasContent_accepts_written_descriptions(string json) =>
        Assert.True(RichDocRules.HasContent(Doc(json)));

    [Theory]
    [InlineData("\"\"")]
    [InlineData("\"   \"")]
    [InlineData("{\"type\":\"doc\",\"content\":[]}")]
    [InlineData("{\"type\":\"doc\"}")]
    [InlineData("null")]
    [InlineData("[]")]
    [InlineData("42")]
    public void HasContent_rejects_empty_descriptions(string json) =>
        Assert.False(RichDocRules.HasContent(Doc(json)));

    /// <summary>An unset JsonElement is what a missing field deserialises to.</summary>
    [Fact]
    public void HasContent_rejects_a_missing_field() =>
        Assert.False(RichDocRules.HasContent(default));
}
