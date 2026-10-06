import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Users,
  Plus,
  Star,
  Search,
  Trash2,
  SendHorizontal,
  Smartphone,
  Building2,
  Zap,
  X,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { beneficiariesApi } from '../../services/api/client';
import { Beneficiary } from '../../types';

export const BeneficiariesPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'momo' | 'bank' | 'novapay'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New beneficiary form
  const [newFullName, setNewFullName] = useState('');
  const [newAlias, setNewAlias] = useState('');
  const [newType, setNewType] = useState<'momo' | 'bank' | 'novapay'>('momo');
  const [newProvider, setNewProvider] = useState('MTN');
  const [newIdentifier, setNewIdentifier] = useState('');

  const { data: beneficiaries = [], isLoading } = useQuery({
    queryKey: ['beneficiaries'],
    queryFn: () => beneficiariesApi.getBeneficiaries(),
  });

  const addMutation = useMutation({
    mutationFn: (data: Omit<Beneficiary, 'id' | 'created_at'>) =>
      beneficiariesApi.addBeneficiary(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
      setShowAddModal(false);
      setNewFullName('');
      setNewAlias('');
      setNewIdentifier('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => beneficiariesApi.deleteBeneficiary(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beneficiaries'] });
    },
  });

  const filtered = beneficiaries.filter((b: Beneficiary) => {
    const matchSearch =
      b.full_name.toLowerCase().includes(search.toLowerCase()) ||
      b.alias.toLowerCase().includes(search.toLowerCase()) ||
      b.identifier.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;

    if (activeTab === 'momo') return b.type === 'momo';
    if (activeTab === 'bank') return b.type === 'bank';
    if (activeTab === 'novapay') return b.type === 'novapay';
    return true;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName || !newIdentifier) return;

    addMutation.mutate({
      user_id: 'usr_amina',
      full_name: newFullName,
      alias: newAlias || newFullName,
      type: newType,
      provider: newType === 'momo' ? newProvider : newType === 'bank' ? 'Virement' : 'Trust Link Bank',
      identifier: newIdentifier,
      currency: 'XAF',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] dark:text-white tracking-tight font-display">
            {t('beneficiaries.title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t('beneficiaries.subtitle')}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#2563EB] hover:bg-[#1E3A8A] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t('beneficiaries.newBeneficiary')}</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('beneficiaries.searchPlaceholder')}
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-[#0F172A] text-[#0F172A] dark:text-white text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-[#2563EB]"
          />
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl gap-1 overflow-x-auto no-scrollbar">
          {(['all', 'momo', 'bank', 'novapay'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab ? 'bg-white dark:bg-slate-900 text-[#2563EB] dark:text-blue-400 shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {tab === 'all' && t('beneficiaries.filterAll', 'All')}
              {tab === 'momo' && t('beneficiaries.channelMomo', 'Mobile Money')}
              {tab === 'bank' && t('beneficiaries.channelBank', 'Bank')}
              {tab === 'novapay' && 'Trust Link P2P'}
            </button>
          ))}
        </div>
      </div>

      {/* Beneficiaries Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400 dark:text-slate-500">{t('common.loading', 'Loading...')}</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-200 dark:border-slate-800 text-center text-slate-400 dark:text-slate-500 text-xs">
          {t('beneficiaries.empty', 'No beneficiaries found.')}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((ben: Beneficiary) => (
            <div
              key={ben.id}
              className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 hover:border-[#2563EB] dark:hover:border-blue-500 rounded-2xl p-5 shadow-sm hover:shadow transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#EFF6FF] dark:bg-blue-950/50 text-[#2563EB] dark:text-blue-400 font-bold text-sm flex items-center justify-center border border-blue-100 dark:border-blue-900/50 shadow-xs">
                      {ben.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-[#0F172A] dark:text-white">{ben.full_name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <span>{ben.alias}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteMutation.mutate(ben.id)}
                    className="text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 p-1 transition-colors cursor-pointer"
                    title={t('common.delete')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 mb-4">
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mb-0.5 uppercase tracking-wider">
                    {ben.provider || ben.type}
                  </div>
                  <div className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {ben.identifier}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                  {ben.currency}
                </span>

                <button
                  onClick={() => navigate('/send')}
                  className="bg-[#2563EB] hover:bg-[#1E3A8A] text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <SendHorizontal className="w-3.5 h-3.5" />
                  <span>{t('send.title')}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Beneficiary Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0F172A] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-[#0F172A] dark:text-white font-display">
                {t('beneficiaries.addTitle')}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('beneficiaries.fullName')} *
                </label>
                <input
                  type="text"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="Ex: Carlos Silva"
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-[#0F172A] dark:text-white focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('beneficiaries.aliasLabel', 'Nickname / Alias')}
                </label>
                <input
                  type="text"
                  value={newAlias}
                  onChange={(e) => setNewAlias(e.target.value)}
                  placeholder="Ex: Buenos Aires Office"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-[#0F172A] dark:text-white focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('beneficiaries.channelTypeLabel', 'Channel Type')} *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewType('momo')}
                    className={`py-2 px-2 rounded-xl border font-bold text-center cursor-pointer transition-colors ${
                      newType === 'momo'
                        ? 'border-[#2563EB] bg-[#EFF6FF] dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {t('beneficiaries.channelMomo', 'Mobile Money')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewType('bank')}
                    className={`py-2 px-2 rounded-xl border font-bold text-center cursor-pointer transition-colors ${
                      newType === 'bank'
                        ? 'border-[#2563EB] bg-[#EFF6FF] dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {t('beneficiaries.channelBank', 'Bank / IBAN')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewType('novapay')}
                    className={`py-2 px-2 rounded-xl border font-bold text-center cursor-pointer transition-colors ${
                      newType === 'novapay'
                        ? 'border-[#2563EB] bg-[#EFF6FF] dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Trust Link P2P
                  </button>
                </div>
              </div>

              {newType === 'momo' && (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t('beneficiaries.operatorLabel', 'Operator')}
                  </label>
                  <select
                    value={newProvider}
                    onChange={(e) => setNewProvider(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-[#0F172A] dark:text-white font-medium"
                  >
                    <option value="Pix">Pix (Brasil)</option>
                    <option value="SPEI">SPEI (México)</option>
                    <option value="Zelle">Zelle / ACH (USA)</option>
                    <option value="Interac">Interac (Canada)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('beneficiaries.identifierLabel', 'Phone / IBAN / @novatag')} *
                </label>
                <input
                  type="text"
                  value={newIdentifier}
                  onChange={(e) => setNewIdentifier(e.target.value)}
                  placeholder="+55 11 98765 4321 / @tag"
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-[#0F172A] dark:text-white font-mono focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  disabled={addMutation.isPending}
                  className="flex-1 bg-[#2563EB] hover:bg-[#1E3A8A] text-white py-2.5 rounded-xl font-bold transition-colors shadow-sm cursor-pointer"
                >
                  {t('beneficiaries.save')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-2.5 px-4 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
