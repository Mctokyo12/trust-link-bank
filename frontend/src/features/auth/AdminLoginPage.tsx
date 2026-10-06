import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  Zap,
  ArrowLeft,
} from 'lucide-react';
import { authApi } from '../../services/api/client';
import { useAppStore } from '../../app/store';
import { LanguageSelector } from '../../components/common/LanguageSelector';
import { ThemeToggle } from '../../components/common/ThemeToggle';

export const AdminLoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { initApp } = useAppStore();

  const [identifier, setIdentifier] = useState('admin@trustlinkbank.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setErrorMsg(t('auth.enterIdentifierError'));
      return;
    }
    setIsLoading(true);
    setErrorMsg('');

    try {
      const user = await authApi.login(identifier.trim(), password);
      if (user.role !== 'admin' && user.role !== 'super_admin') {
        setErrorMsg(t('admin.login.notAuthorized'));
        setIsLoading(false);
        return;
      }
      await initApp();
      navigate('/admin');
    } catch (err: any) {
      setErrorMsg(err?.message || t('auth.invalidCredentialsError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAdminAccess = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      await authApi.login('admin@trustlinkbank.com', 'admin123');
      await initApp();
      navigate('/admin');
    } catch (err: any) {
      setErrorMsg(err?.message || t('auth.invalidCredentialsError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 transition-colors">
      {/* Top Header */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs tracking-wider shadow-md shadow-blue-500/20 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="hidden sm:block">
            <span className="font-extrabold text-lg text-white tracking-tight font-display block leading-none">
              {t('admin.headerTitle')}
            </span>
            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">
              {t('admin.supervisionBadge')}
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2 shrink-0">
          <ThemeToggle variant="icon" />
          <LanguageSelector />
        </div>
      </div>

      {/* Main Card */}
      <div className="max-w-md w-full mx-auto my-8 bg-[#0F172A] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60">
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-800">
          <div className="w-11 h-11 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800">
              {t('admin.login.badge')}
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight font-display mt-1">
              {t('admin.login.title')}
            </h1>
          </div>
        </div>

        <p className="text-xs text-slate-400 mb-5 leading-relaxed">
          {t('admin.login.subtitle')}
        </p>

        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">
              {t('admin.login.identifierLabel')}
            </label>
            <div className="flex items-center rounded-xl border border-slate-700 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-900/40 px-3 overflow-hidden transition-all bg-[#1E293B]">
              <Mail className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="admin@trustlinkbank.com"
                required
                className="flex-1 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none font-medium bg-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">
              {t('auth.password')}
            </label>
            <div className="flex items-center rounded-xl border border-slate-700 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-900/40 px-3 overflow-hidden transition-all bg-[#1E293B]">
              <Lock className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="flex-1 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none font-mono bg-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-200 focus:outline-none cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-blue-400" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#2563EB] hover:bg-blue-500 text-white py-3 px-4 rounded-xl text-sm font-bold shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <span>{isLoading ? t('auth.loggingIn') : t('admin.login.submitBtn')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-5 pt-5 border-t border-slate-800 space-y-3">
          <button
            type="button"
            onClick={handleQuickAdminAccess}
            disabled={isLoading}
            className="w-full bg-slate-800/90 hover:bg-slate-800 text-blue-300 border border-slate-700 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>{t('admin.login.quickAccessBtn')}</span>
          </button>

          <div className="text-center pt-1">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-semibold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t('admin.login.backToClientLogin')}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Security note footer */}
      <div className="max-w-md w-full mx-auto text-center flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>{t('admin.regulatoryFooter')}</span>
      </div>
    </div>
  );
};

export default AdminLoginPage;
