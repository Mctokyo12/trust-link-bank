import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Filter,
  FileDown,
  ArrowDownLeft,
  SendHorizontal,
  ArrowLeftRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  X,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { transactionsApi } from '../../services/api/client';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Transaction } from '../../types';

export const TransactionsPage: React.FC = () => {
  const { t } = useTranslation();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'credit' | 'debit' | 'exchange'>('all');
  const [currencyFilter, setCurrencyFilter] = useState<'all' | 'XAF' | 'USD' | 'EUR'>('all');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions', 'all'],
    queryFn: () => transactionsApi.getTransactions(),
  });

  const filteredTransactions = transactions.filter((tx) => {
    // Search
    const q = searchTerm.toLowerCase();
    const matchSearch =
      tx.description.toLowerCase().includes(q) ||
      tx.reference.toLowerCase().includes(q) ||
      (tx.recipient_name && tx.recipient_name.toLowerCase().includes(q));

    if (!matchSearch) return false;

    // Type
    const isCredit = tx.type === 'deposit' || tx.recipient_name === 'Amina Diallo';
    if (typeFilter === 'credit' && !isCredit) return false;
    if (typeFilter === 'debit' && (isCredit || tx.type === 'exchange')) return false;
    if (typeFilter === 'exchange' && tx.type !== 'exchange') return false;

    // Currency
    if (currencyFilter !== 'all' && tx.currency !== currencyFilter) return false;

    return true;
  });

  const handleCopyRef = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleExportCSV = () => {
    const headers = ['Reference', 'Date', 'Type', 'Description', 'Montant', 'Devise', 'Statut'];
    const rows = filteredTransactions.map((tx) => [
      tx.reference,
      tx.created_at,
      tx.type,
      `"${tx.description}"`,
      tx.amount,
      tx.currency,
      tx.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NovaPay-Transactions-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight font-display">
            {t('transactions.title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {t('transactions.subtitle')}
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <FileDown className="w-4 h-4 text-[#14B8A6]" />
          <span>{t('transactions.export')} (CSV)</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par description, référence, bénéficiaire..."
              className="w-full pl-9 pr-4 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:border-[#14B8A6] focus:ring-1 focus:ring-[#14B8A6]"
            />
          </div>

          {/* Type Filters */}
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                typeFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Toutes
            </button>
            <button
              onClick={() => setTypeFilter('credit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                typeFilter === 'credit' ? 'bg-white text-[#22C55E] shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Entrées (+)
            </button>
            <button
              onClick={() => setTypeFilter('debit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                typeFilter === 'debit' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sorties (-)
            </button>
            <button
              onClick={() => setTypeFilter('exchange')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                typeFilter === 'exchange' ? 'bg-white text-[#14B8A6] shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Échanges
            </button>
          </div>

          {/* Currency Dropdown */}
          <select
            value={currencyFilter}
            onChange={(e) => setCurrencyFilter(e.target.value as any)}
            className="bg-slate-100 border-none font-bold text-xs px-3 py-2 rounded-xl focus:outline-none cursor-pointer"
          >
            <option value="all">Toutes devises</option>
            <option value="XAF">XAF (FCFA)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
          </select>
        </div>
      </div>

      {/* Transactions List / Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">Chargement des transactions...</div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Aucune transaction trouvée correspondant à vos filtres.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTransactions.map((tx) => {
              const isCredit = tx.type === 'deposit' || tx.recipient_name === 'Amina Diallo';
              const isSwap = tx.type === 'exchange';

              return (
                <div
                  key={tx.id}
                  onClick={() => setSelectedTx(tx)}
                  className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                        isSwap
                          ? 'bg-teal-50 text-[#14B8A6]'
                          : isCredit
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {isSwap ? (
                        <ArrowLeftRight className="w-5 h-5" />
                      ) : isCredit ? (
                        <ArrowDownLeft className="w-5 h-5" />
                      ) : (
                        <SendHorizontal className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <div className="font-bold text-sm text-[#0F172A]">{tx.description}</div>
                      <div className="text-xs text-slate-400 font-medium mt-0.5 flex flex-wrap items-center gap-2">
                        <span>{formatDate(tx.created_at)}</span>
                        <span>•</span>
                        <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.2 rounded">
                          {tx.reference}
                        </span>
                        {tx.metadata?.provider && (
                          <>
                            <span>•</span>
                            <span className="text-slate-600 font-bold">{tx.metadata.provider}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div
                      className={`text-base font-black font-display tabular-nums ${
                        isCredit ? 'text-[#22C55E]' : isSwap ? 'text-[#14B8A6]' : 'text-slate-900'
                      }`}
                    >
                      {isCredit ? '+' : isSwap ? '↔' : '-'} {formatCurrency(tx.amount, tx.currency)}
                    </div>
                    <div className="text-[11px] text-emerald-600 font-semibold flex items-center justify-end gap-1 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 inline" />
                      <span>{t('transactions.statusCompleted')}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Transaction Detail Slide-over / Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#14B8A6]" />
                <span className="font-extrabold text-sm text-[#0F172A] font-display">
                  {t('transactions.officialReceipt')}
                </span>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center py-2">
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">
                {t('transactions.totalSettled')}
              </div>
              <div className="text-3xl font-black font-display tabular-nums text-[#0F172A]">
                {formatCurrency(selectedTx.amount, selectedTx.currency)}
              </div>
              <div className="text-xs text-emerald-600 font-bold mt-1">
                {t('transactions.statusCompleted')} • Registre immuable
              </div>
            </div>

            <div className="divide-y divide-slate-100 text-xs sm:text-sm bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">{t('transactions.reference')} :</span>
                <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900">
                  <span>{selectedTx.reference}</span>
                  <button onClick={() => handleCopyRef(selectedTx.reference)}>
                    {copiedRef ? <Check className="w-3.5 h-3.5 text-[#14B8A6]" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  </button>
                </div>
              </div>

              <div className="py-2 flex justify-between">
                <span className="text-slate-500">{t('transactions.date')} :</span>
                <span className="font-semibold text-slate-800">{formatDate(selectedTx.created_at)}</span>
              </div>

              <div className="py-2 flex justify-between">
                <span className="text-slate-500">{t('transactions.description')} :</span>
                <span className="font-semibold text-slate-800 text-right">{selectedTx.description}</span>
              </div>

              {selectedTx.recipient_name && (
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">{t('send.beneficiaryLabel')} :</span>
                  <span className="font-semibold text-slate-800">{selectedTx.recipient_name}</span>
                </div>
              )}

              {selectedTx.operator_ref && (
                <div className="py-2 flex justify-between">
                  <span className="text-slate-500">{t('transactions.operatorId')} :</span>
                  <span className="font-mono text-slate-700">{selectedTx.operator_ref}</span>
                </div>
              )}

              <div className="py-2 flex justify-between">
                <span className="text-slate-500">{t('send.feeDetail')} :</span>
                <span className="font-semibold text-slate-800">
                  {formatCurrency(selectedTx.fee, selectedTx.currency)}
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  alert(`Téléchargement du bordereau certifié ${selectedTx.reference} en cours...`);
                }}
                className="flex-1 bg-[#14B8A6] hover:bg-[#0D9488] text-white py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <FileDown className="w-4 h-4" />
                <span>{t('transactions.downloadReceiptPdf')}</span>
              </button>

              <button
                onClick={() => setSelectedTx(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 px-4 rounded-xl text-xs font-bold transition-colors"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
