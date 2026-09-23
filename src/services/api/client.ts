import {
  getDatabase,
  saveDatabase,
  calculateWalletBalances,
} from './mockData';
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
  CurrencyCode,
} from '../../types';
import { generateRef } from '../../utils/formatters';

// Simulated latency helper
const delay = (ms = 80) => new Promise((resolve) => setTimeout(resolve, ms));

export const authApi = {
  async login(identifier: string, _password?: string): Promise<User> {
    await delay(150);
    const db = getDatabase();
    // Match by email, phone, or novatag
    const cleanId = identifier.trim().toLowerCase();
    const user =
      db.users.find(
        (u) =>
          u.email.toLowerCase() === cleanId ||
          u.phone.replace(/\s+/g, '') === cleanId.replace(/\s+/g, '') ||
          u.novatag.toLowerCase() === cleanId
      ) || db.users[0]; // fallback to Amina for demo

    // Create session & audit
    const newSession: UserSession = {
      id: `sess_${Date.now()}`,
      user_id: user.id,
      device: 'Cet appareil • Web Session',
      browser: 'Web App',
      ip: '102.244.150.22',
      location: `${user.country} ${user.flag}`,
      is_current: true,
      last_active: 'Actif maintenant',
    };
    db.sessions = [newSession, ...db.sessions.filter((s) => s.user_id !== user.id)];

    db.audit_logs.unshift({
      id: `log_${Date.now()}`,
      actor_id: user.id,
      actor_name: user.name,
      action: 'AUTH_LOGIN_SUCCESS',
      entity: 'Session',
      metadata: { identifier, role: user.role },
      created_at: new Date().toISOString(),
    });

    saveDatabase(db);
    localStorage.setItem('novapay_current_user_id', user.id);
    return user;
  },

  async register(data: {
    firstName: string;
    lastName: string;
    country: string;
    countryCode: string;
    flag: string;
    identifier: string;
    isPhone: boolean;
    language: string;
  }): Promise<{ user: User; otpSentTo: string }> {
    await delay(180);
    const db = getDatabase();
    const userId = `usr_${Date.now()}`;
    const name = `${data.firstName.trim()} ${data.lastName.trim()}`;
    const novatag = `@${data.firstName.toLowerCase()}.${data.lastName.toLowerCase().slice(0, 3)}`;

    const newUser: User = {
      id: userId,
      name,
      email: data.isPhone ? `${data.firstName.toLowerCase()}@novapay.africa` : data.identifier,
      phone: data.isPhone ? data.identifier : `${data.countryCode} 690 00 00 00`,
      country: data.country,
      country_code: data.countryCode,
      flag: data.flag,
      role: 'client',
      status: 'active',
      novatag,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      created_at: new Date().toISOString(),
    };

    // Create 3 primary wallets
    const xafWallet: Wallet = {
      id: `w_${userId}_xaf`,
      user_id: userId,
      currency: 'XAF',
      account_number: `NP-XAF-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      balance: 0,
      available_balance: 0,
      status: 'active',
      created_at: new Date().toISOString(),
    };
    const usdWallet: Wallet = {
      id: `w_${userId}_usd`,
      user_id: userId,
      currency: 'USD',
      account_number: `ACH 021000021 • ACC ${Math.floor(10000000 + Math.random() * 90000000)}`,
      balance: 0,
      available_balance: 0,
      status: 'active',
      created_at: new Date().toISOString(),
    };
    const eurWallet: Wallet = {
      id: `w_${userId}_eur`,
      user_id: userId,
      currency: 'EUR',
      account_number: `FR76 3000 6000 0112 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} 123`,
      balance: 0,
      available_balance: 0,
      status: 'active',
      created_at: new Date().toISOString(),
    };

    // Give welcome bonus seed of 50 000 FCFA for demo testing
    const welcomeTx: Transaction = {
      id: `tx_welcome_${userId}`,
      reference: generateRef('NP-WELCOME'),
      type: 'deposit',
      status: 'completed',
      amount: 50000,
      currency: 'XAF',
      fee: 0,
      description: 'Prime de bienvenue NovaPay • Offre d\'ouverture',
      sender_name: 'NovaPay Rewards Panafrique',
      created_at: new Date().toISOString(),
    };

    const welcomeDebit: TransactionEntry = {
      id: `en_${Date.now()}_dr`,
      transaction_id: welcomeTx.id,
      wallet_id: 'w_sys_clearing_xaf',
      direction: 'debit',
      amount: 50000,
      created_at: new Date().toISOString(),
    };

    const welcomeCredit: TransactionEntry = {
      id: `en_${Date.now()}_cr`,
      transaction_id: welcomeTx.id,
      wallet_id: xafWallet.id,
      direction: 'credit',
      amount: 50000,
      created_at: new Date().toISOString(),
    };

    db.users.push(newUser);
    db.wallets.push(xafWallet, usdWallet, eurWallet);
    db.transactions.unshift(welcomeTx);
    db.transaction_entries.push(welcomeDebit, welcomeCredit);

    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      user_id: userId,
      type: 'system',
      title: 'Bienvenue sur NovaPay !',
      body: 'Vos comptes XAF, USD et EUR sont créés. Un bonus de bienvenue de 50 000 FCFA a été crédité.',
      read_at: null,
      created_at: new Date().toISOString(),
    });

    saveDatabase(db);
    localStorage.setItem('novapay_pending_reg_user_id', userId);
    return { user: newUser, otpSentTo: data.identifier };
  },

  async verifyOtp(_code: string): Promise<User> {
    await delay(150);
    const db = getDatabase();
    const pendingId = localStorage.getItem('novapay_pending_reg_user_id');
    const user = db.users.find((u) => u.id === pendingId) || db.users[0];
    localStorage.setItem('novapay_current_user_id', user.id);
    localStorage.removeItem('novapay_pending_reg_user_id');
    return user;
  },

  async forgotPassword(identifier: string): Promise<boolean> {
    await delay(120);
    const db = getDatabase();
    db.audit_logs.unshift({
      id: `log_${Date.now()}`,
      actor_id: 'anonymous',
      actor_name: identifier,
      action: 'AUTH_FORGOT_PASSWORD_REQUEST',
      entity: 'User',
      metadata: { identifier },
      created_at: new Date().toISOString(),
    });
    saveDatabase(db);
    return true;
  },

  async getCurrentUser(): Promise<User> {
    await delay(30);
    const db = getDatabase();
    const currentId = localStorage.getItem('novapay_current_user_id') || 'usr_amina';
    return db.users.find((u) => u.id === currentId) || db.users[0];
  },

  async switchUserRole(role: 'client' | 'admin'): Promise<User> {
    await delay(60);
    const db = getDatabase();
    const target = role === 'admin'
      ? db.users.find((u) => u.role === 'super_admin' || u.role === 'admin') || db.users[1]
      : db.users.find((u) => u.id === 'usr_amina') || db.users[0];

    localStorage.setItem('novapay_current_user_id', target.id);
    return target;
  },
};

export const walletsApi = {
  async getWallets(userId?: string): Promise<Wallet[]> {
    await delay(60);
    const db = getDatabase();
    const targetUserId = userId || localStorage.getItem('novapay_current_user_id') || 'usr_amina';
    const userWallets = db.wallets.filter((w) => w.user_id === targetUserId);

    // DYNAMIC DERIVATION FROM DOUBLE-ENTRY LEDGER ENTRIES:
    return userWallets.map((wallet) => {
      const calc = calculateWalletBalances(wallet.id, db.transaction_entries, wallet.currency);
      return {
        ...wallet,
        balance: calc.balance,
        available_balance: calc.available_balance,
      };
    });
  },

  async getWalletById(walletId: string): Promise<Wallet | null> {
    await delay(40);
    const db = getDatabase();
    const wallet = db.wallets.find((w) => w.id === walletId);
    if (!wallet) return null;
    const calc = calculateWalletBalances(wallet.id, db.transaction_entries, wallet.currency);
    return {
      ...wallet,
      balance: calc.balance,
      available_balance: calc.available_balance,
    };
  },

  async getWalletEntries(walletId: string): Promise<TransactionEntry[]> {
    await delay(50);
    const db = getDatabase();
    return db.transaction_entries.filter((e) => e.wallet_id === walletId);
  },
};

export const transactionsApi = {
  async getTransactions(filters?: {
    type?: string;
    status?: string;
    currency?: string;
    search?: string;
    limit?: number;
  }): Promise<Transaction[]> {
    await delay(60);
    const db = getDatabase();
    let result = [...db.transactions];

    if (filters?.type && filters.type !== 'all') {
      result = result.filter((t) => t.type === filters.type);
    }
    if (filters?.status && filters.status !== 'all') {
      result = result.filter((t) => t.status === filters.status);
    }
    if (filters?.currency && filters.currency !== 'all') {
      result = result.filter((t) => t.currency === filters.currency);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.reference.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.recipient_name?.toLowerCase().includes(q) ||
          t.sender_name?.toLowerCase().includes(q)
      );
    }

    if (filters?.limit) {
      result = result.slice(0, filters.limit);
    }

    return result;
  },

  async getTransactionById(id: string): Promise<{ transaction: Transaction; entries: TransactionEntry[] } | null> {
    await delay(40);
    const db = getDatabase();
    const tx = db.transactions.find((t) => t.id === id);
    if (!tx) return null;
    const entries = db.transaction_entries.filter((e) => e.transaction_id === id);
    return { transaction: tx, entries };
  },
};

export const transfersApi = {
  async sendMoney(params: {
    sourceWalletId: string;
    recipientName: string;
    recipientIdentifier: string;
    amount: number;
    currency: CurrencyCode;
    mode: 'novapay' | 'momo' | 'bank';
    provider?: string;
    reason?: string;
    idempotencyKey?: string;
  }): Promise<{ transaction: Transaction; newBalance: number }> {
    await delay(200);
    const db = getDatabase();

    // 1. Idempotency check: prevent double submission within 60s
    if (params.idempotencyKey && db.idempotency_keys[params.idempotencyKey]) {
      const existing = db.idempotency_keys[params.idempotencyKey];
      if (Date.now() - existing.timestamp < 60000) {
        const found = db.transactions.find((t) => t.id === existing.transaction_id);
        if (found) {
          const wCalc = calculateWalletBalances(params.sourceWalletId, db.transaction_entries, params.currency);
          return { transaction: found, newBalance: wCalc.balance };
        }
      }
    }

    // 2. Source wallet check
    const sourceWallet = db.wallets.find((w) => w.id === params.sourceWalletId);
    if (!sourceWallet) {
      throw new Error('Portefeuille source introuvable');
    }

    const { available_balance } = calculateWalletBalances(sourceWallet.id, db.transaction_entries, sourceWallet.currency);

    // 3. Fee calculation
    let fee = 0;
    if (params.mode === 'momo') fee = 500;
    if (params.mode === 'bank') fee = 1500;

    const totalToDebit = params.amount + fee;

    if (available_balance < totalToDebit) {
      throw new Error(`Solde insuffisant: solde disponible ${available_balance} ${params.currency}, requis ${totalToDebit} ${params.currency}`);
    }

    // 4. Create Transaction
    const txId = `tx_${Date.now()}`;
    const txRef = generateRef('NP-SEND');

    let txType: Transaction['type'] = 'transfer_p2p';
    if (params.mode === 'momo') txType = 'transfer_momo';
    if (params.mode === 'bank') txType = 'transfer_bank';

    const transaction: Transaction = {
      id: txId,
      reference: txRef,
      type: txType,
      status: 'completed',
      amount: params.amount,
      currency: params.currency,
      fee,
      description: params.reason || `Transfert ${params.mode.toUpperCase()} vers ${params.recipientName}`,
      recipient_name: params.recipientName,
      recipient_identifier: params.recipientIdentifier,
      operator_ref: `TXN-${(params.provider || 'MOMO').toUpperCase()}-${Math.floor(10000000 + Math.random() * 90000000)}`,
      created_at: new Date().toISOString(),
      metadata: {
        mode: params.mode,
        provider: params.provider,
        source_wallet: sourceWallet.account_number,
      },
    };

    // 5. DOUBLE-ENTRY LEDGER:
    // Debit entry on source wallet
    const debitEntry: TransactionEntry = {
      id: `en_${Date.now()}_dr`,
      transaction_id: txId,
      wallet_id: sourceWallet.id,
      direction: 'debit',
      amount: totalToDebit,
      created_at: new Date().toISOString(),
    };

    // Credit entry (counterparty wallet or system clearing wallet)
    const counterpartyWallet =
      db.wallets.find((w) => w.user_id !== sourceWallet.user_id && w.currency === params.currency) ||
      db.wallets.find((w) => w.id === 'w_sys_clearing_xaf')!;

    const creditEntry: TransactionEntry = {
      id: `en_${Date.now()}_cr`,
      transaction_id: txId,
      wallet_id: counterpartyWallet.id,
      direction: 'credit',
      amount: totalToDebit,
      created_at: new Date().toISOString(),
    };

    db.transactions.unshift(transaction);
    db.transaction_entries.push(debitEntry, creditEntry);

    // Save idempotency key
    if (params.idempotencyKey) {
      db.idempotency_keys[params.idempotencyKey] = {
        transaction_id: txId,
        timestamp: Date.now(),
      };
    }

    // 6. User Notification
    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      user_id: sourceWallet.user_id,
      type: 'transaction',
      title: 'Transfert effectué',
      body: `${params.amount} ${params.currency} envoyés avec succès à ${params.recipientName}.`,
      read_at: null,
      created_at: new Date().toISOString(),
    });

    // 7. Audit Log
    db.audit_logs.unshift({
      id: `log_${Date.now()}`,
      actor_id: sourceWallet.user_id,
      actor_name: 'Amina Diallo',
      action: 'TRANSFER_EXECUTED',
      entity: 'Transaction',
      metadata: {
        txId,
        reference: txRef,
        amount: params.amount,
        fee,
        recipient: params.recipientName,
      },
      created_at: new Date().toISOString(),
    });

    saveDatabase(db);

    const newCalc = calculateWalletBalances(sourceWallet.id, db.transaction_entries, sourceWallet.currency);
    return { transaction, newBalance: newCalc.balance };
  },

  async simulateIncomingTransfer(params: {
    receiverUserId: string;
    amount: number;
    currency: CurrencyCode;
    senderName: string;
    senderIdentifier: string;
    reason?: string;
  }): Promise<Transaction> {
    await delay(180);
    const db = getDatabase();

    const targetWallet = db.wallets.find(
      (w) => w.user_id === params.receiverUserId && w.currency === params.currency
    ) || db.wallets.find((w) => w.id === 'w_amina_xaf')!;

    const txId = `tx_${Date.now()}`;
    const txRef = generateRef('NP-RCV');

    const tx: Transaction = {
      id: txId,
      reference: txRef,
      type: 'transfer_p2p',
      status: 'completed',
      amount: params.amount,
      currency: params.currency,
      fee: 0,
      description: params.reason || `Virement P2P reçu de ${params.senderName}`,
      sender_name: params.senderName,
      recipient_name: 'Amina Diallo',
      created_at: new Date().toISOString(),
    };

    // Double-entry ledger:
    const debitEntry: TransactionEntry = {
      id: `en_${Date.now()}_dr`,
      transaction_id: txId,
      wallet_id: 'w_sys_clearing_xaf',
      direction: 'debit',
      amount: params.amount,
      created_at: new Date().toISOString(),
    };

    const creditEntry: TransactionEntry = {
      id: `en_${Date.now()}_cr`,
      transaction_id: txId,
      wallet_id: targetWallet.id,
      direction: 'credit',
      amount: params.amount,
      created_at: new Date().toISOString(),
    };

    db.transactions.unshift(tx);
    db.transaction_entries.push(debitEntry, creditEntry);

    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      user_id: params.receiverUserId,
      type: 'transaction',
      title: 'Virement entrant reçu',
      body: `Vous avez reçu ${params.amount} ${params.currency} de ${params.senderName}.`,
      read_at: null,
      created_at: new Date().toISOString(),
    });

    db.audit_logs.unshift({
      id: `log_${Date.now()}`,
      actor_id: 'system',
      actor_name: 'NovaPay Settlement Switch',
      action: 'INCOMING_TRANSFER_CREDITED',
      entity: 'Transaction',
      metadata: { txId, ref: txRef, amount: params.amount, sender: params.senderName },
      created_at: new Date().toISOString(),
    });

    saveDatabase(db);
    return tx;
  },
};

export const exchangeApi = {
  async getRates(): Promise<ExchangeRate[]> {
    await delay(40);
    const db = getDatabase();
    return db.exchange_rates;
  },

  async updateRate(id: string, newRate: number): Promise<ExchangeRate> {
    await delay(100);
    const db = getDatabase();
    const idx = db.exchange_rates.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Taux introuvable');

    db.exchange_rates[idx].rate = newRate;
    db.exchange_rates[idx].effective_at = new Date().toISOString();

    db.audit_logs.unshift({
      id: `log_${Date.now()}`,
      actor_id: 'usr_admin',
      actor_name: 'Alain Ndongo (Admin)',
      action: 'EXCHANGE_RATE_UPDATED',
      entity: 'ExchangeRate',
      metadata: { id, newRate },
      created_at: new Date().toISOString(),
    });

    saveDatabase(db);
    return db.exchange_rates[idx];
  },

  async executeSwap(params: {
    sourceWalletId: string;
    targetWalletId: string;
    sellAmount: number;
    sellCurrency: CurrencyCode;
    buyAmount: number;
    buyCurrency: CurrencyCode;
    rate: number;
    fee: number;
    idempotencyKey?: string;
  }): Promise<{ transaction: Transaction }> {
    await delay(220);
    const db = getDatabase();

    const sourceWallet = db.wallets.find((w) => w.id === params.sourceWalletId);
    const targetWallet = db.wallets.find((w) => w.id === params.targetWalletId);

    if (!sourceWallet || !targetWallet) {
      throw new Error('Portefeuilles introuvables');
    }

    const { available_balance } = calculateWalletBalances(sourceWallet.id, db.transaction_entries, sourceWallet.currency);

    if (available_balance < params.sellAmount) {
      throw new Error(`Solde insuffisant: disponible ${available_balance} ${params.sellCurrency}, requis ${params.sellAmount} ${params.sellCurrency}`);
    }

    const txId = `tx_${Date.now()}`;
    const txRef = generateRef('NP-SWAP');

    const transaction: Transaction = {
      id: txId,
      reference: txRef,
      type: 'exchange',
      status: 'completed',
      amount: params.sellAmount,
      currency: params.sellCurrency,
      fee: params.fee,
      description: `Conversion ${params.sellAmount} ${params.sellCurrency} vers ${params.buyAmount.toFixed(2)} ${params.buyCurrency}`,
      recipient_name: `Portefeuille ${params.buyCurrency}`,
      created_at: new Date().toISOString(),
      metadata: {
        sell_amount: params.sellAmount,
        sell_currency: params.sellCurrency,
        buy_amount: params.buyAmount,
        buy_currency: params.buyCurrency,
        rate: params.rate,
        fee: params.fee,
      },
    };

    // DOUBLE-ENTRY:
    // Debit source wallet for sold currency
    const debitEntry: TransactionEntry = {
      id: `en_${Date.now()}_dr`,
      transaction_id: txId,
      wallet_id: sourceWallet.id,
      direction: 'debit',
      amount: params.sellAmount,
      created_at: new Date().toISOString(),
    };

    // Credit target wallet for bought currency
    const creditEntry: TransactionEntry = {
      id: `en_${Date.now()}_cr`,
      transaction_id: txId,
      wallet_id: targetWallet.id,
      direction: 'credit',
      amount: params.buyAmount,
      created_at: new Date().toISOString(),
    };

    db.transactions.unshift(transaction);
    db.transaction_entries.push(debitEntry, creditEntry);

    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      user_id: sourceWallet.user_id,
      type: 'transaction',
      title: 'Conversion exécutée',
      body: `${params.sellAmount} ${params.sellCurrency} convertis en ${params.buyAmount.toFixed(2)} ${params.buyCurrency}.`,
      read_at: null,
      created_at: new Date().toISOString(),
    });

    db.audit_logs.unshift({
      id: `log_${Date.now()}`,
      actor_id: sourceWallet.user_id,
      actor_name: 'Amina Diallo',
      action: 'FX_SWAP_EXECUTED',
      entity: 'Transaction',
      metadata: {
        txId,
        ref: txRef,
        pair: `${params.sellCurrency}/${params.buyCurrency}`,
        rate: params.rate,
      },
      created_at: new Date().toISOString(),
    });

    saveDatabase(db);
    return { transaction };
  },
};

export const beneficiariesApi = {
  async getBeneficiaries(userId?: string): Promise<Beneficiary[]> {
    await delay(40);
    const db = getDatabase();
    const targetUserId = userId || localStorage.getItem('novapay_current_user_id') || 'usr_amina';
    return db.beneficiaries.filter((b) => b.user_id === targetUserId);
  },

  async addBeneficiary(data: Omit<Beneficiary, 'id' | 'created_at'>): Promise<Beneficiary> {
    await delay(100);
    const db = getDatabase();
    const newBen: Beneficiary = {
      ...data,
      id: `ben_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    db.beneficiaries.unshift(newBen);
    saveDatabase(db);
    return newBen;
  },

  async updateBeneficiary(id: string, data: Partial<Beneficiary>): Promise<Beneficiary> {
    await delay(80);
    const db = getDatabase();
    const idx = db.beneficiaries.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error('Bénéficiaire non trouvé');
    db.beneficiaries[idx] = { ...db.beneficiaries[idx], ...data };
    saveDatabase(db);
    return db.beneficiaries[idx];
  },

  async deleteBeneficiary(id: string): Promise<boolean> {
    await delay(80);
    const db = getDatabase();
    db.beneficiaries = db.beneficiaries.filter((b) => b.id !== id);
    saveDatabase(db);
    return true;
  },
};

export const notificationsApi = {
  async getNotifications(userId?: string): Promise<NotificationItem[]> {
    await delay(40);
    const db = getDatabase();
    const targetUserId = userId || localStorage.getItem('novapay_current_user_id') || 'usr_amina';
    return db.notifications.filter((n) => n.user_id === targetUserId);
  },

  async markAsRead(id: string): Promise<void> {
    const db = getDatabase();
    const notif = db.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read_at = new Date().toISOString();
      saveDatabase(db);
    }
  },

  async markAllAsRead(userId?: string): Promise<void> {
    const db = getDatabase();
    const targetUserId = userId || localStorage.getItem('novapay_current_user_id') || 'usr_amina';
    db.notifications.forEach((n) => {
      if (n.user_id === targetUserId) {
        n.read_at = new Date().toISOString();
      }
    });
    saveDatabase(db);
  },
};

export const profileApi = {
  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    await delay(120);
    const db = getDatabase();
    const idx = db.users.findIndex((u) => u.id === userId);
    if (idx === -1) throw new Error('Utilisateur non trouvé');
    db.users[idx] = { ...db.users[idx], ...data };
    saveDatabase(db);
    return db.users[idx];
  },

  async changePassword(userId: string, _current: string, _newPass: string): Promise<boolean> {
    await delay(150);
    const db = getDatabase();
    db.audit_logs.unshift({
      id: `log_${Date.now()}`,
      actor_id: userId,
      actor_name: 'Amina Diallo',
      action: 'SECURITY_PASSWORD_CHANGED',
      entity: 'User',
      created_at: new Date().toISOString(),
    });
    saveDatabase(db);
    return true;
  },

  async getSessions(userId: string): Promise<UserSession[]> {
    await delay(40);
    const db = getDatabase();
    return db.sessions.filter((s) => s.user_id === userId);
  },

  async revokeSession(sessionId: string): Promise<boolean> {
    await delay(80);
    const db = getDatabase();
    db.sessions = db.sessions.filter((s) => s.id !== sessionId);
    saveDatabase(db);
    return true;
  },
};

export const adminApi = {
  async getKpis(): Promise<{
    gmvXaf: number;
    totalTransactions: number;
    activeUsers: number;
    feeRevenueXaf: number;
    liquidityXaf: number;
  }> {
    await delay(50);
    const db = getDatabase();
    const totalTransactions = db.transactions.length;
    const activeUsers = db.users.filter((u) => u.status === 'active').length;

    // Sum transactions amounts
    const gmvXaf = db.transactions.reduce((acc, t) => {
      if (t.currency === 'XAF') return acc + t.amount;
      if (t.currency === 'USD') return acc + t.amount * 604;
      if (t.currency === 'EUR') return acc + t.amount * 655.957;
      return acc;
    }, 0);

    const feeRevenueXaf = db.transactions.reduce((acc, t) => acc + (t.fee || 0), 0);
    const liquidityXaf = 48500000; // Simulated segregated reserve pool

    return {
      gmvXaf,
      totalTransactions,
      activeUsers,
      feeRevenueXaf,
      liquidityXaf,
    };
  },

  async getUsers(): Promise<User[]> {
    await delay(50);
    const db = getDatabase();
    return db.users;
  },

  async toggleUserStatus(userId: string): Promise<User> {
    await delay(80);
    const db = getDatabase();
    const user = db.users.find((u) => u.id === userId);
    if (!user) throw new Error('Utilisateur non trouvé');

    user.status = user.status === 'active' ? 'suspended' : 'active';

    db.audit_logs.unshift({
      id: `log_${Date.now()}`,
      actor_id: 'usr_admin',
      actor_name: 'Alain Ndongo (Admin)',
      action: user.status === 'active' ? 'ADMIN_USER_ACTIVATED' : 'ADMIN_USER_SUSPENDED',
      entity: 'User',
      metadata: { userId, newStatus: user.status },
      created_at: new Date().toISOString(),
    });

    saveDatabase(db);
    return user;
  },

  async getFees(): Promise<FeeConfig[]> {
    await delay(40);
    const db = getDatabase();
    return db.fees;
  },

  async updateFees(fees: FeeConfig[]): Promise<FeeConfig[]> {
    await delay(100);
    const db = getDatabase();
    db.fees = fees;
    db.audit_logs.unshift({
      id: `log_${Date.now()}`,
      actor_id: 'usr_admin',
      actor_name: 'Alain Ndongo (Admin)',
      action: 'ADMIN_FEES_UPDATED',
      entity: 'FeeConfig',
      created_at: new Date().toISOString(),
    });
    saveDatabase(db);
    return fees;
  },

  async getKycProfiles(): Promise<(KycProfile & { user?: User })[]> {
    await delay(50);
    const db = getDatabase();
    return db.kyc_profiles.map((k) => ({
      ...k,
      user: db.users.find((u) => u.id === k.user_id),
    }));
  },

  async updateKycStatus(kycId: string, status: KycProfile['status'], level: 1 | 2 | 3): Promise<KycProfile> {
    await delay(100);
    const db = getDatabase();
    const kyc = db.kyc_profiles.find((k) => k.id === kycId);
    if (!kyc) throw new Error('Dossier KYC introuvable');

    kyc.status = status;
    kyc.level = level;
    if (status === 'verified') kyc.verified_at = new Date().toISOString();

    db.audit_logs.unshift({
      id: `log_${Date.now()}`,
      actor_id: 'usr_admin',
      actor_name: 'Alain Ndongo (Admin)',
      action: 'ADMIN_KYC_STATUS_UPDATED',
      entity: 'KycProfile',
      metadata: { kycId, status, level },
      created_at: new Date().toISOString(),
    });

    saveDatabase(db);
    return kyc;
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    await delay(40);
    const db = getDatabase();
    return db.audit_logs;
  },
};
