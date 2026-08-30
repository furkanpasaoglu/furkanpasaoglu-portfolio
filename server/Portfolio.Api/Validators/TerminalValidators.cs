using FluentValidation;
using Portfolio.Api.Contracts.Terminal;
using Portfolio.Api.Domain;

namespace Portfolio.Api.Validators;

public static class TerminalRules
{
    /// <summary>
    /// Names the client handles itself. A stored command using one of these
    /// would never run — the built-in wins — so it is rejected at the door
    /// rather than silently ignored later.
    /// </summary>
    public static readonly string[] Reserved =
        { "help", "ls", "cd", "lang", "open", "dotnet", "reboot", "clear", "exit" };

    /// <summary>
    /// One lowercase token: the terminal splits input on whitespace and takes
    /// the first word, so a name with a space could never be matched.
    /// </summary>
    public static IRuleBuilderOptions<T, string> CommandName<T>(
        this IRuleBuilder<T, string> rule) =>
        rule.NotEmpty()
            .MaximumLength(32)
            .Matches("^[a-z0-9][a-z0-9._-]*$")
            .WithMessage("Only lowercase letters, digits and . _ - are allowed; no spaces.")
            .Must(n => !Reserved.Contains(n))
            .WithMessage("That name belongs to a built-in command.");
}

public class TerminalCommandLocaleValidator : AbstractValidator<TerminalCommandLocale>
{
    public TerminalCommandLocaleValidator()
    {
        RuleFor(x => x.Summary).NotEmpty().MaximumLength(120);
        RuleFor(x => x.Body).NotEmpty().MaximumLength(4000);
    }
}

public class TerminalCommandUpsertValidator : AbstractValidator<TerminalCommandUpsertDto>
{
    public TerminalCommandUpsertValidator()
    {
        RuleFor(x => x.Name).CommandName();
        RuleFor(x => x.SortOrder).GreaterThanOrEqualTo(0);
        RuleFor(x => x.DataTr).NotNull().SetValidator(new TerminalCommandLocaleValidator());
        RuleFor(x => x.DataEn).NotNull().SetValidator(new TerminalCommandLocaleValidator());
    }
}
