/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { NotificationBell } from './NotificationBell';
import { AuthModal } from './AuthModal';
import { Moon, Sun, LogIn, LogOut, ShieldCheck, Search, X } from 'lucide-react';

interface NavbarProps {
  onNavigateTab?: (tab: string) => void;
  onSearchChange?: (query: string) => void;
  searchQuery?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigateTab, onSearchChange, searchQuery = '' }) => {
  const { currentUser, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header
      id="ios-navbar"
      className="sticky top-0 z-40 w-full backdrop-blur-md bg-[var(--color-bg)]/92 border-b border-[var(--color-border)] transition-colors"
    >
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        {/* Editorial Wordmark */}
        <div
          onClick={() => {
            if (onNavigateTab) onNavigateTab('feed');
          }}
          className="flex items-center gap-2 cursor-pointer select-none shrink-0"
        >
          <div className="flex items-center gap-1.5">
            <span className="font-serif text-2xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
              VenturePulse
            </span>
            <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] mb-1 inline-block" />
          </div>
          <span className="hidden md:inline-block ml-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--color-verified)]/15 text-[var(--color-verified)]">
            Verified Sourced
          </span>
        </div>

        {/* Search Bar / Search Toggle */}
        <div className="flex-1 max-w-sm hidden sm:block">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              placeholder="Search news, rounds, schemes..."
              className="w-full pl-8 pr-3 py-1.5 rounded-full bg-[var(--color-card-bg)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] outline-none focus:border-[var(--color-accent)] transition-colors"
            />
            <Search className="w-3.5 h-3.5 text-[var(--color-text-secondary)] absolute left-2.5 top-2.5" />
            {searchQuery && (
              <button
                onClick={() => onSearchChange && onSearchChange('')}
                className="absolute right-2.5 top-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Controls: Search icon (mobile), theme toggle, notification bell, auth */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Mobile search toggle */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="sm:hidden p-2 rounded-full text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            aria-label="Toggle Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            aria-label="Toggle Theme"
            title={isDark ? 'Switch to Light' : 'Switch to Dark'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications Bell */}
          <NotificationBell
            onNavigate={(target) => {
              if (onNavigateTab && target.tab) onNavigateTab(target.tab);
            }}
          />

          {/* User Status / Login */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-1">
              <div className="flex items-center gap-2">
                <img
                  src={
                    currentUser.avatarUrl ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
                  }
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover border border-[var(--color-border)]"
                />
                <div className="hidden sm:flex flex-col text-left">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-[var(--color-text-primary)] leading-tight truncate max-w-[90px]">
                      {currentUser.name}
                    </span>
                    {currentUser.role === 'admin' && (
                      <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                    )}
                  </div>
                  <span className="text-[10px] uppercase font-semibold text-[var(--color-text-secondary)]">
                    {currentUser.role}
                  </span>
                </div>
              </div>

              <button
                onClick={logout}
                className="p-1.5 rounded-full text-[var(--color-text-secondary)] hover:text-red-500 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-accent)] text-[#0B1F3A] text-xs font-bold hover:opacity-95 transition-opacity"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile search expanded input */}
      {isSearchOpen && (
        <div className="sm:hidden px-4 pb-3 pt-1 border-t border-[var(--color-border)]">
          <div className="relative">
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              placeholder="Search news, rounds, schemes..."
              className="w-full pl-8 pr-8 py-2 rounded-full bg-[var(--color-card-bg)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
            />
            <Search className="w-3.5 h-3.5 text-[var(--color-text-secondary)] absolute left-2.5 top-3" />
            {searchQuery && (
              <button
                onClick={() => onSearchChange && onSearchChange('')}
                className="absolute right-3 top-2.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultRole="uploader"
      />
    </header>
  );
};
