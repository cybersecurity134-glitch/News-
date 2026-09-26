/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'auth_database.json');

export type UserRole = 'admin' | 'member' | 'uploader' | 'viewer';
export type UserStatus = 'active' | 'blocked' | 'pending' | 'suspended';

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  passwordHash: string;
  salt: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  loginCount: number;
  failedLoginAttempts: number;
  lockUntil?: number;
  mfaEnabled?: boolean;
}

export interface SessionRecord {
  id: string; // token
  userId: string;
  email: string;
  role: UserRole;
  createdAt: string;
  lastActivityAt: string;
  expiresAt: string;
  revokedAt?: string;
  ipOrUa?: string;
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

export interface SystemSettings {
  pauseRegistrations: boolean;
  disableMemberAccess: boolean;
  emergencyMessage: string;
  adminUploadCode?: string;
}

export interface PasswordResetRecord {
  id: string;
  email: string;
  code: string;
  expiresAt: number;
  used: boolean;
}

// Ensure data directory exists
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {
  // directory creation fallback
}

// Password hashing utility using PBKDF2 (100,000 iterations, sha512)
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, actualSalt, 100000, 64, 'sha512').toString('hex');
  return { hash, salt: actualSalt };
}

export function verifyPassword(password: string, salt: string, expectedHash: string): boolean {
  if (!password || !salt || !expectedHash) return false;
  try {
    const { hash } = hashPassword(password, salt);
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(expectedHash, 'hex'));
  } catch {
    return false;
  }
}

// Sanitized user profile safe to transmit over API (NO passwords, NO hashes, NO salts)
export function sanitizeUser(user: UserRecord) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLoginAt: user.lastLoginAt,
    loginCount: user.loginCount,
    mfaEnabled: user.mfaEnabled || false,
  };
}

class AuthDatabase {
  public users: Map<string, UserRecord> = new Map();
  public sessions: Map<string, SessionRecord> = new Map();
  public auditLogs: AdminAuditLog[] = [];
  public passwordResets: Map<string, PasswordResetRecord> = new Map();
  public settings: SystemSettings = {
    pauseRegistrations: false,
    disableMemberAccess: false,
    emergencyMessage: 'Member access is temporarily suspended for system maintenance. Please check back shortly.',
    adminUploadCode: process.env.UPLOADER_FIXED_CODE || '26054',
  };

  constructor() {
    this.loadFromDisk();
    this.seedDefaultUsers();
  }

  private loadFromDisk() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const data = JSON.parse(raw);
        if (Array.isArray(data.users)) {
          data.users.forEach((u: UserRecord) => this.users.set(u.id, u));
        }
        if (Array.isArray(data.sessions)) {
          data.sessions.forEach((s: SessionRecord) => this.sessions.set(s.id, s));
        }
        if (Array.isArray(data.auditLogs)) {
          this.auditLogs = data.auditLogs;
        }
        if (data.settings) {
          this.settings = { ...this.settings, ...data.settings };
        }
      }
    } catch (err) {
      console.warn('[AUTH DB] Warning reading database file, using memory storage:', err);
    }
  }

  public saveToDisk() {
    try {
      const data = {
        users: Array.from(this.users.values()),
        sessions: Array.from(this.sessions.values()),
        auditLogs: this.auditLogs.slice(0, 500),
        settings: this.settings,
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.warn('[AUTH DB] Warning writing database file:', err);
    }
  }

  private seedDefaultUsers() {
    // 1. Mandatory Admin Account: cybersecurity134@gmail.com
    // Never hard-code the admin password in source code!
    const adminEmail = 'cybersecurity134@gmail.com';
    let adminUser = Array.from(this.users.values()).find((u) => u.email.toLowerCase() === adminEmail.toLowerCase());

    if (!adminUser) {
      // Initialize admin account. If ADMIN_INITIAL_PASSWORD env is provided, hash it; otherwise leave blank so admin sets it on first login/signup
      const initialPwd = process.env.ADMIN_INITIAL_PASSWORD;
      let hash = '';
      let salt = '';
      if (initialPwd) {
        const hashed = hashPassword(initialPwd);
        hash = hashed.hash;
        salt = hashed.salt;
      }

      adminUser = {
        id: 'user-admin-cybersecurity134',
        email: adminEmail,
        name: 'Cybersecurity Administrator',
        phone: '+1 (555) 019-2834',
        role: 'admin',
        status: 'active',
        passwordHash: hash,
        salt: salt,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        lastLoginAt: '2026-09-23T08:30:00.000Z',
        loginCount: 14,
        failedLoginAttempts: 0,
        mfaEnabled: true,
      };
      this.users.set(adminUser.id, adminUser);
    } else {
      // Ensure admin user role is strictly 'admin' and status is 'active'
      adminUser.role = 'admin';
    }

    // 2. Seed initial sample members so the admin dashboard has realistic data to manage
    const sampleMembers = [
      {
        id: 'user-member-alex',
        email: 'alex@foundercraft.xyz',
        name: 'Alex Rivera',
        phone: '+1 (555) 234-5678',
        role: 'member' as UserRole,
        status: 'active' as UserStatus,
        password: 'Password123!',
        createdAt: '2026-02-10T11:20:00.000Z',
        lastLoginAt: '2026-09-23T08:15:00.000Z',
        loginCount: 28,
      },
      {
        id: 'user-member-marcus',
        email: 'marcus.chen@techscout.co',
        name: 'Marcus Chen',
        phone: '+1 (555) 345-6789',
        role: 'member' as UserRole,
        status: 'active' as UserStatus,
        password: 'Password123!',
        createdAt: '2026-02-15T09:40:00.000Z',
        lastLoginAt: '2026-09-23T07:45:00.000Z',
        loginCount: 19,
      },
      {
        id: 'user-member-user2',
        email: 'user2@example.com',
        name: 'Jordan Sparks',
        phone: '+1 (555) 876-5432',
        role: 'member' as UserRole,
        status: 'blocked' as UserStatus,
        password: 'Password123!',
        createdAt: '2026-03-01T14:00:00.000Z',
        lastLoginAt: '2026-09-18T16:30:00.000Z',
        loginCount: 6,
      },
      {
        id: 'user-member-elena',
        email: 'elena@novacapital.vc',
        name: 'Elena Vance',
        phone: '+1 (555) 432-1098',
        role: 'member' as UserRole,
        status: 'pending' as UserStatus,
        password: 'Password123!',
        createdAt: '2026-09-22T18:10:00.000Z',
        lastLoginAt: undefined,
        loginCount: 0,
      },
      {
        id: 'user-member-david',
        email: 'david.kim@quantumbit.io',
        name: 'David Kim',
        phone: '+1 (555) 987-6543',
        role: 'member' as UserRole,
        status: 'suspended' as UserStatus,
        password: 'Password123!',
        createdAt: '2026-04-12T10:00:00.000Z',
        lastLoginAt: '2026-09-10T12:00:00.000Z',
        loginCount: 11,
      },
    ];

    sampleMembers.forEach((sm) => {
      if (!Array.from(this.users.values()).some((u) => u.email.toLowerCase() === sm.email.toLowerCase())) {
        const { hash, salt } = hashPassword(sm.password);
        const record: UserRecord = {
          id: sm.id,
          email: sm.email,
          name: sm.name,
          phone: sm.phone,
          role: sm.role,
          status: sm.status,
          passwordHash: hash,
          salt: salt,
          createdAt: sm.createdAt,
          updatedAt: sm.createdAt,
          lastLoginAt: sm.lastLoginAt,
          loginCount: sm.loginCount,
          failedLoginAttempts: 0,
        };
        this.users.set(record.id, record);
      }
    });

    // Add initial sample audit log if empty
    if (this.auditLogs.length === 0) {
      this.auditLogs.push({
        id: 'audit-001',
        adminUserId: 'user-admin-cybersecurity134',
        adminEmail: adminEmail,
        action: 'SYSTEM_INITIALIZATION',
        timestamp: new Date().toISOString(),
        metadata: { info: 'Secure authentication and RBAC engine initialized' },
      });
      this.auditLogs.push({
        id: 'audit-002',
        adminUserId: 'user-admin-cybersecurity134',
        adminEmail: adminEmail,
        action: 'BLOCK_USER',
        targetUserId: 'user-member-user2',
        targetEmail: 'user2@example.com',
        timestamp: '2026-09-18T17:00:00.000Z',
        metadata: { reason: 'Suspicious credential stuffing detected' },
      });
    }

    this.saveToDisk();
  }

  // Find user by email (case-insensitive)
  public findUserByEmail(email: string): UserRecord | undefined {
    const norm = email.trim().toLowerCase();
    return Array.from(this.users.values()).find((u) => u.email.toLowerCase() === norm);
  }

  // Find user by ID
  public findUserById(id: string): UserRecord | undefined {
    return this.users.get(id);
  }

  // Create or register user
  public createUser(params: {
    email: string;
    password?: string;
    name?: string;
    phone?: string;
    role?: UserRole;
    status?: UserStatus;
  }): UserRecord {
    const normEmail = params.email.trim().toLowerCase();
    const isAdminEmail = normEmail === 'cybersecurity134@gmail.com';
    const assignedRole: UserRole = isAdminEmail ? 'admin' : (params.role || 'member');
    const assignedStatus: UserStatus = params.status || 'active';

    let hash = '';
    let salt = '';
    if (params.password) {
      const h = hashPassword(params.password);
      hash = h.hash;
      salt = h.salt;
    }

    const newUser: UserRecord = {
      id: 'usr_' + crypto.randomBytes(12).toString('hex'),
      email: normEmail,
      name: params.name?.trim() || normEmail.split('@')[0],
      phone: params.phone?.trim() || undefined,
      role: assignedRole,
      status: assignedStatus,
      passwordHash: hash,
      salt: salt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: undefined,
      loginCount: 0,
      failedLoginAttempts: 0,
    };

    this.users.set(newUser.id, newUser);
    this.saveToDisk();
    return newUser;
  }

  // Create session
  public createSession(user: UserRecord, ipOrUa?: string): SessionRecord {
    const token = 'sess_' + crypto.randomBytes(32).toString('hex');
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

    const session: SessionRecord = {
      id: token,
      userId: user.id,
      email: user.email,
      role: user.role,
      createdAt: now.toISOString(),
      lastActivityAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      ipOrUa: ipOrUa || 'Standard Browser Session',
    };

    this.sessions.set(token, session);
    this.saveToDisk();
    return session;
  }

  // Get active session
  public getValidSession(token: string): SessionRecord | null {
    if (!token) return null;
    const session = this.sessions.get(token);
    if (!session) return null;

    if (session.revokedAt) return null;

    const expiresTime = new Date(session.expiresAt).getTime();
    if (Date.now() > expiresTime) {
      return null;
    }

    // Touch last activity
    session.lastActivityAt = new Date().toISOString();
    return session;
  }

  // Invalidate all active sessions for a given user (e.g. when blocked)
  public revokeAllUserSessions(userId: string) {
    let count = 0;
    const now = new Date().toISOString();
    for (const session of this.sessions.values()) {
      if (session.userId === userId && !session.revokedAt) {
        session.revokedAt = now;
        count++;
      }
    }
    if (count > 0) this.saveToDisk();
    return count;
  }

  // Revoke single session
  public revokeSession(token: string): boolean {
    const session = this.sessions.get(token);
    if (session && !session.revokedAt) {
      session.revokedAt = new Date().toISOString();
      this.saveToDisk();
      return true;
    }
    return false;
  }

  // Add audit log
  public logAudit(log: Omit<AdminAuditLog, 'id' | 'timestamp'>) {
    const entry: AdminAuditLog = {
      id: 'log_' + crypto.randomBytes(8).toString('hex'),
      timestamp: new Date().toISOString(),
      ...log,
    };
    this.auditLogs.unshift(entry);
    if (this.auditLogs.length > 500) {
      this.auditLogs = this.auditLogs.slice(0, 500);
    }
    this.saveToDisk();
    return entry;
  }

  // Activity calculation: active if session created/touched in last 15 minutes and not revoked
  public getCurrentlyActiveMembersCount(): number {
    const fifteenMinutesAgo = Date.now() - 15 * 60 * 1000;
    const activeUserIds = new Set<string>();

    for (const session of this.sessions.values()) {
      if (!session.revokedAt && new Date(session.expiresAt).getTime() > Date.now()) {
        const lastAct = new Date(session.lastActivityAt).getTime();
        if (lastAct >= fifteenMinutesAgo) {
          const user = this.users.get(session.userId);
          // Only active non-blocked users
          if (user && user.status === 'active') {
            activeUserIds.add(session.userId);
          }
        }
      }
    }
    return activeUserIds.size;
  }

  // Get active sessions list for Admin dashboard
  public getActiveSessionsList() {
    const fifteenMinutesAgo = Date.now() - 15 * 60 * 1000;
    const list: Array<{
      sessionId: string;
      userId: string;
      email: string;
      role: UserRole;
      createdAt: string;
      lastActivityAt: string;
      ipOrUa: string;
      isCurrentlyActive: boolean;
    }> = [];

    for (const session of this.sessions.values()) {
      if (!session.revokedAt && new Date(session.expiresAt).getTime() > Date.now()) {
        const lastAct = new Date(session.lastActivityAt).getTime();
        list.push({
          sessionId: session.id,
          userId: session.userId,
          email: session.email,
          role: session.role,
          createdAt: session.createdAt,
          lastActivityAt: session.lastActivityAt,
          ipOrUa: session.ipOrUa || 'Web Client',
          isCurrentlyActive: lastAct >= fifteenMinutesAgo,
        });
      }
    }

    return list.sort(
      (a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime()
    );
  }
}

export const authDb = new AuthDatabase();
