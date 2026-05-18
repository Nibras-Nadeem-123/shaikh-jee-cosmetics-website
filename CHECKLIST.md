# 🔍 Deployment Checklist - Why CSRF Still Fails

## Current Status
- ✅ Code changes are committed
- ❓ Need to verify deployment configuration

## Step-by-Step Verification

### ✅ Step 1: Verify Files Are Deployed

**Check Backend (Railway):**
1. Go to Railway Dashboard
2. Check latest deployment timestamp
3. Look for commit: "Fix CSRF token issue..."
4. Check if deployment succeeded (green checkmark)

**Check Frontend (Vercel):**
1. Go to Vercel Dashboard
2. Check latest deployment timestamp
3. Look for commit: "Fix CSRF token issue..."
4. Check if deployment succeeded (green checkmark)

**If not deployed:**
```bash
git status  # Check if changes are committed
git push    # Push changes
```

---

### ✅ Step 2: Verify Vercel Environment Variables

**CRITICAL:** Go to Vercel Dashboard → Your Project → Settings → Environment Variables

**Check these EXACT values:**

```
Name: NEXT_PUBLIC_API_URL
Value: /api
Environments: ✓ Production ✓ Preview ✓ Development

Name: RAILWAY_API_URL
Value: https://shaikh-jee-cosmetics-website-production.up.railway.app
Environments: ✓ Production ✓ Preview ✓ Development
```

**Common Mistakes:**
- ❌ `NEXT_PUBLIC_API_URL=http://localhost:5000/api` (This is wrong for production!)
- ❌ `NEXT_PUBLIC_API_URL=https://shaikh-jee-cosmetics-website-production.up.railway.app/api` (This bypasses the proxy!)
- ✅ `NEXT_PUBLIC_API_URL=/api` (This is correct!)

**After changing env variables:**
- Click "Redeploy" in Vercel
- Wait for deployment to complete (~2 minutes)

---

### ✅ Step 3: Test the Deployment

**Open your deployed site and run in browser console:**

```javascript
// Test 1: Check API URL
console.log('Using API URL:', '/api');  // Should always be /api

// Test 2: Test the proxy
fetch('/api/csrf-token', { credentials: 'include' })
  .then(r => {
    console.log('Status:', r.status);
    if (r.status === 404) {
      console.error('❌ PROXY NOT WORKING - Check Vercel deployment and env vars');
    } else if (r.status === 200) {
      console.log('✅ Proxy is working!');
    }
    return r.json();
  })
  .then(d => console.log('CSRF Token:', d))
  .catch(e => console.error('Error:', e));

// Test 3: Check cookie (run after Test 2)
setTimeout(() => {
  const cookie = document.cookie.match(/csrf-token=([^;]+)/);
  if (cookie) {
    console.log('✅ CSRF Cookie present:', cookie[1].substring(0, 20) + '...');
  } else {
    console.error('❌ CSRF Cookie MISSING');
  }
}, 2000);
```

---

### ✅ Step 4: Check Railway Backend

**Go to Railway Dashboard → Deployments → View Logs**

Look for:
```
✅ Good: "Server running on port 5000"
✅ Good: "MongoDB connected"
❌ Bad: Any error messages about CSRF or cookies
```

**Check Railway Environment Variables:**
```
NODE_ENV=production
MONGODB_URI=your-mongodb-uri
FRONTEND_URL=https://your-site.vercel.app
```

---

### ✅ Step 5: Diagnose the Specific Issue

Based on the test results:

#### Issue A: Status 404 on `/api/csrf-token`
**Cause:** Proxy not working
**Fix:**
1. Verify `NEXT_PUBLIC_API_URL=/api` in Vercel
2. Verify `RAILWAY_API_URL` is set correctly in Vercel
3. Check `next.config.js` has the `rewrites()` function
4. Redeploy Vercel

#### Issue B: Status 200 but no cookie
**Cause:** Backend not setting cookie
**Fix:**
1. Check Railway deployed latest code (with CSRF fixes)
2. Check Railway logs for errors
3. Try in incognito mode (rules out browser cache)

#### Issue C: Cookie present but still 403 on orders
**Cause:** Token not being sent in headers
**Fix:**
1. Check Railway logs for "CSRF Validation Failed" message
2. Look at the debug info in logs
3. May need to add more debugging

#### Issue D: Everything looks good but still fails
**Cause:** Browser blocking third-party cookies despite proxy
**Fix:**
1. Try in different browser
2. Check if user has strict privacy settings
3. May need Option 1 from `IMMEDIATE_FIX.md`

---

## Quick Decision Tree

```
Start Here
    |
    ├─> Test 2 shows 404?
    |       └─> Fix: Set NEXT_PUBLIC_API_URL=/api in Vercel
    |           and redeploy
    |
    ├─> Test 3 shows no cookie?
    |       └─> Fix: Check Railway deployed with CSRF fixes
    |           Or try IMMEDIATE_FIX.md Option 1
    |
    └─> Everything works in tests but orders still fail?
            └─> Share Railway logs and I'll help debug further
```

---

## Still Not Working?

If you've gone through all steps and it still doesn't work, use **Option 1 from IMMEDIATE_FIX.md** to get orders working immediately, then share:

1. ✅ Screenshot of Vercel environment variables
2. ✅ Console output from Step 3 tests
3. ✅ Railway logs showing the CSRF error
4. ✅ Screenshot of DevTools → Network → Failed order request

With this info, I can provide the exact fix for your specific situation.
