/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo } from 'react';
import { DollarSign, UserCheck, Users, MapPin, Calendar, ExternalLink } from 'lucide-react';
import { FundingEvent } from '../../types/intelligence';

interface FundingCardProps {
  event: FundingEvent;
}

export const FundingCard: React.FC<FundingCardProps> = memo(({ event }) => {
  return (
    <div className="liquid-glass-card card-accent-top-funding p-5 space-y-4 select-none">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs text-[var(--color-text-secondary)]">
            <span className="font-extrabold uppercase text-[var(--sec-funding)] tracking-wider">
              {event.sector}
            </span>
            <span aria-hidden="true" className="opacity-40">·</span>
            <span className="flex items-center gap-0.5 text-[var(--color-text-tertiary)]">
              <MapPin className="w-3 h-3 opacity-70" />
              {event.location}
            </span>
          </div>
          <h3 className="font-extrabold text-lg text-[var(--color-text-primary)] font-display">
            {event.startupName}
          </h3>
        </div>

        {/* Amount & Round highlight */}
        <div className="text-right shrink-0">
          <span className="text-lg sm:text-xl font-black text-[var(--sec-funding)] block tabular-nums">
            {event.amount}
          </span>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full badge-section-funding">
            {event.round}
          </span>
        </div>
      </div>

      {/* Structured Investor Details */}
      <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 space-y-2 text-xs border border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-[var(--sec-funding)] shrink-0" />
          <span className="text-[var(--color-text-secondary)]">Lead Investor:</span>
          <strong className="text-[var(--color-text-primary)]">{event.leadInvestor}</strong>
        </div>

        <div className="flex items-start gap-2">
          <Users className="w-4 h-4 text-[var(--color-text-tertiary)] shrink-0 mt-0.5" />
          <span className="text-[var(--color-text-secondary)]">Participating:</span>
          <span className="text-[var(--color-text-primary)] font-medium">
            {event.allInvestors.join(', ')}
          </span>
        </div>

        {event.intendedUseReported && (
          <p className="text-[11px] text-[var(--color-text-secondary)] pt-1.5 border-t border-[var(--color-border-subtle)] italic">
            <strong>Use of proceeds:</strong> "{event.intendedUseReported}"
          </p>
        )}
      </div>

      {/* Source & Verification Footer */}
      <div className="pt-2 border-t border-[var(--color-border-subtle)] flex items-center justify-between text-xs text-[var(--color-text-tertiary)]">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3 h-3" />
          <span>Reported: {event.date} via {event.source.name}</span>
        </div>

        <a
          href={event.source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-[var(--sec-funding)] hover:underline inline-flex items-center gap-1"
        >
          <span>View Source</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
});

FundingCard.displayName = 'FundingCard';

