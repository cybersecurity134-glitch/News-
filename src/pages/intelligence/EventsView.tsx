/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo } from 'react';
import { Calendar } from 'lucide-react';
import { useIntelligence } from '../../context/IntelligenceContext';
import { EventCard } from '../../components/intelligence/EventCard';

export const EventsView: React.FC = memo(() => {
  const { events } = useIntelligence();

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <div className="liquid-glass-card p-4 sm:p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[var(--accent-coral)] shrink-0" />
          <h1 className="font-extrabold text-lg sm:text-xl text-[var(--text-primary)]">
            Verified Upcoming Startup Events & Pitch Days
          </h1>
        </div>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          Official tech summits, investor demo days, and founder networking summits. No fictional venues or dates. Includes one-tap Add to Calendar integration.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
        {events.map((ev) => (
          <EventCard key={ev.id} event={ev} />
        ))}
      </div>
    </div>
  );
});

EventsView.displayName = 'EventsView';
