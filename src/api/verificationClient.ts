/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ExtractedEntities,
  NewsVerificationReport,
  NewsSimilarityMatch,
  NewsSubmission,
  VerifiedArticle,
  SourceVerificationRecord,
  ContentSafetyScan,
  NewsReviewActionPayload,
} from '../types/newsVerification';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('vp_auth_session_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['x-session-token'] = token;
  }
  return headers;
}

export const verificationClient = {
  /**
   * Run OCR & Entity Extraction on media or text
   */
  async extractNews(payload: {
    dataUrl?: string;
    mimeType?: string;
    pastedText?: string;
    sourceUrl?: string;
  }): Promise<{ success: boolean; extracted: ExtractedEntities }> {
    const res = await fetch('/api/news-verification/extract', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Extraction failed' }));
      throw new Error(err.error || 'Failed to extract news');
    }
    return res.json();
  },

  /**
   * Run full verification & duplicate similarity check
   */
  async verifyNews(payload: {
    headline: string;
    summary: string;
    fullStory?: string;
    category?: string;
    date?: string;
    location?: string;
    sourceUrl?: string;
    mediaDataUrl?: string;
    entities?: ExtractedEntities;
  }): Promise<{
    success: boolean;
    report: NewsVerificationReport;
    similarityMatches: NewsSimilarityMatch[];
    overallStatus: NewsSubmission['verificationStatus'];
    classification: NewsSubmission['classification'];
    sourceRecord?: SourceVerificationRecord;
    safetyScan?: ContentSafetyScan;
  }> {
    const res = await fetch('/api/news-verification/verify', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Verification failed' }));
      throw new Error(err.error || 'Failed to verify news');
    }
    return res.json();
  },

  /**
   * Submit news for verification / human editorial review
   */
  async submitNews(payload: Partial<NewsSubmission>): Promise<{
    success: boolean;
    submission: NewsSubmission;
  }> {
    const res = await fetch('/api/news-verification/submissions', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Submission failed' }));
      throw new Error(err.error || 'Failed to submit news for verification');
    }
    return res.json();
  },

  /**
   * List submissions
   */
  async getSubmissions(query?: {
    reviewStatus?: string;
    verificationStatus?: string;
    classification?: string;
    myOnly?: boolean;
  }): Promise<{
    success: boolean;
    total: number;
    submissions: NewsSubmission[];
  }> {
    const params = new URLSearchParams();
    if (query?.reviewStatus) params.set('reviewStatus', query.reviewStatus);
    if (query?.verificationStatus) params.set('verificationStatus', query.verificationStatus);
    if (query?.classification) params.set('classification', query.classification);
    if (query?.myOnly) params.set('myOnly', 'true');

    const res = await fetch(`/api/news-verification/submissions?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      throw new Error('Failed to fetch submissions');
    }
    return res.json();
  },

  /**
   * Get single submission
   */
  async getSubmissionById(id: string): Promise<{ success: boolean; submission: NewsSubmission }> {
    const res = await fetch(`/api/news-verification/submissions/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      throw new Error('Failed to fetch submission details');
    }
    return res.json();
  },

  /**
   * Author edits submission after correction request
   */
  async updateSubmission(id: string, updates: any): Promise<{ success: boolean; submission: NewsSubmission }> {
    const res = await fetch(`/api/news-verification/submissions/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      throw new Error('Failed to update submission');
    }
    return res.json();
  },

  /**
   * Admin editorial review actions (approve, reject, request_correction, merge, publish_update)
   */
  async adminReview(payload: NewsReviewActionPayload): Promise<any> {
    const res = await fetch('/api/news-verification/admin/review', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Admin review failed' }));
      throw new Error(err.error || 'Admin review failed');
    }
    return res.json();
  },

  /**
   * List published verified articles
   */
  async getPublishedArticles(): Promise<{ success: boolean; total: number; articles: VerifiedArticle[] }> {
    const res = await fetch('/api/news-verification/articles');
    if (!res.ok) {
      throw new Error('Failed to fetch articles');
    }
    return res.json();
  },

  /**
   * List verified primary sources
   */
  async getTrustedSources(): Promise<{ success: boolean; sources: SourceVerificationRecord[] }> {
    const res = await fetch('/api/news-verification/sources');
    if (!res.ok) {
      throw new Error('Failed to fetch trusted sources');
    }
    return res.json();
  },

  /**
   * Get verification stats
   */
  async getStats(): Promise<any> {
    const res = await fetch('/api/news-verification/stats', {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      throw new Error('Failed to fetch stats');
    }
    return res.json();
  },
};
