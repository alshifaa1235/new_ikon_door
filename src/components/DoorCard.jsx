import React from 'react';
import { ArrowRight, Plus } from 'lucide-react';

export default function DoorCard({ product, onSelect, onQuote }) {
  return (
    <div className="door-card">
      {/* Dominant Image Container */}
      <div
        className="door-image-wrapper"
        onClick={() => onSelect(product)}
        style={{
          cursor: 'pointer',
          height: 'clamp(240px, 36vh, 340px)',
          background: 'linear-gradient(180deg, #FAF9F7 0%, #F1EFEA 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0.85rem 0.5rem',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          border: '1px solid var(--border-subtle)',
        }}
        title={`View ${product.code} details`}
      >
        <picture>
          <source
            srcSet={(product.image?.startsWith('/') ? product.image : `/doors/${product.image}`).replace(/\.(jpg|jpeg|png)$/i, '.webp')}
            type="image/webp"
          />
          <img
            src={product.image?.startsWith('/') ? product.image : `/doors/${product.image}`}
            alt={`New Ikon ${product.collection} Model ${product.code}`}
            width={240}
            height={360}
            loading="lazy"
            decoding="async"
            style={{
              maxHeight: '100%',
              maxWidth: '100%',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
              borderRadius: 2,
              filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.12))',
              transition: 'transform 0.4s ease',
            }}
          />
        </picture>
      </div>

      {/* Editorial Details */}
      <div style={{ marginTop: '1rem' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {product.collection}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.2rem' }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
            {product.code}
          </div>
          <button
            onClick={() => onSelect(product)}
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--color-gold-dark)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              transition: 'transform 0.2s ease'
            }}
          >
            Details <ArrowRight size={12} />
          </button>
        </div>
      </div>

      {/* Minimal Action */}
      <div style={{ marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-subtle)' }}>
        <button
          onClick={() => onQuote(product)}
          className="btn btn-outline"
          style={{
            width: '100%',
            padding: '0.6rem 0.85rem',
            fontSize: '0.75rem',
            letterSpacing: '0.06em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem'
          }}
        >
          <Plus size={13} /> Request Quote
        </button>
      </div>
    </div>
  );
}
