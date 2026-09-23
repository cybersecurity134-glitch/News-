/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, CheckCircle, Sparkles, MapPin, Briefcase } from 'lucide-react';
import { useIntelligence } from '../../context/IntelligenceContext';
import { FundingStage, UserPreferences } from '../../types/intelligence';

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
  const [formData, setFormData] = useState<UserPreferences>(userPreferences);
  const [savedSuccess, setSavedSuccess] = useState(false);

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
