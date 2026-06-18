import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { collection, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from './lib/firebase';
import { initDefaultSettings } from './lib/firestore';
import { StoreSettings, Product, Order, Inquiry } from './types';
import { Toaster } from 'react-hot-toast';
import { onAuthChange } from './lib/auth';
import { useStore } from './store/useStore';

// Layouts
import CustomerLayout from './components/layout/CustomerLayout';
import AdminLayout from './pages/admin/AdminLayout';
import RequireAdminAuth from './components/auth/RequireAdminAuth';

// Customer pages
import HomePage from './pages/customer/HomePage';
import ShopPage from './pages/customer/ShopPage';
import ProductDetailPage from './pages/customer/ProductDetailPage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import AboutPage from './pages/customer/AboutPage';
import ContactPage from './pages/customer/ContactPage';
import TrackOrderPage from './pages/customer/TrackOrderPage';

// Admin pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminInquiriesPage from './pages/admin/AdminInquiriesPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

const App: React.FC = () => {
  useEffect(() => {
    // One-time load of all Firestore data on mount
    initDefaultSettings().catch((err) => console.error('[initDefaultSettings]', err));
    useStore.getState().initStore();

    // Auth state → Zustand
    const unsubAuth = onAuthChange((user) => {
      useStore.setState({ isAdminLoggedIn: !!user, authLoading: false });
    });

    // Real-time: settings — updates all open tabs/devices instantly
    const unsubSettings = onSnapshot(
      doc(db, 'settings', 'store'),
      (snap) => {
        if (snap.exists()) {
          const incoming = snap.data() as StoreSettings;
          const current = useStore.getState().storeSettings;
          useStore.setState({ storeSettings: { ...current, ...incoming } });
        }
      },
      (err) => console.error('[settings onSnapshot]', err)
    );

    // Real-time: products — customer pages stay fresh if admin edits stock/price
    const unsubProducts = onSnapshot(
      collection(db, 'products'),
      (snap) => {
        const products = snap.docs.map((d) => ({ ...d.data(), id: d.id } as Product));
        useStore.setState({ products });
      },
      (err) => console.error('[products onSnapshot]', err)
    );

    return () => {
      unsubAuth();
      unsubSettings();
      unsubProducts();
    };
  }, []);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: 'Jost, sans-serif',
            fontSize: '13px',
            borderRadius: '4px',
            border: '1px solid #E8D5A3',
          },
          success: { iconTheme: { primary: '#C9A84C', secondary: '#fff' } },
          error: { iconTheme: { primary: '#e53935', secondary: '#fff' } },
        }}
      />

      <ScrollToTop />
      <Routes>
        {/* Customer routes */}
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/track" element={<TrackOrderPage />} />
        </Route>

        {/* Admin login — standalone */}
        <Route path="/admin" element={<AdminLoginPage />} />

        {/* Admin routes — protected */}
        <Route
          path="/admin"
          element={
            <RequireAdminAuth>
              <AdminLayout />
            </RequireAdminAuth>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="inquiries" element={<AdminInquiriesPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
