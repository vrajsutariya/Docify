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
import { Dropdown } from '../components/common/Dropdown';
import { CosmicOrbitalBackground } from '../components/auth/CosmicOrbitalBackground';

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

  // Password strength calculator
  const getPasswordStrength = () => {
    if (!password) return { score: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' };
    if (score <= 3) return { score, label: 'Fair', color: 'bg-amber-400' };
    return { score, label: 'Strong', color: 'bg-cyan-400' };
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
    <div className="relative min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex flex-col justify-between overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-600 dark:selection:text-cyan-200 transition-colors duration-200">
      {/* Cosmic background with orbital rings, nodes, and top beam */}
      <CosmicOrbitalBackground />

      {/* Top Header Bar */}
      <header className="relative z-20 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto w-full">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-cyan-300 flex items-center justify-center text-slate-950 font-heading font-black text-base shadow-[0_0_12px_rgba(6,182,212,0.4)] group-hover:scale-105 transition-transform">
            D
          </div>
          <span className="font-heading font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
            Doc<span className="text-cyan-500 dark:text-cyan-400">ify</span>
          </span>
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-6 sm:py-10">
        {/* Brand Headline (Matching Screenshot Typography) */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="text-center mb-6 sm:mb-8"
        >
          <h1 className="font-heading font-black text-3xl sm:text-4xl md:text-5xl tracking-tight bg-gradient-to-r from-cyan-400 via-cyan-300 to-teal-200 bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(6,182,212,0.45)]">
            Docify
          </h1>
          <p className="font-heading font-bold text-lg sm:text-xl md:text-2xl text-white tracking-tight mt-1.5">
            One platform.
          </p>
          <p className="font-heading font-semibold text-xs sm:text-sm text-cyan-400 tracking-wider mt-0.5">
            End-to-End Operations.
          </p>
        </motion.div>

        {/* Central Glassmorphic Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full max-w-[460px]"
        >
          <div className="bg-[#0b1329]/80 backdrop-blur-xl border border-cyan-500/25 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-[0_0_45px_rgba(6,182,212,0.12)] space-y-5">
            {/* Card Header */}
            <div className="text-center space-y-1">
              <h2 className="font-heading font-bold text-xl text-white tracking-tight">
                {t('auth.registerTitle', 'Create Your Account')}
              </h2>
              <p className="text-xs text-slate-400">
                {t('auth.registerSubtitle', 'Start unlocking document & data intelligence with AI')}
              </p>
            </div>

            {/* Error Notice */}
            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-400"
                >
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  {t('auth.fullNameLabel', 'Full Name')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('auth.fullNamePlaceholder', 'Enter your full name')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700/70 bg-[#060b1b]/80 text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  {t('auth.emailLabel', 'Email Address')}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('auth.emailPlaceholder', 'Enter your email')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700/70 bg-[#060b1b]/80 text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  {t('auth.passwordLabel', 'Password')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('auth.passwordPlaceholder', 'At least 6 characters')}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-700/70 bg-[#060b1b]/80 text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-300 transition-colors"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password strength indicator */}
                {password && (
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">Strength:</span>
                      <span className="font-semibold text-cyan-300">{strength.label}</span>
                    </div>
                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
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
                <label className="block text-xs font-semibold text-slate-300">
                  {t('auth.confirmPasswordLabel', 'Confirm Password')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t('auth.confirmPasswordPlaceholder', 'Re-enter your password')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700/70 bg-[#060b1b]/80 text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
                  />
                </div>
              </div>

              {/* Preferred Language Selector */}
              <div className="space-y-1.5 pt-0.5">
                <label className="block text-xs font-semibold text-slate-300">
                  {t('auth.preferredLanguage', 'Interface Language')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => setSelectedLanguage(l.code)}
                      className={`p-2 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                        selectedLanguage === l.code
                          ? 'border-cyan-400 bg-cyan-500/15 text-cyan-300 font-bold shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                          : 'border-slate-800 bg-[#060b1b]/60 text-slate-400 hover:border-cyan-500/30 hover:text-slate-200'
                      }`}
                    >
                      {selectedLanguage === l.code && <Check className="w-3 h-3 text-cyan-400" />}
                      <span>{l.nativeName}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button (Cyan) */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-[0_0_22px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.65)] active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{t('auth.signUpButton', 'Create Free Account')}</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-3 text-[10px] text-slate-500 uppercase font-mono tracking-wider">
                  {t('auth.orDivider', 'Or explore first')}
                </span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              {/* Guest / Demo Access Button */}
              <button
                type="button"
                onClick={handleGuestExplore}
                disabled={isGuestSubmitting}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold border border-dashed border-cyan-500/40 hover:border-cyan-400 text-cyan-300 bg-cyan-500/5 hover:bg-cyan-500/15 backdrop-blur-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isGuestSubmitting ? (
                  <span className="inline-block w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{t('auth.guestButton', 'Explore as Guest (No Login Required)')}</span>
                  </>
                )}
              </button>
            </form>

            {/* Switch to Login */}
            <div className="pt-2 text-center border-t border-slate-800/80 text-xs text-slate-400">
              <span>{t('auth.alreadyHaveAccount', 'Already have an account?')} </span>
              <Link
                to="/login"
                className="font-semibold text-cyan-400 hover:text-cyan-300 hover:underline ml-1"
              >
                {t('auth.signInButton', 'Sign In')}
              </Link>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Mini Footer */}
      <footer className="relative z-20 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Docify. All rights reserved.
      </footer>
    </div>
  );
};

export default Register;
