# CSRF Error Diagnosis

## Please run these tests in your browser console on the deployed Vercel site

### Test 1: Check API URL Configuration
```javascript
// Check what API URL is being used
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
// Expected: Should show "/api" or your Railway URL
```

### Test 2: Check if Proxy is Working
```javascript
// Test if the proxy route exists
fetch('/api/csrf-token', {
  method: 'GET',
  credentials: 'include'
})
.then(async (response) => {
  console.log('Response Status:', response.status);
  console.log('Response Headers:', [...response.headers.entries()]);
  const data = await response.json();
  console.log('Response Data:', data);
  return data;
})
.catch(err => console.error('Error:', err));
```

### Test 3: Check Cookies
```javascript
// After Test 2 completes, check for CSRF cookie
setTimeout(() => {
  console.log('All Cookies:', document.cookie);
  const csrfCookie = document.cookie.split('; ').find(c => c.startsWith('csrf-token='));
  console.log('CSRF Cookie:', csrfCookie);

  if (csrfCookie) {
    console.log('✅ Cookie is present');
  } else {
    console.log('❌ Cookie is MISSING - this is the problem!');
  }
}, 1000);
```

### Test 4: Manual Order Test with CSRF Token
```javascript
// Get CSRF token from cookie
function getCSRFToken() {
  const match = document.cookie.match(/csrf-token=([^;]+)/);
  return match ? match[1] : null;
}

const csrfToken = getCSRFToken();
console.log('CSRF Token:', csrfToken);

if (!csrfToken) {
  console.error('❌ No CSRF token found! Run Test 2 first.');
} else {
  // Get auth token
  const authToken = localStorage.getItem('token');
  console.log('Auth Token:', authToken ? 'Present' : 'Missing');

  if (!authToken) {
    console.error('❌ Not logged in! Please log in first.');
  } else {
    // Try to create a test order
    const testOrder = {
      orderItems: [{
        product: '000000000000000000000000', // Fake product ID
        name: 'Test Product',
        quantity: 1,
        price: 100,
        image: ''
      }],
      itemsPrice: 100,
      shippingPrice: 0,
      totalPrice: 100,
      shippingAddress: {
        name: 'Test User',
        addressLine1: 'Test Address',
        city: 'Test City',
        state: 'Test State',
        pincode: '123456',
        phone: '1234567890',
        email: 'test@test.com'
      },
      paymentMethod: 'COD'
    };

    fetch('/api/orders/new', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        'X-CSRF-Token': csrfToken,
        'csrf-token': csrfToken
      },
      body: JSON.stringify(testOrder)
    })
    .then(async (response) => {
      console.log('Order Response Status:', response.status);
      const data = await response.json();
      console.log('Order Response:', data);

      if (response.status === 403) {
        console.error('❌ CSRF validation failed!');
        console.log('Debug info:', data);
      } else if (response.ok) {
        console.log('✅ Order would work (test product will fail but CSRF passed)');
      }
      return data;
    })
    .catch(err => console.error('Error:', err));
  }
}
```

## Expected Results vs Issues

### If Test 2 shows Status 404:
**Problem:** Proxy is not working
**Fix:**
1. Make sure `NEXT_PUBLIC_API_URL=/api` in Vercel
2. Redeploy Vercel

### If Test 3 shows "Cookie is MISSING":
**Problem:** CSRF cookie not being set
**Possible causes:**
1. Proxy not working (see 404 above)
2. Backend not deployed with CSRF fixes
3. Browser blocking cookies

**Fix:**
1. Check if backend is deployed to Railway
2. Check Railway logs for errors
3. Try in different browser/incognito mode

### If Test 4 shows 403 with debug info:
**Problem:** CSRF validation failing
**Check the debug info returned:**
- If `cookiePresent: false` → Cookie not sent (browser issue or wrong domain)
- If `headerPresent: false` → Frontend not sending header (code issue)
- If both present but still 403 → Token mismatch (timing issue)

## Quick Fixes to Try

### Fix 1: Clear All Site Data
1. Open DevTools (F12)
2. Go to Application tab
3. Click "Clear site data"
4. Refresh page
5. Try ordering again

### Fix 2: Verify Vercel Environment Variables
Go to Vercel Dashboard and check:
```
NEXT_PUBLIC_API_URL should be: /api
RAILWAY_API_URL should be: https://shaikh-jee-cosmetics-website-production.up.railway.app
```

### Fix 3: Temporary Workaround (NOT RECOMMENDED FOR PRODUCTION)
If you need orders to work immediately while debugging, you can temporarily add `/api/orders/new` to the CSRF exempt paths in `server/middleware/csrf.js`:

```javascript
const CSRF_EXEMPT_PATHS = [
  '/api/auth/login',
  '/api/auth/signup',
  '/api/orders/new',  // TEMPORARY - Remove after fixing
  // ... rest
];
```

**⚠️ WARNING:** This disables CSRF protection for orders. Only use for testing!

## Report Results

Please run all 4 tests and share:
1. Console output from each test
2. Screenshots of:
   - Vercel environment variables
   - DevTools → Application → Cookies
   - DevTools → Network → Failed order request (Headers tab)
3. Railway logs showing the CSRF error
