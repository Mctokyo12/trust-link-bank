import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Mail,
  Phone,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { authApi } from '../../services/api/client';
import { LanguageSelector } from '../../components/common/LanguageSelector';
import { ThemeToggle } from '../../components/common/ThemeToggle';

export const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'email' | 'phone'>('email');
  const [identifier, setIdentifier] = useState('carlos.silva@trustlinkbank.com');
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authApi.forgotPassword(identifier);
      setIsSent(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] flex flex-col justify-between p-4 sm:p-6 lg:p-8 transition-colors">
      {/* Brand Header */}
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
      <div className="max-w-md w-full mx-auto my-6 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-black/50">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>

        <h1 className="text-2xl font-black text-[#0F172A] dark:text-white tracking-tight font-display mb-1.5">
          {t('auth.forgotPasswordTitle', 'Password Reset')}
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 mb-6">
          {t('auth.forgotPasswordDesc', 'Enter your registered email or mobile number to receive secure recovery instructions.')}
        </p>

        {isSent ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-green-50 dark:bg-emerald-950/30 border border-green-200 dark:border-emerald-900/50 text-left">
              <div className="flex items-center gap-2 text-[#16A34A] dark:text-emerald-400 font-bold text-sm mb-1">
                <CheckCircle2 className="w-5 h-5 text-[#16A34A] dark:text-emerald-400 shrink-0" />
                <span>{t('auth.instructionsSent', 'Instructions Sent')}</span>
              </div>
              <p className="text-xs text-[#16A34A] dark:text-emerald-300 leading-relaxed">
                {t('auth.checkInbox', 'A secure reset link has been sent.')} ({identifier})
              </p>
            </div>

            <button
              onClick={() => navigate('/login')}
              className="w-full bg-[#2563EB] hover:bg-[#1E3A8A] text-white py-3 px-4 rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('auth.backToLogin', 'Back to Sign In')}</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Channel switcher */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setMode('email')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mode === 'email' ? 'bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-white shadow-xs' : 'text-[#64748B] dark:text-slate-400'
                }`}
              >
                {t('auth.byEmail', 'By Email')}
              </button>
              <button
                type="button"
                onClick={() => setMode('phone')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mode === 'phone' ? 'bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-white shadow-xs' : 'text-[#64748B] dark:text-slate-400'
                }`}
              >
                {t('auth.bySms', 'By Mobile')}
              </button>
            </div>

            {/* Input */}
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] dark:text-slate-200 mb-1.5">
                {mode === 'email' ? t('auth.emailAddress', 'Email Address') : t('auth.phoneNumber', 'Phone Number')}
              </label>
              <div className="flex items-center rounded-xl border border-slate-300 dark:border-slate-700 focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-blue-100 px-3 overflow-hidden transition-all bg-white dark:bg-[#1E293B]">
                {mode === 'email' ? (
                  <Mail className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                ) : (
                  <Phone className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                )}
                <input
                  type={mode === 'email' ? 'email' : 'tel'}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={mode === 'email' ? 'name@example.com' : '+1 415 555 0100'}
                  required
                  className="flex-1 py-2.5 text-sm text-[#0F172A] dark:text-white placeholder-slate-400 focus:outline-none font-medium bg-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#2563EB] hover:bg-[#1E3A8A] text-white py-3 px-4 rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <span>{isLoading ? t('common.loading', 'Sending...') : t('auth.sendInstructions', 'Send Instructions')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <Link to="/login" className="text-xs font-semibold text-[#2563EB] dark:text-blue-400 hover:underline">
                {t('auth.backToLogin', 'Back to Sign In')}
              </Link>
            </div>
          </form>
        )}
      </div>

      {/* Security guarantee footer */}
      <div className="max-w-md w-full mx-auto text-center flex items-center justify-center gap-1.5 text-[11px] text-[#64748B] dark:text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
        <span>{t('auth.securityTlsNotice', 'Protected by Trust Link banking security protocols')}</span>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
