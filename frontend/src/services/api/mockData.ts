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

export const STORAGE_KEY = 'trust_link_bank_clean_v9';

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
      id: 'usr_admin_tlb',
      name: 'Super Administrator',
      first_name: 'Super',
      last_name: 'Administrator',
      email: 'admin@trustlinkbank.com',
      phone: '+1 800 555 0199',
      country: 'United States',
      country_code: '+1',
      flag: '🇺🇸',
      role: 'admin',
      status: 'active',
      novatag: '@admin.tlb',
      preferred_currency: 'USD',
      language: 'en',
      created_at: '2026-01-01T00:00:00Z',
    },
    {
      id: 'usr_alex_us',
      name: 'Alex Rivera',
      first_name: 'Alex',
      last_name: 'Rivera',
      email: 'alex.rivera@trustlinkbank.com',
      phone: '+1 212 555 0142',
      country: 'United States',
      country_code: '+1',
      flag: '🇺🇸',
      role: 'client',
      status: 'active',
      novatag: '@alex.riv',
      preferred_currency: 'USD',
      language: 'en',
      created_at: '2026-01-10T10:00:00Z',
    },
    {
      id: 'usr_lucas_br',
      name: 'Lucas Silva',
      first_name: 'Lucas',
      last_name: 'Silva',
      email: 'lucas.silva@trustlinkbank.com',
      phone: '+55 11 98765 4321',
      country: 'Brazil',
      country_code: '+55',
      flag: '🇧🇷',
      role: 'client',
      status: 'active',
      novatag: '@lucas.sil',
      preferred_currency: 'BRL',
      language: 'pt',
      created_at: '2026-01-15T11:30:00Z',
    },
    {
      id: 'usr_mateo_mx',
      name: 'Mateo Fernandez',
      first_name: 'Mateo',
      last_name: 'Fernandez',
      email: 'mateo.fernandez@trustlinkbank.com',
      phone: '+52 55 1234 5678',
      country: 'Mexico',
      country_code: '+52',
      flag: '🇲🇽',
      role: 'client',
      status: 'active',
      novatag: '@mateo.fer',
      preferred_currency: 'MXN',
      language: 'es',
      created_at: '2026-01-20T14:15:00Z',
    },
    {
      id: 'usr_val_co',
      name: 'Valentina Lopez',
      first_name: 'Valentina',
      last_name: 'Lopez',
      email: 'valentina.lopez@trustlinkbank.com',
      phone: '+57 300 123 4567',
      country: 'Colombia',
      country_code: '+57',
      flag: '🇨🇴',
      role: 'client',
      status: 'active',
      novatag: '@val.lop',
      preferred_currency: 'COP',
      language: 'es',
      created_at: '2026-02-01T09:00:00Z',
    },
    {
      id: 'usr_camila_ar',
      name: 'Camila Santos',
      first_name: 'Camila',
      last_name: 'Santos',
      email: 'camila.santos@trustlinkbank.com',
      phone: '+54 11 4567 8901',
      country: 'Argentina',
      country_code: '+54',
      flag: '🇦🇷',
      role: 'client',
      status: 'active',
      novatag: '@camila.san',
      preferred_currency: 'ARS',
      language: 'es',
      created_at: '2026-02-05T16:45:00Z',
    },
  ],
  wallets: [
    {
      id: 'w_usr_admin_tlb_usd',
      user_id: 'usr_admin_tlb',
      currency: 'USD',
      account_number: 'TLB-USD-0001-ADMIN',
      balance: 250000.00,
      available_balance: 250000.00,
      status: 'active',
      created_at: '2026-01-01T00:00:00Z',
    },
    {
      id: 'w_usr_alex_us_usd',
      user_id: 'usr_alex_us',
      currency: 'USD',
      account_number: 'TLB-USD-4891-2301',
      balance: 1450.00,
      available_balance: 1450.00,
      status: 'active',
      created_at: '2026-01-10T10:00:00Z',
    },
    {
      id: 'w_usr_lucas_br_brl',
      user_id: 'usr_lucas_br',
      currency: 'BRL',
      account_number: 'TLB-BRL-7712-9934',
      balance: 7820.00,
      available_balance: 7820.00,
      status: 'active',
      created_at: '2026-01-15T11:30:00Z',
    },
    {
      id: 'w_usr_mateo_mx_mxn',
      user_id: 'usr_mateo_mx',
      currency: 'MXN',
      account_number: 'TLB-MXN-3319-5820',
      balance: 28400.00,
      available_balance: 28400.00,
      status: 'active',
      created_at: '2026-01-20T14:15:00Z',
    },
    {
      id: 'w_usr_val_co_cop',
      user_id: 'usr_val_co',
      currency: 'COP',
      account_number: 'TLB-COP-5501-1188',
      balance: 6200000.00,
      available_balance: 6200000.00,
      status: 'active',
      created_at: '2026-02-01T09:00:00Z',
    },
    {
      id: 'w_usr_camila_ar_ars',
      user_id: 'usr_camila_ar',
      currency: 'ARS',
      account_number: 'TLB-ARS-8902-4411',
      balance: 1350000.00,
      available_balance: 1350000.00,
      status: 'active',
      created_at: '2026-02-05T16:45:00Z',
    },
  ],
  transactions: [
    {
      id: 'tx_seed_1',
      reference: 'TLB-SEND-982144',
      type: 'transfer_p2p',
      status: 'completed',
      amount: 150.00,
      currency: 'USD',
      fee: 0,
      description: 'P2P Transfer • Payment split',
      sender_id: 'usr_alex_us',
      receiver_id: 'usr_lucas_br',
      sender_name: 'Alex Rivera',
      recipient_name: 'Lucas Silva',
      recipient_identifier: 'lucas.silva@trustlinkbank.com',
      created_at: '2026-02-10T12:00:00Z',
    },
  ],
  transaction_entries: [
    {
      id: 'en_seed_alex_cr',
      transaction_id: 'tx_seed_deposit_alex',
      wallet_id: 'w_usr_alex_us_usd',
      direction: 'credit',
      amount: 1450.00,
      created_at: '2026-01-10T10:05:00Z',
    },
    {
      id: 'en_seed_lucas_cr',
      transaction_id: 'tx_seed_deposit_lucas',
      wallet_id: 'w_usr_lucas_br_brl',
      direction: 'credit',
      amount: 7820.00,
      created_at: '2026-01-15T11:35:00Z',
    },
    {
      id: 'en_seed_mateo_cr',
      transaction_id: 'tx_seed_deposit_mateo',
      wallet_id: 'w_usr_mateo_mx_mxn',
      direction: 'credit',
      amount: 28400.00,
      created_at: '2026-01-20T14:20:00Z',
    },
    {
      id: 'en_seed_val_cr',
      transaction_id: 'tx_seed_deposit_val',
      wallet_id: 'w_usr_val_co_cop',
      direction: 'credit',
      amount: 6200000.00,
      created_at: '2026-02-01T09:05:00Z',
    },
    {
      id: 'en_seed_camila_cr',
      transaction_id: 'tx_seed_deposit_camila',
      wallet_id: 'w_usr_camila_ar_ars',
      direction: 'credit',
      amount: 1350000.00,
      created_at: '2026-02-05T16:50:00Z',
    },
  ],
  beneficiaries: [],
  exchange_rates: [
    { id: 'rate_eur_usd', base_currency: 'EUR', quote_currency: 'USD', rate: 1.086, effective_at: new Date().toISOString() },
    { id: 'rate_usd_eur', base_currency: 'USD', quote_currency: 'EUR', rate: 0.92, effective_at: new Date().toISOString() },
    { id: 'rate_usd_cad', base_currency: 'USD', quote_currency: 'CAD', rate: 1.36, effective_at: new Date().toISOString() },
    { id: 'rate_usd_brl', base_currency: 'USD', quote_currency: 'BRL', rate: 5.45, effective_at: new Date().toISOString() },
    { id: 'rate_usd_mxn', base_currency: 'USD', quote_currency: 'MXN', rate: 18.25, effective_at: new Date().toISOString() },
    { id: 'rate_usd_ars', base_currency: 'USD', quote_currency: 'ARS', rate: 960.0, effective_at: new Date().toISOString() },
    { id: 'rate_usd_clp', base_currency: 'USD', quote_currency: 'CLP', rate: 940.0, effective_at: new Date().toISOString() },
    { id: 'rate_usd_cop', base_currency: 'USD', quote_currency: 'COP', rate: 4150.0, effective_at: new Date().toISOString() },
    { id: 'rate_usd_pen', base_currency: 'USD', quote_currency: 'PEN', rate: 3.75, effective_at: new Date().toISOString() },
  ],
  fees: [
    { id: 'fee_novapay', type: 'transfer_novapay', currency: 'USD', fixed_amount: 0, percentage: 0 },
    { id: 'fee_bank', type: 'transfer_bank', currency: 'USD', fixed_amount: 0, percentage: 0 },
    { id: 'fee_exchange', type: 'exchange', currency: 'USD', fixed_amount: 0, percentage: 0 },
  ],
  notifications: [],
  kyc_profiles: [],
  audit_logs: [],
  sessions: [],
  idempotency_keys: {},
};

export function getDatabase(): DatabaseState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    // Check if previous versions exist and migrate any registered users
    const oldKeys = ['trust_link_bank_clean_v6', 'trust_link_bank_clean_v5', 'novapay_db_v4'];
    let migratedUsers: User[] = [];
    let migratedWallets: Wallet[] = [];
    for (const key of oldKeys) {
      const oldRaw = localStorage.getItem(key);
      if (oldRaw) {
        try {
          const oldDb = JSON.parse(oldRaw);
          if (oldDb?.users && Array.isArray(oldDb.users)) {
            migratedUsers = [...oldDb.users];
          }
          if (oldDb?.wallets && Array.isArray(oldDb.wallets)) {
            migratedWallets = [...oldDb.wallets];
          }
          break;
        } catch {}
      }
    }

    const mergedData: DatabaseState = {
      ...initialData,
      users: [...initialData.users],
      wallets: [...initialData.wallets],
    };

    // Add any non-duplicate migrated users
    for (const u of migratedUsers) {
      if (!mergedData.users.some((mu) => mu.id === u.id || (mu.email && u.email && mu.email.toLowerCase() === u.email.toLowerCase()))) {
        mergedData.users.push(u);
      }
    }
    for (const w of migratedWallets) {
      if (!mergedData.wallets.some((mw) => mw.id === w.id)) {
        mergedData.wallets.push(w);
      }
    }

    saveDatabase(mergedData);
    return mergedData;
  }

  try {
    const parsed = JSON.parse(raw) as DatabaseState;
    if (!parsed.users) parsed.users = [];
    if (!parsed.wallets) parsed.wallets = [];

    // Ensure all seed users exist in the active user pool
    let changed = false;
    for (const initU of initialData.users) {
      if (!parsed.users.some((u) => u.id === initU.id || (u.email && initU.email && u.email.toLowerCase() === initU.email.toLowerCase()))) {
        parsed.users.push(initU);
        changed = true;
      }
    }
    for (const initW of initialData.wallets) {
      if (!parsed.wallets.some((w) => w.id === initW.id)) {
        parsed.wallets.push(initW);
        changed = true;
      }
    }
    if (changed) {
      saveDatabase(parsed);
    }
    return parsed;
  } catch {
    saveDatabase(initialData);
    return initialData;
  }
}

export function saveDatabase(data: DatabaseState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// DOUBLE-ENTRY LEDGER: Calculate balances derived from transaction entries
export function calculateWalletBalances(walletId: string, entries: TransactionEntry[], _currency: string): { balance: number; available_balance: number } {
  const credits = entries
    .filter((e) => e.wallet_id === walletId && e.direction === 'credit')
    .reduce((sum, e) => sum + e.amount, 0);

  const debits = entries
    .filter((e) => e.wallet_id === walletId && e.direction === 'debit')
    .reduce((sum, e) => sum + e.amount, 0);

  const netBalance = credits - debits;

  return {
    balance: Math.max(0, netBalance),
    available_balance: Math.max(0, netBalance),
  };
}
