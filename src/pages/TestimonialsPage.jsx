import React, { useState, useEffect } from 'react';
import { useNav } from '../App';
import { api } from '../services/api';
import { setSEO } from '../services/seo';
import { Star, Quote, ArrowRight, ChevronRight } from 'lucide-react';

export default function TestimonialsPage() {
  const { navigate } = useNav();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSEO({
      title: 'Client Reviews & Testimonials | New Ikon Doors Trichy',
      description: 'Read real testimonials from architects, builders, and interior designers who partner with New Ikon Doors in Trichy, Tamil Nadu.',
      canonical: '/testimonials',
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
            'name': 'Testimonials',
            'item': 'https://newikondoors.com/testimonials'
          }
        ]
      }
    });

    const loadTestimonials = () => {
      api.getTestimonials().then(d => { setTestimonials(d); setLoading(false); }).catch(() => setLoading(false));
    };

    loadTestimonials();

    window.addEventListener('nid:data-changed', loadTestimonials);
    window.addEventListener('focus', loadTestimonials);

    return () => {
      window.removeEventListener('nid:data-changed', loadTestimonials);
      window.removeEventListener('focus', loadTestimonials);
    };
  }, []);

  return (
    <div style={{ paddingTop: 'calc(var(--topbar-height) + var(--nav-height))' }}>
      <section style={{ background: 'var(--bg-dark)', color: 'var(--text-inverse)', padding: 'clamp(3rem, 6vw, 5rem) 0', textAlign: 'center' }}>
        <div className="container">
          {/* Breadcrumbs */}
          <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginBottom: '1.25rem' }}>
            <a href="/" onClick={e => { e.preventDefault(); navigate('/'); }} style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Home</a>
            <ChevronRight size={12} />
            <span style={{ color: '#fff' }}>Testimonials</span>
          </nav>

          <div className="section-eyebrow" style={{ justifyContent: 'center', color: 'var(--color-gold-light)' }}>Client Testimonials</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 500, letterSpacing: '0.02em', marginBottom: '1rem' }}>
            Client Testimonials
          </h1>
          <p style={{ color: 'var(--text-inverse-muted)', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
            Hear from architects, builders, and designers who trust New Ikon Doors for residential and commercial projects in Trichy and beyond.
          </p>
        </div>
      </section>

      <section className="section-py" style={{ background: 'var(--bg-primary)' }}>
        <div className="container">
          {loading ? <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading testimonials...</div> : testimonials.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <Quote size={32} style={{ color: 'var(--color-gold)', marginBottom: '1rem', opacity: 0.3 }} />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: '0.75rem' }}>Testimonials coming soon</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>We're collecting feedback from our valued trade partners and clients.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
              {testimonials.map((t, i) => (
                <div key={t.id || i} style={{
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-md)',
                  padding: '2rem',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                }}>
                  <Quote size={24} style={{ color: 'var(--color-gold)', marginBottom: '1rem', opacity: 0.4 }} />
                  <p style={{ fontSize: '0.95rem', lineHeight: 1.75, color: 'var(--text-secondary)', marginBottom: '1.5rem', flex: 1, fontStyle: 'italic' }}>
                    "{t.quote}"
                  </p>
                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{t.role}</div>
                    {t.project && <div style={{ fontSize: '0.72rem', color: 'var(--color-gold-dark)', marginTop: '0.35rem', fontWeight: 500 }}>{t.project}</div>}
                    {t.rating > 0 && (
                      <div style={{ display: 'flex', gap: '0.15rem', marginTop: '0.5rem' }}>
                        {Array.from({ length: t.rating }).map((_, j) => <Star key={j} size={13} fill="var(--color-gold)" stroke="var(--color-gold)" />)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="section-py" style={{ background: 'var(--bg-secondary)', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: 550 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 2.5vw, 1.8rem)', fontWeight: 500, marginBottom: '1rem' }}>Ready to start your project?</h2>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="/request-quote"
              className="btn btn-dark"
              onClick={(e) => { e.preventDefault(); navigate('/request-quote'); }}
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
            >
              Request a Quote <ArrowRight size={14} />
            </a>
            <a
              href="/contact"
              className="btn btn-outline"
              onClick={(e) => { e.preventDefault(); navigate('/contact'); }}
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
