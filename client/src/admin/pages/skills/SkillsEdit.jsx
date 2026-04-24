import {
  ActionIcon, Button, Grid, Group, LoadingOverlay, NumberInput, Paper, Select, Stack, Switch,
  TextInput, Title, Text,
} from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft, IconDeviceFloppy, IconPlus, IconTrash } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { adminApi } from '../../../api/adminApi';

const TIER_OPTIONS = [
  { value: 'expert', label: 'Expert' },
  { value: 'proficient', label: 'Proficient' },
  { value: 'familiar', label: 'Familiar' },
];

const ICON_OPTIONS = ['dotnet', 'database', 'devops', 'frontend', 'cloud', 'tools'];

const skillSchema = z.object({
  name: z.string().min(1, 'Required').max(120),
  tier: z.enum(['expert', 'proficient', 'familiar']),
});

const schema = z.object({
  sortOrder: z.number().int().min(0),
  icon: z.string().min(1).max(64),
  titleTr: z.string().min(1).max(200),
  titleEn: z.string().min(1).max(200),
  isPublished: z.boolean(),
  skills: z.array(skillSchema),
});

function emptyCategory() {
  return {
    sortOrder: 0,
    icon: 'dotnet',
    titleTr: '',
    titleEn: '',
    isPublished: false,
    skills: [],
  };
}

export default function SkillsEdit() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'skills', id],
    queryFn: () => adminApi.getSkillCategory(id),
    enabled: !isNew,
  });

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: emptyCategory(),
    validate: zodResolver(schema),
  });

  useEffect(() => {
    if (data) form.setValues({ ...data });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const saveMut = useMutation({
    mutationFn: (values) => (isNew ? adminApi.createSkillCategory(values) : adminApi.updateSkillCategory(id, values)),
    onSuccess: (saved) => {
      qc.invalidateQueries({ queryKey: ['admin', 'skills'] });
      qc.invalidateQueries({ queryKey: ['public', 'skills'] });
      notifications.show({ message: 'Saved', color: 'green' });
      if (isNew && saved?.id) navigate(`/admin/skills/${saved.id}`, { replace: true });
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

  const addSkill = () => {
    const list = form.getValues().skills || [];
    form.setFieldValue('skills', [...list, { name: '', tier: 'proficient' }]);
  };
  const removeSkill = (idx) => {
    const list = [...(form.getValues().skills || [])];
    list.splice(idx, 1);
    form.setFieldValue('skills', list);
  };

  const skills = form.getValues().skills || [];

  return (
    <Stack gap="lg" pos="relative">
      <LoadingOverlay visible={isLoading} />

      <Group justify="space-between">
        <Group gap="xs">
          <ActionIcon variant="subtle" onClick={() => navigate('/admin/skills')}>
            <IconArrowLeft size={18} />
          </ActionIcon>
          <Title order={2}>{isNew ? 'New category' : 'Edit category'}</Title>
        </Group>
        <Button onClick={onSubmit} loading={saveMut.isPending} leftSection={<IconDeviceFloppy size={16} />}>
          {isNew ? 'Create' : 'Save'}
        </Button>
      </Group>

      <form onSubmit={onSubmit}>
        <Stack gap="md">
          <Paper withBorder p="lg" radius="md">
            <Stack gap="md">
              <Title order={4}>Meta</Title>
              <Grid>
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <Select
                    label="Icon"
                    data={ICON_OPTIONS}
                    searchable
                    allowDeselect={false}
                    {...form.getInputProps('icon')}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 6, sm: 4 }}>
                  <NumberInput label="Sort order" min={0} {...form.getInputProps('sortOrder')} />
                </Grid.Col>
                <Grid.Col span={{ base: 6, sm: 4 }}>
                  <Stack mt="lg">
                    <Switch label="Published" {...form.getInputProps('isPublished', { type: 'checkbox' })} />
                  </Stack>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput label="Title (TR)" required {...form.getInputProps('titleTr')} />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput label="Title (EN)" required {...form.getInputProps('titleEn')} />
                </Grid.Col>
              </Grid>
            </Stack>
          </Paper>

          <Paper withBorder p="lg" radius="md">
            <Stack gap="md">
              <Group justify="space-between">
                <Title order={4}>Skills</Title>
                <Button size="xs" variant="light" leftSection={<IconPlus size={14} />} onClick={addSkill}>
                  Add skill
                </Button>
              </Group>
              {skills.length === 0 ? (
                <Text c="dimmed" size="sm">No skills yet.</Text>
              ) : (
                <Stack gap="xs">
                  {skills.map((_, idx) => (
                    <Group key={idx} gap="xs" wrap="nowrap" align="flex-end">
                      <TextInput
                        style={{ flex: 1 }}
                        label={idx === 0 ? 'Name' : undefined}
                        placeholder="C#"
                        {...form.getInputProps(`skills.${idx}.name`)}
                      />
                      <Select
                        label={idx === 0 ? 'Tier' : undefined}
                        data={TIER_OPTIONS}
                        w={140}
                        allowDeselect={false}
                        {...form.getInputProps(`skills.${idx}.tier`)}
                      />
                      <ActionIcon color="red" variant="subtle" onClick={() => removeSkill(idx)} mb={4}>
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  ))}
                </Stack>
              )}
            </Stack>
          </Paper>
        </Stack>
      </form>
    </Stack>
  );
}
