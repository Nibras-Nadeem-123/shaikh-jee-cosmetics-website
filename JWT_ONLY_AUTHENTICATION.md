# 🔐 JWT-Only Authentication (No CSRF Needed)

## Why Switch to JWT-Only?

Your current setup:
- ✅ Using JWT tokens for authentication
- ❌ Also trying to use CSRF tokens (causing issues)
- ❌ Cross-domain cookie problems

**Solution:** Use JWT-only authentication - No CSRF needed!

## How JWT Prevents CSRF

CSRF attacks work by:
1. Attacker tricks user into clicking a link
2. Browser automatically sends cookies to your site
3. Attacker makes unauthorized requests

**JWT in Authorization header prevents this:**
- ❌ Attackers cannot read JWT from localStorage
- ❌ Attackers cannot make browsers send Authorization headers
- ✅ Only your frontend can send the JWT
- ✅ No cookies = No CSRF vulnerability

## Implementation

### Current Backend (Keep JWT Auth)

```javascript
// middleware/auth.js
export const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};
```

### Remove CSRF Completely

**Option 1: Comment Out CSRF (Quick Fix)**

In `server/server.js`:
```javascript
// CSRF Protection - DISABLED (using JWT-only auth)
// app.use(csrfProtection);

// CSRF error handler - DISABLED
// app.use(handleCSRFError);

// Route to get CSRF token - DISABLED
// app.get('/api/csrf-token', getCSRFToken);
```

**Option 2: Selective CSRF (Recommended)**

Keep CSRF for form submissions (contact, newsletter), but not for API:

```javascript
// server/middleware/csrf.js
const API_EXEMPT_PATHS = [
  '/api/orders',
  '/api/products',
  '/api/users',
  '/api/wishlist',
  '/api/cart'
];

export const selectiveCSRFProtection = (req, res, next) => {
  // Skip CSRF for API routes (protected by JWT)
  if (req.path.startsWith('/api/')) {
    const isApiRoute = API_EXEMPT_PATHS.some(path =>
      req.path.startsWith(path)
    );
    if (isApiRoute) {
      return next();
    }
  }

  // Apply CSRF for everything else
  csrfProtection(req, res, next);
};
```

Then in `server.js`:
```javascript
app.use(selectiveCSRFProtection);
```

### Frontend (No Changes Needed!)

Your frontend already does this correctly:
```javascript
// src/services/api.ts
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};

fetch('/api/orders/new', {
  method: 'POST',
  headers,
  body: JSON.stringify(orderData)
});
```

## Security Comparison

### CSRF Token Method:
```
Security: ⭐⭐⭐⭐
Complexity: ⭐⭐⭐⭐⭐ (High)
Cross-domain: ❌ (Difficult)
Browser support: ⭐⭐⭐
```

### JWT-Only Method:
```
Security: ⭐⭐⭐⭐⭐ (Better against CSRF)
Complexity: ⭐⭐ (Low)
Cross-domain: ✅ (Easy)
Browser support: ⭐⭐⭐⭐⭐
```

## XSS Protection (Important!)

JWT in localStorage is vulnerable to XSS. Mitigate with:

### 1. Content Security Policy (CSP)

In `next.config.js`:
```javascript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
        }
      ]
    }
  ];
}
```

### 2. HTTP-Only Cookies for JWT (Best of Both Worlds)

Store JWT in HTTP-only cookie:
```javascript
// Backend
res.cookie('token', jwt, {
  httpOnly: true,  // Can't be accessed by JavaScript
  secure: true,
  sameSite: 'strict'
});

// Frontend - no localStorage needed!
fetch('/api/orders', {
  credentials: 'include' // Automatically sends cookie
});
```

This gives you:
- ✅ Immune to XSS (HTTP-only)
- ✅ Immune to CSRF (SameSite)
- ✅ No token management needed

## Migration Steps

### Step 1: Remove CSRF from API Routes

Edit `server/middleware/csrf.js`:
```javascript
const CSRF_EXEMPT_PATHS = [
  // Auth
  '/api/auth/login',
  '/api/auth/signup',

  // API Routes (protected by JWT instead)
  '/api/orders',
  '/api/products',
  '/api/users',
  '/api/cart',
  '/api/wishlist',

  // Webhooks
  '/api/payment/webhook',
  // ... rest
];
```

### Step 2: Deploy

```bash
git add server/middleware/csrf.js
git commit -m "Use JWT-only authentication for API routes"
git push
```

### Step 3: Remove CSRF Token Fetching from Frontend (Optional)

In `src/contexts/AppContext.tsx`:
```javascript
// Remove this line:
// initializeCSRF().catch(console.warn);
```

In `src/services/api.ts`:
```javascript
// Remove CSRF token logic
const getHeaders = async (includeAuth = false) => {
  const headers = {
    'Content-Type': 'application/json'
  };

  if (includeAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};
```

## When to Use CSRF vs JWT

### Use CSRF When:
- ✅ Using cookie-based sessions
- ✅ Same domain for frontend & backend
- ✅ Traditional server-rendered apps

### Use JWT When:
- ✅ Separate frontend & backend domains
- ✅ API-first architecture
- ✅ Mobile app support needed
- ✅ Microservices

### Use Both When:
- ✅ Cookie-based sessions + AJAX requests
- ✅ Maximum security for sensitive operations

## Your Specific Case

You should use **JWT-only** because:
1. ✅ Frontend on Vercel, Backend on Railway (different domains)
2. ✅ Already using JWT for auth
3. ✅ API-first architecture
4. ✅ CSRF cookies causing issues
5. ✅ Modern SPA (Single Page Application)

## Conclusion

**Recommendation:** Remove CSRF protection for API routes, rely on JWT authentication.

This will:
- ✅ Fix your current CSRF errors permanently
- ✅ Simplify your codebase
- ✅ Work reliably across domains
- ✅ Maintain security (JWT validates every request)

The temporary exemption I added earlier is actually the correct long-term solution for API routes!
