/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { BreakingNewsTicker } from '../components/home/BreakingNewsTicker';
import { HeroFeaturedNews } from '../components/home/HeroFeaturedNews';
import { FactBitesCarousel } from '../components/home/FactBitesCarousel';
import { DailyQuizCard } from '../components/home/DailyQuizCard';
import { NewsCard } from '../components/cards/NewsCard';
import { OfflineBanner } from '../components/shared/OfflineBanner';
import { SkeletonCard } from '../components/shared/SkeletonCard';
import { MOCK_ARTICLES, MOCK_FACTS, CATEGORIES_LIST } from '../data/mockNews';
import { NewsArticle, CategoryType } from '../types/news';
import { RefreshCw, Filter, Layers } from 'lucide-react';

interface HomePageProps {
  onOpenArticle: (article: NewsArticle) => void;
  onQuickListen: (article: NewsArticle) => void;
  onNavigateTab: (tab: any) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onOpenArticle,
  onQuickListen,
  onNavigateTab,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);

  // Top featured story
  const featuredStory = useMemo(() => {
    return MOCK_ARTICLES.find((art) => art.isFeatured) || MOCK_ARTICLES[0];
  }, []);

  // Filtered feed
  const feedArticles = useMemo(() => {
    let list = MOCK_ARTICLES.filter((art) => art.id !== featuredStory.id);
    if (selectedCategory !== 'all') {
      list = list.filter((art) => art.category === selectedCategory);
    }
    return list;
  }, [selectedCategory, featuredStory.id]);

  const displayedArticles = feedArticles.slice(0, visibleCount);

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 6);
      setIsLoadingMore(false);
    }, 350);
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* Offline Connectivity Status */}
      <OfflineBanner />

      {/* Real-Time Breaking News Glass Ticker */}
      <BreakingNewsTicker
        onSelectAlert={(text) => {
          const matched = MOCK_ARTICLES.find((a) =>
            text.toLowerCase().includes(a.category) || text.toLowerCase().includes(a.headline.slice(0, 15).toLowerCase())
          );
          if (matched) onOpenArticle(matched);
        }}
      />

      {/* Cinematic Hero Featured News */}
      {selectedCategory === 'all' && (
        <HeroFeaturedNews
          article={featuredStory}
          onOpenArticle={onOpenArticle}
          onListenArticle={onQuickListen}
        />
      )}

      {/* Today's Fact Capsules / Did You Know? */}
      {selectedCategory === 'all' && (
        <FactBitesCarousel
          facts={MOCK_FACTS}
          onOpenFactModal={(fact) => {
            const matched = MOCK_ARTICLES.find((a) => a.category === fact.category);
            if (matched) onOpenArticle(matched);
          }}
        />
      )}

      {/* Daily Quiz Spotlight Card */}
      {selectedCategory === 'all' && (
        <DailyQuizCard onStartQuiz={() => onNavigateTab('quiz')} />
      )}

      {/* Category Filter Segments (Interactive button controls) */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[var(--accent-primary)]" />
            <h3 className="font-extrabold text-base sm:text-lg text-[var(--text-primary)] tracking-tight">
              {selectedCategory === 'all'
                ? 'Curated Current Affairs'
                : `${CATEGORIES_LIST.find((c) => c.id === selectedCategory)?.label || 'Category'}`}
            </h3>
          </div>
          <span className="text-xs text-[var(--text-secondary)] font-medium">
            {feedArticles.length} stories
          </span>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all tap-target-44 flex items-center ${
              selectedCategory === 'all'
                ? 'bg-[var(--accent-primary)] text-white shadow-xs'
                : 'bg-white/50 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/15 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            All Affairs
          </button>
          {CATEGORIES_LIST.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all tap-target-44 flex items-center shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-[var(--accent-primary)] text-white shadow-xs'
                  : 'bg-white/50 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/15 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {cat.shortLabel}
            </button>
          ))}
        </div>
      </section>

      {/* News Feed Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5" aria-label="News articles feed">
        {displayedArticles.map((article) => (
          <NewsCard
            key={article.id}
            article={article}
            onOpenArticle={onOpenArticle}
            onQuickListen={onQuickListen}
          />
        ))}

        {isLoadingMore && (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}
      </section>

      {/* Infinite Scroll / Load More Action */}
      {displayedArticles.length < feedArticles.length && (
        <div className="pt-4 flex justify-center">
          <button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="px-6 py-2.5 rounded-full liquid-glass-card text-xs sm:text-sm font-bold text-[var(--text-primary)] hover:bg-white/80 dark:hover:bg-white/15 tap-target-44 interactive-press flex items-center gap-2 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingMore ? 'animate-spin' : ''}`} />
            <span>Load More Verified Stories</span>
          </button>
        </div>
      )}
    </div>
  );
};
