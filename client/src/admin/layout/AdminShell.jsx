import { AppShell, Burger, Group, NavLink, ScrollArea, Title, Button, Divider, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconLayoutDashboard, IconBriefcase, IconLogout, IconExternalLink,
  IconTimeline, IconStack3, IconNotebook, IconLanguage, IconUser, IconSettings, IconMail,
} from '@tabler/icons-react';
import { NavLink as RouterNavLink, Outlet, useNavigate } from 'react-router-dom';
import { useLogout, useMe } from '../auth/useAuth';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: IconLayoutDashboard, end: true },
  { to: '/admin/projects', label: 'Projects', icon: IconBriefcase },
  { to: '/admin/experience', label: 'Experience', icon: IconTimeline },
  { to: '/admin/skills', label: 'Skills', icon: IconStack3 },
  { to: '/admin/blog', label: 'Blog', icon: IconNotebook },
  { to: '/admin/translations', label: 'Translations', icon: IconLanguage },
  { to: '/admin/personal', label: 'Personal', icon: IconUser },
  { to: '/admin/site-settings', label: 'Site Settings', icon: IconSettings },
  { to: '/admin/messages', label: 'Messages', icon: IconMail },
];

export default function AdminShell() {
  const [opened, { toggle }] = useDisclosure();
  const { data: me } = useMe();
  const logout = useLogout();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout.mutateAsync();
    navigate('/admin/login', { replace: true });
  };

  return (
    <AppShell
      header={{ height: 56 }}
      navbar={{ width: 240, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Title order={4}>fp/admin</Title>
          </Group>
          <Group gap="xs">
            <Text size="sm" c="dimmed">{me?.username}</Text>
            <Button
              component="a"
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              variant="subtle"
              size="xs"
              leftSection={<IconExternalLink size={14} />}
            >
              View site
            </Button>
            <Button
              variant="subtle"
              size="xs"
              color="red"
              leftSection={<IconLogout size={14} />}
              onClick={handleLogout}
              loading={logout.isPending}
            >
              Logout
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="xs">
        <AppShell.Section grow component={ScrollArea}>
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              component={RouterNavLink}
              to={n.to}
              end={n.end}
              label={n.label}
              leftSection={<n.icon size={18} />}
            />
          ))}
        </AppShell.Section>
        <AppShell.Section>
          <Divider my="xs" />
          <Text size="xs" c="dimmed" px="xs">v0.1.0</Text>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
