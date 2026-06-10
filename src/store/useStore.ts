import { create } from 'zustand';
import { CartItem, Product, Order, Inquiry } from '../types';
import * as fs from '../lib/firestore';
import { adminLogin as fbLogin, adminLogout as fbLogout } from '../lib/auth';

interface StoreState {
  // Data
  products: Product[];
  orders: Order[];
  inquiries: Inquiry[];

  // Cart (client-side only — not persisted to Firestore)
  cart: CartItem[];

  // Auth
  isAdminLoggedIn: boolean;
  authLoading: boolean;

  // Products
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Cart
  addToCart: (product: Product, size: string) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, qty: number) => void;
  clearCart: () => void;
  cartTotal: () => number;
  cartCount: () => number;

  // Orders
  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: Order['status']) => void;

  // Inquiries
  addInquiry: (inquiry: Inquiry) => void;
  markInquiryRead: (id: string) => void;

  // Admin auth
  adminLogin: (email: string, password: string) => Promise<boolean>;
  adminLogout: () => void;

  // Initialisation — called once from App on mount
  initStore: () => Promise<void>;
}

export const useStore = create<StoreState>()((set, get) => ({
  products: [],
  orders: [],
  inquiries: [],
  cart: [],
  isAdminLoggedIn: false,
  authLoading: true,

  // ── Products ────────────────────────────────────────────────────────────
  addProduct: (product) => {
    set((s) => ({ products: [...s.products, product] }));
    fs.addProduct(product).catch(console.error);
  },

  updateProduct: (id, updates) => {
    set((s) => ({
      products: s.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
    fs.updateProduct(id, updates).catch(console.error);
  },

  deleteProduct: (id) => {
    set((s) => ({ products: s.products.filter((p) => p.id !== id) }));
    fs.deleteProduct(id).catch(console.error);
  },

  // ── Cart ────────────────────────────────────────────────────────────────
  addToCart: (product, size) =>
    set((s) => {
      const existing = s.cart.find(
        (i) => i.product.id === product.id && i.selectedSize === size
      );
      if (existing) {
        return {
          cart: s.cart.map((i) =>
            i.product.id === product.id && i.selectedSize === size
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      return { cart: [...s.cart, { product, quantity: 1, selectedSize: size }] };
    }),

  removeFromCart: (productId, size) =>
    set((s) => ({
      cart: s.cart.filter(
        (i) => !(i.product.id === productId && i.selectedSize === size)
      ),
    })),

  updateQuantity: (productId, size, qty) =>
    set((s) => ({
      cart:
        qty <= 0
          ? s.cart.filter(
              (i) => !(i.product.id === productId && i.selectedSize === size)
            )
          : s.cart.map((i) =>
              i.product.id === productId && i.selectedSize === size
                ? { ...i, quantity: qty }
                : i
            ),
    })),

  clearCart: () => set({ cart: [] }),

  cartTotal: () =>
    get().cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0),

  cartCount: () =>
    get().cart.reduce((sum, i) => sum + i.quantity, 0),

  // ── Orders ──────────────────────────────────────────────────────────────
  addOrder: (order) => {
    set((s) => ({ orders: [order, ...s.orders] }));

    (async () => {
      try {
        await fs.addOrder(order);
        // Decrement stock for each ordered item and reflect in local state
        for (const item of order.items) {
          const result = await fs.decrementStock(item.product.id, item.quantity);
          set((s) => ({
            products: s.products.map((p) =>
              p.id === item.product.id
                ? { ...p, stockQuantity: result.stockQuantity, inStock: result.inStock }
                : p
            ),
          }));
        }
      } catch (err) {
        console.error('addOrder error:', err);
      }
    })();
  },

  updateOrderStatus: (id, status) => {
    set((s) => ({
      orders: s.orders.map((o) =>
        o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o
      ),
    }));
    fs.updateOrderStatus(id, status).catch(console.error);
  },

  // ── Inquiries ───────────────────────────────────────────────────────────
  addInquiry: (inquiry) => {
    set((s) => ({ inquiries: [inquiry, ...s.inquiries] }));
    fs.addInquiry(inquiry).catch(console.error);
  },

  markInquiryRead: (id) => {
    set((s) => ({
      inquiries: s.inquiries.map((i) =>
        i.id === id ? { ...i, read: true } : i
      ),
    }));
    fs.markInquiryRead(id).catch(console.error);
  },

  // ── Auth ────────────────────────────────────────────────────────────────
  adminLogin: async (email, password) => {
    const ok = await fbLogin(email, password);
    if (ok) set({ isAdminLoggedIn: true });
    return ok;
  },

  adminLogout: () => {
    set({ isAdminLoggedIn: false });
    fbLogout().catch(console.error);
  },

  // ── Init ────────────────────────────────────────────────────────────────
  initStore: async () => {
    // Backfill stockQuantity on any legacy product docs before loading
    await fs.seedStockQuantity();
    const [products, orders, inquiries] = await Promise.all([
      fs.getProducts(),
      fs.getOrders(),
      fs.getInquiries(),
    ]);
    set({ products, orders, inquiries });
  },
}));
