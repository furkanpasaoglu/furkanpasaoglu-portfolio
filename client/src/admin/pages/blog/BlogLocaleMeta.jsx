import { Grid, NumberInput, Textarea, TextInput } from '@mantine/core';

export default function BlogLocaleMeta({ form, prefix }) {
  return (
    <Grid>
      <Grid.Col span={12}>
        <TextInput label="Title" required {...form.getInputProps(`${prefix}.title`)} />
      </Grid.Col>
      <Grid.Col span={12}>
        <Textarea label="Excerpt" rows={3} required {...form.getInputProps(`${prefix}.excerpt`)} />
      </Grid.Col>
      <Grid.Col span={{ base: 8, sm: 8 }}>
        <TextInput label="Display date" placeholder="15 Şubat 2026" required {...form.getInputProps(`${prefix}.date`)} />
      </Grid.Col>
      <Grid.Col span={{ base: 4, sm: 4 }}>
        <NumberInput label="Read time (min)" min={1} max={120} {...form.getInputProps(`${prefix}.readTime`)} />
      </Grid.Col>
    </Grid>
  );
}
