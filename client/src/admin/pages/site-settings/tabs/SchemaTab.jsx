import { Grid, Stack, Tabs, TagsInput, Textarea, TextInput } from '@mantine/core';

function LocaleSchemaFields({ form, lang }) {
  return (
    <Grid>
      <Grid.Col span={12}><TextInput label="Job Title" required {...form.getInputProps(`schema.jobTitle_${lang}`)} /></Grid.Col>
      <Grid.Col span={12}><Textarea label="Person Description" required minRows={3} autosize {...form.getInputProps(`schema.personDescription_${lang}`)} /></Grid.Col>
      <Grid.Col span={12}><TextInput label="Address Locality" required {...form.getInputProps(`schema.addressLocality_${lang}`)} /></Grid.Col>
      <Grid.Col span={12}>
        <TagsInput label="Knows About"
                   value={form.getValues().schema?.[`knowsAbout_${lang}`] ?? []}
                   onChange={(v) => form.setFieldValue(`schema.knowsAbout_${lang}`, v)} />
      </Grid.Col>
      <Grid.Col span={12}><TextInput label="Works For (Organization Name)" required {...form.getInputProps(`schema.worksForName_${lang}`)} /></Grid.Col>
      <Grid.Col span={12}><TextInput label="Alumni Of (Organization Name)" required {...form.getInputProps(`schema.alumniOfName_${lang}`)} /></Grid.Col>
    </Grid>
  );
}

export default function SchemaTab({ form }) {
  return (
    <Stack gap="lg">
      <Grid>
        <Grid.Col span={{ base: 12, sm: 6 }}><TextInput label="First Name" required {...form.getInputProps('schema.firstName')} /></Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}><TextInput label="Last Name" required {...form.getInputProps('schema.lastName')} /></Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}><TextInput label="Email" required type="email" {...form.getInputProps('schema.email')} /></Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}><TextInput label="Country Code (ISO)" required {...form.getInputProps('schema.addressCountry')} /></Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}><TextInput label="Date Created (YYYY-MM-DD)" required {...form.getInputProps('schema.dateCreated')} /></Grid.Col>
        <Grid.Col span={12}>
          <TagsInput label="sameAs (social URLs)"
                     value={form.getValues().schema?.sameAs ?? []}
                     onChange={(v) => form.setFieldValue('schema.sameAs', v)} />
        </Grid.Col>
      </Grid>
      <Tabs defaultValue="tr" variant="pills">
        <Tabs.List><Tabs.Tab value="tr">TR</Tabs.Tab><Tabs.Tab value="en">EN</Tabs.Tab></Tabs.List>
        <Tabs.Panel value="tr" pt="md"><LocaleSchemaFields form={form} lang="tr" /></Tabs.Panel>
        <Tabs.Panel value="en" pt="md"><LocaleSchemaFields form={form} lang="en" /></Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
