import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  User,
  ShieldCheck,
  Lock,
  Smartphone,
  Globe2,
  LogOut,
  ChevronRight,
  Fingerprint,
  FileCheck,
  CheckCircle2,
  ShieldAlert,
  Coins,
  Edit3,
  Mail,
  X,
  Check,
  AlertCircle,
  Camera,
} from 'lucide-react';
import { useAppStore } from '../../app/store';
import { LanguageSelector } from '../../components/common/LanguageSelector';
import { SUPPORTED_LANGUAGES } from '../../i18n/languages';
import { getCurrencyMeta } from '../../utils/currencies';

export const ProfilePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, updateProfile, setLanguage, logout } = useAppStore();

  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Edit form state
  const [firstName, setFirstName] = useState(
    currentUser?.first_name || currentUser?.name?.split(' ')[0] || ''
  );
  const [lastName, setLastName] = useState(
    currentUser?.last_name || currentUser?.name?.split(' ').slice(1).join(' ') || ''
  );
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [country, setCountry] = useState(currentUser?.country || 'United States');
  const [language, setAccountLanguage] = useState(currentUser?.language || i18n.language || 'en');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatar_url || '');

  // Quick initials calculation
  const initials = (currentUser?.name || 'Trust Link')
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const currencyMeta = getCurrencyMeta(currentUser?.preferred_currency || 'USD');

  const translateCountryName = (countryName?: string) => {
    if (!countryName) return 'N/A';
    const keyMap: Record<string, string> = {
      'United States': 'countries.US',
      'USA': 'countries.US',
      'États-Unis': 'countries.US',
      'Estados Unidos': 'countries.US',
      'Canada': 'countries.CA',
      'Canadá': 'countries.CA',
      'Brazil': 'countries.BR',
      'Brésil': 'countries.BR',
      'Brasil': 'countries.BR',
      'Mexico': 'countries.MX',
      'Mexique': 'countries.MX',
      'México': 'countries.MX',
      'France': 'countries.FR',
      'França': 'countries.FR',
      'Francia': 'countries.FR',
      'Spain': 'countries.ES',
      'Espagne': 'countries.ES',
      'España': 'countries.ES',
      'Espanha': 'countries.ES',
      'Portugal': 'countries.PT',
      'Cameroon': 'countries.CM',
      'Cameroun': 'countries.CM',
      'Camarões': 'countries.CM',
      'Camerún': 'countries.CM',
      'Senegal': 'countries.SN',
      'Sénégal': 'countries.SN',
    };
    const translationKey = keyMap[countryName.trim()];
    return translationKey ? t(translationKey, countryName) : countryName;
  };

  const handleOpenEdit = () => {
    setFirstName(currentUser?.first_name || currentUser?.name?.split(' ')[0] || '');
    setLastName(currentUser?.last_name || currentUser?.name?.split(' ').slice(1).join(' ') || '');
    setPhone(currentUser?.phone || '');
    setCountry(currentUser?.country || 'United States');
    setAccountLanguage(i18n.language?.split('-')[0] || currentUser?.language || 'en');
    setAvatarUrl(currentUser?.avatar_url || '');
    setSuccessMsg('');
    setErrorMsg('');
    setIsEditing(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg(t('profile.nameRequiredError', 'First name and last name are required.'));
      return;
    }

    setSaveLoading(true);
    setErrorMsg('');

    try {
      await updateProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        name: `${firstName.trim()} ${lastName.trim()}`,
        phone: phone.trim(),
        country: country.trim(),
        language,
        avatar_url: avatarUrl.trim() || undefined,
      });
      setLanguage(language);

      setSuccessMsg(t('profile.updateSuccess', 'Your profile has been updated successfully.'));
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || t('profile.updateError', 'Unable to update profile.'));
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] dark:text-white tracking-tight font-display">
            {t('profile.title', 'My Profile')}
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-400 mt-0.5">
            {t('profile.subtitle', 'Manage your personal details and security preferences')}
          </p>
        </div>

        <button
          onClick={handleOpenEdit}
          className="bg-[#2563EB] hover:bg-[#1E3A8A] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>{t('common.edit')} {t('nav.profile')}</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-[#16A34A] dark:text-green-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Profile Overview Card (Requirement 4: no placeholder data, initials when no avatar) */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center gap-6 transition-colors">
        <div className="relative">
          {currentUser?.avatar_url ? (
            <img
              src={currentUser.avatar_url}
              alt={currentUser.name}
              className="w-20 h-20 rounded-full object-cover ring-4 ring-blue-50 dark:ring-blue-950 shadow-md"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center font-black text-xl shadow-md ring-4 ring-blue-50 dark:ring-blue-950">
              {initials}
            </div>
          )}
          <div
            title={t('auth.verified', 'Verified')}
            className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#16A34A] text-white rounded-full flex items-center justify-center text-xs ring-2 ring-white dark:ring-[#0F172A]"
          >
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="text-center sm:text-left flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
            <h2 className="text-xl font-extrabold text-[#0F172A] dark:text-white font-display">
              {currentUser?.name}
            </h2>
            <span className="text-sm">{currentUser?.flag}</span>
            <span className="text-[10px] bg-green-50 dark:bg-green-950/40 text-[#16A34A] font-bold px-2 py-0.5 rounded-full border border-green-200 dark:border-green-800">
              {t('auth.verified')} • {t('profile.kycLevel')} 2
            </span>
          </div>

          <div className="text-xs font-mono text-[#64748B] dark:text-slate-400 mb-2 truncate">
            {currentUser?.novatag} • {currentUser?.email}
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-[#64748B] dark:text-slate-400">
            <span>{t('profile.country')} : <strong className="text-[#0F172A] dark:text-white">{translateCountryName(currentUser?.country)}</strong></span>
            <span>•</span>
            <span>{t('profile.phone')} : <strong className="font-mono text-[#0F172A] dark:text-white">{currentUser?.phone || 'N/A'}</strong></span>
            <span>•</span>
            <span className="flex items-center gap-1 font-bold text-[#2563EB] dark:text-blue-400">
              <Coins className="w-3.5 h-3.5" />
              <span>{t('auth.preferredCurrency')} : {currentUser?.preferred_currency || 'USD'} ({currencyMeta.symbol})</span>
            </span>
          </div>
        </div>
      </div>

      {/* Account Details & Currency Lock Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Preferred Currency Card */}
        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] dark:bg-blue-950/50 text-[#2563EB] dark:text-blue-400 flex items-center justify-center">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#0F172A] dark:text-white">
                  {t('profile.baseCurrencyTitle', 'Account Base Currency')}
                </div>
                <div className="text-[11px] text-[#64748B] dark:text-slate-400">
                  {t('profile.definedAtRegistration', 'Set at registration')}
                </div>
              </div>
            </div>
            <span className="text-xs font-extrabold text-[#1E3A8A] dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg">
              {currencyMeta.flag} {currencyMeta.code} ({currencyMeta.symbol})
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-[#64748B] dark:text-slate-400 leading-relaxed">
            <div className="flex items-start gap-1.5 font-medium text-slate-700 dark:text-slate-300 mb-1">
              <Lock className="w-3.5 h-3.5 text-[#2563EB] shrink-0 mt-0.5" />
              <span>{t('profile.currencyLockedTitle', 'Currency locked according to banking standards')}</span>
            </div>
            {t('profile.currencyLockedDesc', 'Your primary base currency cannot be changed directly in order to preserve ledger statement integrity. To hold other currencies, open a new sub-account in the Accounts section.')}
          </div>
        </div>

        {/* Email Security Card */}
        <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] dark:bg-blue-950/50 text-[#2563EB] dark:text-blue-400 flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#0F172A] dark:text-white">
                  {t('profile.certifiedEmailTitle', 'Certified Email Address')}
                </div>
                <div className="text-[11px] text-[#16A34A] font-semibold">
                  {t('profile.verifiedAndProtected', 'Verified & protected')}
                </div>
              </div>
            </div>
            <span className="text-[10px] bg-green-100 dark:bg-green-950/60 text-[#16A34A] font-bold px-2 py-0.5 rounded-full">
              {t('profile.securedBadge', 'Secured')}
            </span>
          </div>

          <div className="font-mono text-xs text-[#0F172A] dark:text-white font-semibold truncate bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
            {currentUser?.email}
          </div>

          <p className="text-[11px] text-[#64748B] dark:text-slate-400">
            {t('profile.emailChangeNotice', 'Changing your email address requires a secure identity re-verification procedure via our compliance department.')}
          </p>
        </div>
      </div>

      {/* EDIT PROFILE MODAL / DRAWER */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-[#0F172A] dark:text-white font-display">
                  {t('profile.editModalTitle', 'Edit My Information')}
                </h3>
                <p className="text-xs text-[#64748B] dark:text-slate-400">
                  {t('profile.editModalDesc', 'Changes apply immediately across the application.')}
                </p>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-[#DC2626] dark:text-red-400 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* First Name & Last Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] dark:text-white mb-1">
                    {t('auth.firstName', 'First Name')} *
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-[#0F172A] dark:text-white focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] dark:text-white mb-1">
                    {t('auth.lastName', 'Last Name')} *
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-[#0F172A] dark:text-white focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] dark:text-white mb-1">
                  {t('auth.phoneNumber', 'Mobile Phone Number')} *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-[#0F172A] dark:text-white focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              {/* Country */}
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] dark:text-white mb-1">
                  {t('auth.countryOfResidence', 'Country of Residence')} *
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-[#0F172A] dark:text-white focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              {/* Language Selection */}
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] dark:text-white mb-1">
                  {t('auth.accountLanguage', 'Preferred Language')}
                </label>
                <select
                  value={language}
                  onChange={(e) => setAccountLanguage(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-[#0F172A] dark:text-white focus:outline-none focus:border-[#2563EB] cursor-pointer"
                >
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.flag} {l.nativeName} ({l.name})
                    </option>
                  ))}
                </select>
              </div>

              {/* Avatar URL / Photo */}
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] dark:text-white mb-1">
                  {t('profile.avatarUrlLabel', 'Profile Photo (Optional URL)')}
                </label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-[#0F172A] dark:text-white focus:outline-none focus:border-[#2563EB]"
                />
                <p className="mt-1 text-[11px] text-[#64748B] dark:text-slate-400">
                  {t('profile.avatarUrlHelp', 'If left empty, a clean avatar based on your initials will be generated.')}
                </p>
              </div>

              {/* Notice about email & currency */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-[#64748B] dark:text-slate-400 space-y-1">
                <div>• {t('profile.emailChangeNotice', 'Changing your email requires identity re-verification.')}</div>
                <div>• {t('profile.currencyLockedTitle', 'Base currency is locked for this account.')}</div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-[#0F172A] dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="flex-1 bg-[#2563EB] hover:bg-[#1E3A8A] text-white py-2.5 px-4 rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {saveLoading ? t('common.loading') : t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Security & Sessions */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4 transition-colors">
        <h3 className="font-bold text-base text-[#0F172A] dark:text-white font-display">
          {t('profile.security')}
        </h3>

        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-[#EFF6FF] dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#2563EB] dark:text-blue-400 shrink-0" />
              <div>
                <div className="font-bold text-xs text-[#0F172A] dark:text-white">
                  {t('profile.twoFactorActiveTitle', 'Two-Factor Authentication (2FA) Active')}
                </div>
                <div className="text-[11px] text-[#64748B] dark:text-slate-400">
                  {t('profile.twoFactorActiveDesc', '6-digit code validation required for every transfer')}
                </div>
              </div>
            </div>
            <span className="text-[10px] font-bold text-[#2563EB] dark:text-blue-300 bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded-full">
              {t('profile.protectedBadge', 'Protected')}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Fingerprint className="w-5 h-5 text-[#64748B] dark:text-slate-400 shrink-0" />
              <div>
                <div className="font-bold text-xs text-[#0F172A] dark:text-white">
                  {t('profile.encryptionTitle', 'Payment Data Encryption')}
                </div>
                <div className="text-[11px] text-[#64748B] dark:text-slate-400">
                  {t('profile.encryptionDesc', 'AES-256 banking standard with automated audit')}
                </div>
              </div>
            </div>
            <span className="text-[10px] font-bold text-[#16A34A] bg-green-100 dark:bg-green-950/60 px-2 py-0.5 rounded-full">
              {t('profile.certifiedBadge', 'Certified')}
            </span>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="pt-2">
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-[#DC2626] font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>{t('auth.logout')}</span>
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
