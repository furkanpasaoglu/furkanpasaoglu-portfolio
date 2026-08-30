import { useMutation, useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/adminApi';
import { Button, PageHead } from '../ui';
import { useToast } from '../ui/hooks';

/**
 * Özet. Two blocks: what the server is doing right now, and how much
 * content there is. Every value is read from the API — nothing decorative.
 */

function formatBytes(n) {
  if (!n) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  let v = n;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i += 1; }
  return `${v.toFixed(v >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

function formatUptime(seconds) {
  if (!seconds || seconds < 0) return '—';
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const parts = [];
  if (d) parts.push(`${d}g`);
  if (h || d) parts.push(`${h}s`);
  parts.push(`${m}d`);
  if (!d && !h) parts.push(`${s}sn`);
  return parts.join(' ');
}

function Cell({ label, value, sub }) {
  return (
    <div className="fp-panel">
      <p className="fp-panel-title">{label}</p>
      <div className="fp-stat">{value}</div>
      {sub && <p className="fp-hint">{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const toast = useToast();
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin', 'system-info'],
    queryFn: () => adminApi.getSystemInfo(),
    refetchInterval: 30_000,
  });

  const clearMut = useMutation({
    mutationFn: () => adminApi.clearSystemCache(),
    onSuccess: () => {
      refetch();
      toast('Önbellek temizlendi, site yeniden üretildi.', 'ok');
    },
    onError: (e) => toast(e?.message ?? 'İşlem başarısız.', 'err'),
  });

  const counts = data?.counts ?? {};
  const fmtDate = (v) => (v ? new Date(v).toLocaleString('tr-TR') : '—');

  return (
    <>
      <PageHead eyebrow="Sistem" title="Özet">
        <Button variant="primary" busy={clearMut.isPending} onClick={() => clearMut.mutate()}>
          Önbelleği temizle + yeniden üret
        </Button>
      </PageHead>

      {isLoading && <p className="fp-loading">Sistem bilgisi okunuyor…</p>}

      {!isLoading && (
        <>
          <div className="fp-eyebrow">Sunucu</div>
          <div className="fp-grid fp-grid-cells">
            <Cell
              label="Sürüm"
              value={data?.version ?? '—'}
              sub={(data?.gitSha ?? 'unknown').slice(0, 12)}
            />
            <Cell
              label="Çalışma süresi"
              value={formatUptime(data?.uptimeSeconds)}
              sub={`Başlangıç: ${fmtDate(data?.startedAt)}`}
            />
            <Cell
              label="Ortam"
              value={data?.environment ?? '—'}
              sub={data?.dotnetVersion ?? ''}
            />
            <Cell label="Derleme" value={fmtDate(data?.buildTime)} />
            <Cell label="Son migration" value={data?.lastMigration ?? '—'} />
            <Cell label="Yükleme klasörü" value={formatBytes(data?.uploadsSizeBytes)} />
          </div>

          <div className="fp-eyebrow fp-eyebrow-gap">İçerik</div>
          <div className="fp-grid fp-grid-cells">
            <Cell label="Projeler" value={counts.projects ?? 0} />
            <Cell label="Notlar" value={counts.blogPosts ?? 0} />
            <Cell label="Geçmiş" value={counts.experiences ?? 0} />
            <Cell label="Yetkinlik grubu" value={counts.skillCategories ?? 0} />
            <Cell
              label="Mesajlar"
              value={counts.contactMessages ?? 0}
              sub={counts.unreadMessages > 0 ? `${counts.unreadMessages} okunmamış` : undefined}
            />
          </div>
        </>
      )}
    </>
  );
}
