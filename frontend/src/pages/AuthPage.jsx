import { useState } from 'react';
import { authAPI } from '../api';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        const res = await authAPI.login({ email: form.email, password: form.password });
        login(res.data.user, res.data.token);
      } else {
        if (!form.name.trim()) { setError('Name is required'); setLoading(false); return; }
        const res = await authAPI.register({ name: form.name, email: form.email, password: form.password });
        // After register, auto-login
        const loginRes = await authAPI.login({ email: form.email, password: form.password });
        login(loginRes.data.user, loginRes.data.token);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>STWMS</h1>
          <p>Smart Task & Workflow Management</p>
        </div>

        {error && <div className="alert alert-error mb-16">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                id="auth-name"
                name="name"
                type="text"
                className="form-input"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              id="auth-email"
              name="email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              id="auth-password"
              name="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>
          <button id="auth-submit" type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? <span className="spinner" /> : null}
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="auth-switch">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          {' '}
          <button id="auth-toggle" onClick={() => { setIsLogin(!isLogin); setError(''); setForm({ name: '', email: '', password: '' }); }}>
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}
