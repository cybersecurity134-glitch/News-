/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  X,
  Camera,
  Upload,
  Video,
  FileText,
  Link as LinkIcon,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Clock,
  Eye,
  Edit3,
  Layers,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Info,
  Building,
  User,
  MapPin,
  Calendar,
  Hash,
  Landmark,
  ShieldAlert,
} from 'lucide-react';
import { CameraCaptureModal } from './CameraCaptureModal';
import { compressImageForOcr, formatBytes } from './ImageCompressor';
import { verificationClient } from '../../api/verificationClient';
import { useAuth } from '../../context/AuthContext';
import {
  ExtractedEntities,
  NewsVerificationReport,
  NewsSimilarityMatch,
  NewsSubmission,
  SourceVerificationRecord,
  ContentSafetyScan,
  NewsMediaItem,
} from '../../types/newsVerification';

interface AddNewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmittedSuccess?: (submission: NewsSubmission) => void;
}

type IngestionTab = 'camera' | 'upload_image' | 'upload_video' | 'paste_text' | 'source_url';
type WizardStep = 'input' | 'extracting' | 'review_extracted' | 'verifying' | 'verification_result' | 'preview' | 'success';

export const AddNewsModal: React.FC<AddNewsModalProps> = ({
  isOpen,
  onClose,
  onSubmittedSuccess,
}) => {
  const { currentUser } = useAuth();

  // Wizard Navigation
  const [currentStep, setCurrentStep] = useState<WizardStep>('input');
  const [activeTab, setActiveTab] = useState<IngestionTab>('camera');

  // Input states
  const [mediaList, setMediaList] = useState<NewsMediaItem[]>([]);
  const [pastedText, setPastedText] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);

  // Camera modal trigger
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

  // Status progression message
  const [progressStatusMsg, setProgressStatusMsg] = useState('Reading your news...');

  // Extracted entities and user editable form
  const [extractedEntities, setExtractedEntities] = useState<ExtractedEntities>({
    headline: '',
    category: 'funding',
    people: [],
    organizations: [],
    locations: [],
    dates: [],
    governmentSchemes: [],
    companies: [],
    numbers: [],
    cleanedText: '',
    summary: '',
  });

  const [editedHeadline, setEditedHeadline] = useState('');
  const [editedSummary, setEditedSummary] = useState('');
  const [editedFullStory, setEditedFullStory] = useState('');
  const [editedCategory, setEditedCategory] = useState('funding');
  const [editedLocation, setEditedLocation] = useState('Global');
  const [editedDate, setEditedDate] = useState(new Date().toISOString().split('T')[0]);

  // Verification Results
  const [verificationReport, setVerificationReport] = useState<NewsVerificationReport | null>(null);
  const [similarityMatches, setSimilarityMatches] = useState<NewsSimilarityMatch[]>([]);
  const [overallStatus, setOverallStatus] = useState<NewsSubmission['verificationStatus']>('needs_review');
  const [classification, setClassification] = useState<NewsSubmission['classification']>('new_story');
  const [sourceRecord, setSourceRecord] = useState<SourceVerificationRecord | undefined>(undefined);
  const [safetyScan, setSafetyScan] = useState<ContentSafetyScan | undefined>(undefined);

  // Submission Result
  const [createdSubmission, setCreatedSubmission] = useState<NewsSubmission | null>(null);

  // UI state
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Clean up object URLs on unmount or when modal is closed
  useEffect(() => {
    return () => {
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl);
      }
    };
  }, [videoPreviewUrl]);

  // Reset modal state
  const handleReset = () => {
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }
    setCurrentStep('input');
    setActiveTab('camera');
    setMediaList([]);
    setPastedText('');
    setSourceUrl('');
    setVideoPreviewUrl(null);
    setVerificationReport(null);
    setSimilarityMatches([]);
    setErrorMessage(null);
    setCreatedSubmission(null);
  };

  // 1. Handle Camera Multi-photo complete
  const handleCameraCaptureComplete = (capturedImages: { dataUrl: string; filename: string }[]) => {
    const newMedia: NewsMediaItem[] = capturedImages.map((img, i) => ({
      id: 'cam-' + Date.now() + '-' + i,
      type: 'image',
      source: 'camera_photo',
      filename: img.filename,
      mimeType: 'image/jpeg',
      sizeBytes: Math.round((img.dataUrl.length * 3) / 4),
      dataUrl: img.dataUrl,
      uploadedAt: new Date().toISOString(),
    }));

    setMediaList((prev) => [...prev, ...newMedia]);
    setActiveTab('upload_image'); // Switch to review media
  };

  // 2. Handle File Uploads (Multiple Images with text-preserving client-side compression)
  const handleImageFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const compressedList: NewsMediaItem[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;

        // Compress image while preserving high resolution for OCR
        const result = await compressImageForOcr(file, 2048, 0.88);

        compressedList.push({
          id: 'up-' + Date.now() + '-' + i,
          type: 'image',
          source: 'upload_image',
          filename: file.name,
          mimeType: file.type,
          sizeBytes: result.compressedSizeBytes,
          dataUrl: result.dataUrl,
          uploadedAt: new Date().toISOString(),
        });
      }

      setMediaList((prev) => [...prev, ...compressedList]);
    } catch (err: any) {
      setErrorMessage('Failed to process image files: ' + err.message);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 3. Handle Video File Upload
  const handleVideoFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      setErrorMessage('Video exceeds maximum size limit of 50 MB.');
      return;
    }

    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }

    const previewUrl = URL.createObjectURL(file);
    setVideoPreviewUrl(previewUrl);

    const videoMedia: NewsMediaItem = {
      id: 'vid-' + Date.now(),
      type: 'video',
      source: 'upload_video',
      filename: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      dataUrl: previewUrl,
      uploadedAt: new Date().toISOString(),
    };

    setMediaList([videoMedia]);
  };

  // 4. Remove a media item
  const handleRemoveMedia = (id: string) => {
    setMediaList((prev) => {
      const target = prev.find((m) => m.id === id);
      if (target?.type === 'video' && videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl);
        setVideoPreviewUrl(null);
      }
      return prev.filter((m) => m.id !== id);
    });
  };

  // 5. Trigger Extraction (OCR / Parsing Pipeline)
  const handleTriggerExtraction = async () => {
    if (mediaList.length === 0 && !pastedText.trim() && !sourceUrl.trim()) {
      setErrorMessage('Please capture a photo, upload an image/video, paste text, or provide a source URL.');
      return;
    }

    setErrorMessage(null);
    setCurrentStep('extracting');
    setProgressStatusMsg('📷 Reading your news & running OCR...');

    const stepTimer1 = setTimeout(() => {
      setProgressStatusMsg('🔎 Detecting entities (People, Orgs, Schemes, Numbers)...');
    }, 900);

    const stepTimer2 = setTimeout(() => {
      setProgressStatusMsg('🧹 Cleaning formatting & spelling errors...');
    }, 1800);

    try {
      const primaryMedia = mediaList[0];
      const res = await verificationClient.extractNews({
        dataUrl: primaryMedia?.dataUrl,
        mimeType: primaryMedia?.mimeType,
        pastedText: pastedText.trim() || undefined,
        sourceUrl: sourceUrl.trim() || undefined,
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      const ext = res.extracted;
      setExtractedEntities(ext);
      setEditedHeadline(ext.headline || '');
      setEditedSummary(ext.summary || '');
      setEditedFullStory(ext.cleanedText || ext.summary || '');
      setEditedCategory(ext.category || 'funding');
      setEditedLocation(ext.locations?.[0] || 'Global');
      setEditedDate(ext.dates?.[0] || new Date().toISOString().split('T')[0]);

      setCurrentStep('review_extracted');
    } catch (err: any) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setErrorMessage(err.message || 'Failed to extract news information.');
      setCurrentStep('input');
    }
  };

  // 6. Trigger Verification & Duplicate Similarity Check Pipeline
  const handleTriggerVerification = async () => {
    if (!editedHeadline.trim() || !editedSummary.trim()) {
      setErrorMessage('Please enter a valid Headline and Summary before verification.');
      return;
    }

    setErrorMessage(null);
    setCurrentStep('verifying');
    setProgressStatusMsg('🔎 Checking available sources...');

    const timer1 = setTimeout(() => {
      setProgressStatusMsg('🧠 Comparing with existing stories in database...');
    }, 800);

    const timer2 = setTimeout(() => {
      setProgressStatusMsg('🔄 Checking whether this is an update...');
    }, 1600);

    const timer3 = setTimeout(() => {
      setProgressStatusMsg('🛡️ Running content integrity & safety scan...');
    }, 2400);

    try {
      const primaryMedia = mediaList[0];
      const res = await verificationClient.verifyNews({
        headline: editedHeadline.trim(),
        summary: editedSummary.trim(),
        fullStory: editedFullStory.trim() || editedSummary.trim(),
        category: editedCategory,
        date: editedDate,
        location: editedLocation,
        sourceUrl: sourceUrl.trim() || undefined,
        mediaDataUrl: primaryMedia?.dataUrl,
        entities: extractedEntities,
      });

      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);

      setVerificationReport(res.report);
      setSimilarityMatches(res.similarityMatches);
      setOverallStatus(res.overallStatus);
      setClassification(res.classification);
      setSourceRecord(res.sourceRecord);
      setSafetyScan(res.safetyScan);

      setCurrentStep('verification_result');
    } catch (err: any) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      setErrorMessage(err.message || 'Verification pipeline encountered an issue.');
      setCurrentStep('review_extracted');
    }
  };

  // 7. Proceed to Preview
  const handleProceedToPreview = () => {
    setCurrentStep('preview');
  };

  // 8. Final Submit for Verification / Editorial Review
  const handleFinalSubmit = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const payload: Partial<NewsSubmission> = {
        mediaList,
        extractedEntities,
        editedHeadline,
        editedCategory,
        editedSummary,
        editedFullStory,
        editedLocation,
        editedDate,
        sourceName: sourceRecord?.name || (sourceUrl ? new URL(sourceUrl).hostname : 'Primary Contributor'),
        sourceUrl: sourceUrl.trim(),
        sourceRecord,
        safetyScan,
        verificationStatus: overallStatus,
        verificationReport: verificationReport || undefined,
        similarityScore: verificationReport?.duplicateSimilarity || 0,
        classification,
        matchingMatches: similarityMatches,
        userId: currentUser?.id,
        userName: currentUser?.name,
        userEmail: currentUser?.email,
      };

      const res = await verificationClient.submitNews(payload);
      setCreatedSubmission(res.submission);
      setCurrentStep('success');

      if (onSubmittedSuccess) {
        onSubmittedSuccess(res.submission);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit news for verification.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-fade-in"
        onClick={(e) => {
          if (e.target === e.currentTarget && !isProcessing) {
            onClose();
          }
        }}
      >
        <div className="relative w-full max-w-3xl liquid-glass-modal rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92dvh] specular-line border border-white/20 dark:border-white/10 bg-[var(--background-secondary)] text-[var(--text-primary)]">
          {/* Header */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 shrink-0">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-[#0071E3] to-[#34C759] flex items-center justify-center text-white shadow-md shrink-0">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] flex items-center gap-1.5 sm:gap-2 truncate">
                  <span>News Verification</span>
                  <span className="hidden xs:inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-[var(--accent-primary)] border border-blue-500/20">
                    Dual Pipeline
                  </span>
                </h2>
                <p className="text-[11px] sm:text-xs text-[var(--text-secondary)] truncate">
                  OCR extraction, automated fact cross-checking & editorial review
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={isProcessing}
              className="p-1.5 sm:p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50 shrink-0 tap-target-44"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper Indicator */}
          <div className="px-3 sm:px-6 py-2 sm:py-2.5 bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/5 flex items-center justify-between text-xs overflow-x-auto no-scrollbar shrink-0 gap-1.5">
            {[
              { id: 'input', label: '1. Ingestion' },
              { id: 'review_extracted', label: '2. OCR Extract & Edit' },
              { id: 'verification_result', label: '3. Verification' },
              { id: 'preview', label: '4. Preview & Submit' },
            ].map((step, idx) => {
              const isCurrent =
                currentStep === step.id ||
                (step.id === 'input' && currentStep === 'extracting') ||
                (step.id === 'review_extracted' && currentStep === 'verifying');
              const isPassed =
                (step.id === 'input' && currentStep !== 'input' && currentStep !== 'extracting') ||
                (step.id === 'review_extracted' &&
                  (currentStep === 'verification_result' || currentStep === 'preview' || currentStep === 'success')) ||
                (step.id === 'verification_result' && (currentStep === 'preview' || currentStep === 'success'));

              return (
                <div key={step.id} className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold transition-all whitespace-nowrap ${
                      isCurrent
                        ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                        : isPassed
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : 'text-[var(--text-tertiary)]'
                    }`}
                  >
                    {step.label}
                  </span>
                  {idx < 3 && <ChevronRight className="w-3 h-3 text-[var(--text-tertiary)]" />}
                </div>
              );
            })}
          </div>

          {/* Body Content Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Error Notification */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 animate-shake">
                <AlertOctagon className="w-4 h-4 shrink-0" />
                <span className="flex-1">{errorMessage}</span>
                <button onClick={() => setErrorMessage(null)} className="p-1 hover:bg-rose-500/20 rounded">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* STEP 1: INGESTION TABS */}
            {currentStep === 'input' && (
              <div className="space-y-5 animate-fade-in">
                {/* Mode Selector Tabs */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <button
                    onClick={() => {
                      setActiveTab('camera');
                      setIsCameraModalOpen(true);
                    }}
                    className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all tap-target-44 ${
                      activeTab === 'camera'
                        ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-bold'
                        : 'border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-secondary)]'
                    }`}
                  >
                    <Camera className="w-5 h-5 text-[#0071E3]" />
                    <span className="text-xs">Take Photo</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('upload_image');
                      fileInputRef.current?.click();
                    }}
                    className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all tap-target-44 ${
                      activeTab === 'upload_image'
                        ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-bold'
                        : 'border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-secondary)]'
                    }`}
                  >
                    <Upload className="w-5 h-5 text-[#34C759]" />
                    <span className="text-xs">Upload Image</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('upload_video');
                      videoInputRef.current?.click();
                    }}
                    className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all tap-target-44 ${
                      activeTab === 'upload_video'
                        ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-bold'
                        : 'border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-secondary)]'
                    }`}
                  >
                    <Video className="w-5 h-5 text-[#FF9500]" />
                    <span className="text-xs">Upload Video</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('paste_text')}
                    className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all tap-target-44 ${
                      activeTab === 'paste_text'
                        ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-bold'
                        : 'border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-secondary)]'
                    }`}
                  >
                    <FileText className="w-5 h-5 text-[#AF52DE]" />
                    <span className="text-xs">Paste Text</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('source_url')}
                    className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all tap-target-44 col-span-2 sm:col-span-1 ${
                      activeTab === 'source_url'
                        ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-bold'
                        : 'border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-secondary)]'
                    }`}
                  >
                    <LinkIcon className="w-5 h-5 text-[#5856D6]" />
                    <span className="text-xs">Source URL</span>
                  </button>
                </div>

                {/* Hidden File Inputs */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageFilesSelected}
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  multiple
                  className="hidden"
                />
                <input
                  type="file"
                  ref={videoInputRef}
                  onChange={handleVideoFileSelected}
                  accept="video/mp4,video/webm,video/quicktime"
                  className="hidden"
                />

                {/* Media Roll & Previews */}
                {mediaList.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)]">
                      <span>Attached News Media ({mediaList.length}):</span>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[var(--accent-primary)] hover:underline flex items-center gap-1 text-[11px]"
                      >
                        + Add More Pages
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {mediaList.map((m, idx) => (
                        <div
                          key={m.id}
                          className="relative group rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 bg-black/5 aspect-video flex items-center justify-center shadow-sm"
                        >
                          {m.type === 'video' ? (
                            <video src={m.dataUrl} className="w-full h-full object-cover" />
                          ) : (
                            <img src={m.dataUrl} alt={m.filename} className="w-full h-full object-cover" />
                          )}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity gap-2">
                            <button
                              onClick={() => handleRemoveMedia(m.id)}
                              className="p-1.5 rounded-full bg-rose-600 text-white hover:scale-110 transition-transform"
                              title="Delete"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] font-mono">
                            Page {idx + 1} · {formatBytes(m.sizeBytes)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Text Input area (for Paste Text mode) */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] flex items-center justify-between">
                    <span>News Text (Manual Entry or Supplementary Context)</span>
                    <span className="text-[11px] font-normal text-[var(--text-tertiary)]">
                      {pastedText.length} characters
                    </span>
                  </label>
                  <textarea
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="Paste full news story, newspaper report text, press statement, or speech transcript..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-2xl border border-black/10 dark:border-white/10 bg-white/5 focus:outline-hidden focus:ring-2 focus:ring-[var(--accent-primary)] text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] resize-none"
                  />
                </div>

                {/* Source URL Input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                    <span>Primary Source URL (Official Portal, Gazette, Newsroom)</span>
                  </label>
                  <input
                    type="url"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="https://www.startupindia.gov.in/schemes/... or https://reuters.com/..."
                    className="w-full px-4 py-2.5 rounded-2xl border border-black/10 dark:border-white/10 bg-white/5 focus:outline-hidden focus:ring-2 focus:ring-[var(--accent-primary)] text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)]"
                  />
                </div>

                {/* Camera Trigger Card if nothing selected */}
                {mediaList.length === 0 && !pastedText.trim() && (
                  <div
                    onClick={() => setIsCameraModalOpen(true)}
                    className="p-6 rounded-3xl border-2 border-dashed border-[var(--accent-primary)]/40 hover:border-[var(--accent-primary)] bg-[var(--accent-primary)]/5 cursor-pointer text-center space-y-2 transition-all hover:scale-[1.01]"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] flex items-center justify-center mx-auto">
                      <Camera className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-extrabold text-[var(--text-primary)]">
                      Photograph Physical News or Document
                    </h4>
                    <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
                      Click to activate your camera and photograph a newspaper column, TV news screen, or official gazette document for high-accuracy OCR.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* PROCESSING ANIMATION (Extracting / Verifying) */}
            {(currentStep === 'extracting' || currentStep === 'verifying') && (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-fade-in">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 rounded-full border-4 border-[var(--accent-primary)]/20 border-t-[var(--accent-primary)] animate-spin" />
                  <div className="w-full h-full rounded-full flex items-center justify-center text-[var(--accent-primary)]">
                    <Sparkles className="w-8 h-8 animate-pulse" />
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[var(--text-primary)] animate-pulse">
                    {progressStatusMsg}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    Multi-tier AI OCR engine & verified source cross-checking active
                  </p>
                </div>
              </div>
            )}

            {/* STEP 2: OCR EXTRACTED REVIEW & ENTITIES */}
            {currentStep === 'review_extracted' && (
              <div className="space-y-5 animate-fade-in">
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>
                    <strong>OCR Extraction Complete.</strong> Please inspect the extracted facts and correct any typographical or numerical errors before automated verification.
                  </span>
                </div>

                {/* Structured Detected Entities Tag Cloud */}
                <div className="p-4 rounded-3xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 space-y-3">
                  <h4 className="text-xs font-extrabold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                    Automatically Detected Entities
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* People & Orgs */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-[var(--text-secondary)] flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-blue-500" /> People Mentioned:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {extractedEntities.people.length > 0 ? (
                          extractedEntities.people.map((p, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 text-[11px] font-semibold">
                              {p}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-[var(--text-tertiary)] italic">None explicitly identified</span>
                        )}
                      </div>
                    </div>

                    {/* Companies & Schemes */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-[var(--text-secondary)] flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-emerald-500" /> Companies & Startups:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {extractedEntities.companies.length > 0 ? (
                          extractedEntities.companies.map((c, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
                              {c}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-[var(--text-tertiary)] italic">None identified</span>
                        )}
                      </div>
                    </div>

                    {/* Government Schemes */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-[var(--text-secondary)] flex items-center gap-1">
                        <Landmark className="w-3.5 h-3.5 text-purple-500" /> Government Schemes / Policy:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {extractedEntities.governmentSchemes.length > 0 ? (
                          extractedEntities.governmentSchemes.map((s, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 text-[11px] font-semibold">
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-[var(--text-tertiary)] italic">None identified</span>
                        )}
                      </div>
                    </div>

                    {/* Numbers & Statistics */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-[var(--text-secondary)] flex items-center gap-1">
                        <Hash className="w-3.5 h-3.5 text-amber-500" /> Key Numbers & Figures:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {extractedEntities.numbers.length > 0 ? (
                          extractedEntities.numbers.map((n, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 text-[11px] font-semibold font-mono">
                              {n}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-[var(--text-tertiary)] italic">None identified</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Editable Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1 mb-1">
                      <Edit3 className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                      <span>Readable Headline</span>
                    </label>
                    <input
                      type="text"
                      value={editedHeadline}
                      onChange={(e) => setEditedHeadline(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl border border-black/10 dark:border-white/10 bg-white/5 focus:outline-hidden focus:ring-2 focus:ring-[var(--accent-primary)] text-sm font-bold text-[var(--text-primary)]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                        Category
                      </label>
                      <select
                        value={editedCategory}
                        onChange={(e) => setEditedCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-2xl border border-black/10 dark:border-white/10 bg-white/5 text-xs text-[var(--text-primary)] font-semibold"
                      >
                        <option value="funding">Funding & Capital</option>
                        <option value="startup-launches">Startup Launches</option>
                        <option value="government-schemes">Government Schemes</option>
                        <option value="investors">Investors & VCs</option>
                        <option value="opportunities">Grants & Fellowships</option>
                        <option value="events">Events & Summits</option>
                        <option value="problems">Reported Problems</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                        Location / Jurisdiction
                      </label>
                      <input
                        type="text"
                        value={editedLocation}
                        onChange={(e) => setEditedLocation(e.target.value)}
                        className="w-full px-3 py-2 rounded-2xl border border-black/10 dark:border-white/10 bg-white/5 text-xs text-[var(--text-primary)]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                        Publication / Event Date
                      </label>
                      <input
                        type="date"
                        value={editedDate}
                        onChange={(e) => setEditedDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-2xl border border-black/10 dark:border-white/10 bg-white/5 text-xs text-[var(--text-primary)]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                      Executive Summary (Cleaned)
                    </label>
                    <textarea
                      value={editedSummary}
                      onChange={(e) => setEditedSummary(e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2.5 rounded-2xl border border-black/10 dark:border-white/10 bg-white/5 focus:outline-hidden focus:ring-2 focus:ring-[var(--accent-primary)] text-xs text-[var(--text-primary)] resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1">
                      Full News Story (Cleaned OCR Body)
                    </label>
                    <textarea
                      value={editedFullStory}
                      onChange={(e) => setEditedFullStory(e.target.value)}
                      rows={5}
                      className="w-full px-4 py-2.5 rounded-2xl border border-black/10 dark:border-white/10 bg-white/5 focus:outline-hidden focus:ring-2 focus:ring-[var(--accent-primary)] text-xs text-[var(--text-primary)] resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: VERIFICATION RESULTS & SIMILARITY CHECK */}
            {currentStep === 'verification_result' && verificationReport && (
              <div className="space-y-5 animate-fade-in">
                {/* Status Hero Card */}
                <div
                  className={`p-5 rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    overallStatus === 'verified'
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : overallStatus === 'needs_review'
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : overallStatus === 'duplicate_already_covered'
                      ? 'bg-slate-500/10 border-slate-500/30'
                      : 'bg-rose-500/10 border-rose-500/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${
                        overallStatus === 'verified'
                          ? 'bg-emerald-500'
                          : overallStatus === 'needs_review'
                          ? 'bg-amber-500'
                          : overallStatus === 'duplicate_already_covered'
                          ? 'bg-slate-600'
                          : 'bg-rose-500'
                      }`}
                    >
                      {overallStatus === 'verified' ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : overallStatus === 'needs_review' ? (
                        <AlertTriangle className="w-6 h-6" />
                      ) : (
                        <ShieldAlert className="w-6 h-6" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-extrabold capitalize">
                          {overallStatus.replace(/_/g, ' ')}
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10">
                          AI Confidence: {verificationReport.aiConfidence}%
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                        {overallStatus === 'verified'
                          ? 'Corroborated by verified primary source; no major conflicts detected.'
                          : overallStatus === 'needs_review'
                          ? 'Submission requires editorial staff review before publication.'
                          : overallStatus === 'duplicate_already_covered'
                          ? 'High semantic overlap with an existing database article.'
                          : 'Potential anomalies or uncorroborated assertions identified.'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-black/10 dark:bg-white/10 uppercase tracking-wider">
                      {classification.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {/* SIMILARITY ALERT (If similar news exists) */}
                {verificationReport.duplicateSimilarity >= 50 && similarityMatches.length > 0 && (
                  <div className="p-4 rounded-3xl bg-amber-500/10 border-2 border-amber-500/40 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                        <div>
                          <h4 className="text-sm font-extrabold text-amber-900 dark:text-amber-300">
                            Similar News Already Exists (Similarity: {verificationReport.duplicateSimilarity}%)
                          </h4>
                          <p className="text-xs text-amber-800 dark:text-amber-400 mt-0.5">
                            {classification === 'existing_update'
                              ? 'This appears to be an UPDATE containing new guidelines or milestone progress for an existing story.'
                              : 'This appears to describe the same event as an existing article in the database.'}
                          </p>
                        </div>
                      </div>

                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300">
                        {similarityMatches[0]?.detectedType.toUpperCase()}
                      </span>
                    </div>

                    {/* Matched existing story preview */}
                    <div className="p-3 rounded-2xl bg-white/40 dark:bg-black/40 border border-amber-500/20 space-y-1.5 text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                        Existing Article in Database:
                      </span>
                      <h5 className="font-bold text-[var(--text-primary)]">
                        {similarityMatches[0]?.matchedHeadline}
                      </h5>
                      <p className="text-[var(--text-secondary)] text-[11px] line-clamp-2">
                        {similarityMatches[0]?.matchedSummary}
                      </p>
                      {similarityMatches[0]?.novelPointsFound && similarityMatches[0].novelPointsFound.length > 0 && (
                        <div className="pt-1 flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>New Information: {similarityMatches[0].novelPointsFound.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 8-Point Verification Checklist */}
                <div className="p-4 rounded-3xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 space-y-3">
                  <h4 className="text-xs font-extrabold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[var(--accent-primary)]" />
                    Automated Verification Pipeline Checks
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    {[
                      { label: 'Event Existence Corroboration', check: verificationReport.checks.eventExists },
                      { label: 'Publication Date Validity', check: verificationReport.checks.dateAccurate },
                      { label: 'Location Jurisdiction Accuracy', check: verificationReport.checks.locationAccurate },
                      { label: 'Entities & People Cross-check', check: verificationReport.checks.entitiesAccurate },
                      { label: 'Numerical Claims Supported', check: verificationReport.checks.numbersSupported },
                      { label: 'Headline Contextual Alignment', check: verificationReport.checks.headlineAccurate },
                      { label: 'Recency & Outdated Check', check: verificationReport.checks.recencyStatus },
                      { label: 'Content Safety & Forensic Integrity', check: verificationReport.checks.contentIntegrity },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-2xl bg-white/5 border border-black/5 dark:border-white/5 flex items-start gap-2"
                      >
                        {item.check.status ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <span className="font-bold text-[var(--text-primary)] block text-[11px]">
                            {item.label}
                          </span>
                          <span className="text-[10px] text-[var(--text-secondary)] line-clamp-2">
                            {item.check.evidence}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Strict AI Confidence Disclaimer mandated by user guidelines */}
                <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[11px] text-[var(--text-secondary)] flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[var(--text-primary)]">Editorial Standard Disclaimer: </span>
                    {verificationReport.aiConfidenceDisclaimer}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: PREVIEW */}
            {currentStep === 'preview' && (
              <div className="space-y-5 animate-fade-in">
                <div className="p-5 rounded-3xl bg-white/10 dark:bg-black/30 border border-black/10 dark:border-white/10 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] text-[10px] font-extrabold uppercase">
                      {editedCategory}
                    </span>
                    <span className="text-[11px] text-[var(--text-secondary)] flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {editedDate} · <MapPin className="w-3 h-3" /> {editedLocation}
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-[var(--text-primary)] leading-snug">
                    {editedHeadline}
                  </h3>

                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed italic">
                    "{editedSummary}"
                  </p>

                  <div className="text-xs text-[var(--text-primary)] leading-relaxed whitespace-pre-line pt-2 border-t border-black/5 dark:border-white/5">
                    {editedFullStory}
                  </div>

                  {sourceUrl && (
                    <div className="pt-2 flex items-center gap-1.5 text-xs text-[var(--accent-primary)]">
                      <ExternalLink className="w-3.5 h-3.5" />
                      <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        Primary Source: {sourceRecord?.name || sourceUrl}
                      </a>
                    </div>
                  )}

                  {mediaList.length > 0 && (
                    <div className="pt-2 flex gap-2 overflow-x-auto no-scrollbar">
                      {mediaList.map((m) => (
                        <img
                          key={m.id}
                          src={m.dataUrl}
                          alt="Attached media"
                          className="w-20 h-14 object-cover rounded-xl border border-black/10 dark:border-white/10"
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-[var(--text-secondary)] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>
                    <strong>Submission Queue:</strong> Regular users submit to the verification queue. Submissions are reviewed by editorial administration prior to general publication.
                  </span>
                </div>
              </div>
            )}

            {/* STEP 5: SUCCESS & TRACKING */}
            {currentStep === 'success' && createdSubmission && (
              <div className="py-8 text-center space-y-4 animate-fade-in">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto shadow-lg">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-[var(--text-primary)]">
                    News Submitted for Verification
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-md mx-auto">
                    Your news report has entered the editorial queue with tracking ID:
                  </p>
                  <span className="inline-block mt-2 px-3 py-1 rounded-xl bg-black/10 dark:bg-white/10 font-mono text-xs font-bold text-[var(--accent-primary)]">
                    {createdSubmission.id}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 max-w-md mx-auto text-left text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Verification Status:</span>
                    <span className="font-bold capitalize">{createdSubmission.verificationStatus.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Review Status:</span>
                    <span className="font-bold capitalize">{createdSubmission.reviewStatus.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Classification:</span>
                    <span className="font-bold capitalize">{createdSubmission.classification.replace(/_/g, ' ')}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    handleReset();
                    onClose();
                  }}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#0071E3] to-[#34C759] text-white text-xs font-bold shadow-md hover:brightness-110 active:scale-98"
                >
                  Done
                </button>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          {currentStep !== 'extracting' && currentStep !== 'verifying' && currentStep !== 'success' && (
            <div className="px-4 sm:px-6 py-3 sm:py-3.5 bg-black/5 dark:bg-white/5 border-t border-black/10 dark:border-white/10 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 shrink-0">
              {/* Back / Cancel */}
              {currentStep === 'input' ? (
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-2xl hover:bg-black/10 dark:hover:bg-white/10 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-center tap-target-44"
                >
                  Cancel
                </button>
              ) : currentStep === 'review_extracted' ? (
                <button
                  onClick={() => setCurrentStep('input')}
                  className="px-4 py-2 rounded-2xl hover:bg-black/10 dark:hover:bg-white/10 text-xs font-semibold text-[var(--text-secondary)] flex items-center justify-center gap-1.5 tap-target-44"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Media
                </button>
              ) : currentStep === 'verification_result' ? (
                <button
                  onClick={() => setCurrentStep('review_extracted')}
                  className="px-4 py-2 rounded-2xl hover:bg-black/10 dark:hover:bg-white/10 text-xs font-semibold text-[var(--text-secondary)] flex items-center justify-center gap-1.5 tap-target-44"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Edit Information
                </button>
              ) : (
                <button
                  onClick={() => setCurrentStep('verification_result')}
                  className="px-4 py-2 rounded-2xl hover:bg-black/10 dark:hover:bg-white/10 text-xs font-semibold text-[var(--text-secondary)] flex items-center justify-center gap-1.5 tap-target-44"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
              )}

              {/* Next Action */}
              {currentStep === 'input' && (
                <button
                  onClick={handleTriggerExtraction}
                  disabled={mediaList.length === 0 && !pastedText.trim() && !sourceUrl.trim()}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#0071E3] to-[#34C759] text-white text-xs font-bold shadow-md hover:brightness-110 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 tap-target-44"
                >
                  <span>Extract News & Run OCR</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {currentStep === 'review_extracted' && (
                <button
                  onClick={handleTriggerVerification}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#0071E3] to-[#34C759] text-white text-xs font-bold shadow-md hover:brightness-110 active:scale-98 flex items-center justify-center gap-2 tap-target-44"
                >
                  <span>Run Verification & Similarity Checks</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {currentStep === 'verification_result' && (
                <button
                  onClick={handleProceedToPreview}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#0071E3] to-[#34C759] text-white text-xs font-bold shadow-md hover:brightness-110 active:scale-98 flex items-center justify-center gap-2 tap-target-44"
                >
                  <span>Preview Story</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {currentStep === 'preview' && (
                <div className="flex items-center gap-2 flex-col sm:flex-row">
                  <button
                    onClick={() => setCurrentStep('review_extracted')}
                    className="w-full sm:w-auto px-4 py-2 rounded-2xl border border-black/10 dark:border-white/10 text-xs font-bold hover:bg-black/5 text-center tap-target-44"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleFinalSubmit}
                    disabled={isProcessing}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#0071E3] to-[#34C759] text-white text-xs font-bold shadow-md hover:brightness-110 active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 tap-target-44"
                  >
                    {isProcessing ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                    <span>Submit for Verification</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Device Camera Modal */}
      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCaptureComplete={handleCameraCaptureComplete}
      />
    </>
  );
};
