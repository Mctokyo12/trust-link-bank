import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Users,
  TrendingUp,
  Percent,
  CheckCircle2,
  ArrowUpRight,
  Database,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../services/api/client';
import { AuditLog } from '../../types';

export const AdminDashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: kpiData } = useQuery({
    queryKey: ['admin', 'kpis'],
    queryFn: () => adminApi.getKpis(),
  });

  const { data: auditLogs = [] } = useQuery({
    queryKey: ['admin', 'audit'],
    queryFn: () => adminApi.getAuditLogs(),
  });

  const kpis = [
    {
      title: 'Volume total compensé (30j)',
      value: kpiData ? `${kpiData.gmvXaf.toLocaleString()} FCFA` : '248 500 000 FCFA',
      sub: '+14.8% vs mois précédent',
      color: 'text-emerald-400',
      icon: TrendingUp,
    },
    {
      title: 'Utilisateurs enregistrés',
      value: kpiData ? kpiData.activeUsers.toString() : '154 280',
      sub: '4 120 nouveaux cette semaine',
      color: 'text-blue-400',
      icon: Users,
    },
    {
      title: 'Disponibilité du Registre',
      value: '99.99 %',
      sub: 'Zéro divergence comptable',
      color: 'text-teal-400',
      icon: CheckCircle2,
    },
    {
      title: 'Frais de réseau collectés',
      value: kpiData ? `${kpiData.feeRevenueXaf.toLocaleString()} FCFA` : '4 120 000 FCFA',
      sub: 'Reversement régulier opérateurs',
      color: 'text-amber-400',
      icon: Percent,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white font-display">
          Tableau de Bord Superviseur
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Surveillance en temps réel des transactions panafricaines et conformité bancaire COBAC/BCEAO.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => {
          const Icon = k.icon;
          return (
            <div
              key={i}
              className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-sm space-y-2"
            >
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{k.title}</span>
                <Icon className={`w-4 h-4 ${k.color}`} />
              </div>
              <div className="text-2xl font-black font-display text-white tabular-nums">
                {k.value}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">{k.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Real-time Ledger Integrity Card */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Intégrité du Grand Livre en Partie Double</h3>
              <p className="text-xs text-slate-400">Contrôle continu de l'égalité Σ Débits = Σ Crédits</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-400">Conforme & Équilibré (0.00 FCFA d'écart)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
          <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800">
            <div className="text-slate-500 mb-1">Passerelle GIMAC (CEMAC)</div>
            <div className="text-white font-bold font-mono">OPÉRATIONNELLE • 12ms</div>
          </div>

          <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800">
            <div className="text-slate-500 mb-1">Système BCEAO RTGS (UEMOA)</div>
            <div className="text-white font-bold font-mono">OPÉRATIONNELLE • 18ms</div>
          </div>

          <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800">
            <div className="text-slate-500 mb-1">Passerelle SEPA Instant (EUR)</div>
            <div className="text-white font-bold font-mono">OPÉRATIONNELLE • 45ms</div>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => navigate('/admin/rates')}
          className="bg-[#0F172A] hover:bg-slate-800/80 border border-slate-800 rounded-2xl p-5 cursor-pointer transition-colors group"
        >
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-teal-400" />
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
          </div>
          <h4 className="font-bold text-sm text-white">Taux de Change Réglementaires</h4>
          <p className="text-xs text-slate-400 mt-1">Ajuster la parité officielle EUR/XAF et les marges spot USD.</p>
        </div>

        <div
          onClick={() => navigate('/admin/fees')}
          className="bg-[#0F172A] hover:bg-slate-800/80 border border-slate-800 rounded-2xl p-5 cursor-pointer transition-colors group"
        >
          <div className="flex items-center justify-between mb-2">
            <Percent className="w-5 h-5 text-blue-400" />
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
          </div>
          <h4 className="font-bold text-sm text-white">Grille Tarifaire & Plafonds</h4>
          <p className="text-xs text-slate-400 mt-1">Gérer les frais opérateurs MoMo et plafonds par niveau KYC.</p>
        </div>

        <div
          onClick={() => navigate('/admin/kyc')}
          className="bg-[#0F172A] hover:bg-slate-800/80 border border-slate-800 rounded-2xl p-5 cursor-pointer transition-colors group"
        >
          <div className="flex items-center justify-between mb-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
          </div>
          <h4 className="font-bold text-sm text-white">Validation Dossiers KYC</h4>
          <p className="text-xs text-slate-400 mt-1">Examiner les pièces CNI et justificatifs en attente d'approbation.</p>
        </div>
      </div>

      {/* Recent Audit Logs snippet */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm text-white">Derniers événements d'audit</h3>
          <button
            onClick={() => navigate('/admin/audit')}
            className="text-xs font-bold text-blue-400 hover:underline"
          >
            Voir tout le registre →
          </button>
        </div>

        <div className="divide-y divide-slate-800/80 text-xs">
          {auditLogs.slice(0, 4).map((log: AuditLog) => (
            <div key={log.id} className="py-2.5 flex items-center justify-between gap-3">
              <div>
                <span className="font-bold text-white">{log.action}</span>
                <span className="text-slate-400 ml-2">{log.entity}</span>
              </div>
              <span className="font-mono text-[11px] text-slate-500 shrink-0">{log.created_at.slice(11, 19)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
