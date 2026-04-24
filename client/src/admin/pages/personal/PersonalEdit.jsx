import {
  Anchor, Button, FileButton, Grid, Group, LoadingOverlay, Paper, Stack, Text, TextInput, Title,
} from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconDeviceFloppy, IconFileUpload, IconTrash } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { z } from 'zod';
import { adminApi } from '../../../api/adminApi';

const schema = z.object({
  name: z.string().min(1, 'Required').max(200),
  email: z.string().email('Must be a valid email').max(200),
  location: z.string().min(1, 'Required').max(200),
  github: z.string().url().or(z.literal('')).nullable(),
  linkedin: z.string().url().or(z.literal('')).nullable(),
  cvUrl: z.string().max(500).nullable().or(z.literal('')),
});

export default function PersonalEdit() {
  const qc = useQueryClient();
  const resetRef = useRef(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'personal'],
    queryFn: () => adminApi.getPersonal(),
  });

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: { name: '', email: '', location: '', github: '', linkedin: '', cvUrl: '' },
    validate: zodResolver(schema),
  });

  useEffect(() => {
    if (data) {
      form.setValues({
        name: data.name ?? '',
        email: data.email ?? '',
        location: data.location ?? '',
        github: data.github ?? '',
        linkedin: data.linkedin ?? '',
        cvUrl: data.cvUrl ?? '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const saveMut = useMutation({
    mutationFn: (values) => {
      const payload = {
        ...values,
        github: values.github?.trim() || null,
        linkedin: values.linkedin?.trim() || null,
        cvUrl: values.cvUrl?.trim() || null,
      };
      return adminApi.updatePersonal(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'personal'] });
      qc.invalidateQueries({ queryKey: ['public', 'personal'] });
      notifications.show({ message: 'Saved', color: 'green' });
    },
    onError: (e) => notifications.show({ title: 'Save failed', message: e.message, color: 'red' }),
  });

  const uploadMut = useMutation({
    mutationFn: (file) => adminApi.uploadCv(file),
    onSuccess: (res) => {
      form.setFieldValue('cvUrl', res.cvUrl);
      qc.invalidateQueries({ queryKey: ['admin', 'personal'] });
      qc.invalidateQueries({ queryKey: ['public', 'personal'] });
      notifications.show({ message: 'CV uploaded', color: 'green' });
      resetRef.current?.();
    },
    onError: (e) => {
      notifications.show({ title: 'Upload failed', message: e?.data || e.message, color: 'red' });
      resetRef.current?.();
    },
  });

  const deleteCvMut = useMutation({
    mutationFn: () => adminApi.deleteCv(),
    onSuccess: () => {
      form.setFieldValue('cvUrl', '');
      qc.invalidateQueries({ queryKey: ['admin', 'personal'] });
      qc.invalidateQueries({ queryKey: ['public', 'personal'] });
      notifications.show({ message: 'CV removed', color: 'gray' });
    },
    onError: (e) => notifications.show({ title: 'Delete failed', message: e.message, color: 'red' }),
  });

  const onSubmit = form.onSubmit((values) => saveMut.mutate(values));

  const handleFile = (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      notifications.show({ message: 'Only PDF files allowed', color: 'red' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      notifications.show({ message: 'File exceeds 5MB limit', color: 'red' });
      return;
    }
    uploadMut.mutate(file);
  };

  const cvUrl = form.getValues().cvUrl;

  return (
    <Stack gap="lg" pos="relative">
      <LoadingOverlay visible={isLoading} />
      <Group justify="space-between">
        <Title order={2}>Personal info</Title>
        <Button onClick={onSubmit} loading={saveMut.isPending} leftSection={<IconDeviceFloppy size={16} />}>
          Save
        </Button>
      </Group>

      <form onSubmit={onSubmit}>
        <Paper withBorder p="lg" radius="md">
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput label="Name" required {...form.getInputProps('name')} />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput label="Email" type="email" required {...form.getInputProps('email')} />
            </Grid.Col>
            <Grid.Col span={12}>
              <TextInput label="Location" required {...form.getInputProps('location')} />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput label="GitHub URL" placeholder="https://github.com/..." {...form.getInputProps('github')} />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput label="LinkedIn URL" placeholder="https://www.linkedin.com/in/..." {...form.getInputProps('linkedin')} />
            </Grid.Col>
            <Grid.Col span={12}>
              <TextInput
                label="CV URL"
                placeholder="https://... or upload below"
                description="Auto-populated when you upload a CV below"
                {...form.getInputProps('cvUrl')}
              />
            </Grid.Col>
          </Grid>
        </Paper>
      </form>

      <Paper withBorder p="lg" radius="md">
        <Stack gap="md">
          <Group justify="space-between" wrap="nowrap">
            <Stack gap={4}>
              <Title order={4}>CV (PDF)</Title>
              <Text size="sm" c="dimmed">PDF only, max 5 MB. Overwrites /media/cv.pdf.</Text>
            </Stack>
            <Group gap="xs">
              <FileButton
                resetRef={resetRef}
                accept="application/pdf"
                onChange={handleFile}
              >
                {(props) => (
                  <Button
                    {...props}
                    variant="light"
                    leftSection={<IconFileUpload size={16} />}
                    loading={uploadMut.isPending}
                  >
                    Upload CV
                  </Button>
                )}
              </FileButton>
              {cvUrl && (
                <Button
                  variant="subtle"
                  color="red"
                  leftSection={<IconTrash size={16} />}
                  loading={deleteCvMut.isPending}
                  onClick={() => {
                    if (window.confirm('Remove uploaded CV?')) deleteCvMut.mutate();
                  }}
                >
                  Remove
                </Button>
              )}
            </Group>
          </Group>
          {cvUrl ? (
            <Group gap="xs">
              <Text size="sm">Current:</Text>
              <Anchor href={cvUrl} target="_blank" rel="noopener noreferrer" size="sm">
                {cvUrl}
              </Anchor>
            </Group>
          ) : (
            <Text size="sm" c="dimmed">No CV uploaded yet.</Text>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
