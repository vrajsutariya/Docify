import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Mail,
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertTriangle,
  ArrowRight,
  Globe,
  Sun,
  Moon,
  Sparkles,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Dropdown } from '../components/common/Dropdown';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGuestSubmitting, setIsGuestSubmitting] = useState(false);

  const { register, guestLogin } = useAuth();
  const { t, currentLanguage, setLanguage, languages } = useLanguage();
  const { isDark, toggleTheme, theme } = useTheme();
  const navigate = useNavigate();

  const currentLangObj = languages.find((l) => l.code === currentLanguage) || languages[0];

  const languageDropdownItems = languages.map((lang) => ({
    id: lang.code,
    label: `${lang.nativeName} (${lang.script})`,
    active: lang.code === currentLanguage,
    onClick: () => setLanguage(lang.code),
  }));

  // Simple password strength calculator
  const getPasswordStrength = () => {
    if (!password) return { score: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 2) return { score, label: 'Weak', color: 'bg-status-error' };
    if (score <= 3) return { score, label: 'Fair', color: 'bg-status-warning' };
    return { score, label: 'Strong', color: 'bg-status-success' };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name || !email || !password || !confirmPassword) {
      setErrorMessage(t('auth.validationRequired', 'Please fill in all required fields.'));
      return;
    }

    if (password.length < 6) {
      setErrorMessage(t('auth.passwordTooShort', 'Password must be at least 6 characters long.'));
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(t('auth.passwordsDoNotMatch', 'Passwords do not match.'));
      return;
    }

    setIsSubmitting(true);
    const result = await register({
      name,
      email,
      password,
      preferredLanguage: selectedLanguage,
      theme,
    });
    setIsSubmitting(false);

    if (result.success) {
      setLanguage(selectedLanguage);
      navigate('/dashboard', { replace: true });
    } else {
      setErrorMessage(result.message || 'Registration failed.');
    }
  };

  const handleGuestExplore = async () => {
    setIsGuestSubmitting(true);
    await guestLogin();
    setIsGuestSubmitting(false);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-body dark:text-dark-body flex flex-col justify-between transition-colors duration-200">
      {/* Top Header */}
      <header className="px-6 py-4 flex items-center justify-between max-w-6xl mx-auto w-full">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-cyan-gradient flex items-center justify-center text-black font-heading font-extrabold text-base shadow-sm group-hover:scale-105 transition-transform">
            D
          </div>
          <span className="font-heading font-extrabold text-lg tracking-tight text-light-heading dark:text-dark-heading">
            Doc<span className="text-accent-dark dark:text-accent-light">ify</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <Dropdown
            align="right"
            items={languageDropdownItems}
            trigger={
              <button
                type="button"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface hover:border-accent text-light-heading dark:text-dark-heading text-xs font-semibold"
              >
                <Globe className="w-3.5 h-3.5 text-accent-dark dark:text-accent-light" />
                <span>{currentLangObj.script}</span>
              </button>
            }
          />

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2 rounded-xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-light-heading dark:text-dark-heading hover:border-accent"
          >
            {isDark ? <Sun className="w-4 h-4 text-accent-light" /> : <Moon className="w-4 h-4 text-accent-dark" />}
          </button>
        </div>
      </header>

      {/* Main Register Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-6 sm:p-8 shadow-soft dark:shadow-soft-dark space-y-6">
            <div className="text-center space-y-1.5">
              <div className="inline-flex justify-center mb-2">
                <Badge variant="brand" size="sm">
                  <Sparkles className="w-3 h-3" />
                  Free 14-Day Full Access
                </Badge>
              </div>
              <h1 className="font-heading font-extrabold text-2xl text-light-heading dark:text-dark-heading tracking-tight">
                {t('auth.registerTitle', 'Create Your Account')}
              </h1>
              <p className="text-xs text-light-body dark:text-dark-body">
                {t('auth.registerSubtitle', 'Start unlocking document & data intelligence with AI in seconds')}
              </p>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 rounded-xl bg-status-error/10 border border-status-error/20 flex items-start gap-2.5 text-xs text-status-error"
                >
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-light-heading dark:text-dark-heading">
                  {t('auth.fullNameLabel', 'Full Name')}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-light-body dark:text-dark-body absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('auth.fullNamePlaceholder', 'e.g. John Doe')}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-heading dark:text-dark-heading text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-light-heading dark:text-dark-heading">
                  {t('auth.emailLabel', 'Email Address')}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-light-body dark:text-dark-body absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('auth.emailPlaceholder', 'name@example.com')}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-heading dark:text-dark-heading text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-light-heading dark:text-dark-heading">
                  {t('auth.passwordLabel', 'Password')}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-light-body dark:text-dark-body absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('auth.passwordPlaceholder', 'At least 6 characters')}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-heading dark:text-dark-heading text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-light-body dark:text-dark-body hover:text-light-heading dark:hover:text-dark-heading"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password strength indicator */}
                {password && (
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-light-body dark:text-dark-body">Strength:</span>
                      <span className="font-semibold">{strength.label}</span>
                    </div>
                    <div className="h-1 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${strength.color}`}
                        style={{ width: `${(strength.score / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-light-heading dark:text-dark-heading">
                  {t('auth.confirmPasswordLabel', 'Confirm Password')}
                </label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-light-body dark:text-dark-body absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t('auth.confirmPasswordPlaceholder', 'Re-enter your password')}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-heading dark:text-dark-heading text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              {/* Preferred Language Selector directly in registration */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-light-heading dark:text-dark-heading">
                  {t('auth.preferredLanguage', 'Preferred Interface Language')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => setSelectedLanguage(l.code)}
                      className={`p-2 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                        selectedLanguage === l.code
                          ? 'border-accent bg-accent/10 text-accent-dark dark:text-accent-light font-bold'
                          : 'border-light-border dark:border-dark-border hover:border-accent/40 text-light-body dark:text-dark-body'
                      }`}
                    >
                      {selectedLanguage === l.code && <Check className="w-3 h-3 text-accent" />}
                      <span>{l.nativeName}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isSubmitting}
                className="w-full mt-2"
                rightIcon={ArrowRight}
              >
                {t('auth.signUpButton', 'Create Free Account')}
              </Button>

              {/* Divider */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-light-border dark:border-dark-border"></div>
                <span className="flex-shrink mx-3 text-[11px] text-light-body/70 dark:text-dark-body/70 uppercase font-mono tracking-wider">
                  {t('auth.orDivider', 'Or explore first')}
                </span>
                <div className="flex-grow border-t border-light-border dark:border-dark-border"></div>
              </div>

              {/* Guest / Demo Access Button */}
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={handleGuestExplore}
                isLoading={isGuestSubmitting}
                className="w-full border-dashed border-accent/40 hover:border-accent text-accent-dark dark:text-accent-light bg-accent/5 hover:bg-accent/10"
                leftIcon={Sparkles}
              >
                {t('auth.guestButton', 'Explore as Guest (No Login Required)')}
              </Button>
            </form>

            {/* Switch to Login */}
            <div className="pt-2 text-center border-t border-light-border dark:border-dark-border text-xs text-light-body dark:text-dark-body">
              <span>{t('auth.alreadyHaveAccount', 'Already have an account?')} </span>
              <Link
                to="/login"
                className="font-semibold text-accent-dark dark:text-accent-light hover:underline ml-1"
              >
                {t('auth.signInButton', 'Sign In')}
              </Link>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Mini Footer */}
      <footer className="py-4 text-center text-xs text-light-body/60 dark:text-dark-body/60 font-mono">
        Docify © {new Date().getFullYear()} — Secure Registration & Preferences
      </footer>
    </div>
  );
};

export default Register;
