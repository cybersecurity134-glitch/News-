/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  User,
  Sun,
  Moon,
  Laptop,
  Flame,
  Award,
  BookOpen,
  Volume2,
  Bell,
  HardDrive,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useQuiz } from '../context/QuizContext';
import { useBookmarks } from '../context/BookmarkContext';
import { ThemeOption } from '../types/news';

export const ProfilePage: React.FC = () => {
  const { themeMode, setThemeMode } = useTheme();
  const { state: quizState, accuracyRate } = useQuiz();
  const { bookmarks, readingHistory, clearAllBookmarks, clearHistory } = useBookmarks();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [offlineCached, setOfflineCached] = useState(true);
  const [cacheClearSuccess, setCacheClearSuccess] = useState(false);

  const handleClearCache = () => {
    clearAllBookmarks();
    clearHistory();
    setCacheClearSuccess(true);
    setTimeout(() => setCacheClearSuccess(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 animate-fade-in">
      {/* Profile Header */}
      <div className="liquid-glass-card p-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-600 p-0.5 shrink-0 shadow-lg">
          <div className="w-full h-full rounded-[22px] bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-black text-xl">
            VP
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-xl text-[var(--text-primary)]">
              Civil Reader Account
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent-primary)]/15 text-[var(--accent-primary)]">
              Verified
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Member since September 2026 · iOS 26 Liquid Edition
          </p>
        </div>
      </div>

      {/* Metrics & Streak Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="liquid-glass-card p-4 text-center">
          <Flame className="w-5 h-5 mx-auto text-rose-500 mb-1" />
          <span className="block text-xl font-black text-[var(--text-primary)] tabular-nums">
            {quizState.streakDays}d
          </span>
          <span className="text-[11px] text-[var(--text-secondary)] font-medium">Daily Streak</span>
        </div>

        <div className="liquid-glass-card p-4 text-center">
          <Award className="w-5 h-5 mx-auto text-amber-500 mb-1" />
          <span className="block text-xl font-black text-[var(--text-primary)] tabular-nums">
            {accuracyRate}%
          </span>
          <span className="text-[11px] text-[var(--text-secondary)] font-medium">Quiz Accuracy</span>
        </div>

        <div className="liquid-glass-card p-4 text-center">
          <BookOpen className="w-5 h-5 mx-auto text-[var(--accent-primary)] mb-1" />
          <span className="block text-xl font-black text-[var(--text-primary)] tabular-nums">
            {readingHistory.length}
          </span>
          <span className="text-[11px] text-[var(--text-secondary)] font-medium">Stories Read</span>
        </div>

        <div className="liquid-glass-card p-4 text-center">
          <HardDrive className="w-5 h-5 mx-auto text-[var(--accent-teal)] mb-1" />
          <span className="block text-xl font-black text-[var(--text-primary)] tabular-nums">
            {bookmarks.length}
          </span>
          <span className="text-[11px] text-[var(--text-secondary)] font-medium">Offline Saved</span>
        </div>
      </div>

      {/* Theme Preference (Light / Dark / System Default) */}
      <div className="liquid-glass-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Sun className="w-4 h-4 text-amber-500" />
          <h2 className="font-extrabold text-sm text-[var(--text-primary)] uppercase tracking-wider">
            Display Appearance
          </h2>
        </div>
        <p className="text-xs text-[var(--text-secondary)]">
          Choose your interface style. Changes apply immediately with zero flickering.
        </p>

        <div className="grid grid-cols-3 gap-2.5 pt-1">
          {[
            { id: 'light' as ThemeOption, label: 'Light', icon: Sun },
            { id: 'dark' as ThemeOption, label: 'Dark', icon: Moon },
            { id: 'system' as ThemeOption, label: 'System', icon: Laptop },
          ].map((t) => {
            const Icon = t.icon;
            const isSelected = themeMode === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setThemeMode(t.id)}
                className={`p-3 rounded-2xl border text-center transition-all tap-target-44 flex flex-col items-center gap-2 ${
                  isSelected
                    ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] shadow-sm'
                    : 'bg-white/40 dark:bg-white/5 hover:bg-white/70 dark:hover:bg-white/10 border-white/40 dark:border-white/10 text-[var(--text-secondary)]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-bold">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reading & Audio Preferences */}
      <div className="liquid-glass-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-[var(--accent-primary)]" />
          <h2 className="font-extrabold text-sm text-[var(--text-primary)] uppercase tracking-wider">
            Audio & Accessibility
          </h2>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)]">
            <div>
              <span className="font-bold text-[var(--text-primary)] block">Push Notifications</span>
              <span className="text-[11px] text-[var(--text-secondary)]">
                Breaking news alerts and evening quiz reminders
              </span>
            </div>
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={(e) => setNotificationsEnabled(e.target.checked)}
              className="w-4 h-4 accent-[var(--accent-primary)] rounded"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <span className="font-bold text-[var(--text-primary)] block">Offline Cache Storage</span>
              <span className="text-[11px] text-[var(--text-secondary)]">
                Local SQLite & JSON mirrors for zero network reading
              </span>
            </div>
            <span className="text-[11px] font-bold text-[var(--accent-teal)]">Active</span>
          </div>
        </div>
      </div>

      {/* Device Storage Management */}
      <div className="liquid-glass-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-[var(--accent-coral)]" />
            <h2 className="font-extrabold text-sm text-[var(--text-primary)] uppercase tracking-wider">
              Cache & Data Management
            </h2>
          </div>
          {cacheClearSuccess && (
            <span className="text-xs font-bold text-[var(--accent-emerald)] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Cleared
            </span>
          )}
        </div>

        <p className="text-xs text-[var(--text-secondary)]">
          Free up temporary memory by clearing cached articles and history.
        </p>

        <button
          onClick={handleClearCache}
          className="px-4 py-2 rounded-full border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 text-xs font-bold flex items-center gap-2 tap-target-44 interactive-press"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear Local Offline Cache</span>
        </button>
      </div>

      {/* Editorial Standards & Version Info */}
      <div className="liquid-glass-card p-5 space-y-2 text-xs text-[var(--text-secondary)]">
        <div className="flex items-center gap-2 text-[var(--text-primary)] font-bold">
          <ShieldCheck className="w-4 h-4 text-[var(--accent-teal)]" />
          <span>VenturePulse Editorial Standards</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          All news items, facts, and quiz questions adhere to strict multi-source verification standards. Sourced directly from public gazettes, multilateral communiques, and recognized financial authorities.
        </p>
        <p className="text-[10px] text-[var(--text-tertiary)] pt-2 border-t border-[var(--border-subtle)]">
          Build: iOS 26 Liquid Glass Edition · Build 2026.9.23 · Zero-Glitch Engine
        </p>
      </div>
    </div>
  );
};
