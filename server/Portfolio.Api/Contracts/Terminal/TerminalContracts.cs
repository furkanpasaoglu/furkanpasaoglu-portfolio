using Portfolio.Api.Domain;

namespace Portfolio.Api.Contracts.Terminal;

public record TerminalCommandPublicDto(
    string Name,
    string Summary,
    string Body);

public record TerminalCommandAdminDto(
    int Id,
    string Name,
    int SortOrder,
    bool IsPublished,
    TerminalCommandLocale DataTr,
    TerminalCommandLocale DataEn,
    DateTime UpdatedAt);

public record TerminalCommandListItemDto(
    int Id,
    string Name,
    int SortOrder,
    bool IsPublished,
    string SummaryTr,
    DateTime UpdatedAt);

public record TerminalCommandUpsertDto(
    string Name,
    int SortOrder,
    bool IsPublished,
    TerminalCommandLocale DataTr,
    TerminalCommandLocale DataEn);
