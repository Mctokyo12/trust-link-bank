import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Wallet,
  SendHorizontal,
  QrCode,
  ArrowLeftRight,
  ReceiptText,
  CreditCard,
  PlusCircle,
  Settings,
  Bell,
  UserCheck,
  ShieldCheck,
  Globe2,
  LogOut,
  ChevronRight,
  Check,
  Sun,
  Moon,
  ShieldAlert,
} from 'lucide-react';
import { useAppStore } from '../../app/store';
import { SUPPORTED_LANGUAGES } from '../../i18n/languages';
import { getCurrencyMeta } from '../../utils/currencies';
import { ThemeToggle } from '../common/ThemeToggle';

export const Sidebar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, unreadNotificationsCount, setLanguage, logout, theme, toggleTheme } = useAppStore();

  // Navigation Items
  const navItems = [
    { to: '/dashboard', label: t('nav.home', 'Dashboard'), icon: LayoutDashboard },
    { to: '/accounts', label: t('nav.wallets', 'Accounts'), icon: Wallet },
    { to: '/add-money', label: t('nav.addMoney', 'Add Money'), icon: PlusCircle },
    { to: '/send', label: t('send.title', 'Send Money'), icon: SendHorizontal },
    { to: '/receive', label: t('receive.title', 'Receive'), icon: QrCode },
    { to: '/transactions', label: t('nav.transactions', 'Transactions'), icon: ReceiptText },
    { to: '/cards', label: t('nav.cards', 'Cards'), icon: CreditCard },
    { to: '/exchange', label: t('nav.exchange', 'Exchange'), icon: ArrowLeftRight },
    { to: '/profile', label: t('nav.profile', 'My Profile'), icon: UserCheck },
    { to: '/settings', label: t('nav.settings', 'Settings'), icon: Settings },
  ];

  const [isLangOpen, setIsLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
    };
    if (isLangOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isLangOpen]);

  const currentLang =
    SUPPORTED_LANGUAGES.find((l) => l.code === i18n.language) ||
    SUPPORTED_LANGUAGES.find((l) => i18n.language?.startsWith(l.code)) ||
    SUPPORTED_LANGUAGES[0];

  const initials = (currentUser?.name || 'Trust Link')
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const userCurrencyMeta = getCurrencyMeta(currentUser?.preferred_currency || 'USD');

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-[#0F172A] text-slate-300 border-r border-slate-800 shrink-0 h-screen sticky top-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="w-9 h-9 rounded-xl bg-[#2563EB] flex items-center justify-center text-white font-black text-xs tracking-wider shadow-lg shadow-blue-500/20">
            TLB
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base text-white tracking-tight font-display">Trust Link Bank</span>
              <span className="text-[10px] bg-[#2563EB]/20 text-blue-400 font-bold px-1.5 py-0.5 rounded">MVP</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Americas & Global</p>
          </div>
        </div>
      </div>

      {/* Current User Quick View (No fake avatar, clean initials when empty) */}
      {currentUser && (
        <div className="px-4 py-3 mx-3 my-3 rounded-xl bg-slate-900/90 border border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            {currentUser.avatar_url ? (
              <img
                src={currentUser.avatar_url}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-700 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-xs shrink-0 ring-1 ring-blue-400/30">
                {initials}
              </div>
            )}
            <div className="overflow-hidden">
              <div className="text-xs font-semibold text-white truncate flex items-center gap-1">
                <span className="truncate">{currentUser.name}</span>
                <span className="text-xs">{currentUser.flag}</span>
              </div>
              <div className="text-[10px] text-blue-400 font-medium flex items-center gap-1">
                <span>{userCurrencyMeta.code}</span>
                <span>•</span>
                <span className="text-emerald-400">{t('auth.verified', 'Verified')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto no-scrollbar">
        {(currentUser?.role === 'admin' || currentUser?.role === 'super_admin') && (
          <div className="mb-3 px-0.5">
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-900/50'
                    : 'bg-blue-950/50 text-blue-300 border-blue-800/80 hover:bg-blue-900/60 hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>{t('dashboard.adminConsoleBtn', 'Admin Console')}</span>
              </div>
              <span className="text-[9px] bg-blue-500/30 text-blue-200 px-1.5 py-0.5 rounded font-black tracking-wider">
                ADMIN
              </span>
            </NavLink>
          </div>
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          const isSendItem = item.to === '/send';
          const isReceiveItem = item.to === '/receive';
          const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin';

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#2563EB] text-white font-semibold shadow-md shadow-blue-900/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>

              {!isAdmin && isSendItem && (
                <span className="text-[9px] bg-amber-950/60 text-amber-400 border border-amber-800/60 font-bold px-1.5 py-0.5 rounded">
                  Admin
                </span>
              )}

              {!isAdmin && isReceiveItem && (
                <span className="text-[9px] bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 font-bold px-1.5 py-0.5 rounded">
                  {t('common.active', 'Active')}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Profile & Language Controls */}
      <div className="p-3 border-t border-slate-800/80 space-y-2.5 bg-[#0F172A]">
        {/* Prominent Theme Switcher Segmented Control */}
        <div className="space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
            {t('common.theme', 'Display Theme')}
          </div>
          <ThemeToggle variant="pill" className="w-full justify-between" />
        </div>

        {/* Language selector popover */}
        <div className="relative" ref={langRef}>
          <button
            type="button"
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Globe2 className="w-3.5 h-3.5 text-[#2563EB]" />
              <span className="text-sm">{currentLang.flag}</span>
              <span className="font-semibold text-xs">{currentLang.nativeName}</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono uppercase">{currentLang.code}</span>
          </button>

          {isLangOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 p-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 space-y-1">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected = currentLang.code === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      setLanguage(lang.code);
                      setIsLangOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#2563EB] text-white font-bold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{lang.flag}</span>
                      <span>{lang.nativeName}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>{t('auth.logout', 'Sign Out')}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
