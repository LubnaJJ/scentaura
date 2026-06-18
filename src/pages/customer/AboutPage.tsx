import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Package, Star, Users } from 'lucide-react';
import { useStore } from '../../store/useStore';
import './AboutPage.css';

const AboutPage: React.FC = () => {
  const storeName = useStore((s) => s.storeSettings.storeName);
  return (
  <div className="about">
    {/* Hero */}
    <section className="about__hero">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p className="section__eyebrow" style={{ color: 'var(--gold)' }}>Our Story</p>
          <h1 className="about__hero-title">
            Bringing Arabia's<br />
            <em>Finest Scents</em><br />
            to Sri Lanka
          </h1>
        </motion.div>
      </div>
    </section>

    {/* Story */}
    <section className="container about__story">
      <div className="about__story-grid">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="section__eyebrow">Who We Are</p>
          <h2 className="about__section-title">Born from a Passion for Authentic Fragrance</h2>
          <p className="about__body">
            {storeName} was founded with a single vision: to give Sri Lanka's most discerning men
            access to the same rare Arabic fragrances worn in the palaces and majlis of the Gulf.
          </p>
          <p className="about__body">
            We travel directly to the souks of Dubai, the distilleries of Oman, and the oud markets
            of Saudi Arabia to source fragrances that carry centuries of tradition. Every bottle we
            carry is authenticated, tested, and selected for its uniqueness and longevity.
          </p>
          <p className="about__body">
            From Colombo to Jaffna, Kandy to Galle — we deliver island-wide, with Cash on Delivery
            so there is zero risk to you. Our customers don't just buy a perfume; they acquire a story.
          </p>
        </motion.div>
        <div className="about__story-visual">
          <img
            src="https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&q=80"
            alt="Arabic perfume bottles"
            className="about__story-img"
          />
        </div>
      </div>
    </section>

    {/* Values */}
    <section className="about__values">
      <div className="container">
        <div className="about__values-header">
          <p className="section__eyebrow">What Drives Us</p>
          <h2 className="about__section-title">Our Values</h2>
        </div>
        <div className="about__values-grid">
          {[
            {
              icon: <Star size={24} />,
              title: 'Authenticity Above All',
              body: 'Every fragrance is sourced directly from trusted Gulf suppliers. No replicas, no imitations — only the real thing.',
            },
            {
              icon: <Package size={24} />,
              title: 'Zero-Risk Delivery',
              body: 'Cash on Delivery to all 25 Sri Lankan districts. You only pay when your order arrives at your door.',
            },
            {
              icon: <Users size={24} />,
              title: 'Personal Service',
              body: 'We are fragrance people. We answer your WhatsApp messages personally and help you find the right scent for your personality.',
            },
            {
              icon: <MapPin size={24} />,
              title: 'Sri Lanka First',
              body: 'We are a local Sri Lankan business, built to serve local customers with world-class fragrances at fair prices.',
            },
          ].map((v, i) => (
            <motion.div
              key={v.title}
              className="about__value-card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
            >
              <span className="about__value-icon">{v.icon}</span>
              <h3 className="about__value-title">{v.title}</h3>
              <p className="about__value-body">{v.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="about__cta container">
      <div className="about__cta-inner">
        <h2 className="about__cta-title">Ready to find your signature scent?</h2>
        <p className="about__cta-sub">Browse our collection of rare Arabic fragrances and order with confidence.</p>
        <div className="about__cta-actions">
          <Link to="/shop" className="btn btn--gold">
            Shop Now <ArrowRight size={15} />
          </Link>
          <Link to="/contact" className="btn btn--gold-outline">
            Talk to Us
          </Link>
        </div>
      </div>
    </section>
  </div>
);

};

export default AboutPage;
