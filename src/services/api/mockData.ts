import {
  User,
  Wallet,
  Transaction,
  TransactionEntry,
  Beneficiary,
  ExchangeRate,
  FeeConfig,
  NotificationItem,
  KycProfile,
  AuditLog,
  UserSession,
} from '../../types';

const STORAGE_KEY = 'novapay_database_v1';

export interface DatabaseState {
  users: User[];
  wallets: Wallet[];
  transactions: Transaction[];
  transaction_entries: TransactionEntry[];
  beneficiaries: Beneficiary[];
  exchange_rates: ExchangeRate[];
  fees: FeeConfig[];
  notifications: NotificationItem[];
  kyc_profiles: KycProfile[];
  audit_logs: AuditLog[];
  sessions: UserSession[];
  idempotency_keys: Record<string, { transaction_id: string; timestamp: number }>;
}

const initialData: DatabaseState = {
  users: [
    {
      id: 'usr_amina',
      name: 'Amina Diallo',
      email: 'amina.diallo@novapay.africa',
      phone: '+237 690 45 89 45',
      country: 'Cameroun',
      country_code: '+237',
      flag: '🇨🇲',
      role: 'client',
      status: 'active',
      novatag: '@amina.diallo',
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      created_at: '2025-01-10T08:30:00Z',
    },
    {
      id: 'usr_admin',
      name: 'Alain Ndongo',
      email: 'admin@novapay.africa',
      phone: '+237 677 00 11 22',
      country: 'Cameroun',
      country_code: '+237',
      flag: '🇨🇲',
      role: 'super_admin',
      status: 'active',
      novatag: '@alain.admin',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      created_at: '2024-12-01T09:00:00Z',
    },
    {
      id: 'usr_samuel',
      name: "Samuel Eto'o",
      email: 'samuel.eto@domain.cm',
      phone: '+237 670 12 34 56',
      country: 'Cameroun',
      country_code: '+237',
      flag: '🇨🇲',
      role: 'client',
      status: 'active',
      novatag: '@samuel.eto',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      created_at: '2025-02-15T11:00:00Z',
    },
    {
      id: 'usr_marie',
      name: 'Marie Koné',
      email: 'marie.kone@wave.ci',
      phone: '+225 07 88 12 34 56',
      country: "Côte d'Ivoire",
      country_code: '+225',
      flag: '🇨🇮',
      role: 'client',
      status: 'active',
      novatag: '@marie.ci',
      avatar_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80',
      created_at: '2025-03-01T14:20:00Z',
    },
    {
      id: 'usr_jean',
      name: 'Jean Dupont',
      email: 'jean.dupont@paris.fr',
      phone: '+33 6 12 34 56 78',
      country: 'France',
      country_code: '+33',
      flag: '🇫🇷',
      role: 'client',
      status: 'active',
      novatag: '@jean.fr',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      created_at: '2025-03-10T16:00:00Z',
    },
    {
      id: 'usr_kofi',
      name: 'Kofi Mensah',
      email: 'kofi.mensah@gh.com',
      phone: '+225 05 11 22 33 44',
      country: "Côte d'Ivoire",
      country_code: '+225',
      flag: '🇨🇮',
      role: 'client',
      status: 'active',
      novatag: '@kofi.m',
      avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
      created_at: '2025-04-05T09:15:00Z',
    },
  ],
  wallets: [
    {
      id: 'w_amina_xaf',
      user_id: 'usr_amina',
      currency: 'XAF',
      account_number: 'NP-XAF-8842-9910',
      balance: 0, // Will be computed from ledger entries!
      available_balance: 0,
      status: 'active',
      created_at: '2025-01-10T08:35:00Z',
    },
    {
      id: 'w_amina_usd',
      user_id: 'usr_amina',
      currency: 'USD',
      account_number: 'ACH 021000021 • ACC 44920194',
      balance: 0,
      available_balance: 0,
      status: 'active',
      created_at: '2025-01-15T10:00:00Z',
    },
    {
      id: 'w_amina_eur',
      user_id: 'usr_amina',
      currency: 'EUR',
      account_number: 'FR76 3000 6000 0112 3456 7890 123',
      balance: 0,
      available_balance: 0,
      status: 'active',
      created_at: '2025-01-20T12:00:00Z',
    },
    {
      id: 'w_samuel_xaf',
      user_id: 'usr_samuel',
      currency: 'XAF',
      account_number: 'NP-XAF-1022-4410',
      balance: 0,
      available_balance: 0,
      status: 'active',
      created_at: '2025-02-15T11:05:00Z',
    },
    {
      id: 'w_sys_clearing_xaf',
      user_id: 'usr_admin',
      currency: 'XAF',
      account_number: 'NP-SYS-CLEARING-XAF',
      balance: 0,
      available_balance: 0,
      status: 'active',
      created_at: '2024-12-01T09:00:00Z',
    },
    {
      id: 'w_sys_clearing_usd',
      user_id: 'usr_admin',
      currency: 'USD',
      account_number: 'NP-SYS-CLEARING-USD',
      balance: 0,
      available_balance: 0,
      status: 'active',
      created_at: '2024-12-01T09:00:00Z',
    },
    {
      id: 'w_sys_clearing_eur',
      user_id: 'usr_admin',
      currency: 'EUR',
      account_number: 'NP-SYS-CLEARING-EUR',
      balance: 0,
      available_balance: 0,
      status: 'active',
      created_at: '2024-12-01T09:00:00Z',
    },
  ],
  // Seed transactions and double-entry ledger entries to establish realistic initial state
  transactions: [
    {
      id: 'tx_seed_1',
      reference: 'NP-DEP-2025-001',
      type: 'deposit',
      status: 'completed',
      amount: 3000000,
      currency: 'XAF',
      fee: 0,
      description: 'Dépôt initial par virement bancaire',
      sender_name: 'Compte Personnel Afriland',
      created_at: '2025-05-01T10:00:00Z',
    },
    {
      id: 'tx_seed_2',
      reference: 'NP-DEP-2025-002',
      type: 'deposit',
      status: 'completed',
      amount: 1450.0,
      currency: 'USD',
      fee: 0,
      description: 'Virement international entrant (Wire US)',
      sender_name: 'Freelance Client LLC (San Francisco)',
      created_at: '2025-05-05T14:30:00Z',
    },
    {
      id: 'tx_seed_3',
      reference: 'NP-DEP-2025-003',
      type: 'deposit',
      status: 'completed',
      amount: 1180.0,
      currency: 'EUR',
      fee: 0,
      description: 'Virement SEPA Instant entrant',
      sender_name: 'Société Conseil Paris',
      created_at: '2025-05-08T09:20:00Z',
    },
    {
      id: 'tx_seed_4',
      reference: 'TRX-88391',
      type: 'transfer_bank',
      status: 'completed',
      amount: 750000,
      currency: 'XAF',
      fee: 0,
      description: 'SARL BTP Douala • Facture Projet N°419',
      sender_name: 'SARL BTP Douala',
      created_at: '2025-06-14T14:22:00Z',
    },
    {
      id: 'tx_seed_5',
      reference: 'NP-WD-2025-082',
      type: 'withdrawal',
      status: 'completed',
      amount: 100000,
      currency: 'XAF',
      fee: 0,
      description: 'Retrait MTN Mobile Money • Sans frais (0 FCFA)',
      recipient_name: 'Amina Diallo (+237 690 ••• •45)',
      operator_ref: 'MTN-CASH-77192',
      created_at: '2025-06-13T18:05:00Z',
    },
    {
      id: 'tx_seed_6',
      reference: 'NP-SWAP-2025-104',
      type: 'exchange',
      status: 'completed',
      amount: 120800,
      currency: 'XAF',
      fee: 0,
      description: 'Conversion vers USD ($200) • Taux 1 USD = 604 XAF',
      recipient_name: 'Portefeuille Trésorerie USD',
      created_at: '2025-06-12T11:45:00Z',
    },
    {
      id: 'tx_seed_7',
      reference: 'NP-SEND-2025-032',
      type: 'transfer_momo',
      status: 'completed',
      amount: 250000,
      currency: 'XAF',
      fee: 500,
      description: 'Fournisseur Abidjan • Wave Transfer',
      recipient_name: 'Fournisseur Abidjan (+225 07 44 33 22)',
      created_at: '2025-06-10T08:15:00Z',
    },
    {
      id: 'tx_seed_8',
      reference: 'NP-SEND-2025-099',
      type: 'transfer_p2p',
      status: 'completed',
      amount: 150000,
      currency: 'XAF',
      fee: 0,
      description: 'Kofi Mensah (Abidjan) • Virement P2P instantané',
      sender_name: 'Kofi Mensah',
      created_at: '2025-06-14T11:24:00Z',
    },
    {
      id: 'tx_seed_9',
      reference: 'NP-WD-2025-091',
      type: 'withdrawal',
      status: 'completed',
      amount: 45000,
      currency: 'XAF',
      fee: 0,
      description: 'Retrait Orange Money • Cash-Out Agence',
      recipient_name: 'Agence Orange Yaoundé',
      created_at: '2025-06-13T18:40:00Z',
    },
    {
      id: 'tx_seed_10',
      reference: 'NP-CARD-2025-019',
      type: 'card_payment',
      status: 'completed',
      amount: 15.99,
      currency: 'USD',
      fee: 0,
      description: 'Carte NovaPay • Netflix Abonnement mensuel',
      recipient_name: 'Netflix Services',
      created_at: '2025-05-16T12:00:00Z',
    },
    // Compensating entry to calibrate XAF exactly to 3 200 000 FCFA:
    // Credits: 3,000,000 + 750,000 + 150,000 = 3,900,000
    // Debits: 100,000 + 120,800 + 250,500 + 45,000 = 516,300
    // Net before calibration: 3,383,700 -> need debit of 183,700 for exact 3,200,000
    {
      id: 'tx_seed_adj',
      reference: 'NP-PAY-2025-004',
      type: 'transfer_bank',
      status: 'completed',
      amount: 183700,
      currency: 'XAF',
      fee: 0,
      description: 'Paiement Fournisseur Équipement Bureau',
      recipient_name: 'Boutique Tech Cameroun',
      created_at: '2025-06-01T10:00:00Z',
    },
  ],
  transaction_entries: [
    // tx_seed_1: +3,000,000 XAF
    { id: 'en_1_dr', transaction_id: 'tx_seed_1', wallet_id: 'w_sys_clearing_xaf', direction: 'debit', amount: 3000000, created_at: '2025-05-01T10:00:00Z' },
    { id: 'en_1_cr', transaction_id: 'tx_seed_1', wallet_id: 'w_amina_xaf', direction: 'credit', amount: 3000000, created_at: '2025-05-01T10:00:00Z' },

    // tx_seed_2: +1450 USD
    { id: 'en_2_dr', transaction_id: 'tx_seed_2', wallet_id: 'w_sys_clearing_usd', direction: 'debit', amount: 1450, created_at: '2025-05-05T14:30:00Z' },
    { id: 'en_2_cr', transaction_id: 'tx_seed_2', wallet_id: 'w_amina_usd', direction: 'credit', amount: 1450, created_at: '2025-05-05T14:30:00Z' },

    // tx_seed_3: +1180 EUR
    { id: 'en_3_dr', transaction_id: 'tx_seed_3', wallet_id: 'w_sys_clearing_eur', direction: 'debit', amount: 1180, created_at: '2025-05-08T09:20:00Z' },
    { id: 'en_3_cr', transaction_id: 'tx_seed_3', wallet_id: 'w_amina_eur', direction: 'credit', amount: 1180, created_at: '2025-05-08T09:20:00Z' },

    // tx_seed_4: +750,000 XAF
    { id: 'en_4_dr', transaction_id: 'tx_seed_4', wallet_id: 'w_sys_clearing_xaf', direction: 'debit', amount: 750000, created_at: '2025-06-14T14:22:00Z' },
    { id: 'en_4_cr', transaction_id: 'tx_seed_4', wallet_id: 'w_amina_xaf', direction: 'credit', amount: 750000, created_at: '2025-06-14T14:22:00Z' },

    // tx_seed_5: -100,000 XAF
    { id: 'en_5_dr', transaction_id: 'tx_seed_5', wallet_id: 'w_amina_xaf', direction: 'debit', amount: 100000, created_at: '2025-06-13T18:05:00Z' },
    { id: 'en_5_cr', transaction_id: 'tx_seed_5', wallet_id: 'w_sys_clearing_xaf', direction: 'credit', amount: 100000, created_at: '2025-06-13T18:05:00Z' },

    // tx_seed_6: -120,800 XAF
    { id: 'en_6_dr', transaction_id: 'tx_seed_6', wallet_id: 'w_amina_xaf', direction: 'debit', amount: 120800, created_at: '2025-06-12T11:45:00Z' },
    { id: 'en_6_cr', transaction_id: 'tx_seed_6', wallet_id: 'w_sys_clearing_xaf', direction: 'credit', amount: 120800, created_at: '2025-06-12T11:45:00Z' },

    // tx_seed_7: -250,000 XAF (+500 fee)
    { id: 'en_7_dr', transaction_id: 'tx_seed_7', wallet_id: 'w_amina_xaf', direction: 'debit', amount: 250500, created_at: '2025-06-10T08:15:00Z' },
    { id: 'en_7_cr', transaction_id: 'tx_seed_7', wallet_id: 'w_sys_clearing_xaf', direction: 'credit', amount: 250500, created_at: '2025-06-10T08:15:00Z' },

    // tx_seed_8: +150,000 XAF
    { id: 'en_8_dr', transaction_id: 'tx_seed_8', wallet_id: 'w_sys_clearing_xaf', direction: 'debit', amount: 150000, created_at: '2025-06-14T11:24:00Z' },
    { id: 'en_8_cr', transaction_id: 'tx_seed_8', wallet_id: 'w_amina_xaf', direction: 'credit', amount: 150000, created_at: '2025-06-14T11:24:00Z' },

    // tx_seed_9: -45,000 XAF
    { id: 'en_9_dr', transaction_id: 'tx_seed_9', wallet_id: 'w_amina_xaf', direction: 'debit', amount: 45000, created_at: '2025-06-13T18:40:00Z' },
    { id: 'en_9_cr', transaction_id: 'tx_seed_9', wallet_id: 'w_sys_clearing_xaf', direction: 'credit', amount: 45000, created_at: '2025-06-13T18:40:00Z' },

    // tx_seed_adj: -183,700 XAF
    { id: 'en_adj_dr', transaction_id: 'tx_seed_adj', wallet_id: 'w_amina_xaf', direction: 'debit', amount: 183700, created_at: '2025-06-01T10:00:00Z' },
    { id: 'en_adj_cr', transaction_id: 'tx_seed_adj', wallet_id: 'w_sys_clearing_xaf', direction: 'credit', amount: 183700, created_at: '2025-06-01T10:00:00Z' },
  ],
  beneficiaries: [
    {
      id: 'ben_samuel',
      user_id: 'usr_amina',
      beneficiary_user_id: 'usr_samuel',
      alias: "Samuel E.",
      full_name: "Samuel Eto'o",
      type: 'momo',
      provider: 'MTN',
      identifier: '+237 670 12 34 56',
      currency: 'XAF',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      created_at: '2025-02-16T10:00:00Z',
    },
    {
      id: 'ben_marie',
      user_id: 'usr_amina',
      beneficiary_user_id: 'usr_marie',
      alias: 'Marie K.',
      full_name: 'Marie Koné',
      type: 'momo',
      provider: 'Wave',
      identifier: '+225 07 88 12 34 56',
      currency: 'XAF',
      avatar_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80',
      created_at: '2025-03-02T11:00:00Z',
    },
    {
      id: 'ben_jean',
      user_id: 'usr_amina',
      beneficiary_user_id: 'usr_jean',
      alias: 'Jean D.',
      full_name: 'Jean Dupont',
      type: 'bank',
      provider: 'SEPA Direct',
      identifier: 'FR76 3000 6000 0112 3456 7890 888',
      currency: 'EUR',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      created_at: '2025-03-12T15:00:00Z',
    },
    {
      id: 'ben_kofi',
      user_id: 'usr_amina',
      beneficiary_user_id: 'usr_kofi',
      alias: 'Kofi M.',
      full_name: 'Kofi Mensah',
      type: 'novapay',
      provider: 'NovaPay',
      identifier: '@kofi.m',
      currency: 'XAF',
      avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
      created_at: '2025-04-10T12:00:00Z',
    },
  ],
  exchange_rates: [
    { id: 'rate_eur_xaf', base_currency: 'EUR', quote_currency: 'XAF', rate: 655.957, effective_at: new Date().toISOString() },
    { id: 'rate_xaf_eur', base_currency: 'XAF', quote_currency: 'EUR', rate: 1 / 655.957, effective_at: new Date().toISOString() },
    { id: 'rate_usd_xaf', base_currency: 'USD', quote_currency: 'XAF', rate: 604.0, effective_at: new Date().toISOString() },
    { id: 'rate_xaf_usd', base_currency: 'XAF', quote_currency: 'USD', rate: 1 / 604.0, effective_at: new Date().toISOString() },
    { id: 'rate_eur_usd', base_currency: 'EUR', quote_currency: 'USD', rate: 1.086, effective_at: new Date().toISOString() },
    { id: 'rate_usd_eur', base_currency: 'USD', quote_currency: 'EUR', rate: 1 / 1.086, effective_at: new Date().toISOString() },
  ],
  fees: [
    { id: 'fee_novapay', type: 'transfer_novapay', currency: 'XAF', fixed_amount: 0, percentage: 0 },
    { id: 'fee_momo', type: 'transfer_momo', currency: 'XAF', fixed_amount: 500, percentage: 0 },
    { id: 'fee_bank', type: 'transfer_bank', currency: 'XAF', fixed_amount: 1500, percentage: 0.1 },
    { id: 'fee_exchange', type: 'exchange', currency: 'XAF', fixed_amount: 0, percentage: 0.5 },
  ],
  notifications: [
    {
      id: 'notif_1',
      user_id: 'usr_amina',
      type: 'transaction',
      title: 'Virement entrant reçu',
      body: 'Vous avez reçu 150 000 FCFA de Kofi Mensah (Abidjan).',
      read_at: null,
      created_at: '2025-06-14T11:25:00Z',
    },
    {
      id: 'notif_2',
      user_id: 'usr_amina',
      type: 'security',
      title: 'Connexion réussie',
      body: 'Nouvelle connexion détectée depuis iPhone 15 Pro (Douala, CM).',
      read_at: null,
      created_at: '2025-06-14T08:12:00Z',
    },
    {
      id: 'notif_3',
      user_id: 'usr_amina',
      type: 'transaction',
      title: 'Retrait Orange Money complété',
      body: 'Retrait de 45 000 FCFA en agence validé.',
      read_at: '2025-06-13T19:00:00Z',
      created_at: '2025-06-13T18:41:00Z',
    },
  ],
  kyc_profiles: [
    {
      id: 'kyc_amina',
      user_id: 'usr_amina',
      status: 'verified',
      level: 2,
      document_type: 'Carte Nationale d\'Identité (CNI Cameroun)',
      document_number: '11829048102',
      submitted_at: '2025-01-10T09:00:00Z',
      verified_at: '2025-01-10T10:15:00Z',
    },
    {
      id: 'kyc_samuel',
      user_id: 'usr_samuel',
      status: 'verified',
      level: 2,
      document_type: 'Passeport CEMAC',
      document_number: 'A0892104',
      submitted_at: '2025-02-15T12:00:00Z',
      verified_at: '2025-02-15T14:00:00Z',
    },
    {
      id: 'kyc_marie',
      user_id: 'usr_marie',
      status: 'pending',
      level: 1,
      document_type: 'Attestation d\'identité',
      document_number: 'CI-9948120',
      submitted_at: '2025-03-01T15:00:00Z',
    },
  ],
  audit_logs: [
    {
      id: 'log_1',
      actor_id: 'usr_amina',
      actor_name: 'Amina Diallo',
      action: 'AUTH_LOGIN_SUCCESS',
      entity: 'Session',
      metadata: { ip: '102.244.150.22', device: 'Safari iOS 18' },
      created_at: '2025-06-14T08:12:00Z',
    },
    {
      id: 'log_2',
      actor_id: 'usr_admin',
      actor_name: 'Alain Ndongo (Admin)',
      action: 'SYSTEM_RATES_SYNC',
      entity: 'ExchangeRates',
      metadata: { source: 'BEAC_DIRECT_FEED', status: 'OK' },
      created_at: '2025-06-14T06:00:00Z',
    },
  ],
  sessions: [
    {
      id: 'sess_1',
      user_id: 'usr_amina',
      device: 'iPhone 15 Pro • iOS 18',
      browser: 'Mobile Safari',
      ip: '102.244.150.22',
      location: 'Douala, Cameroun 🇨🇲',
      is_current: true,
      last_active: 'Actif maintenant',
    },
    {
      id: 'sess_2',
      user_id: 'usr_amina',
      device: 'MacBook Pro M3 • macOS Sequoia',
      browser: 'Chrome 125',
      ip: '102.244.150.23',
      location: 'Douala, Cameroun 🇨🇲',
      is_current: false,
      last_active: 'Il y a 2 heures',
    },
    {
      id: 'sess_3',
      user_id: 'usr_amina',
      device: 'iPad Air 5 • iPadOS 17',
      browser: 'Safari',
      ip: '41.202.219.12',
      location: 'Yaoundé, Cameroun 🇨🇲',
      is_current: false,
      last_active: 'Hier à 19:40',
    },
  ],
  idempotency_keys: {},
};

export function getDatabase(): DatabaseState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    saveDatabase(initialData);
    return initialData;
  }
  try {
    return JSON.parse(raw);
  } catch {
    saveDatabase(initialData);
    return initialData;
  }
}

export function saveDatabase(data: DatabaseState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// DOUBLE-ENTRY LEDGER: Calculate balances derived from transaction entries
export function calculateWalletBalances(walletId: string, entries: TransactionEntry[], currency: string): { balance: number; available_balance: number } {
  const credits = entries
    .filter((e) => e.wallet_id === walletId && e.direction === 'credit')
    .reduce((sum, e) => sum + e.amount, 0);

  const debits = entries
    .filter((e) => e.wallet_id === walletId && e.direction === 'debit')
    .reduce((sum, e) => sum + e.amount, 0);

  const netBalance = credits - debits;

  // Pending hold simulation for USD (e.g. $30 on hold in mockup)
  const pendingHold = walletId === 'w_amina_usd' ? 30.0 : 0;
  const available = Math.max(0, netBalance - pendingHold);

  return {
    balance: netBalance,
    available_balance: available,
  };
}
