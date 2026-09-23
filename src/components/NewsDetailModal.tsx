/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NewsItem } from '../types';
import { getCategoryMeta, formatPublishDate } from '../utils';
import { X, ExternalLink, CheckCircle2, AlertTriangle, ShieldCheck, UserCheck, Calendar, Globe, Share2 } from 'lucide-react';

interface NewsDetailModalProps {
  item: NewsItem | null;
  isDark: boolean;
  onClose: () => void;
}

export const NewsDetailModal: React.FC<NewsDetailModalProps> = ({ item, isDark, onClose }) => {
  if (!item) return null;

  const categoryMeta = getCategoryMeta(item.category);
  const tagColor = isDark ? categoryMeta.darkColor : categoryMeta.lightColor;
  const tagBg = isDark ? categoryMeta.badgeBgDark : categoryMeta.badgeBgLight;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: item.headline,
        text: item.summary,
        url: item.sourceUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(item.sourceUrl);
      alert('Source URL copied to clipboard: ' + item.sourceUrl);
    }
  };

  return (
    <div
      id="news-detail-modal-backdrop"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="news-detail-sheet"
        className="w-full sm:max-w-2xl bg-[#FFFFFF] dark:bg-[#1C1C1E] text-[#000000] dark:text-[#FFFFFF] rounded-t-3xl sm:rounded-2xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* iOS Drag Handle on Mobile */}
        <div className="w-full flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-[rgba(60,60,67,0.3)] dark:bg-[rgba(235,235,245,0.3)]" />
        </div>

        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(60,60,67,0.1)] dark:border-[rgba(84,84,88,0.5)]">
          <div className="flex items-center gap-2">
            <span
              className="ios-caption px-3 py-1 rounded-full uppercase tracking-wider font-bold"
              style={{
                backgroundColor: tagBg,
                color: tagColor,
              }}
            >
              {categoryMeta.name}
            </span>
            <span className="text-xs text-[rgba(60,60,67,0.6)] dark:text-[rgba(235,235,245,0.6)]">
              {item.sourceType === 'automated-ingestion' ? 'Automated Ingestion' : 'Contributor Verified'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="detail-share-btn"
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-[rgba(60,60,67,0.08)] dark:hover:bg-[rgba(235,235,245,0.08)] text-[#007AFF] dark:text-[#0A84FF] transition-colors"
              title="Share or Copy Link"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              id="detail-close-btn"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[rgba(60,60,67,0.08)] dark:hover:bg-[rgba(235,235,245,0.08)] text-[rgba(60,60,67,0.8)] dark:text-[rgba(235,235,245,0.8)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Optional Hero Image */}
        {item.imageUrl && (
          <div className="w-full aspect-[16/9] relative overflow-hidden bg-black/5 dark:bg-white/5">
            <img
              src={item.imageUrl}
              alt={item.headline}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Modal Content Body */}
        <div className="p-6 space-y-5">
          {/* Headline */}
          <h1 className="ios-title leading-tight text-balance">
            {item.headline}
          </h1>

          {/* Verification Callout Box (Section 2 Content Sourcing Rules) */}
          <div className="rounded-xl p-4 bg-[#F2F2F7] dark:bg-[#2C2C2E] border border-[rgba(60,60,67,0.08)] dark:border-[rgba(235,235,245,0.08)] space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-sm font-semibold text-[#000000] dark:text-[#FFFFFF]">
                  Real Published Source Link
                </span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                Verified
              </span>
            </div>

            <p className="text-xs text-[rgba(60,60,67,0.7)] dark:text-[rgba(235,235,245,0.7)]">
              Every item stored in VenturePulse must link to a real published news source. Tap below to inspect the original reporting yourself:
            </p>

            <a
              id="verify-at-source-link"
              href={item.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between w-full p-3 rounded-lg bg-[#007AFF] hover:bg-[#0062CC] dark:bg-[#0A84FF] dark:hover:bg-[#0070DF] text-white font-medium text-sm transition-colors shadow-sm"
            >
              <div className="flex items-center gap-2 truncate pr-2">
                <Globe className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.sourceName} — Open Full Story</span>
              </div>
              <ExternalLink className="w-4 h-4 shrink-0" />
            </a>

            <div className="text-[11px] text-[rgba(60,60,67,0.5)] dark:text-[rgba(235,235,245,0.5)] truncate font-mono">
              URL: {item.sourceUrl}
            </div>
          </div>

          {/* Story Summary */}
          <div className="space-y-2">
            <h3 className="text-xs uppercase tracking-wider font-bold text-[rgba(60,60,67,0.5)] dark:text-[rgba(235,235,245,0.5)]">
              Curated Summary
            </h3>
            <p className="ios-body text-[rgba(60,60,67,0.9)] dark:text-[rgba(235,235,245,0.9)] leading-relaxed">
              {item.summary}
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[rgba(60,60,67,0.1)] dark:border-[rgba(84,84,88,0.5)]">
            <div className="flex items-center gap-2.5 text-xs text-[rgba(60,60,67,0.7)] dark:text-[rgba(235,235,245,0.7)]">
              <Calendar className="w-4 h-4 text-[#007AFF] dark:text-[#0A84FF]" />
              <div>
                <span className="block font-medium text-[#000000] dark:text-[#FFFFFF]">Publish Date</span>
                <span>{formatPublishDate(item.publishDate)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-[rgba(60,60,67,0.7)] dark:text-[rgba(235,235,245,0.7)]">
              <UserCheck className="w-4 h-4 text-[#007AFF] dark:text-[#0A84FF]" />
              <div>
                <span className="block font-medium text-[#000000] dark:text-[#FFFFFF]">Submitted By</span>
                <span>{item.uploader.name} ({item.uploader.role})</span>
              </div>
            </div>
          </div>

          {/* Automated Check Findings */}
          {item.automatedCheck && (
            <div className="rounded-xl p-3.5 bg-black/[0.03] dark:bg-white/[0.03] text-xs space-y-2">
              <span className="font-semibold text-[rgba(60,60,67,0.8)] dark:text-[rgba(235,235,245,0.8)] block">
                Automated Verification Pipeline Results
              </span>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded bg-white dark:bg-[#2C2C2E] shadow-xs">
                  <span className="block text-[10px] text-[rgba(60,60,67,0.6)] dark:text-[rgba(235,235,245,0.6)]">DNS & HTTP Status</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {item.automatedCheck.urlResolves ? 'Resolves OK (200)' : 'Unreachable'}
                  </span>
                </div>
                <div className="p-2 rounded bg-white dark:bg-[#2C2C2E] shadow-xs">
                  <span className="block text-[10px] text-[rgba(60,60,67,0.6)] dark:text-[rgba(235,235,245,0.6)]">Date Recency</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {item.automatedCheck.dateRecent ? 'Recent (<90d)' : 'Flagged Date'}
                  </span>
                </div>
                <div className="p-2 rounded bg-white dark:bg-[#2C2C2E] shadow-xs">
                  <span className="block text-[10px] text-[rgba(60,60,67,0.6)] dark:text-[rgba(235,235,245,0.6)]">Category Match</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {item.automatedCheck.categoryMatch ? 'Strong Match' : 'Manual Review'}
                  </span>
                </div>
              </div>

              {item.automatedCheck.flagReasons.length > 0 && (
                <div className="p-2.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <ul className="list-disc pl-3 space-y-0.5">
                    {item.automatedCheck.flagReasons.map((reason, idx) => (
                      <li key={idx}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {item.moderationNotes && (
            <div className="text-xs p-3 rounded-xl bg-blue-500/10 text-blue-700 dark:text-blue-300">
              <span className="font-bold block mb-0.5">Editorial Note:</span>
              {item.moderationNotes}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
