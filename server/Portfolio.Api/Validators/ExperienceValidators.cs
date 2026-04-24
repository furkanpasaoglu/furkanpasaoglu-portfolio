using FluentValidation;
using Portfolio.Api.Contracts.Experience;
using Portfolio.Api.Domain;

namespace Portfolio.Api.Validators;

public class ExperienceLocaleValidator : AbstractValidator<ExperienceLocale>
{
    public ExperienceLocaleValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Company).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Type).NotEmpty().MaximumLength(64);
        RuleFor(x => x.Desc).NotEmpty();
        RuleForEach(x => x.Highlights).NotEmpty().MaximumLength(400);
    }
}

public class ExperienceUpsertValidator : AbstractValidator<ExperienceUpsertDto>
{
    public ExperienceUpsertValidator()
    {
        RuleFor(x => x.Period).NotEmpty().MaximumLength(64);
        RuleFor(x => x.SortOrder).GreaterThanOrEqualTo(0);
        RuleForEach(x => x.Tech).NotEmpty().MaximumLength(64);
        RuleFor(x => x.DataTr).NotNull().SetValidator(new ExperienceLocaleValidator());
        RuleFor(x => x.DataEn).NotNull().SetValidator(new ExperienceLocaleValidator());
    }
}
