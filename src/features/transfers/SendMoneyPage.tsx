import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import confetti from 'canvas-confetti';
import {
  SendHorizontal,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Fingerprint,
  FileDown,
  Share2,
  Smartphone,
  Building2,
  User,
  Zap,
  RotateCcw,
  Home,
  Plus,
} from 'lucide-react';
import { useAppStore } from '../../app/store';
import { transfersApi } from '../../services/api/client';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Transaction } from '../../types';

export const SendMoneyPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { wallets, refreshWallets, refreshNotifications } = useAppStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Read initial pre-selected wallet from query param or location state
  const paramWalletId = searchParams.get('walletId') || (location.state as any)?.walletId;
  const initialWallet = (paramWalletId && wallets.find((w) => w.id === paramWalletId)) || wallets[0];

  // Form State
  const [sourceWalletId, setSourceWalletId] = useState(initialWallet?.id || 'w_amina_xaf');
  const [transferMode, setTransferMode] = useState<'novapay' | 'momo' | 'bank'>(
    initialWallet?.currency === 'USD' || initialWallet?.currency === 'EUR' ? 'bank' : 'momo'
  );
  const [momoProvider, setMomoProvider] = useState<'MTN' | 'Orange' | 'Wave'>('MTN');
  const [recipientName, setRecipientName] = useState("Samuel Eto'o");
  const [recipientIdentifier, setRecipientIdentifier] = useState('+237 670 12 34 56');
  const [amount, setAmount] = useState<number>(
    initialWallet?.currency === 'XAF' ? 100000 : 150
  );
  const [reason, setReason] = useState('Paiement prestation');
  const [biometricAuthConsent, setBiometricAuthConsent] = useState(true);

  // Sync wallet when params or wallets array changes
  useEffect(() => {
    const targetId = searchParams.get('walletId') || (location.state as any)?.walletId;
    if (targetId) {
      const found = wallets.find((w) => w.id === targetId);
      if (found) {
        setSourceWalletId(found.id);
        if (found.currency === 'USD' || found.currency === 'EUR') {
          setTransferMode('bank');
          setAmount(150);
        } else {
          setTransferMode('momo');
          setAmount(100000);
        }
      }
    }
  }, [searchParams, location.state, wallets]);

  // Submission State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [completedTransaction, setCompletedTransaction] = useState<Transaction | null>(null);
  const [newWalletBalance, setNewWalletBalance] = useState<number>(0);

  const selectedWallet = wallets.find((w) => w.id === sourceWalletId) || wallets[0];

  // Frequent beneficiaries presets
  const quickRecipients = [
    {
      name: "Samuel Eto'o",
      phone: '+237 670 12 34 56',
      mode: 'momo' as const,
      provider: 'MTN' as const,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    },
    {
      name: 'Marie Koné',
      phone: '+225 07 88 12 34 56',
      mode: 'momo' as const,
      provider: 'Wave' as const,
      avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&auto=format&fit=crop&q=80',
    },
    {
      name: 'Jean Dupont',
      phone: 'FR76 3000 6000 0112 3456 7890 888',
      mode: 'bank' as const,
      provider: 'SEPA' as any,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    },
    {
      name: 'Kofi Mensah',
      phone: '@kofi.m',
      mode: 'novapay' as const,
      provider: 'NovaPay' as any,
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80',
    },
  ];

  // Fee computation
  const networkFee = transferMode === 'momo' ? 500 : transferMode === 'bank' ? 1500 : 0;
  const novapayFee = 0; // Free / Offered promo
  const totalDebit = amount + networkFee + novapayFee;

  const handleSelectQuickRecipient = (r: typeof quickRecipients[0]) => {
    setRecipientName(r.name);
    setRecipientIdentifier(r.phone);
    setTransferMode(r.mode);
    if (r.mode === 'momo') setMomoProvider(r.provider);
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      setErrorMsg('Veuillez spécifier un montant supérieur à 0.');
      return;
    }
    if (totalDebit > selectedWallet.available_balance) {
      setErrorMsg(`Solde insuffisant: disponible ${formatCurrency(selectedWallet.available_balance, selectedWallet.currency)}, requis ${formatCurrency(totalDebit, selectedWallet.currency)}.`);
      return;
    }
    setErrorMsg('');
    setStep(2);
  };

  const handleConfirmAndSend = async () => {
    setIsLoading(true);
    setErrorMsg('');

    // Generate idempotency key
    const idempotencyKey = `idemp_${selectedWallet.id}_${amount}_${recipientIdentifier}_${Date.now()}`;

    try {
      const res = await transfersApi.sendMoney({
        sourceWalletId: selectedWallet.id,
        recipientName,
        recipientIdentifier,
        amount,
        currency: selectedWallet.currency,
        mode: transferMode,
        provider: transferMode === 'momo' ? momoProvider : undefined,
        reason,
        idempotencyKey,
      });

      setCompletedTransaction(res.transaction);
      setNewWalletBalance(res.newBalance);
      await refreshWallets();
      await refreshNotifications();

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#14B8A6', '#2563EB', '#22C55E', '#F59E0B'],
        });
      } catch {}

      setStep(3);
    } catch (err: any) {
      setErrorMsg(err.message || 'Échec de la transaction. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReceipt = () => {
    if (!completedTransaction) return;
    const content = `===========================================
BORDEREAU OFFICIEL DE TRANSFERT NOVAPAY
===========================================
Référence: ${completedTransaction.reference}
Opérateur: ${completedTransaction.operator_ref || 'N/A'}
Date: ${formatDate(completedTransaction.created_at)}
Statut: VALIDÉ & CERTIFIÉ BEAC/COBAC

Émetteur: Amina Diallo (${selectedWallet.account_number})
Destinataire: ${completedTransaction.recipient_name} (${recipientIdentifier})
Montant transféré: ${formatCurrency(completedTransaction.amount, completedTransaction.currency)}
Frais réseau: ${formatCurrency(completedTransaction.fee, completedTransaction.currency)}
Total débité: ${formatCurrency(completedTransaction.amount + completedTransaction.fee, completedTransaction.currency)}

Nouveau solde du compte: ${formatCurrency(newWalletBalance, completedTransaction.currency)}
===========================================
NovaPay Technologies Inc. • Chiffrement AES-256
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Recu-NovaPay-${completedTransaction.reference}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Step Indicator Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            if (step === 2) setStep(1);
            else navigate('/dashboard');
          }}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{step === 2 ? t('common.back') : t('dashboard.greeting')}</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <span className={step >= 1 ? 'text-[#14B8A6]' : 'text-slate-400'}>1. Montant</span>
            <span className="text-slate-300">→</span>
            <span className={step >= 2 ? 'text-[#14B8A6]' : 'text-slate-400'}>2. Vérification</span>
            <span className="text-slate-300">→</span>
            <span className={step === 3 ? 'text-[#22C55E]' : 'text-slate-400'}>3. Reçu</span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STEP 1: Beneficiary & Amount */}
      {step === 1 && (
        <form onSubmit={handleStep1Submit} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <span className="text-[11px] font-bold text-[#14B8A6] uppercase tracking-wider">{t('send.step1Indicator')}</span>
            <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] font-display mt-0.5">
              {t('send.step1Title')}
            </h1>
          </div>

          {/* Source Wallet Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {t('send.sourceAccount')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {wallets.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setSourceWalletId(w.id)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    sourceWalletId === w.id
                      ? 'border-[#14B8A6] bg-teal-50/40 ring-1 ring-[#14B8A6]'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-[#0F172A]">
                    <span>{w.currency}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {w.account_number.slice(0, 10)}...
                    </span>
                  </div>
                  <div className="text-sm font-extrabold text-slate-900 mt-1 tabular-nums">
                    {formatCurrency(w.available_balance, w.currency)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Transfer Mode Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {t('send.transferMode')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTransferMode('momo')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                  transferMode === 'momo'
                    ? 'border-[#14B8A6] bg-teal-50 text-[#0F172A] shadow-sm'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Smartphone className="w-4 h-4 text-[#14B8A6]" />
                <span>{t('send.momoMode')}</span>
              </button>

              <button
                type="button"
                onClick={() => setTransferMode('novapay')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                  transferMode === 'novapay'
                    ? 'border-[#14B8A6] bg-teal-50 text-[#0F172A] shadow-sm'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Zap className="w-4 h-4 text-[#22C55E]" />
                <span>{t('send.novapayMode')} (P2P)</span>
              </button>

              <button
                type="button"
                onClick={() => setTransferMode('bank')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                  transferMode === 'bank'
                    ? 'border-[#14B8A6] bg-teal-50 text-[#0F172A] shadow-sm'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Building2 className="w-4 h-4 text-[#2563EB]" />
                <span>{t('send.bankMode')}</span>
              </button>
            </div>
          </div>

          {/* If Mobile Money: Select Provider */}
          {transferMode === 'momo' && (
            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-2xl border border-slate-200">
              {(['MTN', 'Orange', 'Wave'] as const).map((prov) => (
                <button
                  key={prov}
                  type="button"
                  onClick={() => setMomoProvider(prov)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    momoProvider === prov
                      ? 'bg-white text-[#0F172A] shadow-sm border border-slate-200'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {prov === 'MTN' && '🟡 MTN MoMo'}
                  {prov === 'Orange' && '🟠 Orange Money'}
                  {prov === 'Wave' && '🔵 Wave'}
                </button>
              ))}
            </div>
          )}

          {/* Quick Recipient Carousel */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700">
                {t('send.contactsDirectory')}
              </label>
            </div>
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
              {quickRecipients.map((rec, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectQuickRecipient(rec)}
                  className="flex flex-col items-center shrink-0 p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-center w-20"
                >
                  <img
                    src={rec.avatar}
                    alt={rec.name}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-100 mb-1"
                  />
                  <span className="text-[11px] font-bold text-slate-800 truncate w-full">{rec.name.split(' ')[0]}</span>
                  <span className="text-[9px] text-slate-400 font-mono truncate w-full">{rec.provider}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recipient Manual Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nom du bénéficiaire *
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Ex: Samuel Eto'o"
                required
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/20 text-sm font-medium focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Numéro / Identifiant / IBAN *
              </label>
              <input
                type="text"
                value={recipientIdentifier}
                onChange={(e) => setRecipientIdentifier(e.target.value)}
                placeholder="+237 670 12 34 56"
                required
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/20 text-sm font-mono focus:outline-none"
              />
            </div>
          </div>

          {/* Amount to send */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t('send.amountToSend')} ({selectedWallet.currency}) *
            </label>
            <div className="relative">
              <input
                type="number"
                min={1}
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="100 000"
                required
                className="w-full pl-4 pr-24 py-3.5 rounded-2xl border border-slate-300 focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/20 text-2xl font-black text-[#0F172A] font-display tabular-nums focus:outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-500 font-display">
                {selectedWallet.currency}
              </span>
            </div>

            {/* Quick preset amount pills */}
            <div className="flex flex-wrap gap-2 mt-2.5">
              {[25000, 50000, 100000, 250000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset)}
                  className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  {preset.toLocaleString()} {selectedWallet.currency}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAmount(Math.max(0, selectedWallet.available_balance - networkFee))}
                className="px-3 py-1 rounded-lg text-xs font-bold bg-teal-50 hover:bg-teal-100 text-[#0D9488] transition-colors"
              >
                {t('send.maxBalance')}
              </button>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t('send.transferReason')}
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t('send.reasonPlaceholder')}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/20 text-sm focus:outline-none"
            />
          </div>

          {/* Fee Transparency Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="font-bold text-slate-800 text-xs mb-1">
              {t('send.feeDetail')}
            </div>
            <div className="flex justify-between text-slate-600">
              <span>{t('send.debitedAmount')} :</span>
              <strong className="text-slate-800 tabular-nums">{formatCurrency(amount, selectedWallet.currency)}</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>{t('send.novapayServiceFee')} :</span>
              <span className="font-bold text-emerald-600">0 {selectedWallet.currency} ({t('common.offered')})</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>{t('send.networkFee')} :</span>
              <span className="font-bold text-slate-800 tabular-nums">{formatCurrency(networkFee, selectedWallet.currency)}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-[#0F172A]">
              <span>{t('send.totalAmountToDebit')} :</span>
              <span className="text-[#14B8A6] tabular-nums">{formatCurrency(totalDebit, selectedWallet.currency)}</span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#14B8A6] hover:bg-[#0D9488] text-white py-3.5 px-4 rounded-2xl text-sm font-bold shadow-md shadow-teal-500/20 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5"
          >
            <span>{t('send.continueReview')}</span>
            <SendHorizontal className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* STEP 2: Review & Authorization */}
      {step === 2 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <span className="text-[11px] font-bold text-[#14B8A6] uppercase tracking-wider">{t('send.step2Indicator')}</span>
            <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] font-display mt-0.5">
              {t('send.step2Title')}
            </h1>
          </div>

          {/* Big Amount Recap */}
          <div className="p-6 rounded-2xl bg-[#0F172A] text-white text-center">
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">
              {t('send.totalAmountToDebit')}
            </div>
            <div className="text-3xl sm:text-4xl font-black font-display tabular-nums">
              {formatCurrency(totalDebit, selectedWallet.currency)}
            </div>
            <div className="text-xs text-teal-400 mt-1 font-medium">
              Dont {formatCurrency(networkFee, selectedWallet.currency)} de frais réseau
            </div>
          </div>

          {/* Details Table */}
          <div className="divide-y divide-slate-100 text-xs sm:text-sm">
            <div className="py-3 flex justify-between">
              <span className="text-slate-500">{t('send.recipient')} :</span>
              <span className="font-bold text-[#0F172A] text-right">
                {recipientName} ({recipientIdentifier})
              </span>
            </div>

            <div className="py-3 flex justify-between">
              <span className="text-slate-500">{t('send.debitedWallet')} :</span>
              <span className="font-bold text-[#0F172A] text-right">
                {selectedWallet.currency} ({selectedWallet.account_number})
              </span>
            </div>

            <div className="py-3 flex justify-between">
              <span className="text-slate-500">{t('send.appliedRate')} :</span>
              <span className="font-bold text-[#0F172A]">{t('send.noConversion')}</span>
            </div>

            <div className="py-3 flex justify-between">
              <span className="text-slate-500">{t('send.estimatedDelay')} :</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 inline" />
                <span>{t('send.instantDelay')}</span>
              </span>
            </div>

            {reason && (
              <div className="py-3 flex justify-between">
                <span className="text-slate-500">{t('send.transferReason')} :</span>
                <span className="font-medium text-slate-800">{reason}</span>
              </div>
            )}
          </div>

          {/* Anti-Fraud Notice */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs text-amber-800">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold mb-0.5">{t('send.antiFraudProtection')}</div>
              <p className="text-[11px] leading-relaxed text-amber-700">{t('send.antiFraudDesc')}</p>
            </div>
          </div>

          {/* Biometric consent */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <input
              id="biometric"
              type="checkbox"
              checked={biometricAuthConsent}
              onChange={(e) => setBiometricAuthConsent(e.target.checked)}
              className="w-4 h-4 text-[#14B8A6] rounded border-slate-300 focus:ring-[#14B8A6]"
            />
            <label htmlFor="biometric" className="text-xs text-slate-700 cursor-pointer flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-[#14B8A6]" />
              <span>{t('send.authConsent')}</span>
            </label>
          </div>

          {/* Confirm Button */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleConfirmAndSend}
              disabled={isLoading}
              className="w-full bg-[#14B8A6] hover:bg-[#0D9488] text-white py-3.5 px-4 rounded-2xl text-sm font-bold shadow-md shadow-teal-500/20 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 disabled:opacity-50"
            >
              <Fingerprint className="w-4 h-4" />
              <span>{isLoading ? t('common.loading') : t('send.confirmAndSend')}</span>
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              {t('send.modifyDetails')}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Transfer Result & Official Receipt */}
      {step === 3 && completedTransaction && (
        <div className="space-y-6">
          {/* Header celebration */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 text-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h1 className="text-2xl font-black text-[#0F172A] font-display mb-1">
              {t('send.successTitle')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-6">
              {t('send.successSubtitle')}
            </p>

            {/* Certified Receipt Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-left space-y-3 text-xs sm:text-sm relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <ShieldCheck className="w-4 h-4 text-[#14B8A6]" />
                  <span>{t('send.officialSlip')}</span>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  {t('send.certified')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block">{t('send.transactionId')} :</span>
                  <span className="font-mono font-bold text-slate-800">{completedTransaction.reference}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">{t('send.operatorId')} :</span>
                  <span className="font-mono font-bold text-slate-800">{completedTransaction.operator_ref || 'N/A'}</span>
                </div>
              </div>

              <div className="py-2 border-y border-slate-200 flex justify-between items-center">
                <span className="text-slate-500">{t('common.amount')} :</span>
                <span className="font-extrabold text-base text-[#0F172A] font-display tabular-nums">
                  {formatCurrency(completedTransaction.amount, completedTransaction.currency)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">{t('send.beneficiaryLabel')} :</span>
                <strong className="text-slate-800">{completedTransaction.recipient_name}</strong>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">{t('send.newBalanceLabel')} :</span>
                <strong className="text-slate-800 tabular-nums">{formatCurrency(newWalletBalance, completedTransaction.currency)}</strong>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
              <button
                type="button"
                onClick={handleDownloadReceipt}
                className="bg-[#14B8A6] hover:bg-[#0D9488] text-white py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <FileDown className="w-4 h-4" />
                <span>{t('send.downloadReceipt')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`Preuve de virement NovaPay: ${completedTransaction.reference}`);
                  alert('Lien de partage copié dans le presse-papiers !');
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 py-3 px-4 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                <span>{t('send.shareProof')}</span>
              </button>
            </div>

            <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-slate-100 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setAmount(50000);
                }}
                className="text-[#14B8A6] hover:underline flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('send.newTransfer')}</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
              >
                <Home className="w-3.5 h-3.5" />
                <span>{t('send.returnHome')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
