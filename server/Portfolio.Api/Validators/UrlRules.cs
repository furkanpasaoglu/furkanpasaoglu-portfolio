using FluentValidation;

namespace Portfolio.Api.Validators;

/// <summary>
/// Shared URL rules.
///
/// <para>
/// <c>Uri.TryCreate(value, UriKind.Absolute, out _)</c> is NOT a safety check:
/// <c>javascript:alert(1)</c> is a perfectly valid absolute URI. Anything that
/// ends up in an <c>href</c> on the public site therefore needs an explicit
/// scheme allow-list, or an editor can store a link that runs script in every
/// visitor's browser.
/// </para>
/// </summary>
public static class UrlRules
{
    private static bool IsHttpUrl(string value) =>
        Uri.TryCreate(value, UriKind.Absolute, out var uri)
        && (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps);

    /// <summary>Site-relative path such as <c>/media/cv.pdf</c>. Protocol-relative
    /// ("//evil.com") is rejected: it is not same-origin.</summary>
    private static bool IsRelativePath(string value) =>
        value.StartsWith('/')
        && !value.StartsWith("//", StringComparison.Ordinal)
        && !value.Contains('\\', StringComparison.Ordinal);

    public static bool IsSafeAbsolute(string? value) =>
        string.IsNullOrWhiteSpace(value) || IsHttpUrl(value);

    public static bool IsSafeAbsoluteOrRelative(string? value) =>
        string.IsNullOrWhiteSpace(value) || IsHttpUrl(value) || IsRelativePath(value);

    /// <summary>For links that must be fully qualified (GitHub, LinkedIn, …).</summary>
    public static IRuleBuilderOptions<T, string?> HttpUrl<T>(this IRuleBuilder<T, string?> rule) =>
        rule.Must(IsSafeAbsolute)
            .WithMessage("Only http:// or https:// links are allowed.");

    /// <summary>For assets that may live on this site (<c>/media/cv.pdf</c>).</summary>
    public static IRuleBuilderOptions<T, string?> HttpUrlOrPath<T>(this IRuleBuilder<T, string?> rule) =>
        rule.Must(IsSafeAbsoluteOrRelative)
            .WithMessage("Only http://, https:// or a site-relative /path is allowed.");
}
