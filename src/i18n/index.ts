import Vue from 'vue';
import VueI18n from 'vue-i18n';
import en from './locales/en.json';

Vue.use(VueI18n);

export type LocaleCode = 'en' | 'zh-CN' | 'zh-TW';

export interface LocaleOption {
  code: LocaleCode;
  name: string;
  nativeName: string;
}

export const availableLocales: LocaleOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文' },
];

// Detect browser language
function detectBrowserLocale(): LocaleCode {
  const browserLang = navigator.language || (navigator as any).userLanguage || 'en';
  const shortLang = browserLang.split('-')[0];

  // Check for exact match first
  const exactMatch = availableLocales.find(l => l.code === browserLang);
  if (exactMatch) return exactMatch.code;

  // Check for language prefix match (e.g., 'zh' -> 'zh-CN')
  if (shortLang === 'zh') {
    // Default to simplified Chinese for generic 'zh'
    return browserLang.includes('TW') || browserLang.includes('HK') ? 'zh-TW' : 'zh-CN';
  }

  const prefixMatch = availableLocales.find(l => l.code.startsWith(shortLang));
  if (prefixMatch) return prefixMatch.code;

  return 'en';
}

// Get initial locale from localStorage or browser
function getInitialLocale(): LocaleCode {
  const stored = localStorage.getItem('locale') as LocaleCode | null;
  if (stored && availableLocales.some(l => l.code === stored)) {
    return stored;
  }
  return detectBrowserLocale();
}

const i18n = new VueI18n({
  locale: getInitialLocale(),
  fallbackLocale: 'en',
  messages: { en },
  silentFallbackWarn: true,
});

// Dynamic locale loading with caching
const loadedLocales: Set<string> = new Set(['en']);

export async function loadLocale(locale: LocaleCode): Promise<void> {
  if (loadedLocales.has(locale)) {
    i18n.locale = locale;
    localStorage.setItem('locale', locale);
    document.documentElement.setAttribute('lang', locale);
    return;
  }

  try {
    const messages = await import(
      /* webpackChunkName: "locale-[request]" */
      `./locales/${locale}.json`
    );
    i18n.setLocaleMessage(locale, messages.default || messages);
    loadedLocales.add(locale);
    i18n.locale = locale;
    localStorage.setItem('locale', locale);
    document.documentElement.setAttribute('lang', locale);
  } catch (error) {
    console.error(`Failed to load locale: ${locale}`, error);
    // Fallback to English
    i18n.locale = 'en';
  }
}

// Set initial HTML lang attribute
document.documentElement.setAttribute('lang', i18n.locale);

// Load initial locale if not English
const initialLocale = getInitialLocale();
if (initialLocale !== 'en') {
  // Load the locale asynchronously on startup
  loadLocale(initialLocale);
}

export default i18n;
