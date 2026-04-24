import { ActionIcon, Badge, Button, Group, Stack, Table, Title, Text, Tooltip } from '@mantine/core';
import { IconEdit, IconPlus, IconTrash, IconEye, IconEyeOff } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';

const StatusBadge = ({ published }) =>
  published
    ? <Badge color="green" variant="light" size="sm">Published</Badge>
    : <Badge color="gray" variant="light" size="sm">Draft</Badge>;

export default function AdminDataTable({
  title,
  headerExtras,
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
  minWidth = 700,
  emptyLabel = 'No records.',
}) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: listKey, queryFn });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: listKey });
    if (publicKey) qc.invalidateQueries({ queryKey: publicKey });
  };

  const publishMut = useMutation({
    mutationFn: (id) => publishFn(id),
    onSuccess: invalidate,
  });

  const deleteMut = useMutation({
    mutationFn: (id) => deleteFn(id),
    onSuccess: () => {
      invalidate();
      if (deleteToast) notifications.show({ message: deleteToast, color: 'red' });
    },
  });

  const handleDelete = (row) => {
    const msg = typeof deleteConfirm === 'function' ? deleteConfirm(row) : deleteConfirm;
    if (msg && !window.confirm(msg)) return;
    deleteMut.mutate(row.id);
  };

  const colCount = columns.length + 1; // +1 for Actions column

  const rows = (data ?? []).map((r) => (
    <Table.Tr key={r.id}>
      {columns.map((col, i) => (
        <Table.Td key={col.header ?? i}>{col.render(r)}</Table.Td>
      ))}
      <Table.Td>
        <Group gap={4} wrap="nowrap" justify="flex-end">
          {publishFn && (
            <Tooltip label={r.isPublished ? 'Unpublish' : 'Publish'}>
              <ActionIcon
                variant="subtle"
                color={r.isPublished ? 'yellow' : 'green'}
                onClick={() => publishMut.mutate(r.id)}
                loading={publishMut.isPending && publishMut.variables === r.id}
              >
                {r.isPublished ? <IconEyeOff size={16} /> : <IconEye size={16} />}
              </ActionIcon>
            </Tooltip>
          )}
          <Tooltip label="Edit">
            <ActionIcon variant="subtle" onClick={() => navigate(editPath(r))}>
              <IconEdit size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delete">
            <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(r)}>
              <IconTrash size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={2}>{title}</Title>
        <Group gap="xs">
          {headerExtras}
          {newButton && (
            <Button component={Link} to={newButton.to} leftSection={<IconPlus size={16} />}>
              {newButton.label}
            </Button>
          )}
        </Group>
      </Group>

      <Table.ScrollContainer minWidth={minWidth}>
        <Table highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              {columns.map((col, i) => (
                <Table.Th key={col.header ?? i} ta={col.align}>{col.header}</Table.Th>
              ))}
              <Table.Th ta="right">Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {isLoading ? (
              <Table.Tr><Table.Td colSpan={colCount}><Text ta="center" c="dimmed">Loading…</Text></Table.Td></Table.Tr>
            ) : rows.length === 0 ? (
              <Table.Tr><Table.Td colSpan={colCount}><Text ta="center" c="dimmed">{emptyLabel}</Text></Table.Td></Table.Tr>
            ) : rows}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Stack>
  );
}

export { StatusBadge };
