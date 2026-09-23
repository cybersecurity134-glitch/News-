/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo } from 'react';
import { ChatMessage } from '../../types/models';
import { RefreshCw, AlertCircle, Check } from 'lucide-react';

export interface OptimisticChatMessage extends ChatMessage {
  status?: 'sending' | 'sent' | 'failed';
}

interface MessageBubbleProps {
  message: OptimisticChatMessage;
  isMine: boolean;
  onRetry?: (message: OptimisticChatMessage) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = memo(({
  message,
  isMine,
  onRetry,
}) => {
  const textContent = message.text || message.content || '';
  const timestamp = message.sentAt || message.createdAt || new Date().toISOString();
  const timeFormatted = new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const isSending = message.status === 'sending';
  const isFailed = message.status === 'failed';

  return (
    <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} mb-3 group`}>
      <div
        className={`max-w-[85%] sm:max-w-[75%] px-4 py-2.5 rounded-[16px] text-xs leading-relaxed break-words border ${
          isMine
            ? 'bg-[var(--color-accent)] text-[#0B1F3A] border-[var(--color-accent)] font-medium rounded-br-xs'
            : 'bg-[var(--color-card-bg)] text-[var(--color-text-primary)] border-[var(--color-border)] rounded-bl-xs'
        } ${isSending ? 'opacity-70' : ''} ${isFailed ? 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200' : ''}`}
      >
        <p className="whitespace-pre-wrap">{textContent}</p>
      </div>

      <div className="flex items-center gap-1.5 text-[10px] text-[var(--color-text-secondary)] mt-1 px-1">
        <span>{timeFormatted}</span>

        {isMine && (
          <>
            {isSending && (
              <span className="flex items-center gap-1 text-[10px] text-[var(--color-text-secondary)]">
                <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                <span>Sending...</span>
              </span>
            )}

            {isFailed && onRetry && (
              <button
                type="button"
                onClick={() => onRetry(message)}
                className="flex items-center gap-1 text-red-600 hover:underline font-bold"
              >
                <AlertCircle className="w-3 h-3" />
                <span>Failed · Tap to retry</span>
              </button>
            )}

            {!isSending && !isFailed && (
              <Check className="w-3 h-3 opacity-60" />
            )}
          </>
        )}
      </div>
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';
