import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe2,
  Lock,
  PlusCircle,
  Send,
  Building2,
  Coins,
  CheckCircle2,
  TrendingUp,
  ArrowUpRight,
  Check,
  Star,
  Menu,
  X,
} from 'lucide-react';
import { LanguageSelector } from '../../components/common/LanguageSelector';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { getExchangeRate, convertCurrency, formatCurrency } from '../../utils/currencies';

export const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeCurrencyTab, setActiveCurrencyTab] = useState<'USD' | 'CAD' | 'BRL' | 'MXN' | 'EUR'>('USD');
  const [bankRegion, setBankRegion] = useState<'all' | 'na' | 'sa' | 'global'>('all');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Interactive Live Currency & Transfer Calculator State
  const [calcAmount, setCalcAmount] = useState<number>(1000);
  const [calcSourceCurrency, setCalcSourceCurrency] = useState<'USD' | 'CAD' | 'EUR'>('USD');
  const [calcTargetCurrency, setCalcTargetCurrency] = useState<'BRL' | 'MXN' | 'COP' | 'ARS' | 'CAD' | 'EUR'>('BRL');

  const calcRate = getExchangeRate(calcSourceCurrency, calcTargetCurrency);
  const calcConverted = convertCurrency(calcAmount, calcSourceCurrency, calcTargetCurrency);

  // Popular Global & Americas Banks Supported with Region Tags
  const popularBanks = [
    {
      name: 'JPMorgan Chase',
      country: 'United States',
      region: 'na',
      flag: '🇺🇸',
      rail: 'Fedwire / Real-Time ACH',
      tier: 'Tier 1 Global',
    },
    {
      name: 'Bank of America',
      country: 'United States',
      region: 'na',
      flag: '🇺🇸',
      rail: 'ACH Direct & Wire',
      tier: 'Tier 1 Global',
    },
    {
      name: 'Citigroup',
      country: 'Global & USA',
      region: 'na',
      flag: '🌐',
      rail: 'SWIFT GPI / Cross-Border FX',
      tier: 'Tier 1 Global',
    },
    {
      name: 'Wells Fargo',
      country: 'United States',
      region: 'na',
      flag: '🇺🇸',
      rail: 'Commercial & Retail Wire',
      tier: 'National Partner',
    },
    {
      name: 'Royal Bank of Canada (RBC)',
      country: 'Canada',
      region: 'na',
      flag: '🇨🇦',
      rail: 'Interac e-Transfer & EFT',
      tier: 'Major Canadian Rail',
    },
    {
      name: 'TD Bank',
      country: 'Canada & USA',
      region: 'na',
      flag: '🇨🇦',
      rail: 'Cross-Border Automated Clearing',
      tier: 'North American Rail',
    },
    {
      name: 'Itaú Unibanco',
      country: 'Brazil & South America',
      region: 'sa',
      flag: '🇧🇷',
      rail: 'PIX Instant Settlement 24/7',
      tier: 'LatAm Premier',
    },
    {
      name: 'Nubank',
      country: 'Brazil, Mexico, Colombia',
      region: 'sa',
      flag: '🇧🇷',
      rail: 'Instant Digital Switch (90M+ users)',
      tier: 'Digital Pioneer',
    },
    {
      name: 'Banco do Brasil',
      country: 'Brazil',
      region: 'sa',
      flag: '🇧🇷',
      rail: 'National Clearing & TED/PIX',
      tier: 'State Partner',
    },
    {
      name: 'BBVA',
      country: 'Mexico & International',
      region: 'sa',
      flag: '🇲🇽',
      rail: 'SPEI & Instant CLABE',
      tier: 'Global Financial Group',
    },
    {
      name: 'Banco Santander',
      country: 'Americas & Europe',
      region: 'sa',
      flag: '🇪🇸',
      rail: 'PagoNxt / Multi-Currency Rail',
      tier: 'Global Partner',
    },
    {
      name: 'Bancolombia',
      country: 'Colombia',
      region: 'sa',
      flag: '🇨🇴',
      rail: 'Transfiya / ACH Colombia',
      tier: 'Andean Leader',
    },
    {
      name: 'Banco de Chile',
      country: 'Chile',
      region: 'sa',
      flag: '🇨🇱',
      rail: 'TEF Direct Settlement',
      tier: 'Southern Cone Leader',
    },
    {
      name: 'HSBC',
      country: 'Global & UK',
      region: 'global',
      flag: '🇬🇧',
      rail: 'Global Clearing & SWIFT GPI',
      tier: 'Global Clearing',
    },
    {
      name: 'Barclays',
      country: 'United Kingdom',
      region: 'global',
      flag: '🇬🇧',
      rail: 'CHAPS / Faster Payments Direct',
      tier: 'Tier 1 Global',
    },
    {
      name: 'BNP Paribas',
      country: 'European Union',
      region: 'global',
      flag: '🇫🇷',
      rail: 'SEPA Instant & TARGET2',
      tier: 'Eurozone Leader',
    },
  ];

  const filteredBanks = popularBanks.filter((b) => {
    if (bankRegion === 'all') return true;
    return b.region === bankRegion;
  });

  const americasCorridors = [
    { country: 'United States', code: 'USD', flag: '🇺🇸', region: 'North America', channels: 'ACH · Fedwire · Instant TLB' },
    { country: 'Brazil', code: 'BRL', flag: '🇧🇷', region: 'South America', channels: 'PIX · TED · Instant TLB' },
    { country: 'Mexico', code: 'MXN', flag: '🇲🇽', region: 'North America', channels: 'SPEI · CLABE · Instant TLB' },
    { country: 'Canada', code: 'CAD', flag: '🇨🇦', region: 'North America', channels: 'Interac · EFT · Instant TLB' },
    { country: 'Argentina', code: 'ARS', flag: '🇦🇷', region: 'South America', channels: 'CBU · Alias · Instant TLB' },
    { country: 'Colombia', code: 'COP', flag: '🇨🇴', region: 'South America', channels: 'Transfiya · ACH · Instant TLB' },
    { country: 'Chile', code: 'CLP', flag: '🇨🇱', region: 'South America', channels: 'TEF · Direct Clearing · Instant TLB' },
    { country: 'European Union', code: 'EUR', flag: '🇪🇺', region: 'Europe & Global', channels: 'SEPA Instant · TARGET2 · Instant TLB' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] text-[#0F172A] dark:text-slate-100 selection:bg-[#2563EB]/20 transition-colors">
      {/* Top Bar Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#2563EB] flex items-center justify-center text-white font-black text-xs tracking-wider shadow-md shadow-blue-500/20">
              TLB
            </div>
            <div className="hidden sm:block">
              <span className="font-extrabold text-xl text-[#0F172A] dark:text-white tracking-tight font-display">Trust Link Bank</span>
              <span className="hidden md:inline-block ml-2 text-[10px] text-[#64748B] dark:text-slate-400 font-mono">
                Americas & Global
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-[#64748B] dark:text-slate-400">
            <Link to="/features" className="hover:text-[#2563EB] dark:hover:text-blue-400 transition-colors">
              {t('landing.navFeatures', 'Features')}
            </Link>
            <Link to="/about" className="hover:text-[#2563EB] dark:hover:text-blue-400 transition-colors">
              {t('landing.navAbout', 'About')}
            </Link>
            <Link to="/security" className="hover:text-[#2563EB] dark:hover:text-blue-400 transition-colors">
              {t('landing.navSecurity', 'Security')}
            </Link>
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Single Dark Mode button */}
            <ThemeToggle variant="icon" />

            <LanguageSelector />

            <button
              onClick={() => navigate('/login')}
              className="hidden sm:inline-block px-3 sm:px-4 py-2 text-xs font-bold text-[#0F172A] dark:text-white hover:text-[#2563EB] dark:hover:text-blue-400 transition-colors cursor-pointer"
            >
              {t('landing.ctaSignIn', 'Sign In')}
            </button>

            <button
              onClick={() => navigate('/register')}
              className="hidden sm:flex bg-[#2563EB] hover:bg-[#1E3A8A] text-white px-3 sm:px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all items-center gap-1.5 cursor-pointer"
            >
              <span>{t('landing.ctaOpenAccount', 'Open Account')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Mobile Navigation Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              aria-label="Ouvrir le menu"
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown Menu */}
        {isMobileNavOpen && (
          <div className="md:hidden bg-white/98 dark:bg-[#0F172A]/98 border-b border-slate-200 dark:border-slate-800 px-4 py-4 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-150">
            <nav className="flex flex-col space-y-1">
              <Link
                to="/features"
                onClick={() => setIsMobileNavOpen(false)}
                className="px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {t('landing.navFeatures', 'Features')}
              </Link>
              <Link
                to="/about"
                onClick={() => setIsMobileNavOpen(false)}
                className="px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {t('landing.navAbout', 'About')}
              </Link>
              <Link
                to="/security"
                onClick={() => setIsMobileNavOpen(false)}
                className="px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {t('landing.navSecurity', 'Security')}
              </Link>
            </nav>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
              <button
                onClick={() => {
                  setIsMobileNavOpen(false);
                  navigate('/login');
                }}
                className="w-full py-2.5 px-4 text-center rounded-xl text-sm font-bold text-[#0F172A] dark:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                {t('landing.ctaSignIn', 'Sign In')}
              </button>
              <button
                onClick={() => {
                  setIsMobileNavOpen(false);
                  navigate('/register');
                }}
                className="w-full py-2.5 px-4 text-center rounded-xl text-sm font-bold text-white bg-[#2563EB] hover:bg-[#1E3A8A] shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
              >
                <span>{t('landing.ctaOpenAccount', 'Open Account')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-14 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="text-center max-w-3xl mx-auto mb-12">
          {/* Typographic lead notice (Zero-pill discipline) */}
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#1E3A8A] mb-5">
            <Zap className="w-4 h-4 text-[#2563EB]" />
            <span>{t('landing.heroBadge', 'Next Generation • Digital Banking for the Americas & Global Markets')}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#0F172A] tracking-tight leading-[1.12] mb-6 font-display">
            {t('landing.heroLead', 'Manage your money borderless across the Americas & worldwide')}
          </h1>

          <p className="text-base sm:text-lg text-[#64748B] leading-relaxed mb-8 max-w-2xl mx-auto">
            {t('landing.heroDesc', 'Real multi-currency accounts (USD, CAD, MXN, BRL, ARS, CLP, COP, EUR), instant transfers between verified members, and bulletproof double-entry ledger bookkeeping.')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <button
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto bg-[#2563EB] hover:bg-[#1E3A8A] text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 cursor-pointer"
            >
              <span>{t('landing.createFreeAccount', 'Create Free Account')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 px-8 py-3.5 rounded-xl font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 cursor-pointer"
            >
              <span>{t('landing.login', 'Sign in to my account')}</span>
            </button>
          </div>

          {/* Social Proof */}
          <div className="flex items-center justify-center gap-3 text-xs text-[#64748B]">
            <div className="flex items-center gap-0.5 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <span>{t('landing.socialProofCount', '4.9 / 5 rating · 150,000+ personal & business accounts across the Americas')}</span>
          </div>
        </div>

        {/* Interactive Multi-Currency Card Preview */}
        <div className="max-w-xl mx-auto bg-[#0F172A] text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 relative overflow-hidden">
          <div className="absolute -right-16 -bottom-16 w-56 h-56 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
              <span className="text-xs font-semibold text-slate-300 tracking-wide uppercase">
                {t('landing.activeAccountPreview', 'Trust Link Active Account')}
              </span>
            </div>

            {/* Interactive Currency Tab Selector */}
            <div className="flex bg-slate-800 p-1 rounded-xl gap-1">
              {(['USD', 'CAD', 'BRL', 'MXN', 'EUR'] as const).map((curr) => (
                <button
                  key={curr}
                  onClick={() => setActiveCurrencyTab(curr)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeCurrencyTab === curr ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <div className="text-xs text-slate-400 mb-1">
              {activeCurrencyTab === 'USD' && 'US Dollar Account (Fedwire / ACH direct)'}
              {activeCurrencyTab === 'CAD' && 'Canadian Dollar Account (Interac / EFT direct)'}
              {activeCurrencyTab === 'BRL' && 'Brazilian Real Account (PIX instant rail)'}
              {activeCurrencyTab === 'MXN' && 'Mexican Peso Account (SPEI / CLABE direct)'}
              {activeCurrencyTab === 'EUR' && 'Euro Account (SEPA Instant / IBAN)'}
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display tabular-nums">
              {activeCurrencyTab === 'USD' && '$ 1,450.00'}
              {activeCurrencyTab === 'CAD' && 'CA$ 1,980.00'}
              {activeCurrencyTab === 'BRL' && 'R$ 7,820.00'}
              {activeCurrencyTab === 'MXN' && 'MX$ 28,400.00'}
              {activeCurrencyTab === 'EUR' && '€ 1,180.00'}
            </div>
            <div className="text-xs text-blue-400 font-medium mt-1">
              {t('landing.zeroBalanceNotice', 'Guaranteed 0.00 starting balance • Ready for immediate use')}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={() => navigate('/register')}
              className="bg-slate-800 hover:bg-slate-700/80 text-slate-200 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>{t('landing.recharge', 'Deposit')}</span>
            </button>
            <button
              onClick={() => navigate('/register')}
              className="bg-slate-800 hover:bg-slate-700/80 text-slate-200 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>{t('landing.transfer', 'Transfer')}</span>
            </button>
            <button
              onClick={() => navigate('/register')}
              className="bg-slate-800 hover:bg-slate-700/80 text-slate-200 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Coins className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>{t('landing.convert', 'Convert')}</span>
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>{t('landing.doubleEntryAudit', 'Double-Entry Ledger Accounting')}</span>
            </span>
            <span className="text-[#16A34A] font-semibold">
              {t('landing.realTimeAudit', 'Real-time Audited')}
            </span>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE TRUST LINK BANK: VISUAL & EDITORIAL SHOWCASE */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider">
            {t('landing.whySub', 'Certified Banking Excellence')}
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-[#0F172A] dark:text-white tracking-tight font-display mt-1 mb-3">
            {t('landing.whyTitle', 'Why Choose Trust Link Bank?')}
          </h2>
          <p className="text-sm sm:text-base text-[#64748B] dark:text-slate-400">
            {t('landing.bridgeSubtitle', 'Connect your local and international accounts seamlessly with institutional-grade protection.')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: Multi-Currency & Corridors */}
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
            <div className="h-48 relative overflow-hidden bg-slate-900">
              <img
                src="https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&auto=format&fit=crop&q=80"
                alt="Global Multi-Currency Banking"
                className="w-full h-full object-cover opacity-80 hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent" />
              <span className="absolute bottom-3 left-4 text-[11px] font-bold bg-[#2563EB] text-white px-2.5 py-1 rounded-lg shadow-xs">
                14+ {t('nav.wallets', 'Currencies')}
              </span>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="text-lg font-extrabold text-[#0F172A] dark:text-white font-display mb-2">
                  {t('landing.pillar1Title', 'Instant Multi-Currency Accounts')}
                </h3>
                <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 leading-relaxed">
                  {t('landing.pillar1Desc', 'Hold USD, CAD, BRL, MXN, EUR, and South American currencies in one unified account. Convert at real interbank rates.')}
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs font-bold text-[#2563EB] dark:text-blue-400">
                <Globe2 className="w-4 h-4" />
                <span>USD • CAD • BRL • MXN • EUR</span>
              </div>
            </div>
          </div>

          {/* Card 2: Instant Settlement Network */}
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
            <div className="h-48 relative overflow-hidden bg-slate-900">
              <img
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&auto=format&fit=crop&q=80"
                alt="Instant Digital Transfers"
                className="w-full h-full object-cover opacity-80 hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent" />
              <span className="absolute bottom-3 left-4 text-[11px] font-bold bg-[#16A34A] text-white px-2.5 py-1 rounded-lg shadow-xs">
                {t('common.instant', 'Instant')} (&lt; 5s)
              </span>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="text-lg font-extrabold text-[#0F172A] dark:text-white font-display mb-2">
                  {t('landing.pillar2Title', 'Immediate Network Transfers')}
                </h3>
                <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 leading-relaxed">
                  {t('landing.pillar2Desc', 'Receive and settle funds instantly with other Trust Link Bank members or via Fedwire/ACH, Pix Brazil, SPEI Mexico, Interac Canada, and SEPA.')}
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs font-bold text-[#16A34A] dark:text-emerald-400">
                <Zap className="w-4 h-4" />
                <span>Fedwire • PIX • SPEI • Interac • SEPA</span>
              </div>
            </div>
          </div>

          {/* Card 3: Institutional Security & Double-Entry Ledger */}
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
            <div className="h-48 relative overflow-hidden bg-slate-900">
              <img
                src="https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80"
                alt="Bank-Grade Security & Compliance"
                className="w-full h-full object-cover opacity-80 hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent" />
              <span className="absolute bottom-3 left-4 text-[11px] font-bold bg-slate-900/90 border border-slate-700 text-emerald-400 px-2.5 py-1 rounded-lg shadow-xs">
                AES-256 &amp; KYC 2
              </span>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="text-lg font-extrabold text-[#0F172A] dark:text-white font-display mb-2">
                  {t('landing.pillar3Title', 'Bank-Grade Security & Compliance')}
                </h3>
                <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 leading-relaxed">
                  {t('landing.pillar3Desc', '256-bit military-grade encryption, strict 2FA authentication, and continuous double-entry accounting verification.')}
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs font-bold text-[#0F172A] dark:text-white">
                <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
                <span>{t('landing.doubleEntryAudit', 'Double-Entry Ledger Accounting')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NEW: POPULAR BANKS WORLDWIDE SHOWCASE SECTION WITH REGIONAL FILTERING */}
      <section className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
              <Building2 className="w-4 h-4 text-[#2563EB]" />
              <span>{t('landing.supportedInstitutions', 'Over 2,500+ Financial Institutions Connected')}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight font-display mb-3">
              {t('landing.popularBanksTitle', 'Seamless Connectivity with World-Leading Banks')}
            </h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed mb-6">
              {t('landing.popularBanksSubtitle', 'Direct wire, ACH, Pix, SPEI, and SEPA settlement networks connecting you directly to top banking institutions across the Americas and globally.')}
            </p>

            {/* Regional Filter Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-slate-800/80 rounded-2xl max-w-xl mx-auto border border-slate-700/60">
              <button
                type="button"
                onClick={() => setBankRegion('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  bankRegion === 'all' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t('landing.banksFilterAll', 'All Major Banks')}
              </button>
              <button
                type="button"
                onClick={() => setBankRegion('na')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  bankRegion === 'na' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t('landing.banksFilterNorthAmerica', 'North America (US & Canada)')}
              </button>
              <button
                type="button"
                onClick={() => setBankRegion('sa')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  bankRegion === 'sa' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t('landing.banksFilterSouthAmerica', 'South America (LatAm)')}
              </button>
              <button
                type="button"
                onClick={() => setBankRegion('global')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  bankRegion === 'global' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t('landing.banksFilterGlobal', 'Global & Europe')}
              </button>
            </div>
          </div>

          {/* Grid of Major Connected Banks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredBanks.map((bank, idx) => (
              <div
                key={idx}
                className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 hover:border-blue-500/40 p-4 rounded-2xl transition-all duration-200 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{bank.flag}</span>
                      <div>
                        <h4 className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors">
                          {bank.name}
                        </h4>
                        <p className="text-[11px] text-slate-400">{bank.country}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-700/80 text-slate-300">
                      {bank.tier}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5 text-blue-300 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                    <span>{bank.rail}</span>
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{t('landing.banksConnectedStatus', 'Active 24/7')}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Clearing Network Badges */}
          <div className="mt-10 p-5 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex flex-wrap items-center justify-around gap-4 text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
              <span>US Fedwire & NACHA ACH</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
              <span>Interac e-Transfer Canada</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
              <span>Banco Central do Brasil PIX</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
              <span>Banco de México SPEI</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
              <span>SWIFT GPI & SEPA Instant</span>
            </span>
          </div>
        </div>
      </section>

      {/* LIVE CURRENCY CONVERTER & TRANSFER SIMULATOR */}
      <section className="bg-slate-50 py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider">
              {t('landing.calculatorTitle', 'Live Currency & Transfer Simulator')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] mt-1 font-display">
              {t('landing.calculatorSubtitle', 'Calculate your transfers with transparent mid-market exchange rates and zero surprise fees.')}
            </h2>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              {/* You Send Input */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 focus-within:border-blue-500 focus-within:bg-white transition-all">
                <span className="block text-xs font-bold text-slate-500 mb-1">
                  {t('landing.calcYouSend', 'You Send')}
                </span>
                <div className="flex items-center justify-between gap-3">
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={calcAmount || ''}
                    onChange={(e) => setCalcAmount(parseFloat(e.target.value) || 0)}
                    className="w-full text-2xl font-black font-display text-[#0F172A] focus:outline-none bg-transparent tabular-nums"
                  />
                  <select
                    value={calcSourceCurrency}
                    onChange={(e) => setCalcSourceCurrency(e.target.value as any)}
                    className="bg-white border border-slate-300 font-extrabold text-sm text-[#0F172A] px-3 py-2 rounded-xl focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="USD">🇺🇸 USD</option>
                    <option value="CAD">🇨🇦 CAD</option>
                    <option value="EUR">🇪🇺 EUR</option>
                  </select>
                </div>
              </div>

              {/* Recipient Gets */}
              <div className="p-4 rounded-2xl bg-[#EFF6FF] border border-blue-200">
                <span className="block text-xs font-bold text-blue-700 mb-1">
                  {t('landing.calcRecipientGets', 'Recipient Receives')}
                </span>
                <div className="flex items-center justify-between gap-3">
                  <div className="text-2xl font-black font-display text-[#16A34A] tabular-nums">
                    {formatCurrency(calcConverted, calcTargetCurrency)}
                  </div>
                  <select
                    value={calcTargetCurrency}
                    onChange={(e) => setCalcTargetCurrency(e.target.value as any)}
                    className="bg-white border border-blue-300 font-extrabold text-sm text-[#0F172A] px-3 py-2 rounded-xl focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="BRL">🇧🇷 BRL</option>
                    <option value="MXN">🇲🇽 MXN</option>
                    <option value="COP">🇨🇴 COP</option>
                    <option value="ARS">🇦🇷 ARS</option>
                    <option value="CAD">🇨🇦 CAD</option>
                    <option value="EUR">🇪🇺 EUR</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Rates & Benefits Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block">{t('landing.calcGuaranteedRate', 'Guaranteed Mid-Market Rate')}</span>
                <span className="font-extrabold text-[#0F172A] font-mono mt-0.5 block">
                  1 {calcSourceCurrency} = {calcRate.toFixed(4)} {calcTargetCurrency}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">{t('landing.calcFee', 'Transfer Fee')}</span>
                <span className="font-extrabold text-[#16A34A] mt-0.5 block">
                  {t('landing.calcZeroFee', '0.00 (Free for TLB members)')}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">{t('landing.calcDelivery', 'Delivery Speed')}</span>
                <span className="font-extrabold text-blue-700 mt-0.5 block">
                  {t('landing.calcInstant', 'Instant (< 5 seconds)')}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/register')}
              className="w-full bg-[#2563EB] hover:bg-[#1E3A8A] text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5"
            >
              <span>{t('landing.calcCta', 'Open Free Account to Send This Amount')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Corridors Grid */}
      <section className="bg-white border-y border-slate-200 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider">
              {t('landing.regionalCoverageTitle', 'Regional & Global Coverage')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] mt-1 font-display">
              {t('landing.coverageTitle', 'Coverage & Corridors')}
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1">
              {t('landing.regionalCoverageSubtitle', 'Direct settlement corridors designed for local currencies and cross-border agility')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {americasCorridors.map((c, i) => (
              <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
                <span className="text-3xl shrink-0">{c.flag}</span>
                <div className="overflow-hidden">
                  <div className="font-bold text-sm text-[#0F172A] truncate">{c.country}</div>
                  <div className="text-xs text-[#64748B]">{c.region}</div>
                  <div className="text-[11px] text-[#2563EB] font-semibold mt-0.5 truncate">{c.channels}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ready CTA Section */}
      <section className="bg-[#0F172A] text-white py-16 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight font-display">
            {t('landing.readyCtaTitle', 'Ready to open your Trust Link Bank account?')}
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
            {t('landing.readyCtaSubtitle', 'Join thousands of clients across the Americas. Open your account in 2 minutes with your preferred currency and start with zero balance.')}
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate('/register')}
              className="bg-[#2563EB] hover:bg-[#1E3A8A] text-white px-8 py-4 rounded-xl font-bold text-base shadow-xl shadow-blue-500/25 transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <span>{t('landing.openAccountNow', 'Open My Account Now')}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-10 px-4 sm:px-6 lg:px-8 text-xs text-[#64748B]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#2563EB] flex items-center justify-center text-white font-black text-[10px] tracking-wider">
              TLB
            </div>
            <span className="font-bold text-[#0F172A] text-sm">Trust Link Bank Technologies Inc.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 font-medium">
            <Link to="/features" className="hover:text-[#0F172A] transition-colors">
              {t('landing.navFeatures', 'Features')}
            </Link>
            <Link to="/about" className="hover:text-[#0F172A] transition-colors">
              {t('landing.navAbout', 'About')}
            </Link>
            <Link to="/security" className="hover:text-[#0F172A] transition-colors">
              {t('landing.navSecurity', 'Security')}
            </Link>
            <Link to="/register" className="hover:text-[#0F172A] transition-colors">
              {t('landing.ctaOpenAccount', 'Open Account')}
            </Link>
            <Link to="/admin/login" className="text-slate-400 hover:text-[#2563EB] transition-colors">
              {t('admin.login.portalLink', 'Admin Portal')}
            </Link>
          </div>

          <div className="text-slate-400 text-center md:text-right">
            {t('landing.allRightsReserved', '© 2026 Trust Link Bank Technologies Inc. All rights reserved.')}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
