import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Confirm, PageHead, Pill } from '../ui';
import { useConfirm, useToast } from '../ui/hooks';

/**
 * The shared list surface. Same contract as before so every list page keeps
 * working; only the rendering changed.
 *
 * `intro` renders between the header and the table, for a page that carries
 * a setting alongside its list.
 */
export default function AdminDataTable({
  title,
  eyebrow,
  headerExtras,
  intro,
  newButton,
  listKey,
  publicKey,
  queryFn,
  publishFn,
  deleteFn,
  deleteConfirm,
  deleteToast,
  editPath,
  columns,
  emptyLabel = 'Kayıt yok.',
}) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const toast = useToast();
  const confirm = useConfirm();
  const { data, isLoading } = useQuery({ queryKey: listKey, queryFn });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: listKey });
    if (publicKey) qc.invalidateQueries({ queryKey: publicKey });
  };

  const publishMut = useMutation({
    mutationFn: (id) => publishFn(id),
    onSuccess: invalidate,
    onError: () => toast('Yayın durumu değiştirilemedi.', 'err'),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => deleteFn(id),
    onSuccess: () => {
      invalidate();
      toast(deleteToast ?? 'Kayıt silindi.', 'ok');
    },
    onError: () => toast('Kayıt silinemedi.', 'err'),
  });

  const rows = data ?? [];
  const colCount = columns.length + 1;

  return (
    <>
      <PageHead eyebrow={eyebrow} title={title}>
        {headerExtras}
        {newButton && (
          <Link className="fp-btn fp-btn-primary" to={newButton.to}>{newButton.label}</Link>
        )}
      </PageHead>

      {intro}

      <div className="fp-table-wrap">
        <table className="fp-table">
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th key={col.header ?? i} className={col.align === 'right' ? 'fp-right' : undefined}>
                  {col.header}
                </th>
              ))}
              <th className="fp-right">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={colCount}><div className="fp-empty">Yükleniyor…</div></td></tr>
            )}
            {!isLoading && rows.length === 0 && (
              <tr><td colSpan={colCount}><div className="fp-empty">{emptyLabel}</div></td></tr>
            )}
            {!isLoading && rows.map((r) => (
              <tr key={r.id}>
                {columns.map((col, i) => (
                  <td key={col.header ?? i} className={col.align === 'right' ? 'fp-right' : undefined}>
                    {col.render(r)}
                  </td>
                ))}
                <td className="fp-right">
                  <div className="fp-btns fp-row-actions">
                    {publishFn && (
                      <Button
                        variant="quiet"
                        busy={publishMut.isPending && publishMut.variables === r.id}
                        onClick={() => publishMut.mutate(r.id)}
                        title={r.isPublished ? 'Yayından kaldır' : 'Yayımla'}
                      >
                        {r.isPublished ? 'Gizle' : 'Yayımla'}
                      </Button>
                    )}
                    <Button variant="quiet" onClick={() => navigate(editPath(r))}>Düzenle</Button>
                    <Button variant="quiet" onClick={() => confirm.ask(r)}>Sil</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Confirm
        open={!!confirm.pending}
        title="Silinsin mi?"
        body={
          confirm.pending
            ? (typeof deleteConfirm === 'function'
              ? deleteConfirm(confirm.pending)
              : (deleteConfirm ?? 'Bu kayıt kalıcı olarak silinecek.'))
            : ''
        }
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

export function StatusBadge({ published }) {
  return <Pill on={published}>{published ? 'Yayında' : 'Taslak'}</Pill>;
}
