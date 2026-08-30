import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../../api/adminApi';
import { Button, PageHead } from '../../ui';
import { useToast } from '../../ui/hooks';
import { useForm } from '../../ui/useForm';
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
  sectionsEnabled: {},
  analytics: { enabled: false, ga4MeasurementId: '', gtmContainerId: '' },
};

const emptyCommunications = {
  smtp: {
    enabled: false, host: '', port: 587, username: '', password: '',
    fromAddress: '', fromName: '', useStartTls: true,
  },
  autoReply: { enabled: false, subject_tr: '', subject_en: '', body_tr: '', body_en: '' },
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

const initial = () => ({
  dataTr: { ...emptyLocale, ogLocale: 'tr_TR' },
  dataEn: { ...emptyLocale },
  branding: { ...emptyBranding },
  schema: { ...emptySchema },
  operations: { ...emptyOperations, sectionsEnabled: {}, analytics: { ...emptyOperations.analytics } },
  security: { ...emptySecurity, csp: { ...emptySecurity.csp }, robotsExtraDirectives: [] },
  communications: {
    ...emptyCommunications,
    smtp: { ...emptyCommunications.smtp },
    autoReply: { ...emptyCommunications.autoReply },
  },
});

const TABS = [
  { key: 'seo', label: 'SEO', Component: SeoTab },
  { key: 'social', label: 'Sosyal', Component: SocialTab },
  { key: 'schema', label: 'Schema', Component: SchemaTab },
  { key: 'branding', label: 'Marka', Component: BrandingTab },
  { key: 'operations', label: 'İşletim', Component: OperationsTab },
  { key: 'security', label: 'Güvenlik', Component: SecurityTab },
  { key: 'communications', label: 'İletişim', Component: CommunicationsTab },
];

export default function SiteSettingsEdit() {
  const qc = useQueryClient();
  const toast = useToast();
  const [tab, setTab] = useState('seo');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'site-settings'],
    queryFn: () => adminApi.getSiteSettings(),
  });

  const form = useForm({ initial: initial() });
  const { reset } = form;

  useEffect(() => {
    if (!data) return;
    const base = initial();
    reset({
      dataTr: { ...base.dataTr, ...data.dataTr },
      dataEn: { ...base.dataEn, ...data.dataEn },
      branding: { ...base.branding, ...data.branding },
      schema: { ...base.schema, ...data.schema },
      operations: {
        ...base.operations,
        ...data.operations,
        sectionsEnabled: { ...(data.operations?.sectionsEnabled ?? {}) },
        analytics: { ...base.operations.analytics, ...(data.operations?.analytics ?? {}) },
      },
      security: {
        ...base.security,
        ...data.security,
        csp: { ...base.security.csp, ...(data.security?.csp ?? {}) },
        robotsExtraDirectives: data.security?.robotsExtraDirectives ?? [],
      },
      communications: {
        ...base.communications,
        ...data.communications,
        smtp: { ...base.communications.smtp, ...(data.communications?.smtp ?? {}) },
        autoReply: { ...base.communications.autoReply, ...(data.communications?.autoReply ?? {}) },
      },
    });
  }, [data, reset]);

  const saveMut = useMutation({
    mutationFn: (values) => adminApi.updateSiteSettings(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'site-settings'] });
      qc.invalidateQueries({ queryKey: ['public', 'site-settings'] });
      toast('Kaydedildi, site yeniden üretildi.', 'ok');
    },
    onError: (e) => toast(e?.message ?? 'Kaydedilemedi.', 'err'),
  });

  const renderMut = useMutation({
    mutationFn: () => adminApi.manualRenderSite(),
    onSuccess: () => toast('Site yeniden üretildi.', 'ok'),
    onError: (e) => toast(e?.message ?? 'Üretilemedi.', 'err'),
  });

  const testMut = useMutation({
    mutationFn: () => adminApi.testSmtp({ to: form.value('communications.adminNotifyEmail') }),
    onSuccess: () => toast('Test e-postası gönderildi.', 'ok'),
    onError: (e) => toast(e?.message ?? 'Test başarısız.', 'err'),
  });

  const submit = (e) => {
    e?.preventDefault?.();
    saveMut.mutate(form.values);
  };

  if (isLoading) return <p className="fp-loading">Ayarlar okunuyor…</p>;

  const Active = TABS.find((t) => t.key === tab)?.Component ?? SeoTab;

  return (
    <form onSubmit={submit}>
      <PageHead eyebrow="Yapılandırma" title="Ayarlar">
        <Button busy={renderMut.isPending} onClick={() => renderMut.mutate()}>Siteyi yeniden üret</Button>
        <Button variant="primary" busy={saveMut.isPending} onClick={submit}>Kaydet</Button>
      </PageHead>

      <div className="fp-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={t.key === tab ? 'fp-tab fp-tab-on' : 'fp-tab'}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="fp-form">
        <section className="fp-panel">
          <Active
            form={form}
            onTestSmtp={tab === 'communications' ? () => testMut.mutate() : undefined}
            testing={testMut.isPending}
          />
        </section>
      </div>
    </form>
  );
}
