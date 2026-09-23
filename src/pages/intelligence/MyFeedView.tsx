/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo } from 'react';
import { Sparkles, SlidersHorizontal, MapPin, Briefcase } from 'lucide-react';
import { useIntelligence } from '../../context/IntelligenceContext';
import { NewsEventCard } from '../../components/intelligence/NewsEventCard';
import { NewsEventItem } from '../../types/intelligence';

interface MyFeedViewProps {
  onOpenArticle: (item: NewsEventItem) => void;
  onOpenPreferences: () => void;
}

export const MyFeedView: React.FC<MyFeedViewProps> = memo(({
  onOpenArticle,
  onOpenPreferences,
}) => {
  const { personalizedFeed, userPreferences } = useIntelligence();

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Personalized Header Banner */}
      <div className="liquid-glass-card p-4 sm:p-6 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[var(--accent-primary)] shrink-0" />
            <h1 className="font-extrabold text-lg sm:text-xl text-[var(--text-primary)]">
              Your Personalized Intelligence Feed
            </h1>
          </div>

          <button
            onClick={onOpenPreferences}
            className="px-3.5 py-1.5 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 text-xs font-bold text-[var(--accent-primary)] flex items-center gap-1.5 transition-colors tap-target-44 interactive-press"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Tune Preferences</span>
          </button>
        </div>

        {/* Current Filter Criteria */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)]">
          <span className="flex items-center gap-1 font-semibold text-[var(--text-primary)]">
            <MapPin className="w-3.5 h-3.5 text-[var(--accent-coral)]" />
            {userPreferences.city}, {userPreferences.state}
          </span>
          <span aria-hidden="true" className="opacity-50">·</span>
          <span className="flex items-center gap-1 font-semibold text-[var(--text-primary)]">
            <Briefcase className="w-3.5 h-3.5 text-[var(--accent-teal)]" />
            {userPreferences.industry} ({userPreferences.startupStage})
          </span>
          <span aria-hidden="true" className="opacity-50">·</span>
          <span>Target: {userPreferences.fundingRequirement}</span>
        </div>

        <p className="text-xs text-[var(--text-secondary)] leading-relaxed pt-1 border-t border-[var(--border-subtle)]">
          Rule #29 Transparency: Every item below specifies exactly why it was surfaced. No speculative or artificial filler content is ever generated.
        </p>
      </div>

      {/* Feed Cards with "Why am I seeing this?" */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
        {personalizedFeed.map(({ item, reason }) => (
          <NewsEventCard
            key={item.id}
            item={item}
            onOpenItem={onOpenArticle}
            reason={reason}
          />
        ))}
      </div>
    </div>
  );
});

MyFeedView.displayName = 'MyFeedView';
