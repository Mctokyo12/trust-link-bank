import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  QrCode,
  Copy,
  Check,
  Share2,
  Building2,
  Phone,
  Link as LinkIcon,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Smartphone,
} from 'lucide-react';
import { useAppStore } from '../../app/store';
import { transfersApi } from '../../services/api/client';
import { formatCurrency } from '../../utils/formatters';

export const ReceiveMoneyPage: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser, wallets, refreshWallets, refreshNotifications } = useAppStore();

  const [activeTab, setActiveTab] = useState<'XAF' | 'USD' | 'EUR'>('XAF');
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedSuccessMsg, setSimulatedSuccessMsg] = useState('');

  const targetWallet = wallets.find((w) => w.currency === activeTab) || wallets[0];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(id);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const handleSimulateIncoming = async () => {
    if (!currentUser) return;
    setIsSimulating(true);
    setSimulatedSuccessMsg('');

    try {
      await transfersApi.simulateIncomingTransfer({
        receiverUserId: currentUser.id,
        amount: 150000,
        currency: 'XAF',
        senderName: "Samuel Eto'o",
        senderIdentifier: '+237 670 12 34 56',
        reason: 'Virement entrant test (Partie double validée)',
      });

      await refreshWallets();
      await refreshNotifications();
      setSimulatedSuccessMsg('Virement entrant de 150 000 FCFA reçu de Samuel Eto\'o et crédité au grand livre !');
    } catch {
      alert('Erreur lors de la simulation');
    } finally {
      setIsSimulating(false);
    }
  };

  const personalPayLink = `https://novapay.africa/pay/${currentUser?.novatag.replace('@', '') || 'amina'}`;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight font-display">
          {t('receive.title')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          {t('receive.subtitle')}
        </p>
      </div>

      {simulatedSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{simulatedSuccessMsg}</span>
        </div>
      )}

      {/* QR Code Matrix Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm text-center">
        {/* Simulated high-contrast QR Matrix */}
        <div className="w-52 h-52 mx-auto bg-slate-900 p-4 rounded-3xl shadow-lg relative flex items-center justify-center mb-4">
          <div className="w-full h-full border-4 border-dashed border-teal-400/40 rounded-2xl flex flex-col items-center justify-center p-2 text-white">
            <QrCode className="w-28 h-28 text-white mb-2" />
            <div className="bg-[#14B8A6] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <span>NovaPay ID</span>
            </div>
          </div>
        </div>

        <h3 className="font-extrabold text-base text-[#0F172A] font-display">
          {currentUser?.name}
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
          {t('receive.qrCaption')}
        </p>

        {/* Direct Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-[#14B8A6] shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400 font-semibold">{t('receive.phoneAccount')}</div>
                <div className="font-mono text-xs font-bold text-slate-800">{currentUser?.phone}</div>
              </div>
            </div>
            <button
              onClick={() => handleCopy(currentUser?.phone || '', 'phone')}
              className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors"
            >
              {copiedItem === 'phone' ? <Check className="w-4 h-4 text-[#14B8A6]" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <LinkIcon className="w-4 h-4 text-[#2563EB] shrink-0" />
              <div className="overflow-hidden">
                <div className="text-[10px] text-slate-400 font-semibold">{t('receive.personalLink')}</div>
                <div className="text-xs font-bold text-slate-800 truncate">{personalPayLink}</div>
              </div>
            </div>
            <button
              onClick={() => handleCopy(personalPayLink, 'link')}
              className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors"
            >
              {copiedItem === 'link' ? <Check className="w-4 h-4 text-[#14B8A6]" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Regional Banking Coordinates */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-[#0F172A] font-display">
              {t('receive.bankCoordinates')}
            </h3>
            <p className="text-xs text-slate-500">{t('receive.bankCoordinatesSub')}</p>
          </div>

          {/* Tab selector */}
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1 self-start sm:self-auto">
            {(['XAF', 'USD', 'EUR'] as const).map((curr) => (
              <button
                key={curr}
                type="button"
                onClick={() => setActiveTab(curr)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === curr ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {curr}
              </button>
            ))}
          </div>
        </div>

        {/* Banking detail box */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs sm:text-sm">
          <div className="flex justify-between pb-2 border-b border-slate-200">
            <span className="text-slate-500">{t('receive.partnerBank')} :</span>
            <strong className="text-slate-900">
              {activeTab === 'XAF' && 'Afriland First Bank (Supervision BEAC)'}
              {activeTab === 'USD' && 'JP Morgan Chase NA (New York)'}
              {activeTab === 'EUR' && 'BNP Paribas SEPA (Paris, France)'}
            </strong>
          </div>

          <div className="flex justify-between items-center py-1">
            <span className="text-slate-500">
              {activeTab === 'XAF' && 'Identifiant RIB Virtuel :'}
              {activeTab === 'USD' && 'Routing (ACH) & Account :'}
              {activeTab === 'EUR' && 'IBAN SEPA Direct :'}
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-slate-900">{targetWallet?.account_number}</span>
              <button
                onClick={() => handleCopy(targetWallet?.account_number || '', 'rib')}
                className="text-slate-400 hover:text-slate-700"
              >
                {copiedItem === 'rib' ? <Check className="w-4 h-4 text-[#14B8A6]" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex justify-between pt-2 border-t border-slate-200">
            <span className="text-slate-500">{t('receive.accountHolder')} :</span>
            <strong className="text-slate-900">{currentUser?.name}</strong>
          </div>
        </div>

        <button
          onClick={() => {
            navigator.clipboard.writeText(`Coordonnées bancaires ${activeTab} NovaPay: ${targetWallet?.account_number}`);
            alert('Coordonnées copiées avec succès !');
          }}
          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 py-2.5 px-4 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
        >
          <Share2 className="w-4 h-4 text-[#14B8A6]" />
          <span>{t('receive.shareMyCoordinates')}</span>
        </button>
      </div>

      {/* Interactive Simulation of Incoming Transfer Between Demo Accounts */}
      <div className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white text-[#14B8A6] flex items-center justify-center shadow-sm shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-base text-[#0F172A] font-display">
              {t('receive.simulateIncoming')}
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {t('receive.simulateIncomingDesc')}
            </p>

            <button
              type="button"
              onClick={handleSimulateIncoming}
              disabled={isSimulating}
              className="mt-4 bg-[#14B8A6] hover:bg-[#0D9488] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-teal-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSimulating ? t('common.loading') : t('receive.simulateBtn')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
