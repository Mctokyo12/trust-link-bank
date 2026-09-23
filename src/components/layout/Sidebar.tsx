import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Wallet,
  SendHorizontal,
  QrCode,
  ArrowLeftRight,
  ReceiptText,
  Users,
  Bell,
  UserCheck,
  ShieldCheck,
  Globe2,
  LogOut,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { useAppStore } from '../../app/store';

export const Sidebar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, unreadNotificationsCount, switchRole, logout } = useAppStore();

  const navItems = [
    { to: '/dashboard', label: t('nav.home'), icon: LayoutDashboard },
    { to: '/wallets', label: t('nav.wallets'), icon: Wallet },
    { to: '/send', label: t('send.title'), icon: SendHorizontal },
    { to: '/receive', label: t('receive.title'), icon: QrCode },
    { to: '/exchange', label: t('nav.exchange'), icon: ArrowLeftRight },
    { to: '/transactions', label: t('nav.transactions'), icon: ReceiptText },
    { to: '/beneficiaries', label: t('nav.beneficiaries'), icon: Users },
    {
      to: '/notifications',
      label: t('nav.notifications'),
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined,
    },
    { to: '/profile', label: t('nav.profile'), icon: UserCheck },
  ];

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(nextLang);
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-[#0F172A] text-slate-300 border-r border-slate-800 shrink-0 h-screen sticky top-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#14B8A6] to-[#2563EB] flex items-center justify-center text-white font-black text-lg shadow-lg shadow-teal-500/20">
            NP
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg text-white tracking-tight font-display">NovaPay</span>
              <span className="text-[10px] bg-[#14B8A6]/20 text-[#14B8A6] font-bold px-1.5 py-0.5 rounded">PRO</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Banque Panafricaine</p>
          </div>
        </div>
      </div>

      {/* Current User Quick View */}
      {currentUser && (
        <div className="px-4 py-3 mx-3 my-3 rounded-xl bg-slate-900/90 border border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img
              src={currentUser.avatar_url}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-700 shrink-0"
            />
            <div className="overflow-hidden">
              <div className="text-xs font-semibold text-white truncate flex items-center gap-1">
                <span>{currentUser.name}</span>
                <span className="text-xs">{currentUser.flag}</span>
              </div>
              <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 inline text-emerald-400" />
                <span>KYC Niv. 2</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#14B8A6] text-white font-semibold shadow-md shadow-teal-900/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="bg-[#EF4444] text-white text-[11px] font-bold px-1.5 py-0.2 rounded-full min-w-[18px] text-center">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}

        {/* Admin Link */}
        <div className="pt-3 mt-3 border-t border-slate-800/80">
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-blue-400 hover:text-white hover:bg-blue-950/40'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{t('nav.admin')}</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </NavLink>
        </div>
      </nav>

      {/* Bottom Footer Controls */}
      <div className="p-3 border-t border-slate-800 space-y-2 bg-[#090E1A]">
        {/* Language switch button */}
        <button
          onClick={toggleLanguage}
          type="button"
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Globe2 className="w-3.5 h-3.5 text-[#14B8A6]" />
            <span>Langue / Language</span>
          </div>
          <span className="uppercase text-[10px] bg-slate-800 text-[#14B8A6] font-bold px-1.5 py-0.5 rounded">
            {i18n.language}
          </span>
        </button>

        {/* Switch Client / Admin demo role button */}
        <button
          onClick={() => {
            const nextRole = currentUser?.role === 'super_admin' ? 'client' : 'admin';
            switchRole(nextRole);
          }}
          type="button"
          className="w-full text-left px-3 py-1.5 text-[11px] text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800 rounded-lg flex items-center justify-between transition-colors"
        >
          <span className="truncate">
            Mode : {currentUser?.role === 'super_admin' ? '👑 Admin' : '👤 Client'}
          </span>
          <span className="text-[10px] text-teal-400 font-semibold underline">Changer</span>
        </button>

        {/* Logout */}
        <button
          onClick={() => {
            logout();
            navigate('/auth/login');
          }}
          type="button"
          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-400/80 hover:text-rose-300 rounded-lg hover:bg-rose-950/20 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{t('nav.logout')}</span>
        </button>
      </div>
    </aside>
  );
};
