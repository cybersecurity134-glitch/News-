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
      badgeColor: 'bg-amber-500',
    },
    {
      id: 'chat' as AppTab,
      label: '1:1 Chat',
      icon: MessageSquare,
      badge: unreadChatCount,
      badgeColor: 'bg-[#007AFF]',
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
      className="fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl bg-[#FFFFFF]/90 dark:bg-[#121212]/90 border-t border-[rgba(60,60,67,0.15)] dark:border-[rgba(84,84,88,0.5)] transition-colors"
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
                  ? 'text-[#007AFF] dark:text-[#0A84FF]'
                  : 'text-[rgba(60,60,67,0.5)] dark:text-[rgba(235,235,245,0.5)] hover:text-[#000000] dark:hover:text-[#FFFFFF]'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {!!tab.badge && tab.badge > 0 && (
                  <span
                    className={`absolute -top-1 -right-2 px-1.5 py-0.2 rounded-full text-white text-[10px] font-bold ${tab.badgeColor}`}
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
