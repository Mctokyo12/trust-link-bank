import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Bell,
  Eye,
  EyeOff,
  SendHorizontal,
  Globe2,
  TrendingUp,
} from 'lucide-react';
import { useAppStore } from '../../app/store';

export const TopBar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    currentUser,
    hideBalances,
    toggleHideBalances,
    unreadNotificationsCount,
  } = useAppStore();

  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return t('nav.home');
    if (path.includes('/wallets')) return t('nav.wallets');
    if (path.includes('/send')) return t('send.title');
    if (path.includes('/receive')) return t('receive.title');
    if (path.includes('/exchange')) return t('nav.exchange');
    if (path.includes('/transactions')) return t('nav.transactions');
    if (path.includes('/beneficiaries')) return t('nav.beneficiaries');
    if (path.includes('/notifications')) return t('nav.notifications');
    if (path.includes('/profile')) return t('nav.profile');
    if (path.includes('/admin')) return t('nav.admin');
    return 'Espace Client';
  };

  const toggleLang = () => {
    const next = i18n.language === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(next);
  };

  return (
    <header className="hidden lg:flex items-center justify-between h-16 px-8 bg-white border-b border-slate-200 sticky top-0 z-20">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-slate-400 font-medium">NovaPay</span>
        <span className="text-slate-300">/</span>
        <span className="text-[#0F172A] font-semibold">{getBreadcrumb()}</span>
      </div>

      {/* Live Market Ticker */}
      <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-mono tabular-nums">
        <div className="flex items-center gap-1.5 text-slate-500">
          <TrendingUp className="w-3.5 h-3.5 text-[#14B8A6]" />
          <span className="text-[11px] font-sans font-medium text-slate-500">BEAC Direct :</span>
        </div>
        <span className="text-slate-700 font-semibold">1 EUR = 655.957 FCFA</span>
        <span className="text-slate-300">·</span>
        <span className="text-slate-700 font-semibold">1 USD = 604.00 FCFA</span>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-3">
        {/* Hide/Show balances */}
        <button
          onClick={toggleHideBalances}
          type="button"
          title={hideBalances ? "Afficher les montants" : "Masquer les montants"}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          {hideBalances ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-[#14B8A6]" />}
        </button>

        {/* Quick Send Button */}
        <button
          onClick={() => navigate('/send')}
          className="flex items-center gap-2 bg-[#14B8A6] hover:bg-[#0D9488] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all"
        >
          <SendHorizontal className="w-3.5 h-3.5" />
          <span>{t('dashboard.send')}</span>
        </button>

        {/* Language switcher */}
        <button
          onClick={toggleLang}
          type="button"
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          <Globe2 className="w-3.5 h-3.5 text-[#14B8A6]" />
          <span>{i18n.language.toUpperCase()}</span>
        </button>

        {/* Notifications */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <Bell className="w-4 h-4" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EF4444] rounded-full" />
          )}
        </button>

        {/* User Pill */}
        <div
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2.5 pl-2 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <img
            src={currentUser?.avatar_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'}
            alt="User avatar"
            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
          />
          <div className="hidden xl:block text-left">
            <div className="text-xs font-bold text-[#0F172A] leading-none">{currentUser?.name}</div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">{currentUser?.novatag}</div>
          </div>
        </div>
      </div>
    </header>
  );
};
