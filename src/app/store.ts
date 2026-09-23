import { create } from 'zustand';
import { User, Wallet } from '../types';
import { authApi, walletsApi, notificationsApi } from '../services/api/client';
import i18n from '../i18n';

interface AppState {
  currentUser: User | null;
  wallets: Wallet[];
  hideBalances: boolean;
  selectedWalletId: string | null;
  unreadNotificationsCount: number;
  isLoadingUser: boolean;

  // Actions
  initApp: () => Promise<void>;
  toggleHideBalances: () => void;
  setSelectedWalletId: (id: string | null) => void;
  switchRole: (role: 'client' | 'admin') => Promise<void>;
  logout: () => void;
  refreshWallets: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  setLanguage: (lang: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: null,
  wallets: [],
  hideBalances: localStorage.getItem('novapay_hide_balances') === 'true',
  selectedWalletId: null,
  unreadNotificationsCount: 0,
  isLoadingUser: true,

  initApp: async () => {
    try {
      set({ isLoadingUser: true });
      const user = await authApi.getCurrentUser();
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
      set({ isLoadingUser: false });
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
    i18n.changeLanguage(lang);
  },
}));
