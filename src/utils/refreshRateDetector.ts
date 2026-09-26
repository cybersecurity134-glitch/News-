/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Common display refresh rates
const COMMON_REFRESH_RATES = [60, 90, 120, 144, 165, 175, 240] as const;
export type SupportedRefreshRate = typeof COMMON_REFRESH_RATES[number];

export interface RefreshRateMetrics {
  detectedHz: SupportedRefreshRate;
  rawHz: number;
  frameBudgetMs: number; // e.g. 5.71ms for 175Hz
  currentFps: number;
  currentFrameTimeMs: number;
  minFrameTimeMs: number;
  maxFrameTimeMs: number;
  avgFrameTimeMs: number;
  droppedFrames: number;
  isSampling: boolean;
  history: number[]; // Last 60 frame times for debug chart
}

type Listener = (metrics: RefreshRateMetrics) => void;

class RefreshRateManager {
  private detectedHz: SupportedRefreshRate = 175; // Default target
  private rawHz: number = 175;
  private currentFps: number = 175;
  private currentFrameTimeMs: number = 5.71;
  private minFrameTimeMs: number = 5.71;
  private maxFrameTimeMs: number = 5.71;
  private avgFrameTimeMs: number = 5.71;
  private droppedFrames: number = 0;
  private isSampling: boolean = false;
  private history: number[] = [];
  private listeners: Set<Listener> = new Set();
  private monitorRafId: number | null = null;
  private lastRafTime: number = 0;
  private initialized: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  public init() {
    if (this.initialized) return;
    this.initialized = true;

    // Detect startup refresh rate
    this.detect();

    // Re-check when tab regains focus or display changes
    window.addEventListener('focus', () => {
      this.detect();
    });

    window.addEventListener('resize', () => {
      // Small debounce before re-sampling
      setTimeout(() => this.detect(), 150);
    });

    if ('screen' in window && 'orientation' in window.screen) {
      window.screen.orientation?.addEventListener?.('change', () => {
        setTimeout(() => this.detect(), 150);
      });
    }

    // Start passive lightweight frame monitor for debug overlay
    this.startFrameMonitor();
  }

  /**
   * Sample requestAnimationFrame timestamps over ~30 frames to detect hardware refresh rate
   */
  public detect(sampleCount = 30): Promise<SupportedRefreshRate> {
    if (typeof window === 'undefined') return Promise.resolve(175);
    this.isSampling = true;
    this.notify();

    return new Promise((resolve) => {
      let count = 0;
      let start = 0;
      const deltas: number[] = [];
      let prev = 0;

      const sample = (now: number) => {
        if (count === 0) {
          start = now;
          prev = now;
        } else {
          deltas.push(now - prev);
          prev = now;
        }
        count++;

        if (count <= sampleCount) {
          requestAnimationFrame(sample);
        } else {
          // Exclude first 2 outlier frames (JIT / cold start warmup)
          const validDeltas = deltas.slice(2);
          const avgDelta = validDeltas.reduce((a, b) => a + b, 0) / validDeltas.length;
          const calculatedHz = 1000 / avgDelta;
          this.rawHz = Math.round(calculatedHz * 10) / 10;

          // Round to nearest common refresh rate tier
          let closest: SupportedRefreshRate = COMMON_REFRESH_RATES[0];
          let minDiff = Math.abs(calculatedHz - closest);
          for (const rate of COMMON_REFRESH_RATES) {
            const diff = Math.abs(calculatedHz - rate);
            if (diff < minDiff) {
              minDiff = diff;
              closest = rate;
            }
          }

          this.detectedHz = closest;
          this.isSampling = false;
          this.notify();
          resolve(closest);
        }
      };

      requestAnimationFrame(sample);
    });
  }

  /**
   * Passive frame-time and FPS monitor (measures continuous delta-time)
   */
  private startFrameMonitor() {
    let frameCount = 0;
    let lastFpsCalculation = performance.now();
    let accumulatedTime = 0;
    let minTime = 999;
    let maxTime = 0;

    const loop = (now: number) => {
      if (this.lastRafTime > 0) {
        const delta = now - this.lastRafTime;
        this.currentFrameTimeMs = Math.round(delta * 100) / 100;
        accumulatedTime += delta;
        frameCount++;

        if (delta < minTime && delta > 0) minTime = delta;
        if (delta > maxTime) maxTime = delta;

        // Check if dropped frame based on detected Hz budget (+2.5ms threshold)
        const budget = 1000 / this.detectedHz;
        if (delta > budget + 2.5) {
          this.droppedFrames++;
        }

        // Keep rolling history of last 60 frame times
        if (this.history.length >= 60) {
          this.history.shift();
        }
        this.history.push(this.currentFrameTimeMs);

        // Update current FPS calculation every ~500ms
        if (now - lastFpsCalculation >= 500) {
          this.currentFps = Math.round((frameCount * 1000) / (now - lastFpsCalculation));
          this.avgFrameTimeMs = Math.round((accumulatedTime / frameCount) * 100) / 100;
          this.minFrameTimeMs = Math.round(minTime * 100) / 100;
          this.maxFrameTimeMs = Math.round(maxTime * 100) / 100;

          frameCount = 0;
          accumulatedTime = 0;
          minTime = 999;
          maxTime = 0;
          lastFpsCalculation = now;
          this.notify();
        }
      }

      this.lastRafTime = now;
      this.monitorRafId = requestAnimationFrame(loop);
    };

    this.monitorRafId = requestAnimationFrame(loop);
  }

  public getMetrics(): RefreshRateMetrics {
    return {
      detectedHz: this.detectedHz,
      rawHz: this.rawHz,
      frameBudgetMs: Math.round((1000 / this.detectedHz) * 100) / 100,
      currentFps: this.currentFps,
      currentFrameTimeMs: this.currentFrameTimeMs,
      minFrameTimeMs: this.minFrameTimeMs === 999 ? 5.71 : this.minFrameTimeMs,
      maxFrameTimeMs: this.maxFrameTimeMs,
      avgFrameTimeMs: this.avgFrameTimeMs,
      droppedFrames: this.droppedFrames,
      isSampling: this.isSampling,
      history: [...this.history],
    };
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.getMetrics());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const metrics = this.getMetrics();
    this.listeners.forEach((l) => l(metrics));
  }
}

export const refreshRateManager = new RefreshRateManager();
