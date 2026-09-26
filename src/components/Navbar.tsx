/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { UserProfile, AppNotification } from '../types';
import { Bell, Sun, Moon, PlusCircle } from 'lucide-react';

interface NavbarProps {
  currentUser: UserProfile | null;
  notifications: AppNotification[];
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenSubmit: () => void;
  onOpenNotifications: () => void;
  onOpenAuthModal: (role?: 'viewer' | 'uploader') => void;
  onLogout: () => void;
  onNavigateProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  notifications,
  isDark,
  onToggleTheme,
  onOpenSubmit,
  onOpenNotifications,
}) => {
  const unreadNotifsCount = notifications.filter(
    (n) => (n.userId === currentUser?.id || n.userId === 'all') && !n.read
  ).length;

  return (
    <header
      id="ios-navbar"
      className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[var(--glass-nav-bg)] border-b border-[var(--glass-nav-border)] transition-colors"
    >
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        {/* Logo & Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[var(--color-primary)] flex items-center justify-center text-[var(--color-primary-fg)] font-bold text-sm shadow-xs">
            VP
          </div>
          <div className="flex flex-col">
            <span className="ios-headline text-base tracking-tight text-[var(--color-text-primary)]">
              VenturePulse
            </span>
            <span className="text-[10px] text-[var(--color-text-secondary)] -mt-1 font-medium hidden sm:block">
              Curated Startup Intelligence
            </span>
          </div>
        </div>

        {/* Action Center */}
        <div className="flex items-center gap-2">
          {/* Submit News Button */}
          <button
            id="navbar-submit-btn"
            onClick={onOpenSubmit}
            className="px-3.5 py-1.5 rounded-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-primary-fg)] text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all active:scale-98"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Submit News</span>
            <span className="sm:hidden">Submit</span>
          </button>

          {/* Notification Bell */}
          <button
            id="navbar-notif-btn"
            onClick={onOpenNotifications}
            className="relative p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[var(--color-text-primary)] transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifsCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[var(--color-error)] text-[var(--color-primary-fg)] text-[10px] font-bold flex items-center justify-center">
                {unreadNotifsCount > 9 ? '9+' : unreadNotifsCount}
              </span>
            )}
          </button>

          {/* Light / Dark Mode Toggle */}
          <button
            id="navbar-theme-toggle"
            onClick={onToggleTheme}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[var(--color-text-primary)] transition-colors"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
};
