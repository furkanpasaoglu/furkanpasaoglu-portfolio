using FluentValidation;
using Portfolio.Api.Contracts.Personal;

namespace Portfolio.Api.Validators;

public class PersonalValidator : AbstractValidator<PersonalAdminDto>
{
    public PersonalValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(200);
        RuleFor(x => x.Location).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Github).MaximumLength(500).HttpUrl();
        RuleFor(x => x.Linkedin).MaximumLength(500).HttpUrl();
        // The CVs are served from the uploads volume, so a site-relative path
        // is the normal case here.
        RuleFor(x => x.CvUrlTr).MaximumLength(500).HttpUrlOrPath();
        RuleFor(x => x.CvUrlEn).MaximumLength(500).HttpUrlOrPath();
    }
}
