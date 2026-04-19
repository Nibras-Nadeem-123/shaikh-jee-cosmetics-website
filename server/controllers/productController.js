import Product from '../models/Product.js';
import { catchAsyncErrors, ErrorHandler } from '../middleware/errorHandler.js';
import { clearCache, getCache, setCache } from '../config/redis.js';
import { parsePaginationParams, buildPaginationMeta } from '../utils/pagination.js';

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
