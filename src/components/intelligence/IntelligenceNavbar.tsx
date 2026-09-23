/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo, useState, useEffect, useRef } from 'react';
import {
  Search,
  Bell,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  Sun,
  Moon,
  Sparkles,
  RefreshCw,
  LogIn,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Camera,
  Plus,
  MoreVertical,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useIntelligence } from '../../context/IntelligenceContext';
import { useAuth } from '../../context/AuthContext';

interface IntelligenceNavbarProps {
  onOpenSearch: () => void;
  onOpenAlerts: () => void;
  onOpenPreferences: () => void;
  onOpenAdmin: () => void;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
  onOpenAddNews: () => void;
}

export const IntelligenceNavbar: React.FC<IntelligenceNavbarProps> = memo(({
  onOpenSearch,
  onOpenAlerts,
  onOpenPreferences,
  onOpenAdmin,
  onOpenAuth,
  onOpenAddNews,
}) => {
  const { isDark, toggleTheme } = useTheme();
  const { alerts, isRefreshing, refreshData } = useIntelligence();
  const { currentUser, isAdmin, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMore, setShowMobileMore] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const activeAlertsCount = alerts.filter((a) => a.active).length;

  // Close menus on outside click or escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setShowMobileMore(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowUserMenu(false);
        setShowMobileMore(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleAdminClick = () => {
    setShowUserMenu(false);
    setShowMobileMore(false);
    if (!currentUser) {
      onOpenAuth('login');
      return;
    }
    if (isAdmin) {
      onOpenAdmin();
    } else {
      onOpenAuth('login');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full px-2 sm:px-6 pt-2 sm:pt-3 pb-2 safe-top">
      <div className="max-w-7xl mx-auto liquid-glass-nav rounded-2xl sm:rounded-full px-3 sm:px-5 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-3 specular-line">
        {/* Brand & Live Source Badge */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[var(--color-primary)] p-0.5 shadow-sm shrink-0 flex items-center justify-center">
            <div className="w-full h-full rounded-[10px] bg-white/15 flex items-center justify-center text-white font-bold text-sm">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight text-sm sm:text-lg text-[var(--color-text-primary)] truncate font-display">
                VenturePulse
              </span>
              <span className="hidden sm:inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full badge-info">
                Verified Terminal
              </span>
            </div>
            <p className="hidden md:block text-[11px] font-medium text-[var(--color-text-secondary)] truncate">
              100% Real External Sources · Zero-Hallucination
            </p>
          </div>
        </div>

        {/* Global Action Tools */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Quick Search */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] tap-target-44 interactive-press transition-colors"
            title="Search verified startups, funding, schemes (⌘K)"
            aria-label="Search intelligence"
          >
            <Search className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
            <span className="hidden md:inline font-medium">Search Intelligence...</span>
            <kbd className="hidden lg:inline text-[10px] px-1.5 py-0.5 rounded-md bg-black/5 dark:bg-white/10 text-[var(--color-text-tertiary)] font-mono">
              ⌘K
            </kbd>
          </button>

          {/* Add News Camera & Upload Button */}
          <button
            onClick={onOpenAddNews}
            className="px-3 sm:px-4 py-1.5 rounded-full btn-classic-primary text-xs flex items-center gap-1.5 tap-target-44 shrink-0"
            title="Photograph or upload news for OCR and verification"
            aria-label="Add News"
          >
            <Camera className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden xs:inline sm:inline font-extrabold">Add News</span>
          </button>

          {/* Alerts Center */}
          <button
            onClick={onOpenAlerts}
            className="relative p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] tap-target-44 interactive-press"
            title="Manage Intelligence Alerts"
            aria-label="Alerts"
          >
            <Bell className="w-4 h-4" />
            {activeAlertsCount > 0 && (
              <span className="absolute top-1 right-1 px-1 min-w-[14px] h-3.5 rounded-full bg-[var(--color-error)] text-white text-[9px] font-extrabold flex items-center justify-center">
                {activeAlertsCount}
              </span>
            )}
          </button>

          {/* Tablet & Desktop: Live Data Refresh */}
          <button
            onClick={() => refreshData()}
            disabled={isRefreshing}
            className="hidden sm:inline-flex p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] tap-target-44 interactive-press transition-colors"
            title="Refresh verified streams from official sources"
            aria-label="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[var(--color-primary)]' : ''}`} />
          </button>

          {/* Tablet & Desktop: Founder Preferences */}
          <button
            onClick={onOpenPreferences}
            className="hidden sm:inline-flex p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] tap-target-44 interactive-press"
            title="Personalize Feed & Region"
            aria-label="Personalization"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {/* Tablet & Desktop: Admin Dashboard Console Button */}
          <button
            onClick={handleAdminClick}
            className={`hidden sm:inline-flex px-3 py-1.5 rounded-full text-xs font-bold items-center gap-1.5 transition-all tap-target-44 ${
              isAdmin
                ? 'bg-[var(--color-primary)] text-white shadow-xs'
                : 'hover:bg-black/5 dark:hover:bg-white/10 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
            title={isAdmin ? 'Administrator Management Console' : 'Sign in as Admin to access management console'}
            aria-label="Admin Console"
          >
            {isAdmin ? <ShieldCheck className="w-4 h-4 text-white" /> : <Shield className="w-4 h-4 text-[var(--color-primary)]" />}
            <span className="hidden md:inline">{isAdmin ? 'Admin Console' : 'Admin'}</span>
          </button>

          {/* Tablet & Desktop: User Authentication & Account Menu */}
          {currentUser ? (
            <div className="relative hidden sm:block" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 text-xs text-[var(--color-text-primary)] transition-colors tap-target-44"
                aria-expanded={showUserMenu}
                aria-haspopup="true"
              >
                <div className="w-6 h-6 rounded-full bg-[var(--color-primary-subtle)] text-[var(--color-primary)] font-extrabold flex items-center justify-center text-[10px]">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : currentUser.email.charAt(0).toUpperCase()}
                </div>
                <span className="hidden lg:inline font-bold max-w-[85px] truncate">
                  {currentUser.name || currentUser.email.split('@')[0]}
                </span>
                <ChevronDown className="w-3 h-3 text-[var(--color-text-tertiary)]" />
              </button>

              {showUserMenu && (
                <div
                  className="absolute right-0 mt-2 w-56 liquid-glass-modal rounded-2xl p-2 shadow-2xl border border-[var(--color-border)] space-y-1 z-50 animate-fade-in"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 space-y-0.5">
                    <p className="text-xs font-extrabold text-[var(--color-text-primary)] truncate">
                      {currentUser.name || 'Member'}
                    </p>
                    <p className="text-[11px] font-mono text-[var(--color-text-secondary)] truncate">
                      {currentUser.email}
                    </p>
                    <div className="pt-1 flex items-center gap-1.5">
                      <span
                        className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase ${
                          isAdmin
                            ? 'bg-[var(--color-primary-subtle)] text-[var(--color-primary)]'
                            : 'bg-black/10 dark:bg-white/10 text-[var(--color-text-secondary)]'
                        }`}
                      >
                        {currentUser.role}
                      </span>
                      <span className="text-[9px] text-[var(--color-success)] font-bold uppercase">
                        ● {currentUser.status}
                      </span>
                    </div>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenAdmin();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-xs font-bold text-[var(--color-text-primary)] flex items-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4 text-[var(--color-primary)]" />
                      <span>Open Admin Console</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-[var(--color-error-bg)] text-xs font-bold text-[var(--color-error)] flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3.5 py-1.5 rounded-full btn-classic-secondary text-xs flex items-center gap-1.5 tap-target-44"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            </div>
          )}

          {/* Tablet & Desktop: Theme switcher */}
          <button
            onClick={toggleTheme}
            className="hidden sm:inline-flex p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] tap-target-44 interactive-press"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Mobile Phone (< 640px): Compact Overflow & Account Menu */}
          <div className="relative sm:hidden" ref={mobileMenuRef}>
            <button
              onClick={() => setShowMobileMore(!showMobileMore)}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[var(--color-text-primary)] tap-target-44 interactive-press"
              aria-label="More options"
              aria-expanded={showMobileMore}
            >
              {currentUser ? (
                <div className="w-6 h-6 rounded-full bg-[var(--color-primary-subtle)] text-[var(--color-primary)] font-extrabold flex items-center justify-center text-[10px]">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : currentUser.email.charAt(0).toUpperCase()}
                </div>
              ) : (
                <MoreVertical className="w-4 h-4" />
              )}
            </button>

            {showMobileMore && (
              <div
                className="absolute right-0 mt-2 w-64 liquid-glass-modal rounded-2xl p-2.5 shadow-2xl border border-[var(--color-border)] space-y-2 z-50 animate-fade-in"
                onClick={(e) => e.stopPropagation()}
              >
                {/* User Info (if logged in) */}
                {currentUser ? (
                  <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 space-y-0.5">
                    <p className="text-xs font-extrabold text-[var(--color-text-primary)] truncate">
                      {currentUser.name || 'Member'}
                    </p>
                    <p className="text-[11px] font-mono text-[var(--color-text-secondary)] truncate">
                      {currentUser.email}
                    </p>
                    <span className="inline-block mt-1 text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-[var(--color-primary-subtle)] text-[var(--color-primary)] uppercase">
                      {currentUser.role}
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setShowMobileMore(false);
                      onOpenAuth('login');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl btn-classic-primary text-xs flex items-center gap-2 shadow-xs"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In / Create Account</span>
                  </button>
                )}

                <div className="space-y-1 pt-1 border-t border-[var(--color-border-subtle)]">
                  {/* Preferences */}
                  <button
                    onClick={() => {
                      setShowMobileMore(false);
                      onOpenPreferences();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-xs font-medium text-[var(--color-text-primary)] flex items-center gap-2.5 tap-target-44"
                  >
                    <SlidersHorizontal className="w-4 h-4 text-[var(--color-primary)]" />
                    <span>Founder Preferences & Region</span>
                  </button>

                  {/* Refresh */}
                  <button
                    onClick={() => {
                      setShowMobileMore(false);
                      refreshData();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-xs font-medium text-[var(--color-text-primary)] flex items-center gap-2.5 tap-target-44"
                  >
                    <RefreshCw className={`w-4 h-4 text-[var(--color-primary)] ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span>Refresh Verified Feeds</span>
                  </button>

                  {/* Theme Switcher */}
                  <button
                    onClick={() => {
                      toggleTheme();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-xs font-medium text-[var(--color-text-primary)] flex items-center justify-between tap-target-44"
                  >
                    <div className="flex items-center gap-2.5">
                      {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
                      <span>{isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
                    </div>
                  </button>

                  {/* Admin Console */}
                  <button
                    onClick={handleAdminClick}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-xs font-medium text-[var(--color-text-primary)] flex items-center gap-2.5 tap-target-44"
                  >
                    <ShieldCheck className="w-4 h-4 text-[var(--color-primary)]" />
                    <span>Admin Management Console</span>
                  </button>

                  {/* Logout */}
                  {currentUser && (
                    <button
                      onClick={() => {
                        setShowMobileMore(false);
                        logout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-[var(--color-error-bg)] text-xs font-bold text-[var(--color-error)] flex items-center gap-2.5 tap-target-44"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
});

IntelligenceNavbar.displayName = 'IntelligenceNavbar';

