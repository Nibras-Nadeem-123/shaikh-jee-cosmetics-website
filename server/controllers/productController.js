import Product from '../models/Product.js';
import { catchAsyncErrors, ErrorHandler } from '../middleware/errorHandler.js';
import { clearCache } from '../config/redis.js';

// Get all products (supports Shop filtering with pagination)
export const getProducts = catchAsyncErrors(async (req, res) => {
  const { category, subcategory, minPrice, maxPrice, sort, search, page = 1, limit = 12 } = req.query;
  
  let query = {};

  if (category) query.category = new RegExp(category, 'i');
  if (subcategory) query.subcategory = new RegExp(subcategory, 'i');
  
  // Use full-text search if search query provided
  if (search) {
    query.$text = { $search: search };
  }

  query.price = {
    $gte: Number(minPrice) || 0,
    $lte: Number(maxPrice) || 1000000
  };

  let apiQuery = Product.find(query);
  
  // If full-text search was used, add text search score
  if (search) {
    apiQuery = apiQuery.select({ score: { $meta: 'textScore' } }).sort({ score: { $meta: 'textScore' } });
  }

  // Sorting
  if (sort) {
    const sortBy = sort ? sort.split(',').join(' ') : '';
    apiQuery = apiQuery.sort(sortBy);
  } else {
    apiQuery = apiQuery.sort('-createdAt');
  }

  // Pagination
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 12));
  const skip = (pageNum - 1) * limitNum;

  apiQuery = apiQuery.skip(skip).limit(limitNum);

  const products = await apiQuery;
  const totalProducts = await Product.countDocuments(query);
  const totalPages = Math.ceil(totalProducts / limitNum);

  res.status(200).json({ 
    success: true, 
    count: products.length,
    totalProducts,
    totalPages,
    currentPage: pageNum,
    products 
  });
});

// Get single product details (Product Detail UI)
export const getSingleProduct = catchAsyncErrors(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });
  
  if (!product) {
    throw new ErrorHandler('Product not found', 404);
  }
  
  res.status(200).json({ success: true, product });
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
