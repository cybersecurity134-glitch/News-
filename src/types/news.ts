/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CategoryType =
  | 'all'
  | 'national'
  | 'international'
  | 'economy'
  | 'science-tech'
  | 'defence'
  | 'environment'
  | 'government'
  | 'education'
  | 'sports'
  | 'events';

export interface CategoryMeta {
  id: CategoryType;
  label: string;
  shortLabel: string;
  iconName: string;
  accentColor: string;
  description: string;
}

export interface NewsArticle {
  id: string;
  headline: string;
  summary: string;
  content: string;
  category: CategoryType;
  categoryLabel: string;
  source: string;
  sourceUrl?: string;
  publishedAt: string;
  readTimeMinutes: number;
  imageUrl: string;
  isBreaking?: boolean;
  isFeatured?: boolean;
  keyFacts: string[];
  tags: string[];
  relatedIds?: string[];
  author?: string;
}

export interface CurrentAffairsFact {
  id: string;
  headline: string;
  context: string;
  category: CategoryType;
  date: string;
  source: string;
  importance: 'High' | 'Crucial' | 'Essential';
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  domain: string;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
}

export interface DailyQuiz {
  id: string;
  title: string;
  date: string;
  description: string;
  questions: QuizQuestion[];
  estimatedMinutes: number;
}

export interface UserStats {
  articlesRead: number;
  quizzesCompleted: number;
  totalScore: number;
  streakDays: number;
  lastReadDate: string;
  bookmarkedArticles: string[];
  readingHistory: string[];
  completedQuizIds: string[];
}

export type ThemeOption = 'light' | 'dark' | 'system';
export type ColorPalette =
  | 'royal'
  | 'emerald'
  | 'amethyst'
  | 'orange'
  | 'bordeaux'
  | 'graphite'
  | 'obsidian'
  | 'custom';
export type FontStyle = 'classic-editorial' | 'executive-sans';
export type TextSizeOption = 'normal' | 'large' | 'huge';
