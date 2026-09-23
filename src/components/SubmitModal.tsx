/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AddNewsModal } from './upload/AddNewsModal';
import { UserProfile } from '../types';

interface SubmitModalProps {
  currentUser?: UserProfile;
  adminUploadCode?: string;
  isDark?: boolean;
  onClose: () => void;
  onSubmitSuccess?: () => void;
}

export const SubmitModal: React.FC<SubmitModalProps> = ({
  onClose,
  onSubmitSuccess,
}) => {
  return (
    <AddNewsModal
      isOpen={true}
      onClose={onClose}
      onSubmittedSuccess={() => {
        if (onSubmitSuccess) onSubmitSuccess();
      }}
    />
  );
};
