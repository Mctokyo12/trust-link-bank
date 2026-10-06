import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/api/client';
import { KycSubmission } from '../../types';
import { formatDate } from '../../utils/formatters';

export const AdminKycPage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ['admin', 'kyc'],
    queryFn: () => adminApi.getKycSubmissions(),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, decision }: { id: string; decision: 'approved' | 'rejected' }) =>
      adminApi.reviewKyc(id, decision),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'kyc'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'kpis'] });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white font-display">
          {t('admin.kyc.title', 'KYC Identity Verification')}
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          {t('admin.kyc.subtitle', 'Regulatory compliance review of identity documents and proofs of residence.')}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">{t('common.loading', 'Loading KYC files...')}</div>
        ) : submissions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-[#0F172A] rounded-2xl border border-slate-800">
            {t('admin.kyc.emptyState', 'No KYC files pending review.')}
          </div>
        ) : (
          submissions.map((sub: KycSubmission) => (
            <div
              key={sub.id}
              className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{sub.user_name}</span>
                    <span className="text-xs text-slate-400">({sub.country})</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        sub.status === 'pending'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : sub.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {sub.status === 'pending'
                        ? t('admin.kyc.statusPending', 'PENDING')
                        : sub.status === 'approved'
                        ? t('admin.kyc.statusApproved', 'APPROVED')
                        : t('admin.kyc.statusRejected', 'REJECTED')}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 mt-1">
                    {t('admin.kyc.documentLabel', 'Document')}: <strong>{sub.document_type}</strong> — N° <span className="font-mono">{sub.document_number}</span>
                  </div>

                  <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{t('admin.kyc.submittedOn', 'Submitted on')} {formatDate(sub.submitted_at)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {sub.status === 'pending' ? (
                  <>
                    <button
                      onClick={() => reviewMutation.mutate({ id: sub.id, decision: 'approved' })}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t('admin.kyc.approveBtn', 'Approve Level 2')}</span>
                    </button>
                    <button
                      onClick={() => reviewMutation.mutate({ id: sub.id, decision: 'rejected' })}
                      className="bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/50 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>{t('admin.kyc.rejectBtn', 'Reject')}</span>
                    </button>
                  </>
                ) : (
                  <div className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                    <UserCheck className="w-4 h-4 text-teal-400" />
                    <span>{t('admin.kyc.alreadyProcessed', 'File processed')}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
