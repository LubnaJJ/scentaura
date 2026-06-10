import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowLeft, MessageCircle, ChevronRight } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { formatPrice, openWhatsApp } from '../../utils/helpers';
import toast from 'react-hot-toast';
import './ProductDetailPage.css';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const products = useStore((s) => s.products);
  const addToCart = useStore((s) => s.addToCart);

  const product = products.find((p) => p.id === id);
  const related = products.filter((p) => p.id !== id && p.category === product?.category).slice(0, 3);

  const [selectedImg, setSelectedImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (!product) {
    return (
      <div className="not-found">
        <h2>Fragrance not found</h2>
        <Link to="/shop" className="btn btn--gold">Back to Shop</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }
    addToCart(product, selectedSize);
    toast.success(`${product.name} added to cart`);
  };

  const handleWhatsApp = () => {
    openWhatsApp(
      `Hello, I'm interested in *${product.name}* by ${product.brand}. Could you provide more details?`
    );
  };

  return (
    <div className="product-detail">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/shop"><ArrowLeft size={14} /> Shop</Link>
          <ChevronRight size={12} />
          <span>{product.name}</span>
        </nav>

        <div className="product-detail__grid">
          {/* Images */}
          <div className="product-detail__images">
            <motion.div
              className="product-detail__main-img"
              key={selectedImg}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <img src={product.images[selectedImg]} alt={product.name} />
              {product.bestseller && (
                <span className="product-detail__badge">Bestseller</span>
              )}
            </motion.div>
            {product.images.length > 1 && (
              <div className="product-detail__thumbs">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    className={`product-detail__thumb ${i === selectedImg ? 'active' : ''}`}
                    onClick={() => setSelectedImg(i)}
                  >
                    <img src={img} alt={`${product.name} ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="product-detail__info">
            <p className="product-detail__brand">{product.brand}</p>
            <h1 className="product-detail__name">{product.name}</h1>
            <p className="product-detail__category">{product.category}</p>

            <div className="product-detail__price">
              <span className="product-detail__price-main">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="product-detail__price-orig">{formatPrice(product.originalPrice)}</span>
              )}
            </div>

            <p className="product-detail__desc">{product.longDescription}</p>

            {/* Notes */}
            <div className="product-detail__notes">
              {[
                { label: 'Top Notes', notes: product.topNotes },
                { label: 'Heart Notes', notes: product.heartNotes },
                { label: 'Base Notes', notes: product.baseNotes },
              ].map((group) => (
                <div key={group.label} className="product-detail__note-group">
                  <p className="product-detail__note-label">{group.label}</p>
                  <div className="product-detail__note-tags">
                    {group.notes.map((n) => (
                      <span key={n} className="product-detail__note-tag">{n}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Size selector */}
            <div className="product-detail__sizes">
              <p className="product-detail__size-label">Select Size</p>
              <div className="product-detail__size-options">
                {product.size.map((s) => (
                  <button
                    key={s}
                    className={`product-detail__size-btn ${selectedSize === s ? 'active' : ''}`}
                    onClick={() => setSelectedSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="product-detail__actions">
              <button
                className="btn btn--gold product-detail__add-btn"
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                <ShoppingBag size={17} />
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
              <button className="product-detail__wa-btn" onClick={handleWhatsApp}>
                <MessageCircle size={17} />
                Ask on WhatsApp
              </button>
            </div>

            {/* Delivery info */}
            <div className="product-detail__meta">
              <div className="product-detail__meta-item">
                <span className="product-detail__meta-dot" />
                Cash on Delivery — no upfront payment
              </div>
              <div className="product-detail__meta-item">
                <span className="product-detail__meta-dot" />
                Island-wide delivery across all 25 districts
              </div>
              <div className="product-detail__meta-item">
                <span className="product-detail__meta-dot" />
                100% authentic Arabic fragrance
              </div>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="product-detail__related">
            <h2 className="product-detail__related-title">You May Also Like</h2>
            <div className="product-detail__related-grid">
              {related.map((p) => (
                <Link key={p.id} to={`/product/${p.id}`} className="product-detail__related-card">
                  <img src={p.images[0]} alt={p.name} />
                  <p className="product-detail__related-brand">{p.brand}</p>
                  <p className="product-detail__related-name">{p.name}</p>
                  <p className="product-detail__related-price">{formatPrice(p.price)}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
