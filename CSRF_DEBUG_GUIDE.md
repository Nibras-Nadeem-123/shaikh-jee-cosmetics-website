# CSRF Token Debugging Guide for Railway + Vercel

## Current Issue
Your backend on Railway is returning 403 (Forbidden) when users try to place orders. This is a CSRF token validation failure.

## Changes Made

### 1. Enhanced Backend Logging
Added detailed debug logs to identify exactly what's missing:
- Cookie presence check
- Header presence check
- Token mismatch detection
- Origin tracking

### 2. Debug Endpoint
Created `/api/csrf-test` endpoint to test CSRF without placing real orders.

## Step-by-Step Debugging

### Step 1: Deploy Backend Changes to Railway

1. **Commit the changes:**
```bash
git add server/middleware/csrf.js server/server.js
git commit -m "Add CSRF debugging and fix for Railway deployment"
git push
```

2. **Railway will auto-deploy** (or manually trigger deployment)

3. **Wait for deployment to complete**

### Step 2: Test CSRF Token Endpoint

Open browser console on your Vercel site and run:

```javascript
// Test 1: Get CSRF Token
fetch('https://shaikh-jee-cosmetics-website-production.up.railway.app/api/csrf-token', {
  credentials: 'include'
})
.then(r => r.json())
.then(d => console.log('CSRF Token Response:', d))
.catch(e => console.error('Error:', e))
```

**Expected Result:**
```json
{
  "success": true,
  "csrfToken": "some-long-token-string"
}
```

### Step 3: Check Cookie

After Step 2, check if cookie was set:

```javascript
// Check cookies
console.log('All cookies:', document.cookie)

// Look for csrf-token specifically
const csrfCookie = document.cookie.split('; ').find(row => row.startsWith('csrf-token='))
console.log('CSRF Cookie:', csrfCookie)
```

**Expected Result:**
```
CSRF Cookie: csrf-token=abc123xyz789...
```

**If cookie is missing:**
- Cookie might be blocked due to cross-site settings
- Backend might not be setting it correctly
- Browser privacy settings blocking third-party cookies

### Step 4: Test CSRF Validation

```javascript
// Get the token from cookie
const getCSRFToken = () => {
  const match = document.cookie.match(/csrf-token=([^;]+)/);
  return match ? match[1] : null;
};

const token = getCSRFToken();
console.log('Token from cookie:', token);

// Test CSRF endpoint
fetch('https://shaikh-jee-cosmetics-website-production.up.railway.app/api/csrf-test', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': token
  },
  body: JSON.stringify({ test: true })
})
.then(r => r.json())
.then(d => console.log('CSRF Test Result:', d))
.catch(e => console.error('Error:', e))
```

**Expected Result:**
```json
{
  "success": true,
  "message": "CSRF validation passed!",
  "receivedCookie": true,
  "receivedHeader": true
}
```

### Step 5: Check Railway Logs

Go to Railway Dashboard → Your Project → Deployments → View Logs

Look for CSRF debug messages like:
```
CSRF Validation Failed: {
  path: '/api/orders/new',
  cookieToken: 'missing',
  headerToken: 'present',
  ...
}
```

## Common Issues and Fixes

### Issue 1: Cookie Not Being Set

**Symptoms:**
- `document.cookie` doesn't contain `csrf-token`
- Console shows: "CSRF Cookie: undefined"

**Fixes:**

A. **Check Railway Environment Variables**
```bash
NODE_ENV=production
```

B. **Verify CORS allows credentials** (already configured)

C. **Check if cookie is being blocked:**
   - Open DevTools → Application → Cookies
   - Look for blocked cookies indicator
   - Check if "Block third-party cookies" is enabled

### Issue 2: Cookie Set But Not Sent with Requests

**Symptoms:**
- Cookie visible in DevTools → Application → Cookies
- But not included in request headers (Network tab)

**Fixes:**

A. **Cookie domain mismatch**
The cookie might be set for Railway domain but not accessible from Vercel.

Edit `server/middleware/csrf.js`:
```javascript
const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: false,
    secure: isProduction,
    sameSite: 'none',  // Already fixed
    maxAge: 24 * 60 * 60 * 1000,
    path: '/',
    // DO NOT set domain - let browser handle it
  };
};
```

### Issue 3: Header Not Being Sent

**Symptoms:**
- Backend logs show: `headerToken: 'missing'`

**Fix:** Already fixed in `src/services/api.ts`

### Issue 4: Browser Blocking Third-Party Cookies

Modern browsers (especially Safari, Firefox) block third-party cookies by default.

**Alternative Solutions:**

#### Option A: Use Same Domain (Recommended)
Deploy backend and frontend on same domain:
- Frontend: `https://shaikhjee.com`
- Backend: `https://api.shaikhjee.com`

#### Option B: Proxy Backend Through Vercel
Add to `next.config.js`:
```javascript
async rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: 'https://shaikh-jee-cosmetics-website-production.up.railway.app/api/:path*'
    }
  ]
}
```

Then update `NEXT_PUBLIC_API_URL=/api`

This makes backend appear as same-origin to browser.

## Quick Fix: Same-Origin Proxy (RECOMMENDED)

Since third-party cookies are increasingly blocked, the best solution is to proxy your Railway backend through Vercel:

### 1. Update `next.config.mjs`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.RAILWAY_API_URL || 'https://shaikh-jee-cosmetics-website-production.up.railway.app'}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
```

### 2. Update Vercel Environment Variables:

```bash
NEXT_PUBLIC_API_URL=/api
RAILWAY_API_URL=https://shaikh-jee-cosmetics-website-production.up.railway.app
```

### 3. Benefits:
- No more cross-origin cookie issues
- Browser sees all requests as same-origin
- CSRF works automatically
- Better security
- No browser compatibility issues

## Verification Checklist

After making changes:

- [ ] Backend deployed to Railway with new CSRF code
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set correctly
- [ ] Can fetch CSRF token successfully
- [ ] Cookie appears in DevTools
- [ ] Test endpoint passes
- [ ] Can place order successfully

## Still Not Working?

1. **Check Railway logs** for detailed error messages
2. **Test in incognito mode** to rule out cache issues
3. **Try different browser** (Chrome, Firefox, Safari)
4. **Share Railway logs** with error details

## Contact

If issue persists after trying all solutions, provide:
1. Railway deployment logs (with CSRF error)
2. Browser console output from Step 2-4
3. Screenshot of DevTools → Network → Order request headers
4. Browser name and version
