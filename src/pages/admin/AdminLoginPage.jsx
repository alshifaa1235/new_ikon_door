import React, { useState, useEffect } from 'react';
import { useNav } from '../../App';
import { api } from '../../services/api';
import { setSEO } from '../../services/seo';
import { Lock, User, ArrowRight, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const { navigate } = useNav();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSEO({ title: 'Admin Login', robots: 'noindex, nofollow' });
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await api.login(username, password);
      localStorage.setItem('nid_token', result.token);
      localStorage.setItem('nid_user', JSON.stringify(result.user));
      navigate('/admin', true);
    } catch (err) {
      setError(err.error || 'Invalid credentials');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-dark)',
      padding: '2rem',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 400,
        background: 'var(--bg-dark-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-dark)',
        padding: '2.5rem',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img src="/new_ikon_logo_white.png" alt="New Ikon Doors" style={{ height: 36, marginBottom: '1.5rem', opacity: 0.8 }} />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 500, color: '#fff', letterSpacing: '0.02em' }}>Admin Panel</h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-inverse-muted)', marginTop: '0.35rem' }}>Sign in to manage your showroom</p>
        </div>

        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)',
            background: 'rgba(239,68,68,0.1)', color: '#EF4444',
            fontSize: '0.82rem', marginBottom: '1.25rem',
            border: '1px solid rgba(239,68,68,0.2)',
          }}>
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-inverse-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>Username</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-inverse-muted)' }} />
              <input
                type="text" value={username} onChange={e => setUsername(e.target.value)} required autoFocus
                style={{
                  width: '100%', padding: '0.7rem 0.85rem 0.7rem 2.25rem',
                  background: 'var(--bg-dark-card)', border: '1px solid var(--border-dark)',
                  borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '0.9rem',
                  fontFamily: 'var(--font-sans)', outline: 'none', boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--color-gold)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-dark)'}
              />
            </div>
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-inverse-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-inverse-muted)' }} />
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)} required
                style={{
                  width: '100%', padding: '0.7rem 0.85rem 0.7rem 2.25rem',
                  background: 'var(--bg-dark-card)', border: '1px solid var(--border-dark)',
                  borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '0.9rem',
                  fontFamily: 'var(--font-sans)', outline: 'none', boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--color-gold)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-dark)'}
              />
            </div>
          </div>
          <button type="submit" className="btn btn-gold" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Signing in...' : <>Sign In <ArrowRight size={14} /></>}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <a href="/" onClick={e => { e.preventDefault(); navigate('/'); }} style={{ fontSize: '0.78rem', color: 'var(--text-inverse-muted)', textDecoration: 'none' }}>
            ← Back to website
          </a>
        </div>
      </div>
    </div>
  );
}
