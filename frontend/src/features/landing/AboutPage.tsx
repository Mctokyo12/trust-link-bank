import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Globe2, Users, ArrowRight, Award } from 'lucide-react';
import { LanguageSelector } from '../../components/common/LanguageSelector';
import { ThemeToggle } from '../../components/common/ThemeToggle';

export const AboutPage: React.FC = () => {
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
            <Link to="/about" className="text-[#2563EB] dark:text-blue-400">{t('landing.navAbout', 'About')}</Link>
            <Link to="/security" className="hover:text-[#2563EB] dark:hover:text-blue-400 transition-colors">{t('landing.navSecurity', 'Security')}</Link>
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

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="text-xs font-extrabold text-[#2563EB] bg-[#EFF6FF] border border-blue-200 px-3 py-1 rounded-full uppercase tracking-wider">
            {t('about.badge', 'Our Mission')}
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-[#0F172A] tracking-tight font-display">
            {t('about.title', 'The Financial Bridge for the Americas')}
          </h1>
          <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
            {t('about.subtitle', 'Trust Link Bank connects the financial markets of North, Central, and South America with real multi-currency accounts, instant settlement rails, and bank-grade ledger compliance.')}
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
              <Globe2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#0F172A] font-display">
              {t('about.pillar3Title', 'Global Bank Interoperability')}
            </h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              {t('about.pillar3Desc', 'Seamless connectivity with Fedwire, NACHA, Pix, SPEI, Interac, and SEPA to bridge domestic and international rails.')}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#0F172A] font-display">
              {t('about.pillar2Title', 'Mathematical Double-Entry')}
            </h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              {t('about.pillar2Desc', 'Derived balances from immutable ledger entries. Every transfer is balanced and reconciled in real-time.')}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#0F172A] font-display">
              {t('about.pillar1Title', '100% Verified Identities')}
            </h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              {t('about.pillar1Desc', 'Strict KYC verification without friction ensures only authentic people and businesses send and receive funds.')}
            </p>
          </div>
        </div>

        {/* Commitment Banner */}
        <div className="bg-[#0F172A] text-white rounded-3xl p-8 sm:p-10 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-300">
            <Award className="w-4 h-4 text-[#2563EB]" />
            <span>{t('landing.popularBanksTitle', 'Seamless Connectivity with World-Leading Banks')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight">
            {t('landing.pillar4Title', 'Total Transparency & 0.00 Starting Balance')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            {t('landing.heroDesc', 'Real multi-currency accounts (USD, CAD, MXN, BRL, ARS, CLP, COP, EUR), instant transfers between verified members, and bulletproof double-entry ledger bookkeeping.')}
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate('/register')}
              className="bg-[#2563EB] hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-xs shadow-md shadow-blue-500/25 flex items-center gap-2 cursor-pointer"
            >
              <span>{t('landing.openAccountNow', 'Open My Account Now')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-[#64748B]">
        <p>{t('landing.allRightsReserved', '© 2026 Trust Link Bank Technologies Inc. All rights reserved.')}</p>
      </footer>
    </div>
  );
};

export default AboutPage;
