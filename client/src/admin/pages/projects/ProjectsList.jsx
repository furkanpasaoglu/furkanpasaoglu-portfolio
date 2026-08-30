import { adminApi } from '../../../api/adminApi';
import AdminDataTable, { StatusBadge } from '../../components/AdminDataTable';
import { Bilingual, Swatch, When } from '../../components/cells';

const columns = [
  {
    header: 'Slug',
    render: (r) => (
      <span className="fp-inline">
        <Swatch color={r.color} />
        <span className="fp-mono">{r.slug}</span>
      </span>
    ),
  },
  { header: 'Başlık', render: (r) => <Bilingual en={r.titleEn} tr={r.titleTr} /> },
  { header: 'Tür', render: (r) => <span className="fp-chip">{r.typeKey}</span> },
  { header: 'Durum', render: (r) => <StatusBadge published={r.isPublished} /> },
  { header: 'Güncelleme', render: (r) => <When value={r.updatedAt} /> },
];

export default function ProjectsList() {
  return (
    <AdminDataTable
      eyebrow="İçerik"
      title="Projeler"
      newButton={{ to: '/admin/projects/new', label: 'Yeni proje' }}
      listKey={['admin', 'projects']}
      publicKey={['public', 'projects']}
      queryFn={() => adminApi.listProjects()}
      publishFn={(id) => adminApi.publishProject(id)}
      deleteFn={(id) => adminApi.deleteProject(id)}
      deleteConfirm={(r) => `"${r.titleEn || r.titleTr}" projesi kalıcı olarak silinecek.`}
      deleteToast="Proje silindi."
      editPath={(r) => `/admin/projects/${r.id}`}
      columns={columns}
      emptyLabel="Henüz proje yok."
    />
  );
}
