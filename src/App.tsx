import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Layouts
import { AppLayout } from './components/layout/AppLayout';
import { AdminLayout } from './components/layout/AdminLayout';

// Public Pages
import { LandingPage } from './features/landing/LandingPage';
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { OtpPage } from './features/auth/OtpPage';
import { ForgotPasswordPage } from './features/auth/ForgotPasswordPage';

// Client Area Pages
import { DashboardPage } from './features/dashboard/DashboardPage';
import { WalletsPage } from './features/wallets/WalletsPage';
import { WalletDetailPage } from './features/wallets/WalletDetailPage';
import { SendMoneyPage } from './features/transfers/SendMoneyPage';
import { ReceiveMoneyPage } from './features/transfers/ReceiveMoneyPage';
import { ExchangePage } from './features/exchange/ExchangePage';
import { TransactionsPage } from './features/transactions/TransactionsPage';
import { BeneficiariesPage } from './features/beneficiaries/BeneficiariesPage';
import { NotificationsPage } from './features/notifications/NotificationsPage';
import { ProfilePage } from './features/profile/ProfilePage';

// Admin Pages
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
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/auth/otp" element={<OtpPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />

        {/* Client Authenticated Area */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/wallets" element={<WalletsPage />} />
          <Route path="/wallets/:walletId" element={<WalletDetailPage />} />
          <Route path="/send" element={<SendMoneyPage />} />
          <Route path="/receive" element={<ReceiveMoneyPage />} />
          <Route path="/exchange" element={<ExchangePage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/beneficiaries" element={<BeneficiariesPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* Admin Back-Office Area */}
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/transactions" element={<AdminTransactionsPage />} />
          <Route path="/admin/rates" element={<AdminRatesPage />} />
          <Route path="/admin/fees" element={<AdminFeesPage />} />
          <Route path="/admin/kyc" element={<AdminKycPage />} />
          <Route path="/admin/audit" element={<AdminAuditPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </QueryClientProvider>
  );
}

export default App;
