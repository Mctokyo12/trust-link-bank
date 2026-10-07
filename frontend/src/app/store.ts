import { create } from 'zustand';
import { User, Wallet } from '../types';
import { authApi, walletsApi, notificationsApi, profileApi } from '../services/api/client';
import { initCloudDatabase, subscribeToCloudDatabase } from '../services/api/mockData';
import i18n from '../i18n';

const getInitialTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  const saved = localStorage.getItem('novapay_theme') as 'light' | 'dark' | null;
  if (saved === 'light' || saved === 'dark') {
    return saved;
  }
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyTheme = (theme: 'light' | 'dark') => {
  if (typeof document === 'undefined') return;
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  localStorage.setItem('novapay_theme', theme);
};

// Initialize theme immediately
const initialTheme = getInitialTheme();
applyTheme(initialTheme);

interface AppState {
  currentUser: User | null;
  wallets: Wallet[];
  hideBalances: boolean;
  selectedWalletId: string | null;
  unreadNotificationsCount: number;
  isLoadingUser: boolean;
  theme: 'light' | 'dark';
  isMobileMenuOpen: boolean;

  // Actions
  initApp: () => Promise<void>;
  toggleHideBalances: () => void;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setIsMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
  setSelectedWalletId: (id: string | null) => void;
  updateProfile: (data: Partial<User>) => Promise<User>;
  switchRole: (role: 'client' | 'admin') => Promise<void>;
  logout: () => void;
  refreshWallets: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  refreshCurrentUser: () => Promise<void>;
  setLanguage: (lang: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: null,
  wallets: [],
  hideBalances: localStorage.getItem('novapay_hide_balances') === 'true',
  selectedWalletId: null,
  unreadNotificationsCount: 0,
  isLoadingUser: true,
  theme: initialTheme,
  isMobileMenuOpen: false,

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    set({ theme: next });
  },

  setTheme: (theme: 'light' | 'dark') => {
    applyTheme(theme);
    set({ theme });
  },

  setIsMobileMenuOpen: (open: boolean) => {
    set({ isMobileMenuOpen: open });
  },

  toggleMobileMenu: () => {
    set({ isMobileMenuOpen: !get().isMobileMenuOpen });
  },

  initApp: async () => {
    try {
      set({ isLoadingUser: true });
      await initCloudDatabase();
      const user = await authApi.getCurrentUser();
      if (!user) {
        set({
          currentUser: null,
          wallets: [],
          selectedWalletId: null,
          unreadNotificationsCount: 0,
          isLoadingUser: false,
        });
        return;
      }

      // Synchronize language with localStorage and user profile
      const savedLang = localStorage.getItem('novapay_lang');
      if (savedLang) {
        if (i18n.language !== savedLang) {
          i18n.changeLanguage(savedLang);
        }
        if (user.language !== savedLang) {
          user.language = savedLang;
          profileApi.updateProfile(user.id, { language: savedLang }).catch(() => {});
        }
      } else if (user.language) {
        localStorage.setItem('novapay_lang', user.language);
        i18n.changeLanguage(user.language);
      }

      const wallets = await walletsApi.getWallets(user.id);
      const notifications = await notificationsApi.getNotifications(user.id);
      const unreadCount = notifications.filter((n) => !n.read_at).length;

      set({
        currentUser: user,
        wallets,
        selectedWalletId: wallets[0]?.id || null,
        unreadNotificationsCount: unreadCount,
        isLoadingUser: false,
      });
    } catch {
      set({ currentUser: null, wallets: [], isLoadingUser: false });
    }
  },

  toggleHideBalances: () => {
    const next = !get().hideBalances;
    localStorage.setItem('novapay_hide_balances', String(next));
    set({ hideBalances: next });
  },

  setSelectedWalletId: (id: string | null) => {
    set({ selectedWalletId: id });
  },

  updateProfile: async (data: Partial<User>) => {
    const current = get().currentUser;
    if (!current) throw new Error('No user logged in');
    const updated = await profileApi.updateProfile(current.id, data);
    set({ currentUser: updated });
    if (data.language) {
      i18n.changeLanguage(data.language);
    }
    return updated;
  },

  refreshCurrentUser: async () => {
    const current = get().currentUser;
    if (!current) return;
    const user = await authApi.getCurrentUser();
    set({ currentUser: user });
  },

  switchRole: async (role: 'client' | 'admin') => {
    const user = await authApi.switchUserRole(role);
    const wallets = await walletsApi.getWallets(user.id);
    const notifications = await notificationsApi.getNotifications(user.id);
    const unreadCount = notifications.filter((n) => !n.read_at).length;

    set({
      currentUser: user,
      wallets,
      selectedWalletId: wallets[0]?.id || null,
      unreadNotificationsCount: unreadCount,
    });
  },

  logout: () => {
    localStorage.removeItem('novapay_current_user_id');
    set({ currentUser: null, wallets: [] });
  },

  refreshWallets: async () => {
    const user = get().currentUser;
    if (!user) return;
    const wallets = await walletsApi.getWallets(user.id);
    set({ wallets });
  },

  refreshNotifications: async () => {
    const user = get().currentUser;
    if (!user) return;
    const notifications = await notificationsApi.getNotifications(user.id);
    const unreadCount = notifications.filter((n) => !n.read_at).length;
    set({ unreadNotificationsCount: unreadCount });
  },

  setLanguage: (lang: string) => {
    localStorage.setItem('novapay_lang', lang);
    i18n.changeLanguage(lang);
    const user = get().currentUser;
    if (user && user.language !== lang) {
      const updatedUser = { ...user, language: lang };
      set({ currentUser: updatedUser });
      profileApi.updateProfile(user.id, { language: lang }).catch(() => {});
    }
  },
}));

// Real-time cloud synchronization listener: refresh active user's wallets and notifications whenever Firestore updates
subscribeToCloudDatabase(async () => {
  const state = useAppStore.getState();
  if (state.currentUser) {
    const updatedUser = await authApi.getCurrentUser();
    const wallets = await walletsApi.getWallets(state.currentUser.id);
    const notifications = await notificationsApi.getNotifications(state.currentUser.id);
    const unreadCount = notifications.filter((n) => !n.read_at).length;
    useAppStore.setState({
      currentUser: updatedUser || state.currentUser,
      wallets,
      unreadNotificationsCount: unreadCount,
    });
  }
});
