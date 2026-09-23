/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo } from 'react';
import { Bookmark, Share2, MapPin, DollarSign, Building, Clock, Sparkles } from 'lucide-react';
import { NewsEventItem, NewsCategory } from '../../types/intelligence';
import { SourceTransparencyBadge } from './SourceTransparencyBadge';
import { useIntelligence } from '../../context/IntelligenceContext';

interface NewsEventCardProps {
  item: NewsEventItem;
  onOpenItem?: (item: NewsEventItem) => void;
  reason?: string; // Optional "Why am I seeing this?"
}

const getCategoryBadgeClass = (cat: NewsCategory): string => {
  switch (cat) {
    case 'news':
      return 'badge-section-news';
    case 'startup_launch':
      return 'badge-section-startups';
    case 'funding':
      return 'badge-section-funding';
    case 'scheme':
      return 'badge-section-schemes';
    case 'investor_call':
      return 'badge-section-investors';
    case 'grant_rfp':
      return 'badge-section-grants';
    case 'pitch_day':
      return 'badge-section-events';
    case 'problem_reported':
      return 'badge-section-problems';
    default:
      return 'badge-section-news';
  }
};

export const NewsEventCard: React.FC<NewsEventCardProps> = memo(({
  item,
  onOpenItem,
  reason,
}) => {
  const { isItemSaved, toggleSaveItem } = useIntelligence();
  const saved = isItemSaved(item.id);

  const formattedTime = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(item.publishedAt));

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.headline,
          text: item.summary,
          url: item.source.url,
        });
      } catch {}
    } else {
      navigator.clipboard?.writeText(`${item.headline}\nSource: ${item.source.url}`);
    }
  };

  const badgeClass = getCategoryBadgeClass(item.category);

  return (
    <article
      onClick={() => onOpenItem?.(item)}
      className="liquid-glass-card p-5 flex flex-col justify-between select-none cursor-pointer group space-y-4"
    >
      <div>
        {/* Why am I seeing this badge (if in personalized feed) */}
        {reason && (
          <div className="mb-2 p-2 rounded-xl bg-[var(--color-primary-subtle)] border border-[var(--color-primary-border)] flex items-center gap-1.5 text-[11px] text-[var(--color-primary)] font-medium">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>Why am I seeing this? {reason}</span>
          </div>
        )}

        {/* Clean Header with section-specific badge */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-secondary)] font-medium mb-2.5">
          <span className={`font-extrabold px-2 py-0.5 rounded-full text-[10px] tracking-wide uppercase ${badgeClass}`}>
            {item.categoryLabel}
          </span>
          <span aria-hidden="true" className="opacity-40">·</span>
          <span className="flex items-center gap-1 text-[var(--color-text-tertiary)]">
            <MapPin className="w-3 h-3 opacity-70" />
            {item.geography.city ? `${item.geography.city}, ` : ''}{item.geography.state ? `${item.geography.state}, ` : ''}{item.geography.country}
          </span>
          <span aria-hidden="true" className="opacity-40">·</span>
          <span className="flex items-center gap-1 text-[var(--color-text-tertiary)]">
            <Clock className="w-3 h-3 opacity-70" />
            {formattedTime}
          </span>
        </div>

        {/* Headline */}
        <h3 className="font-extrabold text-base sm:text-lg text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors leading-snug mb-2 font-display">
          {item.headline}
        </h3>

        {/* Short Summary */}
        <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed mb-3">
          {item.summary}
        </p>

        {/* Companies & Funding Structured Tags */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
          {item.companiesMentioned.length > 0 && (
            <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
              <Building className="w-3.5 h-3.5 text-[var(--color-primary)] shrink-0" />
              <span className="font-semibold text-[var(--color-text-primary)] truncate">
                {item.companiesMentioned.join(', ')}
              </span>
            </div>
          )}

          {item.fundingAmount && (
            <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
              <DollarSign className="w-3.5 h-3.5 text-[var(--sec-funding)] shrink-0" />
              <span className="font-bold text-[var(--sec-funding)]">
                {item.fundingAmount} {item.fundingRound ? `(${item.fundingRound})` : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Mandatory Source Transparency Badge */}
      <SourceTransparencyBadge
        source={item.source}
        additionalSources={item.additionalSources}
        verificationStatus={item.verificationStatus}
        conflictNotes={item.conflictNotes}
      />

      {/* Card Action Controls */}
      <div className="pt-2 border-t border-[var(--color-border-subtle)] flex items-center justify-between text-xs text-[var(--color-text-tertiary)]">
        <span>Sector: <strong className="text-[var(--color-text-secondary)]">{item.sector}</strong></span>

        <div className="flex items-center gap-1">
          <button
            onClick={handleShare}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] tap-target-44 interactive-press"
            title="Share report"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSaveItem(item.id);
            }}
            className={`p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 tap-target-44 interactive-press transition-colors ${
              saved ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]'
            }`}
            title={saved ? 'Remove from Saved Vault' : 'Save for Offline Access'}
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>
    </article>
  );
});

NewsEventCard.displayName = 'NewsEventCard';

