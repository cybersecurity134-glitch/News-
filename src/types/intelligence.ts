/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SourceTier = 'Tier 1' | 'Tier 2' | 'Tier 3';

export type VerificationStatus =
  | 'Verified by multiple sources'
  | 'Reported by one source'
  | 'Conflicting reports';

export type NewsCategory =
  | 'all'
  | 'funding'
  | 'startup-launches'
  | 'investors'
  | 'government-schemes'
  | 'opportunities'
  | 'events'
  | 'problems'
  | 'technology'
  | 'regulations'
  | 'acquisitions';

export type FundingStage =
  | 'Pre-seed'
  | 'Seed'
  | 'Angel'
  | 'Series A'
  | 'Series B'
  | 'Series C'
  | 'Series D+'
  | 'Venture Debt'
  | 'Grant'
  | 'Strategic';

export type RegionScope =
  | 'India'
  | 'Telangana'
  | 'Karnataka'
  | 'Maharashtra'
  | 'Tamil Nadu'
  | 'Delhi NCR'
  | 'Andhra Pradesh'
  | 'Gujarat'
  | 'Kerala'
  | 'USA'
  | 'Europe'
  | 'Asia'
  | 'Global';

export interface SourceMeta {
  name: string;
  url: string;
  tier: SourceTier;
  domain: string;
  publishedAt: string;
  verifiedAt: string;
}

export interface NewsEventItem {
  id: string;
  headline: string;
  summary: string;
  publishedAt: string;
  category: NewsCategory;
  categoryLabel: string;
  source: SourceMeta;
  additionalSources?: SourceMeta[];
  verificationStatus: VerificationStatus;
  conflictNotes?: string;
  companiesMentioned: string[];
  investorsMentioned?: string[];
  fundingAmount?: string;
  fundingRound?: FundingStage;
  geography: {
    country: string;
    state?: string;
    city?: string;
  };
  sector: string;
  imageUrl?: string;
  keyFacts?: string[];
  isBreaking?: boolean;
}

export interface StartupEntity {
  id: string;
  name: string;
  founders: string[];
  foundingYear?: number;
  country: string;
  city: string;
  industry: string;
  productService: string;
  problemSolved: string;
  businessModel?: string;
  fundingStage: FundingStage;
  fundingAmountReported?: string;
  investors: string[];
  officialWebsite: string;
  source: SourceMeta;
  timeline: {
    date: string;
    milestone: string;
    sourceName: string;
    sourceUrl: string;
  }[];
}

export interface FundingEvent {
  id: string;
  startupName: string;
  amount: string;
  currency: string;
  round: FundingStage;
  date: string;
  leadInvestor: string;
  allInvestors: string[];
  sector: string;
  location: string;
  source: SourceMeta;
  intendedUseReported?: string;
  verificationStatus: VerificationStatus;
}

export interface InvestorProfile {
  id: string;
  name: string;
  type: 'Venture Capital' | 'Angel Network' | 'Corporate VC' | 'Government Fund' | 'Accelerator';
  geography: string;
  fundingStages: FundingStage[];
  preferredSectors: string[];
  announcedFundSize?: string;
  recentInvestments: {
    startup: string;
    round: FundingStage;
    amount: string;
    date: string;
    sector: string;
    sourceName: string;
    sourceUrl: string;
  }[];
  officialWebsite: string;
  source: SourceMeta;
}

export interface GovernmentScheme {
  id: string;
  name: string;
  ministryOrDepartment: string;
  level: 'Central Government' | 'State Government' | 'International';
  state?: string;
  country: string;
  supportType: 'Grant' | 'Tax Exemption' | 'Subsidized Loan' | 'Incubation & Seed' | 'Procurement';
  supportAmountReported: string;
  eligibility: string[];
  applicationDeadline: string;
  officialPortalUrl: string;
  announcementDate: string;
  source: SourceMeta;
  isActive: boolean;
}

export interface FundingOpportunity {
  id: string;
  name: string;
  organization: string;
  type: 'Grant' | 'Accelerator' | 'Incubator' | 'Competition' | 'Fellowship';
  stage: FundingStage[];
  sector: string;
  fundingSupport: string;
  deadline: string;
  location: string;
  officialApplyUrl: string;
  announcedDate: string;
  source: SourceMeta;
  isActive: boolean;
}

export interface StartupEventItem {
  id: string;
  name: string;
  date: string;
  time?: string;
  venue: string;
  city: string;
  country: string;
  format: 'Offline' | 'Online' | 'Hybrid';
  organizer: string;
  registrationDeadline: string;
  ticketType: 'Free' | 'Paid' | 'By Invite';
  pitchOpportunity: boolean;
  registrationUrl: string;
  source: SourceMeta;
}

export interface ReportedProblem {
  id: string;
  problemTitle: string;
  problemDescription: string;
  category: 'Funding' | 'Regulatory' | 'Infrastructure & AI Compute' | 'Talent & Hiring' | 'Compliance' | 'Market Demand';
  startupsAffected: string[];
  sector: string;
  geography: string;
  reportedDate: string;
  source: SourceMeta;
  sourceReportedSolution?: string;
  aiSuggestedSolution?: string;
}

export interface UserPreferences {
  country: string;
  state: string;
  city: string;
  startupStage: FundingStage;
  industry: string;
  fundingRequirement: string;
  interests: string[];
  onboardingCompleted: boolean;
}

export interface AlertRule {
  id: string;
  label: string;
  keyword: string;
  category?: NewsCategory;
  geography?: string;
  minAmount?: string;
  createdAt: string;
  active: boolean;
}

export interface AdminSystemStatus {
  monitoredSourcesCount: number;
  activeWorkingSources: number;
  unavailableSources: number;
  totalArticlesCollected: number;
  duplicatesDetectedAndGrouped: number;
  lastSuccessfulUpdate: string;
  sourceHealth: {
    name: string;
    domain: string;
    tier: SourceTier;
    status: 'Operational' | 'Degraded' | 'Offline';
    lastChecked: string;
    articlesCount: number;
  }[];
}
