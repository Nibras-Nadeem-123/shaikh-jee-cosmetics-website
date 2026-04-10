export interface Category {
  id: string;
  name: string;
  image: string;
  description?: string;
  slug?: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  category: string;
  subcategory?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image?: string;
  images?: string[];
  description: string;
  ingredients?: string[];
  usage?: string;
  skinTypes?: string[];
  shades?: Shade[];
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
  isBestSeller?: boolean;
  isNew?: boolean;
  brand?: string;
  featured?: boolean;
}

export interface Shade {
  _id: string;
  name: string;
  color: string;
  image?: string;
  stock?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedShade?: Shade;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin';
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  subtotal: number;
  discount: number;
  shipping: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: string;
  shippingAddress: Address;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  productId: string;
  userId: string | { _id: string; name: string };
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date | string;
  verified?: boolean;
  helpful?: number;
  user?: { _id: string; name: string };
  images?: string[];
  updatedAt?: Date | string;
}
