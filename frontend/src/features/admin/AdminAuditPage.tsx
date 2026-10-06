import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../services/api/client';
import { AuditLog } from '../../types';
import { formatDate } from '../../utils/formatters';

export const AdminAuditPage: React.FC = () => {
  const { t } = useTranslation();

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['admin', 'audit'],
    queryFn: () => adminApi.getAuditLogs(),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white font-display">
            {t('admin.audit.title', 'Immutable Security & Audit Log')}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {t('admin.audit.subtitle', 'Cryptographic traceability of administrative and accounting operations.')}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>{t('admin.audit.sha256Verified', 'SHA-256 Signature Verified')}</span>
        </div>
      </div>

      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">{t('common.loading', 'Loading audit logs...')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">{t('admin.audit.colTimestamp', 'Timestamp')}</th>
                  <th className="p-4">{t('admin.audit.colActor', 'Actor')}</th>
                  <th className="p-4">{t('admin.audit.colAction', 'Action')}</th>
                  <th className="p-4">{t('admin.audit.colTargetEntity', 'Target Entity')}</th>
                  <th className="p-4">{t('admin.audit.colSourceIp', 'Source IP')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {logs.map((log: AuditLog) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="p-4 font-bold text-white">
                      {log.actor_name}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono text-[11px] font-bold">
                        <FileText className="w-3 h-3" />
                        <span>{log.action}</span>
                      </span>
                    </td>
                    <td className="p-4 font-mono text-slate-300">
                      {log.entity}
                    </td>
                    <td className="p-4 font-mono text-slate-500 text-[11px]">
                      {log.ip_address}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
