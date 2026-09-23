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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activePartner = users.find((u) => u.id === activePartnerId) || conversationPartners[0];

  // Filter messages between current user and active partner
  const threadMessages = messages.filter(
    (m) =>
      (m.senderId === currentUser.id && m.recipientId === activePartner?.id) ||
      (m.senderId === activePartner?.id && m.recipientId === currentUser.id)
  );

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    setInputText('');
    setIsSending(true);

    try {
      await onSendMessage(activePartner.id, content);
    } catch (err: any) {
      alert('Failed to send message: ' + err.message);
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
    <div id="community-chat-container" className="w-full max-w-5xl mx-auto h-[calc(100vh-160px)] min-h-[500px] flex rounded-2xl bg-[#FFFFFF] dark:bg-[#1C1C1E] border border-[rgba(60,60,67,0.1)] dark:border-[rgba(84,84,88,0.5)] overflow-hidden shadow-sm">
      {/* Left Column: Conversation List */}
      <div
        className={`w-full sm:w-80 border-r border-[rgba(60,60,67,0.1)] dark:border-[rgba(84,84,88,0.5)] flex flex-col bg-[#F2F2F7] dark:bg-[#151516] ${
          mobileShowThread ? 'hidden sm:flex' : 'flex'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-[rgba(60,60,67,0.1)] dark:border-[rgba(84,84,88,0.5)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#007AFF] dark:text-[#0A84FF]" />
            <h2 className="ios-headline text-[#000000] dark:text-[#FFFFFF]">
              Community Chat
            </h2>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#007AFF]/10 text-[#007AFF] dark:text-[#0A84FF] font-semibold">
            1:1 Direct
          </span>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[rgba(60,60,67,0.06)] dark:divide-[rgba(84,84,88,0.3)]">
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
                    className="w-12 h-12 rounded-full object-cover border border-black/10 dark:border-white/10"
                  />
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#151516]" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-[#000000] dark:text-[#FFFFFF] truncate">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-[rgba(60,60,67,0.5)] dark:text-[rgba(235,235,245,0.5)] shrink-0">
                      {user.lastActive || 'Online'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded ${
                        user.role === 'admin'
                          ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                          : user.role === 'uploader'
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          : 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>

                  <p className="text-xs text-[rgba(60,60,67,0.6)] dark:text-[rgba(235,235,245,0.6)] truncate mt-1">
                    {lastMsg ? lastMsg.content : user.bio || 'Say hello...'}
                  </p>
                </div>

                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[#007AFF] text-white text-[11px] font-bold shrink-0">
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
        className={`flex-1 flex flex-col bg-[#FFFFFF] dark:bg-[#1C1C1E] ${
          !mobileShowThread ? 'hidden sm:flex' : 'flex'
        }`}
      >
        {activePartner ? (
          <>
            {/* Thread Header */}
            <div className="p-3.5 px-4 border-b border-[rgba(60,60,67,0.1)] dark:border-[rgba(84,84,88,0.5)] flex items-center justify-between bg-[#F2F2F7]/50 dark:bg-[#1C1C1E]">
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
                  className="w-10 h-10 rounded-full object-cover border border-black/10"
                />

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-sm text-[#000000] dark:text-[#FFFFFF]">
                      {activePartner.name}
                    </span>
                    {activePartner.role === 'admin' && (
                      <Shield className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    )}
                  </div>
                  <span className="text-[11px] text-[rgba(60,60,67,0.6)] dark:text-[rgba(235,235,245,0.6)]">
                    {activePartner.bio || `${activePartner.role} in startup community`}
                  </span>
                </div>
              </div>

              <div className="text-right hidden sm:block">
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Active Direct Channel
                </span>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {/* Context Pill */}
              <div className="text-center my-2">
                <span className="ios-footnote px-3 py-1 rounded-full bg-[#F2F2F7] dark:bg-[#2C2C2E] text-[rgba(60,60,67,0.6)] dark:text-[rgba(235,235,245,0.6)] inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#007AFF]" />
                  Direct 1:1 chat between founders, contributors, & admin
                </span>
              </div>

              {threadMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[rgba(60,60,67,0.6)]">
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
                            ? 'bg-[#007AFF] dark:bg-[#0A84FF] text-white rounded-br-xs'
                            : 'bg-[#F2F2F7] dark:bg-[#2C2C2E] text-[#000000] dark:text-[#FFFFFF] rounded-bl-xs'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      </div>

                      <div className="flex items-center gap-1 mt-1 px-1">
                        <span className="text-[10px] text-[rgba(60,60,67,0.5)] dark:text-[rgba(235,235,245,0.5)]">
                          {timeFormatted}
                        </span>
                        {isSentByMe && (
                          <span
                            className="text-[rgba(60,60,67,0.6)] dark:text-[rgba(235,235,245,0.6)]"
                            title={msg.read ? 'Read' : 'Sent'}
                          >
                            {msg.read ? (
                              <CheckCheck className="w-3.5 h-3.5 text-[#007AFF] dark:text-[#0A84FF]" />
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
              className="p-3 border-t border-[rgba(60,60,67,0.1)] dark:border-[rgba(84,84,88,0.5)] flex items-center gap-2 bg-[#F2F2F7]/40 dark:bg-[#1C1C1E]"
            >
              <input
                type="text"
                id="chat-message-input"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Message ${activePartner.name}...`}
                className="flex-1 px-4 py-2.5 rounded-full bg-[#F2F2F7] dark:bg-[#2C2C2E] border-0 text-sm outline-none focus:ring-2 focus:ring-[#007AFF] dark:focus:ring-[#0A84FF] text-[#000000] dark:text-[#FFFFFF]"
              />

              <button
                type="submit"
                id="send-chat-btn"
                disabled={!inputText.trim() || isSending}
                className="p-2.5 rounded-full bg-[#007AFF] hover:bg-[#0062CC] dark:bg-[#0A84FF] text-white disabled:opacity-40 transition-all shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="h-full flex items-center justify-center p-8 text-center text-[rgba(60,60,67,0.6)]">
            Select a community member to start chatting.
          </div>
        )}
      </div>
    </div>
  );
};
