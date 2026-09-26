/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface GlobeLogoProps {
  className?: string;
  size?: number;
}

export const GlobeLogo: React.FC<GlobeLogoProps> = ({ className = '', size = 36 }) => {
  return (
    <div
      className={`relative rounded-2xl flex items-center justify-center select-none shrink-0 overflow-hidden shadow-lg ${className}`}
      style={{
        width: size,
        height: size,
        background: 'radial-gradient(circle at 50% 25%, #1d4ed8 0%, #0f2b82 50%, #061138 100%)',
        boxShadow: '0 4px 14px -1px rgba(29, 78, 216, 0.45), inset 0 1px 1px 0 rgba(255, 255, 255, 0.35)',
      }}
    >
      {/* Outer ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-400/20 to-transparent pointer-events-none" />

      {/* High-fidelity Vector Globe with Orbiting Growth Arrow */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full p-1 drop-shadow"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Globe Atmosphere Radial Gradient */}
          <radialGradient id="globeSphere" cx="45%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="30%" stopColor="#2563eb" />
            <stop offset="70%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#0b2470" />
          </radialGradient>

          {/* Continents Fill Gradient */}
          <linearGradient id="continentsGradient" x1="20%" y1="20%" x2="80%" y2="80%">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="50%" stopColor="#172554" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Orbit Swoosh Gradient */}
          <linearGradient id="orbitSwoosh" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
            <stop offset="35%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="80%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
          </linearGradient>

          {/* Globe Outer Rim Glow */}
          <filter id="globeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Arrow Shadow */}
          <filter id="arrowShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.5" />
          </filter>

          {/* Clip path for globe continents */}
          <clipPath id="globeClip">
            <circle cx="50" cy="52" r="34" />
          </clipPath>
        </defs>

        {/* Ambient Outer Halo */}
        <circle cx="50" cy="52" r="35" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.4" />

        {/* Globe Base Ocean Sphere */}
        <circle cx="50" cy="52" r="34" fill="url(#globeSphere)" />

        {/* Globe Inner Shadow / Specular 3D rim */}
        <g clipPath="url(#globeClip)">
          {/* Americas & Greenland & Continents Silhouette */}
          {/* North America */}
          <path
            d="M38 28 C42 26, 48 24, 52 25 C54 27, 56 29, 58 31 C56 34, 53 35, 50 37 C48 40, 46 44, 43 45 C41 43, 38 41, 35 41 C33 37, 34 32, 38 28 Z"
            fill="url(#continentsGradient)"
            opacity="0.9"
          />
          {/* Central America & Caribbean */}
          <path
            d="M42 46 C44 48, 47 49, 45 52 C43 53, 40 50, 42 46 Z"
            fill="url(#continentsGradient)"
            opacity="0.9"
          />
          {/* South America */}
          <path
            d="M44 53 C49 53, 56 56, 58 63 C60 70, 56 77, 51 82 C48 83, 46 80, 46 76 C45 72, 42 66, 41 61 C40 56, 42 54, 44 53 Z"
            fill="url(#continentsGradient)"
            opacity="0.95"
          />
          {/* Europe / Eurasia rim */}
          <path
            d="M62 26 C67 25, 73 28, 77 32 C75 36, 70 38, 66 38 C64 35, 63 30, 62 26 Z"
            fill="url(#continentsGradient)"
            opacity="0.9"
          />
          {/* Africa upper edge */}
          <path
            d="M66 42 C72 41, 78 44, 81 48 C78 52, 73 54, 69 51 C67 48, 66 45, 66 42 Z"
            fill="url(#continentsGradient)"
            opacity="0.9"
          />

          {/* Graticule Longitude Curve */}
          <ellipse
            cx="50"
            cy="52"
            rx="16"
            ry="34"
            fill="none"
            stroke="#93c5fd"
            strokeWidth="0.75"
            strokeOpacity="0.25"
          />
          {/* Graticule Equator Curve */}
          <ellipse
            cx="50"
            cy="52"
            rx="34"
            ry="11"
            fill="none"
            stroke="#93c5fd"
            strokeWidth="0.75"
            strokeOpacity="0.25"
          />

          {/* Light atmospheric sheen on top left */}
          <ellipse
            cx="40"
            cy="36"
            rx="20"
            ry="12"
            fill="#ffffff"
            opacity="0.15"
            transform="rotate(-25 40 36)"
          />
        </g>

        {/* Back portion of the Orbit swoosh (behind the globe) */}
        <path
          d="M21 68 C17 62, 19 55, 26 49"
          stroke="url(#orbitSwoosh)"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeOpacity="0.3"
        />

        {/* Front Orbiting Swoosh passing dynamically across the globe */}
        <path
          d="M18 64 C19 75, 34 81, 55 74 C70 69, 81 56, 85 41"
          stroke="url(#orbitSwoosh)"
          strokeWidth="4.2"
          strokeLinecap="round"
          filter="url(#arrowShadow)"
        />

        {/* Dynamic Growth Arrow Head pointing up and to the right */}
        <g filter="url(#arrowShadow)">
          <path
            d="M74 41 L88 30 L88 47 L82 43 Z"
            fill="#ffffff"
            stroke="#e0f2fe"
            strokeWidth="0.8"
            strokeLinejoin="round"
          />
        </g>

        {/* Highlight glint near arrow tip */}
        <circle cx="87" cy="31" r="1.5" fill="#ffffff" />
      </svg>
    </div>
  );
};
