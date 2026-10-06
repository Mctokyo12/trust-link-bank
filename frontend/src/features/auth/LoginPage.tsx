import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Eye,
  EyeOff,
  Lock,
  Phone,
  Mail,
  Fingerprint,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { authApi } from '../../services/api/client';
import { useAppStore } from '../../app/store';
import { LanguageSelector } from '../../components/common/LanguageSelector';
import { ThemeToggle } from '../../components/common/ThemeToggle';

const AMERICAS_COUNTRIES = [
  { name: 'United States', code: '+1', flag: '🇺🇸' },
  { name: 'Canada', code: '+1', flag: '🇨🇦' },
  { name: 'Mexico', code: '+52', flag: '🇲🇽' },
  { name: 'Brazil', code: '+55', flag: '🇧🇷' },
  { name: 'Argentina', code: '+54', flag: '🇦🇷' },
  { name: 'Colombia', code: '+57', flag: '🇨🇴' },
  { name: 'Chile', code: '+56', flag: '🇨🇱' },
  { name: 'France', code: '+33', flag: '🇫🇷' },
];

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { initApp } = useAppStore();

  const [authMode, setAuthMode] = useState<'phone' | 'email'>('email');
  const [selectedCountry, setSelectedCountry] = useState(AMERICAS_COUNTRIES[0]);
  const [identifier, setIdentifier] = useState('alex.rivera@trustlinkbank.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setErrorMsg(t('auth.enterIdentifierError'));
      return;
    }
    setIsLoading(true);
    setErrorMsg('');

    try {
      const fullIdentifier = authMode === 'phone' ? `${selectedCountry.code} ${identifier.trim()}` : identifier.trim();
      const user = await authApi.login(fullIdentifier, password);
      if (user.role === 'admin' || user.role === 'super_admin') {
        setErrorMsg(
          t(
            'auth.adminUseDedicatedPortal',
            'Administrator accounts must sign in through the dedicated Admin Portal (/admin/login).'
          )
        );
        setIsLoading(false);
        return;
      }
      await initApp();
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err?.message || t('auth.invalidCredentialsError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometric = async () => {
    if (!identifier.trim() || !password) {
      setErrorMsg(t('auth.enterIdentifierError'));
      return;
    }
    setIsLoading(true);
    try {
      const user = await authApi.login(identifier.trim(), password);
      if (user.role === 'admin' || user.role === 'super_admin') {
        setErrorMsg(
          t(
            'auth.adminUseDedicatedPortal',
            'Administrator accounts must sign in through the dedicated Admin Portal (/admin/login).'
          )
        );
        setIsLoading(false);
        return;
      }
      await initApp();
      navigate('/dashboard');
    } catch {
      setErrorMsg(t('auth.invalidCredentialsError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] flex flex-col justify-between p-4 sm:p-6 lg:p-8 transition-colors">
      {/* Top Header */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
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
          <LanguageSelector />
        </div>
      </div>

      {/* Main Card */}
      <div className="max-w-md w-full mx-auto my-8 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-black/50 transition-colors">
        <div className="text-left mb-6">
          <h1 className="text-2xl font-black text-[#0F172A] dark:text-white tracking-tight font-display mb-1">
            {t('auth.welcomeBack')}
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400">
            {t('auth.connectSubtitle')}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-[#DC2626] dark:text-red-400 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Channel Switcher */}
        <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl mb-5">
          <button
            type="button"
            onClick={() => {
              setAuthMode('email');
              setIdentifier('alex.rivera@trustlinkbank.com');
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              authMode === 'email' ? 'bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-white shadow-xs' : 'text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400" />
            <span>{t('auth.email')}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('phone');
              setIdentifier('11 98765-4321');
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              authMode === 'phone' ? 'bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-white shadow-xs' : 'text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white'
            }`}
          >
            <Phone className="w-3.5 h-3.5 text-[#2563EB] dark:text-blue-400" />
            <span>{t('auth.phone')}</span>
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Identifier Input */}
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] dark:text-slate-200 mb-1.5">
              {authMode === 'phone' ? t('auth.phoneNumber') : t('auth.emailAddress')}
            </label>

            {authMode === 'phone' ? (
              <div className="flex rounded-xl border border-slate-300 dark:border-slate-700 focus-within:border-[#2563EB] dark:focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-900/30 overflow-hidden transition-all bg-white dark:bg-[#1E293B]">
                <select
                  value={selectedCountry.code}
                  onChange={(e) => {
                    const c = AMERICAS_COUNTRIES.find((item) => item.code === e.target.value);
                    if (c) setSelectedCountry(c);
                  }}
                  className="bg-slate-50 dark:bg-slate-800 border-r border-slate-300 dark:border-slate-700 px-3 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                >
                  {AMERICAS_COUNTRIES.map((c) => (
                    <option key={c.code + c.name} value={c.code} className="dark:bg-[#1E293B] dark:text-white">
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="11 98765-4321"
                  required
                  className="flex-1 px-3 py-2.5 text-sm text-[#0F172A] dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none font-medium bg-transparent"
                />
              </div>
            ) : (
              <div className="flex items-center rounded-xl border border-slate-300 dark:border-slate-700 focus-within:border-[#2563EB] dark:focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-900/30 px-3 overflow-hidden transition-all bg-white dark:bg-[#1E293B]">
                <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 mr-2 shrink-0" />
                <input
                  type="email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="carlos.silva@trustlinkbank.com"
                  required
                  className="flex-1 py-2.5 text-sm text-[#0F172A] dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none font-medium bg-transparent"
                />
              </div>
            )}
          </div>

          {/* Password Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#0F172A] dark:text-slate-200">
                {t('auth.password')}
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-[#2563EB] dark:text-blue-400 hover:underline"
              >
                {t('auth.forgotPassword')}
              </Link>
            </div>
            <div className="flex items-center rounded-xl border border-slate-300 dark:border-slate-700 focus-within:border-[#2563EB] dark:focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 dark:focus-within:ring-blue-900/30 px-3 overflow-hidden transition-all bg-white dark:bg-[#1E293B]">
              <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 mr-2 shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="flex-1 py-2.5 text-sm text-[#0F172A] dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none font-mono bg-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-[#2563EB] dark:text-blue-400" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center">
            <input
              id="remember"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-[#2563EB] border-slate-300 dark:border-slate-700 rounded focus:ring-[#2563EB]"
            />
            <label htmlFor="remember" className="ml-2 text-xs text-[#64748B] dark:text-slate-400 cursor-pointer">
              {t('auth.rememberMe')}
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#2563EB] hover:bg-[#1E3A8A] text-white py-3 px-4 rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
          >
            <span>{isLoading ? t('auth.loggingIn') : t('auth.signIn')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Biometric Login button */}
        <div className="mt-5 pt-5 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={handleBiometric}
            className="w-full bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-[#0F172A] dark:text-white border border-slate-200 dark:border-slate-700 py-2.5 px-4 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Fingerprint className="w-4 h-4 text-[#2563EB] dark:text-blue-400" />
            <span>{t('auth.biometricLogin')}</span>
          </button>
        </div>

        {/* Register link */}
        <div className="mt-6 text-center text-xs text-[#64748B] dark:text-slate-400">
          <span>{t('auth.noAccountYet')} </span>
          <Link to="/register" className="text-[#2563EB] dark:text-blue-400 font-bold hover:underline">
            {t('auth.createAccount')}
          </Link>
        </div>
      </div>

      {/* Security note footer */}
      <div className="max-w-md w-full mx-auto text-center flex items-center justify-center gap-1.5 text-[11px] text-[#64748B] dark:text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A] dark:text-emerald-400" />
        <span>{t('auth.securityTlsNotice')}</span>
      </div>
    </div>
  );
};

export default LoginPage;
