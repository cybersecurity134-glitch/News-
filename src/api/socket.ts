/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

type EventHandler = (data: any) => void;

class SocketClient {
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private pollingInterval: NodeJS.Timeout | null = null;
  private lastCheckedTimestamp: number = Date.now();
  private isConnected: boolean = true;

  constructor() {
    this.startLivePoll();
  }

  // Subscribe to real-time events: 'message:new', 'chat:started', 'news:approved'
  on(event: string, handler: EventHandler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
  }

  off(event: string, handler: EventHandler) {
    const set = this.handlers.get(event);
    if (set) {
      set.delete(handler);
    }
  }

  emit(event: string, data: any) {
    const set = this.handlers.get(event);
    if (set) {
      set.forEach((fn) => fn(data));
    }
  }

  // Live real-time check simulation with REST fallback
  private startLivePoll() {
    this.pollingInterval = setInterval(async () => {
      try {
        const res = await fetch('/api/state');
        if (!res.ok) return;
        const state = await res.json();
        const now = Date.now();

        // Check for new notifications created since last check
        if (state.notifications && Array.isArray(state.notifications)) {
          const recentNotifs = state.notifications.filter(
            (n: any) => new Date(n.createdAt).getTime() > this.lastCheckedTimestamp
          );

          recentNotifs.forEach((n: any) => {
            if (n.type === 'chat') {
              this.emit('chat:started', n);
              this.emit('message:new', n);
            } else if (n.type === 'news_approved') {
              this.emit('news:approved', n);
            }
          });
        }

        this.lastCheckedTimestamp = now;
      } catch {
        // network silent
      }
    }, 4000);
  }

  disconnect() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }
}

export const socket = new SocketClient();
