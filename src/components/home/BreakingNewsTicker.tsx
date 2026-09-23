/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo, useState, useEffect } from 'react';
import { AlertCircle, ChevronRight, Pause, Play } from 'lucide-react';
import { BREAKING_NEWS_TICKER } from '../../data/mockNews';

interface BreakingNewsTickerProps {
  onSelectAlert?: (text: string) => void;
}

export const BreakingNewsTicker: React.FC<BreakingNewsTickerProps> = memo(({
  onSelectAlert,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % BREAKING_NEWS_TICKER.length);
    }, 5500);

    return () => clearInterval(interval);
  }, [isPaused]);

  const currentAlert = BREAKING_NEWS_TICKER[currentIndex];

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="w-full liquid-glass-card px-3.5 sm:px-4 py-2.5 flex items-center justify-between gap-3 text-xs sm:text-sm specular-line"
      role="region"
      aria-label="Breaking news updates"
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {/* Live Indicator */}
        <div className="flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded-full bg-[var(--accent-coral)]/15 text-[var(--accent-coral)] font-extrabold text-[10px] tracking-wider uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-coral)] animate-ping" />
          <span>Breaking</span>
        </div>

        {/* Current Alert Text */}
        <p
          onClick={() => onSelectAlert?.(currentAlert)}
          className="font-medium text-[var(--text-primary)] truncate cursor-pointer hover:text-[var(--accent-primary)] transition-colors"
        >
          {currentAlert}
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1 shrink-0 text-[var(--text-tertiary)]">
        <button
          onClick={() => setIsPaused((prev) => !prev)}
          className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
          title={isPaused ? 'Resume ticker' : 'Pause ticker'}
          aria-label={isPaused ? 'Resume ticker' : 'Pause ticker'}
        >
          {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={() => setCurrentIndex((prev) => (prev + 1) % BREAKING_NEWS_TICKER.length)}
          className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
          title="Next alert"
          aria-label="Next alert"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
});

BreakingNewsTicker.displayName = 'BreakingNewsTicker';
