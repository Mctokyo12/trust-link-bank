import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  TrendingUp,
  ShieldCheck,
  Edit2,
  Check,
  Lock,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { exchangeApi } from '../../services/api/client';
import { ExchangeRate } from '../../types';

export const AdminRatesPage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [newRateValue, setNewRateValue] = useState<number>(0);

  const { data: rates = [], isLoading } = useQuery({
    queryKey: ['admin', 'rates'],
    queryFn: () => exchangeApi.getRates(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, rate }: { id: string; rate: number }) =>
      exchangeApi.updateRate(id, rate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'rates'] });
      setEditingId(null);
    },
  });

  const handleStartEdit = (r: ExchangeRate) => {
    setEditingId(r.id);
    setNewRateValue(r.rate);
  };

  const handleSaveRate = (id: string) => {
    updateMutation.mutate({ id, rate: Number(newRateValue) });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white font-display">
          Taux de Change Réglementaires
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Cotations interbancaires en direct et parité fixe officielle zone Franc BEAC/BCEAO.
        </p>
      </div>

      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Matrice des Cotations Actives</h3>
            <p className="text-xs text-slate-400">Taux appliqués instantanément sur le moteur de swap client</p>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">Chargement des taux...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {rates.map((r: ExchangeRate) => {
              const pairName = `${r.base_currency} / ${r.quote_currency}`;
              const isFixed = pairName.includes('EUR') && pairName.includes('XAF');
              const isEditing = editingId === r.id;

              return (
                <div
                  key={r.id}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sm text-white">{pairName}</span>
                    {isFixed ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                        <Lock className="w-3 h-3" />
                        <span>Fixe BEAC</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-blue-400 bg-blue-950/40 border border-blue-800/40 px-2 py-0.5 rounded-full">
                        Spot Marché
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="text-xs text-slate-400 mb-1">Taux en vigueur :</div>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.0001"
                          value={newRateValue}
                          onChange={(e) => setNewRateValue(Number(e.target.value))}
                          className="w-full bg-slate-950 border border-blue-500 text-white font-mono px-3 py-1.5 rounded-lg text-lg font-bold"
                        />
                        <button
                          onClick={() => handleSaveRate(r.id)}
                          className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-2xl font-black font-mono text-white tabular-nums">
                        {r.rate}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Marge appliquée : 0.2%</span>
                    {!isFixed && !isEditing && (
                      <button
                        onClick={() => handleStartEdit(r)}
                        className="text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Modifier</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 flex items-start gap-3.5 text-xs text-slate-400">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-white mb-0.5">Stipulation Réglementaire COBAC & Banques Centrales</div>
          <p className="leading-relaxed">
            La parité EUR/XAF est garantie à 655,957 conformément au traité de l'Union Monétaire d'Afrique Centrale (UMAC). Toute modification de parité est subordonnée à une décision officielle conjointe des États membres et de la Banque de France.
          </p>
        </div>
      </div>
    </div>
  );
};
