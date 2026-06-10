import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Award, Truck, Shield, Star } from 'lucide-react';
import { useStore } from '../../store/useStore';
import ProductCard from '../../components/ui/ProductCard';
import HeroCanvas from '../../components/ui/HeroCanvas';
import './HomePage.css';

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.75, ease: [0.4, 0, 0.2, 1] as const, delay },
});

const HomePage: React.FC = () => {
  const products = useStore((s) => s.products);
  const storeSettings = useStore((s) => s.storeSettings);
  const featured = products.filter((p) => p.featured);
  const bestsellers = products.filter((p) => p.bestseller);

  // Split title: first 2 words plain white, rest italic gold
  const words = storeSettings.heroTitle.split(' ');
  const line1 = words.slice(0, 2).join(' ');
  const line2 = words.slice(2).join(' ');

  return (
    <div className="home">

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero__inner">

          {/* Left — text */}
          <div className="hero__left">
            <motion.p {...fadeUp(0.3)} className="hero__eyebrow">
              {storeSettings.heroEyebrow}
            </motion.p>

            <h1 className="hero__title">
              <motion.span {...fadeUp(0.5)} style={{ display: 'block' }}>
                {line1}
              </motion.span>
              {line2 && (
                <motion.em {...fadeUp(0.7)} style={{ display: 'block' }}>
                  {line2}
                </motion.em>
              )}
            </h1>

            <motion.div
              className="hero__divider"
              initial={{ width: 0 }}
              animate={{ width: 60 }}
              transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1], delay: 0.9 }}
            />

            <motion.p {...fadeUp(1.0)} className="hero__subtitle">
              {storeSettings.heroSubtitle}
            </motion.p>

            <motion.div {...fadeUp(1.2)} className="hero__actions">
              <Link to="/shop" className="btn btn--gold">
                Explore Collection <ArrowRight size={15} />
              </Link>
              <Link to="/about" className="btn btn--outline-light">
                Our Story
              </Link>
            </motion.div>
          </div>

          {/* Right — Three.js canvas */}
          <motion.div
            className="hero__right"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.4, ease: 'easeOut', delay: 0.2 }}
          >
            <HeroCanvas className="hero__canvas" />
          </motion.div>

        </div>

        <div className="hero__scroll-hint" aria-hidden>
          <div className="hero__scroll-line" />
          <span>Scroll</span>
        </div>
      </section>

      {/* ── Trust bar ───────────────────────────────────────────────────── */}
      <section className="trust-bar">
        <div className="container trust-bar__inner">
          {[
            { icon: <Truck size={20} />, label: 'Island-wide Delivery', sub: 'All districts covered' },
            { icon: <Award size={20} />, label: 'Authentic Arabic Perfumes', sub: 'Sourced from the Gulf' },
            { icon: <Shield size={20} />, label: 'Cash on Delivery', sub: 'No upfront payment' },
            { icon: <Star size={20} />, label: '100% Genuine', sub: 'Guaranteed authentic' },
          ].map((item) => (
            <div key={item.label} className="trust-bar__item">
              <span className="trust-bar__icon">{item.icon}</span>
              <div>
                <p className="trust-bar__label">{item.label}</p>
                <p className="trust-bar__sub">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured ────────────────────────────────────────────────────── */}
      <section className="section container">
        <div className="section__header">
          <p className="section__eyebrow">Curated Selection</p>
          <h2 className="section__title">Featured Fragrances</h2>
        </div>
        <div className="products-grid">
          {featured.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.6 }}
            >
              <ProductCard product={p} />
            </motion.div>
          ))}
        </div>
        <div className="section__cta">
          <Link to="/shop" className="btn btn--gold-outline">
            View All Fragrances <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* ── Brand strip ─────────────────────────────────────────────────── */}
      <section className="brand-strip">
        <div className="brand-strip__inner container">
          <div className="brand-strip__text">
            <p className="section__eyebrow" style={{ color: 'var(--gold-light)' }}>Our Promise</p>
            <h2 className="brand-strip__title">
              Every bottle tells a<br />thousand-year story
            </h2>
            <p className="brand-strip__body">
              We travel to the heart of Arabia to source fragrances that carry centuries of craft.
              From the smoky Oud forests of Cambodia to the amber markets of Dubai — each scent
              in our collection is a journey. Now, Sri Lanka's finest men can wear that journey.
            </p>
            <Link to="/about" className="btn btn--outline-light" style={{ marginTop: 24 }}>
              Our Story
            </Link>
          </div>
          <div className="brand-strip__visual">
            <div className="brand-strip__stat">
              <span className="brand-strip__num">6+</span>
              <span className="brand-strip__label">Exclusive Collections</span>
            </div>
            <div className="brand-strip__stat">
              <span className="brand-strip__num">500+</span>
              <span className="brand-strip__label">Happy Customers</span>
            </div>
            <div className="brand-strip__stat">
              <span className="brand-strip__num">25</span>
              <span className="brand-strip__label">Districts Served</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bestsellers ─────────────────────────────────────────────────── */}
      {bestsellers.length > 0 && (
        <section className="section container">
          <div className="section__header">
            <p className="section__eyebrow">Customer Favourites</p>
            <h2 className="section__title">Bestsellers</h2>
          </div>
          <div className="products-grid">
            {bestsellers.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
              >
                <ProductCard product={p} />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ── CTA banner ──────────────────────────────────────────────────── */}
      <section className="cta-banner container">
        <div className="cta-banner__inner">
          <h2 className="cta-banner__title">Questions? We're on WhatsApp.</h2>
          <p className="cta-banner__sub">
            Talk to us directly. Get personalised fragrance recommendations, order tracking,
            and support — all through WhatsApp.
          </p>
          <div className="cta-banner__actions">
            <Link to="/contact" className="btn btn--gold">
              Contact Us <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
