using System.Text.Json;
using FluentValidation;

namespace Portfolio.Api.Validators;

/// <summary>
/// Rules for the rich document fields.
///
/// <para>
/// A document is stored as ProseMirror JSON rather than HTML, so there is no
/// markup to sanitise here — the client renders it into React elements and
/// never into raw HTML. What this checks is only that the field carries
/// something: an object with content, or a legacy non-empty string.
/// </para>
/// </summary>
public static class RichDocRules
{
    public static bool HasContent(JsonElement doc) => doc.ValueKind switch
    {
        // Rows written before the editor existed still hold plain text.
        JsonValueKind.String => !string.IsNullOrWhiteSpace(doc.GetString()),
        JsonValueKind.Object => doc.TryGetProperty("content", out var content)
            && content.ValueKind == JsonValueKind.Array
            && content.GetArrayLength() > 0,
        _ => false,
    };

    public static IRuleBuilderOptions<T, JsonElement> RichDocument<T>(
        this IRuleBuilder<T, JsonElement> rule) =>
        rule.Must(HasContent).WithMessage("The description cannot be empty.");
}
