# Vercel Deployment Configuration

## CSRF Token Fix for Production

### Problem
Users were getting "CSRF token missing" error when placing orders on Vercel deployment. This happened because:

1. **Cross-Origin Cookies**: Frontend (Vercel) and Backend (different domain) require proper cookie settings
2. **SameSite Policy**: The `sameSite: 'strict'` setting blocked cross-origin cookie transmission
3. **Missing Token**: CSRF token cookie wasn't being sent with API requests in production

### Solution Applied

#### 1. Backend Changes (`server/middleware/csrf.js`)
```javascript
// Updated cookie configuration for cross-origin support
sameSite: isProduction ? 'none' : 'lax'  // Changed from 'strict' to 'none'
secure: isProduction  // Required when using sameSite: 'none'
```

#### 2. Frontend Changes (`src/services/api.ts`)
- Added better error handling for missing CSRF tokens
- Made CSRF token fetching mandatory (throws error if unavailable)
- Added both `X-CSRF-Token` and `csrf-token` headers for compatibility

#### 3. Retry Logic (`src/utils/csrf.ts`)
- Implemented automatic retry (up to 2 retries) for CSRF token fetching
- Added exponential backoff between retries
- Better error messages for debugging

## Environment Variables Required

### Vercel (Frontend)
```bash
NEXT_PUBLIC_API_URL=https://your-backend-api.com/api
```

### Backend Server
```bash
NODE_ENV=production
FRONTEND_URL=https://shaikh-jee-cosmetics-website.vercel.app

# Make sure these match your deployment
PORT=5000
MONGODB_URI=your_mongodb_connection_string
```

## Deployment Checklist

### Before Deploying to Vercel:

1. ✅ Set `NEXT_PUBLIC_API_URL` in Vercel environment variables
2. ✅ Ensure backend is deployed and accessible
3. ✅ Verify CORS is configured to allow your Vercel domain
4. ✅ Check backend allows credentials (credentials: true in CORS)
5. ✅ Confirm backend has HTTPS enabled (required for secure cookies)

### After Deployment:

1. Test CSRF token endpoint: `GET https://your-backend/api/csrf-token`
2. Check browser DevTools → Application → Cookies for `csrf-token` cookie
3. Verify cookie has:
   - `Secure` flag ✓
   - `SameSite=None` ✓
   - Correct domain
4. Test order placement in production

## Testing CSRF in Production

### 1. Check CSRF Cookie
Open browser DevTools → Application → Cookies → Check for `csrf-token`:
- Should be present after page load
- Should have `Secure` and `SameSite=None` flags

### 2. Verify Headers
In Network tab, check POST /orders/new request:
- Request Headers should include: `X-CSRF-Token: [token-value]`
- Cookie should be sent automatically

### 3. Common Issues

**Issue**: Cookie not being set
- **Fix**: Ensure backend URL is HTTPS (not HTTP)
- **Fix**: Check CORS configuration includes `credentials: true`

**Issue**: Cookie not being sent with requests
- **Fix**: Verify `credentials: 'include'` in fetch requests
- **Fix**: Check `sameSite: 'none'` with `secure: true`

**Issue**: CSRF token mismatch
- **Fix**: Clear cookies and refresh page
- **Fix**: Ensure backend is not behind a load balancer that changes cookies

## Backend CORS Configuration

Ensure your backend server has:

```javascript
cors({
  origin: [
    'https://shaikh-jee-cosmetics-website.vercel.app',
    /^https:\/\/shaikh-jee-cosmetics-website.*\.vercel\.app$/  // Preview deployments
  ],
  credentials: true,  // CRITICAL for cookies
  allowedHeaders: ['X-CSRF-Token', 'csrf-token', 'Authorization', 'Content-Type']
})
```

## Security Notes

- **SameSite=None** requires **Secure=true** (HTTPS only)
- **httpOnly=false** allows JavaScript to read token (required for double-submit pattern)
- Token is validated server-side using timing-safe comparison
- Tokens expire after 24 hours
- Never commit `.env` files with production credentials

## Troubleshooting

### Users Still Getting CSRF Error

1. **Clear Browser Cache**: Ask users to hard refresh (Ctrl+Shift+R)
2. **Check Backend Logs**: Verify CSRF endpoint is being called
3. **Verify Environment Variables**: Ensure `NEXT_PUBLIC_API_URL` is correct
4. **Test in Incognito**: Rules out cookie/cache issues
5. **Check Backend Domain**: Must be HTTPS in production

### Preview Deployments

Vercel creates unique URLs for preview deployments. Ensure backend CORS allows:
```javascript
/^https:\/\/shaikh-jee-cosmetics-website.*\.vercel\.app$/
```

## Contact

If issues persist, check:
- Backend server logs
- Vercel deployment logs
- Browser console for errors
- Network tab for failed requests
