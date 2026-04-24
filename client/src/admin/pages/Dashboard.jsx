import {
  Badge, Button, Card, Code, Grid, Group, LoadingOverlay, Stack, Text, Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconBriefcase, IconCheck, IconClock, IconDatabase, IconFolder,
  IconGitBranch, IconMail, IconRefresh, IconServer, IconStack3, IconTimeline, IconNotebook,
} from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/adminApi';

function formatBytes(n) {
  if (!n) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0; let v = n;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(v >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

function formatUptime(seconds) {
  if (!seconds || seconds < 0) return '—';
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const parts = [];
  if (d) parts.push(`${d}d`);
  if (h || d) parts.push(`${h}h`);
  parts.push(`${m}m`);
  if (!d && !h) parts.push(`${s}s`);
  return parts.join(' ');
}

function InfoCard({ icon: Icon, label, children }) {
  return (
    <Card withBorder padding="md" radius="md">
      <Group justify="space-between" mb="xs">
        <Text size="sm" c="dimmed">{label}</Text>
        {Icon && <Icon size={18} />}
      </Group>
      {children}
    </Card>
  );
}

export default function Dashboard() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin', 'system-info'],
    queryFn: () => adminApi.getSystemInfo(),
    refetchInterval: 30_000,
  });

  const clearMut = useMutation({
    mutationFn: () => adminApi.clearSystemCache(),
    onSuccess: () => {
      refetch();
      notifications.show({ message: 'Cache cleared and site re-rendered', color: 'green' });
    },
    onError: (e) => notifications.show({ title: 'Error', message: e.message, color: 'red' }),
  });

  const counts = data?.counts ?? {};
  const buildTime = data?.buildTime ? new Date(data.buildTime).toLocaleString() : 'unknown';
  const startedAt = data?.startedAt ? new Date(data.startedAt).toLocaleString() : '—';
  const sha = (data?.gitSha ?? 'unknown').slice(0, 12);

  return (
    <Stack gap="lg" pos="relative">
      <LoadingOverlay visible={isLoading} />
      <Group justify="space-between">
        <Title order={2}>Dashboard</Title>
        <Button
          variant="light"
          leftSection={<IconRefresh size={16} />}
          onClick={() => clearMut.mutate()}
          loading={clearMut.isPending}
        >
          Clear cache + Re-render
        </Button>
      </Group>

      {/* ── System info ── */}
      <Title order={4}>System</Title>
      <Grid>
        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <InfoCard label="Version" icon={IconGitBranch}>
            <Title order={3}>{data?.version ?? '—'}</Title>
            <Code mt="xs">{sha}</Code>
          </InfoCard>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <InfoCard label="Uptime" icon={IconClock}>
            <Title order={3}>{formatUptime(data?.uptimeSeconds)}</Title>
            <Text size="xs" c="dimmed" mt="xs">Started: {startedAt}</Text>
          </InfoCard>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <InfoCard label="Environment" icon={IconServer}>
            <Title order={3}>{data?.environment ?? '—'}</Title>
            <Text size="xs" c="dimmed" mt="xs">{data?.dotnetVersion ?? ''}</Text>
          </InfoCard>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <InfoCard label="Build time" icon={IconClock}>
            <Text size="md" fw={500}>{buildTime}</Text>
          </InfoCard>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <InfoCard label="Last migration" icon={IconDatabase}>
            <Code>{data?.lastMigration ?? '—'}</Code>
          </InfoCard>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <InfoCard label="Uploads size" icon={IconFolder}>
            <Title order={3}>{formatBytes(data?.uploadsSizeBytes)}</Title>
          </InfoCard>
        </Grid.Col>
      </Grid>

      {/* ── Content counts ── */}
      <Title order={4} mt="md">Content</Title>
      <Grid>
        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <InfoCard label="Projects" icon={IconBriefcase}>
            <Title order={2}>{counts.projects ?? 0}</Title>
          </InfoCard>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <InfoCard label="Blog posts" icon={IconNotebook}>
            <Title order={2}>{counts.blogPosts ?? 0}</Title>
          </InfoCard>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <InfoCard label="Experience" icon={IconTimeline}>
            <Title order={2}>{counts.experiences ?? 0}</Title>
          </InfoCard>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <InfoCard label="Skill categories" icon={IconStack3}>
            <Title order={2}>{counts.skillCategories ?? 0}</Title>
          </InfoCard>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <InfoCard label="Messages" icon={IconMail}>
            <Title order={2}>{counts.contactMessages ?? 0}</Title>
            {counts.unreadMessages > 0 && (
              <Badge mt="sm" color="blue" variant="light" leftSection={<IconCheck size={12} />}>
                {counts.unreadMessages} unread
              </Badge>
            )}
          </InfoCard>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
