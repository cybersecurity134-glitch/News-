/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'member' | 'uploader' | 'viewer';
export type UserStatus = 'active' | 'blocked' | 'pending' | 'suspended';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  loginCount: number;
  mfaEnabled?: boolean;
}

export interface SystemSettings {
  pauseRegistrations: boolean;
  disableMemberAccess: boolean;
  emergencyMessage?: string;
}

export interface AdminOverview {
  totalMembers: number;
  totalAllUsers: number;
  activeMembers: number;
  blockedMembers: number;
  newMembersCount: number;
  newMembers: AuthUser[];
  settings: SystemSettings;
}

export interface ActiveSession {
  sessionId: string;
  userId: string;
  email: string;
  role: UserRole;
  createdAt: string;
  lastActivityAt: string;
  ipOrUa: string;
  isCurrentlyActive: boolean;
}

export interface AdminAuditLog {
  id: string;
  adminUserId: string;
  adminEmail: string;
  action: string;
  targetUserId?: string;
  targetEmail?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface UserDetailsResponse {
  user: AuthUser;
  sessions: Array<{
    id: string;
    createdAt: string;
    lastActivityAt: string;
    expiresAt: string;
    isRevoked: boolean;
    ipOrUa: string;
  }>;
  history: {
    lastLoginAt: string;
    accountCreationDate: string;
    numberOfLogins: number;
    failedAttempts: number;
    accountStatus: string;
  };
}
