/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { NewsItem, UserProfile, NewsCategory, CATEGORIES } from '../types';
import { getCategoryMeta, formatPublishDate } from '../utils';
import { ShieldCheck, ShieldAlert, Check, X, ExternalLink, KeyRound, UserCheck, UserX, AlertTriangle, RefreshCw, Sparkles, Filter } from 'lucide-react';

interface AdminQueueViewProps {
  news: NewsItem[];
  users: UserProfile[];
  currentUser: UserProfile;
  adminUploadCode: string;
  isDark: boolean;
  onRefreshState: () => void;
  onSelectNews: (item: NewsItem) => void;
}

export const AdminQueueView: React.FC<AdminQueueViewProps> = ({
  news,
  users,
  currentUser,
  adminUploadCode,
  isDark,
  onRefreshState,
  onSelectNews,
}) => {
  const [activeTab, setActiveTab] = useState<'queue' | 'users' | 'security'>('queue');
  const [filterMode, setFilterMode] = useState<'all' | 'flagged' | 'pending' | 'rejected'>('all');
  
  // Rotate code state
  const [newCodeInput, setNewCodeInput] = useState('');
  const [codeSuccessMsg, setCodeSuccessMsg] = useState('');
  
  // Moderation modal / action
  const [moderatingItemId, setModeratingItemId] = useState<string | null>(null);
  const [moderationNote, setModerationNote] = useState('');
  const [overrideCategory, setOverrideCategory] = useState<NewsCategory | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Live RSS Ingest state
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestMsg, setIngestMsg] = useState('');

  const isAdmin = currentUser.role === 'admin';

  // Filter items
  const pendingItems = news.filter((item) => item.status === 'pending');
  const flaggedItems = pendingItems.filter((item) => item.automatedCheck?.flagged);
  const rejectedItems = news.filter((item) => item.status === 'rejected');

  let displayedNews = news.filter((n) => n.status !== 'approved'); // items in queue or rejected
  if (filterMode === 'flagged') {
    displayedNews = flaggedItems;
  } else if (filterMode === 'pending') {
    displayedNews = pendingItems;
  } else if (filterMode === 'rejected') {
    displayedNews = rejectedItems;
  }

  // Handle moderate approve/reject
  const handleModerate = async (itemId: string, action: 'approve' | 'reject') => {
    if (!isAdmin) {
      alert('Only administrators can approve or reject items.');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch(`/api/news/${itemId}/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          moderationNotes: moderationNote.trim() || undefined,
          category: overrideCategory || undefined,
          adminId: currentUser.id,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed');
      }

      setModeratingItemId(null);
      setModerationNote('');
      setOverrideCategory(null);
      onRefreshState();
    } catch (err: any) {
      alert('Moderation error: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle rotate code
  const handleRotateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCodeInput.trim() || newCodeInput.trim().length < 4) {
      alert('Passcode must be at least 4 characters');
      return;
    }

    try {
      const res = await fetch('/api/admin/rotate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: currentUser.id,
          newCode: newCodeInput.trim().toUpperCase(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setCodeSuccessMsg(`Active passcode updated to ${data.adminUploadCode}`);
      setNewCodeInput('');
      onRefreshState();
      setTimeout(() => setCodeSuccessMsg(''), 4000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Handle toggle user approval
  const handleToggleUserApproval = async (targetUserId: string, currentApproval: boolean) => {
    try {
      const res = await fetch('/api/admin/toggle-user-approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminId: currentUser.id,
          targetUserId,
          isApproved: !currentApproval,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      onRefreshState();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Handle automated live RSS ingestion
  const handleTriggerLiveIngest = async () => {
    setIsIngesting(true);
    setIngestMsg('');
    try {
      const res = await fetch('/api/ingest/rss', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setIngestMsg(`Successfully ingested and classified ${data.ingestedCount} live startup news stories!`);
      onRefreshState();
      setTimeout(() => setIngestMsg(''), 5000);
    } catch (err: any) {
      setIngestMsg('Live ingestion error: ' + err.message);
    } finally {
      setIsIngesting(false);
    }
  };

  const uploaders = users.filter((u) => u.role === 'uploader');

  return (
    <div id="admin-queue-view" className="w-full max-w-4xl mx-auto px-4 py-4 space-y-6">
      {/* Top Banner / Role Status */}
      <div className="rounded-2xl p-5 bg-[#F2F2F7] dark:bg-[#1C1C1E] border border-[rgba(60,60,67,0.08)] dark:border-[rgba(235,235,245,0.08)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#007AFF]/10 dark:bg-[#0A84FF]/20 text-[#007AFF] dark:text-[#0A84FF]">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="ios-title text-[#000000] dark:text-[#FFFFFF]">
              Editorial & Verification Hub
            </h1>
          </div>
          <p className="text-xs text-[rgba(60,60,67,0.7)] dark:text-[rgba(235,235,245,0.7)] mt-1">
            Section 4 pipeline: Automated sanity checks, priority flagged queue, access code rotation, and uploader vetting.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="trigger-live-rss-btn"
            onClick={handleTriggerLiveIngest}
            disabled={isIngesting}
            className="px-3.5 py-2 rounded-xl bg-[#007AFF] hover:bg-[#0062CC] dark:bg-[#0A84FF] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
            title="Pull live startup news from real APIs and RSS feeds"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isIngesting ? 'Ingesting Feeds...' : 'Sync Live RSS Feeds'}</span>
          </button>
        </div>
      </div>

      {ingestMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 shrink-0" />
          <span>{ingestMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[rgba(60,60,67,0.1)] dark:border-[rgba(84,84,88,0.5)] pb-1">
        <button
          onClick={() => setActiveTab('queue')}
          className={`px-4 py-2 rounded-t-xl text-sm font-semibold transition-all relative ${
            activeTab === 'queue'
              ? 'text-[#007AFF] dark:text-[#0A84FF] border-b-2 border-[#007AFF] dark:border-[#0A84FF]'
              : 'text-[rgba(60,60,67,0.6)] dark:text-[rgba(235,235,245,0.6)] hover:text-[#000000] dark:hover:text-[#FFFFFF]'
          }`}
        >
          Verification Queue
          {flaggedItems.length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
              {flaggedItems.length} flagged
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-t-xl text-sm font-semibold transition-all relative ${
            activeTab === 'users'
              ? 'text-[#007AFF] dark:text-[#0A84FF] border-b-2 border-[#007AFF] dark:border-[#0A84FF]'
              : 'text-[rgba(60,60,67,0.6)] dark:text-[rgba(235,235,245,0.6)] hover:text-[#000000] dark:hover:text-[#FFFFFF]'
          }`}
        >
          Contributor Approvals
          {uploaders.filter((u) => !u.isApproved).length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
              {uploaders.filter((u) => !u.isApproved).length} pending
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-t-xl text-sm font-semibold transition-all relative ${
            activeTab === 'security'
              ? 'text-[#007AFF] dark:text-[#0A84FF] border-b-2 border-[#007AFF] dark:border-[#0A84FF]'
              : 'text-[rgba(60,60,67,0.6)] dark:text-[rgba(235,235,245,0.6)] hover:text-[#000000] dark:hover:text-[#FFFFFF]'
          }`}
        >
          Passcode & Access
        </button>
      </div>

      {/* Tab 1: Verification Queue */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          {/* Sub-filter chips */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[rgba(60,60,67,0.5)]" />
              {(['all', 'flagged', 'pending', 'rejected'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setFilterMode(mode)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-all ${
                    filterMode === mode
                      ? 'bg-[#007AFF] dark:bg-[#0A84FF] text-white'
                      : 'bg-[#F2F2F7] dark:bg-[#2C2C2E] text-[rgba(60,60,67,0.7)] dark:text-[rgba(235,235,245,0.7)]'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            <button
              onClick={onRefreshState}
              className="text-xs text-[rgba(60,60,67,0.6)] dark:text-[rgba(235,235,245,0.6)] flex items-center gap-1 hover:text-[#007AFF]"
            >
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          </div>

          {displayedNews.length === 0 ? (
            <div className="rounded-2xl p-12 text-center bg-[#F2F2F7] dark:bg-[#1C1C1E] border border-dashed border-[rgba(60,60,67,0.2)]">
              <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h3 className="ios-headline text-[#000000] dark:text-[#FFFFFF]">Queue is Clear</h3>
              <p className="text-xs text-[rgba(60,60,67,0.6)] dark:text-[rgba(235,235,245,0.6)] mt-1">
                All submitted stories have been reviewed or approved to the public feed.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayedNews.map((item) => {
                const catMeta = getCategoryMeta(item.category);
                const tagColor = isDark ? catMeta.darkColor : catMeta.lightColor;
                const tagBg = isDark ? catMeta.badgeBgDark : catMeta.badgeBgLight;
                const isItemFlagged = item.automatedCheck?.flagged;

                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl p-4 bg-[#F2F2F7] dark:bg-[#1C1C1E] border transition-all ${
                      isItemFlagged
                        ? 'border-amber-500/50 dark:border-amber-500/40 shadow-sm'
                        : 'border-[rgba(60,60,67,0.08)] dark:border-[rgba(235,235,245,0.08)]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                      <div className="space-y-2 flex-1">
                        {/* Header Badges */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="ios-caption px-2.5 py-0.5 rounded-full uppercase tracking-wider font-bold"
                            style={{ backgroundColor: tagBg, color: tagColor }}
                          >
                            {catMeta.name}
                          </span>

                          {isItemFlagged ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3" /> Flagged for Priority Review
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-1">
                              <Check className="w-3 h-3" /> Auto-Checks Passed
                            </span>
                          )}

                          <span className="text-xs text-[rgba(60,60,67,0.5)] dark:text-[rgba(235,235,245,0.5)]">
                            By {item.uploader.name} ({item.uploader.role})
                          </span>
                        </div>

                        {/* Headline */}
                        <h3
                          onClick={() => onSelectNews(item)}
                          className="ios-headline text-[#000000] dark:text-[#FFFFFF] cursor-pointer hover:underline"
                        >
                          {item.headline}
                        </h3>

                        {/* Summary */}
                        <p className="text-xs text-[rgba(60,60,67,0.8)] dark:text-[rgba(235,235,245,0.8)] line-clamp-2">
                          {item.summary}
                        </p>

                        {/* Real Source Link check */}
                        <div className="flex items-center gap-3 text-xs pt-1 flex-wrap">
                          <a
                            href={item.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#007AFF] dark:text-[#0A84FF] font-medium flex items-center gap-1 hover:underline"
                          >
                            <span>Inspect Source URL: {item.sourceName}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <span className="text-[rgba(60,60,67,0.4)]">·</span>
                          <span className="text-[rgba(60,60,67,0.6)] dark:text-[rgba(235,235,245,0.6)]">
                            Published: {formatPublishDate(item.publishDate)}
                          </span>
                        </div>

                        {/* Automated Flag Reasons */}
                        {item.automatedCheck && item.automatedCheck.flagReasons.length > 0 && (
                          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs space-y-1">
                            <span className="font-semibold flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" /> Automated Flag Triggers:
                            </span>
                            <ul className="list-disc pl-4 space-y-0.5">
                              {item.automatedCheck.flagReasons.map((reason, idx) => (
                                <li key={idx}>{reason}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {item.status === 'rejected' && item.rejectionReason && (
                          <div className="p-2 rounded bg-red-500/10 text-red-600 dark:text-red-400 text-xs">
                            Rejected: {item.rejectionReason}
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex sm:flex-col items-center gap-2 shrink-0 w-full sm:w-auto pt-2 sm:pt-0">
                        {item.status === 'pending' && (
                          <>
                            <button
                              id={`approve-btn-${item.id}`}
                              onClick={() => handleModerate(item.id, 'approve')}
                              disabled={isProcessing}
                              className="flex-1 sm:flex-none w-full px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm active:scale-98 transition-all"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve & Publish</span>
                            </button>

                            <button
                              id={`reject-btn-${item.id}`}
                              onClick={() => {
                                setModeratingItemId(item.id);
                              }}
                              disabled={isProcessing}
                              className="flex-1 sm:flex-none w-full px-4 py-2 rounded-xl bg-[rgba(60,60,67,0.1)] dark:bg-[rgba(235,235,245,0.1)] hover:bg-red-500/20 hover:text-red-600 text-[rgba(60,60,67,0.8)] dark:text-[rgba(235,235,245,0.8)] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Reject...</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Contributor Approvals */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#F2F2F7] dark:bg-[#1C1C1E] border border-[rgba(60,60,67,0.08)] space-y-1">
            <h3 className="ios-headline text-[#000000] dark:text-[#FFFFFF]">
              Contributor Access Management
            </h3>
            <p className="text-xs text-[rgba(60,60,67,0.6)] dark:text-[rgba(235,235,245,0.6)]">
              Per specification recommendation: Gate uploader accounts with admin approval + active upload password for strict auditability.
            </p>
          </div>

          <div className="space-y-2">
            {uploaders.map((user) => (
              <div
                key={user.id}
                className="p-4 rounded-2xl bg-[#F2F2F7] dark:bg-[#1C1C1E] flex items-center justify-between gap-3 border border-[rgba(60,60,67,0.08)]"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover border border-black/10"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[#000000] dark:text-[#FFFFFF]">
                        {user.name}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          user.isApproved
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {user.isApproved ? 'Approved Contributor' : 'Pending Approval'}
                      </span>
                    </div>
                    <span className="text-xs text-[rgba(60,60,67,0.6)] dark:text-[rgba(235,235,245,0.6)] block">
                      {user.email} · {user.bio || 'Tech scout & contributor'}
                    </span>
                  </div>
                </div>

                <div>
                  {user.isApproved ? (
                    <button
                      onClick={() => handleToggleUserApproval(user.id, true)}
                      className="px-3 py-1.5 rounded-xl bg-red-500/10 text-red-600 hover:bg-red-500/20 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span>Revoke</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggleUserApproval(user.id, false)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition-colors"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Approve Account</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Security & Passcode Rotation */}
      {activeTab === 'security' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-[#F2F2F7] dark:bg-[#1C1C1E] border border-[rgba(60,60,67,0.08)] space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#007AFF]/10 text-[#007AFF]">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="ios-headline text-[#000000] dark:text-[#FFFFFF]">
                  Admin Upload Passcode Rotation
                </h3>
                <p className="text-xs text-[rgba(60,60,67,0.6)] dark:text-[rgba(235,235,245,0.6)]">
                  Uploaders must provide this active passcode alongside their approved account credentials to submit stories.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-[#2C2C2E] flex items-center justify-between border border-[rgba(60,60,67,0.1)]">
              <div>
                <span className="text-xs text-[rgba(60,60,67,0.5)] block">CURRENT ACTIVE PASSCODE</span>
                <span className="font-mono text-xl font-bold tracking-widest text-[#007AFF] dark:text-[#0A84FF]">
                  {adminUploadCode}
                </span>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold">
                Active & Enforced
              </span>
            </div>

            {codeSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{codeSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleRotateCode} className="space-y-3 pt-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[rgba(60,60,67,0.7)] dark:text-[rgba(235,235,245,0.7)]">
                Rotate to New Upload Passcode
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newCodeInput}
                  onChange={(e) => setNewCodeInput(e.target.value.toUpperCase())}
                  placeholder="e.g. VENTURE2026X"
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#2C2C2E] border border-[rgba(60,60,67,0.15)] text-sm font-mono tracking-wider outline-none focus:ring-2 focus:ring-[#007AFF]"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#007AFF] hover:bg-[#0062CC] text-white text-xs font-semibold shadow-sm transition-all"
                >
                  Rotate Passcode
                </button>
              </div>
              <p className="text-[11px] text-[rgba(60,60,67,0.5)]">
                Once rotated, previous access codes are immediately invalidated across all submission forms.
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Moderation Rejection Dialog Modal */}
      {moderatingItemId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#1C1C1E] rounded-2xl p-5 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-[#000000] dark:text-[#FFFFFF]">
              Decline Submission
            </h3>
            <p className="text-xs text-[rgba(60,60,67,0.7)] dark:text-[rgba(235,235,245,0.7)]">
              Specify the editorial reason for rejecting this item. The uploader will receive an in-app notification with this reason.
            </p>

            <textarea
              rows={3}
              value={moderationNote}
              onChange={(e) => setModerationNote(e.target.value)}
              placeholder="e.g. Source link is inaccessible, or content does not match startup scope..."
              className="w-full p-3 rounded-xl bg-[#F2F2F7] dark:bg-[#2C2C2E] text-xs outline-none focus:ring-2 focus:ring-red-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setModeratingItemId(null)}
                className="px-3.5 py-2 text-xs font-semibold text-[rgba(60,60,67,0.7)]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleModerate(moderatingItemId, 'reject')}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
