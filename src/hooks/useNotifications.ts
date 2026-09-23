/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { AppNotification } from '../types/models';
import { socket } from '../api/socket';
import { useAuth } from './useAuth';

export function useNotifications() {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/state');
      if (!res.ok) return;
      const state = await res.json();
      const notifs: AppNotification[] = state.notifications || [];
      setNotifications(notifs);

      const unread = notifs.filter(
        (n) => (n.userId === currentUser?.id || n.userId === 'all') && !n.read
      ).length;
      setUnreadCount(unread);
    } catch {
      // ignore
    }
  }, [currentUser]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Real-time socket listeners
  useEffect(() => {
    const handleEvent = (data: any) => {
      fetchNotifications();
      if (data && (data.userId === currentUser?.id || data.userId === 'all')) {
        setActiveToast({
          id: data.id || 'toast-' + Date.now(),
          userId: data.userId || 'all',
          title: data.title || 'New Update',
          body: data.body || '',
          createdAt: new Date().toISOString(),
          read: false,
          type: data.type || 'system',
          linkTarget: data.linkTarget,
        });

        // Auto dismiss toast after 5s
        setTimeout(() => {
          setActiveToast((curr: AppNotification | null) => (curr?.id === data.id ? null : curr));
        }, 5000);
      }
    };

    socket.on('message:new', handleEvent);
    socket.on('chat:started', handleEvent);
    socket.on('news:approved', handleEvent);

    return () => {
      socket.off('message:new', handleEvent);
      socket.off('chat:started', handleEvent);
      socket.off('news:approved', handleEvent);
    };
  }, [currentUser, fetchNotifications]);

  const markAllRead = async () => {
    if (!currentUser) return;
    try {
      await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  const dismissToast = () => setActiveToast(null);

  return {
    notifications,
    unreadCount,
    activeToast,
    markAllRead,
    dismissToast,
    refreshNotifications: fetchNotifications,
  };
}
