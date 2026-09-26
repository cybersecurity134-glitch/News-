/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
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
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/client';
import { AuthUser } from '../../types/auth';

interface SecureAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  onSuccess?: (user: AuthUser) => void;
}

export const SecureAuthModal: React.FC<SecureAuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess,
}) => {
  const { login, signup, forgotPassword, resetPassword, systemSettings } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'reset'>(initialMode);
  const [role, setRole] = useState<'viewer' | 'uploader'>('viewer');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [uploadPassword, setUploadPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showUploadPassword, setShowUploadPassword] = useState(false);

  // Field validation error states (for reserving layout space)
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    uploadPassword?: string;
    name?: string;
    phone?: string;
    resetCode?: string;
  }>({});

  // Feedback states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [simulationCode, setSimulationCode] = useState<string | null>(null);

  // Live email uniqueness check states
  const [emailChecking, setEmailChecking] = useState(false);

  // Resend OTP cooldown timer
  const [resendCooldown, setResendCooldown] = useState(0);

  // Modal container ref
  const modalContainerRef = useRef<HTMLDivElement>(null);

  // Synchronize when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMsg('');
      setSuccessMsg('');
      setSimulationCode(null);
      setFieldErrors({});
      setIsLoading(false);
    }
  }, [isOpen, initialMode]);

  // Resend timer countdown interval
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Debounced live email check (350ms) to detect duplicate accounts before submit
  useEffect(() => {
    if (mode !== 'signup' || !email.includes('@') || email.trim().length < 5) {
      return;
    }

    const handler = setTimeout(async () => {
      setEmailChecking(true);
      try {
        const res = await apiClient.checkEmail(email.trim());
        if (!res.available) {
          setFieldErrors((prev) => ({
            ...prev,
            email: 'An account with this email already exists. Please log in.',
          }));
        } else {
          setFieldErrors((prev) => {
            if (prev.email?.includes('already exists')) {
              const copy = { ...prev };
              delete copy.email;
              return copy;
            }
            return prev;
          });
        }
      } catch {
        // Non-blocking network fallback
      } finally {
        setEmailChecking(false);
      }
    }, 350);

    return () => clearTimeout(handler);
  }, [email, mode]);

  if (!isOpen) return null;

  // Background pre-warming of next screen data to eliminate perceived lag
  const prewarmNextScreen = () => {
    try {
      fetch('/api/state', { cache: 'no-store' }).catch(() => {});
      fetch('/api/news', { cache: 'no-store' }).catch(() => {});
    } catch {
      // background prewarm
    }
  };

  // Password strength check
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: '', color: '' };
    if (pwd.length < 6) return { score: 1, label: 'Too short', color: 'bg-red-500' };
    const hasLetters = /[a-zA-Z]/.test(pwd);
    const hasNumbers = /[0-9]/.test(pwd);
    const hasSpecial = /[^a-zA-Z0-9]/.test(pwd);

    if (pwd.length >= 8 && hasLetters && hasNumbers && hasSpecial) {
      return { score: 3, label: 'Strong', color: 'bg-emerald-500' };
    }
    if (pwd.length >= 6 && hasLetters && (hasNumbers || hasSpecial)) {
      return { score: 2, label: 'Good', color: 'bg-amber-500' };
    }
    return { score: 1, label: 'Weak', color: 'bg-amber-400' };
  };

  // Handle Login Submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setErrorMsg('');
    setSuccessMsg('');

    // Instant client validation
    const errors: typeof fieldErrors = {};
    const normEmail = email.trim();

    if (!normEmail) {
      errors.email = 'Please enter your email address.';
    } else if (!normEmail.includes('@') || !normEmail.includes('.')) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Please enter your password.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsLoading(true);

    try {
      const user = await login(normEmail, password);

      // Pre-warm data for instant screen transition
      prewarmNextScreen();

      if (user.role === 'admin') {
        setSuccessMsg(`Welcome, Administrator ${user.name || user.email}!`);
      } else if (user.role === 'uploader') {
        setSuccessMsg(`Welcome back, Contributor ${user.name || user.email}!`);
      } else {
        setSuccessMsg(`Welcome back, ${user.name || user.email}!`);
      }

      setTimeout(() => {
        onSuccess?.(user);
        onClose();
      }, 450);
    } catch (err: any) {
      const msg = err.message || 'Login failed. Please verify your credentials.';
      if (msg.toLowerCase().includes('password') || msg.toLowerCase().includes('invalid email or password')) {
        setFieldErrors({ password: 'Incorrect email or password. Please try again.' });
      } else if (msg.toLowerCase().includes('blocked')) {
        setErrorMsg('This account has been suspended or blocked by the administrator.');
      } else if (msg.toLowerCase().includes('locked')) {
        setErrorMsg(msg);
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Sign Up Submission
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setErrorMsg('');
    setSuccessMsg('');

    // Instant client-side validation
    const errors: typeof fieldErrors = {};
    const normEmail = email.trim().toLowerCase();

    if (!normEmail || !normEmail.includes('@') || !normEmail.includes('.')) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password || password.length < 6) {
      errors.password = 'Password must be at least 6 characters long.';
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match. Please re-enter.';
    }

    if (role === 'uploader' && normEmail !== 'cybersecurity134@gmail.com') {
      if (!uploadPassword.trim()) {
        errors.uploadPassword = 'Admin-set upload passcode is required for Contributor access.';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsLoading(true);

    try {
      const user = await signup({
        email: normEmail,
        password,
        confirmPassword,
        name: name.trim() || undefined,
        phone: phone.trim() || undefined,
        role,
        uploadPassword: role === 'uploader' ? uploadPassword.trim() : undefined,
      });

      prewarmNextScreen();

      if (user.role === 'admin') {
        setSuccessMsg('Administrator account registered and secured!');
      } else if (user.role === 'uploader') {
        setSuccessMsg('Contributor account activated! Upload permissions unlocked.');
      } else {
        setSuccessMsg('Account created successfully! Welcome to VenturePulse.');
      }

      setTimeout(() => {
        onSuccess?.(user);
        onClose();
      }, 450);
    } catch (err: any) {
      const msg = err.message || 'Registration failed.';
      if (err.field === 'uploadPassword' || msg.toLowerCase().includes('passcode')) {
        setFieldErrors({
          uploadPassword: 'Incorrect upload passcode. Please verify the code provided by the administrator.',
        });
      } else if (err.field === 'email' || msg.toLowerCase().includes('already exists')) {
        setFieldErrors({
          email: 'An account with this email already exists. Please log in.',
        });
      } else if (err.field === 'password') {
        setFieldErrors({ password: msg });
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Request Forgot Password Code
  const handleRequestForgotCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setErrorMsg('');
    setSuccessMsg('');
    setSimulationCode(null);

    const normEmail = email.trim().toLowerCase();
    if (!normEmail || !normEmail.includes('@')) {
      setFieldErrors({ email: 'Please enter a valid email address.' });
      return;
    }

    setFieldErrors({});
    setIsLoading(true);

    try {
      const res = await forgotPassword(normEmail);
      setSuccessMsg(res.message);
      if (res.simulationResetCode) {
        setSimulationCode(res.simulationResetCode);
        setResetCode(res.simulationResetCode);
      }
      setResendCooldown(45);
      setMode('reset');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to request reset code.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Resend Reset Code with cooldown
  const handleResendCode = async () => {
    if (resendCooldown > 0 || isLoading || !email.trim()) return;

    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const res = await forgotPassword(email.trim());
      setSuccessMsg('A fresh verification code has been generated.');
      if (res.simulationResetCode) {
        setSimulationCode(res.simulationResetCode);
        setResetCode(res.simulationResetCode);
      }
      setResendCooldown(45);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to resend code.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Submit New Password with Code
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setErrorMsg('');
    setSuccessMsg('');

    const errors: typeof fieldErrors = {};
    if (!resetCode.trim()) {
      errors.resetCode = 'Please enter the 6-digit reset code.';
    } else if (resetCode.trim().length < 6) {
      errors.resetCode = 'Reset code must be 6 digits.';
    }

    if (!password || password.length < 6) {
      errors.password = 'New password must be at least 6 characters long.';
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsLoading(true);

    try {
      const res = await resetPassword({
        email: email.trim().toLowerCase(),
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
        setSimulationCode(null);
      }, 900);
    } catch (err: any) {
      const msg = err.message || 'Failed to reset password.';
      if (msg.toLowerCase().includes('code')) {
        setFieldErrors({ resetCode: msg });
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isAdminCandidate = email.trim().toLowerCase() === 'cybersecurity134@gmail.com';
  const pwdStrength = getPasswordStrength(password);

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="User authentication"
    >
      <div
        ref={modalContainerRef}
        className="w-full max-w-md liquid-glass-modal rounded-3xl p-6 sm:p-8 my-auto shadow-2xl space-y-5 relative border border-white/20 dark:border-white/10 max-h-[92dvh] overflow-y-auto overscroll-contain specular-line"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors tap-target-44"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Brand & Header */}
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

          <h2 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)] font-display">
            {mode === 'login'
              ? 'Sign In to VenturePulse'
              : mode === 'signup'
              ? 'Create Your Account'
              : mode === 'forgot'
              ? 'Reset Password'
              : 'Set New Password'}
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] max-w-xs mx-auto">
            {mode === 'login'
              ? 'Access real-time verified startup intelligence & alerts'
              : mode === 'signup'
              ? 'Join as a verified member to track or contribute startup intelligence'
              : 'Enter your account email to receive a secure recovery code'}
          </p>
        </div>

        {/* Global Warning Notices */}
        {systemSettings.pauseRegistrations && mode === 'signup' && !isAdminCandidate && (
          <div className="p-3.5 rounded-2xl bg-[var(--color-warning-bg)] border border-[var(--color-warning-border)] text-[var(--color-warning-fg)] text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">New registrations are currently paused.</p>
              <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">
                The administrator has temporarily paused new account signups.
              </p>
            </div>
          </div>
        )}

        {systemSettings.disableMemberAccess && (
          <div className="p-3.5 rounded-2xl bg-[var(--color-error-bg)] border border-[var(--color-error-border)] text-[var(--color-error-fg)] text-xs flex items-start gap-2.5">
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
          <div className="p-3 rounded-xl bg-[var(--color-primary-subtle)] border border-[var(--color-primary-border)] text-xs text-[var(--color-primary)] flex items-center gap-2">
            <Shield className="w-4 h-4 shrink-0" />
            <span>Primary Administrator Account identified.</span>
          </div>
        )}

        {/* Top Error Notice (general failure) */}
        {errorMsg && (
          <div
            className="p-3.5 rounded-2xl bg-[var(--color-error-bg)] border border-[var(--color-error-border)] text-[var(--color-error-fg)] text-xs font-semibold flex items-start gap-2.5 animate-fade-in"
            role="alert"
          >
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="leading-snug">{errorMsg}</div>
          </div>
        )}

        {/* Top Success Notice */}
        {successMsg && (
          <div
            className="p-3.5 rounded-2xl bg-[var(--color-success-bg)] border border-[var(--color-success-border)] text-[var(--color-success-fg)] text-xs font-semibold flex items-center gap-2.5 animate-fade-in"
            role="status"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <div>{successMsg}</div>
          </div>
        )}

        {/* Verification Simulation Code helper */}
        {simulationCode && (
          <div className="p-3 rounded-2xl bg-[var(--color-info-bg)] border border-[var(--color-info-border)] text-xs text-[var(--color-info-fg)] space-y-1">
            <div className="flex items-center justify-between font-bold">
              <span>Security Reset Code:</span>
              <span className="font-mono text-base tracking-widest px-2 py-0.5 rounded bg-[var(--color-info-bg)]">
                {simulationCode}
              </span>
            </div>
            <p className="text-[11px] opacity-80">Valid for 15 minutes. Automatically filled into code field.</p>
          </div>
        )}

        {/* Top Segmented Mode Selector (Sign In vs Sign Up) */}
        {(mode === 'login' || mode === 'signup') && (
          <div className="flex rounded-2xl p-1 bg-black/[0.04] dark:bg-white/[0.06] border border-black/10 dark:border-white/10">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
                setSuccessMsg('');
                setFieldErrors({});
              }}
              className={`flex-1 h-11 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                mode === 'login'
                  ? 'bg-white dark:bg-white/15 text-[var(--color-text-primary)] shadow-sm border border-black/5 dark:border-white/10'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg('');
                setSuccessMsg('');
                setFieldErrors({});
              }}
              className={`flex-1 h-11 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                mode === 'signup'
                  ? 'bg-white dark:bg-white/15 text-[var(--color-text-primary)] shadow-sm border border-black/5 dark:border-white/10'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Sign Up</span>
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* SIGN IN FORM                                                   */}
        {/* ============================================================== */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-3.5 text-left">
            {/* Email Field */}
            <div className="space-y-1">
              <label htmlFor="login-email" className="block text-xs font-semibold text-[var(--color-text-secondary)]">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[var(--color-text-tertiary)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: undefined }));
                  }}
                  onFocus={(e) => e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                  placeholder="name@company.com"
                  autoComplete="email"
                  className={`h-11 w-full pl-10 pr-4 rounded-xl bg-black/[0.03] dark:bg-white/[0.06] border text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all scroll-m-6 ${
                    fieldErrors.email
                      ? 'border-red-500/60 dark:border-red-500/60 ring-1 ring-red-500/20'
                      : 'border-black/10 dark:border-white/15'
                  }`}
                />
              </div>
              <div className="min-h-[16px] text-[11px] text-red-500 dark:text-red-400 font-medium leading-tight flex items-center gap-1 transition-opacity duration-150">
                {fieldErrors.email && (
                  <>
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span>{fieldErrors.email}</span>
                  </>
                )}
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="login-password" className="block text-xs font-semibold text-[var(--color-text-secondary)]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setErrorMsg('');
                    setSuccessMsg('');
                    setFieldErrors({});
                  }}
                  className="text-xs font-bold text-[var(--color-primary)] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[var(--color-text-tertiary)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined }));
                  }}
                  onFocus={(e) => e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className={`h-11 w-full pl-10 pr-11 rounded-xl bg-black/[0.03] dark:bg-white/[0.06] border text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all scroll-m-6 ${
                    fieldErrors.password
                      ? 'border-red-500/60 dark:border-red-500/60 ring-1 ring-red-500/20'
                      : 'border-black/10 dark:border-white/15'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="min-h-[16px] text-[11px] text-red-500 dark:text-red-400 font-medium leading-tight flex items-center gap-1 transition-opacity duration-150">
                {fieldErrors.password && (
                  <>
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span>{fieldErrors.password}</span>
                  </>
                )}
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="h-11 w-full rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[#00C7BE] hover:opacity-95 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Secondary Switch Link */}
            <div className="text-center pt-1">
              <span className="text-xs text-[var(--color-text-secondary)]">Don't have an account? </span>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMsg('');
                  setSuccessMsg('');
                  setFieldErrors({});
                }}
                className="text-xs font-bold text-[var(--color-primary)] hover:underline ml-1"
              >
                Create Account
              </button>
            </div>
          </form>
        )}

        {/* ============================================================== */}
        {/* SIGN UP FORM                                                   */}
        {/* ============================================================== */}
        {mode === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-3.5 text-left">
            {/* Section 1: Role Selection (Contributor vs Viewer) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-[var(--color-text-secondary)]">
                  Account Type
                </label>
                <span className="text-[10px] text-[var(--color-text-tertiary)]">
                  {role === 'viewer' ? 'Reader / Founder' : 'Verified Publisher'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/10 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setRole('viewer');
                    if (fieldErrors.uploadPassword) {
                      setFieldErrors((p) => ({ ...p, uploadPassword: undefined }));
                    }
                  }}
                  className={`h-11 w-full rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    role === 'viewer'
                      ? 'bg-white dark:bg-white/15 text-[var(--color-text-primary)] shadow-sm border border-black/5 dark:border-white/10'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  <Eye className="w-4 h-4 shrink-0" />
                  <span>Viewer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('uploader')}
                  className={`h-11 w-full rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    role === 'uploader'
                      ? 'bg-white dark:bg-white/15 text-[var(--color-text-primary)] shadow-sm border border-black/5 dark:border-white/10'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>Contributor</span>
                </button>
              </div>
              <p className="text-[11px] text-[var(--color-text-tertiary)] px-0.5">
                {role === 'viewer'
                  ? 'Access and track verified startup intelligence, schemes, and investors'
                  : 'Submit and verify startup funding intelligence, schemes, and news (requires admin upload passcode)'}
              </p>
            </div>

            {/* Section 2: Personal Information Group */}
            <div className="space-y-3 pt-1">
              {/* Full Name */}
              <div className="space-y-1">
                <label htmlFor="signup-name" className="block text-xs font-semibold text-[var(--color-text-secondary)]">
                  Full Name <span className="text-[10px] font-normal text-[var(--color-text-tertiary)]">(Optional)</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[var(--color-text-tertiary)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="signup-name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (fieldErrors.name) setFieldErrors((p) => ({ ...p, name: undefined }));
                    }}
                    onFocus={(e) => e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                    placeholder="e.g. Elena Rostova"
                    autoComplete="name"
                    className="h-11 w-full pl-10 pr-4 rounded-xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/10 dark:border-white/15 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all scroll-m-6"
                  />
                </div>
                <div className="min-h-[16px] text-[11px] text-red-500 dark:text-red-400 font-medium leading-tight flex items-center gap-1 transition-opacity duration-150">
                  {fieldErrors.name && (
                    <>
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      <span>{fieldErrors.name}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label htmlFor="signup-email" className="block text-xs font-semibold text-[var(--color-text-secondary)]">
                    Email Address *
                  </label>
                  {emailChecking && (
                    <span className="text-[10px] text-[var(--color-text-tertiary)] flex items-center gap-1">
                      <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Checking...
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[var(--color-text-tertiary)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="signup-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: undefined }));
                    }}
                    onFocus={(e) => e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                    placeholder="name@company.com"
                    autoComplete="email"
                    className={`h-11 w-full pl-10 pr-4 rounded-xl bg-black/[0.03] dark:bg-white/[0.06] border text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all scroll-m-6 ${
                      fieldErrors.email
                        ? 'border-red-500/60 dark:border-red-500/60 ring-1 ring-red-500/20'
                        : 'border-black/10 dark:border-white/15'
                    }`}
                  />
                </div>
                <div className="min-h-[16px] text-[11px] text-red-500 dark:text-red-400 font-medium leading-tight flex items-center gap-1 transition-opacity duration-150">
                  {fieldErrors.email && (
                    <>
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      <span>{fieldErrors.email}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label htmlFor="signup-phone" className="block text-xs font-semibold text-[var(--color-text-secondary)]">
                  Phone Number <span className="text-[10px] font-normal text-[var(--color-text-tertiary)]">(Optional)</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[var(--color-text-tertiary)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="signup-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (fieldErrors.phone) setFieldErrors((p) => ({ ...p, phone: undefined }));
                    }}
                    onFocus={(e) => e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                    placeholder="+1 (555) 012-3456"
                    autoComplete="tel"
                    className="h-11 w-full pl-10 pr-4 rounded-xl bg-black/[0.03] dark:bg-white/[0.06] border border-black/10 dark:border-white/15 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all scroll-m-6"
                  />
                </div>
                <div className="min-h-[16px] text-[11px] text-red-500 dark:text-red-400 font-medium leading-tight flex items-center gap-1 transition-opacity duration-150">
                  {fieldErrors.phone && (
                    <>
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      <span>{fieldErrors.phone}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Contributor Upload Passcode Requirement (shown only for Contributor) */}
            {role === 'uploader' && !isAdminCandidate && (
              <div className="space-y-1 pt-1 animate-fade-in">
                <div className="flex items-center justify-between">
                  <label htmlFor="signup-upload-passcode" className="block text-xs font-semibold text-[var(--color-text-secondary)]">
                    Admin-Set Upload Passcode *
                  </label>
                  <span className="text-[10px] text-[var(--color-primary)] font-semibold">Required for Contributor</span>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[var(--color-text-tertiary)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="signup-upload-passcode"
                    type={showUploadPassword ? 'text' : 'password'}
                    required
                    value={uploadPassword}
                    onChange={(e) => {
                      setUploadPassword(e.target.value);
                      if (fieldErrors.uploadPassword) setFieldErrors((p) => ({ ...p, uploadPassword: undefined }));
                    }}
                    onFocus={(e) => e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                    placeholder="Enter passcode provided by admin (e.g. 26054)"
                    autoComplete="off"
                    className={`h-11 w-full pl-10 pr-11 rounded-xl bg-black/[0.03] dark:bg-white/[0.06] border text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all scroll-m-6 ${
                      fieldErrors.uploadPassword
                        ? 'border-red-500/60 dark:border-red-500/60 ring-1 ring-red-500/20'
                        : 'border-black/10 dark:border-white/15'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowUploadPassword(!showUploadPassword)}
                    aria-label={showUploadPassword ? 'Hide passcode' : 'Show passcode'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  >
                    {showUploadPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="min-h-[16px] text-[11px] text-red-500 dark:text-red-400 font-medium leading-tight flex items-center gap-1 transition-opacity duration-150">
                  {fieldErrors.uploadPassword ? (
                    <>
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      <span>{fieldErrors.uploadPassword}</span>
                    </>
                  ) : (
                    <span className="text-[10px] text-[var(--color-text-tertiary)]">
                      Protects news integrity. Verified code issued by administration.
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Section 3: Security & Passwords Group */}
            <div className="space-y-3 pt-1">
              {/* Password */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label htmlFor="signup-password" className="block text-xs font-semibold text-[var(--color-text-secondary)]">
                    Password *
                  </label>
                  {password && (
                    <span className="text-[10px] font-bold text-[var(--color-text-tertiary)] flex items-center gap-1">
                      <span className={`inline-block w-2 h-2 rounded-full ${pwdStrength.color}`} />
                      {pwdStrength.label}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[var(--color-text-tertiary)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined }));
                    }}
                    onFocus={(e) => e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                    className={`h-11 w-full pl-10 pr-11 rounded-xl bg-black/[0.03] dark:bg-white/[0.06] border text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all scroll-m-6 ${
                      fieldErrors.password
                        ? 'border-red-500/60 dark:border-red-500/60 ring-1 ring-red-500/20'
                        : 'border-black/10 dark:border-white/15'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="min-h-[16px] text-[11px] text-red-500 dark:text-red-400 font-medium leading-tight flex items-center gap-1 transition-opacity duration-150">
                  {fieldErrors.password && (
                    <>
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      <span>{fieldErrors.password}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label htmlFor="signup-confirm-password" className="block text-xs font-semibold text-[var(--color-text-secondary)]">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[var(--color-text-tertiary)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="signup-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (fieldErrors.confirmPassword) setFieldErrors((p) => ({ ...p, confirmPassword: undefined }));
                    }}
                    onFocus={(e) => e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                    placeholder="Re-enter password"
                    autoComplete="new-password"
                    className={`h-11 w-full pl-10 pr-11 rounded-xl bg-black/[0.03] dark:bg-white/[0.06] border text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all scroll-m-6 ${
                      fieldErrors.confirmPassword
                        ? 'border-red-500/60 dark:border-red-500/60 ring-1 ring-red-500/20'
                        : 'border-black/10 dark:border-white/15'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="min-h-[16px] text-[11px] text-red-500 dark:text-red-400 font-medium leading-tight flex items-center gap-1 transition-opacity duration-150">
                  {fieldErrors.confirmPassword && (
                    <>
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      <span>{fieldErrors.confirmPassword}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Section 4: Primary Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || (systemSettings.pauseRegistrations && !isAdminCandidate)}
                className="h-11 w-full rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[#00C7BE] hover:opacity-95 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create {role === 'uploader' ? 'Contributor' : 'Member'} Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Section 5: Secondary Links */}
            <div className="text-center pt-1">
              <span className="text-xs text-[var(--color-text-secondary)]">Already have an account? </span>
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg('');
                  setSuccessMsg('');
                  setFieldErrors({});
                }}
                className="text-xs font-bold text-[var(--color-primary)] hover:underline ml-1"
              >
                Log in
              </button>
            </div>
          </form>
        )}

        {/* ============================================================== */}
        {/* FORGOT PASSWORD FORM (STEP 1)                                  */}
        {/* ============================================================== */}
        {mode === 'forgot' && (
          <form onSubmit={handleRequestForgotCode} className="space-y-4 text-left">
            <div className="space-y-1">
              <label htmlFor="forgot-email" className="block text-xs font-semibold text-[var(--color-text-secondary)]">
                Account Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[var(--color-text-tertiary)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="forgot-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: undefined }));
                  }}
                  onFocus={(e) => e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                  placeholder="name@company.com"
                  autoComplete="email"
                  className={`h-11 w-full pl-10 pr-4 rounded-xl bg-black/[0.03] dark:bg-white/[0.06] border text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all scroll-m-6 ${
                    fieldErrors.email
                      ? 'border-red-500/60 dark:border-red-500/60 ring-1 ring-red-500/20'
                      : 'border-black/10 dark:border-white/15'
                  }`}
                />
              </div>
              <div className="min-h-[16px] text-[11px] text-red-500 dark:text-red-400 font-medium leading-tight flex items-center gap-1 transition-opacity duration-150">
                {fieldErrors.email && (
                  <>
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span>{fieldErrors.email}</span>
                  </>
                )}
              </div>
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={isLoading}
                className="h-11 w-full rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[#00C7BE] hover:opacity-95 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send Recovery Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between text-xs pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg('');
                  setSuccessMsg('');
                  setFieldErrors({});
                }}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] font-bold transition-colors"
              >
                ← Back to Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('reset');
                  setErrorMsg('');
                  setSuccessMsg('');
                  setFieldErrors({});
                }}
                className="text-[var(--color-primary)] font-bold hover:underline"
              >
                Already have a code?
              </button>
            </div>
          </form>
        )}

        {/* ============================================================== */}
        {/* RESET PASSWORD FORM (STEP 2 WITH OTP RESEND & TIMER)           */}
        {/* ============================================================== */}
        {mode === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-3.5 text-left">
            {/* Code Field */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="reset-code" className="block text-xs font-semibold text-[var(--color-text-secondary)]">
                  6-Digit Reset Code *
                </label>
                <button
                  type="button"
                  disabled={resendCooldown > 0 || isLoading}
                  onClick={handleResendCode}
                  className="text-xs font-bold text-[var(--color-primary)] hover:underline disabled:opacity-50 disabled:no-underline flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>{resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}</span>
                </button>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[var(--color-text-tertiary)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="reset-code"
                  type="text"
                  required
                  maxLength={6}
                  value={resetCode}
                  onChange={(e) => {
                    setResetCode(e.target.value.replace(/\D/g, ''));
                    if (fieldErrors.resetCode) setFieldErrors((p) => ({ ...p, resetCode: undefined }));
                  }}
                  onFocus={(e) => e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                  placeholder="849201"
                  className={`h-11 w-full pl-10 pr-4 rounded-xl bg-black/[0.03] dark:bg-white/[0.06] border font-mono tracking-widest text-base font-bold text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all scroll-m-6 ${
                    fieldErrors.resetCode
                      ? 'border-red-500/60 dark:border-red-500/60 ring-1 ring-red-500/20'
                      : 'border-black/10 dark:border-white/15'
                  }`}
                />
              </div>
              <div className="min-h-[16px] text-[11px] text-red-500 dark:text-red-400 font-medium leading-tight flex items-center gap-1 transition-opacity duration-150">
                {fieldErrors.resetCode && (
                  <>
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span>{fieldErrors.resetCode}</span>
                  </>
                )}
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1">
              <label htmlFor="reset-new-password" className="block text-xs font-semibold text-[var(--color-text-secondary)]">
                New Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[var(--color-text-tertiary)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="reset-new-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined }));
                  }}
                  onFocus={(e) => e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  className={`h-11 w-full pl-10 pr-11 rounded-xl bg-black/[0.03] dark:bg-white/[0.06] border text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all scroll-m-6 ${
                    fieldErrors.password
                      ? 'border-red-500/60 dark:border-red-500/60 ring-1 ring-red-500/20'
                      : 'border-black/10 dark:border-white/15'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="min-h-[16px] text-[11px] text-red-500 dark:text-red-400 font-medium leading-tight flex items-center gap-1 transition-opacity duration-150">
                {fieldErrors.password && (
                  <>
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span>{fieldErrors.password}</span>
                  </>
                )}
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1">
              <label htmlFor="reset-confirm-password" className="block text-xs font-semibold text-[var(--color-text-secondary)]">
                Confirm New Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[var(--color-text-tertiary)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="reset-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (fieldErrors.confirmPassword) setFieldErrors((p) => ({ ...p, confirmPassword: undefined }));
                  }}
                  onFocus={(e) => e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
                  className={`h-11 w-full pl-10 pr-11 rounded-xl bg-black/[0.03] dark:bg-white/[0.06] border text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all scroll-m-6 ${
                    fieldErrors.confirmPassword
                      ? 'border-red-500/60 dark:border-red-500/60 ring-1 ring-red-500/20'
                      : 'border-black/10 dark:border-white/15'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="min-h-[16px] text-[11px] text-red-500 dark:text-red-400 font-medium leading-tight flex items-center gap-1 transition-opacity duration-150">
                {fieldErrors.confirmPassword && (
                  <>
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span>{fieldErrors.confirmPassword}</span>
                  </>
                )}
              </div>
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={isLoading}
                className="h-11 w-full rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[#00C7BE] hover:opacity-95 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
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
            </div>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg('');
                  setSuccessMsg('');
                  setFieldErrors({});
                }}
                className="text-xs font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
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
