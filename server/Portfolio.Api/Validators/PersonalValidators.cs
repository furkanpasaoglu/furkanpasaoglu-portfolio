using FluentValidation;
using Portfolio.Api.Contracts.Personal;

namespace Portfolio.Api.Validators;

public class PersonalValidator : AbstractValidator<PersonalDto>
{
    public PersonalValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(200);
        RuleFor(x => x.Location).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Github)
            .MaximumLength(500)
            .Must(BeNullOrValidUrl).WithMessage("GitHub must be a valid URL or empty.");
        RuleFor(x => x.Linkedin)
            .MaximumLength(500)
            .Must(BeNullOrValidUrl).WithMessage("LinkedIn must be a valid URL or empty.");
        RuleFor(x => x.CvUrl).MaximumLength(500);
    }

    private static bool BeNullOrValidUrl(string? value) =>
        string.IsNullOrWhiteSpace(value) || Uri.TryCreate(value, UriKind.Absolute, out _);
}
