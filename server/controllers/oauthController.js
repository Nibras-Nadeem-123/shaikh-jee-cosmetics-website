import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import OAuthToken from '../models/OAuthToken.js';
import { catchAsyncErrors, ErrorHandler } from '../middleware/errorHandler.js';
import { sendWelcomeEmail } from '../utils/emailService.js';
import jwt from 'jsonwebtoken';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// Google OAuth login/register
export const googleAuth = catchAsyncErrors(async (req, res, next) => {
  const { credential } = req.body;

  if (!credential) {
    return next(new ErrorHandler('Google credential is required', 400));
  }

  try {
    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // Link Google account if not already linked
      let oauthToken = await OAuthToken.findOne({ userId: user._id, provider: 'google' });
      
      if (!oauthToken) {
        oauthToken = await OAuthToken.create({
          userId: user._id,
          provider: 'google',
          providerId: googleId,
          accessToken: credential
        });
      }

      // Generate JWT
      const token = generateToken(user);

      res.status(200).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar || picture
        }
      });
    } else {
      // Create new user
      user = await User.create({
        name,
        email,
        password: Math.random().toString(36).slice(-10), // Random password
        avatar: picture,
        isGoogleUser: true
      });

      // Create OAuth token
      await OAuthToken.create({
        userId: user._id,
        provider: 'google',
        providerId: googleId,
        accessToken: credential
      });

      // Generate JWT
      const token = generateToken(user);

      // Send welcome email
      try {
        await sendWelcomeEmail(user.email, user.name);
      } catch (error) {
        console.error('Welcome email error:', error);
      }

      res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: picture,
          isNewUser: true
        }
      });
    }
  } catch (error) {
    console.error('Google auth error:', error);
    return next(new ErrorHandler('Invalid Google token', 401));
  }
});

// Get Google OAuth URL
export const getGoogleAuthUrl = catchAsyncErrors(async (req, res) => {
  const { OAuth2Client } = await import('google-auth-library');
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  
  const url = client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
    redirect_uri: process.env.GOOGLE_REDIRECT_URI || `${process.env.FRONTEND_URL}/api/auth/google/callback`
  });

  res.status(200).json({
    success: true,
    url
  });
});

// Link Google account to existing user
export const linkGoogleAccount = catchAsyncErrors(async (req, res, next) => {
  const { credential } = req.body;
  const userId = req.user._id;

  if (!credential) {
    return next(new ErrorHandler('Google credential is required', 400));
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { sub: googleId } = payload;

    // Check if already linked
    const existingToken = await OAuthToken.findOne({ provider: 'google', providerId: googleId });
    
    if (existingToken && existingToken.userId.toString() !== userId) {
      return next(new ErrorHandler('Google account already linked to another user', 400));
    }

    // Link account
    await OAuthToken.findOneAndUpdate(
      { userId, provider: 'google' },
      {
        userId,
        provider: 'google',
        providerId: googleId,
        accessToken: credential
      },
      { upsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Google account linked successfully'
    });
  } catch (error) {
    console.error('Link Google account error:', error);
    return next(new ErrorHandler('Invalid Google token', 401));
  }
});

// Unlink Google account
export const unlinkGoogleAccount = catchAsyncErrors(async (req, res) => {
  const userId = req.user._id;

  await OAuthToken.deleteOne({ userId, provider: 'google' });

  res.status(200).json({
    success: true,
    message: 'Google account unlinked successfully'
  });
});
