/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo } from 'react';
import { CategoryTag } from './CategoryTag';
import type { NewsItem } from '../../types/models';
import {
  ExternalLink,
  ShieldCheck,
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  ArrowUpRight,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Building2,
} from 'lucide-react';

function formatRelativeTime(dateString?: string): string {
  if (!dateString) return 'Recently';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) return 'Just now';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    if (diffSeconds < 604800) return `${Math.floor(diffSeconds / 86400)}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
}

interface NewsCardProps {
  item: NewsItem;
  isTopStory?: boolean;
  animationIndex?: number;
  onClick?: (item: NewsItem) => void;
}

export const NewsCard: React.FC<NewsCardProps> = memo(({
  item,
  isTopStory = false,
  animationIndex,
  onClick,
}) => {
  const publishedDate = item.publishDate || item.publishedAt;
  const isFunding =
    item.fundingAmount ||
    item.fundingRound ||
    (item.category && (item.category.includes('funding') || item.category.includes('investor')));
  const isEvent =
    item.eventDate ||
    item.eventVenue ||
    (item.category && item.category.includes('event'));
  const isScheme =
    item.schemeOfferedBy ||
    item.schemeDeadline ||
    (item.category && item.category.includes('scheme'));
  const isProblemFix =
    item.problemContext ||
    item.fixSolution ||
    (item.category && (item.category.includes('problem') || item.category.includes('fixes')));

  const handleSourceClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.sourceUrl) {
      window.open(item.sourceUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleAddToCalendar = (e: React.MouseEvent) => {
    e.stopPropagation();
    const title = encodeURIComponent(item.headline);
    const location = encodeURIComponent(item.eventVenue || '');
    const details = encodeURIComponent(
      `${item.summary || ''}\n\nVerified source: ${item.sourceUrl}`
    );
    const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&location=${location}&details=${details}`;
    window.open(googleCalUrl, '_blank', 'noopener,noreferrer');
  };

  const handleApplyScheme = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = item.schemeApplyUrl || item.sourceUrl;
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Stagger animation for the first 6 cards on load (40ms stagger)
  const staggerClass =
    animationIndex !== undefined && animationIndex < 6
      ? `feed-card-stagger-${animationIndex}`
      : '';

  return (
    <article
      tabIndex={0}
      onClick={() => onClick && onClick(item)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick && onClick(item);
        }
      }}
      className={`group relative bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-[16px] overflow-hidden cursor-pointer interactive-press transition-colors ${staggerClass} ${
        isTopStory ? 'p-5 sm:p-6 mb-5' : 'p-4 sm:p-5 mb-3.5'
      }`}
    >
      {/* Category tag header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <CategoryTag category={item.category} size={isTopStory ? 'md' : 'sm'} />
          {isTopStory && (
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[var(--color-accent)] text-[#0B1F3A]">
              Top Story
            </span>
          )}
        </div>

        {/* External source indicator */}
        {item.sourceUrl && (
          <button
            onClick={handleSourceClick}
            className="text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5"
            title="Open original verified source"
            aria-label="Open source link in new tab"
          >
            <ArrowUpRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Top story hero image: fixed aspect-ratio container with skeleton background */}
      {isTopStory && item.imageUrl && (
        <div className="relative w-full aspect-16/9 rounded-[12px] overflow-hidden mb-4 border border-[var(--color-border)] bg-black/5 dark:bg-white/5">
          <img
            src={item.imageUrl}
            alt=""
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      {/* Headline & compact layout */}
      <div className={!isTopStory && item.imageUrl ? 'flex flex-col sm:flex-row gap-4' : ''}>
        <div className="flex-1 min-w-0">
          <h2
            className={`font-serif text-[var(--color-text-primary)] font-bold tracking-tight leading-[1.28] ${
              isTopStory
                ? 'text-xl sm:text-2xl md:text-[26px] mb-3'
                : 'text-base sm:text-lg mb-2 line-clamp-3'
            }`}
          >
            {item.headline}
          </h2>

          {item.summary && (
            <p
              className={`font-sans text-[var(--color-text-secondary)] leading-relaxed ${
                isTopStory ? 'text-sm sm:text-base mb-4' : 'text-xs sm:text-sm mb-3 line-clamp-2'
              }`}
            >
              {item.summary}
            </p>
          )}
        </div>

        {/* Compact image on right/side: fixed aspect-ratio box */}
        {!isTopStory && item.imageUrl && (
          <div className="hidden sm:block w-28 h-20 md:w-32 md:h-24 shrink-0 rounded-[12px] overflow-hidden border border-[var(--color-border)] bg-black/5 dark:bg-white/5">
            <img
              src={item.imageUrl}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
            />
          </div>
        )}
      </div>

      {/* SPECIALIZED CARD SECTIONS */}

      {/* 1. Funding Card Layout */}
      {isFunding && (item.fundingAmount || item.fundingRound || item.investors) && (
        <div className="my-3 p-3 sm:p-3.5 rounded-[12px] bg-black/[0.02] dark:bg-white/[0.02] border border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-baseline gap-2.5">
            {item.fundingAmount && (
              <span className="tabular-nums font-mono font-extrabold text-lg sm:text-xl text-[var(--color-text-primary)] tracking-tight">
                {item.fundingAmount}
              </span>
            )}
            {item.fundingRound && (
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[var(--cat-funding-bg)] text-[var(--cat-funding)]">
                {item.fundingRound}
              </span>
            )}
          </div>

          {item.investors && item.investors.length > 0 && (
            <div className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-[var(--color-text-primary)]">Investors:</span>
              <span>{item.investors.join(', ')}</span>
            </div>
          )}
        </div>
      )}

      {/* 2. Event Card Layout */}
      {isEvent && (item.eventDate || item.eventVenue) && (
        <div className="my-3 p-3 sm:p-3.5 rounded-[12px] bg-black/[0.02] dark:bg-white/[0.02] border border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            {item.eventDate && (
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text-primary)]">
                <CalendarIcon className="w-3.5 h-3.5 text-[var(--cat-events)]" />
                <span>{item.eventDate}</span>
              </div>
            )}
            {item.eventVenue && (
              <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                <MapPin className="w-3.5 h-3.5 text-[var(--color-text-secondary)]" />
                <span>{item.eventVenue}</span>
              </div>
            )}
          </div>

          <button
            onClick={handleAddToCalendar}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-black/5 dark:bg-white/5 border border-[var(--color-border)] hover:bg-black/10 dark:hover:bg-white/10 text-[var(--color-text-primary)] transition-colors self-start sm:self-auto min-h-[36px]"
          >
            <CalendarIcon className="w-3.5 h-3.5 text-[var(--color-accent)]" />
            <span>Add to calendar</span>
          </button>
        </div>
      )}

      {/* 3. Scheme Card Layout */}
      {isScheme && (item.schemeOfferedBy || item.schemeDeadline) && (
        <div className="my-3 p-3 sm:p-3.5 rounded-[12px] bg-black/[0.02] dark:bg-white/[0.02] border border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            {item.schemeOfferedBy && (
              <div className="text-xs font-medium text-[var(--color-text-secondary)]">
                Offered by:{' '}
                <span className="font-semibold text-[var(--color-text-primary)]">
                  {item.schemeOfferedBy}
                </span>
              </div>
            )}
            {item.schemeDeadline && (
              <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
                <Clock className="w-3.5 h-3.5 text-[var(--cat-schemes)]" />
                <span>Deadline: {item.schemeDeadline}</span>
              </div>
            )}
          </div>

          <button
            onClick={handleApplyScheme}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[var(--cat-schemes-bg)] text-[var(--cat-schemes)] border border-[var(--cat-schemes)]/20 hover:opacity-90 transition-opacity self-start sm:self-auto min-h-[36px]"
          >
            <span>Apply Now</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* 4. Problem and Fix Card (Two-Part Layout) */}
      {isProblemFix && (item.problemContext || item.fixSolution) && (
        <div className="my-3 rounded-[12px] overflow-hidden border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
          {item.problemContext && (
            <div className="p-3 bg-red-500/[0.04] dark:bg-red-500/[0.08] flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <span className="font-bold text-red-700 dark:text-red-300 block uppercase tracking-wider text-[10px]">
                  The Problem
                </span>
                <p className="text-[var(--color-text-primary)] leading-relaxed">
                  {item.problemContext}
                </p>
              </div>
            </div>
          )}

          {item.fixSolution && (
            <div className="p-3 bg-emerald-500/[0.04] dark:bg-emerald-500/[0.08] flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[var(--color-verified)] shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <span className="font-bold text-[var(--color-verified)] block uppercase tracking-wider text-[10px]">
                  The Verified Fix
                </span>
                <p className="text-[var(--color-text-primary)] leading-relaxed">
                  {item.fixSolution}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FOOTER: Verified mark, source name, and time */}
      <footer className="mt-3.5 pt-3 border-t border-[var(--color-border)] flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
        <div className="flex items-center gap-2">
          {/* Green Verified Mark */}
          <div
            className="flex items-center gap-1 font-semibold text-[var(--color-verified)]"
            title="Sourced and verified by VenturePulse editorial standards"
          >
            <ShieldCheck className="w-4 h-4 text-[var(--color-verified)] stroke-[2.2]" />
            <span className="text-[11px] font-bold">Verified</span>
          </div>

          <span className="text-[var(--color-border)]">·</span>

          {/* Source name - tapping opens original article */}
          <button
            onClick={handleSourceClick}
            className="hover:underline hover:text-[var(--color-text-primary)] font-medium transition-colors text-left truncate max-w-[150px] sm:max-w-none"
            title={`Open article at ${item.sourceName}`}
          >
            {item.sourceName}
          </button>
        </div>

        {/* Time */}
        <span className="shrink-0 text-[11px] tabular-nums text-[var(--color-text-secondary)]">
          {formatRelativeTime(publishedDate)}
        </span>
      </footer>
    </article>
  );
});

NewsCard.displayName = 'NewsCard';
