import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Settings,
  Globe2,
  Shield,
  Bell,
  Eye,
  EyeOff,
  Smartphone,
  Lock,
  CheckCircle2,
  Save,
  Sun,
  Moon,
  Coins,
} from 'lucide-react';
import { useAppStore } from '../../app/store';
import { SUPPORTED_LANGUAGES } from '../../i18n/languages';
import { getCurrencyMeta } from '../../utils/currencies';

export const SettingsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const {
    currentUser,
    hideBalances,
    toggleHideBalances,
    setLanguage,
    updateProfile,
    theme,
    setTheme,
  } = useAppStore();

  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(true);
  const [twoFactor, setTwoFactor] = useState(true);
  const [savedMsg, setSavedMsg] = useState('');

  const currentLang = i18n.language || currentUser?.language || 'en';
  const meta = getCurrencyMeta(currentUser?.preferred_currency || 'USD');

  const handleLangChange = async (newLang: string) => {
    setLanguage(newLang);
    if (currentUser) {
      await updateProfile({ language: newLang });
    }
    setSavedMsg(t('settings.langSavedNotice'));
    setTimeout(() => setSavedMsg(''), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] dark:text-white tracking-tight font-display">
          {t('settings.pageTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 mt-0.5">
          {t('settings.pageSubtitle')}
        </p>
      </div>

      {savedMsg && (
        <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-[#16A34A] dark:text-green-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{savedMsg}</span>
        </div>
      )}

      {/* Language Preferences */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] dark:bg-blue-950/50 text-[#2563EB] dark:text-blue-400 flex items-center justify-center">
            <Globe2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#0F172A] dark:text-white font-display">
              {t('settings.langSectionTitle')}
            </h2>
            <p className="text-xs text-[#64748B] dark:text-slate-400">
              {t('settings.langSectionSubtitle')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = currentLang === lang.code || currentLang.startsWith(lang.code);
            return (
              <button
                key={lang.code}
                onClick={() => handleLangChange(lang.code)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#2563EB] bg-[#EFF6FF] dark:bg-blue-950/50 text-[#0F172A] dark:text-white ring-1 ring-[#2563EB]/20 shadow-xs font-semibold'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[#64748B] dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{lang.flag}</span>
                  <div>
                    <div className="text-xs font-bold leading-tight text-[#0F172A] dark:text-white">{lang.nativeName}</div>
                    <div className="text-[10px] text-[#64748B] dark:text-slate-400">{lang.name}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Display & Privacy */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] dark:bg-blue-950/50 text-[#2563EB] dark:text-blue-400 flex items-center justify-center">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#0F172A] dark:text-white font-display">
              {t('settings.privacyTitle')}
            </h2>
            <p className="text-xs text-[#64748B] dark:text-slate-400">
              {t('settings.privacySubtitle')}
            </p>
          </div>
        </div>

        {/* Theme Preference Selection */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-[#0F172A] dark:text-white flex items-center gap-1.5">
              <span>{t('common.theme', 'Theme')} :</span>
              <span className="text-[#2563EB] dark:text-blue-400">
                {theme === 'dark' ? (t('common.darkMode') || 'Dark Mode') : (t('common.lightMode') || 'Light Mode')}
              </span>
            </div>
            <div className="text-[11px] text-[#64748B] dark:text-slate-400 mt-0.5">
              {theme === 'dark'
                ? t('settings.darkModeDesc', 'Comfortable dark visual mode')
                : t('settings.lightModeDesc', 'Bright light display mode')}
            </div>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-200/70 dark:bg-slate-800 rounded-xl self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                theme === 'light'
                  ? 'bg-white text-[#0F172A] shadow-xs'
                  : 'text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>{t('common.lightMode', 'Light')}</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'text-[#64748B] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>{t('common.darkMode', 'Dark')}</span>
            </button>
          </div>
        </div>

        {/* Hide Balances Toggle */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#0F172A] dark:text-white">{t('settings.hideBalancesLabel')}</div>
            <div className="text-[11px] text-[#64748B] dark:text-slate-400">
              {t('settings.hideBalancesDesc')}
            </div>
          </div>
          <button
            type="button"
            onClick={toggleHideBalances}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              hideBalances ? 'bg-[#2563EB]' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform shadow-xs absolute top-0.5 ${
                hideBalances ? 'left-6.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] dark:bg-blue-950/50 text-[#2563EB] dark:text-blue-400 flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#0F172A] dark:text-white font-display">
              {t('settings.notificationsTitle')}
            </h2>
            <p className="text-xs text-[#64748B] dark:text-slate-400">
              {t('settings.notificationsSubtitle')}
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div>
              <div className="text-xs font-bold text-[#0F172A] dark:text-white">{t('settings.emailAlertsLabel')}</div>
              <div className="text-[11px] text-[#64748B] dark:text-slate-400">{currentUser?.email}</div>
            </div>
            <input
              type="checkbox"
              checked={emailNotifs}
              onChange={(e) => setEmailNotifs(e.target.checked)}
              className="w-4 h-4 text-[#2563EB] rounded border-slate-300 dark:border-slate-700 focus:ring-[#2563EB]"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div>
              <div className="text-xs font-bold text-[#0F172A] dark:text-white">{t('settings.smsAlertsLabel')}</div>
              <div className="text-[11px] text-[#64748B] dark:text-slate-400">{currentUser?.phone}</div>
            </div>
            <input
              type="checkbox"
              checked={smsNotifs}
              onChange={(e) => setSmsNotifs(e.target.checked)}
              className="w-4 h-4 text-[#2563EB] rounded border-slate-300 dark:border-slate-700 focus:ring-[#2563EB]"
            />
          </div>
        </div>
      </div>

      {/* Financial Compliance Details */}
      <div className="p-5 rounded-2xl bg-[#EFF6FF] dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-start gap-3">
        <Coins className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
        <div className="text-xs text-[#1E3A8A] dark:text-blue-300 space-y-1">
          <div className="font-bold">{t('settings.primaryCurrencyNotice')} : {meta.label} ({meta.symbol})</div>
          <p className="text-[11px] leading-relaxed text-[#1E3A8A]/80 dark:text-blue-300/80">
            {t('settings.primaryCurrencyDesc')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
