import { Grid, Tabs, TagsInput, Textarea, TextInput } from '@mantine/core';

function LocaleFields({ form, prefix }) {
  const keywordsStr = form.getValues()[prefix]?.keywords ?? '';
  return (
    <Grid>
      <Grid.Col span={12}><TextInput label="Title" required {...form.getInputProps(`${prefix}.title`)} /></Grid.Col>
      <Grid.Col span={12}><Textarea label="Description" required minRows={2} autosize {...form.getInputProps(`${prefix}.description`)} /></Grid.Col>
      <Grid.Col span={12}>
        <TagsInput
          label="Keywords"
          description="Comma-separated keywords"
          value={keywordsStr.split(',').map((k) => k.trim()).filter(Boolean)}
          onChange={(vals) => form.setFieldValue(`${prefix}.keywords`, vals.join(', '))}
        />
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 6 }}>
        <TextInput label="OG Locale" placeholder="tr_TR" {...form.getInputProps(`${prefix}.ogLocale`)} />
      </Grid.Col>
    </Grid>
  );
}

export default function SeoTab({ form }) {
  return (
    <Tabs defaultValue="tr" variant="pills">
      <Tabs.List><Tabs.Tab value="tr">TR</Tabs.Tab><Tabs.Tab value="en">EN</Tabs.Tab></Tabs.List>
      <Tabs.Panel value="tr" pt="md"><LocaleFields form={form} prefix="dataTr" /></Tabs.Panel>
      <Tabs.Panel value="en" pt="md"><LocaleFields form={form} prefix="dataEn" /></Tabs.Panel>
    </Tabs>
  );
}
