/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { NewsArticle } from '../types/news';
import { MOCK_ARTICLES } from '../data/mockNews';

interface BookmarkContextType {
  bookmarks: NewsArticle[];
  isBookmarked: (id: string) => boolean;
  toggleBookmark: (article: NewsArticle) => void;
  removeBookmark: (id: string) => void;
  clearAllBookmarks: () => void;
  readingHistory: NewsArticle[];
  recordReading: (article: NewsArticle) => void;
  clearHistory: () => void;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

const BOOKMARKS_STORAGE_KEY = 'aura_bookmarks_v1';
const HISTORY_STORAGE_KEY = 'aura_history_v1';

export const BookmarkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bookmarks, setBookmarks] = useState<NewsArticle[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {
        // fallback
      }
      // Seed with 2 default saved articles for instant preview
      return [MOCK_ARTICLES[0], MOCK_ARTICLES[1]];
    }
    return [];
  });

  const [readingHistory, setReadingHistory] = useState<NewsArticle[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {
        // fallback
      }
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
    } catch {
      // storage full
    }
  }, [bookmarks]);

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(readingHistory.slice(0, 30)));
    } catch {
      // storage full
    }
  }, [readingHistory]);

  const isBookmarked = (id: string) => bookmarks.some((b) => b.id === id);

  const toggleBookmark = (article: NewsArticle) => {
    setBookmarks((prev) => {
      const exists = prev.some((b) => b.id === article.id);
      if (exists) {
        return prev.filter((b) => b.id !== article.id);
      } else {
        return [article, ...prev];
      }
    });
  };

  const removeBookmark = (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  const clearAllBookmarks = () => {
    setBookmarks([]);
  };

  const recordReading = (article: NewsArticle) => {
    setReadingHistory((prev) => {
      const filtered = prev.filter((item) => item.id !== article.id);
      return [article, ...filtered].slice(0, 40);
    });
  };

  const clearHistory = () => {
    setReadingHistory([]);
  };

  return (
    <BookmarkContext.Provider
      value={{
        bookmarks,
        isBookmarked,
        toggleBookmark,
        removeBookmark,
        clearAllBookmarks,
        readingHistory,
        recordReading,
        clearHistory,
      }}
    >
      {children}
    </BookmarkContext.Provider>
  );
};

export const useBookmarks = () => {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
};
