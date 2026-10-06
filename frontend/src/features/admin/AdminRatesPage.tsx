import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  TrendingUp,
  Save,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { exchangeApi } from '../../services/api/client';
import { ExchangeRate } from '../../types';

export const AdminRatesPage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [editingPair, setEditingPair] = useState<string | null>(null);
  const [rateValue, setRateValue] = useState<string>('');
  const [marginValue, setMarginValue] = useState<string>('');
  const [savedNotice, setSavedNotice] = useState(false);

  const { data: rates = [], isLoading } = useQuery({
    queryKey: ['admin', 'rates'],
    queryFn: () => exchangeApi.getRates(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ pair, rate, margin }: { pair: string; rate: number; margin: number }) =>
      exchangeApi.updateRate(pair, rate, margin),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'rates'] });
      queryClient.invalidateQueries({ queryKey: ['exchange_rates'] });
      setEditingPair(null);
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
    },
  });

  const handleEdit = (r: ExchangeRate) => {
    setEditingPair(`${r.base}_${r.target}`);
    setRateValue(r.rate.toString());
    setMarginValue(r.margin_percent.toString());
  };

  const handleSave = (pair: string) => {
    const numRate = parseFloat(rateValue);
    const numMargin = parseFloat(marginValue);
    if (!isNaN(numRate) && numRate > 0) {
      updateMutation.mutate({
        pair,
        rate: numRate,
        margin: isNaN(numMargin) ? 0 : numMargin,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white font-display">
            {t('admin.rates.title', 'Exchange Rate & FX Margin Management')}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {t('admin.rates.subtitle', 'Set official parities and spot FX margins applied to client conversions.')}
          </p>
        </div>

        {savedNotice && (
          <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-3.5 py-2 rounded-xl text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{t('admin.rates.savedToast', 'Exchange rates updated in real time')}</span>
          </div>
        )}
      </div>

      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">{t('common.loading', 'Loading FX rates...')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">{t('admin.rates.colPair', 'Currency Pair')}</th>
                  <th className="p-4">{t('admin.rates.colBaseRate', 'Interbank Rate')}</th>
                  <th className="p-4">{t('admin.rates.colMargin', 'Bank Margin (%)')}</th>
                  <th className="p-4">{t('admin.rates.colEffectiveRate', 'Effective Client Rate')}</th>
                  <th className="p-4">{t('admin.rates.colUpdated', 'Last Updated')}</th>
                  <th className="p-4 text-right">{t('admin.rates.colAction', 'Action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {rates.map((r: ExchangeRate) => {
                  const pairKey = `${r.base}_${r.target}`;
                  const isEditing = editingPair === pairKey;
                  const effective = (r.rate * (1 - r.margin_percent / 100)).toFixed(4);

                  return (
                    <tr key={pairKey} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2 font-bold text-white text-sm">
                          <TrendingUp className="w-4 h-4 text-teal-400" />
                          <span>{r.base} → {r.target}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.0001"
                            value={rateValue}
                            onChange={(e) => setRateValue(e.target.value)}
                            className="w-28 px-2.5 py-1.5 bg-slate-900 border border-blue-500 rounded-lg text-white font-mono text-xs"
                          />
                        ) : (
                          <span className="font-mono font-bold text-white">1 {r.base} = {r.rate} {r.target}</span>
                        )}
                      </td>

                      <td className="p-4">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.1"
                            value={marginValue}
                            onChange={(e) => setMarginValue(e.target.value)}
                            className="w-20 px-2.5 py-1.5 bg-slate-900 border border-blue-500 rounded-lg text-white font-mono text-xs"
                          />
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono font-bold">
                            {r.margin_percent === 0 ? t('admin.rates.fixedParity', '0% (Fixed parity)') : `${r.margin_percent}%`}
                          </span>
                        )}
                      </td>

                      <td className="p-4 font-mono text-teal-400 font-bold">
                        {effective} {r.target}
                      </td>

                      <td className="p-4 text-slate-500 font-mono text-[11px]">
                        <span className="inline-flex items-center gap-1">
                          <RefreshCw className="w-3 h-3" />
                          <span>{r.updated_at.slice(11, 19)}</span>
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleSave(pairKey)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Save className="w-3.5 h-3.5" />
                              <span>{t('common.save', 'Save')}</span>
                            </button>
                            <button
                              onClick={() => setEditingPair(null)}
                              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1.5 rounded-lg text-xs cursor-pointer"
                            >
                              {t('common.cancel', 'Cancel')}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEdit(r)}
                            className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                          >
                            {t('admin.rates.adjustBtn', 'Adjust')}
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
