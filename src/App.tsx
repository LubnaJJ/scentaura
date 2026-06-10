import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

// Admin pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminInquiriesPage from './pages/admin/AdminInquiriesPage';

const App: React.FC = () => {
  useEffect(() => {
    // Load products / orders / inquiries from Firestore (seeds if empty)
    useStore.getState().initStore();

    // Mirror Firebase Auth state into the Zustand store
    const unsubscribe = onAuthChange((user) => {
      useStore.setState({ isAdminLoggedIn: !!user, authLoading: false });
    });
    return unsubscribe;
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
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
