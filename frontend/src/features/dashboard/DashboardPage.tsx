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
  Coins,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Wallet as WalletIcon,
  ShieldAlert,
} from 'lucide-react';
import { useAppStore } from '../../app/store';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { transactionsApi } from '../../services/api/client';
import { useQuery } from '@tanstack/react-query';
import { getCurrencyMeta } from '../../utils/currencies';

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    currentUser,
    wallets,
    hideBalances,
    toggleHideBalances,
  } = useAppStore();

  const userCurrency = currentUser?.preferred_currency || wallets[0]?.currency || 'USD';
  const currencyMeta = getCurrencyMeta(userCurrency);

  // Find primary wallet or first wallet matching preferred currency
  const primaryWallet = wallets.find((w) => w.currency === userCurrency) || wallets[0];
  const primaryBalance = primaryWallet?.balance ?? 0;
  const primaryAvailable = primaryWallet?.available_balance ?? 0;

  const { data: recentTransactions = [], isLoading: loadingTx } = useQuery({
    queryKey: ['transactions', 'recent', currentUser?.id],
    queryFn: () => transactionsApi.getTransactions({ limit: 5 }),
  });

  const firstName = currentUser?.first_name || currentUser?.name?.split(' ')[0] || 'Client';
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin';

  return (
    <div className="space-y-6">
      {/* Admin Notice Banner if logged in as Admin */}
      {isAdmin && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/60 to-indigo-950/60 border border-blue-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm font-display">
                  {t('dashboard.adminSessionActive', 'Active Administrator Session')}
                </span>
                <span className="text-[10px] bg-blue-500/30 text-blue-200 border border-blue-400/40 px-2 py-0.5 rounded font-black">
                  {t('admin.supervisionBadge', 'SUPERVISION')}
                </span>
              </div>
              <p className="text-xs text-blue-200/80">
                {t('dashboard.adminSessionDesc', 'You are authorized to send funds to all users and manage client accounts.')}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/admin')}
            className="self-start sm:self-auto px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-900/40 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>{t('dashboard.adminConsoleBtn', 'Admin Console')}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Greeting Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] dark:text-white tracking-tight font-display">
            {t('dashboard.greeting', 'Hello')}, {firstName} 👋
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400">
            {isAdmin
              ? t('dashboard.adminSubtitle', 'Trust Link Bank Supervisor Portal • Continental flows & treasury distribution.')
              : t('dashboard.clientReceiveSubtitle', 'Your client account is ready to receive instant transfers.')}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isAdmin ? (
            <span className="text-xs font-bold text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 px-3 py-1 rounded-xl flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{t('dashboard.adminPrivilegesBadge', 'Active Admin Privileges')}</span>
            </span>
          ) : (
            <span className="text-xs font-bold text-[#16A34A] dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 px-3 py-1 rounded-xl flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
              <span>{t('dashboard.receiveOnlyMode', 'Receive Only')} ({currencyMeta.code})</span>
            </span>
          )}
        </div>
      </div>

      {/* 1. Net Global Balance Card (Requirement 1 & 2: Real user currency, 0.00 for new accounts) */}
      <div className="bg-[#0F172A] text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-900/10 border border-slate-800 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
              {t('dashboard.totalBalance', 'Total Account Balance')}
            </span>
            <button
              type="button"
              onClick={toggleHideBalances}
              title={hideBalances ? t('common.show', 'Show') : t('common.hide', 'Hide')}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              {hideBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-[#2563EB]" />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] bg-slate-800 border border-slate-700/80 text-blue-300 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <span>{currencyMeta.flag}</span>
              <span>{currencyMeta.code}</span>
            </span>
          </div>
        </div>

        {/* Big Balance Display */}
        <div className="mb-4">
          <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-display tabular-nums">
            {hideBalances ? '••••••••' : formatCurrency(primaryBalance, userCurrency)}
          </div>
          <div className="text-xs sm:text-sm text-slate-400 font-medium mt-1.5 flex items-center gap-2">
            <span>
              {t('common.available')} :{' '}
              <strong className="text-white">
                {hideBalances ? '••••••••' : formatCurrency(primaryAvailable, userCurrency)}
              </strong>
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 text-xs">
          <span className="text-[#16A34A] font-medium flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
            <span>{t('dashboard.operationalGuaranteed')}</span>
          </span>
          <button
            onClick={() => navigate('/accounts')}
            className="text-slate-300 hover:text-white font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>{t('dashboard.manage')}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Quick Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Receive Action */}
        <button
          onClick={() => navigate('/receive')}
          className="bg-white dark:bg-[#0F172A] hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-center shadow-xs hover:shadow-sm transition-all group cursor-pointer relative"
        >
          {!isAdmin && (
            <span className="absolute top-2 right-2 text-[9px] bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 font-extrabold px-1.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              {t('common.active', 'Active')}
            </span>
          )}
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 group-hover:bg-[#16A34A] group-hover:text-white flex items-center justify-center transition-colors">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white">{t('dashboard.receive')}</span>
        </button>

        {/* Send Action */}
        <button
          onClick={() => navigate('/send')}
          className="bg-white dark:bg-[#0F172A] hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-center shadow-xs hover:shadow-sm transition-all group cursor-pointer relative"
        >
          {!isAdmin && (
            <span className="absolute top-2 right-2 text-[9px] bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 font-extrabold px-1.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
              Admin
            </span>
          )}
          <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] dark:bg-blue-950/40 text-[#2563EB] dark:text-blue-400 group-hover:bg-[#2563EB] group-hover:text-white flex items-center justify-center transition-colors">
            <SendHorizontal className="w-5 h-5" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white">
            {t('dashboard.send')}
          </span>
        </button>

        {/* Add Money or Admin Users */}
        {isAdmin ? (
          <button
            onClick={() => navigate('/admin/users')}
            className="bg-white dark:bg-[#0F172A] hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-center shadow-xs hover:shadow-sm transition-all group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center transition-colors">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white">
              {t('dashboard.manageUsersBtn', 'Manage Users')}
            </span>
          </button>
        ) : (
          <button
            onClick={() => navigate('/transactions')}
            className="bg-white dark:bg-[#0F172A] hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-center shadow-xs hover:shadow-sm transition-all group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] dark:bg-blue-950/40 text-[#2563EB] dark:text-blue-400 group-hover:bg-[#2563EB] group-hover:text-white flex items-center justify-center transition-colors">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white">{t('nav.transactions')}</span>
          </button>
        )}

        <button
          onClick={() => navigate(isAdmin ? '/admin' : '/accounts')}
          className="bg-white dark:bg-[#0F172A] hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-center shadow-xs hover:shadow-sm transition-all group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] dark:bg-blue-950/40 text-[#2563EB] dark:text-blue-400 group-hover:bg-[#2563EB] group-hover:text-white flex items-center justify-center transition-colors">
            <WalletIcon className="w-5 h-5" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-white">
            {isAdmin ? t('dashboard.adminConsoleBtn', 'Admin Console') : t('nav.wallets')}
          </span>
        </button>
      </div>

      {/* 3. Account Wallets Summary */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4 transition-colors">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-[#0F172A] dark:text-white font-display flex items-center gap-2">
            <span>{t('dashboard.multiCurrencyWallets')}</span>
            <span className="text-xs text-[#64748B] dark:text-slate-400 font-normal">({wallets.length})</span>
          </h2>
          <button
            onClick={() => navigate('/accounts')}
            className="text-xs font-bold text-[#2563EB] dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{t('common.viewAll')}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {wallets.map((w) => {
            const meta = getCurrencyMeta(w.currency);
            return (
              <div
                key={w.id}
                onClick={() => navigate(`/wallets/${w.id}`)}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-[#2563EB] dark:hover:border-blue-500 transition-all cursor-pointer bg-slate-50/50 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-900 hover:shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{meta.flag}</span>
                    <span className="font-bold text-xs text-[#0F172A] dark:text-white">{meta.label}</span>
                  </div>
                  <span className="text-[10px] font-bold text-[#16A34A] bg-green-50 dark:bg-green-950/40 px-2 py-0.5 rounded-full border border-green-200 dark:border-green-800">
                    {t('common.active')}
                  </span>
                </div>
                <div className="text-xl font-extrabold text-[#0F172A] dark:text-white tabular-nums font-display">
                  {hideBalances ? '••••••••' : formatCurrency(w.balance, w.currency)}
                </div>
                <div className="text-[11px] text-[#64748B] dark:text-slate-400 font-mono truncate">
                  {w.account_number}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Recent Transactions Widget */}
      {/* 4. Recent Transactions Widget */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4 transition-colors">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-[#0F172A] dark:text-white font-display">
            {t('dashboard.recentTransactions')}
          </h2>
          <button
            onClick={() => navigate('/transactions')}
            className="text-xs font-bold text-[#2563EB] dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{t('common.viewAll')}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="py-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-blue-400 flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#0F172A] dark:text-white">{t('transactions.noTransactions')}</div>
              <p className="text-xs text-[#64748B] dark:text-slate-400 max-w-sm mx-auto mt-1">
                {t('transactions.empty')}
              </p>
            </div>
            <button
              onClick={() => navigate('/receive')}
              className="px-4 py-2 rounded-xl bg-[#2563EB] text-white text-xs font-bold hover:bg-[#1E3A8A] transition-colors cursor-pointer"
            >
              {t('dashboard.receive')}
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentTransactions.map((tx) => {
              const isCredit = tx.type === 'deposit' || tx.receiver_id === currentUser?.id;
              return (
                <div
                  key={tx.id}
                  className="py-3 flex items-center justify-between hover:bg-slate-50/60 dark:hover:bg-slate-800/50 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isCredit ? 'bg-green-50 dark:bg-green-950/40 text-[#16A34A]' : 'bg-blue-50 dark:bg-blue-950/40 text-[#2563EB]'
                      }`}
                    >
                      {isCredit ? <ArrowDownLeft className="w-4 h-4" /> : <SendHorizontal className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#0F172A] dark:text-white truncate">
                        {tx.description}
                      </div>
                      <div className="text-[11px] text-[#64748B] dark:text-slate-400">
                        {formatDate(tx.created_at)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-xs font-extrabold tabular-nums ${
                        isCredit ? 'text-[#16A34A]' : 'text-[#0F172A] dark:text-white'
                      }`}
                    >
                      {isCredit ? '+' : '-'} {formatCurrency(tx.amount, tx.currency)}
                    </div>
                    <span className="text-[10px] text-[#16A34A] font-medium">{t('common.completed')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Trust Link Bank Institutional Spotlight & Visual Showcase */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm transition-colors">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left Content Column */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#2563EB] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-900">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{t('dashboard.tlbSpotlightBadge', 'Trust Link Bank • Institutional Infrastructure')}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white tracking-tight font-display leading-snug">
                {t('dashboard.tlbSpotlightTitle', 'Global Multi-Currency Banking & Instant Clearing Network')}
              </h2>

              <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 leading-relaxed">
                {t(
                  'dashboard.tlbSpotlightDesc',
                  'Trust Link Bank connects personal and corporate accounts across the Americas and Europe with real-time settlement rails (Fedwire, ACH, PIX, SPEI, Interac, and SEPA Instant). Every transaction is protected by AES-256 encryption and verified through our immutable double-entry ledger.'
                )}
              </p>
            </div>

            {/* 3 Institutional Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <div className="text-xs font-extrabold text-[#2563EB] dark:text-blue-400">
                  {t('dashboard.tlbPillar1Title', '100% Segregated Reserves')}
                </div>
                <p className="text-[11px] text-[#64748B] dark:text-slate-400 leading-snug">
                  {t('dashboard.tlbPillar1Desc', 'Funds safeguarded in Tier-1 partner custodial institutions up to $250,000.')}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <div className="text-xs font-extrabold text-[#16A34A] dark:text-emerald-400">
                  {t('dashboard.tlbPillar2Title', 'Double-Entry Ledger')}
                </div>
                <p className="text-[11px] text-[#64748B] dark:text-slate-400 leading-snug">
                  {t('dashboard.tlbPillar2Desc', 'Mathematical auditability on every credit and debit with official downloadable receipts.')}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 space-y-1">
                <div className="text-xs font-extrabold text-[#0F172A] dark:text-white">
                  {t('dashboard.tlbPillar3Title', '14 Official Currencies')}
                </div>
                <p className="text-[11px] text-[#64748B] dark:text-slate-400 leading-snug">
                  {t('dashboard.tlbPillar3Desc', 'Hold and receive USD, CAD, BRL, MXN, EUR, COP, CLP, ARS, and more with zero monthly fees.')}
                </p>
              </div>
            </div>

            {/* Key Metrics Strip */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-6">
                <div>
                  <span className="font-black text-base text-[#0F172A] dark:text-white font-display">2,500+</span>
                  <span className="block text-[10px] text-[#64748B] dark:text-slate-400">{t('dashboard.tlbMetricBanks', 'Connected Banks')}</span>
                </div>
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
                <div>
                  <span className="font-black text-base text-[#16A34A] font-display">&lt; 5s</span>
                  <span className="block text-[10px] text-[#64748B] dark:text-slate-400">{t('dashboard.tlbMetricSpeed', 'Instant Settlement')}</span>
                </div>
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
                <div>
                  <span className="font-black text-base text-[#2563EB] dark:text-blue-400 font-display">ISO 27001</span>
                  <span className="block text-[10px] text-[#64748B] dark:text-slate-400">{t('dashboard.tlbMetricSecurity', 'Certified Security')}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/profile')}
                className="text-xs font-bold text-[#2563EB] dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{t('dashboard.tlbLearnMoreBtn', 'View Security & Compliance')}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Visual Banner Column */}
          <div className="lg:col-span-5 relative min-h-[260px] bg-slate-900 overflow-hidden flex flex-col justify-end p-6 text-white">
            <img
              src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900&auto=format&fit=crop&q=80"
              alt="Trust Link Bank Financial Headquarters"
              className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity scale-105 hover:scale-100 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/60 to-transparent" />

            <div className="relative z-10 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{t('dashboard.tlbNetworkStatus', 'Clearing Network Active 24/7')}</span>
              </div>

              <h3 className="text-base sm:text-lg font-extrabold font-display leading-tight text-white">
                {t('dashboard.tlbVisualCaptionTitle', 'Bridging North America, Latin America & Europe')}
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed">
                {t(
                  'dashboard.tlbVisualCaptionSub',
                  'Direct interoperability with JPMorgan Chase, Bank of America, RBC, Itaú, Nubank, BBVA, and SEPA institutions.'
                )}
              </p>

              <div className="pt-2 flex flex-wrap gap-1.5 text-[10px] font-mono text-blue-200">
                <span className="px-2 py-0.5 rounded bg-slate-800/90 border border-slate-700">Fedwire/ACH</span>
                <span className="px-2 py-0.5 rounded bg-slate-800/90 border border-slate-700">PIX Brasil</span>
                <span className="px-2 py-0.5 rounded bg-slate-800/90 border border-slate-700">SPEI México</span>
                <span className="px-2 py-0.5 rounded bg-slate-800/90 border border-slate-700">SEPA Instant</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
