import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Percent,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/api/client';
import { FeeRule } from '../../types';

export const AdminFeesPage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [percentVal, setPercentVal] = useState('');
  const [fixedVal, setFixedVal] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ['admin', 'fees'],
    queryFn: () => adminApi.getFeeRules(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, percent_fee, fixed_fee }: { id: string; percent_fee: number; fixed_fee: number }) =>
      adminApi.updateFeeRule(id, { percent_fee, fixed_fee }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'fees'] });
      setEditingId(null);
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
    },
  });

  const handleEdit = (rule: FeeRule) => {
    setEditingId(rule.id);
    setPercentVal(rule.percent_fee.toString());
    setFixedVal(rule.fixed_fee.toString());
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white font-display">
            {t('admin.fees.title', 'Fee Schedule & Transaction Limits')}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {t('admin.fees.subtitle', 'Set commissions per operation channel and regulatory limits.')}
          </p>
        </div>

        {savedNotice && (
          <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-3.5 py-2 rounded-xl text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{t('admin.fees.savedToast', 'Fee schedule updated')}</span>
          </div>
        )}
      </div>

      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">{t('common.loading', 'Loading fee schedule...')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">{t('admin.fees.colName', 'Operation Name')}</th>
                  <th className="p-4">{t('admin.fees.colChannel', 'Channel')}</th>
                  <th className="p-4">{t('admin.fees.colVariableFee', 'Variable Fee (%)')}</th>
                  <th className="p-4">{t('admin.fees.colFixedFee', 'Fixed Fee')}</th>
                  <th className="p-4">{t('admin.fees.colMinMax', 'Min / Max Fee')}</th>
                  <th className="p-4 text-right">{t('admin.fees.colAction', 'Action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {rules.map((r: FeeRule) => {
                  const isEditing = editingId === r.id;
                  return (
                    <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-bold text-white text-sm flex items-center gap-2">
                        <Percent className="w-4 h-4 text-blue-400" />
                        <span>{r.name}</span>
                      </td>

                      <td className="p-4 font-mono text-[11px] text-slate-400">
                        {r.operation_type}
                      </td>

                      <td className="p-4">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.1"
                            value={percentVal}
                            onChange={(e) => setPercentVal(e.target.value)}
                            className="w-20 px-2 py-1 bg-slate-900 border border-blue-500 rounded text-white font-mono text-xs"
                          />
                        ) : (
                          <span className="font-mono font-bold text-teal-400">{r.percent_fee}%</span>
                        )}
                      </td>

                      <td className="p-4">
                        {isEditing ? (
                          <input
                            type="number"
                            value={fixedVal}
                            onChange={(e) => setFixedVal(e.target.value)}
                            className="w-24 px-2 py-1 bg-slate-900 border border-blue-500 rounded text-white font-mono text-xs"
                          />
                        ) : (
                          <span className="font-mono text-white">{r.fixed_fee} {r.currency}</span>
                        )}
                      </td>

                      <td className="p-4 font-mono text-slate-400 text-[11px]">
                        {r.min_fee} — {r.max_fee} {r.currency}
                      </td>

                      <td className="p-4 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() =>
                                updateMutation.mutate({
                                  id: r.id,
                                  percent_fee: parseFloat(percentVal) || 0,
                                  fixed_fee: parseFloat(fixedVal) || 0,
                                })
                              }
                              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Save className="w-3.5 h-3.5" />
                              <span>{t('common.save', 'Save')}</span>
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1.5 rounded-lg text-xs cursor-pointer"
                            >
                              {t('common.cancel', 'Cancel')}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEdit(r)}
                            className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                          >
                            {t('admin.fees.editBtn', 'Edit')}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
