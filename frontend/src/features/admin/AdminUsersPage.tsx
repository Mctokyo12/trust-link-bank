import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  ShieldCheck,
  SendHorizontal,
  CheckCircle2,
  X,
  AlertCircle,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/api/client';
import { User, CurrencyCode } from '../../types';
import { SUPPORTED_CURRENCIES } from '../../utils/currencies';
import { useAppStore } from '../../app/store';

export const AdminUsersPage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { refreshWallets } = useAppStore();
  const [search, setSearch] = useState('');

  // Modal State for Admin sending funds
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [amount, setAmount] = useState<number>(250);
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [reason, setReason] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => adminApi.getUsers(),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (userId: string) => adminApi.toggleUserStatus(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });

  const sendMoneyMutation = useMutation({
    mutationFn: async () => {
      if (!targetUser) throw new Error(t('admin.users.noTargetError', 'No target user selected'));
      if (amount <= 0) throw new Error(t('admin.users.amountPositiveError', 'Amount must be greater than 0'));
      return adminApi.sendMoneyToUser({
        recipientUserId: targetUser.id,
        amount,
        currency,
        reason: reason || t('admin.users.defaultReason', 'Administrative credit transfer'),
      });
    },
    onSuccess: async (tx) => {
      setSuccessMsg(
        t('admin.users.transferSuccessBanner', {
          amount: tx.amount,
          currency: tx.currency,
          name: targetUser?.name,
          ref: tx.reference,
          defaultValue: `Transfer of ${tx.amount} ${tx.currency} sent to ${targetUser?.name}! (Ref: ${tx.reference})`,
        })
      );
      setErrorMsg('');
      await refreshWallets();
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'kpis'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setTimeout(() => {
        setTargetUser(null);
        setSuccessMsg('');
      }, 2000);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || t('admin.users.transferError', 'Error while sending transfer'));
    },
  });

  const handleOpenSendModal = (u: User) => {
    setTargetUser(u);
    setCurrency(u.preferred_currency || 'USD');
    setAmount(250);
    setReason(`${t('admin.users.defaultReasonPrefix', 'Administrative allocation for')} ${u.name}`);
    setSuccessMsg('');
    setErrorMsg('');
  };

  const filtered = users.filter((u: User) => {
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.phone.toLowerCase().includes(q) ||
      u.novatag.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white font-display">
            {t('admin.users.title', 'User Management & Fund Distribution')}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {t('admin.users.subtitle', 'Monitor account holders, security statuses, and issue administrative transfers.')}
          </p>
        </div>

        <div className="w-full sm:w-72 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('admin.users.searchPlaceholder', 'Filter by name, email, phone...')}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 text-xs text-white placeholder-slate-500 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">{t('common.loading', 'Loading users...')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">{t('admin.users.colUser', 'User')}</th>
                  <th className="p-4">{t('admin.users.colContact', 'Contact')}</th>
                  <th className="p-4">{t('admin.users.colCountry', 'Country')}</th>
                  <th className="p-4">{t('admin.users.colRole', 'Role')}</th>
                  <th className="p-4">{t('admin.users.colCompliance', 'Compliance')}</th>
                  <th className="p-4">{t('admin.users.colStatus', 'Status')}</th>
                  <th className="p-4 text-right">{t('admin.users.colAdminActions', 'Admin Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filtered.map((u: User) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center font-bold text-xs ring-1 ring-blue-500/40 shrink-0">
                          {(u.name || 'TL').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm">{u.name}</div>
                          <div className="font-mono text-[11px] text-slate-400">{u.novatag}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-mono text-slate-300">{u.phone}</div>
                      <div className="text-slate-500 text-[11px]">{u.email}</div>
                    </td>

                    <td className="p-4">
                      <span className="mr-1.5">{u.flag}</span>
                      <span>{u.country}</span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.role === 'super_admin' || u.role === 'admin'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {u.role.toUpperCase()}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{t('admin.users.kycLevel', 'Level')} {u.role === 'super_admin' ? 3 : 2}</span>
                      </span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {u.status === 'active' ? t('admin.users.statusActive', 'ACTIVE') : t('admin.users.statusSuspended', 'SUSPENDED')}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Send Money Button (Admin exclusive action) */}
                        <button
                          onClick={() => handleOpenSendModal(u)}
                          className="flex items-center gap-1.5 bg-[#2563EB] hover:bg-[#1E3A8A] text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                          title={t('admin.users.sendMoneyBtn', 'Send Money')}
                        >
                          <SendHorizontal className="w-3.5 h-3.5" />
                          <span>{t('admin.users.sendBtnShort', 'Send')}</span>
                        </button>

                        {u.role !== 'super_admin' && u.role !== 'admin' && (
                          <button
                            onClick={() => toggleStatusMutation.mutate(u.id)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                              u.status === 'active'
                                ? 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40'
                                : 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/40'
                            }`}
                          >
                            {u.status === 'active' ? t('admin.users.suspendBtn', 'Suspend') : t('admin.users.activateBtn', 'Reactivate')}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Admin Transfer Modal */}
      {targetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#0F172A] border border-slate-700 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                  <SendHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base font-display">{t('admin.users.modalTitle', 'Administrative Transfer')}</h3>
                  <p className="text-[11px] text-slate-400">{t('admin.users.modalSubtitle', 'Issue funds from the TLB Director account')}</p>
                </div>
              </div>
              <button
                onClick={() => setTargetUser(null)}
                className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Recipient Details Card */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  {t('admin.users.beneficiaryLabel', 'Beneficiary')}
                </span>
                <div className="font-bold text-sm text-white">{targetUser.name}</div>
                <div className="text-[11px] font-mono text-blue-400">{targetUser.novatag} • {targetUser.email}</div>
              </div>
              <span className="text-xl">{targetUser.flag}</span>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Amount & Currency */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t('admin.users.amountToCredit', 'Amount to Transfer')}
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={amount || ''}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    placeholder="250.00"
                    className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-base font-bold text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                    className="px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    {SUPPORTED_CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t('admin.users.transferReasonLabel', 'Transfer Reason')}
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={t('admin.users.defaultReason', 'Administrative allocation, bonus, settlement...')}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTargetUser(null)}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="button"
                  disabled={sendMoneyMutation.isPending || amount <= 0}
                  onClick={() => sendMoneyMutation.mutate()}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-[#2563EB] hover:bg-[#1E3A8A] text-white shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {sendMoneyMutation.isPending ? (
                    <span>{t('admin.users.sendingBtn', 'Sending...')}</span>
                  ) : (
                    <>
                      <SendHorizontal className="w-3.5 h-3.5" />
                      <span>{t('admin.users.confirmSendBtn', 'Confirm Transfer')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
