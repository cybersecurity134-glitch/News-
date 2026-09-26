/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeOption, ColorPalette, FontStyle } from '../types/news';
import { applyCustomAccentToDOM, clearCustomAccentFromDOM } from '../utils/themeUtils';

interface ThemeContextType {
  isDark: boolean;
  themeMode: ThemeOption;
  setThemeMode: (mode: ThemeOption) => void;
  toggleTheme: () => void;
  palette: ColorPalette;
  setPalette: (palette: ColorPalette) => void;
  customColor: string;
  setCustomColor: (hex: string) => void;
  fontStyle: FontStyle;
  setFontStyle: (fontStyle: FontStyle) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeOption>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vp_theme_mode') as ThemeOption | null;
      if (saved && ['light', 'dark', 'system'].includes(saved)) {
        return saved;
      }
      const legacyTheme = localStorage.getItem('vp_theme');
      if (legacyTheme === 'dark') return 'dark';
      if (legacyTheme === 'light') return 'light';
    }
    return 'system';
  });

  const [palette, setPaletteState] = useState<ColorPalette>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vp_palette') as ColorPalette | null;
      if (saved && ['royal', 'emerald', 'amethyst', 'orange', 'bordeaux', 'graphite', 'obsidian', 'custom'].includes(saved)) {
        return saved;
      }
    }
    return 'royal';
  });

  const [customColor, setCustomColorState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vp_custom_color');
      if (saved && saved.startsWith('#')) {
        return saved;
      }
    }
    return '#1E40AF';
  });

  const [fontStyle, setFontStyleState] = useState<FontStyle>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vp_font') as FontStyle | null;
      if (saved && ['classic-editorial', 'executive-sans'].includes(saved)) {
        return saved;
      }
    }
    return 'classic-editorial';
  });

  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Listen to OS system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setSystemIsDark(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const isDark = themeMode === 'system' ? systemIsDark : themeMode === 'dark';

  // Apply mode to documentElement smoothly
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      localStorage.setItem('vp_theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      localStorage.setItem('vp_theme', 'light');
    }
    localStorage.setItem('vp_theme_mode', themeMode);
  }, [isDark, themeMode]);

  // Apply palette to documentElement and handle custom accent color tokens
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-palette', palette);
    localStorage.setItem('vp_palette', palette);

    if (palette === 'custom') {
      applyCustomAccentToDOM(customColor, isDark);
    } else {
      clearCustomAccentFromDOM();
    }
  }, [palette, customColor, isDark]);

  // Apply font style to documentElement
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-font', fontStyle);
    localStorage.setItem('vp_font', fontStyle);
  }, [fontStyle]);

  const setThemeMode = (mode: ThemeOption) => {
    setThemeModeState(mode);
  };

  const toggleTheme = () => {
    setThemeModeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setPalette = (p: ColorPalette) => {
    setPaletteState(p);
  };

  const setCustomColor = (hex: string) => {
    setCustomColorState(hex);
    setPaletteState('custom');
    localStorage.setItem('vp_custom_color', hex);
    localStorage.setItem('vp_palette', 'custom');
    applyCustomAccentToDOM(hex, isDark);
  };

  const setFontStyle = (f: FontStyle) => {
    setFontStyleState(f);
  };

  return (
    <ThemeContext.Provider
      value={{
        isDark,
        themeMode,
        setThemeMode,
        toggleTheme,
        palette,
        setPalette,
        customColor,
        setCustomColor,
        fontStyle,
        setFontStyle,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
