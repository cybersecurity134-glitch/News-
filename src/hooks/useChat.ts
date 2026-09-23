/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ChatThread } from '../types/models';
import { OptimisticChatMessage } from '../components/chat/MessageBubble';
import { apiClient } from '../api/client';
import { socket } from '../api/socket';
import { useAuth } from './useAuth';

const MESSAGES_PAGE_SIZE = 20;

export function useChat(activeChatId?: string, partnerId?: string) {
  const { currentUser } = useAuth();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [allMessages, setAllMessages] = useState<OptimisticChatMessage[]>([]);
  const [visibleCount, setVisibleCount] = useState<number>(MESSAGES_PAGE_SIZE);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const isMountedRef = useRef(true);

  // Derive conversation key
  const conversationKey =
    activeChatId ||
    (currentUser && partnerId ? `chat-${[currentUser.id, partnerId].sort().join('-')}` : null);

  const fetchThreads = useCallback(async () => {
    if (!currentUser) return;
    try {
      const data = await apiClient.getChats(currentUser.id);
      if (isMountedRef.current) {
        setThreads(data);
      }
    } catch {
      // ignore
    }
  }, [currentUser]);

  const fetchMessages = useCallback(async () => {
    if (!currentUser || (!activeChatId && !partnerId)) return;
    try {
      setIsLoading(true);
      const targetId = activeChatId || partnerId!;
      const data = await apiClient.getChatMessages(targetId, currentUser.id);
      if (isMountedRef.current) {
        setAllMessages(
          data.map((m) => ({
            ...m,
            status: 'sent',
          }))
        );
      }
    } catch {
      // ignore
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [currentUser, activeChatId, partnerId]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchThreads();
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchThreads]);

  useEffect(() => {
    setVisibleCount(MESSAGES_PAGE_SIZE);
    fetchMessages();
  }, [fetchMessages]);

  // One real-time listener per open conversation, unsubscribed when it closes
  useEffect(() => {
    if (!conversationKey) {
      // Global thread-update listener when no specific conversation is open
      const handleGlobalMessage = () => {
        fetchThreads();
      };
      socket.on('message:new', handleGlobalMessage);
      socket.on('chat:started', handleGlobalMessage);

      return () => {
        socket.off('message:new', handleGlobalMessage);
        socket.off('chat:started', handleGlobalMessage);
      };
    }

    // Specific conversation listener
    const handleConversationMessage = (data: any) => {
      fetchThreads();

      // Check if message belongs to this conversation
      const sender = data.senderId || data.userId;
      const recipient = data.recipientId;
      const isRelevant =
        (partnerId && (sender === partnerId || recipient === partnerId)) ||
        (activeChatId && (data.chatId === activeChatId || activeChatId.includes(sender)));

      if (isRelevant) {
        fetchMessages();
      }
    };

    socket.on('message:new', handleConversationMessage);
    socket.on('chat:started', handleConversationMessage);

    return () => {
      // Clean up listener immediately when conversation closes or shifts
      socket.off('message:new', handleConversationMessage);
      socket.off('chat:started', handleConversationMessage);
    };
  }, [conversationKey, partnerId, activeChatId, fetchThreads, fetchMessages]);

  // Load older messages (pagination)
  const loadOlderMessages = useCallback(() => {
    setVisibleCount((prev) => prev + MESSAGES_PAGE_SIZE);
  }, []);

  // Optimistic message sending with retry support
  const sendMessage = async (text: string, overrideRecipientId?: string) => {
    if (!currentUser || !text.trim()) return;

    const recipient = overrideRecipientId || partnerId;
    const chatId =
      activeChatId ||
      (recipient ? `chat-${[currentUser.id, recipient].sort().join('-')}` : 'general');

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const optimisticMsg: OptimisticChatMessage = {
      id: tempId,
      senderId: currentUser.id,
      recipientId: recipient || '',
      content: text.trim(),
      createdAt: new Date().toISOString(),
      status: 'sending',
    };

    // Immediately display optimistically
    setAllMessages((prev) => [...prev, optimisticMsg]);
    setIsSending(true);
    setSendError(null);

    try {
      const serverMsg = await apiClient.sendMessage(chatId, currentUser.id, text.trim(), recipient);
      if (isMountedRef.current) {
        setAllMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...serverMsg, status: 'sent' } : m))
        );
      }
      fetchThreads();
      return serverMsg;
    } catch (err: any) {
      if (isMountedRef.current) {
        // Mark optimistic message as failed for retry
        setAllMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...m, status: 'failed' } : m))
        );
        setSendError('Message failed to send. Tap retry.');
      }
      throw err;
    } finally {
      if (isMountedRef.current) {
        setIsSending(false);
      }
    }
  };

  // Retry sending a failed message
  const retryMessage = async (failedMsg: OptimisticChatMessage) => {
    // Remove the failed message
    setAllMessages((prev) => prev.filter((m) => m.id !== failedMsg.id));
    // Re-send content
    return sendMessage(failedMsg.content, failedMsg.recipientId);
  };

  // Paginated visible messages
  const visibleMessages = allMessages.slice(-visibleCount);
  const hasMoreOlder = visibleCount < allMessages.length;

  return {
    threads,
    messages: visibleMessages,
    totalMessagesCount: allMessages.length,
    hasMoreOlder,
    loadOlderMessages,
    isLoading,
    isSending,
    sendError,
    sendMessage,
    retryMessage,
    refreshThreads: fetchThreads,
    refreshMessages: fetchMessages,
  };
}
