import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Wallet as WalletIcon,
  Copy,
  Check,
  PlusCircle,
  TrendingUp,
  ShieldCheck,
  SendHorizontal,
  ArrowDownLeft,
  ArrowLeftRight,
  ExternalLink,
  Coins,
  X,
  CreditCard,
} from 'lucide-react';
import { useAppStore } from '../../app/store';
import { formatCurrency } from '../../utils/formatters';
import { getCurrencyMeta, SUPPORTED_CURRENCIES } from '../../utils/currencies';
import { CurrencyCode, Wallet } from '../../types';
import { getDatabase, saveDatabase } from '../../services/api/mockData';

export const WalletsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, wallets, hideBalances, refreshWallets } = useAppStore();

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [selectedNewCurrency, setSelectedNewCurrency] = useState<CurrencyCode>('CAD');
  const [createLoading, setCreateLoading] = useState(false);
  const [infoBanner, setInfoBanner] = useState('');

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const userCurrency = currentUser?.preferred_currency || wallets[0]?.currency || 'USD';
  const userCurrencyMeta = getCurrencyMeta(userCurrency);

  // Total balance: sum of all wallets in user's preferred currency
  const totalBalance = wallets.reduce((acc, w) => {
    // If same currency, add directly
    if (w.currency === userCurrency) return acc + w.balance;
    // For MVP display, sum primary balance
    return acc;
  }, 0);

  const existingCurrencies = new Set(wallets.map((w) => w.currency));
  const availableCurrenciesToAdd = SUPPORTED_CURRENCIES.filter(
    (c) => !existingCurrencies.has(c.code)
  );

  const handleCreateSubAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setCreateLoading(true);

    try {
      const db = getDatabase();
      const newWallet: Wallet = {
        id: `w_${currentUser.id}_${selectedNewCurrency.toLowerCase()}_${Date.now()}`,
        user_id: currentUser.id,
        currency: selectedNewCurrency,
        account_number: `TLB-${selectedNewCurrency}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
        balance: 0,
        available_balance: 0,
        status: 'active',
        created_at: new Date().toISOString(),
      };

      db.wallets.push(newWallet);
      saveDatabase(db);
      await refreshWallets();

      setInfoBanner(
        t('wallets.newAccountSuccess', {
          currency: selectedNewCurrency,
          defaultValue: `New ${selectedNewCurrency} account opened successfully (Starting balance: 0.00).`,
        })
      );
      setIsAddAccountOpen(false);
      setTimeout(() => setInfoBanner(''), 4000);
    } catch {
      setInfoBanner(t('common.error', 'An error occurred'));
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] dark:text-white tracking-tight font-display">
            {t('wallets.title') || 'Accounts & Wallets'}
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 mt-0.5">
            {t('wallets.subtitle') || 'Manage your multi-currency accounts and account details'}
          </p>
        </div>

        <button
          onClick={() => setIsAddAccountOpen(true)}
          className="bg-[#2563EB] hover:bg-[#1E3A8A] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t('wallets.openCurrencyAccount') || 'Open Currency Account'}</span>
        </button>
      </div>

      {infoBanner && (
        <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-[#16A34A] dark:text-green-400 text-xs font-semibold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>{infoBanner}</span>
        </div>
      )}

      {/* Global Net Balance Card */}
      <div className="bg-[#0F172A] dark:bg-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl shadow-slate-900/10 border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            {t('wallets.totalAllocatedBalance') || 'Total Allocated Balance'} ({userCurrencyMeta.code})
          </span>
          <span className="text-xs text-[#16A34A] dark:text-green-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{t('wallets.guaranteed100') || '100% Guaranteed'}</span>
          </span>
        </div>

        <div className="text-3xl sm:text-4xl font-extrabold font-display tabular-nums tracking-tight mb-4">
          {hideBalances ? '••••••••' : formatCurrency(totalBalance, userCurrency)}
        </div>

        <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
            <span>{wallets.length} {t('wallets.activeAccountsCount') || 'active account(s)'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#16A34A] dark:text-green-400">
            <ShieldCheck className="w-4 h-4" />
            <span>{t('wallets.depositProtection') || 'Regulated bank deposit protection'}</span>
          </div>
        </div>
      </div>

      {/* Detailed Wallets List */}
      <div className="space-y-4">
        {wallets.map((wallet) => {
          const meta = getCurrencyMeta(wallet.currency);
          return (
            <div
              key={wallet.id}
              className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm hover:border-[#2563EB] dark:hover:border-blue-500 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-2xl shadow-xs">
                    {meta.flag}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base sm:text-lg text-[#0F172A] dark:text-white font-display">
                        {t('wallets.accountWord') || 'Account'} {meta.name}
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-[#2563EB] dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                        {wallet.currency}
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
                      {t('wallets.region') || 'Region'} : {meta.region} • {t('wallets.symbol') || 'Symbol'} : {meta.symbol}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/wallets/${wallet.id}`)}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-[#0F172A] dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{t('wallets.detailsAndStatement') || 'Details & Statement'}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#64748B] dark:text-slate-400" />
                  </button>
                  {(currentUser?.role === 'admin' || currentUser?.role === 'super_admin') ? (
                    <button
                      onClick={() => navigate(`/send?walletId=${wallet.id}`)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#2563EB] hover:bg-[#1E3A8A] text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <SendHorizontal className="w-3.5 h-3.5" />
                      <span>{t('send.title') || 'Send'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate('/receive')}
                      className="px-3.5 py-1.5 rounded-xl bg-[#16A34A] hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <ArrowDownLeft className="w-3.5 h-3.5" />
                      <span>{t('dashboard.receive') || 'Recevoir'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Balance & Account Number Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                <div>
                  <div className="text-[11px] text-[#64748B] dark:text-slate-400 font-medium">{t('wallets.bookBalance') || 'Ledger Balance'}</div>
                  <div className="text-2xl font-black text-[#0F172A] dark:text-white font-display tabular-nums mt-0.5">
                    {hideBalances ? '••••••••' : formatCurrency(wallet.balance, wallet.currency)}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-[#64748B] dark:text-slate-400 font-medium">{t('wallets.availableBalance') || 'Available Balance'}</div>
                  <div className="text-2xl font-black text-[#16A34A] dark:text-green-400 font-display tabular-nums mt-0.5">
                    {hideBalances ? '••••••••' : formatCurrency(wallet.available_balance, wallet.currency)}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-[#64748B] dark:text-slate-400 font-medium">{t('wallets.accountNumber') || 'Account Number'}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-xs text-[#0F172A] dark:text-white font-semibold bg-slate-50 dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 truncate">
                      {wallet.account_number}
                    </span>
                    <button
                      onClick={() => handleCopy(wallet.account_number, wallet.id)}
                      className="p-1.5 text-slate-400 hover:text-[#2563EB] dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title={t('common.copy') || 'Copy'}
                    >
                      {copiedId === wallet.id ? <Check className="w-4 h-4 text-[#16A34A] dark:text-green-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: ADD SUB-ACCOUNT IN ANOTHER CURRENCY */}
      {isAddAccountOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-black text-[#0F172A] dark:text-white font-display">
                  {t('wallets.openModalTitle') || 'Open a New Currency Account'}
                </h3>
                <p className="text-xs text-[#64748B] dark:text-slate-400">
                  {t('wallets.openModalDesc') || "Instantly create a dedicated ledger account in any Americas or Global currency. Starts at 0.00."}
                </p>
              </div>
              <button
                onClick={() => setIsAddAccountOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubAccount} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] dark:text-white mb-1.5">
                  {t('wallets.selectCurrencyLabel') || 'Select Currency'}
                </label>
                <select
                  value={selectedNewCurrency}
                  onChange={(e) => setSelectedNewCurrency(e.target.value as CurrencyCode)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold text-[#0F172A] dark:text-white focus:outline-none focus:border-[#2563EB] cursor-pointer"
                >
                  {availableCurrenciesToAdd.map((curr) => (
                    <option key={curr.code} value={curr.code}>
                      {curr.flag} {curr.label} ({curr.symbol})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-xl bg-[#EFF6FF] dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-[11px] text-[#1E3A8A] dark:text-blue-300">
                {t('wallets.openModalDesc', 'The new account will be immediately operational with a starting balance of 0.00 and its own unique account number.')}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddAccountOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-[#0F172A] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  {t('common.cancel') || 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="flex-1 bg-[#2563EB] hover:bg-[#1E3A8A] text-white py-2.5 rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {createLoading ? (t('common.loading') || 'Loading...') : (t('wallets.confirmOpenBtn') || 'Create Account')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export const AccountsPage = WalletsPage;
export default WalletsPage;
