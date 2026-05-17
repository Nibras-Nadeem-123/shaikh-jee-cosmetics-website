# 🚀 CSRF Token Issue - Permanent Fix

## Problem Summary
Users getting "CSRF token missing" error when placing orders on Vercel deployment. This happens because:
- Frontend is on Vercel
- Backend is on Railway
- Cross-origin cookies are blocked by modern browsers
- CSRF protection requires cookies to work

## ✅ Solution: Same-Origin API Proxy

Instead of making cross-origin requests to Railway, we'll proxy all API calls through Vercel. This makes requests appear as same-origin to the browser, eliminating cookie issues.

### How It Works:
```
Before (Cross-Origin - BLOCKED):
Browser → https://your-site.vercel.app
       → https://your-backend.railway.app/api/orders (❌ Cookie blocked)

After (Same-Origin - WORKS):
Browser → https://your-site.vercel.app/api/orders
       → Next.js Proxy
       → https://your-backend.railway.app/api/orders (✅ Cookie works)
```

## 📝 Step-by-Step Deployment

### Step 1: Update Local Environment

Create/Update `.env.local`:

```bash
# For Production (Vercel) - Use proxy
NEXT_PUBLIC_API_URL=/api
RAILWAY_API_URL=https://shaikh-jee-cosmetics-website-production.up.railway.app

# The RAILWAY_API_URL is used by next.config.js rewrite
```

For development, you can keep:
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Step 2: Update Vercel Environment Variables

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add/Update these variables:

```
Name: NEXT_PUBLIC_API_URL
Value: /api
Environment: Production, Preview

Name: RAILWAY_API_URL
Value: https://shaikh-jee-cosmetics-website-production.up.railway.app
Environment: Production, Preview
```

**Important:** Click "Save" and redeploy for changes to take effect.

### Step 3: Deploy Backend Changes

```bash
# Make sure you're in the project root
cd "/mnt/e/My Desktop/nextjs projects/shaikh-jee-cosmetics-website"

# Commit all changes
git add .
git commit -m "Fix CSRF token issue with same-origin proxy and enhanced debugging"
git push
```

Railway will automatically deploy the backend with:
- Fixed CSRF cookie settings (`sameSite: 'none'`)
- Enhanced debug logging
- Test endpoint at `/api/csrf-test`

### Step 4: Deploy Frontend to Vercel

Vercel will automatically deploy when you push to GitHub. Or manually:

1. Go to Vercel Dashboard
2. Click "Redeploy" on your latest deployment
3. Wait for deployment to complete

### Step 5: Verify the Fix

Open your deployed site and check browser console:

```javascript
// Test 1: Check API URL
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL || 'not set')
// Should show: /api

// Test 2: Fetch CSRF token
fetch('/api/csrf-token', { credentials: 'include' })
  .then(r => r.json())
  .then(d => console.log('✅ CSRF Token:', d))
  .catch(e => console.error('❌ Error:', e))

// Test 3: Check cookie (wait 1 second after test 2)
setTimeout(() => {
  const cookie = document.cookie.split('; ').find(c => c.startsWith('csrf-token='))
  console.log('✅ Cookie:', cookie ? 'Present' : '❌ Missing')
}, 1000)

// Test 4: Test CSRF validation
fetch('/api/csrf-test', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': document.cookie.match(/csrf-token=([^;]+)/)?.[1]
  },
  body: JSON.stringify({ test: true })
})
.then(r => r.json())
.then(d => console.log('✅ CSRF Test:', d))
.catch(e => console.error('❌ Error:', e))
```

### Step 6: Test Order Placement

1. Add items to cart
2. Go to checkout
3. Fill in shipping details
4. Place order

**Expected:** Order should go through without CSRF errors! ✅

## 🔧 Configuration Files Changed

### 1. `next.config.js`
```javascript
async rewrites() {
  const apiUrl = process.env.RAILWAY_API_URL || 'https://shaikh-jee-cosmetics-website-production.up.railway.app';
  return [
    {
      source: '/api/:path*',
      destination: `${apiUrl}/api/:path*`,
    },
  ];
}
```

### 2. `server/middleware/csrf.js`
```javascript
// Changed for cross-origin support
sameSite: isProduction ? 'none' : 'lax'

// Added debug logging
console.log('CSRF Validation Failed:', {...})
```

### 3. `src/services/api.ts`
```javascript
// Enhanced error handling
if (!csrfToken) {
  throw new Error('CSRF token missing. Please refresh the page and try again.');
}
```

### 4. `src/utils/csrf.ts`
```javascript
// Added retry logic with exponential backoff
export async function getCSRFToken(retries = 2): Promise<string> {
  // ... retry logic
}
```

## 🎯 Why This Solution Works

### Before (Broken):
- **Browser sees:** Different origins (Vercel vs Railway)
- **Cookies:** Blocked as "third-party"
- **CSRF:** Can't read cookie = validation fails
- **Result:** 403 Forbidden ❌

### After (Fixed):
- **Browser sees:** Same origin (everything from Vercel domain)
- **Cookies:** Work normally (first-party)
- **CSRF:** Can read cookie = validation succeeds
- **Result:** Order placed successfully ✅

## 🚨 Troubleshooting

### Issue: Still getting CSRF errors

**Solution 1:** Clear browser cache and cookies
```
Chrome: Ctrl+Shift+Delete → Select "All time" → Clear
```

**Solution 2:** Check Vercel environment variables
- Make sure `NEXT_PUBLIC_API_URL=/api` (not the full Railway URL)
- Make sure `RAILWAY_API_URL` points to your Railway backend

**Solution 3:** Verify deployment
```bash
# Check what's deployed on Vercel
curl https://your-site.vercel.app/_next/static/chunks/env.js
# Should NOT show Railway URL in NEXT_PUBLIC_API_URL
```

### Issue: API not found (404)

This means the proxy isn't working.

**Check:**
1. `next.config.js` has the `rewrites()` function
2. `RAILWAY_API_URL` environment variable is set in Vercel
3. Vercel deployment completed successfully
4. Try redeploying: Vercel Dashboard → Redeploy

### Issue: CORS errors

If you see CORS errors, it means the proxy isn't working correctly.

**Fix:**
1. Double-check `NEXT_PUBLIC_API_URL=/api` in Vercel
2. Redeploy Vercel
3. Hard refresh browser (Ctrl+Shift+R)

## 📊 How to Monitor

### Check Railway Logs
Railway Dashboard → Deployments → View Logs

Look for:
```
✅ Good: "CSRF validation passed"
❌ Bad: "CSRF Validation Failed: { cookieToken: 'missing' }"
```

### Check Vercel Logs
Vercel Dashboard → Deployments → Functions

Look for:
```
✅ Good: 200 responses for /api/orders/new
❌ Bad: 403 responses
```

### Check Browser DevTools
Network Tab → Filter by "orders"
```
✅ Good: Status 200 or 201
❌ Bad: Status 403
```

## ✅ Success Checklist

After deployment, verify:

- [ ] Environment variables set in Vercel
  - [ ] `NEXT_PUBLIC_API_URL=/api`
  - [ ] `RAILWAY_API_URL=https://your-backend.railway.app`
- [ ] Backend deployed to Railway with CSRF fixes
- [ ] Frontend deployed to Vercel with proxy config
- [ ] Can fetch `/api/csrf-token` successfully
- [ ] Cookie appears in DevTools (Application → Cookies)
- [ ] Test endpoint `/api/csrf-test` returns success
- [ ] Can place test order without errors
- [ ] Railway logs show no CSRF failures

## 🎉 Expected Result

Users should now be able to:
1. ✅ Browse products
2. ✅ Add to cart
3. ✅ Checkout
4. ✅ Place orders
5. ✅ No CSRF errors!

## 📞 Still Need Help?

If issues persist, provide:
1. Screenshot of Vercel environment variables
2. Railway logs showing the error
3. Browser console output from Step 5 tests
4. Network tab screenshot of failed request

---

**Last Updated:** $(date)
**Status:** Ready to deploy 🚀
