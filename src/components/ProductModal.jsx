import React, { useState } from 'react';
import { X, MessageSquare, Plus, ArrowRight, ShieldCheck } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import companyData from '../data/company.json';
import productsData from '../data/products.json';

export default function ProductModal({ product, onClose, onQuote }) {
  const [activeTab, setActiveTab] = useState('door'); // 'door' or 'lifestyle'
  const { settings } = useSite();

  if (!product) return null;

  const rawWhatsapp = (settings?.whatsapp || companyData.whatsapp || '9842445353').replace(/[^0-9]/g, '');
  const whatsapp = rawWhatsapp.startsWith('91') && rawWhatsapp.length === 12 ? rawWhatsapp : `91${rawWhatsapp}`;

  const whatsappMsg = encodeURIComponent(
    `Hello New Ikon Doors, I am inquiring about door model ${product.code} (${product.collection}). Please share factory wholesale pricing and availability.`
  );

  // Grab 3 related products from the same collection
  const relatedProducts = productsData.allProducts
    .filter(p => p.collection === product.collection && p.code !== product.code)
    .slice(0, 3);

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '1020px' }}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            zIndex: 10,
            width: '36px',
            height: '36px',
            backgroundColor: '#F5F3EF',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.2s ease'
          }}
        >
          <X size={18} color="#141414" />
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
          
          {/* Left Column: Product Imagery */}
          <div style={{ backgroundColor: '#FAF9F6', padding: '3rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid var(--border-light)' }}>
            
            {/* Elevation vs Room View Toggle */}
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '2rem', backgroundColor: '#EEEBE5', padding: '0.25rem', borderRadius: 'var(--radius-pill)' }}>
              <button
                onClick={() => setActiveTab('door')}
                style={{
                  padding: '0.4rem 1.1rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: activeTab === 'door' ? '#FFFFFF' : 'transparent',
                  color: activeTab === 'door' ? 'var(--text-primary)' : 'var(--text-muted)',
                  boxShadow: activeTab === 'door' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                Door Elevation
              </button>
              <button
                onClick={() => setActiveTab('lifestyle')}
                style={{
                  padding: '0.4rem 1.1rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: activeTab === 'lifestyle' ? '#FFFFFF' : 'transparent',
                  color: activeTab === 'lifestyle' ? 'var(--text-primary)' : 'var(--text-muted)',
                  boxShadow: activeTab === 'lifestyle' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                Room Setting
              </button>
            </div>

            {/* Main Visual */}
            <div style={{ height: '440px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {activeTab === 'door' ? (
                <img
                  src={`/doors/${product.image}`}
                  alt={`New Ikon ${product.collection} - Model ${product.code}`}
                  style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', filter: 'drop-shadow(0 16px 32px rgba(0,0,0,0.12))' }}
                />
              ) : (
                <img
                  src={`/doors/${product.lifestyle_image}`}
                  alt={product.lifestyle_title}
                  style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', borderRadius: 'var(--radius-sm)', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
                />
              )}
            </div>
            
            <div style={{ marginTop: '1.25rem', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {activeTab === 'door' ? `Actual Catalogue Model: ${product.code}` : product.lifestyle_title}
            </div>
          </div>

          {/* Right Column: Architectural Specification */}
          <div style={{ padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column' }}>
            
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-gold-dark)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.4rem' }}>
              {product.collection}
            </div>
            
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem', letterSpacing: '-0.01em' }}>
              Model {product.code}
            </h2>

            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '1.75rem' }}>
              Calibrated engineered core bonded under hydraulic vacuum heat press with anti-warping chemical treatment. Suitable for architectural villas, luxury apartments, and commercial projects.
            </p>

            {/* Technical Ground Truth Specifications */}
            <div style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xs)', overflow: 'hidden', marginBottom: '2rem' }}>
              <div style={{ backgroundColor: '#FAF8F5', padding: '0.65rem 1.1rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-light)' }}>
                Catalogue Specifications
              </div>
              <div style={{ fontSize: '0.82rem' }}>
                {Object.entries(product.specs || {}).slice(0, 5).map(([k, v], idx) => (
                  <div
                    key={k}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.55rem 1.1rem',
                      backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FAF8F5',
                      borderBottom: idx < 4 ? '1px solid var(--border-subtle)' : 'none'
                    }}
                  >
                    <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{k}</span>
                    <span style={{ color: 'var(--text-primary)', textAlign: 'right' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
              <button
                onClick={() => {
                  onQuote(product);
                  onClose();
                }}
                className="btn btn-gold"
                style={{ width: '100%', padding: '0.95rem' }}
              >
                <Plus size={15} /> Request Wholesale Quote
              </button>
              <a
                href={`https://wa.me/${whatsapp}?text=${whatsappMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp"
                style={{ width: '100%', padding: '0.95rem', textAlign: 'center' }}
              >
                <MessageSquare size={15} /> WhatsApp for Pricing
              </a>
            </div>

            {/* Related Designs */}
            {relatedProducts.length > 0 && (
              <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  Related {product.collection} Designs
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                  {relatedProducts.map(rp => (
                    <div
                      key={rp.id}
                      onClick={() => {
                        // Switch modal product
                        onQuote(rp);
                      }}
                      style={{
                        backgroundColor: '#FAF8F5',
                        border: '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-xs)',
                        padding: '0.5rem',
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      <img
                        src={`/doors/${rp.image}`}
                        alt={rp.code}
                        style={{ height: '70px', margin: '0 auto 0.35rem', objectFit: 'contain' }}
                      />
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{rp.code}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
