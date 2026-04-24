using System.Text.Json;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using MimeKit;
using Portfolio.Api.Contracts.SiteSettings;
using Portfolio.Api.Data;

namespace Portfolio.Api.Services;

public interface IEmailSender
{
    /// <summary>Sends mail using stored SMTP config. Returns false if SMTP is disabled/unconfigured.</summary>
    Task<bool> SendAsync(string to, string subject, string body, CancellationToken ct = default);

    /// <summary>Sends a test mail with the given (unsaved) config. Throws on failure.</summary>
    Task SendWithConfigAsync(SmtpConfigDto cfg, string to, string subject, string body, CancellationToken ct = default);
}

public class SmtpEmailSender(AppDbContext db, IMemoryCache cache, ILogger<SmtpEmailSender> log) : IEmailSender
{
    private const string CacheKey = "site-settings:smtp-config";
    private static readonly TimeSpan CacheTtl = TimeSpan.FromSeconds(30);

    public async Task<bool> SendAsync(string to, string subject, string body, CancellationToken ct = default)
    {
        var cfg = await cache.GetOrCreateAsync(CacheKey, async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = CacheTtl;
            var row = await db.SiteSettings.AsNoTracking().FirstOrDefaultAsync(ct);
            if (row is null || row.CommunicationsJson.ValueKind != JsonValueKind.Object) return null;
            return row.CommunicationsJson.TryGetProperty("smtp", out var smtp)
                ? smtp.Deserialize<SmtpConfigDto>(new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase })
                : null;
        });

        if (cfg is null || !cfg.Enabled || string.IsNullOrWhiteSpace(cfg.Host) || string.IsNullOrWhiteSpace(cfg.FromAddress))
        {
            log.LogWarning("SMTP not configured; skipping mail to {To}", to);
            return false;
        }

        await SendWithConfigAsync(cfg, to, subject, body, ct);
        return true;
    }

    public async Task SendWithConfigAsync(SmtpConfigDto cfg, string to, string subject, string body, CancellationToken ct = default)
    {
        var msg = new MimeMessage();
        msg.From.Add(new MailboxAddress(cfg.FromName ?? "", cfg.FromAddress));
        msg.To.Add(MailboxAddress.Parse(to));
        msg.Subject = subject;
        msg.Body = new TextPart("plain") { Text = body };

        using var client = new SmtpClient();
        var secureOption = cfg.UseStartTls ? SecureSocketOptions.StartTls : SecureSocketOptions.Auto;
        await client.ConnectAsync(cfg.Host, cfg.Port, secureOption, ct);
        if (!string.IsNullOrWhiteSpace(cfg.Username))
        {
            await client.AuthenticateAsync(cfg.Username, cfg.Password, ct);
        }
        await client.SendAsync(msg, ct);
        await client.DisconnectAsync(true, ct);
        log.LogInformation("Sent mail to {To} via {Host}", to, cfg.Host);
    }
}
