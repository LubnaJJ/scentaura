import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, MessageSquare, Settings, LogOut, Menu, X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import toast from 'react-hot-toast';
import './AdminLayout.css';

const AdminLayout: React.FC = () => {
  const { adminLogout, orders, inquiries } = useStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const unreadInquiries = inquiries.filter((i) => !i.read).length;

  const handleLogout = () => {
    adminLogout();
    toast.success('Logged out');
    navigate('/admin');
  };

  const closeNav = () => setSidebarOpen(false);

  return (
    <div className="admin-layout">
      {sidebarOpen && (
        <div className="admin-layout__overlay" onClick={closeNav} />
      )}

      <aside className={`admin-sidebar${sidebarOpen ? ' admin-sidebar--open' : ''}`}>
        <div className="admin-sidebar__logo">
          <span>SCENTAURA</span>
          <span className="admin-sidebar__admin-badge">Admin</span>
        </div>

        <nav className="admin-sidebar__nav">
          <NavLink to="/admin/dashboard" onClick={closeNav} className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>
          <NavLink to="/admin/products" onClick={closeNav} className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            <Package size={18} /> Products
          </NavLink>
          <NavLink to="/admin/orders" onClick={closeNav} className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            <ShoppingBag size={18} />
            <span>Orders</span>
            {pendingOrders > 0 && <span className="admin-nav-badge">{pendingOrders}</span>}
          </NavLink>
          <NavLink to="/admin/inquiries" onClick={closeNav} className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            <MessageSquare size={18} />
            <span>Inquiries</span>
            {unreadInquiries > 0 && <span className="admin-nav-badge">{unreadInquiries}</span>}
          </NavLink>
          <NavLink to="/admin/settings" onClick={closeNav} className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            <Settings size={18} /> Settings
          </NavLink>
        </nav>

        <button className="admin-sidebar__logout" onClick={handleLogout}>
          <LogOut size={16} /> Sign Out
        </button>
      </aside>

      <main className="admin-main">
        <div className="admin-topbar">
          <button
            className="admin-hamburger"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <span className="admin-topbar__title">SCENTAURA Admin</span>
        </div>
        <div className="admin-page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
