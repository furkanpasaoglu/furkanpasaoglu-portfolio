import { Grid, NumberInput, Select, Stack, Tabs, Textarea, TextInput } from '@mantine/core';

function LocaleFields({ form, prefix }) {
  return (
    <Grid>
      <Grid.Col span={12}><TextInput label="OG Title" required {...form.getInputProps(`${prefix}.ogTitle`)} /></Grid.Col>
      <Grid.Col span={12}><Textarea label="OG Description" required minRows={2} autosize {...form.getInputProps(`${prefix}.ogDescription`)} /></Grid.Col>
      <Grid.Col span={12}><TextInput label="OG Image Alt" required {...form.getInputProps(`${prefix}.ogImageAlt`)} /></Grid.Col>
      <Grid.Col span={12}><TextInput label="Twitter Title" required {...form.getInputProps(`${prefix}.twitterTitle`)} /></Grid.Col>
      <Grid.Col span={12}><Textarea label="Twitter Description" required minRows={2} autosize {...form.getInputProps(`${prefix}.twitterDescription`)} /></Grid.Col>
      <Grid.Col span={12}><TextInput label="Site Name" required {...form.getInputProps(`${prefix}.siteName`)} /></Grid.Col>
    </Grid>
  );
}

export default function SocialTab({ form }) {
  return (
    <Stack gap="lg">
      <Tabs defaultValue="tr" variant="pills">
        <Tabs.List><Tabs.Tab value="tr">TR</Tabs.Tab><Tabs.Tab value="en">EN</Tabs.Tab></Tabs.List>
        <Tabs.Panel value="tr" pt="md"><LocaleFields form={form} prefix="dataTr" /></Tabs.Panel>
        <Tabs.Panel value="en" pt="md"><LocaleFields form={form} prefix="dataEn" /></Tabs.Panel>
      </Tabs>
      <Grid>
        <Grid.Col span={12}><TextInput label="OG Image URL" {...form.getInputProps('branding.ogImageUrl')} /></Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}><NumberInput label="OG Image Width" {...form.getInputProps('branding.ogImageWidth')} /></Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}><NumberInput label="OG Image Height" {...form.getInputProps('branding.ogImageHeight')} /></Grid.Col>
        <Grid.Col span={12}><TextInput label="Twitter Image URL" {...form.getInputProps('branding.twitterImageUrl')} /></Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Select label="Twitter Card"
                  data={['summary', 'summary_large_image']}
                  {...form.getInputProps('branding.twitterCard')} />
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
