/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { NewsItem } from '../../types/models';
import { CategoryTag } from '../feed/CategoryTag';
import { Check, X, ExternalLink, AlertTriangle, ShieldAlert } from 'lucide-react';
import { apiClient } from '../../api/client';
import { useAuth } from '../../hooks/useAuth';

interface VerificationQueueProps {
  pendingItems: NewsItem[];
  onActionComplete: () => void;
}

export const VerificationQueue: React.FC<VerificationQueueProps> = ({
  pendingItems,
  onActionComplete,
}) => {
  const { currentUser } = useAuth();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async (item: NewsItem) => {
    if (!currentUser) return;
    setIsProcessing(true);
    try {
      await apiClient.updateNewsStatus(item.id, 'approved', undefined, currentUser.id);
      onActionComplete();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (item: NewsItem) => {
    if (!currentUser || !rejectReason.trim()) return;
    setIsProcessing(true);
    try {
      await apiClient.updateNewsStatus(item.id, 'rejected', rejectReason.trim(), currentUser.id);
      setRejectingId(null);
      setRejectReason('');
      onActionComplete();
    } finally {
      setIsProcessing(false);
    }
  };

  if (pendingItems.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-[var(--color-card-bg)] border border-[var(--color-separator)] text-center space-y-2">
        <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
          <Check className="w-5 h-5" />
        </div>
        <h4 className="text-headline text-[var(--color-text-primary)] font-bold">Verification Queue Clear</h4>
        <p className="text-footnote text-[var(--color-text-secondary)]">
          All contributor submissions have been reviewed and published or dismissed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pendingItems.map((item) => (
        <div
          key={item.id}
          className="p-5 rounded-2xl bg-[var(--color-card-bg)] border border-[var(--color-separator)] space-y-3"
        >
          <div className="flex items-center justify-between gap-2">
            <CategoryTag category={item.category} />
            <span className="text-caption text-[var(--color-text-secondary)]">
              Uploaded by: <strong>{item.uploader?.name || 'Contributor'}</strong> ({item.uploader?.role || 'uploader'})
            </span>
          </div>

          <h3 className="text-headline text-[var(--color-text-primary)] font-bold">
            {item.headline}
          </h3>

          <p className="text-subheadline text-[var(--color-text-secondary)]">
            {item.summary}
          </p>

          <div className="flex flex-wrap items-center gap-3 text-footnote text-[var(--color-text-secondary)]">
            <span><strong>Source:</strong> {item.sourceName}</span>
            <span>·</span>
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#007AFF] hover:underline"
            >
              <span>{item.sourceUrl.replace(/^https?:\/\//, '').slice(0, 35)}...</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <span>·</span>
            <span>Published: {new Date(item.publishDate || item.publishedAt || Date.now()).toLocaleDateString()}</span>
          </div>

          {/* Automated System Check Panel */}
          {item.automatedCheck && (
            <div className={`p-3 rounded-xl border text-xs space-y-1.5 ${
              item.automatedCheck.flagged
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-200'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-200'
            }`}>
              <div className="flex items-center gap-1.5 font-bold">
                {item.automatedCheck.flagged ? (
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                ) : (
                  <Check className="w-4 h-4 text-emerald-500" />
                )}
                <span>Automated Integrity Evaluation: {item.automatedCheck.flagged ? 'Flagged for Inspection' : 'Automated Checks Passed'}</span>
              </div>

              <div className="flex flex-wrap gap-x-4 text-[11px] opacity-90">
                <span>URL HTTP Status: {item.automatedCheck.httpStatus || 200}</span>
                <span>Date Recency: {item.automatedCheck.dateRecent ? 'Current' : 'Stale (>14d)'}</span>
                <span>Category Alignment: {item.automatedCheck.categoryMatch ? 'Verified' : 'Ambiguous'}</span>
              </div>

              {item.automatedCheck.flagReasons?.length > 0 && (
                <div className="flex items-start gap-1 pt-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>Flags: {item.automatedCheck.flagReasons.join(', ')}</span>
                </div>
              )}
            </div>
          )}

          {/* Rejection input box if open */}
          {rejectingId === item.id && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 space-y-2">
              <label className="block text-caption font-semibold text-red-600 dark:text-red-400">
                State reason for rejection (sent to contributor):
              </label>
              <input
                type="text"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Broken link, duplicated story, or unverified claims..."
                className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-[#1C1C1E] border border-red-500/30 text-xs text-[var(--color-text-primary)] outline-none focus:ring-2 focus:ring-red-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setRejectingId(null);
                    setRejectReason('');
                  }}
                  className="px-3 py-1 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                >
                  Cancel
                </button>
                <button
                  disabled={!rejectReason.trim() || isProcessing}
                  onClick={() => handleReject(item)}
                  className="px-3.5 py-1 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 disabled:opacity-50"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          {rejectingId !== item.id && (
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--color-separator)]">
              <button
                disabled={isProcessing}
                onClick={() => setRejectingId(item.id)}
                className="px-4 py-2 rounded-xl border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-500/10 flex items-center gap-1.5 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>

              <button
                disabled={isProcessing}
                onClick={() => handleApprove(item)}
                className="px-4 py-2 rounded-xl bg-[#34C759] hover:bg-[#2EB04E] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Approve & Publish</span>
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
