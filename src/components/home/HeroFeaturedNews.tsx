/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo } from 'react';
import { Volume2, ArrowRight, Bookmark, Sparkles, Clock } from 'lucide-react';
import { NewsArticle } from '../../types/news';
import { useBookmarks } from '../../context/BookmarkContext';

interface HeroFeaturedNewsProps {
  article: NewsArticle;
  onOpenArticle: (article: NewsArticle) => void;
  onListenArticle: (article: NewsArticle) => void;
}

export const HeroFeaturedNews: React.FC<HeroFeaturedNewsProps> = memo(({
  article,
  onOpenArticle,
  onListenArticle,
}) => {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(article.id);

  return (
    <section className="relative w-full liquid-glass-card overflow-hidden group select-none transition-all duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-6">
        {/* Visual Hero Image Container */}
        <div className="lg:col-span-7 relative aspect-16/10 lg:aspect-auto lg:min-h-[380px] overflow-hidden bg-black/10">
          <img
            src={article.imageUrl}
            alt={article.headline}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
          />
          <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-black/70 via-black/30 to-transparent" />

          {/* Featured Spotlight Badge */}
          <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Today's Top Story</span>
          </div>
        </div>

        {/* Story Editorial Details */}
        <div className="lg:col-span-5 p-5 sm:p-6 lg:p-7 flex flex-col justify-between">
          <div>
            {/* Clean Unboxed Metadata (Zero-Pill Compliance) */}
            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] font-medium mb-2.5">
              <span className="font-extrabold uppercase tracking-wider text-[var(--accent-primary)]">
                {article.categoryLabel}
              </span>
              <span aria-hidden="true" className="opacity-50">·</span>
              <span>{article.source}</span>
              <span aria-hidden="true" className="opacity-50">·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 opacity-70" />
                {article.readTimeMinutes} min
              </span>
            </div>

            {/* Headline */}
            <h2
              onClick={() => onOpenArticle(article)}
              className="font-extrabold text-xl sm:text-2xl lg:text-3xl leading-tight tracking-tight text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors cursor-pointer mb-3"
            >
              {article.headline}
            </h2>

            {/* Summary */}
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-3 mb-4">
              {article.summary}
            </p>

            {/* Key Fact Highlight */}
            {article.keyFacts && article.keyFacts.length > 0 && (
              <div className="p-3 rounded-xl bg-[var(--accent-primary)]/8 dark:bg-[var(--accent-primary)]/15 border border-[var(--accent-primary)]/20 mb-5">
                <p className="text-[11px] font-bold text-[var(--accent-primary)] uppercase tracking-wider mb-1">
                  Key Takeaway
                </p>
                <p className="text-xs text-[var(--text-primary)] font-medium leading-normal">
                  {article.keyFacts[0]}
                </p>
              </div>
            )}
          </div>

          {/* Interactive Actions */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-[var(--border-subtle)]">
            <button
              onClick={() => onOpenArticle(article)}
              className="px-4 py-2 rounded-full bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm tap-target-44 interactive-press transition-colors"
            >
              <span>Read Full Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onListenArticle(article)}
                className="px-3 py-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-[var(--text-primary)] text-xs font-semibold flex items-center gap-1.5 tap-target-44 interactive-press transition-colors"
                title="Listen to story read aloud"
              >
                <Volume2 className="w-4 h-4 text-[var(--accent-primary)]" />
                <span className="hidden sm:inline">Listen</span>
              </button>

              <button
                onClick={() => toggleBookmark(article)}
                className={`p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 tap-target-44 interactive-press transition-colors ${
                  bookmarked ? 'text-[var(--accent-primary)]' : 'text-[var(--text-secondary)]'
                }`}
                title={bookmarked ? 'Remove Bookmark' : 'Bookmark Story'}
              >
                <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

HeroFeaturedNews.displayName = 'HeroFeaturedNews';
