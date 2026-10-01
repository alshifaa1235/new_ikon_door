import React, { useEffect, useState } from 'react';
import { useNav } from '../App';
import { useSite } from '../context/SiteContext';
import { setSEO } from '../services/seo';
import { Download, ArrowRight, ChevronRight, Layers, FileText, ExternalLink } from 'lucide-react';

const FALLBACK_CATALOGUE_COLLECTIONS = [
  { name: 'UV Membrane Doors', slug: 'uv-membrane', desc: 'High-gloss polymer finish with metallic border styling.' },
  { name: 'Marble Membrane Doors', slug: 'marble-membrane', desc: 'Italian and Spanish marble veining with golden geometric accents.' },
  { name: 'Steel Patti Doors', slug: 'steel-patti', desc: 'CNC grooved architectural profiles with stainless steel inlays.' },
  { name: 'Mica Laminate Doors', slug: 'mica-doors', desc: '1mm designer mica lamination on boiling waterproof core.' },
  { name: 'Plain Membrane Doors', slug: 'plain-membrane', desc: 'Monolithic matte and woodgrain solid textures.' },
  { name: 'Micro Coating Doors', slug: 'micro-coating', desc: 'Nano-level polymer coating for scratch and moisture endurance.' },
  { name: 'WPVC Digital Doors', slug: 'wpvc-digital', desc: '100% waterproof digital printed doors for bathrooms and balconies.' },
  { name: 'Rubber Wood Doors', slug: 'rubber-wood', desc: 'Solid finger-jointed timber doors with rich natural grain.' },
  { name: '3D Membrane Doors', slug: '3d-membrane', desc: 'Deep-relief multi-dimensional CNC carved patterns.' },
  { name: 'Kumil Membrane Doors', slug: 'kumil-membrane', desc: 'Heritage rounded raised-panel elevations.' },
];

export default function CataloguePage() {
  const { navigate } = useNav();
  const { catalogue, collections } = useSite();

  const pdfUrl = catalogue?.file_url || '/catalogue/NEW_IKON_DOORS.pdf';
  const displayCollections = (collections && collections.length > 0)
    ? collections.map(c => ({
        name: c.name?.endsWith('Doors') ? c.name : `${c.name} Doors`,
        slug: c.slug,
        desc: c.tagline || c.description || 'Architectural door elevations crafted with seasoned hardwood core and precision CNC.'
      }))
    : FALLBACK_CATALOGUE_COLLECTIONS;

  useEffect(() => {
    setSEO({
      title: 'New Ikon Doors Catalogue | Door Collection',
      description: 'Download the official New Ikon Doors catalogue featuring 130+ door elevations, technical specifications, and finish options. Manufactured in Trichy, Tamil Nadu.',
      canonical: '/catalogue',
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
            'name': 'Catalogue',
            'item': 'https://newikondoors.com/catalogue'
          }
        ]
      }
    });
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
            <span style={{ color: '#fff' }}>Catalogue</span>
          </nav>

          <div className="section-eyebrow" style={{ justifyContent: 'center', color: 'var(--color-gold-light)' }}>Master Catalogue</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 500, letterSpacing: '0.02em', marginBottom: '1rem' }}>
            New Ikon Doors Catalogue
          </h1>
          <p style={{ color: 'var(--text-inverse-muted)', maxWidth: 540, margin: '0 auto', lineHeight: 1.7 }}>
            Download or browse the complete New Ikon Doors architectural catalogue featuring 130+ door elevations, core construction details, and sizing tables.
          </p>
        </div>
      </section>

      {/* Main Viewer */}
      <section className="section-py" style={{ background: 'var(--bg-primary)' }}>
        <div className="container" style={{ maxWidth: 960 }}>
          {/* PDF Embed — Desktop shows iframe, Mobile shows download card */}
          {(() => {
            const isMobile = typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            if (isMobile) {
              return (
                <div style={{
                  background: 'linear-gradient(135deg, #1a1816 0%, #2a2520 50%, #1a1816 100%)',
                  border: '1px solid rgba(184, 134, 11, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  marginBottom: '2rem',
                  padding: 'clamp(2rem, 6vw, 3.5rem)',
                  textAlign: 'center',
                  color: '#fff',
                }}>
                  <div style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    background: 'rgba(184, 134, 11, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem',
                    border: '1px solid rgba(184, 134, 11, 0.3)',
                  }}>
                    <FileText size={32} style={{ color: 'var(--color-gold-light)' }} />
                  </div>
                  <h3 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(1.2rem, 3.5vw, 1.5rem)',
                    fontWeight: 500,
                    marginBottom: '0.75rem',
                    letterSpacing: '0.02em',
                  }}>
                    Official Product Catalogue
                  </h3>
                  <p style={{
                    color: 'rgba(255,255,255,0.65)',
                    fontSize: '0.88rem',
                    lineHeight: 1.65,
                    maxWidth: 400,
                    margin: '0 auto 1.75rem',
                  }}>
                    Download the complete New Ikon Doors catalogue with 130+ door elevations, specifications, and finish options.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: 320, margin: '0 auto' }}>
                    <a
                      href={pdfUrl}
                      download="New_Ikon_Doors_Catalogue.pdf"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.6rem',
                        padding: '0.95rem 1.5rem',
                        background: 'var(--color-gold)',
                        color: '#fff',
                        borderRadius: 'var(--radius-xs)',
                        textDecoration: 'none',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                      }}
                    >
                      <Download size={16} /> Download PDF
                    </a>
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.6rem',
                        padding: '0.85rem 1.5rem',
                        background: 'transparent',
                        color: 'rgba(255,255,255,0.8)',
                        borderRadius: 'var(--radius-xs)',
                        textDecoration: 'none',
                        fontWeight: 500,
                        fontSize: '0.82rem',
                        letterSpacing: '0.04em',
                        border: '1px solid rgba(255,255,255,0.2)',
                      }}
                    >
                      <ExternalLink size={14} /> Open in Browser
                    </a>
                  </div>
                  <div style={{
                    marginTop: '1.75rem',
                    fontSize: '0.72rem',
                    color: 'rgba(255,255,255,0.4)',
                    letterSpacing: '0.05em',
                  }}>
                    PDF • ~9 MB • Best viewed on desktop
                  </div>
                </div>
              );
            }
            return (
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                marginBottom: '2rem',
              }}>
                <iframe
                  src={pdfUrl}
                  title="New Ikon Doors Master Architectural Catalogue"
                  loading="lazy"
                  style={{ width: '100%', height: '80vh', border: 'none', display: 'block' }}
                />
              </div>
            );
          })()}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3.5rem' }}>
            <a
              href={pdfUrl}
              download="New_Ikon_Doors_Catalogue.pdf"
              className="btn btn-gold btn-lg"
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
            >
              <Download size={15} /> Download PDF Catalogue
            </a>
            <a
              href="/collections"
              className="btn btn-dark btn-lg"
              onClick={(e) => { e.preventDefault(); navigate('/collections'); }}
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
            >
              Browse Collections Online <ArrowRight size={15} />
            </a>
            <a
              href="/request-quote"
              className="btn btn-outline btn-lg"
              onClick={(e) => { e.preventDefault(); navigate('/request-quote'); }}
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
            >
              Request Wholesale Quote
            </a>
          </div>

          {/* Featured Collections in Catalogue (Internal Linking & Content richness) */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '3rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 2.5vw, 1.8rem)', fontWeight: 500, letterSpacing: '0.01em', marginBottom: '0.5rem' }}>
                Collections Featured in this Catalogue
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                Explore any of the {displayCollections.length} door series online with complete technical specifications and elevation models.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1rem',
            }}>
              {displayCollections.map(item => (
                <a
                  key={item.slug}
                  href={`/collections/${item.slug}`}
                  onClick={(e) => { e.preventDefault(); navigate(`/collections/${item.slug}`); }}
                  style={{
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    textDecoration: 'none',
                    color: 'inherit',
                    transition: 'var(--transition-smooth)',
                    display: 'block'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-gold)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.92rem', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{item.name}</span>
                    <ArrowRight size={13} style={{ color: 'var(--color-gold)' }} />
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {item.desc}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
