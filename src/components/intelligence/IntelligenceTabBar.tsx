/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo, useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  Zap,
  Rocket,
  DollarSign,
  Briefcase,
  Landmark,
  Award,
  Calendar,
  AlertTriangle,
  Bookmark,
  Sparkles,
  Grid,
  X,
  ChevronUp,
} from 'lucide-react';
import { useIntelligence } from '../../context/IntelligenceContext';

export type IntelligenceTab =
  | 'home'
  | 'breaking'
  | 'startups'
  | 'funding'
  | 'investors'
  | 'schemes'
  | 'opportunities'
  | 'events'
  | 'problems'
  | 'saved'
  | 'my-feed';

interface IntelligenceTabBarProps {
  activeTab: IntelligenceTab;
  onSelectTab: (tab: IntelligenceTab) => void;
}

export const IntelligenceTabBar: React.FC<IntelligenceTabBarProps> = memo(({
  activeTab,
  onSelectTab,
}) => {
  const { savedItemIds } = useIntelligence();
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  const allTabs: { id: IntelligenceTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'my-feed', label: 'My Feed', icon: Sparkles },
    { id: 'funding', label: 'Funding', icon: DollarSign },
    { id: 'startups', label: 'Startups', icon: Rocket },
    { id: 'schemes', label: 'Govt Schemes', icon: Landmark },
    { id: 'investors', label: 'Investors', icon: Briefcase },
    { id: 'opportunities', label: 'Grants', icon: Award },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'problems', label: 'Problems', icon: AlertTriangle },
    { id: 'saved', label: 'Saved', icon: Bookmark, badge: savedItemIds.length > 0 ? savedItemIds.length : undefined },
  ];

  // Core 4 tabs shown permanently on mobile
  const mobileCoreTabs = allTabs.slice(0, 4);
  // Secondary tabs shown inside the "More" mobile drawer
  const mobileSecondaryTabs = allTabs.slice(4);

  // Check if active tab is in secondary set
  const isSecondaryActive = mobileSecondaryTabs.some((t) => t.id === activeTab);
  const activeSecondaryItem = mobileSecondaryTabs.find((t) => t.id === activeTab);

  // Close drawer on outside click or escape
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setShowMobileDrawer(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowMobileDrawer(false);
      }
    };
    if (showMobileDrawer) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showMobileDrawer]);

  const handleSelect = (tab: IntelligenceTab) => {
    onSelectTab(tab);
    setShowMobileDrawer(false);
  };

  return (
    <>
      {/* Mobile Drawer Backdrop and Sheet */}
      {showMobileDrawer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden animate-fade-in flex flex-col justify-end p-3 pb-20 safe-bottom">
          <div
            ref={drawerRef}
            className="w-full max-w-md mx-auto liquid-glass-modal rounded-3xl p-5 shadow-2xl space-y-4 border border-white/20 dark:border-white/10"
          >
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center gap-2">
                <Grid className="w-4 h-4 text-[var(--accent-primary)]" />
                <span className="font-extrabold text-sm text-[var(--text-primary)]">
                  All Intelligence Hubs
                </span>
              </div>
              <button
                onClick={() => setShowMobileDrawer(false)}
                className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-[var(--text-secondary)]"
                aria-label="Close hubs menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {mobileSecondaryTabs.map((item) => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`p-3 rounded-2xl flex items-center gap-2.5 text-left transition-all tap-target-44 ${
                      isActive
                        ? 'bg-[var(--color-primary)] text-white shadow-md font-bold'
                        : 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[var(--color-text-primary)]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate flex-1 font-semibold">{item.label}</span>
                    {item.badge !== undefined && (
                      <span className="px-1.5 py-0.2 rounded-full bg-[var(--color-error)] text-white text-[9px] font-extrabold">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Tab Bar Dock */}
      <div className="fixed bottom-0 inset-x-0 z-40 px-2 sm:px-6 pb-2.5 pt-2 pointer-events-none safe-bottom">
        <nav
          className="max-w-4xl mx-auto pointer-events-auto liquid-glass-nav rounded-2xl sm:rounded-full px-2 sm:px-3 py-1.5 flex items-center justify-around md:justify-between shadow-2xl specular-line"
          role="navigation"
          aria-label="Intelligence Navigation"
        >
          {/* MOBILE VIEW (< 768px): 4 Core tabs + 1 "More" hub button */}
          <div className="flex md:hidden items-center justify-between w-full">
            {mobileCoreTabs.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-full tap-target-44 interactive-press transition-all shrink-0 ${
                    isActive
                      ? 'text-[var(--color-primary)] font-bold'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {isActive && (
                    <span className="absolute inset-0 rounded-full bg-[var(--color-primary-subtle)] -z-10 animate-fade-in" />
                  )}
                  <Icon className={`w-4 h-4 transition-transform ${isActive ? 'scale-110' : ''}`} />
                  <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">
                    {item.label}
                  </span>
                </button>
              );
            })}

            {/* 5th slot: More Hubs button */}
            <button
              onClick={() => setShowMobileDrawer((prev) => !prev)}
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-full tap-target-44 interactive-press transition-all shrink-0 ${
                isSecondaryActive || showMobileDrawer
                  ? 'text-[var(--color-primary)] font-bold'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
              aria-label="More categories"
              aria-expanded={showMobileDrawer}
            >
              {(isSecondaryActive || showMobileDrawer) && (
                <span className="absolute inset-0 rounded-full bg-[var(--color-primary-subtle)] -z-10 animate-fade-in" />
              )}
              <div className="relative">
                {isSecondaryActive && activeSecondaryItem ? (
                  React.createElement(activeSecondaryItem.icon, { className: 'w-4 h-4 scale-110' })
                ) : (
                  <Grid className="w-4 h-4" />
                )}
                {savedItemIds.length > 0 && !isSecondaryActive && (
                  <span className="absolute -top-1.5 -right-2 px-1 min-w-[12px] h-3 rounded-full bg-[var(--color-error)] text-white text-[8px] font-extrabold flex items-center justify-center">
                    {savedItemIds.length}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">
                {isSecondaryActive && activeSecondaryItem ? activeSecondaryItem.label : 'More'}
              </span>
            </button>
          </div>

          {/* TABLET & DESKTOP VIEW (>= 768px): All 10 hubs in spacious layout */}
          <div className="hidden md:flex items-center justify-between w-full gap-1">
            {allTabs.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`relative flex flex-col items-center justify-center py-1 px-2.5 lg:px-3 rounded-full tap-target-44 interactive-press transition-all shrink-0 ${
                    isActive
                      ? 'text-[var(--color-primary)] font-bold'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                  }`}
                  title={item.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {isActive && (
                    <span className="absolute inset-0 rounded-full bg-[var(--color-primary-subtle)] -z-10 animate-fade-in" />
                  )}

                  <div className="relative">
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                    {item.badge !== undefined && (
                      <span className="absolute -top-1.5 -right-2 px-1 min-w-[14px] h-3 rounded-full bg-[var(--color-error)] text-white text-[9px] font-extrabold flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
});

IntelligenceTabBar.displayName = 'IntelligenceTabBar';

