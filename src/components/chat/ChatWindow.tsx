/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, memo } from 'react';
import { User } from '../../types/models';
import { MessageBubble, OptimisticChatMessage } from './MessageBubble';
import { Send, ArrowLeft, ShieldCheck, ChevronUp } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface ChatWindowProps {
  partner: User;
  messages: OptimisticChatMessage[];
  isLoading: boolean;
  hasMoreOlder?: boolean;
  onLoadOlderMessages?: () => void;
  onSendMessage: (text: string) => Promise<any>;
  onRetryMessage?: (message: OptimisticChatMessage) => void;
  onBack?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = memo(({
  partner,
  messages,
  isLoading,
  hasMoreOlder = false,
  onLoadOlderMessages,
  onSendMessage,
  onRetryMessage,
  onBack,
}) => {
  const { currentUser } = useAuth();
  const [inputText, setInputText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new message (instant without frame drops)
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSubmitting) return;

    const text = inputText.trim();
    setInputText('');
    setIsSubmitting(true);

    try {
      await onSendMessage(text);
    } catch {
      // Message retains failed state in list with retry option
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-[560px] max-h-[82dvh] rounded-[16px] bg-[var(--color-card-bg)] border border-[var(--color-border)] overflow-hidden shadow-xs">
      {/* Header */}
      <div className="p-3.5 border-b border-[var(--color-border)] flex items-center justify-between bg-black/[0.02] dark:bg-white/[0.02]">
        <div className="flex items-center gap-2.5">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5 md:hidden text-[var(--color-text-primary)] active:scale-[0.97] transition-all"
              aria-label="Back to conversations"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <img
            src={
              partner.avatarUrl ||
              partner.avatar ||
              `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80`
            }
            alt={partner.name}
            className="w-8 h-8 rounded-full object-cover border border-[var(--color-border)]"
            loading="lazy"
          />

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif text-sm font-bold text-[var(--color-text-primary)]">
                {partner.name}
              </span>
              {partner.role === 'admin' && (
                <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              )}
            </div>
            <span className="text-[10px] text-[var(--color-text-secondary)] capitalize">
              {partner.role} · Direct Channel
            </span>
          </div>
        </div>
      </div>

      {/* Message Feed */}
      <div
        ref={messagesContainerRef}
        className="flex-1 p-4 overflow-y-auto space-y-1"
        role="log"
        aria-label="Direct messages"
      >
        {/* Load older messages button */}
        {hasMoreOlder && onLoadOlderMessages && (
          <div className="text-center py-2">
            <button
              onClick={onLoadOlderMessages}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] rounded-full text-xs font-semibold bg-black/5 dark:bg-white/5 border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] active:scale-[0.97] transition-all"
            >
              <ChevronUp className="w-3.5 h-3.5" />
              <span>Load earlier messages</span>
            </button>
          </div>
        )}

        {isLoading && messages.length === 0 ? (
          <div className="space-y-3 py-8">
            <div className="w-1/2 h-10 bg-black/5 dark:bg-white/5 rounded-2xl animate-pulse" />
            <div className="w-2/3 h-12 bg-black/5 dark:bg-white/5 rounded-2xl ml-auto animate-pulse" />
            <div className="w-1/3 h-8 bg-black/5 dark:bg-white/5 rounded-2xl animate-pulse" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-16 text-xs text-[var(--color-text-secondary)]">
            This is the start of your direct conversation with {partner.name}.
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isMine={msg.senderId === currentUser?.id}
              onRetry={onRetryMessage}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Send Input */}
      <form
        onSubmit={handleSend}
        className="p-3 border-t border-[var(--color-border)] flex items-center gap-2 bg-[var(--color-bg)]"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Message ${partner.name}...`}
          className="flex-1 px-4 py-2.5 rounded-[12px] bg-[var(--color-card-bg)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)] transition-colors"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isSubmitting}
          className="px-4 py-2.5 min-h-[44px] rounded-[12px] bg-[var(--color-accent)] text-[#0B1F3A] font-bold text-xs flex items-center gap-1.5 hover:opacity-95 active:scale-[0.97] transition-all disabled:opacity-40"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
});

ChatWindow.displayName = 'ChatWindow';
