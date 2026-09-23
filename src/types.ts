/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type NewsCategory =
  | 'new-startups'
  | 'new-schemes'
  | 'funding-routes'
  | 'investor-activity'
  | 'startup-events'
  | 'emerging-problems';

export interface CategoryMeta {
  id: NewsCategory;
  name: string;
  chipLabel: string;
  description: string;
  lightColor: string;
  darkColor: string;
  badgeBgLight: string;
  badgeBgDark: string;
}

export const CATEGORIES: Record<NewsCategory, CategoryMeta> = {
  'new-startups': {
    id: 'new-startups',
    name: 'Startups',
    chipLabel: 'Startups',
    description: 'Launches, spin-outs, and new tech company announcements',
    lightColor: '#4338CA',
    darkColor: '#A5A0FF',
    badgeBgLight: 'rgba(67, 56, 202, 0.14)',
    badgeBgDark: 'rgba(165, 160, 255, 0.14)',
  },
  'new-schemes': {
    id: 'new-schemes',
    name: 'Schemes',
    chipLabel: 'Schemes',
    description: 'Government grants, institutional programs, and innovation subsidies',
    lightColor: '#0F766E',
    darkColor: '#4FD1B5',
    badgeBgLight: 'rgba(15, 118, 110, 0.14)',
    badgeBgDark: 'rgba(79, 209, 181, 0.14)',
  },
  'funding-routes': {
    id: 'funding-routes',
    name: 'Funding',
    chipLabel: 'Funding',
    description: 'Financing rounds, debt terms, grants, SAFE notes, and dilution benchmarks',
    lightColor: '#A16207',
    darkColor: '#F5C04A',
    badgeBgLight: 'rgba(161, 98, 7, 0.14)',
    badgeBgDark: 'rgba(245, 192, 74, 0.14)',
  },
  'investor-activity': {
    id: 'investor-activity',
    name: 'Investors',
    chipLabel: 'Investors',
    description: 'Institutional lead partners, syndicates, and portfolio deployment',
    lightColor: '#7E22CE',
    darkColor: '#D6A6FF',
    badgeBgLight: 'rgba(126, 34, 206, 0.14)',
    badgeBgDark: 'rgba(214, 166, 255, 0.14)',
  },
  'startup-events': {
    id: 'startup-events',
    name: 'Events',
    chipLabel: 'Events',
    description: 'Pitch days, demo days, hackathons, and founder conferences',
    lightColor: '#C2410C',
    darkColor: '#FF9A72',
    badgeBgLight: 'rgba(194, 65, 12, 0.14)',
    badgeBgDark: 'rgba(255, 154, 114, 0.14)',
  },
  'emerging-problems': {
    id: 'emerging-problems',
    name: 'Problems and fixes',
    chipLabel: 'Fixes',
    description: 'Critical founder bottlenecks, cost crises, and validated engineering fixes',
    lightColor: '#1D4ED8',
    darkColor: '#7DB4FF',
    badgeBgLight: 'rgba(29, 78, 216, 0.14)',
    badgeBgDark: 'rgba(125, 180, 255, 0.14)',
  },
};

export type UserRole = 'viewer' | 'uploader' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  bio?: string;
  isApproved?: boolean; // For uploaders: required admin approval status
  emailVerified?: boolean; // Uploader first-login email verified status
  password?: string;
  createdAt: string;
  lastActive?: string;
}

export interface OtpChallenge {
  id: string;
  userId: string;
  codeHash: string;
  expiresAt: string;
  attempts: number;
  maxAttempts: number;
  consumed: boolean;
  createdAt?: number;
}

export interface AutomatedCheckResult {
  urlResolves: boolean;
  dateRecent: boolean;
  categoryMatch: boolean;
  flagged: boolean;
  flagReasons: string[];
  checkedAt: string;
  httpStatus?: number;
}

export interface NewsItem {
  id: string;
  category: NewsCategory;
  headline: string;
  sourceName: string;
  sourceUrl: string;
  publishDate: string;
  summary: string;
  imageUrl?: string;
  uploader: {
    id: string;
    name: string;
    role: UserRole | 'automated';
  };
  status: 'approved' | 'pending' | 'rejected';
  
  // Specialized card attributes for custom card types:
  // 1. Funding Card
  fundingAmount?: string;      // e.g. "$62M", "€18M"
  fundingRound?: string;       // e.g. "Series B", "Seed", "Venture Debt"
  investors?: string[];        // e.g. ["Sequoia Capital", "Andreessen Horowitz"]

  // 2. Event Card
  eventDate?: string;          // e.g. "Oct 14-16, 2026"
  eventVenue?: string;         // e.g. "San Francisco, CA & Livestream"
  eventCalendarUrl?: string;   // e.g. calendar/registration link

  // 3. Scheme Card
  schemeOfferedBy?: string;    // e.g. "European Innovation Council", "US SBA"
  schemeDeadline?: string;     // e.g. "Rolling / Nov 30, 2026"
  schemeApplyUrl?: string;     // application link

  // 4. Problem & Fix Card
  problemContext?: string;     // Problem description & quote
  fixSolution?: string;        // Solution & engineering workaround

  automatedCheck?: AutomatedCheckResult;
  moderationNotes?: string;
  rejectionReason?: string;
  createdAt: string;
  sourceType: 'automated-ingestion' | 'contributor-submission';
}

export interface StartupEvent {
  id: string;
  name: string;
  dateTime: string;
  venue: string;
  organizer: string;
  sourceUrl: string;
  description: string;
  type: 'pitch-day' | 'demo-day' | 'expo' | 'accelerator-deadline';
  isOnline: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  type: 'chat' | 'news_approved' | 'uploader_approved' | 'system';
  linkTarget?: {
    tab: 'feed' | 'events' | 'chat' | 'queue' | 'profile';
    itemId?: string;
    chatWithUserId?: string;
  };
}

export interface AppStateData {
  news: NewsItem[];
  events: StartupEvent[];
  users: UserProfile[];
  messages: ChatMessage[];
  notifications: AppNotification[];
  adminUploadCode: string;
}
