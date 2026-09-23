/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo } from 'react';

export const SkeletonCard: React.FC = memo(() => {
  return (
    <div
      className="liquid-glass-card p-4 sm:p-5 flex flex-col justify-between animate-pulse"
      aria-hidden="true"
    >
      <div>
        {/* Matched fixed 16:9 aspect ratio */}
        <div className="w-full aspect-16/9 rounded-[14px] bg-black/10 dark:bg-white/10 mb-3.5" />

        {/* Category & Source kicker */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-20 h-3 rounded bg-black/10 dark:bg-white/10" />
          <div className="w-12 h-3 rounded bg-black/10 dark:bg-white/10" />
          <div className="w-16 h-3 rounded bg-black/10 dark:bg-white/10" />
        </div>

        {/* Headline lines */}
        <div className="w-full h-5 rounded-md bg-black/10 dark:bg-white/10 mb-1.5" />
        <div className="w-3/4 h-5 rounded-md bg-black/10 dark:bg-white/10 mb-3" />

        {/* Summary lines */}
        <div className="w-full h-3.5 rounded bg-black/5 dark:bg-white/5 mb-1" />
        <div className="w-5/6 h-3.5 rounded bg-black/5 dark:bg-white/5 mb-3" />
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between">
        <div className="w-20 h-3 rounded bg-black/10 dark:bg-white/10" />
        <div className="flex gap-2">
          <div className="w-6 h-6 rounded-full bg-black/10 dark:bg-white/10" />
          <div className="w-6 h-6 rounded-full bg-black/10 dark:bg-white/10" />
        </div>
      </div>
    </div>
  );
});

SkeletonCard.displayName = 'SkeletonCard';
