import { adminApi } from '../../../api/adminApi';
import AdminDataTable, { StatusBadge } from '../../components/AdminDataTable';
import { Bilingual, When } from '../../components/cells';

const columns = [
  { header: 'Simge', render: (r) => <span className="fp-mono">{r.icon}</span> },
  { header: 'Başlık', render: (r) => <Bilingual en={r.titleEn} tr={r.titleTr} /> },
  { header: 'Kalem', render: (r) => r.skills?.length ?? 0, align: 'right' },
  { header: 'Durum', render: (r) => <StatusBadge published={r.isPublished} /> },
  { header: 'Güncelleme', render: (r) => <When value={r.updatedAt} /> },
];

export default function SkillsList() {
  return (
    <AdminDataTable
      eyebrow="İçerik"
      title="Yetkinlik"
      newButton={{ to: '/admin/skills/new', label: 'Yeni grup' }}
      listKey={['admin', 'skills']}
      publicKey={['public', 'skills']}
      queryFn={() => adminApi.listSkillCategories()}
      deleteFn={(id) => adminApi.deleteSkillCategory(id)}
      deleteConfirm={(r) => `"${r.titleEn || r.titleTr}" grubu ve içindeki kalemler silinecek.`}
      deleteToast="Grup silindi."
      editPath={(r) => `/admin/skills/${r.id}`}
      columns={columns}
      emptyLabel="Henüz grup yok."
    />
  );
}
