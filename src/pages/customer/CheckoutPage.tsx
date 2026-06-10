import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, MessageCircle } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { formatPrice, generateId, openWhatsApp, SRI_LANKA_DISTRICTS } from '../../utils/helpers';
import toast from 'react-hot-toast';
import './CheckoutPage.css';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, addOrder, clearCart } = useStore();
  const [submitted, setSubmitted] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [orderTotal, setOrderTotal] = useState(0);
  const [orderItems, setOrderItems] = useState(cart);

  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    address: '',
    city: '',
    district: '',
    postalCode: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.customerName.trim()) errs.customerName = 'Full name is required';
    if (!/^0\d{9}$/.test(form.customerPhone)) errs.customerPhone = 'Enter a valid Sri Lanka phone (e.g. 0771234567)';
    if (form.customerEmail && !/\S+@\S+\.\S+/.test(form.customerEmail)) errs.customerEmail = 'Enter a valid email';
    if (!form.address.trim()) errs.address = 'Address is required';
    if (!form.city.trim()) errs.city = 'City is required';
    if (!form.district) errs.district = 'District is required';
    return errs;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => { const c = { ...e }; delete c[name]; return c; });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) { toast.error('Your cart is empty'); return; }
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const id = 'ORD-' + generateId().toUpperCase();
    const order = {
      id,
      ...form,
      items: cart,
      total: cartTotal(),
      status: 'pending' as const,
      paymentMethod: 'cash_on_delivery' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const total = cartTotal();
    const items = [...cart];
    addOrder(order);
    clearCart();
    setOrderId(id);
    setOrderTotal(total);
    setOrderItems(items);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (submitted) {
    const itemLines = orderItems
      .map(
        (i) =>
          `• ${i.product.name} x${i.quantity} (${i.selectedSize}) — ${formatPrice(i.product.price * i.quantity)}`
      )
      .join('\n');

    const waMessage =
      `Hi Zack's Perfume! I just placed an order 🛍️\n\n` +
      `Order ID: ${orderId}\n` +
      `Name: ${form.customerName}\n` +
      `Phone: ${form.customerPhone}\n` +
      `Address: ${form.address}, ${form.city}, ${form.district}\n\n` +
      `Items:\n${itemLines}\n\n` +
      `Total: ${formatPrice(orderTotal)}\n` +
      `Payment: Cash on Delivery\n\n` +
      `Please confirm my order. Thank you!`;

    return (
      <div className="checkout checkout--success">
        <div className="checkout-success">
          <CheckCircle size={56} className="checkout-success__icon" />
          <h1 className="checkout-success__title">Order Placed!</h1>
          <p className="checkout-success__id">Order ID: <strong>{orderId}</strong></p>
          <p className="checkout-success__body">
            Your order has been received. To confirm it, please tap the button below
            and send us the pre-filled WhatsApp message. We will confirm within minutes.
          </p>

          <button
            className="checkout-success__wa-btn"
            onClick={() => openWhatsApp(waMessage)}
          >
            <MessageCircle size={22} />
            Confirm Order on WhatsApp
          </button>
          <p className="checkout-success__wa-note">
            Tap the button above to send your order to us on WhatsApp.
            We will confirm within minutes.
          </p>

          <button className="btn btn--outline-dark checkout-success__continue" onClick={() => navigate('/shop')}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="checkout">
      <div className="container">
        <h1 className="checkout__title">Checkout</h1>
        <div className="checkout__layout">
          {/* Form */}
          <form onSubmit={handleSubmit} className="checkout__form" noValidate>
            <section className="checkout__section">
              <h2 className="checkout__section-title">Contact Information</h2>
              <div className="form-grid">
                <div className={`form-field ${errors.customerName ? 'form-field--error' : ''}`}>
                  <label>Full Name *</label>
                  <input name="customerName" value={form.customerName} onChange={handleChange} placeholder="Mohamed Riyaz" />
                  {errors.customerName && <span className="form-error">{errors.customerName}</span>}
                </div>
                <div className={`form-field ${errors.customerPhone ? 'form-field--error' : ''}`}>
                  <label>Phone Number *</label>
                  <input name="customerPhone" value={form.customerPhone} onChange={handleChange} placeholder="0771234567" type="tel" />
                  {errors.customerPhone && <span className="form-error">{errors.customerPhone}</span>}
                </div>
                <div className={`form-field form-field--full ${errors.customerEmail ? 'form-field--error' : ''}`}>
                  <label>Email Address (optional)</label>
                  <input name="customerEmail" value={form.customerEmail} onChange={handleChange} placeholder="you@example.com" type="email" />
                  {errors.customerEmail && <span className="form-error">{errors.customerEmail}</span>}
                </div>
              </div>
            </section>

            <section className="checkout__section">
              <h2 className="checkout__section-title">Delivery Address</h2>
              <div className="form-grid">
                <div className={`form-field form-field--full ${errors.address ? 'form-field--error' : ''}`}>
                  <label>Street Address *</label>
                  <input name="address" value={form.address} onChange={handleChange} placeholder="No. 45, Main Street" />
                  {errors.address && <span className="form-error">{errors.address}</span>}
                </div>
                <div className={`form-field ${errors.city ? 'form-field--error' : ''}`}>
                  <label>City / Town *</label>
                  <input name="city" value={form.city} onChange={handleChange} placeholder="Colombo" />
                  {errors.city && <span className="form-error">{errors.city}</span>}
                </div>
                <div className={`form-field ${errors.district ? 'form-field--error' : ''}`}>
                  <label>District *</label>
                  <select name="district" value={form.district} onChange={handleChange}>
                    <option value="">Select district...</option>
                    {SRI_LANKA_DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  {errors.district && <span className="form-error">{errors.district}</span>}
                </div>
                <div className="form-field">
                  <label>Postal Code</label>
                  <input name="postalCode" value={form.postalCode} onChange={handleChange} placeholder="00100" />
                </div>
              </div>
            </section>

            <section className="checkout__section">
              <h2 className="checkout__section-title">Order Notes</h2>
              <div className="form-field form-field--full">
                <label>Special Instructions (optional)</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Any delivery instructions, preferred time, gift wrapping request..."
                  rows={3}
                />
              </div>
            </section>

            <section className="checkout__section checkout__payment">
              <h2 className="checkout__section-title">Payment Method</h2>
              <div className="checkout__payment-option checkout__payment-option--selected">
                <div className="checkout__payment-radio" />
                <div>
                  <p className="checkout__payment-name">Cash on Delivery</p>
                  <p className="checkout__payment-desc">Pay in cash when your order arrives. No upfront payment.</p>
                </div>
              </div>
            </section>

            <button type="submit" className="btn btn--gold checkout__submit">
              Place Order — {formatPrice(cartTotal())}
            </button>
          </form>

          {/* Order summary */}
          <div className="checkout__order-summary">
            <h3 className="checkout__summary-title">Order Summary</h3>
            {cart.map((item) => (
              <div key={`${item.product.id}-${item.selectedSize}`} className="checkout__item">
                <div className="checkout__item-img">
                  <img src={item.product.images[0]} alt={item.product.name} />
                  <span className="checkout__item-qty">{item.quantity}</span>
                </div>
                <div className="checkout__item-info">
                  <p className="checkout__item-name">{item.product.name}</p>
                  <p className="checkout__item-size">{item.selectedSize}</p>
                </div>
                <p className="checkout__item-price">{formatPrice(item.product.price * item.quantity)}</p>
              </div>
            ))}
            <div className="checkout__summary-divider" />
            <div className="checkout__summary-total">
              <span>Total</span>
              <span>{formatPrice(cartTotal())}</span>
            </div>
            <p className="checkout__summary-note">
              Delivery charges may apply based on your district. Our team will confirm during the call.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
