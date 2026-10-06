import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  QrCode,
  Copy,
  Check,
  Share2,
  CheckCircle2,
  Sparkles,
  User,
  Phone,
  Link as LinkIcon,
  ShieldCheck,
} from 'lucide-react';
import { useAppStore } from '../../app/store';
import { transfersApi } from '../../services/api/client';
import { getCurrencyMeta } from '../../utils/currencies';
import { CurrencyCode } from '../../types';

export const ReceiveMoneyPage: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser, wallets, refreshWallets } = useAppStore();

  const userCurrency = currentUser?.preferred_currency || wallets[0]?.currency || 'USD';
  const [activeTab, setActiveTab] = useState<CurrencyCode>(userCurrency as CurrencyCode);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSuccess, setSimulationSuccess] = useState<string | null>(null);

  const targetWallet = wallets.find((w) => w.currency === activeTab) || wallets[0];
  const activeMeta = getCurrencyMeta(activeTab);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(id);
    setTimeout(() => setCopiedItem(null), 2500);
  };

  const personalPayLink = `https://pay.trustlinkbank.com/@${currentUser?.name?.toLowerCase().replace(/\s+/g, '') || 'client'}`;

  const handleSimulateIncoming = async () => {
    if (!targetWallet || !currentUser) return;
    setIsSimulating(true);
    setSimulationSuccess(null);
    try {
      await transfersApi.simulateIncomingTransfer({
        receiverUserId: currentUser.id,
        amount: 250,
        currency: activeTab,
        senderName: 'Carlos Silva (São Paulo Interbank)',
        senderIdentifier: '+55 11 98765 4321',
        reason: t('receive.simulatedSuccess', 'Incoming transfer received via Trust Link Bank'),
      });
      await refreshWallets();
      setSimulationSuccess(
        t('receive.simulatedBanner', {
          amount: '250.00',
          currency: activeTab,
          defaultValue: `+250.00 ${activeTab} credited successfully to your account!`,
        })
      );
      setTimeout(() => setSimulationSuccess(null), 5000);
    } catch {
      // Ignored
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] dark:text-white tracking-tight font-display">
          {t('receive.title')}
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400">
          {t('receive.subtitle')}
        </p>
      </div>

      {simulationSuccess && (
        <div className="p-4 rounded-2xl bg-[#EFF6FF] dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-[#1E3A8A] dark:text-blue-300 flex items-center gap-3 text-xs font-bold">
          <CheckCircle2 className="w-5 h-5 text-[#2563EB] dark:text-blue-400 shrink-0" />
          <span>{simulationSuccess}</span>
        </div>
      )}

      {/* QR Code and Quick Share Card */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col items-center text-center relative overflow-hidden transition-colors">
        <div className="w-16 h-16 rounded-full bg-[#EFF6FF] dark:bg-blue-950/60 border-4 border-white dark:border-slate-800 shadow-md flex items-center justify-center text-2xl mb-3">
          {currentUser?.flag || activeMeta.flag || '🌎'}
        </div>

        <h2 className="text-lg font-bold text-[#0F172A] dark:text-white">{currentUser?.name}</h2>
        <span className="text-xs font-semibold text-[#2563EB] dark:text-blue-400 bg-[#EFF6FF] dark:bg-blue-950/50 px-2.5 py-0.5 rounded-full mt-1 border border-blue-200 dark:border-blue-900/40">
          {currentUser?.novatag || `@${currentUser?.name?.toLowerCase().replace(/\s+/g, '')}`}
        </span>

        {/* QR Code visual representation */}
        <div className="my-6 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-inner relative group">
          <div className="w-48 h-48 bg-slate-50 dark:bg-slate-800/80 rounded-xl flex flex-col items-center justify-center p-3 relative">
            <QrCode className="w-36 h-36 text-[#0F172A] dark:text-white" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 shadow-md flex items-center justify-center font-bold text-xs text-[#2563EB] dark:text-blue-400">
                TLB
              </div>
            </div>
          </div>
          <div className="mt-2 text-[11px] font-bold text-slate-400 dark:text-slate-500">
            {t('receive.scanToPay')}
          </div>
        </div>

        {/* Quick copy fields */}
        <div className="w-full space-y-2.5 text-left max-w-md">
          <div className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <Phone className="w-4 h-4 text-[#2563EB] dark:text-blue-400 shrink-0" />
              <div className="overflow-hidden">
                <div className="text-[10px] text-slate-400 font-semibold">{t('receive.linkedPhone')}</div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{currentUser?.phone || '+1 555 019 283'}</div>
              </div>
            </div>
            <button
              onClick={() => handleCopy(currentUser?.phone || '', 'phone')}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              {copiedItem === 'phone' ? <Check className="w-4 h-4 text-[#16A34A] dark:text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F8FAFC] dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <LinkIcon className="w-4 h-4 text-[#2563EB] dark:text-blue-400 shrink-0" />
              <div className="overflow-hidden">
                <div className="text-[10px] text-slate-400 font-semibold">{t('receive.personalLink')}</div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{personalPayLink}</div>
              </div>
            </div>
            <button
              onClick={() => handleCopy(personalPayLink, 'link')}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              {copiedItem === 'link' ? <Check className="w-4 h-4 text-[#16A34A] dark:text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Regional Banking Coordinates */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-[#0F172A] dark:text-white font-display">
              {t('receive.bankCoordinates')}
            </h3>
            <p className="text-xs text-[#64748B] dark:text-slate-400">{t('receive.bankCoordinatesSub')}</p>
          </div>

          {/* Account currency tab selector */}
          <div className="flex flex-wrap bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl gap-1 self-start sm:self-auto">
            {wallets.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => setActiveTab(w.currency as CurrencyCode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === w.currency ? 'bg-white dark:bg-slate-900 text-[#2563EB] dark:text-blue-400 shadow-xs' : 'text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white'
                }`}
              >
                {w.currency}
              </button>
            ))}
          </div>
        </div>

        {/* Banking detail box */}
        <div className="p-5 rounded-2xl bg-[#F8FAFC] dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 text-xs sm:text-sm">
          <div className="flex justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="text-[#64748B] dark:text-slate-400">{t('receive.partnerBank')} :</span>
            <strong className="text-[#0F172A] dark:text-white">
              Trust Link Bank International ({activeTab} Settlement)
            </strong>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-[#64748B] dark:text-slate-400">
              {activeTab === 'USD' && 'Routing (ACH) & Account :'}
              {activeTab === 'EUR' && 'IBAN SEPA Direct :'}
              {activeTab !== 'USD' && activeTab !== 'EUR' && `${t('receive.ibanAccountLabel', 'IBAN / Account Number')} (${activeTab}) :`}
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-[#0F172A] dark:text-white">{targetWallet?.account_number}</span>
              <button
                onClick={() => handleCopy(targetWallet?.account_number || '', 'rib')}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                {copiedItem === 'rib' ? <Check className="w-4 h-4 text-[#16A34A] dark:text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="text-[#64748B] dark:text-slate-400">{t('receive.accountHolder')} :</span>
            <strong className="text-[#0F172A] dark:text-white">{currentUser?.name}</strong>
          </div>
        </div>

        <button
          onClick={() => handleCopy(`Trust Link Bank (${activeTab}): ${targetWallet?.account_number}`, 'shared')}
          className="w-full bg-[#EFF6FF] dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-950/60 text-[#2563EB] dark:text-blue-300 py-2.5 px-4 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Share2 className="w-4 h-4 text-[#2563EB] dark:text-blue-400" />
          <span>{copiedItem === 'shared' ? t('common.copied', 'Copied!') : t('receive.shareMyCoordinates')}</span>
        </button>
      </div>

      {/* Info Banner: Admin Exclusive Crediting */}
      <div className="bg-[#EFF6FF] dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 rounded-3xl p-6 sm:p-8 shadow-sm transition-colors">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center shadow-sm shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-base text-[#0F172A] dark:text-white font-display">
              {t('receive.adminSecureReceptionTitle', 'Secure Reception via Administrator')}
            </h3>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1 leading-relaxed">
              {t('receive.adminSecureReceptionDesc', {
                tag: currentUser?.novatag || '@user.tlb',
                defaultValue: `Your account is authorized to receive instant transfers. Share your identifier ${currentUser?.novatag} or your account number with the administrator to receive funds.`,
              })}
            </p>

            {(currentUser?.role === 'admin' || currentUser?.role === 'super_admin') && (
              <button
                type="button"
                onClick={handleSimulateIncoming}
                disabled={isSimulating}
                className="mt-4 bg-[#2563EB] hover:bg-[#1E3A8A] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSimulating ? t('common.loading') : t('receive.simulateBtn')}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
