/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Camera,
  RefreshCw,
  Check,
  Trash2,
  Shield,
  AlertCircle,
  Plus,
  Sparkles,
  Layers,
} from 'lucide-react';
import { compressImageForOcr } from './ImageCompressor';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCaptureComplete: (capturedImages: { dataUrl: string; filename: string }[]) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCaptureComplete,
}) => {
  // Permission state
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Photos roll
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [flashEffect, setFlashEffect] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera helper
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  // Start camera stream after explicit user permission
  const startCamera = useCallback(async (mode: 'environment' | 'user') => {
    stopCamera();
    setErrorMessage(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera hardware API is not supported on this browser or device.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
      setPermissionState('granted');
    } catch (err: any) {
      console.warn('[CAMERA] Access denied or error:', err);
      setPermissionState('denied');
      setErrorMessage(
        err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? 'Camera access was denied. Please allow camera permissions in your browser or device settings to photograph news documents.'
          : err.message || 'Unable to access camera on this device.'
      );
    }
  }, [stopCamera]);

  // Handle explicit permission confirmation
  const handleGrantPermission = () => {
    setPermissionState('granted');
    startCamera(facingMode);
  };

  // Switch camera front/back
  const handleToggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Shutter action
  const handleSnapPhoto = () => {
    if (!videoRef.current) return;

    setFlashEffect(true);
    setTimeout(() => setFlashEffect(false), 200);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1920;
    canvas.height = video.videoHeight || 1080;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const photoDataUrl = canvas.toDataURL('image/jpeg', 0.92);

    setCapturedPhotos((prev) => [...prev, photoDataUrl]);
  };

  // Delete specific captured photo
  const handleDeletePhoto = (index: number) => {
    setCapturedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // Finish and send photos to parent
  const handleConfirmPhotos = async () => {
    if (capturedPhotos.length === 0) return;

    const results = capturedPhotos.map((dataUrl, idx) => ({
      dataUrl,
      filename: `camera_news_capture_page_${idx + 1}.jpg`,
    }));

    stopCamera();
    onCaptureComplete(results);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedPhotos([]);
      setPermissionState('prompt');
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, stopCamera]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          stopCamera();
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-xl liquid-glass-modal rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92dvh] specular-line border border-white/20 dark:border-white/10">
        {/* Header */}
        <div className="px-5 py-3.5 flex items-center justify-between border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0071E3] to-[#34C759] flex items-center justify-center text-white">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[var(--text-primary)]">
                Photograph News Source
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Newspaper, TV news broadcast, official document, or poster
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="Close camera"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder / Body Area */}
        <div className="relative flex-1 bg-black min-h-[360px] sm:min-h-[420px] flex items-center justify-center overflow-hidden">
          {/* Permission Prompt Modal state */}
          {permissionState === 'prompt' && (
            <div className="p-6 text-center max-w-sm space-y-4">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-[var(--color-primary-subtle)] text-[var(--color-primary)] flex items-center justify-center border border-[var(--color-primary-border)]">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-white">
                  Device Camera Access
                </h4>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  VenturePulse uses your device camera solely to photograph physical newspapers, television screens, or official documents for optical character recognition (OCR).
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-white/10 text-[11px] text-slate-300 flex items-center gap-2 text-left">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Camera access will never activate without your explicit permission.</span>
              </div>
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={handleGrantPermission}
                  className="w-full py-3 rounded-2xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-primary-fg)] text-xs font-bold shadow-lg active:scale-98 transition-all"
                >
                  Allow Camera & Start Viewfinder
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-2.5 rounded-2xl hover:bg-white/10 text-slate-400 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Camera Denied State */}
          {permissionState === 'denied' && (
            <div className="p-6 text-center max-w-sm space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white">Camera Access Required</h4>
              <p className="text-xs text-slate-400">
                {errorMessage || 'Camera access was blocked by your browser settings.'}
              </p>
              <button
                onClick={() => startCamera(facingMode)}
                className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold"
              >
                Retry Camera
              </button>
            </div>
          )}

          {/* Active Live Video Stream */}
          {permissionState === 'granted' && (
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Shutter Flash Animation */}
              {flashEffect && (
                <div className="absolute inset-0 bg-white opacity-85 transition-opacity duration-150 pointer-events-none" />
              )}

              {/* Viewfinder Target Reticle */}
              <div className="absolute inset-8 sm:inset-12 border-2 border-white/40 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
                <div className="flex justify-between items-start">
                  <div className="w-4 h-4 border-t-2 border-l-2 border-white rounded-tl" />
                  <span className="text-[10px] font-mono text-white/80 bg-black/50 px-2 py-0.5 rounded-full">
                    ALIGN NEWS TEXT / HEADLINE
                  </span>
                  <div className="w-4 h-4 border-t-2 border-r-2 border-white rounded-tr" />
                </div>
                <div className="flex justify-between items-end">
                  <div className="w-4 h-4 border-b-2 border-l-2 border-white rounded-bl" />
                  <div className="w-4 h-4 border-b-2 border-r-2 border-white rounded-br" />
                </div>
              </div>

              {/* Switch Camera (Front/Rear) control */}
              <button
                onClick={handleToggleFacingMode}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/20 active:rotate-180 transition-transform"
                title="Flip Camera (Front/Back)"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Captured Multi-Photo Roll Carousel */}
        {capturedPhotos.length > 0 && (
          <div className="px-4 py-2.5 bg-black/10 dark:bg-white/5 border-t border-black/10 dark:border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-bold text-[var(--text-secondary)] whitespace-nowrap flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
              {capturedPhotos.length} {capturedPhotos.length === 1 ? 'Page' : 'Pages'}:
            </span>
            {capturedPhotos.map((photo, index) => (
              <div
                key={index}
                className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-[var(--accent-primary)] shrink-0 group shadow-sm"
              >
                <img src={photo} alt={`Page ${index + 1}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => handleDeletePhoto(index)}
                  className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  title="Remove page"
                >
                  <Trash2 className="w-4 h-4 text-rose-400" />
                </button>
                <span className="absolute bottom-0.5 right-0.5 text-[9px] font-bold px-1 rounded bg-black/70 text-white">
                  #{index + 1}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Shutter & Controls Bottom Bar */}
        {permissionState === 'granted' && (
          <div className="p-4 bg-[var(--background-secondary)]/80 backdrop-blur-md flex items-center justify-between gap-3 border-t border-black/10 dark:border-white/10">
            <div className="text-[11px] font-medium text-[var(--text-secondary)]">
              {capturedPhotos.length === 0
                ? 'Tap circle to snap page'
                : `${capturedPhotos.length} captured · Ready to extract`}
            </div>

            {/* Main Shutter Button */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleSnapPhoto}
                className="w-16 h-16 rounded-full border-4 border-white p-1 shadow-xl hover:scale-105 active:scale-95 transition-transform bg-gradient-to-tr from-[#0071E3] to-[#34C759] flex items-center justify-center"
                title="Capture Photograph"
                aria-label="Snap photo"
              >
                <div className="w-full h-full rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </button>
            </div>

            {/* Confirm & Proceed Button */}
            <button
              onClick={handleConfirmPhotos}
              disabled={capturedPhotos.length === 0}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all ${
                capturedPhotos.length > 0
                  ? 'bg-gradient-to-r from-[#0071E3] to-[#34C759] text-white hover:brightness-110 active:scale-98'
                  : 'bg-black/10 dark:bg-white/10 text-[var(--text-tertiary)] cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Use {capturedPhotos.length > 1 ? `${capturedPhotos.length} Photos` : 'Photo'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
