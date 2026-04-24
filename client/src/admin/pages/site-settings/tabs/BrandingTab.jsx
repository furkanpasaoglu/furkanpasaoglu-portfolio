import { ColorInput, Grid, NumberInput, Select, Switch, TextInput } from '@mantine/core';

export default function BrandingTab({ form }) {
  const br = form.getValues().branding ?? {};
  return (
    <Grid>
      <Grid.Col span={12}><TextInput label="Canonical Base URL" required {...form.getInputProps('branding.canonicalBaseUrl')} /></Grid.Col>
      <Grid.Col span={{ base: 12, sm: 6 }}><ColorInput label="Theme Color" {...form.getInputProps('branding.themeColor')} /></Grid.Col>
      <Grid.Col span={{ base: 12, sm: 6 }}><TextInput label="Favicon URL" {...form.getInputProps('branding.faviconUrl')} /></Grid.Col>
      <Grid.Col span={12}><TextInput label="Google Site Verification Token" {...form.getInputProps('branding.googleSiteVerification')} /></Grid.Col>
      <Grid.Col span={{ base: 12, sm: 6 }}>
        <Switch label="robots: index"
                checked={!!br.robotsIndex}
                onChange={(e) => form.setFieldValue('branding.robotsIndex', e.currentTarget.checked)} />
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 6 }}>
        <Switch label="robots: follow"
                checked={!!br.robotsFollow}
                onChange={(e) => form.setFieldValue('branding.robotsFollow', e.currentTarget.checked)} />
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 6 }}>
        <Select label="Sitemap changefreq"
                data={['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never']}
                {...form.getInputProps('branding.sitemapChangefreq')} />
      </Grid.Col>
      <Grid.Col span={{ base: 12, sm: 6 }}>
        <NumberInput label="Sitemap priority" min={0} max={1} step={0.1} decimalScale={1}
                     {...form.getInputProps('branding.sitemapPriority')} />
      </Grid.Col>
    </Grid>
  );
}
