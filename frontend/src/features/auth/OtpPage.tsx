import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheck,
  ArrowRight,
  RotateCcw,
  Phone,
  PhoneCall,
  Delete,
  HelpCircle,
  Mail,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  ArrowLeft,
} from 'lucide-react';
import { authApi } from '../../services/api/client';
import { useAppStore } from '../../app/store';
import { LanguageSelector } from '../../components/common/LanguageSelector';
import { ThemeToggle } from '../../components/common/ThemeToggle';

export const OtpPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { initApp } = useAppStore();

  const state = location.state as {
    identifier?: string;
    email?: string;
    phone?: string;
    isPhone?: boolean;
    countryCode?: string;
    firstName?: string;
    code?: string;
  } | null;

  // Retrieve stored fallbacks
  const storedIdentifier = localStorage.getItem('novapay_pending_reg_identifier') || '';
  const storedEmail = localStorage.getItem('novapay_pending_reg_email') || '';
  const storedPhone = localStorage.getItem('novapay_pending_reg_phone') || '';
  const storedType = localStorage.getItem('novapay_pending_reg_type');
  const storedCode = localStorage.getItem('novapay_pending_reg_code') || '123456';
  const storedFirstName = localStorage.getItem('novapay_pending_reg_first_name') || '';

  // Determine target email and phone
  const registeredEmail = state?.email || storedEmail || (state?.identifier?.includes('@') ? state.identifier : '') || (storedIdentifier.includes('@') ? storedIdentifier : 'mctokyo12@gmail.com');
  const registeredPhone = state?.phone || storedPhone || (!state?.identifier?.includes('@') ? state?.identifier : '') || (!storedIdentifier.includes('@') ? storedIdentifier : '+237 690 12 34 56');
  const registeredFirstName = state?.firstName || storedFirstName || 'Amina';

  // Determine current active delivery channel ('email' or 'sms')
  const initialIsPhone = state?.isPhone !== undefined
    ? state.isPhone
    : storedType
      ? storedType === 'phone'
      : false; // default to email!

  const [channel, setChannel] = useState<'email' | 'sms'>(initialIsPhone ? 'sms' : 'email');
  const [activeCode, setActiveCode] = useState<string>(state?.code || storedCode || '123456');
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(45);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const isEmailChannel = channel === 'email';
  const currentTarget = isEmailChannel ? registeredEmail : registeredPhone;

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleAutoFill = (codeToFill: string) => {
    const chars = codeToFill.slice(0, 6).split('');
    while (chars.length < 6) chars.push('');
    setDigits(chars);
    setErrorMsg('');
    inputRefs.current[5]?.focus();
  };

  const handleKeypadPress = (val: string) => {
    if (val === 'CLEAR') {
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      return;
    }

    if (val === 'BACK') {
      const lastIndex = digits.map((d) => !!d).lastIndexOf(true);
      if (lastIndex >= 0) {
        const next = [...digits];
        next[lastIndex] = '';
        setDigits(next);
        inputRefs.current[lastIndex]?.focus();
      }
      return;
    }

    // Number pressed
    const nextIndex = digits.findIndex((d) => !d);
    if (nextIndex !== -1) {
      const next = [...digits];
      next[nextIndex] = val;
      setDigits(next);
      if (nextIndex < 5) {
        inputRefs.current[nextIndex + 1]?.focus();
      }
    }
  };

  const handleInputChange = (idx: number, val: string) => {
    const char = val.slice(-1);
    if (char && !/^\d$/.test(char)) return;

    const next = [...digits];
    next[idx] = char;
    setDigits(next);

    if (char && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await authApi.resendOtp(currentTarget, !isEmailChannel);
      setActiveCode(res.code || '123456');
      setCountdown(45);
      setToastMessage(
        isEmailChannel
          ? `Nouveau code envoyé par e-mail à ${registeredEmail}`
          : `Nouveau code SMS envoyé au ${registeredPhone}`
      );
      setTimeout(() => setToastMessage(''), 5000);
    } catch {
      setErrorMsg('Erreur lors du renvoi du code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchChannel = async (newChannel: 'email' | 'sms') => {
    setChannel(newChannel);
    setErrorMsg('');
    const newTarget = newChannel === 'email' ? registeredEmail : registeredPhone;
    setIsLoading(true);
    try {
      const res = await authApi.resendOtp(newTarget, newChannel === 'sms');
      setActiveCode(res.code || '123456');
      setCountdown(45);
      setToastMessage(
        newChannel === 'email'
          ? `Code envoyé avec succès par e-mail à ${registeredEmail}`
          : `Code envoyé avec succès par SMS au ${registeredPhone}`
      );
      setTimeout(() => setToastMessage(''), 5000);
    } catch {
      setErrorMsg('Erreur lors du changement de canal.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    const code = digits.join('');
    if (code.length < 6) {
      setErrorMsg('Veuillez saisir le code complet à 6 chiffres.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      await authApi.verifyOtp(code, currentTarget);
      await initApp();
      navigate('/dashboard');
    } catch {
      setErrorMsg('Code incorrect. Essayez le code (123456).');
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
          <span className="hidden sm:inline font-extrabold text-xl text-[#0F172A] dark:text-white tracking-tight font-display">Trust Link Bank</span>
        </Link>

        <div className="flex items-center gap-2 shrink-0">
          <ThemeToggle variant="icon" />
          <LanguageSelector />
        </div>
      </div>

      {/* Main Card */}
      <div className="max-w-md w-full mx-auto my-6 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-6 h-6" />
        </div>

        <h1 className="text-2xl font-black text-[#0F172A] tracking-tight font-display mb-1.5">
          {t('auth.otpTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mb-1 leading-relaxed">
          {isEmailChannel ? (
            <>
              Nous avons envoyé votre code de confirmation à l'adresse e-mail :
              <br />
              <strong className="text-[#0F172A] font-mono font-bold bg-blue-50 text-[#2563EB] px-2 py-0.5 rounded-lg border border-blue-200 inline-block mt-1">
                {registeredEmail}
              </strong>
            </>
          ) : (
            <>
              Nous avons envoyé votre code de confirmation par SMS au numéro :
              <br />
              <strong className="text-[#0F172A] font-mono font-bold bg-blue-50 text-[#1E3A8A] px-2 py-0.5 rounded-lg border border-blue-200 inline-block mt-1">
                {registeredPhone}
              </strong>
            </>
          )}
        </p>

        <div className="flex items-center justify-center gap-3 mb-5 mt-2">
          <Link
            to="/register"
            className="text-xs text-[#2563EB] font-bold hover:underline inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>{isEmailChannel ? t('auth.modifyEmail') : t('auth.modifyNumber')}</span>
          </Link>
        </div>

        {/* Live Simulation Delivery Box */}
        <div
          className={`mb-5 p-3.5 rounded-2xl border text-left transition-all shadow-xs ${
            isEmailChannel
              ? 'bg-gradient-to-r from-blue-50 to-indigo-50/70 border-blue-200/80'
              : 'bg-gradient-to-r from-blue-50 to-sky-50/70 border-blue-200/80'
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-white ${
                  isEmailChannel ? 'bg-[#2563EB]' : 'bg-[#1E3A8A]'
                }`}
              >
                {isEmailChannel ? <Mail className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800">
                  {isEmailChannel ? t('auth.simulatedEmailTitle') : t('auth.simulatedSmsTitle')}
                </span>
                <span className="block text-[10px] text-slate-500 font-mono">
                  {isEmailChannel ? `À : ${registeredEmail}` : `SMS envoyé au : ${registeredPhone}`}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200 shadow-xs">
              Reçu à l'instant
            </span>
          </div>

          <div className="text-xs text-slate-700 bg-white/95 p-3 rounded-xl border border-slate-200/80 mb-2.5 flex flex-col gap-1.5 font-mono">
            {isEmailChannel ? (
              <>
                <div className="text-[11px] text-slate-500 border-b border-slate-100 pb-1 flex justify-between">
                  <span>De: security@trustlinkbank.com</span>
                  <span className="font-sans font-semibold text-[#2563EB]">E-mail officiel</span>
                </div>
                <div>
                  <span className="font-bold text-slate-800">Objet : Votre code de confirmation Trust Link Bank</span>
                  <p className="mt-1 font-sans text-xs text-slate-600 leading-normal">
                    Bonjour <strong className="text-slate-800">{registeredFirstName}</strong>, voici votre code de confirmation sécurisé :{' '}
                    <span className="font-extrabold text-[#2563EB] text-sm bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-mono">
                      {activeCode}
                    </span>
                    . Valable 15 minutes.
                  </p>
                </div>
              </>
            ) : (
              <div>
                <div className="text-[11px] text-slate-500 border-b border-slate-100 pb-1 mb-1">
                  De: Trust Link Bank SMS (+1 800 555 0192)
                </div>
                <span>
                  « {t('auth.simulatedSmsBody')}{' '}
                  <span className="font-extrabold text-[#2563EB] text-sm bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                    {activeCode}
                  </span>
                  . Valable 15 minutes. »
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleAutoFill(activeCode)}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs active:scale-[0.99] cursor-pointer ${
                isEmailChannel
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('auth.clickToAutoFill')} ({activeCode})</span>
            </button>

            {isEmailChannel && (
              <a
                href="https://mail.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="py-1.5 px-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 flex items-center gap-1 shrink-0"
                title="Ouvrir boîte mail"
              >
                <span>Gmail</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            )}
          </div>
        </div>

        {/* Channel Switcher */}
        <div className="mb-4">
          {isEmailChannel ? (
            <button
              type="button"
              onClick={() => handleSwitchChannel('sms')}
              className="text-xs text-slate-600 hover:text-slate-900 font-medium inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              <span>{t('auth.switchChannelToSms')} <strong className="text-slate-800">{registeredPhone}</strong></span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleSwitchChannel('email')}
              className="text-xs text-[#2563EB] hover:text-blue-800 font-medium inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>{t('auth.switchChannelToEmail')} <strong className="text-slate-800">{registeredEmail}</strong></span>
            </button>
          )}
        </div>

        {toastMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {/* 6 Digit Input Boxes */}
        <div className="flex justify-center gap-2 sm:gap-3 mb-6">
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => { inputRefs.current[idx] = el; }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInputChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold font-mono rounded-xl border transition-all ${
                digit
                  ? 'border-[#2563EB] bg-blue-50/20 text-[#0F172A] ring-2 ring-[#2563EB]/20'
                  : 'border-slate-300 bg-white text-slate-400 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20'
              }`}
            />
          ))}
        </div>

        {/* Resend Actions */}
        <div className="text-xs text-slate-500 mb-6">
          {countdown > 0 ? (
            <div className="flex items-center justify-center gap-1.5 font-medium">
              <span>{t('auth.resendIn')}</span>
              <span className="font-mono font-bold text-[#2563EB]">00:{countdown < 10 ? `0${countdown}` : countdown}</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-4 font-bold">
              {isEmailChannel ? (
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-[#2563EB] hover:underline flex items-center gap-1.5 cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{t('auth.resendEmail')} ({registeredEmail})</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleResend}
                    className="text-[#2563EB] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{t('auth.resendSms')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCountdown(60);
                      setToastMessage(`Appel vocal initié vers ${registeredPhone}...`);
                      setTimeout(() => setToastMessage(''), 5000);
                    }}
                    className="text-slate-600 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>{t('auth.callMe')}</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* On-screen Numeric Keypad */}
        <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto mb-6">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeypadPress(num)}
              className="py-3 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 text-lg font-bold text-[#0F172A] font-mono transition-colors cursor-pointer"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleKeypadPress('CLEAR')}
            className="py-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-500 transition-colors cursor-pointer"
          >
            C
          </button>
          <button
            type="button"
            onClick={() => handleKeypadPress('0')}
            className="py-3 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 text-lg font-bold text-[#0F172A] font-mono transition-colors cursor-pointer"
          >
            0
          </button>
          <button
            type="button"
            onClick={() => handleKeypadPress('BACK')}
            className="py-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Submit */}
        <button
          type="button"
          onClick={handleVerify}
          disabled={isLoading || digits.join('').length < 6}
          className="w-full bg-[#2563EB] hover:bg-[#1E3A8A] text-white py-3 px-4 rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
        >
          <span>{isLoading ? t('common.loading') : t('auth.verifyAndContinue')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Support help footer */}
      <div className="max-w-md w-full mx-auto text-center flex items-center justify-center gap-1.5 text-xs text-slate-500">
        <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
        <span>{t('auth.noCodeReceived')} </span>
        <a href="#support" className="text-[#2563EB] font-bold hover:underline">
          {t('auth.support247')}
        </a>
      </div>
    </div>
  );
};
