import { Alert, Grid, Group, Paper, Stack, Switch, Tabs, Textarea, TextInput, Title } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';

const SECTION_LABELS = {
  hero: 'Hero',
  about: 'About',
  skills: 'Skills',
  projects: 'Projects',
  experience: 'Experience',
  blog: 'Blog',
  contact: 'Contact',
};

export default function OperationsTab({ form }) {
  const v = form.getValues();
  const ops = v.operations ?? {};
  const analyticsOn = !!ops.analytics?.enabled;

  return (
    <Stack gap="xl">
      {/* Maintenance */}
      <Paper withBorder p="md" radius="md">
        <Stack gap="sm">
          <Title order={4}>Maintenance Mode</Title>
          <Switch
            label="Enable maintenance mode"
            checked={!!ops.maintenanceMode}
            onChange={(e) => form.setFieldValue('operations.maintenanceMode', e.currentTarget.checked)}
          />
          {ops.maintenanceMode && (
            <Alert icon={<IconAlertTriangle size={16} />} color="yellow" variant="light">
              The public site will be replaced with a maintenance page. The admin panel stays accessible.
            </Alert>
          )}
          <Tabs defaultValue="tr" variant="pills">
            <Tabs.List><Tabs.Tab value="tr">TR</Tabs.Tab><Tabs.Tab value="en">EN</Tabs.Tab></Tabs.List>
            <Tabs.Panel value="tr" pt="md">
              <Textarea label="Maintenance message (TR)" minRows={4} autosize
                        {...form.getInputProps('operations.maintenanceMessage_tr')} />
            </Tabs.Panel>
            <Tabs.Panel value="en" pt="md">
              <Textarea label="Maintenance message (EN)" minRows={4} autosize
                        {...form.getInputProps('operations.maintenanceMessage_en')} />
            </Tabs.Panel>
          </Tabs>
        </Stack>
      </Paper>

      {/* Sections visible */}
      <Paper withBorder p="md" radius="md">
        <Stack gap="sm">
          <Title order={4}>Sections Visible</Title>
          <Grid>
            {Object.entries(SECTION_LABELS).map(([key, label]) => (
              <Grid.Col span={{ base: 6, sm: 4 }} key={key}>
                <Switch
                  label={label}
                  checked={!!ops.sectionsEnabled?.[key]}
                  onChange={(e) => form.setFieldValue(`operations.sectionsEnabled.${key}`, e.currentTarget.checked)}
                />
              </Grid.Col>
            ))}
          </Grid>
        </Stack>
      </Paper>

      {/* Analytics */}
      <Paper withBorder p="md" radius="md">
        <Stack gap="sm">
          <Title order={4}>Analytics</Title>
          <Switch
            label="Analytics enabled"
            checked={analyticsOn}
            onChange={(e) => form.setFieldValue('operations.analytics.enabled', e.currentTarget.checked)}
          />
          <Group grow>
            <TextInput
              label="GA4 Measurement ID"
              placeholder="G-XXXXXXXXXX"
              disabled={!analyticsOn}
              {...form.getInputProps('operations.analytics.ga4MeasurementId')}
            />
            <TextInput
              label="GTM Container ID"
              placeholder="GTM-XXXXXX"
              disabled={!analyticsOn}
              {...form.getInputProps('operations.analytics.gtmContainerId')}
            />
          </Group>
        </Stack>
      </Paper>
    </Stack>
  );
}
