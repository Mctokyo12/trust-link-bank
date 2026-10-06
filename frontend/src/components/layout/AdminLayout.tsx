import React, { useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ShieldAlert,
  ArrowLeft,
  LayoutDashboard,
  Users,
  ReceiptText,
  TrendingUp,
  Percent,
  UserCheck,
  FileText,
  ShieldCheck,
  Sun,
  Moon,
} from 'lucide-react';
import { useAppStore } from '../../app/store';
import { LanguageSelector } from '../common/LanguageSelector';

export const AdminLayout: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, switchRole, initApp, theme, toggleTheme, isLoadingUser } = useAppStore();

  useEffect(() => {
    const ensureAdmin = async () => {
      await initApp();
      const state = useAppStore.getState();
      if (!state.currentUser || (state.currentUser.role !== 'admin' && state.currentUser.role !== 'super_admin')) {
        await state.switchRole('admin');
      }
    };
    ensureAdmin();
  }, [initApp]);

  const tabs = [
    { to: '/admin', end: true, label: t('admin.tabs.dashboard'), icon: LayoutDashboard },
    { to: '/admin/users', label: t('admin.tabs.users'), icon: Users },
    { to: '/admin/transactions', label: t('admin.tabs.transactions'), icon: ReceiptText },
    { to: '/admin/rates', label: t('admin.tabs.exchangeRates'), icon: TrendingUp },
    { to: '/admin/fees', label: t('admin.tabs.fees'), icon: Percent },
    { to: '/admin/kyc', label: t('admin.tabs.kyc'), icon: UserCheck },
    { to: '/admin/audit', label: t('admin.tabs.auditLogs'), icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 flex flex-col font-sans">
      {/* Admin Top Header */}
      <header className="border-b border-slate-800 bg-[#0F172A] px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-500/20 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-sm sm:text-base tracking-tight font-display">
                  {t('admin.headerTitle', 'Trust Link Bank Back-Office')}
                </span>
                <span className="hidden xs:inline-block text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold px-2 py-0.5 rounded uppercase">
                  {t('admin.supervisionBadge', 'SUPERVISION')}
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-slate-400">
                {t('admin.headerSubtitle', 'Financial control & regulatory console')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            type="button"
            title={theme === 'dark' ? (t('common.lightMode') || 'Light Mode') : (t('common.darkMode') || 'Dark Mode')}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-blue-400" />
            )}
          </button>

          <LanguageSelector />

          <button
            onClick={() => {
              switchRole('client');
              navigate('/dashboard');
            }}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#14B8A6]" />
            <span>{t('nav.clientView')}</span>
          </button>

          <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
            <img
              src={currentUser?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
              alt="Admin"
              className="w-8 h-8 rounded-full object-cover ring-1 ring-blue-500"
            />
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-white leading-tight">{currentUser?.name || 'Super Admin'}</div>
              <div className="text-[10px] text-blue-400 font-mono">Super Admin</div>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Horizontal Sub Navigation */}
      <div className="bg-[#0F172A]/80 border-b border-slate-800/80 px-6 py-2 overflow-x-auto no-scrollbar">
        <nav className="flex items-center gap-1.5 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-900/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Admin Content Area */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
        <Outlet />
      </main>

      {/* Regulatory footer */}
      <footer className="border-t border-slate-800/60 py-3 px-6 text-center text-[11px] text-slate-500 flex items-center justify-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>{t('admin.regulatoryFooter', 'Compliant with international central banking standards • All transactions are archived on an immutable ledger.')}</span>
      </footer>
    </div>
  );
};
