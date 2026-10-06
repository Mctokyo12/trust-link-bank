import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sun, Moon } from 'lucide-react';
import { useAppStore } from '../../app/store';

interface ThemeToggleProps {
  variant?: 'icon' | 'pill' | 'button';
  className?: string;
  showLabel?: boolean;
}

/**
 * Single-button Theme Toggle
 * Exactly ONE button that switches between Light and Dark mode on click.
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'icon',
  className = '',
  showLabel = false,
}) => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useAppStore();

  const isDark = theme === 'dark';

  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        title={isDark ? (t('common.lightMode', 'Light Mode')) : (t('common.darkMode', 'Dark Mode'))}
        aria-label={isDark ? t('common.lightMode', 'Light Mode') : t('common.darkMode', 'Dark Mode')}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 select-none ${
          isDark
            ? 'bg-slate-800 hover:bg-slate-700/90 border-slate-700 text-amber-300'
            : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-800'
        } ${className}`}
      >
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 animate-spin-once" />
        ) : (
          <Moon className="w-4 h-4 text-[#2563EB]" />
        )}
        <span>{isDark ? (t('common.lightMode', 'Light')) : (t('common.darkMode', 'Dark'))}</span>
      </button>
    );
  }

  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer active:scale-98 select-none ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800'
            : 'bg-white border-slate-200 text-[#0F172A] hover:bg-slate-50 shadow-xs'
        } ${className}`}
        aria-label={isDark ? t('common.lightMode', 'Light Mode') : t('common.darkMode', 'Dark Mode')}
      >
        <div className="flex items-center gap-2">
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-blue-600" />
          )}
          <span>{isDark ? (t('common.darkMode', 'Dark Mode')) : (t('common.lightMode', 'Light Mode'))}</span>
        </div>
        <div
          className={`w-8 h-4 rounded-full p-0.5 transition-colors flex items-center ${
            isDark ? 'bg-[#2563EB] justify-end' : 'bg-slate-300 justify-start'
          }`}
        >
          <div className="w-3 h-3 rounded-full bg-white shadow-xs" />
        </div>
      </button>
    );
  }

  // Single Icon button
  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? (t('common.lightMode', 'Light Mode')) : (t('common.darkMode', 'Dark Mode'))}
      aria-label={isDark ? t('common.lightMode', 'Light Mode') : t('common.darkMode', 'Dark Mode')}
      className={`h-9 w-9 min-w-[36px] flex items-center justify-center rounded-xl border transition-all cursor-pointer shadow-xs active:scale-95 ${
        isDark
          ? 'bg-slate-800/90 hover:bg-slate-700 border-slate-700 text-amber-300'
          : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
      } ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400" />
      ) : (
        <Moon className="w-4 h-4 text-[#2563EB]" />
      )}
      {showLabel && (
        <span className="text-xs font-bold ml-1.5">
          {isDark ? (t('common.darkMode', 'Dark')) : (t('common.lightMode', 'Light'))}
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;
