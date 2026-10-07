import {
  getDatabase,
  saveDatabase,
  calculateWalletBalances,
  initCloudDatabase,
} from './mockData';
import {
  requestApi,
  setAuthToken,
  clearAuthToken,
  checkBackendHealth,
} from './httpClient';
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
import { getExchangeRate, convertCurrency } from '../../utils/currencies';
import i18n from '../../i18n';

// Simulated latency helper
const delay = (ms = 80) => new Promise((resolve) => setTimeout(resolve, ms));

export const authApi = {
  async login(identifier: string, _password?: string): Promise<User> {
    const cleanId = identifier.trim().toLowerCase();

    // Attempt real Laravel API authentication first
    try {
      const backendRes = await requestApi<{ user: any; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          identifier: cleanId,
          password: _password || (cleanId.includes('admin') ? 'NovaPay2026!Admin' : 'password123'),
        }),
      });

      if (backendRes?.token) {
        setAuthToken(backendRes.token);
      }
    } catch {
      // If backend is offline or network fails, proceed with seamless local fallback
    }

    await initCloudDatabase();
    const db = getDatabase();
    // Match by email, phone, novatag, or admin keyword
    let user = db.users.find(
      (u) =>
        u.email.toLowerCase() === cleanId ||
        u.phone.replace(/[\s+-]/g, '') === cleanId.replace(/[\s+-]/g, '') ||
        u.novatag.toLowerCase() === cleanId
    );

    // If identifier is admin keyword or admin email, resolve the admin user
    if (!user && (cleanId === 'admin' || cleanId.includes('admin@') || cleanId.includes('@admin'))) {
      user = db.users.find((u) => u.role === 'admin' || u.role === 'super_admin');
    }

    if (!user) {
      throw new Error(i18n.t('auth.invalidCredentialsError', 'Incorrect credentials. Please verify your entries.'));
    }

    // Create session & audit
    const newSession: UserSession = {
      id: `sess_${Date.now()}`,
      user_id: user.id,
      device: i18n.t('profile.currentDeviceSession', 'This device • Web Session'),
      browser: 'Web App',
      ip: '102.244.150.22',
      location: `${user.country} ${user.flag}`,
      is_current: true,
      last_active: i18n.t('profile.activeNow', 'Active now'),
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
    currency_code?: CurrencyCode;
    password?: string;
    confirmPassword?: string;
    email?: string;
    phone?: string;
  }): Promise<{ user: User; otpSentTo: string; isPhone: boolean; code: string }> {
    await delay(120);
    const generatedCode = '123456';
    const userId = `usr_${Date.now()}`;
    const name = `${data.firstName.trim()} ${data.lastName.trim()}`;

    const resolvedEmail = data.email?.trim() || (!data.isPhone && data.identifier.includes('@') ? data.identifier.trim() : `${data.firstName.toLowerCase()}.${data.lastName.toLowerCase().slice(0, 3)}@trustlinkbank.com`);
    const resolvedPhone = data.phone?.trim() || (data.isPhone ? data.identifier.trim() : `${data.countryCode} 555 ${Math.floor(1000 + Math.random() * 9000)}`);
    const otpSentTo = data.isPhone ? resolvedPhone : resolvedEmail;
    const selectedCurrency = data.currency_code || 'USD';

    // Attempt real backend registration
    try {
      const backendRes = await requestApi<{ user: any; token: string; otp_code?: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name,
          email: resolvedEmail,
          phone: resolvedPhone,
          password: data.password || 'password123',
          country_code: data.countryCode,
          language: data.language,
          currency_code: selectedCurrency,
          otp_code: generatedCode,
        }),
      });
      if (backendRes?.token) {
        setAuthToken(backendRes.token);
      }
    } catch {
      // offline fallback
    }

    await initCloudDatabase();
    const db = getDatabase();

    // Ensure unique novatag
    let novatag = `@${data.firstName.toLowerCase()}.${data.lastName.toLowerCase().slice(0, 3)}`.replace(/[^a-z0-9._]/g, '');
    if (db.users.some((u) => u.novatag?.toLowerCase() === novatag.toLowerCase())) {
      novatag = `${novatag}${Math.floor(10 + Math.random() * 89)}`;
    }

    const newUser: User = {
      id: userId,
      name,
      first_name: data.firstName.trim(),
      last_name: data.lastName.trim(),
      email: resolvedEmail,
      phone: resolvedPhone,
      country: data.country,
      country_code: data.countryCode,
      flag: data.flag,
      role: 'client',
      status: 'active',
      novatag,
      avatar_url: undefined, // no fake photo, will display clean initials
      preferred_currency: selectedCurrency,
      language: data.language,
      created_at: new Date().toISOString(),
    };

    // Create the primary wallet in the user's preferred currency with exactly 0.00 starting balance
    const primaryWallet: Wallet = {
      id: `w_${userId}_${selectedCurrency.toLowerCase()}`,
      user_id: userId,
      currency: selectedCurrency,
      account_number: `TLB-${selectedCurrency}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      balance: 0,
      available_balance: 0,
      status: 'active',
      created_at: new Date().toISOString(),
    };

    // Add or update newUser without overwriting other registered users
    const existingIdx = db.users.findIndex(
      (u) =>
        u.id === userId ||
        (resolvedEmail && u.email && u.email.toLowerCase() === resolvedEmail.toLowerCase())
    );
    if (existingIdx >= 0) {
      db.users[existingIdx] = newUser;
    } else {
      db.users.push(newUser);
    }

    const existingWalletIdx = db.wallets.findIndex((w) => w.user_id === userId && w.currency === selectedCurrency);
    if (existingWalletIdx < 0) {
      db.wallets.push(primaryWallet);
    }

    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      user_id: userId,
      type: 'system',
      title: 'Welcome to Trust Link Bank',
      body: `Your ${selectedCurrency} account is ready. Your current balance is 0.00. You can now add money or receive transfers.`,
      read_at: null,
      created_at: new Date().toISOString(),
    });

    saveDatabase(db);
    localStorage.setItem('novapay_current_user_id', userId);
    return { user: newUser, otpSentTo, isPhone: data.isPhone, code: generatedCode };
  },

  async resendOtp(identifier: string, isPhone: boolean): Promise<{ success: boolean; code: string; message: string }> {
    await delay(120);
    const code = '123456';
    try {
      await requestApi('/auth/otp/resend', {
        method: 'POST',
        body: JSON.stringify({
          identifier,
          channel: isPhone ? 'sms' : 'email',
          code,
        }),
      });
    } catch {
      // offline fallback
    }
    localStorage.setItem('novapay_pending_reg_code', code);
    return {
      success: true,
      code,
      message: isPhone
        ? `Nouveau code SMS envoyé au ${identifier}`
        : `Nouvel e-mail envoyé à ${identifier}`,
    };
  },

  async verifyOtp(_code: string, identifier?: string): Promise<User> {
    await delay(150);
    const targetIdentifier = identifier || localStorage.getItem('novapay_pending_reg_identifier');
    if (targetIdentifier) {
      try {
        await requestApi('/auth/otp/verify', {
          method: 'POST',
          body: JSON.stringify({
            identifier: targetIdentifier,
            code: _code,
          }),
        });
      } catch {
        // offline fallback
      }
    }

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

  async getCurrentUser(): Promise<User | null> {
    await delay(30);
    const db = getDatabase();
    const currentId = localStorage.getItem('novapay_current_user_id');
    if (!currentId) return null;
    return db.users.find((u) => u.id === currentId) || null;
  },

  async switchUserRole(role: 'client' | 'admin'): Promise<User> {
    await delay(60);
    const db = getDatabase();
    const target = role === 'admin'
      ? db.users.find((u) => u.role === 'super_admin' || u.role === 'admin') || db.users[0]
      : db.users[0];

    if (target) {
      localStorage.setItem('novapay_current_user_id', target.id);
    }
    return target;
  },
};

export const walletsApi = {
  async getWallets(userId?: string): Promise<Wallet[]> {
    const targetUserId = userId || localStorage.getItem('novapay_current_user_id') || '';

    try {
      const remoteWallets = await requestApi<any[]>('/wallets');
      if (Array.isArray(remoteWallets) && remoteWallets.length > 0) {
        return remoteWallets.map((rw) => ({
          id: String(rw.id),
          uuid: rw.uuid,
          user_id: targetUserId,
          currency: rw.currency.code as CurrencyCode,
          account_number: rw.account_number,
          iban: rw.iban || undefined,
          bic_swift: rw.bic_swift || undefined,
          balance: parseFloat(rw.balance) || 0,
          available_balance: parseFloat(rw.available_balance) || 0,
          pending_balance: parseFloat(rw.pending_balance) || 0,
          status: rw.status || 'active',
          created_at: rw.created_at || new Date().toISOString(),
        }));
      }
    } catch {
      // Fallback to local store
    }

    await delay(60);
    const db = getDatabase();
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

export const usersApi = {
  async getAllUsers(excludeUserId?: string): Promise<User[]> {
    await delay(30);
    const db = getDatabase();
    const currId = excludeUserId || localStorage.getItem('novapay_current_user_id') || '';
    return db.users.filter((u) => u.id !== currId && u.status === 'active');
  },

  async searchUsers(query: string, excludeUserId?: string): Promise<User[]> {
    await delay(40);
    const db = getDatabase();
    const currId = excludeUserId || localStorage.getItem('novapay_current_user_id') || '';
    const q = (query || '').trim().toLowerCase();

    // Exclude current user from recipient search to prevent self-sending
    const eligibleUsers = db.users.filter((u) => u.id !== currId && u.status === 'active');

    // If query is empty, return all registered users so the user can easily pick someone
    if (!q) {
      return eligibleUsers;
    }

    const cleanQ = q.replace(/[\s+-]/g, '').replace(/^@/, '');

    return eligibleUsers.filter((u) => {
      const name = (u.name || `${u.first_name || ''} ${u.last_name || ''}`).toLowerCase();
      const firstName = (u.first_name || '').toLowerCase();
      const lastName = (u.last_name || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      const phone = (u.phone || '').replace(/[\s+-]/g, '');
      const novatag = (u.novatag || '').toLowerCase().replace(/^@/, '');
      const currency = (u.preferred_currency || '').toLowerCase();

      return (
        name.includes(q) ||
        firstName.includes(q) ||
        lastName.includes(q) ||
        email.includes(q) ||
        (cleanQ.length >= 2 && phone.includes(cleanQ)) ||
        novatag.includes(cleanQ) ||
        currency === q ||
        u.id.toLowerCase() === q
      );
    });
  },

  async lookupRecipient(identifier: string, excludeUserId?: string): Promise<User | null> {
    await delay(20);
    const db = getDatabase();
    const currId = excludeUserId || localStorage.getItem('novapay_current_user_id') || '';
    const clean = (identifier || '').trim().toLowerCase();
    if (!clean) return null;
    const cleanPhone = clean.replace(/[\s+-]/g, '');
    const cleanTag = clean.replace(/^@/, '');

    const found = db.users.find((u) => {
      if (u.id === currId || u.status !== 'active') return false;
      const uPhone = (u.phone || '').replace(/[\s+-]/g, '');
      const uTag = (u.novatag || '').toLowerCase().replace(/^@/, '');
      const uName = (u.name || '').toLowerCase();
      const uFirst = (u.first_name || '').toLowerCase();
      const uLast = (u.last_name || '').toLowerCase();
      const uEmail = (u.email || '').toLowerCase();

      return (
        u.id.toLowerCase() === clean ||
        uEmail === clean ||
        uEmail.includes(clean) ||
        (cleanPhone.length >= 4 && (uPhone.includes(cleanPhone) || cleanPhone.includes(uPhone))) ||
        (cleanTag && uTag === cleanTag) ||
        (cleanTag && uTag.includes(cleanTag)) ||
        uName === clean ||
        uName.includes(clean) ||
        uFirst === clean ||
        uLast === clean
      );
    });
    return found || null;
  },

  async getUserById(userId: string): Promise<User | null> {
    await delay(30);
    const db = getDatabase();
    return db.users.find((u) => u.id === userId) || null;
  },
};

export const transactionsApi = {
  async getTransactions(filters?: {
    userId?: string;
    type?: string;
    status?: string;
    currency?: string;
    search?: string;
    limit?: number;
  }): Promise<Transaction[]> {
    await delay(50);
    const db = getDatabase();
    const currentUserId = filters?.userId || localStorage.getItem('novapay_current_user_id') || '';

    let result = [...db.transactions];

    // Filter by user: show transactions where user is sender, receiver, or involved
    if (currentUserId) {
      result = result.filter(
        (t) =>
          t.sender_id === currentUserId ||
          t.receiver_id === currentUserId ||
          (!t.sender_id && !t.receiver_id && currentUserId === 'usr_amina') // demo transactions only for amina
      );
    }

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
    recipientUserId?: string;
    recipientName: string;
    recipientIdentifier: string;
    amount: number;
    currency: CurrencyCode;
    targetCurrency?: CurrencyCode;
    mode: 'novapay' | 'momo' | 'bank' | 'trustlink';
    provider?: string;
    reason?: string;
    idempotencyKey?: string;
  }): Promise<{ transaction: Transaction; newBalance: number }> {
    // Forward transfer notification to backend API if available
    try {
      requestApi('/transfers', {
        method: 'POST',
        body: JSON.stringify({
          source_wallet_id: params.sourceWalletId,
          channel: params.mode,
          operator: params.provider,
          recipient_identifier: params.recipientIdentifier,
          recipient_name: params.recipientName,
          amount: params.amount,
          currency_code: params.currency,
          target_currency: params.targetCurrency || params.currency,
          description: params.reason || 'Virement',
          idempotency_key: params.idempotencyKey,
        }),
      }).catch(() => {});
    } catch {}

    await delay(100);
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
      throw new Error(i18n.t('send.sourceWalletNotFound', 'Source wallet not found'));
    }

    const senderUserId = sourceWallet.user_id;
    const senderUser = db.users.find((u) => u.id === senderUserId);

    // Permission enforcement: ONLY administrators can send funds!
    if (!senderUser || (senderUser.role !== 'admin' && senderUser.role !== 'super_admin')) {
      throw new Error(
        i18n.t(
          'send.adminOnlySendDesc',
          'Unauthorized operation: Client accounts are configured to receive funds only. Only the Trust Link Bank administrator is authorized to send funds.'
        )
      );
    }

    // 3. Validation: Prevent self-sending
    if (params.recipientUserId && params.recipientUserId === senderUserId) {
      throw new Error(i18n.t('send.cannotSendToSelf', 'You cannot send money to yourself.'));
    }

    // Find recipient user in real database (by ID, email, phone, novatag, name)
    const cleanIdent = params.recipientIdentifier.trim().toLowerCase();
    const cleanPhone = cleanIdent.replace(/[\s+-]/g, '');
    const cleanTag = cleanIdent.replace(/^@/, '');
    const recipientUser = params.recipientUserId
      ? db.users.find((u) => u.id === params.recipientUserId)
      : db.users.find(
          (u) =>
            u.id.toLowerCase() === cleanIdent ||
            u.email.toLowerCase() === cleanIdent ||
            u.novatag.toLowerCase().replace(/^@/, '') === cleanTag ||
            (cleanPhone.length >= 4 && u.phone.replace(/[\s+-]/g, '') === cleanPhone) ||
            u.name.toLowerCase() === cleanIdent
        );

    if (recipientUser && recipientUser.id === senderUserId) {
      throw new Error(i18n.t('send.cannotSendToSelf', 'You cannot send money to yourself.'));
    }

    // 4. Cross-currency conversion handling
    const recipientCurrency: CurrencyCode = (params.targetCurrency || recipientUser?.preferred_currency || params.currency) as CurrencyCode;
    const isCrossCurrency = recipientCurrency !== params.currency;
    const exchangeRate = isCrossCurrency ? getExchangeRate(params.currency, recipientCurrency) : 1.0;
    const recipientReceivedAmount = isCrossCurrency
      ? convertCurrency(params.amount, params.currency, recipientCurrency)
      : params.amount;

    const { available_balance } = calculateWalletBalances(sourceWallet.id, db.transaction_entries, sourceWallet.currency);

    // 5. Fee calculation: 0 for Trust Link P2P, 0.50 for Mobile Wallet, 1.50 for Bank
    let fee = 0;
    if (params.mode === 'momo') fee = 0.5;
    if (params.mode === 'bank') fee = 1.5;

    const totalToDebit = params.amount + fee;

    if (available_balance < totalToDebit) {
      throw new Error(
        `${i18n.t('send.insufficientBalanceError', 'Insufficient balance')}: ${available_balance.toFixed(2)} ${params.currency} (${totalToDebit.toFixed(2)} ${params.currency})`
      );
    }

    // 6. Create Transaction
    const txId = `tx_${Date.now()}`;
    const txRef = generateRef('TLB-SEND');

    let txType: Transaction['type'] = 'transfer_p2p';
    if (params.mode === 'momo') txType = 'transfer_momo';
    if (params.mode === 'bank') txType = 'transfer_bank';

    const recipientDisplayName = recipientUser ? recipientUser.name : params.recipientName;
    const transferDescription = params.reason || (
      isCrossCurrency
        ? `${i18n.t('send.transferTo', 'Transfer to')} ${recipientDisplayName} (${recipientReceivedAmount.toFixed(2)} ${recipientCurrency} • ${exchangeRate.toFixed(4)})`
        : `${i18n.t('send.transferTo', 'Transfer to')} ${recipientDisplayName}`
    );

    const transaction: Transaction = {
      id: txId,
      reference: txRef,
      type: txType,
      status: 'completed',
      amount: params.amount,
      currency: params.currency,
      fee,
      description: transferDescription,
      sender_id: senderUserId,
      receiver_id: recipientUser?.id,
      sender_name: senderUser ? senderUser.name : 'Client Trust Link Bank',
      recipient_name: recipientDisplayName,
      recipient_identifier: params.recipientIdentifier,
      operator_ref: `TLB-${(params.provider || 'DIRECT').toUpperCase()}-${Math.floor(10000000 + Math.random() * 90000000)}`,
      created_at: new Date().toISOString(),
      metadata: {
        mode: params.mode,
        provider: params.provider,
        source_wallet: sourceWallet.account_number,
        receiver_id: recipientUser?.id,
        converted_amount: recipientReceivedAmount,
        converted_currency: recipientCurrency,
        exchange_rate: exchangeRate,
      },
    };

    // 7. DOUBLE-ENTRY LEDGER:
    // Debit entry on sender source wallet
    const debitEntry: TransactionEntry = {
      id: `en_${Date.now()}_dr`,
      transaction_id: txId,
      wallet_id: sourceWallet.id,
      direction: 'debit',
      amount: totalToDebit,
      created_at: new Date().toISOString(),
    };

    // Find or create recipient wallet in that target currency
    let recipientWallet: Wallet | undefined;
    if (recipientUser) {
      recipientWallet = db.wallets.find((w) => w.user_id === recipientUser.id && w.currency === recipientCurrency);
      if (!recipientWallet) {
        recipientWallet = {
          id: `w_${recipientUser.id}_${recipientCurrency.toLowerCase()}_${Date.now()}`,
          user_id: recipientUser.id,
          currency: recipientCurrency,
          account_number: `TLB-${recipientCurrency}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
          balance: 0,
          available_balance: 0,
          status: 'active',
          created_at: new Date().toISOString(),
        };
        db.wallets.push(recipientWallet);
      }
    }

    const counterpartyWalletId = recipientWallet ? recipientWallet.id : sourceWallet.id;

    // Credit entry (counterparty wallet with converted amount in target currency)
    const creditEntry: TransactionEntry = {
      id: `en_${Date.now()}_cr`,
      transaction_id: txId,
      wallet_id: counterpartyWalletId,
      direction: 'credit',
      amount: recipientReceivedAmount,
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

    // 8. Notifications:
    // Sender notification
    db.notifications.unshift({
      id: `notif_${Date.now()}_s`,
      user_id: senderUserId,
      type: 'transaction',
      title: i18n.t('send.successTitle', 'Transfer Completed'),
      body: isCrossCurrency
        ? `${params.amount} ${params.currency} → ${recipientDisplayName} (${recipientReceivedAmount} ${recipientCurrency}).`
        : `${params.amount} ${params.currency} → ${recipientDisplayName}.`,
      read_at: null,
      created_at: new Date().toISOString(),
    });

    // Recipient notification (if registered user)
    if (recipientUser) {
      db.notifications.unshift({
        id: `notif_${Date.now()}_r`,
        user_id: recipientUser.id,
        type: 'transaction',
        title: i18n.t('receive.simSuccessPrefix', 'Incoming Transfer Received'),
        body: `${recipientReceivedAmount} ${recipientCurrency} ← ${senderUser ? senderUser.name : 'Trust Link Bank'}.`,
        read_at: null,
        created_at: new Date().toISOString(),
      });
    }

    // 9. Audit Log
    db.audit_logs.unshift({
      id: `log_${Date.now()}`,
      actor_id: senderUserId,
      actor_name: senderUser?.name || 'User',
      action: 'TRANSFER_EXECUTED',
      entity: 'Transaction',
      metadata: {
        txId,
        reference: txRef,
        amount: params.amount,
        fee,
        recipient: recipientDisplayName,
        recipient_id: recipientUser?.id,
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
    ) || db.wallets[0];

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
      recipient_name: 'Client Trust Link Bank',
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
      actor_name: 'Trust Link Settlement Switch',
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
    try {
      const remote = await requestApi<any[]>('/exchange-rates');
      if (Array.isArray(remote) && remote.length > 0) {
        return remote.map((r) => ({
          id: String(r.id),
          base_currency: r.base_currency as CurrencyCode,
          quote_currency: r.quote_currency as CurrencyCode,
          rate: parseFloat(r.rate),
          spread_percentage: parseFloat(r.spread_percentage || 0),
          is_fixed: Boolean(r.is_fixed),
          effective_at: r.effective_at || new Date().toISOString(),
        }));
      }
    } catch {
      // fallback
    }

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
      actor_name: 'Client Trust Link Bank',
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
    const targetUserId = userId || localStorage.getItem('novapay_current_user_id') || '';

    try {
      const remote = await requestApi<any[]>('/beneficiaries');
      if (Array.isArray(remote) && remote.length > 0) {
        return remote.map((b) => ({
          id: String(b.id),
          user_id: targetUserId,
          alias: b.alias || b.name,
          full_name: b.name,
          type: b.channel === 'novapay' || b.channel === 'trustlink' ? 'novapay' : b.channel === 'bank' ? 'bank' : 'momo',
          provider: b.operator || 'Trust Link Bank',
          identifier: b.identifier,
          currency: b.currency?.code || 'XAF',
          created_at: b.created_at || new Date().toISOString(),
        }));
      }
    } catch {
      // Fallback
    }

    await delay(40);
    const db = getDatabase();
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
    await delay(100);
    const db = getDatabase();
    const idx = db.users.findIndex((u) => u.id === userId);
    if (idx === -1) throw new Error('Utilisateur non trouvé / User not found');

    // Per requirement 4: Currency preference set at registration should NOT be silently editable from Profile
    const { preferred_currency: _ignoredCurrency, id: _ignoredId, ...allowedUpdates } = data;

    const current = db.users[idx];
    const newFirstName = allowedUpdates.first_name !== undefined ? allowedUpdates.first_name.trim() : (current.first_name || '');
    const newLastName = allowedUpdates.last_name !== undefined ? allowedUpdates.last_name.trim() : (current.last_name || '');
    const newName = allowedUpdates.name || (newFirstName || newLastName ? `${newFirstName} ${newLastName}`.trim() : current.name);

    db.users[idx] = {
      ...current,
      ...allowedUpdates,
      first_name: newFirstName,
      last_name: newLastName,
      name: newName,
    };

    db.audit_logs.unshift({
      id: `log_${Date.now()}`,
      actor_id: userId,
      actor_name: newName,
      action: 'PROFILE_UPDATED',
      entity: 'User',
      metadata: { fields: Object.keys(allowedUpdates) },
      created_at: new Date().toISOString(),
    });

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

  async sendMoneyToUser(params: {
    recipientUserId: string;
    amount: number;
    currency: CurrencyCode;
    reason?: string;
  }): Promise<Transaction> {
    await delay(120);
    const db = getDatabase();
    const adminUser = db.users.find((u) => u.role === 'admin' || u.role === 'super_admin') || db.users[0];
    const recipientUser = db.users.find((u) => u.id === params.recipientUserId);
    if (!recipientUser) throw new Error('Destinataire introuvable');

    let adminWallet = db.wallets.find((w) => w.user_id === adminUser.id && w.currency === params.currency);
    if (!adminWallet) {
      adminWallet = db.wallets.find((w) => w.user_id === adminUser.id) || {
        id: `w_${adminUser.id}_${params.currency.toLowerCase()}`,
        user_id: adminUser.id,
        currency: params.currency,
        account_number: `TLB-${params.currency}-0001-ADMIN`,
        balance: 100000,
        available_balance: 100000,
        status: 'active',
        created_at: new Date().toISOString(),
      };
      if (!db.wallets.some((w) => w.id === adminWallet!.id)) {
        db.wallets.push(adminWallet);
      }
    }

    // Ensure recipient has a wallet in target currency
    let recipientWallet = db.wallets.find((w) => w.user_id === recipientUser.id && w.currency === params.currency);
    if (!recipientWallet) {
      recipientWallet = {
        id: `w_${recipientUser.id}_${params.currency.toLowerCase()}`,
        user_id: recipientUser.id,
        currency: params.currency,
        account_number: `TLB-${params.currency}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
        balance: 0,
        available_balance: 0,
        status: 'active',
        created_at: new Date().toISOString(),
      };
      db.wallets.push(recipientWallet);
    }

    const txId = `tx_${Date.now()}`;
    const txRef = generateRef('TLB-ADMIN');
    const transaction: Transaction = {
      id: txId,
      reference: txRef,
      type: 'transfer_p2p',
      status: 'completed',
      amount: params.amount,
      currency: params.currency,
      fee: 0,
      description: params.reason || `${i18n.t('admin.users.defaultReason', 'Administrative transfer issued by')} ${adminUser.name}`,
      sender_id: adminUser.id,
      receiver_id: recipientUser.id,
      sender_name: adminUser.name,
      recipient_name: recipientUser.name,
      recipient_identifier: recipientUser.novatag,
      operator_ref: `TLB-ADMIN-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    db.transactions.unshift(transaction);
    db.transaction_entries.push(
      {
        id: `en_${Date.now()}_dr`,
        transaction_id: txId,
        wallet_id: adminWallet.id,
        direction: 'debit',
        amount: params.amount,
        created_at: new Date().toISOString(),
      },
      {
        id: `en_${Date.now()}_cr`,
        transaction_id: txId,
        wallet_id: recipientWallet.id,
        direction: 'credit',
        amount: params.amount,
        created_at: new Date().toISOString(),
      }
    );

    const adminBal = calculateWalletBalances(adminWallet.id, db.transaction_entries, adminWallet.currency);
    adminWallet.balance = adminBal.balance;
    adminWallet.available_balance = adminBal.available_balance;

    const recipBal = calculateWalletBalances(recipientWallet.id, db.transaction_entries, recipientWallet.currency);
    recipientWallet.balance = recipBal.balance;
    recipientWallet.available_balance = recipBal.available_balance;

    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      user_id: recipientUser.id,
      type: 'transaction',
      title: i18n.t('admin.users.sendSuccessPrefix', 'Funds received from Administrator'),
      body: `${params.amount.toFixed(2)} ${params.currency} ← ${adminUser.name}.`,
      read_at: null,
      created_at: new Date().toISOString(),
    });

    db.audit_logs.unshift({
      id: `log_${Date.now()}`,
      actor_id: adminUser.id,
      actor_name: adminUser.name,
      action: 'ADMIN_DISBURSEMENT_SENT',
      entity: 'Transaction',
      metadata: { recipientId: recipientUser.id, amount: params.amount, currency: params.currency },
      created_at: new Date().toISOString(),
    });

    saveDatabase(db);
    return transaction;
  },
};
