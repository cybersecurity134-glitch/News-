/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SourceOfficialType =
  | 'government'
  | 'regulator'
  | 'company_announcement'
  | 'court_document'
  | 'official_report'
  | 'recognized_news'
  | 'community_submitted';

export type VerificationStatusType =
  | 'verified'
  | 'needs_review'
  | 'could_not_verify'
  | 'potentially_misleading'
  | 'duplicate_already_covered';

export type SimilarityClassificationType =
  | 'new_story'
  | 'existing_update'
  | 'duplicate'
  | 'needs_human_review';

export type ReviewStatusType =
  | 'draft'
  | 'pending_verification'
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'merged'
  | 'published_as_update'
  | 'correction_requested';

export interface NewsMediaItem {
  id: string;
  submissionId?: string;
  type: 'image' | 'video' | 'document' | 'text';
  source: 'camera_photo' | 'upload_image' | 'upload_video' | 'pasted_text';
  filename: string;
  mimeType: string;
  sizeBytes: number;
  dataUrl: string; // base64 or object URL
  thumbnailUrl?: string;
  ocrResult?: {
    rawText: string;
    cleanedText: string;
    confidence: number;
    detectedLanguage: string;
  };
  safetyScan?: {
    isClean: boolean;
    flags: string[];
    riskScore: number;
  };
  uploadedAt: string;
}

export interface ExtractedEntities {
  headline: string;
  category: string;
  people: string[];
  organizations: string[];
  locations: string[];
  dates: string[];
  governmentSchemes: string[];
  companies: string[];
  numbers: string[];
  cleanedText: string;
  summary: string;
  rawOcrText?: string;
}

export interface VerificationCheckItem {
  status: boolean;
  score: number; // 0 - 100
  evidence: string;
  notes?: string;
}

export interface SourceVerificationRecord {
  name: string;
  url: string;
  domain: string;
  isPrimary: boolean;
  trustScore: number; // 0 - 100
  officialType: SourceOfficialType;
  retrievedAt: string;
  publicationDate?: string;
  author?: string;
  originalHeadline?: string;
  httpStatus: number;
  resolves: boolean;
}

export interface NewsVerificationReport {
  id: string;
  submissionId: string;
  headline: string;
  category: string;
  date: string;
  location: string;
  mainClaim: string;
  sourcesChecked: SourceVerificationRecord[];
  verificationStatus: VerificationStatusType;
  checks: {
    eventExists: VerificationCheckItem;
    dateAccurate: VerificationCheckItem;
    locationAccurate: VerificationCheckItem;
    entitiesAccurate: VerificationCheckItem;
    numbersSupported: VerificationCheckItem;
    headlineAccurate: VerificationCheckItem;
    recencyStatus: VerificationCheckItem;
    contentIntegrity: VerificationCheckItem;
  };
  duplicateSimilarity: number; // 0 - 100
  existingRelatedStories: {
    id: string;
    headline: string;
    similarity: number;
    isUpdateCandidate?: boolean;
  }[];
  conflictingInformation: string[];
  missingInformation: string[];
  aiConfidence: number; // 0 - 100
  aiConfidenceDisclaimer: string;
  humanReviewRequired: boolean;
  humanReviewReasons: string[];
  verifiedAt: string;
}

export interface NewsSimilarityMatch {
  id: string;
  submissionId: string;
  matchedArticleId: string;
  matchedHeadline: string;
  matchedSummary: string;
  matchedDate: string;
  semanticScore: number; // 0 - 100
  lexicalScore: number;
  entityOverlapScore: number;
  detectedType: SimilarityClassificationType;
  novelPointsFound: string[];
  sharedPoints: string[];
  explanation: string;
}

export interface ContentSafetyScan {
  isClean: boolean;
  suspicious: boolean;
  manipulatedScreenshotDetected: boolean;
  spamDetected: boolean;
  piiDetected: boolean;
  hateOrAbusiveDetected: boolean;
  explicitDetected: boolean;
  malwareOrPhishingUrlDetected: boolean;
  flags: string[];
  recommendation: 'allow' | 'human_review' | 'reject';
}

export interface NewsUpdateRecord {
  id: string;
  parentArticleId: string;
  submissionId: string;
  updateHeadline: string;
  updateContent: string;
  novelInformation: string[];
  publishedAt: string;
  authorName: string;
  sourceUrl?: string;
  sourceName?: string;
}

export interface NewsSubmission {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  createdAt: string;
  updatedAt: string;
  mediaList: NewsMediaItem[];
  extractedEntities: ExtractedEntities;
  editedHeadline: string;
  editedCategory: string;
  editedSummary: string;
  editedFullStory: string;
  editedLocation: string;
  editedDate: string;
  sourceName: string;
  sourceUrl: string;
  sourceRecord?: SourceVerificationRecord;
  safetyScan: ContentSafetyScan;
  verificationStatus: VerificationStatusType;
  verificationReport?: NewsVerificationReport;
  similarityScore: number;
  classification: SimilarityClassificationType;
  matchingMatches?: NewsSimilarityMatch[];
  reviewStatus: ReviewStatusType;
  reviewerId?: string;
  reviewerName?: string;
  reviewerNotes?: string;
  reviewedAt?: string;
  publishedArticleId?: string;
  userCorrectionRequest?: string;
}

export interface VerifiedArticle {
  id: string;
  headline: string;
  summary: string;
  fullStory?: string;
  category: string;
  categoryLabel: string;
  publishedAt: string;
  location?: string;
  source: {
    name: string;
    url: string;
    tier: 'Tier 1' | 'Tier 2' | 'Tier 3';
    domain: string;
    verifiedAt: string;
  };
  additionalSources?: {
    name: string;
    url: string;
    tier: 'Tier 1' | 'Tier 2' | 'Tier 3';
    domain: string;
    verifiedAt: string;
  }[];
  companiesMentioned: string[];
  investorsMentioned?: string[];
  fundingAmount?: string;
  fundingRound?: string;
  entities?: ExtractedEntities;
  imageUrl?: string;
  mediaIds?: string[];
  verificationStatus: string;
  updates?: NewsUpdateRecord[];
  submissionId?: string;
}

export interface NewsReviewActionPayload {
  submissionId: string;
  action: 'approve' | 'reject' | 'request_correction' | 'merge' | 'publish_update';
  notes?: string;
  targetArticleId?: string;
  correctionInstructions?: string;
  updatedHeadline?: string;
  updatedCategory?: string;
  updatedSummary?: string;
}
