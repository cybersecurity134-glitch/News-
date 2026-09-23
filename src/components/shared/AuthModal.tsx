/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { KeyRound, Shield, AlertCircle, X, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { apiClient } from '../../api/client';
import { useAuth } from '../../hooks/useAuth';
import { User } from '../../types/models';
import { VerifyCodeForm } from './VerifyCodeForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: 'viewer' | 'uploader' | 'admin';
}

type AuthMode = 'uploader_login' | 'uploader_signup' | 'viewer_login' | 'viewer_signup';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultRole = 'uploader',
}) => {
  const { loginWithOtpUser } = useAuth();

  const [mode, setMode] = useState<AuthMode>(
    defaultRole === 'uploader' || defaultRole === 'admin' ? 'uploader_login' : 'viewer_login'
  );
  const [step, setStep] = useState<'credentials' | 'verify_code'>('credentials');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Uploader verification token (Addendum v2)
  const [verifyToken, setVerifyToken] = useState<string | null>(null);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Reset state when modal is opened / closed
  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setStep('credentials');
      setShowPassword(false);
      setVerifyToken(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Uploader or Viewer Login submission
  const handleSubmitCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      if (mode === 'uploader_login') {
        if (!password) {
          setErrorMsg('Password is required for uploader login.');
          setIsLoading(false);
          return;
        }

        const res = await apiClient.loginUploader(email.trim(), password);

        // If verifyToken issued (standard uploader flow requiring code)
        if (res.verifyToken || res.otpToken) {
          setVerifyToken(res.verifyToken || res.otpToken || null);
          setStep('verify_code');
        } else if (res.user && res.sessionToken) {
          loginWithOtpUser(res.user, res.sessionToken);
          onClose();
        }
      } else if (mode === 'uploader_signup') {
        if (!name.trim() || !password) {
          setErrorMsg('Name, email, and password are required.');
          setIsLoading(false);
          return;
        }

        const res = await apiClient.signupUploader(name.trim(), email.trim(), password);
        if (res.verifyToken || res.otpToken) {
          setVerifyToken(res.verifyToken || res.otpToken || null);
          setStep('verify_code');
        }
      } else if (mode === 'viewer_login') {
        const user = await apiClient.login(email.trim());
        loginWithOtpUser(user);
        onClose();
      } else if (mode === 'viewer_signup') {
        const user = await apiClient.signup({
          name: name.trim() || email.trim().split('@')[0],
          email: email.trim(),
          role: 'viewer',
        });
        loginWithOtpUser(user);
        onClose();
      }
    } catch (err: any) {
      // Display generic error per requirements (never reveal user role or email existence)
      setErrorMsg(err.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle verification restart when 60s timeout elapses
  const handleRestartAttempt = async () => {
    try {
      const res = await apiClient.restartUploaderAttempt(verifyToken || undefined, email.trim(), password);
      if (res.verifyToken) {
        setVerifyToken(res.verifyToken);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Session expired. Please sign in again.');
      setStep('credentials');
    }
  };

  // On successful verification of fixed code
  const handleVerified = (sessionToken: string, verifiedUser?: User) => {
    if (verifiedUser) {
      loginWithOtpUser(verifiedUser, sessionToken);
    } else {
      loginWithOtpUser(
        {
          id: 'user-' + Date.now(),
          name: email.split('@')[0],
          email: email.trim(),
          role: 'uploader',
          isApproved: true,
          emailVerified: true,
        },
        sessionToken
      );
    }
    onClose();
  };

  return (
    <div
      id="auth-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="auth-modal-card"
        className="w-full h-full min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] p-4 sm:p-10 overflow-y-auto flex flex-col items-center justify-start sm:justify-center relative"
      >
        {/* Modal Close Button */}
        <button
          id="btn-close-auth-modal"
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full text-[var(--color-text-secondary)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors z-20 tap-target-44 flex items-center justify-center"
          title="Close"
        >
          <X className="w-5 sm:w-6 h-5 sm:h-6" />
        </button>

        <div className="w-full max-w-md mx-auto my-auto py-4 sm:py-8">
          {/* SCREEN 1: CREDENTIALS (LOGIN / SIGNUP) */}
          {step === 'credentials' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Header */}
              <div>
                <div className="w-10 h-10 rounded-2xl bg-[#007AFF]/15 text-[#007AFF] flex items-center justify-center mb-2.5">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-[var(--color-text-primary)]">
                  {mode === 'uploader_login' && 'Uploader Sign In'}
                  {mode === 'uploader_signup' && 'Create Uploader Account'}
                  {mode === 'viewer_login' && 'Community Sign In'}
                  {mode === 'viewer_signup' && 'Create Community Account'}
                </h2>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                  {mode.startsWith('uploader')
                    ? 'Requires verified contributor credentials and security passcode verification.'
                    : 'Fast access to explore startup intelligence, bookmark, and chat.'}
                </p>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="flex p-1 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--color-separator)] text-xs">
                <button
                  id="tab-uploader-auth"
                  type="button"
                  onClick={() => {
                    setMode('uploader_login');
                    setErrorMsg('');
                  }}
                  className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${
                    mode.startsWith('uploader')
                      ? 'bg-white dark:bg-[#1C1C1E] text-[var(--color-text-primary)] shadow-xs'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  Uploader Login
                </button>
                <button
                  id="tab-viewer-auth"
                  type="button"
                  onClick={() => {
                    setMode('viewer_login');
                    setErrorMsg('');
                  }}
                  className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${
                    mode.startsWith('viewer')
                      ? 'bg-white dark:bg-[#1C1C1E] text-[var(--color-text-primary)] shadow-xs'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  Viewer Access
                </button>
              </div>

              {/* Error Banner */}
              {errorMsg && (
                <div
                  id="auth-error-banner"
                  className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-snug">{errorMsg}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmitCredentials} className="space-y-3.5">
                {/* Name (Signup only) */}
                {(mode === 'uploader_signup' || mode === 'viewer_signup') && (
                  <div>
                    <label className="block text-footnote font-semibold text-[var(--color-text-secondary)] mb-1">
                      Full Name
                    </label>
                    <input
                      id="auth-input-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Maya Lin"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-separator)] bg-black/5 dark:bg-white/5 text-[var(--color-text-primary)] text-sm focus:border-[#007AFF] focus:bg-white dark:focus:bg-[#1C1C1E] focus:ring-2 focus:ring-[#007AFF]/20 transition-all outline-none"
                    />
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="block text-footnote font-semibold text-[var(--color-text-secondary)] mb-1">
                    Email Address
                  </label>
                  <input
                    id="auth-input-email"
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={mode.startsWith('uploader') ? 'contributor@techstartup.com' : 'viewer@domain.com'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-separator)] bg-black/5 dark:bg-white/5 text-[var(--color-text-primary)] text-sm focus:border-[#007AFF] focus:bg-white dark:focus:bg-[#1C1C1E] focus:ring-2 focus:ring-[#007AFF]/20 transition-all outline-none"
                  />
                </div>

                {/* Password (Uploader only) */}
                {mode.startsWith('uploader') && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-footnote font-semibold text-[var(--color-text-secondary)]">
                        Password
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        id="auth-input-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-[var(--color-separator)] bg-black/5 dark:bg-white/5 text-[var(--color-text-primary)] text-sm focus:border-[#007AFF] focus:bg-white dark:focus:bg-[#1C1C1E] focus:ring-2 focus:ring-[#007AFF]/20 transition-all outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Notice for Uploader Login */}
                {mode.startsWith('uploader') && (
                  <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--color-separator)] text-[11px] text-[var(--color-text-secondary)] flex items-start gap-2">
                    <Shield className="w-3.5 h-3.5 text-[#007AFF] shrink-0 mt-0.5" />
                    <span>
                      Uploader accounts undergo role verification and fixed-code security check.
                    </span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  id="auth-submit-btn"
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl bg-[#007AFF] hover:bg-[#0062CC] text-white text-xs font-semibold transition-all disabled:opacity-50 shadow-xs flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : mode === 'uploader_login' ? (
                    'Continue with Uploader'
                  ) : mode === 'uploader_signup' ? (
                    'Register as Uploader'
                  ) : (
                    'Sign In as Viewer'
                  )}
                </button>

                {/* Switch between Login and Signup */}
                <div className="pt-2 text-center text-xs text-[var(--color-text-secondary)] flex items-center justify-center gap-1.5">
                  {mode === 'uploader_login' ? (
                    <>
                      <span>Need an uploader account?</span>
                      <button
                        type="button"
                        onClick={() => {
                          setMode('uploader_signup');
                          setErrorMsg('');
                        }}
                        className="text-[#007AFF] hover:underline font-semibold"
                      >
                        Sign Up
                      </button>
                    </>
                  ) : mode === 'uploader_signup' ? (
                    <>
                      <span>Already an uploader?</span>
                      <button
                        type="button"
                        onClick={() => {
                          setMode('uploader_login');
                          setErrorMsg('');
                        }}
                        className="text-[#007AFF] hover:underline font-semibold"
                      >
                        Sign In
                      </button>
                    </>
                  ) : mode === 'viewer_login' ? (
                    <>
                      <span>Need a new account?</span>
                      <button
                        type="button"
                        onClick={() => {
                          setMode('viewer_signup');
                          setErrorMsg('');
                        }}
                        className="text-[#007AFF] hover:underline font-semibold"
                      >
                        Register
                      </button>
                    </>
                  ) : (
                    <>
                      <span>Already registered?</span>
                      <button
                        type="button"
                        onClick={() => {
                          setMode('viewer_login');
                          setErrorMsg('');
                        }}
                        className="text-[#007AFF] hover:underline font-semibold"
                      >
                        Sign In
                      </button>
                    </>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* SCREEN 2: 60-SECOND FIXED CODE VERIFICATION (Addendum v2) */}
          {step === 'verify_code' && verifyToken && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <button
                type="button"
                onClick={() => {
                  setStep('credentials');
                  setErrorMsg('');
                }}
                className="inline-flex items-center gap-1 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to login</span>
              </button>

              <VerifyCodeForm
                verifyToken={verifyToken}
                onVerified={handleVerified}
                onRestart={handleRestartAttempt}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
