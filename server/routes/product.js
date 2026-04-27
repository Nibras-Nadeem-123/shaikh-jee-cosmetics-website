import express from 'express';
const router = express.Router();
import { getProducts, getSingleProduct, newProduct, updateProduct, searchSuggestions, getFeaturedProducts, getBestSellers, getAllAdminProducts, deleteProduct } from '../controllers/productController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';
import { cache, invalidateCache } from '../middleware/cache.js';
import { CACHE_TTL } from '../services/cacheService.js';

// Public routes with enhanced caching
router.get('/search/suggestions',
  cache({ ttl: CACHE_TTL.MEDIUM, prefix: 'products:suggestions', tags: ['products'] }),
  searchSuggestions
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

export default router;
