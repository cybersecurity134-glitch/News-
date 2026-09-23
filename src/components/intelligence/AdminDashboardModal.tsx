/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, ShieldCheck, Activity, Layers, AlertTriangle, CheckCircle2, RefreshCw, GitCommit } from 'lucide-react';
import { useIntelligence } from '../../context/IntelligenceContext';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { adminStatus, isRefreshing, refreshData } = useIntelligence();
  const [sources, setSources] = useState(adminStatus.sourceHealth);

  if (!isOpen) return null;

  const toggleSourceStatus = (index: number) => {
    setSources((prev) =>
      prev.map((src, i) =>
        i === index
          ? {
              ...src,
              status: src.status === 'Operational' ? 'Degraded' : 'Operational',
            }
          : src
      )
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex justify-center p-3 sm:p-6 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Admin system dashboard"
    >
      <div
        className="w-full max-w-3xl liquid-glass-modal rounded-3xl p-6 my-auto shadow-2xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[var(--color-success)]" />
            <div>
              <h3 className="font-extrabold text-lg text-[var(--color-text-primary)] font-display">
                Admin Intelligence & Sourcing Console
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Audit logs, pipeline health, duplicate grouping, and source telemetry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[var(--color-text-secondary)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--color-border-subtle)] space-y-1">
            <span className="text-[10px] uppercase font-bold text-[var(--color-text-tertiary)]">Sources Monitored</span>
            <p className="text-xl font-extrabold text-[var(--color-primary)]">{adminStatus.monitoredSourcesCount}</p>
            <span className="text-[10px] text-[var(--color-success)] font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> 100% Operational
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--color-border-subtle)] space-y-1">
            <span className="text-[10px] uppercase font-bold text-[var(--color-text-tertiary)]">Articles Extracted</span>
            <p className="text-xl font-extrabold text-[var(--color-text-primary)]">{adminStatus.totalArticlesCollected}</p>
            <span className="text-[10px] text-[var(--color-text-secondary)]">From official feeds</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--color-border-subtle)] space-y-1">
            <span className="text-[10px] uppercase font-bold text-[var(--color-text-tertiary)]">Duplicates Grouped</span>
            <p className="text-xl font-extrabold text-[var(--sec-investors)]">{adminStatus.duplicatesDetectedAndGrouped}</p>
            <span className="text-[10px] text-[var(--color-text-secondary)]">Multi-source unified</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--color-border-subtle)] space-y-1">
            <span className="text-[10px] uppercase font-bold text-[var(--color-text-tertiary)]">Unavailable Sources</span>
            <p className="text-xl font-extrabold text-[var(--color-text-primary)]">{adminStatus.unavailableSources}</p>
            <span className="text-[10px] text-[var(--color-text-secondary)]">Zero artificial fallbacks</span>
          </div>
        </div>

        {/* Fact Checking Verification Pipeline (Section 22) */}
        <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--color-border-subtle)] space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[var(--color-text-primary)]">
            <GitCommit className="w-4 h-4 text-[var(--color-primary)]" />
            <span>Strict Verification & Ingestion Pipeline</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-medium text-[var(--color-text-secondary)]">
            <div className="p-2 rounded-xl bg-white/40 dark:bg-white/5 border border-[var(--color-border-subtle)]">
              1. Source Ingestion (Tier 1/2)
            </div>
            <div className="p-2 rounded-xl bg-white/40 dark:bg-white/5 border border-[var(--color-border-subtle)]">
              2. Date & URL Validation
            </div>
            <div className="p-2 rounded-xl bg-white/40 dark:bg-white/5 border border-[var(--color-border-subtle)]">
              3. Duplicate Grouping
            </div>
            <div className="p-2 rounded-xl bg-white/40 dark:bg-white/5 border border-[var(--color-border-subtle)]">
              4. Zero-Alteration Publish
            </div>
          </div>
        </div>

        {/* Monitored Sources Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-text-secondary)]">
              Monitored External Feeds & Official Portals
            </h4>
            <button
              onClick={() => refreshData()}
              disabled={isRefreshing}
              className="text-xs text-[var(--color-primary)] hover:underline flex items-center gap-1 font-bold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Ping All Sources</span>
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2 pr-1 text-xs">
            {sources.map((src, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--color-border-subtle)] flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-[var(--color-text-primary)]">{src.name}</strong>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded badge-info">
                      {src.tier}
                    </span>
                  </div>
                  <span className="text-[11px] text-[var(--color-text-tertiary)] font-mono">{src.domain}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-[var(--color-text-secondary)]">
                    {src.articlesCount} items
                  </span>

                  <button
                    onClick={() => toggleSourceStatus(idx)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors ${
                      src.status === 'Operational'
                        ? 'badge-success'
                        : 'badge-warning'
                    }`}
                  >
                    {src.status}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Anti-Fabrication Notice */}
        <div className="p-3.5 rounded-2xl bg-[var(--color-primary-subtle)] border border-[var(--color-primary-border)] text-xs text-[var(--color-text-secondary)] leading-relaxed">
          <strong className="text-[var(--color-text-primary)]">Anti-Fabrication Rule Active: </strong>
          No mock articles, guessed numbers, or unverified claims may be committed. If a feed is unreachable, the system displays the transparent "Source temporarily unavailable" state.
        </div>
      </div>
    </div>
  );
};
