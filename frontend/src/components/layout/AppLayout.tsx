import React, { useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileHeader, MobileBottomNav } from './MobileNav';
import { useAppStore } from '../../app/store';

export const AppLayout: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser, initApp, isLoadingUser } = useAppStore();

  useEffect(() => {
    initApp();
  }, [initApp]);

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] flex flex-col items-center justify-center transition-colors">
        <div className="w-12 h-12 rounded-2xl bg-[#2563EB] flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/30 animate-pulse mb-3">
          TLB
        </div>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
          {t('common.loadingAccount') || 'Loading your account...'}
        </p>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] text-[#0F172A] dark:text-[#F8FAFC] flex transition-colors">
      {/* Desktop Persistent Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen pb-28 sm:pb-24 lg:pb-8">
        {/* Mobile Header */}
        <MobileHeader />

        {/* Desktop Top Bar */}
        <TopBar />

        {/* Route Page Container */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-5 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Mobile Persistent Bottom Navigation */}
        <MobileBottomNav />
      </div>
    </div>
  );
};
