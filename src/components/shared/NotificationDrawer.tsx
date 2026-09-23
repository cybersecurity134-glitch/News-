/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo } from 'react';
import { X, Bell, Sparkles, CheckCircle2, Award, Zap } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction?: (action: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = memo(({
  isOpen,
  onClose,
  onSelectAction,
}) => {
  if (!isOpen) return null;

  const notifications = [
    {
      id: 'notif-1',
      title: 'Breaking Current Affairs Alert',
      message: 'Global Sovereign Green Bond Framework reaches $1.2 Trillion milestone.',
      time: '15m ago',
      type: 'breaking',
      icon: Zap,
      iconColor: 'text-[var(--accent-coral)] bg-[var(--accent-coral)]/10',
    },
    {
      id: 'notif-2',
      title: 'Daily Quiz Ready',
      message: 'Test your grasp on today\'s 5 major national & global constitutional breakthroughs.',
      time: '1h ago',
      type: 'quiz',
      icon: Award,
      iconColor: 'text-amber-500 bg-amber-500/10',
    },
    {
      id: 'notif-3',
      title: 'Morning Briefing Dispatched',
      message: 'Your 3-minute executive summary of diplomatic, economic and tech news is live.',
      time: '3h ago',
      type: 'digest',
      icon: Sparkles,
      iconColor: 'text-[var(--accent-indigo)] bg-[var(--accent-indigo)]/10',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-sm flex justify-end animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Notifications"
    >
      <div
        className="w-full max-w-sm h-full liquid-glass-modal p-5 flex flex-col justify-between shadow-2xl safe-top safe-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)] mb-4">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[var(--accent-primary)]" />
              <h3 className="font-extrabold text-base text-[var(--text-primary)]">
                Notifications
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-secondary)]"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* List */}
          <div className="space-y-3">
            {notifications.map((n) => {
              const Icon = n.icon;
              return (
                <div
                  key={n.id}
                  onClick={() => {
                    onSelectAction?.(n.type);
                    onClose();
                  }}
                  className="p-3.5 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/40 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10 cursor-pointer interactive-press transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl shrink-0 ${n.iconColor}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-bold text-[var(--text-primary)]">
                          {n.title}
                        </span>
                        <span className="text-[var(--text-tertiary)]">{n.time}</span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[var(--border-subtle)] text-center">
          <p className="text-[11px] text-[var(--text-tertiary)]">
            Push notifications powered by VenturePulse Live Wire
          </p>
        </div>
      </div>
    </div>
  );
});

NotificationDrawer.displayName = 'NotificationDrawer';
