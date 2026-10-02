import React, { useState, useEffect } from 'react';
import { useNav } from '../../App';
import { api } from '../../services/api';
import { setSEO } from '../../services/seo';
import { checkLoginRateLimit, clearLoginRateLimit, isSupabaseConfigured } from '../../services/supabaseClient';
import { Lock, User, ArrowRight, AlertCircle, ShieldAlert, CheckCircle2, RefreshCw } from 'lucide-react';

export default function AdminLoginPage() {
  const { navigate } = useNav();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lockoutSec, setLockoutSec] = useState(0);

  useEffect(() => {
    setSEO({ title: 'Admin Login | New Ikon Doors', robots: 'noindex, nofollow' });

    // Check rate limit status
    const limit = checkLoginRateLimit();
    if (!limit.allowed && limit.waitSeconds) {
      setLockoutSec(limit.waitSeconds);
    }
  }, []);

  // Countdown timer for lockout
  useEffect(() => {
    if (lockoutSec <= 0) return;
    const interval = setInterval(() => {
      setLockoutSec(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSec]);

  const handleResetLockout = () => {
    clearLoginRateLimit();
    setLockoutSec(0);
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const result = await api.login(email, password);
      if (result?.user) {
        try {
          localStorage.setItem('nid_user', JSON.stringify(result.user));
        } catch {}
        navigate('/admin/dashboard', true);
      }
    } catch (err) {
      const msg = err.message || err.error || 'Invalid credentials or unauthorized account.';
      setError(msg);

      // Re-check rate limit status
      const limit = checkLoginRateLimit();
      if (!limit.allowed && limit.waitSeconds) {
        setLockoutSec(limit.waitSeconds);
      }
    } finally {
      setLoading(false);
    }
  };

  const isConfigured = isSupabaseConfigured();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-dark)',
      padding: 'clamp(1rem, 3vw, 2rem)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 420,
        background: 'var(--bg-dark-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-dark)',
        padding: 'clamp(1.25rem, 4vw, 2.5rem)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img
            src="/new_ikon_logo_white.png"
            alt="New Ikon Doors"
            style={{ height: 38, marginBottom: '1.25rem', opacity: 0.95 }}
          />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 500, color: '#fff', letterSpacing: '0.02em', margin: 0 }}>
            Administration Portal
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-inverse-muted)', marginTop: '0.45rem' }}>
            Authorized New Ikon Doors Management
          </p>
        </div>

        {/* Database Status indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.4rem',
          fontSize: '0.72rem',
          color: isConfigured ? '#10B981' : '#F59E0B',
          background: isConfigured ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
          border: `1px solid ${isConfigured ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)'}`,
          padding: '0.35rem 0.75rem',
          borderRadius: 'var(--radius-pill)',
          marginBottom: '1.5rem',
        }}>
          {isConfigured ? (
            <>
              <CheckCircle2 size={12} />
              <span>Production Supabase PostgreSQL Connected</span>
            </>
          ) : (
            <>
              <ShieldAlert size={12} />
              <span>Autonomous High-Security CMS Mode</span>
            </>
          )}
        </div>

        {/* Lockout Warning */}
        {lockoutSec > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)',
            background: 'rgba(239,68,68,0.15)', color: '#F87171',
            fontSize: '0.82rem', marginBottom: '1.25rem',
            border: '1px solid rgba(239,68,68,0.3)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={17} style={{ flexShrink: 0 }} />
              <span>Locked for {Math.floor(lockoutSec / 60)}m {lockoutSec % 60}s.</span>
            </div>
            <button
              type="button"
              onClick={handleResetLockout}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#fff',
                padding: '0.2rem 0.5rem',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: '0.72rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <RefreshCw size={11} /> Unlock
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && lockoutSec === 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)',
            background: 'rgba(239,68,68,0.1)', color: '#EF4444',
            fontSize: '0.82rem', marginBottom: '1.25rem',
            border: '1px solid rgba(239,68,68,0.25)',
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin}>
          {/* Email or Username Field */}
          <div style={{ marginBottom: '1.1rem' }}>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-inverse-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
              Administrator Username or Email
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-inverse-muted)' }} />
              <input
                type="text"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter username or email"
                required
                autoFocus
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.85rem 0.75rem 2.35rem',
                  background: 'var(--bg-dark-card)',
                  border: '1px solid var(--border-dark)',
                  borderRadius: 'var(--radius-sm)',
                  color: '#fff',
                  fontSize: '0.9rem',
                  fontFamily: 'var(--font-sans)',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--color-gold)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-dark)'}
              />
            </div>
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: '1.3rem' }}>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-inverse-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-inverse-muted)' }} />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.85rem 0.75rem 2.35rem',
                  background: 'var(--bg-dark-card)',
                  border: '1px solid var(--border-dark)',
                  borderRadius: 'var(--radius-sm)',
                  color: '#fff',
                  fontSize: '0.9rem',
                  fontFamily: 'var(--font-sans)',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--color-gold)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-dark)'}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-gold"
            disabled={loading}
            style={{ width: '100%', padding: '0.85rem' }}
          >
            {loading ? 'Authenticating...' : <>Sign In to Dashboard <ArrowRight size={14} /></>}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', borderTop: '1px solid var(--border-dark)', paddingTop: '1.25rem' }}>
          <a
            href="/"
            onClick={e => { e.preventDefault(); navigate('/'); }}
            style={{ fontSize: '0.8rem', color: 'var(--text-inverse-muted)', textDecoration: 'none' }}
          >
            ← Return to Public Website
          </a>
        </div>
      </div>
    </div>
  );
}
