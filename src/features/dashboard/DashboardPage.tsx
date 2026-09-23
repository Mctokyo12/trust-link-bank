import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  SendHorizontal,
  ArrowDownLeft,
  ArrowLeftRight,
  PlusCircle,
  Eye,
  EyeOff,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Building2,
  ExternalLink,
  HelpCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { useAppStore } from '../../app/store';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { transactionsApi } from '../../services/api/client';
import { useQuery } from '@tanstack/react-query';

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    currentUser,
    wallets,
    hideBalances,
    toggleHideBalances,
    setSelectedWalletId,
  } = useAppStore();

  const { data: recentTransactions = [] } = useQuery({
    queryKey: ['transactions', 'recent'],
    queryFn: () => transactionsApi.getTransactions({ limit: 5 }),
  });

  // Calculate Net Global Balance in FCFA:
  const totalNetXAF = wallets.reduce((acc, w) => {
    if (w.currency === 'XAF') return acc + w.balance;
    if (w.currency === 'USD') return acc + w.balance * 604.0;
    if (w.currency === 'EUR') return acc + w.balance * 655.957;
    return acc;
  }, 0);

  const equivEUR = totalNetXAF / 655.957;
  const equivUSD = totalNetXAF / 604.0;

  // Weekly Cashflow mockup data for Recharts
  const cashflowData = [
    { day: 'Lun', entrees: 350000, sorties: 80000 },
    { day: 'Mar', entrees: 120000, sorties: 210000 },
    { day: 'Mer', entrees: 450000, sorties: 150000 },
    { day: 'Jeu', entrees: 180000, sorties: 90000 },
    { day: 'Ven', entrees: 920000, sorties: 450000 },
    { day: 'Sam', entrees: 150000, sorties: 45000 },
    { day: 'Dim', entrees: 750000, sorties: 100000 },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Net Global Balance Card */}
      <div className="bg-[#0F172A] text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-900/10 border border-slate-800 relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
              {t('dashboard.netGlobalBalance')}
            </span>
            <button
              type="button"
              onClick={toggleHideBalances}
              title={hideBalances ? "Afficher" : "Masquer"}
              className="text-slate-400 hover:text-white transition-colors"
            >
              {hideBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-[#14B8A6]" />}
            </button>
          </div>

          <span className="text-[11px] bg-slate-800 border border-slate-700/80 text-[#14B8A6] font-bold px-2.5 py-0.5 rounded-full">
            CEMAC • UEMOA
          </span>
        </div>

        {/* Big Balance Display */}
        <div className="mb-4">
          <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-display tabular-nums">
            {hideBalances ? '•••••••• FCFA' : formatCurrency(totalNetXAF, 'XAF')}
          </div>
          <div className="text-xs sm:text-sm text-slate-400 font-medium mt-1.5 flex items-center gap-2">
            <span>
              {hideBalances
                ? 'Équivalent : •••••• EUR · •••••• USD'
                : `Équivalent ~ € ${equivEUR.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} EUR · $ ${equivUSD.toLocaleString('en-US', { maximumFractionDigits: 2 })} USD`}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 text-xs">
          <span className="text-emerald-400 font-medium flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>{t('dashboard.operationalGuaranteed')}</span>
          </span>
          <button
            onClick={() => navigate('/wallets')}
            className="text-slate-300 hover:text-white font-semibold flex items-center gap-1 transition-colors"
          >
            <span>{t('dashboard.details')}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Quick Action Buttons */}
      <div className="grid grid-cols-4 gap-3 sm:gap-4">
        <button
          onClick={() => navigate('/send')}
          className="bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-center shadow-sm hover:shadow transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#14B8A6] group-hover:bg-[#14B8A6] group-hover:text-white flex items-center justify-center transition-colors">
            <SendHorizontal className="w-5 h-5" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-slate-800">{t('dashboard.send')}</span>
        </button>

        <button
          onClick={() => navigate('/receive')}
          className="bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-center shadow-sm hover:shadow transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white flex items-center justify-center transition-colors">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-slate-800">{t('dashboard.receive')}</span>
        </button>

        <button
          onClick={() => navigate('/exchange')}
          className="bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-center shadow-sm hover:shadow transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#22C55E] group-hover:bg-[#22C55E] group-hover:text-white flex items-center justify-center transition-colors">
            <ArrowLeftRight className="w-5 h-5" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-slate-800">{t('dashboard.exchange')}</span>
        </button>

        <button
          onClick={() => navigate('/receive')}
          className="bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-center shadow-sm hover:shadow transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#F59E0B] group-hover:bg-[#F59E0B] group-hover:text-white flex items-center justify-center transition-colors">
            <PlusCircle className="w-5 h-5" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-slate-800">{t('dashboard.topUp')}</span>
        </button>
      </div>

      {/* 3. Multi-Currency Wallets Carousel / Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#0F172A] font-display">
            {t('dashboard.multiCurrencyWallets')}
          </h2>
          <button
            onClick={() => navigate('/wallets')}
            className="text-xs font-bold text-[#14B8A6] hover:underline flex items-center gap-1"
          >
            <span>{t('dashboard.manage')}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {wallets.map((wallet) => {
            const isXAF = wallet.currency === 'XAF';
            const isUSD = wallet.currency === 'USD';
            const isEUR = wallet.currency === 'EUR';

            return (
              <div
                key={wallet.id}
                onClick={() => {
                  setSelectedWalletId(wallet.id);
                  navigate(`/wallets/${wallet.id}`);
                }}
                className="bg-white border border-slate-200 hover:border-[#14B8A6] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {isXAF && '🇨🇲'}
                      {isUSD && '🇺🇸'}
                      {isEUR && '🇪🇺'}
                    </span>
                    <div>
                      <div className="font-bold text-sm text-[#0F172A]">
                        {isXAF && 'Portefeuille XAF'}
                        {isUSD && 'Portefeuille USD'}
                        {isEUR && 'Portefeuille EUR'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {isXAF && 'FCFA CEMAC'}
                        {isUSD && 'Dollar Américain'}
                        {isEUR && 'Euro SEPA'}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {isXAF ? t('dashboard.main') : t('dashboard.virtualFx')}
                  </span>
                </div>

                <div className="my-2">
                  <div className="text-2xl font-black text-[#0F172A] font-display tabular-nums">
                    {hideBalances ? '••••••' : formatCurrency(wallet.balance, wallet.currency)}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-1 truncate">
                    {wallet.account_number}
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#14B8A6] font-semibold">
                  <span>Voir le compte</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Taux Direct Live + Weekly Cashflow Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Rates Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#14B8A6]" />
                <h3 className="font-bold text-sm text-[#0F172A]">{t('dashboard.liveRates')}</h3>
              </div>
              <span className="text-[10px] bg-teal-50 text-[#14B8A6] font-bold px-2 py-0.5 rounded-full">
                {t('dashboard.liveBceaoBeac')}
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-700">1 EUR = 655,957 FCFA</span>
                  <div className="text-[10px] text-slate-400">{t('dashboard.officialFixed')}</div>
                </div>
                <span className="text-xs font-bold text-emerald-600 font-mono">0.00%</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-700">1 USD = 604,00 FCFA</span>
                  <div className="text-[10px] text-slate-400">Marché spot en direct</div>
                </div>
                <span className="text-xs font-bold text-emerald-600 font-mono">+0.15%</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-700">1 EUR = 1,086 USD</span>
                  <div className="text-[10px] text-slate-400">Paire forex internationale</div>
                </div>
                <span className="text-xs font-bold text-rose-600 font-mono">-0.08%</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/exchange')}
            className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white py-2.5 px-4 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
          >
            <span>Convertir une devise</span>
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Weekly Cashflow Bar Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-[#0F172A]">{t('dashboard.weeklyCashflow')}</h3>
              <p className="text-xs text-slate-500">{t('dashboard.last7Days')}</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#14B8A6]" />
                <span className="text-slate-600 font-medium">{t('dashboard.inflows')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
                <span className="text-slate-600 font-medium">{t('dashboard.outflows')}</span>
              </div>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashflowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 10, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val: any) => [`${Number(val).toLocaleString()} FCFA`]}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="entrees" fill="#14B8A6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="sorties" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 5. Recent Transactions List */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#0F172A] font-display">
            {t('dashboard.recentTransactions')}
          </h2>
          <button
            onClick={() => navigate('/transactions')}
            className="text-xs font-bold text-[#14B8A6] hover:underline flex items-center gap-1"
          >
            <span>{t('common.viewAll')}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {recentTransactions.map((tx) => {
            const isCredit = tx.type === 'deposit' || tx.recipient_name === 'Amina Diallo';
            return (
              <div
                key={tx.id}
                onClick={() => navigate(`/transactions`)}
                className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50 px-2 rounded-xl transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isCredit ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {isCredit ? <ArrowDownLeft className="w-5 h-5" /> : <SendHorizontal className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-[#0F172A] truncate max-w-xs sm:max-w-md">
                      {tx.description}
                    </div>
                    <div className="text-xs text-slate-400 font-medium mt-0.5 flex items-center gap-2">
                      <span>{formatDate(tx.created_at)}</span>
                      <span>•</span>
                      <span className="font-mono text-[11px]">{tx.reference}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div
                    className={`font-black text-sm sm:text-base font-display tabular-nums ${
                      isCredit ? 'text-[#22C55E]' : 'text-[#0F172A]'
                    }`}
                  >
                    {isCredit ? '+' : '-'} {formatCurrency(tx.amount, tx.currency)}
                  </div>
                  <div className="text-[11px] text-emerald-600 font-semibold flex items-center justify-end gap-1 mt-0.5">
                    <CheckCircle2 className="w-3 h-3 inline" />
                    <span>Complété</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Quick Support Ticket Banner */}
      <div className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-100 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-white text-[#14B8A6] flex items-center justify-center shadow-sm shrink-0">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-[#0F172A]">{t('dashboard.helpCemac')}</h4>
            <p className="text-xs text-slate-600 mt-0.5">{t('dashboard.helpCemacSub')}</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/notifications')}
          className="bg-white hover:bg-slate-50 text-[#0F172A] border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm shrink-0"
        >
          {t('dashboard.openTicket')}
        </button>
      </div>
    </div>
  );
};
