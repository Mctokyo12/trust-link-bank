import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Wallet as WalletIcon,
  Copy,
  Check,
  ArrowUpRight,
  PlusCircle,
  TrendingUp,
  ShieldCheck,
  SendHorizontal,
  ArrowDownLeft,
  ArrowLeftRight,
  ExternalLink,
} from 'lucide-react';
import { useAppStore } from '../../app/store';
import { formatCurrency } from '../../utils/formatters';

export const WalletsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { wallets, hideBalances, setSelectedWalletId } = useAppStore();

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const totalNetXAF = wallets.reduce((acc, w) => {
    if (w.currency === 'XAF') return acc + w.balance;
    if (w.currency === 'USD') return acc + w.balance * 604.0;
    if (w.currency === 'EUR') return acc + w.balance * 655.957;
    return acc;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight font-display">
            {t('wallets.title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {t('wallets.subtitle')}
          </p>
        </div>

        <button
          onClick={() => alert("La création de portefeuilles GBP, CAD et NGN sera activée dans la prochaine phase réglementaire.")}
          className="bg-[#14B8A6] hover:bg-[#0D9488] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t('wallets.newSubAccountFull')}</span>
        </button>
      </div>

      {/* Global Net Balance Card */}
      <div className="bg-[#0F172A] text-white rounded-3xl p-6 sm:p-7 shadow-xl shadow-slate-900/10 border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            {t('wallets.totalAllocated')}
          </span>
          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{t('wallets.thisMonth')}</span>
          </span>
        </div>

        <div className="text-3xl sm:text-4xl font-extrabold font-display tabular-nums tracking-tight mb-4">
          {hideBalances ? '•••••••• FCFA' : formatCurrency(totalNetXAF, 'XAF')}
        </div>

        <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#14B8A6]" />
            <span>{t('wallets.activeCurrencies')}</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>{t('wallets.depositProtection')} CEMAC / COBAC</span>
          </div>
        </div>
      </div>

      {/* 3 Detailed Wallets List */}
      <div className="space-y-4">
        {wallets.map((wallet) => {
          const isXAF = wallet.currency === 'XAF';
          const isUSD = wallet.currency === 'USD';
          const isEUR = wallet.currency === 'EUR';

          const equivInXaf = isUSD ? wallet.balance * 604.0 : isEUR ? wallet.balance * 655.957 : null;

          return (
            <div
              key={wallet.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm hover:border-[#14B8A6] transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl shadow-sm">
                    {isXAF && '🇨🇲'}
                    {isUSD && '🇺🇸'}
                    {isEUR && '🇪🇺'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base sm:text-lg text-[#0F172A] font-display">
                        {isXAF && t('wallets.xafName')}
                        {isUSD && t('wallets.usdName')}
                        {isEUR && t('wallets.eurName')}
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {wallet.currency}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      {isXAF && t('wallets.xafSub')}
                      {isUSD && t('wallets.usdSub')}
                      {isEUR && t('wallets.eurSub')}
                    </div>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-2xl sm:text-3xl font-black text-[#0F172A] font-display tabular-nums">
                    {hideBalances ? '••••••' : formatCurrency(wallet.balance, wallet.currency)}
                  </div>
                  {equivInXaf !== null && (
                    <div className="text-xs text-slate-500 font-medium mt-0.5">
                      ≈ {formatCurrency(equivInXaf, 'XAF')}
                    </div>
                  )}
                </div>
              </div>

              {/* Account identifiers & details */}
              <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="text-slate-400 font-medium mb-1">
                    {isXAF && t('wallets.virtualAccount')}
                    {isUSD && t('wallets.usRouting')}
                    {isEUR && t('wallets.virtualIban')}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-800 text-xs sm:text-sm bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                      {wallet.account_number}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(wallet.account_number, wallet.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Copier"
                    >
                      {copiedId === wallet.id ? <Check className="w-4 h-4 text-[#14B8A6]" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Sub balances */}
                <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                  <div>
                    <span>{t('wallets.availableBalance')} : </span>
                    <strong className="text-slate-800 tabular-nums">
                      {hideBalances ? '••••' : formatCurrency(wallet.available_balance, wallet.currency)}
                    </strong>
                  </div>
                  {isUSD && (
                    <div>
                      <span>{t('wallets.pendingHold')} : </span>
                      <strong className="text-amber-600 tabular-nums">$ 30.00</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => {
                    setSelectedWalletId(wallet.id);
                    navigate(`/wallets/${wallet.id}`);
                  }}
                  className="text-xs font-bold text-[#14B8A6] hover:underline flex items-center gap-1"
                >
                  <span>{t('common.details')}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate('/receive')}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5 text-[#22C55E]" />
                    <span>{isXAF ? t('wallets.rechargeMomo') : isUSD ? t('wallets.wireSwift') : t('wallets.sepaInstant')}</span>
                  </button>

                  <button
                    onClick={() => navigate('/send')}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <SendHorizontal className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>{t('dashboard.send')}</span>
                  </button>

                  <button
                    onClick={() => navigate('/exchange')}
                    className="bg-teal-50 hover:bg-teal-100 text-[#0D9488] px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5 text-[#14B8A6]" />
                    <span>{t('dashboard.exchange')}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upcoming Currencies Card */}
      <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center">
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2 text-slate-400">
          <PlusCircle className="w-5 h-5" />
        </div>
        <div className="font-bold text-sm text-slate-800 mb-1">{t('wallets.createFutureWallet')}</div>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          {t('wallets.futureCurrencies')} — {t('wallets.comingSoon')}.
        </p>
      </div>

      {/* Regulatory Guarantee Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-start gap-3.5 text-xs text-slate-600">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-slate-800 text-sm mb-0.5">{t('wallets.cobacNotice')}</h4>
          <p className="leading-relaxed text-slate-500">{t('wallets.cobacDesc')}</p>
        </div>
      </div>
    </div>
  );
};
