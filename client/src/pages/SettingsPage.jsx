import React, { useState } from 'react';
import { Settings, Globe, Moon, Sun, Shield, Bell, Check, Sparkles } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export const SettingsPage = () => {
  const { t, currentLanguage, setLanguage, languages } = useLanguage();
  const { isDark, toggleTheme, theme } = useTheme();
  const [saveModalOpen, setSaveModalOpen] = useState(false);

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="pb-4 border-b border-light-border dark:border-dark-border">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-light-heading dark:text-dark-heading">
            {t('nav.settings', 'Settings')}
          </h1>
          <Badge variant="brand" icon={Settings}>
            System Preferences
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-light-body dark:text-dark-body">
          Configure multilingual defaults, dark/light theme, and platform preferences.
        </p>
      </div>

      {/* Language Preference Section */}
      <Card className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-accent/10 text-accent-dark dark:text-accent-light">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-base text-light-heading dark:text-dark-heading">
              Language & Regional Script
            </h3>
            <p className="text-xs text-light-body dark:text-dark-body">
              Select your primary language for UI navigation, document analysis, and OCR scripts.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {languages.map((lang) => {
            const isSelected = currentLanguage === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => setLanguage(lang.code)}
                className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                  isSelected
                    ? 'border-accent dark:border-accent-light bg-accent/10 text-accent-dark dark:text-accent-light shadow-sm'
                    : 'border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface hover:border-accent/40'
                }`}
              >
                <div>
                  <div className="text-sm font-bold text-light-heading dark:text-dark-heading">
                    {lang.nativeName}
                  </div>
                  <div className="text-xs text-light-body dark:text-dark-body font-mono">
                    {lang.label} ({lang.script})
                  </div>
                </div>
                {isSelected && (
                  <Check className="w-4 h-4 text-accent-dark dark:text-accent-light shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Theme & Display Section */}
      <Card className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-accent/10 text-accent-dark dark:text-accent-light">
            {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="font-heading font-semibold text-base text-light-heading dark:text-dark-heading">
              Theme & Contrast (One-Colour Cyan System)
            </h3>
            <p className="text-xs text-light-body dark:text-dark-body">
              Toggle between White/Light Gray and Pure Black/Charcoal with cyan accent highlights.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div>
            <p className="text-xs font-semibold text-light-heading dark:text-dark-heading capitalize">
              Current Theme: {theme} Mode
            </p>
            <p className="text-[11px] text-light-body dark:text-dark-body">
              {isDark ? 'Black #000000 & Charcoal #111111 with Cyan #22D3EE' : 'White #FFFFFF & Gray #F4F4F5 with Cyan #06B6D4'}
            </p>
          </div>
          <Button variant="secondary" onClick={toggleTheme}>
            {isDark ? 'Switch to Light' : 'Switch to Dark'}
          </Button>
        </div>
      </Card>

      {/* Save Settings Button */}
      <div className="flex justify-end pt-2">
        <Button variant="primary" onClick={() => setSaveModalOpen(true)}>
          {t('common.save', 'Save Changes')}
        </Button>
      </div>

      <Modal
        isOpen={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        title="Preferences Saved"
        description="Your interface preferences have been synced successfully."
      >
        <p className="text-xs text-light-body dark:text-dark-body">
          Language is set to <strong className="text-light-heading dark:text-dark-heading">{currentLanguage.toUpperCase()}</strong> and theme is set to <strong className="text-light-heading dark:text-dark-heading">{theme.toUpperCase()}</strong>.
        </p>
        <div className="mt-4 flex justify-end">
          <Button variant="primary" size="sm" onClick={() => setSaveModalOpen(false)}>
            Done
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default SettingsPage;
