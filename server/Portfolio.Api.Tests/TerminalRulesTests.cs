using FluentValidation;
using Portfolio.Api.Contracts.Terminal;
using Portfolio.Api.Domain;
using Portfolio.Api.Validators;

namespace Portfolio.Api.Tests;

/// <summary>
/// A written command is matched by the client only after the built-in switch
/// has had its turn, so a stored "cd" would be dead on arrival. These lock in
/// that the name is checked instead of silently accepted.
/// </summary>
public class TerminalRulesTests
{
    private static readonly TerminalCommandUpsertValidator Validator = new();

    private static TerminalCommandUpsertDto Dto(string name) => new(
        name, 0, true,
        new TerminalCommandLocale { Summary = "kısa özet", Body = "Türkçe gövde" },
        new TerminalCommandLocale { Summary = "short", Body = "body" });

    [Theory]
    [InlineData("whoami")]
    [InlineData("neden-dotnet")]
    [InlineData("stack_2")]
    [InlineData("v1.2")]
    public void Accepts_a_single_lowercase_token(string name) =>
        Assert.True(Validator.Validate(Dto(name)).IsValid);

    [Theory]
    [InlineData("cd")]
    [InlineData("help")]
    [InlineData("clear")]
    public void Rejects_a_built_in_name(string name) =>
        Assert.False(Validator.Validate(Dto(name)).IsValid);

    [Theory]
    [InlineData("")]
    [InlineData("iki kelime")]   // the client only ever matches the first word
    [InlineData("Whoami")]       // input is lowercased before matching
    [InlineData("-leading")]
    [InlineData("türkçe")]
    public void Rejects_a_name_the_terminal_could_never_match(string name) =>
        Assert.False(Validator.Validate(Dto(name)).IsValid);

    [Fact]
    public void Requires_both_languages()
    {
        var dto = new TerminalCommandUpsertDto(
            "whoami", 0, true,
            new TerminalCommandLocale { Summary = "kısa özet", Body = "Türkçe gövde" },
            new TerminalCommandLocale { Summary = "", Body = "" });
        Assert.False(Validator.Validate(dto).IsValid);
    }
}
