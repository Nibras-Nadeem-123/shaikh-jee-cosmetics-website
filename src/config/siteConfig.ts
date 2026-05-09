// Site configuration - Update these values with your actual business information
// These can be overridden by environment variables

export const siteConfig = {
  name: 'Shaikh Jee Cosmetics',
  tagline: 'Premium Beauty & Skincare',
  description: 'Discover luxurious cosmetics and premium skincare at Shaikh Jee. 100% authentic products, free shipping on orders above Rs.999.',

  // Contact Information
  contact: {
    phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || '+92 321 1234567',
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'support@shaikhjee.com',
    supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@shaikhjee.com',
    salesEmail: process.env.NEXT_PUBLIC_SALES_EMAIL || 'sales@shaikhjee.com',
  },

  // Address
  address: {
    line1: process.env.NEXT_PUBLIC_ADDRESS_LINE1 || 'Beauty Plaza',
    line2: process.env.NEXT_PUBLIC_ADDRESS_LINE2 || 'Shop No. 12, Ground Floor',
    city: process.env.NEXT_PUBLIC_ADDRESS_CITY || 'Karachi',
    state: process.env.NEXT_PUBLIC_ADDRESS_STATE || 'Sindh',
    pincode: process.env.NEXT_PUBLIC_ADDRESS_PINCODE || '74000',
    country: process.env.NEXT_PUBLIC_ADDRESS_COUNTRY || 'Pakistan',
  },

  // Business Hours
  hours: {
    weekdays: 'Mon - Sat: 9AM - 8PM',
    weekend: 'Sunday: 10AM - 6PM',
    support: '24/7 Email Support',
  },

  // Social Media Links
  social: {
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://instagram.com/shaikhjeecosmetics',
    facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || 'https://facebook.com/shaikhjeecosmetics',
    twitter: process.env.NEXT_PUBLIC_TWITTER_URL || 'https://twitter.com/shaikhjee',
    youtube: process.env.NEXT_PUBLIC_YOUTUBE_URL || '',
    pinterest: process.env.NEXT_PUBLIC_PINTEREST_URL || '',
  },

  // URLs
  urls: {
    site: process.env.NEXT_PUBLIC_SITE_URL || 'https://shaikhjee.com',
    api: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  },

  // Shipping
  shipping: {
    freeShippingThreshold: 999,
    standardShippingFee: 99,
    expressShippingFee: 149,
    estimatedDeliveryDays: {
      metro: '3-5',
      tier2: '5-7',
      other: '7-10',
    },
  },

  // Returns
  returns: {
    returnWindowDays: 7,
    refundProcessingDays: '5-7',
  },

  // Currency
  currency: {
    code: 'PKR',
    symbol: 'Rs.',
    name: 'Pakistani Rupee',
  },

  // SEO
  seo: {
    titleTemplate: '%s | Shaikh Jee Cosmetics',
    defaultTitle: 'Shaikh Jee Cosmetics | Premium Beauty & Skincare',
    defaultDescription: 'Discover luxurious cosmetics and premium skincare at Shaikh Jee. 100% authentic products, free shipping on orders above Rs.999.',
    keywords: ['cosmetics', 'skincare', 'beauty', 'makeup', 'luxury beauty', 'Pakistani cosmetics', 'organic skincare'],
  },
};

// Helper function to get full address as string
export const getFullAddress = () => {
  const { address } = siteConfig;
  return `${address.line1}, ${address.line2}, ${address.city}, ${address.state} ${address.pincode}, ${address.country}`;
};

// Helper function to get short address
export const getShortAddress = () => {
  const { address } = siteConfig;
  return `${address.city}, ${address.state}, ${address.country}`;
};

export default siteConfig;
