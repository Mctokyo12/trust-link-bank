import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import {
  ShieldCheck,
  ArrowRight,
  Lock,
  Phone,
  Mail,
  Check,
  X,
  Eye,
  EyeOff,
  Coins,
  Globe2,
} from 'lucide-react';
import { authApi } from '../../services/api/client';
import { useAppStore } from '../../app/store';
import { LanguageSelector } from '../../components/common/LanguageSelector';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { SUPPORTED_LANGUAGES } from '../../i18n/languages';
import { SUPPORTED_CURRENCIES } from '../../utils/currencies';
import { CurrencyCode } from '../../types';

// Americas and core target market countries
const AMERICAS_COUNTRIES = [
  { name: 'United States', code: '+1', flag: '🇺🇸' },
  { name: 'Canada', code: '+1', flag: '🇨🇦' },
  { name: 'Mexico', code: '+52', flag: '🇲🇽' },
  { name: 'Brazil', code: '+55', flag: '🇧🇷' },
  { name: 'Argentina', code: '+54', flag: '🇦🇷' },
  { name: 'Chile', code: '+56', flag: '🇨🇱' },
  { name: 'Colombia', code: '+57', flag: '🇨🇴' },
  { name: 'Peru', code: '+51', flag: '🇵🇪' },
  { name: 'Uruguay', code: '+598', flag: '🇺🇾' },
  { name: 'Paraguay', code: '+595', flag: '🇵🇾' },
  { name: 'Bolivia', code: '+591', flag: '🇧🇴' },
  { name: 'Guyana', code: '+592', flag: '🇬🇾' },
  { name: 'Suriname', code: '+597', flag: '🇸🇷' },
  { name: 'France', code: '+33', flag: '🇫🇷' },
];

const VALID_CURRENCIES = [
  'USD', 'CAD', 'MXN', 'BRL', 'ARS', 'CLP', 'COP',
  'PEN', 'UYU', 'PYG', 'BOB', 'GYD', 'SRD', 'EUR'
] as const;

// Zod Registration Schema per Requirement 1
export const registerSchema = z
  .object({
    firstName: z.string().trim().min(2, 'Le prénom doit comporter au moins 2 caractères / First name must be at least 2 characters'),
    lastName: z.string().trim().min(2, 'Le nom doit comporter au moins 2 caractères / Last name must be at least 2 characters'),
    email: z.string().trim().email('Veuillez saisir une adresse e-mail valide / Please enter a valid email address'),
    phone: z.string().trim().min(6, 'Veuillez saisir un numéro de téléphone valide / Please enter a valid phone number'),
    password: z
      .string()
      .min(8, 'Le mot de passe doit comporter au moins 8 caractères / Password must be at least 8 characters')
      .regex(/\d/, 'Le mot de passe doit contenir au moins 1 chiffre / Password must contain at least 1 digit')
      .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins 1 majuscule / Password must contain at least 1 uppercase letter'),
    confirmPassword: z.string().min(1, 'Veuillez confirmer votre mot de passe / Please confirm your password'),
    country: z.string().min(1, 'Veuillez sélectionner un pays / Please select a country'),
    countryCode: z.string().min(1, 'Code pays requis / Country code is required'),
    language: z.string().min(2, 'Veuillez sélectionner une langue / Please select a language'),
    currency_code: z.enum(VALID_CURRENCIES, {
      message: 'Veuillez sélectionner votre devise préférée / Please select your preferred currency',
    }),
    termsAccepted: z.literal(true, {
      message: 'Vous devez accepter les Conditions Générales / You must accept the Terms of Service',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas / Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { initApp, setLanguage } = useAppStore();

  const storedEmail = localStorage.getItem('novapay_pending_reg_email') || '';
  const storedPhone = localStorage.getItem('novapay_pending_reg_phone') || '';
  const storedFirstName = localStorage.getItem('novapay_pending_reg_first_name') || '';

  const [firstName, setFirstName] = useState(storedFirstName);
  const [lastName, setLastName] = useState('');
  const [countryIndex, setCountryIndex] = useState(0);
  const [email, setEmail] = useState(storedEmail);
  const [phone, setPhone] = useState(storedPhone.replace(/^\+\d+\s*/, ''));
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>('USD');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [accountLang, setAccountLang] = useState<string>(i18n.language || 'en');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState('');

  const currentCountry = AMERICAS_COUNTRIES[countryIndex] || AMERICAS_COUNTRIES[0];

  // Password evaluation
  const passwordChecks = useMemo(() => {
    return {
      hasMinLen: password.length >= 8,
      hasNumber: /\d/.test(password),
      hasUpper: /[A-Z]/.test(password),
    };
  }, [password]);

  const passwordStrength = useMemo(() => {
    if (!password) return { label: t('auth.pending') || 'Pending', color: 'text-slate-400', bar: 'w-0 bg-slate-300' };
    const score = (passwordChecks.hasMinLen ? 1 : 0) + (passwordChecks.hasNumber ? 1 : 0) + (passwordChecks.hasUpper ? 1 : 0);
    if (score === 1) return { label: t('auth.weak') || 'Weak', color: 'text-[#DC2626]', bar: 'w-1/3 bg-[#DC2626]' };
    if (score === 2) return { label: t('auth.medium') || 'Medium', color: 'text-amber-500', bar: 'w-2/3 bg-amber-500' };
    return { label: t('auth.strong') || 'Strong', color: 'text-[#16A34A]', bar: 'w-full bg-[#16A34A]' };
  }, [password, passwordChecks, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setErrorMsg('');

    const fullPhone = phone.trim() ? `${currentCountry.code} ${phone.trim()}` : '';

    // Validate using Zod
    const validationResult = registerSchema.safeParse({
      firstName,
      lastName,
      email,
      phone: fullPhone || `${currentCountry.code} 555 ${Math.floor(1000 + Math.random() * 9000)}`,
      password,
      confirmPassword,
      country: currentCountry.name,
      countryCode: currentCountry.code,
      language: accountLang,
      currency_code: currencyCode,
      termsAccepted: acceptedTerms,
    });

    if (!validationResult.success) {
      const errors: Record<string, string> = {};
      validationResult.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        if (path && !errors[path]) {
          errors[path] = issue.message;
        }
      });
      setFieldErrors(errors);
      const firstError = validationResult.error.issues[0]?.message;
      setErrorMsg(firstError || 'Veuillez vérifier les informations saisies.');
      return;
    }

    setIsLoading(true);

    try {
      const cleanEmail = email.trim();
      const resolvedPhone = fullPhone || `${currentCountry.code} 555 ${Math.floor(1000 + Math.random() * 9000)}`;

      await authApi.register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        country: currentCountry.name,
        countryCode: currentCountry.code,
        flag: currentCountry.flag,
        identifier: cleanEmail,
        isPhone: false,
        email: cleanEmail,
        phone: resolvedPhone,
        language: accountLang,
        currency_code: currencyCode,
        password,
        confirmPassword,
      });

      // Save language choice and initialize app store
      setLanguage(accountLang);
      await initApp();

      // Directly go to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Une erreur est survenue lors de la création du compte.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] flex flex-col justify-between p-4 sm:p-6 lg:p-8 transition-colors">
      {/* Top Header */}
      <div className="max-w-xl w-full mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#2563EB] flex items-center justify-center text-white font-black text-xs tracking-wider shadow-md shadow-blue-500/20 shrink-0">
            TLB
          </div>
          <div className="hidden sm:block">
            <span className="font-extrabold text-xl text-[#0F172A] dark:text-white tracking-tight font-display block leading-none">
              Trust Link Bank
            </span>
            <span className="text-[10px] text-[#64748B] dark:text-slate-400 font-medium">Americas & Global</span>
          </div>
        </Link>

        <div className="flex items-center gap-2 shrink-0">
          <ThemeToggle variant="icon" />
          <LanguageSelector onSelect={(code) => setAccountLang(code)} />
        </div>
      </div>

      {/* Main Card */}
      <div className="max-w-xl w-full mx-auto my-6 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-black/50 transition-colors">
        <div className="text-left mb-6">
          <h1 className="text-2xl font-black text-[#0F172A] dark:text-white tracking-tight font-display mb-1">
            {t('auth.registerTitle') || 'Create your Trust Link Bank account'}
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400">
            {t('auth.registerSubtitle') || 'Instant digital account opening across the Americas with zero opening fee.'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-[#DC2626] text-xs font-medium flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#DC2626] shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* First Name & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                {t('auth.firstName') || 'First Name'} *
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Carlos"
                required
                className={`w-full px-3 py-2.5 rounded-xl border text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none font-medium transition-all ${
                  fieldErrors.firstName
                    ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-2 focus:ring-red-100'
                    : 'border-slate-300 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100'
                }`}
              />
              {fieldErrors.firstName && (
                <p className="mt-1 text-[11px] text-[#DC2626]">{fieldErrors.firstName}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                {t('auth.lastName') || 'Last Name'} *
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Silva"
                required
                className={`w-full px-3 py-2.5 rounded-xl border text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none font-medium transition-all ${
                  fieldErrors.lastName
                    ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-2 focus:ring-red-100'
                    : 'border-slate-300 focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100'
                }`}
              />
              {fieldErrors.lastName && (
                <p className="mt-1 text-[11px] text-[#DC2626]">{fieldErrors.lastName}</p>
              )}
            </div>
          </div>

          {/* Preferred Currency Select (Required per Requirement 1) */}
          <div className="p-3.5 rounded-2xl bg-[#EFF6FF] border border-blue-200">
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="preferred_currency" className="text-xs font-bold text-[#1E3A8A] flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-[#2563EB]" />
                <span>{t('auth.preferredCurrencyTitle') || 'Preferred Account Currency'} *</span>
              </label>
              <span className="text-[10px] bg-blue-100 text-[#2563EB] font-bold px-2 py-0.5 rounded-full">
                {t('auth.initialZeroBalance') || 'Starting balance: 0.00'}
              </span>
            </div>
            <select
              id="preferred_currency"
              value={currencyCode}
              onChange={(e) => setCurrencyCode(e.target.value as CurrencyCode)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-blue-300 bg-white text-sm text-[#0F172A] font-bold focus:border-[#2563EB] focus:ring-2 focus:ring-blue-200 focus:outline-none cursor-pointer"
            >
              {SUPPORTED_CURRENCIES.map((curr) => (
                <option key={curr.code} value={curr.code}>
                  {curr.flag} {curr.label} — {curr.symbol}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-[11px] text-[#1E3A8A]/80">
              {t('auth.preferredCurrencyDesc') || 'This currency will be the base currency for your Trust Link Bank account. Your account will start with a strictly 0.00 balance.'}
            </p>
            {fieldErrors.currency_code && (
              <p className="mt-1 text-[11px] text-[#DC2626] font-medium">{fieldErrors.currency_code}</p>
            )}
          </div>

          {/* Country of residence */}
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              {t('auth.countryOfResidence') || 'Country of Residence'} *
            </label>
            <select
              value={countryIndex}
              onChange={(e) => setCountryIndex(Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-[#0F172A] font-medium focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 focus:outline-none cursor-pointer"
            >
              {AMERICAS_COUNTRIES.map((c, idx) => (
                <option key={c.name} value={idx}>
                  {c.flag} {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              {t('auth.emailAddress') || 'Email Address'} *
            </label>
            <div
              className={`flex items-center rounded-xl border px-3 overflow-hidden transition-all bg-white ${
                fieldErrors.email
                  ? 'border-[#DC2626] focus-within:ring-2 focus-within:ring-red-100'
                  : 'border-slate-300 focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-blue-100'
              }`}
            >
              <Mail className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.emailAddressPlaceholder') || 'name@example.com'}
                required
                className="flex-1 py-2.5 text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none font-medium"
              />
            </div>
            {fieldErrors.email ? (
              <p className="mt-1 text-[11px] text-[#DC2626]">{fieldErrors.email}</p>
            ) : (
              <p className="mt-1 text-[11px] text-[#64748B]">
                {t('auth.emailHelp', 'Your banking credentials and secure statements will be linked to this address.')}
              </p>
            )}
          </div>

          {/* Mobile Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              {t('auth.phoneNumber') || 'Phone Number'} *
            </label>
            <div
              className={`flex rounded-xl border overflow-hidden transition-all bg-white ${
                fieldErrors.phone
                  ? 'border-[#DC2626] focus-within:ring-2 focus-within:ring-red-100'
                  : 'border-slate-300 focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-blue-100'
              }`}
            >
              <span className="bg-slate-50 border-r border-slate-300 px-3 py-2.5 text-xs font-bold text-slate-700 flex items-center gap-1 shrink-0">
                <span>{currentCountry.flag}</span>
                <span>{currentCountry.code}</span>
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="415 555 0192"
                required
                className="flex-1 px-3 py-2.5 text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none font-medium"
              />
            </div>
            {fieldErrors.phone && (
              <p className="mt-1 text-[11px] text-[#DC2626]">{fieldErrors.phone}</p>
            )}
          </div>

          {/* Password & Confirm Password */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                {t('auth.loginPassword') || 'Password'} *
              </label>
              <div
                className={`flex items-center rounded-xl border px-3 overflow-hidden transition-all bg-white ${
                  fieldErrors.password
                    ? 'border-[#DC2626] focus-within:ring-2 focus-within:ring-red-100'
                    : 'border-slate-300 focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-blue-100'
                }`}
              >
                <Lock className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.passwordPlaceholder') || 'Min. 8 chars, 1 digit, 1 uppercase'}
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
              {fieldErrors.password && (
                <p className="mt-1 text-[11px] text-[#DC2626]">{fieldErrors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                {t('auth.confirmPassword') || 'Confirm Password'} *
              </label>
              <div
                className={`flex items-center rounded-xl border px-3 overflow-hidden transition-all bg-white ${
                  fieldErrors.confirmPassword
                    ? 'border-[#DC2626] focus-within:ring-2 focus-within:ring-red-100'
                    : 'border-slate-300 focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-blue-100'
                }`}
              >
                <Lock className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('auth.confirmPasswordPlaceholder') || 'Confirm your password'}
                  required
                  className="flex-1 py-2.5 text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-[11px] text-[#DC2626]">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            {/* Live Strength Bar */}
            <div>
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-[#64748B]">{t('auth.passwordSecurity') || 'Password Strength:'}</span>
                <span className={`font-bold ${passwordStrength.color}`}>{passwordStrength.label}</span>
              </div>
              <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-300 ${passwordStrength.bar}`} />
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-[10px] text-[#64748B]">
                <span className={`flex items-center gap-0.5 ${passwordChecks.hasMinLen ? 'text-[#16A34A] font-bold' : ''}`}>
                  {passwordChecks.hasMinLen ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 text-slate-300" />}
                  {t('auth.ruleLength') || '8 chars min'}
                </span>
                <span className={`flex items-center gap-0.5 ${passwordChecks.hasNumber ? 'text-[#16A34A] font-bold' : ''}`}>
                  {passwordChecks.hasNumber ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 text-slate-300" />}
                  {t('auth.ruleNumber') || '1 digit'}
                </span>
                <span className={`flex items-center gap-0.5 ${passwordChecks.hasUpper ? 'text-[#16A34A] font-bold' : ''}`}>
                  {passwordChecks.hasUpper ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 text-slate-300" />}
                  {t('auth.ruleUpper') || '1 uppercase'}
                </span>
              </div>
            </div>
          </div>

          {/* Account Language Preference */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-[#0F172A]">
                {t('auth.accountLanguage') || 'Account Language'}
              </label>
              <span className="text-[10px] text-[#64748B]">
                {t('auth.accountLanguageSubtitle') || 'Notifications & statements'}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected = accountLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      setAccountLang(lang.code);
                      setLanguage(lang.code);
                    }}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#2563EB] bg-[#EFF6FF] text-[#0F172A] ring-1 ring-[#2563EB]/20'
                        : 'border-slate-200 bg-white text-[#64748B] hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span>{lang.flag}</span>
                      <span className="truncate">{lang.nativeName}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#2563EB] shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Accept Terms Checkbox */}
          <div className="flex items-start pt-1">
            <input
              id="cgu"
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-[#2563EB] border-slate-300 rounded focus:ring-[#2563EB]"
            />
            <label
              htmlFor="cgu"
              className="ml-2.5 text-xs text-[#64748B] leading-relaxed cursor-pointer"
            >
              {t('auth.termsAgree', 'I unconditionally accept the Terms of Service and Privacy Policy of Trust Link Bank.')}
            </label>
          </div>
          {fieldErrors.termsAccepted && (
            <p className="text-[11px] text-[#DC2626]">{fieldErrors.termsAccepted}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#2563EB] hover:bg-[#1E3A8A] text-white py-3 px-4 rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
          >
            <span>{isLoading ? (t('common.loading') || 'Loading...') : (t('auth.registerButton') || 'Create My Account')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Existing account link */}
        <div className="mt-5 text-center text-xs text-[#64748B]">
          <span>{t('auth.alreadyHaveAccount') || 'Already have an account?'} </span>
          <Link to="/login" className="text-[#2563EB] font-bold hover:underline">
            {t('auth.signIn') || 'Sign In'}
          </Link>
        </div>
      </div>

      {/* Security guarantee footer */}
      <div className="max-w-xl w-full mx-auto text-center flex items-center justify-center gap-1.5 text-[11px] text-[#64748B]">
        <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
        <span>{t('auth.securityGuarantee') || '256-bit SSL encrypted • Compliant with central banking standards'}</span>
      </div>
    </div>
  );
};

export default RegisterPage;
