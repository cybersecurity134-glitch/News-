/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Category =
  | 'new-startups'
  | 'new-schemes'
  | 'funding-routes'
  | 'investor-activity'
  | 'startup-events'
  | 'emerging-problems'
  | 'new-startup'
  | 'scheme'
  | 'funding-route'
  | 'event'
  | 'emerging-problem';

export interface NewsItem {
  id: string;
  category: Category;
  headline: string;
  summary?: string;
  sourceUrl: string;
  sourceName: string;
  publishDate?: string;
  publishedAt?: string;
  imageUrl?: string;
  uploadedBy?: string;
  uploader?: {
    id: string;
    name: string;
    role: string;
  };
  status: 'pending' | 'approved' | 'rejected';

  // Card specialized fields
  fundingAmount?: string;
  fundingRound?: string;
  investors?: string[];

  eventDate?: string;
  eventVenue?: string;
  eventCalendarUrl?: string;

  schemeOfferedBy?: string;
  schemeDeadline?: string;
  schemeApplyUrl?: string;

  problemContext?: string;
  fixSolution?: string;

  automatedCheck?: {
    urlResolves: boolean;
    dateRecent: boolean;
    categoryMatch: boolean;
    flagged: boolean;
    flagReasons: string[];
    httpStatus?: number;
  };
  rejectionReason?: string;
  moderationNotes?: string;
  createdAt?: string;
  sourceType?: string;
}

export interface StartupEvent {
  id: string;
  name: string;
  date?: string;
  dateTime?: string;
  location?: string;
  venue?: string;
  organizer: string;
  registrationUrl?: string;
  sourceUrl?: string;
  type?: 'pitch-day' | 'demo-day' | 'expo' | 'accelerator-deadline';
  description?: string;
  isOnline?: boolean;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  role: 'viewer' | 'uploader' | 'admin';
  avatarUrl?: string;
  avatar?: string;
  bio?: string;
  isApproved?: boolean;
  emailVerified?: boolean;
  lastActive?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  text?: string;
  timestamp?: string;
  createdAt?: string;
  sentAt?: string;
  read?: boolean;
}

export interface ChatThread {
  id: string;
  partner: User;
  lastMessage: ChatMessage;
  unreadCount: number;
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
    tab?: 'feed' | 'events' | 'upload' | 'chat' | 'admin' | 'queue' | 'profile';
    itemId?: string;
    chatWithUserId?: string;
  };
}
