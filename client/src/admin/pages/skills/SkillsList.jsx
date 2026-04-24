import { Stack, Text } from '@mantine/core';
import { adminApi } from '../../../api/adminApi';
import AdminDataTable, { StatusBadge } from '../../components/AdminDataTable';

const columns = [
  { header: 'Icon', render: (r) => <Text ff="monospace" size="sm">{r.icon}</Text> },
  { header: 'Title', render: (r) => (
    <Stack gap={2}>
      <Text size="sm" fw={500}>{r.titleEn}</Text>
      <Text size="xs" c="dimmed">{r.titleTr}</Text>
    </Stack>
  ) },
  { header: 'Skills', render: (r) => <Text size="sm">{r.skills?.length ?? 0}</Text> },
  { header: 'Status', render: (r) => <StatusBadge published={r.isPublished} /> },
  { header: 'Updated', render: (r) => <Text size="xs" c="dimmed">{new Date(r.updatedAt).toLocaleDateString()}</Text> },
];

export default function SkillsList() {
  return (
    <AdminDataTable
      title="Skill categories"
      newButton={{ to: '/admin/skills/new', label: 'New category' }}
      listKey={['admin', 'skills']}
      publicKey={['public', 'skills']}
      queryFn={() => adminApi.listSkillCategories()}
      deleteFn={(id) => adminApi.deleteSkillCategory(id)}
      deleteConfirm={(r) => `Delete category "${r.titleEn}"?`}
      deleteToast="Category deleted"
      editPath={(r) => `/admin/skills/${r.id}`}
      columns={columns}
      emptyLabel="No categories."
    />
  );
}
