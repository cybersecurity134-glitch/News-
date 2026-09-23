/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, MessageSquare, Newspaper, Shield, ExternalLink } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { AppNotification } from '../../types/models';

interface NotificationBellProps {
  onNavigate?: (target: { tab?: string; path?: string; itemId?: string; chatWithUserId?: string }) => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ onNavigate }) => {
  const { notifications, unreadCount, markAllRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleNotificationClick = (n: AppNotification) => {
    if (n.linkTarget && onNavigate) {
      onNavigate(n.linkTarget);
      setIsOpen(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'chat':
        return <MessageSquare className="w-3.5 h-3.5 text-[#007AFF]" />;
      case 'news_approved':
        return <Newspaper className="w-3.5 h-3.5 text-emerald-500" />;
      default:
        return <Shield className="w-3.5 h-3.5 text-purple-500" />;
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full text-[var(--color-text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-[#FF3B30] text-white text-[10px] font-bold rounded-full ring-2 ring-[var(--color-bg)]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[var(--color-card-bg)] border border-[var(--color-separator)] shadow-2xl z-50 overflow-hidden">
          <div className="p-3.5 border-b border-[var(--color-separator)] flex items-center justify-between">
            <span className="text-footnote font-bold text-[var(--color-text-primary)]">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#007AFF] hover:underline"
              >
                <Check className="w-3 h-3" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-[var(--color-separator)]">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-footnote text-[var(--color-text-secondary)]">
                No notifications right now.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                    !n.read ? 'bg-[#007AFF]/5' : 'hover:bg-black/2 dark:hover:bg-white/2'
                  }`}
                >
                  <div className="p-1.5 rounded-full bg-black/5 dark:bg-white/5 shrink-0 mt-0.5">
                    {getIcon(n.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-footnote font-semibold text-[var(--color-text-primary)] line-clamp-1">
                      {n.title}
                    </p>
                    <p className="text-caption text-[var(--color-text-secondary)] line-clamp-2 mt-0.5">
                      {n.body}
                    </p>
                    <span className="text-[10px] text-[var(--color-text-secondary)] mt-1 block">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {n.linkTarget && (
                    <ExternalLink className="w-3.5 h-3.5 text-[var(--color-text-secondary)] shrink-0 mt-1" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
