import React, { useState, useEffect } from 'react';
import { useNav } from '../App';
import { api } from '../services/api';
import { setSEO } from '../services/seo';
import { ArrowRight, ChevronRight } from 'lucide-react';

export default function CollectionsPage() {
  const { navigate } = useNav();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSEO({
      title: 'Door Collections in Trichy | New Ikon Doors',
      description: 'Explore 10 curated architectural door collections from New Ikon Doors in Trichy, Tamil Nadu: UV Membrane, Marble Membrane, Steel Patti, Mica, Plain Membrane, Micro Coating, WPVC, and Timber doors.',
      canonical: '/collections',
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Home',
            'item': 'https://newikondoors.com/'
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'Collections',
            'item': 'https://newikondoors.com/collections'
          }
        ]
      }
    });

    const loadCollections = () => {
      api.getCollections().then(data => { setCollections(data); setLoading(false); }).catch(() => setLoading(false));
    };

    loadCollections();

    window.addEventListener('nid:data-changed', loadCollections);
    window.addEventListener('focus', loadCollections);

    return () => {
      window.removeEventListener('nid:data-changed', loadCollections);
      window.removeEventListener('focus', loadCollections);
    };
  }, []);

  return (
    <div style={{ paddingTop: 'calc(var(--topbar-height) + var(--nav-height))' }}>
      {/* Hero Banner */}
      <section style={{
        background: 'var(--bg-dark)',
        color: 'var(--text-inverse)',
        padding: 'clamp(3rem, 6vw, 5rem) 0',
        textAlign: 'center',
      }}>
        <div className="container">
          {/* Visual Breadcrumbs */}
          <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginBottom: '1.25rem' }}>
            <a href="/" onClick={e => { e.preventDefault(); navigate('/'); }} style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Home</a>
            <ChevronRight size={12} />
            <span style={{ color: '#fff' }}>Collections</span>
          </nav>

          <div className="section-eyebrow" style={{ justifyContent: 'center', color: 'var(--color-gold-light)' }}>Our Collections</div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 4vw, 3.2rem)',
            fontWeight: 500,
            letterSpacing: '0.02em',
            marginBottom: '1rem',
          }}>
            Architectural Door Collections
          </h1>
          <p style={{ color: 'var(--text-inverse-muted)', maxWidth: 580, margin: '0 auto', lineHeight: 1.7 }}>
            Over 130 catalogue elevations across 10 curated door series manufactured with precision CNC routing and kiln-seasoned hardwood cores in Trichy, Tamil Nadu.
          </p>
        </div>
      </section>

      {/* Collection Grid */}
      <section className="section-py" style={{ background: 'var(--bg-primary)' }}>
        <div className="container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading collections...</div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.5rem',
            }}>
              {collections.map((col, i) => (
                <a
                  key={col.slug || i}
                  href={`/collections/${col.slug}`}
                  onClick={(e) => { e.preventDefault(); navigate(`/collections/${col.slug}`); }}
                  className="card-image-zoom"
                  style={{
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    transition: 'var(--transition-smooth)',
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'block',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div style={{ aspectRatio: '16/10', background: '#eee', overflow: 'hidden' }}>
                    <img
                      src={col.hero_image || `/doors/lifestyle_page_${String(i + 3).padStart(2, '0')}.jpg`}
                      alt={`New Ikon ${col.name} Collection`}
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </div>
                  <div style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-gold-dark)', marginBottom: '0.35rem' }}>
                      {col.category || 'Door Collection'}
                    </div>
                    <h2 style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.25rem',
                      fontWeight: 500,
                      letterSpacing: '0.01em',
                      marginBottom: '0.5rem',
                    }}>
                      {col.name}
                    </h2>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {col.description || col.tagline || ''}
                    </p>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-gold-dark)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      Explore Collection <ArrowRight size={13} />
                    </span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
