import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Lock, Fingerprint, FileCheck, ArrowRight } from 'lucide-react';
import { LanguageSelector } from '../../components/common/LanguageSelector';
import { ThemeToggle } from '../../components/common/ThemeToggle';

export const SecurityPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] text-[#0F172A] dark:text-slate-100 flex flex-col justify-between transition-colors">
      {/* Navigation */}
      <header className="bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-[#2563EB] flex items-center justify-center text-white font-black text-xs tracking-wider shadow-md shadow-blue-500/20">
              TLB
            </div>
            <div className="hidden sm:block">
              <span className="font-extrabold text-xl text-[#0F172A] dark:text-white tracking-tight font-display block leading-none">
                Trust Link Bank
              </span>
              <span className="text-[10px] text-[#64748B] dark:text-slate-400 font-medium">Americas & Global</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-[#64748B] dark:text-slate-400">
            <Link to="/features" className="hover:text-[#2563EB] dark:hover:text-blue-400 transition-colors">{t('landing.navFeatures', 'Features')}</Link>
            <Link to="/about" className="hover:text-[#2563EB] dark:hover:text-blue-400 transition-colors">{t('landing.navAbout', 'About')}</Link>
            <Link to="/security" className="text-[#2563EB] dark:text-blue-400">{t('landing.navSecurity', 'Security')}</Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <ThemeToggle variant="icon" />
            <LanguageSelector />
            <button
              onClick={() => navigate('/login')}
              className="text-xs font-bold text-[#0F172A] dark:text-white hover:text-[#2563EB] px-3 py-2 transition-colors cursor-pointer"
            >
              {t('landing.ctaSignIn', 'Sign In')}
            </button>
            <button
              onClick={() => navigate('/register')}
              className="bg-[#2563EB] hover:bg-[#1E3A8A] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-blue-500/20 cursor-pointer"
            >
              {t('landing.ctaOpenAccount', 'Open Account')}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-extrabold text-[#16A34A] bg-green-50 border border-green-200 px-3 py-1 rounded-full uppercase tracking-wider">
            {t('security.badge', 'Security & Compliance')}
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-[#0F172A] tracking-tight font-display">
            {t('security.title', 'Institutional-Grade Banking Protection')}
          </h1>
          <p className="text-sm text-[#64748B]">
            {t('security.subtitle', 'Your deposits, personal data, and transfer flows are secured by multi-layer encryption and rigorous global compliance.')}
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#0F172A]">{t('security.sec3Title', 'Idempotency & Double-Entry Ledger')}</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                {t('security.sec3Desc', 'Every transaction requires unique idempotency tokens, completely eliminating accidental double debits.')}
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#0F172A]">{t('security.sec1Title', '256-Bit Military Encryption')}</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                {t('security.sec1Desc', 'All data in transit and at rest is secured using AES-256 and TLS 1.3 cryptographic protocols.')}
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
              <Fingerprint className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#0F172A]">{t('security.sec2Title', 'Real-Time Fraud Prevention')}</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                {t('security.sec2Desc', 'Automated anomaly detection scans all transfers for suspicious patterns, preventing unauthorized access.')}
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0">
              <FileCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#0F172A]">{t('security.sec4Title', 'Protected Depositor Safeguards')}</h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                {t('security.sec4Desc', 'Customer funds are held in segregated partner custodial accounts at Tier 1 institutions.')}
              </p>
            </div>
          </div>
        </div>

        <div className="text-center pt-4">
          <button
            onClick={() => navigate('/register')}
            className="bg-[#2563EB] hover:bg-[#1E3A8A] text-white px-6 py-3 rounded-xl font-bold text-xs shadow-md shadow-blue-500/20 inline-flex items-center gap-2 cursor-pointer"
          >
            <span>{t('landing.openAccountNow', 'Open My Account Now')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-[#64748B]">
        <p>{t('landing.allRightsReserved', '© 2026 Trust Link Bank Technologies Inc. All rights reserved.')}</p>
      </footer>
    </div>
  );
};

export default SecurityPage;
