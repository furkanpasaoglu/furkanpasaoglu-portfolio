import { Button, Group, LoadingOverlay, Paper, Stack, Tabs, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconDeviceFloppy, IconRefresh } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { adminApi } from '../../../api/adminApi';
import SeoTab from './tabs/SeoTab';
import SocialTab from './tabs/SocialTab';
import SchemaTab from './tabs/SchemaTab';
import BrandingTab from './tabs/BrandingTab';
import OperationsTab from './tabs/OperationsTab';
import SecurityTab from './tabs/SecurityTab';
import CommunicationsTab from './tabs/CommunicationsTab';

const emptyLocale = {
  title: '', description: '', keywords: '',
  ogTitle: '', ogDescription: '', ogImageAlt: '',
  twitterTitle: '', twitterDescription: '',
  siteName: '', ogLocale: 'en_US',
};

const emptyBranding = {
  canonicalBaseUrl: 'https://example.com', themeColor: '#0ea5e9',
  faviconUrl: '/favicon.svg', ogImageUrl: '', ogImageWidth: 1200, ogImageHeight: 630,
  twitterImageUrl: '', twitterCard: 'summary_large_image',
  googleSiteVerification: '', robotsIndex: true, robotsFollow: true,
  sitemapChangefreq: 'monthly', sitemapPriority: 1.0,
};

const emptyOperations = {
  maintenanceMode: false,
  maintenanceMessage_tr: '',
  maintenanceMessage_en: '',
  sectionsEnabled: { hero: true, about: true, skills: true, projects: true, experience: true, blog: true, contact: true },
  analytics: { enabled: false, ga4MeasurementId: '', gtmContainerId: '' },
};

const emptyCommunications = {
  smtp: {
    enabled: false, host: '', port: 587, username: '', password: '',
    fromAddress: '', fromName: '', useStartTls: true,
  },
  autoReply: {
    enabled: false, subject_tr: '', subject_en: '', body_tr: '', body_en: '',
  },
  adminNotifyEmail: '',
};

const emptySecurity = {
  csp: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    fontSrc: ["'self'", 'https://fonts.gstatic.com'],
    imgSrc: ["'self'", 'data:', 'https:'],
    connectSrc: ["'self'"],
    frameSrc: [],
  },
  robotsExtraDirectives: [],
};

const emptySchema = {
  firstName: '', lastName: '', email: '', addressCountry: 'TR',
  dateCreated: '2025-01-01', sameAs: [],
  jobTitle_tr: '', jobTitle_en: '',
  personDescription_tr: '', personDescription_en: '',
  addressLocality_tr: '', addressLocality_en: '',
  knowsAbout_tr: [], knowsAbout_en: [],
  worksForName_tr: '', worksForName_en: '',
  alumniOfName_tr: '', alumniOfName_en: '',
};

export default function SiteSettingsEdit() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'site-settings'],
    queryFn: () => adminApi.getSiteSettings(),
  });

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      dataTr: { ...emptyLocale, ogLocale: 'tr_TR' },
      dataEn: { ...emptyLocale },
      branding: { ...emptyBranding },
      schema: { ...emptySchema },
      operations: { ...emptyOperations, sectionsEnabled: { ...emptyOperations.sectionsEnabled }, analytics: { ...emptyOperations.analytics } },
      security: { ...emptySecurity, csp: { ...emptySecurity.csp }, robotsExtraDirectives: [] },
      communications: {
        ...emptyCommunications,
        smtp: { ...emptyCommunications.smtp },
        autoReply: { ...emptyCommunications.autoReply },
      },
    },
  });

  useEffect(() => {
    if (data) {
      form.setValues({
        dataTr: { ...emptyLocale, ogLocale: 'tr_TR', ...data.dataTr },
        dataEn: { ...emptyLocale, ...data.dataEn },
        branding: { ...emptyBranding, ...data.branding },
        schema: { ...emptySchema, ...data.schema },
        operations: {
          ...emptyOperations,
          ...data.operations,
          sectionsEnabled: { ...emptyOperations.sectionsEnabled, ...(data.operations?.sectionsEnabled ?? {}) },
          analytics: { ...emptyOperations.analytics, ...(data.operations?.analytics ?? {}) },
        },
        security: {
          ...emptySecurity,
          ...data.security,
          csp: { ...emptySecurity.csp, ...(data.security?.csp ?? {}) },
          robotsExtraDirectives: data.security?.robotsExtraDirectives ?? [],
        },
        communications: {
          ...emptyCommunications,
          ...data.communications,
          smtp: { ...emptyCommunications.smtp, ...(data.communications?.smtp ?? {}) },
          autoReply: { ...emptyCommunications.autoReply, ...(data.communications?.autoReply ?? {}) },
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const saveMut = useMutation({
    mutationFn: (values) => adminApi.updateSiteSettings(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'site-settings'] });
      qc.invalidateQueries({ queryKey: ['public', 'site-settings'] });
      notifications.show({ message: 'Saved and site re-rendered', color: 'green' });
    },
    onError: (e) => notifications.show({ title: 'Save failed', message: e.message, color: 'red' }),
  });

  const renderMut = useMutation({
    mutationFn: () => adminApi.manualRenderSite(),
    onSuccess: () => notifications.show({ message: 'Rendered', color: 'green' }),
    onError: (e) => notifications.show({ title: 'Render failed', message: e.message, color: 'red' }),
  });

  const onSubmit = form.onSubmit((values) => saveMut.mutate(values));

  return (
    <Stack gap="lg" pos="relative">
      <LoadingOverlay visible={isLoading} />
      <Group justify="space-between">
        <Title order={2}>Site Settings</Title>
        <Group>
          <Button variant="subtle" leftSection={<IconRefresh size={16} />}
            onClick={() => renderMut.mutate()} loading={renderMut.isPending}>
            Manual re-render
          </Button>
          <Button onClick={onSubmit} loading={saveMut.isPending} leftSection={<IconDeviceFloppy size={16} />}>
            Save
          </Button>
        </Group>
      </Group>

      <form onSubmit={onSubmit}>
        <Paper withBorder p="lg" radius="md">
          <Tabs defaultValue="seo">
            <Tabs.List>
              <Tabs.Tab value="seo">SEO</Tabs.Tab>
              <Tabs.Tab value="social">Social</Tabs.Tab>
              <Tabs.Tab value="schema">Schema</Tabs.Tab>
              <Tabs.Tab value="branding">Branding & Tech</Tabs.Tab>
              <Tabs.Tab value="operations">Operations</Tabs.Tab>
              <Tabs.Tab value="security">Security</Tabs.Tab>
              <Tabs.Tab value="communications">Communications</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="seo" pt="md"><SeoTab form={form} /></Tabs.Panel>
            <Tabs.Panel value="social" pt="md"><SocialTab form={form} /></Tabs.Panel>
            <Tabs.Panel value="schema" pt="md"><SchemaTab form={form} /></Tabs.Panel>
            <Tabs.Panel value="branding" pt="md"><BrandingTab form={form} /></Tabs.Panel>
            <Tabs.Panel value="operations" pt="md"><OperationsTab form={form} /></Tabs.Panel>
            <Tabs.Panel value="security" pt="md"><SecurityTab form={form} /></Tabs.Panel>
            <Tabs.Panel value="communications" pt="md"><CommunicationsTab form={form} /></Tabs.Panel>
          </Tabs>
        </Paper>
      </form>
    </Stack>
  );
}
