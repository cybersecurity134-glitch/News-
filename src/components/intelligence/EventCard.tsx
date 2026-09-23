/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo } from 'react';
import { Calendar, MapPin, ExternalLink, CalendarPlus, Users } from 'lucide-react';
import { StartupEventItem } from '../../types/intelligence';

interface EventCardProps {
  event: StartupEventItem;
}

export const EventCard: React.FC<EventCardProps> = memo(({ event }) => {
  const handleAddToCalendar = () => {
    // Generate simple Google Calendar URL
    const title = encodeURIComponent(event.name);
    const details = encodeURIComponent(`Organized by ${event.organizer}. Venue: ${event.venue}. Register: ${event.registrationUrl}`);
    const location = encodeURIComponent(`${event.venue}, ${event.city}`);
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
    window.open(url, '_blank');
  };

  return (
    <div className="liquid-glass-card p-5 space-y-4 select-none">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs text-[var(--color-text-secondary)]">
            <span className="font-extrabold uppercase text-[var(--sec-events)] tracking-wider">
              {event.format}
            </span>
            <span aria-hidden="true" className="opacity-40">·</span>
            <span>{event.organizer}</span>
          </div>

          <h3 className="font-extrabold text-lg text-[var(--color-text-primary)] font-display">
            {event.name}
          </h3>
        </div>

        {event.pitchOpportunity && (
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full badge-warning shrink-0">
            Pitch Opportunity
          </span>
        )}
      </div>

      <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 space-y-1.5 text-xs border border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-2 text-[var(--color-text-primary)] font-semibold">
          <Calendar className="w-3.5 h-3.5 text-[var(--color-primary)] shrink-0" />
          <span>{event.date} {event.time ? `(${event.time})` : ''}</span>
        </div>

        <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
          <MapPin className="w-3.5 h-3.5 text-[var(--sec-events)] shrink-0" />
          <span>{event.venue}, {event.city}, {event.country}</span>
        </div>
      </div>

      <div className="pt-2 border-t border-[var(--color-border-subtle)] flex items-center justify-between text-xs text-[var(--color-text-tertiary)] flex-wrap gap-2">
        <button
          onClick={handleAddToCalendar}
          className="text-xs font-bold text-[var(--color-primary)] hover:underline inline-flex items-center gap-1.5 tap-target-44"
        >
          <CalendarPlus className="w-3.5 h-3.5" />
          <span>Add to Calendar</span>
        </button>

        <a
          href={event.registrationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-full bg-[var(--sec-events)] hover:opacity-90 text-white font-bold inline-flex items-center gap-1.5 transition-all tap-target-44 interactive-press shadow-xs"
        >
          <span>Official Registration</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
});

EventCard.displayName = 'EventCard';

