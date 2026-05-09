// Payment Service - Razorpay Integration

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface PaymentOrder {
  items: any[];
  total: number;
  shippingAddress: {
    name: string;
    email: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
  };
}

export interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  orderId?: string;
  amount: number;
  message?: string;
}

export interface RazorpayConfig {
  configured: boolean;
  keyId?: string;
}

export interface RazorpayOrderResponse {
  success: boolean;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const paymentService = {
  // Check if Razorpay is configured
  checkRazorpayConfig: async (): Promise<RazorpayConfig> => {
    try {
      const response = await fetch(`${API_URL}/payment/razorpay-key`);
      const data = await response.json();
      return {
        configured: data.configured || false,
        keyId: data.keyId
      };
    } catch (error) {
      console.error('Failed to check Razorpay config:', error);
      return { configured: false };
    }
  },

  // Load Razorpay script
  loadRazorpayScript: (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  },

  // Create Razorpay order
  createRazorpayOrder: async (amount: number, orderId: string, token: string): Promise<RazorpayOrderResponse | null> => {
    try {
      const response = await fetch(`${API_URL}/payment/razorpay-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount, orderId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create payment order');
      }

      return await response.json();
    } catch (error) {
      console.error('Create Razorpay order error:', error);
      return null;
    }
  },

  // Verify Razorpay payment
  verifyRazorpayPayment: async (
    razorpay_order_id: string,
    razorpay_payment_id: string,
    razorpay_signature: string,
    orderId: string,
    token: string
  ): Promise<PaymentResponse> => {
    try {
      const response = await fetch(`${API_URL}/payment/razorpay-verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          orderId
        }),
      });

      const data = await response.json();
      return {
        success: data.success,
        paymentId: razorpay_payment_id,
        orderId,
        amount: 0,
        message: data.message
      };
    } catch (error) {
      console.error('Verify payment error:', error);
      return {
        success: false,
        amount: 0,
        message: 'Payment verification failed'
      };
    }
  },

  // Open Razorpay checkout
  openRazorpayCheckout: async (
    razorpayOrderId: string,
    amount: number,
    keyId: string,
    orderId: string,
    customerInfo: {
      name: string;
      email: string;
      phone: string;
    },
    token: string,
    onSuccess: (response: any) => void,
    onError: (error: any) => void
  ): Promise<void> => {
    const scriptLoaded = await paymentService.loadRazorpayScript();

    if (!scriptLoaded) {
      onError({ message: 'Failed to load payment gateway' });
      return;
    }

    const options = {
      key: keyId,
      amount: amount,
      currency: 'PKR',
      name: 'Shaikh Jee Cosmetics',
      description: 'Order Payment',
      order_id: razorpayOrderId,
      prefill: {
        name: customerInfo.name,
        email: customerInfo.email,
        contact: customerInfo.phone
      },
      theme: {
        color: '#D4AF87'
      },
      handler: async function (response: any) {
        // Verify the payment on backend
        const verifyResult = await paymentService.verifyRazorpayPayment(
          response.razorpay_order_id,
          response.razorpay_payment_id,
          response.razorpay_signature,
          orderId,
          token
        );

        if (verifyResult.success) {
          onSuccess(response);
        } else {
          onError({ message: verifyResult.message || 'Payment verification failed' });
        }
      },
      modal: {
        ondismiss: function() {
          onError({ message: 'Payment cancelled by user' });
        }
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.on('payment.failed', function (response: any) {
      onError({
        message: response.error.description || 'Payment failed',
        code: response.error.code
      });
    });
    razorpay.open();
  },

  // Calculate payment processing fee (example: 2% + Rs.2)
  calculateProcessingFee: (amount: number): number => {
    return Math.max(2, Math.ceil(amount * 0.02));
  },

  // Check if payment is COD
  isCOD: (paymentMethod: string): boolean => {
    return paymentMethod.toLowerCase() === 'cod';
  },

  // Get available payment methods
  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    const config = await paymentService.checkRazorpayConfig();

    return paymentService.paymentMethods.map(method => {
      if (method.id === 'razorpay' || method.id === 'upi') {
        return { ...method, enabled: config.configured };
      }
      return method;
    });
  },

  // Supported payment methods
  paymentMethods: [
    { id: 'razorpay', name: 'Pay Online', description: 'Cards, UPI, Net Banking, Wallets', icon: '💳', enabled: false },
    { id: 'cod', name: 'Cash on Delivery', description: 'Pay when you receive', icon: '💵', enabled: true },
  ],
};

export default paymentService;
