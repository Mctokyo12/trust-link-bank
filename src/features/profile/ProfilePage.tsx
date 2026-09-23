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
  HelpCircle,
} from 'lucide-react';
import { useAppStore } from '../../app/store';

export const ProfilePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, setLanguage, switchRole, logout } = useAppStore();

  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [sms2faEnabled, setSms2faEnabled] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight font-display">
          {t('profile.title')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          {t('profile.subtitle')}
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <div className="relative">
          <img
            src={currentUser?.avatar_url}
            alt={currentUser?.name}
            className="w-20 h-20 rounded-full object-cover ring-4 ring-slate-100 shadow-md"
          />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs ring-2 ring-white">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
            <h2 className="text-xl font-extrabold text-[#0F172A] font-display">
              {currentUser?.name}
            </h2>
            <span className="text-sm">{currentUser?.flag}</span>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
              {t('profile.kycLevel2')}
            </span>
          </div>

          <div className="text-xs font-mono text-slate-500 mb-2">
            {currentUser?.novatag} • {currentUser?.email}
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-600">
            <span>Pays : <strong>{currentUser?.country}</strong></span>
            <span>•</span>
            <span>Mobile : <strong className="font-mono">{currentUser?.phone}</strong></span>
          </div>
        </div>
      </div>

      {/* KYC Status Details */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-[#0F172A] font-display">
            {t('profile.kycStatus')}
          </h3>
          <span className="text-xs font-bold text-emerald-600">
            Plafond mensuel : 15 000 000 FCFA
          </span>
        </div>

        <div className="space-y-3">
          <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <div className="font-bold text-xs text-slate-900">Niveau 1 — Numéro mobile certifié</div>
                <div className="text-[11px] text-slate-500">Plafond : 500 000 FCFA / jour</div>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              Validé
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <div className="font-bold text-xs text-slate-900">Niveau 2 — Pièce d'identité CNI & Domicile</div>
                <div className="text-[11px] text-slate-500">Plafond étendu : 15 000 000 FCFA / mois</div>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              Validé
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between opacity-80">
            <div className="flex items-center gap-3">
              <FileCheck className="w-5 h-5 text-slate-400 shrink-0" />
              <div>
                <div className="font-bold text-xs text-slate-900">Niveau 3 — Compte Professionnel / Entreprise</div>
                <div className="text-[11px] text-slate-500">Plafonds sur-mesure et API marchande</div>
              </div>
            </div>
            <button
              onClick={() => alert("Demande de passage au Niveau 3 transmise à la conformité.")}
              className="text-[10px] font-bold text-[#14B8A6] hover:underline"
            >
              Postuler
            </button>
          </div>
        </div>
      </div>

      {/* Security & Authentication Settings */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-[#0F172A] font-display">
          {t('profile.securitySettings')}
        </h3>

        <div className="divide-y divide-slate-100 text-xs">
          <div className="py-3 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900">{t('profile.twoFactorAuth')}</div>
              <div className="text-slate-500 text-[11px]">{t('profile.twoFactorDesc')}</div>
            </div>
            <input
              type="checkbox"
              checked={sms2faEnabled}
              onChange={(e) => setSms2faEnabled(e.target.checked)}
              className="w-4 h-4 text-[#14B8A6] rounded focus:ring-[#14B8A6]"
            />
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900">{t('profile.biometrics')}</div>
              <div className="text-slate-500 text-[11px]">{t('profile.biometricsDesc')}</div>
            </div>
            <input
              type="checkbox"
              checked={biometricEnabled}
              onChange={(e) => setBiometricEnabled(e.target.checked)}
              className="w-4 h-4 text-[#14B8A6] rounded focus:ring-[#14B8A6]"
            />
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900">{t('profile.securityAlerts')}</div>
              <div className="text-slate-500 text-[11px]">{t('profile.securityAlertsDesc')}</div>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="w-4 h-4 text-[#14B8A6] rounded focus:ring-[#14B8A6]"
            />
          </div>
        </div>
      </div>

      {/* Role Switcher & Language Controls */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-[#0F172A] font-display">
          Préférences & Démonstration
        </h3>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
          <div>
            <span className="font-bold text-slate-800">Langue de l'application</span>
            <p className="text-[11px] text-slate-500">Basculez entre le Français et l'Anglais</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setLanguage('fr')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                i18n.language === 'fr' ? 'bg-[#14B8A6] text-white shadow-sm' : 'bg-white text-slate-700'
              }`}
            >
              Français (FR)
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                i18n.language === 'en' ? 'bg-[#14B8A6] text-white shadow-sm' : 'bg-white text-slate-700'
              }`}
            >
              English (EN)
            </button>
          </div>
        </div>

        {/* Switch Role demo */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-blue-50/50 border border-blue-200 text-xs">
          <div>
            <span className="font-bold text-blue-950">Accès Superviseur & Régulateur CEMAC/BCEAO</span>
            <p className="text-[11px] text-blue-700">Explorez le back-office d'audit financier</p>
          </div>
          <button
            onClick={() => {
              switchRole('admin');
              navigate('/admin');
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold transition-colors shadow-sm"
          >
            Ouvrir la Console Admin
          </button>
        </div>

        {/* Logout */}
        <button
          onClick={() => {
            logout();
            navigate('/auth/login');
          }}
          className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 py-3 rounded-2xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>{t('nav.logout')}</span>
        </button>
      </div>
    </div>
  );
};
