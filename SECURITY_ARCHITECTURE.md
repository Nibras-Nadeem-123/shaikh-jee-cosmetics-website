# 🔐 Security Architecture

## Authentication & Authorization

### JWT-Based Authentication

**All API routes use JWT tokens for authentication:**

```javascript
// Client sends token in Authorization header
headers: {
  'Authorization': `Bearer ${token}`
}

// Server validates JWT
const token = req.headers.authorization?.split(' ')[1];
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

**Routes protected:**
- `/api/orders/*` - Order management
- `/api/users/*` - User profiles
- `/api/wishlist/*` - Wishlist operations
- `/api/cart/*` - Cart operations
- `/api/reviews/*` - Product reviews
- `/api/loyalty/*` - Loyalty program
- `/api/referrals/*` - Referral system

## CSRF Protection Strategy

### Selective CSRF Protection

**Why different routes need different protection:**

| Route Type | Protection Method | Reason |
|------------|-------------------|--------|
| **API Routes** | JWT Only | Uses Authorization header (immune to CSRF) |
| **Form Submissions** | CSRF Token | Uses cookies (vulnerable to CSRF) |
| **Webhooks** | Signature Verification | External services |

### Implementation

#### 1. JWT-Protected Routes (No CSRF)

```javascript
// These routes skip CSRF validation
const JWT_PROTECTED_ROUTES = [
  '/api/orders',
  '/api/products',
  '/api/users',
  '/api/wishlist',
  '/api/cart'
];
```

**Why no CSRF needed:**
- ✅ Token in Authorization header (not cookie)
- ✅ Attackers can't read localStorage
- ✅ Attackers can't force browsers to send Authorization headers
- ✅ Immune to CSRF attacks by design

#### 2. Form Submissions (CSRF Protected)

```javascript
// These routes require CSRF tokens
const CSRF_REQUIRED = [
  '/api/contact',
  '/api/newsletter/subscribe',
  '/api/stock-alerts/subscribe'
];
```

**Why CSRF needed:**
- ⚠️ May use cookies for state
- ⚠️ Form posts can be forged
- ✅ CSRF token validates request origin

#### 3. Webhooks (Signature Verified)

```javascript
const WEBHOOK_PATHS = [
  '/api/payment/razorpay-webhook',
  '/api/payment/webhook'
];
```

**Why special handling:**
- External services (Razorpay, etc.)
- Use signature verification
- Don't have CSRF tokens

## Security Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Request                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │  Is API Route?       │
          └──────────┬───────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
        YES                     NO
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌──────────────────┐
│ Check JWT Token │    │ Check CSRF Token │
└────────┬────────┘    └────────┬─────────┘
         │                      │
    ┌────┴────┐            ┌────┴────┐
  Valid?   Invalid      Valid?   Invalid
    │         │            │         │
    ▼         ▼            ▼         ▼
 Allow     403         Allow      403
```

## Attack Prevention

### 1. CSRF Attack Prevention

**How CSRF attacks work:**
```html
<!-- Attacker's malicious site -->
<form action="https://yoursite.com/api/orders/new" method="POST">
  <input name="product" value="expensive-item">
</form>
<script>document.forms[0].submit()</script>
```

**Why this fails with JWT:**
- ❌ Attacker can't access user's localStorage
- ❌ Browser won't send Authorization header to attacker's site
- ✅ Request has no JWT token = 401 Unauthorized

**Why this fails with CSRF token:**
- ❌ Attacker can't read CSRF cookie (Same-Origin Policy)
- ❌ Attacker can't set CSRF header
- ✅ Request has no/wrong CSRF token = 403 Forbidden

### 2. XSS Attack Mitigation

**Risk:** If attacker injects JavaScript, they can steal JWT from localStorage

**Mitigations implemented:**

1. **Content Security Policy (CSP)**
```javascript
// next.config.js
headers: [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self'"
  }
]
```

2. **Input Sanitization**
```javascript
// All user inputs are sanitized
app.use(mongoSanitize()); // Prevents NoSQL injection
```

3. **HTTP Security Headers**
```javascript
app.use(helmet()); // Sets various security headers
```

### 3. Token Hijacking Prevention

**Mitigations:**

1. **Short token expiry**
```javascript
// JWT expires in 7 days
const token = jwt.sign(payload, secret, { expiresIn: '7d' });
```

2. **Secure storage**
```javascript
// Token in localStorage (not vulnerable to CSRF)
// Alternative: HTTP-only cookie (not vulnerable to XSS)
```

3. **Token refresh mechanism**
```javascript
// User re-authenticates when token expires
if (error.response?.status === 401) {
  // Redirect to login
}
```

## Best Practices Implemented

### ✅ Defense in Depth

1. **JWT Authentication** - Primary auth mechanism
2. **CSRF Protection** - For form submissions
3. **CORS Configuration** - Restricts origins
4. **Rate Limiting** - Prevents brute force
5. **Input Validation** - Prevents injection attacks
6. **Security Headers** - Browser-level protection

### ✅ Principle of Least Privilege

- CSRF only where needed (form submissions)
- JWT validation on every API request
- Admin routes have additional role checks

### ✅ Fail Securely

```javascript
// Default deny
if (!token) {
  return res.status(401).json({ error: 'Unauthorized' });
}

// Explicit allow
if (validToken) {
  next();
}
```

## Configuration Summary

### Backend (Railway)

```javascript
// server/server.js
app.use(selectiveCSRFProtection); // Smart CSRF protection
app.use(authenticate);            // JWT validation middleware

// Protected route example
router.post('/orders/new', authenticate, createOrder);
```

### Frontend (Vercel)

```javascript
// src/services/api.ts
headers: {
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
}
```

## Security Checklist

- [x] JWT authentication for all API routes
- [x] CSRF protection for form submissions
- [x] Selective CSRF (skip for JWT routes)
- [x] CORS properly configured
- [x] Rate limiting enabled
- [x] Input sanitization
- [x] Security headers (Helmet)
- [x] HTTPS enforced in production
- [x] Secrets in environment variables
- [x] Token expiry implemented
- [x] Error messages don't leak info
- [x] MongoDB injection prevention

## Monitoring & Logging

### Security Events Logged

```javascript
// Failed auth attempts
console.error('Authentication failed:', { ip, path });

// CSRF violations
console.error('CSRF validation failed:', { path, method });

// Rate limit exceeded
console.warn('Rate limit exceeded:', { ip });
```

## Future Enhancements

### Consider implementing:

1. **Refresh Tokens**
   - Long-lived refresh token in HTTP-only cookie
   - Short-lived access token in memory
   - Best security + UX balance

2. **Two-Factor Authentication (2FA)**
   - Optional for users
   - Required for admins

3. **Session Management**
   - Track active sessions
   - Allow users to revoke sessions
   - Force logout on suspicious activity

4. **Advanced Rate Limiting**
   - Per-user limits
   - Adaptive limits based on behavior
   - IP reputation scoring

## References

- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
