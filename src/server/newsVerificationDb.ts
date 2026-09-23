/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  NewsSubmission,
  VerifiedArticle,
  NewsMediaItem,
  NewsVerificationReport,
  NewsSimilarityMatch,
  NewsUpdateRecord,
  SourceVerificationRecord,
  NewsReviewActionPayload,
} from '../types/newsVerification.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'news_verification_database.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface VerificationDatabaseSchema {
  version: number;
  updatedAt: string;
  submissions: NewsSubmission[];
  articles: VerifiedArticle[];
  media: NewsMediaItem[];
  sources: SourceVerificationRecord[];
  reviews: {
    id: string;
    submissionId: string;
    reviewerId: string;
    reviewerName: string;
    action: string;
    notes?: string;
    targetArticleId?: string;
    timestamp: string;
  }[];
}

// Initial Seed Primary Sources Directory
const SEED_SOURCES: SourceVerificationRecord[] = [
  {
    name: 'Startup India Portal',
    url: 'https://www.startupindia.gov.in',
    domain: 'startupindia.gov.in',
    isPrimary: true,
    trustScore: 99,
    officialType: 'government',
    retrievedAt: new Date().toISOString(),
    publicationDate: '2026-09-01',
    author: 'DPIIT Ministry of Commerce',
    originalHeadline: 'Official Startup India Seed Fund Portal',
    httpStatus: 200,
    resolves: true,
  },
  {
    name: 'Ministry of Electronics and Information Technology (MeitY)',
    url: 'https://www.meity.gov.in',
    domain: 'meity.gov.in',
    isPrimary: true,
    trustScore: 99,
    officialType: 'government',
    retrievedAt: new Date().toISOString(),
    publicationDate: '2026-09-15',
    author: 'Government of India',
    originalHeadline: 'MeitY Startup Hub Digital Transformation Schemes',
    httpStatus: 200,
    resolves: true,
  },
  {
    name: 'Reserve Bank of India (RBI)',
    url: 'https://www.rbi.org.in',
    domain: 'rbi.org.in',
    isPrimary: true,
    trustScore: 100,
    officialType: 'regulator',
    retrievedAt: new Date().toISOString(),
    publicationDate: '2026-09-20',
    author: 'Department of Regulation, RBI',
    originalHeadline: 'Digital Currency and Cross-Border FinTech Guidelines',
    httpStatus: 200,
    resolves: true,
  },
  {
    name: 'European Innovation Council (EIC)',
    url: 'https://eic.ec.europa.eu',
    domain: 'eic.ec.europa.eu',
    isPrimary: true,
    trustScore: 98,
    officialType: 'government',
    retrievedAt: new Date().toISOString(),
    publicationDate: '2026-09-10',
    author: 'European Commission',
    originalHeadline: 'EIC Accelerator Deep Tech Funding Windows',
    httpStatus: 200,
    resolves: true,
  },
  {
    name: 'U.S. Securities and Exchange Commission (EDGAR)',
    url: 'https://www.sec.gov/edgar',
    domain: 'sec.gov',
    isPrimary: true,
    trustScore: 100,
    officialType: 'court_document',
    retrievedAt: new Date().toISOString(),
    author: 'SEC Division of Corporation Finance',
    originalHeadline: 'Public Company and Venture Form D Filings',
    httpStatus: 200,
    resolves: true,
  },
  {
    name: 'Reuters Technology & Business',
    url: 'https://www.reuters.com/technology',
    domain: 'reuters.com',
    isPrimary: true,
    trustScore: 95,
    officialType: 'recognized_news',
    retrievedAt: new Date().toISOString(),
    publicationDate: '2026-09-22',
    author: 'Reuters Global Tech Desk',
    originalHeadline: 'Global Venture Capital and Semiconductor Briefing',
    httpStatus: 200,
    resolves: true,
  },
];

// Initial Seed Verified Articles
const SEED_ARTICLES: VerifiedArticle[] = [
  {
    id: 'art-001',
    headline: 'Central Bank unveils Universal Digital Currency Cross-Border Protocol with 14 economies',
    summary: 'The Central Bank Settlement Network has successfully executed its first $500M live institutional settlement with 14 partner economies in under 1.2 seconds.',
    fullStory: 'In a landmark joint declaration today, the Central Bank along with 14 international monetary authorities unveiled the Universal Digital Currency Cross-Border Protocol. Built on quantum-resilient cryptography, the protocol drastically cuts cross-border foreign exchange settlement times from 3 business days to under 1.2 seconds while enforcing strict statutory compliance.',
    category: 'funding',
    categoryLabel: 'Financial Infrastructure',
    publishedAt: '2026-09-22T08:30:00.000Z',
    location: 'Mumbai & Zurich',
    source: {
      name: 'Reserve Bank of India',
      url: 'https://www.rbi.org.in/press/2026-digital-settlement',
      tier: 'Tier 1',
      domain: 'rbi.org.in',
      verifiedAt: '2026-09-22T09:00:00.000Z',
    },
    companiesMentioned: ['Central Bank Network', 'Universal FX Hub', 'Swift Global'],
    verificationStatus: 'Verified by multiple primary regulatory sources',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80',
    updates: [],
  },
  {
    id: 'art-002',
    headline: 'Government announces ₹10,000 Crore DeepTech Startup Fund of Funds Scheme',
    summary: 'Department for Promotion of Industry and Internal Trade launches flagship equity co-investment scheme targeting semiconductor design, robotics, and generative AI startups.',
    fullStory: 'The Union Cabinet has officially ratified the ₹10,000 Crore DeepTech Seed and Growth Fund of Funds. The scheme commits non-dilutive grant capital alongside registered venture capital syndicates for Indian startups developing intellectual property in high-complexity sectors.',
    category: 'government-schemes',
    categoryLabel: 'Government Scheme',
    publishedAt: '2026-09-18T11:00:00.000Z',
    location: 'New Delhi, India',
    source: {
      name: 'Startup India Portal',
      url: 'https://www.startupindia.gov.in/schemes/deeptech-2026',
      tier: 'Tier 1',
      domain: 'startupindia.gov.in',
      verifiedAt: '2026-09-18T12:00:00.000Z',
    },
    companiesMentioned: ['Startup India', 'DPIIT', 'SIDBI'],
    verificationStatus: 'Verified by official Gazette Notification',
    imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&auto=format&fit=crop&q=80',
    updates: [
      {
        id: 'upd-001',
        parentArticleId: 'art-002',
        submissionId: 'sub-sample-0',
        updateHeadline: 'SIDBI releases portal link and initial list of 12 accredited VC syndicates',
        updateContent: 'SIDBI published the live application portal alongside 12 shortlisted venture syndicate partners eligible for 2:1 capital matching.',
        novelInformation: ['Portal live at sidbi.in/deeptech-syndicate', '12 institutional VCs confirmed for 2:1 matching'],
        publishedAt: '2026-09-20T14:00:00.000Z',
        authorName: 'Elena Rostova (Editor)',
        sourceUrl: 'https://www.startupindia.gov.in/schemes/deeptech-2026/partners',
        sourceName: 'SIDBI Official Circular',
      },
    ],
  },
  {
    id: 'art-003',
    headline: 'Aetheris AI Closes $48 Million Series A to Scale Neuromorphic Inference Hardware',
    summary: 'Bengaluru and Silicon Valley based silicon startup Aetheris AI announces $48M Series A led by Lightspeed and Khosla Ventures to tape out 2nm edge processors.',
    fullStory: 'Aetheris AI, founded by former Apple and TSMC lead architects, has finalized a $48 Million Series A round. The capital expenditure will fund commercial foundry access for their 2nm neuromorphic microarchitecture, boasting 85% reduced energy dissipation for LLM token inference.',
    category: 'funding',
    categoryLabel: 'Venture Funding',
    publishedAt: '2026-09-21T06:00:00.000Z',
    location: 'Bengaluru, India',
    source: {
      name: 'TechCrunch',
      url: 'https://techcrunch.com/2026/09/21/aetheris-ai-series-a-48m',
      tier: 'Tier 1',
      domain: 'techcrunch.com',
      verifiedAt: '2026-09-21T07:00:00.000Z',
    },
    companiesMentioned: ['Aetheris AI', 'Lightspeed Venture Partners', 'Khosla Ventures', 'TSMC'],
    investorsMentioned: ['Lightspeed', 'Khosla Ventures'],
    fundingAmount: '$48,000,000',
    fundingRound: 'Series A',
    verificationStatus: 'Verified by primary investor statement & SEC Form D',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    updates: [],
  },
];

class NewsVerificationDbService {
  private db: VerificationDatabaseSchema;

  constructor() {
    this.db = this.loadDatabase();
  }

  private loadDatabase(): VerificationDatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.submissions) && Array.isArray(parsed.articles)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('[NEWS DB] Failed to load database file, creating fresh seed:', e);
    }

    const initialDb: VerificationDatabaseSchema = {
      version: 1,
      updatedAt: new Date().toISOString(),
      submissions: [],
      articles: [...SEED_ARTICLES],
      media: [],
      sources: [...SEED_SOURCES],
      reviews: [],
    };

    this.persist(initialDb);
    return initialDb;
  }

  private persist(dataToSave?: VerificationDatabaseSchema) {
    try {
      const data = dataToSave || this.db;
      data.updatedAt = new Date().toISOString();
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[NEWS DB] Failed to persist database:', err);
    }
  }

  // ==========================================
  // SUBMISSIONS
  // ==========================================
  public createSubmission(submission: NewsSubmission): NewsSubmission {
    this.db.submissions.unshift(submission);
    this.persist();
    return submission;
  }

  public getSubmissionById(id: string): NewsSubmission | undefined {
    return this.db.submissions.find((s) => s.id === id);
  }

  public updateSubmission(id: string, updates: Partial<NewsSubmission>): NewsSubmission | null {
    const idx = this.db.submissions.findIndex((s) => s.id === id);
    if (idx === -1) return null;

    this.db.submissions[idx] = {
      ...this.db.submissions[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    return this.db.submissions[idx];
  }

  public listSubmissions(filter?: {
    userId?: string;
    reviewStatus?: string;
    verificationStatus?: string;
    classification?: string;
  }): NewsSubmission[] {
    let result = [...this.db.submissions];
    if (filter?.userId) {
      result = result.filter((s) => s.userId === filter.userId);
    }
    if (filter?.reviewStatus && filter.reviewStatus !== 'all') {
      result = result.filter((s) => s.reviewStatus === filter.reviewStatus);
    }
    if (filter?.verificationStatus && filter.verificationStatus !== 'all') {
      result = result.filter((s) => s.verificationStatus === filter.verificationStatus);
    }
    if (filter?.classification && filter.classification !== 'all') {
      result = result.filter((s) => s.classification === filter.classification);
    }
    return result;
  }

  // ==========================================
  // ARTICLES
  // ==========================================
  public listArticles(): VerifiedArticle[] {
    return [...this.db.articles];
  }

  public getArticleById(id: string): VerifiedArticle | undefined {
    return this.db.articles.find((a) => a.id === id);
  }

  public publishArticleFromSubmission(submission: NewsSubmission, reviewerId: string, reviewerName: string): VerifiedArticle {
    const newArticleId = 'art-' + Date.now();
    const newArticle: VerifiedArticle = {
      id: newArticleId,
      headline: submission.editedHeadline || submission.extractedEntities.headline,
      summary: submission.editedSummary || submission.extractedEntities.summary,
      fullStory: submission.editedFullStory || submission.extractedEntities.cleanedText,
      category: submission.editedCategory || submission.extractedEntities.category || 'funding',
      categoryLabel: (submission.editedCategory || 'General Intelligence').toUpperCase(),
      publishedAt: new Date().toISOString(),
      location: submission.editedLocation || submission.extractedEntities.locations?.[0] || 'Global',
      source: {
        name: submission.sourceName || 'Verified Primary Contributor',
        url: submission.sourceUrl || '#',
        tier: submission.sourceRecord?.isPrimary ? 'Tier 1' : 'Tier 2',
        domain: submission.sourceRecord?.domain || 'verified-source.org',
        verifiedAt: new Date().toISOString(),
      },
      companiesMentioned: submission.extractedEntities.companies || [],
      entities: submission.extractedEntities,
      imageUrl: submission.mediaList?.[0]?.dataUrl || undefined,
      verificationStatus: 'Verified by Editorial Desk & Primary Sources',
      submissionId: submission.id,
      updates: [],
    };

    this.db.articles.unshift(newArticle);

    // Update submission status
    submission.reviewStatus = 'approved';
    submission.publishedArticleId = newArticleId;
    submission.reviewerId = reviewerId;
    submission.reviewerName = reviewerName;
    submission.reviewedAt = new Date().toISOString();

    this.persist();
    return newArticle;
  }

  public publishArticleUpdate(parentArticleId: string, submission: NewsSubmission, reviewerId: string, reviewerName: string, customNotes?: string): NewsUpdateRecord | null {
    const article = this.db.articles.find((a) => a.id === parentArticleId);
    if (!article) return null;

    const updateRecord: NewsUpdateRecord = {
      id: 'upd-' + Date.now(),
      parentArticleId,
      submissionId: submission.id,
      updateHeadline: submission.editedHeadline || submission.extractedEntities.headline,
      updateContent: submission.editedSummary || submission.extractedEntities.summary,
      novelInformation: submission.extractedEntities.numbers.length > 0
        ? submission.extractedEntities.numbers
        : [submission.editedSummary],
      publishedAt: new Date().toISOString(),
      authorName: reviewerName,
      sourceUrl: submission.sourceUrl,
      sourceName: submission.sourceName,
    };

    if (!article.updates) {
      article.updates = [];
    }
    article.updates.unshift(updateRecord);

    submission.reviewStatus = 'published_as_update';
    submission.publishedArticleId = parentArticleId;
    submission.reviewerId = reviewerId;
    submission.reviewerName = reviewerName;
    submission.reviewerNotes = customNotes || 'Published as factual update to existing story.';
    submission.reviewedAt = new Date().toISOString();

    this.persist();
    return updateRecord;
  }

  public mergeSubmissionIntoArticle(targetArticleId: string, submission: NewsSubmission, reviewerId: string, reviewerName: string, notes?: string): boolean {
    const article = this.db.articles.find((a) => a.id === targetArticleId);
    if (!article) return false;

    // Add company / entity references
    if (submission.extractedEntities.companies) {
      const mergedCompanies = Array.from(new Set([...article.companiesMentioned, ...submission.extractedEntities.companies]));
      article.companiesMentioned = mergedCompanies;
    }

    submission.reviewStatus = 'merged';
    submission.publishedArticleId = targetArticleId;
    submission.reviewerId = reviewerId;
    submission.reviewerName = reviewerName;
    submission.reviewerNotes = notes || `Merged into story: "${article.headline}"`;
    submission.reviewedAt = new Date().toISOString();

    this.persist();
    return true;
  }

  // ==========================================
  // MEDIA
  // ==========================================
  public saveMedia(media: NewsMediaItem): NewsMediaItem {
    this.db.media.unshift(media);
    this.persist();
    return media;
  }

  public getMediaById(id: string): NewsMediaItem | undefined {
    return this.db.media.find((m) => m.id === id);
  }

  // ==========================================
  // SOURCES DIRECTORY
  // ==========================================
  public listSources(): SourceVerificationRecord[] {
    return [...this.db.sources];
  }

  public findSourceByUrlOrDomain(urlOrDomain: string): SourceVerificationRecord | undefined {
    try {
      const domain = new URL(urlOrDomain.startsWith('http') ? urlOrDomain : `https://${urlOrDomain}`).hostname.replace('www.', '').toLowerCase();
      return this.db.sources.find((s) => s.domain.toLowerCase() === domain);
    } catch {
      return undefined;
    }
  }

  // ==========================================
  // REVIEWS & AUDIT
  // ==========================================
  public recordReviewAction(payload: NewsReviewActionPayload, reviewerId: string, reviewerName: string) {
    const reviewItem = {
      id: 'rev-' + Date.now(),
      submissionId: payload.submissionId,
      reviewerId,
      reviewerName,
      action: payload.action,
      notes: payload.notes || payload.correctionInstructions,
      targetArticleId: payload.targetArticleId,
      timestamp: new Date().toISOString(),
    };
    this.db.reviews.unshift(reviewItem);
    this.persist();
    return reviewItem;
  }

  public listReviews(submissionId?: string) {
    if (submissionId) {
      return this.db.reviews.filter((r) => r.submissionId === submissionId);
    }
    return [...this.db.reviews];
  }

  // Synchronize initial news articles from app data into the verification knowledge base
  public seedAppArticles(externalArticles: Array<{ id: string; headline: string; summary: string; category?: string; sourceName?: string; sourceUrl?: string; date?: string }>) {
    let added = 0;
    for (const ext of externalArticles) {
      if (!this.db.articles.some((a) => a.headline.toLowerCase().trim() === ext.headline.toLowerCase().trim())) {
        this.db.articles.push({
          id: ext.id,
          headline: ext.headline,
          summary: ext.summary,
          category: ext.category || 'funding',
          categoryLabel: (ext.category || 'Startup Intelligence').toUpperCase(),
          publishedAt: ext.date || new Date().toISOString(),
          source: {
            name: ext.sourceName || 'Primary Wire',
            url: ext.sourceUrl || '#',
            tier: 'Tier 1',
            domain: ext.sourceUrl ? new URL(ext.sourceUrl).hostname.replace('www.', '') : 'wire.com',
            verifiedAt: new Date().toISOString(),
          },
          companiesMentioned: [],
          verificationStatus: 'Verified by primary source index',
          updates: [],
        });
        added++;
      }
    }
    if (added > 0) {
      this.persist();
    }
  }
}

export const newsVerificationDb = new NewsVerificationDbService();
