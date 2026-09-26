/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { VerificationQueue } from '../components/admin/VerificationQueue';
import { PasswordManager } from '../components/admin/PasswordManager';
import { ProtectedRoute } from '../components/shared/ProtectedRoute';
import { NewsItem, User } from '../types/models';
import { ShieldCheck, Users, KeyRound, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const AdminPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'queue' | 'password' | 'contributors'>('queue');
  const [pendingNews, setPendingNews] = useState<NewsItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/state');
      if (!res.ok) return;
      const data = await res.json();
      const news: NewsItem[] = data.news || [];
      setPendingNews(news.filter((n) => n.status === 'pending'));
      setUsers(data.users || []);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleContributor = async (targetUserId: string, currentStatus: boolean) => {
    try {
      await fetch('/api/admin/toggle-user-approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: currentUser?.id,
          targetUserId,
          isApproved: !currentStatus,
        }),
      });
      loadAdminData();
    } catch {
      // silent
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="space-y-4 pb-24 pt-2">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
                Editorial Control Center
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[var(--color-primary-subtle)] text-[var(--color-primary)]">
                Admin Tier
              </span>
            </div>
            <p className="text-subheadline text-[var(--color-text-secondary)]">
              Verify contributor submissions, manage upload passcodes, and govern community status.
            </p>
          </div>

          {/* Sub-tabs */}
          <div className="flex p-1 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--color-separator)] shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setActiveSubTab('queue')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeSubTab === 'queue'
                  ? 'bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)] shadow-xs'
                  : 'text-[var(--color-text-secondary)]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Queue ({pendingNews.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('password')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeSubTab === 'password'
                  ? 'bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)] shadow-xs'
                  : 'text-[var(--color-text-secondary)]'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Upload Passcode</span>
            </button>

            <button
              onClick={() => setActiveSubTab('contributors')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeSubTab === 'contributors'
                  ? 'bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)] shadow-xs'
                  : 'text-[var(--color-text-secondary)]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Contributors</span>
            </button>
          </div>
        </div>

        {activeSubTab === 'queue' && (
          <VerificationQueue
            pendingItems={pendingNews}
            onActionComplete={loadAdminData}
          />
        )}

        {activeSubTab === 'password' && <PasswordManager />}

        {activeSubTab === 'contributors' && (
          <div className="p-5 rounded-2xl bg-[var(--color-card-bg)] border border-[var(--color-separator)] space-y-4">
            <h3 className="text-headline text-[var(--color-text-primary)] font-bold">
              Contributor Accounts & Permissions
            </h3>

            <div className="divide-y divide-[var(--color-separator)]">
              {users.map((u) => (
                <div key={u.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        u.avatarUrl ||
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
                      }
                      alt={u.name}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-footnote font-bold text-[var(--color-text-primary)]">
                          {u.name}
                        </span>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5 text-[var(--color-text-secondary)]">
                          {u.role}
                        </span>
                      </div>
                      <span className="text-caption text-[var(--color-text-secondary)]">
                        {u.email || 'No email provided'}
                      </span>
                    </div>
                  </div>

                  {u.role === 'uploader' && (
                    <button
                      onClick={() => handleToggleContributor(u.id, !!u.isApproved)}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        u.isApproved
                          ? 'bg-emerald-500/10 text-emerald-600 hover:bg-red-500/10 hover:text-red-600'
                          : 'bg-amber-500/10 text-amber-600 hover:bg-emerald-500/10 hover:text-emerald-600'
                      }`}
                    >
                      {u.isApproved ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approved Contributor</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Approve Access</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};
