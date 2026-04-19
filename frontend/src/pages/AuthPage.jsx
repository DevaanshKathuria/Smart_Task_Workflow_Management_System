import { useState } from 'react';
import { authAPI } from '../api';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const change = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        const res = await authAPI.login({ email: form.email, password: form.password });
        login(res.data.user, res.data.token);
      } else {
        if (!form.name.trim()) { setError('Name is required'); setLoading(false); return; }
        await authAPI.register({ name: form.name, email: form.email, password: form.password });
        const res = await authAPI.login({ email: form.email, password: form.password });
        login(res.data.user, res.data.token);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const toggle = () => {
    setIsLogin(!isLogin);
    setError('');
    setForm({ name: '', email: '', password: '' });
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-name">STWMS</div>
          <div className="auth-brand-sub">Smart Task &amp; Workflow Management</div>
        </div>

        <div className="auth-panel">
          <div className="auth-panel-title">
            {isLogin ? 'Sign in' : 'Create account'}
          </div>
          <div className="auth-panel-sub">
            {isLogin
              ? 'Enter your credentials to continue'
              : 'Fill in your details to get started'}
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form className="auth-form" onSubmit={submit}>
            {!isLogin && (
              <div className="form-group">
                <label className="form-label">Full name</label>
                <input
                  id="auth-name"
                  name="name"
                  type="text"
                  className="form-input"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={change}
                  required
                />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                id="auth-email"
                name="email"
                type="email"
                className="form-input"
                placeholder="you@company.com"
                value={form.email}
                onChange={change}
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
                onChange={change}
                required
                minLength={6}
              />
            </div>
            <button
              id="auth-submit"
              type="submit"
              className="btn btn-primary w-full mt-8"
              disabled={loading}
            >
              {loading ? <span className="spinner" /> : null}
              {loading ? 'Please wait...' : isLogin ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <div className="auth-divider">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button id="auth-toggle" onClick={toggle}>
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
