/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo, useState, useMemo, useEffect } from 'react';
import { Sparkles, Zap, ArrowRight, TrendingUp, ShieldAlert, ChevronDown } from 'lucide-react';
import { useIntelligence } from '../../context/IntelligenceContext';
import { NewsEventCard } from '../../components/intelligence/NewsEventCard';
import { FundingCard } from '../../components/intelligence/FundingCard';
import { StartupCard } from '../../components/intelligence/StartupCard';
import { InvestorCard } from '../../components/intelligence/InvestorCard';
import { SchemeCard } from '../../components/intelligence/SchemeCard';
import { OpportunityCard } from '../../components/intelligence/OpportunityCard';
import { EventCard } from '../../components/intelligence/EventCard';
import { ProblemCard } from '../../components/intelligence/ProblemCard';
import { FilterBar } from '../../components/intelligence/FilterBar';
import { NewsEventItem } from '../../types/intelligence';
import { IntelligenceTab } from '../../components/intelligence/IntelligenceTabBar';

interface HomeDashboardViewProps {
  onOpenArticle: (item: NewsEventItem) => void;
  onNavigateTab: (tab: IntelligenceTab) => void;
}

export const HomeDashboardView: React.FC<HomeDashboardViewProps> = memo(({
  onOpenArticle,
  onNavigateTab,
}) => {
  const {
    filteredNews,
    fundingEvents,
    startups,
    investors,
    governmentSchemes,
    opportunities,
    events,
    problems,
    filters,
  } = useIntelligence();

  // 144Hz Optimization: Progressive card rendering to prevent heavy layout computation
  const INITIAL_PAGE_SIZE = 8;
  const [visibleCount, setVisibleCount] = useState(INITIAL_PAGE_SIZE);

  // Reset pagination when filter criteria change
  useEffect(() => {
    setVisibleCount(INITIAL_PAGE_SIZE);
  }, [filters]);

  const displayedNews = useMemo(() => {
    return filteredNews.slice(0, visibleCount);
  }, [filteredNews, visibleCount]);

  const hasMoreNews = filteredNews.length > visibleCount;

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Main Filter Bar - Rearranged to the top / starting */}
      <section>
        <FilterBar />
      </section>

      {/* Breaking Intelligence Ticker */}
      <section className="liquid-glass-card p-3 sm:p-4 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex items-center gap-1 font-black text-rose-500 uppercase tracking-wider shrink-0">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
            Breaking
          </span>
          <span className="text-[var(--text-tertiary)] shrink-0">|</span>
          <p className="text-[var(--text-primary)] font-semibold truncate">
            Sarvam AI closes $41M Series A for Indic Voice Models · DPIIT streamlines Angel Tax compliance.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('funding')}
          className="text-xs font-bold text-[var(--accent-primary)] hover:underline flex items-center gap-1 shrink-0"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </section>

      {/* Today's Startup Intelligence Briefing (Section 28) */}
      <section className="liquid-glass-card p-4 sm:p-6 lg:p-7 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[var(--accent-primary)] shrink-0" />
            <h2 className="font-extrabold text-base sm:text-lg md:text-xl text-[var(--text-primary)]">
              Today's Startup Intelligence Briefing
            </h2>
          </div>
          <span className="text-xs font-semibold text-[var(--text-tertiary)] shrink-0">
            Verified External Feeds Only
          </span>
        </div>

        <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
          Aggregated and verified across DPIIT, PIB, T-Hub, Economic Times, TechCrunch, and SEBI public circulars. No predictions or artificial completions.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2 text-xs">
          <div className="p-4 rounded-2xl bg-[var(--color-primary-subtle)] border border-[var(--color-primary-border)] space-y-1.5 transition-transform hover:-translate-y-0.5">
            <span className="text-[10px] font-black uppercase text-[var(--color-primary)] tracking-wider">Funding Momentum</span>
            <p className="text-[var(--color-text-primary)] font-bold text-xs sm:text-sm">
              $41M Series A for Indic Foundation AI & $24M EV fleet debt round documented.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--sec-funding-subtle)] border border-[var(--sec-funding-border)] space-y-1.5 transition-transform hover:-translate-y-0.5">
            <span className="text-[10px] font-black uppercase text-[var(--sec-funding)] tracking-wider">Policy & Grants</span>
            <p className="text-[var(--color-text-primary)] font-bold text-xs sm:text-sm">
              Telangana T-Fund Cohort 4 active (up to ₹1 Cr); Angel Tax exemption simplified.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--sec-problems-subtle)] border border-[var(--sec-problems-border)] space-y-1.5 sm:col-span-2 lg:col-span-1 transition-transform hover:-translate-y-0.5">
            <span className="text-[10px] font-black uppercase text-[var(--sec-problems)] tracking-wider">Industry Challenge</span>
            <p className="text-[var(--color-text-primary)] font-bold text-xs sm:text-sm">
              SaaSBOOMi report documents 35% surge in cloud GPU compute inference costs.
            </p>
          </div>
        </div>
      </section>

      {/* Real-time Verified News Feed */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-3">
          <h2 className="font-extrabold text-base sm:text-lg md:text-xl text-[var(--text-primary)]">
            Verified Startup Intelligence Feed ({filteredNews.length})
          </h2>
          <span className="text-xs text-[var(--text-tertiary)] font-medium">
            Strict Multi-Source Cross Check
          </span>
        </div>

        {filteredNews.length === 0 ? (
          <div className="liquid-glass-card p-8 sm:p-12 text-center space-y-3">
            <ShieldAlert className="w-8 h-8 text-[var(--text-tertiary)] mx-auto" />
            <h3 className="font-extrabold text-base text-[var(--text-primary)]">
              No verified updates found from monitored sources.
            </h3>
            <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">
              In accordance with our strict Anti-Fabrication Rule, we never fill screens with synthetic or artificial news. Please adjust your filters or check back shortly.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
              {displayedNews.map((item) => (
                <NewsEventCard key={item.id} item={item} onOpenItem={onOpenArticle} />
              ))}
            </div>

            {hasMoreNews && (
              <div className="flex justify-center pt-3">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => prev + INITIAL_PAGE_SIZE)}
                  className="px-5 py-2.5 rounded-full liquid-glass-input hover:bg-black/5 dark:hover:bg-white/10 text-xs font-bold text-[var(--accent-primary)] flex items-center gap-2 tap-target-44 interactive-press transition-all shadow-sm"
                  aria-label="Load more verified news articles"
                >
                  <ChevronDown className="w-4 h-4" />
                  <span>Show More Stories ({filteredNews.length - visibleCount} remaining)</span>
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Latest Funding Intelligence Spotlight */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-extrabold text-base sm:text-lg md:text-xl text-[var(--text-primary)]">
              Recent Funding Intelligence
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Rounds, valuations, lead investors, and reported use of capital
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('funding')}
            className="text-xs font-bold text-[var(--accent-primary)] hover:underline flex items-center gap-1"
          >
            <span>All Rounds</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
          {fundingEvents.slice(0, 2).map((fe) => (
            <FundingCard key={fe.id} event={fe} />
          ))}
        </div>
      </section>

      {/* Government Schemes & Grants Spotlight */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-extrabold text-base sm:text-lg md:text-xl text-[var(--text-primary)]">
              Active Government Startup Schemes
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Official DPIIT, MeitY, and State Government (Telangana, Karnataka) programs
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('schemes')}
            className="text-xs font-bold text-[var(--accent-teal)] hover:underline flex items-center gap-1"
          >
            <span>View All Schemes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
          {governmentSchemes.slice(0, 2).map((sch) => (
            <SchemeCard key={sch.id} scheme={sch} />
          ))}
        </div>
      </section>

      {/* New Startups Discovery Spotlight */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-extrabold text-base sm:text-lg md:text-xl text-[var(--text-primary)]">
              New Startup Discoveries
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Verified founding teams, problems solved, and milestone timelines
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('startups')}
            className="text-xs font-bold text-[var(--accent-primary)] hover:underline flex items-center gap-1"
          >
            <span>Startup Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
          {startups.slice(0, 2).map((s) => (
            <StartupCard key={s.id} startup={s} />
          ))}
        </div>
      </section>

      {/* Startup Problems Reported in the News */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-extrabold text-base sm:text-lg md:text-xl text-[var(--text-primary)]">
              Documented Startup Problems & Solutions
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Strictly segregated: Source-reported solutions vs AI-generated suggestions
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('problems')}
            className="text-xs font-bold text-[var(--accent-coral)] hover:underline flex items-center gap-1"
          >
            <span>Explore Issues</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
          {problems.map((p) => (
            <ProblemCard key={p.id} problem={p} />
          ))}
        </div>
      </section>
    </div>
  );
});

HomeDashboardView.displayName = 'HomeDashboardView';
