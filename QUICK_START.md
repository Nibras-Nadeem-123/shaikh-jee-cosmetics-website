# Quick Start Guide - Shaikh Jee Cosmetics

## Prerequisites

- Node.js 18+
- MongoDB
- Redis (optional but recommended)
- Git

## 📋 Project Structure

```
shaikh-jee-cosmetics-website/
├── server/                 # Express.js backend
│   ├── config/            # Configuration files
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── .env.local         # Environment variables
│   └── server.js          # Main server file
├── src/                    # Next.js frontend
│   ├── app/               # App directory (Next 13+)
│   ├── components/        # React components
│   ├── contexts/          # Context API
│   ├── hooks/             # Custom hooks
│   ├── services/          # API services
│   ├── types/             # TypeScript types
│   └── utils/             # Utility functions
└── IMPLEMENTATION_GUIDE.md # Detailed guide
```

## 🚀 Getting Started

### Step 1: Clone and Install Dependencies

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies (from root)
cd ..
npm install
```

### Step 2: Configure Environment Variables

```bash
# Backend configuration
cp server/.env.example server/.env.local
```

Edit `server/.env.local` with your values:

```env
MONGO_URI=mongodb://localhost:27017/shaikhjee
JWT_SECRET=your_secret_key_here
NODE_ENV=development
PORT=5000
```

### Step 3: Start MongoDB

```bash
# Make sure MongoDB is running
mongod
```

### Step 4: Start the Development Servers

**Terminal 1 - Backend (Port 5000)**

```bash
cd server
npm run dev
```

**Terminal 2 - Frontend (Port 3000)**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔑 Key Features Overview

### Authentication System

- User signup/login with JWT
- Password hashing with bcryptjs
- Role-based access control (customer/admin)

### Product Management

- Browse products with filters
- Full-text search with autocomplete
- Product reviews and ratings
- Wishlist functionality

### Shopping Cart

- Add/remove products
- Quantity management
- Apply discount codes

### Order Processing

- Create orders with shipping address
- Multiple payment methods (COD, Razorpay)
- Order tracking and status updates
- Email notifications

### Admin Features

- Product management (CRUD)
- Discount code creation and management
- Order management
- Analytics (ready for implementation)

## 💡 Common Tasks

### Create a New Product (Admin)

```bash
POST /api/products/admin/new
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Product Name",
  "slug": "product-name",
  "description": "Product description",
  "price": 999,
  "category": "Lips",
  "image": "https://image-url.jpg",
  "inStock": true
}
```

### Apply Discount Code (Checkout)

```bash
POST /api/discount/validate
Content-Type: application/json

{
  "code": "SAVE50",
  "orderAmount": 2000
}
```

### Submit a Product Review

```bash
POST /api/reviews/create
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": "product_id",
  "rating": 5,
  "comment": "Amazing product, highly recommended!"
}
```

## 🧪 Testing the API

### Using Postman/Insomnia

1. Import API endpoints from the IMPLEMENTATION_GUIDE.md
2. Set base URL to `http://localhost:5000/api`
3. Add Authorization header: `Bearer {your_jwt_token}`

### Using cURL

```bash
# Get all products
curl http://localhost:5000/api/products?page=1&limit=12

# Search products
curl "http://localhost:5000/api/products?search=lipstick"

# Get search suggestions
curl "http://localhost:5000/api/products/search/suggestions?query=lip"
```

## 📦 Dependencies

### Backend (Express.js)

- `express` - Web framework
- `mongoose` - MongoDB ODM
- `jsonwebtoken` - JWT auth
- `bcryptjs` - Password hashing
- `express-validator` - Input validation
- `nodemailer` - Email service
- `redis` - Caching
- `socket.io` - Real-time updates
- `razorpay` - Payment gateway
- `express-rate-limit` - API rate limiting

### Frontend (Next.js)

- `next` - React framework
- `react` - UI library
- `tailwindcss` - Styling
- `lucide-react` - Icons

## 🔒 Security Checklist

- [ ] Set strong JWT_SECRET in production
- [ ] Configure SMTP credentials for emails
- [ ] Add Razorpay API keys for payments
- [ ] Enable HTTPS in production
- [ ] Set up proper CORS for frontend domain
- [ ] Configure database authentication
- [ ] Enable rate limiting on public endpoints
- [ ] Setup environment-specific .env files

## 🐛 Troubleshooting

### MongoDB Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution**: Make sure MongoDB is running (`mongod` command)

### Port Already in Use

```
Error: listen EADDRINUSE :::5000
```

**Solution**: Change PORT in `.env.local` or kill the process using port 5000

### JWT Errors

```
Error: Invalid token
```

**Solution**: Make sure you're sending the token in Authorization header as `Bearer {token}`

### Email Not Sending

**Solution**: Check SMTP credentials in `.env.local` and enable "Less secure apps" if using Gmail

## 📚 Documentation Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🎯 Next Steps

1. **Frontend Integration**: Update the API service with your backend URL
2. **Database Setup**: Import sample products into MongoDB
3. **Payment Testing**: Setup Razorpay sandbox account
4. **Email Configuration**: Configure SMTP for your email provider
5. **Deployment**: Deploy to Vercel (frontend) and your hosting (backend)

## 📞 Support

Refer to `IMPLEMENTATION_GUIDE.md` for detailed API documentation and architecture overview.

---

**Happy Coding! 🚀**
