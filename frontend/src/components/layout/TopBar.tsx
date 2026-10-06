import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Bell,
  Eye,
  EyeOff,
  SendHorizontal,
  Coins,
  Sun,
  Moon,
} from 'lucide-react';
import { useAppStore } from '../../app/store';
import { LanguageSelector } from '../common/LanguageSelector';
import { ThemeToggle } from '../common/ThemeToggle';
import { getCurrencyMeta } from '../../utils/currencies';

export const TopBar: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    currentUser,
    hideBalances,
    toggleHideBalances,
    unreadNotificationsCount,
    theme,
    toggleTheme,
  } = useAppStore();

  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return t('nav.home');
    if (path.includes('/accounts') || path.includes('/wallets')) return t('nav.wallets');
    if (path.includes('/add-money')) return t('nav.addMoney');
    if (path.includes('/send')) return t('send.title');
    if (path.includes('/receive')) return t('receive.title');
    if (path.includes('/transactions')) return t('nav.transactions');
    if (path.includes('/cards')) return t('nav.cards');
    if (path.includes('/exchange')) return t('nav.exchange');
    if (path.includes('/profile')) return t('nav.profile');
    if (path.includes('/settings')) return t('nav.settings');
    return 'Trust Link Bank';
  };

  const currencyMeta = getCurrencyMeta(currentUser?.preferred_currency || 'USD');

  const initials = (currentUser?.name || 'Trust Link')
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="hidden lg:flex items-center justify-between h-16 px-8 bg-white dark:bg-[#0F172A] border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 transition-colors">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-[#64748B] dark:text-slate-400 font-medium">Trust Link Bank</span>
        <span className="text-slate-300 dark:text-slate-600">/</span>
        <span className="text-[#0F172A] dark:text-white font-semibold">{getBreadcrumb()}</span>
      </div>

      {/* Currency Badge */}
      <div className="flex items-center gap-2 bg-[#EFF6FF] dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#1E3A8A] dark:text-blue-300">
        <Coins className="w-3.5 h-3.5 text-[#2563EB]" />
        <span>{t('auth.preferredCurrency', 'Primary Currency')} :</span>
        <span className="font-bold">{currencyMeta.flag} {currencyMeta.label}</span>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2.5">
        {/* Hide/Show balances */}
        <button
          onClick={toggleHideBalances}
          type="button"
          title={hideBalances ? t('common.show', 'Show') : t('common.hide', 'Hide')}
          className="p-2 rounded-xl text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          {hideBalances ? <EyeOff className="w-4 h-4 text-[#64748B] dark:text-slate-400" /> : <Eye className="w-4 h-4 text-[#2563EB]" />}
        </button>

        {/* Dark/Light Mode Segmented Pill */}
        <ThemeToggle variant="pill" />

        {/* Quick Send Button */}
        <button
          onClick={() => navigate('/send')}
          className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1E3A8A] text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
        >
          <SendHorizontal className="w-3.5 h-3.5" />
          <span>{t('send.title', 'Send')}</span>
        </button>

        {/* Language switcher */}
        <LanguageSelector />

        {/* Notifications */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-xl text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#DC2626] rounded-full" />
          )}
        </button>

        {/* User Pill (No fake avatar, clean initials when no photo) */}
        <div
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2.5 pl-2 cursor-pointer hover:opacity-85 transition-opacity"
        >
          {currentUser?.avatar_url ? (
            <img
              src={currentUser.avatar_url}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center font-bold text-xs ring-1 ring-blue-200 dark:ring-blue-900">
              {initials}
            </div>
          )}
          <div className="hidden xl:block text-left">
            <div className="text-xs font-bold text-[#0F172A] dark:text-white leading-none">{currentUser?.name}</div>
            <div className="text-[10px] text-[#64748B] dark:text-slate-400 font-mono mt-0.5">{currentUser?.novatag}</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
