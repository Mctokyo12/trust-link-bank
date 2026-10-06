import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Copy,
  Check,
  SendHorizontal,
  ArrowDownLeft,
  ArrowLeftRight,
  ShieldCheck,
  FileDown,
  TrendingUp,
  CheckCircle2,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { useAppStore } from '../../app/store';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useQuery } from '@tanstack/react-query';
import { transactionsApi } from '../../services/api/client';

export const WalletDetailPage: React.FC = () => {
  const { walletId } = useParams<{ walletId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { wallets, hideBalances, currentUser } = useAppStore();

  const [activeFilter, setActiveFilter] = useState<'all' | 'credits' | 'debits' | 'exchange'>('all');
  const [copied, setCopied] = useState(false);

  // Find target wallet or default to XAF
  const wallet = wallets.find((w) => w.id === walletId) || wallets[0];

  const { data: allTransactions = [] } = useQuery({
    queryKey: ['transactions', 'wallet', wallet?.currency],
    queryFn: () => transactionsApi.getTransactions({ currency: wallet?.currency }),
    enabled: !!wallet,
  });

  if (!wallet) {
    return (
      <div className="p-8 text-center text-slate-500">
        {t('common.noData', 'No data available')}
        <button onClick={() => navigate('/accounts')} className="block mx-auto mt-2 text-[#2563EB] font-bold">
          {t('common.back', 'Back')}
        </button>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(wallet.account_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isXAF = wallet.currency === 'XAF';
  const isUSD = wallet.currency === 'USD';
  const isEUR = wallet.currency === 'EUR';

  // Filter transactions
  const filteredTransactions = allTransactions.filter((tx) => {
    const isCredit = tx.type === 'deposit' || tx.receiver_id === currentUser?.id;
    if (activeFilter === 'credits') return isCredit;
    if (activeFilter === 'debits') return !isCredit;
    if (activeFilter === 'exchange') return tx.type === 'exchange';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/wallets')}
          className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('wallets.title')}</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{t('wallets.beacConnected')}</span>
        </div>
      </div>

      {/* Main Header Balance Card */}
      <div className="bg-[#0F172A] text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-900/10 border border-slate-800">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">
            {isXAF && '🇨🇲'}
            {isUSD && '🇺🇸'}
            {isEUR && '🇪🇺'}
          </span>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-display">
              {t('wallets.accountWord', 'Account')} {wallet.currency}
            </h1>
            <div className="text-xs text-slate-400">
              {t('wallets.fixedParity')}
            </div>
          </div>
        </div>

        <div className="my-5">
          <div className="text-3xl sm:text-5xl font-black font-display tabular-nums tracking-tight">
            {hideBalances ? '••••••••' : formatCurrency(wallet.balance, wallet.currency)}
          </div>
          <div className="text-xs text-slate-400 font-medium mt-1">
            {t('wallets.availableBalance')} :{' '}
            <strong className="text-white tabular-nums">
              {hideBalances ? '••••' : formatCurrency(wallet.available_balance, wallet.currency)}
            </strong>
          </div>
        </div>

        {/* Coordonnées bancaires */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <div className="text-slate-400 text-[10px] font-semibold tracking-wider uppercase mb-1">
              {t('wallets.ribLabel')}
            </div>
            <div className="font-mono text-white text-sm font-bold flex items-center gap-2">
              <span>{wallet.account_number}</span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-slate-400 hover:text-white transition-colors"
                title={t('common.copy', 'Copy')}
              >
                {copied ? <Check className="w-4 h-4 text-[#16A34A]" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="text-left sm:text-right text-slate-400">
            <div>{t('receive.accountHolder', 'Account Holder')} : <strong className="text-slate-200">{currentUser?.name}</strong></div>
            <div>{t('receive.institution', 'Institution')} : <strong className="text-slate-200">Trust Link Bank Group</strong></div>
          </div>
        </div>

        {/* Quick actions inside card */}
        <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-slate-800">
          <button
            onClick={() => navigate('/receive')}
            className="bg-[#2563EB] hover:bg-[#1E3A8A] text-white py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>{t('dashboard.topUp')}</span>
          </button>

          <button
            onClick={() => navigate(`/send?walletId=${wallet.id}`, { state: { walletId: wallet.id } })}
            className="bg-slate-800 hover:bg-slate-700 text-white py-2.5 px-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            <SendHorizontal className="w-4 h-4 text-[#2563EB]" />
            <span>{t('dashboard.send')}</span>
          </button>

          <button
            onClick={() => navigate('/exchange')}
            className="bg-slate-800 hover:bg-slate-700 text-white py-2.5 px-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            <ArrowLeftRight className="w-4 h-4 text-[#22C55E]" />
            <span>{t('dashboard.exchange')}</span>
          </button>
        </div>
      </div>

      {/* Monthly Activity Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-colors">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">{t('wallets.totalReceived')} (30j)</div>
          <div className="text-2xl font-black text-[#22C55E] dark:text-emerald-400 font-display tabular-nums">
            + {formatCurrency(isXAF ? 3900000 : 1450, wallet.currency)}
          </div>
        </div>

        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-colors">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1">{t('wallets.totalSpent')} (30j)</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-display tabular-nums">
            - {formatCurrency(isXAF ? 700000 : 15.99, wallet.currency)}
          </div>
        </div>
      </div>

      {/* Transaction History Filter Tabs */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-bold text-[#0F172A] dark:text-white font-display">
            {t('wallets.historyTitle')} ({wallet.currency})
          </h2>

          <button
            onClick={() => {
              const dummyBlob = new Blob([`Trust Link Bank Statement - ${wallet.currency}\nAccount: ${wallet.account_number}\nBalance: ${wallet.available_balance}`], { type: 'text/plain' });
              const url = URL.createObjectURL(dummyBlob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `releve-tlb-${wallet.currency.toLowerCase()}.txt`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-[#0F172A] dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-xl transition-colors self-start sm:self-auto cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400" />
            <span>{t('wallets.downloadStatement')}</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl gap-1 mb-4 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeFilter === 'all' ? 'bg-white dark:bg-slate-900 text-[#2563EB] dark:text-blue-400 shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {t('wallets.filterAll')}
          </button>
          <button
            onClick={() => setActiveFilter('credits')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeFilter === 'credits' ? 'bg-white dark:bg-slate-900 text-[#16A34A] dark:text-green-400 shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {t('wallets.filterCredits')}
          </button>
          <button
            onClick={() => setActiveFilter('debits')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeFilter === 'debits' ? 'bg-white dark:bg-slate-900 text-[#DC2626] dark:text-rose-400 shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {t('wallets.filterDebits')}
          </button>
          <button
            onClick={() => setActiveFilter('exchange')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeFilter === 'exchange' ? 'bg-white dark:bg-slate-900 text-[#2563EB] dark:text-blue-400 shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {t('wallets.filterExchanges')}
          </button>
        </div>

        {/* Transactions list */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredTransactions.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
              {t('common.noData')}
            </div>
          ) : (
            filteredTransactions.map((tx) => {
              const isCredit = tx.type === 'deposit' || tx.recipient_name === 'Amina Diallo';
              return (
                <div
                  key={tx.id}
                  className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isCredit ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {isCredit ? <ArrowDownLeft className="w-4 h-4" /> : <SendHorizontal className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-[#0F172A] dark:text-white truncate max-w-xs sm:max-w-md">
                        {tx.description}
                      </div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-2">
                        <span>{formatDate(tx.created_at)}</span>
                        <span>•</span>
                        <span className="font-mono">{tx.reference}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div
                      className={`font-black text-sm sm:text-base font-display tabular-nums ${
                        isCredit ? 'text-[#22C55E] dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {isCredit ? '+' : '-'} {formatCurrency(tx.amount, tx.currency)}
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-end gap-1 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 inline" />
                      <span>{t('common.completed', 'Completed')}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Quick Send Action Section at bottom */}
      <div className="bg-gradient-to-br from-[#0F172A] via-slate-900 to-[#0F172A] text-white rounded-3xl p-6 sm:p-7 shadow-xl shadow-slate-900/10 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-4 text-center sm:text-left w-full sm:w-auto">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-[#2563EB] flex items-center justify-center shrink-0 border border-blue-500/30 shadow-inner">
            <Zap className="w-6 h-6 text-amber-300 fill-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h3 className="font-black text-base sm:text-lg font-display text-white">
                {t('wallets.quickSend')} • {wallet.currency}
              </h3>
              <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full">
                {t('common.instant', 'Instant')}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-md">
              {t('wallets.quickSendDesc')}{' '}
              <strong className="text-blue-300 tabular-nums">
                {hideBalances ? '••••••••' : formatCurrency(wallet.available_balance, wallet.currency)}
              </strong>.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate(`/send?walletId=${wallet.id}`, { state: { walletId: wallet.id } })}
          className="w-full sm:w-auto bg-[#2563EB] hover:bg-[#1E3A8A] active:scale-98 text-white px-6 py-3.5 rounded-2xl font-black text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2.5 shrink-0 group hover:-translate-y-0.5 cursor-pointer"
          data-testid="wallet-quick-send-btn"
        >
          <SendHorizontal className="w-4 h-4 text-white" />
          <span>{t('wallets.quickSendAction')} ({wallet.currency})</span>
          <ArrowRight className="w-4 h-4 text-blue-200 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* COBAC Guarantee */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-start gap-3.5 text-xs text-slate-600 dark:text-slate-300 transition-colors">
        <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-slate-800 dark:text-white text-sm mb-0.5">{t('wallets.cobacGuarantee')}</h4>
          <p className="leading-relaxed text-slate-500 dark:text-slate-400">{t('wallets.cobacGuaranteeDesc')}</p>
        </div>
      </div>
    </div>
  );
};
