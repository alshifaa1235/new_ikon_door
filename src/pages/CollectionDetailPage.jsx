import React, { useState, useEffect } from 'react';
import { useNav } from '../App';
import { useSite } from '../context/SiteContext';
import { api } from '../services/api';
import { setSEO } from '../services/seo';
import { ArrowRight, ArrowUpRight, ChevronRight, ShoppingBag, Phone, MessageSquare } from 'lucide-react';

export default function CollectionDetailPage({ slug }) {
  const { navigate, addToQuote } = useNav();
  const { settings } = useSite();
  const [collection, setCollection] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const whatsapp = (settings?.whatsapp || '919842445353').replace(/[^0-9]/g, '');

  useEffect(() => {
    const loadCollection = () => {
      api.getCollection(slug).then(data => {
        setCollection(data);
        const prods = data.products || [];
        setProducts(prods);

        const breadcrumbSchema = {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': [
            {
              '@type': 'ListItem',
              'position': 1,
              'name': 'Home',
              'item': 'https://www.newikondoors.co.in/'
            },
            {
              '@type': 'ListItem',
              'position': 2,
              'name': 'Collections',
              'item': 'https://www.newikondoors.co.in/collections'
            },
            {
              '@type': 'ListItem',
              'position': 3,
              'name': data.name || slug,
              'item': `https://www.newikondoors.co.in/collections/${slug}`
            }
          ]
        };

        const itemListSchema = {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          'name': `${data.name || slug} Collection`,
          'numberOfItems': prods.length,
          'itemListElement': prods.slice(0, 30).map((p, idx) => ({
            '@type': 'ListItem',
            'position': idx + 1,
            'name': `New Ikon ${p.code}`,
            'url': `https://www.newikondoors.co.in/product/${(p.code || '').replace(/\s+/g, '-')}`
          }))
        };

        setSEO({
          title: `${data.name || slug} in Trichy | New Ikon Doors`,
          description: `Explore ${data.name || slug} by New Ikon Doors in Trichy, Tamil Nadu. ${data.description || data.tagline || 'High-precision architectural door designs.'} Seasoned hardwood core & CNC precision.`,
          canonical: `/collections/${slug}`,
          image: data.hero_image,
          structuredData: [breadcrumbSchema, itemListSchema]
        });
        setLoading(false);
      }).catch(() => setLoading(false));
    };

    setLoading(true);
    loadCollection();

    window.addEventListener('nid:data-changed', loadCollection);
    window.addEventListener('focus', loadCollection);

    return () => {
      window.removeEventListener('nid:data-changed', loadCollection);
      window.removeEventListener('focus', loadCollection);
    };
  }, [slug]);

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 'calc(var(--topbar-height) + var(--nav-height))' }}>
      <div style={{ color: 'var(--text-muted)' }}>Loading collection...</div>
    </div>
  );

  if (!collection) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 'calc(var(--topbar-height) + var(--nav-height))' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '1rem' }}>Collection not found</h2>
        <a href="/collections" className="btn btn-dark" onClick={(e) => { e.preventDefault(); navigate('/collections'); }}>
          View All Collections
        </a>
      </div>
    </div>
  );

  return (
    <div style={{ paddingTop: 'calc(var(--topbar-height) + var(--nav-height))' }}>
      {/* Collection Hero */}
      {(() => {
        const rawDoor = collection.hero_image || (products[0]?.image) || '/doors/door_p03_01.jpg';
        const featuredDoor = rawDoor.startsWith('/') || rawDoor.startsWith('http') ? rawDoor : `/doors/${rawDoor}`;
        return (
          <section style={{
            position: 'relative',
            minHeight: 380,
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
            background: 'radial-gradient(ellipse at 78% 50%, rgba(184, 134, 11, 0.16) 0%, rgba(18, 17, 15, 0.96) 55%, #0a0a0a 100%)',
          }}>
            {/* Subtle atmospheric ambient glow from featured door */}
            <div style={{
              position: 'absolute',
              right: '8%',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '320px',
              height: '320px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(184, 134, 11, 0.22) 0%, transparent 70%)',
              filter: 'blur(45px)',
              pointerEvents: 'none',
              zIndex: 1,
            }} />

            <div className="container" style={{
              position: 'relative',
              zIndex: 2,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '2.5rem',
              paddingTop: '2.5rem',
              paddingBottom: '2.5rem',
            }}>
              {/* Left Column: Collection Info */}
              <div style={{ maxWidth: 640 }}>
                {/* Breadcrumb */}
                <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem' }}>
                  <a href="/" onClick={e => { e.preventDefault(); navigate('/'); }} style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Home</a>
                  <ChevronRight size={12} />
                  <a href="/collections" onClick={e => { e.preventDefault(); navigate('/collections'); }} style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Collections</a>
                  <ChevronRight size={12} />
                  <span style={{ color: '#fff' }}>{collection.name}</span>
                </nav>

                <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--color-gold-light)', marginBottom: '0.5rem' }}>
                  {collection.category || 'Door Collection'} • Trichy, Tamil Nadu
                </div>
                <h1 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(2rem, 4vw, 3rem)',
                  fontWeight: 500,
                  letterSpacing: '0.02em',
                  marginBottom: '1rem',
                  lineHeight: 1.15,
                }}>
                  {collection.name}
                </h1>
                <p style={{ maxWidth: 580, color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, fontSize: '0.95rem' }}>
                  {collection.description || collection.tagline || ''}
                </p>
                <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.65)' }}>
                    {products.length} live catalogue elevation{products.length !== 1 ? 's' : ''} on display at our Trichy showroom
                  </div>
                  <span style={{ color: 'var(--color-gold)' }}>•</span>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-gold-light)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    100% Solid Core Construction
                  </div>
                </div>
              </div>

              {/* Right Column: Single Specific Showcase Door Elevation */}
              <div className="hide-mobile" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}>
                <div style={{
                  position: 'relative',
                  height: '310px',
                  width: '160px',
                  filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.85)) drop-shadow(0 0 15px rgba(184,134,11,0.2))',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  background: '#151412',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}>
                  <img
                    src={featuredDoor}
                    alt={`New Ikon ${collection.name} Signature Door Elevation`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      display: 'block',
                    }}
                  />
                </div>
                <span style={{
                  marginTop: '0.65rem',
                  fontSize: '0.68rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.5)',
                  fontWeight: 500,
                }}>
                  Signature Elevation
                </span>
              </div>
            </div>
          </section>
        );
      })()}

      {/* Collection Specs Bar */}
      {(collection.material || collection.finish || collection.thickness) && (
        <div style={{ background: 'var(--bg-dark-surface)', color: 'var(--text-inverse)' }}>
          <div className="container" style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '2rem',
            padding: '1.25rem clamp(1.25rem, 4vw, 2.5rem)',
          }}>
            {collection.material && (
              <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-gold-light)', marginBottom: '0.2rem' }}>Material</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-inverse-muted)' }}>{collection.material}</div>
              </div>
            )}
            {collection.finish && (
              <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-gold-light)', marginBottom: '0.2rem' }}>Finish</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-inverse-muted)' }}>{collection.finish}</div>
              </div>
            )}
            {collection.thickness && (
              <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-gold-light)', marginBottom: '0.2rem' }}>Thickness</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-inverse-muted)' }}>{collection.thickness}</div>
              </div>
            )}
            {collection.application && (
              <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-gold-light)', marginBottom: '0.2rem' }}>Application</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-inverse-muted)' }}>{collection.application}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Product Grid Section */}
      <section className="section-py" style={{ background: 'var(--bg-primary)' }}>
        <div className="container">
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 2.5vw, 1.8rem)', fontWeight: 500, letterSpacing: '0.01em', marginBottom: '0.35rem' }}>
              Door Elevations in this Collection
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              Precision CNC routed elevations available in custom architectural dimensions.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '1.25rem',
          }}>
            {products.map((product, i) => (
              <a
                key={product.code || i}
                href={`/product/${(product.code || '').replace(/\s+/g, '-')}`}
                className="card-image-zoom"
                onClick={(e) => { e.preventDefault(); navigate(`/product/${(product.code || '').replace(/\s+/g, '-')}`); }}
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
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-3px)'; const img = e.currentTarget.querySelector('img'); if (img) img.style.transform = 'scale(1.03)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; const img = e.currentTarget.querySelector('img'); if (img) img.style.transform = 'scale(1)'; }}
              >
                <div style={{
                  height: 380,
                  background: 'linear-gradient(180deg, #FAF9F7 0%, #F1EFEA 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1.25rem 1rem',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  <img
                    src={product.image?.startsWith('/') ? product.image : `/doors/${product.image}`}
                    alt={`New Ikon ${product.code} ${collection.name} Door Elevation`}
                    loading="lazy"
                    style={{
                      maxHeight: '100%',
                      maxWidth: '100%',
                      width: 'auto',
                      height: 'auto',
                      objectFit: 'contain',
                      display: 'block',
                      borderRadius: 2,
                      filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.14))',
                      transition: 'transform 0.4s ease',
                    }}
                  />
                </div>
                <div style={{ padding: '0.85rem 1rem' }}>
                  <div style={{ fontSize: '0.92rem', fontWeight: 600, marginBottom: '0.35rem' }}>{product.code}</div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-gold-dark)', fontWeight: 500, letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      View Elevation <ArrowUpRight size={11} />
                    </span>
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToQuote(product); }}
                      style={{
                        background: 'none',
                        border: '1px solid var(--border-light)',
                        borderRadius: '50%',
                        width: 30,
                        height: 30,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'var(--transition-fast)',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-gold)'; e.currentTarget.style.color = 'var(--color-gold)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.color = 'inherit'; }}
                      title="Add to Quote"
                    >
                      <ShoppingBag size={13} />
                    </button>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Collection Engineering & Application Details */}
      <section className="section-py" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container" style={{ maxWidth: 840 }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div className="section-eyebrow" style={{ justifyContent: 'center' }}>Specifications & Applications</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 500, letterSpacing: '0.01em', marginBottom: '1rem' }}>
              Crafted for Architectural Performance
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              Every {collection.name} is manufactured in our Tanjore Road HQ using seasoned hardwood cores and advanced polymer membrane bonding designed to resist humidity and termite attack.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            <div style={{ background: 'var(--bg-card)', padding: '1.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Standard & Custom Sizing</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                Available in standard sizes (81" x 30", 81" x 32", 81" x 36", 84" x 36") with full custom dimensions supported for villa and apartment projects.
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', padding: '1.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Recommended Applications</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                {collection.application || 'Living rooms, master bedrooms, executive cabins, and luxury internal room entrances.'}
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '3rem', display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="/request-quote"
              className="btn btn-dark"
              onClick={(e) => { e.preventDefault(); navigate('/request-quote'); }}
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
            >
              Request a Wholesale Quote <ArrowRight size={14} />
            </a>
            <a
              href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Hi New Ikon Doors, I have an enquiry regarding the ${collection.name} collection.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <MessageSquare size={14} /> WhatsApp Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
