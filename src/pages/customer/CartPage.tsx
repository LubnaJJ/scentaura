import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { formatPrice } from '../../utils/helpers';
import toast from 'react-hot-toast';
import './CartPage.css';

const CartPage: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useStore();
  const navigate = useNavigate();

  const handleRemove = (productId: string, size: string) => {
    removeFromCart(productId, size);
    toast.success('Item removed from cart');
  };

  if (cart.length === 0) {
    return (
      <div className="cart-empty">
        <div className="cart-empty__inner">
          <ShoppingBag size={48} strokeWidth={1} className="cart-empty__icon" />
          <h2>Your cart is empty</h2>
          <p>Discover our collection of fine Arabic fragrances</p>
          <Link to="/shop" className="btn btn--gold">Explore Fragrances <ArrowRight size={15} /></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart">
      <div className="container">
        <div className="cart__header">
          <h1 className="cart__title">Your Cart</h1>
          <p className="cart__count">{cart.reduce((s, i) => s + i.quantity, 0)} items</p>
        </div>

        <div className="cart__layout">
          {/* Items */}
          <div className="cart__items">
            {cart.map((item) => (
              <div key={`${item.product.id}-${item.selectedSize}`} className="cart-item">
                <Link to={`/product/${item.product.id}`} className="cart-item__img-wrap">
                  <img src={item.product.images[0]} alt={item.product.name} />
                </Link>
                <div className="cart-item__info">
                  <p className="cart-item__brand">{item.product.brand}</p>
                  <Link to={`/product/${item.product.id}`} className="cart-item__name">
                    {item.product.name}
                  </Link>
                  <p className="cart-item__size">Size: {item.selectedSize}</p>
                  <p className="cart-item__price">{formatPrice(item.product.price)}</p>
                </div>
                <div className="cart-item__actions">
                  <div className="cart-item__qty">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.selectedSize, item.quantity - 1)}
                      className="cart-item__qty-btn"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="cart-item__qty-num">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.selectedSize, item.quantity + 1)}
                      className="cart-item__qty-btn"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                  <p className="cart-item__subtotal">
                    {formatPrice(item.product.price * item.quantity)}
                  </p>
                  <button
                    onClick={() => handleRemove(item.product.id, item.selectedSize)}
                    className="cart-item__remove"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="cart__summary">
            <h3 className="cart__summary-title">Order Summary</h3>
            <div className="cart__summary-rows">
              {cart.map((item) => (
                <div key={`${item.product.id}-${item.selectedSize}`} className="cart__summary-row">
                  <span>{item.product.name} × {item.quantity}</span>
                  <span>{formatPrice(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="cart__summary-divider" />
            <div className="cart__summary-total">
              <span>Total</span>
              <span>{formatPrice(cartTotal())}</span>
            </div>
            <div className="cart__summary-delivery">
              <span className="cart__delivery-badge">Cash on Delivery</span>
              <span className="cart__delivery-note">Pay when you receive your order</span>
            </div>
            <button
              className="btn btn--gold cart__checkout-btn"
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout <ArrowRight size={15} />
            </button>
            <Link to="/shop" className="cart__continue">← Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
