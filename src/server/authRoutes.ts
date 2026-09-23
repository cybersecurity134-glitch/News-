/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { authDb, sanitizeUser, verifyPassword, hashPassword, UserRecord, SessionRecord } from './authDb.ts';

export const authRouter = express.Router();

// Extend Express Request
export interface AuthenticatedRequest extends Request {
  user?: UserRecord;
  session?: SessionRecord;
}

// ==========================================
// MIDDLEWARES
// ==========================================

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token =
    (authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null) ||
    (req.headers['x-session-token'] as string) ||
    null;

  if (!token) {
    req.user = undefined;
    req.session = undefined;
    return next();
  }

  const session = authDb.getValidSession(token);
  if (!session) {
    req.user = undefined;
    req.session = undefined;
    return next();
  }

  const user = authDb.findUserById(session.userId);
  if (!user) {
    req.user = undefined;
    req.session = undefined;
    return next();
  }

  // Check if account is blocked
  if (user.status === 'blocked') {
    authDb.revokeSession(session.id);
    return res.status(403).json({
      error:
        'Account blocked: Your account has been blocked by the administrator. Please contact the administrator if you believe this was a mistake.',
    });
  }

  // Check emergency lockdown
  if (authDb.settings.disableMemberAccess && user.role !== 'admin') {
    return res.status(503).json({
      error:
        authDb.settings.emergencyMessage ||
        'Member access is temporarily suspended for system maintenance. Please check back shortly.',
    });
  }

  req.user = user;
  req.session = session;
  next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || !req.session) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }
  next();
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || !req.session) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  if (req.user.status !== 'active') {
    return res.status(403).json({ error: 'Access denied: Account is not active.' });
  }

  // STRICT SERVER-SIDE ROLE AUTHORIZATION:
  // Must have role 'admin'. Never rely on frontend state!
  if (req.user.role !== 'admin') {
    authDb.logAudit({
      adminUserId: req.user.id,
      adminEmail: req.user.email,
      action: 'UNAUTHORIZED_ADMIN_ATTEMPT',
      metadata: { path: req.originalUrl, method: req.method },
    });
    return res.status(403).json({ error: 'Access denied: Administrator privileges required.' });
  }

  next();
}

// ==========================================
// PUBLIC AUTH ROUTES
// ==========================================

// Register / Sign Up
authRouter.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, confirmPassword, name, phone } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'A valid email address is required.' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    const normEmail = email.trim().toLowerCase();
    const isAdminEmail = normEmail === 'cybersecurity134@gmail.com';

    // Global Login Control: Pause New Registrations (Section 11)
    // Do NOT lock out administrator
    if (authDb.settings.pauseRegistrations && !isAdminEmail) {
      return res.status(403).json({
        error: 'New registrations are currently unavailable.',
        registrationsPaused: true,
      });
    }

    // Check existing user
    let user = authDb.findUserByEmail(normEmail);
    if (user) {
      // If admin account was pre-initialized without a password, allow setting it here
      if (isAdminEmail && !user.passwordHash) {
        const { hash, salt } = hashPassword(password);
        user.passwordHash = hash;
        user.salt = salt;
        user.role = 'admin';
        user.status = 'active';
        user.updatedAt = new Date().toISOString();
        authDb.saveToDisk();

        const session = authDb.createSession(user, req.headers['user-agent']);
        authDb.logAudit({
          adminUserId: user.id,
          adminEmail: user.email,
          action: 'ADMIN_INITIAL_PASSWORD_SET',
          metadata: { ip: req.ip },
        });

        return res.status(201).json({
          success: true,
          user: sanitizeUser(user),
          sessionToken: session.id,
          message: 'Admin account secured and activated successfully.',
        });
      }

      return res.status(400).json({
        error: 'An account with this email already exists. Please log in.',
      });
    }

    // Create fresh user account
    user = authDb.createUser({
      email: normEmail,
      password,
      name,
      phone,
      role: isAdminEmail ? 'admin' : 'member',
      status: 'active',
    });

    const session = authDb.createSession(user, req.headers['user-agent']);

    authDb.logAudit({
      adminUserId: user.id,
      adminEmail: user.email,
      action: isAdminEmail ? 'ADMIN_REGISTERED' : 'USER_REGISTERED',
      targetUserId: user.id,
      targetEmail: user.email,
      metadata: { role: user.role },
    });

    res.status(201).json({
      success: true,
      user: sanitizeUser(user),
      sessionToken: session.id,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Registration failed: ' + err.message });
  }
});

// Sign In / Login
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normEmail = email.trim().toLowerCase();
    const user = authDb.findUserByEmail(normEmail);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Check account lockout protection (Section 13)
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const waitMin = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(429).json({
        error: `Account temporarily locked due to repeated failed login attempts. Please try again in ${waitMin} minute${waitMin > 1 ? 's' : ''}.`,
      });
    }

    // Check blocked account status (Section 10)
    if (user.status === 'blocked') {
      return res.status(403).json({
        error:
          'Account blocked: Your account has been blocked by the administrator. Please contact the administrator if you believe this was a mistake.',
        isBlocked: true,
      });
    }

    // Check other inactive statuses
    if (user.status === 'suspended') {
      return res.status(403).json({
        error: 'Account suspended. Please contact customer support.',
      });
    }
    if (user.status === 'pending') {
      return res.status(403).json({
        error: 'Account is pending administrator approval.',
      });
    }

    // Emergency Access Control (Section 12)
    if (authDb.settings.disableMemberAccess && user.role !== 'admin') {
      return res.status(503).json({
        error:
          authDb.settings.emergencyMessage ||
          'Member access is temporarily suspended for system maintenance. Please check back shortly.',
        maintenanceMode: true,
      });
    }

    // First-time admin password setup check:
    // If cybersecurity134@gmail.com is logging in but no password hash was stored yet,
    // we securely initialize their entered password on this first authenticated attempt!
    if (user.email === 'cybersecurity134@gmail.com' && (!user.passwordHash || !user.salt)) {
      const { hash, salt } = hashPassword(password);
      user.passwordHash = hash;
      user.salt = salt;
      user.role = 'admin';
      user.updatedAt = new Date().toISOString();
      authDb.saveToDisk();
      console.log('[AUTH] Admin password securely initialized on first login.');
    } else {
      // Validate password
      const isValid = verifyPassword(password, user.salt, user.passwordHash);
      if (!isValid) {
        user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
        if (user.failedLoginAttempts >= 5) {
          user.lockUntil = Date.now() + 15 * 60 * 1000; // 15 min lock
        }
        authDb.saveToDisk();

        return res.status(401).json({ error: 'Invalid email or password.' });
      }
    }

    // Reset login failures on success
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLoginAt = new Date().toISOString();
    user.loginCount = (user.loginCount || 0) + 1;

    const session = authDb.createSession(user, req.headers['user-agent']);

    authDb.logAudit({
      adminUserId: user.id,
      adminEmail: user.email,
      action: 'LOGIN_SUCCESS',
      metadata: { ip: req.ip, role: user.role },
    });

    res.json({
      success: true,
      user: sanitizeUser(user),
      sessionToken: session.id,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Login failed: ' + err.message });
  }
});

// Logout
authRouter.post('/logout', (req: AuthenticatedRequest, res: Response) => {
  const authHeader = req.headers.authorization;
  const token =
    (authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null) ||
    (req.headers['x-session-token'] as string) ||
    req.body.sessionToken;

  if (token) {
    authDb.revokeSession(token);
  }

  res.json({ success: true, message: 'Logged out successfully.' });
});

// Current User State & Verification (/me)
authRouter.get('/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || !req.session) {
    return res.json({
      authenticated: false,
      user: null,
      settings: {
        pauseRegistrations: authDb.settings.pauseRegistrations,
        disableMemberAccess: authDb.settings.disableMemberAccess,
      },
    });
  }

  res.json({
    authenticated: true,
    user: sanitizeUser(req.user),
    sessionToken: req.session.id,
    settings: {
      pauseRegistrations: authDb.settings.pauseRegistrations,
      disableMemberAccess: authDb.settings.disableMemberAccess,
    },
  });
});

// Forgot Password - Send Reset Code
authRouter.post('/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email address is required.' });
  }

  const normEmail = email.trim().toLowerCase();
  const user = authDb.findUserByEmail(normEmail);

  // Generate 6-digit verification code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const resetId = 'reset_' + crypto.randomBytes(8).toString('hex');
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins

  authDb.passwordResets.set(normEmail, {
    id: resetId,
    email: normEmail,
    code,
    expiresAt,
    used: false,
  });

  console.log(`[AUTH] Password reset code generated for ${normEmail}: ${code}`);

  // In production this would be dispatched via email. For developer/user accessibility,
  // return simulation code in payload as well.
  res.json({
    success: true,
    message: `A 6-digit reset code has been generated for ${normEmail}.`,
    simulationResetCode: code,
    expiresInMinutes: 15,
  });
});

// Reset Password with Verification Code
authRouter.post('/reset-password', (req: Request, res: Response) => {
  const { email, resetCode, newPassword, confirmPassword } = req.body;

  if (!email || !resetCode || !newPassword) {
    return res.status(400).json({ error: 'Email, reset code, and new password are required.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  if (confirmPassword !== undefined && newPassword !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }

  const normEmail = email.trim().toLowerCase();
  const resetRecord = authDb.passwordResets.get(normEmail);

  if (!resetRecord || resetRecord.code !== resetCode.trim() || resetRecord.used) {
    return res.status(400).json({ error: 'Invalid or expired password reset code.' });
  }

  if (Date.now() > resetRecord.expiresAt) {
    authDb.passwordResets.delete(normEmail);
    return res.status(400).json({ error: 'Password reset code has expired. Please request a new one.' });
  }

  const user = authDb.findUserByEmail(normEmail);
  if (!user) {
    return res.status(404).json({ error: 'Account not found.' });
  }

  // Update password
  const { hash, salt } = hashPassword(newPassword);
  user.passwordHash = hash;
  user.salt = salt;
  user.failedLoginAttempts = 0;
  user.lockUntil = undefined;
  user.updatedAt = new Date().toISOString();

  // Invalidate reset code
  resetRecord.used = true;

  // Invalidate all old sessions for security
  authDb.revokeAllUserSessions(user.id);
  authDb.saveToDisk();

  authDb.logAudit({
    adminUserId: user.id,
    adminEmail: user.email,
    action: 'PASSWORD_RESET_SUCCESS',
    targetUserId: user.id,
    targetEmail: user.email,
  });

  res.json({
    success: true,
    message: 'Password reset successfully. You can now log in with your new password.',
  });
});

// ==========================================
// ADMIN DASHBOARD & MANAGEMENT ROUTES
// Protected by requireAdmin middleware
// ==========================================

export const adminRouter = express.Router();
adminRouter.use(authMiddleware);
adminRouter.use(requireAdmin);

// 1. Top Metrics & Overview (Section 4)
adminRouter.get('/overview', (_req: AuthenticatedRequest, res: Response) => {
  const users = Array.from(authDb.users.values());
  const totalMembers = users.filter((u) => u.role === 'member').length;
  const totalAllUsers = users.length;
  const activeMembers = authDb.getCurrentlyActiveMembersCount();
  const blockedMembers = users.filter((u) => u.status === 'blocked').length;

  // New members registered within the last 7 days
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const newMembers = users.filter(
    (u) => u.role === 'member' && new Date(u.createdAt).getTime() >= sevenDaysAgo
  );

  res.json({
    totalMembers,
    totalAllUsers,
    activeMembers,
    blockedMembers,
    newMembersCount: newMembers.length,
    newMembers: newMembers.slice(0, 10).map(sanitizeUser),
    settings: authDb.settings,
  });
});

// 2. Member List & Search (Section 5)
adminRouter.get('/users', (req: AuthenticatedRequest, res: Response) => {
  const { search, status, role } = req.query;
  let list = Array.from(authDb.users.values());

  if (role && role !== 'all') {
    list = list.filter((u) => u.role === role);
  }

  if (status && status !== 'all') {
    list = list.filter((u) => u.status === status);
  }

  if (search && typeof search === 'string') {
    const q = search.trim().toLowerCase();
    list = list.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        u.name.toLowerCase().includes(q) ||
        (u.phone && u.phone.includes(q))
    );
  }

  // Sort: newest first
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Return strictly sanitized fields (Section 5: NO PASSWORDS, NO HASHES, NO SECRETS)
  res.json(list.map(sanitizeUser));
});

// 3. User Details & History (Section 7)
adminRouter.get('/users/:id', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const user = authDb.findUserById(id);
  if (!user) {
    return res.status(404).json({ error: 'Member not found.' });
  }

  // Find user's active sessions
  const userSessions = Array.from(authDb.sessions.values())
    .filter((s) => s.userId === id)
    .sort((a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime())
    .map((s) => ({
      id: s.id,
      createdAt: s.createdAt,
      lastActivityAt: s.lastActivityAt,
      expiresAt: s.expiresAt,
      isRevoked: !!s.revokedAt,
      ipOrUa: s.ipOrUa,
    }));

  res.json({
    user: sanitizeUser(user),
    sessions: userSessions,
    history: {
      lastLoginAt: user.lastLoginAt || 'Never logged in',
      accountCreationDate: user.createdAt,
      numberOfLogins: user.loginCount,
      failedAttempts: user.failedLoginAttempts,
      accountStatus: user.status,
    },
  });
});

// 4. Block Member (Section 8)
adminRouter.post('/users/:id/block', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const target = authDb.findUserById(id);
  if (!target) {
    return res.status(404).json({ error: 'Member not found.' });
  }

  // Prevent blocking self
  if (target.id === req.user!.id || target.email === 'cybersecurity134@gmail.com') {
    return res.status(400).json({ error: 'Cannot block the primary administrator account.' });
  }

  target.status = 'blocked';
  target.updatedAt = new Date().toISOString();

  // Invalidate active sessions immediately
  const revokedCount = authDb.revokeAllUserSessions(target.id);
  authDb.saveToDisk();

  // Log admin action (Section 8, 17)
  authDb.logAudit({
    adminUserId: req.user!.id,
    adminEmail: req.user!.email,
    action: 'BLOCK_MEMBER',
    targetUserId: target.id,
    targetEmail: target.email,
    metadata: { revokedSessions: revokedCount },
  });

  res.json({
    success: true,
    user: sanitizeUser(target),
    message: `Member ${target.email} has been blocked and active sessions revoked.`,
  });
});

// 5. Unblock Member (Section 9)
adminRouter.post('/users/:id/unblock', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const target = authDb.findUserById(id);
  if (!target) {
    return res.status(404).json({ error: 'Member not found.' });
  }

  target.status = 'active';
  target.updatedAt = new Date().toISOString();
  authDb.saveToDisk();

  authDb.logAudit({
    adminUserId: req.user!.id,
    adminEmail: req.user!.email,
    action: 'UNBLOCK_MEMBER',
    targetUserId: target.id,
    targetEmail: target.email,
  });

  res.json({
    success: true,
    user: sanitizeUser(target),
    message: `Member ${target.email} has been unblocked.`,
  });
});

// 6. Change Status (Active, Blocked, Pending, Suspended) (Section 18)
adminRouter.patch('/users/:id/status', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['active', 'blocked', 'pending', 'suspended'].includes(status)) {
    return res.status(400).json({ error: 'Status must be active, blocked, pending, or suspended.' });
  }

  const target = authDb.findUserById(id);
  if (!target) {
    return res.status(404).json({ error: 'Member not found.' });
  }

  if (target.email === 'cybersecurity134@gmail.com' && status !== 'active') {
    return res.status(400).json({ error: 'Cannot deactivate primary administrator account.' });
  }

  const previousStatus = target.status;
  target.status = status;
  target.updatedAt = new Date().toISOString();

  if (status === 'blocked' || status === 'suspended') {
    authDb.revokeAllUserSessions(target.id);
  }
  authDb.saveToDisk();

  authDb.logAudit({
    adminUserId: req.user!.id,
    adminEmail: req.user!.email,
    action: 'CHANGE_STATUS',
    targetUserId: target.id,
    targetEmail: target.email,
    metadata: { from: previousStatus, to: status },
  });

  res.json({
    success: true,
    user: sanitizeUser(target),
  });
});

// 7. Delete Member (Section 19)
adminRouter.delete('/users/:id', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const target = authDb.findUserById(id);
  if (!target) {
    return res.status(404).json({ error: 'Member not found.' });
  }

  if (target.id === req.user!.id || target.email === 'cybersecurity134@gmail.com') {
    return res.status(400).json({ error: 'Cannot delete the primary administrator account.' });
  }

  authDb.revokeAllUserSessions(target.id);
  authDb.users.delete(id);
  authDb.saveToDisk();

  authDb.logAudit({
    adminUserId: req.user!.id,
    adminEmail: req.user!.email,
    action: 'DELETE_MEMBER',
    targetUserId: id,
    targetEmail: target.email,
  });

  res.json({
    success: true,
    message: `Member ${target.email} has been deleted.`,
  });
});

// 8. Active Login Sessions Tracking (Section 6)
adminRouter.get('/sessions', (_req: AuthenticatedRequest, res: Response) => {
  const sessions = authDb.getActiveSessionsList();
  res.json(sessions);
});

// Invalidate specific session
adminRouter.post('/sessions/:id/revoke', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const revoked = authDb.revokeSession(id);
  if (!revoked) {
    return res.status(404).json({ error: 'Session not found or already terminated.' });
  }

  authDb.logAudit({
    adminUserId: req.user!.id,
    adminEmail: req.user!.email,
    action: 'REVOKE_SESSION',
    metadata: { sessionId: id },
  });

  res.json({ success: true, message: 'Session revoked.' });
});

// Emergency: Terminate all member sessions (Section 12)
adminRouter.post('/sessions/terminate-all-members', (req: AuthenticatedRequest, res: Response) => {
  let count = 0;
  const now = new Date().toISOString();
  for (const session of authDb.sessions.values()) {
    if (session.role !== 'admin' && !session.revokedAt) {
      session.revokedAt = now;
      count++;
    }
  }
  authDb.saveToDisk();

  authDb.logAudit({
    adminUserId: req.user!.id,
    adminEmail: req.user!.email,
    action: 'TERMINATE_ALL_MEMBER_SESSIONS',
    metadata: { count },
  });

  res.json({ success: true, count });
});

// 9. Audit Logs (Section 17)
adminRouter.get('/audit-logs', (_req: AuthenticatedRequest, res: Response) => {
  res.json(authDb.auditLogs);
});

// 10. Global Settings (Sections 11 & 12)
adminRouter.get('/settings', (_req: AuthenticatedRequest, res: Response) => {
  res.json(authDb.settings);
});

adminRouter.post('/settings', (req: AuthenticatedRequest, res: Response) => {
  const { pauseRegistrations, disableMemberAccess, emergencyMessage } = req.body;

  if (pauseRegistrations !== undefined) {
    authDb.settings.pauseRegistrations = !!pauseRegistrations;
  }

  if (disableMemberAccess !== undefined) {
    const wasDisabled = authDb.settings.disableMemberAccess;
    authDb.settings.disableMemberAccess = !!disableMemberAccess;

    // If emergency lock turned ON, immediately invalidate active member sessions
    if (!wasDisabled && authDb.settings.disableMemberAccess) {
      const now = new Date().toISOString();
      for (const session of authDb.sessions.values()) {
        if (session.role !== 'admin' && !session.revokedAt) {
          session.revokedAt = now;
        }
      }
    }
  }

  if (emergencyMessage !== undefined) {
    authDb.settings.emergencyMessage = String(emergencyMessage);
  }

  authDb.saveToDisk();

  authDb.logAudit({
    adminUserId: req.user!.id,
    adminEmail: req.user!.email,
    action: 'UPDATE_SYSTEM_SETTINGS',
    metadata: { settings: authDb.settings },
  });

  res.json({
    success: true,
    settings: authDb.settings,
  });
});
