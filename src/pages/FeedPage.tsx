/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, memo } from 'react';
import { Category, NewsItem, User } from '../types/models';
import { useNewsFeed } from '../hooks/useNewsFeed';
import { useDebounce } from '../hooks/useDebounce';
import { FilterBar } from '../components/feed/FilterBar';
import { FeedList } from '../components/feed/FeedList';
import { CategoryTag } from '../components/feed/CategoryTag';
import {
  ExternalLink,
  MessageSquare,
  RefreshCw,
  X,
  Radio,
  ShieldCheck,
  Calendar as CalendarIcon,
  MapPin,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface FeedPageProps {
  onStartChatWithUser?: (user: User) => void;
  globalSearchQuery?: string;
  onClearGlobalSearch?: () => void;
}

export const FeedPage: React.FC<FeedPageProps> = memo(({
  onStartChatWithUser,
  globalSearchQuery = '',
  onClearGlobalSearch,
}) => {
  const { currentUser } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [activeItem, setActiveItem] = useState<NewsItem | null>(null);
  const [isIngesting, setIsIngesting] = useState(false);

  // Debounce search query by 300 ms
  const debouncedSearchQuery = useDebounce(globalSearchQuery, 300);

  const {
    items,
    visibleItems,
    hasMore,
    loadMore,
    isLoading,
    isRefreshing,
    isOffline,
    refresh,
  } = useNewsFeed(
    selectedCategory === 'all' ? undefined : selectedCategory,
    'approved'
  );

  // Filter items based on debounced search query
  const filteredItems = useMemo(() => {
    const q = debouncedSearchQuery.trim().toLowerCase();
    if (!q) return visibleItems;
    return items.filter(
      (item) =>
        item.headline.toLowerCase().includes(q) ||
        item.sourceName.toLowerCase().includes(q) ||
        (item.summary ? item.summary.toLowerCase().includes(q) : false) ||
        (item.fundingAmount ? item.fundingAmount.toLowerCase().includes(q) : false) ||
        (item.schemeOfferedBy ? item.schemeOfferedBy.toLowerCase().includes(q) : false) ||
        (item.eventVenue ? item.eventVenue.toLowerCase().includes(q) : false)
    );
  }, [items, visibleItems, debouncedSearchQuery]);

  const handleLiveRssIngest = async () => {
    setIsIngesting(true);
    try {
      await fetch('/api/ingest/rss', { method: 'POST' });
      refresh();
    } catch {
      // silent
    } finally {
      setIsIngesting(false);
    }
  };

  return (
    <div className="space-y-4 pb-20 animate-tab-screen">
      {/* Category Chips Bar & Controls */}
      <div className="flex items-center justify-between gap-2 pt-1 border-b border-[var(--color-border)] pb-2">
        <div className="flex-1 min-w-0">
          <FilterBar
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        <div className="flex items-center gap-1.5 shrink-0 pl-1">
          <button
            onClick={handleLiveRssIngest}
            disabled={isIngesting}
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full border border-[var(--color-border)] hover:bg-black/5 dark:hover:bg-white/5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] active:scale-[0.97] transition-all"
            title="Scan verified live startup wires"
            aria-label="Scan verified live startup wires"
          >
            <Radio className={`w-4 h-4 text-[var(--color-verified)] ${isIngesting ? 'animate-pulse' : ''}`} />
          </button>

          <button
            onClick={() => refresh()}
            disabled={isRefreshing}
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full border border-[var(--color-border)] hover:bg-black/5 dark:hover:bg-white/5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] active:scale-[0.97] transition-all"
            title="Refresh feed"
            aria-label="Refresh feed"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[var(--color-accent)]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Active Search Badge */}
      {debouncedSearchQuery && (
        <div className="flex items-center justify-between px-3.5 py-2 rounded-[12px] bg-black/5 dark:bg-white/5 text-xs text-[var(--color-text-secondary)]">
          <span>
            Showing results for <strong className="text-[var(--color-text-primary)]">"{debouncedSearchQuery}"</strong> ({filteredItems.length})
          </span>
          {onClearGlobalSearch && (
            <button
              onClick={onClearGlobalSearch}
              className="text-[var(--color-accent)] hover:underline font-semibold min-h-[36px] flex items-center px-2"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Feed List: One large top-story card, then compact cards */}
      <FeedList
        items={filteredItems}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        isOffline={isOffline}
        hasMore={!debouncedSearchQuery && hasMore}
        onLoadMore={loadMore}
        onSelectNewsItem={(item) => setActiveItem(item)}
        onRefresh={refresh}
      />

      {/* Editorial Article Detail Modal */}
      {activeItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-subtle"
          onClick={() => setActiveItem(null)}
        >
          <div
            className="w-full max-w-lg rounded-[16px] bg-[var(--color-card-bg)] border border-[var(--color-border)] p-6 shadow-xl space-y-4 max-h-[90dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {activeItem.imageUrl && (
              <div className="relative w-full aspect-16/9 rounded-[12px] overflow-hidden border border-[var(--color-border)] bg-black/5 dark:bg-white/5">
                <img
                  src={activeItem.imageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            <div className="flex items-center justify-between gap-2">
              <CategoryTag category={activeItem.category} size="md" />
              <button
                onClick={() => setActiveItem(null)}
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] active:scale-[0.97] transition-all"
                aria-label="Close article modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h2 className="font-serif text-2xl font-bold text-[var(--color-text-primary)] leading-snug">
              {activeItem.headline}
            </h2>

            {/* Specialized data in modal */}
            {activeItem.fundingAmount && (
              <div className="p-3.5 rounded-[12px] bg-black/[0.02] dark:bg-white/[0.02] border border-[var(--color-border)] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[var(--color-text-secondary)] block">
                    Round & Size
                  </span>
                  <span className="tabular-nums font-mono text-xl font-extrabold text-[var(--color-text-primary)]">
                    {activeItem.fundingAmount} {activeItem.fundingRound ? `· ${activeItem.fundingRound}` : ''}
                  </span>
                </div>
                {activeItem.investors && (
                  <span className="text-xs text-[var(--color-text-secondary)] max-w-xs text-right truncate">
                    {activeItem.investors.join(', ')}
                  </span>
                )}
              </div>
            )}

            {activeItem.eventDate && (
              <div className="p-3.5 rounded-[12px] bg-black/[0.02] dark:bg-white/[0.02] border border-[var(--color-border)] space-y-1 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-[var(--color-text-primary)]">
                  <CalendarIcon className="w-4 h-4 text-[var(--cat-events)]" />
                  <span>{activeItem.eventDate}</span>
                </div>
                {activeItem.eventVenue && (
                  <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
                    <MapPin className="w-4 h-4 text-[var(--cat-events)]" />
                    <span>{activeItem.eventVenue}</span>
                  </div>
                )}
              </div>
            )}

            {activeItem.schemeOfferedBy && (
              <div className="p-3.5 rounded-[12px] bg-black/[0.02] dark:bg-white/[0.02] border border-[var(--color-border)] space-y-1 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-[var(--cat-schemes)]">
                  <Building2 className="w-4 h-4 text-[var(--cat-schemes)]" />
                  <span>Offered By: {activeItem.schemeOfferedBy}</span>
                </div>
                {activeItem.schemeDeadline && (
                  <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span>Deadline: {activeItem.schemeDeadline}</span>
                  </div>
                )}
              </div>
            )}

            {activeItem.problemContext && (
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="p-3 rounded-[12px] bg-[var(--color-error-bg)] border border-[var(--color-error-border)]">
                  <div className="flex items-center gap-1.5 font-bold text-[var(--color-error-fg)] mb-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>The Problem</span>
                  </div>
                  <p className="text-[var(--color-text-secondary)]">{activeItem.problemContext}</p>
                </div>
                {activeItem.fixSolution && (
                  <div className="p-3 rounded-[12px] bg-[var(--color-info-bg)] border border-[var(--color-info-border)]">
                    <div className="flex items-center gap-1.5 font-bold text-[var(--color-info-fg)] mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>The Fix</span>
                    </div>
                    <p className="text-[var(--color-text-secondary)]">{activeItem.fixSolution}</p>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-secondary)]">
                Verified Summary
              </span>
              <p className="font-sans text-sm text-[var(--color-text-secondary)] leading-relaxed">
                {activeItem.summary}
              </p>
            </div>

            {/* Footer with green Verified mark, source, and 1:1 chat */}
            <div className="pt-4 border-t border-[var(--color-border)] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 font-semibold text-xs text-[var(--color-verified)]">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verified Source</span>
                </span>
                <span className="text-xs text-[var(--color-text-secondary)] truncate max-w-[120px] sm:max-w-none">
                  · {activeItem.sourceName}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {activeItem.uploader && currentUser && currentUser.id !== activeItem.uploader.id && (
                  <button
                    onClick={() => {
                      if (onStartChatWithUser) {
                        onStartChatWithUser({
                          id: activeItem.uploader!.id,
                          name: activeItem.uploader!.name,
                          role: activeItem.uploader!.role as any,
                        });
                        setActiveItem(null);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] rounded-full border border-[var(--color-border)] hover:bg-black/5 dark:hover:bg-white/5 text-xs font-semibold text-[var(--color-text-primary)] active:scale-[0.97] transition-all"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Chat</span>
                  </button>
                )}

                {activeItem.sourceUrl && (
                  <a
                    href={activeItem.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] rounded-full bg-[var(--color-accent)] text-[var(--color-accent-fg)] text-xs font-bold hover:opacity-95 active:scale-[0.97] transition-all"
                  >
                    <span>Read Article</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

FeedPage.displayName = 'FeedPage';
