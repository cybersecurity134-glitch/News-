/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo } from 'react';

export const AmbientBackground: React.FC = memo(() => {
  return (
    <div className="ambient-glow-mesh" aria-hidden="true">
      {/* Node 1: Top-Right Sapphire Tone */}
      <div
        className="ambient-node animate-float-slow w-[480px] h-[480px] -top-24 -right-24"
        style={{
          background: 'radial-gradient(circle, var(--bg-ambient-1) 0%, transparent 70%)',
        }}
      />

      {/* Node 2: Mid-Left Saffron/Amber Tone */}
      <div
        className="ambient-node animate-float-slow w-[540px] h-[540px] top-[30%] -left-36"
        style={{
          background: 'radial-gradient(circle, var(--bg-ambient-2) 0%, transparent 70%)',
          animationDelay: '-6s',
        }}
      />

      {/* Node 3: Bottom-Center Pine/Emerald Tone */}
      <div
        className="ambient-node animate-float-slow w-[620px] h-[620px] bottom-0 left-[20%]"
        style={{
          background: 'radial-gradient(circle, var(--bg-ambient-3) 0%, transparent 70%)',
          animationDelay: '-12s',
        }}
      />
    </div>
  );
});

AmbientBackground.displayName = 'AmbientBackground';

