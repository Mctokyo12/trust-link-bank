import { CurrencyCode } from '../types';

export function formatCurrency(amount: number, currency: CurrencyCode, locale = 'fr-FR'): string {
  if (currency === 'XAF') {
    return new Intl.NumberFormat(locale, {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(amount) + ' FCFA';
  }

  if (currency === 'USD') {
    return '$ ' + new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  if (currency === 'EUR') {
    return '€ ' + new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  return `${amount} ${currency}`;
}

export function formatNumberOnly(amount: number, currency: CurrencyCode, locale = 'fr-FR'): string {
  if (currency === 'XAF') {
    return new Intl.NumberFormat(locale, {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(amount);
  }

  return new Intl.NumberFormat(locale === 'fr-FR' ? 'fr-FR' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function generateRef(prefix = 'NP-TRX'): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${dateStr}-${rand}`;
}

export function formatDate(dateString: string, locale = 'fr-FR'): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat(locale, {
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
