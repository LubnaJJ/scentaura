import { create } from 'zustand';
import toast from 'react-hot-toast';
import { CartItem, Product, Order, Inquiry, StoreSettings } from '../types';
import * as fs from '../lib/firestore';
import { adminLogin as fbLogin, adminLogout as fbLogout } from '../lib/auth';

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'Zacks Signature',
  storeTagline: 'Arabian Fragrances',
  heroTitle: 'Wear the Soul of Arabia',
  heroSubtitle: 'Authentic Arabic fragrances, curated for the man who commands presence. Rare Ouds, sacred Ambers, and precious Musks — delivered to your door.',
  heroEyebrow: 'Arabian Perfumery · Sri Lanka',
  whatsappNumber: '94779196491',
  contactEmail: 'hello@zackssignature.com',
  footerTagline: 'Curating the finest Arabic fragrances for the discerning man in Sri Lanka.',
};

const SETTINGS_CACHE_KEY = 'zs_settings_cache';

function loadCachedSettings(): Partial<StoreSettings> {
  try {
    const raw = localStorage.getItem(SETTINGS_CACHE_KEY);
    return raw ? (JSON.parse(raw) as Partial<StoreSettings>) : {};
  } catch {
    return {};
  }
}

export function writeSettingsCache(settings: StoreSettings): void {
  try { localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(settings)); } catch {}
}

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

  // Store settings (persisted to localStorage)
  storeSettings: StoreSettings;
  updateStoreSettings: (updates: Partial<StoreSettings>) => void;

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
  storeSettings: { ...DEFAULT_SETTINGS, ...loadCachedSettings() },

  // ── Products ────────────────────────────────────────────────────────────
  addProduct: (product) => {
    set((s) => ({ products: [...s.products, product] }));
    fs.addProduct(product).catch((err) => {
      console.error('[addProduct]', err);
      toast.error('Failed to save product to Firestore');
    });
  },

  updateProduct: (id, updates) => {
    set((s) => ({
      products: s.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
    fs.updateProduct(id, updates).catch((err) => {
      console.error('[updateProduct]', err);
      toast.error('Failed to update product');
    });
  },

  deleteProduct: (id) => {
    set((s) => ({ products: s.products.filter((p) => p.id !== id) }));
    fs.deleteProduct(id).catch((err) => {
      console.error('[deleteProduct]', err);
      toast.error('Failed to delete product');
    });
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
        console.error('[addOrder]', err);
        toast.error('Order placed locally but failed to sync — please contact support');
      }
    })();
  },

  updateOrderStatus: (id, status) => {
    set((s) => ({
      orders: s.orders.map((o) =>
        o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o
      ),
    }));
    fs.updateOrderStatus(id, status).catch((err) => {
      console.error('[updateOrderStatus]', err);
      toast.error('Failed to update order status');
    });
  },

  // ── Inquiries ───────────────────────────────────────────────────────────
  addInquiry: (inquiry) => {
    set((s) => ({ inquiries: [inquiry, ...s.inquiries] }));
    fs.addInquiry(inquiry).catch((err) => {
      console.error('[addInquiry]', err);
      toast.error('Failed to send inquiry — please try again');
    });
  },

  markInquiryRead: (id) => {
    set((s) => ({
      inquiries: s.inquiries.map((i) =>
        i.id === id ? { ...i, read: true } : i
      ),
    }));
    fs.markInquiryRead(id).catch((err) => {
      console.error('[markInquiryRead]', err);
    });
  },

  // ── Settings ────────────────────────────────────────────────────────────
  updateStoreSettings: (updates) => {
    set((s) => {
      const next = { ...s.storeSettings, ...updates };
      writeSettingsCache(next);
      fs.saveStoreSettings(next).catch((err) => {
        console.error('[saveStoreSettings]', err);
        toast.error('Failed to sync settings to cloud');
      });
      return { storeSettings: next };
    });
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
    await fs.seedStockQuantity();
    const [products, orders, inquiries, fsSettings] = await Promise.all([
      fs.getProducts(),
      fs.getOrders(),
      fs.getInquiries(),
      fs.getStoreSettings(),
    ]);
    set({ products, orders, inquiries });
    if (fsSettings) {
      set({ storeSettings: { ...DEFAULT_SETTINGS, ...fsSettings } });
    }
  },
}));
