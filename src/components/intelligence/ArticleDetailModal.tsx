/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { X, ExternalLink, Calendar, MapPin, Building, DollarSign, Bookmark, Share2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { NewsEventItem } from '../../types/intelligence';
import { SourceTransparencyBadge } from './SourceTransparencyBadge';
import { useIntelligence } from '../../context/IntelligenceContext';

interface ArticleDetailModalProps {
  item: NewsEventItem | null;
  onClose: () => void;
}

const getCategoryBadgeClass = (category: string) => {
  switch (category) {
    case 'funding':
      return 'badge-section-funding';
    case 'government-schemes':
      return 'badge-section-schemes';
    case 'opportunities':
      return 'badge-section-grants';
    case 'startup-launches':
      return 'badge-section-startups';
    case 'events':
      return 'badge-section-events';
    case 'investors':
      return 'badge-section-investors';
    case 'problems':
      return 'badge-section-problems';
    default:
      return 'badge-section-news';
  }
};

export const ArticleDetailModal: React.FC<ArticleDetailModalProps> = ({ item, onClose }) => {
  const { isItemSaved, toggleSaveItem } = useIntelligence();

  useEffect(() => {
    if (item) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [item]);

  if (!item) return null;

  const saved = isItemSaved(item.id);

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(new Date(item.publishedAt));

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex justify-center p-2 sm:p-6 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Intelligence Article Details"
    >
      <div
        className="w-full max-w-3xl liquid-glass-modal rounded-3xl overflow-hidden my-auto shadow-2xl flex flex-col max-h-[94dvh] sm:max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Control Bar */}
        <div className="p-3.5 sm:p-5 border-b border-[var(--color-border-subtle)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shrink-0 ${getCategoryBadgeClass(item.category)}`}>
              {item.categoryLabel}
            </span>
            <span className="text-xs text-[var(--color-text-tertiary)] shrink-0">·</span>
            <span className="text-xs font-medium text-[var(--color-text-secondary)] truncate">{item.sector}</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => toggleSaveItem(item.id)}
              className={`p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 tap-target-44 flex items-center justify-center ${
                saved ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)]'
              }`}
              title="Save report"
            >
              <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] tap-target-44 flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-7 overflow-y-auto space-y-5 sm:space-y-6 flex-1">
          {/* Headline */}
          <h2 className="font-extrabold text-xl sm:text-2xl text-[var(--color-text-primary)] leading-tight font-display">
            {item.headline}
          </h2>

          {/* Clean Unboxed Metadata */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-secondary)]">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[var(--color-text-tertiary)]" />
              {formattedDate}
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[var(--color-text-tertiary)]" />
              {item.geography.city ? `${item.geography.city}, ` : ''}{item.geography.country}
            </span>
          </div>

          {/* Mandatory Source Transparency Badge */}
          <SourceTransparencyBadge
            source={item.source}
            additionalSources={item.additionalSources}
            verificationStatus={item.verificationStatus}
            conflictNotes={item.conflictNotes}
          />

          {/* Key Facts / Extracted Claims Panel */}
          {item.keyFacts && item.keyFacts.length > 0 && (
            <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--color-border-subtle)] space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-text-primary)] block">
                Verified Key Facts Reported:
              </span>
              <ul className="space-y-1.5 text-xs text-[var(--color-text-secondary)]">
                {item.keyFacts.map((fact, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-success)] shrink-0 mt-0.5" />
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Full Summary Content */}
          <div className="space-y-3 text-sm text-[var(--color-text-primary)] leading-relaxed">
            <p className="font-medium text-base text-[var(--color-text-primary)]">
              {item.summary}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              This intelligence entry was verified and aggregated from accredited primary public sources ({item.source.name}) in accordance with the Zero-Hallucination Policy. No speculative projections or artificial completions have been applied.
            </p>
          </div>

          {/* Entities Involved */}
          <div className="pt-4 border-t border-[var(--color-border-subtle)] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[var(--color-text-tertiary)] block mb-0.5">Companies Mentioned</span>
              <strong className="text-[var(--color-text-primary)]">{item.companiesMentioned.join(', ')}</strong>
            </div>

            {item.investorsMentioned && (
              <div>
                <span className="text-[var(--color-text-tertiary)] block mb-0.5">Investors Mentioned</span>
                <strong className="text-[var(--color-text-primary)]">{item.investorsMentioned.join(', ')}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Footer with Mandatory Direct External Link */}
        <div className="p-4 sm:p-5 border-t border-[var(--color-border-subtle)] bg-black/5 dark:bg-white/5 flex items-center justify-between gap-3">
          <span className="text-xs text-[var(--color-text-secondary)]">
            Source URL: <span className="font-mono text-[11px] text-[var(--color-text-tertiary)]">{item.source.domain}</span>
          </span>

          <a
            href={item.source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-full btn-classic-primary font-bold text-xs inline-flex items-center gap-2 tap-target-44"
          >
            <span>Read on {item.source.name}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
