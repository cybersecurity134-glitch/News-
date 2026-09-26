/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { refreshRateManager, RefreshRateMetrics } from '../utils/refreshRateDetector';

/**
 * Hook providing real-time display refresh rate, FPS, and frame-time metrics
 */
export function useRefreshRate() {
  const [metrics, setMetrics] = useState<RefreshRateMetrics>(() => refreshRateManager.getMetrics());

  useEffect(() => {
    return refreshRateManager.subscribe((newMetrics) => {
      setMetrics(newMetrics);
    });
  }, []);

  return metrics;
}

/**
 * Hook to drive animations with delta-time so motion speed is identical across 60Hz, 120Hz, and 175Hz displays
 */
export function useDeltaAnimation(
  callback: (deltaTimeMs: number, normalizedFactor: number) => void,
  active: boolean = true
) {
  useEffect(() => {
    if (!active) return;
    let lastTime = performance.now();
    let animId: number;

    const tick = (now: number) => {
      const delta = now - lastTime;
      lastTime = now;

      // Cap delta at 100ms to avoid physics exploding when tab returns from sleep
      const safeDelta = Math.min(delta, 100);
      // Normalized factor based on 175Hz reference (~5.71ms)
      const factor = safeDelta / 5.71;

      callback(safeDelta, factor);
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [callback, active]);
}
