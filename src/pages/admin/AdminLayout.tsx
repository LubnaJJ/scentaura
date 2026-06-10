import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, MessageSquare, LogOut } from 'lucide-react';
import { useStore } from '../../store/useStore';
import toast from 'react-hot-toast';
import './AdminLayout.css';

const AdminLayout: React.FC = () => {
  const { adminLogout, orders, inquiries } = useStore();
  const navigate = useNavigate();

  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const unreadInquiries = inquiries.filter((i) => !i.read).length;

  const handleLogout = () => {
    adminLogout();
    toast.success('Logged out');
    navigate('/admin');
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__logo">
          <span>SCENTAURA</span>
          <span className="admin-sidebar__admin-badge">Admin</span>
        </div>

        <nav className="admin-sidebar__nav">
          <NavLink to="/admin/dashboard" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>
          <NavLink to="/admin/products" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            <Package size={18} /> Products
          </NavLink>
          <NavLink to="/admin/orders" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            <ShoppingBag size={18} />
            <span>Orders</span>
            {pendingOrders > 0 && <span className="admin-nav-badge">{pendingOrders}</span>}
          </NavLink>
          <NavLink to="/admin/inquiries" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            <MessageSquare size={18} />
            <span>Inquiries</span>
            {unreadInquiries > 0 && <span className="admin-nav-badge">{unreadInquiries}</span>}
          </NavLink>
        </nav>

        <button className="admin-sidebar__logout" onClick={handleLogout}>
          <LogOut size={16} /> Sign Out
        </button>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
