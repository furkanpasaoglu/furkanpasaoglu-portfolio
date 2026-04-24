namespace Portfolio.Api.Common;

public static class LangHelpers
{
    public const string Tr = "tr";
    public const string En = "en";

    public static string Normalize(string? lang) =>
        string.Equals(lang, Tr, StringComparison.OrdinalIgnoreCase) ? Tr : En;

    public static T PickLocale<T>(string lang, T tr, T en) =>
        lang == Tr ? tr : en;
}
