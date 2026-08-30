using System.Text.Json;
using Portfolio.Api.Domain;

namespace Portfolio.Api.Contracts.Blog;

public record BlogPostPublicDto(
    int Id,
    string Slug,
    int SortOrder,
    bool IsFeatured,
    string Category,
    string Color,
    DateOnly? PublishedAt,
    List<string> Tags,
    string Title,
    string Excerpt,
    string Date,
    int ReadTime,
    JsonElement? Content); // null for list view, populated for detail

public record BlogPostAdminDto(
    int Id,
    string Slug,
    int SortOrder,
    bool IsFeatured,
    bool IsPublished,
    string Category,
    string Color,
    DateOnly? PublishedAt,
    List<string> Tags,
    BlogPostLocale DataTr,
    BlogPostLocale DataEn,
    JsonElement ContentTr,
    JsonElement ContentEn,
    DateTime UpdatedAt);

public record BlogPostListItemDto(
    int Id,
    string Slug,
    int SortOrder,
    bool IsFeatured,
    bool IsPublished,
    string Category,
    string Color,
    string TitleTr,
    string TitleEn,
    DateTime UpdatedAt);

public record BlogPostUpsertDto(
    string Slug,
    int SortOrder,
    bool IsFeatured,
    bool IsPublished,
    string Category,
    string Color,
    DateOnly? PublishedAt,
    List<string> Tags,
    BlogPostLocale DataTr,
    BlogPostLocale DataEn,
    JsonElement ContentTr,
    JsonElement ContentEn);
