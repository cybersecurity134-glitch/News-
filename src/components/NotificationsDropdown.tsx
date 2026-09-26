/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppNotification } from '../types';
import { formatTimeAgo } from '../utils';
import { MessageSquare, CheckCircle, Shield, X, Bell } from 'lucide-react';

interface NotificationsDropdownProps {
  notifications: AppNotification[];
  currentUserId: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectNotification: (notif: AppNotification) => void;
  onMarkAllRead: () => void;
}

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  notifications,
  currentUserId,
  isOpen,
  onClose,
  onSelectNotification,
  onMarkAllRead,
}) => {
  if (!isOpen) return null;

  // Notifications relevant for this user or 'all'
  const userNotifs = notifications.filter(
    (n) => n.userId === currentUserId || n.userId === 'all'
  );

  return (
    <div
      id="notifications-dropdown-backdrop"
      className="fixed inset-0 z-50 bg-transparent"
      onClick={onClose}
    >
      <div
        id="notifications-popover"
        className="absolute top-16 right-4 sm:right-16 w-80 sm:w-96 rounded-2xl bg-[#FFFFFF] dark:bg-[#1C1C1E] border border-[rgba(60,60,67,0.15)] dark:border-[rgba(84,84,88,0.5)] shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3.5 px-4 border-b border-[rgba(60,60,67,0.1)] dark:border-[rgba(84,84,88,0.5)] flex items-center justify-between bg-[#F2F2F7]/50 dark:bg-[#1C1C1E]">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#007AFF] dark:text-[#0A84FF]" />
            <h3 className="ios-headline text-sm font-semibold text-[#000000] dark:text-[#FFFFFF]">
              Notifications
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllRead}
              className="text-xs text-[#007AFF] dark:text-[#0A84FF] font-medium hover:underline"
            >
              Mark all read
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-[rgba(60,60,67,0.6)] hover:bg-black/5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto divide-y divide-[rgba(60,60,67,0.06)] dark:divide-[rgba(84,84,88,0.3)]">
          {userNotifs.length === 0 ? (
            <div className="p-6 text-center text-xs text-[rgba(60,60,67,0.6)]">
              No recent notifications.
            </div>
          ) : (
            userNotifs.map((notif) => {
              const icon =
                notif.type === 'chat' ? (
                  <MessageSquare className="w-4 h-4 text-[var(--color-primary)]" />
                ) : notif.type === 'news_approved' ? (
                  <CheckCircle className="w-4 h-4 text-[var(--color-success)]" />
                ) : (
                  <Shield className="w-4 h-4 text-[var(--color-accent)]" />
                );

              return (
                <div
                  key={notif.id}
                  onClick={() => {
                    onSelectNotification(notif);
                    onClose();
                  }}
                  className={`p-3.5 flex items-start gap-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.03] cursor-pointer transition-colors ${
                    !notif.read ? 'bg-[var(--color-primary-subtle)]' : ''
                  }`}
                >
                  <div className="p-2 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] shrink-0 mt-0.5">
                    {icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-semibold text-xs text-[var(--color-text-primary)] truncate">
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-[var(--color-text-tertiary)] shrink-0">
                        {formatTimeAgo(notif.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 mt-0.5">
                      {notif.body}
                    </p>
                  </div>

                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] shrink-0 mt-1.5" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
