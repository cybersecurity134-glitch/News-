/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useIntelligence } from '../../context/IntelligenceContext';
import { ProblemCard } from '../../components/intelligence/ProblemCard';

export const ProblemsView: React.FC = memo(() => {
  const { problems } = useIntelligence();

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <div className="liquid-glass-card p-4 sm:p-6 space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
          <h1 className="font-extrabold text-lg sm:text-xl text-[var(--text-primary)]">
            Startup Problems Reported in the News
          </h1>
        </div>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          Documented challenges, cash-flow squeezes, GPU compute costs, and regulatory bottlenecks reported in verified publications.
        </p>

        <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 text-xs text-[var(--text-secondary)]">
          <strong className="text-[var(--text-primary)]">Strict Anti-Mixing Rule: </strong>
          Solutions reported by actual news sources are explicitly labeled <em>"Solution reported by source"</em>. Suggestions created by generative AI are demarcated as <em>"AI-generated suggestion — not reported as news"</em>.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
        {problems.map((p) => (
          <ProblemCard key={p.id} problem={p} />
        ))}
      </div>
    </div>
  );
});

ProblemsView.displayName = 'ProblemsView';
