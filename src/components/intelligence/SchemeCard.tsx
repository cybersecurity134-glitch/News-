/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo } from 'react';
import { Landmark, CheckCircle2, Calendar, ExternalLink } from 'lucide-react';
import { GovernmentScheme } from '../../types/intelligence';

interface SchemeCardProps {
  scheme: GovernmentScheme;
}

export const SchemeCard: React.FC<SchemeCardProps> = memo(({ scheme }) => {
  return (
    <div className="liquid-glass-card card-accent-top-schemes p-5 space-y-4 select-none">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs text-[var(--color-text-secondary)]">
            <span className="font-extrabold uppercase text-[var(--sec-schemes)] tracking-wider">
              {scheme.level} {scheme.state ? `· ${scheme.state}` : ''}
            </span>
            <span aria-hidden="true" className="opacity-40">·</span>
            <span>{scheme.supportType}</span>
          </div>

          <h3 className="font-extrabold text-lg text-[var(--color-text-primary)] font-display">
            {scheme.name}
          </h3>

          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            {scheme.ministryOrDepartment}
          </p>
        </div>

        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full badge-section-schemes shrink-0">
          Official Govt Portal
        </span>
      </div>

      {/* Support Amount Highlight */}
      <div className="p-3.5 rounded-2xl bg-[var(--sec-schemes-subtle)] border border-[var(--sec-schemes-border)]">
        <span className="text-[11px] font-bold text-[var(--sec-schemes)] uppercase tracking-wider block mb-0.5">
          Reported Financial & Policy Support
        </span>
        <p className="text-xs sm:text-sm font-bold text-[var(--color-text-primary)]">
          {scheme.supportAmountReported}
        </p>
      </div>

      {/* Eligibility Points */}
      <div className="space-y-1.5 text-xs">
        <span className="font-bold text-[var(--color-text-primary)] block">Eligibility Requirements:</span>
        <ul className="space-y-1">
          {scheme.eligibility.map((point, idx) => (
            <li key={idx} className="flex items-start gap-2 text-[var(--color-text-secondary)]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-success)] shrink-0 mt-0.5" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Deadline & Official Government Apply Link */}
      <div className="pt-2 border-t border-[var(--color-border-subtle)] flex items-center justify-between text-xs text-[var(--color-text-tertiary)] flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>Deadline: <strong className="text-[var(--color-text-primary)]">{scheme.applicationDeadline}</strong></span>
        </div>

        <a
          href={scheme.officialPortalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-full bg-[var(--sec-schemes)] hover:opacity-90 text-white font-bold inline-flex items-center gap-1.5 transition-all tap-target-44 interactive-press shadow-xs"
        >
          <span>Apply on Official Portal</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
});

SchemeCard.displayName = 'SchemeCard';

