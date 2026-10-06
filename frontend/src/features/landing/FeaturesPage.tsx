import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Coins,
  SendHorizontal,
  ShieldCheck,
  Zap,
  ArrowRight,
  Globe2,
  Lock,
} from 'lucide-react';
import { LanguageSelector } from '../../components/common/LanguageSelector';
import { ThemeToggle } from '../../components/common/ThemeToggle';

export const FeaturesPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const features = [
    {
      icon: Coins,
      title: t('features.f1Title', 'Multi-Currency Choice at Signup'),
      desc: t('features.f1Desc', 'Select from 14 official currencies of the Americas & Europe: USD, CAD, MXN, BRL, ARS, CLP, COP, PEN, and EUR. Your account is ready instantly with a guaranteed 0.00 starting balance.'),
    },
    {
      icon: SendHorizontal,
      title: t('features.f2Title', 'Instant Network P2P Transfers'),
      desc: t('features.f2Desc', 'Search contacts by name, email, phone, or unique @novatag. Real-time debit from the sender and credit to the recipient applied simultaneously in the double-entry ledger.'),
    },
    {
      icon: ShieldCheck,
      title: t('features.f3Title', 'Double-Entry Ledger Accounting'),
      desc: t('features.f3Desc', 'Every cent that leaves an account is strictly balanced and audited against a counterparty wallet. Mathematical precision with zero phantom balances.'),
    },
    {
      icon: Lock,
      title: t('features.f4Title', 'Authentic & Verified Profiles'),
      desc: t('features.f4Desc', 'Your profile displays verified information (name, email, phone, country, language, novatag). Easily manage your security credentials from your private portal.'),
    },
    {
      icon: Globe2,
      title: t('features.f5Title', 'Continental Multi-Language Support'),
      desc: t('features.f5Desc', 'Interface natively available in English, Spanish, Portuguese, and French to serve financial flows across the entire American continent.'),
    },
    {
      icon: Zap,
      title: t('features.f6Title', 'Instant Receipts & Transaction Proofs'),
      desc: t('features.f6Desc', 'Download official encrypted proof of transfer receipts for accounting, tax compliance, or vendor verification in one click.'),
    },
  ];

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
            <Link to="/features" className="text-[#2563EB] dark:text-blue-400">{t('landing.navFeatures', 'Features')}</Link>
            <Link to="/about" className="hover:text-[#2563EB] dark:hover:text-blue-400 transition-colors">{t('landing.navAbout', 'About')}</Link>
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

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="text-xs font-extrabold text-[#2563EB] bg-[#EFF6FF] border border-blue-200 px-3 py-1 rounded-full uppercase tracking-wider">
            {t('features.badge', 'Enterprise Capabilities')}
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-[#0F172A] tracking-tight font-display">
            {t('features.title', 'Modern Banking Infrastructure for the Americas')}
          </h1>
          <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
            {t('features.subtitle', 'Built to power real multi-currency business and individual payments across North and South America.')}
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-md hover:border-[#2563EB] transition-all space-y-3"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#0F172A] font-display">
                  {feat.title}
                </h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Call to action */}
        <div className="bg-[#EFF6FF] border border-blue-200 rounded-3xl p-8 text-center space-y-4">
          <h2 className="text-2xl font-black text-[#1E3A8A] font-display">
            {t('landing.readyCtaTitle', 'Ready to open your Trust Link Bank account?')}
          </h2>
          <p className="text-xs text-[#64748B] max-w-md mx-auto">
            {t('landing.readyCtaSubtitle', 'Join thousands of clients across the Americas. Open your account in 2 minutes with your preferred currency and start with zero balance.')}
          </p>
          <div>
            <button
              onClick={() => navigate('/register')}
              className="bg-[#2563EB] hover:bg-[#1E3A8A] text-white px-6 py-3 rounded-xl font-bold text-xs shadow-md shadow-blue-500/20 inline-flex items-center gap-2 cursor-pointer"
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

export default FeaturesPage;
