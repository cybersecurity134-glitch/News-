/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NewsItem } from '../../types/models';
import { CheckCircle2, Clock, XCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { CategoryTag } from '../feed/CategoryTag';

interface VerificationStatusProps {
  items: NewsItem[];
}

export const VerificationStatus: React.FC<VerificationStatusProps> = ({ items }) => {
  if (items.length === 0) {
    return (
      <div className="p-8 rounded-[16px] bg-[var(--color-card-bg)] border border-[var(--color-border)] text-center text-xs text-[var(--color-text-secondary)]">
        You haven't submitted any stories yet. Switch to "Post Story" to submit your first report.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const isApproved = item.status === 'approved';
        const isRejected = item.status === 'rejected';
        const isPending = !isApproved && !isRejected;

        return (
          <div
            key={item.id}
            className="p-4 sm:p-5 rounded-[16px] bg-[var(--color-card-bg)] border border-[var(--color-border)] space-y-3 transition-all"
          >
            <div className="flex items-center justify-between gap-2">
              <CategoryTag category={item.category} size="sm" />

              {/* Status indicator: In review, Published, or Rejected */}
              <div className="flex items-center gap-1.5">
                {isApproved && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[var(--color-verified)]/15 text-[var(--color-verified)]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Published</span>
                  </span>
                )}
                {isPending && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>In review</span>
                  </span>
                )}
                {isRejected && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-500/15 text-red-600 dark:text-red-400">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Rejected</span>
                  </span>
                )}
              </div>
            </div>

            <h4 className="font-serif text-base font-bold text-[var(--color-text-primary)] leading-snug line-clamp-2">
              {item.headline}
            </h4>

            {item.summary && (
              <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2">
                {item.summary}
              </p>
            )}

            {isRejected && item.rejectionReason && (
              <div className="p-3 rounded-[12px] bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400">
                <strong>Admin Note:</strong> {item.rejectionReason}
              </div>
            )}

            {isPending && (
              <div className="p-3 rounded-[12px] bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300">
                <strong>Editorial Gate:</strong> Awaiting verification by the admin. Nothing goes live until approved.
              </div>
            )}

            <div className="text-xs text-[var(--color-text-secondary)] flex items-center justify-between pt-2 border-t border-[var(--color-border)]">
              <span className="truncate max-w-[200px]">Source: {item.sourceName}</span>
              <div className="flex items-center gap-2">
                <span>{new Date(item.publishDate || item.publishedAt || Date.now()).toLocaleDateString()}</span>
                {item.sourceUrl && (
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[var(--color-accent)] transition-colors p-0.5"
                    title="Open source"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
