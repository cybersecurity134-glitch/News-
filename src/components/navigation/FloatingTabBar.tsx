/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo } from 'react';
import { Home, Compass, LayoutGrid, HelpCircle, Bookmark, User } from 'lucide-react';
import { useQuiz } from '../../context/QuizContext';
import { useBookmarks } from '../../context/BookmarkContext';

export type TabId = 'home' | 'current-affairs' | 'categories' | 'quiz' | 'bookmarks' | 'profile';

interface FloatingTabBarProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
}

export const FloatingTabBar: React.FC<FloatingTabBarProps> = memo(({
  activeTab,
  onSelectTab,
}) => {
  const { state: quizState } = useQuiz();
  const { bookmarks } = useBookmarks();

  const navItems: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string | number }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'current-affairs', label: 'Timeline', icon: Compass },
    { id: 'categories', label: 'Topics', icon: LayoutGrid },
    {
      id: 'quiz',
      label: 'Quiz',
      icon: HelpCircle,
      badge: !quizState.isCompleted ? 'Daily' : undefined,
    },
    {
      id: 'bookmarks',
      label: 'Saved',
      icon: Bookmark,
      badge: bookmarks.length > 0 ? bookmarks.length : undefined,
    },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 px-3 sm:px-6 pb-3 pt-2 pointer-events-none safe-bottom">
      <nav
        className="max-w-lg mx-auto pointer-events-auto liquid-glass-nav rounded-full px-2 py-1.5 flex items-center justify-around gap-1 shadow-2xl specular-line"
        role="navigation"
        aria-label="Main Navigation"
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-2.5 sm:px-3 rounded-full tap-target-44 interactive-press transition-all duration-200 ${
                isActive
                  ? 'text-[var(--accent-primary)] font-bold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              title={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Active Glass Glow Indicator */}
              {isActive && (
                <span className="absolute inset-0 rounded-full bg-[var(--accent-primary)]/10 dark:bg-[var(--accent-primary)]/20 -z-10 animate-fade-in" />
              )}

              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2.5 px-1 min-w-[15px] h-3.5 rounded-full bg-[var(--accent-coral)] text-white text-[9px] font-extrabold flex items-center justify-center shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>

              <span className={`text-[10px] tracking-tight mt-0.5 ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
});

FloatingTabBar.displayName = 'FloatingTabBar';
