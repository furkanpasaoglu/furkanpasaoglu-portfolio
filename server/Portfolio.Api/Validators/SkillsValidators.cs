using FluentValidation;
using Portfolio.Api.Contracts.Skills;
using Portfolio.Api.Domain;

namespace Portfolio.Api.Validators;

public class SkillItemValidator : AbstractValidator<SkillItem>
{
    private static readonly string[] AllowedTiers = { "expert", "proficient", "familiar" };

    public SkillItemValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(120);
        RuleFor(x => x.Tier)
            .NotEmpty()
            .Must(t => AllowedTiers.Contains(t))
            .WithMessage("Tier must be one of: expert, proficient, familiar.");
    }
}

public class SkillCategoryUpsertValidator : AbstractValidator<SkillCategoryUpsertDto>
{
    public SkillCategoryUpsertValidator()
    {
        RuleFor(x => x.SortOrder).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Icon).NotEmpty().MaximumLength(64);
        RuleFor(x => x.TitleTr).NotEmpty().MaximumLength(200);
        RuleFor(x => x.TitleEn).NotEmpty().MaximumLength(200);
        RuleForEach(x => x.Skills).SetValidator(new SkillItemValidator());
    }
}
