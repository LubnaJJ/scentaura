import React, { useState } from 'react';
import { ChevronDown, Phone, MessageCircle, X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { formatPrice, formatDate, STATUS_COLORS, STATUS_LABELS, openWhatsApp } from '../../utils/helpers';
import { Order, OrderStatus } from '../../types';
import './AdminOrdersPage.css';

const ALL_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

function buildStatusMessage(o: Order, storeName: string): string {
  switch (o.status) {
    case 'pending':
      return `Hi ${o.customerName}! We received your ${storeName} order ${o.id} for ${formatPrice(o.total)}. We will deliver to ${o.district} soon. Thank you!`;
    case 'confirmed':
      return `Hi ${o.customerName}! Your ${storeName} order ${o.id} has been confirmed. We are preparing it now. Thank you!`;
    case 'processing':
      return `Hi ${o.customerName}! Your ${storeName} order ${o.id} is currently being processed and packed. We will notify you once it ships. Thank you!`;
    case 'shipped':
      return `Hi ${o.customerName}! Your ${storeName} order ${o.id} has been shipped and is on the way to ${o.district}. Please have ${formatPrice(o.total)} ready for Cash on Delivery. Thank you!`;
    case 'delivered':
      return `Hi ${o.customerName}! We hope you received your ${storeName} order ${o.id}. Thank you for shopping with us! 🌟`;
    case 'cancelled':
      return `Hi ${o.customerName}! Unfortunately your ${storeName} order ${o.id} has been cancelled. Please contact us for more details.`;
    default:
      return `Hi ${o.customerName}! Regarding your ${storeName} order ${o.id}.`;
  }
}

const AdminOrdersPage: React.FC = () => {
  const { orders, updateOrderStatus, storeSettings } = useStore();
  const storeName = storeSettings.storeName;
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  const handleStatusChange = (id: string, status: OrderStatus) => {
    updateOrderStatus(id, status);
    if (selectedOrder?.id === id) {
      setSelectedOrder((o) => o ? { ...o, status } : null);
    }
  };

  return (
    <div className="admin-orders">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Orders</h1>
          <p className="admin-page-sub">{orders.length} total orders</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="admin-orders__tabs">
        <button className={`admin-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          All ({orders.length})
        </button>
        {ALL_STATUSES.map((s) => {
          const count = orders.filter((o) => o.status === s).length;
          return (
            <button
              key={s}
              className={`admin-tab ${filter === s ? 'active' : ''}`}
              onClick={() => setFilter(s)}
              style={filter === s ? { borderBottomColor: STATUS_COLORS[s] } : {}}
            >
              {STATUS_LABELS[s]} ({count})
            </button>
          );
        })}
      </div>

      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>District</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="admin-orders__row" onClick={() => setSelectedOrder(o)}>
                  <td className="admin-table__id">{o.id}</td>
                  <td>
                    <p className="admin-table__name">{o.customerName}</p>
                    <p className="admin-table__sub">{o.customerPhone}</p>
                  </td>
                  <td className="admin-table__muted">{o.district}</td>
                  <td className="admin-table__muted">{o.items.reduce((s, i) => s + i.quantity, 0)} item(s)</td>
                  <td className="admin-table__bold">{formatPrice(o.total)}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="admin-status-select-wrap">
                      <select
                        className="admin-status-select"
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.id, e.target.value as OrderStatus)}
                        style={{ color: STATUS_COLORS[o.status] }}
                      >
                        {ALL_STATUSES.map((s) => (
                          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                      <ChevronDown size={12} />
                    </div>
                  </td>
                  <td className="admin-table__muted">{formatDate(o.createdAt)}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="admin-actions">
                      <button
                        className="admin-action-btn admin-action-btn--wa"
                        title="WhatsApp customer"
                        onClick={() => openWhatsApp(buildStatusMessage(o, storeName))}
                      >
                        <MessageCircle size={14} />
                      </button>
                      <a
                        href={`tel:${o.customerPhone}`}
                        className="admin-action-btn"
                        title="Call customer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Phone size={14} />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="admin-empty">No {filter !== 'all' ? STATUS_LABELS[filter].toLowerCase() : ''} orders yet.</p>
          )}
        </div>
      </div>

      {/* Order detail drawer */}
      {selectedOrder && (
        <div className="order-drawer-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="order-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="order-drawer__header">
              <div>
                <h2 className="order-drawer__title">Order {selectedOrder.id}</h2>
                <p className="order-drawer__date">{formatDate(selectedOrder.createdAt)}</p>
              </div>
              <button className="admin-modal__close" onClick={() => setSelectedOrder(null)}><X size={20} /></button>
            </div>

            <div className="order-drawer__body">
              <div className="order-drawer__section">
                <p className="order-drawer__section-title">Customer</p>
                <p className="order-drawer__val order-drawer__val--bold">{selectedOrder.customerName}</p>
                <p className="order-drawer__val">{selectedOrder.customerPhone}</p>
                {selectedOrder.customerEmail && <p className="order-drawer__val">{selectedOrder.customerEmail}</p>}
              </div>

              <div className="order-drawer__section">
                <p className="order-drawer__section-title">Delivery Address</p>
                <p className="order-drawer__val">{selectedOrder.address}</p>
                <p className="order-drawer__val">{selectedOrder.city}, {selectedOrder.district} {selectedOrder.postalCode}</p>
                {selectedOrder.notes && (
                  <p className="order-drawer__notes">Note: {selectedOrder.notes}</p>
                )}
              </div>

              <div className="order-drawer__section">
                <p className="order-drawer__section-title">Items</p>
                {selectedOrder.items.map((item) => (
                  <div key={`${item.product.id}-${item.selectedSize}`} className="order-drawer__item">
                    <img src={item.product.images[0]} alt={item.product.name} className="order-drawer__item-img" />
                    <div className="order-drawer__item-info">
                      <p className="order-drawer__item-name">{item.product.name}</p>
                      <p className="order-drawer__item-meta">{item.selectedSize} × {item.quantity}</p>
                    </div>
                    <p className="order-drawer__item-price">{formatPrice(item.product.price * item.quantity)}</p>
                  </div>
                ))}
                <div className="order-drawer__total">
                  <span>Total (Cash on Delivery)</span>
                  <span>{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>

              <div className="order-drawer__section">
                <p className="order-drawer__section-title">Update Status</p>
                <div className="order-drawer__statuses">
                  {ALL_STATUSES.map((s) => (
                    <button
                      key={s}
                      className={`order-status-btn ${selectedOrder.status === s ? 'active' : ''}`}
                      style={selectedOrder.status === s ? { background: STATUS_COLORS[s] + '18', color: STATUS_COLORS[s], borderColor: STATUS_COLORS[s] } : {}}
                      onClick={() => handleStatusChange(selectedOrder.id, s)}
                    >
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="order-drawer__contacts">
                <button
                  className="order-contact-btn order-contact-btn--wa"
                  onClick={() => openWhatsApp(buildStatusMessage(selectedOrder))}
                >
                  <MessageCircle size={16} /> WhatsApp Customer
                </button>
                <a href={`tel:${selectedOrder.customerPhone}`} className="order-contact-btn">
                  <Phone size={16} /> Call Customer
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
