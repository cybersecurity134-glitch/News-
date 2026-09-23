/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CompressionResult {
  dataUrl: string;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  width: number;
  height: number;
  compressionRatio: number;
}

/**
 * Compresses an image file client-side using HTML5 Canvas.
 * Maintains high resolution (max 2048px) and sharpness to preserve readable text for OCR.
 */
export async function compressImageForOcr(
  file: File,
  maxDimension = 2048,
  quality = 0.88
): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    const originalSizeBytes = file.size;
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image element'));
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Scale proportionally if either dimension exceeds maxDimension
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve({
            dataUrl: e.target?.result as string,
            originalSizeBytes,
            compressedSizeBytes: originalSizeBytes,
            width,
            height,
            compressionRatio: 1,
          });
        }

        // Apply slight image smoothing for high legibility
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const compressedDataUrl = canvas.toDataURL(mime, quality);

        // Approximate size from base64
        const head = `data:${mime};base64,`;
        const base64Length = compressedDataUrl.length - head.length;
        const compressedSizeBytes = Math.round((base64Length * 3) / 4);
        const compressionRatio = Number((compressedSizeBytes / originalSizeBytes).toFixed(2));

        resolve({
          dataUrl: compressedDataUrl,
          originalSizeBytes,
          compressedSizeBytes,
          width,
          height,
          compressionRatio,
        });
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Format bytes into human readable format (e.g. 1.4 MB)
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
