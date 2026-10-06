import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CreditCard, Sparkles, Bell, ShieldCheck, Check, ArrowRight } from 'lucide-react';
import { useAppStore } from '../../app/store';

export const CardsPage: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser } = useAppStore();
  const [isWaitlisted, setIsWaitlisted] = useState(false);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 uppercase tracking-wider">
            {t('cards.badge') || 'Version 2 • Future Scope'}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] dark:text-white tracking-tight font-display">
          {t('cards.title') || 'Trust Link Bank Cards'}
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400">
          {t('cards.subtitle') || 'Multi-currency international physical and virtual debit cards.'}
        </p>
      </div>

      {/* Card Visual Mockup */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-[#1E3A8A] via-[#2563EB] to-blue-400 p-8 text-white shadow-2xl shadow-blue-900/30 max-w-md mx-auto aspect-[1.586/1] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center font-black text-xs">
              TLB
            </div>
            <span className="font-extrabold text-sm tracking-tight font-display">Trust Link Bank</span>
          </div>
          <span className="text-xs font-mono font-bold bg-white/20 px-2 py-0.5 rounded-md backdrop-blur-xs">
            DEBIT
          </span>
        </div>

        {/* Chip & contactless */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-7 rounded-md bg-amber-300/80 border border-amber-400/80 shadow-inner" />
          <div className="w-6 h-6 rounded-full border-2 border-white/40 flex items-center justify-center text-[10px]">
            📶
          </div>
        </div>

        {/* Card Number & Holder */}
        <div>
          <div className="font-mono text-base tracking-widest text-white/90 drop-shadow-xs">
            •••• •••• •••• 4821
          </div>
          <div className="flex items-center justify-between mt-3 text-xs">
            <div>
              <div className="text-[9px] uppercase tracking-wider text-blue-100">
                {t('cards.holder') || 'Cardholder'}
              </div>
              <div className="font-bold tracking-wide truncate max-w-[180px]">
                {currentUser?.name || 'CLIENT TRUST LINK'}
              </div>
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-wider text-blue-100">
                {t('cards.expires') || 'Expires'}
              </div>
              <div className="font-mono font-bold">12/29</div>
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon Notice Card */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-sm transition-colors">
        <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] dark:bg-blue-950/50 text-[#2563EB] dark:text-blue-400 flex items-center justify-center mx-auto">
          <CreditCard className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h2 className="text-lg font-black text-[#0F172A] dark:text-white font-display">
            {t('cards.comingSoonTitle') || 'Feature in Deployment (Coming Soon)'}
          </h2>
          <p className="text-xs text-[#64748B] dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            {t('cards.comingSoonDesc') || "Physical and virtual debit card issuance is planned for Version 2 with regional Visa / Mastercard settlement networks."}
          </p>
        </div>

        <div className="pt-2">
          {isWaitlisted ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 dark:bg-green-950/40 text-[#16A34A] dark:text-green-400 text-xs font-bold border border-green-200 dark:border-green-800">
              <Check className="w-4 h-4" />
              <span>{t('cards.waitlistSuccess') || "You are on the priority waitlist!"}</span>
            </div>
          ) : (
            <button
              onClick={() => setIsWaitlisted(true)}
              className="bg-[#2563EB] hover:bg-[#1E3A8A] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 inline-flex items-center gap-2 cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span>{t('cards.waitlistBtn') || 'Notify me when cards launch'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardsPage;
