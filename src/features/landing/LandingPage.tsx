import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe2,
  Building2,
  Smartphone,
  Lock,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  Send,
  PlusCircle,
  Star,
  Users,
} from 'lucide-react';
import { useAppStore } from '../../app/store';

export const LandingPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { setLanguage } = useAppStore();
  const [activeCurrencyTab, setActiveCurrencyTab] = useState<'XAF' | 'USD' | 'EUR'>('XAF');

  const toggleLanguage = () => {
    const next = i18n.language === 'fr' ? 'en' : 'fr';
    setLanguage(next);
  };

  const corridors = [
    { country: 'Cameroun', region: 'Zone CEMAC', flag: '🇨🇲', rate: 'FCFA (XAF)', channels: 'Orange, MTN, Virement' },
    { country: "Côte d'Ivoire", region: 'Zone UEMOA', flag: '🇨🇮', rate: 'FCFA (XOF)', channels: 'Wave, Orange, MTN' },
    { country: 'Sénégal', region: 'Zone UEMOA', flag: '🇸🇳', rate: 'FCFA (XOF)', channels: 'Wave, Orange, Free' },
    { country: 'Gabon', region: 'Zone CEMAC', flag: '🇬🇦', rate: 'FCFA (XAF)', channels: 'Airtel Money, Moov' },
    { country: 'RDC', region: 'Afrique Centrale', flag: '🇨🇩', rate: 'USD & CDF', channels: 'M-Pesa, Orange, Airtel' },
    { country: 'Zone Euro (SEPA)', region: 'Europe Directe', flag: '🇪🇺', rate: 'Euro (EUR)', channels: 'IBAN virtuel dédié' },
    { country: 'États-Unis', region: 'Corridor USD', flag: '🇺🇸', rate: 'US Dollar (USD)', channels: 'ACH & Wire SWIFT' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] selection:bg-[#14B8A6]/20">
      {/* Top Bar Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#14B8A6] to-[#2563EB] flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-teal-500/20">
              NP
            </div>
            <div>
              <span className="font-extrabold text-xl text-[#0F172A] tracking-tight font-display">NovaPay</span>
              <span className="hidden sm:inline-block ml-2 text-[10px] text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded">
                v2.4.0 • Panafricaine
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switch */}
            <button
              onClick={toggleLanguage}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-[#0F172A] bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Globe2 className="w-3.5 h-3.5 text-[#14B8A6]" />
              <span>{i18n.language.toUpperCase()}</span>
            </button>

            <button
              onClick={() => navigate('/auth/login')}
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-[#0F172A] transition-colors"
            >
              {t('landing.login')}
            </button>

            <button
              onClick={() => navigate('/auth/register')}
              className="bg-[#14B8A6] hover:bg-[#0D9488] text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all flex items-center gap-1.5"
            >
              <span>{t('landing.createFreeAccount')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 bg-[#14B8A6]/10 text-[#0D9488] border border-[#14B8A6]/20 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6">
            <Zap className="w-3.5 h-3.5 text-[#14B8A6]" />
            <span>{t('landing.badge')}</span>
          </div>

          <h1
            className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#0F172A] tracking-tight leading-[1.15] mb-6 font-display"
            dangerouslySetInnerHTML={{ __html: t('landing.heroTitle') }}
          />

          <p
            className="text-base sm:text-lg text-slate-600 leading-relaxed mb-8"
            dangerouslySetInnerHTML={{ __html: t('landing.heroSubtitle') }}
          />

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <button
              onClick={() => navigate('/auth/register')}
              className="w-full sm:w-auto bg-[#14B8A6] hover:bg-[#0D9488] text-white px-7 py-3.5 rounded-xl font-bold text-base shadow-lg shadow-teal-500/25 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5"
            >
              <span>{t('landing.createFreeAccount')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate('/auth/login')}
              className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 px-7 py-3.5 rounded-xl font-bold text-base shadow-sm transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5"
            >
              <span>{t('landing.login')}</span>
            </button>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-3 text-xs text-slate-500">
            <div className="flex -space-x-2 overflow-hidden">
              <img className="inline-block h-7 w-7 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80" alt="User" />
              <img className="inline-block h-7 w-7 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80" alt="User" />
              <img className="inline-block h-7 w-7 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&auto=format&fit=crop&q=80" alt="User" />
              <img className="inline-block h-7 w-7 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80" alt="User" />
            </div>
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <span dangerouslySetInnerHTML={{ __html: t('landing.socialProof') }} />
          </div>
        </div>

        {/* Interactive Multi-Currency Card Mockup from Attached Design */}
        <div className="max-w-xl mx-auto bg-[#0F172A] text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 relative overflow-hidden">
          <div className="absolute -right-16 -bottom-16 w-56 h-56 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E] animate-pulse" />
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{t('landing.activeGlobalWallet')}</span>
            </div>
            <div className="flex bg-slate-800 p-1 rounded-xl gap-1">
              {(['XAF', 'USD', 'EUR'] as const).map((curr) => (
                <button
                  key={curr}
                  onClick={() => setActiveCurrencyTab(curr)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    activeCurrencyTab === curr ? 'bg-[#14B8A6] text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <div className="text-xs text-slate-400 mb-1">
              {activeCurrencyTab === 'XAF' && t('landing.mainBalance')}
              {activeCurrencyTab === 'USD' && "Portefeuille USD (Compte US ACH direct)"}
              {activeCurrencyTab === 'EUR' && "Portefeuille EUR (IBAN Virtuel SEPA)"}
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display tabular-nums">
              {activeCurrencyTab === 'XAF' && "3 200 000 FCFA"}
              {activeCurrencyTab === 'USD' && "$ 1,450.00"}
              {activeCurrencyTab === 'EUR' && "€ 1,180.00"}
            </div>
            <div className="text-xs text-[#14B8A6] font-medium mt-1">
              {t('landing.equivalent')}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={() => navigate('/auth/register')}
              className="bg-slate-800 hover:bg-slate-700/80 text-slate-200 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#14B8A6]" />
              <span>{t('landing.recharge')}</span>
            </button>
            <button
              onClick={() => navigate('/auth/register')}
              className="bg-slate-800 hover:bg-slate-700/80 text-slate-200 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>{t('landing.transfer')}</span>
            </button>
            <button
              onClick={() => navigate('/auth/register')}
              className="bg-slate-800 hover:bg-slate-700/80 text-slate-200 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#22C55E]" />
              <span>{t('landing.convert')}</span>
            </button>
          </div>

          {/* Guaranteed rate badge */}
          <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              <span>Taux garanti direct : 1 EUR = 655,957 FCFA</span>
            </span>
            <span className="text-emerald-400 font-semibold">Parité fixe BEAC</span>
          </div>
        </div>
      </section>

      {/* Direct Bridge Mobile Money & Banks */}
      <section className="bg-white border-y border-slate-200 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-xs font-bold text-[#14B8A6] uppercase tracking-wider">{t('landing.interoperable')}</span>
            <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] mt-1 font-display">
              {t('landing.bridgeTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">{t('landing.bridgeSubtitle')}</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-slate-600">
            <div className="flex items-center gap-2 font-bold text-sm bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl">
              <span className="w-3 h-3 rounded-full bg-orange-500" />
              <span>Orange Money</span>
            </div>
            <div className="flex items-center gap-2 font-bold text-sm bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl">
              <span className="w-3 h-3 rounded-full bg-yellow-400" />
              <span>MTN MoMo</span>
            </div>
            <div className="flex items-center gap-2 font-bold text-sm bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              <span>Wave</span>
            </div>
            <div className="flex items-center gap-2 font-bold text-sm bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span>Airtel Money</span>
            </div>
            <div className="flex items-center gap-2 font-bold text-sm bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl">
              <Building2 className="w-4 h-4 text-slate-700" />
              <span>SEPA Instant (EUR)</span>
            </div>
            <div className="flex items-center gap-2 font-bold text-sm bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl">
              <Building2 className="w-4 h-4 text-slate-700" />
              <span>ACH / Wire (USD)</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Core Pillars */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-[#14B8A6] uppercase tracking-wider">{t('landing.whySub')}</span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] mt-2 font-display">
            {t('landing.whyTitle')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#14B8A6] flex items-center justify-center mb-4">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-[#0F172A] mb-2 font-display">{t('landing.pillar1Title')}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{t('landing.pillar1Desc')}</p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center mb-4">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-[#0F172A] mb-2 font-display">{t('landing.pillar2Title')}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{t('landing.pillar2Desc')}</p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-[#0F172A] mb-2 font-display">{t('landing.pillar3Title')}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{t('landing.pillar3Desc')}</p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-[#0F172A] mb-2 font-display">{t('landing.pillar4Title')}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{t('landing.pillar4Desc')}</p>
          </div>
        </div>
      </section>

      {/* Corridors Grid */}
      <section className="bg-slate-100/70 border-y border-slate-200 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-[#14B8A6] uppercase tracking-wider">{t('landing.coverageTitle')}</span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] mt-1 font-display">
              {t('landing.coverageSubtitle')}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {corridors.map((c, i) => (
              <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                <span className="text-3xl shrink-0">{c.flag}</span>
                <div className="overflow-hidden">
                  <div className="font-bold text-sm text-[#0F172A] truncate">{c.country}</div>
                  <div className="text-xs text-slate-500">{c.region}</div>
                  <div className="text-[11px] text-[#14B8A6] font-semibold mt-0.5">{c.channels}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Regulatory Trust Banner */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center gap-6 text-left">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-[#0F172A] mb-1 font-display">
              {t('landing.complianceTitle')}
            </h3>
            <p
              className="text-xs sm:text-sm text-slate-600 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: t('landing.complianceDesc') }}
            />
          </div>
        </div>
      </section>

      {/* Ready CTA Section */}
      <section className="bg-[#0F172A] text-white py-16 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-4 font-display">
            {t('landing.readyTitle')}
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mb-8 max-w-xl mx-auto">
            {t('landing.readySubtitle')}
          </p>
          <button
            onClick={() => navigate('/auth/register')}
            className="bg-[#14B8A6] hover:bg-[#0D9488] text-white px-8 py-4 rounded-xl font-bold text-base shadow-xl shadow-teal-500/20 transition-all inline-flex items-center gap-2"
          >
            <span>{t('landing.openAccountBtn')}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#14B8A6] flex items-center justify-center text-white font-bold text-xs">
              NP
            </div>
            <span className="font-bold text-slate-800 text-sm">NovaPay Technologies</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 font-medium">
            <a href="#tarifs" className="hover:text-slate-800 transition-colors">{t('landing.feeSchedule')}</a>
            <a href="#securite" className="hover:text-slate-800 transition-colors">{t('landing.depositSafety')}</a>
            <a href="#confidentialite" className="hover:text-slate-800 transition-colors">{t('landing.privacy')}</a>
            <a href="#cgu" className="hover:text-slate-800 transition-colors">{t('landing.terms')}</a>
            <a href="#support" className="hover:text-slate-800 transition-colors">{t('landing.supportCenter')}</a>
          </div>

          <div className="text-slate-400 text-center md:text-right">
            {t('landing.copyright')}
          </div>
        </div>
      </footer>
    </div>
  );
};
