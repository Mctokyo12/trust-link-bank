import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  FileDown,
  ArrowDownLeft,
  SendHorizontal,
  ArrowLeftRight,
  CheckCircle2,
  Copy,
  Check,
  X,
  ShieldCheck,
  Coins,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { transactionsApi } from '../../services/api/client';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Transaction } from '../../types';
import { useAppStore } from '../../app/store';
import { SUPPORTED_CURRENCIES } from '../../utils/currencies';

export const TransactionsPage: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser } = useAppStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'credit' | 'debit' | 'exchange'>('all');
  const [currencyFilter, setCurrencyFilter] = useState<string>('all');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);
  const [receiptMsg, setReceiptMsg] = useState('');

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions', 'all', currentUser?.id],
    queryFn: () => transactionsApi.getTransactions(),
  });

  const filteredTransactions = transactions.filter((tx) => {
    // Search
    const q = searchTerm.toLowerCase();
    const matchSearch =
      tx.description.toLowerCase().includes(q) ||
      tx.reference.toLowerCase().includes(q) ||
      (tx.recipient_name && tx.recipient_name.toLowerCase().includes(q)) ||
      (tx.sender_name && tx.sender_name.toLowerCase().includes(q));

    if (!matchSearch) return false;

    // Type
    const isCredit =
      tx.type === 'deposit' ||
      tx.receiver_id === currentUser?.id ||
      (currentUser?.name && tx.recipient_name === currentUser.name);

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
    const headers = [
      t('common.reference', 'Reference'),
      t('common.date', 'Date'),
      t('common.type', 'Type'),
      t('common.description', 'Description'),
      t('common.amount', 'Amount'),
      t('common.currency', 'Currency'),
      t('common.status', 'Status'),
    ];
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
    link.setAttribute('download', `TrustLinkBank-Transactions-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadSingleReceipt = (tx: Transaction) => {
    const content = `===========================================
TRUST LINK BANK - OFFICIAL TRANSFER RECEIPT
===========================================
${t('common.reference', 'Reference')}: ${tx.reference}
${t('common.date', 'Date')}: ${formatDate(tx.created_at)}
${t('common.status', 'Status')}: ${t('common.completed', 'Completed')}
${t('transactions.descriptionLabel', 'Description')}: ${tx.description}
${t('common.amount', 'Amount')}: ${formatCurrency(tx.amount, tx.currency)}
${t('common.fee', 'Fee')}: ${formatCurrency(tx.fee, tx.currency)}
${t('transactions.senderLabel', 'Sender')}: ${tx.sender_name || 'Trust Link Client'}
${t('transactions.recipientLabel', 'Recipient')}: ${tx.recipient_name || 'N/A'}
===========================================
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Receipt-${tx.reference}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setReceiptMsg(t('transactions.receiptDownloadedSuccess', 'Receipt downloaded successfully.'));
    setTimeout(() => setReceiptMsg(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] dark:text-white tracking-tight font-display">
            {t('transactions.title', 'Transactions')}
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 mt-0.5">
            {t('transactions.subtitle', 'Real-time certified history compliant with double-entry ledger standards')}
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-[#0F172A] dark:text-white border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <FileDown className="w-4 h-4 text-[#2563EB] dark:text-blue-400" />
          <span>{t('transactions.exportCsv', 'Export (CSV)')}</span>
        </button>
      </div>

      {receiptMsg && (
        <div className="p-3.5 rounded-2xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-[#16A34A] dark:text-green-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{receiptMsg}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3 transition-colors">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('transactions.searchPlaceholder', 'Search by description, reference, recipient...')}
              className="w-full pl-9 pr-4 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[#0F172A] dark:text-white focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>

          {/* Type Filters */}
          <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl gap-1 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                typeFilter === 'all' ? 'bg-white dark:bg-slate-900 text-[#0F172A] dark:text-white shadow-xs' : 'text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white'
              }`}
            >
              {t('transactions.filterAll', 'All')}
            </button>
            <button
              onClick={() => setTypeFilter('credit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                typeFilter === 'credit' ? 'bg-white dark:bg-slate-900 text-[#16A34A] dark:text-green-400 shadow-xs' : 'text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white'
              }`}
            >
              {t('transactions.filterIn', 'Incoming (+)')}
            </button>
            <button
              onClick={() => setTypeFilter('debit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                typeFilter === 'debit' ? 'bg-white dark:bg-slate-900 text-[#0F172A] dark:text-white shadow-xs' : 'text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white'
              }`}
            >
              {t('transactions.filterOut', 'Outgoing (-)')}
            </button>
            <button
              onClick={() => setTypeFilter('exchange')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                typeFilter === 'exchange' ? 'bg-white dark:bg-slate-900 text-[#2563EB] dark:text-blue-400 shadow-xs' : 'text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white'
              }`}
            >
              {t('transactions.filterSwaps', 'Exchanges')}
            </button>
          </div>

          {/* Currency Dropdown */}
          <select
            value={currencyFilter}
            onChange={(e) => setCurrencyFilter(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 border-none font-bold text-xs px-3 py-2 rounded-xl focus:outline-none cursor-pointer text-[#0F172A] dark:text-white"
          >
            <option value="all">{t('transactions.allCurrencies', 'All currencies')}</option>
            {SUPPORTED_CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} ({c.symbol})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm transition-colors">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-[#64748B] dark:text-slate-400">{t('common.loading', 'Loading...')}</div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#64748B] dark:text-slate-400">
            {t('transactions.noTransactions', 'No transactions found.')}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredTransactions.map((tx) => {
              const isCredit =
                tx.type === 'deposit' ||
                tx.receiver_id === currentUser?.id ||
                (currentUser?.name && tx.recipient_name === currentUser.name);
              const isSwap = tx.type === 'exchange';

              return (
                <div
                  key={tx.id}
                  onClick={() => setSelectedTx(tx)}
                  className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                        isSwap
                          ? 'bg-[#EFF6FF] dark:bg-blue-950/50 text-[#2563EB] dark:text-blue-400'
                          : isCredit
                          ? 'bg-green-50 dark:bg-green-950/50 text-[#16A34A] dark:text-green-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
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
                      <div className="font-bold text-sm text-[#0F172A] dark:text-white">{tx.description}</div>
                      <div className="text-xs text-[#64748B] dark:text-slate-400 font-medium mt-0.5 flex flex-wrap items-center gap-2">
                        <span>{formatDate(tx.created_at)}</span>
                        <span>•</span>
                        <span className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded text-[#0F172A] dark:text-white">
                          {tx.reference}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div
                      className={`text-base font-black font-display tabular-nums ${
                        isCredit ? 'text-[#16A34A] dark:text-green-400' : isSwap ? 'text-[#2563EB] dark:text-blue-400' : 'text-[#0F172A] dark:text-white'
                      }`}
                    >
                      {isCredit ? '+' : isSwap ? '↔' : '-'} {formatCurrency(tx.amount, tx.currency)}
                    </div>
                    <div className="text-[11px] text-[#16A34A] dark:text-green-400 font-semibold flex items-center justify-end gap-1 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 inline" />
                      <span>{t('common.completed', 'Completed')}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Transaction Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0F172A] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#2563EB] dark:text-blue-400" />
                <span className="font-extrabold text-sm text-[#0F172A] dark:text-white font-display">
                  {t('transactions.officialReceiptTitle', 'Official Transaction Receipt')}
                </span>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center py-2">
              <div className="text-xs text-[#64748B] dark:text-slate-400 font-semibold uppercase tracking-wider mb-1">
                {t('transactions.postedAmount', 'Posted Amount')}
              </div>
              <div className="text-3xl font-black font-display tabular-nums text-[#0F172A] dark:text-white">
                {formatCurrency(selectedTx.amount, selectedTx.currency)}
              </div>
              <div className="text-xs text-[#16A34A] dark:text-green-400 font-bold mt-1">
                {t('transactions.doubleEntryCertified', 'Certified Double-Entry Accounting')}
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="py-2 flex justify-between">
                <span className="text-[#64748B] dark:text-slate-400">{t('common.reference', 'Reference')} :</span>
                <div className="flex items-center gap-1.5 font-mono font-bold text-[#0F172A] dark:text-white">
                  <span>{selectedTx.reference}</span>
                  <button onClick={() => handleCopyRef(selectedTx.reference)} className="cursor-pointer">
                    {copiedRef ? <Check className="w-3.5 h-3.5 text-[#16A34A] dark:text-green-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  </button>
                </div>
              </div>

              <div className="py-2 flex justify-between">
                <span className="text-[#64748B] dark:text-slate-400">{t('common.date', 'Date & Time')} :</span>
                <span className="font-semibold text-[#0F172A] dark:text-white">{formatDate(selectedTx.created_at)}</span>
              </div>

              <div className="py-2 flex justify-between">
                <span className="text-[#64748B] dark:text-slate-400">{t('transactions.descriptionLabel', 'Description')} :</span>
                <span className="font-semibold text-[#0F172A] dark:text-white text-right">{selectedTx.description}</span>
              </div>

              {selectedTx.recipient_name && (
                <div className="py-2 flex justify-between">
                  <span className="text-[#64748B] dark:text-slate-400">{t('transactions.recipientLabel', 'Recipient')} :</span>
                  <span className="font-semibold text-[#0F172A] dark:text-white">{selectedTx.recipient_name}</span>
                </div>
              )}

              {selectedTx.sender_name && (
                <div className="py-2 flex justify-between">
                  <span className="text-[#64748B] dark:text-slate-400">{t('transactions.senderLabel', 'Sender')} :</span>
                  <span className="font-semibold text-[#0F172A] dark:text-white">{selectedTx.sender_name}</span>
                </div>
              )}

              <div className="py-2 flex justify-between">
                <span className="text-[#64748B] dark:text-slate-400">{t('common.fee', 'Fee')} :</span>
                <span className="font-semibold text-[#16A34A] dark:text-green-400">
                  {selectedTx.fee === 0 ? `${t('common.free', 'Free')} (0.00)` : formatCurrency(selectedTx.fee, selectedTx.currency)}
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => handleDownloadSingleReceipt(selectedTx)}
                className="flex-1 bg-[#2563EB] hover:bg-[#1E3A8A] text-white py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <FileDown className="w-4 h-4" />
                <span>{t('send.downloadReceipt', 'Download Receipt (TXT)')}</span>
              </button>

              <button
                onClick={() => setSelectedTx(null)}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[#0F172A] dark:text-white py-3 px-4 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                {t('common.close', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;
