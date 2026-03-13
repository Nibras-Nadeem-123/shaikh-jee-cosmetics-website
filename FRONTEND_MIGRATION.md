# Frontend Migration Checklist

This document outlines the frontend components that need to be updated to utilize the new backend features.

## 🔄 Components to Update

### 1. Authentication

- [ ] Update `login/page.tsx` to use new validation feedback
- [ ] Update `signup` to show stronger password requirements
- [ ] Add error boundary to auth pages
- [ ] Update API service with new error handling

### 2. Product Listing & Search

- [ ] Update `shop/page.tsx` to use new pagination
- [ ] Implement search suggestions dropdown
- [ ] Add skeleton loader while fetching products
- [ ] Implement infinite scroll or pagination UI

### 3. Product Details

- [ ] Update `product/[slug]/page.tsx` to load reviews
- [ ] Add review submission form
- [ ] Implement review rating display
- [ ] Add helpful count button for reviews
- [ ] Load featured/best-seller indicators

### 4. Wishlist

- [ ] Update to sync with database via API
- [ ] Fetch wishlist from `/api/wishlist` on app load
- [ ] Persist changes to database immediately
- [ ] Remove localStorage wishlist code
- [ ] Add wishlist page at `/account?tab=wishlist`

### 5. Cart & Checkout

- [ ] Update checkout to use discount code validation
- [ ] Integrate Razorpay payment gateway
- [ ] Show discount applied in order summary
- [ ] Display order ID after successful payment
- [ ] Add loading state during payment

### 6. Order Tracking

- [ ] Create order tracking page `/track/[orderId]`
- [ ] Implement WebSocket for real-time status updates
- [ ] Display order status timeline
- [ ] Add order details with items and address
- [ ] Show shipping carrier info (future enhancement)

### 7. Account Page

- [ ] Create tab for order history
- [ ] Create tab for wishlist management
- [ ] Create tab for address management
- [ ] Add address add/edit/delete forms
- [ ] Sync addresses with database

### 8. Admin Dashboard

- [ ] Create admin product management page
- [ ] Add product CRUD operations
- [ ] Create discount code management section
- [ ] Add order management view
- [ ] Implement admin analytics dashboard (future)

### 9. Error Handling

- [ ] Wrap pages with ErrorBoundary
- [ ] Add ApiError component to async operations
- [ ] Implement retry logic for failed API calls
- [ ] Add user-friendly error messages

### 10. Loading States

- [ ] Replace generic LoadingSpinner with SkeletonLoaders
- [ ] Add ProductCardSkeleton on shop page
- [ ] Add ProductDetailsSkeleton on product page
- [ ] Add CartPageSkeleton on cart page

## 📝 Code Examples

### Using New Review System

```tsx
import { apiService } from "@/services/api";
import { useApp } from "@/contexts/AppContext";

export function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useApp();

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const response = await apiService.getProductReviews(productId);
      setReviews(response.reviews);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async (rating: number, comment: string) => {
    try {
      await apiService.createReview({
        productId,
        rating,
        comment,
      });
      await fetchReviews();
    } catch (error) {
      console.error("Failed to submit review:", error);
    }
  };

  if (loading) return <SkeletonLoader count={3} />;

  return (
    <div>
      {user && <ReviewForm onSubmit={submitReview} />}
      <ReviewsList reviews={reviews} />
    </div>
  );
}
```

### Using Discount Code Validation

```tsx
import { apiService } from "@/services/api";
import { ApiError } from "@/components/ApiError";

export function CheckoutForm() {
  const [discountCode, setDiscountCode] = useState("");
  const [discountError, setDiscountError] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const { cartTotal } = useApp();

  const applyDiscount = async () => {
    try {
      setDiscountError("");
      const response = await apiService.validateDiscountCode({
        code: discountCode,
        orderAmount: cartTotal,
      });
      setAppliedDiscount(response.discountCode);
    } catch (error) {
      setDiscountError(error.message);
    }
  };

  return (
    <div>
      <input
        value={discountCode}
        onChange={(e) => setDiscountCode(e.target.value)}
        placeholder="Enter discount code"
      />
      <button onClick={applyDiscount}>Apply</button>

      {discountError && <ApiError error={discountError} variant="inline" />}

      {appliedDiscount && (
        <p>Discount applied: ₹{appliedDiscount.discountAmount}</p>
      )}
    </div>
  );
}
```

### Using Razorpay Payment

```tsx
import Razorpay from "razorpay";
import { apiService } from "@/services/api";

export function PaymentButton({
  amount,
  orderId,
}: {
  amount: number;
  orderId: string;
}) {
  const handlePayment = async () => {
    try {
      // Create payment order
      const orderResponse = await apiService.createPaymentOrder({
        amount,
        currency: "INR",
      });

      // Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: orderResponse.paymentOrder.amount,
        currency: orderResponse.paymentOrder.currency,
        order_id: orderResponse.paymentOrder.id,
        handler: async (response: any) => {
          // Verify payment
          await apiService.verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          // Create order on success
          // ... rest of implementation
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment failed:", error);
    }
  };

  return <button onClick={handlePayment}>Pay ₹{amount}</button>;
}
```

### Using Wishlist Sync

```tsx
export function WishlistButton({ productId }: { productId: string }) {
  const { user } = useApp();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) checkWishlist();
  }, [user, productId]);

  const checkWishlist = async () => {
    try {
      const response = await apiService.checkWishlist(productId);
      setIsInWishlist(response.inWishlist);
    } catch (error) {
      console.error("Failed to check wishlist:", error);
    }
  };

  const toggleWishlist = async () => {
    if (!user) {
      // Redirect to login
      return;
    }

    try {
      setLoading(true);
      if (isInWishlist) {
        await apiService.removeFromWishlist(productId);
      } else {
        await apiService.addToWishlist(productId);
      }
      setIsInWishlist(!isInWishlist);
    } catch (error) {
      console.error("Failed to update wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={toggleWishlist} disabled={loading}>
      <Heart filled={isInWishlist} />
    </button>
  );
}
```

## 🔄 API Service Updates Needed

Update `src/services/api.ts`:

```typescript
// Add these new methods
export const apiService = {
  // ... existing methods

  // Reviews
  getProductReviews: async (productId: string, page: number = 1) => {
    const response = await fetch(
      `${API_URL}/reviews/product/${productId}?page=${page}`
    );
    return response.json();
  },

  createReview: async (
    data: { productId: string; rating: number; comment: string },
    token: string
  ) => {
    const response = await fetch(`${API_URL}/reviews/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Wishlist
  getWishlist: async (token: string) => {
    const response = await fetch(`${API_URL}/wishlist`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
  },

  addToWishlist: async (productId: string, token: string) => {
    const response = await fetch(`${API_URL}/wishlist/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId }),
    });
    return response.json();
  },

  // Discount
  validateDiscountCode: async (data: { code: string; orderAmount: number }) => {
    const response = await fetch(`${API_URL}/discount/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Payment
  createPaymentOrder: async (
    data: { amount: number; currency?: string },
    token: string
  ) => {
    const response = await fetch(`${API_URL}/payment/order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  verifyPayment: async (data: any, token: string) => {
    const response = await fetch(`${API_URL}/payment/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};
```

## ✅ Testing Checklist

After implementing all updates:

- [ ] Test user registration and login
- [ ] Test product search with autocomplete
- [ ] Test adding/removing from wishlist
- [ ] Test adding items to cart
- [ ] Test applying discount codes
- [ ] Test payment flow with Razorpay
- [ ] Test order creation and tracking
- [ ] Test review submission and display
- [ ] Test admin product management
- [ ] Test error handling and retry logic
- [ ] Test on mobile devices
- [ ] Test responsiveness on tablets

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Update `.env.production` with production URLs
- [ ] Set up production MongoDB
- [ ] Configure production email credentials
- [ ] Setup Razorpay production keys
- [ ] Enable HTTPS
- [ ] Configure CORS for production domain
- [ ] Setup Redis for production
- [ ] Run load testing
- [ ] Backup database
- [ ] Create maintenance page (optional)

---

**Last Updated**: January 2026
