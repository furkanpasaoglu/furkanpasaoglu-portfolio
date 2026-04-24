namespace Portfolio.Api.Services;

/// <summary>
/// On app start: ensure web-static volume has at least the seed files so nginx never serves 404
/// between container boot and first admin save.
/// </summary>
public class SiteRendererBootstrap(IServiceProvider sp, ILogger<SiteRendererBootstrap> log) : IHostedService
{
    public async Task StartAsync(CancellationToken ct)
    {
        using var scope = sp.CreateScope();
        var renderer = scope.ServiceProvider.GetRequiredService<ISiteRenderer>();
        try
        {
            await renderer.SeedFromTemplatesIfEmptyAsync(ct);
        }
        catch (Exception ex)
        {
            log.LogError(ex, "SiteRenderer bootstrap failed (non-fatal).");
        }
    }

    public Task StopAsync(CancellationToken ct) => Task.CompletedTask;
}
