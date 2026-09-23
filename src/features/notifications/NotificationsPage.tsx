import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bell,
  CheckCheck,
  ShieldAlert,
  ArrowDownLeft,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '../../app/store';
import { notificationsApi } from '../../services/api/client';
import { formatDate } from '../../utils/formatters';
import { NotificationItem } from '../../types';

export const NotificationsPage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { currentUser, refreshNotifications } = useAppStore();
  const [filter, setFilter] = useState<'all' | 'transactions' | 'security'>('all');

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', currentUser?.id],
    queryFn: () => notificationsApi.getNotifications(currentUser?.id),
    enabled: !!currentUser,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      refreshNotifications();
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(currentUser?.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      refreshNotifications();
    },
  });

  const filtered = notifications.filter((n: NotificationItem) => {
    if (filter === 'transactions') return n.type === 'transaction';
    if (filter === 'security') return n.type === 'security';
    return true;
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight font-display">
            {t('notifications.title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {t('notifications.subtitle')}
          </p>
        </div>

        <button
          onClick={() => markAllReadMutation.mutate()}
          className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
        >
          <CheckCheck className="w-4 h-4 text-[#14B8A6]" />
          <span>{t('notifications.markAllRead')}</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl gap-1 w-fit">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            filter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Toutes
        </button>
        <button
          onClick={() => setFilter('transactions')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            filter === 'transactions' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Transactions
        </button>
        <button
          onClick={() => setFilter('security')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            filter === 'security' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Sécurité & Système
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm divide-y divide-slate-100">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            {t('notifications.noNotifications')}
          </div>
        ) : (
          filtered.map((n: NotificationItem) => {
            const isSecurity = n.type === 'security';
            const isUnread = !n.read_at;

            return (
              <div
                key={n.id}
                onClick={() => markReadMutation.mutate(n.id)}
                className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors cursor-pointer ${
                  isUnread ? 'bg-teal-50/25 hover:bg-teal-50/40' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      isSecurity
                        ? 'bg-rose-50 text-rose-600'
                        : 'bg-teal-50 text-[#14B8A6]'
                    }`}
                  >
                    {isSecurity ? (
                      <ShieldAlert className="w-5 h-5" />
                    ) : (
                      <ArrowDownLeft className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-[#0F172A]">{n.title}</h4>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-[#14B8A6]" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{n.body}</p>
                    <span className="text-[11px] text-slate-400 mt-1.5 block">
                      {formatDate(n.created_at)}
                    </span>
                  </div>
                </div>

                {isUnread && (
                  <span className="text-[10px] bg-[#14B8A6]/10 text-[#0D9488] font-bold px-2 py-0.5 rounded-full shrink-0">
                    Nouveau
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
