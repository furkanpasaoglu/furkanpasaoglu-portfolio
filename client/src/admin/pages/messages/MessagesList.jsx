import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../../api/adminApi';
import { Button, Confirm, PageHead, Pill } from '../../ui';
import { useConfirm, useToast } from '../../ui/hooks';

const formatDate = (iso) => {
  try { return new Date(iso).toLocaleString('tr-TR'); } catch { return iso; }
};

export default function MessagesList() {
  const qc = useQueryClient();
  const toast = useToast();
  const confirm = useConfirm();
  const [openId, setOpenId] = useState(null);

  const { data: list, isLoading } = useQuery({
    queryKey: ['admin', 'messages'],
    queryFn: () => adminApi.listMessages(),
  });

  const { data: selected } = useQuery({
    queryKey: ['admin', 'messages', openId],
    queryFn: () => adminApi.getMessage(openId),
    enabled: openId != null,
  });

  const toggleRead = useMutation({
    mutationFn: (id) => adminApi.toggleMessageRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'messages'] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => adminApi.deleteMessage(id),
    onSuccess: () => {
      setOpenId(null);
      qc.invalidateQueries({ queryKey: ['admin', 'messages'] });
      toast('Mesaj silindi.', 'ok');
    },
    onError: (e) => toast(e?.message ?? 'Silinemedi.', 'err'),
  });

  const rows = list ?? [];
  const unread = rows.filter((m) => !m.isRead).length;

  return (
    <>
      <PageHead eyebrow="Gelen kutusu" title="Mesajlar">
        <Pill on={unread > 0}>{unread} okunmamış</Pill>
      </PageHead>

      <div className="fp-table-wrap">
        <table className="fp-table">
          <thead>
            <tr>
              <th>Tarih</th>
              <th>Gönderen</th>
              <th>Önizleme</th>
              <th>Dil</th>
              <th className="fp-right">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={5}><div className="fp-empty">Yükleniyor…</div></td></tr>}
            {!isLoading && rows.length === 0 && (
              <tr><td colSpan={5}><div className="fp-empty">Henüz mesaj yok.</div></td></tr>
            )}
            {rows.map((m) => (
              <tr key={m.id} className={m.isRead ? undefined : 'fp-row-unread'}>
                <td><span className="fp-cellmuted">{formatDate(m.createdAt)}</span></td>
                <td>
                  <span className="fp-two">
                    <span className="fp-two-a">{m.name}</span>
                    <span className="fp-two-b">{m.email}</span>
                  </span>
                </td>
                <td><span className="fp-clamp">{m.preview}</span></td>
                <td><span className="fp-chip">{m.lang?.toUpperCase()}</span></td>
                <td className="fp-right">
                  <div className="fp-btns fp-row-actions">
                    <Button variant="quiet" onClick={() => setOpenId(m.id)}>Aç</Button>
                    <Button variant="quiet" onClick={() => toggleRead.mutate(m.id)}>
                      {m.isRead ? 'Okunmadı' : 'Okundu'}
                    </Button>
                    <Button variant="quiet" onClick={() => confirm.ask(m)}>Sil</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {openId != null && selected && (
        <div className="fp-scrim" role="dialog" aria-modal="true" onMouseDown={(e) => { if (e.target === e.currentTarget) setOpenId(null); }}>
          <div className="fp-modal fp-modal-wide">
            <div className="fp-eyebrow">{formatDate(selected.createdAt)}</div>
            <h2 className="fp-modal-title">{selected.name}</h2>
            <p className="fp-msg-from">
              <a className="fp-link" href={`mailto:${selected.email}`}>{selected.email}</a>
              <span className="fp-chip">{selected.lang?.toUpperCase()}</span>
            </p>

            <div className="fp-msg-body">{selected.message}</div>

            <div className="fp-modal-btns">
              <Button onClick={() => setOpenId(null)}>Kapat</Button>
              <Button onClick={() => toggleRead.mutate(selected.id)}>
                {selected.isRead ? 'Okunmadı işaretle' : 'Okundu işaretle'}
              </Button>
              <a className="fp-btn fp-btn-primary" href={`mailto:${selected.email}`}>Yanıtla</a>
            </div>
          </div>
        </div>
      )}

      <Confirm
        open={!!confirm.pending}
        title="Mesaj silinsin mi?"
        body={confirm.pending ? `${confirm.pending.name} tarafından gönderilen mesaj kalıcı olarak silinecek.` : ''}
        onCancel={confirm.cancel}
        onConfirm={() => {
          const row = confirm.pending;
          confirm.cancel();
          if (row) deleteMut.mutate(row.id);
        }}
      />
    </>
  );
}
