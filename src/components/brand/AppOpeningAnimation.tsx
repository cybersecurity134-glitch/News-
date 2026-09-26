/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { GlobeLogo } from './GlobeLogo';
import { ShieldCheck, Sparkles } from 'lucide-react';

interface AppOpeningAnimationProps {
  onComplete?: () => void;
  minDurationMs?: number;
}

export const AppOpeningAnimation: React.FC<AppOpeningAnimationProps> = ({
  onComplete,
}) => {
  // Zero animation: immediately complete to prevent blocking render or adding frame delays
  useEffect(() => {
    onComplete?.();
  }, [onComplete]);

  return null;
};
