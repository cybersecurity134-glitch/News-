/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { StartupEvent } from '../../types/models';
import { Calendar, MapPin, Building, ExternalLink, CalendarPlus } from 'lucide-react';

interface EventCardProps {
  event: StartupEvent;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  let eventDateObj: Date;
  try {
    const rawDate = event.date || event.dateTime;
    eventDateObj = rawDate ? new Date(rawDate) : new Date();
  } catch {
    eventDateObj = new Date();
  }

  const monthStr = eventDateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const dayStr = eventDateObj.toLocaleDateString('en-US', { day: 'numeric' });
  const locationStr = event.location || event.venue || 'Virtual Event';

  const handleAddToCalendar = (e: React.MouseEvent) => {
    e.stopPropagation();
    const title = encodeURIComponent(event.name);
    const location = encodeURIComponent(locationStr);
    const details = encodeURIComponent(
      `${event.description || ''}\n\nOrganizer: ${event.organizer}\nRegistration: ${event.registrationUrl || event.sourceUrl || ''}`
    );
    const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&location=${location}&details=${details}`;
    window.open(googleCalUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <article
      className="p-4 sm:p-5 rounded-[16px] bg-[var(--color-card-bg)] border border-[var(--color-border)] transition-all hover:border-[var(--color-accent)]"
      tabIndex={0}
    >
      <div className="flex items-start gap-4">
        {/* Date Block */}
        <div className="shrink-0 w-14 h-16 rounded-[12px] bg-[var(--cat-events-bg)] border border-[var(--cat-events)]/30 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-extrabold tracking-wider text-[var(--cat-events)]">
            {monthStr}
          </span>
          <span className="text-xl font-mono font-extrabold text-[var(--color-text-primary)] leading-tight">
            {dayStr}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--cat-events-bg)] text-[var(--cat-events)]">
              {locationStr.toLowerCase().includes('online') || event.isOnline ? 'Virtual Stage' : 'Demo Day'}
            </span>
            <span className="text-xs text-[var(--color-text-secondary)] truncate">
              Hosted by {event.organizer}
            </span>
          </div>

          <h3 className="font-serif text-lg font-bold text-[var(--color-text-primary)] leading-snug">
            {event.name}
          </h3>

          {event.description && (
            <p className="text-xs text-[var(--color-text-secondary)] mt-1.5 line-clamp-2 leading-relaxed">
              {event.description}
            </p>
          )}

          {/* Venue & Add to Calendar */}
          <div className="mt-3 pt-3 border-t border-[var(--color-border)] flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-[var(--color-text-secondary)] truncate max-w-[240px]">
              <MapPin className="w-3.5 h-3.5 text-[var(--cat-events)] shrink-0" />
              <span className="truncate">{locationStr}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAddToCalendar}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-black/5 dark:bg-white/5 border border-[var(--color-border)] hover:bg-black/10 dark:hover:bg-white/10 text-[var(--color-text-primary)] transition-colors"
                title="Add to Google Calendar"
              >
                <CalendarPlus className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                <span>Add to calendar</span>
              </button>

              {(event.registrationUrl || event.sourceUrl) && (
                <a
                  href={event.registrationUrl || event.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[var(--color-accent)] text-[#0B1F3A] hover:opacity-95 transition-opacity"
                  title="Register for Event"
                >
                  <span>Register</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
