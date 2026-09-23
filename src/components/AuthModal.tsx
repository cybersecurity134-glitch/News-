/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AuthModal as SharedAuthModal } from './shared/AuthModal';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  initialRole?: 'viewer' | 'uploader';
  defaultRole?: 'viewer' | 'uploader' | 'admin';
  onClose: () => void;
  onLoginSuccess?: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialRole = 'uploader',
  defaultRole,
  onClose,
}) => {
  return (
    <SharedAuthModal
      isOpen={isOpen}
      onClose={onClose}
      defaultRole={defaultRole || initialRole}
    />
  );
};
