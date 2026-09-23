/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo } from 'react';
import { Briefcase } from 'lucide-react';
import { useIntelligence } from '../../context/IntelligenceContext';
import { InvestorCard } from '../../components/intelligence/InvestorCard';

export const InvestorsView: React.FC = memo(() => {
  const { investors } = useIntelligence();

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <div className="liquid-glass-card p-4 sm:p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-[var(--accent-primary)] shrink-0" />
          <h1 className="font-extrabold text-lg sm:text-xl text-[var(--text-primary)]">
            Investor Intelligence & Active Checks
          </h1>
        </div>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          Who is investing in what? Real-world verified investor portfolios, fund vehicles, and check sizes compiled from press releases and regulatory disclosures.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {investors.map((inv) => (
          <InvestorCard key={inv.id} investor={inv} />
        ))}
      </div>
    </div>
  );
});

InvestorsView.displayName = 'InvestorsView';
