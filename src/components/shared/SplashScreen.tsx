/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Total duration 1.1s for fast native feel
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, 900);

    const endTimer = setTimeout(() => {
      onComplete();
    }, 1150);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(endTimer);
    };
  }, [onComplete]);

  return (
    <div
      onClick={onComplete}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-base)] transition-opacity duration-300 cursor-pointer select-none ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-hidden="true"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        {/* Glowing Liquid Glass Icon Box */}
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#0071E3] via-[#5856D6] to-[#00C7BE] p-1 shadow-2xl animate-pulse-subtle">
            <div className="w-full h-full rounded-[22px] bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <Sparkles className="w-9 h-9" />
            </div>
          </div>
          {/* Subtle Ambient Ring */}
          <div className="absolute -inset-3 rounded-full bg-[var(--accent-primary)]/15 filter blur-xl -z-10 animate-pulse" />
        </div>

        <div>
          <h1 className="font-black text-2xl tracking-tight text-[var(--text-primary)]">
            VenturePulse
          </h1>
          <p className="text-xs font-semibold text-[var(--text-secondary)] tracking-wider uppercase mt-1">
            Current Affairs · iOS 26 Liquid Glass
          </p>
        </div>

        <span className="text-[10px] text-[var(--text-tertiary)] mt-3">
          Tap anywhere to skip
        </span>
      </div>
    </div>
  );
};
