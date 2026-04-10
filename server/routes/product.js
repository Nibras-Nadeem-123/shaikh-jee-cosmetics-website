import express from 'express';
const router = express.Router();
import { getProducts, getSingleProduct, newProduct, updateProduct, searchSuggestions, getFeaturedProducts, getBestSellers, getAllAdminProducts, deleteProduct } from '../controllers/productController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';
import { cacheMiddleware } from '../config/redis.js';

// Public routes with caching
router.get('/search/suggestions', cacheMiddleware(300), searchSuggestions); // Cache for 5 minutes
router.get('/featured', cacheMiddleware(600), getFeaturedProducts); // Cache for 10 minutes
router.get('/best-sellers', cacheMiddleware(600), getBestSellers); // Cache for 10 minutes
router.get('/', cacheMiddleware(120), getProducts); // Cache for 2 minutes
router.get('/:slug', cacheMiddleware(600), getSingleProduct); // Cache for 10 minutes

// Admin Routes (no caching)
router.post('/admin/new', isAuthenticatedUser, authorizeRoles('admin'), newProduct);
router.put('/admin/:id', isAuthenticatedUser, authorizeRoles('admin'), updateProduct);
router.get('/admin/all', isAuthenticatedUser, authorizeRoles('admin'), getAllAdminProducts);
router.delete('/admin/:id', isAuthenticatedUser, authorizeRoles('admin'), deleteProduct);

export default router;
