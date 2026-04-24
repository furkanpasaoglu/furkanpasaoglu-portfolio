import { Badge, ColorSwatch, Group, Stack, Text } from '@mantine/core';
import { IconStar, IconStarFilled } from '@tabler/icons-react';
import { adminApi } from '../../../api/adminApi';
import AdminDataTable, { StatusBadge } from '../../components/AdminDataTable';

const columns = [
  { header: 'Slug', render: (r) => (
    <Group gap="xs" wrap="nowrap">
      <ColorSwatch color={r.color} size={14} />
      <Text size="sm" ff="monospace" truncate>{r.slug}</Text>
    </Group>
  ) },
  { header: 'Title', render: (r) => (
    <Stack gap={2}>
      <Group gap={4} wrap="nowrap">
        {r.isFeatured && <IconStarFilled size={12} color="#f59e0b" />}
        <Text size="sm" fw={500} truncate>{r.titleEn}</Text>
      </Group>
      <Text size="xs" c="dimmed" truncate>{r.titleTr}</Text>
    </Stack>
  ) },
  { header: 'Category', render: (r) => <Badge variant="light" size="sm">{r.category}</Badge> },
  { header: 'Status', render: (r) => <StatusBadge published={r.isPublished} /> },
  { header: 'Updated', render: (r) => <Text size="xs" c="dimmed">{new Date(r.updatedAt).toLocaleDateString()}</Text> },
];

const featuredLegend = (
  <Group gap="xs">
    <IconStar size={14} color="#f59e0b" />
    <Text size="xs" c="dimmed">= featured</Text>
  </Group>
);

export default function BlogList() {
  return (
    <AdminDataTable
      title="Blog"
      headerExtras={featuredLegend}
      newButton={{ to: '/admin/blog/new', label: 'New post' }}
      listKey={['admin', 'blog']}
      publicKey={['public', 'blog']}
      queryFn={() => adminApi.listBlog()}
      publishFn={(id) => adminApi.publishBlog(id)}
      deleteFn={(id) => adminApi.deleteBlog(id)}
      deleteConfirm={(r) => `Delete post "${r.titleEn}"?`}
      deleteToast="Post deleted"
      editPath={(r) => `/admin/blog/${r.id}`}
      columns={columns}
      minWidth={800}
      emptyLabel="No posts."
    />
  );
}
