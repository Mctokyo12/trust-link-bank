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
  Globe2,
} from 'lucide-react';
import { authApi } from '../../services/api/client';
import { useAppStore } from '../../app/store';

export const LoginPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { initApp, setLanguage } = useAppStore();

  const [authMode, setAuthMode] = useState<'phone' | 'email'>('phone');
  const [selectedCountry, setSelectedCountry] = useState({
    name: 'Cameroun',
    code: '+237',
    flag: '🇨🇲',
  });
  const [identifier, setIdentifier] = useState('690 45 89 45');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const fullIdentifier = authMode === 'phone' ? `${selectedCountry.code} ${identifier}` : identifier;
      await authApi.login(fullIdentifier, password);
      await initApp();
      navigate('/dashboard');
    } catch {
      setErrorMsg('Identifiants incorrects. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometric = async () => {
    setIsLoading(true);
    try {
      await authApi.login('amina.diallo@novapay.africa');
      await initApp();
      navigate('/dashboard');
    } catch {
      setErrorMsg('Échec de la validation biométrique.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Bar with Brand & Language */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#14B8A6] to-[#2563EB] flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-teal-500/20">
            NP
          </div>
          <span className="font-extrabold text-xl text-[#0F172A] tracking-tight font-display">NovaPay</span>
        </Link>

        <button
          onClick={() => setLanguage(i18n.language === 'fr' ? 'en' : 'fr')}
          type="button"
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
        >
          <Globe2 className="w-3.5 h-3.5 text-[#14B8A6]" />
          <span>{i18n.language.toUpperCase()}</span>
        </button>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black text-[#0F172A] tracking-tight font-display mb-1.5">
            {t('auth.welcomeBack')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {t('auth.connectSubtitle')}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {/* Tab Selection: Phone vs Email */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-5">
          <button
            type="button"
            onClick={() => {
              setAuthMode('phone');
              setIdentifier('690 45 89 45');
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              authMode === 'phone' ? 'bg-white text-[#0F172A] shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{t('auth.phone')}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('email');
              setIdentifier('amina.diallo@novapay.africa');
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              authMode === 'email' ? 'bg-white text-[#0F172A] shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>{t('auth.email')}</span>
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Identifier Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {authMode === 'phone' ? t('auth.phoneNumber') : t('auth.emailAddress')}
            </label>

            {authMode === 'phone' ? (
              <div className="flex rounded-xl border border-slate-300 focus-within:border-[#14B8A6] focus-within:ring-2 focus-within:ring-[#14B8A6]/20 overflow-hidden transition-all">
                <select
                  value={selectedCountry.code}
                  onChange={(e) => {
                    const c = countries.find((item) => item.code === e.target.value);
                    if (c) setSelectedCountry(c);
                  }}
                  className="bg-slate-50 border-r border-slate-300 px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                >
                  {countries.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>
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
                  placeholder="amina.diallo@novapay.africa"
                  required
                  className="flex-1 py-2.5 text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none font-medium"
                />
              </div>
            )}
          </div>

          {/* Password Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                {t('auth.password')}
              </label>
              <Link
                to="/auth/forgot-password"
                className="text-xs font-semibold text-[#2563EB] hover:underline"
              >
                {t('auth.forgotPassword')}
              </Link>
            </div>
            <div className="flex items-center rounded-xl border border-slate-300 focus-within:border-[#14B8A6] focus-within:ring-2 focus-within:ring-[#14B8A6]/20 px-3 overflow-hidden transition-all">
              <Lock className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
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
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center">
            <input
              id="remember"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-[#14B8A6] border-slate-300 rounded focus:ring-[#14B8A6]"
            />
            <label htmlFor="remember" className="ml-2 text-xs text-slate-600 cursor-pointer">
              {t('auth.rememberMe')}
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#14B8A6] hover:bg-[#0D9488] text-white py-3 px-4 rounded-xl text-sm font-bold shadow-md shadow-teal-500/20 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 disabled:opacity-50"
          >
            <span>{isLoading ? t('common.loading') : t('auth.signIn')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Biometric simulation button */}
        <div className="mt-5 pt-5 border-t border-slate-200">
          <button
            type="button"
            onClick={handleBiometric}
            className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 py-2.5 px-4 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
          >
            <Fingerprint className="w-4 h-4 text-[#14B8A6]" />
            <span>{t('auth.biometricLogin')}</span>
          </button>
        </div>

        {/* Register link */}
        <div className="mt-6 text-center text-xs text-slate-500">
          <span>{t('auth.newToNovaPay')} </span>
          <Link to="/auth/register" className="text-[#14B8A6] font-bold hover:underline">
            {t('auth.createAccount')}
          </Link>
        </div>
      </div>

      {/* Security note footer */}
      <div className="max-w-md w-full mx-auto text-center flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>{t('auth.protected2FA')}</span>
      </div>
    </div>
  );
};
