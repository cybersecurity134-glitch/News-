/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StartupEvent } from '../types';
import { Calendar, MapPin, Globe, ExternalLink, Sparkles, Filter } from 'lucide-react';

interface EventsViewProps {
  events: StartupEvent[];
  isDark: boolean;
}

export const EventsView: React.FC<EventsViewProps> = ({ events, isDark: _isDark }) => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<'all' | 'online' | 'in-person'>('all');

  const filteredEvents = events.filter((ev) => {
    if (selectedType !== 'all' && ev.type !== selectedType) return false;
    if (locationFilter === 'online' && !ev.isOnline) return false;
    if (locationFilter === 'in-person' && ev.isOnline) return false;
    return true;
  });

  const typeLabels: Record<string, { label: string; color: string }> = {
    'pitch-day': { label: 'Pitch Day', color: '#5AC8FA' },
    'demo-day': { label: 'Demo Day', color: '#AF52DE' },
    'expo': { label: 'Expo & Summit', color: '#FF9500' },
    'accelerator-deadline': { label: 'Application Deadline', color: '#FF3B30' },
  };

  return (
    <div id="events-section-view" className="w-full max-w-4xl mx-auto px-4 py-4 space-y-6">
      {/* Header */}
      <div className="rounded-2xl p-5 bg-[#F2F2F7] dark:bg-[#1C1C1E] border border-[rgba(60,60,67,0.08)] dark:border-[rgba(235,235,245,0.08)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#5AC8FA]/15 text-[#5AC8FA]">
              <Calendar className="w-5 h-5" />
            </span>
            <h1 className="ios-large-title text-[#000000] dark:text-[#FFFFFF]">
              Startup Events
            </h1>
          </div>
          <p className="text-xs text-[rgba(60,60,67,0.7)] dark:text-[rgba(235,235,245,0.7)] mt-1">
            Verified pitch days, founder demo showcases, and accelerator application deadlines with official registration links.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Real Official Listings</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Type pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-[rgba(60,60,67,0.5)] flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" /> Type:
          </span>
          {['all', 'pitch-day', 'demo-day', 'expo', 'accelerator-deadline'].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all ${
                selectedType === t
                  ? 'bg-[#007AFF] dark:bg-[#0A84FF] text-white shadow-xs'
                  : 'bg-[#F2F2F7] dark:bg-[#2C2C2E] text-[rgba(60,60,67,0.8)] dark:text-[rgba(235,235,245,0.8)] hover:bg-[rgba(60,60,67,0.1)]'
              }`}
            >
              {t === 'all' ? 'All Events' : typeLabels[t]?.label || t}
            </button>
          ))}
        </div>

        {/* Location selector */}
        <div className="flex items-center gap-1 p-0.5 rounded-xl bg-[#F2F2F7] dark:bg-[#2C2C2E] text-xs">
          {(['all', 'online', 'in-person'] as const).map((loc) => (
            <button
              key={loc}
              onClick={() => setLocationFilter(loc)}
              className={`px-2.5 py-1 rounded-lg font-medium capitalize transition-all ${
                locationFilter === loc
                  ? 'bg-white dark:bg-[#1C1C1E] text-[#000000] dark:text-[#FFFFFF] shadow-xs'
                  : 'text-[rgba(60,60,67,0.6)] dark:text-[rgba(235,235,245,0.6)]'
              }`}
            >
              {loc === 'all' ? 'All Venues' : loc === 'online' ? 'Online' : 'In-Person'}
            </button>
          ))}
        </div>
      </div>

      {/* Events List Cards */}
      <div className="space-y-3">
        {filteredEvents.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)] text-sm">
            No events match your selected filters.
          </div>
        ) : (
          filteredEvents.map((event) => {
            const badgeMeta = typeLabels[event.type] || { label: event.type, color: '#5AC8FA' };

            return (
              <div
                key={event.id}
                className="ios-card-press rounded-2xl p-5 bg-[var(--color-surface-elevated)] border border-[var(--color-border)] space-y-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="ios-caption px-2.5 py-0.5 rounded-full uppercase tracking-wider font-bold"
                      style={{
                        backgroundColor: `${badgeMeta.color}20`,
                        color: badgeMeta.color,
                      }}
                    >
                      {badgeMeta.label}
                    </span>

                    <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                      Organized by <strong className="text-[var(--color-text-primary)]">{event.organizer}</strong>
                    </span>
                  </div>

                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 ${
                      event.isOnline
                        ? 'bg-[var(--color-primary-subtle)] text-[var(--color-primary)]'
                        : 'bg-[var(--color-success-bg)] text-[var(--color-success-fg)]'
                    }`}
                  >
                    {event.isOnline ? <Globe className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                    {event.isOnline ? 'Online Broadcast' : 'In-Person Venue'}
                  </span>
                </div>

                <div>
                  <h3 className="ios-headline text-[var(--color-text-primary)] text-lg">
                    {event.name}
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1 leading-relaxed">
                    {event.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-[var(--color-border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-4 flex-wrap text-[var(--color-text-secondary)]">
                    <div className="flex items-center gap-1.5 font-medium text-[var(--color-text-primary)]">
                      <Calendar className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                      <span>{event.dateTime}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[var(--color-text-tertiary)]" />
                      <span>{event.venue}</span>
                    </div>
                  </div>

                  <a
                    href={event.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-primary-fg)] font-semibold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
                  >
                    <span>Register / Learn More</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
