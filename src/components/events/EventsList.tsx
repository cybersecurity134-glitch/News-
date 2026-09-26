/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StartupEvent } from '../../types/models';
import { EventCard } from './EventCard';
import { Calendar, Search } from 'lucide-react';

interface EventsListProps {
  events: StartupEvent[];
  isLoading: boolean;
}

export const EventsList: React.FC<EventsListProps> = ({ events, isLoading }) => {
  const [filter, setFilter] = useState<'all' | 'virtual' | 'in-person'>('all');
  const [query, setQuery] = useState('');

  const filteredEvents = events.filter((ev) => {
    const loc = (ev.location || ev.venue || '').toLowerCase();
    const isVirtual = loc.includes('online') || Boolean(ev.isOnline);
    const matchesFilter =
      filter === 'all'
        ? true
        : filter === 'virtual'
        ? isVirtual
        : !isVirtual;

    const matchesQuery =
      !query.trim() ||
      ev.name.toLowerCase().includes(query.toLowerCase()) ||
      ev.organizer.toLowerCase().includes(query.toLowerCase()) ||
      loc.includes(query.toLowerCase());

    return matchesFilter && matchesQuery;
  });

  return (
    <div className="space-y-4">
      {/* Search & Location Filter */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events, demo days, host organizations..."
            className="w-full pl-9 pr-3.5 py-2 rounded-full bg-[var(--color-card-bg)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
          />
          <Search className="w-4 h-4 text-[var(--color-text-secondary)] absolute left-3 top-2.5" />
        </div>

        <div className="flex p-1 rounded-full bg-[var(--color-card-bg)] border border-[var(--color-border)] shrink-0">
          {(['all', 'virtual', 'in-person'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilter(mode)}
              className={`px-3.5 py-1 rounded-full text-xs font-semibold capitalize transition-all ${
                filter === mode
                  ? 'bg-[var(--color-accent)] text-[var(--color-accent-fg)] shadow-xs'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-5 rounded-[16px] bg-[var(--color-card-bg)] border border-[var(--color-border)] animate-pulse space-y-3"
            >
              <div className="w-1/3 h-5 bg-black/10 dark:bg-white/10 rounded-md" />
              <div className="w-full h-10 bg-black/10 dark:bg-white/10 rounded-md" />
            </div>
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="rounded-[16px] p-10 text-center bg-[var(--color-card-bg)] border border-[var(--color-border)] space-y-2">
          <Calendar className="w-8 h-8 text-[var(--color-text-secondary)] mx-auto" />
          <h4 className="font-serif text-lg font-bold text-[var(--color-text-primary)]">No events found</h4>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Try adjusting your search query or location filter.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
};
