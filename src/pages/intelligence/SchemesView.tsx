/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo, useState } from 'react';
import { Landmark } from 'lucide-react';
import { useIntelligence } from '../../context/IntelligenceContext';
import { SchemeCard } from '../../components/intelligence/SchemeCard';

export const SchemesView: React.FC = memo(() => {
  const { governmentSchemes } = useIntelligence();
  const [activeTab, setActiveTab] = useState<'all' | 'Central' | 'Telangana' | 'Karnataka'>('all');

  const filtered = governmentSchemes.filter((sch) => {
    if (activeTab === 'Central') return sch.level === 'Central Government';
    if (activeTab === 'Telangana') return sch.state === 'Telangana';
    if (activeTab === 'Karnataka') return sch.state === 'Karnataka';
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <div className="liquid-glass-card p-4 sm:p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Landmark className="w-5 h-5 text-[var(--accent-teal)] shrink-0" />
          <h1 className="font-extrabold text-lg sm:text-xl text-[var(--text-primary)]">
            Government Startup Schemes & Grants
          </h1>
        </div>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          Central and State Government grant mechanisms, seed funds, tax exemptions, and subsidies. Every entry links directly to the official government portal.
        </p>

        {/* State / Central Tabs */}
        <div className="pt-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All Government Schemes' },
            { id: 'Central', label: 'Central Government (DPIIT / MeitY)' },
            { id: 'Telangana', label: 'Telangana (T-Fund / T-Hub)' },
            { id: 'Karnataka', label: 'Karnataka (Elevate 100)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors tap-target-44 ${
                activeTab === tab.id
                  ? 'bg-[var(--accent-teal)] text-white shadow-xs'
                  : 'bg-black/5 dark:bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
        {filtered.map((sch) => (
          <SchemeCard key={sch.id} scheme={sch} />
        ))}
      </div>
    </div>
  );
});

SchemesView.displayName = 'SchemesView';
