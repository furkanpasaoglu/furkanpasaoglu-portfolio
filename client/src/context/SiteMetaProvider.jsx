import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { useContext } from 'react';
import { LanguageContext } from './LanguageContext';
import { publicApi } from '../api/publicApi';

export function SiteMetaProvider({ children }) {
  const { lang } = useContext(LanguageContext) ?? { lang: 'en' };
  const { data } = useQuery({
    queryKey: ['public', 'site-settings', lang],
    queryFn: () => publicApi.getSiteSettings(lang),
    staleTime: 5 * 60_000,
    retry: 0,
  });

  return (
    <>
      {data?.locale && (
        <Helmet>
          <html lang={lang} />
          <title>{data.locale.title}</title>
          <meta name="description" content={data.locale.description} />
          <meta name="keywords" content={data.locale.keywords} />
          <meta property="og:title" content={data.locale.ogTitle} />
          <meta property="og:description" content={data.locale.ogDescription} />
          <meta property="og:locale" content={data.locale.ogLocale} />
          <meta name="twitter:title" content={data.locale.twitterTitle} />
          <meta name="twitter:description" content={data.locale.twitterDescription} />
        </Helmet>
      )}
      {children}
    </>
  );
}
