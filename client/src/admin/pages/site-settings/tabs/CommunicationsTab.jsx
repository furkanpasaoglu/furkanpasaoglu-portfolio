import {
  Button, Grid, Group, NumberInput, Paper, PasswordInput, Stack, Switch, Tabs, Textarea, TextInput, Title, Text,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconMailForward } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { adminApi } from '../../../../api/adminApi';

export default function CommunicationsTab({ form }) {
  const v = form.getValues();
  const com = v.communications ?? {};
  const smtp = com.smtp ?? {};
  const autoReply = com.autoReply ?? {};
  const [testTo, setTestTo] = useState(com.adminNotifyEmail ?? '');

  const testMut = useMutation({
    mutationFn: (to) => adminApi.testSmtp(to),
    onSuccess: () => notifications.show({ message: 'Test mail sent', color: 'green' }),
    onError: (e) => notifications.show({ title: 'Test failed', message: e.message, color: 'red' }),
  });

  return (
    <Stack gap="xl">
      <Paper withBorder p="md" radius="md">
        <Stack gap="sm">
          <Title order={4}>SMTP</Title>
          <Switch
            label="SMTP enabled (actually send messages)"
            checked={!!smtp.enabled}
            onChange={(e) => form.setFieldValue('communications.smtp.enabled', e.currentTarget.checked)}
          />
          <Grid>
            <Grid.Col span={{ base: 12, sm: 8 }}>
              <TextInput label="Host" placeholder="smtp.gmail.com"
                         {...form.getInputProps('communications.smtp.host')} />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <NumberInput label="Port" min={1} max={65535}
                           {...form.getInputProps('communications.smtp.port')} />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput label="Username" {...form.getInputProps('communications.smtp.username')} />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <PasswordInput
                label="Password"
                description="Leave blank to keep the existing password"
                placeholder={smtp.password ? '••••••••' : 'Password'}
                {...form.getInputProps('communications.smtp.password')}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput label="From Address" placeholder="noreply@example.com"
                         {...form.getInputProps('communications.smtp.fromAddress')} />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput label="From Name" {...form.getInputProps('communications.smtp.fromName')} />
            </Grid.Col>
            <Grid.Col span={12}>
              <Switch label="Use STARTTLS (recommended for port 587)"
                      checked={!!smtp.useStartTls}
                      onChange={(e) => form.setFieldValue('communications.smtp.useStartTls', e.currentTarget.checked)} />
            </Grid.Col>
          </Grid>
          <Text size="sm" c="dimmed">Admin Notify Email — contact form messages are delivered here.</Text>
          <TextInput label="Admin Notify Email"
                     {...form.getInputProps('communications.adminNotifyEmail')} />

          <Group align="end">
            <TextInput
              label="Test mail — recipient"
              value={testTo}
              onChange={(e) => setTestTo(e.currentTarget.value)}
              placeholder="example@gmail.com"
              style={{ flex: 1 }}
            />
            <Button
              leftSection={<IconMailForward size={16} />}
              onClick={() => testMut.mutate(testTo)}
              loading={testMut.isPending}
              disabled={!testTo}
              variant="light"
            >
              Send test
            </Button>
          </Group>
          <Text size="xs" c="dimmed">
            Note: the test mail uses the saved (DB) SMTP config, not your unsaved form edits.
            Save first if you changed the password or host.
          </Text>
        </Stack>
      </Paper>

      <Paper withBorder p="md" radius="md">
        <Stack gap="sm">
          <Title order={4}>Auto-reply</Title>
          <Switch
            label="Send an auto-reply to senders"
            checked={!!autoReply.enabled}
            onChange={(e) => form.setFieldValue('communications.autoReply.enabled', e.currentTarget.checked)}
          />
          <Text size="xs" c="dimmed">{'{name}'} placeholder is available.</Text>
          <Tabs defaultValue="tr" variant="pills">
            <Tabs.List><Tabs.Tab value="tr">TR</Tabs.Tab><Tabs.Tab value="en">EN</Tabs.Tab></Tabs.List>
            <Tabs.Panel value="tr" pt="md">
              <Stack gap="xs">
                <TextInput label="Subject (TR)"
                           {...form.getInputProps('communications.autoReply.subject_tr')} />
                <Textarea label="Body (TR)" minRows={5} autosize
                          {...form.getInputProps('communications.autoReply.body_tr')} />
              </Stack>
            </Tabs.Panel>
            <Tabs.Panel value="en" pt="md">
              <Stack gap="xs">
                <TextInput label="Subject (EN)"
                           {...form.getInputProps('communications.autoReply.subject_en')} />
                <Textarea label="Body (EN)" minRows={5} autosize
                          {...form.getInputProps('communications.autoReply.body_en')} />
              </Stack>
            </Tabs.Panel>
          </Tabs>
        </Stack>
      </Paper>
    </Stack>
  );
}
