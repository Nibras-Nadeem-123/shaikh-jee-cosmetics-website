/**
 * Image Optimization Utilities
 * Provides functions to optimize and compress images for better performance
 */

// Quality settings for different use cases
export const IMAGE_QUALITY = {
  thumbnail: 60,
  card: 75,
  detail: 85,
  hero: 90,
} as const;

// Breakpoints for responsive images
export const IMAGE_BREAKPOINTS = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
} as const;

/**
 * Generate optimized image URL with Cloudinary transformations
 * Works with Cloudinary-hosted images
 */
export const getOptimizedCloudinaryUrl = (
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
    fit?: 'fill' | 'scale' | 'fit' | 'crop' | 'thumb';
  } = {}
): string => {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  const { width, height, quality = 80, format = 'auto', fit = 'fill' } = options;

  // Parse the Cloudinary URL
  const parts = url.split('/upload/');
  if (parts.length !== 2) return url;

  // Build transformation string
  const transforms: string[] = [];

  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  transforms.push(`q_${quality}`);
  transforms.push(`f_${format}`);
  transforms.push(`c_${fit}`);

  // Add auto format and quality for best compression
  transforms.push('fl_progressive');

  return `${parts[0]}/upload/${transforms.join(',')}/${parts[1]}`;
};

/**
 * Generate srcset for responsive images
 */
export const generateSrcSet = (
  url: string,
  widths: number[] = [320, 640, 768, 1024, 1280, 1536]
): string => {
  if (!url) return '';

  return widths
    .map((w) => `${getOptimizedCloudinaryUrl(url, { width: w })} ${w}w`)
    .join(', ');
};

/**
 * Get appropriate image size based on container
 */
export const getImageSize = (
  containerType: 'thumbnail' | 'card' | 'detail' | 'hero' | 'full'
): { width: number; height: number } => {
  const sizes = {
    thumbnail: { width: 150, height: 150 },
    card: { width: 400, height: 400 },
    detail: { width: 800, height: 800 },
    hero: { width: 1920, height: 1080 },
    full: { width: 2560, height: 1440 },
  };

  return sizes[containerType];
};

/**
 * Compress image file before upload (client-side)
 */
export const compressImage = async (
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    type?: 'image/jpeg' | 'image/webp' | 'image/png';
  } = {}
): Promise<Blob> => {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.8,
    type = 'image/webp',
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        // Create canvas and draw image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          type,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Generate blur placeholder data URL
 */
export const generateBlurPlaceholder = (
  width: number = 10,
  height: number = 10,
  color: string = '#f3f4f6'
): string => {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}'%3E%3Crect fill='${encodeURIComponent(color)}' width='${width}' height='${height}'/%3E%3C/svg%3E`;
};

/**
 * Check if image format is supported
 */
export const supportsWebP = (): boolean => {
  if (typeof window === 'undefined') return false;

  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;

  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
};

/**
 * Check if AVIF is supported
 */
export const supportsAVIF = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false;

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKBzgABpAsAMIIEOPG+PjgGCgAAADKwHUX';
  });
};

/**
 * Preload critical images
 */
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Lazy load images using Intersection Observer
 */
export const createLazyImageObserver = (
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver | null => {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }

  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  };

  return new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callback(entry);
      }
    });
  }, defaultOptions);
};

// Cloudinary cloud name from environment
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';

/**
 * Get CDN-optimized URL for any image
 * Supports Cloudinary URLs and external URLs via Cloudinary fetch
 */
export const getCdnUrl = (
  imageUrl: string,
  options: {
    width?: number;
    height?: number;
    quality?: number | 'auto';
    format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
    crop?: 'fill' | 'scale' | 'fit' | 'crop' | 'thumb';
    gravity?: 'auto' | 'center' | 'face' | 'faces';
  } = {}
): string => {
  if (!imageUrl) return '';

  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'fill',
    gravity = 'auto',
  } = options;

  // If it's already a Cloudinary URL, optimize it directly
  if (imageUrl.includes('cloudinary.com')) {
    return getOptimizedCloudinaryUrl(imageUrl, {
      width,
      height,
      quality: typeof quality === 'number' ? quality : 80,
      format,
      fit: crop,
    });
  }

  // For external URLs, use Cloudinary's fetch feature if configured
  if (CLOUDINARY_CLOUD_NAME) {
    const transforms: string[] = [];

    if (width) transforms.push(`w_${width}`);
    if (height) transforms.push(`h_${height}`);
    transforms.push(`q_${quality}`);
    transforms.push(`f_${format}`);
    if (width || height) {
      transforms.push(`c_${crop}`);
      transforms.push(`g_${gravity}`);
    }

    const transformString = transforms.join(',');
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/fetch/${transformString}/${encodeURIComponent(imageUrl)}`;
  }

  // Return original URL if Cloudinary is not configured
  return imageUrl;
};

/**
 * Generate responsive srcset using CDN
 */
export const getCdnSrcSet = (
  imageUrl: string,
  widths: number[] = [320, 640, 768, 1024, 1280, 1536]
): string => {
  if (!imageUrl) return '';

  return widths
    .map((w) => `${getCdnUrl(imageUrl, { width: w })} ${w}w`)
    .join(', ');
};

/**
 * Get blur placeholder URL from CDN
 */
export const getCdnBlurPlaceholder = (imageUrl: string): string => {
  if (!imageUrl) return '';

  return getCdnUrl(imageUrl, {
    width: 20,
    quality: 30,
    format: 'webp',
  });
};

/**
 * CDN image props helper for Next.js Image component
 */
export const getCdnImageProps = (
  src: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    priority?: boolean;
  } = {}
): {
  src: string;
  blurDataURL?: string;
  placeholder?: 'blur' | 'empty';
} => {
  const { width, height, quality = 80 } = options;

  const optimizedSrc = getCdnUrl(src, { width, height, quality });

  return {
    src: optimizedSrc,
    blurDataURL: getCdnBlurPlaceholder(src),
    placeholder: 'blur' as const,
  };
};
