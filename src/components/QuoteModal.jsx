import React from 'react';
import { useNav } from '../App';
import { X, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';

export default function QuoteModal({ isOpen, onClose, products, onRemove }) {
  const { navigate } = useNav();

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 3000,
      display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
    }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', transition: 'opacity 0.3s' }} />
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: 420,
        height: '100vh',
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-xl)',
        animation: 'slideInRight 0.35s var(--ease-out-expo)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.95rem' }}>
            <ShoppingBag size={18} /> Quote List ({products?.length || 0})
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.3rem' }}><X size={20} /></button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem' }}>
          {(!products || products.length === 0) ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <ShoppingBag size={32} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>No products selected yet.</p>
              <p style={{ fontSize: '0.8rem' }}>Browse collections and add doors to your quote list.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {products.map((p, i) => (
                <div key={p.code || i} style={{
                  display: 'flex', alignItems: 'center', gap: '0.85rem',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-card-subtle)',
                }}>
                  <div style={{ width: 56, height: 76, borderRadius: 'var(--radius-xs)', overflow: 'hidden', flexShrink: 0, background: '#FAF9F7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.2rem', border: '1px solid var(--border-subtle)' }}>
                    <img src={p.image?.startsWith('/') ? p.image : `/doors/${p.image}`} alt={p.code} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{p.code}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{p.collection_name || p.name || ''}</div>
                  </div>
                  <button
                    onClick={() => onRemove(p.code)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.3rem', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--color-error)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {products && products.length > 0 && (
          <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
            <button
              className="btn btn-gold"
              onClick={() => { onClose(); navigate('/request-quote'); }}
              style={{ width: '100%' }}
            >
              Request Quote for {products.length} item{products.length > 1 ? 's' : ''} <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* slideInRight keyframes defined in main.css */}
      </div>
    </div>
  );
}
