/**
 * Cloudinary Service
 * Handles image uploads, transformations, and CDN management
 */

import { v2 as cloudinary } from 'cloudinary';
import logger from '../utils/logger.js';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Default upload options
const DEFAULT_UPLOAD_OPTIONS = {
  folder: 'shaikhjee',
  resource_type: 'image',
  allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif'],
  transformation: [
    { quality: 'auto:good' },
    { fetch_format: 'auto' },
  ],
};

// Image size presets
export const IMAGE_PRESETS = {
  thumbnail: { width: 150, height: 150, crop: 'fill' },
  card: { width: 400, height: 400, crop: 'fill' },
  product: { width: 600, height: 600, crop: 'fill' },
  hero: { width: 1200, height: 600, crop: 'fill' },
  original: {}, // No transformation
};

/**
 * Upload an image to Cloudinary
 * @param {Buffer|string} file - File buffer or base64 string
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result
 */
export const uploadImage = async (file, options = {}) => {
  try {
    const uploadOptions = {
      ...DEFAULT_UPLOAD_OPTIONS,
      ...options,
    };

    // Handle buffer or base64
    let uploadSource = file;
    if (Buffer.isBuffer(file)) {
      uploadSource = `data:image/jpeg;base64,${file.toString('base64')}`;
    }

    const result = await cloudinary.uploader.upload(uploadSource, uploadOptions);

    logger.info(`Image uploaded to Cloudinary: ${result.public_id}`);

    return {
      success: true,
      publicId: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };
  } catch (error) {
    logger.error('Cloudinary upload error:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};

/**
 * Upload multiple images to Cloudinary
 * @param {Array} files - Array of file buffers or base64 strings
 * @param {Object} options - Upload options
 * @returns {Promise<Array>} Array of upload results
 */
export const uploadMultipleImages = async (files, options = {}) => {
  try {
    const uploadPromises = files.map((file) => uploadImage(file, options));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    logger.error('Cloudinary multiple upload error:', error);
    throw new Error(`Failed to upload images: ${error.message}`);
  }
};

/**
 * Delete an image from Cloudinary
 * @param {string} publicId - The public ID of the image
 * @returns {Promise<Object>} Deletion result
 */
export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    logger.info(`Image deleted from Cloudinary: ${publicId}`);
    return {
      success: result.result === 'ok',
      publicId,
    };
  } catch (error) {
    logger.error('Cloudinary delete error:', error);
    throw new Error(`Failed to delete image: ${error.message}`);
  }
};

/**
 * Delete multiple images from Cloudinary
 * @param {Array<string>} publicIds - Array of public IDs
 * @returns {Promise<Object>} Deletion results
 */
export const deleteMultipleImages = async (publicIds) => {
  try {
    const result = await cloudinary.api.delete_resources(publicIds);
    logger.info(`Multiple images deleted from Cloudinary: ${publicIds.length} images`);
    return {
      success: true,
      deleted: result.deleted,
    };
  } catch (error) {
    logger.error('Cloudinary multiple delete error:', error);
    throw new Error(`Failed to delete images: ${error.message}`);
  }
};

/**
 * Generate an optimized URL for an image
 * @param {string} publicIdOrUrl - Public ID or existing Cloudinary URL
 * @param {Object} options - Transformation options
 * @returns {string} Optimized URL
 */
export const getOptimizedUrl = (publicIdOrUrl, options = {}) => {
  const {
    width,
    height,
    crop = 'fill',
    quality = 'auto:good',
    format = 'auto',
    gravity = 'auto',
  } = options;

  // If it's already a Cloudinary URL, extract the public ID
  let publicId = publicIdOrUrl;
  if (publicIdOrUrl.includes('cloudinary.com')) {
    const match = publicIdOrUrl.match(/\/v\d+\/(.+?)(?:\.[a-z]+)?$/i);
    if (match) {
      publicId = match[1];
    }
  }

  const transformations = [
    { quality },
    { fetch_format: format },
  ];

  if (width) transformations.push({ width });
  if (height) transformations.push({ height });
  if (width || height) {
    transformations.push({ crop, gravity });
  }

  return cloudinary.url(publicId, {
    transformation: transformations,
    secure: true,
  });
};

/**
 * Generate responsive image URLs for srcset
 * @param {string} publicIdOrUrl - Public ID or Cloudinary URL
 * @param {Array<number>} widths - Array of widths for srcset
 * @returns {Object} Object with srcset string and sizes
 */
export const generateResponsiveUrls = (publicIdOrUrl, widths = [320, 640, 768, 1024, 1280]) => {
  const srcsetEntries = widths.map((width) => {
    const url = getOptimizedUrl(publicIdOrUrl, { width });
    return `${url} ${width}w`;
  });

  return {
    srcset: srcsetEntries.join(', '),
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
    src: getOptimizedUrl(publicIdOrUrl, { width: widths[widths.length - 1] }),
  };
};

/**
 * Generate a blur placeholder URL (low quality image placeholder)
 * @param {string} publicIdOrUrl - Public ID or Cloudinary URL
 * @returns {string} Low quality placeholder URL
 */
export const getBlurPlaceholder = (publicIdOrUrl) => {
  return getOptimizedUrl(publicIdOrUrl, {
    width: 20,
    quality: 30,
    format: 'webp',
  });
};

/**
 * Get image info from Cloudinary
 * @param {string} publicId - The public ID of the image
 * @returns {Promise<Object>} Image information
 */
export const getImageInfo = async (publicId) => {
  try {
    const result = await cloudinary.api.resource(publicId);
    return {
      success: true,
      publicId: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
      createdAt: result.created_at,
    };
  } catch (error) {
    logger.error('Cloudinary get info error:', error);
    throw new Error(`Failed to get image info: ${error.message}`);
  }
};

/**
 * Check if Cloudinary is properly configured
 * @returns {boolean} Whether Cloudinary is configured
 */
export const isConfigured = () => {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

/**
 * Transform an existing image URL to use CDN optimization
 * Works with both Cloudinary URLs and external URLs
 * @param {string} imageUrl - Original image URL
 * @param {Object} options - Transformation options
 * @returns {string} CDN-optimized URL
 */
export const getCdnUrl = (imageUrl, options = {}) => {
  if (!imageUrl) return '';

  // If it's already a Cloudinary URL, optimize it
  if (imageUrl.includes('cloudinary.com')) {
    return getOptimizedUrl(imageUrl, options);
  }

  // For external URLs, use Cloudinary's fetch feature
  if (isConfigured()) {
    const { width, height, quality = 'auto:good', format = 'auto' } = options;

    const transformations = [`q_${quality}`, `f_${format}`];
    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    if (width || height) transformations.push('c_fill');

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    return `https://res.cloudinary.com/${cloudName}/image/fetch/${transformations.join(',')}/${encodeURIComponent(imageUrl)}`;
  }

  // Return original URL if Cloudinary is not configured
  return imageUrl;
};

export default {
  uploadImage,
  uploadMultipleImages,
  deleteImage,
  deleteMultipleImages,
  getOptimizedUrl,
  generateResponsiveUrls,
  getBlurPlaceholder,
  getImageInfo,
  isConfigured,
  getCdnUrl,
  IMAGE_PRESETS,
};
