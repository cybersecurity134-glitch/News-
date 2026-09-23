/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo } from 'react';
import { Briefcase, ArrowRight, ExternalLink, Globe, Layers } from 'lucide-react';
import { InvestorProfile } from '../../types/intelligence';

interface InvestorCardProps {
  investor: InvestorProfile;
}

export const InvestorCard: React.FC<InvestorCardProps> = memo(({ investor }) => {
  return (
    <div className="liquid-glass-card p-5 space-y-4 select-none">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs text-[var(--color-text-secondary)]">
            <span className="font-extrabold uppercase text-[var(--sec-investors)] tracking-wider">
              {investor.type}
            </span>
            <span aria-hidden="true" className="opacity-40">·</span>
            <span className="text-[var(--color-text-tertiary)]">{investor.geography}</span>
          </div>

          <h3 className="font-extrabold text-xl text-[var(--color-text-primary)] font-display">
            {investor.name}
          </h3>
        </div>

        {investor.announcedFundSize && (
          <div className="text-right shrink-0">
            <span className="text-xs text-[var(--color-text-tertiary)] block">Announced Fund</span>
            <span className="font-black text-xs text-[var(--sec-funding)]">
              {investor.announcedFundSize}
            </span>
          </div>
        )}
      </div>

      {/* Target Stages & Sectors */}
      <div className="space-y-2 text-xs">
        <div>
          <span className="text-[var(--color-text-secondary)] font-semibold">Active Stages: </span>
          <span className="font-bold text-[var(--color-text-primary)]">
            {investor.fundingStages.join(', ')}
          </span>
        </div>

        <div>
          <span className="text-[var(--color-text-secondary)] font-semibold">Sectors: </span>
          <span className="font-medium text-[var(--color-text-secondary)]">
            {investor.preferredSectors.join(' · ')}
          </span>
        </div>
      </div>

      {/* "Who is Investing in What?" Structured Flow */}
      <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 space-y-2.5 border border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-1.5 text-xs font-extrabold text-[var(--color-text-primary)] uppercase tracking-wider">
          <Layers className="w-3.5 h-3.5 text-[var(--sec-investors)]" />
          <span>Who is Investing in What? (Recent Portfolio Checks)</span>
        </div>

        <div className="space-y-2 text-xs">
          {investor.recentInvestments.map((inv, idx) => (
            <div key={idx} className="p-2.5 rounded-xl bg-white/40 dark:bg-white/5 border border-[var(--color-border-subtle)] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <strong className="text-[var(--color-text-primary)]">{inv.startup}</strong>
                <ArrowRight className="w-3 h-3 text-[var(--color-text-tertiary)]" />
                <span className="font-semibold text-[var(--sec-investors)]">{inv.sector}</span>
                <span className="text-[11px] px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[var(--color-text-secondary)]">
                  {inv.round}
                </span>
                <strong className="text-[var(--sec-funding)]">{inv.amount}</strong>
              </div>

              <a
                href={inv.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-semibold text-[var(--sec-investors)] hover:underline inline-flex items-center gap-0.5"
              >
                <span>{inv.sourceName}</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Official Website */}
      <div className="pt-2 border-t border-[var(--color-border-subtle)] flex items-center justify-between text-xs text-[var(--color-text-tertiary)]">
        <span>Verified via {investor.source.name}</span>
        <a
          href={investor.officialWebsite}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-[var(--sec-investors)] hover:underline inline-flex items-center gap-1"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Official Portal</span>
        </a>
      </div>
    </div>
  );
});

InvestorCard.displayName = 'InvestorCard';

