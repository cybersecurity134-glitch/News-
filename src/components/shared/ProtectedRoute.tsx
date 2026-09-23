/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { AuthModal } from './AuthModal';
import { Lock, ShieldAlert, KeyRound } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'uploader' | 'viewer' | 'member')[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = ['admin', 'uploader'],
}) => {
  const { currentUser, isLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="w-6 h-6 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isAuthorized = currentUser && (!allowedRoles || allowedRoles.includes(currentUser.role));

  if (!isAuthorized) {
    return (
      <div className="p-8 sm:p-12 text-center rounded-[16px] bg-[var(--color-card-bg)] border border-[var(--color-border)] max-w-lg mx-auto my-8 space-y-4">
        <div className="w-12 h-12 rounded-full bg-[var(--color-accent)]/15 text-[var(--color-accent)] flex items-center justify-center mx-auto">
          {currentUser ? <ShieldAlert className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
        </div>

        <div>
          <h3 className="font-serif text-xl text-[var(--color-text-primary)] font-bold">
            {currentUser ? 'Contributor Access Restricted' : 'Contributor Portal'}
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1.5 leading-relaxed max-w-sm mx-auto">
            {currentUser
              ? `Posting stories is reserved for verified contributors and admins. Your current role is "${currentUser.role}".`
              : 'Contributors log in on a separate gate with credentials and verification codes authorized by the administrator.'}
          </p>
        </div>

        <button
          onClick={() => setShowAuthModal(true)}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[var(--color-accent)] hover:opacity-95 text-[#0B1F3A] text-xs font-bold transition-all shadow-xs"
        >
          <KeyRound className="w-4 h-4" />
          <span>{currentUser ? 'Switch to Contributor Account' : 'Contributor Sign In'}</span>
        </button>

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          defaultRole="uploader"
        />
      </div>
    );
  }

  return <>{children}</>;
};
