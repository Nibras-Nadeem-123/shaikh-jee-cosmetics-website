'use client';

import Image, { ImageProps } from 'next/image';
import { useState, useCallback } from 'react';
import { getCdnUrl, getCdnBlurPlaceholder, generateBlurPlaceholder } from '@/utils/imageOptimization';

// Cloudinary loader for Next.js Image
const cloudinaryLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  return getCdnUrl(src, {
    width,
    quality: quality || 80,
    format: 'auto',
  });
};

export interface CdnImageProps extends Omit<ImageProps, 'loader'> {
  fallbackSrc?: string;
  useCdn?: boolean;
  showPlaceholder?: boolean;
}

/**
 * CDN-optimized Image component
 * Wraps Next.js Image with automatic Cloudinary CDN optimization
 */
export default function CdnImage({
  src,
  alt,
  fallbackSrc = '/placeholder.png',
  useCdn = true,
  showPlaceholder = true,
  onError,
  ...props
}: CdnImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(typeof src === 'string' ? src : '');
  const [hasError, setHasError] = useState(false);

  const handleError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      if (!hasError) {
        setHasError(true);
        setImgSrc(fallbackSrc);
      }
      onError?.(e);
    },
    [hasError, fallbackSrc, onError]
  );

  // Use string src or fallback
  const imageSrc = typeof src === 'string' ? (hasError ? fallbackSrc : imgSrc || src) : src;

  // Generate blur placeholder
  const blurDataURL = showPlaceholder
    ? typeof imageSrc === 'string' && imageSrc.includes('cloudinary.com')
      ? getCdnBlurPlaceholder(imageSrc)
      : generateBlurPlaceholder()
    : undefined;

  // Determine if we should use CDN loader
  const shouldUseCdn = useCdn && typeof imageSrc === 'string' && !hasError;

  return (
    <Image
      {...props}
      src={imageSrc}
      alt={alt}
      loader={shouldUseCdn ? cloudinaryLoader : undefined}
      placeholder={showPlaceholder ? 'blur' : 'empty'}
      blurDataURL={blurDataURL}
      onError={handleError}
    />
  );
}

/**
 * Product image with preset optimizations
 */
export function ProductImage({
  src,
  alt,
  size = 'card',
  ...props
}: Omit<CdnImageProps, 'width' | 'height'> & {
  size?: 'thumbnail' | 'card' | 'detail' | 'hero';
}) {
  const sizeConfig = {
    thumbnail: { width: 150, height: 150 },
    card: { width: 400, height: 400 },
    detail: { width: 600, height: 600 },
    hero: { width: 1200, height: 600 },
  };

  const { width, height } = sizeConfig[size];

  return (
    <CdnImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      {...props}
    />
  );
}

/**
 * Responsive product image that fills container
 */
export function ResponsiveProductImage({
  src,
  alt,
  aspectRatio = '1/1',
  ...props
}: Omit<CdnImageProps, 'fill'> & {
  aspectRatio?: string;
}) {
  return (
    <div className="relative w-full" style={{ aspectRatio }}>
      <CdnImage
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover"
        {...props}
      />
    </div>
  );
}

/**
 * Avatar image with circular crop
 */
export function AvatarImage({
  src,
  alt,
  size = 40,
  ...props
}: Omit<CdnImageProps, 'width' | 'height'> & {
  size?: number;
}) {
  return (
    <CdnImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className="rounded-full object-cover"
      {...props}
    />
  );
}

/**
 * Hero/Banner image with full-width optimization
 */
export function HeroImage({
  src,
  alt,
  height = 400,
  ...props
}: Omit<CdnImageProps, 'fill' | 'height'> & {
  height?: number;
}) {
  return (
    <div className="relative w-full" style={{ height }}>
      <CdnImage
        src={src}
        alt={alt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
        {...props}
      />
    </div>
  );
}
