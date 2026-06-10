export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  description: string;
  longDescription: string;
  category: 'oud' | 'musk' | 'floral' | 'woody' | 'oriental' | 'fresh';
  size: string[];
  images: string[];
  topNotes: string[];
  heartNotes: string[];
  baseNotes: string[];
  inStock: boolean;
  featured: boolean;
  bestseller: boolean;
  stockQuantity: number;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: string;
  city: string;
  district: string;
  postalCode: string;
  notes: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'cash_on_delivery';
  createdAt: string;
  updatedAt: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  method: 'email' | 'whatsapp';
  createdAt: string;
  read: boolean;
}

export interface AdminUser {
  username: string;
  password: string;
}

export type OrderStatus = Order['status'];
export type ProductCategory = Product['category'];
