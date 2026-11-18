import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/apiService.js';
import { ErrorMessage } from '../components/Feedback.jsx';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.register(form);
      // Log in straight away so the user lands on the dashboard.
      const { token, user } = await authApi.login({ email: form.email, password: form.password });
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="card form-narrow" onSubmit={onSubmit}>
      <h2>Sign up</h2>
      <ErrorMessage message={error} />
      <label>
        Name
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </label>
      <label>
        Email
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </label>
      <label>
        Password (min. 6 characters)
        <input
          type="password"
          required
          minLength={6}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
      </label>
      <button className="btn" disabled={loading}>
        {loading ? 'Creating account...' : 'Create account'}
      </button>
      <p className="muted">
        Already registered? <Link to="/login">Log in</Link>
      </p>
    </form>
  );
}
