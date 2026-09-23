/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo } from 'react';
import { ExternalLink, CheckCircle2, AlertTriangle, ShieldCheck, Layers } from 'lucide-react';
import { SourceMeta, VerificationStatus } from '../../types/intelligence';

interface SourceTransparencyBadgeProps {
  source: SourceMeta;
  additionalSources?: SourceMeta[];
  verificationStatus: VerificationStatus;
  conflictNotes?: string;
  className?: string;
}

export const SourceTransparencyBadge: React.FC<SourceTransparencyBadgeProps> = memo(({
  source,
  additionalSources = [],
  verificationStatus,
  conflictNotes,
  className = '',
}) => {
  const totalCoverage = 1 + additionalSources.length;

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'Tier 1':
        return 'text-[var(--color-info)] bg-[var(--color-info-bg)] border-[var(--color-info-border)]';
      case 'Tier 2':
        return 'text-[var(--color-primary)] bg-[var(--color-primary-subtle)] border-[var(--color-primary-border)]';
      default:
        return 'text-[var(--color-text-secondary)] bg-black/5 dark:bg-white/5 border-[var(--color-border)]';
    }
  };

  const getVerificationIcon = () => {
    if (verificationStatus === 'Verified by multiple sources') {
      return <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-success)] shrink-0" />;
    }
    if (verificationStatus === 'Conflicting reports') {
      return <AlertTriangle className="w-3.5 h-3.5 text-[var(--color-warning)] shrink-0" />;
    }
    return <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-text-tertiary)] shrink-0" />;
  };

  return (
    <div className={`p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--color-border-subtle)] space-y-2.5 text-xs ${className}`}>
      {/* Top Source Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Source Name & Domain */}
          <span className="font-extrabold text-[var(--color-text-primary)]">
            {source.name}
          </span>
          <span className="text-[11px] text-[var(--color-text-tertiary)] font-mono">
            ({source.domain})
          </span>

          {/* Source Tier Badge */}
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${getTierBadge(source.tier)}`}>
            {source.tier}
          </span>

          {/* Multi-source coverage badge */}
          {totalCoverage > 1 && (
            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-[var(--color-primary-subtle)] text-[var(--color-primary)] border border-[var(--color-primary-border)] flex items-center gap-1">
              <Layers className="w-3 h-3" />
              <span>Coverage: {totalCoverage} sources</span>
            </span>
          )}
        </div>

        {/* Verification Status */}
        <div className="flex items-center gap-1 text-[11px] font-semibold text-[var(--color-text-secondary)]">
          {getVerificationIcon()}
          <span>{verificationStatus}</span>
        </div>
      </div>

      {/* Conflicting reports disclaimer */}
      {verificationStatus === 'Conflicting reports' && conflictNotes && (
        <div className="p-2.5 rounded-xl bg-[var(--color-warning-bg)] border border-[var(--color-warning-border)] text-[var(--color-warning)] text-[11px] font-medium leading-relaxed">
          <strong>Conflicting reports:</strong> {conflictNotes}
        </div>
      )}

      {/* Additional Sources List (if grouped duplicate) */}
      {additionalSources.length > 0 && (
        <div className="pt-2 border-t border-[var(--color-border-subtle)] flex flex-wrap items-center gap-2 text-[11px] text-[var(--color-text-tertiary)]">
          <span className="font-medium text-[var(--color-text-secondary)]">Also reported by:</span>
          {additionalSources.map((addSrc, idx) => (
            <a
              key={idx}
              href={addSrc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[var(--color-primary)] hover:underline inline-flex items-center gap-0.5"
            >
              <span>{addSrc.name}</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          ))}
        </div>
      )}

      {/* Verification timestamps & Mandatory "View Original Source" Button */}
      <div className="pt-2 border-t border-[var(--color-border-subtle)] flex items-center justify-between gap-3 text-[11px] text-[var(--color-text-tertiary)] flex-wrap">
        <span>Verified: {source.verifiedAt ? new Date(source.verifiedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Real-time'}</span>

        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="px-3.5 py-1.5 rounded-full btn-classic-primary text-xs flex items-center gap-1.5 tap-target-44"
        >
          <span>View Original Source</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
});

SourceTransparencyBadge.displayName = 'SourceTransparencyBadge';

