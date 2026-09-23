/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo, useState, useMemo } from 'react';
import { Rocket, Search } from 'lucide-react';
import { useIntelligence } from '../../context/IntelligenceContext';
import { StartupCard } from '../../components/intelligence/StartupCard';

export const StartupsView: React.FC = memo(() => {
  const { startups } = useIntelligence();
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');

  const filteredStartups = useMemo(() => {
    return startups.filter((s) => {
      if (selectedIndustry !== 'all' && s.industry !== selectedIndustry) return false;
      if (filterQuery.trim()) {
        const q = filterQuery.toLowerCase();
        return (
          s.name.toLowerCase().includes(q) ||
          s.founders.some((f) => f.toLowerCase().includes(q)) ||
          s.problemSolved.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [startups, selectedIndustry, filterQuery]);

  const industries = useMemo(() => {
    return ['all', ...Array.from(new Set(startups.map((s) => s.industry)))];
  }, [startups]);

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <div className="liquid-glass-card p-4 sm:p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Rocket className="w-5 h-5 text-[var(--accent-primary)] shrink-0" />
          <h1 className="font-extrabold text-lg sm:text-xl text-[var(--text-primary)]">
            Verified Startup Discovery
          </h1>
        </div>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          Newly reported startups uncovered through verified external company filings and primary reports. Complete with verified milestone timelines and problems addressed.
        </p>

        {/* Local Filter Bar */}
        <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter by startup name, founder, or problem..."
              className="w-full pl-9 pr-3 py-2 rounded-xl liquid-glass-input text-xs text-[var(--text-primary)] outline-none"
            />
          </div>

          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="liquid-glass-input rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] outline-none w-full sm:w-auto"
          >
            {industries.map((ind) => (
              <option key={ind} value={ind} className="bg-[var(--bg-card)]">
                {ind === 'all' ? 'All Industries' : ind}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
        {filteredStartups.map((s) => (
          <StartupCard key={s.id} startup={s} />
        ))}
      </div>
    </div>
  );
});

StartupsView.displayName = 'StartupsView';
