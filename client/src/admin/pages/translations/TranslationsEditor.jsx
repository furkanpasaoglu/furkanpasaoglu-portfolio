import { useEffect, useMemo, useState } from 'react';
import {
  Alert, Badge, Button, Code, Grid, Group, LoadingOverlay, Paper, Select, Stack, Tabs, Textarea,
  Title, Text,
} from '@mantine/core';
import { IconAlertTriangle, IconDeviceFloppy } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../../api/adminApi';

const LIST_KEY = ['admin', 'translations'];

export default function TranslationsEditor() {
  const qc = useQueryClient();
  const { data: list = [], isLoading } = useQuery({
    queryKey: LIST_KEY,
    queryFn: () => adminApi.listTranslations(),
  });

  const [section, setSection] = useState(null);
  const [trText, setTrText] = useState('');
  const [enText, setEnText] = useState('');
  const [trError, setTrError] = useState(null);
  const [enError, setEnError] = useState(null);

  const sections = useMemo(() => list.map((t) => t.section), [list]);

  useEffect(() => {
    if (!section && sections.length > 0) setSection(sections[0]);
  }, [sections, section]);

  const current = list.find((t) => t.section === section);

  useEffect(() => {
    if (current) {
      setTrText(JSON.stringify(current.dataTr, null, 2));
      setEnText(JSON.stringify(current.dataEn, null, 2));
      setTrError(null);
      setEnError(null);
    }
  }, [current?.section, current?.updatedAt]); // eslint-disable-line react-hooks/exhaustive-deps

  const parse = (text, setError) => {
    try {
      const parsed = JSON.parse(text);
      setError(null);
      return parsed;
    } catch (e) {
      setError(e.message);
      return null;
    }
  };

  const saveMut = useMutation({
    mutationFn: ({ section: s, dataTr, dataEn }) => adminApi.upsertTranslation(s, { dataTr, dataEn }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LIST_KEY });
      qc.invalidateQueries({ queryKey: ['public', 'translations'] });
      notifications.show({ message: 'Saved', color: 'green' });
    },
    onError: (e) => notifications.show({ title: 'Save failed', message: e.message, color: 'red' }),
  });

  const handleSave = () => {
    const tr = parse(trText, setTrError);
    const en = parse(enText, setEnError);
    if (tr == null || en == null) {
      notifications.show({ message: 'Fix JSON errors before saving', color: 'red' });
      return;
    }
    saveMut.mutate({ section, dataTr: tr, dataEn: en });
  };

  return (
    <Stack gap="lg" pos="relative">
      <LoadingOverlay visible={isLoading} />
      <Group justify="space-between">
        <Title order={2}>Translations</Title>
        <Button
          onClick={handleSave}
          loading={saveMut.isPending}
          leftSection={<IconDeviceFloppy size={16} />}
          disabled={!section}
        >
          Save section
        </Button>
      </Group>

      <Alert color="blue" variant="light" icon={<IconAlertTriangle size={16} />}>
        Advanced editor. Each section is a JSON object used by the frontend as <Code>t.&lt;section&gt;.&lt;key&gt;</Code>.
        Keep the same shape in both languages; changing keys requires matching updates in the React components.
      </Alert>

      <Grid>
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Paper withBorder p="md" radius="md">
            <Stack gap="xs">
              <Text fw={500}>Section</Text>
              <Select
                data={sections}
                value={section}
                onChange={setSection}
                allowDeselect={false}
                searchable
                placeholder={sections.length === 0 ? 'No sections' : 'Pick a section'}
              />
              {current && (
                <Text size="xs" c="dimmed">
                  Last updated: {new Date(current.updatedAt).toLocaleString()}
                </Text>
              )}
            </Stack>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 8 }}>
          <Paper withBorder p="md" radius="md">
            <Tabs defaultValue="tr" variant="outline">
              <Tabs.List>
                <Tabs.Tab value="tr" rightSection={trError ? <Badge color="red" size="xs">!</Badge> : null}>
                  TR
                </Tabs.Tab>
                <Tabs.Tab value="en" rightSection={enError ? <Badge color="red" size="xs">!</Badge> : null}>
                  EN
                </Tabs.Tab>
              </Tabs.List>
              <Tabs.Panel value="tr" pt="md">
                <JsonPane text={trText} setText={setTrText} error={trError} />
              </Tabs.Panel>
              <Tabs.Panel value="en" pt="md">
                <JsonPane text={enText} setText={setEnText} error={enError} />
              </Tabs.Panel>
            </Tabs>
          </Paper>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}

function JsonPane({ text, setText, error }) {
  return (
    <Stack gap="xs">
      <Textarea
        value={text}
        onChange={(e) => setText(e.currentTarget.value)}
        minRows={18}
        autosize
        styles={{
          input: {
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: 13,
            lineHeight: 1.5,
          },
        }}
        error={error || undefined}
      />
      {error && <Text c="red" size="xs">JSON parse error: {error}</Text>}
    </Stack>
  );
}
