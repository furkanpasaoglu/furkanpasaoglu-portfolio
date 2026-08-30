using Portfolio.Api.Validators;

namespace Portfolio.Api.Tests;

/// <summary>
/// These lock in the fix for the stored-XSS hole: the old check was
/// <c>Uri.TryCreate(value, UriKind.Absolute, out _)</c>, which accepts
/// <c>javascript:</c> because it really is a valid absolute URI. Anything
/// that reaches an href on the public site must be http(s) or site-relative.
/// </summary>
public class UrlRulesTests
{
    [Theory]
    [InlineData("https://github.com/furkanpasaoglu")]
    [InlineData("http://example.com/x?y=1#z")]
    public void IsSafeAbsolute_accepts_http_urls(string url) =>
        Assert.True(UrlRules.IsSafeAbsolute(url));

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void IsSafeAbsolute_accepts_empty(string? url) =>
        Assert.True(UrlRules.IsSafeAbsolute(url));

    [Theory]
    [InlineData("javascript:alert(1)")]
    [InlineData("JavaScript:alert(1)")]
    [InlineData("  javascript:alert(document.cookie)  ")]
    [InlineData("data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==")]
    [InlineData("vbscript:msgbox(1)")]
    [InlineData("file:///etc/passwd")]
    [InlineData("/media/cv.pdf")]      // relative is not allowed for absolute-only fields
    public void IsSafeAbsolute_rejects_everything_else(string url) =>
        Assert.False(UrlRules.IsSafeAbsolute(url));

    [Theory]
    [InlineData("/media/cv.pdf")]
    [InlineData("/favicon.svg")]
    [InlineData("https://cdn.example.com/og.png")]
    public void IsSafeAbsoluteOrRelative_accepts_paths_and_http(string url) =>
        Assert.True(UrlRules.IsSafeAbsoluteOrRelative(url));

    [Theory]
    [InlineData("javascript:alert(1)")]
    [InlineData("//evil.com/og.png")]   // protocol-relative is off-origin
    [InlineData("/\\evil.com")]          // some browsers normalise this to //
    [InlineData("media/cv.pdf")]         // not rooted, not absolute
    public void IsSafeAbsoluteOrRelative_rejects_unsafe(string url) =>
        Assert.False(UrlRules.IsSafeAbsoluteOrRelative(url));
}
