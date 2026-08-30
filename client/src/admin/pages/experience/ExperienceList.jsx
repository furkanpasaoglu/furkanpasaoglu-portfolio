import { adminApi } from '../../../api/adminApi';
import AdminDataTable, { StatusBadge } from '../../components/AdminDataTable';
import { Bilingual, When } from '../../components/cells';

const columns = [
  {
    header: 'Tür',
    render: (r) => <span className="fp-chip">{r.isEducation ? 'Eğitim' : 'İş'}</span>,
  },
  { header: 'Başlık', render: (r) => <Bilingual en={r.titleEn} tr={r.titleTr} /> },
  { header: 'Dönem', render: (r) => <span className="fp-mono">{r.period}</span> },
  { header: 'Durum', render: (r) => <StatusBadge published={r.isPublished} /> },
  { header: 'Güncelleme', render: (r) => <When value={r.updatedAt} /> },
];

export default function ExperienceList() {
  return (
    <AdminDataTable
      eyebrow="İçerik"
      title="Geçmiş"
      newButton={{ to: '/admin/experience/new', label: 'Yeni kayıt' }}
      listKey={['admin', 'experience']}
      publicKey={['public', 'experience']}
      queryFn={() => adminApi.listExperience()}
      publishFn={(id) => adminApi.publishExperience(id)}
      deleteFn={(id) => adminApi.deleteExperience(id)}
      deleteConfirm={(r) => `"${r.titleEn || r.titleTr}" kaydı kalıcı olarak silinecek.`}
      deleteToast="Kayıt silindi."
      editPath={(r) => `/admin/experience/${r.id}`}
      columns={columns}
      emptyLabel="Henüz kayıt yok."
    />
  );
}
