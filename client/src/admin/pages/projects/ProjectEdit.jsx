import {
  ActionIcon,
  Button,
  ColorInput,
  Divider,
  Grid,
  Group,
  NumberInput,
  Paper,
  Select,
  Stack,
  Switch,
  Tabs,
  Textarea,
  TextInput,
  Title,
  Text,
  TagsInput,
  LoadingOverlay,
} from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft, IconDeviceFloppy, IconPlus, IconTrash } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { adminApi } from '../../../api/adminApi';

const localeSchema = z.object({
  title: z.string().min(1, 'Required').max(200),
  shortDesc: z.string().min(1, 'Required').max(500),
  longDesc: z.string().min(1, 'Required'),
  status: z.string().min(1, 'Required').max(64),
  client: z.string().max(200).nullish(),
  highlights: z.array(z.string().max(400)),
});

const schema = z.object({
  slug: z.string().min(1).max(128).regex(/^[a-z0-9-]+$/, 'Lowercase kebab-case only'),
  sortOrder: z.number().int().min(0),
  isPublished: z.boolean(),
  color: z.string().regex(/^#[0-9a-fA-F]{3,8}$/, 'Valid hex color (#xxxxxx)'),
  typeKey: z.string().min(1).max(64),
  github: z.string().url().nullable().or(z.literal('')),
  live: z.string().url().nullable().or(z.literal('')),
  tags: z.array(z.string().max(64)),
  dataTr: localeSchema,
  dataEn: localeSchema,
});

const TYPE_OPTIONS = ['Backend', 'Full-Stack', 'Frontend', 'Microservices', 'Enterprise', 'Other'];

function emptyProject() {
  return {
    slug: '',
    sortOrder: 0,
    isPublished: false,
    color: '#7c6fff',
    typeKey: 'Backend',
    github: '',
    live: '',
    tags: [],
    dataTr: { title: '', shortDesc: '', longDesc: '', status: 'Tamamlandı', client: '', highlights: [] },
    dataEn: { title: '', shortDesc: '', longDesc: '', status: 'Completed', client: '', highlights: [] },
  };
}

export default function ProjectEdit() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'projects', id],
    queryFn: () => adminApi.getProject(id),
    enabled: !isNew,
  });

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: emptyProject(),
    validate: zodResolver(schema),
  });

  useEffect(() => {
    if (data) {
      form.setValues({
        slug: data.slug,
        sortOrder: data.sortOrder,
        isPublished: data.isPublished,
        color: data.color,
        typeKey: data.typeKey,
        github: data.github ?? '',
        live: data.live ?? '',
        tags: data.tags ?? [],
        dataTr: { ...data.dataTr, client: data.dataTr.client ?? '' },
        dataEn: { ...data.dataEn, client: data.dataEn.client ?? '' },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const saveMut = useMutation({
    mutationFn: (values) => {
      const payload = {
        ...values,
        github: values.github?.trim() || null,
        live: values.live?.trim() || null,
        dataTr: { ...values.dataTr, client: values.dataTr.client?.trim() || null },
        dataEn: { ...values.dataEn, client: values.dataEn.client?.trim() || null },
      };
      return isNew ? adminApi.createProject(payload) : adminApi.updateProject(id, payload);
    },
    onSuccess: (saved) => {
      qc.invalidateQueries({ queryKey: ['admin', 'projects'] });
      qc.invalidateQueries({ queryKey: ['public', 'projects'] });
      notifications.show({ message: 'Saved', color: 'green' });
      if (isNew && saved?.id) navigate(`/admin/projects/${saved.id}`, { replace: true });
    },
    onError: (e) => {
      notifications.show({
        title: 'Save failed',
        message: e?.data?.errors ? JSON.stringify(e.data.errors) : e.message,
        color: 'red',
      });
    },
  });

  const onSubmit = form.onSubmit((values) => saveMut.mutate(values));

  return (
    <Stack gap="lg" pos="relative">
      <LoadingOverlay visible={isLoading} />

      <Group justify="space-between">
        <Group gap="xs">
          <ActionIcon variant="subtle" onClick={() => navigate('/admin/projects')}>
            <IconArrowLeft size={18} />
          </ActionIcon>
          <Title order={2}>{isNew ? 'New project' : 'Edit project'}</Title>
        </Group>
        <Button
          onClick={onSubmit}
          loading={saveMut.isPending}
          leftSection={<IconDeviceFloppy size={16} />}
        >
          {isNew ? 'Create' : 'Save'}
        </Button>
      </Group>

      <form onSubmit={onSubmit}>
        <Grid>
          {/* Meta card */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Paper withBorder p="lg" radius="md">
              <Stack gap="md">
                <Title order={4}>Meta</Title>
                <Grid>
                  <Grid.Col span={6}>
                    <TextInput label="Slug" placeholder="my-project" required {...form.getInputProps('slug')} />
                  </Grid.Col>
                  <Grid.Col span={3}>
                    <NumberInput label="Sort order" min={0} {...form.getInputProps('sortOrder')} />
                  </Grid.Col>
                  <Grid.Col span={3}>
                    <Stack gap={4} mt="lg">
                      <Switch
                        label="Published"
                        {...form.getInputProps('isPublished', { type: 'checkbox' })}
                      />
                    </Stack>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Select
                      label="Type"
                      data={TYPE_OPTIONS}
                      searchable
                      {...form.getInputProps('typeKey')}
                    />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <ColorInput label="Color" format="hex" {...form.getInputProps('color')} />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <TextInput label="GitHub URL" placeholder="https://github.com/..." {...form.getInputProps('github')} />
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <TextInput label="Live URL" placeholder="https://..." {...form.getInputProps('live')} />
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <TagsInput
                      label="Tags (language-neutral)"
                      placeholder="Type and press Enter"
                      {...form.getInputProps('tags')}
                    />
                  </Grid.Col>
                </Grid>
              </Stack>
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Paper withBorder p="lg" radius="md">
              <Stack gap="xs">
                <Title order={5}>Preview</Title>
                <Text size="sm" c="dimmed">Slug</Text>
                <Text ff="monospace">{form.getValues().slug || '—'}</Text>
                <Divider />
                <Text size="sm" c="dimmed">Color</Text>
                <Group gap="xs">
                  <div style={{ width: 20, height: 20, borderRadius: 4, background: form.getValues().color }} />
                  <Text ff="monospace" size="sm">{form.getValues().color}</Text>
                </Group>
              </Stack>
            </Paper>
          </Grid.Col>

          {/* Bilingual content */}
          <Grid.Col span={12}>
            <Paper withBorder p="lg" radius="md">
              <Tabs defaultValue="tr" variant="outline">
                <Tabs.List>
                  <Tabs.Tab value="tr">TR</Tabs.Tab>
                  <Tabs.Tab value="en">EN</Tabs.Tab>
                </Tabs.List>
                <Tabs.Panel value="tr" pt="lg">
                  <LocaleFields form={form} prefix="dataTr" />
                </Tabs.Panel>
                <Tabs.Panel value="en" pt="lg">
                  <LocaleFields form={form} prefix="dataEn" />
                </Tabs.Panel>
              </Tabs>
            </Paper>
          </Grid.Col>
        </Grid>
      </form>
    </Stack>
  );
}

function LocaleFields({ form, prefix }) {
  const values = form.getValues()[prefix] || { highlights: [] };
  const addHighlight = () => {
    form.setFieldValue(`${prefix}.highlights`, [...(values.highlights || []), '']);
  };
  const removeHighlight = (idx) => {
    const next = [...(values.highlights || [])];
    next.splice(idx, 1);
    form.setFieldValue(`${prefix}.highlights`, next);
  };

  return (
    <Stack gap="md">
      <Grid>
        <Grid.Col span={12}>
          <TextInput label="Title" required {...form.getInputProps(`${prefix}.title`)} />
        </Grid.Col>
        <Grid.Col span={12}>
          <Textarea label="Short description" rows={2} required {...form.getInputProps(`${prefix}.shortDesc`)} />
        </Grid.Col>
        <Grid.Col span={12}>
          <Textarea label="Long description" rows={5} required {...form.getInputProps(`${prefix}.longDesc`)} />
        </Grid.Col>
        <Grid.Col span={6}>
          <TextInput label="Status" required {...form.getInputProps(`${prefix}.status`)} />
        </Grid.Col>
        <Grid.Col span={6}>
          <TextInput label="Client (optional)" {...form.getInputProps(`${prefix}.client`)} />
        </Grid.Col>
      </Grid>

      <Stack gap="xs">
        <Group justify="space-between">
          <Text fw={500}>Highlights</Text>
          <Button size="xs" variant="light" leftSection={<IconPlus size={14} />} onClick={addHighlight}>
            Add
          </Button>
        </Group>
        {(values.highlights || []).length === 0 ? (
          <Text c="dimmed" size="sm">No highlights yet.</Text>
        ) : (
          <Stack gap="xs">
            {(values.highlights || []).map((_, idx) => (
              <Group key={idx} gap="xs" wrap="nowrap">
                <TextInput
                  style={{ flex: 1 }}
                  placeholder={`Highlight #${idx + 1}`}
                  {...form.getInputProps(`${prefix}.highlights.${idx}`)}
                />
                <ActionIcon color="red" variant="subtle" onClick={() => removeHighlight(idx)}>
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            ))}
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}
