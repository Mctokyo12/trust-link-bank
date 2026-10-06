import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import confetti from 'canvas-confetti';
import {
  PlusCircle,
  ArrowLeft,
  Building2,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  Coins,
  ArrowRight,
} from 'lucide-react';
import { useAppStore } from '../../app/store';
import { formatCurrency } from '../../utils/formatters';
import { getCurrencyMeta } from '../../utils/currencies';
import { getDatabase, saveDatabase } from '../../services/api/mockData';
import { Transaction, TransactionEntry } from '../../types';

export const AddMoneyPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, wallets, refreshWallets, refreshNotifications } = useAppStore();

  const [selectedWalletId, setSelectedWalletId] = useState(wallets[0]?.id || '');
  const [amount, setAmount] = useState<number>(100);
  const [method, setMethod] = useState<'card' | 'bank' | 'instant'>('instant');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const selectedWallet = wallets.find((w) => w.id === selectedWalletId) || wallets[0];
  const meta = getCurrencyMeta(selectedWallet?.currency || 'USD');
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin';

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto space-y-6 pt-4 animate-in fade-in duration-200">
        <div className="bg-white dark:bg-[#0F172A] border border-amber-200 dark:border-amber-900/50 rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-lg shadow-amber-500/5">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-950/80 px-3 py-1 rounded-full border border-amber-300 dark:border-amber-800">
              {t('transfers.receiveOnlyBadge', 'Client Profile • Receive Only')}
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white mt-3 font-display">
              {t('addMoney.adminOnlyDepositTitle', 'Account Crediting Managed by Administrator')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
              {t('addMoney.adminOnlyDepositDesc', 'Your client account is configured to receive money only. Only the administrator can credit your account and send funds.')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={() => navigate('/receive')}
              className="bg-[#2563EB] hover:bg-[#1E3A8A] text-white px-5 py-3 rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{t('transfers.accessReceiveDetailsBtn', 'View my Receive details')}</span>
              <ArrowRight className="w-4 h-4" />
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

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWallet || amount <= 0) return;

    setIsLoading(true);

    try {
      const db = getDatabase();
      const txId = `tx_${Date.now()}`;
      const txRef = `TLB-DEP-${Date.now().toString().slice(-6)}`;

      const tx: Transaction = {
        id: txId,
        reference: txRef,
        type: 'deposit',
        status: 'completed',
        amount,
        currency: selectedWallet.currency,
        fee: 0,
        description: `${t('addMoney.depositTitle', 'Account Deposit')} (${
          method === 'card'
            ? t('addMoney.debitCard', 'Debit Card')
            : method === 'bank'
            ? t('addMoney.bankWire', 'Bank Wire')
            : t('addMoney.instantFunding', 'Instant Transfer')
        })`,
        receiver_id: currentUser?.id,
        recipient_name: currentUser?.name,
        created_at: new Date().toISOString(),
      };

      const creditEntry: TransactionEntry = {
        id: `en_${Date.now()}_cr`,
        transaction_id: txId,
        wallet_id: selectedWallet.id,
        direction: 'credit',
        amount,
        created_at: new Date().toISOString(),
      };

      db.transactions.unshift(tx);
      db.transaction_entries.push(creditEntry);

      db.notifications.unshift({
        id: `notif_${Date.now()}`,
        user_id: currentUser?.id || 'usr_client',
        type: 'transaction',
        title: t('addMoney.depositSuccessTitle', 'Account Credited Successfully!'),
        body: `${formatCurrency(amount, selectedWallet.currency)} ${t('addMoney.depositSuccessDesc', 'have been added to your available balance.')}`,
        read_at: null,
        created_at: new Date().toISOString(),
      });

      saveDatabase(db);
      await refreshWallets();
      await refreshNotifications();

      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#2563EB', '#16A34A', '#1E3A8A'],
        });
      } catch {}

      setIsSuccess(true);
    } catch {
      // Error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-1.5 text-xs font-semibold text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t('addMoney.backToDashboard') || 'Back to Dashboard'}</span>
      </button>

      {isSuccess ? (
        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-sm transition-colors">
          <div className="w-16 h-16 rounded-full bg-green-50 dark:bg-green-950/50 text-[#16A34A] dark:text-green-400 flex items-center justify-center mx-auto ring-8 ring-green-50 dark:ring-green-950/30">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-2xl font-black text-[#0F172A] dark:text-white font-display">
              {t('addMoney.depositSuccessTitle') || 'Account Credited Successfully!'}
            </h1>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">
              {formatCurrency(amount, selectedWallet?.currency || 'USD')} {t('addMoney.depositSuccessDesc') || 'have been added to your available balance.'}
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                setIsSuccess(false);
                setAmount(100);
              }}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-[#0F172A] dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {t('addMoney.addMoreFunds') || 'Add More Funds'}
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-[#2563EB] hover:bg-[#1E3A8A] text-white py-3 px-4 rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              {t('nav.home') || 'Dashboard'}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleDeposit} className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 transition-colors">
          <div>
            <span className="text-[11px] font-bold text-[#2563EB] dark:text-blue-400 uppercase tracking-wider">
              {t('nav.addMoney') || 'Deposit'}
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white font-display mt-0.5">
              {t('addMoney.depositTitle') || 'Add Funds to Your Account'}
            </h1>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">
              {t('addMoney.depositSubtitle') || 'Deposit into your account to send money and make payments.'}
            </p>
          </div>

          {/* Select Target Wallet */}
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] dark:text-white mb-1.5">
              {t('addMoney.accountToCredit') || 'Account to Credit'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {wallets.map((w) => {
                const wMeta = getCurrencyMeta(w.currency);
                return (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setSelectedWalletId(w.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedWalletId === w.id
                        ? 'border-[#2563EB] bg-[#EFF6FF] dark:bg-blue-950/50 ring-2 ring-[#2563EB]/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-[#0F172A] dark:text-white">
                      <span>{wMeta.flag} {w.currency}</span>
                      <span className="text-[10px] text-[#64748B] dark:text-slate-400 font-mono">
                        {w.account_number.slice(0, 10)}...
                      </span>
                    </div>
                    <div className="text-sm font-extrabold text-[#0F172A] dark:text-white mt-1 tabular-nums">
                      {t('common.balance') || 'Balance'} : {formatCurrency(w.balance, w.currency)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Method Selection */}
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] dark:text-white mb-1.5">
              {t('addMoney.depositMethod') || 'Deposit Method'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMethod('instant')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  method === 'instant'
                    ? 'border-[#2563EB] bg-[#EFF6FF] dark:bg-blue-950/50 text-[#1E3A8A] dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-800 text-[#64748B] dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 bg-white dark:bg-slate-900'
                }`}
              >
                <PlusCircle className="w-4 h-4 text-[#2563EB] dark:text-blue-400" />
                <span>{t('addMoney.instantFunding') || 'Instant'}</span>
                <span className="text-[10px] text-[#16A34A] dark:text-green-400 font-semibold">{t('common.free') || 'Free'}</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('card')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  method === 'card'
                    ? 'border-[#2563EB] bg-[#EFF6FF] dark:bg-blue-950/50 text-[#1E3A8A] dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-800 text-[#64748B] dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 bg-white dark:bg-slate-900'
                }`}
              >
                <CreditCard className="w-4 h-4 text-[#2563EB] dark:text-blue-400" />
                <span>{t('addMoney.debitCard') || 'Debit Card'}</span>
                <span className="text-[10px] text-[#64748B] dark:text-slate-400">Visa / Mastercard</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('bank')}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  method === 'bank'
                    ? 'border-[#2563EB] bg-[#EFF6FF] dark:bg-blue-950/50 text-[#1E3A8A] dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-800 text-[#64748B] dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 bg-white dark:bg-slate-900'
                }`}
              >
                <Building2 className="w-4 h-4 text-[#2563EB] dark:text-blue-400" />
                <span>{t('addMoney.bankWire') || 'Bank Wire'}</span>
                <span className="text-[10px] text-[#64748B] dark:text-slate-400">ACH / Fedwire</span>
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] dark:text-white mb-1.5">
              {t('addMoney.amountToAdd') || 'Amount to Add'}
            </label>
            <div className="relative rounded-2xl border border-slate-300 dark:border-slate-700 focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-900 overflow-hidden bg-white dark:bg-slate-900">
              <input
                type="number"
                step="any"
                min="1"
                value={amount || ''}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                placeholder="100.00"
                required
                className="w-full py-3.5 pl-4 pr-24 text-2xl font-black font-display text-[#0F172A] dark:text-white focus:outline-none tabular-nums bg-transparent"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-extrabold text-[#1E3A8A] dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 px-2.5 py-1 rounded-lg">
                {selectedWallet?.currency}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {[50, 100, 250, 500, 1000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                >
                  +{val} {selectedWallet?.currency}
                </button>
              ))}
            </div>
          </div>

          {/* Guarantee notice */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-[#64748B] dark:text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#16A34A] dark:text-green-400 shrink-0" />
            <span>{t('addMoney.fundingNotice') || 'Immediate settlement via central banking rails. 0% deposit fee.'}</span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || amount <= 0}
            className="w-full bg-[#2563EB] hover:bg-[#1E3A8A] text-white py-3.5 px-4 rounded-2xl text-sm font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <span>{isLoading ? (t('common.loading') || 'Loading...') : (t('addMoney.confirmDeposit') || 'Add Funds Now')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
};

export default AddMoneyPage;
