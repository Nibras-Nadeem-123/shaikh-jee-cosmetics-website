import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { catchAsyncErrors, ErrorHandler } from '../middleware/errorHandler.js';
import { getCachedCart, cacheCart, clearCartCache } from '../config/redis.js';

// Helper to format cart response
const formatCartResponse = (cart) => {
  const total = cart.items.reduce((sum, item) => {
    return sum + (item.product.price * item.quantity);
  }, 0);
  const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  return { items: cart.items, total, count };
};

// Get user's cart (with Redis caching)
export const getCart = catchAsyncErrors(async (req, res) => {
  const userId = req.user._id;

  // Try to get from Redis cache first
  const cachedCart = await getCachedCart(userId.toString());
  if (cachedCart) {
    return res.status(200).json({
      success: true,
      cart: cachedCart,
      cached: true
    });
  }

  let cart = await Cart.findOne({ userId }).populate('items.product');

  if (!cart) {
    cart = await Cart.create({
      userId,
      items: []
    });
  }

  const cartResponse = formatCartResponse(cart);

  // Cache the cart in Redis
  await cacheCart(userId.toString(), cartResponse);

  res.status(200).json({
    success: true,
    cart: cartResponse
  });
});

// Add item to cart
export const addToCart = catchAsyncErrors(async (req, res, next) => {
  const { productId, quantity = 1, shade } = req.body;
  const userId = req.user._id;

  // Verify product exists
  const product = await Product.findById(productId);
  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }

  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = await Cart.create({
      userId,
      items: []
    });
  }

  // Check if item already exists
  const existingItem = cart.items.find(
    item => item.product.toString() === productId &&
    (!shade || (item.shade && item.shade.name === shade.name))
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({
      product: productId,
      quantity,
      shade
    });
  }

  cart.lastUpdated = new Date();
  await cart.save();

  // Populate products for response
  await cart.populate('items.product');

  const cartResponse = formatCartResponse(cart);

  // Update Redis cache
  await cacheCart(userId.toString(), cartResponse);

  res.status(200).json({
    success: true,
    message: 'Item added to cart',
    cart: cartResponse
  });
});

// Update cart item quantity
export const updateCartItem = catchAsyncErrors(async (req, res, next) => {
  const { productId, quantity, shade } = req.body;
  const userId = req.user._id;

  const cart = await Cart.findOne({ userId });

  if (!cart) {
    return next(new ErrorHandler('Cart not found', 404));
  }

  const item = cart.items.find(
    item => item.product.toString() === productId &&
    (!shade || (item.shade && item.shade.name === shade.name))
  );

  if (!item) {
    return next(new ErrorHandler('Item not found in cart', 404));
  }

  if (quantity <= 0) {
    cart.items = cart.items.filter(
      i => !(i.product.toString() === productId &&
        (!shade || (i.shade && i.shade.name === shade.name)))
    );
  } else {
    item.quantity = quantity;
  }

  cart.lastUpdated = new Date();
  await cart.save();

  await cart.populate('items.product');

  const cartResponse = formatCartResponse(cart);

  // Update Redis cache
  await cacheCart(userId.toString(), cartResponse);

  res.status(200).json({
    success: true,
    message: 'Cart updated',
    cart: cartResponse
  });
});

// Remove item from cart
export const removeFromCart = catchAsyncErrors(async (req, res, next) => {
  const { productId, shade } = req.body;
  const userId = req.user._id;

  const cart = await Cart.findOne({ userId });

  if (!cart) {
    return next(new ErrorHandler('Cart not found', 404));
  }

  cart.items = cart.items.filter(
    item => !(item.product.toString() === productId &&
      (!shade || (item.shade && item.shade.name === shade.name)))
  );

  cart.lastUpdated = new Date();
  await cart.save();

  await cart.populate('items.product');

  const cartResponse = formatCartResponse(cart);

  // Update Redis cache
  await cacheCart(userId.toString(), cartResponse);

  res.status(200).json({
    success: true,
    message: 'Item removed from cart',
    cart: cartResponse
  });
});

// Clear cart
export const clearCart = catchAsyncErrors(async (req, res) => {
  const userId = req.user._id;

  await Cart.findOneAndUpdate(
    { userId },
    { items: [], lastUpdated: new Date() }
  );

  // Clear Redis cache
  await clearCartCache(userId.toString());

  res.status(200).json({
    success: true,
    message: 'Cart cleared'
  });
});

// Merge local cart with database cart (on login)
export const mergeCart = catchAsyncErrors(async (req, res, next) => {
  const { items } = req.body; // Local cart items
  const userId = req.user._id;
  
  let cart = await Cart.findOne({ userId });
  
  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }
  
  // Merge items
  if (items && items.length > 0) {
    for (const localItem of items) {
      const product = await Product.findById(localItem.product._id);
      if (!product) continue;
      
      const existingItem = cart.items.find(
        item => item.product.toString() === localItem.product._id &&
        (!localItem.selectedShade || 
         (item.shade && item.shade.name === localItem.selectedShade.name))
      );
      
      if (existingItem) {
        existingItem.quantity += localItem.quantity;
      } else {
        cart.items.push({
          product: localItem.product._id,
          quantity: localItem.quantity,
          shade: localItem.selectedShade
        });
      }
    }
    
    cart.lastUpdated = new Date();
    await cart.save();
  }
  
  await cart.populate('items.product');
  
  const total = cart.items.reduce((sum, item) => {
    return sum + (item.product.price * item.quantity);
  }, 0);
  
  const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  
  res.status(200).json({
    success: true,
    message: 'Cart merged successfully',
    cart: {
      items: cart.items,
      total,
      count
    }
  });
});
