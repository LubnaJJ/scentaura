import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Award, Truck, Shield, Star } from 'lucide-react';
import { useStore } from '../../store/useStore';
import ProductCard from '../../components/ui/ProductCard';
import './HomePage.css';

const BOTTLE_IMG = 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&q=80';

const textContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13 } },
};

const textChild = {
  hidden: { opacity: 0, x: -28 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.75, ease: [0.4, 0, 0.2, 1] } },
};

const HomePage: React.FC = () => {
  const products = useStore((s) => s.products);
  const storeSettings = useStore((s) => s.storeSettings);
  const featured = products.filter((p) => p.featured);
  const bestsellers = products.filter((p) => p.bestseller);

  // Tilt refs
  const heroRef = useRef<HTMLElement>(null);
  const bottleCardRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  // Continuous lerp RAF loop
  useEffect(() => {
    const tick = () => {
      currentRef.current.x += (targetRef.current.x - currentRef.current.x) * 0.08;
      currentRef.current.y += (targetRef.current.y - currentRef.current.y) * 0.08;
      if (bottleCardRef.current) {
        bottleCardRef.current.style.transform =
          `rotateY(${currentRef.current.x}deg) rotateX(${currentRef.current.y}deg)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!heroRef.current) return;
    const r = heroRef.current.getBoundingClientRect();
    targetRef.current.x = ((e.clientX - r.left) / r.width - 0.5) * 24;
    targetRef.current.y = -((e.clientY - r.top) / r.height - 0.5) * 24;
  };

  const handleMouseLeave = () => { targetRef.current.x = 0; targetRef.current.y = 0; };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!heroRef.current) return;
    const t = e.touches[0];
    const r = heroRef.current.getBoundingClientRect();
    targetRef.current.x = ((t.clientX - r.left) / r.width - 0.5) * 16;
    targetRef.current.y = -((t.clientY - r.top) / r.height - 0.5) * 16;
  };

  // Split title: first two words plain, rest italic gold
  const titleWords = storeSettings.heroTitle.split(' ');
  const titleLine1 = titleWords.slice(0, 2).join(' ');
  const titleLine2 = titleWords.slice(2).join(' ');

  return (
    <div className="home">

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section
        className="hero"
        ref={heroRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseLeave}
      >
        <div className="hero__inner container">

          {/* Left — text */}
          <motion.div
            className="hero__left"
            variants={textContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.p variants={textChild} className="hero__eyebrow">
              {storeSettings.heroEyebrow}
            </motion.p>

            <motion.h1 variants={textChild} className="hero__title">
              {titleLine1}
              {titleLine2 && (
                <>
                  <br />
                  <em>{titleLine2}</em>
                </>
              )}
            </motion.h1>

            <motion.p variants={textChild} className="hero__subtitle">
              {storeSettings.heroSubtitle}
            </motion.p>

            <motion.div variants={textChild} className="hero__actions">
              <Link to="/shop" className="btn btn--gold">
                Explore Collection <ArrowRight size={15} />
              </Link>
              <Link to="/about" className="btn btn--outline-light">
                Our Story
              </Link>
            </motion.div>
          </motion.div>

          {/* Right — bottle */}
          <motion.div
            className="hero__right"
            initial={{ opacity: 0, x: 48, scale: 0.94 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1], delay: 0.25 }}
          >
            <div className="hero__glow" />

            <div className="hero__particles" aria-hidden>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className={`hero__particle hero__particle--${n}`} />
              ))}
            </div>

            <div className="hero__bottle-scene">
              <div className="hero__bottle-card" ref={bottleCardRef}>
                <img
                  src={BOTTLE_IMG}
                  alt="Arabic oud perfume bottle"
                  className="hero__bottle-img"
                  draggable={false}
                />
              </div>
              <div className="hero__bottle-shadow" />
            </div>
          </motion.div>

        </div>

        <div className="hero__scroll-hint" aria-hidden>
          <div className="hero__scroll-line" />
          <span>Scroll</span>
        </div>
      </section>

      {/* ── Trust bar ───────────────────────────────────────────────── */}
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

      {/* ── Featured ────────────────────────────────────────────────── */}
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

      {/* ── Brand strip ─────────────────────────────────────────────── */}
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

      {/* ── Bestsellers ─────────────────────────────────────────────── */}
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

      {/* ── CTA banner ──────────────────────────────────────────────── */}
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
