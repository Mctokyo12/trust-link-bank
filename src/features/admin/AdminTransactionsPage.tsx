import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Database,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { transactionsApi } from '../../services/api/client';
import { Transaction } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const AdminTransactionsPage: React.FC = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['admin', 'transactions'],
    queryFn: () => transactionsApi.getTransactions(),
  });

  const filtered = transactions.filter((tx: Transaction) => {
    const q = search.toLowerCase();
    return (
      tx.reference.toLowerCase().includes(q) ||
      tx.description.toLowerCase().includes(q) ||
      (tx.recipient_name && tx.recipient_name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white font-display">
            Audit des Transactions & Grand Livre
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Registre comptable officiel et ventilation des écritures en partie double.
          </p>
        </div>

        <div className="w-full sm:w-72 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Référence, intitulé, bénéficiaire..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 text-xs text-white placeholder-slate-500 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Transactions list */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">Chargement du registre...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Référence</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Intitulé</th>
                  <th className="p-4">Montant</th>
                  <th className="p-4">Frais</th>
                  <th className="p-4">Canal</th>
                  <th className="p-4">Partie Double</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filtered.map((tx: Transaction) => {
                  const isExpanded = expandedTxId === tx.id;
                  return (
                    <React.Fragment key={tx.id}>
                      <tr
                        onClick={() => setExpandedTxId(isExpanded ? null : tx.id)}
                        className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                      >
                        <td className="p-4 font-mono font-bold text-teal-400">
                          {tx.reference}
                        </td>

                        <td className="p-4 text-slate-400 whitespace-nowrap">
                          {formatDate(tx.created_at)}
                        </td>

                        <td className="p-4 font-semibold text-white">
                          {tx.description}
                        </td>

                        <td className="p-4 font-black font-display text-white tabular-nums">
                          {formatCurrency(tx.amount, tx.currency)}
                        </td>

                        <td className="p-4 text-slate-400 tabular-nums">
                          {formatCurrency(tx.fee, tx.currency)}
                        </td>

                        <td className="p-4">
                          <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] font-mono text-slate-300">
                            {tx.metadata?.provider || tx.type}
                          </span>
                        </td>

                        <td className="p-4">
                          <button className="flex items-center gap-1 text-blue-400 text-xs font-semibold hover:underline">
                            <span>{isExpanded ? 'Masquer' : 'Voir écritures'}</span>
                            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      </tr>

                      {/* Double-entry entries details */}
                      {isExpanded && (
                        <tr className="bg-slate-900/90">
                          <td colSpan={7} className="p-4 border-y border-slate-800">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                                <Database className="w-4 h-4 text-blue-400" />
                                <span>Écritures comptables vérifiées (Grand Livre)</span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                                  <div className="text-slate-500 font-semibold mb-1">DÉBIT (Sortie)</div>
                                  <div className="font-mono text-white">Compte: {tx.metadata?.source_wallet || 'Portefeuille Émetteur'}</div>
                                  <div className="text-rose-400 font-bold mt-1">
                                    - {formatCurrency(tx.amount + tx.fee, tx.currency)}
                                  </div>
                                </div>

                                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                                  <div className="text-slate-500 font-semibold mb-1">CRÉDIT (Destination)</div>
                                  <div className="font-mono text-white">Bénéficiaire: {tx.recipient_name || 'Partenaire Réseau'}</div>
                                  <div className="text-emerald-400 font-bold mt-1">
                                    + {formatCurrency(tx.amount, tx.currency)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
