/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Category, NewsItem } from '../../types/models';
import { ImagePicker } from './ImagePicker';
import { useAuth } from '../../hooks/useAuth';
import { AlertCircle, CheckCircle2, Send, DollarSign, Calendar as CalendarIcon, Building2, HelpCircle } from 'lucide-react';
import { getCategoryStyle } from '../feed/CategoryTag';

interface UploadFormProps {
  onSuccess: (newItem: NewsItem) => void;
}

const CATEGORY_CHOICES: { id: Category; label: string }[] = [
  { id: 'new-startups', label: 'Startups' },
  { id: 'new-schemes', label: 'Schemes' },
  { id: 'funding-routes', label: 'Funding' },
  { id: 'investor-activity', label: 'Investors' },
  { id: 'startup-events', label: 'Events' },
  { id: 'emerging-problems', label: 'Fixes' },
];

export const UploadForm: React.FC<UploadFormProps> = ({ onSuccess }) => {
  const { currentUser } = useAuth();

  const [category, setCategory] = useState<Category>('new-startups');
  const [headline, setHeadline] = useState('');
  const [sourceName, setSourceName] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [publishDate, setPublishDate] = useState(new Date().toISOString().split('T')[0]);
  const [summary, setSummary] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Specialized fields
  const [fundingAmount, setFundingAmount] = useState('');
  const [fundingRound, setFundingRound] = useState('');
  const [investors, setInvestors] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventVenue, setEventVenue] = useState('');
  const [schemeOfferedBy, setSchemeOfferedBy] = useState('');
  const [schemeDeadline, setSchemeDeadline] = useState('');
  const [schemeApplyUrl, setSchemeApplyUrl] = useState('');
  const [problemContext, setProblemContext] = useState('');
  const [fixSolution, setFixSolution] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const isFundingOrInvestor = category === 'funding-routes' || category === 'investor-activity';
  const isEvent = category === 'startup-events';
  const isScheme = category === 'new-schemes';
  const isFix = category === 'emerging-problems';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setErrorMsg('You must be signed in as a contributor to submit.');
      return;
    }

    if (!headline.trim() || !sourceName.trim() || !sourceUrl.trim() || !summary.trim()) {
      setErrorMsg('Headline, Source Name, working Source Link, and Summary are required.');
      return;
    }

    if (!sourceUrl.startsWith('http://') && !sourceUrl.startsWith('https://')) {
      setErrorMsg('Source link must begin with https:// or http://');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          headline: headline.trim(),
          sourceName: sourceName.trim(),
          sourceUrl: sourceUrl.trim(),
          publishDate,
          summary: summary.trim(),
          imageUrl: imageUrl || undefined,
          uploaderId: currentUser.id,
          fundingAmount: isFundingOrInvestor ? fundingAmount : undefined,
          fundingRound: isFundingOrInvestor ? fundingRound : undefined,
          investors: isFundingOrInvestor && investors ? investors.split(',').map((s) => s.trim()) : undefined,
          eventDate: isEvent ? eventDate : undefined,
          eventVenue: isEvent ? eventVenue : undefined,
          schemeOfferedBy: isScheme ? schemeOfferedBy : undefined,
          schemeDeadline: isScheme ? schemeDeadline : undefined,
          schemeApplyUrl: isScheme ? schemeApplyUrl : undefined,
          problemContext: isFix ? problemContext : undefined,
          fixSolution: isFix ? fixSolution : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Submission failed');
      }

      setSuccessMsg(
        currentUser.role === 'admin'
          ? 'Story verified & published immediately!'
          : 'Story submitted! It is now in the review queue awaiting admin verification.'
      );

      // Reset form
      setHeadline('');
      setSourceName('');
      setSourceUrl('');
      setSummary('');
      setImageUrl(null);
      setFundingAmount('');
      setFundingRound('');
      setInvestors('');
      setEventDate('');
      setEventVenue('');
      setSchemeOfferedBy('');
      setSchemeDeadline('');
      setSchemeApplyUrl('');
      setProblemContext('');
      setFixSolution('');

      onSuccess(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Submission failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 p-5 sm:p-6 rounded-[16px] bg-[var(--color-card-bg)] border border-[var(--color-border)]"
    >
      <div>
        <h3 className="font-serif text-xl font-bold text-[var(--color-text-primary)]">
          Post Sourced Story
        </h3>
        <p className="text-xs text-[var(--color-text-secondary)] mt-1">
          All reports require a verified source link. Nothing goes live until the admin verifies it.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-[12px] bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 rounded-[12px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 1. Category Picker */}
      <div>
        <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-2">
          Category <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_CHOICES.map((cat) => {
            const isSelected = category === cat.id;
            const style = getCategoryStyle(cat.label);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                  isSelected
                    ? 'border-transparent shadow-xs'
                    : 'bg-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border-[var(--color-border)]'
                }`}
                style={
                  isSelected
                    ? {
                        color: style.colorVar,
                        backgroundColor: style.bgVar,
                        borderColor: 'currentColor',
                      }
                    : undefined
                }
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Headline */}
      <div>
        <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
          Editorial Headline <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          placeholder="e.g. Anthropic Secures $750M in Additional Facility Led by Menlo Ventures"
          className="w-full px-3.5 py-2.5 rounded-[12px] bg-[var(--color-bg)] border border-[var(--color-border)] text-sm font-serif text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] outline-none focus:border-[var(--color-accent)]"
        />
      </div>

      {/* 3. Source Name & Required Source Link */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
            Source Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={sourceName}
            onChange={(e) => setSourceName(e.target.value)}
            placeholder="e.g. TechCrunch, Reuters, SEC Filing"
            className="w-full px-3 py-2 rounded-[12px] bg-[var(--color-bg)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] outline-none focus:border-[var(--color-accent)]"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
            Required Source Link <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="https://techcrunch.com/..."
            className="w-full px-3 py-2 rounded-[12px] bg-[var(--color-bg)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] outline-none focus:border-[var(--color-accent)]"
          />
        </div>
      </div>

      {/* Summary / Context */}
      <div>
        <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1">
          Summary & Key Takeaway <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={3}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Brief, factual summary of the development..."
          className="w-full px-3 py-2 rounded-[12px] bg-[var(--color-bg)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] outline-none focus:border-[var(--color-accent)] resize-none"
        />
      </div>

      {/* SPECIALIZED METADATA INPUTS */}

      {/* Funding & Investors Card Inputs */}
      {isFundingOrInvestor && (
        <div className="p-4 rounded-[12px] bg-black/[0.02] dark:bg-white/[0.02] border border-[var(--color-border)] space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--cat-funding)]">
            <DollarSign className="w-4 h-4" />
            <span>Funding & Investor Details</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                Funding Amount (e.g. $18,000,000 or $12M)
              </label>
              <input
                type="text"
                value={fundingAmount}
                onChange={(e) => setFundingAmount(e.target.value)}
                placeholder="$15,000,000"
                className="w-full px-3 py-1.5 rounded-[8px] bg-[var(--color-bg)] border border-[var(--color-border)] text-xs tabular-nums text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                Round (e.g. Seed, Series A, Series B)
              </label>
              <input
                type="text"
                value={fundingRound}
                onChange={(e) => setFundingRound(e.target.value)}
                placeholder="Series A"
                className="w-full px-3 py-1.5 rounded-[8px] bg-[var(--color-bg)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
              Participating Investors (comma-separated)
            </label>
            <input
              type="text"
              value={investors}
              onChange={(e) => setInvestors(e.target.value)}
              placeholder="Sequoia Capital, Andreessen Horowitz, Founders Fund"
              className="w-full px-3 py-1.5 rounded-[8px] bg-[var(--color-bg)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
            />
          </div>
        </div>
      )}

      {/* Events Card Inputs */}
      {isEvent && (
        <div className="p-4 rounded-[12px] bg-black/[0.02] dark:bg-white/[0.02] border border-[var(--color-border)] space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--cat-events)]">
            <CalendarIcon className="w-4 h-4" />
            <span>Event & Demo Day Details</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                Event Date & Time
              </label>
              <input
                type="text"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                placeholder="Oct 14-16, 2026 · 09:00 AM"
                className="w-full px-3 py-1.5 rounded-[8px] bg-[var(--color-bg)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                Venue Location
              </label>
              <input
                type="text"
                value={eventVenue}
                onChange={(e) => setEventVenue(e.target.value)}
                placeholder="San Francisco, CA & Global Livestream"
                className="w-full px-3 py-1.5 rounded-[8px] bg-[var(--color-bg)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Schemes Card Inputs */}
      {isScheme && (
        <div className="p-4 rounded-[12px] bg-black/[0.02] dark:bg-white/[0.02] border border-[var(--color-border)] space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--cat-schemes)]">
            <Building2 className="w-4 h-4" />
            <span>Scheme & Grant Details</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                Offered By
              </label>
              <input
                type="text"
                value={schemeOfferedBy}
                onChange={(e) => setSchemeOfferedBy(e.target.value)}
                placeholder="European Innovation Council (EIC)"
                className="w-full px-3 py-1.5 rounded-[8px] bg-[var(--color-bg)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
                Application Deadline
              </label>
              <input
                type="text"
                value={schemeDeadline}
                onChange={(e) => setSchemeDeadline(e.target.value)}
                placeholder="Nov 18, 2026 (17:00 Brussels Time)"
                className="w-full px-3 py-1.5 rounded-[8px] bg-[var(--color-bg)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[var(--color-text-secondary)] mb-1">
              Direct Application Portal URL (Optional)
            </label>
            <input
              type="url"
              value={schemeApplyUrl}
              onChange={(e) => setSchemeApplyUrl(e.target.value)}
              placeholder="https://eic.ec.europa.eu/apply"
              className="w-full px-3 py-1.5 rounded-[8px] bg-[var(--color-bg)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
            />
          </div>
        </div>
      )}

      {/* Problems & Fixes Card Inputs */}
      {isFix && (
        <div className="p-4 rounded-[12px] bg-black/[0.02] dark:bg-white/[0.02] border border-[var(--color-border)] space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--cat-fixes)]">
            <HelpCircle className="w-4 h-4" />
            <span>Problem & Fix Breakdown</span>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-red-500 mb-1">
              Part 1: The Problem (Hurdle / Bottleneck / Challenge)
            </label>
            <textarea
              rows={2}
              value={problemContext}
              onChange={(e) => setProblemContext(e.target.value)}
              placeholder="e.g. LLM fine-tuning clusters suffering from 40% idle time due to PCIe bandwidth saturation..."
              className="w-full px-3 py-1.5 rounded-[8px] bg-[var(--color-bg)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)] resize-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-blue-500 mb-1">
              Part 2: The Fix (Engineering Solution / Strategic Workaround)
            </label>
            <textarea
              rows={2}
              value={fixSolution}
              onChange={(e) => setFixSolution(e.target.value)}
              placeholder="e.g. Sharded gradient checkpointing + RoCE v2 with custom kernel optimizations cut idle time to under 4%..."
              className="w-full px-3 py-1.5 rounded-[8px] bg-[var(--color-bg)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)] resize-none"
            />
          </div>
        </div>
      )}

      {/* 4. Camera or Gallery Photo Upload */}
      <ImagePicker imagePreview={imageUrl} onImageSelected={setImageUrl} />

      {/* 5. Submit for Review Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-6 rounded-full font-bold text-sm bg-[var(--color-accent)] text-[#0B1F3A] hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-xs"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-[#0B1F3A] border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Submit for review</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
