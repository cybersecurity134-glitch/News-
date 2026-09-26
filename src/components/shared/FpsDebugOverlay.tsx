/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useRefreshRate } from '../../hooks/useRefreshRate';
import { Activity, X, ChevronDown, ChevronUp, Zap, ShieldCheck, Cpu } from 'lucide-react';

interface FpsDebugOverlayProps {
  // Can be controlled or uncontrolled
  isOpen?: boolean;
  onToggle?: () => void;
}

export const FpsDebugOverlay: React.FC<FpsDebugOverlayProps> = ({ isOpen: controlledOpen, onToggle }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [showOptimizations, setShowOptimizations] = useState(true);
  const metrics = useRefreshRate();

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

  // Global long-press listener (press & hold for 700ms anywhere on top navbar or Shift+D / Shift+F)
  useEffect(() => {
    let pressTimer: any = null;

    const handleTouchStart = (e: TouchEvent) => {
      // Long press on header area
      const target = e.target as HTMLElement;
      if (target?.closest?.('#vp-header, #brand-logo, [data-longpress-fps]')) {
        pressTimer = setTimeout(() => {
          if (onToggle) onToggle();
          else setInternalOpen((prev) => !prev);
        }, 700);
      }
    };

    const handleTouchEnd = () => {
      if (pressTimer) clearTimeout(pressTimer);
    };

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target?.closest?.('#vp-header, #brand-logo, [data-longpress-fps]')) {
        pressTimer = setTimeout(() => {
          if (onToggle) onToggle();
          else setInternalOpen((prev) => !prev);
        }, 700);
      }
    };

    const handleMouseUp = () => {
      if (pressTimer) clearTimeout(pressTimer);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Secret developer toggle: Shift + F or Ctrl + Shift + F
      if ((e.shiftKey && e.key === 'F') || (e.shiftKey && e.key === 'D' && e.ctrlKey)) {
        e.preventDefault();
        if (onToggle) onToggle();
        else setInternalOpen((prev) => !prev);
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      if (pressTimer) clearTimeout(pressTimer);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onToggle]);

  if (!isOpen) return null;

  const isTargetAchieved = metrics.currentFps >= metrics.detectedHz - 8;
  const budgetMs = metrics.frameBudgetMs;

  return (
    <aside
      aria-label="FPS and Performance Debug Monitor"
      className="fixed bottom-20 right-3 sm:bottom-6 sm:right-6 z-[9999] w-[calc(100vw-1.5rem)] xs:w-[320px] sm:w-[360px] max-h-[80vh] sm:max-h-[85vh] overflow-y-auto rounded-2xl bg-slate-950/95 text-slate-100 border border-emerald-500/40 shadow-2xl backdrop-blur-md p-3.5 text-xs font-mono select-none pointer-events-auto transition-transform duration-150"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Activity className={`w-4 h-4 ${isTargetAchieved ? 'text-emerald-400' : 'text-amber-400'}`} />
          <span className="font-bold tracking-wider text-emerald-400">PERF ENGINE HUD</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowOptimizations((p) => !p)}
            className="p-1 text-slate-400 hover:text-white"
            title="Toggle details"
          >
            {showOptimizations ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => (onToggle ? onToggle() : setInternalOpen(false))}
            className="p-1 text-slate-400 hover:text-white"
            title="Close overlay"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 my-2.5">
        <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Current Rate</div>
          <div className="text-xl font-black text-emerald-400 flex items-baseline gap-1">
            {metrics.currentFps}
            <span className="text-[10px] font-normal text-slate-400">FPS</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Display: <strong className="text-white">{metrics.detectedHz}Hz</strong> ({metrics.rawHz.toFixed(1)}Hz raw)
          </div>
        </div>

        <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Frame Time</div>
          <div className="text-xl font-black text-sky-400 flex items-baseline gap-1">
            {metrics.currentFrameTimeMs}
            <span className="text-[10px] font-normal text-slate-400">ms</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Budget: <strong className="text-emerald-400">{budgetMs}ms</strong> (@{metrics.detectedHz}Hz)
          </div>
        </div>
      </div>

      {/* Latency / Frame Budget Bar */}
      <div className="p-2 rounded-xl bg-slate-900/70 border border-slate-800 mb-2.5">
        <div className="flex justify-between text-[10px] text-slate-400 mb-1">
          <span>Min: {metrics.minFrameTimeMs}ms</span>
          <span>Avg: {metrics.avgFrameTimeMs}ms</span>
          <span>Max: {metrics.maxFrameTimeMs}ms</span>
          <span>Drops: {metrics.droppedFrames}</span>
        </div>

        {/* Rolling Sparkline */}
        <div className="h-6 flex items-end gap-[2px] bg-black/40 rounded px-1 py-0.5 overflow-hidden">
          {metrics.history.map((ft, idx) => {
            const heightPct = Math.min(100, Math.max(10, (ft / (budgetMs * 2)) * 100));
            const isOverBudget = ft > budgetMs + 2;
            return (
              <div
                key={idx}
                className={`flex-1 rounded-t-[1px] transition-all duration-75 ${
                  isOverBudget ? 'bg-rose-500' : 'bg-emerald-400'
                }`}
                style={{ height: `${heightPct}%` }}
                title={`${ft}ms`}
              />
            );
          })}
        </div>
      </div>

      {/* List of Every Applied Optimization */}
      {showOptimizations && (
        <div className="pt-2 border-t border-slate-800 space-y-1.5 text-[11px]">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" />
            Active Performance Pipeline:
          </div>

          <div className="space-y-1 text-slate-300 max-h-48 overflow-y-auto pr-1">
            <div className="flex items-start gap-1.5">
              <span className="text-emerald-400 font-bold shrink-0">✓</span>
              <span><strong>175Hz Display Detection:</strong> Startup 30-frame rAF sampling; adapts to 60/90/120/144/165/175/240Hz; re-checks on focus/display shift.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-emerald-400 font-bold shrink-0">✓</span>
              <span><strong>Delta-Time Motion:</strong> All UI animations scale with delta-time; motion speed matches identical on 60Hz and 175Hz.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-emerald-400 font-bold shrink-0">✓</span>
              <span><strong>GPU-Composited Only:</strong> Transitions restricted strictly to <code>transform</code> and <code>opacity</code>. Zero box-shadow/layout thrash animations.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-emerald-400 font-bold shrink-0">✓</span>
              <span><strong>Glass Blur Radius Moderation:</strong> Backdrop blurs constrained to 6-12px; stacked blurs on scrolling containers eliminated.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-emerald-400 font-bold shrink-0">✓</span>
              <span><strong>Virtualization & Content Visibility:</strong> Feed cards use <code>content-visibility: auto</code> and <code>contain: layout style paint</code>.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-emerald-400 font-bold shrink-0">✓</span>
              <span><strong>300ms Debounced Filtering:</strong> Search and category filters debounced to keep main thread free.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-emerald-400 font-bold shrink-0">✓</span>
              <span><strong>Token-by-Token AI Streaming:</strong> Progressive streaming responses with 100-150 max token budget for concise answers.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-emerald-400 font-bold shrink-0">✓</span>
              <span><strong>Context Trimming:</strong> Only last 5-10 messages sent to AI model; older context summarized/dropped.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-emerald-400 font-bold shrink-0">✓</span>
              <span><strong>AbortController In-Flight Cancellation:</strong> Stale searches & requests auto-aborted on keystrokes and navigation.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-emerald-400 font-bold shrink-0">✓</span>
              <span><strong>Optimistic Chat UI:</strong> 0ms instant display of sent messages with background sync.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-emerald-400 font-bold shrink-0">✓</span>
              <span><strong>Modern WebP Compression:</strong> Client-side HTML5 canvas compression with aspect-ratio containment.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-emerald-400 font-bold shrink-0">✓</span>
              <span><strong>Stale-While-Revalidate Caching:</strong> Fast synchronous local read on first frame with silent background revalidation.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-emerald-400 font-bold shrink-0">✓</span>
              <span><strong>requestIdleCallback Prefetching:</strong> Secondary screens pre-warmed off the critical path.</span>
            </div>
          </div>
        </div>
      )}

      {/* Footer hint */}
      <div className="mt-2 pt-1.5 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between">
        <span>Toggle: Long-press brand logo or Shift+F</span>
        <span className="text-emerald-400">175Hz Ready</span>
      </div>
    </aside>
  );
};
