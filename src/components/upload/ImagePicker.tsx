/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { Camera, Image as ImageIcon, X, RefreshCw, AlertCircle } from 'lucide-react';
import { compressImage } from '../../utils/imageCompressor';

interface ImagePickerProps {
  imagePreview: string | null;
  onImageSelected: (base64OrUrl: string | null) => void;
}

export const ImagePicker: React.FC<ImagePickerProps> = ({
  imagePreview,
  onImageSelected,
}) => {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isCompressing, setIsCompressing] = useState(false);
  const [showLiveCamera, setShowLiveCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraNotice, setCameraNotice] = useState<string | null>(null);

  // Stop camera stream safely when unmounting or closing
  const stopCameraStream = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, [cameraStream]);

  // Connect video element to stream when live camera modal opens
  useEffect(() => {
    if (showLiveCamera && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(() => {
        // Autoplay may be restricted
      });
    }
  }, [showLiveCamera, cameraStream]);

  const handleFile = async (file: File) => {
    try {
      setIsCompressing(true);
      setCameraNotice(null);
      const compressed = await compressImage(file, 1600, 1600, 0.82);
      onImageSelected(compressed);
    } catch {
      setCameraNotice('Unable to process the selected photo. Please try a different image.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    // Reset value so same file can be re-selected if desired
    e.target.value = '';
  };

  const handleStartCamera = async () => {
    setCameraNotice(null);

    // Check if mediaDevices is supported in current environment/context
    if (
      typeof navigator !== 'undefined' &&
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function'
    ) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
        setCameraStream(stream);
        setShowLiveCamera(true);
        return;
      } catch (err: any) {
        // Permission denied or camera unavailable in iframe: fallback gracefully to native file input
        setCameraNotice('Direct camera access was denied or unsupported. Opening device file capture.');
      }
    } else {
      setCameraNotice('Browser camera API not available. Opening system camera picker.');
    }

    // Fallback: trigger file input with capture="environment"
    cameraInputRef.current?.click();
  };

  const handleCapturePhoto = async () => {
    if (!videoRef.current || !cameraStream) return;

    try {
      setIsCompressing(true);
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const rawData = canvas.toDataURL('image/jpeg', 0.9);
        stopCameraStream();
        setShowLiveCamera(false);

        const compressed = await compressImage(rawData, 1600, 1600, 0.82);
        onImageSelected(compressed);
      }
    } catch {
      setCameraNotice('Failed to capture photo from video feed.');
    } finally {
      setIsCompressing(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-[var(--color-text-secondary)]">
        Story Photo / Visual (Camera or Gallery)
      </label>

      {/* Hidden file inputs with environment capture fallback */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleInputChange}
        className="hidden"
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />

      {cameraNotice && (
        <div className="p-2.5 rounded-[12px] bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{cameraNotice}</span>
        </div>
      )}

      {/* Live Viewfinder Modal if direct camera is active */}
      {showLiveCamera && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-[16px] overflow-hidden p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-serif text-sm font-bold text-[var(--color-text-primary)]">
                Take Photo
              </span>
              <button
                type="button"
                onClick={() => {
                  stopCameraStream();
                  setShowLiveCamera(false);
                }}
                className="p-1 rounded-full text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-4/3 bg-black rounded-[12px] overflow-hidden">
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  stopCameraStream();
                  setShowLiveCamera(false);
                }}
                className="px-4 py-2 min-h-[44px] rounded-full border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCapturePhoto}
                disabled={isCompressing}
                className="px-6 py-2 min-h-[44px] rounded-full bg-[var(--color-accent)] text-[#0B1F3A] text-xs font-bold hover:opacity-95 active:scale-[0.97] transition-all flex items-center gap-2"
              >
                {isCompressing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
                <span>Capture</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Container */}
      {isCompressing ? (
        <div className="h-44 rounded-[16px] border border-[var(--color-border)] bg-[var(--color-card-bg)] flex flex-col items-center justify-center text-xs text-[var(--color-text-secondary)] gap-2 animate-pulse">
          <RefreshCw className="w-5 h-5 animate-spin text-[var(--color-accent)]" />
          <span>Compressing image on device...</span>
        </div>
      ) : imagePreview ? (
        <div className="relative rounded-[16px] overflow-hidden border border-[var(--color-border)] aspect-16/9 bg-black/5 dark:bg-white/5">
          <img
            src={imagePreview}
            alt="Upload Preview"
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
          />
          <button
            type="button"
            onClick={() => onImageSelected(null)}
            className="absolute top-2.5 right-2.5 p-2 rounded-full bg-black/70 text-white hover:bg-black transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="p-5 rounded-[16px] border border-dashed border-[var(--color-border)] bg-[var(--color-card-bg)] text-center space-y-3">
          <p className="text-xs text-[var(--color-text-secondary)]">
            Upload verified article screenshot, founder photo, or chart (compressed to max 1600px)
          </p>

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleStartCamera}
              className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] rounded-full border border-[var(--color-border)] bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-semibold text-[var(--color-text-primary)] active:scale-[0.97] transition-all"
            >
              <Camera className="w-4 h-4 text-[var(--color-accent)]" />
              <span>Take Photo</span>
            </button>

            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] rounded-full border border-[var(--color-border)] bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-semibold text-[var(--color-text-primary)] active:scale-[0.97] transition-all"
            >
              <ImageIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Gallery</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
