import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';
import loginHeroImage from '../assets/Magical Books Under Midnight Skies.png';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please enter both email and password.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await login(form);
      loginUser(data.user, data.token);
      if (data.user.role === 'teacher') {
        navigate('/teacher/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-bg">
      <div className="login-page-dots"></div>
      <div className="login-card-wrapper" style={{ zIndex: 1, position: 'relative' }}>
        <div className="login-image-side">
          <div className="login-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
            UniTrack
          </div>
          <img src={loginHeroImage} alt="Login Hero" className="login-hero-img" />
        </div>
        <div className="login-form-side">
          <h2>Welcome!</h2>
          
          <form onSubmit={handleSubmit} className="login-form">
            {error && <div className="alert alert-error" style={{ marginBottom: '1rem', borderRadius: '8px' }}>{error}</div>}
            
            <div className="input-pill-wrapper">
              <span className="input-icon">✉️</span>
              <input 
                type="email" 
                name="email" 
                value={form.email} 
                onChange={handleChange} 
                placeholder="YOUR E-MAIL" 
                required 
              />
            </div>
            
            <div className="input-pill-wrapper">
              <span className="input-icon">🔒</span>
              <input 
                type={showPassword ? "text" : "password"} 
                name="password" 
                value={form.password} 
                onChange={handleChange} 
                placeholder="YOUR PASSWORD" 
                required 
              />
            </div>

            <button type="submit" className="login-submit-btn" disabled={loading}>
              {loading ? 'SIGNING IN...' : 'LOGIN'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}