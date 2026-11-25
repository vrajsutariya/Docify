import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  ArrowRight,
  Globe,
  Sun,
  Moon,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Dropdown } from '../components/common/Dropdown';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const { t, currentLanguage, setLanguage, languages } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const currentLangObj = languages.find((l) => l.code === currentLanguage) || languages[0];

  const languageDropdownItems = languages.map((lang) => ({
    id: lang.code,
    label: `${lang.nativeName} (${lang.script})`,
    active: lang.code === currentLanguage,
    onClick: () => setLanguage(lang.code),
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage(t('auth.validationRequired', 'Please enter your email and password.'));
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      const target = location.state?.from?.pathname || '/dashboard';
      navigate(target, { replace: true });
    } else {
      setErrorMessage(result.message || t('auth.loginFailed', 'Invalid credentials.'));
    }
  };

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-body dark:text-dark-body flex flex-col justify-between transition-colors duration-200">
      {/* Top Header Bar */}
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

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-6 sm:p-8 shadow-soft dark:shadow-soft-dark space-y-6">
            {/* Header info */}
            <div className="text-center space-y-1.5">
              <div className="inline-flex justify-center mb-2">
                <Badge variant="brand" size="sm">
                  <Sparkles className="w-3 h-3" />
                  Docify Authentication
                </Badge>
              </div>
              <h1 className="font-heading font-extrabold text-2xl text-light-heading dark:text-dark-heading tracking-tight">
                {t('auth.loginTitle', 'Welcome Back')}
              </h1>
              <p className="text-xs text-light-body dark:text-dark-body">
                {t('auth.loginSubtitle', 'Sign in to access your intelligent documents & analytics workspace')}
              </p>
            </div>

            {/* Error Notice */}
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
              {/* Email */}
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
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-light-heading dark:text-dark-heading">
                    {t('auth.passwordLabel', 'Password')}
                  </label>
                  <span className="text-[11px] text-accent-dark dark:text-accent-light hover:underline cursor-pointer">
                    {t('auth.forgotPassword', 'Forgot password?')}
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-light-body dark:text-dark-body absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('auth.passwordPlaceholder', '••••••••')}
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
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-light-border dark:border-dark-border text-accent focus:ring-accent cursor-pointer"
                />
                <label htmlFor="rememberMe" className="text-xs text-light-body dark:text-dark-body select-none cursor-pointer">
                  {t('auth.rememberMe', 'Remember me')}
                </label>
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
                {t('auth.signInButton', 'Sign In')}
              </Button>
            </form>

            {/* Switch to Register */}
            <div className="pt-2 text-center border-t border-light-border dark:border-dark-border text-xs text-light-body dark:text-dark-body">
              <span>{t('auth.dontHaveAccount', "Don't have an account?")} </span>
              <Link
                to="/register"
                className="font-semibold text-accent-dark dark:text-accent-light hover:underline ml-1"
              >
                {t('auth.signUpButton', 'Create Free Account')}
              </Link>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Mini Footer */}
      <footer className="py-4 text-center text-xs text-light-body/60 dark:text-dark-body/60 font-mono">
        Docify © {new Date().getFullYear()} — Secure JWT & MongoDB Auth
      </footer>
    </div>
  );
};

export default Login;
