import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import './Navbar.css';

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const cartCount = useStore((s) => s.cartCount());
  const storeSettings = useStore((s) => s.storeSettings);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const isHome = location.pathname === '/';
  const transparent = isHome && !scrolled && !mobileOpen;

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''} ${transparent ? 'navbar--transparent' : ''}`}>
      <div className="navbar__inner container">
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-text">{storeSettings.storeName}</span>
          <span className="navbar__logo-sub">{storeSettings.storeTagline}</span>
        </Link>

        <ul className="navbar__links">
          <li><Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link></li>
          <li><Link to="/shop" className={location.pathname === '/shop' ? 'active' : ''}>Shop</Link></li>
          <li><Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>About</Link></li>
          <li><Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>Contact</Link></li>
        </ul>

        <div className="navbar__actions">
          <Link to="/cart" className="navbar__cart">
            <ShoppingBag size={22} />
            {cartCount > 0 && <span className="navbar__badge">{cartCount}</span>}
          </Link>
          <button
            className="navbar__hamburger"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="navbar__mobile">
          <Link to="/">Home</Link>
          <Link to="/shop">Shop</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/cart">Cart {cartCount > 0 && `(${cartCount})`}</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
