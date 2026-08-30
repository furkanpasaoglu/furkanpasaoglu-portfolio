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
  {
    header: 'Başlık',
    render: (r) => (
      <span className="fp-inline">
        {r.isFeatured && <span className="fp-star" title="Öne çıkan">★</span>}
        <Bilingual en={r.titleEn} tr={r.titleTr} />
      </span>
    ),
  },
  { header: 'Kategori', render: (r) => <span className="fp-chip">{r.category}</span> },
  { header: 'Durum', render: (r) => <StatusBadge published={r.isPublished} /> },
  { header: 'Güncelleme', render: (r) => <When value={r.updatedAt} /> },
];

export default function BlogList() {
  return (
    <AdminDataTable
      eyebrow="İçerik"
      title="Notlar"
      headerExtras={<span className="fp-legend-note"><span className="fp-star">★</span> öne çıkan</span>}
      newButton={{ to: '/admin/blog/new', label: 'Yeni not' }}
      listKey={['admin', 'blog']}
      publicKey={['public', 'blog']}
      queryFn={() => adminApi.listBlog()}
      publishFn={(id) => adminApi.publishBlog(id)}
      deleteFn={(id) => adminApi.deleteBlog(id)}
      deleteConfirm={(r) => `"${r.titleEn || r.titleTr}" notu kalıcı olarak silinecek.`}
      deleteToast="Not silindi."
      editPath={(r) => `/admin/blog/${r.id}`}
      columns={columns}
      emptyLabel="Henüz not yok."
    />
  );
}
