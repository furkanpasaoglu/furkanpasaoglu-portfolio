using Portfolio.Api.Domain;

namespace Portfolio.Api.Contracts.Skills;

public record SkillCategoryPublicDto(
    int Id,
    int SortOrder,
    string Icon,
    string Title,
    List<SkillItem> Skills);

public record SkillCategoryAdminDto(
    int Id,
    int SortOrder,
    string Icon,
    string TitleTr,
    string TitleEn,
    bool IsPublished,
    List<SkillItem> Skills,
    DateTime UpdatedAt);

public record SkillCategoryUpsertDto(
    int SortOrder,
    string Icon,
    string TitleTr,
    string TitleEn,
    bool IsPublished,
    List<SkillItem> Skills);
