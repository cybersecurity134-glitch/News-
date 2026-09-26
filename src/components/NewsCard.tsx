/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NewsItem } from '../types';
import { getCategoryMeta, formatTimeAgo } from '../utils';
import { ExternalLink, CheckCircle2, ShieldAlert, Sparkles, User } from 'lucide-react';

interface NewsCardProps {
  item: NewsItem;
  isDark: boolean;
  onSelect: (item: NewsItem) => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({ item, isDark, onSelect }) => {
  const categoryMeta = getCategoryMeta(item.category);
  const tagColor = isDark ? categoryMeta.darkColor : categoryMeta.lightColor;
  const tagBg = isDark ? categoryMeta.badgeBgDark : categoryMeta.badgeBgLight;

  return (
    <article
      id={`news-card-${item.id}`}
      onClick={() => onSelect(item)}
      className="ios-card-press cursor-pointer w-full rounded-2xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-left transition-all duration-150 overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04)] select-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(item);
        }
      }}
    >
      {/* Optional 16:9 Thumbnail Masked to Card Top Radius */}
      {item.imageUrl && (
        <div className="w-full aspect-[16/9] relative overflow-hidden bg-black/5 dark:bg-white/5">
          <img
            src={item.imageUrl}
            alt={item.headline}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            loading="lazy"
            onError={(e) => {
              // Hide image container on error
              (e.target as HTMLElement).parentElement?.classList.add('hidden');
            }}
          />
          {item.status === 'pending' && (
            <div className="absolute top-3 right-3 bg-[var(--color-warning)] text-[var(--color-primary-fg)] text-[11px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm shadow-sm flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" /> Pending Review
            </div>
          )}
        </div>
      )}

      {/* Internal Padding: exactly 16px (p-4) */}
      <div className="p-4 space-y-2.5">
        {/* Category Tag: Pill with 12px uppercase bold text */}
        <div className="flex items-center justify-between gap-2">
          <span
            className="ios-caption px-2.5 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1 font-bold"
            style={{
              backgroundColor: tagBg,
              color: tagColor,
            }}
          >
            {categoryMeta.name}
          </span>

          {item.sourceType === 'automated-ingestion' ? (
            <span
              className="text-[11px] text-[var(--color-text-secondary)] flex items-center gap-1 font-medium"
              title="Automated live RSS ingestion"
            >
              <Sparkles className="w-3 h-3 text-[var(--color-primary)]" />
              Auto-Ingest
            </span>
          ) : (
            <span
              className="text-[11px] text-[var(--color-text-secondary)] flex items-center gap-1 font-medium"
              title={`Submitted by ${item.uploader.name}`}
            >
              <User className="w-3 h-3 text-[var(--color-text-tertiary)]" />
              {item.uploader.name}
            </span>
          )}
        </div>

        {/* Headline: 17px semibold, max 3 lines, ellipsis truncation */}
        <h2 className="ios-headline text-[var(--color-text-primary)] line-clamp-3 leading-[1.3] text-pretty">
          {item.headline}
        </h2>

        {/* Summary: Subheadline (15px regular), 2-line clamp */}
        {item.summary && (
          <p className="ios-subheadline text-[var(--color-text-secondary)] line-clamp-2 leading-[1.35]">
            {item.summary}
          </p>
        )}

        {/* Meta Row: Footnote (13px), secondary text color: Source Name · 2h ago */}
        <div className="pt-1 flex items-center justify-between border-t border-[var(--color-border)]">
          <div className="ios-footnote text-[var(--color-text-secondary)] flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-[var(--color-text-primary)]">
              {item.sourceName}
            </span>
            <span>·</span>
            <span>{formatTimeAgo(item.publishDate)}</span>
            <span className="inline-flex items-center text-[var(--color-success)] gap-0.5 ml-1" title="Real published source verified">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium hidden sm:inline">Verified Source</span>
            </span>
          </div>

          <div
            className="text-[var(--color-text-tertiary)] hover:text-[var(--color-primary)] transition-colors p-1"
            title="Open detail view"
          >
            <ExternalLink className="w-4 h-4" />
          </div>
        </div>
      </div>
    </article>
  );
};
