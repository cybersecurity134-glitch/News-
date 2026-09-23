/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Category } from '../../types/models';
import { getCategoryStyle } from './CategoryTag';

interface FilterBarProps {
  selectedCategory: Category | 'all';
  onSelectCategory: (category: Category | 'all') => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

interface ChipItem {
  id: Category | 'all';
  label: string;
}

const CATEGORY_CHIPS: ChipItem[] = [
  { id: 'all', label: 'All' },
  { id: 'new-startups', label: 'Startups' },
  { id: 'new-schemes', label: 'Schemes' },
  { id: 'funding-routes', label: 'Funding' },
  { id: 'investor-activity', label: 'Investors' },
  { id: 'startup-events', label: 'Events' },
  { id: 'emerging-problems', label: 'Fixes' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="w-full">
      {/* Horizontal category chips: All, Startups, Schemes, Funding, Investors, Events, Fixes */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth">
        {CATEGORY_CHIPS.map((chip) => {
          const isActive =
            selectedCategory === chip.id ||
            (chip.id === 'new-startups' && selectedCategory === ('new-startup' as any)) ||
            (chip.id === 'new-schemes' && selectedCategory === ('scheme' as any)) ||
            (chip.id === 'funding-routes' && selectedCategory === ('funding-route' as any)) ||
            (chip.id === 'startup-events' && selectedCategory === ('event' as any)) ||
            (chip.id === 'emerging-problems' && selectedCategory === ('emerging-problem' as any));

          if (chip.id === 'all') {
            return (
              <button
                key={chip.id}
                onClick={() => onSelectCategory('all')}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                  isActive
                    ? 'bg-[var(--color-accent)] text-[#0B1F3A] border-[var(--color-accent)] shadow-xs'
                    : 'bg-[var(--color-card-bg)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border-[var(--color-border)]'
                }`}
              >
                All
              </button>
            );
          }

          const style = getCategoryStyle(chip.label);

          return (
            <button
              key={chip.id}
              onClick={() => onSelectCategory(chip.id as Category)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                isActive
                  ? 'border-transparent shadow-xs'
                  : 'bg-[var(--color-card-bg)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border-[var(--color-border)]'
              }`}
              style={
                isActive
                  ? {
                      color: style.colorVar,
                      backgroundColor: style.bgVar,
                      borderColor: 'currentColor',
                    }
                  : undefined
              }
            >
              {chip.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
