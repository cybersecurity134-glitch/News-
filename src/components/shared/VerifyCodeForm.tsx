/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AlertCircle, Clock, RotateCcw, ShieldCheck } from 'lucide-react';
import { apiClient } from '../../api/client';
import { User } from '../../types/models';

/**
 * useCountdown hook: manages a seconds-based countdown timer for UI attempt timeouts.
 */
export function useCountdown(seconds: number) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) return;
    const id = setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => clearInterval(id);
  }, [remaining]);

  return {
    remaining,
    expired: remaining <= 0,
    reset: (s = seconds) => setRemaining(s),
  };
}

/**
 * VerifyCodeForm:
 * Implements Addendum v2 fixed-code verification with a 60-second attempt window.
 * The fixed code itself stays valid on the server; the 60 seconds is a UI timeout
 * on this verification attempt.
 */
export function VerifyCodeForm({
  verifyToken,
  onVerified,
  onRestart,
}: {
  verifyToken: string;
  onVerified: (sessionToken: string, user?: User) => void;
  onRestart: () => void; // re-requests a fresh verifyToken + resets the timer
}) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { remaining, expired, reset } = useCountdown(60);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (expired || isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.verifyUploaderCode(verifyToken, code);
      onVerified(res.sessionToken, res.user);
    } catch {
      setError('Incorrect code. Try again.');
    } finally {
      setIsLoading(false);
    }
  }

  if (expired) {
    return (
      <div id="verify-code-expired" className="space-y-5 text-center py-6 animate-in fade-in duration-200">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-[#FF3B30] flex items-center justify-center mx-auto">
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <p className="text-body text-[var(--color-text-primary)] text-lg font-bold">Time's up.</p>
          <p className="text-footnote text-[var(--color-text-secondary)] text-xs mt-1 max-w-xs mx-auto">
            The 60-second attempt window has elapsed. The verification passcode remains active.
          </p>
        </div>
        <button
          id="btn-restart-attempt"
          type="button"
          onClick={() => {
            reset(60);
            onRestart();
          }}
          className="w-full py-3 rounded-xl bg-[#007AFF] hover:bg-[#0062CC] text-white text-sm font-semibold transition-all shadow-xs flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Try again</span>
        </button>
      </div>
    );
  }

  return (
    <form id="verify-code-form" onSubmit={handleSubmit} className="space-y-5 animate-in fade-in duration-200">
      <div>
        <div className="w-10 h-10 rounded-2xl bg-[#007AFF]/15 text-[#007AFF] flex items-center justify-center mb-2.5">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <h3 className="text-xl font-bold tracking-tight text-[var(--color-text-primary)]">
          Uploader Verification
        </h3>
        <p className="text-body text-[var(--color-text-secondary)] text-xs mt-1">
          Enter your verification code.
        </p>
      </div>

      <div className="space-y-2">
        <input
          id="uploader-verify-code-input"
          value={code}
          onChange={(e) => {
            setError(null);
            setCode(e.target.value.replace(/\D/g, '').slice(0, 5));
          }}
          inputMode="numeric"
          maxLength={5}
          autoFocus
          placeholder="•••••"
          className="w-full h-14 text-center font-mono text-2xl font-bold tracking-[0.5em] rounded-xl border border-[var(--color-separator)] bg-black/5 dark:bg-white/5 text-[var(--color-text-primary)] focus:border-[#007AFF] focus:bg-white dark:focus:bg-[#1C1C1E] focus:ring-2 focus:ring-[#007AFF]/20 transition-all outline-none"
        />

        <div className="flex items-center justify-between text-xs px-1">
          <p className="text-footnote text-[var(--color-text-secondary)]">
            <span
              className={`font-mono font-bold ${
                remaining <= 15 ? 'text-[#FF3B30] animate-pulse' : 'text-[#007AFF]'
              }`}
            >
              {remaining}s
            </span>{' '}
            remaining
          </p>
          <span className="text-[11px] text-[var(--color-text-secondary)] font-mono">
            {code.length}/5 digits
          </span>
        </div>
      </div>

      {error && (
        <p
          id="verify-code-error"
          className="text-footnote text-xs font-medium p-2.5 rounded-lg bg-[#FF3B30]/10 border border-[#FF3B30]/20 flex items-center gap-1.5"
          style={{ color: 'var(--tag-red, #FF3B30)' }}
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-[#FF3B30]" />
          <span>{error}</span>
        </p>
      )}

      <button
        id="btn-submit-verify-code"
        type="submit"
        disabled={code.length !== 5 || isLoading}
        className="w-full py-3 rounded-xl bg-[#007AFF] hover:bg-[#0062CC] text-white text-sm font-semibold transition-all disabled:opacity-40 shadow-xs flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Verifying...</span>
          </>
        ) : (
          <span>Verify</span>
        )}
      </button>
    </form>
  );
}
