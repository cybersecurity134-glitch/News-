/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo } from 'react';
import { Filter, X, RotateCcw } from 'lucide-react';
import { useIntelligence } from '../../context/IntelligenceContext';
import { NewsCategory, RegionScope, FundingStage, SourceTier } from '../../types/intelligence';

export const FilterBar: React.FC = memo(() => {
  const { filters, setFilters, resetFilters } = useIntelligence();

  const categories: { id: NewsCategory; label: string }[] = [
    { id: 'all', label: 'All Intelligence' },
    { id: 'funding', label: 'Funding News' },
    { id: 'startup-launches', label: 'New Startups' },
    { id: 'investors', label: 'Investors' },
    { id: 'government-schemes', label: 'Govt Schemes' },
    { id: 'opportunities', label: 'Grants & Accelerators' },
    { id: 'events', label: 'Events' },
    { id: 'problems', label: 'Problems' },
  ];

  const regions: (RegionScope | 'all')[] = [
    'all',
    'India',
    'Telangana',
    'Karnataka',
    'Maharashtra',
    'Delhi NCR',
    'Tamil Nadu',
    'USA',
    'Global',
  ];

  const stages: (FundingStage | 'all')[] = [
    'all',
    'Pre-seed',
    'Seed',
    'Series A',
    'Series B',
    'Series C',
    'Series D+',
    'Venture Debt',
  ];

  const tiers: (SourceTier | 'all')[] = ['all', 'Tier 1', 'Tier 2', 'Tier 3'];

  const hasActiveFilters =
    filters.category !== 'all' ||
    filters.geography !== 'all' ||
    filters.stage !== 'all' ||
    filters.sourceTier !== 'all' ||
    Boolean(filters.searchQuery);

  return (
    <div className="liquid-glass-card p-4 space-y-3.5 select-none" role="region" aria-label="Intelligence Filters">
      {/* Category Pills Header */}
      <div className="flex items-center justify-between gap-2 border-b border-[var(--color-border-subtle)] pb-2.5">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 min-w-0 flex-1">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setFilters({ category: c.id })}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all tap-target-44 flex items-center ${
                filters.category === c.id
                  ? 'bg-[var(--color-primary)] text-white shadow-xs'
                  : 'bg-black/5 dark:bg-white/5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-black/10 dark:hover:bg-white/10'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-xs font-bold text-[var(--color-error)] hover:underline flex items-center gap-1 shrink-0 px-2 py-1 tap-target-44"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden xs:inline">Reset</span>
          </button>
        )}
      </div>

      {/* Secondary Dropdown Selectors */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        {/* Geography */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)] mb-1">
            Geography
          </label>
          <select
            value={filters.geography}
            onChange={(e) => setFilters({ geography: e.target.value as any })}
            className="w-full liquid-glass-input rounded-xl px-2.5 py-1.5 text-xs text-[var(--color-text-primary)] font-medium outline-none"
          >
            <option value="all" className="bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)]">All Geographies</option>
            {regions.filter((r) => r !== 'all').map((r) => (
              <option key={r} value={r} className="bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)]">
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Stage */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)] mb-1">
            Funding Stage
          </label>
          <select
            value={filters.stage}
            onChange={(e) => setFilters({ stage: e.target.value as any })}
            className="w-full liquid-glass-input rounded-xl px-2.5 py-1.5 text-xs text-[var(--color-text-primary)] font-medium outline-none"
          >
            <option value="all" className="bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)]">All Stages</option>
            {stages.filter((s) => s !== 'all').map((s) => (
              <option key={s} value={s} className="bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)]">
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Source Tier */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)] mb-1">
            Source Reliability
          </label>
          <select
            value={filters.sourceTier}
            onChange={(e) => setFilters({ sourceTier: e.target.value as any })}
            className="w-full liquid-glass-input rounded-xl px-2.5 py-1.5 text-xs text-[var(--color-text-primary)] font-medium outline-none"
          >
            <option value="all" className="bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)]">All Tiers (1, 2 & 3)</option>
            <option value="Tier 1" className="bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)]">Tier 1: Official Govt & Company</option>
            <option value="Tier 2" className="bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)]">Tier 2: Business & Tech Press</option>
            <option value="Tier 3" className="bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)]">Tier 3: Public Reports</option>
          </select>
        </div>

        {/* Recency */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-tertiary)] mb-1">
            Publication Recency
          </label>
          <select
            value={filters.dateRange}
            onChange={(e) => setFilters({ dateRange: e.target.value as any })}
            className="w-full liquid-glass-input rounded-xl px-2.5 py-1.5 text-xs text-[var(--color-text-primary)] font-medium outline-none"
          >
            <option value="all" className="bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)]">All Recorded Dates</option>
            <option value="today" className="bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)]">Breaking / Today</option>
            <option value="yesterday" className="bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)]">Past 24-48 Hours</option>
            <option value="7d" className="bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)]">Past 7 Days</option>
            <option value="30d" className="bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)]">Past 30 Days</option>
          </select>
        </div>
      </div>
    </div>
  );
});

FilterBar.displayName = 'FilterBar';
