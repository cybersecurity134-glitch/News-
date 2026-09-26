/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, UserProfile } from '../types';
import { Send, CheckCheck, Check, MessageSquare, ArrowLeft, Shield, Sparkles } from 'lucide-react';

interface ChatViewProps {
  currentUser: UserProfile;
  users: UserProfile[];
  messages: ChatMessage[];
  initialPartnerId?: string;
  isDark: boolean;
  onSendMessage: (recipientId: string, content: string) => Promise<void>;
  onMarkRead: (partnerId: string) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  currentUser,
  users,
  messages,
  initialPartnerId,
  isDark: _isDark,
  onSendMessage,
  onMarkRead,
}) => {
  // Available conversation partners (all users except current user)
  const conversationPartners = users.filter((u) => u.id !== currentUser.id);

  const [activePartnerId, setActivePartnerId] = useState<string>(
    initialPartnerId || conversationPartners[0]?.id || ''
  );
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [mobileShowThread, setMobileShowThread] = useState(!!initialPartnerId);
  const [optimisticMessages, setOptimisticMessages] = useState<ChatMessage[]>([]);
  const [sendError, setSendError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activePartner = users.find((u) => u.id === activePartnerId) || conversationPartners[0];

  // Realtime thread combining confirmed server messages and pending optimistic messages
  const threadMessages = React.useMemo(() => {
    const serverThread = messages.filter(
      (m) =>
        (m.senderId === currentUser.id && m.recipientId === activePartner?.id) ||
        (m.senderId === activePartner?.id && m.recipientId === currentUser.id)
    );

    // Keep only optimistic messages that have not yet synced from server
    const pendingOptimistic = optimisticMessages.filter(
      (opt) =>
        opt.recipientId === activePartner?.id &&
        !serverThread.some((srv) => srv.content === opt.content && Math.abs(new Date(srv.createdAt).getTime() - new Date(opt.createdAt).getTime()) < 3000)
    );

    return [...serverThread, ...pendingOptimistic];
  }, [messages, optimisticMessages, currentUser.id, activePartner?.id]);

  // Scroll to bottom when new messages arrive (instant without frame drops)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [threadMessages.length, activePartnerId]);

  // Mark as read when opening conversation
  useEffect(() => {
    if (activePartner?.id) {
      onMarkRead(activePartner.id);
    }
  }, [activePartner?.id]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activePartner?.id || isSending) return;

    const content = inputText.trim();
    const tempId = 'opt-' + Date.now();
    const optimisticMsg: ChatMessage = {
      id: tempId,
      senderId: currentUser.id,
      recipientId: activePartner.id,
      content,
      createdAt: new Date().toISOString(),
      read: false,
    };

    // 0ms Optimistic UI: message appears instantly on screen!
    setOptimisticMessages((prev) => [...prev, optimisticMsg]);
    setInputText('');
    setSendError(null);
    setIsSending(true);

    try {
      await onSendMessage(activePartner.id, content);
      // Remove temporary optimistic message once confirmed
      setOptimisticMessages((prev) => prev.filter((m) => m.id !== tempId));
    } catch (err: any) {
      setSendError('Message failed to deliver. Tap to retry.');
      // Keep optimistic message or mark error without alert
    } finally {
      setIsSending(false);
    }
  };

  const getUnreadCountForUser = (userId: string) => {
    return messages.filter((m) => m.senderId === userId && m.recipientId === currentUser.id && !m.read).length;
  };

  const getLastMessageForUser = (userId: string) => {
    const convo = messages.filter(
      (m) =>
        (m.senderId === currentUser.id && m.recipientId === userId) ||
        (m.senderId === userId && m.recipientId === currentUser.id)
    );
    return convo[convo.length - 1];
  };

  return (
    <div id="community-chat-container" className="w-full max-w-5xl mx-auto h-[calc(100vh-160px)] min-h-[500px] flex rounded-2xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] overflow-hidden shadow-sm">
      {/* Left Column: Conversation List */}
      <div
        className={`w-full sm:w-80 border-r border-[var(--color-border)] flex flex-col bg-[var(--color-surface-muted)] ${
          mobileShowThread ? 'hidden sm:flex' : 'flex'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[var(--color-primary)]" />
            <h2 className="ios-headline text-[var(--color-text-primary)]">
              Community Chat
            </h2>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--color-primary-subtle)] text-[var(--color-primary)] font-semibold">
            1:1 Direct
          </span>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[var(--color-border-subtle)]">
          {conversationPartners.map((user) => {
            const isSelected = activePartner?.id === user.id;
            const unreadCount = getUnreadCountForUser(user.id);
            const lastMsg = getLastMessageForUser(user.id);

            return (
              <button
                key={user.id}
                onClick={() => {
                  setActivePartnerId(user.id);
                  setMobileShowThread(true);
                }}
                className={`w-full p-3.5 flex items-center gap-3 text-left transition-colors relative ${
                  isSelected
                    ? 'bg-black/5 dark:bg-white/10'
                    : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.04]'
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    loading="lazy"
                    decoding="async"
                    className="w-12 h-12 rounded-full object-cover border border-black/10 dark:border-white/10"
                  />
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[var(--color-success)] border-2 border-white dark:border-[var(--color-surface-elevated)]" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-[var(--color-text-primary)] truncate">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-[var(--color-text-tertiary)] shrink-0">
                      {user.lastActive || 'Online'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded ${
                        user.role === 'admin'
                          ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border border-[var(--color-accent-border)]'
                          : user.role === 'uploader'
                          ? 'bg-[var(--color-primary-subtle)] text-[var(--color-primary)] border border-[var(--color-primary-border)]'
                          : 'bg-[var(--color-secondary-subtle)] text-[var(--color-text-secondary)] border border-[var(--color-border)]'
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--color-text-secondary)] truncate mt-1">
                    {lastMsg ? lastMsg.content : user.bio || 'Say hello...'}
                  </p>
                </div>

                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[var(--color-primary)] text-[var(--color-primary-fg)] text-[11px] font-bold shrink-0">
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Column: Active Thread */}
      <div
        className={`flex-1 flex flex-col bg-[var(--color-surface-elevated)] ${
          !mobileShowThread ? 'hidden sm:flex' : 'flex'
        }`}
      >
        {activePartner ? (
          <>
            {/* Thread Header */}
            <div className="p-3.5 px-4 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-surface-muted)]">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileShowThread(false)}
                  className="sm:hidden p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <img
                  src={activePartner.avatar}
                  alt={activePartner.name}
                  loading="lazy"
                  decoding="async"
                  className="w-10 h-10 rounded-full object-cover border border-black/10"
                />

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-sm text-[var(--color-text-primary)]">
                      {activePartner.name}
                    </span>
                    {activePartner.role === 'admin' && (
                      <Shield className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                    )}
                  </div>
                  <span className="text-[11px] text-[var(--color-text-secondary)]">
                    {activePartner.bio || `${activePartner.role} in startup community`}
                  </span>
                </div>
              </div>

              <div className="text-right hidden sm:block">
                <span className="text-xs text-[var(--color-success)] font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-success)] animate-pulse" />
                  Active Direct Channel
                </span>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {/* Context Pill */}
              <div className="text-center my-2">
                <span className="ios-footnote px-3 py-1 rounded-full bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[var(--color-primary)]" />
                  Direct 1:1 chat between founders, contributors, & admin
                </span>
              </div>

              {threadMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[var(--color-text-secondary)]">
                  <MessageSquare className="w-10 h-10 mb-2 opacity-40" />
                  <p className="text-sm font-semibold">Start the conversation with {activePartner.name}</p>
                  <p className="text-xs mt-1">Discuss grant applications, co-founder intros, or investor rounds.</p>
                </div>
              ) : (
                threadMessages.map((msg) => {
                  const isSentByMe = msg.senderId === currentUser.id;
                  const timeFormatted = new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isSentByMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          isSentByMe
                            ? 'bg-[var(--color-primary)] text-[var(--color-primary-fg)] rounded-br-xs shadow-xs'
                            : 'bg-[var(--color-surface-muted)] text-[var(--color-text-primary)] rounded-bl-xs border border-[var(--color-border-subtle)]'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      </div>

                      <div className="flex items-center gap-1 mt-1 px-1">
                        <span className="text-[10px] text-[var(--color-text-tertiary)]">
                          {timeFormatted}
                        </span>
                        {isSentByMe && (
                          <span
                            className="text-[var(--color-text-tertiary)]"
                            title={msg.read ? 'Read' : 'Sent'}
                          >
                            {msg.read ? (
                              <CheckCheck className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={handleSend}
              className="p-3 border-t border-[var(--color-border)] flex items-center gap-2 bg-[var(--color-surface-muted)]"
            >
              <input
                type="text"
                id="chat-message-input"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Message ${activePartner.name}...`}
                className="flex-1 px-4 py-2.5 rounded-full bg-[var(--glass-input-bg)] border border-[var(--glass-input-border)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--color-text-primary)]"
              />

              <button
                type="submit"
                id="send-chat-btn"
                disabled={!inputText.trim() || isSending}
                className="p-2.5 rounded-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-primary-fg)] disabled:opacity-40 transition-all shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="h-full flex items-center justify-center p-8 text-center text-[var(--color-text-secondary)]">
            Select a community member to start chatting.
          </div>
        )}
      </div>
    </div>
  );
};
