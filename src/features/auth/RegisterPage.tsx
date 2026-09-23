import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheck,
  ArrowRight,
  Globe2,
  Lock,
  Phone,
  Mail,
  Check,
  X,
  Eye,
  EyeOff,
} from 'lucide-react';
import { authApi } from '../../services/api/client';
import { useAppStore } from '../../app/store';

export const RegisterPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { setLanguage } = useAppStore();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [countryIndex, setCountryIndex] = useState(0);
  const [idMode, setIdMode] = useState<'phone' | 'email'>('phone');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [accountLang, setAccountLang] = useState<'fr' | 'en'>(i18n.language.startsWith('en') ? 'en' : 'fr');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const countries = [
    { name: 'Cameroun', code: '+237', flag: '🇨🇲' },
    { name: "Côte d'Ivoire", code: '+225', flag: '🇨🇮' },
    { name: 'Sénégal', code: '+221', flag: '🇸🇳' },
    { name: 'Gabon', code: '+241', flag: '🇬🇦' },
    { name: 'RDC', code: '+243', flag: '🇨🇩' },
    { name: 'France', code: '+33', flag: '🇫🇷' },
  ];

  const currentCountry = countries[countryIndex];

  // Password evaluation
  const passwordChecks = useMemo(() => {
    return {
      hasMinLen: password.length >= 8,
      hasNumber: /\d/.test(password),
      hasUpper: /[A-Z]/.test(password),
    };
  }, [password]);

  const passwordStrength = useMemo(() => {
    if (!password) return { label: t('auth.pending'), color: 'text-slate-400', bar: 'w-0 bg-slate-300' };
    const score = (passwordChecks.hasMinLen ? 1 : 0) + (passwordChecks.hasNumber ? 1 : 0) + (passwordChecks.hasUpper ? 1 : 0);
    if (score === 1) return { label: t('auth.weak'), color: 'text-rose-500', bar: 'w-1/3 bg-rose-500' };
    if (score === 2) return { label: t('auth.medium'), color: 'text-amber-500', bar: 'w-2/3 bg-amber-500' };
    return { label: t('auth.strong'), color: 'text-emerald-500', bar: 'w-full bg-emerald-500' };
  }, [password, passwordChecks, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      setErrorMsg('Veuillez accepter les Conditions Générales d\'Utilisation.');
      return;
    }
    if (!passwordChecks.hasMinLen || !passwordChecks.hasNumber) {
      setErrorMsg('Le mot de passe doit comporter au moins 8 caractères et un chiffre.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const fullIdentifier = idMode === 'phone' ? `${currentCountry.code} ${identifier}` : identifier;
      await authApi.register({
        firstName,
        lastName,
        country: currentCountry.name,
        countryCode: currentCountry.code,
        flag: currentCountry.flag,
        identifier: fullIdentifier,
        isPhone: idMode === 'phone',
        language: accountLang,
      });

      // Save language choice
      setLanguage(accountLang);
      navigate('/auth/otp');
    } catch {
      setErrorMsg('Une erreur est survenue lors de la création du compte.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <div className="max-w-xl w-full mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#14B8A6] to-[#2563EB] flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-teal-500/20">
            NP
          </div>
          <span className="font-extrabold text-xl text-[#0F172A] tracking-tight font-display">NovaPay</span>
        </Link>

        <button
          onClick={() => {
            const next = i18n.language === 'fr' ? 'en' : 'fr';
            setLanguage(next);
            setAccountLang(next);
          }}
          type="button"
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
        >
          <Globe2 className="w-3.5 h-3.5 text-[#14B8A6]" />
          <span>{i18n.language.toUpperCase()}</span>
        </button>
      </div>

      {/* Main Card */}
      <div className="max-w-xl w-full mx-auto my-6 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50">
        {/* Step progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span className="text-[#14B8A6] font-bold">{t('auth.step1of2')}</span>
            <span>{t('auth.stepTitle')}</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="w-1/2 h-full bg-[#14B8A6] rounded-full" />
          </div>
        </div>

        <div className="text-left mb-6">
          <h1 className="text-2xl font-black text-[#0F172A] tracking-tight font-display mb-1">
            {t('auth.registerTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {t('auth.registerSubtitle')}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* First Name & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('auth.firstName')} *
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Amina"
                required
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/20 text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('auth.lastName')} *
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Diallo"
                required
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/20 text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none font-medium"
              />
            </div>
          </div>

          {/* Country of residence */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t('auth.countryOfResidence')} *
            </label>
            <select
              value={countryIndex}
              onChange={(e) => setCountryIndex(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-[#0F172A] font-medium focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/20 focus:outline-none cursor-pointer"
            >
              {countries.map((c, idx) => (
                <option key={c.code} value={idx}>
                  {c.flag} {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          {/* Primary Identifier Toggle */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                {t('auth.primaryIdentifier')} *
              </label>
              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setIdMode('phone');
                    setIdentifier('');
                  }}
                  className={`font-semibold transition-colors ${
                    idMode === 'phone' ? 'text-[#14B8A6] underline' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Téléphone
                </button>
                <span className="text-slate-300">/</span>
                <button
                  type="button"
                  onClick={() => {
                    setIdMode('email');
                    setIdentifier('');
                  }}
                  className={`font-semibold transition-colors ${
                    idMode === 'email' ? 'text-[#14B8A6] underline' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Email
                </button>
              </div>
            </div>

            {idMode === 'phone' ? (
              <div className="flex rounded-xl border border-slate-300 focus-within:border-[#14B8A6] focus-within:ring-2 focus-within:ring-[#14B8A6]/20 overflow-hidden transition-all">
                <span className="bg-slate-50 border-r border-slate-300 px-3 py-2.5 text-xs font-bold text-slate-700 flex items-center gap-1">
                  <span>{currentCountry.flag}</span>
                  <span>{currentCountry.code}</span>
                </span>
                <input
                  type="tel"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="690 45 89 45"
                  required
                  className="flex-1 px-3 py-2.5 text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none font-medium"
                />
              </div>
            ) : (
              <div className="flex items-center rounded-xl border border-slate-300 focus-within:border-[#14B8A6] focus-within:ring-2 focus-within:ring-[#14B8A6]/20 px-3 overflow-hidden transition-all">
                <Mail className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="amina.diallo@example.com"
                  required
                  className="flex-1 py-2.5 text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none font-medium"
                />
              </div>
            )}
          </div>

          {/* Password & Live Strength */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t('auth.loginPassword')} *
            </label>
            <div className="flex items-center rounded-xl border border-slate-300 focus-within:border-[#14B8A6] focus-within:ring-2 focus-within:ring-[#14B8A6]/20 px-3 overflow-hidden transition-all">
              <Lock className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.passwordPlaceholder')}
                required
                className="flex-1 py-2.5 text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Live Strength Bar */}
            <div className="mt-2">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-slate-500">{t('auth.passwordSecurity')}</span>
                <span className={`font-bold ${passwordStrength.color}`}>{passwordStrength.label}</span>
              </div>
              <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-300 ${passwordStrength.bar}`} />
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-500">
                <span className={`flex items-center gap-0.5 ${passwordChecks.hasMinLen ? 'text-emerald-600 font-bold' : ''}`}>
                  {passwordChecks.hasMinLen ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 text-slate-300" />}
                  {t('auth.ruleLength')}
                </span>
                <span className={`flex items-center gap-0.5 ${passwordChecks.hasNumber ? 'text-emerald-600 font-bold' : ''}`}>
                  {passwordChecks.hasNumber ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 text-slate-300" />}
                  {t('auth.ruleNumber')}
                </span>
                <span className={`flex items-center gap-0.5 ${passwordChecks.hasUpper ? 'text-emerald-600 font-bold' : ''}`}>
                  {passwordChecks.hasUpper ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 text-slate-300" />}
                  {t('auth.ruleUpper')}
                </span>
              </div>
            </div>
          </div>

          {/* Account Language Preference */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t('auth.accountLanguage')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAccountLang('fr')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold text-left flex items-center justify-between transition-all ${
                  accountLang === 'fr'
                    ? 'border-[#14B8A6] bg-teal-50/50 text-[#0F172A]'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>🇫🇷 Français (FR)</span>
                {accountLang === 'fr' && <Check className="w-3.5 h-3.5 text-[#14B8A6]" />}
              </button>

              <button
                type="button"
                onClick={() => setAccountLang('en')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold text-left flex items-center justify-between transition-all ${
                  accountLang === 'en'
                    ? 'border-[#14B8A6] bg-teal-50/50 text-[#0F172A]'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>🇬🇧 English (EN)</span>
                {accountLang === 'en' && <Check className="w-3.5 h-3.5 text-[#14B8A6]" />}
              </button>
            </div>
          </div>

          {/* Accept Terms Checkbox */}
          <div className="flex items-start pt-1">
            <input
              id="cgu"
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-[#14B8A6] border-slate-300 rounded focus:ring-[#14B8A6]"
            />
            <label
              htmlFor="cgu"
              className="ml-2.5 text-xs text-slate-600 leading-relaxed cursor-pointer"
              dangerouslySetInnerHTML={{ __html: t('auth.acceptTerms') }}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#14B8A6] hover:bg-[#0D9488] text-white py-3 px-4 rounded-xl text-sm font-bold shadow-md shadow-teal-500/20 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 disabled:opacity-50"
          >
            <span>{isLoading ? t('common.loading') : t('auth.continueVerification')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Existing account link */}
        <div className="mt-5 text-center text-xs text-slate-500">
          <span>{t('auth.alreadyHaveAccount')} </span>
          <Link to="/auth/login" className="text-[#2563EB] font-bold hover:underline">
            {t('auth.signIn')}
          </Link>
        </div>
      </div>

      {/* Security guarantee footer */}
      <div className="max-w-xl w-full mx-auto text-center flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>{t('auth.securityGuarantee')}</span>
      </div>
    </div>
  );
};
