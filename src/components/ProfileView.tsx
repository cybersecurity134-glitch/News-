/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { UserProfile, NewsItem } from '../types';
import { ShieldCheck, UserCheck, KeyRound, Sparkles, Clock, CheckCircle2, ShieldAlert } from 'lucide-react';

interface ProfileViewProps {
  currentUser: UserProfile;
  allNews: NewsItem[];
  adminUploadCode: string;
  isDark: boolean;
  onOpenSubmit: () => void;
  onSelectNews: (item: NewsItem) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  allNews,
  adminUploadCode,
  isDark: _isDark,
  onOpenSubmit,
  onSelectNews,
}) => {
  const mySubmissions = allNews.filter((n) => n.uploader.id === currentUser.id);

  return (
    <div id="profile-view" className="w-full max-w-3xl mx-auto px-4 py-4 space-y-6">
      {/* User Hero Card */}
      <div className="rounded-2xl p-6 bg-[#F2F2F7] dark:bg-[#1C1C1E] border border-[rgba(60,60,67,0.08)] dark:border-[rgba(235,235,245,0.08)] flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          className="w-20 h-20 rounded-full object-cover border-2 border-[#007AFF] shadow-md"
        />

        <div className="space-y-1.5 flex-1">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <h1 className="ios-title text-2xl text-[#000000] dark:text-[#FFFFFF]">
              {currentUser.name}
            </h1>
            <span
              className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                currentUser.role === 'admin'
                  ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400'
                  : currentUser.role === 'uploader'
                  ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                  : 'bg-neutral-500/15 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              {currentUser.role === 'admin'
                ? 'Admin ("Head")'
                : currentUser.role === 'uploader'
                ? 'Uploader / Contributor'
                : 'Viewer (Default)'}
            </span>
          </div>

          <p className="text-xs text-[rgba(60,60,67,0.6)] dark:text-[rgba(235,235,245,0.6)]">
            {currentUser.email}
          </p>

          <p className="text-xs text-[rgba(60,60,67,0.8)] dark:text-[rgba(235,235,245,0.8)] pt-1">
            {currentUser.bio || 'Active participant in the VenturePulse startup community.'}
          </p>

          <div className="pt-2 flex items-center justify-center sm:justify-start gap-2 flex-wrap">
            {currentUser.role === 'uploader' && (
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 ${
                  currentUser.isApproved
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                }`}
              >
                {currentUser.isApproved ? <UserCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                {currentUser.isApproved ? 'Approved Contributor' : 'Approval Pending from Head'}
              </span>
            )}

            {currentUser.role === 'admin' && (
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Full Moderation Rights
              </span>
            )}
          </div>
        </div>

        {currentUser.role !== 'viewer' && (
          <button
            onClick={onOpenSubmit}
            className="px-4 py-2 rounded-xl bg-[#007AFF] dark:bg-[#0A84FF] text-white text-xs font-semibold shadow-xs hover:bg-[#0062CC] transition-all"
          >
            Submit News
          </button>
        )}
      </div>

      {/* Role Specifications & Audit Rules Box */}
      <div className="rounded-2xl p-5 bg-[#F2F2F7] dark:bg-[#1C1C1E] border border-[rgba(60,60,67,0.08)] space-y-3">
        <div className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-[#007AFF]" />
          <h3 className="ios-headline text-sm font-semibold text-[#000000] dark:text-[#FFFFFF]">
            Access Architecture & Sourcing Standards
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-white dark:bg-[#2C2C2E] space-y-1">
            <span className="font-bold block text-[#007AFF] dark:text-[#0A84FF]">
              Viewer Role
            </span>
            <p className="text-[11px] text-[rgba(60,60,67,0.7)] dark:text-[rgba(235,235,245,0.7)]">
              Default access: Browse, search, filter the 6 categories, verify clickable source links, and 1:1 chat.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-[#2C2C2E] space-y-1">
            <span className="font-bold block text-blue-600 dark:text-blue-400">
              Contributor Role
            </span>
            <p className="text-[11px] text-[rgba(60,60,67,0.7)] dark:text-[rgba(235,235,245,0.7)]">
              Two-gate security: Verified 1-minute email passcode login PLUS current active upload passcode ({adminUploadCode}).
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-[#2C2C2E] space-y-1">
            <span className="font-bold block text-purple-600 dark:text-purple-400">
              Admin ("Head")
            </span>
            <p className="text-[11px] text-[rgba(60,60,67,0.7)] dark:text-[rgba(235,235,245,0.7)]">
              Rotates upload password, vets contributor accounts, and has final authority in the verification queue.
            </p>
          </div>
        </div>
      </div>

      {/* User Submission History */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="ios-headline text-base text-[#000000] dark:text-[#FFFFFF]">
            My Submissions ({mySubmissions.length})
          </h3>
          <span className="text-xs text-[rgba(60,60,67,0.5)]">
            Verified audit trail
          </span>
        </div>

        {mySubmissions.length === 0 ? (
          <div className="rounded-2xl p-8 text-center bg-[#F2F2F7] dark:bg-[#1C1C1E] border border-dashed border-[rgba(60,60,67,0.2)] text-xs text-[rgba(60,60,67,0.6)]">
            No submissions recorded yet for this profile. Log in as an uploader with your 1-minute email passcode to submit a real startup story!
          </div>
        ) : (
          <div className="space-y-2">
            {mySubmissions.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectNews(item)}
                className="p-3.5 rounded-xl bg-[#F2F2F7] dark:bg-[#1C1C1E] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] cursor-pointer flex items-center justify-between gap-3 border border-[rgba(60,60,67,0.06)] transition-colors"
              >
                <div className="truncate">
                  <h4 className="font-semibold text-xs text-[#000000] dark:text-[#FFFFFF] truncate">
                    {item.headline}
                  </h4>
                  <span className="text-[11px] text-[rgba(60,60,67,0.6)] dark:text-[rgba(235,235,245,0.6)] truncate block">
                    {item.sourceName} · {item.category}
                  </span>
                </div>

                <div className="shrink-0 flex items-center gap-1.5">
                  {item.status === 'approved' && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Live in Feed
                    </span>
                  )}
                  {item.status === 'pending' && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Under Review
                    </span>
                  )}
                  {item.status === 'rejected' && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-600 dark:text-red-400 font-semibold">
                      Declined
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
