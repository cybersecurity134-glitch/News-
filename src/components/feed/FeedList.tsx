/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo } from 'react';
import { NewsItem } from '../../types/models';
import { NewsCard } from './NewsCard';
import { Newspaper, RefreshCw, WifiOff } from 'lucide-react';

interface FeedListProps {
  items: NewsItem[];
  isLoading: boolean;
  isRefreshing?: boolean;
  isOffline?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onSelectNewsItem?: (item: NewsItem) => void;
  onRefresh?: () => void;
}

export const FeedList: React.FC<FeedListProps> = memo(({
  items,
  isLoading,
  isRefreshing = false,
  isOffline = false,
  hasMore = false,
  onLoadMore,
  onSelectNewsItem,
  onRefresh,
}) => {
  // Skeleton screen while first fetch happens
  if (isLoading && items.length === 0) {
    return (
      <div className="space-y-4 py-2" aria-label="Loading news stories">
        {/* Top story skeleton */}
        <div className="rounded-[16px] p-5 sm:p-6 bg-[var(--color-card-bg)] border border-[var(--color-border)] animate-pulse space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-20 h-5 bg-black/10 dark:bg-white/10 rounded-full" />
            <div className="w-16 h-5 bg-black/10 dark:bg-white/10 rounded-full" />
          </div>
          <div className="w-full aspect-16/9 bg-black/10 dark:bg-white/10 rounded-[12px]" />
          <div className="w-3/4 h-7 bg-black/10 dark:bg-white/10 rounded-md" />
          <div className="w-full h-10 bg-black/10 dark:bg-white/10 rounded-md" />
          <div className="w-1/3 h-4 bg-black/10 dark:bg-white/10 rounded-full" />
        </div>

        {/* Compact story skeletons */}
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="rounded-[16px] p-4 sm:p-5 bg-[var(--color-card-bg)] border border-[var(--color-border)] animate-pulse space-y-3"
          >
            <div className="w-20 h-4 bg-black/10 dark:bg-white/10 rounded-full" />
            <div className="w-4/5 h-5 bg-black/10 dark:bg-white/10 rounded-md" />
            <div className="w-full h-8 bg-black/10 dark:bg-white/10 rounded-md" />
            <div className="w-1/4 h-3 bg-black/10 dark:bg-white/10 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  // Offline banner if disconnected
  const offlineAlert = isOffline && (
    <div className="mb-4 p-3 rounded-[12px] bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4 text-amber-500 shrink-0" />
        <span>You are currently offline. Showing cached stories.</span>
      </div>
      {onRefresh && (
        <button
          onClick={onRefresh}
          className="font-bold underline hover:no-underline shrink-0"
        >
          Retry
        </button>
      )}
    </div>
  );

  // Empty state if no items match
  if (items.length === 0) {
    return (
      <div className="py-4">
        {offlineAlert}
        <div className="rounded-[16px] p-10 text-center bg-[var(--color-card-bg)] border border-[var(--color-border)] space-y-3">
          <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mx-auto text-[var(--color-text-secondary)]">
            <Newspaper className="w-6 h-6 stroke-[1.5]" />
          </div>
          <h4 className="font-serif text-lg font-bold text-[var(--color-text-primary)]">
            No verified stories found
          </h4>
          <p className="text-xs text-[var(--color-text-secondary)] max-w-sm mx-auto leading-relaxed">
            No real news found in this category right now. VenturePulse only publishes verified, sourced startup reporting.
          </p>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-full bg-[var(--color-accent)] text-[var(--color-accent-fg)] text-xs font-bold active:scale-[0.97] transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Feed</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  const [topStory, ...compactStories] = items;

  return (
    <div className="space-y-0">
      {offlineAlert}

      {/* Top story card */}
      {topStory && (
        <NewsCard
          key={topStory.id}
          item={topStory}
          isTopStory={true}
          animationIndex={0}
          onClick={onSelectNewsItem}
        />
      )}

      {/* Compact story cards */}
      {compactStories.map((item, idx) => (
        <NewsCard
          key={item.id}
          item={item}
          isTopStory={false}
          animationIndex={idx + 1}
          onClick={onSelectNewsItem}
        />
      ))}

      {/* Infinite Scroll / Load More trigger */}
      {hasMore && onLoadMore && (
        <div className="py-4 text-center">
          <button
            onClick={onLoadMore}
            className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-full bg-[var(--color-card-bg)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-text-primary)] hover:border-[var(--color-accent)] active:scale-[0.97] transition-all"
          >
            <span>Load More Stories</span>
          </button>
        </div>
      )}
    </div>
  );
});

FeedList.displayName = 'FeedList';
