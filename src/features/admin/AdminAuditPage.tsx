import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  Search,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../services/api/client';
import { formatDate } from '../../utils/formatters';
import { AuditLog } from '../../types';

export const AdminAuditPage: React.FC = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['admin', 'audit'],
    queryFn: () => adminApi.getAuditLogs(),
  });

  const filtered = logs.filter((l: AuditLog) => {
    const q = search.toLowerCase();
    const metaStr = l.metadata ? JSON.stringify(l.metadata).toLowerCase() : '';
    return (
      l.action.toLowerCase().includes(q) ||
      l.actor_name.toLowerCase().includes(q) ||
      l.entity.toLowerCase().includes(q) ||
      metaStr.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white font-display">
            Journal d'Audit Immuable
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Piste d'audit inaltérable des opérations sensibles, archivée selon les normes COBAC R-2019.
          </p>
        </div>

        <div className="w-full sm:w-72 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrer l'audit..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 text-xs text-white placeholder-slate-500 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">Chargement de la piste d'audit...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Horodatage Certifié</th>
                  <th className="p-4">Opérateur / Acteur</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Entité & Métadonnées</th>
                  <th className="p-4 text-right">Intégrité</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filtered.map((log: AuditLog) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono text-slate-400 whitespace-nowrap">
                      {formatDate(log.created_at)}
                    </td>

                    <td className="p-4 font-semibold text-white">
                      {log.actor_name}
                    </td>

                    <td className="p-4">
                      <span className="font-bold text-blue-400 font-mono text-[11px] bg-blue-950/40 border border-blue-800/30 px-2 py-0.5 rounded">
                        {log.action}
                      </span>
                    </td>

                    <td className="p-4 text-slate-300">
                      <span className="font-semibold text-slate-100">{log.entity}</span>
                      {log.metadata && (
                        <span className="text-[11px] text-slate-400 ml-2 font-mono">
                          {JSON.stringify(log.metadata)}
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                        <Lock className="w-3 h-3" />
                        <span>SHA-256</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 flex items-start gap-3.5 text-xs text-slate-400">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-white mb-0.5">Conservation Légale & Piste d'Audit</div>
          <p className="leading-relaxed">
            Conformément à la directive R-2019/02 de la Commission Bancaire de l'Afrique Centrale et aux normes de la BCEAO, l'ensemble des événements du journal d'audit est conservé pendant 10 ans sur un stockage en écriture unique (WORM) non altérable.
          </p>
        </div>
      </div>
    </div>
  );
};
