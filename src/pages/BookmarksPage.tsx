/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Bookmark, History, Trash2, Download, ArrowRight } from 'lucide-react';
import { useBookmarks } from '../context/BookmarkContext';
import { NewsArticle } from '../types/news';
import { NewsCard } from '../components/cards/NewsCard';
import { CompactNewsCard } from '../components/cards/CompactNewsCard';

interface BookmarksPageProps {
  onOpenArticle: (article: NewsArticle) => void;
  onQuickListen: (article: NewsArticle) => void;
  onNavigateHome: () => void;
}

export const BookmarksPage: React.FC<BookmarksPageProps> = ({
  onOpenArticle,
  onQuickListen,
  onNavigateHome,
}) => {
  const {
    bookmarks,
    clearAllBookmarks,
    readingHistory,
    clearHistory,
  } = useBookmarks();

  const [activeSubTab, setActiveSubTab] = useState<'saved' | 'history'>('saved');

  const handleExportSaved = () => {
    const content = `VENTUREPULSE SAVED ARTICLES\nExported: ${new Date().toLocaleDateString()}\n\n` +
      bookmarks.map((b, i) => `${i + 1}. ${b.headline}\n   Category: ${b.categoryLabel}\n   Source: ${b.source}\n   Summary: ${b.summary}\n   URL: ${b.sourceUrl || ''}\n`).join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VenturePulse_Bookmarks_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-extrabold text-xl sm:text-2xl text-[var(--text-primary)] tracking-tight">
            Saved & Offline Vault
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Articles cached on your device for immediate offline reading
          </p>
        </div>

        {/* Sub Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-full bg-black/5 dark:bg-white/10 shrink-0">
          <button
            onClick={() => setActiveSubTab('saved')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all tap-target-44 flex items-center gap-1.5 ${
              activeSubTab === 'saved'
                ? 'bg-[var(--accent-primary)] text-white shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved ({bookmarks.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('history')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all tap-target-44 flex items-center gap-1.5 ${
              activeSubTab === 'history'
                ? 'bg-[var(--accent-primary)] text-white shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History ({readingHistory.length})</span>
          </button>
        </div>
      </div>

      {/* Action Bar */}
      {activeSubTab === 'saved' && bookmarks.length > 0 && (
        <div className="flex items-center justify-between text-xs pt-1">
          <button
            onClick={handleExportSaved}
            className="flex items-center gap-1.5 font-bold text-[var(--accent-primary)] hover:underline tap-target-44"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Saved Stories</span>
          </button>

          <button
            onClick={clearAllBookmarks}
            className="flex items-center gap-1 font-semibold text-rose-500 hover:underline tap-target-44"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>
        </div>
      )}

      {activeSubTab === 'history' && readingHistory.length > 0 && (
        <div className="flex items-center justify-end text-xs pt-1">
          <button
            onClick={clearHistory}
            className="flex items-center gap-1 font-semibold text-rose-500 hover:underline tap-target-44"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Reading History</span>
          </button>
        </div>
      )}

      {/* Main Content */}
      {activeSubTab === 'saved' ? (
        bookmarks.length === 0 ? (
          <div className="liquid-glass-card p-8 sm:p-12 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-[var(--text-tertiary)]">
              <Bookmark className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[var(--text-primary)]">
                No saved articles yet
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-sm mx-auto">
                Tap the bookmark icon on any news card or current affairs timeline item to save it for offline reading.
              </p>
            </div>
            <button
              onClick={onNavigateHome}
              className="px-5 py-2 rounded-full bg-[var(--accent-primary)] text-white text-xs font-bold tap-target-44 interactive-press inline-flex items-center gap-1.5"
            >
              <span>Explore Top News</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bookmarks.map((article) => (
              <NewsCard
                key={article.id}
                article={article}
                onOpenArticle={onOpenArticle}
                onQuickListen={onQuickListen}
              />
            ))}
          </div>
        )
      ) : readingHistory.length === 0 ? (
        <div className="liquid-glass-card p-8 text-center space-y-3">
          <History className="w-8 h-8 mx-auto text-[var(--text-tertiary)]" />
          <p className="font-bold text-sm text-[var(--text-primary)]">
            No recently read stories
          </p>
          <p className="text-xs text-[var(--text-secondary)]">
            Articles you open will automatically be remembered here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {readingHistory.map((article) => (
            <CompactNewsCard
              key={article.id}
              article={article}
              onOpenArticle={onOpenArticle}
            />
          ))}
        </div>
      )}
    </div>
  );
};
