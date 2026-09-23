/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo } from 'react';
import { Bookmark, Share2, Volume2, Clock } from 'lucide-react';
import { NewsArticle } from '../../types/news';
import { useBookmarks } from '../../context/BookmarkContext';

interface NewsCardProps {
  article: NewsArticle;
  onOpenArticle: (article: NewsArticle) => void;
  onQuickListen?: (article: NewsArticle) => void;
}

export const NewsCard: React.FC<NewsCardProps> = memo(({
  article,
  onOpenArticle,
  onQuickListen,
}) => {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(article.id);

  const formattedTime = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(article.publishedAt));

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.headline,
          text: article.summary,
          url: article.sourceUrl || window.location.href,
        });
      } catch {
        // user cancelled
      }
    } else {
      navigator.clipboard?.writeText(
        `${article.headline}\n${article.sourceUrl || window.location.href}`
      );
    }
  };

  const handleBookmarkToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleBookmark(article);
  };

  const handleListen = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickListen?.(article);
  };

  return (
    <article
      onClick={() => onOpenArticle(article)}
      className="liquid-glass-card p-4 sm:p-5 flex flex-col justify-between cursor-pointer group select-none relative overflow-hidden transition-all duration-200"
    >
      <div>
        {/* Card Image Container - fixed aspect ratio to eliminate layout shift */}
        <div className="relative w-full aspect-16/9 rounded-[14px] overflow-hidden mb-3.5 bg-black/5 dark:bg-white/5">
          <img
            src={article.imageUrl}
            alt={article.headline}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />

          {/* Quick Listen overlay button */}
          {onQuickListen && (
            <button
              onClick={handleListen}
              className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1.5 transition-transform active:scale-95 shadow-xs"
              title="Listen to summary"
              aria-label="Listen to summary"
            >
              <Volume2 className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
              <span>Listen</span>
            </button>
          )}
        </div>

        {/* Clean Unboxed Metadata Header (Zero-Pill Compliance) */}
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-medium mb-1.5">
          <span className="font-bold tracking-tight text-[var(--accent-primary)]">
            {article.categoryLabel}
          </span>
          <span aria-hidden="true" className="opacity-50">·</span>
          <span>{article.source}</span>
          <span aria-hidden="true" className="opacity-50">·</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 opacity-70" />
            {article.readTimeMinutes}m read
          </span>
        </div>

        {/* Headline */}
        <h3 className="font-extrabold text-base sm:text-lg leading-snug tracking-tight text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors mb-2">
          {article.headline}
        </h3>

        {/* Short Summary */}
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed mb-3">
          {article.summary}
        </p>
      </div>

      {/* Footer Controls & Published Time */}
      <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-tertiary)]">
        <span className="font-medium text-[11px]">{formattedTime}</span>

        <div className="flex items-center gap-1">
          {/* Share Button */}
          <button
            onClick={handleShare}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] tap-target-44 interactive-press transition-colors"
            title="Share story"
            aria-label="Share article"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Bookmark Button */}
          <button
            onClick={handleBookmarkToggle}
            className={`p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 tap-target-44 interactive-press transition-all ${
              bookmarked
                ? 'text-[var(--accent-primary)] scale-105'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            title={bookmarked ? 'Remove Bookmark' : 'Save for Offline'}
            aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark article'}
          >
            <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>
    </article>
  );
});

NewsCard.displayName = 'NewsCard';
