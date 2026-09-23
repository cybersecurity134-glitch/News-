/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, X, TrendingUp, History, Filter, ArrowRight, Clock } from 'lucide-react';
import { NewsArticle, CategoryType } from '../../types/news';
import { MOCK_ARTICLES, CATEGORIES_LIST } from '../../data/mockNews';
import { CompactNewsCard } from '../cards/CompactNewsCard';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectArticle: (article: NewsArticle) => void;
}

const TRENDING_TOPICS = [
  'Green Bond Framework',
  'Geneva AI Protocol',
  'UHVDC Power Grid',
  'Lunar Base Module',
  'G20 Digital ID',
  'Olympic Thermal Gear',
];

const SEARCH_HISTORY_KEY = 'aura_recent_searches_v1';

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectArticle,
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(SEARCH_HISTORY_KEY);
        if (saved) return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return ['Vienna Accord', 'Frontier AI', 'Clean Energy'];
  });

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

  const saveSearchTerm = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const updated = [trimmed, ...prev.filter((item) => item !== trimmed)].slice(0, 6);
      try {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const clearHistory = () => {
    setRecentSearches([]);
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  };

  // Filtered results
  const filteredArticles = useMemo(() => {
    const q = query.toLowerCase().trim();
    return MOCK_ARTICLES.filter((art) => {
      const matchesCategory =
        selectedCategory === 'all' || art.category === selectedCategory;

      if (!q) return matchesCategory;

      const matchesText =
        art.headline.toLowerCase().includes(q) ||
        art.summary.toLowerCase().includes(q) ||
        art.tags.some((t) => t.toLowerCase().includes(q)) ||
        art.source.toLowerCase().includes(q);

      return matchesCategory && matchesText;
    });
  }, [query, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex justify-center p-2 sm:p-6 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Search current affairs"
    >
      <div
        className="w-full max-w-2xl liquid-glass-modal rounded-3xl min-h-[500px] max-h-[85vh] my-auto overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Input */}
        <div className="p-4 sm:p-5 border-b border-[var(--border-subtle)] flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--accent-primary)]" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveSearchTerm(query);
              }}
              placeholder="Search current affairs, treaties, topics, keywords..."
              className="w-full pl-10 pr-9 py-2.5 rounded-full liquid-glass-input text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                title="Clear input"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] tap-target-44 interactive-press"
            title="Close"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filter Segments (Zero-pill button controls with click handlers) */}
        <div className="px-4 py-2 border-b border-[var(--border-subtle)] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 text-xs font-semibold rounded-full shrink-0 transition-colors tap-target-44 flex items-center ${
              selectedCategory === 'all'
                ? 'bg-[var(--accent-primary)] text-white'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            All Topics
          </button>
          {CATEGORIES_LIST.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 text-xs font-semibold rounded-full shrink-0 transition-colors tap-target-44 flex items-center ${
                selectedCategory === cat.id
                  ? 'bg-[var(--accent-primary)] text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              {cat.shortLabel}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* If query is empty, show Trending & Recent */}
          {!query.trim() && (
            <div className="space-y-5">
              {/* Trending Topics */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[var(--text-secondary)] mb-2.5">
                  <TrendingUp className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                  <span>Trending Current Affairs</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {TRENDING_TOPICS.map((topic) => (
                    <button
                      key={topic}
                      onClick={() => {
                        setQuery(topic);
                        saveSearchTerm(topic);
                      }}
                      className="px-3 py-1.5 rounded-full text-xs font-medium bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-[var(--text-primary)] interactive-press transition-colors"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-[var(--text-secondary)] mb-2.5">
                    <div className="flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5" />
                      <span>Recent Searches</span>
                    </div>
                    <button
                      onClick={clearHistory}
                      className="text-[11px] font-bold text-[var(--accent-primary)] hover:underline capitalize"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="space-y-1">
                    {recentSearches.map((term, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          setQuery(term);
                          saveSearchTerm(term);
                        }}
                        className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-between text-xs text-[var(--text-primary)] cursor-pointer"
                      >
                        <span className="font-medium">{term}</span>
                        <ArrowRight className="w-3 h-3 text-[var(--text-tertiary)]" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Search Results */}
          {query.trim() && (
            <div>
              <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] font-medium mb-3">
                <span>
                  Found {filteredArticles.length} result{filteredArticles.length === 1 ? '' : 's'}
                </span>
                {selectedCategory !== 'all' && (
                  <span className="capitalize">Filtered by {selectedCategory}</span>
                )}
              </div>

              {filteredArticles.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <p className="font-extrabold text-base text-[var(--text-primary)]">
                    No matching articles found
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
                    Try searching for a different keyword, like "AI", "Climate", "Geneva", or "Grid".
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredArticles.map((article) => (
                    <CompactNewsCard
                      key={article.id}
                      article={article}
                      onOpenArticle={(art) => {
                        saveSearchTerm(query);
                        onSelectArticle(art);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
