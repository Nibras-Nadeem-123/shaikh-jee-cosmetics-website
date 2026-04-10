# Shaikh Jee Cosmetics - E-Commerce Platform

A modern, full-featured cosmetics e-commerce platform built with Next.js 14, Node.js, Express, and MongoDB.

![Shaikh Jee Cosmetics](https://img.shields.io/badge/Shaikh%20Jee-Cosmetics-primary)
![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-green?logo=mongodb)

## ✨ Features

### Customer Features
- 🛍️ **Product Catalog** - Browse products with advanced filtering and search
- 🔍 **Smart Search** - Real-time search suggestions and autocomplete
- 📄 **Pagination** - Efficient product listing with server-side pagination
- ⭐ **Reviews** - Submit and read product reviews with ratings
- ❤️ **Wishlist** - Save favorite products (synced to database)
- 🛒 **Shopping Cart** - Add/remove items with quantity management
- 💳 **Secure Payments** - Razorpay integration for safe transactions
- 📦 **Order Tracking** - Real-time order status updates
- 🔐 **Authentication** - Secure login/signup with validation
- 📱 **Responsive Design** - Works seamlessly on all devices

### Admin Features
- 📊 **Dashboard** - Manage products, orders, and customers
- 🏷️ **Product Management** - CRUD operations for products
- 💰 **Discount Codes** - Create and manage promotional codes
- 📈 **Order Management** - View and update order statuses
- 👥 **User Management** - Customer account oversight

### Technical Features
- ⚡ **Server-Side Rendering** - Next.js App Router for optimal performance
- 🎨 **Modern UI** - Tailwind CSS with custom design system
- 🔒 **Security** - JWT authentication, input validation, bcrypt passwords
- 📧 **Email Notifications** - Order confirmations and updates
- 💾 **Caching** - Redis integration for improved performance
- 🔄 **Real-time Updates** - WebSocket support for order tracking
- 🗄️ **Database** - MongoDB with Mongoose ODM
- 🧪 **Error Handling** - Comprehensive error boundaries and API error handling

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- MongoDB installed locally or MongoDB Atlas account
- Redis (optional, for caching)
- Razorpay account (for payments)

### Installation

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd shaikh-jee-cosmetics-website
```

#### 2. Install Frontend Dependencies

```bash
npm install
```

#### 3. Setup Backend

```bash
cd server
npm install
```

#### 4. Configure Environment Variables

**Frontend (.env.local):**
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_RAZORPAY_KEY=rzp_test_xxxxxxxxxxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Backend (server/.env.local):**
```bash
cd server
cp .env.example .env.local
```

Edit `server/.env.local`:
```env
MONGO_URI=mongodb://localhost:27017/shaikh-jee-cosmetics
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
REDIS_URL=redis://localhost:6379
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
RAZORPAY_API_KEY=rzp_test_xxxxxxxxxxxxx
RAZORPAY_API_SECRET=your_razorpay_secret
FRONTEND_URL=http://localhost:3000
```

#### 5. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📁 Project Structure

```
shaikh-jee-cosmetics-website/
├── src/                      # Frontend source code
│   ├── app/                  # Next.js App Router pages
│   │   ├── (pages)/          # Route groups
│   │   │   ├── shop/
│   │   │   ├── product/
│   │   │   ├── cart/
│   │   │   ├── account/
│   │   │   └── ...
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/           # React components
│   ├── contexts/             # React Context providers
│   ├── hooks/                # Custom React hooks
│   ├── services/             # API services
│   ├── types/                # TypeScript types
│   └── utils/                # Utility functions
├── server/                   # Backend source code
│   ├── config/               # Database, Redis, WebSocket config
│   ├── controllers/          # Business logic
│   ├── middleware/           # Auth, validation, error handling
│   ├── models/               # Mongoose schemas
│   ├── routes/               # API routes
│   └── server.js
├── public/                   # Static assets
└── package.json
```

## 🛠️ Available Scripts

### Frontend

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Backend

```bash
npm run dev      # Start development server (nodemon)
npm start        # Start production server
npm run seed     # Seed database with sample data
```

## 📦 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### Products
- `GET /api/products` - Get all products (with pagination)
- `GET /api/products/:slug` - Get single product
- `GET /api/products/search/suggestions` - Search suggestions
- `GET /api/products/featured` - Featured products
- `GET /api/products/best-sellers` - Best sellers

### Reviews
- `GET /api/reviews/product/:productId` - Get product reviews
- `POST /api/reviews/create` - Submit review

### Wishlist
- `GET /api/wishlist` - Get user wishlist
- `POST /api/wishlist/add` - Add to wishlist
- `POST /api/wishlist/remove` - Remove from wishlist

### Orders
- `POST /api/orders/new` - Create order
- `GET /api/orders/me` - Get my orders
- `GET /api/orders/:id` - Get order by ID

### Payment
- `POST /api/payment/order` - Create payment order
- `POST /api/payment/verify` - Verify payment

### Discount
- `POST /api/discount/validate` - Validate discount code

## 🗄️ Database Models

### User
```javascript
{
  name: String,
  email: String,
  password: String (hashed),
  role: 'customer' | 'admin',
  wishlist: [Product._id],
  addresses: [Address],
  createdAt: Date
}
```

### Product
```javascript
{
  name: String,
  slug: String,
  description: String,
  price: Number,
  category: String,
  rating: Number,
  reviewCount: Number,
  images: [String],
  inStock: Boolean,
  isBestSeller: Boolean,
  isNew: Boolean,
  shades: [{name, color}],
  createdAt: Date
}
```

### Order
```javascript
{
  userId: User._id,
  orderItems: [{product, name, quantity, price}],
  shippingAddress: Object,
  paymentMethod: 'COD' | 'Razorpay',
  totalPrice: Number,
  orderStatus: 'processing' | 'shipped' | 'delivered' | 'cancelled',
  createdAt: Date
}
```

## 🔐 Security Features

- **Password Hashing** - Bcrypt with salt rounds
- **JWT Authentication** - Secure token-based auth
- **Input Validation** - Express-validator on all inputs
- **CORS Protection** - Configured for frontend domain
- **Environment Variables** - All secrets externalized
- **Payment Verification** - Razorpay signature verification
- **Role-Based Access** - Admin-only endpoints protected

## 🚢 Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables
4. Deploy

### Backend (Railway/Render)

1. Push code to GitHub
2. Connect repository to hosting platform
3. Set environment variables
4. Deploy

### Production Checklist

- [ ] Update `.env.production` with production URLs
- [ ] Set up production MongoDB with backups
- [ ] Configure production Redis instance
- [ ] Set up production email credentials
- [ ] Configure Razorpay production keys
- [ ] Enable HTTPS
- [ ] Configure CORS for production domain
- [ ] Run security audit
- [ ] Test all critical flows

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run E2E tests
npm run test:e2e
```

## 📝 Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow ESLint configuration
- Use Prettier for formatting
- Write meaningful commit messages

### Component Structure
```tsx
"use client"
import React from 'react';
import { ComponentProps } from './types';

export const Component: React.FC<ComponentProps> = ({ prop }) => {
  // Component logic
  
  return (
    <div>Component JSX</div>
  );
};
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 📞 Support

For support, email support@shaikhjee.com or open an issue in the repository.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting and deployment
- Razorpay for payment processing
- MongoDB for the database
- All contributors to this project

---

**Built with ❤️ by Shaikh Jee Cosmetics Team**
