/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo } from 'react';
import { Bookmark, Clock } from 'lucide-react';
import { NewsArticle } from '../../types/news';
import { useBookmarks } from '../../context/BookmarkContext';

interface CompactNewsCardProps {
  article: NewsArticle;
  onOpenArticle: (article: NewsArticle) => void;
}

export const CompactNewsCard: React.FC<CompactNewsCardProps> = memo(({
  article,
  onOpenArticle,
}) => {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(article.id);

  return (
    <div
      onClick={() => onOpenArticle(article)}
      className="liquid-glass-card p-3.5 flex items-center gap-3.5 cursor-pointer group interactive-press select-none"
    >
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-black/5 dark:bg-white/5">
        <img
          src={article.imageUrl}
          alt={article.headline}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)] font-medium mb-1">
            <span className="font-bold text-[var(--accent-primary)] truncate max-w-[120px]">
              {article.categoryLabel}
            </span>
            <span aria-hidden="true" className="opacity-50">·</span>
            <span className="flex items-center gap-0.5 text-[var(--text-tertiary)]">
              <Clock className="w-2.5 h-2.5" />
              {article.readTimeMinutes}m
            </span>
          </div>

          <h4 className="font-bold text-sm leading-snug text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors line-clamp-2">
            {article.headline}
          </h4>
        </div>

        <div className="flex items-center justify-between mt-2 pt-1 text-[11px] text-[var(--text-tertiary)]">
          <span className="truncate max-w-[140px]">{article.source}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleBookmark(article);
            }}
            className={`p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 ${
              bookmarked ? 'text-[var(--accent-primary)]' : 'text-[var(--text-tertiary)]'
            }`}
            title="Bookmark"
            aria-label="Bookmark"
          >
            <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
});

CompactNewsCard.displayName = 'CompactNewsCard';
