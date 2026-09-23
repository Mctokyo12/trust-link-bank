import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheck,
  ArrowRight,
  RotateCcw,
  PhoneCall,
  Delete,
  HelpCircle,
} from 'lucide-react';
import { authApi } from '../../services/api/client';
import { useAppStore } from '../../app/store';

export const OtpPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { initApp } = useAppStore();

  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(45);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleKeypadPress = (val: string) => {
    if (val === 'CLEAR') {
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      return;
    }

    if (val === 'BACK') {
      // Find last filled index
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

  const handleVerify = async () => {
    const code = digits.join('');
    if (code.length < 6) {
      setErrorMsg('Veuillez saisir le code complet à 6 chiffres.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      await authApi.verifyOtp(code);
      await initApp();
      navigate('/dashboard');
    } catch {
      setErrorMsg('Code incorrect. Essayez le code démo (n\'importe quel code 6 chiffres).');
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
      <div className="max-w-md w-full mx-auto my-6 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 text-center">
        <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[#14B8A6] flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-6 h-6" />
        </div>

        <h1 className="text-2xl font-black text-[#0F172A] tracking-tight font-display mb-1.5">
          {t('auth.otpTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mb-1">
          {t('auth.otpSubtitle')}{' '}
          <strong className="text-[#0F172A] font-mono">+237 690 ••• •45</strong>
        </p>
        <Link to="/auth/register" className="text-xs text-[#2563EB] font-bold hover:underline mb-6 inline-block">
          {t('auth.modifyNumber')}
        </Link>

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
                  ? 'border-[#14B8A6] bg-teal-50/20 text-[#0F172A] ring-2 ring-[#14B8A6]/20'
                  : 'border-slate-300 bg-white text-slate-400 focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/20'
              }`}
            />
          ))}
        </div>

        {/* Resend Actions */}
        <div className="text-xs text-slate-500 mb-6">
          {countdown > 0 ? (
            <div className="flex items-center justify-center gap-1.5 font-medium">
              <span>{t('auth.resendIn')}</span>
              <span className="font-mono font-bold text-[#14B8A6]">00:{countdown < 10 ? `0${countdown}` : countdown}</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-4 font-bold">
              <button
                type="button"
                onClick={() => setCountdown(45)}
                className="text-[#14B8A6] hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('auth.resendSms')}</span>
              </button>
              <button
                type="button"
                onClick={() => setCountdown(60)}
                className="text-slate-600 hover:text-slate-800 flex items-center gap-1"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{t('auth.callMe')}</span>
              </button>
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
              className="py-3 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 text-lg font-bold text-[#0F172A] font-mono transition-colors"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleKeypadPress('CLEAR')}
            className="py-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-500 transition-colors"
          >
            C
          </button>
          <button
            type="button"
            onClick={() => handleKeypadPress('0')}
            className="py-3 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 text-lg font-bold text-[#0F172A] font-mono transition-colors"
          >
            0
          </button>
          <button
            type="button"
            onClick={() => handleKeypadPress('BACK')}
            className="py-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Submit */}
        <button
          type="button"
          onClick={handleVerify}
          disabled={isLoading || digits.join('').length < 6}
          className="w-full bg-[#14B8A6] hover:bg-[#0D9488] text-white py-3 px-4 rounded-xl text-sm font-bold shadow-md shadow-teal-500/20 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 disabled:opacity-50"
        >
          <span>{isLoading ? t('common.loading') : t('auth.verifyAndContinue')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Support help footer */}
      <div className="max-w-md w-full mx-auto text-center flex items-center justify-center gap-1.5 text-xs text-slate-500">
        <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
        <span>{t('auth.noCodeReceived')} </span>
        <a href="#support" className="text-[#14B8A6] font-bold hover:underline">
          {t('auth.support247')}
        </a>
      </div>
    </div>
  );
};
