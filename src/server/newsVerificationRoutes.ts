/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import { newsVerificationDb } from './newsVerificationDb.ts';
import { NewsVerificationEngine } from './newsVerificationEngine.ts';
import {
  NewsSubmission,
  NewsMediaItem,
  NewsReviewActionPayload,
} from '../types/newsVerification.ts';
import { AuthenticatedRequest } from './authRoutes.ts';

export const newsVerificationRouter = express.Router();

/**
 * 1. POST /api/news-verification/extract
 * Performs OCR and Structured Entity Extraction on image/doc/pasted text
 */
newsVerificationRouter.post('/extract', async (req: Request, res: Response) => {
  try {
    const { dataUrl, mimeType, pastedText, sourceUrl } = req.body;

    if (!dataUrl && !pastedText) {
      return res.status(400).json({ error: 'Please provide either an image/media data URL or pasted news text.' });
    }

    const extracted = await NewsVerificationEngine.extractFromMediaOrText({
      dataUrl,
      mimeType,
      pastedText,
      sourceUrl,
    });

    res.json({
      success: true,
      extracted,
    });
  } catch (err: any) {
    console.error('[API] Extraction error:', err);
    res.status(500).json({ error: 'Extraction failed: ' + (err.message || 'Unknown error') });
  }
});

/**
 * 1b. POST /api/news-verification/stream-summary
 * Streams AI responses token-by-token with strict 100-150 token budget and trimmed context
 */
newsVerificationRouter.post(['/stream-summary', '/api/news-verification/stream-summary'], async (req: Request, res: Response) => {
  const { text, headline, contextHistory, maxTokens } = req.body;

  if (!text && !headline) {
    return res.status(400).json({ error: 'Text or headline required for summary streaming.' });
  }

  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  let isAborted = false;
  req.on('close', () => {
    isAborted = true;
  });

  try {
    const generator = NewsVerificationEngine.streamExecutiveSummary({
      text: text || '',
      headline,
      contextHistory: Array.isArray(contextHistory) ? contextHistory : [],
      maxTokens: maxTokens || 120,
    });

    for await (const token of generator) {
      if (isAborted) break;
      res.write(`data: ${JSON.stringify({ token })}\n\n`);
      if (typeof (res as any).flush === 'function') {
        (res as any).flush();
      }
    }

    if (!isAborted) {
      res.write('data: [DONE]\n\n');
      res.end();
    }
  } catch (err: any) {
    if (!res.headersSent) {
      res.status(500).json({ error: 'Streaming failed: ' + err.message });
    } else {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }
  }
});

/**
 * 2. POST /api/news-verification/verify
 * Runs full verification pipeline, safety check, source check, and similarity check
 */
newsVerificationRouter.post('/verify', async (req: Request, res: Response) => {
  try {
    const {
      headline,
      summary,
      fullStory,
      category,
      date,
      location,
      sourceUrl,
      mediaDataUrl,
      entities,
    } = req.body;

    if (!headline || !summary) {
      return res.status(400).json({ error: 'Headline and Summary are required for verification.' });
    }

    // 1. Source verification probe
    let sourceRecord;
    if (sourceUrl && sourceUrl.trim()) {
      sourceRecord = await NewsVerificationEngine.verifySourceUrl(sourceUrl.trim());
    }

    // 2. Content safety scan
    const safetyScan = await NewsVerificationEngine.scanContentSafety(
      `${headline} ${summary} ${fullStory || ''}`,
      mediaDataUrl
    );

    // 3. Existing articles from knowledge base
    const existingArticles = newsVerificationDb.listArticles();

    // 4. Generate verification report and similarity check
    const verification = await NewsVerificationEngine.generateVerificationReport({
      submissionId: 'temp-' + Date.now(),
      headline,
      summary,
      fullStory: fullStory || summary,
      category: category || 'funding',
      date: date || new Date().toISOString().split('T')[0],
      location: location || 'Global',
      sourceUrl,
      sourceRecord,
      entities: entities || {
        headline,
        category: category || 'funding',
        people: [],
        organizations: [],
        locations: location ? [location] : [],
        dates: [date || new Date().toISOString().split('T')[0]],
        governmentSchemes: [],
        companies: [],
        numbers: [],
        cleanedText: fullStory || summary,
        summary,
      },
      safetyScan,
      existingArticles,
    });

    res.json({
      success: true,
      report: verification.report,
      similarityMatches: verification.similarityMatches,
      overallStatus: verification.overallStatus,
      classification: verification.classification,
      sourceRecord,
      safetyScan,
    });
  } catch (err: any) {
    console.error('[API] Verification error:', err);
    res.status(500).json({ error: 'Verification failed: ' + (err.message || 'Unknown error') });
  }
});

/**
 * 3. POST /api/news-verification/submissions
 * User submits news for verification and review
 * Note: Regular users CANNOT directly publish news. Only admin / verification engine can publish.
 */
newsVerificationRouter.post('/submissions', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      mediaList,
      extractedEntities,
      editedHeadline,
      editedCategory,
      editedSummary,
      editedFullStory,
      editedLocation,
      editedDate,
      sourceName,
      sourceUrl,
      sourceRecord,
      safetyScan,
      verificationStatus,
      verificationReport,
      similarityScore,
      classification,
      matchingMatches,
    } = req.body;

    if (!editedHeadline || !editedSummary) {
      return res.status(400).json({ error: 'Headline and Summary are required.' });
    }

    const userId = req.user?.id || req.body.userId || 'guest-contributor-' + Date.now();
    const userName = req.user?.name || req.body.userName || 'Community Contributor';
    const userEmail = req.user?.email || req.body.userEmail || 'contributor@venturepulse.io';

    const submissionId = 'sub-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);

    // Save media items
    const savedMediaList: NewsMediaItem[] = [];
    if (Array.isArray(mediaList)) {
      for (const m of mediaList) {
        const item: NewsMediaItem = {
          id: 'med-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          submissionId,
          type: m.type || 'image',
          source: m.source || 'upload_image',
          filename: m.filename || 'news_artifact.jpg',
          mimeType: m.mimeType || 'image/jpeg',
          sizeBytes: m.sizeBytes || 0,
          dataUrl: m.dataUrl || '',
          ocrResult: m.ocrResult,
          uploadedAt: new Date().toISOString(),
        };
        newsVerificationDb.saveMedia(item);
        savedMediaList.push(item);
      }
    }

    // Determine initial review status
    // If user is Admin, they can choose to publish or queue
    const isAdmin = req.user?.role === 'admin';
    let reviewStatus: NewsSubmission['reviewStatus'] = 'pending_review';

    if (isAdmin && verificationStatus === 'verified' && !verificationReport?.humanReviewRequired) {
      // Admin submitted cleanly verified story
      reviewStatus = 'approved';
    }

    const newSubmission: NewsSubmission = {
      id: submissionId,
      userId,
      userName,
      userEmail,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      mediaList: savedMediaList,
      extractedEntities: extractedEntities || {
        headline: editedHeadline,
        category: editedCategory || 'funding',
        people: [],
        organizations: [],
        locations: [editedLocation || 'Global'],
        dates: [editedDate || new Date().toISOString().split('T')[0]],
        governmentSchemes: [],
        companies: [],
        numbers: [],
        cleanedText: editedFullStory || editedSummary,
        summary: editedSummary,
      },
      editedHeadline: editedHeadline.trim(),
      editedCategory: editedCategory || 'funding',
      editedSummary: editedSummary.trim(),
      editedFullStory: editedFullStory || editedSummary,
      editedLocation: editedLocation || 'Global',
      editedDate: editedDate || new Date().toISOString().split('T')[0],
      sourceName: sourceName || sourceRecord?.name || 'Primary Contributor Wire',
      sourceUrl: sourceUrl || '',
      sourceRecord,
      safetyScan: safetyScan || {
        isClean: true,
        suspicious: false,
        manipulatedScreenshotDetected: false,
        spamDetected: false,
        piiDetected: false,
        hateOrAbusiveDetected: false,
        explicitDetected: false,
        malwareOrPhishingUrlDetected: false,
        flags: [],
        recommendation: 'allow',
      },
      verificationStatus: verificationStatus || 'needs_review',
      verificationReport: verificationReport ? { ...verificationReport, submissionId } : undefined,
      similarityScore: similarityScore || 0,
      classification: classification || 'new_story',
      matchingMatches: matchingMatches || [],
      reviewStatus,
    };

    // If approved immediately (by admin), also create the live published article
    if (reviewStatus === 'approved') {
      const publishedArticle = newsVerificationDb.publishArticleFromSubmission(newSubmission, userId, userName);
      newSubmission.publishedArticleId = publishedArticle.id;
    }

    newsVerificationDb.createSubmission(newSubmission);

    res.status(201).json({
      success: true,
      submission: newSubmission,
    });
  } catch (err: any) {
    console.error('[API] Create submission error:', err);
    res.status(500).json({ error: 'Failed to submit news: ' + (err.message || 'Unknown error') });
  }
});

/**
 * 4. GET /api/news-verification/submissions
 * Lists submissions
 */
newsVerificationRouter.get('/submissions', (req: AuthenticatedRequest, res: Response) => {
  const { reviewStatus, verificationStatus, classification, myOnly } = req.query;

  const isAdmin = req.user?.role === 'admin';
  const filterUserId = (!isAdmin || myOnly === 'true') ? req.user?.id : undefined;

  const submissions = newsVerificationDb.listSubmissions({
    userId: filterUserId,
    reviewStatus: typeof reviewStatus === 'string' ? reviewStatus : undefined,
    verificationStatus: typeof verificationStatus === 'string' ? verificationStatus : undefined,
    classification: typeof classification === 'string' ? classification : undefined,
  });

  res.json({
    success: true,
    total: submissions.length,
    submissions,
  });
});

/**
 * 5. GET /api/news-verification/submissions/:id
 */
newsVerificationRouter.get('/submissions/:id', (req: AuthenticatedRequest, res: Response) => {
  const submission = newsVerificationDb.getSubmissionById(req.params.id);
  if (!submission) {
    return res.status(404).json({ error: 'Submission not found' });
  }

  // Permission check: uploader or admin
  const isOwner = req.user && req.user.id === submission.userId;
  const isAdmin = req.user?.role === 'admin';
  if (!isOwner && !isAdmin) {
    return res.status(403).json({ error: 'Access denied.' });
  }

  res.json({ success: true, submission });
});

/**
 * 6. PATCH /api/news-verification/submissions/:id
 * Allows author to edit their submission if correction requested
 */
newsVerificationRouter.patch('/submissions/:id', (req: AuthenticatedRequest, res: Response) => {
  const submission = newsVerificationDb.getSubmissionById(req.params.id);
  if (!submission) {
    return res.status(404).json({ error: 'Submission not found' });
  }

  const isOwner = req.user && req.user.id === submission.userId;
  const isAdmin = req.user?.role === 'admin';
  if (!isOwner && !isAdmin) {
    return res.status(403).json({ error: 'Access denied.' });
  }

  const { editedHeadline, editedSummary, editedFullStory, editedCategory, editedLocation, editedDate } = req.body;

  const updated = newsVerificationDb.updateSubmission(req.params.id, {
    editedHeadline: editedHeadline || submission.editedHeadline,
    editedSummary: editedSummary || submission.editedSummary,
    editedFullStory: editedFullStory || submission.editedFullStory,
    editedCategory: editedCategory || submission.editedCategory,
    editedLocation: editedLocation || submission.editedLocation,
    editedDate: editedDate || submission.editedDate,
    reviewStatus: submission.reviewStatus === 'correction_requested' ? 'pending_review' : submission.reviewStatus,
  });

  res.json({ success: true, submission: updated });
});

/**
 * 7. POST /api/news-verification/admin/review
 * Admin review actions: approve, reject, request_correction, merge, publish_update
 */
newsVerificationRouter.post('/admin/review', (req: AuthenticatedRequest, res: Response) => {
  // Strict server-side admin role check
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: Administrator privileges required.' });
  }

  const payload: NewsReviewActionPayload = req.body;
  const { submissionId, action, notes, targetArticleId, correctionInstructions } = payload;

  const submission = newsVerificationDb.getSubmissionById(submissionId);
  if (!submission) {
    return res.status(404).json({ error: 'Submission not found.' });
  }

  const reviewerId = req.user.id;
  const reviewerName = req.user.name || req.user.email;

  // Record review log
  newsVerificationDb.recordReviewAction(payload, reviewerId, reviewerName);

  if (action === 'approve') {
    const article = newsVerificationDb.publishArticleFromSubmission(submission, reviewerId, reviewerName);
    return res.json({
      success: true,
      action: 'approved',
      article,
      submission,
      message: 'News story verified and published live.',
    });
  }

  if (action === 'reject') {
    const updated = newsVerificationDb.updateSubmission(submissionId, {
      reviewStatus: 'rejected',
      reviewerId,
      reviewerName,
      reviewerNotes: notes || 'Submission does not meet verification and sourcing standards.',
      reviewedAt: new Date().toISOString(),
    });
    return res.json({
      success: true,
      action: 'rejected',
      submission: updated,
      message: 'Submission rejected.',
    });
  }

  if (action === 'request_correction') {
    const updated = newsVerificationDb.updateSubmission(submissionId, {
      reviewStatus: 'correction_requested',
      reviewerId,
      reviewerName,
      reviewerNotes: notes || correctionInstructions || 'Please provide additional primary source citations.',
      userCorrectionRequest: correctionInstructions || notes,
      reviewedAt: new Date().toISOString(),
    });
    return res.json({
      success: true,
      action: 'correction_requested',
      submission: updated,
      message: 'Correction request sent to submitter.',
    });
  }

  if (action === 'publish_update') {
    if (!targetArticleId) {
      return res.status(400).json({ error: 'Target article ID is required to publish an update.' });
    }
    const updateRecord = newsVerificationDb.publishArticleUpdate(targetArticleId, submission, reviewerId, reviewerName, notes);
    if (!updateRecord) {
      return res.status(404).json({ error: 'Target article to update was not found.' });
    }
    return res.json({
      success: true,
      action: 'published_as_update',
      updateRecord,
      submission,
      message: 'Published as factual update to existing story.',
    });
  }

  if (action === 'merge') {
    if (!targetArticleId) {
      return res.status(400).json({ error: 'Target article ID is required to merge.' });
    }
    const merged = newsVerificationDb.mergeSubmissionIntoArticle(targetArticleId, submission, reviewerId, reviewerName, notes);
    if (!merged) {
      return res.status(404).json({ error: 'Target article to merge into was not found.' });
    }
    return res.json({
      success: true,
      action: 'merged',
      submission,
      message: 'Submission merged into existing story.',
    });
  }

  res.status(400).json({ error: 'Invalid action specified.' });
});

/**
 * 8. GET /api/news-verification/articles
 * Lists all published articles with updates
 */
newsVerificationRouter.get('/articles', (_req: Request, res: Response) => {
  const articles = newsVerificationDb.listArticles();
  res.json({
    success: true,
    total: articles.length,
    articles,
  });
});

/**
 * 9. GET /api/news-verification/sources
 * Lists trusted sources directory
 */
newsVerificationRouter.get('/sources', (_req: Request, res: Response) => {
  const sources = newsVerificationDb.listSources();
  res.json({
    success: true,
    sources,
  });
});

/**
 * 10. GET /api/news-verification/stats
 * Stats for admin verification dashboard
 */
newsVerificationRouter.get('/stats', (req: AuthenticatedRequest, res: Response) => {
  const submissions = newsVerificationDb.listSubmissions();
  const articles = newsVerificationDb.listArticles();

  const totalSubmissions = submissions.length;
  const pendingReview = submissions.filter((s) => s.reviewStatus === 'pending_review' || s.reviewStatus === 'pending_verification').length;
  const approved = submissions.filter((s) => s.reviewStatus === 'approved').length;
  const publishedUpdates = submissions.filter((s) => s.reviewStatus === 'published_as_update').length;
  const rejected = submissions.filter((s) => s.reviewStatus === 'rejected').length;
  const duplicates = submissions.filter((s) => s.classification === 'duplicate').length;

  res.json({
    totalSubmissions,
    pendingReview,
    approved,
    publishedUpdates,
    rejected,
    duplicates,
    totalArticles: articles.length,
  });
});
