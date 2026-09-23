/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo } from 'react';
import { WifiOff, Database } from 'lucide-react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

export const OfflineBanner: React.FC = memo(() => {
  const { isOnline } = useNetworkStatus();

  if (isOnline) return null;

  return (
    <div
      className="w-full mb-3 px-4 py-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 flex items-center justify-between gap-3 text-xs animate-fade-in"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2 min-w-0">
        <WifiOff className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <span className="font-medium truncate">
          You're offline. Showing your saved and cached news.
        </span>
      </div>
      <div className="flex items-center gap-1 font-bold text-[11px] shrink-0 opacity-80">
        <Database className="w-3.5 h-3.5" />
        <span>Local Cache</span>
      </div>
    </div>
  );
});

OfflineBanner.displayName = 'OfflineBanner';
