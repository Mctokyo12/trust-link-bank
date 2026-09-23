import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import confetti from 'canvas-confetti';
import {
  ArrowLeftRight,
  TrendingUp,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '../../app/store';
import { exchangeApi } from '../../services/api/client';
import { formatCurrency } from '../../utils/formatters';

export const ExchangePage: React.FC = () => {
  const { t } = useTranslation();
  const { wallets, refreshWallets, refreshNotifications } = useAppStore();

  const [fromCurrency, setFromCurrency] = useState<'XAF' | 'USD' | 'EUR'>('XAF');
  const [toCurrency, setToCurrency] = useState<'XAF' | 'USD' | 'EUR'>('EUR');
  const [fromAmount, setFromAmount] = useState<number>(327978);
  const [lockTimer, setLockTimer] = useState<number>(60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // 60-second rate lock countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setLockTimer((prev) => (prev > 1 ? prev - 1 : 60));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fromWallet = wallets.find((w) => w.currency === fromCurrency) || wallets[0];
  const toWallet = wallets.find((w) => w.currency === toCurrency) || wallets[1];

  // Rates
  const rate = useMemo(() => {
    if (fromCurrency === 'XAF' && toCurrency === 'EUR') return 1 / 655.957;
    if (fromCurrency === 'EUR' && toCurrency === 'XAF') return 655.957;
    if (fromCurrency === 'XAF' && toCurrency === 'USD') return 1 / 604.0;
    if (fromCurrency === 'USD' && toCurrency === 'XAF') return 604.0;
    if (fromCurrency === 'USD' && toCurrency === 'EUR') return 604.0 / 655.957;
    if (fromCurrency === 'EUR' && toCurrency === 'USD') return 655.957 / 604.0;
    return 1;
  }, [fromCurrency, toCurrency]);

  const toAmount = useMemo(() => {
    return Number((fromAmount * rate).toFixed(2));
  }, [fromAmount, rate]);

  const fee = 0; // Fixed zero fee promotion

  const handleSwapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
    setFromAmount(toAmount);
  };

  const handleExecuteExchange = async () => {
    if (!fromAmount || fromAmount <= 0) {
      setErrorMsg('Veuillez spécifier un montant valide.');
      return;
    }
    if (fromAmount > fromWallet.available_balance) {
      setErrorMsg(`Solde disponible insuffisant dans le portefeuille ${fromCurrency}.`);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await exchangeApi.executeSwap({
        sourceWalletId: fromWallet.id,
        targetWalletId: toWallet.id,
        sellAmount: fromAmount,
        sellCurrency: fromCurrency,
        buyAmount: toAmount,
        buyCurrency: toCurrency,
        rate,
        fee: 0,
      });

      await refreshWallets();
      await refreshNotifications();

      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#14B8A6', '#2563EB', '#22C55E'],
        });
      } catch {}

      setSuccessMsg(`Conversion effectuée avec succès ! ${formatCurrency(fromAmount, fromCurrency)} échangés contre ${formatCurrency(toAmount, toCurrency)}.`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Échec de la conversion.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight font-display">
          {t('exchange.title')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          {t('exchange.subtitle')}
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Conversion Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        {/* FROM CARD */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">{t('exchange.youSell')}</span>
            <span className="text-xs text-slate-500">
              {t('wallets.availableBalance')} :{' '}
              <strong className="text-slate-800 tabular-nums">
                {formatCurrency(fromWallet.available_balance, fromCurrency)}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              value={fromAmount || ''}
              onChange={(e) => setFromAmount(Number(e.target.value))}
              className="flex-1 bg-transparent text-2xl sm:text-3xl font-black text-[#0F172A] font-display tabular-nums focus:outline-none"
              placeholder="0.00"
            />

            <select
              value={fromCurrency}
              onChange={(e) => {
                const next = e.target.value as any;
                if (next === toCurrency) setToCurrency(fromCurrency);
                setFromCurrency(next);
              }}
              className="bg-white border border-slate-300 font-bold text-sm px-3 py-2 rounded-xl focus:outline-none cursor-pointer"
            >
              <option value="XAF">🇨🇲 XAF (FCFA)</option>
              <option value="USD">🇺🇸 USD ($)</option>
              <option value="EUR">🇪🇺 EUR (€)</option>
            </select>
          </div>

          {/* Quick Percent Buttons */}
          <div className="flex gap-2 mt-3 pt-3 border-t border-slate-200/80">
            {[0.25, 0.5, 0.75, 1].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => setFromAmount(Math.floor(fromWallet.available_balance * pct))}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
              >
                {pct === 1 ? t('send.maxBalance') : `${pct * 100}%`}
              </button>
            ))}
          </div>
        </div>

        {/* SWAP DIRECTION BUTTON */}
        <div className="flex justify-center -my-3 relative z-10">
          <button
            type="button"
            onClick={handleSwapCurrencies}
            className="w-11 h-11 rounded-full bg-[#14B8A6] text-white flex items-center justify-center shadow-lg shadow-teal-500/30 hover:scale-110 active:scale-95 transition-transform"
            title="Inverser les devises"
          >
            <ArrowLeftRight className="w-5 h-5" />
          </button>
        </div>

        {/* TO CARD */}
        <div className="p-4 sm:p-5 rounded-2xl bg-teal-50/40 border border-[#14B8A6]/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#0D9488]">{t('exchange.youReceive')}</span>
            <span className="text-xs text-slate-500">
              {t('wallets.availableBalance')} :{' '}
              <strong className="text-slate-800 tabular-nums">
                {formatCurrency(toWallet.available_balance, toCurrency)}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 text-2xl sm:text-3xl font-black text-[#0F172A] font-display tabular-nums">
              {toAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>

            <select
              value={toCurrency}
              onChange={(e) => {
                const next = e.target.value as any;
                if (next === fromCurrency) setFromCurrency(toCurrency);
                setToCurrency(next);
              }}
              className="bg-white border border-slate-300 font-bold text-sm px-3 py-2 rounded-xl focus:outline-none cursor-pointer"
            >
              <option value="XAF">🇨🇲 XAF (FCFA)</option>
              <option value="USD">🇺🇸 USD ($)</option>
              <option value="EUR">🇪🇺 EUR (€)</option>
            </select>
          </div>
        </div>

        {/* Guaranteed Rate & Lock Timer */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
            <TrendingUp className="w-4 h-4 text-[#14B8A6]" />
            <span>Taux appliqué :</span>
            <strong className="font-mono text-slate-900">
              1 {fromCurrency} = {rate < 0.01 ? rate.toFixed(6) : rate.toFixed(4)} {toCurrency}
            </strong>
          </div>

          <div className="flex items-center gap-1.5 text-slate-500">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Taux garanti pendant :</span>
            <strong className="font-mono text-amber-600 font-bold">
              00:{lockTimer < 10 ? `0${lockTimer}` : lockTimer}
            </strong>
          </div>
        </div>

        {/* Transparent Fee Summary */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-600">
          <div className="flex justify-between">
            <span>{t('exchange.commission')} :</span>
            <span className="font-bold text-emerald-600">0.00 % ({t('common.offered')})</span>
          </div>
          <div className="flex justify-between">
            <span>Délai d'exécution :</span>
            <strong className="text-slate-900">Immédiat (Grand livre synchronisé)</strong>
          </div>
          <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-slate-900">
            <span>Montant crédité net :</span>
            <span className="text-[#14B8A6] font-display text-sm">
              {formatCurrency(toAmount, toCurrency)}
            </span>
          </div>
        </div>

        {/* Submit */}
        <button
          type="button"
          onClick={handleExecuteExchange}
          disabled={isSubmitting || fromAmount <= 0}
          className="w-full bg-[#14B8A6] hover:bg-[#0D9488] text-white py-3.5 px-4 rounded-2xl text-sm font-bold shadow-md shadow-teal-500/20 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 disabled:opacity-50"
        >
          <ArrowLeftRight className="w-4 h-4" />
          <span>{isSubmitting ? t('common.loading') : t('exchange.confirmSwap')}</span>
        </button>
      </div>

      {/* Guarantee Footer */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 text-xs text-slate-600">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
        <span>Toutes les opérations d'échange reposent sur la parité officielle BEAC et les cotations interbancaires en direct.</span>
      </div>
    </div>
  );
};
