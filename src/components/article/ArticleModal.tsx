/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import {
  X,
  Share2,
  Bookmark,
  Volume2,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Clock,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { NewsArticle } from '../../types/news';
import { useBookmarks } from '../../context/BookmarkContext';
import { useSpeech } from '../../hooks/useSpeech';
import { CompactNewsCard } from '../cards/CompactNewsCard';
import { MOCK_ARTICLES } from '../../data/mockNews';

interface ArticleModalProps {
  article: NewsArticle | null;
  onClose: () => void;
  onSelectRelated: (article: NewsArticle) => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({
  article,
  onClose,
  onSelectRelated,
}) => {
  const { isBookmarked, toggleBookmark, recordReading } = useBookmarks();
  const { isSupported, isPlaying, isPaused, rate, speak, pause, resume, stop, setSpeechRate } =
    useSpeech();

  // Record reading history on mount
  useEffect(() => {
    if (article) {
      recordReading(article);
    }
    return () => {
      stop();
    };
  }, [article, recordReading, stop]);

  // Lock body scroll while reading modal is open
  useEffect(() => {
    if (article) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [article]);

  if (!article) return null;

  const bookmarked = isBookmarked(article.id);

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(article.publishedAt));

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.headline,
          text: article.summary,
          url: article.sourceUrl || window.location.href,
        });
      } catch {
        // user cancel
      }
    } else {
      navigator.clipboard?.writeText(
        `${article.headline}\n${article.sourceUrl || window.location.href}`
      );
    }
  };

  const toggleAudio = () => {
    if (isPlaying) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      speak(`${article.summary}. ${article.content}`, article.headline);
    }
  };

  const relatedArticles = MOCK_ARTICLES.filter(
    (item) => item.id !== article.id && item.category === article.category
  ).slice(0, 3);

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex justify-center p-0 sm:p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="article-modal-headline"
    >
      <div
        className="w-full max-w-3xl liquid-glass-modal sm:rounded-3xl min-h-[100dvh] sm:min-h-0 sm:my-auto overflow-hidden shadow-2xl relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Header Toolbar */}
        <div className="sticky top-0 z-20 backdrop-blur-xl bg-[var(--bg-base)]/85 border-b border-[var(--border-subtle)] px-4 py-3 flex items-center justify-between safe-top">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] tap-target-44 interactive-press transition-colors"
            title="Close article"
            aria-label="Close article"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Audio Reader Action */}
            {isSupported && (
              <div className="flex items-center gap-1 bg-black/5 dark:bg-white/10 rounded-full px-2 py-1">
                <button
                  onClick={toggleAudio}
                  className="p-1 rounded-full text-[var(--accent-primary)] hover:opacity-80 tap-target-44 interactive-press flex items-center gap-1 text-xs font-bold"
                  title={isPlaying ? 'Pause Speech' : 'Listen with Audio'}
                  aria-label={isPlaying ? 'Pause speech' : 'Listen with audio'}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current" />
                  )}
                  <span className="hidden sm:inline">
                    {isPlaying ? 'Playing' : isPaused ? 'Paused' : 'Listen'}
                  </span>
                </button>

                {isPlaying && (
                  <button
                    onClick={() => setSpeechRate(rate === 1 ? 1.25 : rate === 1.25 ? 1.5 : 1)}
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]"
                    title="Toggle Speech Speed"
                  >
                    {rate}x
                  </button>
                )}
              </div>
            )}

            {/* Bookmark Action */}
            <button
              onClick={() => toggleBookmark(article)}
              className={`p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 tap-target-44 interactive-press transition-colors ${
                bookmarked ? 'text-[var(--accent-primary)]' : 'text-[var(--text-secondary)]'
              }`}
              title={bookmarked ? 'Remove Bookmark' : 'Bookmark Article'}
              aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark article'}
            >
              <Bookmark className={`w-5 h-5 ${bookmarked ? 'fill-current' : ''}`} />
            </button>

            {/* Share Action */}
            <button
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] tap-target-44 interactive-press transition-colors"
              title="Share article"
              aria-label="Share article"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Article Scroll Body */}
        <div className="p-4 sm:p-8 space-y-6 flex-1 overflow-y-auto">
          {/* Metadata Bar (Zero-Pill Compliance) */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)] font-medium">
            <span className="font-extrabold uppercase tracking-wider text-[var(--accent-primary)]">
              {article.categoryLabel}
            </span>
            <span aria-hidden="true" className="opacity-50">·</span>
            <span>{article.source}</span>
            <span aria-hidden="true" className="opacity-50">·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 opacity-70" />
              {article.readTimeMinutes} min read
            </span>
          </div>

          {/* Headline */}
          <h1
            id="article-modal-headline"
            className="font-extrabold text-2xl sm:text-3xl lg:text-4xl text-[var(--text-primary)] tracking-tight leading-tight"
          >
            {article.headline}
          </h1>

          {/* Author & Published Date */}
          <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)] pb-3 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[var(--accent-primary)] to-[var(--accent-indigo)] text-white text-[11px] font-bold flex items-center justify-center">
                VP
              </div>
              <span className="font-semibold text-[var(--text-secondary)]">
                {article.author || 'Senior Editorial Correspondent'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative w-full aspect-16/9 rounded-2xl overflow-hidden bg-black/5 shadow-md">
            <img
              src={article.imageUrl}
              alt={article.headline}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-40" />
          </div>

          {/* Summary Lead Paragraph */}
          <p className="font-medium text-base sm:text-lg text-[var(--text-primary)] leading-relaxed italic border-l-4 border-[var(--accent-primary)] pl-4">
            {article.summary}
          </p>

          {/* Important Facts / Key Takeaways Glass Panel */}
          {article.keyFacts && article.keyFacts.length > 0 && (
            <div className="p-4 sm:p-5 rounded-2xl bg-[var(--accent-primary)]/8 dark:bg-[var(--accent-primary)]/15 border border-[var(--accent-primary)]/20 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--accent-primary)]" />
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-[var(--accent-primary)]">
                  High-Yield Exam & Professional Takeaways
                </h3>
              </div>

              <ul className="space-y-2">
                {article.keyFacts.map((fact, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[var(--text-primary)] font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[var(--accent-emerald)] shrink-0 mt-0.5" />
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Full Article Content */}
          <div className="space-y-4 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            {article.content.split('\n\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {/* Source Verification Link */}
          {article.sourceUrl && (
            <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-tertiary)]">
              <span>Source Reporting: {article.source}</span>
              <a
                href={article.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 font-semibold text-[var(--accent-primary)] hover:underline"
              >
                <span>Original Publication</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Related Stories */}
          {relatedArticles.length > 0 && (
            <div className="pt-6 border-t border-[var(--border-subtle)] space-y-3">
              <h3 className="font-extrabold text-base text-[var(--text-primary)] tracking-tight">
                Related Current Affairs
              </h3>
              <div className="space-y-2.5">
                {relatedArticles.map((rel) => (
                  <CompactNewsCard
                    key={rel.id}
                    article={rel}
                    onOpenArticle={onSelectRelated}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
