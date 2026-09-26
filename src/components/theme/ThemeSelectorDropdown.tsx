/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo, useRef, useEffect, useState } from 'react';
import { Palette, Sun, Moon, Laptop, Check, Type, Sparkles, Pipette } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { ColorPalette, FontStyle, ThemeOption } from '../../types/news';
import { deriveThemeTokens } from '../../utils/themeUtils';

interface PaletteOptionMeta {
  id: ColorPalette;
  name: string;
  tagline: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  swatchLight: string[];
  swatchDark: string[];
}

export const PALETTES_META: PaletteOptionMeta[] = [
  {
    id: 'royal',
    name: 'Royal Sapphire',
    tagline: 'Classic Blue & Gold',
    primaryLight: '#1E40AF',
    primaryDark: '#3B82F6',
    accent: '#D97706',
    swatchLight: ['#1E40AF', '#D97706', '#059669'],
    swatchDark: ['#3B82F6', '#F59E0B', '#10B981'],
  },
  {
    id: 'emerald',
    name: 'Imperial Emerald',
    tagline: 'Venture Green & Brass',
    primaryLight: '#047857',
    primaryDark: '#10B981',
    accent: '#B45309',
    swatchLight: ['#047857', '#B45309', '#0D9488'],
    swatchDark: ['#10B981', '#FBBF24', '#2DD4BF'],
  },
  {
    id: 'amethyst',
    name: 'Royal Amethyst',
    tagline: 'Noble Purple & Orchid',
    primaryLight: '#6D28D9',
    primaryDark: '#A78BFA',
    accent: '#BE185D',
    swatchLight: ['#6D28D9', '#BE185D', '#4F46E5'],
    swatchDark: ['#A78BFA', '#FB7185', '#818CF8'],
  },
  {
    id: 'orange',
    name: 'Sunset Orange',
    tagline: 'Vibrant Amber & Coral',
    primaryLight: '#C2410C',
    primaryDark: '#FB923C',
    accent: '#D97706',
    swatchLight: ['#C2410C', '#D97706', '#E11D48'],
    swatchDark: ['#FB923C', '#FBBF24', '#FB7185'],
  },
  {
    id: 'bordeaux',
    name: 'Bordeaux Crimson',
    tagline: 'FT Wine & Copper Red',
    primaryLight: '#991B1B',
    primaryDark: '#F87171',
    accent: '#C2410C',
    swatchLight: ['#991B1B', '#C2410C', '#D97706'],
    swatchDark: ['#F87171', '#FB923C', '#FBBF24'],
  },
  {
    id: 'graphite',
    name: 'Graphite Slate',
    tagline: 'Executive Charcoal & Titanium',
    primaryLight: '#334155',
    primaryDark: '#94A3B8',
    accent: '#64748B',
    swatchLight: ['#334155', '#475569', '#64748B'],
    swatchDark: ['#94A3B8', '#CBD5E1', '#E2E8F0'],
  },
  {
    id: 'obsidian',
    name: 'Obsidian Cyan',
    tagline: 'High-Contrast Terminal Cyan',
    primaryLight: '#0369A1',
    primaryDark: '#00E5FF',
    accent: '#4F46E5',
    swatchLight: ['#0369A1', '#4F46E5', '#059669'],
    swatchDark: ['#00E5FF', '#818CF8', '#34D399'],
  },
];

interface ThemeSelectorDropdownProps {
  className?: string;
  align?: 'left' | 'right';
}

export const ThemeSelectorDropdown: React.FC<ThemeSelectorDropdownProps> = memo(({
  className = '',
  align = 'right',
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

  const [isOpen, setIsOpen] = useState(false);
  const [localCustomHex, setLocalCustomHex] = useState(customColor);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalCustomHex(customColor);
  }, [customColor]);

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const activePaletteMeta = PALETTES_META.find((p) => p.id === palette);
  const currentAccent = palette === 'custom'
    ? customColor
    : activePaletteMeta
    ? (isDark ? activePaletteMeta.primaryDark : activePaletteMeta.primaryLight)
    : '#1E40AF';

  const derivedTokens = deriveThemeTokens(localCustomHex, isDark);

  const handleCustomColorChange = (hex: string) => {
    setLocalCustomHex(hex);
    setCustomColor(hex);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Trigger Button with Palette Color Swatch */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center justify-center gap-1.5 px-3 py-1.5 h-9 sm:h-10 rounded-full border border-[var(--color-border-subtle)] bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 hover:border-[var(--color-primary-border)] hover:shadow-xs active:scale-95 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all cursor-pointer select-none"
        title="Customize Theme & Accent Color"
        aria-label="Theme & appearance settings"
        aria-expanded={isOpen}
      >
        <span
          className="w-3.5 h-3.5 rounded-full ring-2 ring-white/60 dark:ring-black/40 shadow-xs inline-block shrink-0 transition-transform group-hover:scale-110"
          style={{ backgroundColor: currentAccent }}
        />
        <Palette className="w-3.5 h-3.5 text-[var(--color-primary)] shrink-0 transition-transform hover:rotate-12" />
        <span className="hidden xl:inline text-xs font-bold text-[var(--color-text-primary)] truncate max-w-[90px] leading-none">
          {palette === 'custom' ? 'Custom' : (activePaletteMeta?.name.split(' ')[0] || 'Theme')}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} mt-2 w-72 sm:w-80 liquid-glass-modal rounded-3xl p-3.5 shadow-2xl border border-[var(--color-border)] z-50 animate-fade-in space-y-3.5 max-h-[85dvh] overflow-y-auto overscroll-contain`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border-subtle)]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--color-primary)]" />
              <span className="font-extrabold text-xs text-[var(--color-text-primary)] uppercase tracking-wider">
                Theme & Accent Color
              </span>
            </div>
            <span className="text-[10px] font-mono text-[var(--color-text-tertiary)] uppercase font-semibold">
              Instant Live
            </span>
          </div>

          {/* Mode Switcher: Light / Dark / Auto */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[var(--color-text-secondary)] block">
              Color Mode
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--color-border-subtle)]">
              {(
                [
                  { id: 'light', label: 'Light', icon: Sun },
                  { id: 'dark', label: 'Dark', icon: Moon },
                  { id: 'system', label: 'System', icon: Laptop },
                ] as { id: ThemeOption; label: string; icon: React.ComponentType<{ className?: string }> }[]
              ).map((mode) => {
                const isSelected = themeMode === mode.id;
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setThemeMode(mode.id)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all tap-target-44 ${
                      isSelected
                        ? 'bg-[var(--color-surface-elevated)] text-[var(--color-primary)] shadow-sm'
                        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{mode.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Curated Colourful Palettes */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[var(--color-text-secondary)] block">
              Built-in Preset Themes
            </label>
            <div className="grid grid-cols-1 gap-1">
              {PALETTES_META.map((p) => {
                const isSelected = palette === p.id;
                const swatches = isDark ? p.swatchDark : p.swatchLight;
                const mainColor = isDark ? p.primaryDark : p.primaryLight;

                return (
                  <button
                    key={p.id}
                    onClick={() => setPalette(p.id)}
                    className={`w-full p-2 rounded-2xl flex items-center justify-between text-left transition-all border ${
                      isSelected
                        ? 'bg-[var(--color-primary-subtle)] border-[var(--color-primary-border)] shadow-xs'
                        : 'bg-transparent border-transparent hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
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

                    {isSelected && (
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0 shadow-xs"
                        style={{ backgroundColor: mainColor }}
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Accent Color Option */}
          <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--color-border-subtle)] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Pipette className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                <span className="text-xs font-bold text-[var(--color-text-primary)]">Custom Accent Color</span>
              </div>
              {palette === 'custom' && (
                <span className="text-[10px] font-bold text-[var(--color-primary)] bg-[var(--color-primary-subtle)] px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <div className="relative shrink-0">
                <input
                  type="color"
                  value={localCustomHex}
                  onChange={(e) => handleCustomColorChange(e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent p-0 overflow-hidden"
                  aria-label="Pick custom color"
                />
              </div>

              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={localCustomHex}
                  onChange={(e) => {
                    const val = e.target.value;
                    setLocalCustomHex(val);
                    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                      handleCustomColorChange(val);
                    }
                  }}
                  placeholder="#1E40AF"
                  className="w-full h-8 px-2.5 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)] text-xs font-mono font-bold text-[var(--color-text-primary)] focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => setCustomColor(localCustomHex)}
                className="px-3 h-8 rounded-lg text-xs font-bold shrink-0 transition-all shadow-xs"
                style={{
                  backgroundColor: derivedTokens.hex,
                  color: derivedTokens.fg,
                }}
              >
                Apply
              </button>
            </div>

            {/* Quick Palette Chips */}
            <div className="flex items-center gap-1.5 pt-1 flex-wrap">
              {[
                { label: 'Cyan', hex: '#00E5FF' },
                { label: 'Teal', hex: '#0D9488' },
                { label: 'Lime', hex: '#65A30D' },
                { label: 'Amber', hex: '#F59E0B' },
                { label: 'Rose', hex: '#E11D48' },
                { label: 'Fuchsia', hex: '#C026D3' },
                { label: 'Indigo', hex: '#4F46E5' },
              ].map((chip) => (
                <button
                  key={chip.hex}
                  type="button"
                  onClick={() => handleCustomColorChange(chip.hex)}
                  title={chip.label}
                  className="w-5 h-5 rounded-full ring-1 ring-black/10 dark:ring-white/10 hover:scale-110 transition-transform shadow-xs"
                  style={{ backgroundColor: chip.hex }}
                />
              ))}
            </div>
          </div>

          {/* Typography Preference */}
          <div className="space-y-1.5 pt-2 border-t border-[var(--color-border-subtle)]">
            <label className="text-[11px] font-bold text-[var(--color-text-secondary)] block">
              Typography Style
            </label>
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--color-border-subtle)] text-xs">
              <button
                onClick={() => setFontStyle('classic-editorial')}
                className={`py-1.5 px-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                  fontStyle === 'classic-editorial'
                    ? 'bg-[var(--color-surface-elevated)] text-[var(--color-primary)] shadow-sm'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                <span className="font-serif">Classic Serif</span>
              </button>
              <button
                onClick={() => setFontStyle('executive-sans')}
                className={`py-1.5 px-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                  fontStyle === 'executive-sans'
                    ? 'bg-[var(--color-surface-elevated)] text-[var(--color-primary)] shadow-sm'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                <span className="font-sans">Executive Sans</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

ThemeSelectorDropdown.displayName = 'ThemeSelectorDropdown';
