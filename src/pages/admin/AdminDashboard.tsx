import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Package, MessageSquare, TrendingUp, Clock, ArrowRight, AlertTriangle } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { formatPrice, formatDate, STATUS_COLORS, STATUS_LABELS } from '../../utils/helpers';
import './AdminDashboard.css';

const AdminDashboard: React.FC = () => {
  const { orders, products, inquiries } = useStore();

  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const unreadInquiries = inquiries.filter((i) => !i.read).length;

  const recentOrders = orders.slice(0, 5);
  const recentInquiries = inquiries.slice(0, 4);
  const lowStockProducts = products.filter((p) => (p.stockQuantity ?? 50) <= 5);

  const stats = [
    { label: 'Total Revenue', value: formatPrice(totalRevenue), icon: <TrendingUp size={22} />, color: '#C9A84C' },
    { label: 'Total Orders', value: orders.length, icon: <ShoppingBag size={22} />, color: '#2196F3' },
    { label: 'Pending Orders', value: pendingOrders, icon: <Clock size={22} />, color: '#FF9800' },
    { label: 'Products', value: products.length, icon: <Package size={22} />, color: '#4CAF50' },
    { label: 'Inquiries', value: inquiries.length, icon: <MessageSquare size={22} />, color: '#9C27B0' },
  ];

  return (
    <div className="admin-dashboard">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Dashboard</h1>
        <p className="admin-page-sub">Live overview of your store</p>
      </div>

      {/* Stats */}
      <div className="dashboard-stats">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-card__icon" style={{ color: s.color, background: s.color + '18' }}>
              {s.icon}
            </div>
            <div>
              <p className="stat-card__value">{s.value}</p>
              <p className="stat-card__label">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Low stock warning */}
      {lowStockProducts.length > 0 && (
        <div className="low-stock-warning">
          <div className="low-stock-warning__header">
            <AlertTriangle size={18} className="low-stock-warning__icon" />
            <strong>Low Stock Alert</strong>
            <span className="low-stock-warning__count">
              {lowStockProducts.length} product{lowStockProducts.length > 1 ? 's' : ''} running low
            </span>
          </div>
          <ul className="low-stock-warning__list">
            {lowStockProducts.map((p) => (
              <li key={p.id} className="low-stock-warning__item">
                <span className="low-stock-warning__name">{p.name}</span>
                <span className={`low-stock-warning__qty ${(p.stockQuantity ?? 0) === 0 ? 'low-stock-warning__qty--zero' : ''}`}>
                  {(p.stockQuantity ?? 0) === 0 ? 'Out of stock' : `${p.stockQuantity} left`}
                </span>
              </li>
            ))}
          </ul>
          <Link to="/admin/products" className="low-stock-warning__link">
            Manage Products <ArrowRight size={12} />
          </Link>
        </div>
      )}

      <div className="dashboard-grid">
        {/* Recent orders */}
        <div className="admin-card">
          <div className="admin-card__header">
            <h2 className="admin-card__title">Recent Orders</h2>
            <Link to="/admin/orders" className="admin-card__link">
              View all <ArrowRight size={13} />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="admin-empty">No orders yet. Orders will appear here when customers place them.</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o.id}>
                      <td className="admin-table__id">{o.id}</td>
                      <td>
                        <p className="admin-table__name">{o.customerName}</p>
                        <p className="admin-table__sub">{o.customerPhone}</p>
                      </td>
                      <td className="admin-table__bold">{formatPrice(o.total)}</td>
                      <td>
                        <span
                          className="admin-status-badge"
                          style={{
                            background: STATUS_COLORS[o.status] + '18',
                            color: STATUS_COLORS[o.status],
                          }}
                        >
                          {STATUS_LABELS[o.status]}
                        </span>
                      </td>
                      <td className="admin-table__muted">{formatDate(o.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent inquiries */}
        <div className="admin-card">
          <div className="admin-card__header">
            <h2 className="admin-card__title">Recent Inquiries</h2>
            <Link to="/admin/inquiries" className="admin-card__link">
              View all <ArrowRight size={13} />
            </Link>
          </div>
          {recentInquiries.length === 0 ? (
            <p className="admin-empty">No inquiries yet.</p>
          ) : (
            <div className="dashboard-inquiries">
              {recentInquiries.map((inq) => (
                <div key={inq.id} className={`inquiry-preview ${!inq.read ? 'inquiry-preview--unread' : ''}`}>
                  <div className="inquiry-preview__header">
                    <span className="inquiry-preview__name">{inq.name}</span>
                    <span className="inquiry-preview__date">{formatDate(inq.createdAt)}</span>
                  </div>
                  <p className="inquiry-preview__subject">{inq.subject || '(No subject)'}</p>
                  <p className="inquiry-preview__msg">{inq.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
