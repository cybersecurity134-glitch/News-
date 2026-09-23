/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Compass, Calendar, Download, Sparkles, CheckCircle2, Clock, Share2, Volume2 } from 'lucide-react';
import { MOCK_ARTICLES, MOCK_FACTS, CATEGORIES_LIST } from '../data/mockNews';
import { NewsArticle, CategoryType } from '../types/news';
import { useSpeech } from '../hooks/useSpeech';

interface CurrentAffairsPageProps {
  onOpenArticle: (article: NewsArticle) => void;
  onQuickListen: (article: NewsArticle) => void;
}

export const CurrentAffairsPage: React.FC<CurrentAffairsPageProps> = ({
  onOpenArticle,
  onQuickListen,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [filterPeriod, setFilterPeriod] = useState<'today' | 'week' | 'month'>('today');
  const { speak, isSupported } = useSpeech();

  const filteredTimeline = useMemo(() => {
    let list = [...MOCK_ARTICLES];
    if (selectedCategory !== 'all') {
      list = list.filter((a) => a.category === selectedCategory);
    }
    return list;
  }, [selectedCategory]);

  const handleExportBriefing = () => {
    const textContent = `VENTUREPULSE CURRENT AFFAIRS EXECUTIVE DIGEST\nDate: September 23, 2026\n\n` +
      `KEY FACTS & HIGHLIGHTS:\n` +
      MOCK_FACTS.map((f, i) => `${i + 1}. [${f.importance}] ${f.headline} (${f.source}): ${f.context}`).join('\n\n') +
      `\n\nMAJOR ARTICLES SUMMARY:\n` +
      MOCK_ARTICLES.slice(0, 5).map((a, i) => `${i + 1}. ${a.headline} [${a.categoryLabel}]\n   Takeaway: ${a.summary}\n`).join('\n');

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Current_Affairs_Briefing_2026_09_23.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleListenDigest = () => {
    const digestText = `Today's Current Affairs Executive Briefing. ` +
      MOCK_FACTS.slice(0, 3).map((f) => `${f.headline}. ${f.context}`).join(' ');
    speak(digestText, "Current Affairs Digest");
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* Header Banner */}
      <div className="liquid-glass-card p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[var(--accent-primary)] to-[var(--accent-teal)] text-white flex items-center justify-center shadow-sm">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-xl sm:text-2xl text-[var(--text-primary)] tracking-tight">
                Current Affairs Timeline
              </h1>
              <p className="text-xs text-[var(--text-secondary)]">
                Chronological, verified developments structured for deep revision
              </p>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2">
            {isSupported && (
              <button
                onClick={handleListenDigest}
                className="px-3 py-1.5 rounded-full bg-white/60 dark:bg-white/10 hover:bg-white/90 text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5 tap-target-44 interactive-press"
                title="Listen to 3-minute Audio Digest"
              >
                <Volume2 className="w-4 h-4 text-[var(--accent-primary)]" />
                <span>Audio Digest</span>
              </button>
            )}

            <button
              onClick={handleExportBriefing}
              className="px-3 py-1.5 rounded-full bg-[var(--accent-primary)] text-white text-xs font-bold flex items-center gap-1.5 tap-target-44 interactive-press shadow-xs"
              title="Download text summary"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Notes</span>
            </button>
          </div>
        </div>

        {/* 3-Minute Executive Digest Glass Callout */}
        <div className="p-4 rounded-2xl bg-[var(--accent-primary)]/8 dark:bg-[var(--accent-primary)]/15 border border-[var(--accent-primary)]/20 space-y-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--accent-primary)]" />
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-[var(--accent-primary)]">
              Daily Executive Digest (3-Minute Overview)
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {MOCK_FACTS.slice(0, 3).map((f) => (
              <div key={f.id} className="p-2.5 rounded-xl bg-white/40 dark:bg-white/5 border border-white/40 dark:border-white/5">
                <span className="text-[10px] font-extrabold uppercase text-[var(--accent-primary)]">
                  {f.category}
                </span>
                <p className="text-xs font-bold text-[var(--text-primary)] line-clamp-1 mt-0.5">
                  {f.headline}
                </p>
                <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2 mt-1">
                  {f.context}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--border-subtle)]">
          {/* Period selector */}
          <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-full text-xs font-semibold">
            {(['today', 'week', 'month'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setFilterPeriod(period)}
                className={`px-3 py-1 rounded-full capitalize transition-colors ${
                  filterPeriod === period
                    ? 'bg-[var(--accent-primary)] text-white'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {period}
              </button>
            ))}
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-full">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-[var(--text-primary)] text-[var(--bg-base)]'
                  : 'bg-black/5 dark:bg-white/5 text-[var(--text-secondary)]'
              }`}
            >
              All
            </button>
            {CATEGORIES_LIST.slice(0, 5).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-[var(--text-primary)] text-[var(--bg-base)]'
                    : 'bg-black/5 dark:bg-white/5 text-[var(--text-secondary)]'
                }`}
              >
                {cat.shortLabel}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline Items Feed */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[var(--border-subtle)]">
        {filteredTimeline.map((item, idx) => (
          <div key={item.id} className="relative group">
            {/* Timeline Node Ring */}
            <div className="absolute -left-[23px] sm:-left-[27px] top-4 w-4 h-4 rounded-full bg-[var(--bg-base)] border-2 border-[var(--accent-primary)] group-hover:scale-125 transition-transform" />

            <div
              onClick={() => onOpenArticle(item)}
              className="liquid-glass-card p-4 sm:p-5 cursor-pointer interactive-press"
            >
              {/* Clean Unboxed Metadata (Zero-Pill Compliance) */}
              <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] font-medium mb-1.5">
                <span className="font-extrabold text-[var(--accent-primary)] uppercase text-[11px]">
                  {item.categoryLabel}
                </span>
                <span aria-hidden="true" className="opacity-50">·</span>
                <span>{item.source}</span>
                <span aria-hidden="true" className="opacity-50">·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 opacity-70" />
                  {item.readTimeMinutes} min
                </span>
              </div>

              <h3 className="font-extrabold text-base sm:text-lg text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors mb-2">
                {item.headline}
              </h3>

              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
                {item.summary}
              </p>

              {/* High-yield key fact bullet */}
              {item.keyFacts && item.keyFacts[0] && (
                <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 text-xs text-[var(--text-primary)] flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-emerald)] shrink-0 mt-0.5" />
                  <span className="font-medium">{item.keyFacts[0]}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
