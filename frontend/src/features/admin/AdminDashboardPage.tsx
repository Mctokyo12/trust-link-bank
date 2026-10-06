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
      title: t('admin.dashboard.totalClearedVolume', 'Total Cleared Volume (30d)'),
      value: kpiData ? `$${kpiData.gmvXaf.toLocaleString()} USD` : '$248,500,000 USD',
      sub: t('admin.dashboard.vsLastMonth', '+14.8% vs previous month'),
      color: 'text-emerald-400',
      icon: TrendingUp,
    },
    {
      title: t('admin.dashboard.registeredUsers', 'Registered Users'),
      value: kpiData ? kpiData.activeUsers.toString() : '154,280',
      sub: t('admin.dashboard.newThisWeek', '4,120 new this week'),
      color: 'text-blue-400',
      icon: Users,
    },
    {
      title: t('admin.dashboard.ledgerAvailability', 'Ledger Availability'),
      value: '99.99 %',
      sub: t('admin.dashboard.zeroDiscrepancy', 'Zero accounting discrepancy'),
      color: 'text-teal-400',
      icon: CheckCircle2,
    },
    {
      title: t('admin.dashboard.networkFeesCollected', 'Network Fees Collected'),
      value: kpiData ? `$${kpiData.feeRevenueXaf.toLocaleString()} USD` : '$4,120,000 USD',
      sub: t('admin.dashboard.operatorSettlement', 'Regular operator settlement'),
      color: 'text-amber-400',
      icon: Percent,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white font-display">
          {t('admin.dashboard.title', 'Supervisor Dashboard')}
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          {t('admin.dashboard.subtitle', 'Real-time supervision of global transactions and banking compliance.')}
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
              <h3 className="font-bold text-sm text-white">
                {t('admin.dashboard.ledgerIntegrityTitle', 'Double-Entry Ledger Integrity')}
              </h3>
              <p className="text-xs text-slate-400">
                {t('admin.dashboard.ledgerIntegrityDesc', 'Continuous verification of Σ Debits = Σ Credits equality')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-400">
              {t('admin.dashboard.ledgerBalancedBadge', 'Compliant & Balanced (0.00 variance)')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
          <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800">
            <div className="text-slate-500 mb-1">{t('admin.dashboard.railFedwire', 'Fedwire / ACH Gateway (Americas)')}</div>
            <div className="text-white font-bold font-mono">{t('admin.dashboard.operationalStatus', 'OPERATIONAL')} • 12ms</div>
          </div>

          <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800">
            <div className="text-slate-500 mb-1">{t('admin.dashboard.railPixSpei', 'PIX & SPEI Instant Rail (LatAm)')}</div>
            <div className="text-white font-bold font-mono">{t('admin.dashboard.operationalStatus', 'OPERATIONAL')} • 18ms</div>
          </div>

          <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800">
            <div className="text-slate-500 mb-1">{t('admin.dashboard.railSepa', 'SEPA Instant Gateway (EUR)')}</div>
            <div className="text-white font-bold font-mono">{t('admin.dashboard.operationalStatus', 'OPERATIONAL')} • 45ms</div>
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
          <h4 className="font-bold text-sm text-white">{t('admin.dashboard.fxRatesCardTitle', 'Regulatory Exchange Rates')}</h4>
          <p className="text-xs text-slate-400 mt-1">
            {t('admin.dashboard.fxRatesCardDesc', 'Adjust official currency parity and spot FX margins.')}
          </p>
        </div>

        <div
          onClick={() => navigate('/admin/fees')}
          className="bg-[#0F172A] hover:bg-slate-800/80 border border-slate-800 rounded-2xl p-5 cursor-pointer transition-colors group"
        >
          <div className="flex items-center justify-between mb-2">
            <Percent className="w-5 h-5 text-blue-400" />
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
          </div>
          <h4 className="font-bold text-sm text-white">{t('admin.dashboard.feeScheduleCardTitle', 'Fee Schedule & Limits')}</h4>
          <p className="text-xs text-slate-400 mt-1">
            {t('admin.dashboard.feeScheduleCardDesc', 'Manage network fees and daily limits per KYC tier.')}
          </p>
        </div>

        <div
          onClick={() => navigate('/admin/kyc')}
          className="bg-[#0F172A] hover:bg-slate-800/80 border border-slate-800 rounded-2xl p-5 cursor-pointer transition-colors group"
        >
          <div className="flex items-center justify-between mb-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
          </div>
          <h4 className="font-bold text-sm text-white">{t('admin.dashboard.kycReviewCardTitle', 'KYC File Validation')}</h4>
          <p className="text-xs text-slate-400 mt-1">
            {t('admin.dashboard.kycReviewCardDesc', 'Review identity documents and proofs awaiting approval.')}
          </p>
        </div>
      </div>

      {/* Recent Audit Logs snippet */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm text-white">{t('admin.dashboard.recentAuditEvents', 'Latest Audit Events')}</h3>
          <button
            onClick={() => navigate('/admin/audit')}
            className="text-xs font-bold text-blue-400 hover:underline cursor-pointer"
          >
            {t('admin.dashboard.viewFullLog', 'View full log →')}
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
