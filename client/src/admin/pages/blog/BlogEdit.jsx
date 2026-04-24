import {
  ActionIcon, Button, ColorInput, Divider, Grid, Group, LoadingOverlay, NumberInput, Paper, Select,
  Stack, Switch, Tabs, TagsInput, TextInput, Title,
} from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { adminApi } from '../../../api/adminApi';
import BlogBlockEditor from './BlogBlockEditor';
import BlogLocaleMeta from './BlogLocaleMeta';

const blockSchema = z.object({
  type: z.enum(['paragraph', 'heading', 'code', 'note']),
  text: z.string(),
  lang: z.string().max(32).nullish(),
});

const localeSchema = z.object({
  title: z.string().min(1, 'Required').max(300),
  excerpt: z.string().min(1, 'Required').max(1000),
  date: z.string().min(1).max(64),
  readTime: z.number().int().min(1).max(120),
});

const schema = z.object({
  slug: z.string().min(1).max(128).regex(/^[a-z0-9-]+$/, 'Lowercase kebab-case only'),
  sortOrder: z.number().int().min(0),
  isFeatured: z.boolean(),
  isPublished: z.boolean(),
  category: z.string().min(1).max(64),
  color: z.string().regex(/^#[0-9a-fA-F]{3,8}$/, 'Valid hex color'),
  publishedAt: z.string().nullable().or(z.literal('')),
  tags: z.array(z.string().max(64)),
  dataTr: localeSchema,
  dataEn: localeSchema,
  contentTr: z.array(blockSchema),
  contentEn: z.array(blockSchema),
});

const CATEGORY_OPTIONS = ['.NET', 'AI / ML', 'DevOps', 'Architecture', 'Frontend', 'Tools'];

const emptyPost = () => ({
  slug: '',
  sortOrder: 0,
  isFeatured: false,
  isPublished: false,
  category: '.NET',
  color: '#7c6fff',
  publishedAt: '',
  tags: [],
  dataTr: { title: '', excerpt: '', date: '', readTime: 5 },
  dataEn: { title: '', excerpt: '', date: '', readTime: 5 },
  contentTr: [],
  contentEn: [],
});

export default function BlogEdit() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'blog', id],
    queryFn: () => adminApi.getBlog(id),
    enabled: !isNew,
  });

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: emptyPost(),
    validate: zodResolver(schema),
  });

  useEffect(() => {
    if (data) {
      form.setValues({
        slug: data.slug,
        sortOrder: data.sortOrder,
        isFeatured: data.isFeatured,
        isPublished: data.isPublished,
        category: data.category,
        color: data.color,
        publishedAt: data.publishedAt ?? '',
        tags: data.tags ?? [],
        dataTr: data.dataTr,
        dataEn: data.dataEn,
        contentTr: data.contentTr ?? [],
        contentEn: data.contentEn ?? [],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const saveMut = useMutation({
    mutationFn: (values) => {
      const payload = {
        ...values,
        publishedAt: values.publishedAt?.trim() ? values.publishedAt : null,
      };
      return isNew ? adminApi.createBlog(payload) : adminApi.updateBlog(id, payload);
    },
    onSuccess: (saved) => {
      qc.invalidateQueries({ queryKey: ['admin', 'blog'] });
      qc.invalidateQueries({ queryKey: ['public', 'blog'] });
      notifications.show({ message: 'Saved', color: 'green' });
      if (isNew && saved?.id) navigate(`/admin/blog/${saved.id}`, { replace: true });
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
          <ActionIcon variant="subtle" onClick={() => navigate('/admin/blog')}>
            <IconArrowLeft size={18} />
          </ActionIcon>
          <Title order={2}>{isNew ? 'New post' : 'Edit post'}</Title>
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
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput label="Slug" placeholder="my-post" required {...form.getInputProps('slug')} />
                </Grid.Col>
                <Grid.Col span={{ base: 6, sm: 3 }}>
                  <NumberInput label="Sort order" min={0} {...form.getInputProps('sortOrder')} />
                </Grid.Col>
                <Grid.Col span={{ base: 6, sm: 3 }}>
                  <Stack gap={6} mt="lg">
                    <Switch label="Published" {...form.getInputProps('isPublished', { type: 'checkbox' })} />
                    <Switch label="Featured" {...form.getInputProps('isFeatured', { type: 'checkbox' })} />
                  </Stack>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Select label="Category" data={CATEGORY_OPTIONS} searchable {...form.getInputProps('category')} />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <ColorInput label="Color" format="hex" {...form.getInputProps('color')} />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Published at (YYYY-MM-DD)"
                    placeholder="2026-04-01"
                    {...form.getInputProps('publishedAt')}
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <TagsInput label="Tags (language-neutral)" placeholder="Type and press Enter" {...form.getInputProps('tags')} />
                </Grid.Col>
              </Grid>
            </Stack>
          </Paper>

          <Paper withBorder p="lg" radius="md">
            <Tabs defaultValue="tr" variant="outline">
              <Tabs.List>
                <Tabs.Tab value="tr">TR</Tabs.Tab>
                <Tabs.Tab value="en">EN</Tabs.Tab>
              </Tabs.List>
              <Tabs.Panel value="tr" pt="lg">
                <BlogLocaleMeta form={form} prefix="dataTr" />
                <Divider my="lg" label="Content blocks" labelPosition="left" />
                <BlogBlockEditor form={form} field="contentTr" />
              </Tabs.Panel>
              <Tabs.Panel value="en" pt="lg">
                <BlogLocaleMeta form={form} prefix="dataEn" />
                <Divider my="lg" label="Content blocks" labelPosition="left" />
                <BlogBlockEditor form={form} field="contentEn" />
              </Tabs.Panel>
            </Tabs>
          </Paper>
        </Stack>
      </form>
    </Stack>
  );
}
