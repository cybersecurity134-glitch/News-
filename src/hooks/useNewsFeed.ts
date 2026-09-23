/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { NewsItem, Category } from '../types/models';
import { apiClient } from '../api/client';
import { socket } from '../api/socket';

const CACHE_KEY_PREFIX = 'vp_feed_cache_';
const PAGE_SIZE = 12;

export function useNewsFeed(
  category?: Category | 'all',
  status: 'approved' | 'pending' | 'rejected' = 'approved'
) {
  const cacheKey = `${CACHE_KEY_PREFIX}${category || 'all'}_${status}`;

  // Read initial cache synchronously for zero blank screen
  const [items, setItems] = useState<NewsItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch {
        // Ignore JSON error
      }
    }
    return [];
  });

  const [isLoading, setIsLoading] = useState<boolean>(() => items.length === 0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(() => !navigator.onLine);

  // Pagination: visible count for infinite scroll
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);

  const isMountedRef = useRef(true);

  // Online / Offline listener
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchNews = useCallback(
    async (isBackground = false) => {
      if (!isBackground && items.length === 0) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError(null);

      try {
        const data = await apiClient.getNews(category, status);
        if (!isMountedRef.current) return;

        setItems(data);

        // Update local storage cache
        try {
          localStorage.setItem(cacheKey, JSON.stringify(data.slice(0, 40)));
        } catch {
          // localStorage quota or private mode
        }
      } catch (err: any) {
        if (!isMountedRef.current) return;
        // If we already have cached items, keep showing them gracefully
        if (items.length === 0) {
          setError(err.message || 'Unable to connect to news feed');
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [category, status, cacheKey, items.length]
  );

  useEffect(() => {
    isMountedRef.current = true;
    // Reset visible count on category change
    setVisibleCount(PAGE_SIZE);
    // Background refresh immediately (or full fetch if no cache)
    fetchNews(items.length > 0);

    return () => {
      isMountedRef.current = false;
    };
  }, [category, status]);

  // Subscribe to real-time 'news:approved' socket event
  useEffect(() => {
    const handleNewsApproved = () => {
      fetchNews(true);
    };

    socket.on('news:approved', handleNewsApproved);
    return () => {
      socket.off('news:approved', handleNewsApproved);
    };
  }, [fetchNews]);

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => prev + PAGE_SIZE);
  }, []);

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

  return {
    items,
    visibleItems,
    hasMore,
    loadMore,
    totalCount: items.length,
    isLoading,
    isRefreshing,
    error,
    isOffline,
    refresh: () => fetchNews(false),
  };
}
