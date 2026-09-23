import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Wallet,
  SendHorizontal,
  ArrowLeftRight,
  UserCheck,
  Bell,
  QrCode,
  ShieldCheck,
} from 'lucide-react';
import { useAppStore } from '../../app/store';

export const MobileHeader: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, unreadNotificationsCount } = useAppStore();

  return (
    <header className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3" onClick={() => navigate('/profile')}>
        <div className="relative">
          <img
            src={currentUser?.avatar_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'}
            alt="Avatar"
            className="w-10 h-10 rounded-full object-cover ring-2 ring-[#14B8A6]/30 shadow-sm"
          />
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#22C55E] border-2 border-white rounded-full" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium">{t('dashboard.greeting')}</span>
            <span className="text-sm font-bold text-[#0F172A]">{currentUser?.name?.split(' ')[0] || 'Amina'} 👋</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#14B8A6] font-semibold">
            <ShieldCheck className="w-3 h-3 text-[#14B8A6]" />
            <span>{t('dashboard.verifiedLevel2')}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/receive')}
          title={t('receive.title')}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
        >
          <QrCode className="w-4 h-4 text-slate-800" />
        </button>

        <button
          onClick={() => navigate('/notifications')}
          title={t('nav.notifications')}
          className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
        >
          <Bell className="w-4 h-4 text-slate-800" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#EF4444] rounded-full ring-2 ring-white" />
          )}
        </button>
      </div>
    </header>
  );
};

export const MobileBottomNav: React.FC = () => {
  const { t } = useTranslation();

  const items = [
    { to: '/dashboard', label: t('nav.home'), icon: LayoutDashboard },
    { to: '/wallets', label: t('nav.wallets'), icon: Wallet },
    { to: '/send', label: t('send.title'), icon: SendHorizontal, highlight: true },
    { to: '/exchange', label: t('nav.exchange'), icon: ArrowLeftRight },
    { to: '/profile', label: t('nav.profile'), icon: UserCheck },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-1.5 flex items-center justify-around shadow-lg shadow-slate-900/10 safe-area-pb">
      {items.map((item) => {
        const Icon = item.icon;
        if (item.highlight) {
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className="flex flex-col items-center -mt-5"
            >
              <div className="w-12 h-12 rounded-full bg-[#14B8A6] text-white flex items-center justify-center shadow-lg shadow-teal-500/40 hover:scale-105 active:scale-95 transition-transform">
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-[#14B8A6] mt-0.5">{item.label}</span>
            </NavLink>
          );
        }

        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-2.5 transition-colors ${
                isActive ? 'text-[#14B8A6] font-bold' : 'text-slate-500 hover:text-slate-800'
              }`
            }
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
