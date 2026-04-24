import {
  ActionIcon, Button, Grid, Group, LoadingOverlay, NumberInput, Paper, Stack, Switch,
  Tabs, TagsInput, Textarea, TextInput, Title, Text,
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
  company: z.string().min(1, 'Required').max(200),
  type: z.string().min(1, 'Required').max(64),
  desc: z.string().min(1, 'Required'),
  highlights: z.array(z.string().max(400)),
});

const schema = z.object({
  sortOrder: z.number().int().min(0),
  isEducation: z.boolean(),
  isPublished: z.boolean(),
  period: z.string().min(1).max(64),
  tech: z.array(z.string().max(64)),
  dataTr: localeSchema,
  dataEn: localeSchema,
});

function emptyEntry() {
  return {
    sortOrder: 0,
    isEducation: false,
    isPublished: false,
    period: '',
    tech: [],
    dataTr: { title: '', company: '', type: 'Tam zamanlı', desc: '', highlights: [] },
    dataEn: { title: '', company: '', type: 'Full-time', desc: '', highlights: [] },
  };
}

export default function ExperienceEdit() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'experience', id],
    queryFn: () => adminApi.getExperience(id),
    enabled: !isNew,
  });

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: emptyEntry(),
    validate: zodResolver(schema),
  });

  useEffect(() => {
    if (data) {
      form.setValues({
        sortOrder: data.sortOrder,
        isEducation: data.isEducation,
        isPublished: data.isPublished,
        period: data.period,
        tech: data.tech ?? [],
        dataTr: data.dataTr,
        dataEn: data.dataEn,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const saveMut = useMutation({
    mutationFn: (values) => (isNew ? adminApi.createExperience(values) : adminApi.updateExperience(id, values)),
    onSuccess: (saved) => {
      qc.invalidateQueries({ queryKey: ['admin', 'experience'] });
      qc.invalidateQueries({ queryKey: ['public', 'experience'] });
      notifications.show({ message: 'Saved', color: 'green' });
      if (isNew && saved?.id) navigate(`/admin/experience/${saved.id}`, { replace: true });
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
          <ActionIcon variant="subtle" onClick={() => navigate('/admin/experience')}>
            <IconArrowLeft size={18} />
          </ActionIcon>
          <Title order={2}>{isNew ? 'New experience' : 'Edit experience'}</Title>
        </Group>
        <Button onClick={onSubmit} loading={saveMut.isPending} leftSection={<IconDeviceFloppy size={16} />}>
          {isNew ? 'Create' : 'Save'}
        </Button>
      </Group>

      <form onSubmit={onSubmit}>
        <Grid>
          <Grid.Col span={12}>
            <Paper withBorder p="lg" radius="md">
              <Stack gap="md">
                <Title order={4}>Meta</Title>
                <Grid>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <TextInput label="Period" placeholder="06/2021 — Present" required {...form.getInputProps('period')} />
                  </Grid.Col>
                  <Grid.Col span={{ base: 6, sm: 3 }}>
                    <NumberInput label="Sort order" min={0} {...form.getInputProps('sortOrder')} />
                  </Grid.Col>
                  <Grid.Col span={{ base: 6, sm: 3 }}>
                    <Stack gap={6} mt="lg">
                      <Switch label="Published" {...form.getInputProps('isPublished', { type: 'checkbox' })} />
                      <Switch label="Education" {...form.getInputProps('isEducation', { type: 'checkbox' })} />
                    </Stack>
                  </Grid.Col>
                  <Grid.Col span={12}>
                    <TagsInput label="Tech (language-neutral)" placeholder="Type and press Enter" {...form.getInputProps('tech')} />
                  </Grid.Col>
                </Grid>
              </Stack>
            </Paper>
          </Grid.Col>

          <Grid.Col span={12}>
            <Paper withBorder p="lg" radius="md">
              <Tabs defaultValue="tr" variant="outline">
                <Tabs.List>
                  <Tabs.Tab value="tr">TR</Tabs.Tab>
                  <Tabs.Tab value="en">EN</Tabs.Tab>
                </Tabs.List>
                <Tabs.Panel value="tr" pt="lg"><LocaleFields form={form} prefix="dataTr" /></Tabs.Panel>
                <Tabs.Panel value="en" pt="lg"><LocaleFields form={form} prefix="dataEn" /></Tabs.Panel>
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
  const addHighlight = () => form.setFieldValue(`${prefix}.highlights`, [...(values.highlights || []), '']);
  const removeHighlight = (idx) => {
    const next = [...(values.highlights || [])];
    next.splice(idx, 1);
    form.setFieldValue(`${prefix}.highlights`, next);
  };

  return (
    <Stack gap="md">
      <Grid>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <TextInput label="Title" required {...form.getInputProps(`${prefix}.title`)} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <TextInput label="Company" required {...form.getInputProps(`${prefix}.company`)} />
        </Grid.Col>
        <Grid.Col span={12}>
          <TextInput label="Type (e.g. Full-time, Eğitim)" required {...form.getInputProps(`${prefix}.type`)} />
        </Grid.Col>
        <Grid.Col span={12}>
          <Textarea label="Description" rows={5} required {...form.getInputProps(`${prefix}.desc`)} />
        </Grid.Col>
      </Grid>

      <Stack gap="xs">
        <Group justify="space-between">
          <Text fw={500}>Highlights</Text>
          <Button size="xs" variant="light" leftSection={<IconPlus size={14} />} onClick={addHighlight}>Add</Button>
        </Group>
        {(values.highlights || []).length === 0 ? (
          <Text c="dimmed" size="sm">No highlights yet.</Text>
        ) : (
          <Stack gap="xs">
            {(values.highlights || []).map((_, idx) => (
              <Group key={idx} gap="xs" wrap="nowrap">
                <TextInput style={{ flex: 1 }} placeholder={`Highlight #${idx + 1}`} {...form.getInputProps(`${prefix}.highlights.${idx}`)} />
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
