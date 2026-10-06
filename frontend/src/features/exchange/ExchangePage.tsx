import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeftRight,
  TrendingUp,
  Clock,
  ShieldCheck,
  Coins,
  Bell,
  Check,
  Lock,
} from 'lucide-react';
import { useAppStore } from '../../app/store';
import { SUPPORTED_CURRENCIES, getCurrencyMeta } from '../../utils/currencies';
import { CurrencyCode } from '../../types';

export const ExchangePage: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser, wallets } = useAppStore();
  const [isNotified, setIsNotified] = useState(false);

  const [fromCurrency, setFromCurrency] = useState<CurrencyCode>('USD');
  const [toCurrency, setToCurrency] = useState<CurrencyCode>('BRL');
  const [testAmount, setTestAmount] = useState<number>(100);

  const fromMeta = getCurrencyMeta(fromCurrency);
  const toMeta = getCurrencyMeta(toCurrency);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header with MVP Section 16 Badge */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 uppercase tracking-wider">
            {t('exchange.badge') || 'Version 2 • Future Scope'}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] dark:text-white tracking-tight font-display">
          {t('exchange.title') || 'Currency Exchange'}
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400">
          {t('exchange.subtitle') || 'Instant interbank currency exchange across 14 currencies of the Americas'}
        </p>
      </div>

      {/* Prominent Coming Soon State Card */}
      <div className="bg-[#EFF6FF] dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 rounded-3xl p-6 sm:p-8 space-y-4 transition-colors">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
            <ArrowLeftRight className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-black text-[#1E3A8A] dark:text-blue-200 font-display">
              {t('exchange.comingSoonTitle') || 'Exchange engine preparing for Version 2'}
            </h2>
            <p className="text-xs text-[#1E3A8A]/80 dark:text-blue-300/80 leading-relaxed">
              {t('exchange.comingSoonDesc') || 'Automated multi-currency conversions and live interbank quotes are part of Version 2.'}
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          {isNotified ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 dark:bg-green-950/40 text-[#16A34A] dark:text-green-400 text-xs font-bold border border-green-200 dark:border-green-800">
              <Check className="w-4 h-4" />
              <span>{t('exchange.notifySuccess') || 'You will receive a priority notification when corridors open.'}</span>
            </div>
          ) : (
            <button
              onClick={() => setIsNotified(true)}
              className="bg-[#2563EB] hover:bg-[#1E3A8A] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 inline-flex items-center gap-2 cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span>{t('exchange.notifyBtn') || 'Notify me of exchange launch'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Interactive Preview / Simulator of V2 Corridors */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5 transition-colors">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#0F172A] dark:text-white font-display">
            {t('exchange.simulatorTitle') || 'Exchange Corridors Preview (V2 Simulation)'}
          </h3>
          <span className="text-xs font-mono font-semibold text-[#64748B] dark:text-slate-400">
            {t('exchange.marketAmericas') || 'Americas Market'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Sell Box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="text-[11px] font-semibold text-[#64748B] dark:text-slate-400">
              {t('exchange.soldCurrency') || 'Currency to Sell'}
            </div>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value as CurrencyCode)}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-[#0F172A] dark:text-white cursor-pointer"
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.label}
                </option>
              ))}
            </select>
            <div className="text-xl font-black text-[#0F172A] dark:text-white font-display pt-1">
              {fromMeta.symbol} {testAmount}
            </div>
          </div>

          {/* Buy Box */}
          <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 space-y-2">
            <div className="text-[11px] font-semibold text-[#2563EB] dark:text-blue-400">
              {t('exchange.boughtCurrency') || 'Currency to Receive'}
            </div>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value as CurrencyCode)}
              className="w-full p-2.5 rounded-xl border border-blue-300 dark:border-blue-800 bg-white dark:bg-slate-800 text-xs font-bold text-[#0F172A] dark:text-white cursor-pointer"
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.label}
                </option>
              ))}
            </select>
            <div className="text-xl font-black text-[#2563EB] dark:text-blue-400 font-display pt-1">
              {toMeta.symbol} ~ {t('exchange.indicativeRate') || 'Indicative Rate'}
            </div>
          </div>
        </div>

        {/* Feature Lock Notice */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-[#64748B] dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#2563EB] dark:text-blue-400" />
            <span>{t('exchange.zeroHiddenFees') || 'Guaranteed 0% hidden margins in V2'}</span>
          </div>
          <span className="font-mono text-[10px] bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-md text-slate-700 dark:text-slate-300">
            V2-STAGING
          </span>
        </div>
      </div>
    </div>
  );
};

export default ExchangePage;
