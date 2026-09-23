/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User } from '../../types/models';
import { MessageSquarePlus, X, User as UserIcon } from 'lucide-react';

interface NewChatButtonProps {
  availableUsers: User[];
  onSelectUser: (user: User) => void;
}

export const NewChatButton: React.FC<NewChatButtonProps> = ({
  availableUsers,
  onSelectUser,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#007AFF] hover:bg-[#0062CC] text-white text-xs font-semibold shadow-xs transition-transform active:scale-98"
      >
        <MessageSquarePlus className="w-4 h-4" />
        <span>New 1:1 Chat</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-[var(--color-card-bg)] border border-[var(--color-separator)] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--color-separator)]">
              <h3 className="text-headline text-[var(--color-text-primary)] font-bold">
                Start Conversation
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full text-[var(--color-text-secondary)] hover:bg-black/5 dark:hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-footnote text-[var(--color-text-secondary)]">
              Select a founder, contributor, or editor to start a 1:1 discussion:
            </p>

            <div className="max-h-60 overflow-y-auto space-y-1 divide-y divide-[var(--color-separator)]">
              {availableUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    onSelectUser(u);
                    setIsOpen(false);
                  }}
                  className="w-full p-2.5 flex items-center gap-3 text-left rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <img
                    src={
                      u.avatarUrl ||
                      `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80`
                    }
                    alt={u.name}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-footnote font-semibold text-[var(--color-text-primary)] truncate">
                      {u.name}
                    </p>
                    <p className="text-caption text-[var(--color-text-secondary)] capitalize">
                      {u.role}
                    </p>
                  </div>
                  <UserIcon className="w-4 h-4 text-[var(--color-text-secondary)]" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
