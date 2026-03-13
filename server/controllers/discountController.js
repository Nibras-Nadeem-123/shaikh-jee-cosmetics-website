import DiscountCode from '../models/DiscountCode.js';
import { catchAsyncErrors, ErrorHandler } from '../middleware/errorHandler.js';

// Admin: Create discount code
export const createDiscountCode = catchAsyncErrors(async (req, res) => {
  const { code, description, discountType, discountValue, minOrderValue, maxDiscountAmount, maxUsageCount, validFrom, validTill } = req.body;

  // Validate inputs
  if (!code || !discountType || !discountValue || !validFrom || !validTill) {
    throw new ErrorHandler('Please provide all required fields', 400);
  }

  if (new Date(validFrom) >= new Date(validTill)) {
    throw new ErrorHandler('Valid Till date must be after Valid From date', 400);
  }

  // Check if code already exists
  const existingCode = await DiscountCode.findOne({ code: code.toUpperCase() });
  if (existingCode) {
    throw new ErrorHandler('Discount code already exists', 400);
  }

  const discountCode = new DiscountCode({
    code: code.toUpperCase(),
    description,
    discountType,
    discountValue,
    minOrderValue,
    maxDiscountAmount,
    maxUsageCount,
    validFrom,
    validTill,
    createdBy: req.user._id
  });

  await discountCode.save();

  res.status(201).json({
    success: true,
    message: 'Discount code created successfully',
    discountCode
  });
});

// Validate and apply discount code
export const validateDiscountCode = catchAsyncErrors(async (req, res) => {
  const { code, orderAmount } = req.body;

  if (!code || !orderAmount) {
    throw new ErrorHandler('Please provide code and order amount', 400);
  }

  const discountCode = await DiscountCode.findOne({ code: code.toUpperCase(), isActive: true });

  if (!discountCode) {
    throw new ErrorHandler('Invalid or inactive discount code', 400);
  }

  const now = new Date();
  if (now < new Date(discountCode.validFrom) || now > new Date(discountCode.validTill)) {
    throw new ErrorHandler('Discount code has expired', 400);
  }

  if (discountCode.maxUsageCount && discountCode.currentUsageCount >= discountCode.maxUsageCount) {
    throw new ErrorHandler('Discount code usage limit exceeded', 400);
  }

  if (orderAmount < discountCode.minOrderValue) {
    throw new ErrorHandler(`Minimum order value should be ₹${discountCode.minOrderValue}`, 400);
  }

  // Calculate discount
  let discount = 0;
  if (discountCode.discountType === 'percentage') {
    discount = Math.round((orderAmount * discountCode.discountValue) / 100);
    if (discountCode.maxDiscountAmount && discount > discountCode.maxDiscountAmount) {
      discount = discountCode.maxDiscountAmount;
    }
  } else {
    discount = discountCode.discountValue;
  }

  res.status(200).json({
    success: true,
    message: 'Discount code is valid',
    discountCode: {
      code: discountCode.code,
      discountType: discountCode.discountType,
      discountValue: discountCode.discountValue,
      discountAmount: discount
    }
  });
});

// Get all discount codes (admin only)
export const getAllDiscountCodes = catchAsyncErrors(async (req, res) => {
  const { page = 1, limit = 10, isActive } = req.query;

  let query = {};
  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.max(1, Math.min(50, parseInt(limit) || 10));
  const skip = (pageNum - 1) * limitNum;

  const codes = await DiscountCode.find(query)
    .populate('createdBy', 'name email')
    .skip(skip)
    .limit(limitNum)
    .sort('-createdAt');

  const totalCodes = await DiscountCode.countDocuments(query);
  const totalPages = Math.ceil(totalCodes / limitNum);

  res.status(200).json({
    success: true,
    codes,
    totalCodes,
    totalPages,
    currentPage: pageNum
  });
});

// Update discount code (admin only)
export const updateDiscountCode = catchAsyncErrors(async (req, res) => {
  const { codeId } = req.params;
  const { isActive, maxUsageCount } = req.body;

  let code = await DiscountCode.findById(codeId);
  if (!code) {
    throw new ErrorHandler('Discount code not found', 404);
  }

  if (isActive !== undefined) code.isActive = isActive;
  if (maxUsageCount !== undefined) code.maxUsageCount = maxUsageCount;

  await code.save();

  res.status(200).json({
    success: true,
    message: 'Discount code updated successfully',
    code
  });
});

// Delete discount code (admin only)
export const deleteDiscountCode = catchAsyncErrors(async (req, res) => {
  const { codeId } = req.params;

  const code = await DiscountCode.findByIdAndDelete(codeId);
  if (!code) {
    throw new ErrorHandler('Discount code not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Discount code deleted successfully'
  });
});

// Admin: Get single discount code details
export const getSingleDiscountCode = catchAsyncErrors(async (req, res) => {
  const code = await DiscountCode.findById(req.params.id).populate('createdBy', 'name email');

  if (!code) {
    throw new ErrorHandler('Discount code not found with this ID', 404);
  }

  res.status(200).json({
    success: true,
    code,
  });
});


