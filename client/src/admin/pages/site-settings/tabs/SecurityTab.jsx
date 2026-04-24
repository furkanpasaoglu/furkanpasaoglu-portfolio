import { Code, Paper, Stack, TagsInput, Title, Text } from '@mantine/core';

const CSP_KEYS = [
  ['defaultSrc', 'default-src'],
  ['scriptSrc', 'script-src'],
  ['styleSrc', 'style-src'],
  ['fontSrc', 'font-src'],
  ['imgSrc', 'img-src'],
  ['connectSrc', 'connect-src'],
  ['frameSrc', 'frame-src'],
];

const ANALYTICS_EXTENSIONS = {
  scriptSrc: ['https://www.googletagmanager.com', 'https://www.google-analytics.com'],
  connectSrc: ['https://www.google-analytics.com', 'https://*.analytics.google.com'],
  imgSrc: ['https://www.google-analytics.com'],
  frameSrc: ['https://www.googletagmanager.com'],
};

function buildCspPreview(csp, analyticsOn) {
  const parts = [];
  for (const [key, directive] of CSP_KEYS) {
    const values = new Set(csp?.[key] ?? []);
    if (analyticsOn && ANALYTICS_EXTENSIONS[key]) {
      for (const v of ANALYTICS_EXTENSIONS[key]) values.add(v);
    }
    if (values.size === 0 && directive === 'frame-src') continue;
    parts.push(`${directive} ${[...values].join(' ')};`);
  }
  return parts.join(' ');
}

function buildRobotsPreview(extras, robotsIndex, canonicalBase) {
  const directive = robotsIndex ? 'Allow: /' : 'Disallow: /';
  const extraBlock = (extras ?? []).filter(Boolean).join('\n');
  const body = extraBlock ? `${directive}\n\n${extraBlock}` : directive;
  return `User-agent: *\n${body}\n\nSitemap: ${(canonicalBase || '').replace(/\/$/, '')}/sitemap.xml\n`;
}

export default function SecurityTab({ form }) {
  const v = form.getValues();
  const csp = v.security?.csp ?? {};
  const extras = v.security?.robotsExtraDirectives ?? [];
  const analyticsOn = !!v.operations?.analytics?.enabled;
  const robotsIndex = v.branding?.robotsIndex !== false;
  const canonical = v.branding?.canonicalBaseUrl ?? '';

  return (
    <Stack gap="xl">
      <Paper withBorder p="md" radius="md">
        <Stack gap="sm">
          <Title order={4}>Content Security Policy</Title>
          <Text size="xs" c="dimmed">
            Source list per directive. Literal values (&#39;self&#39;, data:) or full URLs.
            When Analytics is enabled, GA/GTM hosts are appended automatically (visible in the preview).
          </Text>
          {CSP_KEYS.map(([key, label]) => (
            <TagsInput
              key={key}
              label={label}
              value={csp[key] ?? []}
              onChange={(vals) => form.setFieldValue(`security.csp.${key}`, vals)}
            />
          ))}
          <Text size="xs" c="dimmed">Preview (final CSP):</Text>

          <Code block>{buildCspPreview(csp, analyticsOn)}</Code>
        </Stack>
      </Paper>

      <Paper withBorder p="md" radius="md">
        <Stack gap="sm">
          <Title order={4}>Robots Extras</Title>
          <Text size="xs" c="dimmed">
            Extra directive lines. Each line must start with <Code>Allow:</Code>, <Code>Disallow:</Code>,
            <Code>Crawl-delay:</Code>, <Code>User-agent:</Code>, or <Code>Sitemap:</Code>.
          </Text>
          <TagsInput
            label="Extra lines"
            placeholder="Disallow: /admin/"
            value={extras}
            onChange={(vals) => form.setFieldValue('security.robotsExtraDirectives', vals)}
          />
          <Text size="xs" c="dimmed">Preview (robots.txt):</Text>

          <Code block>{buildRobotsPreview(extras, robotsIndex, canonical)}</Code>
        </Stack>
      </Paper>
    </Stack>
  );
}
