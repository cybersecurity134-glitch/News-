/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  NewsEventItem,
  StartupEntity,
  FundingEvent,
  InvestorProfile,
  GovernmentScheme,
  FundingOpportunity,
  StartupEventItem,
  ReportedProblem,
  AdminSystemStatus,
  UserPreferences,
  AlertRule,
  NewsCategory,
  FundingStage,
  RegionScope,
  SourceTier,
} from '../types/intelligence';
import {
  MOCK_NEWS_EVENTS,
  MOCK_STARTUPS_DIRECTORY,
  MOCK_FUNDING_EVENTS,
  MOCK_INVESTORS_LIST,
  MOCK_GOVERNMENT_SCHEMES,
  MOCK_FUNDING_OPPORTUNITIES,
  MOCK_STARTUP_EVENTS,
  MOCK_REPORTED_PROBLEMS,
  MOCK_ADMIN_STATUS,
} from '../data/startupIntelligenceData';

export interface FilterState {
  searchQuery: string;
  category: NewsCategory;
  geography: RegionScope | 'all';
  stage: FundingStage | 'all';
  dateRange: 'today' | 'yesterday' | '7d' | '30d' | 'all';
  sourceTier: SourceTier | 'all';
}

const DEFAULT_FILTERS: FilterState = {
  searchQuery: '',
  category: 'all',
  geography: 'all',
  stage: 'all',
  dateRange: 'all',
  sourceTier: 'all',
};

const DEFAULT_PREFERENCES: UserPreferences = {
  country: 'India',
  state: 'Telangana',
  city: 'Hyderabad',
  startupStage: 'Seed',
  industry: 'Artificial Intelligence',
  fundingRequirement: '₹50 Lakhs - ₹2 Crore',
  interests: ['Artificial Intelligence', 'SaaS', 'Government Schemes', 'DeepTech', 'Grants'],
  onboardingCompleted: true,
};

interface IntelligenceContextType {
  newsEvents: NewsEventItem[];
  startups: StartupEntity[];
  fundingEvents: FundingEvent[];
  investors: InvestorProfile[];
  governmentSchemes: GovernmentScheme[];
  opportunities: FundingOpportunity[];
  events: StartupEventItem[];
  problems: ReportedProblem[];
  adminStatus: AdminSystemStatus;
  userPreferences: UserPreferences;
  setUserPreferences: (prefs: UserPreferences) => void;
  filters: FilterState;
  setFilters: (newFilters: Partial<FilterState>) => void;
  resetFilters: () => void;
  savedItemIds: string[];
  toggleSaveItem: (id: string) => void;
  isItemSaved: (id: string) => boolean;
  alerts: AlertRule[];
  addAlert: (rule: { label: string; keyword: string; category?: NewsCategory; geography?: string; minAmount?: string }) => void;
  removeAlert: (id: string) => void;
  toggleAlert: (id: string) => void;
  isRefreshing: boolean;
  refreshData: () => Promise<void>;
  filteredNews: NewsEventItem[];
  personalizedFeed: { item: NewsEventItem; reason: string }[];
}

const IntelligenceContext = createContext<IntelligenceContextType | undefined>(undefined);

const PREFS_STORAGE_KEY = 'vp_intelligence_prefs_v1';
const SAVED_STORAGE_KEY = 'vp_intelligence_saved_v1';
const ALERTS_STORAGE_KEY = 'vp_intelligence_alerts_v1';
const NEWS_CACHE_KEY = 'vp_intelligence_news_cache_v2';

export const IntelligenceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Stale-while-revalidate: synchronous initial load from cache for instant first paint
  const [newsEvents, setNewsEvents] = useState<NewsEventItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(NEWS_CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return MOCK_NEWS_EVENTS;
  });

  const [startups] = useState<StartupEntity[]>(MOCK_STARTUPS_DIRECTORY);
  const [fundingEvents] = useState<FundingEvent[]>(MOCK_FUNDING_EVENTS);
  const [investors] = useState<InvestorProfile[]>(MOCK_INVESTORS_LIST);
  const [governmentSchemes] = useState<GovernmentScheme[]>(MOCK_GOVERNMENT_SCHEMES);
  const [opportunities] = useState<FundingOpportunity[]>(MOCK_FUNDING_OPPORTUNITIES);
  const [events] = useState<StartupEventItem[]>(MOCK_STARTUP_EVENTS);
  const [problems] = useState<ReportedProblem[]>(MOCK_REPORTED_PROBLEMS);
  const [adminStatus, setAdminStatus] = useState<AdminSystemStatus>(MOCK_ADMIN_STATUS);

  const [filters, setFiltersState] = useState<FilterState>(DEFAULT_FILTERS);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Background revalidation & prefetch off the main thread (requestIdleCallback)
  useEffect(() => {
    const idleTask = () => {
      // Revalidate breaking news ticker and cache updates in the background
      fetch('/api/breaking-ticker')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.ticker) {
            // Save current news events to cache
            try {
              localStorage.setItem(NEWS_CACHE_KEY, JSON.stringify(newsEvents));
            } catch {}
          }
        })
        .catch(() => {});

      // Prefetch published articles from verification database if available
      fetch('/api/news-verification/articles')
        .then((res) => (res.ok ? res.json() : null))
        .catch(() => {});
    };

    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(idleTask, { timeout: 1500 });
      } else {
        setTimeout(idleTask, 300);
      }
    }
  }, [newsEvents]);

  // User preferences
  const [userPreferences, setUserPreferencesState] = useState<UserPreferences>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(PREFS_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_PREFERENCES;
  });

  // Saved items
  const [savedItemIds, setSavedItemIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(SAVED_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return ['news-001', 'scheme-02'];
  });

  // User alerts
  const [alerts, setAlerts] = useState<AlertRule[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(ALERTS_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [
      {
        id: 'alert-1',
        label: 'AI Startups Raising Seed or Series A in India',
        keyword: 'AI',
        category: 'funding',
        geography: 'India',
        createdAt: '2026-09-20',
        active: true,
      },
      {
        id: 'alert-2',
        label: 'Telangana Government Grants & Startup Schemes',
        keyword: 'Telangana',
        category: 'government-schemes',
        geography: 'Telangana',
        createdAt: '2026-09-21',
        active: true,
      }
    ];
  });

  // Sync to storage
  useEffect(() => {
    try {
      localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(userPreferences));
    } catch {}
  }, [userPreferences]);

  useEffect(() => {
    try {
      localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(savedItemIds));
    } catch {}
  }, [savedItemIds]);

  useEffect(() => {
    try {
      localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts));
    } catch {}
  }, [alerts]);

  const setUserPreferences = (prefs: UserPreferences) => {
    setUserPreferencesState(prefs);
  };

  const setFilters = (newFilters: Partial<FilterState>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFiltersState(DEFAULT_FILTERS);
  };

  const toggleSaveItem = (id: string) => {
    setSavedItemIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [id, ...prev]));
  };

  const isItemSaved = (id: string) => savedItemIds.includes(id);

  const addAlert = (rule: { label: string; keyword: string; category?: NewsCategory; geography?: string; minAmount?: string }) => {
    const newRule: AlertRule = {
      id: `alert-${Date.now()}`,
      label: rule.label,
      keyword: rule.keyword,
      category: rule.category,
      geography: rule.geography,
      minAmount: rule.minAmount,
      createdAt: new Date().toISOString().split('T')[0],
      active: true,
    };
    setAlerts((prev) => [newRule, ...prev]);
  };

  const removeAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const toggleAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a))
    );
  };

  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Fetch latest from server
      const res = await fetch('/api/breaking-ticker');
      if (res.ok) {
        // Updated successfully
      }
    } catch {}
    setTimeout(() => {
      setIsRefreshing(false);
      setAdminStatus((prev) => ({
        ...prev,
        lastSuccessfulUpdate: new Date().toISOString(),
      }));
    }, 600);
  }, []);

  // Filtered News Pipeline
  const filteredNews = useMemo(() => {
    return newsEvents.filter((item) => {
      // Query filter
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchesHeadline = item.headline.toLowerCase().includes(q);
        const matchesSummary = item.summary.toLowerCase().includes(q);
        const matchesCompany = item.companiesMentioned.some((c) => c.toLowerCase().includes(q));
        const matchesInvestor = item.investorsMentioned?.some((inv) => inv.toLowerCase().includes(q));
        const matchesSector = item.sector.toLowerCase().includes(q);
        const matchesSource = item.source.name.toLowerCase().includes(q);
        if (!matchesHeadline && !matchesSummary && !matchesCompany && !matchesInvestor && !matchesSector && !matchesSource) {
          return false;
        }
      }

      // Category filter
      if (filters.category !== 'all' && item.category !== filters.category) {
        return false;
      }

      // Geography filter
      if (filters.geography !== 'all') {
        const itemCountry = item.geography.country.toLowerCase();
        const itemState = item.geography.state?.toLowerCase() || '';
        const target = filters.geography.toLowerCase();
        if (!itemCountry.includes(target) && !itemState.includes(target)) {
          return false;
        }
      }

      // Stage filter
      if (filters.stage !== 'all' && item.fundingRound !== filters.stage) {
        return false;
      }

      // Source Tier filter
      if (filters.sourceTier !== 'all' && item.source.tier !== filters.sourceTier) {
        return false;
      }

      return true;
    });
  }, [newsEvents, filters]);

  // Personalized Feed Generator with "Why am I seeing this?" transparency
  const personalizedFeed = useMemo(() => {
    const list: { item: NewsEventItem; reason: string }[] = [];

    newsEvents.forEach((item) => {
      let matchedReason = '';

      if (item.geography.state?.toLowerCase() === userPreferences.state.toLowerCase()) {
        matchedReason = `Matches your registered state (${userPreferences.state}) and regional startup ecosystem.`;
      } else if (item.sector.toLowerCase().includes(userPreferences.industry.toLowerCase())) {
        matchedReason = `Matches your selected industry focus (${userPreferences.industry}).`;
      } else if (item.fundingRound === userPreferences.startupStage) {
        matchedReason = `Matches your startup stage (${userPreferences.startupStage}).`;
      } else if (userPreferences.interests.some((interest) => item.sector.toLowerCase().includes(interest.toLowerCase()) || item.headline.toLowerCase().includes(interest.toLowerCase()))) {
        matchedReason = `Matches your registered interests in ${userPreferences.interests.slice(0, 2).join(' & ')}.`;
      }

      if (matchedReason) {
        list.push({ item, reason: matchedReason });
      }
    });

    return list.length > 0 ? list : newsEvents.slice(0, 4).map((item) => ({ item, reason: 'Featured top intelligence report.' }));
  }, [newsEvents, userPreferences]);

  const contextValue = useMemo(
    () => ({
      newsEvents,
      startups,
      fundingEvents,
      investors,
      governmentSchemes,
      opportunities,
      events,
      problems,
      adminStatus,
      userPreferences,
      setUserPreferences,
      filters,
      setFilters,
      resetFilters,
      savedItemIds,
      toggleSaveItem,
      isItemSaved,
      alerts,
      addAlert,
      removeAlert,
      toggleAlert,
      isRefreshing,
      refreshData,
      filteredNews,
      personalizedFeed,
    }),
    [
      newsEvents,
      startups,
      fundingEvents,
      investors,
      governmentSchemes,
      opportunities,
      events,
      problems,
      adminStatus,
      userPreferences,
      filters,
      savedItemIds,
      alerts,
      isRefreshing,
      refreshData,
      filteredNews,
      personalizedFeed,
    ]
  );

  return (
    <IntelligenceContext.Provider value={contextValue}>
      {children}
    </IntelligenceContext.Provider>
  );
};

export const useIntelligence = () => {
  const context = useContext(IntelligenceContext);
  if (!context) {
    throw new Error('useIntelligence must be used within an IntelligenceProvider');
  }
  return context;
};
