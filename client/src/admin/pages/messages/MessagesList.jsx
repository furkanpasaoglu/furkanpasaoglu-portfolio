import {
  ActionIcon, Badge, Button, Drawer, Group, LoadingOverlay, Paper, Stack, Table, Text, Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconEye, IconMail, IconMailOpened, IconTrash } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { adminApi } from '../../../api/adminApi';

function formatDate(iso) {
  try { return new Date(iso).toLocaleString(); } catch { return iso; }
}

export default function MessagesList() {
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState(null);

  const { data: list, isLoading } = useQuery({
    queryKey: ['admin', 'messages'],
    queryFn: () => adminApi.listMessages(),
  });

  const { data: selected } = useQuery({
    queryKey: ['admin', 'messages', selectedId],
    queryFn: () => adminApi.getMessage(selectedId),
    enabled: selectedId != null,
  });

  const toggleRead = useMutation({
    mutationFn: (id) => adminApi.toggleMessageRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'messages'] });
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => adminApi.deleteMessage(id),
    onSuccess: () => {
      setSelectedId(null);
      qc.invalidateQueries({ queryKey: ['admin', 'messages'] });
      notifications.show({ message: 'Deleted', color: 'gray' });
    },
    onError: (e) => notifications.show({ title: 'Error', message: e.message, color: 'red' }),
  });

  const confirmDelete = (id) => {
    if (window.confirm('Permanently delete this message?')) {
      deleteMut.mutate(id);
    }
  };

  return (
    <Stack gap="lg" pos="relative">
      <LoadingOverlay visible={isLoading} />
      <Group justify="space-between">
        <Title order={2}>Messages</Title>
        <Badge variant="light" color="blue">{(list ?? []).filter((m) => !m.isRead).length} unread</Badge>
      </Group>

      <Paper withBorder radius="md">
        <Table highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: 40 }} />
              <Table.Th>Date</Table.Th>
              <Table.Th>From</Table.Th>
              <Table.Th>Preview</Table.Th>
              <Table.Th style={{ width: 100 }}>Lang</Table.Th>
              <Table.Th style={{ width: 120 }} />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {(list ?? []).map((m) => (
              <Table.Tr key={m.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedId(m.id)}>
                <Table.Td>
                  {m.isRead
                    ? <IconMailOpened size={18} color="var(--mantine-color-dimmed)" />
                    : <IconMail size={18} color="var(--mantine-color-blue-5)" />}
                </Table.Td>
                <Table.Td><Text size="xs" c="dimmed">{formatDate(m.createdAt)}</Text></Table.Td>
                <Table.Td>
                  <Text size="sm" fw={m.isRead ? 400 : 600}>{m.name}</Text>
                  <Text size="xs" c="dimmed">{m.email}</Text>
                </Table.Td>
                <Table.Td><Text size="sm" lineClamp={1}>{m.preview}</Text></Table.Td>
                <Table.Td><Badge size="xs" variant="light">{m.lang?.toUpperCase()}</Badge></Table.Td>
                <Table.Td>
                  <Group gap={4} justify="flex-end" onClick={(e) => e.stopPropagation()}>
                    <ActionIcon variant="subtle" onClick={() => setSelectedId(m.id)} title="View">
                      <IconEye size={16} />
                    </ActionIcon>
                    <ActionIcon variant="subtle" color="red" onClick={() => confirmDelete(m.id)} title="Delete">
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
            {!isLoading && (list ?? []).length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={6}>
                  <Text ta="center" c="dimmed" py="xl">No messages yet.</Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Paper>

      <Drawer
        opened={selectedId != null}
        onClose={() => setSelectedId(null)}
        position="right"
        size="md"
        title="Message detail"
      >
        {selected && (
          <Stack gap="md">
            <div>
              <Text size="xs" c="dimmed">From</Text>
              <Text fw={600}>{selected.name}</Text>
              <Text size="sm" c="dimmed">{selected.email}</Text>
            </div>
            <div>
              <Text size="xs" c="dimmed">Date</Text>
              <Text size="sm">{formatDate(selected.createdAt)}</Text>
            </div>
            <div>
              <Text size="xs" c="dimmed">Message</Text>
              <Paper withBorder p="sm" radius="sm">
                <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{selected.message}</Text>
              </Paper>
            </div>
            <Group>
              <Button
                variant="light"
                leftSection={selected.isRead ? <IconMail size={16} /> : <IconMailOpened size={16} />}
                onClick={() => toggleRead.mutate(selected.id)}
                loading={toggleRead.isPending}
              >
                {selected.isRead ? 'Mark as unread' : 'Mark as read'}
              </Button>
              <Button
                component="a"
                href={`mailto:${selected.email}?subject=${encodeURIComponent('Re: Portfolio')}`}
                variant="light"
                leftSection={<IconMail size={16} />}
              >
                Reply
              </Button>
              <Button
                color="red" variant="subtle"
                leftSection={<IconTrash size={16} />}
                onClick={() => confirmDelete(selected.id)}
              >
                Delete
              </Button>
            </Group>
          </Stack>
        )}
      </Drawer>
    </Stack>
  );
}
