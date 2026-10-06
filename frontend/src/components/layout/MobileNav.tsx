import React, { useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Wallet,
  SendHorizontal,
  ReceiptText,
  UserCheck,
  Bell,
  QrCode,
  ShieldCheck,
  Sun,
  Moon,
  Menu,
  X,
  CreditCard,
  ArrowLeftRight,
  PlusCircle,
  Settings,
  Users,
  LogOut,
  ChevronRight,
  ShieldAlert,
  Globe2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAppStore } from '../../app/store';
import { LanguageSelector } from '../common/LanguageSelector';
import { ThemeToggle } from '../common/ThemeToggle';
import { SUPPORTED_LANGUAGES } from '../../i18n/languages';
import { getCurrencyMeta } from '../../utils/currencies';

export const MobileHeader: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    currentUser,
    unreadNotificationsCount,
    theme,
    toggleTheme,
    toggleMobileMenu,
    hideBalances,
    toggleHideBalances,
  } = useAppStore();

  const initials = (currentUser?.name || 'Trust Link')
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return t('nav.home', 'Dashboard');
    if (path.includes('/accounts') || path.includes('/wallets')) return t('nav.wallets', 'Accounts');
    if (path.includes('/add-money')) return t('nav.addMoney', 'Add Money');
    if (path.includes('/send')) return t('send.title', 'Send');
    if (path.includes('/receive')) return t('receive.title', 'Receive');
    if (path.includes('/transactions')) return t('nav.transactions', 'Transactions');
    if (path.includes('/cards')) return t('nav.cards', 'Cards');
    if (path.includes('/exchange')) return t('nav.exchange', 'Exchange');
    if (path.includes('/beneficiaries')) return t('beneficiaries.title', 'Beneficiaries');
    if (path.includes('/profile')) return t('nav.profile', 'Profile');
    if (path.includes('/settings')) return t('nav.settings', 'Settings');
    return 'Trust Link Bank';
  };

  return (
    <header className="lg:hidden sticky top-0 z-30 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-3 sm:px-5 py-2 sm:py-2.5 flex items-center justify-between transition-colors">
      {/* Left: User Profile & KYC Badge */}
      <div
        className="flex items-center gap-2 sm:gap-2.5 cursor-pointer select-none min-w-0 pr-1"
        onClick={() => navigate('/profile')}
        title={t('nav.profile', 'My Profile')}
      >
        <div className="relative shrink-0">
          {currentUser?.avatar_url ? (
            <img
              src={currentUser.avatar_url}
              alt="Avatar"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-[#2563EB]/30 shadow-xs"
            />
          ) : (
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center font-bold text-xs ring-2 ring-blue-100 dark:ring-blue-900">
              {initials}
            </div>
          )}
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#16A34A] border-2 border-white dark:border-[#0F172A] rounded-full" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="text-xs font-bold text-[#0F172A] dark:text-white truncate max-w-[90px] sm:max-w-[180px] md:max-w-[220px]">
              {currentUser?.first_name || currentUser?.name?.split(' ')[0] || 'Client'}
            </span>
            <span className="hidden sm:inline-block text-[9px] bg-green-50 dark:bg-green-950/60 text-[#16A34A] dark:text-emerald-400 font-extrabold px-1.5 py-0.5 rounded-full border border-green-200 dark:border-green-800/80 shrink-0">
              {t('auth.verified', 'KYC')}
            </span>
          </div>
          <div className="hidden sm:block text-[10px] text-[#64748B] dark:text-slate-400 font-mono mt-0.5 truncate max-w-[180px]">
            {currentUser?.novatag}
          </div>
        </div>
      </div>

      {/* Center on tablet: Current page title & breadcrumb */}
      <div className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
        <span className="text-[#2563EB] font-black">TLB</span>
        <span className="text-slate-300 dark:text-slate-700">/</span>
        <span className="text-[#0F172A] dark:text-white">{getPageTitle()}</span>
      </div>

      {/* Right: Actions and Controls */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Balance Privacy Toggle on Tablet */}
        <button
          onClick={toggleHideBalances}
          type="button"
          title={hideBalances ? t('common.show', 'Show') : t('common.hide', 'Hide')}
          className="hidden md:flex w-9 h-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
        >
          {hideBalances ? (
            <EyeOff className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          ) : (
            <Eye className="w-4 h-4 text-[#2563EB] dark:text-blue-400" />
          )}
        </button>

        {/* Quick Send Shortcut on Tablet */}
        <button
          onClick={() => navigate('/send')}
          className="hidden md:flex items-center gap-1.5 bg-[#2563EB] hover:bg-[#1E3A8A] text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <SendHorizontal className="w-3.5 h-3.5" />
          <span>{t('send.title', 'Send')}</span>
        </button>

        {/* EXACTLY ONE Dark/Light Mode Button */}
        <ThemeToggle variant="icon" />

        {/* Language selector on tablet and mobile */}
        <LanguageSelector />

        {/* Notifications */}
        <button
          onClick={() => navigate('/notifications')}
          title={t('notifications.title', 'Notifications')}
          aria-label="Notifications"
          className="relative w-9 h-9 min-w-[36px] flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#DC2626] rounded-full ring-2 ring-white dark:ring-[#0F172A]" />
          )}
        </button>

        {/* Menu Drawer Toggle Button */}
        <button
          onClick={toggleMobileMenu}
          type="button"
          aria-label="Menu de navigation"
          className="w-9 h-9 min-w-[36px] flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-xs active:scale-95"
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export const MobileDrawer: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    currentUser,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    theme,
    toggleTheme,
    setLanguage,
    switchRole,
    logout,
  } = useAppStore();

  // Close drawer on route change or ESC key
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname, setIsMobileMenuOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false);
    };
    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen, setIsMobileMenuOpen]);

  if (!isMobileMenuOpen) return null;

  const currencyMeta = getCurrencyMeta(currentUser?.preferred_currency || 'USD');

  const menuSections = [
    {
      title: t('dashboard.quickActions', 'Principal'),
      items: [
        { to: '/dashboard', label: t('nav.home', 'Dashboard'), icon: LayoutDashboard },
        { to: '/accounts', label: t('nav.wallets', 'Accounts & Wallets'), icon: Wallet },
        { to: '/add-money', label: t('nav.addMoney', 'Add Money'), icon: PlusCircle },
        { to: '/send', label: t('send.title', 'Send Money'), icon: SendHorizontal },
        { to: '/receive', label: t('receive.title', 'Receive'), icon: QrCode },
      ],
    },
    {
      title: t('common.details', 'Services & Finance'),
      items: [
        { to: '/transactions', label: t('nav.transactions', 'Transactions'), icon: ReceiptText },
        { to: '/cards', label: t('nav.cards', 'Virtual Cards'), icon: CreditCard },
        { to: '/exchange', label: t('nav.exchange', 'Currency Exchange'), icon: ArrowLeftRight },
        { to: '/beneficiaries', label: t('beneficiaries.title', 'Beneficiaries'), icon: Users },
      ],
    },
    {
      title: t('nav.settings', 'Compte & Préférences'),
      items: [
        { to: '/profile', label: t('nav.profile', 'My Profile'), icon: UserCheck },
        { to: '/settings', label: t('nav.settings', 'Settings'), icon: Settings },
      ],
    },
  ];

  return (
    <div className="lg:hidden fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Slide-over Drawer Panel */}
      <div className="relative w-full max-w-[85vw] sm:max-w-sm md:max-w-md bg-white dark:bg-[#0F172A] border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-full z-10 overflow-y-auto text-[#0F172A] dark:text-slate-100 transition-colors">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2563EB] flex items-center justify-center text-white font-black text-xs shadow-md shadow-blue-500/20">
              TLB
            </div>
            <div>
              <div className="font-extrabold text-sm text-[#0F172A] dark:text-white font-display">
                Trust Link Bank
              </div>
              <div className="text-[10px] text-[#64748B] dark:text-slate-400">
                Americas & Global
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close navigation menu"
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Mini Card */}
        {currentUser && (
          <div className="p-4 mx-3 my-3 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center font-bold text-xs ring-1 ring-blue-300 shrink-0">
                {(currentUser.name || 'TL').slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#0F172A] dark:text-white truncate">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-[#64748B] dark:text-slate-400 font-mono truncate">
                  {currentUser.novatag}
                </div>
                <div className="text-[10px] font-semibold text-[#2563EB] dark:text-blue-400 mt-0.5">
                  {currencyMeta.flag} {currencyMeta.label} ({currencyMeta.code})
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Theme & Language Bar inside Drawer */}
        <div className="px-4 py-2.5 mx-3 my-1 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0F172A] dark:text-white">
              {t('common.theme', 'Theme')}
            </span>
            <ThemeToggle variant="pill" />
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-200/70 dark:border-slate-800">
            <span className="text-xs font-bold text-[#0F172A] dark:text-white">
              {t('auth.language', 'Language')}
            </span>
            <LanguageSelector variant="compact" />
          </div>
        </div>

        {/* Menu Links */}
        <div className="flex-1 p-3 space-y-4">
          {menuSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.to;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-[#2563EB] text-white shadow-xs font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#0F172A] dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-600'}`} />
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Drawer Footer: Admin link (only for admins) & Sign Out */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-2 bg-slate-50/70 dark:bg-slate-900/70">
          {(currentUser?.role === 'admin' || currentUser?.role === 'super_admin') && (
            <button
              onClick={() => {
                navigate('/admin');
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/50 text-[#2563EB] dark:text-blue-400 border border-blue-200 dark:border-blue-900 hover:opacity-90 transition-opacity cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                <span>{t('dashboard.adminConsoleBtn', 'Admin Console')}</span>
              </div>
              <span className="text-[10px] uppercase font-mono">ADMIN</span>
            </button>
          )}

          {/* Logout */}
          <button
            onClick={() => {
              logout();
              navigate('/login');
              setIsMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#DC2626] hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('auth.logout', 'Sign Out')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const MobileBottomNav: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { currentUser, toggleMobileMenu, isMobileMenuOpen } = useAppStore();

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin';

  const isMoreActive =
    ['/cards', '/exchange', '/beneficiaries', '/profile', '/settings', '/add-money'].some(
      (path) => location.pathname.startsWith(path)
    ) || isMobileMenuOpen;

  interface BottomNavItem {
    to: string;
    label: string;
    icon: any;
    highlight?: boolean;
  }

  const centerItem: BottomNavItem = isAdmin
    ? { to: '/send', label: t('send.title', 'Send'), icon: SendHorizontal, highlight: true }
    : { to: '/receive', label: t('receive.title', 'Recevoir'), icon: QrCode, highlight: true };

  const items: BottomNavItem[] = [
    { to: '/dashboard', label: t('nav.home', 'Home'), icon: LayoutDashboard },
    { to: '/accounts', label: t('nav.wallets', 'Accounts'), icon: Wallet },
    centerItem,
    { to: '/transactions', label: t('nav.transactions', 'History'), icon: ReceiptText },
  ];

  return (
    <>
      <MobileDrawer />

      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 p-2 sm:p-3 pb-[calc(0.6rem+env(safe-area-inset-bottom,0px))] pointer-events-none">
        <nav className="max-w-md sm:max-w-lg md:max-w-xl mx-auto bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-2xl sm:rounded-3xl px-2 sm:px-5 py-1.5 flex items-center justify-between shadow-xl shadow-slate-900/10 dark:shadow-2xl dark:shadow-black/70 pointer-events-auto transition-colors">
          {items.map((item) => {
            const Icon = item.icon;
            if (item.highlight) {
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className="flex-1 flex flex-col items-center -mt-6 sm:-mt-7 group focus-visible:outline-none"
                  aria-label={item.label}
                >
                  <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-gradient-to-tr from-[#1E3A8A] via-[#2563EB] to-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/40 ring-4 ring-white dark:ring-[#0F172A] hover:scale-105 active:scale-95 transition-transform">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold text-[#2563EB] dark:text-blue-400 mt-1">
                    {item.label}
                  </span>
                </NavLink>
              );
            }

            return (
              <NavLink
                key={item.to}
                to={item.to}
                aria-label={item.label}
                className={({ isActive }) =>
                  `flex-1 flex flex-col items-center justify-center min-w-[50px] min-h-[46px] py-1 px-1 rounded-xl transition-all ${
                    isActive
                      ? 'text-[#2563EB] dark:text-blue-400 font-bold'
                      : 'text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className="w-5 h-5 mb-0.5" />
                    <span className="text-[10px] sm:text-[11px] font-medium leading-none">{item.label}</span>
                    <span
                      className={`w-1 h-1 rounded-full mt-1 transition-opacity ${
                        isActive ? 'bg-[#2563EB] dark:bg-blue-400 opacity-100' : 'bg-transparent opacity-0'
                      }`}
                    />
                  </>
                )}
              </NavLink>
            );
          })}

          {/* 5th Tab: Menu Drawer Toggle */}
          <button
            type="button"
            onClick={toggleMobileMenu}
            aria-label={t('common.menu', 'Menu')}
            className={`flex-1 flex flex-col items-center justify-center min-w-[50px] min-h-[46px] py-1 px-1 rounded-xl transition-all cursor-pointer ${
              isMoreActive
                ? 'text-[#2563EB] dark:text-blue-400 font-bold'
                : 'text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white'
            }`}
          >
            <Menu className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] sm:text-[11px] font-medium leading-none">{t('common.menu', 'Menu')}</span>
            <span
              className={`w-1 h-1 rounded-full mt-1 transition-opacity ${
                isMoreActive ? 'bg-[#2563EB] dark:bg-blue-400 opacity-100' : 'bg-transparent opacity-0'
              }`}
            />
          </button>
        </nav>
      </div>
    </>
  );
};

export default MobileBottomNav;
