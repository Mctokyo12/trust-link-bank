import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Mail,
  Phone,
  Clock,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { authApi } from '../../services/api/client';

export const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'email' | 'phone'>('email');
  const [identifier, setIdentifier] = useState('amina.diallo@novapay.africa');
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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Brand Header */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#14B8A6] to-[#2563EB] flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-teal-500/20">
            NP
          </div>
          <span className="font-extrabold text-xl text-[#0F172A] tracking-tight font-display">NovaPay</span>
        </Link>
      </div>

      {/* Main Card */}
      <div className="max-w-md w-full mx-auto my-6 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>

        <h1 className="text-2xl font-black text-[#0F172A] tracking-tight font-display mb-1.5">
          {t('auth.forgotPasswordTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mb-6">
          {t('auth.forgotPasswordDesc')}
        </p>

        {isSent ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-left">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm mb-1">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{t('auth.instructionsSent')}</span>
              </div>
              <p className="text-xs text-emerald-700 leading-relaxed">
                {t('auth.checkInbox')} <strong className="font-mono font-bold">{identifier}</strong>. Suivez les instructions pour définir un nouveau mot de passe.
              </p>
            </div>

            <button
              onClick={() => navigate('/auth/login')}
              className="w-full bg-[#14B8A6] hover:bg-[#0D9488] text-white py-3 px-4 rounded-xl text-sm font-bold shadow-md shadow-teal-500/20 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('auth.backToLogin')}</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mode selection tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setMode('email');
                  setIdentifier('amina.diallo@novapay.africa');
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  mode === 'email' ? 'bg-white text-[#0F172A] shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('phone');
                  setIdentifier('+237 690 45 89 45');
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  mode === 'phone' ? 'bg-white text-[#0F172A] shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Mobile</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t('auth.inputLabel')}
              </label>
              <div className="flex items-center rounded-xl border border-slate-300 focus-within:border-[#14B8A6] focus-within:ring-2 focus-within:ring-[#14B8A6]/20 px-3 overflow-hidden transition-all">
                {mode === 'email' ? (
                  <Mail className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                ) : (
                  <Phone className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                )}
                <input
                  type={mode === 'email' ? 'email' : 'text'}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={mode === 'email' ? 'vous@domaine.com' : '+237 690 00 00 00'}
                  required
                  className="flex-1 py-2.5 text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none font-medium"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5 text-xs text-slate-600">
              <Clock className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800">{t('auth.timeLimitedLink')}</span>
                <p className="text-[11px] text-slate-500 mt-0.5">{t('auth.timeLimitedDesc')}</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#14B8A6] hover:bg-[#0D9488] text-white py-3 px-4 rounded-xl text-sm font-bold shadow-md shadow-teal-500/20 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 disabled:opacity-50"
            >
              <span>{isLoading ? t('common.loading') : t('auth.sendInstructions')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <Link to="/auth/login" className="text-xs text-slate-500 hover:text-slate-800 font-medium inline-flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t('auth.backToLogin')}</span>
              </Link>
            </div>
          </form>
        )}
      </div>

      {/* Security note footer */}
      <div className="max-w-md w-full mx-auto text-center flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>{t('auth.shieldProtection')} • {t('auth.shieldDesc')}</span>
      </div>
    </div>
  );
};
