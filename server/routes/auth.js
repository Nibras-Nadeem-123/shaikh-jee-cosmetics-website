import express from 'express';
const router = express.Router();
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { catchAsyncErrors, ErrorHandler } from '../middleware/errorHandler.js';
import { signupValidation, loginValidation, handleValidationErrors } from '../middleware/validation.js';

// Signup
router.post('/signup', signupValidation, handleValidationErrors, catchAsyncErrors(async (req, res) => {
  const { name, email, password } = req.body;
  
  // Check if user already exists
  let user = await User.findOne({ email });
  if (user) {
    throw new ErrorHandler('User with this email already exists', 400);
  }
  
  user = await User.create({ name, email, password });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  
  res.status(201).json({ 
    success: true, 
    token, 
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
}));

// Login
router.post('/login', loginValidation, handleValidationErrors, catchAsyncErrors(async (req, res) => {
  const { email, password } = req.body;
  
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ErrorHandler('Invalid email or password', 401);
  }
  
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  
  res.status(200).json({ 
    success: true, 
    token, 
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
}));

export default router;
