import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, Mail, Lock, ArrowRight } from 'lucide-react';
import { useUser } from '../../context/AppContext';
import '../../styles/auth.css';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useUser();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    const success = login(email, password);
    if (success) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.profileCompleted) {
        navigate(user.role === 'patient' ? '/setup/patient' : '/setup/caregiver');
      } else {
        navigate(user.role === 'patient' ? '/patient' : '/caregiver');
      }
    } else {
      setError('Invalid email or password');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <Heart size={32} />
            </div>
            <span>Virtual Companion</span>
          </div>
          <h1>Welcome Back</h1>
          <p>Sign in to continue</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <Mail size={20} />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <Lock size={20} />
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Please wait...' : 'Sign In'}
            <ArrowRight size={20} />
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register">
              Create one
            </Link>
          </p>
        </div>

        <button className="back-home" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
      </div>
    </div>
  );
};
