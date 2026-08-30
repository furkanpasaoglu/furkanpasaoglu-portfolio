import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import { publicApi } from '../api/publicApi';

const DEFAULT_OPS = {
  maintenanceMode: false,
  maintenanceMessage_tr: '',
  maintenanceMessage_en: '',
  // Empty on purpose: a key that is absent counts as visible, so a settings
  // row written before a sheet existed never hides it.
  sectionsEnabled: {},
  analytics: { enabled: false, ga4MeasurementId: '', gtmContainerId: '' },
};

/**
 * Public-site read of the Operations block (section toggles + maintenance flag + analytics IDs).
 * Reuses the SiteMetaProvider query so no extra request is made when both are mounted.
 */
export function useSiteOperations() {
  const { lang } = useContext(LanguageContext) ?? { lang: 'en' };
  const { data } = useQuery({
    queryKey: ['public', 'site-settings', lang],
    queryFn: () => publicApi.getSiteSettings(lang),
    staleTime: 5 * 60_000,
    retry: 0,
  });
  if (!data?.operations) return DEFAULT_OPS;
  return {
    ...DEFAULT_OPS,
    ...data.operations,
    sectionsEnabled: data.operations.sectionsEnabled ?? {},
    analytics: { ...DEFAULT_OPS.analytics, ...(data.operations.analytics ?? {}) },
  };
}
