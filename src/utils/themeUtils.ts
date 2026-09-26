/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DerivedThemeTokens {
  hex: string;
  hover: string;
  light: string;
  dark: string;
  fg: string;
  subtle: string;
  border: string;
  glow: string;
  ambient1: string;
  ambient2: string;
  ambient3: string;
  ambient4: string;
}

// Convert 3 or 6 digit hex to RGB
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const num = parseInt(clean, 16);
  if (isNaN(num) || clean.length !== 6) {
    return { r: 30, g: 64, b: 175 }; // Safe default (Royal Sapphire)
  }
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

// Convert RGB to 6-digit hex string
export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const toHex = (v: number) => clamp(v).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Calculate relative luminance for WCAG contrast compliance
export function getRelativeLuminance(r: number, g: number, b: number): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Adjust brightness of a color by a percentage factor (-1 to +1)
export function adjustBrightness(hex: string, factor: number): string {
  const { r, g, b } = hexToRgb(hex);
  if (factor > 0) {
    // Lighten towards 255
    return rgbToHex(
      r + (255 - r) * factor,
      g + (255 - g) * factor,
      b + (255 - b) * factor
    );
  } else {
    // Darken towards 0
    const absFactor = 1 + factor;
    return rgbToHex(r * absFactor, g * absFactor, b * absFactor);
  }
}

// Compute all dependent shades and contrast color from a single accent hex
export function deriveThemeTokens(hexColor: string, isDark: boolean): DerivedThemeTokens {
  const { r, g, b } = hexToRgb(hexColor);
  const luminance = getRelativeLuminance(r, g, b);

  // Auto-adjust foreground text for maximum readability (WCAG AAA)
  // If accent is light/bright, use dark slate text; otherwise pure white.
  const fg = luminance > 140 ? '#0B132B' : '#FFFFFF';

  const hover = isDark
    ? adjustBrightness(hexColor, 0.16)
    : adjustBrightness(hexColor, -0.14);

  const light = adjustBrightness(hexColor, 0.35);
  const dark = adjustBrightness(hexColor, -0.35);

  const subtleAlpha = isDark ? 0.16 : 0.10;
  const borderAlpha = isDark ? 0.32 : 0.26;
  const glowAlpha = isDark ? 0.30 : 0.22;

  const subtle = `rgba(${r}, ${g}, ${b}, ${subtleAlpha})`;
  const border = `rgba(${r}, ${g}, ${b}, ${borderAlpha})`;
  const glow = `rgba(${r}, ${g}, ${b}, ${glowAlpha})`;

  // Derived complementary ambient glow mesh nodes for the fluid canvas
  const ambient1 = `rgba(${r}, ${g}, ${b}, ${isDark ? 0.16 : 0.09})`;
  // Slight hue shift for secondary and tertiary ambient nodes
  const ambient2 = isDark ? 'rgba(245, 158, 11, 0.10)' : 'rgba(217, 119, 6, 0.06)';
  const ambient3 = isDark ? 'rgba(16, 185, 129, 0.08)' : 'rgba(5, 150, 105, 0.06)';
  const ambient4 = isDark ? 'rgba(167, 139, 250, 0.08)' : 'rgba(124, 58, 237, 0.05)';

  return {
    hex: hexColor,
    hover,
    light,
    dark,
    fg,
    subtle,
    border,
    glow,
    ambient1,
    ambient2,
    ambient3,
    ambient4,
  };
}

// Directly apply custom CSS variables to the document root element
export function applyCustomAccentToDOM(hexColor: string, isDark: boolean): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const tokens = deriveThemeTokens(hexColor, isDark);

  root.style.setProperty('--color-primary', tokens.hex);
  root.style.setProperty('--color-primary-hover', tokens.hover);
  root.style.setProperty('--color-primary-light', tokens.light);
  root.style.setProperty('--color-primary-dark', tokens.dark);
  root.style.setProperty('--color-primary-fg', tokens.fg);
  root.style.setProperty('--color-primary-subtle', tokens.subtle);
  root.style.setProperty('--color-primary-border', tokens.border);
  root.style.setProperty('--color-primary-glow', tokens.glow);

  root.style.setProperty('--color-accent', tokens.hex);
  root.style.setProperty('--color-accent-hover', tokens.hover);
  root.style.setProperty('--color-accent-light', tokens.light);
  root.style.setProperty('--color-accent-dark', tokens.dark);
  root.style.setProperty('--color-accent-fg', tokens.fg);
  root.style.setProperty('--color-accent-subtle', tokens.subtle);
  root.style.setProperty('--color-accent-border', tokens.border);
  root.style.setProperty('--color-accent-glow', tokens.glow);

  root.style.setProperty('--accent-primary', tokens.hex);
  root.style.setProperty('--accent-primary-hover', tokens.hover);
  root.style.setProperty('--accent-glow', tokens.glow);

  root.style.setProperty('--bg-ambient-1', tokens.ambient1);
}

// Remove inline custom property overrides when switching back to a preset palette
export function clearCustomAccentFromDOM(): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const properties = [
    '--color-primary',
    '--color-primary-hover',
    '--color-primary-light',
    '--color-primary-dark',
    '--color-primary-fg',
    '--color-primary-subtle',
    '--color-primary-border',
    '--color-primary-glow',
    '--color-accent',
    '--color-accent-hover',
    '--color-accent-light',
    '--color-accent-dark',
    '--color-accent-fg',
    '--color-accent-subtle',
    '--color-accent-border',
    '--color-accent-glow',
    '--accent-primary',
    '--accent-primary-hover',
    '--accent-glow',
    '--bg-ambient-1',
  ];
  properties.forEach((prop) => root.style.removeProperty(prop));
}
