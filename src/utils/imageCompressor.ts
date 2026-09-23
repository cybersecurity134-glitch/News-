/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Compresses an image on the client device:
 * - Max dimension: 1600px (width or height, maintaining aspect ratio)
 * - Format: WebP (with fallback to JPEG)
 * - Quality: ~80% (0.82)
 */
export async function compressImage(
  fileOrBase64: File | Blob | string,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    let srcUrl: string;
    let shouldRevoke = false;

    if (typeof fileOrBase64 === 'string') {
      srcUrl = fileOrBase64;
    } else {
      srcUrl = URL.createObjectURL(fileOrBase64);
      shouldRevoke = true;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      if (shouldRevoke) {
        URL.revokeObjectURL(srcUrl);
      }

      let { width, height } = img;

      // Check if resizing is needed
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        // Fallback to original string if canvas context is unavailable
        resolve(typeof fileOrBase64 === 'string' ? fileOrBase64 : '');
        return;
      }

      // Smooth bicubic downsampling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Attempt webp first, with jpeg fallback
      try {
        const webpData = canvas.toDataURL('image/webp', quality);
        if (webpData.startsWith('data:image/webp')) {
          resolve(webpData);
          return;
        }
      } catch {
        // Fallback to jpeg
      }

      const jpegData = canvas.toDataURL('image/jpeg', quality);
      resolve(jpegData);
    };

    img.onerror = (err) => {
      if (shouldRevoke) {
        URL.revokeObjectURL(srcUrl);
      }
      reject(new Error('Failed to load image for compression'));
    };

    img.src = srcUrl;
  });
}
