/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { KeyRound, RefreshCw, CheckCircle2, Copy } from 'lucide-react';
import { apiClient } from '../../api/client';
import { useAuth } from '../../hooks/useAuth';

export const PasswordManager: React.FC = () => {
  const { currentUser } = useAuth();
  const [currentCode, setCurrentCode] = useState('...');
  const [newCode, setNewCode] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadPassword();
  }, []);

  const loadPassword = async () => {
    try {
      const code = await apiClient.getAdminPassword();
      setCurrentCode(code);
    } catch {
      // fallback
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || newCode.trim().length < 4) return;

    setIsUpdating(true);
    setStatusMsg('');
    try {
      const updated = await apiClient.updateAdminPassword(newCode.trim().toUpperCase(), currentUser?.id);
      setCurrentCode(updated);
      setNewCode('');
      setStatusMsg('Upload passcode successfully rotated!');
      setTimeout(() => setStatusMsg(''), 4000);
    } catch (err: any) {
      setStatusMsg(err.message || 'Failed to update passcode');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-5 rounded-2xl bg-[var(--color-card-bg)] border border-[var(--color-separator)] space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--color-separator)]">
        <div>
          <h3 className="text-headline text-[var(--color-text-primary)] font-bold">
            Contributor Upload Passcode
          </h3>
          <p className="text-footnote text-[var(--color-text-secondary)]">
            Required by contributors to submit verified stories. Rotate periodically to maintain quality.
          </p>
        </div>
        <KeyRound className="w-6 h-6 text-[var(--color-primary)]" />
      </div>

      {/* Active Code Display */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--color-separator)]">
        <div>
          <span className="text-caption uppercase tracking-wider font-semibold text-[var(--color-text-secondary)] block">
            Current Active Passcode
          </span>
          <span className="text-xl font-mono font-bold tracking-widest text-[var(--color-primary)]">
            {currentCode}
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 text-xs font-semibold text-[var(--color-text-primary)] transition-colors"
        >
          {copied ? <CheckCircle2 className="w-4 h-4 text-[var(--color-success)]" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {statusMsg && (
        <div className="p-3 rounded-xl bg-[var(--color-success-bg)] border border-[var(--color-success-border)] text-[var(--color-success-fg)] text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Form to Rotate Passcode */}
      <form onSubmit={handleUpdate} className="flex flex-col sm:flex-row gap-2 pt-1">
        <input
          type="text"
          value={newCode}
          onChange={(e) => setNewCode(e.target.value)}
          placeholder="Enter new alphanumeric code (e.g. VENTURE42)"
          className="flex-1 px-3.5 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--color-separator)] text-xs font-mono uppercase text-[var(--color-text-primary)] outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        />

        <button
          type="submit"
          disabled={!newCode.trim() || newCode.trim().length < 4 || isUpdating}
          className="px-5 py-2.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-primary-fg)] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40 shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
          <span>Rotate Passcode</span>
        </button>
      </form>
    </div>
  );
};
