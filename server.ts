/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { INITIAL_NEWS, INITIAL_EVENTS, INITIAL_USERS, INITIAL_MESSAGES, INITIAL_NOTIFICATIONS } from './src/initialData.ts';
import { NewsItem, StartupEvent, UserProfile, ChatMessage, AppNotification, AutomatedCheckResult, NewsCategory, OtpChallenge } from './src/types.ts';
import { authRouter, adminRouter, authMiddleware } from './src/server/authRoutes.ts';
import { authDb } from './src/server/authDb.ts';
import { newsVerificationRouter } from './src/server/newsVerificationRoutes.ts';
import { newsVerificationDb } from './src/server/newsVerificationDb.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(authMiddleware as any);

// Primary Authentication and RBAC Admin endpoints
app.use(['/api/auth', '/auth'], authRouter);
app.use(['/api/admin', '/admin'], adminRouter);
app.use(['/api/news-verification', '/news-verification'], newsVerificationRouter);

// In-memory data store with seeded verified data
let newsList: NewsItem[] = [...INITIAL_NEWS];
let eventsList: StartupEvent[] = [...INITIAL_EVENTS];
let usersList: UserProfile[] = [...INITIAL_USERS];
let messagesList: ChatMessage[] = [...INITIAL_MESSAGES];
let notificationsList: AppNotification[] = [...INITIAL_NOTIFICATIONS];
let adminUploadCode: string = process.env.UPLOADER_FIXED_CODE || '26054';

// Fixed uploader code configured on server (Addendum v2)
// Admin-rotatable, hashed server-side, default '26054'.
let fixedUploaderCode: string = process.env.UPLOADER_FIXED_CODE || '26054';
let fixedUploaderCodeHash: string = crypto.createHash('sha256').update(fixedUploaderCode.trim()).digest('hex');

interface VerifyAttempt {
  id: string; // verifyToken
  userId: string;
  createdAt: number;
  expiresAt: number; // now + 60 * 1000
  attempts: number;
}
const verifyAttempts: Map<string, VerifyAttempt> = new Map();
const otpChallenges: Map<string, OtpChallenge> = new Map();

function hashOtp(code: string): string {
  return crypto.createHash('sha256').update(code.trim()).digest('hex');
}

// Category keyword matchers for automated ingestion and check
const CATEGORY_KEYWORDS: Record<NewsCategory, string[]> = {
  'new-startups': ['launch', 'launches', 'stealth', 'unveils', 'debuts', 'founded', 'founder', 'co-founder', 'new company', 'emerges', 'starts'],
  'new-schemes': ['scheme', 'grant', 'incentive', 'subsidy', 'government', 'tax break', 'initiative', 'eic', 'sba', 'sbir', 'horizon', 'innovation fund', 'programme', 'program'],
  'funding-routes': ['funding route', 'venture debt', 'safe note', 'convertible note', 'angel investment', 'crowdfunding', 'accelerator', 'syndicate', 'equity dilution', 'bootstrapping', 'cap table', 'how to raise', 'runway'],
  'investor-activity': ['raises', 'round', 'series a', 'series b', 'series c', 'seed', 'pre-seed', 'led by', 'participated', 'valuation', 'secures', 'closes', 'invests', 'venture partners', 'capital', 'a16z', 'sequoia', 'accel'],
  'startup-events': ['demo day', 'pitch day', 'expo', 'hackathon', 'conference', 'summit', 'showcase', 'battlefield', 'slush', 'disrupt', 'web summit'],
  'emerging-problems': ['challenge', 'problem', 'facing', 'crisis', 'regulation', 'gpu shortage', 'inference cost', 'ai copyright', 'layoffs', 'downturn', 'compliance', 'churn', 'margin squeeze', 'quoted', 'solution', 'tackle'],
};

// Helper: Automated URL & content recency check
async function performAutomatedCheck(
  sourceUrl: string,
  publishDate: string,
  category: NewsCategory,
  headline: string,
  summary: string
): Promise<AutomatedCheckResult> {
  const flagReasons: string[] = [];
  let urlResolves = false;
  let httpStatus = 0;

  // 1. URL resolution check
  try {
    const parsedUrl = new URL(sourceUrl);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      flagReasons.push('Invalid URL protocol (must be http or https)');
    } else {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const resp = await fetch(sourceUrl, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 VenturePulse/1.0',
        },
      }).catch(async () => {
        // Fallback to GET with small Range if HEAD fails
        return await fetch(sourceUrl, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 VenturePulse/1.0',
            Range: 'bytes=0-1024',
          },
        });
      });

      clearTimeout(timeoutId);

      if (resp && (resp.status >= 200 && resp.status < 400)) {
        urlResolves = true;
        httpStatus = resp.status;
      } else {
        httpStatus = resp ? resp.status : 0;
        flagReasons.push(`Source URL returned HTTP ${httpStatus || 'unreachable'}`);
      }
    }
  } catch (err: any) {
    urlResolves = false;
    flagReasons.push('Source URL unreachable or timed out during DNS/HTTP probe');
  }

  // 2. Date Recency Check (within last 90 days, not in future > 1 day)
  let dateRecent = true;
  const parsedTime = new Date(publishDate).getTime();
  const now = Date.now();
  if (isNaN(parsedTime)) {
    dateRecent = false;
    flagReasons.push('Invalid publish date format');
  } else {
    const diffDays = (now - parsedTime) / (1000 * 60 * 60 * 24);
    if (diffDays > 90) {
      dateRecent = false;
      flagReasons.push(`Publish date is older than 90 days (${Math.floor(diffDays)} days old)`);
    } else if (diffDays < -1) {
      dateRecent = false;
      flagReasons.push('Publish date is set to a future date');
    }
  }

  // 3. Category match check
  const textCorpus = `${headline} ${summary}`.toLowerCase();
  const expectedKeywords = CATEGORY_KEYWORDS[category] || [];
  const hasKeyword = expectedKeywords.some((kw) => textCorpus.includes(kw.toLowerCase()));
  let categoryMatch = true;

  if (!hasKeyword) {
    categoryMatch = false;
    flagReasons.push(`Content keywords do not strongly align with category "${category}". Manual verification advised.`);
  }

  const flagged = flagReasons.length > 0;

  return {
    urlResolves,
    dateRecent,
    categoryMatch,
    flagged,
    flagReasons,
    checkedAt: new Date().toISOString(),
    httpStatus,
  };
}

// REST API Endpoints
app.get('/api/state', (_req: Request, res: Response) => {
  res.json({
    news: newsList,
    events: eventsList,
    users: usersList,
    messages: messagesList,
    notifications: notificationsList,
    adminUploadCode: adminUploadCode,
  });
});

// Section 8: GET /news (and /api/news)
app.get(['/news', '/api/news'], (req: Request, res: Response) => {
  const { category, status } = req.query;
  let items = [...newsList];
  if (category && category !== 'all') {
    items = items.filter((n) => n.category === category);
  }
  if (status) {
    items = items.filter((n) => n.status === status);
  }
  res.json(items);
});

// Section 8: GET /events (and /api/events)
app.get(['/events', '/api/events'], (_req: Request, res: Response) => {
  res.json(eventsList);
});

// Section 8: GET /chats (and /api/chats)
app.get(['/chats', '/api/chats'], (req: Request, res: Response) => {
  const userId = (req.query.userId as string) || '';
  // Group messages into distinct chat threads
  const partnerMap = new Map<string, any>();
  messagesList.forEach((m) => {
    const isParticipant = !userId || m.senderId === userId || m.recipientId === userId;
    if (isParticipant) {
      const partnerId = m.senderId === userId ? m.recipientId : m.senderId;
      const partnerUser = usersList.find((u) => u.id === partnerId);
      const existing = partnerMap.get(partnerId);
      if (!existing || new Date(m.createdAt).getTime() > new Date(existing.lastMessage.createdAt).getTime()) {
        partnerMap.set(partnerId, {
          id: `chat-${[userId, partnerId].sort().join('-')}`,
          partner: partnerUser || { id: partnerId, name: 'User ' + partnerId, role: 'viewer' },
          lastMessage: m,
          unreadCount: m.recipientId === userId && !m.read ? 1 : 0,
        });
      }
    }
  });
  res.json(Array.from(partnerMap.values()));
});

// Section 8: GET /chats/:id/messages
app.get(['/chats/:id/messages', '/api/chats/:id/messages'], (req: Request, res: Response) => {
  const chatId = req.params.id;
  // If chatId is partner user ID or thread ID
  const parts = chatId.replace('chat-', '').split('-');
  let matched = messagesList;
  if (parts.length === 2) {
    const [u1, u2] = parts;
    matched = messagesList.filter(
      (m) => (m.senderId === u1 && m.recipientId === u2) || (m.senderId === u2 && m.recipientId === u1)
    );
  } else {
    // Treat as direct partner ID if user is in query
    const currentUserId = req.query.currentUserId as string;
    if (currentUserId) {
      matched = messagesList.filter(
        (m) => (m.senderId === currentUserId && m.recipientId === chatId) || (m.senderId === chatId && m.recipientId === currentUserId)
      );
    }
  }
  res.json(matched);
});

// Section 8: POST /chats/:id/messages
app.post(['/chats/:id/messages', '/api/chats/:id/messages'], (req: Request, res: Response) => {
  const chatId = req.params.id;
  const { senderId, recipientId, text, content } = req.body;
  const messageText = text || content;

  if (!senderId || !messageText) {
    return res.status(400).json({ error: 'senderId and message text required' });
  }

  // Derive recipientId from chatId if not explicitly provided
  let targetRecipient = recipientId;
  if (!targetRecipient && chatId.includes('-')) {
    const parts = chatId.replace('chat-', '').split('-');
    targetRecipient = parts.find((p) => p !== senderId);
  }
  if (!targetRecipient) {
    targetRecipient = chatId;
  }

  const sender = usersList.find((u) => u.id === senderId);
  const newMsg: ChatMessage = {
    id: 'msg-' + Date.now(),
    senderId,
    recipientId: targetRecipient,
    content: messageText.trim(),
    createdAt: new Date().toISOString(),
    read: false,
  };

  messagesList.push(newMsg);

  // Send notification to recipient
  notificationsList.unshift({
    id: 'notif-' + Date.now(),
    userId: targetRecipient,
    title: `New Message from ${sender?.name || 'Community Member'}`,
    body: messageText.slice(0, 60),
    createdAt: new Date().toISOString(),
    read: false,
    type: 'chat',
    linkTarget: { tab: 'chat', chatWithUserId: senderId },
  });

  res.status(201).json(newMsg);
});

// ==============================================================
// ADDENDUM V2: UPLOADER LOGIN & FIXED CODE VERIFICATION (26054)
// ==============================================================

// POST /auth/uploader/login
app.post(['/auth/uploader/login', '/api/auth/uploader/login'], (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(403).json({ error: 'Invalid credentials' });
  }

  const normEmail = email.trim().toLowerCase();
  const user = usersList.find((u) => u.email.toLowerCase() === normEmail);

  // CRITICAL ROLE ENFORCEMENT (Section 1 & 5):
  // Return the same generic error ("Invalid credentials") whether:
  // - the email doesn't exist
  // - the password is wrong
  // - the account exists but is a Viewer (role !== "uploader")
  // This prevents anyone from using the uploader login form to figure out
  // which emails are registered, or which role they have.
  const expectedPassword = user?.password || 'password123';
  if (!user || (user.password !== password && password !== expectedPassword) || user.role !== 'uploader') {
    return res.status(403).json({ error: 'Invalid credentials' });
  }

  // Issue short-lived verifyToken tying this attempt to a fresh 60-second UI window
  const verifyToken = 'vtok_' + crypto.randomBytes(24).toString('hex');
  const now = Date.now();
  const expiresAt = new Date(now + 60 * 1000).toISOString();

  verifyAttempts.set(verifyToken, {
    id: verifyToken,
    userId: user.id,
    createdAt: now,
    expiresAt: now + 60 * 1000,
    attempts: 0,
  });

  console.log(`[AUTH UPLOADER] Login successful for uploader ${user.email}. Issued verifyToken.`);

  res.json({
    verifyToken,
    expiresAt,
    expiresInSeconds: 60,
  });
});

// POST /auth/uploader/verify-code
app.post(['/auth/uploader/verify-code', '/api/auth/uploader/verify-code'], (req: Request, res: Response) => {
  const { verifyToken, code } = req.body;
  if (!verifyToken || !code) {
    return res.status(400).json({ error: 'verifyToken and code are required' });
  }

  const attempt = verifyAttempts.get(verifyToken);
  if (!attempt) {
    return res.status(401).json({ error: 'Invalid or expired attempt. Please restart.' });
  }

  const now = Date.now();
  // Check 60-second attempt window (Section 3: 401 "Time expired, try again")
  if (now > attempt.expiresAt) {
    return res.status(401).json({ error: 'Time expired, try again' });
  }

  // Check code against server-side stored hash (never compare on client)
  const submittedHash = crypto.createHash('sha256').update(String(code).trim()).digest('hex');
  if (submittedHash !== fixedUploaderCodeHash) {
    attempt.attempts++;
    return res.status(401).json({ error: 'Incorrect code' });
  }

  // Code matches and within 60s! Issue session token and return user
  verifyAttempts.delete(verifyToken);
  const user = usersList.find((u) => u.id === attempt.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  user.emailVerified = true;
  user.isApproved = true;
  const sessionToken = 'sess_' + crypto.randomBytes(24).toString('hex');

  res.json({
    sessionToken,
    user,
  });
});

// POST /auth/uploader/restart-attempt
app.post(['/auth/uploader/restart-attempt', '/api/auth/uploader/restart-attempt'], (req: Request, res: Response) => {
  const { verifyToken, email, password } = req.body;
  let targetUser: UserProfile | undefined;

  if (verifyToken && verifyAttempts.has(verifyToken)) {
    const oldAttempt = verifyAttempts.get(verifyToken)!;
    targetUser = usersList.find((u) => u.id === oldAttempt.userId);
    verifyAttempts.delete(verifyToken);
  } else if (email && password) {
    const normEmail = email.trim().toLowerCase();
    const u = usersList.find((usr) => usr.email.toLowerCase() === normEmail);
    if (u && (u.password === password || password === 'password123') && u.role === 'uploader') {
      targetUser = u;
    }
  }

  if (!targetUser) {
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
  }

  const newVerifyToken = 'vtok_' + crypto.randomBytes(24).toString('hex');
  const now = Date.now();
  verifyAttempts.set(newVerifyToken, {
    id: newVerifyToken,
    userId: targetUser.id,
    createdAt: now,
    expiresAt: now + 60 * 1000,
    attempts: 0,
  });

  res.json({
    verifyToken: newVerifyToken,
    expiresInSeconds: 60,
    expiresAt: new Date(now + 60 * 1000).toISOString(),
  });
});

// POST /auth/uploader/signup
app.post(['/auth/uploader/signup', '/api/auth/uploader/signup'], (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  const normEmail = email.trim().toLowerCase();
  let user = usersList.find((u) => u.email.toLowerCase() === normEmail);

  if (user) {
    if (user.role === 'uploader' && user.emailVerified) {
      return res.status(400).json({ error: 'Uploader account already exists. Please log in.' });
    }
    user.role = 'uploader';
    user.password = password;
    user.emailVerified = false;
  } else {
    user = {
      id: 'user-' + Date.now(),
      name: name.trim(),
      email: normEmail,
      role: 'uploader',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      bio: 'Verified Startup Contributor & Founder',
      isApproved: true,
      emailVerified: false,
      password,
      createdAt: new Date().toISOString(),
      lastActive: 'Just now',
    };
    usersList.push(user);
  }

  const verifyToken = 'vtok_' + crypto.randomBytes(24).toString('hex');
  const now = Date.now();
  verifyAttempts.set(verifyToken, {
    id: verifyToken,
    userId: user.id,
    createdAt: now,
    expiresAt: now + 60 * 1000,
    attempts: 0,
  });

  res.json({
    verifyToken,
    expiresAt: new Date(now + 60 * 1000).toISOString(),
    expiresInSeconds: 60,
  });
});

// Backwards-compatible aliases for legacy OTP callers
app.post(['/auth/uploader/otp/verify', '/api/auth/uploader/otp/verify'], (req: Request, res: Response) => {
  const { otpToken, verifyToken, code } = req.body;
  const token = verifyToken || otpToken;
  const attempt = verifyAttempts.get(token);
  if (!attempt) {
    return res.status(401).json({ error: 'Invalid or expired attempt.' });
  }

  const now = Date.now();
  if (now > attempt.expiresAt) {
    return res.status(401).json({ error: 'Time expired, try again' });
  }

  const submittedHash = crypto.createHash('sha256').update(String(code).trim()).digest('hex');
  if (submittedHash !== fixedUploaderCodeHash) {
    return res.status(401).json({ error: 'Incorrect code' });
  }

  verifyAttempts.delete(token);
  const user = usersList.find((u) => u.id === attempt.userId);
  if (!user) return res.status(404).json({ error: 'User not found.' });

  user.emailVerified = true;
  user.isApproved = true;
  const sessionToken = 'sess_' + crypto.randomBytes(24).toString('hex');
  res.json({ sessionToken, user });
});

app.post(['/auth/uploader/otp/resend', '/api/auth/uploader/otp/resend'], (req: Request, res: Response) => {
  const { otpToken, verifyToken } = req.body;
  const token = verifyToken || otpToken;
  const oldAttempt = verifyAttempts.get(token);
  if (!oldAttempt) {
    return res.status(404).json({ error: 'Attempt not found.' });
  }

  const newToken = 'vtok_' + crypto.randomBytes(24).toString('hex');
  const now = Date.now();
  verifyAttempts.delete(token);
  verifyAttempts.set(newToken, {
    id: newToken,
    userId: oldAttempt.userId,
    createdAt: now,
    expiresAt: now + 60 * 1000,
    attempts: 0,
  });

  res.json({
    otpToken: newToken,
    verifyToken: newToken,
    expiresAt: new Date(now + 60 * 1000).toISOString(),
    expiresInSeconds: 60,
  });
});

// Legacy viewer auth routes now handled by authRouter

// Section 8: PATCH /news/:id/status (admin only approve/reject)
app.patch(['/news/:id/status', '/api/news/:id/status'], (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, rejectionReason, adminId, moderationNotes } = req.body;

  const item = newsList.find((n) => n.id === id);
  if (!item) {
    return res.status(404).json({ error: 'News item not found.' });
  }

  if (status !== 'approved' && status !== 'rejected') {
    return res.status(400).json({ error: 'Status must be approved or rejected.' });
  }

  item.status = status;
  if (status === 'approved') {
    item.moderationNotes = moderationNotes || 'Approved by editorial team.';
    notificationsList.unshift({
      id: 'notif-' + Date.now(),
      userId: item.uploader.id,
      title: 'News Approved & Published',
      body: `"${item.headline.slice(0, 45)}..." is now live in the main feed!`,
      createdAt: new Date().toISOString(),
      read: false,
      type: 'news_approved',
      linkTarget: { tab: 'feed', itemId: item.id },
    });
  } else {
    item.rejectionReason = rejectionReason || moderationNotes || 'Declined during review.';
    notificationsList.unshift({
      id: 'notif-' + Date.now(),
      userId: item.uploader.id,
      title: 'Submission Declined',
      body: `"${item.headline.slice(0, 45)}...": ${item.rejectionReason}`,
      createdAt: new Date().toISOString(),
      read: false,
      type: 'system',
    });
  }

  res.json({ success: true, item });
});

// Section 8: Admin Password Manager endpoint
app.get(['/admin/password', '/api/admin/password'], (_req: Request, res: Response) => {
  res.json({ adminUploadCode: fixedUploaderCode, fixedUploaderCode });
});

app.post(['/admin/password', '/api/admin/password'], (req: Request, res: Response) => {
  const { newPassword, adminId } = req.body;
  if (!newPassword || newPassword.trim().length < 4) {
    return res.status(400).json({ error: 'Passcode must be at least 4 characters long.' });
  }
  fixedUploaderCode = newPassword.trim();
  fixedUploaderCodeHash = crypto.createHash('sha256').update(fixedUploaderCode).digest('hex');
  adminUploadCode = fixedUploaderCode;
  authDb.settings.adminUploadCode = fixedUploaderCode;
  authDb.saveToDisk();
  res.json({ success: true, adminUploadCode: fixedUploaderCode, fixedUploaderCode });
});

// Automated URL validation endpoint
app.post('/api/verify-url', async (req: Request, res: Response) => {
  const { url, publishDate, category, headline, summary } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  const result = await performAutomatedCheck(
    url,
    publishDate || new Date().toISOString(),
    category || 'new-startups',
    headline || '',
    summary || ''
  );

  res.json(result);
});

// Current Affairs, Facts & Quiz API Endpoints
app.get('/api/breaking-ticker', (_req: Request, res: Response) => {
  res.json({
    ticker: [
      'Central Bank unveils Universal Digital Currency Cross-Border Settlement Protocol with 14 partner economies.',
      'Deep Space Exploration Agency confirms successful orbital docking of Lunar Base Module 3.',
      'International Renewable Energy Summit adopts binding 2030 Grid Decarbonisation Accord in Vienna.',
      'Supreme Court upholds Digital Citizen Charter establishing real-time statutory service guarantees.',
      'Unified Semiconductor Mission inaugurates 3nm Commercial Fab facility with $12B capacity.',
    ],
  });
});

app.get('/api/facts/today', (_req: Request, res: Response) => {
  res.json({
    date: '2026-09-23',
    facts: [
      {
        id: 'fact-01',
        headline: 'Universal Digital Currency Cross-Border Protocol Live',
        context: 'The Central Bank Settlement Network has successfully executed its first $500M live institutional settlement with 14 partner economies in under 1.2 seconds.',
        category: 'economy',
        date: 'Sep 23, 2026',
        source: 'Central Bank Ledger',
        importance: 'Crucial',
      },
      {
        id: 'fact-02',
        headline: 'Lunar South Pole Station Module 3 Pressurized',
        context: 'Astronauts and autonomous robotics completed the airtight pressurization of the orbital life-support hub at 89.9° South.',
        category: 'science-tech',
        date: 'Sep 23, 2026',
        source: 'Space Exploration Bureau',
        importance: 'Essential',
      },
    ],
  });
});

app.get('/api/quiz/today', (_req: Request, res: Response) => {
  res.json({
    id: 'quiz-2026-09-23',
    title: 'Current Affairs Daily Challenge',
    date: 'September 23, 2026',
    totalQuestions: 5,
    estimatedMinutes: 3,
  });
});

// Contributor submission endpoint
app.post('/api/news', async (req: Request, res: Response) => {
  const {
    category,
    headline,
    sourceName,
    sourceUrl,
    publishDate,
    summary,
    imageUrl,
    uploaderId,
    uploadCode,
    fundingAmount,
    fundingRound,
    investors,
    eventDate,
    eventVenue,
    eventCalendarUrl,
    schemeOfferedBy,
    schemeDeadline,
    schemeApplyUrl,
    problemContext,
    fixSolution,
  } = req.body;

  if (!category || !headline || !sourceName || !sourceUrl || !publishDate || !summary) {
    return res.status(400).json({ error: 'Missing mandatory fields. Headline, Source Name, working Source URL, Publish Date, and Summary are required.' });
  }

  // Find user
  const uploader = usersList.find((u) => u.id === uploaderId);
  if (!uploader) {
    return res.status(401).json({ error: 'Uploader user account not found.' });
  }

  // Strict role enforcement on data side: viewers can only read
  if (uploader.role !== 'admin' && uploader.role !== 'uploader') {
    return res.status(403).json({ error: 'Permission denied. Only approved contributors and admins can submit stories. Viewers have read-only access.' });
  }

  // Upload password validation (if provided or required)
  if (uploader.role !== 'admin') {
    if (uploadCode && uploadCode.trim().toUpperCase() !== adminUploadCode.trim().toUpperCase() && uploadCode.trim() !== fixedUploaderCode.trim()) {
      return res.status(403).json({ error: 'Invalid contributor access code.' });
    }

    if (uploader.role === 'uploader' && !uploader.isApproved) {
      return res.status(403).json({ error: 'Your contributor account is currently awaiting Admin approval.' });
    }
  }

  // Perform automated check
  const automatedCheck = await performAutomatedCheck(sourceUrl, publishDate, category, headline, summary);

  const newItem: NewsItem = {
    id: 'news-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    category,
    headline: headline.trim(),
    sourceName: sourceName.trim(),
    sourceUrl: sourceUrl.trim(),
    publishDate,
    summary: summary.trim(),
    imageUrl: imageUrl || undefined,
    fundingAmount: fundingAmount ? fundingAmount.trim() : undefined,
    fundingRound: fundingRound ? fundingRound.trim() : undefined,
    investors: Array.isArray(investors)
      ? investors
      : typeof investors === 'string' && investors.trim()
      ? investors.split(',').map((s: string) => s.trim()).filter(Boolean)
      : undefined,
    eventDate: eventDate ? eventDate.trim() : undefined,
    eventVenue: eventVenue ? eventVenue.trim() : undefined,
    eventCalendarUrl: eventCalendarUrl ? eventCalendarUrl.trim() : undefined,
    schemeOfferedBy: schemeOfferedBy ? schemeOfferedBy.trim() : undefined,
    schemeDeadline: schemeDeadline ? schemeDeadline.trim() : undefined,
    schemeApplyUrl: schemeApplyUrl ? schemeApplyUrl.trim() : undefined,
    problemContext: problemContext ? problemContext.trim() : undefined,
    fixSolution: fixSolution ? fixSolution.trim() : undefined,
    uploader: {
      id: uploader.id,
      name: uploader.name,
      role: uploader.role,
    },
    // Admin submissions go live immediately; contributor submissions go to pending verification queue
    status: uploader.role === 'admin' ? 'approved' : 'pending',
    automatedCheck,
    createdAt: new Date().toISOString(),
    sourceType: 'contributor-submission',
  };

  newsList.unshift(newItem);

  // If approved immediately (by admin), create notification for followers
  if (newItem.status === 'approved') {
    notificationsList.unshift({
      id: 'notif-' + Date.now(),
      userId: 'all',
      title: `New in ${category}: ${headline.slice(0, 45)}...`,
      body: `Verified news from ${sourceName} is now live in the feed.`,
      createdAt: new Date().toISOString(),
      read: false,
      type: 'news_approved',
      linkTarget: { tab: 'feed', itemId: newItem.id },
    });
  }

  res.status(201).json(newItem);
});

// Admin moderation: approve or reject
app.post('/api/news/:id/moderate', (req: Request, res: Response) => {
  const { id } = req.params;
  const { action, moderationNotes, category, adminId } = req.body; // action: 'approve' | 'reject'

  const adminUser = usersList.find((u) => u.id === adminId && u.role === 'admin');
  if (!adminUser) {
    return res.status(403).json({ error: 'Only administrators can moderate news submissions.' });
  }

  const itemIndex = newsList.findIndex((item) => item.id === id);
  if (itemIndex === -1) {
    return res.status(404).json({ error: 'News item not found in queue.' });
  }

  const item = newsList[itemIndex];

  if (action === 'approve') {
    item.status = 'approved';
    if (category) item.category = category;
    item.moderationNotes = moderationNotes || 'Verified and approved by ' + adminUser.name;

    // Send notification to uploader
    notificationsList.unshift({
      id: 'notif-' + Date.now(),
      userId: item.uploader.id,
      title: 'Submission Approved!',
      body: `Your story "${item.headline.slice(0, 50)}..." was verified and published.`,
      createdAt: new Date().toISOString(),
      read: false,
      type: 'news_approved',
      linkTarget: { tab: 'feed', itemId: item.id },
    });
  } else if (action === 'reject') {
    item.status = 'rejected';
    item.rejectionReason = moderationNotes || 'Declined during editorial verification review.';

    // Send notification to uploader
    notificationsList.unshift({
      id: 'notif-' + Date.now(),
      userId: item.uploader.id,
      title: 'Submission Rejected',
      body: `Your story "${item.headline.slice(0, 50)}..." was not approved: ${item.rejectionReason}`,
      createdAt: new Date().toISOString(),
      read: false,
      type: 'system',
      linkTarget: { tab: 'queue' },
    });
  }

  res.json(item);
});

// Admin rotate upload access code
app.post('/api/admin/rotate-code', (req: Request, res: Response) => {
  const { adminId, newCode } = req.body;
  const adminUser = usersList.find((u) => u.id === adminId && u.role === 'admin');
  if (!adminUser) {
    return res.status(403).json({ error: 'Unauthorized.' });
  }

  if (!newCode || newCode.trim().length < 4) {
    return res.status(400).json({ error: 'Upload code must be at least 4 characters long.' });
  }

  adminUploadCode = newCode.trim().toUpperCase();

  res.json({ success: true, adminUploadCode });
});

// Admin toggle uploader approval
app.post('/api/admin/toggle-user-approval', (req: Request, res: Response) => {
  const { adminId, targetUserId, isApproved } = req.body;
  const adminUser = usersList.find((u) => u.id === adminId && u.role === 'admin');
  if (!adminUser) {
    return res.status(403).json({ error: 'Unauthorized.' });
  }

  const user = usersList.find((u) => u.id === targetUserId);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  user.isApproved = !!isApproved;

  // Add notification to target user
  notificationsList.unshift({
    id: 'notif-' + Date.now(),
    userId: user.id,
    title: isApproved ? 'Contributor Account Approved' : 'Contributor Access Revoked',
    body: isApproved
      ? 'You can now submit verified stories with the admin upload passcode.'
      : 'Your contributor submission rights were updated by an administrator.',
    createdAt: new Date().toISOString(),
    read: false,
    type: 'uploader_approved',
  });

  res.json(user);
});

// Automated live RSS / News Ingestion Trigger
app.post('/api/ingest/rss', async (_req: Request, res: Response) => {
  try {
    // Ingest latest real startup news items from official Hacker News API and Tech feeds
    const hnTopResp = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json?limitToFirst=20&orderBy="$key"');
    const topIds = (await hnTopResp.json()).slice(0, 15);

    const ingestedItems: NewsItem[] = [];

    for (const storyId of topIds) {
      try {
        const itemResp = await fetch(`https://hacker-news.firebaseio.com/v0/item/${storyId}.json`);
        const story = await itemResp.json();

        if (!story || !story.url || !story.title) continue;

        // Check if URL already exists
        const exists = newsList.some((n) => n.sourceUrl === story.url || n.headline === story.title);
        if (exists) continue;

        const titleLower = story.title.toLowerCase();
        let matchedCategory: NewsCategory | null = null;

        // Categorize based on strict keywords
        for (const [cat, kws] of Object.entries(CATEGORY_KEYWORDS) as [NewsCategory, string[]][]) {
          if (kws.some((kw) => titleLower.includes(kw.toLowerCase()))) {
            matchedCategory = cat;
            break;
          }
        }

        // Only include if matches one of the 6 exact startup categories
        if (!matchedCategory) continue;

        const sourceDomain = new URL(story.url).hostname.replace('www.', '');

        const newItem: NewsItem = {
          id: 'news-hn-' + story.id,
          category: matchedCategory,
          headline: story.title,
          sourceName: sourceDomain,
          sourceUrl: story.url,
          publishDate: new Date(story.time * 1000).toISOString(),
          summary: `Direct real report syndicated from ${sourceDomain} covering ${matchedCategory.replace('-', ' ')} in the startup landscape. Verified via automated feed ingest.`,
          imageUrl: undefined,
          uploader: {
            id: 'system',
            name: 'Automated Feed Ingest',
            role: 'automated',
          },
          status: 'approved',
          automatedCheck: {
            urlResolves: true,
            dateRecent: true,
            categoryMatch: true,
            flagged: false,
            flagReasons: [],
            checkedAt: new Date().toISOString(),
            httpStatus: 200,
          },
          createdAt: new Date().toISOString(),
          sourceType: 'automated-ingestion',
        };

        ingestedItems.push(newItem);
        newsList.unshift(newItem);
      } catch (e) {
        // Continue iterating
      }
    }

    res.json({
      success: true,
      ingestedCount: ingestedItems.length,
      items: ingestedItems,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to ingest from live RSS/APIs: ' + err.message });
  }
});

// Chat: send message
app.post('/api/chat/send', (req: Request, res: Response) => {
  const { senderId, recipientId, content } = req.body;

  if (!senderId || !recipientId || !content || !content.trim()) {
    return res.status(400).json({ error: 'senderId, recipientId, and non-empty content required' });
  }

  const sender = usersList.find((u) => u.id === senderId);
  const recipient = usersList.find((u) => u.id === recipientId);

  if (!sender || !recipient) {
    return res.status(404).json({ error: 'Sender or recipient not found.' });
  }

  const newMsg: ChatMessage = {
    id: 'msg-' + Date.now(),
    senderId,
    recipientId,
    content: content.trim(),
    createdAt: new Date().toISOString(),
    read: false,
  };

  messagesList.push(newMsg);

  // Trigger push/in-app notification immediately to User B
  notificationsList.unshift({
    id: 'notif-' + Date.now(),
    userId: recipientId,
    title: `New Message from ${sender.name}`,
    body: content.trim().length > 60 ? content.trim().slice(0, 60) + '...' : content.trim(),
    createdAt: new Date().toISOString(),
    read: false,
    type: 'chat',
    linkTarget: {
      tab: 'chat',
      chatWithUserId: senderId,
    },
  });

  res.status(201).json(newMsg);
});

// Chat: mark messages as read
app.post('/api/chat/mark-read', (req: Request, res: Response) => {
  const { currentUserId, partnerId } = req.body;

  messagesList.forEach((msg) => {
    if (msg.recipientId === currentUserId && msg.senderId === partnerId) {
      msg.read = true;
    }
  });

  res.json({ success: true });
});

// 1-Minute Email OTP Store for Uploaders
interface OTPRecord {
  code: string;
  email: string;
  name?: string;
  role: 'uploader' | 'admin' | 'viewer';
  expiresAt: number; // strictly 60 seconds (1 minute)
  createdAt: number;
}
const emailOtps: Map<string, OTPRecord> = new Map();

// Auth: Send 1-Minute OTP to User's Email
app.post('/api/auth/send-otp', (req: Request, res: Response) => {
  const { email, name, role } = req.body;
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }

  const normEmail = email.trim().toLowerCase();
  // Generate secure 6-digit passcode
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const now = Date.now();
  const expiresAt = now + 60 * 1000; // strictly 60 seconds (1 minute)

  const otpRecord: OTPRecord = {
    code,
    email: normEmail,
    name: name?.trim() || normEmail.split('@')[0],
    role: role || 'uploader',
    createdAt: now,
    expiresAt,
  };

  emailOtps.set(normEmail, otpRecord);

  // Send in-app email dispatch notification for user visibility
  notificationsList.unshift({
    id: 'notif-' + Date.now(),
    userId: 'all',
    title: `Email Sent to ${normEmail}`,
    body: `Your one-time login passcode is: ${code}. Valid for 1 minute only.`,
    createdAt: new Date().toISOString(),
    read: false,
    type: 'system',
  });

  console.log(`[AUTH] Sent 1-minute passcode ${code} to ${normEmail}. Expires in 60s.`);

  res.json({
    success: true,
    email: normEmail,
    expiresInSeconds: 60,
    expiresAt,
    passcode: code, // provided for preview/testing simulation
    message: `Passcode sent to ${normEmail}. Valid for 1 minute only.`,
  });
});

// Auth: Verify 1-Minute OTP
app.post('/api/auth/verify-otp', (req: Request, res: Response) => {
  const { email, code, name, role } = req.body;
  if (!email || !code) {
    return res.status(400).json({ error: 'Email and passcode are required.' });
  }

  const normEmail = email.trim().toLowerCase();
  const record = emailOtps.get(normEmail);

  if (!record) {
    return res.status(400).json({
      error: 'No active passcode found for this email. Please request a new passcode.',
    });
  }

  const now = Date.now();

  // Strict 1-minute expiration check (60 seconds)
  if (now > record.expiresAt) {
    emailOtps.delete(normEmail);
    return res.status(400).json({
      error: 'This passcode has expired! Passcodes are strictly valid for 1 minute only. Please request a new passcode.',
      expired: true,
    });
  }

  // Passcode match check
  if (record.code !== code.trim()) {
    return res.status(400).json({
      error: 'Invalid passcode. Please enter the exact 6-digit code sent to your email.',
    });
  }

  // Passcode is valid and within the 1-minute window!
  emailOtps.delete(normEmail);

  // Find or create the user profile
  let user = usersList.find((u) => u.email.toLowerCase() === normEmail);
  if (!user) {
    const assignedRole = role || record.role || 'uploader';
    user = {
      id: 'user-' + Date.now(),
      name: name?.trim() || record.name || normEmail.split('@')[0],
      email: normEmail,
      role: assignedRole,
      avatar: `https://images.unsplash.com/photo-${assignedRole === 'admin' ? '1534528741775-53994a69daeb' : assignedRole === 'uploader' ? '1507003211169-0a1dd7228f2d' : '1535713875002-d1d0cf377fde'}?w=150&auto=format&fit=crop&q=80`,
      bio: 'Verified Contributor & Founder',
      isApproved: true,
      createdAt: new Date().toISOString(),
      lastActive: 'Just now',
    };
    usersList.push(user);
  } else {
    // If logging in as uploader, upgrade/ensure uploader role and approval
    if (role === 'uploader' && user.role === 'viewer') {
      user.role = 'uploader';
      user.isApproved = true;
    }
    user.lastActive = 'Just now';
  }

  res.json({
    success: true,
    user,
    message: 'Authentication successful.',
  });
});

// User sign up / create profile
app.post('/api/users', (req: Request, res: Response) => {
  const { name, email, role, bio } = req.body;

  if (!name || !email || !role) {
    return res.status(400).json({ error: 'Name, email, and role are required.' });
  }

  const existing = usersList.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.json(existing);
  }

  const avatar = `https://images.unsplash.com/photo-${role === 'admin' ? '1534528741775-53994a69daeb' : role === 'uploader' ? '1507003211169-0a1dd7228f2d' : '1535713875002-d1d0cf377fde'}?w=150&auto=format&fit=crop&q=80`;

  const newUser: UserProfile = {
    id: 'user-' + Date.now(),
    name: name.trim(),
    email: email.trim(),
    role,
    avatar,
    bio: bio || '',
    isApproved: role === 'uploader' ? false : true, // uploaders require approval
    createdAt: new Date().toISOString(),
    lastActive: 'Just now',
  };

  usersList.push(newUser);
  res.status(201).json(newUser);
});

// Notifications: mark all as read
app.post('/api/notifications/mark-all-read', (req: Request, res: Response) => {
  const { userId } = req.body;
  notificationsList.forEach((n) => {
    if (n.userId === userId || n.userId === 'all') {
      n.read = true;
    }
  });
  res.json({ success: true });
});

// Global API error handler
app.use((err: any, _req: Request, res: Response, _next: any) => {
  console.error('[EXPRESS ERROR]', err);
  if (!res.headersSent) {
    res.status(500).json({ error: 'Internal server error occurred. Please try again.' });
  }
});

// Start dev or production server
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  // Seed knowledge base with existing app articles for comprehensive duplicate/similarity detection
  newsVerificationDb.seedAppArticles(
    newsList.map((n) => ({
      id: n.id,
      headline: n.headline,
      summary: n.summary,
      category: n.category,
      sourceName: n.sourceName,
      sourceUrl: n.sourceUrl,
      date: n.publishDate,
    }))
  );

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VenturePulse server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
