using Portfolio.Api.Domain;

namespace Portfolio.Api.Contracts.Experience;

public record ExperiencePublicDto(
    int Id,
    int SortOrder,
    bool IsEducation,
    string Period,
    List<string> Tech,
    string Title,
    string Company,
    string Type,
    string Desc,
    List<string> Highlights);

public record ExperienceAdminDto(
    int Id,
    int SortOrder,
    bool IsEducation,
    string Period,
    bool IsPublished,
    List<string> Tech,
    ExperienceLocale DataTr,
    ExperienceLocale DataEn,
    DateTime UpdatedAt);

public record ExperienceListItemDto(
    int Id,
    int SortOrder,
    bool IsEducation,
    string Period,
    bool IsPublished,
    string TitleTr,
    string TitleEn,
    DateTime UpdatedAt);

public record ExperienceUpsertDto(
    int SortOrder,
    bool IsEducation,
    string Period,
    bool IsPublished,
    List<string> Tech,
    ExperienceLocale DataTr,
    ExperienceLocale DataEn);
