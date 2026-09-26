/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Newspaper, Calendar, ShieldCheck, MessageSquare, User } from 'lucide-react';

export type AppTab = 'feed' | 'events' | 'queue' | 'chat' | 'profile';

interface TabBarProps {
  activeTab: AppTab;
  pendingQueueCount: number;
  unreadChatCount: number;
  onSelectTab: (tab: AppTab) => void;
}

export const TabBar: React.FC<TabBarProps> = ({
  activeTab,
  pendingQueueCount,
  unreadChatCount,
  onSelectTab,
}) => {
  const tabs = [
    {
      id: 'feed' as AppTab,
      label: 'News Feed',
      icon: Newspaper,
    },
    {
      id: 'events' as AppTab,
      label: 'Events',
      icon: Calendar,
    },
    {
      id: 'queue' as AppTab,
      label: 'Verification',
      icon: ShieldCheck,
      badge: pendingQueueCount,
      badgeColor: 'bg-[var(--color-warning)]',
    },
    {
      id: 'chat' as AppTab,
      label: '1:1 Chat',
      icon: MessageSquare,
      badge: unreadChatCount,
      badgeColor: 'bg-[var(--color-primary)]',
    },
    {
      id: 'profile' as AppTab,
      label: 'Profile',
      icon: User,
    },
  ];

  return (
    <nav
      id="ios-bottom-tab-bar"
      className="fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl bg-[var(--glass-nav-bg)] border-t border-[var(--glass-nav-border)] transition-colors safe-bottom"
    >
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`tab-btn-${tab.id}`}
              onClick={() => onSelectTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 relative transition-colors ${
                isActive
                  ? 'text-[var(--color-primary)]'
                  : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {!!tab.badge && tab.badge > 0 && (
                  <span
                    className={`absolute -top-1 -right-2 px-1.5 py-0.2 rounded-full text-[var(--color-primary-fg)] text-[10px] font-bold ${tab.badgeColor}`}
                  >
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </span>
                )}
              </div>

              <span className={`text-[10px] tracking-tight mt-1 ${isActive ? 'font-bold' : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
