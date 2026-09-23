import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Percent,
  Check,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/api/client';
import { FeeConfig } from '../../types';

export const AdminFeesPage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [fixedAmount, setFixedAmount] = useState<number>(0);
  const [percentage, setPercentage] = useState<number>(0);

  const { data: fees = [], isLoading } = useQuery({
    queryKey: ['admin', 'fees'],
    queryFn: () => adminApi.getFees(),
  });

  const updateMutation = useMutation({
    mutationFn: (updatedFees: FeeConfig[]) => adminApi.updateFees(updatedFees),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'fees'] });
      setEditingId(null);
    },
  });

  const handleStartEdit = (f: FeeConfig) => {
    setEditingId(f.id);
    setFixedAmount(f.fixed_amount);
    setPercentage(f.percentage);
  };

  const handleSave = (id: string) => {
    const updated = fees.map((f: FeeConfig) =>
      f.id === id ? { ...f, fixed_amount: Number(fixedAmount), percentage: Number(percentage) } : f
    );
    updateMutation.mutate(updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white font-display">
          Grille Tarifaire & Plafonds Réglementaires
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configuration des frais de transaction et plafonds légaux par canal et devise.
        </p>
      </div>

      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Canaux de Traitement Financier</h3>
              <p className="text-xs text-slate-400">Paramétrage direct des commissions</p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">Chargement de la grille...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Canal / Type</th>
                  <th className="p-4">Devise</th>
                  <th className="p-4">Frais Fixes</th>
                  <th className="p-4">Pourcentage</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {fees.map((f: FeeConfig) => {
                  const isEditing = editingId === f.id;
                  return (
                    <tr key={f.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-bold text-white text-sm">
                        {f.type.toUpperCase().replace('_', ' ')}
                      </td>

                      <td className="p-4 font-mono text-slate-400">
                        {f.currency}
                      </td>

                      <td className="p-4 font-mono font-bold text-slate-200">
                        {isEditing ? (
                          <input
                            type="number"
                            value={fixedAmount}
                            onChange={(e) => setFixedAmount(Number(e.target.value))}
                            className="bg-slate-950 border border-blue-500 px-2 py-1 rounded text-white w-24"
                          />
                        ) : (
                          `${f.fixed_amount} ${f.currency}`
                        )}
                      </td>

                      <td className="p-4 font-mono font-bold text-slate-200">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            value={percentage}
                            onChange={(e) => setPercentage(Number(e.target.value))}
                            className="bg-slate-950 border border-blue-500 px-2 py-1 rounded text-white w-20"
                          />
                        ) : (
                          `${f.percentage} %`
                        )}
                      </td>

                      <td className="p-4 text-right">
                        {isEditing ? (
                          <button
                            onClick={() => handleSave(f.id)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-lg text-xs font-bold"
                          >
                            Enregistrer
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStartEdit(f)}
                            className="text-blue-400 hover:underline font-bold text-xs"
                          >
                            Modifier
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

      {/* KYC Limits Matrix Card */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-white">
          Plafonds Opérationnels par Niveau d'Agrément KYC (COBAC)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-emerald-400 font-bold mb-1">NIVEAU 1 : Mobile vérifié</div>
            <div className="text-slate-400 mb-2">Plafond par opération : 250 000 FCFA</div>
            <div className="text-white font-mono font-bold">500 000 FCFA / jour</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-blue-400 font-bold mb-1">NIVEAU 2 : CNI & Domicile vérifié</div>
            <div className="text-slate-400 mb-2">Plafond par opération : 5 000 000 FCFA</div>
            <div className="text-white font-mono font-bold">15 000 000 FCFA / mois</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-purple-400 font-bold mb-1">NIVEAU 3 : Entreprise & Marchand</div>
            <div className="text-slate-400 mb-2">Plafond par opération : 50 000 000 FCFA</div>
            <div className="text-white font-mono font-bold">Illimité / Sur convention</div>
          </div>
        </div>
      </div>
    </div>
  );
};
