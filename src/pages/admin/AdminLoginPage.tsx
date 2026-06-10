import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useStore } from '../../store/useStore';
import toast from 'react-hot-toast';
import './AdminLoginPage.css';

const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const adminLogin = useStore((s) => s.adminLogin);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const ok = await adminLogin(email, password);
    setLoading(false);
    if (ok) {
      toast.success('Welcome back, Admin');
      navigate('/admin/dashboard');
    } else {
      toast.error('Invalid credentials');
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login__card">
        <div className="admin-login__logo">ZACK'S PERFUME</div>
        <p className="admin-login__sub">Admin Portal</p>
        <div className="admin-login__icon-wrap">
          <Lock size={28} />
        </div>
        <h1 className="admin-login__title">Sign In</h1>
        <form onSubmit={handleSubmit} className="admin-login__form">
          <div className="form-field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@zacksperfume.lk"
              autoComplete="email"
              required
            />
          </div>
          <div className="form-field">
            <label>Password</label>
            <div className="admin-login__pw-wrap">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="admin-login__pw-toggle"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="btn btn--gold admin-login__submit"
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign In to Admin'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
