/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, memo } from 'react';
import { User } from '../types/models';
import { useChat } from '../hooks/useChat';
import { useAuth } from '../hooks/useAuth';
import { ChatList } from '../components/chat/ChatList';
import { ChatWindow } from '../components/chat/ChatWindow';
import { NewChatButton } from '../components/chat/NewChatButton';
import { MessageSquare, Bell } from 'lucide-react';

interface ChatPageProps {
  initialPartner?: User | null;
}

export const ChatPage: React.FC<ChatPageProps> = memo(({ initialPartner }) => {
  const { currentUser } = useAuth();
  const [activePartner, setActivePartner] = useState<User | null>(initialPartner || null);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);

  const {
    threads,
    messages,
    hasMoreOlder,
    loadOlderMessages,
    isLoading,
    sendMessage,
    retryMessage,
  } = useChat(undefined, activePartner?.id);

  // Load available users for starting new chats
  useEffect(() => {
    let isSubscribed = true;
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/state');
        if (!res.ok) return;
        const state = await res.json();
        if (isSubscribed) {
          const otherUsers = (state.users || []).filter(
            (u: any) => u.id !== currentUser?.id
          );
          setAvailableUsers(otherUsers);
        }
      } catch {
        // silent
      }
    };
    fetchUsers();
    return () => {
      isSubscribed = false;
    };
  }, [currentUser]);

  useEffect(() => {
    if (initialPartner) {
      setActivePartner(initialPartner);
    }
  }, [initialPartner]);

  return (
    <div className="space-y-4 pb-24 pt-2 animate-tab-screen">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="font-serif text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
            Startup & Community Chat
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Direct messaging with verified contributors, analysts, and founders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <NewChatButton
            availableUsers={availableUsers}
            onSelectUser={(u) => setActivePartner(u)}
          />
        </div>
      </div>

      {/* Responsive Chat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left Pane: Chat Threads */}
        <div
          className={`md:col-span-5 rounded-[16px] bg-[var(--color-card-bg)] border border-[var(--color-border)] overflow-hidden ${
            activePartner ? 'hidden md:block' : 'block'
          }`}
        >
          <div className="p-3.5 border-b border-[var(--color-border)] bg-black/[0.02] dark:bg-white/[0.02]">
            <span className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider">
              Conversations ({threads.length})
            </span>
          </div>
          <ChatList
            threads={threads}
            activePartnerId={activePartner?.id}
            onSelectThread={(partner) => setActivePartner(partner)}
          />
        </div>

        {/* Right Pane: Active Conversation */}
        <div
          className={`md:col-span-7 ${
            !activePartner ? 'hidden md:block' : 'block'
          }`}
        >
          {activePartner ? (
            <ChatWindow
              partner={activePartner}
              messages={messages}
              hasMoreOlder={hasMoreOlder}
              onLoadOlderMessages={loadOlderMessages}
              isLoading={isLoading}
              onSendMessage={(text) => sendMessage(text, activePartner.id)}
              onRetryMessage={retryMessage}
              onBack={() => setActivePartner(null)}
            />
          ) : (
            <div className="h-[520px] rounded-[16px] bg-[var(--color-card-bg)] border border-[var(--color-border)] flex flex-col items-center justify-center p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-[var(--color-text-secondary)]">
                <MessageSquare className="w-6 h-6 stroke-[1.5]" />
              </div>
              <h4 className="font-serif text-lg font-bold text-[var(--color-text-primary)]">
                Select a conversation
              </h4>
              <p className="text-xs text-[var(--color-text-secondary)] max-w-xs leading-relaxed">
                Choose a conversation from the left or initiate a new direct chat with any contributor.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

ChatPage.displayName = 'ChatPage';
