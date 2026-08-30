namespace Portfolio.Api.Domain;

/// <summary>
/// A command the terminal answers to beyond the built-in ones.
///
/// <para>
/// Navigation (<c>cd</c>, <c>ls</c>) and the utilities (<c>lang</c>,
/// <c>open</c>, <c>clear</c>) stay in the client: they do something. These
/// are the ones that only say something, so they are content — writable
/// without a deploy.
/// </para>
/// </summary>
public class TerminalCommand
{
    public int Id { get; set; }

    /// <summary>What gets typed. One lowercase token; see TerminalRules.</summary>
    public string Name { get; set; } = string.Empty;

    public int SortOrder { get; set; }
    public bool IsPublished { get; set; }

    // JSONB
    public TerminalCommandLocale DataTr { get; set; } = new();
    public TerminalCommandLocale DataEn { get; set; } = new();

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class TerminalCommandLocale
{
    /// <summary>The one-liner `help` prints next to the name.</summary>
    public string Summary { get; set; } = string.Empty;

    /// <summary>What the command prints. Each line becomes one log line.</summary>
    public string Body { get; set; } = string.Empty;
}
