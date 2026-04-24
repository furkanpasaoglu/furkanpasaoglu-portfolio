import { Badge, ColorSwatch, Group, Stack, Text } from '@mantine/core';
import { adminApi } from '../../../api/adminApi';
import AdminDataTable, { StatusBadge } from '../../components/AdminDataTable';

const columns = [
  { header: 'Slug', render: (r) => (
    <Group gap="xs" wrap="nowrap">
      <ColorSwatch color={r.color} size={14} />
      <Text size="sm" ff="monospace">{r.slug}</Text>
    </Group>
  ) },
  { header: 'Title', render: (r) => (
    <Stack gap={2}>
      <Text size="sm" fw={500} truncate>{r.titleEn}</Text>
      <Text size="xs" c="dimmed" truncate>{r.titleTr}</Text>
    </Stack>
  ) },
  { header: 'Type', render: (r) => <Badge variant="light" size="sm">{r.typeKey}</Badge> },
  { header: 'Status', render: (r) => <StatusBadge published={r.isPublished} /> },
  { header: 'Updated', render: (r) => <Text size="xs" c="dimmed">{new Date(r.updatedAt).toLocaleDateString()}</Text> },
];

export default function ProjectsList() {
  return (
    <AdminDataTable
      title="Projects"
      newButton={{ to: '/admin/projects/new', label: 'New project' }}
      listKey={['admin', 'projects']}
      publicKey={['public', 'projects']}
      queryFn={() => adminApi.listProjects()}
      publishFn={(id) => adminApi.publishProject(id)}
      deleteFn={(id) => adminApi.deleteProject(id)}
      deleteConfirm={(r) => `Delete project "${r.titleEn}"?`}
      deleteToast="Project deleted"
      editPath={(r) => `/admin/projects/${r.id}`}
      columns={columns}
      emptyLabel="No projects."
    />
  );
}
