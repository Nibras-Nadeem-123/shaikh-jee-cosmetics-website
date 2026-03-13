import express from 'express';
const router = express.Router();
import { getProducts, getSingleProduct, newProduct, updateProduct, searchSuggestions, getFeaturedProducts, getBestSellers, getAllAdminProducts, deleteProduct } from '../controllers/productController.js';
import { isAuthenticatedUser, authorizeRoles } from '../middleware/auth.js';
import { cacheMiddleware } from '../config/redis.js'; // Import cacheMiddleware

router.get('/search/suggestions', cacheMiddleware(), searchSuggestions); // Apply cache
router.get('/featured', cacheMiddleware(), getFeaturedProducts); // Apply cache
router.get('/best-sellers', cacheMiddleware(), getBestSellers); // Apply cache
router.get('/', getProducts);
router.get('/:slug', getSingleProduct);

// Admin Routes
router.post('/admin/new', isAuthenticatedUser, authorizeRoles('admin'), newProduct);
router.put('/admin/:id', isAuthenticatedUser, authorizeRoles('admin'), updateProduct);
router.get('/admin/all', isAuthenticatedUser, authorizeRoles('admin'), getAllAdminProducts); // New route for admin to get all products
router.delete('/admin/:id', isAuthenticatedUser, authorizeRoles('admin'), deleteProduct); // New route for admin to delete a product

export default router;
