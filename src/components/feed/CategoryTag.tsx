/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Category } from '../../types/models';

interface CategoryTagProps {
  category: Category;
  size?: 'sm' | 'md';
  className?: string;
}

interface CategoryStyling {
  label: string;
  colorVar: string;
  bgVar: string;
}

export function getCategoryStyle(cat: string): CategoryStyling {
  const normalized = cat.toLowerCase();
  if (normalized.includes('startup')) {
    return {
      label: 'Startups',
      colorVar: 'var(--cat-startups)',
      bgVar: 'var(--cat-startups-bg)',
    };
  }
  if (normalized.includes('scheme') || normalized.includes('grant')) {
    return {
      label: 'Schemes',
      colorVar: 'var(--cat-schemes)',
      bgVar: 'var(--cat-schemes-bg)',
    };
  }
  if (normalized.includes('funding') || normalized.includes('debt') || normalized.includes('safe')) {
    return {
      label: 'Funding',
      colorVar: 'var(--cat-funding)',
      bgVar: 'var(--cat-funding-bg)',
    };
  }
  if (normalized.includes('investor') || normalized.includes('angel') || normalized.includes('syndicate')) {
    return {
      label: 'Investors',
      colorVar: 'var(--cat-investors)',
      bgVar: 'var(--cat-investors-bg)',
    };
  }
  if (normalized.includes('event') || normalized.includes('demo') || normalized.includes('pitch')) {
    return {
      label: 'Events',
      colorVar: 'var(--cat-events)',
      bgVar: 'var(--cat-events-bg)',
    };
  }
  if (normalized.includes('problem') || normalized.includes('fix') || normalized.includes('emerging')) {
    return {
      label: 'Fixes',
      colorVar: 'var(--cat-fixes)',
      bgVar: 'var(--cat-fixes-bg)',
    };
  }
  return {
    label: cat,
    colorVar: 'var(--cat-startups)',
    bgVar: 'var(--cat-startups-bg)',
  };
}

export const CategoryTag: React.FC<CategoryTagProps> = ({ category, size = 'sm', className = '' }) => {
  const meta = getCategoryStyle(category);

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full tracking-normal transition-colors shrink-0 ${
        size === 'sm' ? 'px-2.5 py-0.5 text-[11px] leading-4' : 'px-3 py-1 text-xs leading-5'
      } ${className}`}
      style={{
        color: meta.colorVar,
        backgroundColor: meta.bgVar,
      }}
    >
      {meta.label}
    </span>
  );
};
