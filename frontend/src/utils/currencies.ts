import { CurrencyCode } from '../types';

export interface CurrencyMetadata {
  code: CurrencyCode;
  name: string;
  symbol: string;
  decimals: number;
  flag: string;
  label: string; // e.g. "US Dollar (USD)"
  region: string;
}

export const SUPPORTED_CURRENCIES: CurrencyMetadata[] = [
  {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    decimals: 2,
    flag: '🇺🇸',
    label: 'US Dollar (USD)',
    region: 'United States & Global',
  },
  {
    code: 'CAD',
    name: 'Canadian Dollar',
    symbol: 'CA$',
    decimals: 2,
    flag: '🇨🇦',
    label: 'Canadian Dollar (CAD)',
    region: 'Canada',
  },
  {
    code: 'MXN',
    name: 'Mexican Peso',
    symbol: 'MX$',
    decimals: 2,
    flag: '🇲🇽',
    label: 'Mexican Peso (MXN)',
    region: 'Mexico',
  },
  {
    code: 'BRL',
    name: 'Brazilian Real',
    symbol: 'R$',
    decimals: 2,
    flag: '🇧🇷',
    label: 'Brazilian Real (BRL)',
    region: 'Brazil',
  },
  {
    code: 'ARS',
    name: 'Argentine Peso',
    symbol: 'AR$',
    decimals: 2,
    flag: '🇦🇷',
    label: 'Argentine Peso (ARS)',
    region: 'Argentina',
  },
  {
    code: 'CLP',
    name: 'Chilean Peso',
    symbol: 'CLP$',
    decimals: 0, // Chilean peso typically has 0 decimal places
    flag: '🇨🇱',
    label: 'Chilean Peso (CLP)',
    region: 'Chile',
  },
  {
    code: 'COP',
    name: 'Colombian Peso',
    symbol: 'COP$',
    decimals: 2,
    flag: '🇨🇴',
    label: 'Colombian Peso (COP)',
    region: 'Colombia',
  },
  {
    code: 'PEN',
    name: 'Peruvian Sol',
    symbol: 'S/',
    decimals: 2,
    flag: '🇵🇪',
    label: 'Peruvian Sol (PEN)',
    region: 'Peru',
  },
  {
    code: 'UYU',
    name: 'Uruguayan Peso',
    symbol: '$U',
    decimals: 2,
    flag: '🇺🇾',
    label: 'Uruguayan Peso (UYU)',
    region: 'Uruguay',
  },
  {
    code: 'PYG',
    name: 'Paraguayan Guaraní',
    symbol: '₲',
    decimals: 0, // Paraguayan Guaraní has 0 decimal places
    flag: '🇵🇾',
    label: 'Paraguayan Guaraní (PYG)',
    region: 'Paraguay',
  },
  {
    code: 'BOB',
    name: 'Bolivian Boliviano',
    symbol: 'Bs',
    decimals: 2,
    flag: '🇧🇴',
    label: 'Bolivian Boliviano (BOB)',
    region: 'Bolivia',
  },
  {
    code: 'GYD',
    name: 'Guyanese Dollar',
    symbol: 'G$',
    decimals: 2,
    flag: '🇬🇾',
    label: 'Guyanese Dollar (GYD)',
    region: 'Guyana',
  },
  {
    code: 'SRD',
    name: 'Surinamese Dollar',
    symbol: 'Sr$',
    decimals: 2,
    flag: '🇸🇷',
    label: 'Surinamese Dollar (SRD)',
    region: 'Suriname',
  },
  {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    decimals: 2,
    flag: '🇪🇺',
    label: 'Euro (EUR)',
    region: 'European Union',
  },
];

export const CURRENCY_MAP: Record<string, CurrencyMetadata> = SUPPORTED_CURRENCIES.reduce(
  (acc, curr) => {
    acc[curr.code] = curr;
    return acc;
  },
  {} as Record<string, CurrencyMetadata>
);

// Fallback for legacy XAF
CURRENCY_MAP['XAF'] = {
  code: 'XAF',
  name: 'FCFA CEMAC',
  symbol: 'FCFA',
  decimals: 0,
  flag: '🇨🇲',
  label: 'FCFA CEMAC (XAF)',
  region: 'Central Africa',
};

export function getCurrencyMeta(code: string): CurrencyMetadata {
  return (
    CURRENCY_MAP[code] || {
      code: code as CurrencyCode,
      name: code,
      symbol: code,
      decimals: 2,
      flag: '🌐',
      label: `${code} (${code})`,
      region: 'International',
    }
  );
}

// Exchange rates normalized against 1 USD base
export const USD_EXCHANGE_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.92,
  CAD: 1.36,
  MXN: 18.25,
  BRL: 5.45,
  ARS: 960.0,
  CLP: 940.0,
  COP: 4150.0,
  PEN: 3.75,
  UYU: 40.2,
  PYG: 7600.0,
  BOB: 6.91,
  GYD: 209.0,
  SRD: 35.5,
  XAF: 604.0,
};

export function getExchangeRate(from: string, to: string): number {
  if (from === to) return 1.0;
  const rateFrom = USD_EXCHANGE_RATES[from] || 1.0;
  const rateTo = USD_EXCHANGE_RATES[to] || 1.0;
  return rateTo / rateFrom;
}

export function convertCurrency(amount: number, from: string, to: string): number {
  if (from === to) return amount;
  const rate = getExchangeRate(from, to);
  const raw = amount * rate;
  const meta = getCurrencyMeta(to);
  return meta.decimals === 0 ? Math.round(raw) : Number(raw.toFixed(meta.decimals));
}

export { formatCurrency } from './formatters';
