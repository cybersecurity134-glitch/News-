/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo } from 'react';
import { Search, Bell, Sparkles, Sun, Moon, Laptop } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  unreadCount?: number;
}

export const Navbar: React.FC<NavbarProps> = memo(({
  onOpenSearch,
  onOpenNotifications,
  onOpenProfile,
  unreadCount = 2,
}) => {
  const { isDark, themeMode, toggleTheme } = useTheme();

  // Format today's date in iOS style
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  return (
    <header className="sticky top-0 z-40 w-full px-3 sm:px-6 pt-3 pb-2 safe-top">
      <div className="max-w-6xl mx-auto liquid-glass-nav rounded-2xl sm:rounded-full px-4 sm:px-5 py-2.5 flex items-center justify-between gap-3 specular-line">
        {/* Brand & Date */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0071E3] via-[#5856D6] to-[#00C7BE] p-0.5 shadow-sm shrink-0 flex items-center justify-center">
            <div className="w-full h-full rounded-[10px] bg-white/20 backdrop-blur-xs flex items-center justify-center text-white font-bold text-sm">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight text-base sm:text-lg text-[var(--text-primary)]">
                VenturePulse
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--accent-primary)]/15 text-[var(--accent-primary)]">
                2026
              </span>
            </div>
            <p className="text-[11px] font-medium text-[var(--text-secondary)] truncate">
              {todayFormatted} · Daily Edition
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Search Button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] tap-target-44 interactive-press transition-colors"
            title="Search news, topics, and facts"
            aria-label="Search"
          >
            <Search className="w-4 h-4 text-[var(--accent-primary)]" />
            <span className="hidden md:inline font-medium">Search current affairs...</span>
            <kbd className="hidden lg:inline text-[10px] px-1.5 py-0.5 rounded-md bg-black/5 dark:bg-white/10 text-[var(--text-tertiary)]">
              ⌘K
            </kbd>
          </button>

          {/* Quick Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] tap-target-44 interactive-press transition-colors"
            title={`Current theme: ${themeMode}. Tap to switch.`}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-[var(--color-warning)]" />
            ) : (
              <Moon className="w-4 h-4 text-[var(--color-primary)]" />
            )}
          </button>

          {/* Notifications Drawer Trigger */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] tap-target-44 interactive-press transition-colors"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--accent-coral)] ring-2 ring-[var(--bg-base)] animate-pulse" />
            )}
          </button>

          {/* Profile Button */}
          <button
            onClick={onOpenProfile}
            className="p-1 rounded-full ring-2 ring-transparent hover:ring-[var(--accent-primary)]/40 tap-target-44 interactive-press transition-all"
            title="My Profile & Streaks"
            aria-label="User Profile"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
              VP
            </div>
          </button>
        </div>
      </div>
    </header>
  );
});

Navbar.displayName = 'Navbar';
