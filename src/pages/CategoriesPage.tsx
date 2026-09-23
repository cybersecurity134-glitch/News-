/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Building2,
  Globe2,
  TrendingUp,
  Cpu,
  ShieldAlert,
  Leaf,
  FileText,
  GraduationCap,
  Trophy,
  CalendarCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { CATEGORIES_LIST, MOCK_ARTICLES } from '../data/mockNews';
import { CategoryType, NewsArticle } from '../types/news';
import { NewsCard } from '../components/cards/NewsCard';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Building2,
  Globe2,
  TrendingUp,
  Cpu,
  ShieldAlert,
  Leaf,
  FileText,
  GraduationCap,
  Trophy,
  CalendarCheck,
};

interface CategoriesPageProps {
  onOpenArticle: (article: NewsArticle) => void;
  onQuickListen: (article: NewsArticle) => void;
}

export const CategoriesPage: React.FC<CategoriesPageProps> = ({
  onOpenArticle,
  onQuickListen,
}) => {
  const [activeCategory, setActiveCategory] = useState<CategoryType | null>(null);

  const selectedCategoryMeta = CATEGORIES_LIST.find((c) => c.id === activeCategory);

  const categoryArticles = activeCategory
    ? MOCK_ARTICLES.filter((a) => a.category === activeCategory)
    : [];

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-extrabold text-xl sm:text-2xl text-[var(--text-primary)] tracking-tight">
            Domains & Categories
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Explore current affairs by statutory, scientific, and geopolitical domain
          </p>
        </div>

        {activeCategory && (
          <button
            onClick={() => setActiveCategory(null)}
            className="text-xs font-bold text-[var(--accent-primary)] hover:underline tap-target-44 flex items-center"
          >
            ← View All Domains
          </button>
        )}
      </div>

      {/* If No Category Selected: Display Liquid Glass Mosaic Grid */}
      {!activeCategory ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {CATEGORIES_LIST.map((cat) => {
            const Icon = ICON_MAP[cat.iconName] || Sparkles;
            const count = MOCK_ARTICLES.filter((a) => a.category === cat.id).length;

            return (
              <div
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className="liquid-glass-card p-5 cursor-pointer group interactive-press flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs"
                      style={{ backgroundColor: cat.accentColor }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-[var(--text-secondary)]">
                      {count} {count === 1 ? 'Story' : 'Stories'}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors mb-1.5">
                    {cat.label}
                  </h3>

                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                    {cat.description}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-bold text-[var(--accent-primary)]">
                  <span>Explore Stream</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* If Category Selected: Display Category Header & Feed */
        <div className="space-y-5 animate-fade-in">
          {selectedCategoryMeta && (
            <div className="liquid-glass-card p-5 sm:p-6 flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md"
                style={{ backgroundColor: selectedCategoryMeta.accentColor }}
              >
                {React.createElement(
                  ICON_MAP[selectedCategoryMeta.iconName] || Sparkles,
                  { className: 'w-6 h-6' }
                )}
              </div>
              <div>
                <h2 className="font-extrabold text-xl sm:text-2xl text-[var(--text-primary)]">
                  {selectedCategoryMeta.label}
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
                  {selectedCategoryMeta.description}
                </p>
              </div>
            </div>
          )}

          {categoryArticles.length === 0 ? (
            <div className="liquid-glass-card p-8 text-center space-y-2">
              <p className="font-bold text-sm text-[var(--text-primary)]">
                No active stories in this category right now.
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                Our verification desk is currently vetting latest reports.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryArticles.map((article) => (
                <NewsCard
                  key={article.id}
                  article={article}
                  onOpenArticle={onOpenArticle}
                  onQuickListen={onQuickListen}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
