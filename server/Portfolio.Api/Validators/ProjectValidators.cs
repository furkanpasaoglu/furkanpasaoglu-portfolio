using FluentValidation;
using Portfolio.Api.Contracts.Projects;
using Portfolio.Api.Domain;

namespace Portfolio.Api.Validators;

public class ProjectLocaleValidator : AbstractValidator<ProjectLocale>
{
    public ProjectLocaleValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.ShortDesc).NotEmpty().MaximumLength(500);
        RuleFor(x => x.LongDesc).NotEmpty();
        RuleFor(x => x.Status).NotEmpty().MaximumLength(64);
        RuleFor(x => x.Client).MaximumLength(200);
        RuleForEach(x => x.Highlights).NotEmpty().MaximumLength(400);
    }
}

public class ProjectUpsertValidator : AbstractValidator<ProjectUpsertDto>
{
    public ProjectUpsertValidator()
    {
        RuleFor(x => x.Slug).Slug();
        RuleFor(x => x.Color).HexColor();
        RuleFor(x => x.TypeKey).NotEmpty().MaximumLength(64);
        RuleForEach(x => x.Tags).NotEmpty().MaximumLength(64);
        RuleFor(x => x.DataTr).NotNull().SetValidator(new ProjectLocaleValidator());
        RuleFor(x => x.DataEn).NotNull().SetValidator(new ProjectLocaleValidator());
    }
}
