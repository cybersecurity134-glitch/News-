/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Newspaper, Calendar, PlusCircle, MessageSquare, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export type TabId = 'feed' | 'events' | 'upload' | 'chat' | 'admin';

interface TabBarProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  pendingCount?: number;
  unreadChatCount?: number;
}

export const TabBar: React.FC<TabBarProps> = ({
  activeTab,
  onSelectTab,
  pendingCount = 0,
  unreadChatCount = 1,
}) => {
  const { currentUser } = useAuth();

  const tabs: { id: TabId; label: string; sublabel?: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'feed',
      label: 'Home',
      icon: <Newspaper className="w-5 h-5 stroke-[1.8]" />,
    },
    {
      id: 'events',
      label: 'Events',
      icon: <Calendar className="w-5 h-5 stroke-[1.8]" />,
    },
    {
      id: 'upload',
      label: 'Post',
      sublabel: 'contributors',
      icon: <PlusCircle className="w-5 h-5 stroke-[1.8]" />,
    },
    {
      id: 'chat',
      label: 'Chat',
      icon: <MessageSquare className="w-5 h-5 stroke-[1.8]" />,
      badge: unreadChatCount,
    },
  ];

  if (currentUser?.role === 'admin') {
    tabs.push({
      id: 'admin',
      label: 'Admin',
      icon: <ShieldCheck className="w-5 h-5 stroke-[1.8]" />,
      badge: pendingCount > 0 ? pendingCount : undefined,
    });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 backdrop-blur-lg bg-[var(--color-bg)]/92 border-t border-[var(--color-border)] transition-colors safe-area-bottom">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center flex-1 py-1 min-h-[48px] interactive-press transition-colors ${
                isActive
                  ? 'text-[var(--color-accent)]'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              <div className="relative">
                {tab.icon}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-2 flex items-center justify-center min-w-[16px] h-4 px-1 bg-[var(--color-accent)] text-[#0B1F3A] text-[9px] font-extrabold rounded-full">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 font-medium ${isActive ? 'font-bold' : ''}`}>
                {tab.label}
              </span>
              {tab.sublabel && (
                <span className="text-[8px] text-[var(--color-text-secondary)] -mt-0.5 opacity-80 leading-none">
                  {tab.sublabel}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
