import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  FileText,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/api/client';
import { KycProfile, User } from '../../types';
import { formatDate } from '../../utils/formatters';

export const AdminKycPage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['admin', 'kyc'],
    queryFn: () => adminApi.getKycProfiles(),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ kycId, status, level }: { kycId: string; status: KycProfile['status']; level: 1 | 2 | 3 }) =>
      adminApi.updateKycStatus(kycId, status, level),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'kyc'] });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white font-display">
          Vérification et Conformité KYC
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Validation des pièces d'identité et justificatifs de domicile pour l'élévation des plafonds.
        </p>
      </div>

      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Dossiers d'Agrément Déposés</h3>
              <p className="text-xs text-slate-400">Contrôle de conformité COBAC & Réglementation LAB/FT</p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">Chargement des dossiers KYC...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Titulaire</th>
                  <th className="p-4">Type de Document</th>
                  <th className="p-4">Niveau Sollicité</th>
                  <th className="p-4">Statut</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {profiles.map((profile: KycProfile & { user?: User }) => (
                  <tr key={profile.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-bold text-white">
                      {profile.user ? profile.user.name : profile.user_id}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-400" />
                        <span className="font-semibold text-slate-200">
                          {profile.document_type || "Pièce d'identité Nationale"}
                        </span>
                      </div>
                    </td>

                    <td className="p-4 text-slate-400 font-bold">
                      Niveau {profile.level}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          profile.status === 'verified'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : profile.status === 'rejected'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {profile.status === 'verified' ? 'VALIDÉ' : profile.status === 'rejected' ? 'REJETÉ' : 'EN ATTENTE'}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      {profile.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() =>
                              reviewMutation.mutate({ kycId: profile.id, status: 'verified', level: 2 })
                            }
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approuver</span>
                          </button>
                          <button
                            onClick={() =>
                              reviewMutation.mutate({ kycId: profile.id, status: 'rejected', level: profile.level })
                            }
                            className="bg-rose-950/60 hover:bg-rose-900 text-rose-300 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Rejeter</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-semibold">Traité</span>
                      )}
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
