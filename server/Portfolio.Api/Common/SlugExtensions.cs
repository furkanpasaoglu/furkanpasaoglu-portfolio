using Microsoft.EntityFrameworkCore;
using Portfolio.Api.Domain;

namespace Portfolio.Api.Common;

public static class SlugExtensions
{
    public static Task<bool> IsSlugTakenAsync<T>(
        this IQueryable<T> source,
        string slug,
        int? excludeId,
        CancellationToken ct) where T : class, ISluggable
    {
        return excludeId.HasValue
            ? source.AnyAsync(x => x.Slug == slug && x.Id != excludeId.Value, ct)
            : source.AnyAsync(x => x.Slug == slug, ct);
    }
}
