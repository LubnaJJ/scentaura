import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './lib/firebase';
import { StoreSettings } from './types';
import { Toaster } from 'react-hot-toast';
import { onAuthChange } from './lib/auth';
import { useStore } from './store/useStore';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

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

// Admin pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminInquiriesPage from './pages/admin/AdminInquiriesPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

const App: React.FC = () => {
  useEffect(() => {
    // Load products / orders / inquiries + Firestore settings on mount
    useStore.getState().initStore();

    // Mirror Firebase Auth state into the Zustand store
    const unsubAuth = onAuthChange((user) => {
      useStore.setState({ isAdminLoggedIn: !!user, authLoading: false });
    });

    // Real-time listener — settings changes on any device update all clients instantly
    const unsubSettings = onSnapshot(doc(db, 'settings', 'store'), (snap) => {
      if (snap.exists()) {
        const incoming = snap.data() as StoreSettings;
        const current = useStore.getState().storeSettings;
        useStore.setState({ storeSettings: { ...current, ...incoming } });
      }
    });

    return () => {
      unsubAuth();
      unsubSettings();
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
        </Route>

        {/* Admin login — standalone, no layout wrapper */}
        <Route path="/admin" element={<AdminLoginPage />} />

        {/* Admin routes — protected, use AdminLayout sidebar */}
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

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
