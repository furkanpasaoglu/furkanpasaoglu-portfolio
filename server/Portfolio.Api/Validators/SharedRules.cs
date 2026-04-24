using FluentValidation;

namespace Portfolio.Api.Validators;

public static class SharedRules
{
    public static IRuleBuilderOptions<T, string> Slug<T>(this IRuleBuilder<T, string> rule) =>
        rule.NotEmpty().MaximumLength(128)
            .Matches("^[a-z0-9-]+$").WithMessage("Slug must be lowercase kebab-case.");

    public static IRuleBuilderOptions<T, string> HexColor<T>(this IRuleBuilder<T, string> rule) =>
        rule.NotEmpty()
            .Matches("^#[0-9a-fA-F]{3,8}$").WithMessage("Color must be a valid hex like #7c6fff.");
}
