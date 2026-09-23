import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileHeader, MobileBottomNav } from './MobileNav';
import { useAppStore } from '../../app/store';

export const AppLayout: React.FC = () => {
  const { initApp, isLoadingUser } = useAppStore();

  useEffect(() => {
    initApp();
  }, [initApp]);

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-[#14B8A6] flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-teal-500/30 animate-pulse mb-3">
          NP
        </div>
        <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase">Chargement de votre compte...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Desktop Persistent Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen pb-20 lg:pb-8">
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
