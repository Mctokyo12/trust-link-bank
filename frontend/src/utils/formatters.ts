import { CurrencyCode } from '../types';
import { getCurrencyMeta, SUPPORTED_CURRENCIES } from './currencies';
import i18n from '../i18n';

function getActiveLocale(explicitLocale?: string): string {
  if (explicitLocale) return explicitLocale;
  const lang = i18n.language || localStorage.getItem('novapay_lang') || 'en';
  const map: Record<string, string> = {
    en: 'en-US',
    es: 'es-ES',
    fr: 'fr-FR',
    pt: 'pt-BR',
    ar: 'ar-SA',
    sw: 'sw-KE',
  };
  return map[lang] || lang || 'en-US';
}

export function formatCurrency(
  amount: number,
  currency: CurrencyCode | string,
  locale?: string
): string {
  const meta = getCurrencyMeta(currency);
  const decimals = meta.decimals;
  const targetLocale = getActiveLocale(locale);

  const formattedNum = new Intl.NumberFormat(targetLocale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount || 0);

  // For FCFA (XAF/XOF), append code/symbol at end, for others use standard symbol prefix
  if (meta.code === 'XAF') {
    return `${formattedNum} FCFA`;
  }

  return `${meta.symbol} ${formattedNum}`;
}

export function formatNumberOnly(
  amount: number,
  currency: CurrencyCode | string,
  locale?: string
): string {
  const meta = getCurrencyMeta(currency);
  const decimals = meta.decimals;
  const targetLocale = getActiveLocale(locale);

  return new Intl.NumberFormat(targetLocale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount || 0);
}

export function generateRef(prefix = 'TLB-TRX'): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${dateStr}-${rand}`;
}

export function formatDate(dateString: string, locale?: string): string {
  try {
    const d = new Date(dateString);
    const targetLocale = getActiveLocale(locale);
    return new Intl.DateTimeFormat(targetLocale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateString;
  }
}

export { getCurrencyMeta, SUPPORTED_CURRENCIES };
