/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  Eye,
  EyeOff,
  Shield,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  KeyRound,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SecureAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export const SecureAuthModal: React.FC<SecureAuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { login, signup, forgotPassword, resetPassword, systemSettings } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'reset'>(initialMode);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Feedback states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [simulationCode, setSimulationCode] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMsg('');
      setSuccessMsg('');
      setSimulationCode(null);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      const user = await login(email.trim(), password);
      if (user.role === 'admin') {
        setSuccessMsg(`Welcome, Administrator ${user.name || user.email}!`);
      } else {
        setSuccessMsg(`Welcome back, ${user.name || user.email}!`);
      }
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Sign Up
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    try {
      const user = await signup({
        email: email.trim(),
        password,
        confirmPassword,
        name: name.trim() || undefined,
        phone: phone.trim() || undefined,
      });

      if (user.role === 'admin') {
        setSuccessMsg('Administrator account registered and secured!');
      } else {
        setSuccessMsg('Account created successfully! Welcome to VenturePulse.');
      }

      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Request Forgot Password Code
  const handleRequestForgotCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setSimulationCode(null);

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await forgotPassword(email.trim());
      setSuccessMsg(res.message);
      if (res.simulationResetCode) {
        setSimulationCode(res.simulationResetCode);
        setResetCode(res.simulationResetCode);
      }
      setMode('reset');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to request reset code.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Submit New Password with Code
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!resetCode.trim()) {
      setErrorMsg('Please enter the 6-digit reset code.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await resetPassword({
        email: email.trim(),
        resetCode: resetCode.trim(),
        newPassword: password,
        confirmPassword,
      });
      setSuccessMsg(res.message || 'Password reset successfully!');
      setTimeout(() => {
        setMode('login');
        setPassword('');
        setConfirmPassword('');
        setResetCode('');
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  const isAdminCandidate = email.trim().toLowerCase() === 'cybersecurity134@gmail.com';

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="User authentication"
    >
      <div
        className="w-full max-w-md liquid-glass-modal rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative border border-white/20 dark:border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-secondary)] transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0071E3] via-[#00C7BE] to-[#34C759] p-0.5 mx-auto shadow-md flex items-center justify-center">
            <div className="w-full h-full rounded-[14px] bg-white/20 dark:bg-black/40 backdrop-blur-xs flex items-center justify-center text-white">
              {mode === 'login' ? (
                <Lock className="w-5 h-5 text-white" />
              ) : mode === 'signup' ? (
                <ShieldCheck className="w-5 h-5 text-white" />
              ) : (
                <KeyRound className="w-5 h-5 text-white" />
              )}
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--text-primary)]">
            {mode === 'login'
              ? 'Sign In to VenturePulse'
              : mode === 'signup'
              ? 'Create Your Account'
              : mode === 'forgot'
              ? 'Reset Password'
              : 'Set New Password'}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            {mode === 'login'
              ? 'Access real-time verified startup intelligence & alerts'
              : mode === 'signup'
              ? 'Join as a verified member to track funding, schemes, and investors'
              : 'Enter your account email to receive a secure recovery code'}
          </p>
        </div>

        {/* Global Alert Banners */}
        {systemSettings.pauseRegistrations && mode === 'signup' && !isAdminCandidate && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">New registrations are currently unavailable.</p>
              <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                The administrator has temporarily paused new account signups.
              </p>
            </div>
          </div>
        )}

        {systemSettings.disableMemberAccess && (
          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Emergency Maintenance Active</p>
              <p className="text-[11px] mt-0.5">
                {systemSettings.emergencyMessage || 'Member access is temporarily suspended for maintenance.'}
              </p>
            </div>
          </div>
        )}

        {isAdminCandidate && (
          <div className="p-3 rounded-xl bg-[var(--accent-teal)]/10 border border-[var(--accent-teal)]/20 text-xs text-[var(--accent-teal)] flex items-center gap-2">
            <Shield className="w-4 h-4 shrink-0" />
            <span>Primary Administrator Account identified.</span>
          </div>
        )}

        {/* Error and Success Notices */}
        {errorMsg && (
          <div
            className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold flex items-start gap-2.5 animate-fade-in"
            role="alert"
          >
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="leading-snug">{errorMsg}</div>
          </div>
        )}

        {successMsg && (
          <div
            className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2.5 animate-fade-in"
            role="status"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <div>{successMsg}</div>
          </div>
        )}

        {simulationCode && (
          <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-600 dark:text-blue-400 space-y-1">
            <div className="flex items-center justify-between font-bold">
              <span>Security Reset Code:</span>
              <span className="font-mono text-base tracking-widest px-2 py-0.5 rounded bg-blue-500/20">
                {simulationCode}
              </span>
            </div>
            <p className="text-[11px] opacity-80">Valid for 15 minutes. Automatically filled into code field.</p>
          </div>
        )}

        {/* Form Selector Tabs (for Login vs Sign Up) */}
        {(mode === 'login' || mode === 'signup') && (
          <div className="flex rounded-2xl p-1 bg-black/5 dark:bg-white/5 border border-white/10">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'login'
                  ? 'bg-white dark:bg-white/15 text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'signup'
                  ? 'bg-white dark:bg-white/15 text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* ========================================== */}
        {/* LOGIN FORM */}
        {/* ========================================== */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-4 py-2.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="text-xs font-bold text-[var(--accent-primary)] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2.5 pr-11 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[var(--accent-primary)] to-[#00C7BE] hover:opacity-95 text-white font-extrabold text-sm shadow-lg flex items-center justify-center gap-2 transition-all tap-target-44 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <span className="text-xs text-[var(--text-secondary)]">Don't have an account? </span>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMsg('');
                }}
                className="text-xs font-bold text-[var(--accent-primary)] hover:underline"
              >
                Create Account
              </button>
            </div>
          </form>
        )}

        {/* ========================================== */}
        {/* SIGN UP FORM */}
        {/* ========================================== */}
        {mode === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-4 py-2.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1">
                  <UserIcon className="w-3 h-3" /> Full Name (Optional)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Elena Rostova"
                  className="w-full px-3.5 py-2 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1">
                  <Phone className="w-3 h-3" /> Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 012-3456"
                  className="w-full px-3.5 py-2 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-2.5 pr-11 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Confirm Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-4 py-2.5 pr-11 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || (systemSettings.pauseRegistrations && !isAdminCandidate)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[var(--accent-primary)] to-[#00C7BE] hover:opacity-95 text-white font-extrabold text-sm shadow-lg flex items-center justify-center gap-2 transition-all tap-target-44 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-1">
              <span className="text-xs text-[var(--text-secondary)]">Already have an account? </span>
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg('');
                }}
                className="text-xs font-bold text-[var(--accent-primary)] hover:underline"
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* ========================================== */}
        {/* FORGOT PASSWORD FORM (STEP 1) */}
        {/* ========================================== */}
        {mode === 'forgot' && (
          <form onSubmit={handleRequestForgotCode} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Account Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-4 py-2.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[var(--accent-primary)] to-[#00C7BE] text-white font-extrabold text-sm shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 tap-target-44"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Send Reset Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-between text-xs pt-2">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold"
              >
                ← Back to Login
              </button>
              <button
                type="button"
                onClick={() => setMode('reset')}
                className="text-[var(--accent-primary)] font-bold hover:underline"
              >
                Already have a code?
              </button>
            </div>
          </form>
        )}

        {/* ========================================== */}
        {/* RESET PASSWORD FORM (STEP 2) */}
        {/* ========================================== */}
        {mode === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5" /> 6-Digit Reset Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                placeholder="e.g. 849201"
                className="w-full px-4 py-2.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-center font-mono tracking-widest text-lg font-bold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> New Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-4 py-2.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full px-4 py-2.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[var(--accent-primary)] to-[#00C7BE] text-white font-extrabold text-sm shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 tap-target-44"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Update Password</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                ← Back to Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
