# Troubleshooting Guide - Shaikh Jee Cosmetics

## Common Errors & Solutions

### 1. "Failed to fetch" Error on Login

**Issue**: When attempting to log in, you see "Failed to fetch" error.

**Cause**: The backend server is not running or not accessible at the configured API URL.

**Solution**:

1. **Start the backend server** (if not already running):

   ```bash
   cd server
   npm install
   npm start
   # or for development with auto-reload
   npm run dev
   ```

2. **Verify the API URL** in `src/services/api.ts`:

   ```typescript
   const API_URL =
     process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
   ```

3. **Check .env.local** configuration:

   - Ensure `NEXT_PUBLIC_API_URL` is set correctly
   - Default is `http://localhost:5000/api` if not specified

4. **Verify MongoDB connection** in the backend:

   - Check if MongoDB is running
   - Verify `MONGO_URI` in `server/.env.local`

5. **Check CORS settings** in `server/server.js`:
   - Ensure CORS is properly configured for your frontend URL
   - Default allows `http://localhost:3000`

**Example .env.local setup**:

```
# Frontend (in root .env.local)
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Backend (in server/.env.local)
MONGO_URI=mongodb://localhost:27017/shaikh-jee
JWT_SECRET=your-secret-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
RAZORPAY_API_KEY=your-razorpay-key
RAZORPAY_API_SECRET=your-razorpay-secret
REDIS_URL=redis://localhost:6379
```

### 2. "Cannot update a component (Router) while rendering a different component" Error

**Issue**: React warning during component rendering, usually in AccountPage.

**Cause**: Navigation (router.push) was being called during the render phase instead of in an effect.

**Solution**: FIXED ✓

- Moved `router.push()` from render phase into a `useEffect` hook
- This ensures navigation happens after component has rendered

**How it works**:

```typescript
// Before (❌ causes warning)
if (!user) {
  router.push("/login");
  return null;
}

// After (✓ correct)
useEffect(() => {
  if (!user) {
    router.push("/login");
  }
}, [user, router]);
```

### 3. Backend Not Starting

**Issue**: Backend fails to start with connection errors.

**Checklist**:

- [ ] MongoDB is running: `mongod` command
- [ ] Redis is running: `redis-server` command (optional but recommended)
- [ ] Node.js version: 16+ required
- [ ] Dependencies installed: `cd server && npm install`
- [ ] Environment variables set in `server/.env.local`
- [ ] Port 5000 is not in use by another service

**Start services**:

```bash
# MongoDB (in separate terminal)
mongod

# Redis (in separate terminal)
redis-server

# Backend (in separate terminal from project root)
cd server
npm run dev

# Frontend (in separate terminal from project root)
npm run dev
```

### 4. Authentication Token Issues

**Issue**: Token expires or is invalid during requests.

**Solution**:

- Tokens are stored in localStorage by the AppContext
- They're automatically included in API requests via Authorization header
- Tokens expire after 7 days (default JWT expiry)
- Clear localStorage and re-login if token issues persist

```bash
# Clear browser storage and try again
localStorage.clear()
```

### 5. CORS Errors

**Issue**: "Access to XMLHttpRequest at 'http://...' has been blocked by CORS policy"

**Solution**: Backend CORS is already configured, but if still having issues:

Edit `server/server.js`:

```javascript
app.use(
  cors({
    origin: "http://localhost:3000", // Change to your frontend URL
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
```

### 6. Redis Connection Issues

**Issue**: Redis errors in logs (optional feature).

**Solution**:

- Redis is optional for caching
- App works without Redis, just without caching benefits
- If you want to use it, install and run Redis:
  ```bash
  redis-server
  ```

### 7. Email Sending Not Working

**Issue**: Order confirmation emails not sent.

**Setup**:

1. Configure SMTP in `server/.env.local`:

   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   ```

2. For Gmail:
   - Enable 2-factor authentication
   - Generate an "App Password" (not your regular password)
   - Use the App Password in `SMTP_PASSWORD`

### 8. Payment Gateway Errors

**Issue**: Razorpay integration not working.

**Setup**:

1. Get API keys from Razorpay dashboard
2. Set in `server/.env.local`:

   ```
   RAZORPAY_API_KEY=your-key-here
   RAZORPAY_API_SECRET=your-secret-here
   ```

3. Test with Razorpay test cards (see Razorpay docs)

### Development vs Production

**Development**:

- Mock data is used for products (from `src/data/products.ts`)
- Backend can be optional for initial frontend development
- Use `npm run dev` for hot-reload

**Production**:

- Real MongoDB database required
- All environment variables must be set
- Use `npm run build && npm start`
- Consider using environment-specific configurations

## Getting Help

1. **Check server logs**: Look for error messages in the backend terminal
2. **Check browser console**: Open DevTools (F12) → Console tab
3. **Check network tab**: DevTools → Network tab to see API requests/responses
4. **Review error messages**: Error messages now include helpful hints

## Quick Checklist for First-Time Setup

- [ ] Node.js 16+ installed
- [ ] MongoDB running locally
- [ ] Backend dependencies installed: `cd server && npm install`
- [ ] Backend started: `cd server && npm run dev`
- [ ] Frontend dependencies installed: `npm install` (from root)
- [ ] Frontend started: `npm run dev`
- [ ] Browser accessible at `http://localhost:3000`
- [ ] Backend accessible at `http://localhost:5000/api`

---

**Last Updated**: January 12, 2026
