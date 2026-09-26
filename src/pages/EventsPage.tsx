/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { StartupEvent } from '../types/models';
import { apiClient } from '../api/client';
import { EventsList } from '../components/events/EventsList';
import { CalendarDays, Plus, X, MapPin, Building, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const EventsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState<StartupEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // New event form state
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [registrationUrl, setRegistrationUrl] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getEvents();
      setEvents(data);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !date || !location || !organizer || !registrationUrl) return;

    const newEvent: StartupEvent = {
      id: 'event-' + Date.now(),
      name: name.trim(),
      date,
      location: location.trim(),
      organizer: organizer.trim(),
      registrationUrl: registrationUrl.trim(),
      description: description.trim() || undefined,
    };

    setEvents((prev) => [newEvent, ...prev]);
    setShowAddModal(false);

    // Reset
    setName('');
    setDate('');
    setLocation('');
    setOrganizer('');
    setRegistrationUrl('');
    setDescription('');
  };

  return (
    <div className="space-y-4 pb-24 pt-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
            Startup Events & Pitch Days
          </h2>
          <p className="text-subheadline text-[var(--color-text-secondary)]">
            Curated demo days, venture expos, and investor presentation stages.
          </p>
        </div>

        {currentUser && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-primary-fg)] text-xs font-semibold shadow-xs transition-transform active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>List Event</span>
          </button>
        )}
      </div>

      <EventsList events={events} isLoading={isLoading} />

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-[var(--color-card-bg)] border border-[var(--color-separator)] p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--color-separator)]">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-[var(--color-primary)]" />
                <h3 className="text-headline text-[var(--color-text-primary)] font-bold">
                  List Startup Event
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full text-[var(--color-text-secondary)] hover:bg-black/5 dark:hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3">
              <div>
                <label className="block text-footnote font-semibold text-[var(--color-text-secondary)] mb-1">
                  Event / Demo Day Name <span className="text-[var(--color-error)]">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Y Combinator Summer Demo Day"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--color-separator)] text-xs text-[var(--color-text-primary)] outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-footnote font-semibold text-[var(--color-text-secondary)] mb-1">
                    Event Date <span className="text-[var(--color-error)]">*</span>
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--color-separator)] text-xs text-[var(--color-text-primary)] outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-footnote font-semibold text-[var(--color-text-secondary)] mb-1">
                    Location / Format <span className="text-[var(--color-error)]">*</span>
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. San Francisco or Online"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--color-separator)] text-xs text-[var(--color-text-primary)] outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-footnote font-semibold text-[var(--color-text-secondary)] mb-1">
                  Organizer / Host Entity <span className="text-[var(--color-error)]">*</span>
                </label>
                <input
                  type="text"
                  value={organizer}
                  onChange={(e) => setOrganizer(e.target.value)}
                  placeholder="e.g. Techstars, Andreessen Horowitz, Slush"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--color-separator)] text-xs text-[var(--color-text-primary)] outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>

              <div>
                <label className="block text-footnote font-semibold text-[var(--color-text-secondary)] mb-1">
                  Registration / RSVP URL <span className="text-[var(--color-error)]">*</span>
                </label>
                <input
                  type="url"
                  value={registrationUrl}
                  onChange={(e) => setRegistrationUrl(e.target.value)}
                  placeholder="https://..."
                  required
                  className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--color-separator)] text-xs text-[var(--color-text-primary)] outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>

              <div>
                <label className="block text-footnote font-semibold text-[var(--color-text-secondary)] mb-1">
                  Brief Details
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Eligibility, tracks, prize pool, or angel attendee list..."
                  className="w-full px-3 py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--color-separator)] text-xs text-[var(--color-text-primary)] outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-primary-fg)] text-xs font-semibold shadow-xs transition-colors"
              >
                Publish Event
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
