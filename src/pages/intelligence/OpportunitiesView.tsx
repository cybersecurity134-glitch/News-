/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo } from 'react';
import { Award } from 'lucide-react';
import { useIntelligence } from '../../context/IntelligenceContext';
import { OpportunityCard } from '../../components/intelligence/OpportunityCard';

export const OpportunitiesView: React.FC = memo(() => {
  const { opportunities } = useIntelligence();

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <div className="liquid-glass-card p-4 sm:p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-[var(--accent-primary)] shrink-0" />
          <h1 className="font-extrabold text-lg sm:text-xl text-[var(--text-primary)]">
            Verified Funding Opportunities & Accelerators
          </h1>
        </div>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          Active equity-free grants, accelerator cohorts (Google, Y Combinator), corporate cloud credits, and innovation competitions. Never displaying expired programs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
        {opportunities.map((opp) => (
          <OpportunityCard key={opp.id} opp={opp} />
        ))}
      </div>
    </div>
  );
});

OpportunitiesView.displayName = 'OpportunitiesView';
