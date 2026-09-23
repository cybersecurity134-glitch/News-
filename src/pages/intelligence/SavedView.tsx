/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo, useMemo } from 'react';
import { Bookmark, ShieldCheck } from 'lucide-react';
import { useIntelligence } from '../../context/IntelligenceContext';
import { NewsEventCard } from '../../components/intelligence/NewsEventCard';
import { NewsEventItem } from '../../types/intelligence';

interface SavedViewProps {
  onOpenArticle: (item: NewsEventItem) => void;
}

export const SavedView: React.FC<SavedViewProps> = memo(({ onOpenArticle }) => {
  const { newsEvents, savedItemIds } = useIntelligence();

  const savedNews = useMemo(() => {
    return newsEvents.filter((n) => savedItemIds.includes(n.id));
  }, [newsEvents, savedItemIds]);

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <div className="liquid-glass-card p-4 sm:p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-[var(--accent-primary)] shrink-0" />
          <h1 className="font-extrabold text-lg sm:text-xl text-[var(--text-primary)]">
            Saved Intelligence Vault ({savedNews.length})
          </h1>
        </div>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          Stored locally on your device for offline reference. All verification badges, source citations, and direct external links are preserved.
        </p>
      </div>

      {savedNews.length === 0 ? (
        <div className="liquid-glass-card p-8 sm:p-12 text-center space-y-2">
          <Bookmark className="w-8 h-8 text-[var(--text-tertiary)] mx-auto opacity-50" />
          <p className="font-bold text-base text-[var(--text-primary)]">
            No saved intelligence reports yet.
          </p>
          <p className="text-xs text-[var(--text-secondary)]">
            Tap the bookmark icon on any funding event, policy notification, or startup report to pin it here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {savedNews.map((n) => (
            <NewsEventCard key={n.id} item={n} onOpenItem={onOpenArticle} />
          ))}
        </div>
      )}
    </div>
  );
});

SavedView.displayName = 'SavedView';
