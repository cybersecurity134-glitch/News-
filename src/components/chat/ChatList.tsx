/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User } from '../../types/models';

interface ChatListProps {
  threads: any[];
  activePartnerId?: string;
  onSelectThread: (partner: User) => void;
}

export const ChatList: React.FC<ChatListProps> = ({
  threads,
  activePartnerId,
  onSelectThread,
}) => {
  if (threads.length === 0) {
    return (
      <div className="p-6 text-center text-footnote text-[var(--color-text-secondary)]">
        No active chats yet. Start a discussion with a verified founder, uploader, or administrator.
      </div>
    );
  }

  return (
    <div className="divide-y divide-[var(--color-separator)]">
      {threads.map((thread) => {
        const partner: User = thread.partner || {
          id: thread.id,
          name: 'Community Member',
          role: 'viewer',
        };
        const isActive = activePartnerId === partner.id;
        const lastMsg = thread.lastMessage?.text || thread.lastMessage?.content || 'Started a conversation';
        const lastTime = thread.lastMessage?.sentAt || thread.lastMessage?.createdAt;

        return (
          <button
            key={thread.id}
            onClick={() => onSelectThread(partner)}
            className={`w-full p-3.5 flex items-center gap-3 text-left transition-colors ${
              isActive
                ? 'bg-black/5 dark:bg-white/5'
                : 'hover:bg-black/2 dark:hover:bg-white/2'
            }`}
          >
            <div className="relative shrink-0">
              <img
                src={
                  partner.avatarUrl ||
                  `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80`
                }
                alt={partner.name}
                className="w-11 h-11 rounded-full object-cover border border-black/10"
              />
              {thread.unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-[#007AFF] rounded-full ring-2 ring-white dark:ring-black" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-footnote font-semibold text-[var(--color-text-primary)] truncate">
                  {partner.name}
                </span>
                {lastTime && (
                  <span className="text-[10px] text-[var(--color-text-secondary)] shrink-0 ml-2">
                    {new Date(lastTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <p className="text-caption text-[var(--color-text-secondary)] truncate">
                  {lastMsg}
                </p>
                <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-black/5 dark:bg-white/5 text-[var(--color-text-secondary)] ml-1 shrink-0">
                  {partner.role}
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
