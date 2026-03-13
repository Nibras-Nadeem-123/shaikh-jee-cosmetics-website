import User from '../models/User.js';
import { catchAsyncErrors, ErrorHandler } from '../middleware/errorHandler.js';

// Admin: Get all users
export const getAllUsers = catchAsyncErrors(async (req, res) => {
  const users = await User.find().select('-password'); // Don't send passwords

  res.status(200).json({
    success: true,
    users,
  });
});

// Admin: Get single user
export const getSingleUser = catchAsyncErrors(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    throw new ErrorHandler(`User not found with id: ${req.params.id}`, 404);
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// Admin: Update user role
export const updateUserRole = catchAsyncErrors(async (req, res) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  if (!user) {
    throw new ErrorHandler(`User not found with id: ${req.params.id}`, 404);
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// Admin: Delete user
export const deleteUser = catchAsyncErrors(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ErrorHandler(`User not found with id: ${req.params.id}`, 404);
  }

  // Prevent admin from deleting themselves
  if (user.role === 'admin' && user._id.toString() === req.user._id.toString()) {
    throw new ErrorHandler('Admin cannot delete their own account', 400);
  }

  await user.deleteOne(); // Use deleteOne for Mongoose 6+

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
  });
});
