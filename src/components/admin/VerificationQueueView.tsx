/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Eye,
  FileText,
  Search,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  GitMerge,
  PlusCircle,
  MessageSquare,
  Sparkles,
  Layers,
  Calendar,
  MapPin,
  Building,
  User,
  Hash,
  Landmark,
  X,
} from 'lucide-react';
import { verificationClient } from '../../api/verificationClient';
import {
  NewsSubmission,
  VerifiedArticle,
  NewsReviewActionPayload,
} from '../../types/newsVerification';

export const VerificationQueueView: React.FC = () => {
  const [submissions, setSubmissions] = useState<NewsSubmission[]>([]);
  const [existingArticles, setExistingArticles] = useState<VerifiedArticle[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'verified' | 'updates' | 'duplicates' | 'rejected'>('all');

  // Selected Submission for Detailed Review
  const [selectedSubmission, setSelectedSubmission] = useState<NewsSubmission | null>(null);

  // Action Dialogs
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'correction' | 'merge' | 'update' | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [targetArticleId, setTargetArticleId] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  // Load Data
  const loadData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const [subsRes, artsRes, statsRes] = await Promise.all([
        verificationClient.getSubmissions(),
        verificationClient.getPublishedArticles(),
        verificationClient.getStats().catch(() => null),
      ]);

      setSubmissions(subsRes.submissions || []);
      setExistingArticles(artsRes.articles || []);
      setStats(statsRes);
    } catch (err: any) {
      setErrorNotice(err.message || 'Failed to load submissions queue.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Admin Action
  const handlePerformAction = async () => {
    if (!selectedSubmission || !actionType) return;

    setIsSubmittingAction(true);
    setErrorNotice(null);

    try {
      let mappedAction: NewsReviewActionPayload['action'] = 'approve';
      if (actionType === 'reject') mappedAction = 'reject';
      else if (actionType === 'correction') mappedAction = 'request_correction';
      else if (actionType === 'merge') mappedAction = 'merge';
      else if (actionType === 'update') mappedAction = 'publish_update';

      await verificationClient.adminReview({
        submissionId: selectedSubmission.id,
        action: mappedAction,
        notes: actionNotes,
        targetArticleId: targetArticleId || undefined,
        correctionInstructions: actionType === 'correction' ? actionNotes : undefined,
      });

      setSuccessNotice(`Action "${actionType.toUpperCase()}" completed successfully.`);
      setActionType(null);
      setActionNotes('');
      setSelectedSubmission(null);
      await loadData();
    } catch (err: any) {
      setErrorNotice(err.message || 'Failed to execute review action.');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  // Filtered List
  const filteredSubmissions = submissions.filter((sub) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = `${sub.editedHeadline} ${sub.userName} ${sub.userEmail} ${sub.editedCategory}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }

    if (statusFilter === 'pending') {
      return sub.reviewStatus === 'pending_review' || sub.reviewStatus === 'pending_verification';
    }
    if (statusFilter === 'verified') {
      return sub.verificationStatus === 'verified';
    }
    if (statusFilter === 'updates') {
      return sub.classification === 'existing_update' || sub.reviewStatus === 'published_as_update';
    }
    if (statusFilter === 'duplicates') {
      return sub.classification === 'duplicate' || sub.verificationStatus === 'duplicate_already_covered';
    }
    if (statusFilter === 'rejected') {
      return sub.reviewStatus === 'rejected';
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Notifications */}
      {errorNotice && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center justify-between">
          <span>{errorNotice}</span>
          <button onClick={() => setErrorNotice(null)} className="p-1 hover:bg-rose-500/20 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {successNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center justify-between">
          <span>{successNotice}</span>
          <button onClick={() => setSuccessNotice(null)} className="p-1 hover:bg-emerald-500/20 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-3xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
          <span className="text-[11px] font-bold text-[var(--text-secondary)] block">Total Submissions</span>
          <span className="text-xl font-extrabold text-[var(--text-primary)] mt-1 block">
            {stats?.totalSubmissions || submissions.length}
          </span>
        </div>

        <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/20">
          <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 block">Pending Review</span>
          <span className="text-xl font-extrabold text-amber-800 dark:text-amber-300 mt-1 block">
            {stats?.pendingReview ?? submissions.filter((s) => s.reviewStatus === 'pending_review').length}
          </span>
        </div>

        <div className="p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/20">
          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 block">Approved & Live</span>
          <span className="text-xl font-extrabold text-emerald-800 dark:text-emerald-300 mt-1 block">
            {stats?.approved ?? submissions.filter((s) => s.reviewStatus === 'approved').length}
          </span>
        </div>

        <div className="p-4 rounded-3xl bg-purple-500/10 border border-purple-500/20">
          <span className="text-[11px] font-bold text-purple-700 dark:text-purple-400 block">Published Updates</span>
          <span className="text-xl font-extrabold text-purple-800 dark:text-purple-300 mt-1 block">
            {stats?.publishedUpdates ?? submissions.filter((s) => s.reviewStatus === 'published_as_update').length}
          </span>
        </div>

        <div className="p-4 rounded-3xl bg-slate-500/10 border border-slate-500/20 col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-400 block">Duplicate Flags</span>
          <span className="text-xl font-extrabold text-slate-800 dark:text-slate-300 mt-1 block">
            {stats?.duplicates ?? submissions.filter((s) => s.classification === 'duplicate').length}
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search headline, submitter..."
            className="w-full pl-9 pr-4 py-2 rounded-2xl border border-black/10 dark:border-white/10 bg-white/5 text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-hidden focus:ring-2 focus:ring-[var(--accent-primary)]"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
          {[
            { id: 'all', label: 'All' },
            { id: 'pending', label: 'Pending Review' },
            { id: 'verified', label: 'Verified' },
            { id: 'updates', label: 'Updates' },
            { id: 'duplicates', label: 'Duplicates' },
            { id: 'rejected', label: 'Rejected' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                  : 'bg-black/5 dark:bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab.label}
            </button>
          ))}

          <button
            onClick={loadData}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[var(--text-secondary)] shrink-0"
            title="Refresh submissions"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Submissions Table / List */}
      {filteredSubmissions.length === 0 ? (
        <div className="py-12 text-center text-xs text-[var(--text-tertiary)] space-y-2">
          <FileText className="w-8 h-8 mx-auto opacity-40" />
          <p>No news submissions found matching the criteria.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSubmissions.map((sub) => {
            const hasMedia = sub.mediaList && sub.mediaList.length > 0;
            const isPending = sub.reviewStatus === 'pending_review' || sub.reviewStatus === 'pending_verification';

            return (
              <div
                key={sub.id}
                onClick={() => setSelectedSubmission(sub)}
                className={`p-4 rounded-3xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-md ${
                  selectedSubmission?.id === sub.id
                    ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/5'
                    : 'border-black/10 dark:border-white/10 bg-white/5 hover:border-black/20 dark:hover:border-white/20'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  {/* Thumbnail / Media Icon */}
                  {hasMedia ? (
                    <div className="w-16 h-12 rounded-xl overflow-hidden bg-black/20 shrink-0 border border-black/10 dark:border-white/10">
                      <img src={sub.mediaList[0].dataUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-[var(--text-secondary)] shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[var(--accent-primary)]/15 text-[var(--accent-primary)]">
                        {sub.editedCategory}
                      </span>

                      {/* Verification Status Badge */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          sub.verificationStatus === 'verified'
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            : sub.verificationStatus === 'needs_review'
                            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                            : sub.verificationStatus === 'duplicate_already_covered'
                            ? 'bg-slate-500/15 text-slate-700 dark:text-slate-400'
                            : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {sub.verificationStatus === 'verified' && <CheckCircle2 className="w-3 h-3" />}
                        {sub.verificationStatus === 'needs_review' && <AlertTriangle className="w-3 h-3" />}
                        {sub.verificationStatus.replace(/_/g, ' ')}
                      </span>

                      {/* Classification Badge */}
                      {sub.classification === 'existing_update' && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Factual Update
                        </span>
                      )}
                      {sub.classification === 'duplicate' && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-700 dark:text-slate-300">
                          Similarity: {sub.similarityScore}%
                        </span>
                      )}

                      <span className="text-[10px] font-mono text-[var(--text-tertiary)]">
                        {new Date(sub.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-[var(--text-primary)] mt-1 truncate">
                      {sub.editedHeadline}
                    </h4>

                    <p className="text-xs text-[var(--text-secondary)] line-clamp-1 mt-0.5">
                      {sub.editedSummary}
                    </p>

                    <div className="text-[11px] text-[var(--text-tertiary)] mt-1 flex items-center gap-2">
                      <span>Submitted by: <strong>{sub.userName}</strong> ({sub.userEmail})</span>
                      {sub.sourceUrl && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-0.5 text-[var(--accent-primary)] truncate max-w-xs">
                            <ExternalLink className="w-3 h-3 shrink-0" /> {new URL(sub.sourceUrl).hostname}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side review status & CTA */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 shrink-0">
                  <span
                    className={`text-[11px] font-extrabold px-2.5 py-1 rounded-xl uppercase tracking-wider ${
                      sub.reviewStatus === 'approved'
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                        : sub.reviewStatus === 'rejected'
                        ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                        : sub.reviewStatus === 'published_as_update'
                        ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
                        : sub.reviewStatus === 'correction_requested'
                        ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400'
                        : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {sub.reviewStatus.replace(/_/g, ' ')}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSubmission(sub);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-bold text-[var(--text-primary)] flex items-center gap-1"
                  >
                    <span>Inspect</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETAILED INSPECTION DRAWER / MODAL */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-4xl liquid-glass-modal rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92dvh] border border-white/20 dark:border-white/10 bg-[var(--background-secondary)] text-[var(--text-primary)]">
            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
              <div>
                <span className="text-[10px] font-mono text-[var(--text-tertiary)] block">
                  SUBMISSION ID: {selectedSubmission.id}
                </span>
                <h3 className="text-base font-extrabold text-[var(--text-primary)]">
                  Editorial Review & Verification Audit
                </h3>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-[var(--text-secondary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Headline & Meta Banner */}
              <div className="p-4 rounded-3xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[var(--accent-primary)]/15 text-[var(--accent-primary)]">
                    {selectedSubmission.editedCategory}
                  </span>
                  <span className="text-xs text-[var(--text-secondary)]">
                    {selectedSubmission.editedLocation} · {selectedSubmission.editedDate}
                  </span>
                </div>
                <h2 className="text-lg font-extrabold text-[var(--text-primary)]">
                  {selectedSubmission.editedHeadline}
                </h2>
                <p className="text-xs text-[var(--text-secondary)] italic leading-relaxed">
                  "{selectedSubmission.editedSummary}"
                </p>
                <div className="pt-2 text-xs text-[var(--text-primary)] whitespace-pre-line border-t border-black/5 dark:border-white/5">
                  {selectedSubmission.editedFullStory}
                </div>
              </div>

              {/* Submitter & Sourcing Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 space-y-1">
                  <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Submitter:</span>
                  <p className="font-bold text-[var(--text-primary)]">{selectedSubmission.userName}</p>
                  <p className="text-[var(--text-secondary)] text-[11px]">{selectedSubmission.userEmail}</p>
                  <p className="text-[var(--text-tertiary)] text-[10px] font-mono">User ID: {selectedSubmission.userId}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 space-y-1">
                  <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Primary Sourcing:</span>
                  {selectedSubmission.sourceUrl ? (
                    <>
                      <a
                        href={selectedSubmission.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-[var(--accent-primary)] hover:underline flex items-center gap-1 truncate"
                      >
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        {selectedSubmission.sourceRecord?.name || selectedSubmission.sourceUrl}
                      </a>
                      <p className="text-[11px] text-[var(--text-secondary)]">
                        Domain Trust: {selectedSubmission.sourceRecord?.trustScore ?? 75}/100 · Type:{' '}
                        {selectedSubmission.sourceRecord?.officialType || 'Community Link'}
                      </p>
                    </>
                  ) : (
                    <p className="text-[var(--text-tertiary)] italic">No primary source URL provided.</p>
                  )}
                </div>
              </div>

              {/* Attached Media / Photos / Documents */}
              {selectedSubmission.mediaList && selectedSubmission.mediaList.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                    Submitted Source Media ({selectedSubmission.mediaList.length}):
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {selectedSubmission.mediaList.map((m, idx) => (
                      <div
                        key={m.id}
                        className="rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 bg-black/10 aspect-video relative group"
                      >
                        {m.type === 'video' ? (
                          <video src={m.dataUrl} controls className="w-full h-full object-cover" />
                        ) : (
                          <a href={m.dataUrl} target="_blank" rel="noopener noreferrer">
                            <img src={m.dataUrl} alt={`Media ${idx + 1}`} className="w-full h-full object-cover" />
                          </a>
                        )}
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] font-mono">
                          {m.source.replace(/_/g, ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* OCR Text vs User-Edited Text Comparison */}
              {selectedSubmission.extractedEntities.rawOcrText && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                    Raw OCR Output vs Cleaned/Edited Text
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-3 rounded-2xl bg-black/10 dark:bg-white/5 border border-black/10 dark:border-white/10 space-y-1">
                      <span className="text-[10px] font-bold text-amber-500 uppercase font-sans">Raw OCR Text:</span>
                      <p className="text-[11px] text-[var(--text-secondary)] max-h-36 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                        {selectedSubmission.extractedEntities.rawOcrText}
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-black/10 dark:bg-white/5 border border-black/10 dark:border-white/10 space-y-1">
                      <span className="text-[10px] font-bold text-emerald-500 uppercase font-sans">User Edited Text:</span>
                      <p className="text-[11px] text-[var(--text-primary)] max-h-36 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                        {selectedSubmission.editedFullStory}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Verification Report */}
              {selectedSubmission.verificationReport && (
                <div className="p-4 rounded-3xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[var(--accent-primary)]" />
                      AI Verification Pipeline Report
                    </h4>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/15 text-[var(--accent-primary)]">
                      AI Confidence: {selectedSubmission.verificationReport.aiConfidence}%
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {[
                      { label: 'Event Exists', item: selectedSubmission.verificationReport.checks.eventExists },
                      { label: 'Date Accuracy', item: selectedSubmission.verificationReport.checks.dateAccurate },
                      { label: 'Location Jurisdiction', item: selectedSubmission.verificationReport.checks.locationAccurate },
                      { label: 'Entities Cross-Check', item: selectedSubmission.verificationReport.checks.entitiesAccurate },
                      { label: 'Numbers & Figures', item: selectedSubmission.verificationReport.checks.numbersSupported },
                      { label: 'Headline Alignment', item: selectedSubmission.verificationReport.checks.headlineAccurate },
                      { label: 'Recency Status', item: selectedSubmission.verificationReport.checks.recencyStatus },
                      { label: 'Forensic Safety', item: selectedSubmission.verificationReport.checks.contentIntegrity },
                    ].map((c, i) => (
                      <div key={i} className="p-2 rounded-xl bg-white/5 border border-black/5 dark:border-white/5 flex items-start gap-2">
                        {c.item.status ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <span className="text-[11px] font-bold text-[var(--text-primary)] block">{c.label}</span>
                          <span className="text-[10px] text-[var(--text-secondary)] line-clamp-1">{c.item.evidence}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* AI Disclaimer */}
                  <div className="text-[10px] text-[var(--text-secondary)] pt-2 border-t border-black/5 dark:border-white/5">
                    <strong>Notice:</strong> {selectedSubmission.verificationReport.aiConfidenceDisclaimer}
                  </div>
                </div>
              )}

              {/* Similar News & Semantic Matching */}
              {selectedSubmission.matchingMatches && selectedSubmission.matchingMatches.length > 0 && (
                <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      Semantic Similarity Matches in Database
                    </h4>
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300">
                      Highest: {selectedSubmission.similarityScore}%
                    </span>
                  </div>

                  <div className="space-y-2">
                    {selectedSubmission.matchingMatches.map((m) => (
                      <div key={m.id} className="p-3 rounded-2xl bg-white/40 dark:bg-black/40 border border-amber-500/20 text-xs space-y-1">
                        <div className="flex justify-between items-start">
                          <h5 className="font-bold text-[var(--text-primary)]">{m.matchedHeadline}</h5>
                          <span className="text-[10px] font-mono font-bold px-1.5 rounded bg-black/10 dark:bg-white/10">
                            {m.semanticScore}% match
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2">{m.matchedSummary}</p>
                        <div className="flex items-center gap-2 pt-1 text-[10px] text-[var(--text-tertiary)]">
                          <span>Classified as: <strong>{m.detectedType.toUpperCase()}</strong></span>
                          {m.novelPointsFound.length > 0 && (
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                              · Novel points: {m.novelPointsFound.join('; ')}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Dialog if triggered */}
              {actionType && (
                <div className="p-4 rounded-3xl bg-black/10 dark:bg-white/10 border-2 border-[var(--accent-primary)] space-y-3 animate-fade-in">
                  <h4 className="text-xs font-extrabold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
                    Confirm Action: {actionType.toUpperCase()}
                  </h4>

                  {(actionType === 'update' || actionType === 'merge') && (
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[var(--text-secondary)] block">
                        Select Existing Article to {actionType === 'update' ? 'Update' : 'Merge with'}:
                      </label>
                      <select
                        value={targetArticleId}
                        onChange={(e) => setTargetArticleId(e.target.value)}
                        className="w-full px-3 py-2 rounded-2xl border border-black/10 dark:border-white/10 bg-white/5 text-xs text-[var(--text-primary)] font-semibold"
                      >
                        <option value="">-- Choose matching article --</option>
                        {existingArticles.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.headline} ({new Date(a.publishedAt).toLocaleDateString()})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--text-secondary)] block">
                      {actionType === 'correction' ? 'Correction Instructions for Submitter' : 'Admin Editorial Notes'}
                    </label>
                    <textarea
                      value={actionNotes}
                      onChange={(e) => setActionNotes(e.target.value)}
                      placeholder={
                        actionType === 'correction'
                          ? 'Specify missing primary source links, date clarifications, or figure corrections...'
                          : 'Editorial rationale for this action...'
                      }
                      rows={2}
                      className="w-full px-3 py-2 rounded-2xl border border-black/10 dark:border-white/10 bg-white/5 text-xs text-[var(--text-primary)] resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => setActionType(null)}
                      className="px-3 py-1.5 rounded-xl hover:bg-black/10 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePerformAction}
                      disabled={isSubmittingAction || ((actionType === 'update' || actionType === 'merge') && !targetArticleId)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0071E3] to-[#34C759] text-white text-xs font-bold shadow-md hover:brightness-110 disabled:opacity-50"
                    >
                      {isSubmittingAction ? 'Processing...' : 'Confirm & Execute'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Admin Action Bar */}
            <div className="px-6 py-4 bg-black/5 dark:bg-white/5 border-t border-black/10 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-[var(--text-secondary)] font-medium">
                Current Status: <strong className="capitalize">{selectedSubmission.reviewStatus.replace(/_/g, ' ')}</strong>
              </span>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    setActionType('correction');
                    setActionNotes('Please provide primary gazette/press link for numerical claims.');
                  }}
                  className="px-3 py-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 text-xs font-bold flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Request Correction</span>
                </button>

                <button
                  onClick={() => {
                    setActionType('reject');
                    setActionNotes('Unverifiable assertions or manipulated content detected.');
                  }}
                  className="px-3 py-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 text-xs font-bold flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>

                <button
                  onClick={() => {
                    setActionType('update');
                    const firstMatch = selectedSubmission.matchingMatches?.[0];
                    if (firstMatch) setTargetArticleId(firstMatch.matchedArticleId);
                  }}
                  className="px-3 py-2 rounded-2xl border border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 text-xs font-bold flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Publish as Update</span>
                </button>

                <button
                  onClick={() => {
                    setActionType('merge');
                    const firstMatch = selectedSubmission.matchingMatches?.[0];
                    if (firstMatch) setTargetArticleId(firstMatch.matchedArticleId);
                  }}
                  className="px-3 py-2 rounded-2xl border border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300 hover:bg-slate-500/20 text-xs font-bold flex items-center gap-1.5"
                >
                  <GitMerge className="w-3.5 h-3.5" />
                  <span>Merge</span>
                </button>

                <button
                  onClick={() => {
                    setActionType('approve');
                    setActionNotes('Verified against reliable primary sources and gazette announcements.');
                  }}
                  className="px-4 py-2 rounded-2xl bg-gradient-to-r from-[#0071E3] to-[#34C759] text-white text-xs font-bold shadow-md hover:brightness-110 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve & Publish Live</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
