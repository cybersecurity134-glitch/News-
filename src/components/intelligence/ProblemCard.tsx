/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo } from 'react';
import { AlertCircle, CheckCircle2, Sparkles, ExternalLink, ShieldAlert } from 'lucide-react';
import { ReportedProblem } from '../../types/intelligence';

interface ProblemCardProps {
  problem: ReportedProblem;
}

export const ProblemCard: React.FC<ProblemCardProps> = memo(({ problem }) => {
  return (
    <div className="liquid-glass-card card-accent-top-problems p-5 space-y-4 select-none">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs text-[var(--color-text-secondary)]">
            <span className="font-extrabold uppercase text-[var(--sec-problems)] tracking-wider">
              {problem.category}
            </span>
            <span aria-hidden="true" className="opacity-40">·</span>
            <span>{problem.sector}</span>
            <span aria-hidden="true" className="opacity-40">·</span>
            <span className="text-[var(--color-text-tertiary)]">{problem.geography}</span>
          </div>

          <h3 className="font-extrabold text-lg text-[var(--color-text-primary)] font-display">
            {problem.problemTitle}
          </h3>
        </div>

        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full badge-error shrink-0">
          Reported Problem
        </span>
      </div>

      <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] leading-relaxed">
        {problem.problemDescription}
      </p>

      {/* Startups Affected */}
      <div className="text-xs text-[var(--color-text-tertiary)]">
        <span>Impacted Cohort: </span>
        <strong className="text-[var(--color-text-secondary)]">{problem.startupsAffected.join(', ')}</strong>
      </div>

      {/* Strict Separation of Solutions (Rule #16) */}
      <div className="space-y-3 pt-2 border-t border-[var(--color-border-subtle)]">
        {/* Solution 1: Source-Reported Solution */}
        {problem.sourceReportedSolution && (
          <div className="p-3.5 rounded-2xl bg-[var(--color-success-bg)] border border-[var(--color-success-border)] space-y-1 text-xs">
            <div className="flex items-center gap-1.5 text-[var(--color-success)] font-extrabold text-[11px] uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Solution Reported by Source</span>
            </div>
            <p className="text-[var(--color-text-primary)] font-medium leading-relaxed">
              {problem.sourceReportedSolution}
            </p>
          </div>
        )}

        {/* Solution 2: AI-Generated Suggestion - Explicitly Labeled */}
        {problem.aiSuggestedSolution && (
          <div className="p-3.5 rounded-2xl bg-[var(--color-primary-subtle)] border border-[var(--color-primary-border)] space-y-1 text-xs">
            <div className="flex items-center gap-1.5 text-[var(--color-primary)] font-extrabold text-[11px] uppercase tracking-wider">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>AI-Generated Suggestion — Not Reported as News</span>
            </div>
            <p className="text-[var(--color-text-secondary)] leading-relaxed italic">
              {problem.aiSuggestedSolution}
            </p>
          </div>
        )}
      </div>

      {/* Source Verification Link */}
      <div className="pt-2 border-t border-[var(--color-border-subtle)] flex items-center justify-between text-xs text-[var(--color-text-tertiary)]">
        <span>Documented by: <strong>{problem.source.name}</strong> ({problem.reportedDate})</span>

        <a
          href={problem.source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-[var(--sec-problems)] hover:underline inline-flex items-center gap-1"
        >
          <span>View Source Report</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
});

ProblemCard.displayName = 'ProblemCard';

