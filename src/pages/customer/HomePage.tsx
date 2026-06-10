import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { ArrowRight, Award, Truck, Shield, Star } from 'lucide-react';
import { useStore } from '../../store/useStore';
import ProductCard from '../../components/ui/ProductCard';
import './HomePage.css';

const HomePage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const products = useStore((s) => s.products);
  const storeSettings = useStore((s) => s.storeSettings);
  const featured = products.filter((p) => p.featured);
  const bestsellers = products.filter((p) => p.bestseller);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, canvas.offsetWidth / canvas.offsetHeight, 0.1, 100);
    camera.position.set(0, 0, 5);

    // Floating golden particles
    const particleCount = 120;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
      sizes[i] = Math.random() * 0.04 + 0.01;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const particleMaterial = new THREE.PointsMaterial({
      color: 0xC9A84C,
      size: 0.04,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(geometry, particleMaterial);
    scene.add(particles);

    // Central orb - glowing sphere representing a perfume bottle
    const orbGeo = new THREE.SphereGeometry(0.8, 64, 64);
    const orbMat = new THREE.MeshPhongMaterial({
      color: 0x1A1814,
      specular: 0xC9A84C,
      shininess: 120,
      transparent: true,
      opacity: 0.85,
    });
    const orb = new THREE.Mesh(orbGeo, orbMat);
    scene.add(orb);

    // Ring around the orb
    const ringGeo = new THREE.TorusGeometry(1.3, 0.012, 16, 100);
    const ringMat = new THREE.MeshPhongMaterial({ color: 0xC9A84C, emissive: 0x8B6914, emissiveIntensity: 0.3 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.5;
    scene.add(ring);

    // Outer ring
    const ring2Geo = new THREE.TorusGeometry(1.7, 0.006, 16, 100);
    const ring2Mat = new THREE.MeshPhongMaterial({ color: 0xC9A84C, transparent: true, opacity: 0.4 });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = Math.PI / 3;
    ring2.rotation.y = Math.PI / 6;
    scene.add(ring2);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const goldLight = new THREE.PointLight(0xC9A84C, 2, 8);
    goldLight.position.set(2, 2, 3);
    scene.add(goldLight);

    const warmLight = new THREE.PointLight(0xE8D5A3, 1.5, 10);
    warmLight.position.set(-2, -1, 2);
    scene.add(warmLight);

    let frame = 0;
    const animate = () => {
      frame++;
      const t = frame * 0.008;

      orb.rotation.y = t * 0.4;
      ring.rotation.z = t * 0.25;
      ring2.rotation.z = -t * 0.15;
      ring2.rotation.y = t * 0.1;

      particles.rotation.y = t * 0.03;
      particles.rotation.x = t * 0.01;

      goldLight.position.x = Math.sin(t * 0.5) * 3;
      goldLight.position.y = Math.cos(t * 0.3) * 2;

      orb.position.y = Math.sin(t * 0.4) * 0.08;

      renderer.render(scene, camera);
      return requestAnimationFrame(animate);
    };

    const raf = animate();

    const handleResize = () => {
      if (!canvas) return;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <canvas ref={canvasRef} className="hero__canvas" />
        <div className="hero__overlay" />
        <div className="hero__content container">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
          >
            <p className="hero__eyebrow">{storeSettings.heroEyebrow}</p>
            <h1 className="hero__title">{storeSettings.heroTitle}</h1>
            <p className="hero__subtitle">{storeSettings.heroSubtitle}</p>
            <div className="hero__actions">
              <Link to="/shop" className="btn btn--gold">
                Explore Collection <ArrowRight size={16} />
              </Link>
              <Link to="/contact" className="btn btn--outline-light">
                Inquire Now
              </Link>
            </div>
          </motion.div>
        </div>
        <div className="hero__scroll-hint">
          <div className="hero__scroll-line" />
          <span>Scroll</span>
        </div>
      </section>

      {/* Trust bar */}
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

      {/* Featured */}
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

      {/* Brand story strip */}
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

      {/* Bestsellers */}
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

      {/* CTA banner */}
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
