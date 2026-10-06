import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Layout
import { AppLayout } from './components/layout/AppLayout';

// Public Pages (Section 18)
import { LandingPage } from './features/landing/LandingPage';
import { AboutPage } from './features/landing/AboutPage';
import { FeaturesPage } from './features/landing/FeaturesPage';
import { SecurityPage } from './features/landing/SecurityPage';
import { LoginPage } from './features/auth/LoginPage';
import { AdminLoginPage } from './features/auth/AdminLoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { ForgotPasswordPage } from './features/auth/ForgotPasswordPage';
import { OtpPage } from './features/auth/OtpPage';

// App Pages (Section 18)
import { DashboardPage } from './features/dashboard/DashboardPage';
import { WalletsPage } from './features/wallets/WalletsPage';
import { WalletDetailPage } from './features/wallets/WalletDetailPage';
import { AddMoneyPage } from './features/wallets/AddMoneyPage';
import { SendMoneyPage } from './features/transfers/SendMoneyPage';
import { ReceiveMoneyPage } from './features/transfers/ReceiveMoneyPage';
import { TransactionsPage } from './features/transactions/TransactionsPage';
import { CardsPage } from './features/cards/CardsPage';
import { ExchangePage } from './features/exchange/ExchangePage';
import { ProfilePage } from './features/profile/ProfilePage';
import { SettingsPage } from './features/settings/SettingsPage';
import { BeneficiariesPage } from './features/beneficiaries/BeneficiariesPage';
import { NotificationsPage } from './features/notifications/NotificationsPage';

// Admin Pages
import { AdminLayout } from './components/layout/AdminLayout';
import { AdminDashboardPage } from './features/admin/AdminDashboardPage';
import { AdminUsersPage } from './features/admin/AdminUsersPage';
import { AdminTransactionsPage } from './features/admin/AdminTransactionsPage';
import { AdminRatesPage } from './features/admin/AdminRatesPage';
import { AdminFeesPage } from './features/admin/AdminFeesPage';
import { AdminKycPage } from './features/admin/AdminKycPage';
import { AdminAuditPage } from './features/admin/AdminAuditPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 30, // 30 seconds
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        {/* Public Routes (Section 18) */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/security" element={<SecurityPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin-login" element={<Navigate to="/admin/login" replace />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/otp" element={<Navigate to="/dashboard" replace />} />

        {/* Backward Compatibility Aliases for Auth */}
        <Route path="/auth/login" element={<Navigate to="/login" replace />} />
        <Route path="/auth/register" element={<Navigate to="/register" replace />} />
        <Route path="/auth/forgot-password" element={<Navigate to="/forgot-password" replace />} />

        {/* Client Authenticated Area (Section 18) */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/accounts" element={<WalletsPage />} />
          <Route path="/wallets" element={<Navigate to="/accounts" replace />} />
          <Route path="/wallets/:walletId" element={<WalletDetailPage />} />
          <Route path="/add-money" element={<AddMoneyPage />} />
          <Route path="/send" element={<SendMoneyPage />} />
          <Route path="/receive" element={<ReceiveMoneyPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/cards" element={<CardsPage />} />
          <Route path="/exchange" element={<ExchangePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/beneficiaries" element={<BeneficiariesPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>

        {/* Admin Supervision & Management Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="transactions" element={<AdminTransactionsPage />} />
          <Route path="rates" element={<AdminRatesPage />} />
          <Route path="fees" element={<AdminFeesPage />} />
          <Route path="kyc" element={<AdminKycPage />} />
          <Route path="audit" element={<AdminAuditPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </QueryClientProvider>
  );
}

export default App;
