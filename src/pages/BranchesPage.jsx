import React, { useState, useEffect } from 'react';
import { useNav } from '../App';
import { api } from '../services/api';
import { setSEO } from '../services/seo';
import { MapPin, Phone, Clock, ArrowRight, ChevronRight, MessageSquare } from 'lucide-react';

export default function BranchesPage() {
  const { navigate } = useNav();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const breadcrumbSchema = {
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
          'name': 'Branches',
          'item': 'https://newikondoors.com/branches'
        }
      ]
    };

    setSEO({
      title: 'New Ikon Doors Branches | Trichy',
      description: 'Visit New Ikon Doors showrooms across Trichy, Tamil Nadu. Manufacturing & Wholesale HQ on Tanjore Road plus specialized plywood and laminate divisions.',
      canonical: '/branches',
      structuredData: breadcrumbSchema
    });

    const loadBranches = () => {
      api.getBranches().then(d => {
        setBranches(d);
        setLoading(false);
      }).catch(() => setLoading(false));
    };

    loadBranches();

    window.addEventListener('nid:data-changed', loadBranches);
    window.addEventListener('focus', loadBranches);

    return () => {
      window.removeEventListener('nid:data-changed', loadBranches);
      window.removeEventListener('focus', loadBranches);
    };
  }, []);

  return (
    <div style={{ paddingTop: 'calc(var(--topbar-height) + var(--nav-height))' }}>
      {/* Hero */}
      <section style={{ background: 'var(--bg-dark)', color: 'var(--text-inverse)', padding: 'clamp(3rem, 6vw, 5rem) 0', textAlign: 'center' }}>
        <div className="container">
          {/* Breadcrumbs */}
          <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginBottom: '1.25rem' }}>
            <a href="/" onClick={e => { e.preventDefault(); navigate('/'); }} style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Home</a>
            <ChevronRight size={12} />
            <span style={{ color: '#fff' }}>Branches</span>
          </nav>

          <div className="section-eyebrow" style={{ justifyContent: 'center', color: 'var(--color-gold-light)' }}>Visit New Ikon</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 500, letterSpacing: '0.02em', marginBottom: '1rem' }}>
            New Ikon Doors Branches
          </h1>
          <p style={{ color: 'var(--text-inverse-muted)', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
            Three specialized group divisions across Trichy, Tamil Nadu. Experience over 130 live architectural door elevations and timber substrates in person.
          </p>
        </div>
      </section>

      {/* Branches List */}
      <section className="section-py" style={{ background: 'var(--bg-primary)' }}>
        <div className="container">
          {loading ? <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading branches...</div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {branches.map((b, i) => (
                <div key={b.id || i} style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '2rem',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  alignItems: 'stretch',
                }}>
                  {/* Image */}
                  <div style={{ background: '#e8e5df', minHeight: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img
                      src={b.image || (
                        b.id === 'classic-ply' || i === 1
                          ? '/doors/classic_ply_timber_warehouse.jpg'
                          : b.id === 'royal-lam' || i === 2
                          ? '/doors/royal_lam_interior_showroom.jpg'
                          : '/doors/showroom_experience.jpg'
                      )}
                      alt={`New Ikon Doors - ${b.name} in Trichy`}
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  <div style={{ padding: '2rem' }}>
                    <div style={{
                      display: 'inline-block',
                      padding: '0.3rem 0.75rem',
                      borderRadius: 'var(--radius-pill)',
                      background: 'var(--color-gold-subtle)',
                      color: 'var(--color-gold-dark)',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      marginBottom: '1rem',
                    }}>
                      {b.badge || b.category}
                    </div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 500, marginBottom: '0.75rem', letterSpacing: '0.01em' }}>{b.name}</h2>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: '1.5rem' }}>{b.description || b.desc}</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <MapPin size={15} style={{ flexShrink: 0, marginTop: 2 }} /> {b.address}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <Phone size={15} /> {b.phone}
                      </div>
                      {b.timings && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          <Clock size={15} /> {b.timings}
                        </div>
                      )}
                    </div>

                    {/* Highlights */}
                    {b.highlights?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        {b.highlights.map((h, j) => (
                          <span key={j} style={{
                            padding: '0.25rem 0.65rem',
                            borderRadius: 'var(--radius-pill)',
                            border: '1px solid var(--border-light)',
                            fontSize: '0.72rem',
                            color: 'var(--text-muted)',
                            fontWeight: 500,
                          }}>{h}</span>
                        ))}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      {(b.map_url || b.mapUrl) && (
                        <a href={b.map_url || b.mapUrl} target="_blank" rel="noopener noreferrer" className="btn btn-dark btn-sm" style={{ textDecoration: 'none' }}>
                          <MapPin size={13} /> Get Directions
                        </a>
                      )}
                      <a href={`tel:${(b.phone || '').replace(/[^0-9+]/g, '')}`} className="btn btn-outline btn-sm" style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>
                        <Phone size={13} /> Call Branch
                      </a>
                    </div>
                  </div>
                </div>
              ))}

              {/* Internal Link to Contact Page (Branches -> Contact per SEO spec) */}
              <div style={{
                textAlign: 'center',
                marginTop: '1.5rem',
                background: 'var(--bg-card)',
                padding: '2.5rem 2rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                  Planning Your Showroom Visit?
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: 500, margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
                  Our sales and technical team in Trichy can prepare specific architectural elevations and datasheets prior to your arrival.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <a
                    href="/contact"
                    className="btn btn-gold"
                    onClick={(e) => { e.preventDefault(); navigate('/contact'); }}
                    style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                  >
                    Contact Showroom Team <ArrowRight size={14} />
                  </a>
                  <a
                    href="/request-quote"
                    className="btn btn-outline"
                    onClick={(e) => { e.preventDefault(); navigate('/request-quote'); }}
                    style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                  >
                    Request a Quote
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
