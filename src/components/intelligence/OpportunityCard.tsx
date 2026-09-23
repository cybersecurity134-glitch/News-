/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo } from 'react';
import { Award, Calendar, MapPin, ExternalLink } from 'lucide-react';
import { FundingOpportunity } from '../../types/intelligence';

interface OpportunityCardProps {
  opp: FundingOpportunity;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = memo(({ opp }) => {
  return (
    <div className="liquid-glass-card p-5 space-y-4 select-none">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs text-[var(--color-text-secondary)]">
            <span className="font-extrabold uppercase text-[var(--sec-grants)] tracking-wider">
              {opp.type}
            </span>
            <span aria-hidden="true" className="opacity-40">·</span>
            <span>{opp.organization}</span>
          </div>

          <h3 className="font-extrabold text-lg text-[var(--color-text-primary)] font-display">
            {opp.name}
          </h3>
        </div>

        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full badge-section-grants shrink-0">
          {opp.stage.join(', ')}
        </span>
      </div>

      <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 space-y-1 text-xs border border-[var(--color-border-subtle)]">
        <span className="font-bold text-[var(--color-text-secondary)] block">Funding & Support:</span>
        <p className="font-bold text-[var(--sec-grants)] text-sm">
          {opp.fundingSupport}
        </p>
      </div>

      <div className="pt-2 border-t border-[var(--color-border-subtle)] flex items-center justify-between text-xs text-[var(--color-text-tertiary)] flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>Deadline: <strong className="text-[var(--color-text-primary)]">{opp.deadline}</strong></span>
        </div>

        <a
          href={opp.officialApplyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-full bg-[var(--sec-grants)] hover:opacity-90 text-white font-bold inline-flex items-center gap-1.5 transition-all tap-target-44 interactive-press shadow-xs"
        >
          <span>Official Application</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
});

OpportunityCard.displayName = 'OpportunityCard';

