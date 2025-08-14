// src/lib/i18n-server.ts
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next/initReactI18next';
import { headers } from 'next/headers';
import en from '../locales/en.json';
import pt from '../locales/pt.json';

export async function createTranslation() {
  const i18n = createInstance();
  
  // Get language from cookie
  const headersList = headers();
  const cookieHeader = headersList.get("cookie");
  const i18nextCookie = cookieHeader
    ?.split(';')
    .find(c => c.trim().startsWith('i18next='));
  const lng = i18nextCookie ? i18nextCookie.split('=')[1] : 'pt';

  await i18n
    .use(initReactI18next)
    .init({
      resources: {
        en: { translation: en },
        pt: { translation: pt },
      },
      lng: lng,
      fallbackLng: 'pt',
    });

  return {
    t: i18n.t,
    i18n,
  };
}
