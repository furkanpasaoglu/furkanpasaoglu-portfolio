using Microsoft.EntityFrameworkCore;
using Portfolio.Api.Data;

namespace Portfolio.Api.Services;

/// <summary>Deletes contact messages older than RetentionDays, once a day.</summary>
public class MessageCleanupService(IServiceProvider sp, IConfiguration cfg, ILogger<MessageCleanupService> log) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        var retentionDays = cfg.GetValue("Contact:RetentionDays", 90);
        var interval = TimeSpan.FromHours(24);

        while (!ct.IsCancellationRequested)
        {
            try
            {
                using var scope = sp.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var cutoff = DateTime.UtcNow - TimeSpan.FromDays(retentionDays);
                var deleted = await db.ContactMessages
                    .Where(m => m.CreatedAt < cutoff)
                    .ExecuteDeleteAsync(ct);
                if (deleted > 0) log.LogInformation("Deleted {Count} contact messages older than {Days} days.", deleted, retentionDays);
            }
            catch (Exception ex) when (!ct.IsCancellationRequested)
            {
                log.LogError(ex, "Message cleanup failed; will retry next cycle.");
            }

            try { await Task.Delay(interval, ct); } catch (TaskCanceledException) { break; }
        }
    }
}
