import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart } from 'lucide-react';
import { Product } from '../../types';
import { formatPrice } from '../../utils/helpers';
import { useStore } from '../../store/useStore';
import './ProductCard.css';

interface Props {
  product: Product;
}

const ProductCard: React.FC<Props> = ({ product }) => {
  const addToCart = useStore((s) => s.addToCart);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, product.size[0]);
  };

  return (
    <Link to={`/product/${product.id}`} className="product-card">
      <div className="product-card__img-wrap">
        <img
          src={product.images[0]}
          alt={product.name}
          className="product-card__img"
          loading="lazy"
        />
        {product.bestseller && (
          <span className="product-card__badge product-card__badge--bestseller">Bestseller</span>
        )}
        {product.originalPrice && (
          <span className="product-card__badge product-card__badge--sale">Sale</span>
        )}
        <div className="product-card__actions">
          <button className="product-card__action" onClick={handleQuickAdd} title="Quick add to cart">
            <ShoppingBag size={16} />
          </button>
        </div>
      </div>
      <div className="product-card__info">
        <p className="product-card__brand">{product.brand}</p>
        <h3 className="product-card__name">{product.name}</h3>
        <p className="product-card__desc">{product.description}</p>
        <div className="product-card__footer">
          <div className="product-card__price">
            <span className="product-card__price-main">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="product-card__price-orig">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
          <span className="product-card__category">{product.category}</span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
