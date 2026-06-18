import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Order } from '../../types';
import { formatPrice } from '../../utils/helpers';
import { CheckCircle, Circle, Package, Search } from 'lucide-react';
import './TrackOrderPage.css';

const STATUS_STEPS: { key: string; label: string; desc: string }[] = [
  { key: 'pending',    label: 'Order Placed',    desc: 'Your order has been received' },
  { key: 'confirmed',  label: 'Order Confirmed', desc: 'We have confirmed your order and are preparing it' },
  { key: 'processing', label: 'Processing',      desc: 'Your order is being prepared for dispatch' },
  { key: 'shipped',    label: 'Shipped',         desc: '' }, // filled dynamically
  { key: 'delivered',  label: 'Delivered',       desc: 'Your order has been delivered. Thank you!' },
];

const STATUS_INDEX: Record<string, number> = {
  pending:    0,
  confirmed:  1,
  processing: 2,
  shipped:    3,
  delivered:  4,
  cancelled:  -1,
};

const TrackOrderPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get('orderId') || '');
  const [phone, setPhone]     = useState('');
  const [order, setOrder]     = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const unsubRef = useRef<(() => void) | null>(null);

  const doTrack = (id: string, ph: string) => {
    if (!id.trim() || !ph.trim()) return;

    if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; }

    setLoading(true);
    setNotFound(false);
    setOrder(null);

    const ref = doc(db, 'orders', id.trim().toUpperCase());

    const unsub = onSnapshot(
      ref,
      (snap) => {
        setLoading(false);
        if (snap.exists() && snap.data().customerPhone === ph.trim()) {
          setOrder({ ...snap.data(), id: snap.id } as Order);
          setNotFound(false);
        } else {
          setOrder(null);
          setNotFound(true);
        }
      },
      (err) => {
        console.error('[trackOrder]', err);
        setLoading(false);
        setNotFound(true);
      }
    );

    unsubRef.current = unsub;
  };

  const handleTrack = () => doTrack(orderId, phone);

  // If URL has orderId pre-filled just update the field; user must still enter phone
  useEffect(() => {
    const id = searchParams.get('orderId');
    if (id) setOrderId(id.toUpperCase());
  }, [searchParams]);

  useEffect(() => () => { if (unsubRef.current) unsubRef.current(); }, []);

  const currentStep = order ? STATUS_INDEX[order.status] : -1;

  return (
    <div className="track-page">
      <div className="track-page__hero">
        <div className="container">
          <p className="section__eyebrow">Order Status</p>
          <h1 className="track-page__title">Track Your Order</h1>
          <p className="track-page__subtitle">
            Enter your order ID and phone number to see your order status
          </p>
        </div>
      </div>

      <div className="container track-page__body">
        {/* Search form */}
        <div className="track-form">
          <div className="form-field">
            <label>Order ID</label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value.toUpperCase())}
              placeholder="ORD-ABC123"
              onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
            />
          </div>
          <div className="form-field">
            <label>Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0771234567"
              onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
            />
          </div>
          <button
            className="btn btn--gold track-form__btn"
            onClick={handleTrack}
            disabled={loading || !orderId.trim() || !phone.trim()}
          >
            <Search size={16} />
            {loading ? 'Searching…' : 'Track Order'}
          </button>
        </div>

        {/* Not found */}
        {notFound && !loading && (
          <div className="track-not-found">
            <Package size={40} />
            <p>Order not found. Please check your Order ID and phone number.</p>
          </div>
        )}

        {/* Result */}
        {order && (
          <div className="track-result">
            {/* Summary bar */}
            <div className="track-summary">
              <div className="track-summary__row">
                <span>Order ID</span>
                <strong>{order.id}</strong>
              </div>
              <div className="track-summary__row">
                <span>Delivery District</span>
                <strong>{order.district}</strong>
              </div>
              <div className="track-summary__row">
                <span>Payment</span>
                <strong>Cash on Delivery</strong>
              </div>
              <div className="track-summary__row">
                <span>Total</span>
                <strong>{formatPrice(order.total)}</strong>
              </div>
            </div>

            {/* Timeline or cancelled */}
            {order.status === 'cancelled' ? (
              <div className="track-cancelled">
                <p>This order has been cancelled. Please contact us for more details.</p>
              </div>
            ) : (
              <div className="track-timeline">
                <p className="track-timeline__heading">Order Progress</p>
                {STATUS_STEPS.map((step, idx) => {
                  const done   = idx <= currentStep;
                  const active = idx === currentStep;
                  const desc   = step.key === 'shipped'
                    ? `Your order is on the way to ${order.district}`
                    : step.desc;
                  return (
                    <div
                      key={step.key}
                      className={`track-step${done ? ' track-step--done' : ''}${active ? ' track-step--active' : ''}`}
                    >
                      <div className="track-step__left">
                        <div className="track-step__icon-wrap">
                          {done
                            ? <CheckCircle size={22} className="track-step__check" />
                            : <Circle      size={22} className="track-step__circle" />}
                        </div>
                        {idx < STATUS_STEPS.length - 1 && (
                          <div className={`track-step__connector${done && idx < currentStep ? ' track-step__connector--done' : ''}`} />
                        )}
                      </div>
                      <div className="track-step__content">
                        <p className="track-step__label">{step.label}</p>
                        <p className="track-step__desc">{desc}</p>
                        {active && <span className="track-step__badge">Current Status</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Items */}
            <div className="track-items">
              <p className="track-items__title">Items Ordered</p>
              {order.items.map((item, i) => (
                <div key={i} className="track-item">
                  <img src={item.product.images[0]} alt={item.product.name} className="track-item__img" />
                  <div className="track-item__info">
                    <p className="track-item__name">{item.product.name}</p>
                    <p className="track-item__meta">{item.selectedSize} × {item.quantity}</p>
                  </div>
                  <p className="track-item__price">{formatPrice(item.product.price * item.quantity)}</p>
                </div>
              ))}
              <div className="track-items__total">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrderPage;
