/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo, useState } from 'react';
import { Building, MapPin, Globe, History, ChevronDown, ChevronUp, ExternalLink, CheckCircle2 } from 'lucide-react';
import { StartupEntity } from '../../types/intelligence';

interface StartupCardProps {
  startup: StartupEntity;
}

export const StartupCard: React.FC<StartupCardProps> = memo(({ startup }) => {
  const [showTimeline, setShowTimeline] = useState(false);

  return (
    <div className="liquid-glass-card p-5 space-y-4 select-none">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs text-[var(--color-text-secondary)]">
            <span className="font-extrabold uppercase text-[var(--sec-startups)] tracking-wider">
              {startup.industry}
            </span>
            <span aria-hidden="true" className="opacity-40">·</span>
            <span className="flex items-center gap-0.5 text-[var(--color-text-tertiary)]">
              <MapPin className="w-3 h-3 opacity-70" />
              {startup.city}, {startup.country}
            </span>
            {startup.foundingYear && (
              <>
                <span aria-hidden="true" className="opacity-40">·</span>
                <span className="text-[var(--color-text-tertiary)]">Est. {startup.foundingYear}</span>
              </>
            )}
          </div>

          <h3 className="font-extrabold text-xl text-[var(--color-text-primary)] font-display">
            {startup.name}
          </h3>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full badge-section-startups">
            {startup.fundingStage}
          </span>
          {startup.fundingAmountReported && (
            <span className="block text-xs font-black text-[var(--sec-funding)] mt-1">
              {startup.fundingAmountReported}
            </span>
          )}
        </div>
      </div>

      {/* Product & Problem Solved */}
      <div className="space-y-2 text-xs">
        <div>
          <span className="font-bold text-[var(--color-text-primary)] block mb-0.5">Product & Service:</span>
          <p className="text-[var(--color-text-secondary)] leading-relaxed">
            {startup.productService}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 space-y-1 border border-[var(--color-border-subtle)]">
          <span className="font-bold text-[var(--color-text-primary)] block">Problem Being Solved:</span>
          <p className="text-[var(--color-text-secondary)] leading-relaxed">
            {startup.problemSolved}
          </p>
        </div>
      </div>

      {/* Founders & Official Website */}
      <div className="pt-2 border-t border-[var(--color-border-subtle)] flex items-center justify-between text-xs text-[var(--color-text-tertiary)] flex-wrap gap-2">
        <div>
          <span className="text-[var(--color-text-secondary)]">Founders: </span>
          <strong className="text-[var(--color-text-primary)]">{startup.founders.join(', ')}</strong>
        </div>

        <a
          href={startup.officialWebsite}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-[var(--sec-startups)] hover:underline inline-flex items-center gap-1"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Official Website</span>
        </a>
      </div>

      {/* Interactive Timeline Toggle */}
      {startup.timeline.length > 0 && (
        <div className="pt-2 border-t border-[var(--color-border-subtle)]">
          <button
            onClick={() => setShowTimeline((prev) => !prev)}
            className="w-full flex items-center justify-between text-xs font-bold text-[var(--sec-startups)] hover:underline py-1"
          >
            <div className="flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" />
              <span>Verified Milestone Timeline ({startup.timeline.length} events)</span>
            </div>
            {showTimeline ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showTimeline && (
            <div className="mt-3 pl-3 border-l-2 border-[var(--sec-startups-border)] space-y-3 text-xs animate-fade-in">
              {startup.timeline.map((entry, idx) => (
                <div key={idx} className="relative">
                  <div className="flex items-center justify-between text-[11px] mb-0.5">
                    <span className="font-bold text-[var(--color-text-primary)]">{entry.date}</span>
                    <a
                      href={entry.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--sec-startups)] hover:underline inline-flex items-center gap-0.5"
                    >
                      <span>{entry.sourceName}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <p className="text-[var(--color-text-secondary)] leading-relaxed">
                    {entry.milestone}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

StartupCard.displayName = 'StartupCard';

