import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import * as SecureStore from 'expo-secure-store';

import en from './locales/en';
import fr from './locales/fr';
import rw from './locales/rw';

export const SUPPORTED_LANGUAGES = ['en', 'fr', 'rw'] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const STORAGE_KEY = 'app_language';

const isSupported = (code?: string | null): code is AppLanguage =>
  !!code && (SUPPORTED_LANGUAGES as readonly string[]).includes(code);

/** First device language we support, otherwise English. */
const getDeviceLanguage = (): AppLanguage => {
  for (const locale of getLocales()) {
    if (isSupported(locale.languageCode)) return locale.languageCode;
  }
  return 'en';
};

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
    rw: { translation: rw },
  },
  lng: getDeviceLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnNull: false,
});

/** Applies the language the user picked previously (if any). Never rejects. */
export const loadStoredLanguage = async (): Promise<void> => {
  try {
    const stored = await SecureStore.getItemAsync(STORAGE_KEY);
    if (isSupported(stored) && stored !== i18n.language) {
      await i18n.changeLanguage(stored);
    }
  } catch (error) {
    console.error('Error loading stored language:', error);
  }
};

export const setLanguage = async (language: AppLanguage): Promise<void> => {
  await i18n.changeLanguage(language);
  try {
    await SecureStore.setItemAsync(STORAGE_KEY, language);
  } catch (error) {
    console.error('Error saving language:', error);
  }
};

export default i18n;
