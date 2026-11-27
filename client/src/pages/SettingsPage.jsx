import React, { useState } from 'react';
import {
  Settings,
  User,
  Globe,
  Moon,
  Sun,
  Shield,
  HardDrive,
  Key,
  Check,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

export const SettingsPage = () => {
  const { t, currentLanguage, setLanguage, languages } = useLanguage();
  const { isDark, toggleTheme, theme } = useTheme();
  const { user, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'preferences' | 'storage' | 'security'

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(null);
  const [profileError, setProfileError] = useState(null);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityLoading, setSecurityLoading] = useState(false);
  const [securitySuccess, setSecuritySuccess] = useState(null);
  const [securityError, setSecurityError] = useState(null);

  // Storage Cache State
  const [cacheCleared, setCacheCleared] = useState(false);

  const storageUsedMb = ((user?.storageUsedBytes || 0) / (1024 * 1024)).toFixed(2);
  const storageQuotaMb = user?.role === 'admin' ? 5120 : 100;
  const storagePercent = Math.min(
    100,
    Math.round((parseFloat(storageUsedMb) / storageQuotaMb) * 100)
  );

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setProfileLoading(true);
      setProfileError(null);
      const res = await authService.updateProfile(name.trim());
      if (res?.data?.user) {
        updateUser(res.data.user);
      }
      setProfileSuccess('Profile updated successfully!');
      setTimeout(() => setProfileSuccess(null), 3000);
    } catch (err) {
      setProfileError(err?.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleLanguageChange = async (langCode) => {
    setLanguage(langCode);
    try {
      await authService.updatePreferences({ preferredLanguage: langCode });
    } catch (_) {}
  };

  const handleThemeChange = async () => {
    const nextTheme = isDark ? 'light' : 'dark';
    toggleTheme();
    try {
      await authService.updatePreferences({ theme: nextTheme });
    } catch (_) {}
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setSecurityError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setSecurityError('New passwords do not match.');
      return;
    }

    try {
      setSecurityLoading(true);
      setSecurityError(null);
      await authService.changePassword(currentPassword, newPassword);
      setSecuritySuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSecuritySuccess(null), 3000);
    } catch (err) {
      setSecurityError(err?.message || 'Failed to change password. Check current password.');
    } finally {
      setSecurityLoading(false);
    }
  };

  const handleClearCache = () => {
    sessionStorage.clear();
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 3000);
  };

  const tabs = [
    { id: 'profile', label: 'User Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Globe },
    { id: 'storage', label: 'Storage Meter', icon: HardDrive },
    { id: 'security', label: 'Security & Password', icon: Key },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      {/* Header Banner */}
      <div className="pb-5 border-b border-light-border dark:border-dark-border">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-light-heading dark:text-dark-heading tracking-tight">
            {t('nav.settings', 'Account Settings')}
          </h1>
          <Badge variant="brand" icon={Settings}>
            Personalization
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-light-body dark:text-dark-body">
          Manage your account profile, multilingual display scripts, interface themes, and storage quotas.
        </p>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-light-border dark:border-dark-border">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                isActive
                  ? 'bg-accent text-black font-bold shadow-sm'
                  : 'bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-body dark:text-dark-body hover:border-accent'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. USER PROFILE TAB */}
      {activeTab === 'profile' && (
        <Card className="p-6 space-y-5 border border-light-border dark:border-dark-border">
          <div>
            <h3 className="font-heading font-bold text-base text-light-heading dark:text-dark-heading">
              Personal Information
            </h3>
            <p className="text-xs text-light-body dark:text-dark-body">
              Update your account display identity used across workspaces and team reports.
            </p>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-light-heading dark:text-dark-heading">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-heading dark:text-dark-heading focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-light-heading dark:text-dark-heading">
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-light-body dark:text-dark-body cursor-not-allowed opacity-75 font-mono"
              />
              <p className="text-[11px] text-light-body dark:text-dark-body">
                Email is tied to your cryptographic authentication token.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-light-heading dark:text-dark-heading block">
                Account Authority Role
              </label>
              <div className="flex items-center gap-2">
                <Badge variant={user?.role === 'admin' ? 'brand' : 'neutral'} icon={Shield}>
                  {user?.role === 'admin' ? 'Full Administrator' : 'Standard User'}
                </Badge>
              </div>
            </div>

            {profileSuccess && (
              <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-status-success/10 text-status-success border border-status-success/20">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}

            {profileError && (
              <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-status-danger/10 text-status-danger border border-status-danger/20">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            <Button variant="primary" size="md" type="submit" isLoading={profileLoading}>
              Save Profile Changes
            </Button>
          </form>
        </Card>
      )}

      {/* 2. PREFERENCES TAB */}
      {activeTab === 'preferences' && (
        <div className="space-y-5">
          {/* Language Selection */}
          <Card className="p-6 space-y-4 border border-light-border dark:border-dark-border">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-accent/10 text-accent-dark dark:text-accent-light">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-light-heading dark:text-dark-heading">
                  Primary Language & OCR Script
                </h3>
                <p className="text-xs text-light-body dark:text-dark-body">
                  Select your default language for UI translation, AI summaries, and OCR extraction.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {languages.map((lang) => {
                const isSelected = currentLanguage === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-accent bg-accent/10 text-accent-dark dark:text-accent-light shadow-sm'
                        : 'border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface hover:border-accent'
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

          {/* Theme Switcher */}
          <Card className="p-6 space-y-4 border border-light-border dark:border-dark-border">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-accent/10 text-accent-dark dark:text-accent-light">
                {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-light-heading dark:text-dark-heading">
                  Interface Theme
                </h3>
                <p className="text-xs text-light-body dark:text-dark-body">
                  Toggle between high-contrast Dark Mode and crisp Light Mode.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-xs font-semibold text-light-heading dark:text-dark-heading capitalize">
                  Current Theme: {theme} Mode
                </p>
                <p className="text-[11px] text-light-body dark:text-dark-body">
                  {isDark ? 'Pure Black / Charcoal background with Cyan accents' : 'Crisp White / Light Gray background'}
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={handleThemeChange}>
                {isDark ? 'Switch to Light' : 'Switch to Dark'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* 3. STORAGE METER TAB */}
      {activeTab === 'storage' && (
        <Card className="p-6 space-y-5 border border-light-border dark:border-dark-border">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-accent/10 text-accent-dark dark:text-accent-light">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-light-heading dark:text-dark-heading">
                Storage Quota Meter
              </h3>
              <p className="text-xs text-light-body dark:text-dark-body">
                Monitor storage used by your uploaded documents, processed datasets, and generated files.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-light-heading dark:text-dark-heading">
                Storage Consumed:
              </span>
              <span className="font-mono font-bold text-accent-dark dark:text-accent-light">
                {storageUsedMb} MB / {storageQuotaMb} MB ({storagePercent}%)
              </span>
            </div>

            <div className="w-full bg-light-bg dark:bg-dark-bg h-2 rounded-full overflow-hidden">
              <div
                className="bg-accent h-full transition-all duration-500 rounded-full"
                style={{ width: `${Math.max(2, storagePercent)}%` }}
              />
            </div>

            <p className="text-[11px] text-light-body dark:text-dark-body">
              {user?.role === 'admin'
                ? 'Admin tier: 5 GB quota with unlimited batch operations.'
                : 'Standard tier: 100 MB free quota. Upgrade or purge past files when full.'}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <h4 className="text-xs font-semibold text-light-heading dark:text-dark-heading">
                Clear Temporary Browser Cache
              </h4>
              <p className="text-[11px] text-light-body dark:text-dark-body">
                Frees up local session buffers without removing your uploaded cloud documents.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearCache}
              leftIcon={Trash2}
            >
              Clear Cache
            </Button>
          </div>

          {cacheCleared && (
            <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-status-success/10 text-status-success border border-status-success/20">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Temporary session cache cleared successfully!</span>
            </div>
          )}
        </Card>
      )}

      {/* 4. SECURITY & PASSWORD TAB */}
      {activeTab === 'security' && (
        <Card className="p-6 space-y-5 border border-light-border dark:border-dark-border">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-accent/10 text-accent-dark dark:text-accent-light">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-light-heading dark:text-dark-heading">
                Security & Password Management
              </h3>
              <p className="text-xs text-light-body dark:text-dark-body">
                Keep your account secure by using a strong, unique password.
              </p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-light-heading dark:text-dark-heading">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-heading dark:text-dark-heading focus:outline-none focus:ring-2 focus:ring-accent font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-light-heading dark:text-dark-heading">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-heading dark:text-dark-heading focus:outline-none focus:ring-2 focus:ring-accent font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-light-heading dark:text-dark-heading">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-heading dark:text-dark-heading focus:outline-none focus:ring-2 focus:ring-accent font-mono"
              />
            </div>

            {securitySuccess && (
              <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-status-success/10 text-status-success border border-status-success/20">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{securitySuccess}</span>
              </div>
            )}

            {securityError && (
              <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-status-danger/10 text-status-danger border border-status-danger/20">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{securityError}</span>
              </div>
            )}

            <Button variant="primary" size="md" type="submit" isLoading={securityLoading}>
              Update Password
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
};

export default SettingsPage;
