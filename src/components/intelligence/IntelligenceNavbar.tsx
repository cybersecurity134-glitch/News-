/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo, useState, useEffect, useRef } from 'react';
import { GlobeLogo } from '../brand/GlobeLogo';
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
  Palette,
  Check,
  Settings,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useIntelligence } from '../../context/IntelligenceContext';
import { useAuth } from '../../context/AuthContext';
import { ThemeSelectorDropdown, PALETTES_META } from '../theme/ThemeSelectorDropdown';

interface IntelligenceNavbarProps {
  onOpenSearch: () => void;
  onOpenAlerts: () => void;
  onOpenPreferences: () => void;
  onOpenAdmin: () => void;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
  onOpenAddNews: () => void;
  onOpenSettings?: () => void;
}

export const IntelligenceNavbar: React.FC<IntelligenceNavbarProps> = memo(({
  onOpenSearch,
  onOpenAlerts,
  onOpenPreferences,
  onOpenAdmin,
  onOpenAuth,
  onOpenAddNews,
  onOpenSettings,
}) => {
  const { isDark, toggleTheme, palette, setPalette } = useTheme();
  const { alerts, isRefreshing, refreshData } = useIntelligence();
  const { currentUser, isAdmin, logout } = useAuth();
  const [showMobileMore, setShowMobileMore] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const activeAlertsCount = alerts.filter((a) => a.active).length;

  // Close menus on outside click or escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setShowMobileMore(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
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
        {/* Brand & Live Source Badge (Long-press toggles 175Hz FPS Debug Overlay) */}
        <div
          id="brand-logo"
          data-longpress-fps="true"
          className="flex items-center gap-2 sm:gap-3 min-w-0 cursor-pointer select-none group"
          title="VenturePulse — Long-press to toggle 175Hz FPS monitor (or Shift+F)"
        >
          <div className="relative shrink-0 transition-transform duration-300 group-hover:scale-105 active:scale-95">
            <GlobeLogo size={36} className="sm:w-10 sm:h-10" />
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
            className="w-9 h-9 sm:w-auto sm:h-10 px-0 sm:px-3 rounded-full flex items-center justify-center gap-1.5 border border-[var(--color-border-subtle)] bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 hover:border-[var(--color-primary-border)] hover:shadow-xs text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] active:scale-95 transition-all cursor-pointer select-none"
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
            className="w-9 h-9 sm:w-auto sm:h-10 px-0 sm:px-3.5 rounded-full flex items-center justify-center gap-1.5 btn-classic-primary text-xs shadow-xs hover:shadow-sm active:scale-95 transition-all cursor-pointer select-none shrink-0"
            title="Photograph or upload news for OCR and verification"
            aria-label="Add News"
          >
            <Camera className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline font-extrabold leading-none">Add News</span>
          </button>

          {/* Alerts Center */}
          <button
            onClick={onOpenAlerts}
            className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border border-[var(--color-border-subtle)] bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-primary-border)] hover:shadow-xs active:scale-95 transition-all cursor-pointer select-none"
            title="Manage Intelligence Alerts"
            aria-label="Alerts"
          >
            <Bell className="w-4 h-4 transition-transform group-hover:scale-110" />
            {activeAlertsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 px-1 min-w-[15px] h-3.5 rounded-full bg-[var(--color-error)] text-white text-[9px] font-extrabold flex items-center justify-center ring-2 ring-[var(--color-surface)]">
                {activeAlertsCount}
              </span>
            )}
          </button>

          {/* Tablet & Desktop: Live Data Refresh */}
          <button
            onClick={() => refreshData()}
            disabled={isRefreshing}
            className="hidden sm:flex w-9 h-9 sm:w-10 sm:h-10 rounded-full items-center justify-center border border-[var(--color-border-subtle)] bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-primary-border)] hover:shadow-xs active:scale-95 transition-all cursor-pointer select-none disabled:opacity-50"
            title="Refresh verified streams from official sources"
            aria-label="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 transition-transform ${isRefreshing ? 'animate-spin text-[var(--color-primary)]' : 'hover:rotate-45'}`} />
          </button>

          {/* Tablet & Desktop: Founder Preferences */}
          <button
            onClick={onOpenPreferences}
            className="hidden sm:flex w-9 h-9 sm:w-10 sm:h-10 rounded-full items-center justify-center border border-[var(--color-border-subtle)] bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-primary-border)] hover:shadow-xs active:scale-95 transition-all cursor-pointer select-none"
            title="Personalize Feed & Region"
            aria-label="Personalization"
          >
            <SlidersHorizontal className="w-4 h-4 transition-transform hover:scale-110" />
          </button>

          {/* Tablet & Desktop: Settings & Appearance */}
          <button
            onClick={onOpenSettings}
            className="hidden sm:flex w-9 h-9 sm:w-10 sm:h-10 rounded-full items-center justify-center border border-[var(--color-border-subtle)] bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-primary-border)] hover:shadow-xs active:scale-95 transition-all cursor-pointer select-none"
            title="Settings & Appearance (Theme, Colors, Typography)"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4 transition-transform hover:rotate-45" />
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
          {!currentUser && (
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

          {/* Tablet & Desktop: Theme & Palette Customizer */}
          <div className="hidden sm:block">
            <ThemeSelectorDropdown align="right" />
          </div>

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
                className="absolute right-0 mt-2 w-72 liquid-glass-modal rounded-3xl p-3 shadow-2xl border border-[var(--color-border)] space-y-2.5 z-50 animate-fade-in"
                onClick={(e) => e.stopPropagation()}
              >
                {/* User Info (if logged in) */}
                {currentUser ? (
                  <div className="p-2.5 rounded-2xl bg-black/5 dark:bg-white/5 space-y-0.5">
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
                    className="w-full text-left px-3 py-2 rounded-2xl btn-classic-primary text-xs flex items-center gap-2 shadow-xs"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In / Create Account</span>
                  </button>
                )}

                {/* Mobile Palette Selector Row */}
                <div className="p-2.5 rounded-2xl bg-black/5 dark:bg-white/5 space-y-1.5 border border-[var(--color-border-subtle)]">
                  <div className="flex items-center justify-between text-[11px] font-bold text-[var(--color-text-secondary)]">
                    <span className="flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                      Visual Palette
                    </span>
                    <button
                      onClick={() => toggleTheme()}
                      className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-[var(--color-text-primary)]"
                      title={isDark ? 'Switch to Light' : 'Switch to Dark'}
                    >
                      {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-1 pt-1">
                    {PALETTES_META.map((p) => {
                      const isSelected = palette === p.id;
                      const dotColor = isDark ? p.primaryDark : p.primaryLight;
                      return (
                        <button
                          key={p.id}
                          onClick={() => setPalette(p.id)}
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                            isSelected
                              ? 'ring-2 ring-[var(--color-primary)] scale-110 shadow-sm'
                              : 'opacity-80 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: dotColor }}
                          title={p.name}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1 pt-1 border-t border-[var(--color-border-subtle)]">
                  {/* Settings & Appearance */}
                  <button
                    onClick={() => {
                      setShowMobileMore(false);
                      onOpenSettings?.();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-xs font-medium text-[var(--color-text-primary)] flex items-center gap-2.5 tap-target-44"
                  >
                    <Settings className="w-4 h-4 text-[var(--color-primary)]" />
                    <span>Settings & Appearance</span>
                  </button>

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

