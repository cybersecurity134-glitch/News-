/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UploadForm } from '../components/upload/UploadForm';
import { VerificationStatus } from '../components/upload/VerificationStatus';
import { NewsItem } from '../types/models';
import { useAuth } from '../hooks/useAuth';
import { ProtectedRoute } from '../components/shared/ProtectedRoute';
import { UploadCloud, ListChecks } from 'lucide-react';

export const UploadPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [subTab, setSubTab] = useState<'form' | 'submissions'>('form');
  const [mySubmissions, setMySubmissions] = useState<NewsItem[]>([]);

  useEffect(() => {
    loadMySubmissions();
  }, [currentUser]);

  const loadMySubmissions = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/state');
      if (!res.ok) return;
      const data = await res.json();
      const allNews: NewsItem[] = data.news || [];
      const userItems = allNews.filter((n) => n.uploader?.id === currentUser.id);
      setMySubmissions(userItems);
    } catch {
      // silent
    }
  };

  const handleUploadSuccess = (newItem: NewsItem) => {
    setMySubmissions((prev) => [newItem, ...prev]);
    // Switch to submissions tab to see verification status
    setSubTab('submissions');
  };

  return (
    <ProtectedRoute allowedRoles={['admin', 'uploader']}>
      <div className="space-y-4 pb-24 pt-2">
        {/* Header & Sub-Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
              Contributor Studio
            </h2>
            <p className="text-subheadline text-[var(--color-text-secondary)]">
              Submit verified startup news, schemes, funding explainers, and events.
            </p>
          </div>

          <div className="flex p-1 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--color-separator)] shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setSubTab('form')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                subTab === 'form'
                  ? 'bg-white dark:bg-[#1C1C1E] text-[var(--color-text-primary)] shadow-xs'
                  : 'text-[var(--color-text-secondary)]'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Submit Story</span>
            </button>
            <button
              onClick={() => setSubTab('submissions')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                subTab === 'submissions'
                  ? 'bg-white dark:bg-[#1C1C1E] text-[var(--color-text-primary)] shadow-xs'
                  : 'text-[var(--color-text-secondary)]'
              }`}
            >
              <ListChecks className="w-3.5 h-3.5" />
              <span>My Submissions ({mySubmissions.length})</span>
            </button>
          </div>
        </div>

        {subTab === 'form' ? (
          <UploadForm onSuccess={handleUploadSuccess} />
        ) : (
          <VerificationStatus items={mySubmissions} />
        )}
      </div>
    </ProtectedRoute>
  );
};
