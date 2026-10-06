export type UserRole = 'client' | 'support' | 'admin' | 'super_admin';
export type UserStatus = 'active' | 'suspended';

export type CurrencyCode =
  | 'USD'
  | 'CAD'
  | 'MXN'
  | 'BRL'
  | 'ARS'
  | 'CLP'
  | 'COP'
  | 'PEN'
  | 'UYU'
  | 'PYG'
  | 'BOB'
  | 'GYD'
  | 'SRD'
  | 'EUR'
  | 'XAF';

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password?: string;
  confirmPassword?: string;
  country: string;
  countryCode: string;
  flag?: string;
  language: string;
  currency_code: CurrencyCode;
  currency_id?: string;
  termsAccepted?: boolean;
}

export interface UpdateProfilePayload {
  first_name?: string;
  last_name?: string;
  name?: string;
  phone?: string;
  country?: string;
  country_code?: string;
  flag?: string;
  language?: string;
  avatar_url?: string;
}

export interface User {
  id: string;
  name: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone: string;
  country: string;
  country_code: string;
  flag: string;
  role: UserRole;
  status: UserStatus;
  avatar_url?: string;
  novatag: string;
  preferred_currency: CurrencyCode;
  language?: string;
  created_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  currency: CurrencyCode;
  account_number: string;
  balance: number; // Derived from entries
  available_balance: number; // Derived
  status: 'active' | 'frozen' | 'closed';
  created_at: string;
}

export type TransactionType =
  | 'transfer_p2p'
  | 'transfer_momo'
  | 'transfer_bank'
  | 'exchange'
  | 'deposit'
  | 'withdrawal'
  | 'card_payment';

export type TransactionStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface Transaction {
  id: string;
  reference: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: CurrencyCode;
  fee: number;
  description: string;
  created_at: string;
  sender_id?: string;
  receiver_id?: string;
  recipient_name?: string;
  recipient_identifier?: string;
  sender_name?: string;
  operator_ref?: string;
  metadata?: Record<string, any>;
}

export type EntryDirection = 'debit' | 'credit';

export interface TransactionEntry {
  id: string;
  transaction_id: string;
  wallet_id: string;
  direction: EntryDirection;
  amount: number;
  created_at: string;
}

export interface Transfer {
  id: string;
  transaction_id: string;
  sender_id: string;
  receiver_id?: string;
  receiver_info?: {
    type: 'novapay' | 'momo' | 'bank';
    provider?: string;
    identifier: string;
    name: string;
  };
  created_at: string;
}

export interface Beneficiary {
  id: string;
  user_id: string;
  beneficiary_user_id?: string;
  alias: string;
  full_name: string;
  type: 'novapay' | 'momo' | 'bank';
  identifier: string;
  provider?: string; // 'MTN' | 'Orange' | 'Wave' | 'SEPA' | 'SWIFT'
  avatar_url?: string;
  currency: CurrencyCode;
  created_at: string;
}

export interface ExchangeRate {
  id: string;
  base_currency: CurrencyCode;
  quote_currency: CurrencyCode;
  rate: number;
  effective_at: string;
}

export interface FeeConfig {
  id: string;
  type: string;
  currency: CurrencyCode;
  fixed_amount: number;
  percentage: number;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  type: 'transaction' | 'security' | 'system';
  title: string;
  body: string;
  read_at: string | null;
  created_at: string;
  link?: string;
}

export interface KycProfile {
  id: string;
  user_id: string;
  status: 'unverified' | 'pending' | 'verified' | 'rejected';
  level: 1 | 2 | 3;
  document_type?: string;
  document_number?: string;
  submitted_at?: string;
  verified_at?: string;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  actor_name: string;
  action: string;
  entity: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  device: string;
  browser: string;
  ip: string;
  location: string;
  is_current: boolean;
  last_active: string;
}
