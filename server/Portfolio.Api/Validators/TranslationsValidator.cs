using System.Text.Json;
using FluentValidation;
using static Portfolio.Api.Endpoints.TranslationsEndpoints;

namespace Portfolio.Api.Validators;

public class TranslationUpsertValidator : AbstractValidator<TranslationUpsertDto>
{
    public TranslationUpsertValidator()
    {
        RuleFor(x => x.DataTr)
            .Must(BeAnObject).WithMessage("DataTr must be a JSON object.");
        RuleFor(x => x.DataEn)
            .Must(BeAnObject).WithMessage("DataEn must be a JSON object.");
    }

    private static bool BeAnObject(JsonElement el) =>
        el.ValueKind == JsonValueKind.Object;
}
