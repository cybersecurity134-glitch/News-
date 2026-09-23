/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo, useState, useMemo } from 'react';
import { DollarSign, Search } from 'lucide-react';
import { useIntelligence } from '../../context/IntelligenceContext';
import { FundingCard } from '../../components/intelligence/FundingCard';

export const FundingView: React.FC = memo(() => {
  const { fundingEvents } = useIntelligence();
  const [selectedRound, setSelectedRound] = useState('all');

  const rounds = useMemo(
    () => ['all', 'Pre-seed', 'Seed', 'Series A', 'Series B', 'Series C', 'Series D+', 'Venture Debt'],
    []
  );

  const filtered = useMemo(() => {
    return fundingEvents.filter((fe) => {
      if (selectedRound !== 'all' && fe.round !== selectedRound) return false;
      return true;
    });
  }, [fundingEvents, selectedRound]);

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <div className="liquid-glass-card p-4 sm:p-6 space-y-3">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-[var(--accent-emerald)] shrink-0" />
          <h1 className="font-extrabold text-lg sm:text-xl text-[var(--text-primary)]">
            Startup Funding Intelligence
          </h1>
        </div>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          Verified equity and debt financing rounds, investor syndicates, and disclosed deployment plans. Strictly zero estimated or extrapolated valuations.
        </p>

        {/* Round Filter Tabs */}
        <div className="pt-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {rounds.map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRound(r)}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors tap-target-44 ${
                selectedRound === r
                  ? 'bg-[var(--accent-emerald)] text-white shadow-xs'
                  : 'bg-black/5 dark:bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {r === 'all' ? 'All Rounds' : r}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
        {filtered.map((fe) => (
          <FundingCard key={fe.id} event={fe} />
        ))}
      </div>
    </div>
  );
});

FundingView.displayName = 'FundingView';
