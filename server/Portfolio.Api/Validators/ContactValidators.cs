using FluentValidation;
using Portfolio.Api.Contracts.Contact;

namespace Portfolio.Api.Validators;

public class ContactSubmitValidator : AbstractValidator<ContactSubmitDto>
{
    public ContactSubmitValidator()
    {
        RuleFor(x => x.Name).NotEmpty().Length(2, 100);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(200);
        RuleFor(x => x.Message).NotEmpty().Length(10, 2000);
        RuleFor(x => x.Lang).Must(l => l is "tr" or "en").WithMessage("Lang must be 'tr' or 'en'.");
    }
}

public class TestSmtpValidator : AbstractValidator<TestSmtpDto>
{
    public TestSmtpValidator()
    {
        RuleFor(x => x.To).NotEmpty().EmailAddress();
    }
}
