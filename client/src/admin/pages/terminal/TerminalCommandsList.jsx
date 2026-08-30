import { adminApi } from '../../../api/adminApi';
import AdminDataTable, { StatusBadge } from '../../components/AdminDataTable';
import { When } from '../../components/cells';
import TerminalTexts from './TerminalTexts';

const columns = [
  { header: 'Komut', render: (r) => <span className="fp-mono">{r.name}</span> },
  { header: 'Açıklama', render: (r) => r.summaryTr },
  { header: 'Sıra', render: (r) => <span className="fp-mono">{r.sortOrder}</span> },
  { header: 'Durum', render: (r) => <StatusBadge published={r.isPublished} /> },
  { header: 'Güncelleme', render: (r) => <When value={r.updatedAt} /> },
];

export default function TerminalCommandsList() {
  return (
    <AdminDataTable
      eyebrow="İçerik"
      title="Terminal"
      intro={<TerminalTexts />}
      newButton={{ to: '/admin/terminal/new', label: 'Yeni komut' }}
      listKey={['admin', 'terminal-commands']}
      publicKey={['public', 'terminal-commands']}
      queryFn={() => adminApi.listTerminalCommands()}
      publishFn={(id) => adminApi.publishTerminalCommand(id)}
      deleteFn={(id) => adminApi.deleteTerminalCommand(id)}
      deleteConfirm={(r) => `"${r.name}" komutu kalıcı olarak silinecek.`}
      deleteToast="Komut silindi."
      editPath={(r) => `/admin/terminal/${r.id}`}
      columns={columns}
      emptyLabel="Henüz özel komut yok."
    />
  );
}
