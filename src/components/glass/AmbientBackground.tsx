/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo } from 'react';

export const AmbientBackground: React.FC = memo(() => {
  return (
    <div className="ambient-glow-mesh" aria-hidden="true">
      {/* Node 1: Top-Right Sapphire / Primary Tone */}
      <div
        className="ambient-node w-[520px] h-[520px] -top-20 -right-20"
        style={{
          background: 'radial-gradient(circle, var(--bg-ambient-1) 0%, transparent 70%)',
        }}
      />

      {/* Node 2: Mid-Left Saffron / Amber / Warm Tone */}
      <div
        className="ambient-node w-[560px] h-[560px] top-[25%] -left-32"
        style={{
          background: 'radial-gradient(circle, var(--bg-ambient-2) 0%, transparent 70%)',
        }}
      />

      {/* Node 3: Bottom-Center Pine / Emerald / Venture Tone */}
      <div
        className="ambient-node w-[640px] h-[640px] bottom-0 left-[25%]"
        style={{
          background: 'radial-gradient(circle, var(--bg-ambient-3) 0%, transparent 70%)',
        }}
      />

      {/* Node 4: Mid-Right Violet / Rose / Jewel Tone */}
      <div
        className="ambient-node w-[460px] h-[460px] top-[60%] -right-24"
        style={{
          background: 'radial-gradient(circle, var(--bg-ambient-4) 0%, transparent 70%)',
        }}
      />
    </div>
  );
});

AmbientBackground.displayName = 'AmbientBackground';

