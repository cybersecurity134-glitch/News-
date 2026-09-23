/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Bell, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { useIntelligence } from '../../context/IntelligenceContext';
import { NewsCategory } from '../../types/intelligence';

interface AlertsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AlertsManagerModal: React.FC<AlertsManagerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { alerts, addAlert, removeAlert, toggleAlert } = useIntelligence();
  const [showAddForm, setShowAddForm] = useState(false);
  const [label, setLabel] = useState('');
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState<NewsCategory>('funding');
  const [geography, setGeography] = useState('India');

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !keyword.trim()) return;
    addAlert({
      label: label.trim(),
      keyword: keyword.trim(),
      category,
      geography,
    });
    setLabel('');
    setKeyword('');
    setShowAddForm(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex justify-center p-3 sm:p-6 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Intelligence alerts manager"
    >
      <div
        className="w-full max-w-lg liquid-glass-modal rounded-3xl p-6 my-auto shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[var(--color-warning)]" />
            <h3 className="font-extrabold text-lg text-[var(--color-text-primary)] font-display">
              Intelligence Notification Rules
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
          Create verified alerts. You will receive updates triggered exclusively from official and verified external sources.
        </p>

        {/* Existing Alerts List */}
        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
          {alerts.length === 0 ? (
            <p className="text-xs text-[var(--color-text-tertiary)] py-4 text-center">
              No active alerts. Add one below to monitor specific sectors.
            </p>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--color-border-subtle)] flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <strong className="text-[var(--color-text-primary)] block truncate">{alert.label}</strong>
                  <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-secondary)] mt-0.5">
                    <span>Keyword: "{alert.keyword}"</span>
                    {alert.category && <span>· {alert.category}</span>}
                    {alert.geography && <span>· {alert.geography}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleAlert(alert.id)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors ${
                      alert.active
                        ? 'badge-info'
                        : 'bg-black/10 dark:bg-white/10 text-[var(--color-text-tertiary)]'
                    }`}
                  >
                    {alert.active ? 'Active' : 'Paused'}
                  </button>

                  <button
                    onClick={() => removeAlert(alert.id)}
                    className="p-1.5 rounded-full hover:bg-[var(--color-error-bg)] text-[var(--color-error)]"
                    title="Delete Alert"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Alert Form or Toggle */}
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full py-2.5 rounded-full border border-dashed border-[var(--color-border)] hover:border-[var(--color-primary)] text-xs font-bold text-[var(--color-primary)] hover:bg-[var(--color-primary-subtle)] transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Verified Alert Rule</span>
          </button>
        ) : (
          <form onSubmit={handleCreate} className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--color-border-subtle)] space-y-3 text-xs">
            <h4 className="font-bold text-[var(--color-text-primary)]">New Alert Trigger</h4>

            <div>
              <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">Alert Label</label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Notify me when AI startups raise seed funding"
                className="w-full liquid-glass-input rounded-xl px-3 py-2 text-xs text-[var(--color-text-primary)] outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">Trigger Keyword</label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="e.g. AI, Cyber, CleanTech"
                  className="w-full liquid-glass-input rounded-xl px-3 py-2 text-xs text-[var(--color-text-primary)] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as NewsCategory)}
                  className="w-full liquid-glass-input rounded-xl px-3 py-2 text-xs text-[var(--color-text-primary)] outline-none"
                >
                  <option value="funding">Funding Rounds</option>
                  <option value="government-schemes">Government Schemes</option>
                  <option value="opportunities">Grants & Programs</option>
                  <option value="startup-launches">New Startups</option>
                  <option value="events">Upcoming Events</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-full btn-classic-primary text-xs"
              >
                Add Alert Rule
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
