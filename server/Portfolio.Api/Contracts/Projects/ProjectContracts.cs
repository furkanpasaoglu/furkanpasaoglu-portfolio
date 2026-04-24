using Portfolio.Api.Domain;

namespace Portfolio.Api.Contracts.Projects;

// ── Public (language-projected) ──────────────────────────────────────
public record ProjectPublicDto(
    int Id,
    string Slug,
    string Color,
    string TypeKey,
    string? Github,
    string? Live,
    List<string> Tags,
    string Title,
    string ShortDesc,
    string LongDesc,
    string Status,
    string? Client,
    List<string> Highlights);

// ── Admin (both locales) ─────────────────────────────────────────────
public record ProjectAdminDto(
    int Id,
    string Slug,
    int SortOrder,
    bool IsPublished,
    string Color,
    string TypeKey,
    string? Github,
    string? Live,
    List<string> Tags,
    ProjectLocale DataTr,
    ProjectLocale DataEn,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public record ProjectListItemDto(
    int Id,
    string Slug,
    int SortOrder,
    bool IsPublished,
    string Color,
    string TypeKey,
    string TitleTr,
    string TitleEn,
    DateTime UpdatedAt);

public record ProjectUpsertDto(
    string Slug,
    int SortOrder,
    bool IsPublished,
    string Color,
    string TypeKey,
    string? Github,
    string? Live,
    List<string> Tags,
    ProjectLocale DataTr,
    ProjectLocale DataEn);

public record ReorderItem(int Id, int SortOrder);
