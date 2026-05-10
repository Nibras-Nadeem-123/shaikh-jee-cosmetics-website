import express from 'express';
import multer from 'multer';
const router = express.Router();
import {
  getProducts,
  getSingleProduct,
  newProduct,
  newProductWithImages,
  updateProduct,
  addProductImages,
  removeProductImage,
  setPrimaryProductImage,
  reorderProductImages,
  searchSuggestions,
  searchAutocomplete,
  getPopularSearches,
  getFeaturedProducts,
  getBestSellers,
  getAllAdminProducts,
  deleteProduct,
  getRelatedProducts
} from '../controllers/productController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';
import { cache, invalidateCache } from '../middleware/cache.js';
import { CACHE_TTL } from '../services/cacheService.js';

// Configure multer for memory storage (for Cloudinary uploads)
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Allowed: JPEG, PNG, GIF, WebP`), false);
  }
};
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024, files: 10 } // 10MB max, 10 files max
});

// Public routes with enhanced caching
router.get('/search/suggestions',
  cache({ ttl: CACHE_TTL.MEDIUM, prefix: 'products:suggestions', tags: ['products'] }),
  searchSuggestions
);

router.get('/search/autocomplete',
  cache({ ttl: CACHE_TTL.SHORT, prefix: 'products:autocomplete', tags: ['products'] }),
  searchAutocomplete
);

router.get('/search/popular',
  cache({ ttl: CACHE_TTL.LONG, prefix: 'products:popular-searches', tags: ['products'] }),
  getPopularSearches
);

router.get('/featured',
  cache({ ttl: CACHE_TTL.LONG, prefix: 'products:featured', tags: ['products', 'featured'] }),
  getFeaturedProducts
);

router.get('/best-sellers',
  cache({ ttl: CACHE_TTL.LONG, prefix: 'products:bestsellers', tags: ['products', 'bestsellers'] }),
  getBestSellers
);

router.get('/',
  cache({ ttl: CACHE_TTL.MEDIUM, prefix: 'products:list', tags: ['products'] }),
  getProducts
);

router.get('/:slug/related',
  cache({ ttl: CACHE_TTL.MEDIUM, prefix: 'products:related', tags: ['products'] }),
  getRelatedProducts
);

router.get('/:slug',
  cache({ ttl: CACHE_TTL.LONG, prefix: 'products:detail', tags: ['products'] }),
  getSingleProduct
);

// Admin Routes with cache invalidation
router.post('/admin/new',
  isAuthenticatedUser,
  authorizeRoles('admin'),
  invalidateCache({ tags: ['products', 'featured', 'bestsellers'] }),
  newProduct
);

// Admin: Create product with image uploads
router.post('/admin/new-with-images',
  isAuthenticatedUser,
  authorizeRoles('admin'),
  upload.array('images', 10),
  invalidateCache({ tags: ['products', 'featured', 'bestsellers'] }),
  newProductWithImages
);

router.put('/admin/:id',
  isAuthenticatedUser,
  authorizeRoles('admin'),
  invalidateCache({
    tags: ['products', 'featured', 'bestsellers'],
    custom: async (req, res, data, cacheService) => {
      // Invalidate specific product cache
      await cacheService.invalidateTag(`product:${req.params.id}`);
    }
  }),
  updateProduct
);

// Admin: Add images to existing product
router.post('/admin/:id/images',
  isAuthenticatedUser,
  authorizeRoles('admin'),
  upload.array('images', 10),
  invalidateCache({ tags: ['products', 'featured', 'bestsellers'] }),
  addProductImages
);

// Admin: Remove image from product
router.delete('/admin/:id/images',
  isAuthenticatedUser,
  authorizeRoles('admin'),
  invalidateCache({ tags: ['products', 'featured', 'bestsellers'] }),
  removeProductImage
);

// Admin: Set primary image
router.put('/admin/:id/images/primary',
  isAuthenticatedUser,
  authorizeRoles('admin'),
  invalidateCache({ tags: ['products', 'featured', 'bestsellers'] }),
  setPrimaryProductImage
);

// Admin: Reorder images
router.put('/admin/:id/images/reorder',
  isAuthenticatedUser,
  authorizeRoles('admin'),
  invalidateCache({ tags: ['products', 'featured', 'bestsellers'] }),
  reorderProductImages
);

router.get('/admin/all',
  isAuthenticatedUser,
  authorizeRoles('admin'),
  getAllAdminProducts
);

router.delete('/admin/:id',
  isAuthenticatedUser,
  authorizeRoles('admin'),
  invalidateCache({
    tags: ['products', 'featured', 'bestsellers'],
    custom: async (req, res, data, cacheService) => {
      await cacheService.invalidateTag(`product:${req.params.id}`);
    }
  }),
  deleteProduct
);

// Error handling for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum is 10 files per request.'
      });
    }
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  next(error);
});

export default router;
