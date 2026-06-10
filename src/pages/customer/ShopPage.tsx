import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import ProductCard from '../../components/ui/ProductCard';
import { ProductCategory } from '../../types';
import './ShopPage.css';

const CATEGORIES: { value: ProductCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'oud', label: 'Oud' },
  { value: 'oriental', label: 'Oriental' },
  { value: 'woody', label: 'Woody' },
  { value: 'musk', label: 'Musk' },
  { value: 'floral', label: 'Floral' },
  { value: 'fresh', label: 'Fresh' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name', label: 'Name A–Z' },
];

const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = (searchParams.get('category') || 'all') as ProductCategory | 'all';

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<ProductCategory | 'all'>(initialCategory);
  const [sort, setSort] = useState('newest');
  const [priceMax, setPriceMax] = useState(20000);

  const products = useStore((s) => s.products);

  const filtered = useMemo(() => {
    let list = [...products];
    if (category !== 'all') list = list.filter((p) => p.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }
    list = list.filter((p) => p.price <= priceMax);
    switch (sort) {
      case 'price-asc': list.sort((a, b) => a.price - b.price); break;
      case 'price-desc': list.sort((a, b) => b.price - a.price); break;
      case 'name': list.sort((a, b) => a.name.localeCompare(b.name)); break;
      default: list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return list;
  }, [products, category, search, sort, priceMax]);

  const handleCategory = (cat: ProductCategory | 'all') => {
    setCategory(cat);
    if (cat !== 'all') setSearchParams({ category: cat });
    else setSearchParams({});
  };

  return (
    <div className="shop">
      <div className="shop__hero">
        <div className="shop__hero-bg" />
        <div className="container shop__hero-content">
          <motion.p
            className="section__eyebrow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            Our Collection
          </motion.p>
          <motion.h1
            className="shop__title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.12, ease: [0.4, 0, 0.2, 1] }}
          >
            Arabian Fragrances
          </motion.h1>
          <motion.div
            className="shop__hero-ornament"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <span />
          </motion.div>
          <motion.p
            className="shop__subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.42, ease: [0.4, 0, 0.2, 1] }}
          >
            Discover rare Ouds, sacred Ambers, and precious Musks — sourced from the heart of Arabia.
          </motion.p>
        </div>
      </div>

      <div className="container shop__body">
        {/* Filters bar */}
        <div className="shop__filters">
          <div className="shop__search">
            <Search size={16} className="shop__search-icon" />
            <input
              type="text"
              placeholder="Search fragrances..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="shop__search-input"
            />
            {search && (
              <button onClick={() => setSearch('')} className="shop__search-clear">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="shop__cats">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                className={`shop__cat-btn ${category === c.value ? 'active' : ''}`}
                onClick={() => handleCategory(c.value as ProductCategory | 'all')}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="shop__sort">
            <SlidersHorizontal size={14} className="shop__sort-icon" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="shop__sort-select"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Price filter */}
        <div className="shop__price-filter">
          <span className="shop__price-label">Max price: Rs. {priceMax.toLocaleString('en-LK')}</span>
          <input
            type="range"
            min={5000}
            max={25000}
            step={500}
            value={priceMax}
            onChange={(e) => setPriceMax(Number(e.target.value))}
            className="shop__range"
          />
        </div>

        {/* Results count */}
        <p className="shop__count">
          {filtered.length} {filtered.length === 1 ? 'fragrance' : 'fragrances'} found
        </p>

        {/* Grid */}
        <AnimatePresence mode="wait">
          {filtered.length > 0 ? (
            <motion.div
              key={`${category}-${sort}-${search}`}
              className="shop__grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </motion.div>
          ) : (
            <div className="shop__empty">
              <p className="shop__empty-title">No fragrances found</p>
              <p className="shop__empty-sub">Try adjusting your filters or search term.</p>
              <button
                className="btn btn--gold-outline"
                onClick={() => { setSearch(''); setCategory('all'); setPriceMax(20000); }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ShopPage;
