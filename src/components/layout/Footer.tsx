import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import { openWhatsApp } from '../../utils/helpers';
import './Footer.css';

const Footer: React.FC = () => (
  <footer className="footer">
    <div className="footer__top container">
      <div className="footer__brand">
        <div className="footer__logo">SCENTAURA</div>
        <p className="footer__tagline">
          Curating the finest Arabic fragrances for the discerning man in Sri Lanka.
        </p>
        <button
          className="footer__whatsapp"
          onClick={() => openWhatsApp('Hello, I would like to inquire about your perfumes.')}
        >
          <MessageCircle size={18} />
          Chat on WhatsApp
        </button>
      </div>

      <div className="footer__col">
        <h4>Shop</h4>
        <Link to="/shop">All Fragrances</Link>
        <Link to="/shop?category=oud">Oud Collection</Link>
        <Link to="/shop?category=oriental">Oriental</Link>
        <Link to="/shop?category=woody">Woody</Link>
        <Link to="/shop?category=musk">Musk</Link>
      </div>

      <div className="footer__col">
        <h4>Information</h4>
        <Link to="/about">About Us</Link>
        <Link to="/contact">Contact</Link>
        <Link to="/cart">Your Cart</Link>
      </div>

      <div className="footer__col">
        <h4>Contact</h4>
        <a href="tel:+94771234567" className="footer__contact-item">
          <Phone size={14} /> +94 77 123 4567
        </a>
        <a href="mailto:hello@scentaura.lk" className="footer__contact-item">
          <Mail size={14} /> hello@scentaura.lk
        </a>
        <div className="footer__contact-item">
          <MapPin size={14} /> Colombo, Sri Lanka
        </div>
      </div>
    </div>

    <div className="footer__bottom container">
      <p>© {new Date().getFullYear()} Scentaura. All rights reserved.</p>
      <p>Cash on Delivery · Island-wide Delivery · Authentic Arabic Perfumes</p>
    </div>
  </footer>
);

export default Footer;
