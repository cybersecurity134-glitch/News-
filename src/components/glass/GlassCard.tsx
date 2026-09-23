/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { memo } from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  level?: 'card' | 'elevated' | 'subtle';
  interactive?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = memo(({
  children,
  className = '',
  level = 'card',
  interactive = false,
  ...rest
}) => {
  const levelClasses = {
    card: 'liquid-glass-card',
    elevated: 'liquid-glass-card shadow-lg',
    subtle: 'bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/30 dark:border-white/5 rounded-2xl',
  }[level];

  return (
    <div
      className={`${levelClasses} ${interactive ? 'cursor-pointer active:scale-[0.985]' : ''} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
});

GlassCard.displayName = 'GlassCard';
