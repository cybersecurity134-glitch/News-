/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  className = '',
}) => {
  const variantStyles = {
    primary: 'bg-[#007AFF]/12 text-[#007AFF] dark:text-[#0A84FF]',
    secondary: 'bg-black/5 dark:bg-white/10 text-[var(--color-text-secondary)]',
    success: 'bg-[#34C759]/12 text-[#34C759]',
    warning: 'bg-[#FF9500]/15 text-[#FF9500]',
    danger: 'bg-[#FF3B30]/15 text-[#FF3B30]',
  }[variant];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-tight whitespace-nowrap ${variantStyles} ${className}`}
    >
      {children}
    </span>
  );
};
