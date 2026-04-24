import { Badge, Stack, Text } from '@mantine/core';
import { IconSchool, IconBriefcase } from '@tabler/icons-react';
import { adminApi } from '../../../api/adminApi';
import AdminDataTable, { StatusBadge } from '../../components/AdminDataTable';

const columns = [
  { header: 'Kind', render: (r) => (
    r.isEducation
      ? <Badge variant="light" color="violet" leftSection={<IconSchool size={12} />}>Education</Badge>
      : <Badge variant="light" color="blue" leftSection={<IconBriefcase size={12} />}>Work</Badge>
  ) },
  { header: 'Title', render: (r) => (
    <Stack gap={2}>
      <Text size="sm" fw={500} truncate>{r.titleEn}</Text>
      <Text size="xs" c="dimmed" truncate>{r.titleTr}</Text>
    </Stack>
  ) },
  { header: 'Period', render: (r) => <Text size="sm" ff="monospace">{r.period}</Text> },
  { header: 'Status', render: (r) => <StatusBadge published={r.isPublished} /> },
  { header: 'Updated', render: (r) => <Text size="xs" c="dimmed">{new Date(r.updatedAt).toLocaleDateString()}</Text> },
];

export default function ExperienceList() {
  return (
    <AdminDataTable
      title="Experience"
      newButton={{ to: '/admin/experience/new', label: 'New entry' }}
      listKey={['admin', 'experience']}
      publicKey={['public', 'experience']}
      queryFn={() => adminApi.listExperience()}
      publishFn={(id) => adminApi.publishExperience(id)}
      deleteFn={(id) => adminApi.deleteExperience(id)}
      deleteConfirm={(r) => `Delete experience "${r.titleEn}"?`}
      deleteToast="Experience deleted"
      editPath={(r) => `/admin/experience/${r.id}`}
      columns={columns}
      emptyLabel="No entries."
    />
  );
}
