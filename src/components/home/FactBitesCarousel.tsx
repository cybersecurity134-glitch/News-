/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo } from 'react';
import { Lightbulb, ChevronRight, Share2 } from 'lucide-react';
import { CurrentAffairsFact } from '../../types/news';

interface FactBitesCarouselProps {
  facts: CurrentAffairsFact[];
  onOpenFactModal?: (fact: CurrentAffairsFact) => void;
}

export const FactBitesCarousel: React.FC<FactBitesCarouselProps> = memo(({
  facts,
  onOpenFactModal,
}) => {
  const getImportanceColor = (imp: CurrentAffairsFact['importance']) => {
    switch (imp) {
      case 'Crucial':
        return 'text-[var(--accent-coral)] bg-[var(--accent-coral)]/10';
      case 'Essential':
        return 'text-[var(--accent-indigo)] bg-[var(--accent-indigo)]/10';
      default:
        return 'text-[var(--accent-teal)] bg-[var(--accent-teal)]/10';
    }
  };

  return (
    <section className="w-full space-y-3" aria-label="Daily Current Affairs Fact Capsules">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-500">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-[var(--text-primary)] tracking-tight">
              Verified Fact Bites
            </h3>
            <p className="text-[11px] text-[var(--text-secondary)]">
              Curated one-liners for competitive exams & professional briefings
            </p>
          </div>
        </div>
      </div>

      {/* Horizontal smooth snap list */}
      <div className="flex gap-3.5 overflow-x-auto pb-2 pt-1 px-1 no-scrollbar snap-x snap-mandatory">
        {facts.map((fact) => (
          <div
            key={fact.id}
            onClick={() => onOpenFactModal?.(fact)}
            className="liquid-glass-card min-w-[270px] sm:min-w-[310px] max-w-[320px] p-4 flex flex-col justify-between snap-start shrink-0 cursor-pointer interactive-press"
          >
            <div>
              {/* Unboxed Metadata (Zero-Pill Compliance) */}
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-extrabold text-[var(--accent-primary)] uppercase text-[10px] tracking-wider">
                  {fact.category.replace('-', ' ')}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getImportanceColor(
                    fact.importance
                  )}`}
                >
                  {fact.importance}
                </span>
              </div>

              <h4 className="font-bold text-sm text-[var(--text-primary)] leading-snug line-clamp-2 mb-2">
                {fact.headline}
              </h4>

              <p className="text-xs text-[var(--text-secondary)] line-clamp-3 leading-relaxed">
                {fact.context}
              </p>
            </div>

            <div className="pt-3 mt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-tertiary)]">
              <span>{fact.source}</span>
              <span className="font-medium">{fact.date}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
});

FactBitesCarousel.displayName = 'FactBitesCarousel';
