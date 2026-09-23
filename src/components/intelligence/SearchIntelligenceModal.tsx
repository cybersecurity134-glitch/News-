/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, X, TrendingUp, ArrowRight, ExternalLink } from 'lucide-react';
import { useIntelligence } from '../../context/IntelligenceContext';
import { NewsEventCard } from './NewsEventCard';
import { StartupCard } from './StartupCard';
import { FundingCard } from './FundingCard';
import { SchemeCard } from './SchemeCard';

interface SearchIntelligenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SEARCH_PROMPTS = [
  'AI startups in India',
  'Sarvam AI',
  'Startup grants in Telangana',
  'Investors funding DeepTech',
  'Seed funding opportunities',
  'Agnikul Cosmos',
  'Angel tax exemption guidelines',
];

export const SearchIntelligenceModal: React.FC<SearchIntelligenceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [query, setQuery] = useState('');
  const { newsEvents, startups, fundingEvents, governmentSchemes } = useIntelligence();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const matchedNews = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return newsEvents.filter(
      (n) =>
        n.headline.toLowerCase().includes(q) ||
        n.summary.toLowerCase().includes(q) ||
        n.sector.toLowerCase().includes(q) ||
        n.companiesMentioned.some((c) => c.toLowerCase().includes(q)) ||
        n.source.name.toLowerCase().includes(q)
    );
  }, [query, newsEvents]);

  const matchedStartups = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return startups.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.industry.toLowerCase().includes(q) ||
        s.founders.some((f) => f.toLowerCase().includes(q)) ||
        s.problemSolved.toLowerCase().includes(q)
    );
  }, [query, startups]);

  const matchedSchemes = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return governmentSchemes.filter(
      (sch) =>
        sch.name.toLowerCase().includes(q) ||
        sch.state?.toLowerCase().includes(q) ||
        sch.ministryOrDepartment.toLowerCase().includes(q) ||
        sch.supportType.toLowerCase().includes(q)
    );
  }, [query, governmentSchemes]);

  if (!isOpen) return null;

  const totalResults = matchedNews.length + matchedStartups.length + matchedSchemes.length;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex justify-center p-2 sm:p-6 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Search intelligence"
    >
      <div
        className="w-full max-w-3xl liquid-glass-modal rounded-3xl min-h-0 sm:min-h-[360px] max-h-[92dvh] sm:max-h-[85vh] my-auto overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-3 sm:p-5 border-b border-[var(--color-border-subtle)] flex items-center gap-2 sm:gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-primary)]" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search startups, founders, investors, schemes, grants..."
              className="w-full pl-10 pr-9 py-2 sm:py-2.5 rounded-full liquid-glass-input text-xs sm:text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] tap-target-44 interactive-press"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {!query.trim() ? (
            <div className="space-y-4">
              <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[var(--color-text-secondary)]">
                <TrendingUp className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                <span>Suggested Intelligence Searches</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {SEARCH_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => setQuery(prompt)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-black/5 dark:bg-white/5 border border-[var(--color-border-subtle)] hover:bg-[var(--color-primary-subtle)] hover:border-[var(--color-primary-border)] hover:text-[var(--color-primary)] text-[var(--color-text-primary)] interactive-press transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : totalResults === 0 ? (
            <div className="py-16 text-center space-y-2">
              <p className="font-extrabold text-base text-[var(--color-text-primary)] font-display">
                No verified records found for "{query}"
              </p>
              <p className="text-xs text-[var(--color-text-secondary)] max-w-sm mx-auto">
                Remember our Zero-Hallucination Policy: if information hasn't been verified by monitored external sources, we never generate fake results.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {matchedStartups.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--sec-startups)]">
                    Matched Startups ({matchedStartups.length})
                  </h4>
                  <div className="space-y-3">
                    {matchedStartups.map((s) => (
                      <StartupCard key={s.id} startup={s} />
                    ))}
                  </div>
                </div>
              )}

              {matchedSchemes.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--sec-schemes)]">
                    Matched Government Schemes ({matchedSchemes.length})
                  </h4>
                  <div className="space-y-3">
                    {matchedSchemes.map((sch) => (
                      <SchemeCard key={sch.id} scheme={sch} />
                    ))}
                  </div>
                </div>
              )}

              {matchedNews.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--sec-news)]">
                    Matched Reports & Funding ({matchedNews.length})
                  </h4>
                  <div className="space-y-3">
                    {matchedNews.map((n) => (
                      <NewsEventCard key={n.id} item={n} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
