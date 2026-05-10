import Product from '../models/Product.js';
import { catchAsyncErrors, ErrorHandler } from '../middleware/errorHandler.js';
import { clearCache, getCache, setCache } from '../config/redis.js';
import { parsePaginationParams, buildPaginationMeta } from '../utils/pagination.js';
import cloudinaryService from '../services/cloudinaryService.js';
import logger from '../utils/logger.js';

// Get all products (supports Shop filtering with pagination)
export const getProducts = catchAsyncErrors(async (req, res) => {
  const { category, subcategory, minPrice, maxPrice, sort, search, inStock } = req.query;

  // Parse pagination parameters
  const { page, limit, skip } = parsePaginationParams(req.query);

  let query = {};

  if (category) query.category = new RegExp(category, 'i');
  if (subcategory) query.subcategory = new RegExp(subcategory, 'i');
  if (inStock !== undefined) query.inStock = inStock === 'true';

  // Use full-text search if search query provided
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { brand: { $regex: search, $options: 'i' } }
    ];
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  let apiQuery = Product.find(query);

  // Sorting
  if (sort) {
    const sortBy = sort.split(',').join(' ');
    apiQuery = apiQuery.sort(sortBy);
  } else {
    apiQuery = apiQuery.sort('-createdAt');
  }

  // Get total count for pagination
  const totalProducts = await Product.countDocuments(query);

  // Apply pagination
  apiQuery = apiQuery.skip(skip).limit(limit);

  const products = await apiQuery;

  // Build pagination metadata
  const paginationMeta = buildPaginationMeta(totalProducts, page, limit);

  res.status(200).json({
    success: true,
    products,
    ...paginationMeta,
    // Legacy fields for backward compatibility
    count: products.length,
    totalProducts,
    totalPages: paginationMeta.pagination.totalPages,
    currentPage: page
  });
});

// Get single product details with Redis caching
export const getSingleProduct = catchAsyncErrors(async (req, res, next) => {
  const { slug } = req.params;

  // Try to get from cache first
  const cacheKey = `product:${slug}`;
  const cached = await getCache(cacheKey);

  if (cached) {
    return res.status(200).json({
      success: true,
      cached: true,
      product: cached
    });
  }

  // Fetch from database
  console.log(`Searching for product with slug: ${slug}`);
  const product = await Product.findOne({ slug });

  if (!product) {
    console.error(`Product not found for slug: ${slug}`); // Log the slug for debugging
    const error = new ErrorHandler('Product not found', 404);
    return next(error);
  }

  // Cache the product for 10 minutes
  await setCache(cacheKey, product, 600);

  res.status(200).json({
    success: true,
    cached: false,
    product
  });
});

// Admin: Create new product
export const newProduct = catchAsyncErrors(async (req, res) => {
  req.body.user = req.user.id;
  const product = await Product.create(req.body);

  // Clear product cache on creation
  await clearCache('/api/products*');

  res.status(201).json({ success: true, product });
});

// Admin: Create new product with images
export const newProductWithImages = catchAsyncErrors(async (req, res) => {
  req.body.user = req.user.id;

  // Parse JSON body if it comes as string (from multipart form)
  let productData = req.body;
  if (typeof req.body.data === 'string') {
    productData = JSON.parse(req.body.data);
    productData.user = req.user.id;
  }

  // Create product first
  const product = await Product.create(productData);

  // Upload images to Cloudinary if files are provided
  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map(async (file, index) => {
      const result = await cloudinaryService.uploadImage(file.buffer, {
        folder: `shaikhjee/products/${product._id}`,
        public_id: `${product.slug}-${index + 1}-${Date.now()}`,
      });

      return {
        publicId: result.publicId,
        url: result.url,
        secureUrl: result.url,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
        alt: product.name,
        isPrimary: index === 0
      };
    });

    const uploadedImages = await Promise.all(uploadPromises);

    // Add images to product
    product.cloudinaryImages = uploadedImages;
    product.image = uploadedImages[0]?.url || '';
    product.images = uploadedImages.map(img => img.url);
    await product.save();

    logger.info(`Product created with ${uploadedImages.length} images: ${product.name}`);
  }

  // Clear product cache on creation
  await clearCache('/api/products*');

  res.status(201).json({ success: true, product });
});

// Admin: Update product
export const updateProduct = catchAsyncErrors(async (req, res) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    throw new ErrorHandler('Product not found', 404);
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Clear product cache on update
  await clearCache('/api/products*');

  res.status(200).json({ success: true, product });
});

// Admin: Add images to existing product
export const addProductImages = catchAsyncErrors(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ErrorHandler('Product not found', 404);
  }

  if (!req.files || req.files.length === 0) {
    throw new ErrorHandler('No image files provided', 400);
  }

  if (!cloudinaryService.isConfigured()) {
    throw new ErrorHandler('Image upload service is not configured', 503);
  }

  const setFirstAsPrimary = product.cloudinaryImages.length === 0;

  const uploadPromises = req.files.map(async (file, index) => {
    const result = await cloudinaryService.uploadImage(file.buffer, {
      folder: `shaikhjee/products/${product._id}`,
      public_id: `${product.slug}-${Date.now()}-${index}`,
    });

    return {
      publicId: result.publicId,
      url: result.url,
      secureUrl: result.url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
      alt: req.body.alt || product.name,
      isPrimary: setFirstAsPrimary && index === 0
    };
  });

  const uploadedImages = await Promise.all(uploadPromises);

  // Add to cloudinaryImages array
  product.cloudinaryImages.push(...uploadedImages);

  // Update legacy fields
  if (setFirstAsPrimary) {
    product.image = uploadedImages[0].url;
  }
  product.images = product.images || [];
  product.images.push(...uploadedImages.map(img => img.url));

  await product.save();

  // Clear product cache
  await clearCache('/api/products*');

  logger.info(`Added ${uploadedImages.length} images to product: ${product.name}`);

  res.status(200).json({
    success: true,
    message: `${uploadedImages.length} images added successfully`,
    images: uploadedImages,
    product
  });
});

// Admin: Remove image from product
export const removeProductImage = catchAsyncErrors(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ErrorHandler('Product not found', 404);
  }

  const { publicId } = req.body;

  if (!publicId) {
    throw new ErrorHandler('Public ID is required', 400);
  }

  // Find the image in product
  const imageToRemove = product.cloudinaryImages.find(img => img.publicId === publicId);

  if (!imageToRemove) {
    throw new ErrorHandler('Image not found in product', 404);
  }

  // Delete from Cloudinary
  if (cloudinaryService.isConfigured()) {
    await cloudinaryService.deleteImage(publicId);
  }

  // Remove from product
  await product.removeCloudinaryImage(publicId);

  // Clear product cache
  await clearCache('/api/products*');

  logger.info(`Removed image ${publicId} from product: ${product.name}`);

  res.status(200).json({
    success: true,
    message: 'Image removed successfully',
    product
  });
});

// Admin: Set primary image
export const setPrimaryProductImage = catchAsyncErrors(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ErrorHandler('Product not found', 404);
  }

  const { publicId } = req.body;

  if (!publicId) {
    throw new ErrorHandler('Public ID is required', 400);
  }

  const success = await product.setPrimaryImage(publicId);

  if (!success) {
    throw new ErrorHandler('Image not found in product', 404);
  }

  // Clear product cache
  await clearCache('/api/products*');

  res.status(200).json({
    success: true,
    message: 'Primary image updated successfully',
    product
  });
});

// Admin: Reorder product images
export const reorderProductImages = catchAsyncErrors(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ErrorHandler('Product not found', 404);
  }

  const { imageOrder } = req.body; // Array of publicIds in desired order

  if (!imageOrder || !Array.isArray(imageOrder)) {
    throw new ErrorHandler('Image order array is required', 400);
  }

  // Reorder cloudinaryImages based on the order
  const reorderedImages = [];
  for (const publicId of imageOrder) {
    const image = product.cloudinaryImages.find(img => img.publicId === publicId);
    if (image) {
      reorderedImages.push(image);
    }
  }

  // Add any images not in the order list at the end
  for (const image of product.cloudinaryImages) {
    if (!imageOrder.includes(image.publicId)) {
      reorderedImages.push(image);
    }
  }

  product.cloudinaryImages = reorderedImages;

  // Update legacy images array
  product.images = reorderedImages.map(img => img.url);

  await product.save();

  // Clear product cache
  await clearCache('/api/products*');

  res.status(200).json({
    success: true,
    message: 'Images reordered successfully',
    product
  });
});

// Get search suggestions/autocomplete
export const searchSuggestions = catchAsyncErrors(async (req, res) => {
  const { query = '' } = req.query;

  if (!query || query.length < 2) {
    return res.status(200).json({ success: true, suggestions: [] });
  }

  // Get product name suggestions
  const suggestions = await Product.aggregate([
    {
      $match: {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { category: { $regex: query, $options: 'i' } },
          { brand: { $regex: query, $options: 'i' } }
        ]
      }
    },
    {
      $group: {
        _id: '$name',
        category: { $first: '$category' },
        count: { $sum: 1 }
      }
    },
    { $limit: 10 },
    { $project: { _id: 1, category: 1, count: 1 } }
  ]);

  res.status(200).json({
    success: true,
    suggestions: suggestions.map(s => ({ name: s._id, category: s.category, results: s.count }))
  });
});

// Get featured products
export const getFeaturedProducts = catchAsyncErrors(async (req, res) => {
  const { limit = 8 } = req.query;

  const products = await Product.find({ featured: true })
    .limit(parseInt(limit))
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: products.length,
    products
  });
});

// Get best sellers
export const getBestSellers = catchAsyncErrors(async (req, res) => {
  const { limit = 8 } = req.query;

  const products = await Product.find({ isBestSeller: true })
    .limit(parseInt(limit))
    .sort('-rating');

  res.status(200).json({
    success: true,
    count: products.length,
    products
  });
});

// Admin: Get all products
export const getAllAdminProducts = catchAsyncErrors(async (req, res) => {
  const products = await Product.find();

  res.status(200).json({
    success: true,
    products,
  });
});

// Admin: Delete product
export const deleteProduct = catchAsyncErrors(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ErrorHandler('Product not found', 404);
  }

  await product.deleteOne(); // Use deleteOne for Mongoose 6+

  // Clear product cache on deletion
  await clearCache('/api/products*');

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully',
  });
});

// Search autocomplete - returns products with images for instant search
export const searchAutocomplete = catchAsyncErrors(async (req, res) => {
  const { query = '', limit = 5 } = req.query;

  if (!query || query.length < 2) {
    return res.status(200).json({ success: true, products: [] });
  }

  // Find products matching the search query
  const products = await Product.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { category: { $regex: query, $options: 'i' } },
      { brand: { $regex: query, $options: 'i' } }
    ]
  })
    .select('_id name slug category price images rating')
    .limit(parseInt(limit))
    .sort({ isBestSeller: -1, rating: -1 });

  res.status(200).json({
    success: true,
    count: products.length,
    products
  });
});

// Get popular search terms based on recent search patterns
export const getPopularSearches = catchAsyncErrors(async (req, res) => {
  const { limit = 8 } = req.query;

  // Get categories and common product keywords as popular searches
  const categories = await Product.distinct('category');
  const brands = await Product.distinct('brand');

  // Combine and limit
  const popularSearches = [
    ...categories.slice(0, 4),
    ...brands.filter(b => b).slice(0, 4)
  ].slice(0, parseInt(limit));

  res.status(200).json({
    success: true,
    searches: popularSearches
  });
});

// Get related products (same category, excluding current product)
export const getRelatedProducts = catchAsyncErrors(async (req, res, next) => {
  const { slug } = req.params;
  const { limit = 8 } = req.query;

  // Find the current product to get its category
  const currentProduct = await Product.findOne({ slug });

  if (!currentProduct) {
    return next(new ErrorHandler('Product not found', 404));
  }

  // Find related products from the same category, excluding the current product
  const relatedProducts = await Product.find({
    category: currentProduct.category,
    _id: { $ne: currentProduct._id },
    inStock: true
  })
    .sort({ isBestSeller: -1, rating: -1, reviewCount: -1 })
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    count: relatedProducts.length,
    products: relatedProducts
  });
});
