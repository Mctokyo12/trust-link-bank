import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import confetti from 'canvas-confetti';
import {
  SendHorizontal,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Fingerprint,
  FileDown,
  Building2,
  User,
  Zap,
  RotateCcw,
  Search,
  Check,
  Coins,
  Smartphone,
  ArrowLeftRight,
  ShieldAlert,
  QrCode,
} from 'lucide-react';
import { useAppStore } from '../../app/store';
import { transfersApi, usersApi } from '../../services/api/client';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Transaction, User as UserModel, CurrencyCode } from '../../types';
import { SUPPORTED_CURRENCIES, getExchangeRate, convertCurrency } from '../../utils/currencies';

export const SendMoneyPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { currentUser, wallets, refreshWallets, refreshNotifications } = useAppStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Read initial pre-selected wallet
  const paramWalletId = searchParams.get('walletId') || (location.state as any)?.walletId;
  const initialWallet = (paramWalletId && wallets.find((w) => w.id === paramWalletId)) || wallets[0];

  // Form State
  const [sourceWalletId, setSourceWalletId] = useState(initialWallet?.id || (wallets[0]?.id ?? ''));
  const [transferMode, setTransferMode] = useState<'trustlink' | 'bank' | 'momo'>('trustlink');
  const [momoProvider, setMomoProvider] = useState<'Pix' | 'SPEI' | 'Zelle' | 'Interac' | 'MTN' | 'Orange'>('Zelle');

  // Recipient search & selection state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserModel[]>([]);
  const [allRegisteredUsers, setAllRegisteredUsers] = useState<UserModel[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<UserModel | null>(null);
  const [showManualFields, setShowManualFields] = useState(false);

  const [recipientName, setRecipientName] = useState('');
  const [recipientIdentifier, setRecipientIdentifier] = useState('');
  const [selectedTargetCurrency, setSelectedTargetCurrency] = useState<CurrencyCode | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [reason, setReason] = useState('Payment / Transfer');
  const [biometricAuthConsent, setBiometricAuthConsent] = useState(true);

  // Submission State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [completedTransaction, setCompletedTransaction] = useState<Transaction | null>(null);
  const [newWalletBalance, setNewWalletBalance] = useState<number>(0);

  const selectedWallet = wallets.find((w) => w.id === sourceWalletId) || wallets[0];

  // Fetch all registered users so other accounts are immediately visible
  useEffect(() => {
    let isMounted = true;
    usersApi.getAllUsers(currentUser?.id).then((users) => {
      if (isMounted) {
        setAllRegisteredUsers(users);
        if (!searchQuery.trim()) {
          setSearchResults(users);
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, [currentUser?.id]);

  // Sync wallet when params or wallets array changes
  useEffect(() => {
    const targetId = searchParams.get('walletId') || (location.state as any)?.walletId;
    if (targetId) {
      const found = wallets.find((w) => w.id === targetId);
      if (found) {
        setSourceWalletId(found.id);
      }
    } else if (wallets.length > 0 && !sourceWalletId) {
      setSourceWalletId(wallets[0].id);
    }
  }, [searchParams, location.state, wallets, sourceWalletId]);

  // Query registered users for recipient search
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 1) {
      setSearchResults(allRegisteredUsers);
      setIsSearching(false);
      return;
    }

    let isMounted = true;
    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        const results = await usersApi.searchUsers(trimmed, currentUser?.id);
        if (isMounted) {
          setSearchResults(results);
          setIsSearching(false);
        }
      } catch {
        if (isMounted) setIsSearching(false);
      }
    }, 60);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchQuery, currentUser?.id, allRegisteredUsers]);

  // Auto-detect registered user when typing directly into recipientIdentifier
  useEffect(() => {
    const ident = recipientIdentifier.trim();
    if (!ident || ident.length < 2) return;

    let isMounted = true;
    const timer = setTimeout(async () => {
      try {
        const found = await usersApi.lookupRecipient(ident, currentUser?.id);
        if (isMounted && found && (!selectedRecipient || selectedRecipient.id !== found.id)) {
          setSelectedRecipient(found);
          if (!recipientName || recipientName === ident) {
            setRecipientName(found.name);
          }
          if (found.preferred_currency && !selectedTargetCurrency) {
            setSelectedTargetCurrency(found.preferred_currency);
          }
          setTransferMode('trustlink');
        }
      } catch {}
    }, 120);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [recipientIdentifier, currentUser?.id, selectedRecipient, recipientName, selectedTargetCurrency]);

  const handleSelectUser = (user: UserModel) => {
    setSelectedRecipient(user);
    setRecipientName(user.name);
    setRecipientIdentifier(user.email || user.phone || user.novatag);
    if (user.preferred_currency) {
      setSelectedTargetCurrency(user.preferred_currency);
    }
    setTransferMode('trustlink');
    setSearchQuery('');
    setErrorMsg('');
  };

  // Cross-currency conversion evaluation
  const targetCurrency = (selectedTargetCurrency || selectedRecipient?.preferred_currency || selectedWallet?.currency || 'USD') as CurrencyCode;
  const isCrossCurrency = !!(selectedWallet && targetCurrency !== selectedWallet.currency);
  const exchangeRate = isCrossCurrency ? getExchangeRate(selectedWallet.currency, targetCurrency) : 1.0;
  const convertedAmount = isCrossCurrency && amount > 0 ? convertCurrency(amount, selectedWallet.currency, targetCurrency) : amount;

  // Self-send check
  const isSelfSend = useMemo(() => {
    if (!currentUser) return false;
    if (selectedRecipient && selectedRecipient.id === currentUser.id) return true;
    const cleanIdent = recipientIdentifier.trim().toLowerCase();
    const cleanPhone = cleanIdent.replace(/[\s+-]/g, '');
    const userPhone = (currentUser.phone || '').replace(/[\s+-]/g, '');
    return (
      cleanIdent === currentUser.email?.toLowerCase() ||
      cleanIdent === currentUser.novatag?.toLowerCase() ||
      (cleanPhone && cleanPhone === userPhone)
    );
  }, [currentUser, selectedRecipient, recipientIdentifier]);

  // Fee calculation: Trust Link P2P is free, Bank 1.50, MoMo 0.50
  const fee = transferMode === 'trustlink' ? 0 : transferMode === 'bank' ? 1.5 : 0.5;
  const totalDebit = (amount || 0) + fee;

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || amount <= 0) {
      setErrorMsg(t('send.enterValidAmount', 'Veuillez spécifier un montant supérieur à 0 / Please enter an amount greater than 0.'));
      return;
    }

    if (!recipientName.trim() || !recipientIdentifier.trim()) {
      setErrorMsg(t('send.enterValidRecipient', 'Veuillez sélectionner ou renseigner un destinataire valide.'));
      return;
    }

    if (isSelfSend) {
      setErrorMsg(t('send.cannotSendToSelf', 'Vous ne pouvez pas vous envoyer des fonds à vous-même / You cannot send money to yourself.'));
      return;
    }

    if (selectedWallet && totalDebit > selectedWallet.available_balance) {
      setErrorMsg(
        `${t('send.insufficientFunds', 'Solde insuffisant')}: ${formatCurrency(selectedWallet.available_balance, selectedWallet.currency)} (${t('send.required', 'requis')}: ${formatCurrency(totalDebit, selectedWallet.currency)}).`
      );
      return;
    }

    setErrorMsg('');
    setStep(2);
  };

  const handleConfirmAndSend = async () => {
    if (!selectedWallet) return;

    if (isSelfSend) {
      setErrorMsg(t('send.cannotSendToSelf', 'You cannot send money to yourself.'));
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    const idempotencyKey = `idemp_${selectedWallet.id}_${amount}_${recipientIdentifier}_${Date.now()}`;

    try {
      const res = await transfersApi.sendMoney({
        sourceWalletId: selectedWallet.id,
        recipientUserId: selectedRecipient?.id,
        recipientName: selectedRecipient ? selectedRecipient.name : recipientName,
        recipientIdentifier,
        amount,
        currency: selectedWallet.currency,
        targetCurrency,
        mode: transferMode === 'trustlink' ? 'trustlink' : transferMode === 'bank' ? 'bank' : 'momo',
        provider: transferMode === 'momo' ? momoProvider : 'Trust Link Bank',
        reason,
        idempotencyKey,
      });

      setCompletedTransaction(res.transaction);
      setNewWalletBalance(res.newBalance);
      await refreshWallets();
      await refreshNotifications();

      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#2563EB', '#1E3A8A', '#16A34A', '#EFF6FF'],
        });
      } catch {}

      setStep(3);
    } catch (err: any) {
      setErrorMsg(err.message || t('common.error', 'Transaction failed. Please verify your details.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReceipt = () => {
    if (!completedTransaction || !selectedWallet) return;
    const content = `===========================================
${t('send.officialSlip', 'TRUST LINK BANK OFFICIAL TRANSFER RECEIPT')}
===========================================
${t('common.reference', 'Reference')}: ${completedTransaction.reference}
${t('send.operatorId', 'Operator ID')}: ${completedTransaction.operator_ref || 'TLB-INTERNAL'}
${t('common.date', 'Date')}: ${formatDate(completedTransaction.created_at)}
${t('common.status', 'Status')}: ${t('common.completed', 'COMPLETED & POSTED')}

${t('transactions.senderLabel', 'Sender')}: ${currentUser?.name || 'Trust Link Client'} (${selectedWallet.account_number})
${t('send.recipient', 'Recipient')}: ${completedTransaction.recipient_name} (${recipientIdentifier})
${t('transactions.filterCurrency', 'Currency')}: ${completedTransaction.currency}
${t('send.amountToSend', 'Amount Sent')}: ${formatCurrency(completedTransaction.amount, completedTransaction.currency)}
${t('send.networkFee', 'Network Fee')}: ${formatCurrency(completedTransaction.fee, completedTransaction.currency)}
${t('send.totalAmountToDebit', 'Total Debited')}: ${formatCurrency(completedTransaction.amount + completedTransaction.fee, completedTransaction.currency)}
${isCrossCurrency ? `${t('send.appliedRate', 'Exchange Rate')}: 1 ${selectedWallet.currency} = ${exchangeRate.toFixed(4)} ${targetCurrency}
${t('send.recipientWillReceive', 'Recipient Received')}: ${formatCurrency(convertedAmount, targetCurrency)} (${targetCurrency})` : ''}

${t('send.newBalanceLabel', 'New Account Balance')}: ${formatCurrency(newWalletBalance, completedTransaction.currency)}
===========================================
Trust Link Bank Technologies Inc. • 256-bit Encryption
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Receipt-TrustLinkBank-${completedTransaction.reference}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin';

  // Rule: Regular clients can ONLY receive money, NOT send money
  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto space-y-6 pt-4 animate-in fade-in duration-200">
        <div className="bg-white dark:bg-[#0F172A] border border-amber-200 dark:border-amber-900/50 rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-lg shadow-amber-500/5">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-950/80 px-3 py-1 rounded-full border border-amber-300 dark:border-amber-800">
              {t('transfers.receiveOnlyBadge', 'Client Profile • Receive Only')}
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white mt-3 font-display">
              {t('transfers.adminOnlySendTitle', 'Sending funds is reserved for Administration')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
              {t('transfers.adminOnlySendDesc', 'Your client account is configured in Receive-Only mode. You cannot send money to other users. Only the administrator is authorized to issue transfers and credit accounts.')}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-left space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
              <QrCode className="w-4 h-4 text-[#2563EB]" />
              <span>{t('transfers.receiveInstantlyTitle', 'Receive money instantly')}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t('transfers.receiveInstantlyDesc', {
                tag: currentUser?.novatag || '@user.tlb',
                defaultValue: `To receive funds into your account, share your identifier ${currentUser?.novatag} or generate your secure QR code.`,
              })}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={() => navigate('/receive')}
              className="bg-[#2563EB] hover:bg-[#1E3A8A] text-white px-5 py-3 rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>{t('transfers.accessReceiveDetailsBtn', 'View my Receive details')}</span>
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-5 py-3 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              {t('transfers.backToDashboard', 'Back to Dashboard')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Step Indicator Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            if (step === 2) setStep(1);
            else navigate('/dashboard');
          }}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{step === 2 ? (t('common.back') || 'Back') : (t('nav.home') || 'Dashboard')}</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <span className={step >= 1 ? 'text-[#2563EB] dark:text-blue-400' : 'text-slate-400 dark:text-slate-600'}>
              {t('send.step1', '1. Amount')}
            </span>
            <span className="text-slate-300 dark:text-slate-600">→</span>
            <span className={step >= 2 ? 'text-[#2563EB] dark:text-blue-400' : 'text-slate-400 dark:text-slate-600'}>
              {t('send.step2', '2. Review')}
            </span>
            <span className="text-slate-300 dark:text-slate-600">→</span>
            <span className={step === 3 ? 'text-[#16A34A] dark:text-emerald-400' : 'text-slate-400 dark:text-slate-600'}>
              {t('send.step3', '3. Confirmation')}
            </span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-[#DC2626] dark:text-red-400 text-xs font-medium flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">{errorMsg}</div>
        </div>
      )}

      {/* STEP 1: Beneficiary, Amount & Currency Conversion */}
      {step === 1 && (
        <form onSubmit={handleStep1Submit} className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 transition-colors">
          <div>
            <span className="text-[11px] font-bold text-[#2563EB] dark:text-blue-400 uppercase tracking-wider">
              {t('send.step1Indicator', 'Step 1 of 2')}
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white font-display mt-0.5">
              {t('send.title', 'Send Money')}
            </h1>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">
              {t('send.instantSwitchNote', 'Guaranteed instant delivery via Trust Link Bank InstantSwitch gateway.')}
            </p>
          </div>

          {/* Source Wallet Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] dark:text-slate-200 mb-1.5">
              {t('send.sourceAccount', 'Source account')} *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {wallets.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setSourceWalletId(w.id)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    sourceWalletId === w.id
                      ? 'border-[#2563EB] dark:border-blue-500 bg-[#EFF6FF] dark:bg-blue-950/40 ring-2 ring-[#2563EB]/20 dark:ring-blue-500/20 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-[#1E293B]/70'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-[#0F172A] dark:text-white">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                      <span>{w.currency}</span>
                    </span>
                    <span className="text-[10px] text-[#64748B] dark:text-slate-400 font-mono">
                      {w.account_number.slice(0, 12)}...
                    </span>
                  </div>
                  <div className="text-sm font-extrabold text-[#0F172A] dark:text-white mt-1.5 tabular-nums">
                    {formatCurrency(w.available_balance, w.currency)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Transfer Mode Tabs */}
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] dark:text-slate-200 mb-1.5">
              {t('send.transferMode', 'Transfer mode')} *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTransferMode('trustlink')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  transferMode === 'trustlink'
                    ? 'border-[#2563EB] dark:border-blue-500 bg-[#EFF6FF] dark:bg-blue-950/40 text-[#1E3A8A] dark:text-blue-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-[#64748B] dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Zap className="w-4 h-4 text-[#2563EB] dark:text-blue-400" />
                <span>{t('send.trustlinkMode', 'Trust Link Bank')}</span>
                <span className="text-[10px] text-[#16A34A] dark:text-emerald-400 font-semibold">{t('send.free', 'Instant • Free')}</span>
              </button>

              <button
                type="button"
                onClick={() => setTransferMode('bank')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  transferMode === 'bank'
                    ? 'border-[#2563EB] dark:border-blue-500 bg-[#EFF6FF] dark:bg-blue-950/40 text-[#1E3A8A] dark:text-blue-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-[#64748B] dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Building2 className="w-4 h-4 text-[#2563EB] dark:text-blue-400" />
                <span>{t('send.bankMode', 'Wire Transfer')}</span>
                <span className="text-[10px] text-[#64748B] dark:text-slate-400">ACH / SEPA / Wire</span>
              </button>

              <button
                type="button"
                onClick={() => setTransferMode('momo')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  transferMode === 'momo'
                    ? 'border-[#2563EB] dark:border-blue-500 bg-[#EFF6FF] dark:bg-blue-950/40 text-[#1E3A8A] dark:text-blue-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-[#64748B] dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Smartphone className="w-4 h-4 text-[#2563EB] dark:text-blue-400" />
                <span>{t('send.momoMode', 'Mobile Wallet')}</span>
                <span className="text-[10px] text-[#64748B] dark:text-slate-400">Pix / SPEI / Zelle</span>
              </button>
            </div>
          </div>

          {/* Recipient Details & Discovery */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-[#0F172A] dark:text-slate-200 uppercase tracking-wider">
                {t('send.recipient', 'Recipient')} *
              </label>
              {selectedRecipient && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRecipient(null);
                    setRecipientName('');
                    setRecipientIdentifier('');
                    setShowManualFields(false);
                  }}
                  className="text-xs text-[#2563EB] dark:text-blue-400 hover:text-[#1E3A8A] dark:hover:text-blue-300 font-bold cursor-pointer underline flex items-center gap-1"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>{t('common.change', 'Change')}</span>
                </button>
              )}
            </div>

            {/* CASE 1: Selected Registered Recipient Card */}
            {selectedRecipient ? (
              <div className="p-4 rounded-2xl bg-[#EFF6FF] dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center font-bold text-sm shrink-0 ring-2 ring-blue-300 dark:ring-blue-800">
                    {selectedRecipient.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-[#0F172A] dark:text-white truncate">
                        {selectedRecipient.name}
                      </span>
                      <span className="text-sm">{selectedRecipient.flag}</span>
                      <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/50 text-[#16A34A] dark:text-emerald-400 font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                        <Check className="w-3 h-3 text-[#16A34A] dark:text-emerald-400" />
                        {t('auth.verified', 'Verified')}
                      </span>
                    </div>
                    <div className="text-xs text-[#64748B] dark:text-slate-400 truncate mt-0.5">
                      {selectedRecipient.email || selectedRecipient.phone} • <span className="font-mono text-blue-700 dark:text-blue-400 font-bold">{selectedRecipient.novatag}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 text-right pl-3">
                  <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-blue-200/80 dark:bg-blue-900/80 text-[#1E3A8A] dark:text-blue-200">
                    {selectedRecipient.preferred_currency || 'USD'}
                  </span>
                </div>
              </div>
            ) : (
              /* CASE 2: Search & Select from Registered Users */
              <div className="space-y-3">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('send.recipientPlaceholder', 'Search by name, @tag, email, or phone...')}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#1E293B] rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-medium text-[#0F172A] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#2563EB] dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Registered Members List */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-[#64748B] dark:text-slate-400 px-1">
                    <span>{t('send.registeredMembersTitle', 'Registered Trust Link Bank Members')}</span>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">
                      {searchResults.length} {t('wallets.activeAccountsCount', 'active account(s)')}
                    </span>
                  </div>

                  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-2 max-h-56 overflow-y-auto space-y-1 bg-white dark:bg-[#0F172A] shadow-xs">
                    {isSearching ? (
                      <div className="p-4 text-center text-xs text-[#64748B] dark:text-slate-400">
                        {t('common.searching', 'Searching...')}
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="p-4 text-center text-xs text-[#64748B] dark:text-slate-400">
                        <p>{t('send.noUserFound', 'No user found.')}</p>
                        <button
                          type="button"
                          onClick={() => setShowManualFields(true)}
                          className="mt-2 text-xs text-[#2563EB] dark:text-blue-400 font-bold hover:underline"
                        >
                          {t('send.enterExternalDetails', 'Enter external details manually')}
                        </button>
                      </div>
                    ) : (
                      searchResults.map((user) => {
                        const isSameCurrency = (user.preferred_currency || 'USD') === selectedWallet?.currency;
                        return (
                          <div
                            key={user.id}
                            onClick={() => handleSelectUser(user)}
                            className="p-2.5 rounded-xl flex items-center justify-between cursor-pointer transition-all hover:bg-[#EFF6FF] dark:hover:bg-blue-950/40 border border-transparent hover:border-blue-200 dark:hover:border-blue-900 group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-[#2563EB] transition-colors">
                                {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold text-[#0F172A] dark:text-white truncate group-hover:text-[#2563EB] dark:group-hover:text-blue-400">
                                    {user.name}
                                  </span>
                                  <span className="text-xs">{user.flag}</span>
                                </div>
                                <div className="text-[11px] text-[#64748B] dark:text-slate-400 truncate">
                                  {user.email || user.phone} • <span className="font-mono text-blue-600 dark:text-blue-400">{user.novatag}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 text-right">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  isSameCurrency ? 'bg-emerald-100 dark:bg-emerald-950/50 text-[#16A34A] dark:text-emerald-400' : 'bg-blue-100 dark:bg-blue-950/50 text-[#2563EB] dark:text-blue-400'
                                }`}
                              >
                                {user.preferred_currency || 'USD'}
                              </span>
                              <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-[#2563EB] dark:group-hover:text-blue-400 transition-colors" />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Option to toggle manual / external recipient */}
                <div className="pt-1">
                  {!showManualFields ? (
                    <button
                      type="button"
                      onClick={() => setShowManualFields(true)}
                      className="text-xs text-[#2563EB] dark:text-blue-400 hover:text-[#1E3A8A] dark:hover:text-blue-300 font-semibold cursor-pointer underline flex items-center gap-1.5"
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{t('send.sendToExternalAccount', 'Send to an external bank account or mobile wallet')}</span>
                    </button>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1E293B]/70 border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#0F172A] dark:text-white">
                          {t('send.externalRecipientDetails', 'External Recipient Details')}
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowManualFields(false)}
                          className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                        >
                          {t('common.cancel', 'Cancel')}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-[#64748B] dark:text-slate-400 mb-1">
                            {t('beneficiaries.fullName', 'Full name')} *
                          </label>
                          <input
                            type="text"
                            value={recipientName}
                            onChange={(e) => setRecipientName(e.target.value)}
                            placeholder="Ex: Carlos Gomez"
                            required={!selectedRecipient}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-medium text-[#0F172A] dark:text-white focus:outline-none focus:border-[#2563EB] dark:focus:border-blue-500 bg-white dark:bg-[#0F172A]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-[#64748B] dark:text-slate-400 mb-1">
                            {t('auth.phoneNumber', 'Email, phone, or account')} *
                          </label>
                          <input
                            type="text"
                            value={recipientIdentifier}
                            onChange={(e) => setRecipientIdentifier(e.target.value)}
                            placeholder="name@example.com / +1 415..."
                            required={!selectedRecipient}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-medium text-[#0F172A] dark:text-white focus:outline-none focus:border-[#2563EB] dark:focus:border-blue-500 bg-white dark:bg-[#0F172A]"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* CURRENCY CONVERSION OPTION (Multi-currency Sending Requirement) */}
          <div className="bg-slate-50 dark:bg-[#1E293B]/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-[#2563EB] dark:text-blue-400" />
                <span className="text-xs font-bold text-[#0F172A] dark:text-white">
                  {t('send.currencyConversionOption', 'Recipient Currency & FX Option')}
                </span>
              </div>
              {isCrossCurrency && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-[#2563EB] dark:text-blue-400">
                  {t('send.guaranteedRate', 'Guaranteed Rate')}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#64748B] dark:text-slate-400 mb-1">
                  {t('send.debitedWallet', 'Debited wallet')}
                </label>
                <div className="p-2.5 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs font-bold text-[#0F172A] dark:text-white">
                  <span>{selectedWallet?.currency}</span>
                  <span className="text-[11px] text-[#64748B] dark:text-slate-400 font-mono">
                    {formatCurrency(selectedWallet?.available_balance || 0, selectedWallet?.currency || 'USD')}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#64748B] dark:text-slate-400 mb-1">
                  {t('send.receivedCurrency', 'Currency Received by Recipient')} *
                </label>
                <select
                  value={targetCurrency}
                  onChange={(e) => setSelectedTargetCurrency(e.target.value as CurrencyCode)}
                  className="w-full p-2.5 bg-white dark:bg-[#0F172A] border border-blue-300 dark:border-blue-700 text-xs font-bold text-[#0F172A] dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 cursor-pointer"
                >
                  {SUPPORTED_CURRENCIES.map((curr) => (
                    <option key={curr.code} value={curr.code}>
                      {curr.flag} {curr.code} — {curr.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Real-time FX conversion summary banner */}
            {isCrossCurrency && (
              <div className="p-3 bg-[#EFF6FF] dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="space-y-0.5">
                  <div className="text-[11px] text-[#1E3A8A] dark:text-blue-300 font-semibold">
                    {t('send.conversionRateLabel', 'Applied Exchange Rate')} :
                  </div>
                  <div className="font-extrabold text-[#2563EB] dark:text-blue-400">
                    1 {selectedWallet?.currency} = {exchangeRate.toFixed(4)} {targetCurrency}
                  </div>
                </div>
                <div className="sm:text-right">
                  <div className="text-[11px] text-[#1E3A8A] dark:text-blue-300 font-semibold">
                    {t('send.recipientWillReceive', 'Recipient will receive')} :
                  </div>
                  <div className="text-sm font-black text-[#16A34A] dark:text-emerald-400 tabular-nums">
                    {formatCurrency(convertedAmount, targetCurrency)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Self-send alert */}
          {isSelfSend && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-[#DC2626] dark:text-red-400 text-xs font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{t('send.cannotSendToSelf', 'You cannot send money to yourself.')}</span>
            </div>
          )}

          {/* Amount input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-[#0F172A] dark:text-slate-200">
                {t('send.amountToSend', 'Amount to send')} ({selectedWallet?.currency}) *
              </label>
              <button
                type="button"
                onClick={() => setAmount(Math.max(0, (selectedWallet?.available_balance || 0) - fee))}
                className="text-[11px] text-[#2563EB] dark:text-blue-400 font-bold hover:underline cursor-pointer"
              >
                {t('send.maxBalance', 'Max balance')} : {formatCurrency(selectedWallet?.available_balance || 0, selectedWallet?.currency || 'USD')}
              </button>
            </div>

            <div className="relative rounded-2xl border border-slate-300 dark:border-slate-700 focus-within:border-[#2563EB] dark:focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-900/30 overflow-hidden bg-white dark:bg-[#1E293B]">
              <input
                type="number"
                step="any"
                min="0.01"
                value={amount || ''}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                required
                className="w-full py-3.5 pl-4 pr-24 text-2xl font-black font-display text-[#0F172A] dark:text-white bg-transparent focus:outline-none tabular-nums"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-extrabold text-[#1E3A8A] dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg">
                {selectedWallet?.currency}
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div className="flex flex-wrap gap-2 mt-2">
              {[10, 50, 100, 250, 500].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  +{val} {selectedWallet?.currency}
                </button>
              ))}
            </div>
          </div>

          {/* Transfer Reason */}
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] dark:text-slate-200 mb-1">
              {t('send.transferReason', 'Transfer note (optional)')}
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t('send.reasonPlaceholder', 'Ex: Rent payment, project advance, gift...')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-medium text-[#0F172A] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-[#1E293B] focus:outline-none focus:border-[#2563EB] dark:focus:border-blue-500"
            />
          </div>

          {/* Fee & Total Summary */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1E293B]/70 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-[#64748B] dark:text-slate-400">
              <span>{t('send.networkFee', 'Operator network fee')}</span>
              <span className="font-bold text-[#16A34A] dark:text-emerald-400">
                {fee === 0 ? t('send.free', 'Instant • Free') : formatCurrency(fee, selectedWallet?.currency || 'USD')}
              </span>
            </div>
            {isCrossCurrency && (
              <div className="flex justify-between text-[#2563EB] dark:text-blue-400">
                <span>{t('send.conversionRateLabel', 'Applied Exchange Rate')}</span>
                <span className="font-mono font-bold">
                  1 {selectedWallet?.currency} = {exchangeRate.toFixed(4)} {targetCurrency}
                </span>
              </div>
            )}
            <div className="flex justify-between text-[#0F172A] dark:text-white font-extrabold pt-2 border-t border-slate-200 dark:border-slate-800 text-sm">
              <span>{t('send.totalAmountToDebit', 'Total amount to debit')}</span>
              <span className="tabular-nums">
                {formatCurrency(totalDebit, selectedWallet?.currency || 'USD')}
              </span>
            </div>
            {isCrossCurrency && (
              <div className="flex justify-between text-[#16A34A] dark:text-emerald-400 font-bold text-xs pt-1">
                <span>{t('send.recipientWillReceive', 'Recipient will receive')} :</span>
                <span className="tabular-nums font-black font-mono">
                  {formatCurrency(convertedAmount, targetCurrency)}
                </span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSelfSend || totalDebit <= 0}
            className="w-full bg-[#2563EB] hover:bg-[#1E3A8A] text-white py-3.5 px-4 rounded-2xl text-sm font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <span>{t('send.continueReview', 'Continue to review')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* STEP 2: Verification & Confirmation */}
      {step === 2 && (
        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 transition-colors">
          <div>
            <span className="text-[11px] font-bold text-[#2563EB] dark:text-blue-400 uppercase tracking-wider">
              {t('send.step2Indicator', 'Step 2 of 2: Summary')}
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white font-display mt-0.5">
              {t('send.step2Title', 'Review & Verify')}
            </h1>
          </div>

          {/* Transfer Summary Card */}
          <div className="p-5 rounded-2xl bg-[#EFF6FF] dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-3">
            <div className="text-center py-2">
              <div className="text-xs text-[#1E3A8A] dark:text-blue-300 font-semibold uppercase tracking-wider">
                {t('send.debitedAmount', 'Debited amount')}
              </div>
              <div className="text-3xl sm:text-4xl font-black text-[#0F172A] dark:text-white font-display mt-1 tabular-nums">
                {formatCurrency(amount, selectedWallet?.currency || 'USD')}
              </div>
              <div className="text-xs text-[#16A34A] dark:text-emerald-400 font-semibold mt-1">
                {t('send.networkFee', 'Fee')} : {fee === 0 ? t('send.free', 'Free') : formatCurrency(fee, selectedWallet?.currency || 'USD')}
              </div>
            </div>

            <div className="border-t border-blue-200 dark:border-blue-900/60 pt-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#64748B] dark:text-slate-400">{t('send.sourceAccount', 'Source account')} :</span>
                <span className="font-bold text-[#0F172A] dark:text-white font-mono">{selectedWallet?.account_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B] dark:text-slate-400">{t('send.recipient', 'Recipient')} :</span>
                <span className="font-bold text-[#0F172A] dark:text-white">{recipientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B] dark:text-slate-400">{t('auth.primaryIdentifier', 'Identifier')} :</span>
                <span className="font-bold text-[#0F172A] dark:text-white font-mono">{recipientIdentifier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B] dark:text-slate-400">{t('send.transferReason', 'Note')} :</span>
                <span className="font-medium text-[#0F172A] dark:text-white">{reason || 'P2P Transfer'}</span>
              </div>

              {isCrossCurrency && (
                <>
                  <div className="flex justify-between items-center text-blue-700 dark:text-blue-300 bg-blue-50/70 dark:bg-blue-900/30 p-2.5 rounded-xl border border-blue-100 dark:border-blue-900/50">
                    <span className="text-xs text-[#1E3A8A] dark:text-blue-300 font-semibold">{t('send.appliedRate', 'Applied rate')} :</span>
                    <span className="font-mono font-bold text-xs text-[#1E3A8A] dark:text-blue-200">
                      1 {selectedWallet?.currency} = {exchangeRate.toFixed(4)} {targetCurrency}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-green-800 dark:text-emerald-300 bg-green-50/70 dark:bg-emerald-950/30 p-2.5 rounded-xl border border-green-200 dark:border-emerald-900/50">
                    <span className="text-xs text-[#16A34A] dark:text-emerald-400 font-bold">{t('send.recipientWillReceive', 'Recipient will receive')} :</span>
                    <span className="font-mono font-black text-sm text-[#16A34A] dark:text-emerald-400">
                      {formatCurrency(convertedAmount, targetCurrency)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Biometric / Security Consent */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1E293B]/70 border border-slate-200 dark:border-slate-800">
            <Fingerprint className="w-5 h-5 text-[#2563EB] dark:text-blue-400 shrink-0" />
            <div className="flex-1 text-xs">
              <div className="font-bold text-[#0F172A] dark:text-white">{t('send.authConsent', 'Confirm with Touch ID / Face ID or PIN')}</div>
              <div className="text-[#64748B] dark:text-slate-400">{t('send.authConsentDesc', 'Authorize immediate debit from your Trust Link Bank account')}</div>
            </div>
            <input
              type="checkbox"
              checked={biometricAuthConsent}
              onChange={(e) => setBiometricAuthConsent(e.target.checked)}
              className="w-4 h-4 text-[#2563EB] rounded border-slate-300 dark:border-slate-700 focus:ring-[#2563EB]"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-[#0F172A] dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {t('send.modifyDetails', 'Edit details')}
            </button>
            <button
              type="button"
              disabled={isLoading || !biometricAuthConsent}
              onClick={handleConfirmAndSend}
              className="flex-2 bg-[#2563EB] hover:bg-[#1E3A8A] text-white py-3.5 px-4 rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <SendHorizontal className="w-4 h-4" />
              <span>{isLoading ? (t('common.loading') || 'Processing...') : (t('send.confirmAndSend', 'Confirm and send'))}</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Receipt & Success */}
      {step === 3 && completedTransaction && (
        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm text-center space-y-6 transition-colors">
          <div className="w-16 h-16 rounded-full bg-green-50 dark:bg-emerald-950/50 text-[#16A34A] dark:text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-green-50 dark:ring-emerald-950/30">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[11px] font-bold text-[#16A34A] dark:text-emerald-400 uppercase tracking-wider">
              {t('send.successTitle', 'Transfer Successful!')}
            </span>
            <h1 className="text-2xl font-black text-[#0F172A] dark:text-white font-display mt-1">
              {formatCurrency(completedTransaction.amount, completedTransaction.currency)}
            </h1>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">
              {t('send.successSubtitle', 'Funds have been deposited successfully into your recipient\'s account.')} (<strong className="text-[#0F172A] dark:text-white">{completedTransaction.recipient_name}</strong>)
            </p>
          </div>

          {/* Receipt Breakdown Card */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#1E293B]/70 border border-slate-200 dark:border-slate-800 text-left space-y-2.5 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-[#64748B] dark:text-slate-400">{t('send.transactionId', 'Transaction ID')} :</span>
              <span className="font-bold text-[#0F172A] dark:text-white">{completedTransaction.reference}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B] dark:text-slate-400">{t('transactions.date', 'Date & Time')} :</span>
              <span className="text-[#0F172A] dark:text-white">{formatDate(completedTransaction.created_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B] dark:text-slate-400">{t('send.recipient', 'Recipient')} :</span>
              <span className="text-[#0F172A] dark:text-white font-sans font-bold">{completedTransaction.recipient_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B] dark:text-slate-400">{t('send.newBalanceLabel', 'New balance')} :</span>
              <span className="font-bold text-[#16A34A] dark:text-emerald-400">
                {formatCurrency(newWalletBalance, completedTransaction.currency)}
              </span>
            </div>
            {isCrossCurrency && (
              <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-2 text-[#16A34A] dark:text-emerald-400 font-bold">
                <span>{t('send.recipientWillReceive', 'Recipient will receive')} :</span>
                <span>
                  {formatCurrency(convertedAmount, targetCurrency)}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleDownloadReceipt}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-[#0F172A] dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileDown className="w-4 h-4 text-[#2563EB] dark:text-blue-400" />
              <span>{t('send.downloadReceipt', 'Download official receipt')}</span>
            </button>
            <button
              onClick={() => {
                setAmount(0);
                setSelectedRecipient(null);
                setRecipientName('');
                setRecipientIdentifier('');
                setStep(1);
              }}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-[#0F172A] dark:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t('send.newTransfer', 'New transfer')}</span>
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-[#2563EB] hover:bg-[#1E3A8A] text-white py-3 px-4 rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
            >
              {t('nav.home', 'Dashboard')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SendMoneyPage;
