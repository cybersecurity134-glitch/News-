/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Palette,
  Sun,
  Moon,
  Laptop,
  Check,
  Sparkles,
  Sliders,
  Type,
  Pipette,
  CheckCircle2,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { ThemeOption } from '../../types/news';
import { PALETTES_META } from '../theme/ThemeSelectorDropdown';
import { deriveThemeTokens } from '../../utils/themeUtils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'theme' | 'preferences' | 'about';
}

const QUICK_SWATCHES = [
  { name: 'Electric Cyan', hex: '#00E5FF' },
  { name: 'Teal Emerald', hex: '#0D9488' },
  { name: 'Lime Glow', hex: '#65A30D' },
  { name: 'Golden Amber', hex: '#F59E0B' },
  { name: 'Sunset Orange', hex: '#EA580C' },
  { name: 'Rose Quartz', hex: '#E11D48' },
  { name: 'Fuchsia Orchid', hex: '#C026D3' },
  { name: 'Royal Indigo', hex: '#4F46E5' },
  { name: 'Deep Sapphire', hex: '#1E40AF' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'theme',
}) => {
  const {
    isDark,
    themeMode,
    setThemeMode,
    palette,
    setPalette,
    customColor,
    setCustomColor,
    fontStyle,
    setFontStyle,
  } = useTheme();

  const [activeTab, setActiveTab] = useState<'theme' | 'preferences' | 'about'>(initialTab);
  const [localHex, setLocalHex] = useState(customColor);
  const [copiedStatus, setCopiedStatus] = useState(false);

  if (!isOpen) return null;

  const derivedTokens = deriveThemeTokens(localHex, isDark);

  const handleCustomColorApply = (hex: string) => {
    setLocalHex(hex);
    setCustomColor(hex);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in safe-top safe-bottom"
      role="dialog"
      aria-modal="true"
      aria-label="Application Settings"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl liquid-glass-modal rounded-3xl p-5 sm:p-7 my-auto shadow-2xl flex flex-col relative border border-[var(--color-border)] max-h-[88dvh] specular-line"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed at top of modal */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--color-primary-subtle)] flex items-center justify-center text-[var(--color-primary)]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[var(--color-text-primary)] font-display">
                Settings & Appearance
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Control visual themes, custom colors, and reading preferences
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors tap-target-44"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Tabs - Fixed below header */}
        <div className="flex rounded-2xl p-1 bg-black/5 dark:bg-white/5 border border-[var(--color-border-subtle)] my-4 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('theme')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'theme'
                ? 'bg-[var(--color-surface-elevated)] text-[var(--color-primary)] shadow-sm'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Theme & Colors</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preferences')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'preferences'
                ? 'bg-[var(--color-surface-elevated)] text-[var(--color-primary)] shadow-sm'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>Typography</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('about')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'about'
                ? 'bg-[var(--color-surface-elevated)] text-[var(--color-primary)] shadow-sm'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>Design Tokens</span>
          </button>
        </div>

        {/* Scrollable Tab Content Container */}
        <div className="flex-1 overflow-y-auto overscroll-contain pr-1 sm:pr-1.5 space-y-6 min-h-0 touch-pan-y" style={{ WebkitOverflowScrolling: 'touch' }}>
          {/* TAB 1: THEME & CUSTOM ACCENT COLOR */}
        {activeTab === 'theme' && (
          <div className="space-y-6 animate-fade-in text-left">
            {/* 1. Light / Dark / System Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] block">
                Color Mode
              </label>
              <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--color-border-subtle)]">
                {(
                  [
                    { id: 'light', label: 'Light Mode', icon: Sun },
                    { id: 'dark', label: 'Dark Mode', icon: Moon },
                    { id: 'system', label: 'System (Auto)', icon: Laptop },
                  ] as { id: ThemeOption; label: string; icon: React.ComponentType<{ className?: string }> }[]
                ).map((m) => {
                  const isSelected = themeMode === m.id;
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setThemeMode(m.id)}
                      className={`h-11 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        isSelected
                          ? 'bg-[var(--color-surface-elevated)] text-[var(--color-primary)] shadow-md border border-[var(--color-border-subtle)]'
                          : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Preset Built-in Themes Swatches */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] block">
                  Built-in Theme Presets
                </label>
                <span className="text-[11px] text-[var(--color-text-tertiary)]">
                  7 Curated Executive Palettes
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PALETTES_META.map((p) => {
                  const isSelected = palette === p.id;
                  const swatches = isDark ? p.swatchDark : p.swatchLight;
                  const mainColor = isDark ? p.primaryDark : p.primaryLight;

                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPalette(p.id)}
                      className={`p-3 rounded-2xl flex items-center justify-between text-left transition-all border ${
                        isSelected
                          ? 'bg-[var(--color-primary-subtle)] border-[var(--color-primary-border)] shadow-xs ring-1 ring-[var(--color-primary-border)]'
                          : 'bg-black/5 dark:bg-white/5 border-transparent hover:border-[var(--color-border-subtle)] hover:bg-black/10 dark:hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex items-center -space-x-1.5 shrink-0">
                          {swatches.map((color, i) => (
                            <span
                              key={i}
                              className="w-4 h-4 rounded-full ring-2 ring-[var(--color-surface-elevated)] shadow-xs"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[var(--color-text-primary)] truncate">
                            {p.name}
                          </p>
                          <p className="text-[10px] text-[var(--color-text-tertiary)] truncate">
                            {p.tagline}
                          </p>
                        </div>
                      </div>

                      {isSelected ? (
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0 shadow-xs"
                          style={{ backgroundColor: mainColor }}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      ) : (
                        <span
                          className="w-3.5 h-3.5 rounded-full opacity-60 shrink-0"
                          style={{ backgroundColor: mainColor }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Custom Accent Color Picker */}
            <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--color-border-subtle)] space-y-3.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Pipette className="w-4 h-4 text-[var(--color-primary)]" />
                  <span className="text-xs font-bold text-[var(--color-text-primary)]">
                    Custom Accent Color
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-[var(--color-success)] bg-[var(--color-success-bg)] px-2 py-0.5 rounded-full flex items-center gap-1 border border-[var(--color-success-border)]">
                    <ShieldCheck className="w-3 h-3" /> Auto-Contrast WCAG AAA
                  </span>
                  {palette === 'custom' && (
                    <span className="text-[10px] font-bold text-[var(--color-primary)] bg-[var(--color-primary-subtle)] px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </div>
              </div>

              {/* Color Wheel & Hex Input */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="relative shrink-0 w-11 h-11 rounded-2xl overflow-hidden shadow-xs border border-[var(--color-border-subtle)] flex items-center justify-center cursor-pointer">
                    <input
                      type="color"
                      value={localHex}
                      onChange={(e) => handleCustomColorApply(e.target.value)}
                      className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                      aria-label="Choose custom color"
                    />
                    <span
                      className="w-full h-full rounded-2xl flex items-center justify-center text-white"
                      style={{ backgroundColor: localHex }}
                    >
                      <Pipette className="w-4 h-4 text-white drop-shadow-sm" />
                    </span>
                  </div>

                  <div className="flex-1 sm:w-36">
                    <input
                      type="text"
                      value={localHex}
                      onChange={(e) => {
                        const val = e.target.value;
                        setLocalHex(val);
                        if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                          handleCustomColorApply(val);
                        }
                      }}
                      placeholder="#1E40AF"
                      className="h-11 w-full px-3 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] text-xs font-mono font-bold text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                    />
                  </div>
                </div>

                {/* Live Sample Preview Button */}
                <button
                  type="button"
                  onClick={() => setCustomColor(localHex)}
                  className="h-11 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
                  style={{
                    backgroundColor: derivedTokens.hex,
                    color: derivedTokens.fg,
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Apply Custom Accent</span>
                </button>
              </div>

              {/* Quick Preset Palette Swatches */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-[var(--color-text-secondary)]">
                  Quick Palette Chips
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {QUICK_SWATCHES.map((chip) => {
                    const isCurrent = localHex.toLowerCase() === chip.hex.toLowerCase();
                    return (
                      <button
                        key={chip.hex}
                        type="button"
                        onClick={() => handleCustomColorApply(chip.hex)}
                        className={`h-7 px-2.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all shadow-xs border ${
                          isCurrent
                            ? 'ring-2 ring-[var(--color-primary)] border-transparent'
                            : 'border-[var(--color-border-subtle)] hover:scale-105'
                        }`}
                        style={{
                          backgroundColor: chip.hex,
                          color: deriveThemeTokens(chip.hex, isDark).fg,
                        }}
                      >
                        {isCurrent && <Check className="w-3 h-3 stroke-[3]" />}
                        <span>{chip.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <p className="text-[11px] text-[var(--color-text-tertiary)] leading-relaxed pt-1">
                When you pick any custom color, dependent hover, pressed, border, and ambient glow values are derived automatically, and foreground text contrast is evaluated to ensure readability across all screens.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: TYPOGRAPHY STYLE */}
        {activeTab === 'preferences' && (
          <div className="space-y-5 animate-fade-in text-left">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] block">
                Editorial Font Family
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFontStyle('classic-editorial')}
                  className={`p-4 rounded-2xl text-left transition-all border ${
                    fontStyle === 'classic-editorial'
                      ? 'bg-[var(--color-primary-subtle)] border-[var(--color-primary-border)] shadow-xs ring-1 ring-[var(--color-primary-border)]'
                      : 'bg-black/5 dark:bg-white/5 border-transparent hover:bg-black/10 dark:hover:bg-white/10'
                  }`}
                >
                  <p className="font-serif text-lg font-bold text-[var(--color-text-primary)]">
                    Playfair & Newsreader
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                    Classic prestige editorial serif typography for distinguished readability.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setFontStyle('executive-sans')}
                  className={`p-4 rounded-2xl text-left transition-all border ${
                    fontStyle === 'executive-sans'
                      ? 'bg-[var(--color-primary-subtle)] border-[var(--color-primary-border)] shadow-xs ring-1 ring-[var(--color-primary-border)]'
                      : 'bg-black/5 dark:bg-white/5 border-transparent hover:bg-black/10 dark:hover:bg-white/10'
                  }`}
                >
                  <p className="font-sans text-lg font-bold text-[var(--color-text-primary)]">
                    Plus Jakarta Sans
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                    Clean, high-legibility executive sans-serif engineered for rapid data absorption.
                  </p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ACTIVE DESIGN TOKENS AUDIT */}
        {activeTab === 'about' && (
          <div className="space-y-4 animate-fade-in text-left text-xs">
            <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--color-border-subtle)] space-y-2">
              <h4 className="font-bold text-[var(--color-text-primary)]">
                Active CSS Design Tokens
              </h4>
              <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
                All application components reference unified design tokens rather than hardcoded hex colors. Theme switching updates these tokens instantly on the document root without reloading.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2 font-mono text-[11px]">
                <div className="p-2 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] flex items-center justify-between">
                  <span className="text-[var(--color-text-secondary)]">--color-accent</span>
                  <span className="font-bold text-[var(--color-primary)]">{palette === 'custom' ? customColor : palette}</span>
                </div>
                <div className="p-2 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] flex items-center justify-between">
                  <span className="text-[var(--color-text-secondary)]">--color-background</span>
                  <span className="font-bold">{isDark ? '#070B14' : '#F4F7FB'}</span>
                </div>
                <div className="p-2 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] flex items-center justify-between">
                  <span className="text-[var(--color-text-secondary)]">--color-surface</span>
                  <span className="font-bold">Glass L2</span>
                </div>
                <div className="p-2 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] flex items-center justify-between">
                  <span className="text-[var(--color-text-secondary)]">--color-text-primary</span>
                  <span className="font-bold">{isDark ? '#F8FAFC' : '#0F172A'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="pt-3 mt-4 border-t border-[var(--color-border-subtle)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Persisted locally in storage</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[var(--color-primary)] text-[var(--color-primary-fg)] font-bold text-xs shadow-md hover:opacity-95 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
