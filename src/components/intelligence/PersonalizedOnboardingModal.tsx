/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, CheckCircle, Sparkles, MapPin, Briefcase, Palette, Sun, Moon, Laptop, Type, Check } from 'lucide-react';
import { useIntelligence } from '../../context/IntelligenceContext';
import { useTheme } from '../../context/ThemeContext';
import { PALETTES_META } from '../theme/ThemeSelectorDropdown';
import { FundingStage, UserPreferences } from '../../types/intelligence';
import { ThemeOption } from '../../types/news';

interface PersonalizedOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STATES_LIST = [
  'Telangana',
  'Karnataka',
  'Maharashtra',
  'Tamil Nadu',
  'Delhi NCR',
  'Andhra Pradesh',
  'Gujarat',
  'Kerala',
  'Uttar Pradesh',
  'Other / Central',
];

const INDUSTRIES_LIST = [
  'Artificial Intelligence',
  'SaaS',
  'FinTech',
  'HealthTech',
  'DeepTech',
  'SpaceTech',
  'ClimateTech',
  'Clean Mobility',
  'Robotics',
  'Agritech',
];

const STAGES: FundingStage[] = [
  'Pre-seed',
  'Seed',
  'Angel',
  'Series A',
  'Series B',
  'Series C',
  'Series D+',
];

export const PersonalizedOnboardingModal: React.FC<PersonalizedOnboardingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { userPreferences, setUserPreferences } = useIntelligence();
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
  const [formData, setFormData] = useState<UserPreferences>(userPreferences);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [localCustomHex, setLocalCustomHex] = useState(customColor);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setUserPreferences({ ...formData, onboardingCompleted: true });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex justify-center p-3 sm:p-6 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Founder personalization profile"
    >
      <div
        className="w-full max-w-lg liquid-glass-modal rounded-3xl p-4 sm:p-6 my-auto shadow-2xl space-y-4 sm:space-y-5 max-h-[92dvh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[var(--color-primary)]" />
            <h3 className="font-extrabold text-lg text-[var(--color-text-primary)] font-display">
              Founder Profile & Feed Personalization
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[var(--color-text-secondary)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
          Configure your location and sector to power your personalized feed. Every report displayed will state exactly <em>"Why am I seeing this?"</em> with complete source verification.
        </p>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* Geography */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[var(--color-text-primary)] mb-1">State</label>
              <select
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full liquid-glass-input rounded-xl px-3 py-2 text-xs text-[var(--color-text-primary)] outline-none"
              >
                {STATES_LIST.map((st) => (
                  <option key={st} value={st} className="bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)]">
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-[var(--color-text-primary)] mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g. Hyderabad, Bengaluru"
                className="w-full liquid-glass-input rounded-xl px-3 py-2 text-xs text-[var(--color-text-primary)] outline-none"
              />
            </div>
          </div>

          {/* Industry & Stage */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[var(--color-text-primary)] mb-1">Primary Industry</label>
              <select
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full liquid-glass-input rounded-xl px-3 py-2 text-xs text-[var(--color-text-primary)] outline-none"
              >
                {INDUSTRIES_LIST.map((ind) => (
                  <option key={ind} value={ind} className="bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)]">
                    {ind}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-[var(--color-text-primary)] mb-1">Startup Stage</label>
              <select
                value={formData.startupStage}
                onChange={(e) => setFormData({ ...formData, startupStage: e.target.value as FundingStage })}
                className="w-full liquid-glass-input rounded-xl px-3 py-2 text-xs text-[var(--color-text-primary)] outline-none"
              >
                {STAGES.map((stg) => (
                  <option key={stg} value={stg} className="bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)]">
                    {stg}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Funding Requirement */}
          <div>
            <label className="block font-bold text-[var(--color-text-primary)] mb-1">Current Funding Target</label>
            <input
              type="text"
              value={formData.fundingRequirement}
              onChange={(e) => setFormData({ ...formData, fundingRequirement: e.target.value })}
              placeholder="e.g. ₹50 Lakhs - ₹2 Crore or $1M"
              className="w-full liquid-glass-input rounded-xl px-3 py-2 text-xs text-[var(--color-text-primary)] outline-none"
            />
          </div>

          {/* Theme & Visual Identity Appearance Customizer */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-black/5 dark:bg-white/5 space-y-3 border border-[var(--color-border-subtle)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-[var(--color-primary)]" />
                <label className="text-xs font-bold text-[var(--color-text-primary)]">
                  Visual Theme & Aesthetic Style
                </label>
              </div>
              <span className="text-[10px] font-mono text-[var(--color-text-tertiary)] uppercase font-semibold">
                Instant Live
              </span>
            </div>

            {/* Mode: Light / Dark / Auto */}
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--color-border-subtle)]">
              {(
                [
                  { id: 'light', label: 'Light', icon: Sun },
                  { id: 'dark', label: 'Dark', icon: Moon },
                  { id: 'system', label: 'Auto', icon: Laptop },
                ] as { id: ThemeOption; label: string; icon: React.ComponentType<{ className?: string }> }[]
              ).map((mode) => {
                const isSelected = themeMode === mode.id;
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setThemeMode(mode.id)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-[var(--color-surface-elevated)] text-[var(--color-primary)] shadow-xs'
                        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{mode.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Curated Classic Palettes Grid */}
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-[var(--color-text-secondary)]">
                Color Palette Selection
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {PALETTES_META.map((p) => {
                  const isSelected = palette === p.id;
                  const swatches = isDark ? p.swatchDark : p.swatchLight;
                  const mainColor = isDark ? p.primaryDark : p.primaryLight;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPalette(p.id)}
                      className={`p-2 rounded-xl flex items-center justify-between text-left transition-all border ${
                        isSelected
                          ? 'bg-[var(--color-primary-subtle)] border-[var(--color-primary-border)] shadow-xs'
                          : 'bg-black/5 dark:bg-white/5 border-transparent hover:border-[var(--color-border-subtle)]'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex items-center -space-x-1 shrink-0">
                          {swatches.map((color, i) => (
                            <span
                              key={i}
                              className="w-3.5 h-3.5 rounded-full ring-1 ring-white/60 dark:ring-black/40 shadow-xs"
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
                          className="w-4 h-4 rounded-full flex items-center justify-center text-white shrink-0 ml-1"
                          style={{ backgroundColor: mainColor }}
                        >
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Custom Color Option */}
              <div className="mt-2 p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--color-border-subtle)] flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={localCustomHex}
                    onChange={(e) => {
                      setLocalCustomHex(e.target.value);
                      setCustomColor(e.target.value);
                    }}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent p-0 overflow-hidden"
                    aria-label="Pick custom color"
                  />
                  <div>
                    <p className="text-xs font-bold text-[var(--color-text-primary)]">Custom Accent</p>
                    <p className="text-[10px] font-mono text-[var(--color-text-tertiary)]">{localCustomHex}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setCustomColor(localCustomHex)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs ${
                    palette === 'custom'
                      ? 'bg-[var(--color-primary)] text-[var(--color-primary-fg)]'
                      : 'bg-black/5 dark:bg-white/5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  {palette === 'custom' ? 'Active' : 'Apply'}
                </button>
              </div>
            </div>

            {/* Typography Selection */}
            <div className="pt-2 border-t border-[var(--color-border-subtle)] flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-[var(--color-text-secondary)]">
                Typography:
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setFontStyle('classic-editorial')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    fontStyle === 'classic-editorial'
                      ? 'bg-[var(--color-primary)] text-white shadow-xs font-serif'
                      : 'bg-black/5 dark:bg-white/5 text-[var(--color-text-secondary)] font-serif'
                  }`}
                >
                  Classic Serif
                </button>
                <button
                  type="button"
                  onClick={() => setFontStyle('executive-sans')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    fontStyle === 'executive-sans'
                      ? 'bg-[var(--color-primary)] text-white shadow-xs font-sans'
                      : 'bg-black/5 dark:bg-white/5 text-[var(--color-text-secondary)] font-sans'
                  }`}
                >
                  Executive Sans
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-bold text-[var(--color-text-secondary)] hover:bg-black/5 dark:hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-full btn-classic-primary text-xs flex items-center gap-1.5"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4 text-white" />
                  <span>Preferences Saved!</span>
                </>
              ) : (
                <span>Save Profile Preferences</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
