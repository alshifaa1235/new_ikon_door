import React, { useState, useEffect } from 'react';
import { useNav } from '../App';
import { useSite } from '../context/SiteContext';
import { api } from '../services/api';
import { setSEO } from '../services/seo';
import { ArrowLeft, ArrowRight, ArrowUpRight, MessageSquare, Phone, ChevronRight, ShoppingBag, ZoomIn, CheckCircle2 } from 'lucide-react';

export default function ProductDetailPage({ code }) {
  const { navigate, addToQuote } = useNav();
  const { settings } = useSite();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageZoomed, setImageZoomed] = useState(false);

  const phone = settings?.phone || '+91 98424 45353';
  const whatsapp = (settings?.whatsapp || '919842445353').replace(/[^0-9]/g, '');

  useEffect(() => {
    const loadProduct = () => {
      api.getProduct(code).then(data => {
        setProduct(data);
        setRelated(data.related || []);

        const productSlug = (data.code || '').replace(/\s+/g, '-');
        const collectionName = data.collection_name || 'Architectural Door';
        const collectionSlug = data.collection_slug || 'collections';

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
              'name': 'Collections',
              'item': 'https://newikondoors.com/collections'
            },
            {
              '@type': 'ListItem',
              'position': 3,
              'name': collectionName,
              'item': `https://newikondoors.com/collections/${collectionSlug}`
            },
            {
              '@type': 'ListItem',
              'position': 4,
              'name': data.code,
              'item': `https://newikondoors.com/product/${productSlug}`
            }
          ]
        };

        const imageUrl = data.image?.startsWith('http')
          ? data.image
          : `https://newikondoors.com${data.image?.startsWith('/') ? data.image : `/doors/${data.image}`}`;

        const productSchema = {
          '@context': 'https://schema.org',
          '@type': 'Product',
          'name': `New Ikon ${data.code} ${collectionName}`,
          'image': [imageUrl],
          'description': data.short_description || `Elevation ${data.code} from the ${collectionName} series by New Ikon Doors. Kiln-seasoned hardwood core with CNC precision routing in Trichy, Tamil Nadu.`,
          'sku': data.code,
          'mpn': data.code,
          'brand': {
            '@type': 'Brand',
            'name': 'New Ikon Doors'
          },
          'manufacturer': {
            '@type': 'Organization',
            'name': 'New Ikon Doors',
            'url': 'https://newikondoors.com/'
          },
          'url': `https://newikondoors.com/product/${productSlug}`
        };

        setSEO({
          title: `${data.code} ${collectionName} | New Ikon Doors Trichy`,
          description: `${data.code} from the ${collectionName} collection. Precision CNC manufactured with kiln-seasoned hardwood core by New Ikon Doors in Trichy, Tamil Nadu.`,
          canonical: `/product/${productSlug}`,
          image: data.image?.startsWith('/') ? data.image : `/doors/${data.image}`,
          structuredData: [breadcrumbSchema, productSchema]
        });
        setLoading(false);
      }).catch(() => setLoading(false));
    };

    setLoading(true);
    loadProduct();

    window.addEventListener('nid:data-changed', loadProduct);
    window.addEventListener('focus', loadProduct);

    return () => {
      window.removeEventListener('nid:data-changed', loadProduct);
      window.removeEventListener('focus', loadProduct);
    };
  }, [code]);

  if (loading) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 'calc(var(--topbar-height) + var(--nav-height))' }}>
      <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ width: 32, height: 32, border: '2px solid var(--border-light)', borderTopColor: 'var(--color-gold)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
        Loading product...
      </div>
    </div>
  );

  if (!product) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 'calc(var(--topbar-height) + var(--nav-height))' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginBottom: '1rem' }}>Product not found</h2>
        <a href="/collections" className="btn btn-dark" onClick={(e) => { e.preventDefault(); navigate('/collections'); }}>
          Browse Collections
        </a>
      </div>
    </div>
  );

  const parsedSpecs = typeof product.specs === 'string'
    ? (() => { try { return JSON.parse(product.specs); } catch { return {}; } })()
    : (product.specs || {});

  const specs = {
    ...((product.material || product.core_material) ? { 'Material': product.material || product.core_material } : {}),
    ...((product.surface_finish || product.finish) ? { 'Surface Finish': product.surface_finish || product.finish } : {}),
    ...((product.standard_sizes || product.thickness) ? { 'Standard Sizes / Thickness': product.standard_sizes || product.thickness } : {}),
    ...((product.applications || product.application) ? { 'Applications': product.applications || product.application } : {}),
    ...parsedSpecs,
  };

  let features = [];
  if (Array.isArray(product.features)) {
    features = product.features;
  } else if (typeof product.features === 'string') {
    try {
      const parsed = JSON.parse(product.features);
      if (Array.isArray(parsed)) features = parsed;
      else features = product.features.split(',').map(s => s.trim()).filter(Boolean);
    } catch {
      features = product.features.split(',').map(s => s.trim()).filter(Boolean);
    }
  }

  const whatsappMsg = `Hi New Ikon Doors, I'm interested in ${product.code} from the ${product.collection_name || ''} collection. Can you share pricing and availability?`;

  return (
    <div style={{ paddingTop: 'calc(var(--topbar-height) + var(--nav-height))' }}>
      {/* Breadcrumb */}
      <div className="container" style={{ padding: '1.25rem clamp(1.25rem, 4vw, 2.5rem)' }}>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          <a href="/" onClick={e => { e.preventDefault(); navigate('/'); }} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</a>
          <ChevronRight size={12} />
          <a href="/collections" onClick={e => { e.preventDefault(); navigate('/collections'); }} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Collections</a>
          {product.collection_slug && (
            <>
              <ChevronRight size={12} />
              <a href={`/collections/${product.collection_slug}`} onClick={e => { e.preventDefault(); navigate(`/collections/${product.collection_slug}`); }} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
                {product.collection_name}
              </a>
            </>
          )}
          <ChevronRight size={12} />
          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{product.code}</span>
        </nav>
      </div>

      {/* Main Product Section */}
      <section className="container" style={{ paddingBottom: 'clamp(3rem, 6vw, 5rem)' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'clamp(2rem, 4vw, 4rem)',
          alignItems: 'start',
        }}>
          {/* Product Image */}
          <div style={{ position: 'sticky', top: 'calc(var(--nav-height-scrolled) + 1.5rem)' }}>
            <div
              style={{
                background: 'linear-gradient(180deg, #FAF9F7 0%, #EFECE6 100%)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                position: 'relative',
                cursor: 'zoom-in',
                minHeight: 520,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem 1.5rem',
                border: '1px solid var(--border-subtle)',
              }}
              onClick={() => setImageZoomed(!imageZoomed)}
            >
              <img
                src={product.image?.startsWith('/') ? product.image : `/doors/${product.image}`}
                alt={`New Ikon ${product.code} ${product.collection_name} Elevation`}
                style={{
                  maxHeight: '100%',
                  maxWidth: '100%',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                  display: 'block',
                  borderRadius: 2,
                  filter: 'drop-shadow(0 12px 32px rgba(0,0,0,0.18))',
                  transition: 'transform 0.5s var(--ease-out-expo)',
                  transform: imageZoomed ? 'scale(1.35)' : 'scale(1)',
                }}
              />
              <div style={{
                position: 'absolute',
                bottom: '1rem',
                right: '1rem',
                background: 'rgba(0,0,0,0.5)',
                color: '#fff',
                width: 36,
                height: 36,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <ZoomIn size={16} />
              </div>
            </div>

            {/* Lifestyle image if available */}
            {product.lifestyle_image && (
              <div style={{
                marginTop: '1rem',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                aspectRatio: '16/9',
              }}>
                <img
                  src={product.lifestyle_image}
                  alt={product.lifestyle_title || `New Ikon ${product.code} Architectural Elevation`}
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
            )}
          </div>

          {/* Product Details */}
          <div>
            {/* Collection Badge */}
            <a
              href={`/collections/${product.collection_slug}`}
              onClick={(e) => { e.preventDefault(); product.collection_slug && navigate(`/collections/${product.collection_slug}`); }}
              style={{
                display: 'inline-block',
                padding: '0.3rem 0.85rem',
                borderRadius: 'var(--radius-pill)',
                background: 'var(--color-gold-subtle)',
                color: 'var(--color-gold-dark)',
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: '0.75rem',
                textDecoration: 'none',
                cursor: 'pointer',
              }}
            >
              {product.collection_name || 'Collection'} • Trichy, Tamil Nadu
            </a>

            {/* Product Code as primary H1 */}
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 500,
              letterSpacing: '0.02em',
              marginBottom: '0.5rem',
            }}>
              {product.code}
            </h1>

            <p style={{
              fontSize: '0.95rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
              marginBottom: '2rem',
              maxWidth: 500,
            }}>
              {product.short_description || product.name || `${product.collection_name} — precision CNC routed elevation manufactured with kiln-seasoned hardwood core by New Ikon Doors in Trichy, Tamil Nadu.`}
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
              <button className="btn btn-gold btn-lg" onClick={() => addToQuote(product)}>
                <ShoppingBag size={15} /> Request a Quote
              </button>
              <a
                href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(whatsappMsg)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-lg"
                style={{ textDecoration: 'none', color: 'var(--text-primary)' }}
              >
                <MessageSquare size={15} /> WhatsApp Enquiry
              </a>
            </div>

            {/* Features List */}
            {features.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  color: 'var(--color-gold-dark)',
                  marginBottom: '0.75rem',
                }}>
                  Key Features
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
                  {features.map((feat, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <CheckCircle2 size={14} style={{ color: 'var(--color-gold)', flexShrink: 0 }} />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Specifications Table */}
            {Object.keys(specs).length > 0 && (
              <div style={{ marginBottom: '2.5rem' }}>
                <h2 style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  color: 'var(--color-gold-dark)',
                  marginBottom: '1rem',
                  paddingBottom: '0.5rem',
                  borderBottom: '1px solid var(--border-light)',
                }}>
                  Technical Specifications & Core Construction
                </h2>
                <div>
                  {Object.entries(specs).map(([key, value]) => (
                    <div key={key} style={{
                      display: 'grid',
                      gridTemplateColumns: '160px 1fr',
                      gap: '1rem',
                      padding: '0.65rem 0',
                      borderBottom: '1px solid var(--border-subtle)',
                      fontSize: '0.85rem',
                    }}>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{key}</span>
                      <span style={{ color: 'var(--text-primary)' }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Contact */}
            <div style={{
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              border: '1px solid var(--border-subtle)',
            }}>
              <h3 style={{ fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.5rem' }}>Need Technical Guidance?</h3>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
                Call our Trichy showroom team for sizing assistance, core substrate options, and bulk trade pricing.
              </div>
              <a
                href={`tel:${phone.replace(/[^0-9+]/g, '')}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none' }}
              >
                <Phone size={15} /> {phone}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section style={{ background: 'var(--bg-secondary)' }} className="section-py">
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div className="section-eyebrow">More from this collection</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 2.5vw, 1.8rem)', fontWeight: 500, letterSpacing: '0.01em' }}>
                  Related Elevations in {product.collection_name}
                </h2>
              </div>
              {product.collection_slug && (
                <a
                  href={`/collections/${product.collection_slug}`}
                  className="btn btn-outline btn-sm"
                  onClick={(e) => { e.preventDefault(); navigate(`/collections/${product.collection_slug}`); }}
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                >
                  View All <ArrowRight size={13} />
                </a>
              )}
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '1.25rem',
            }}>
              {related.map((rel, i) => (
                <a
                  key={rel.code || i}
                  href={`/product/${(rel.code || '').replace(/\s+/g, '-')}`}
                  className="card-image-zoom"
                  onClick={(e) => { e.preventDefault(); navigate(`/product/${(rel.code || '').replace(/\s+/g, '-')}`); }}
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
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 10px 24px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-3px)'; const img = e.currentTarget.querySelector('img'); if (img) img.style.transform = 'scale(1.03)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; const img = e.currentTarget.querySelector('img'); if (img) img.style.transform = 'scale(1)'; }}
                >
                  <div style={{
                    height: 280,
                    background: 'linear-gradient(180deg, #FAF9F7 0%, #F1EFEA 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem',
                    overflow: 'hidden',
                  }}>
                    <img
                      src={rel.image?.startsWith('/') ? rel.image : `/doors/${rel.image}`}
                      alt={`New Ikon ${rel.code} ${product.collection_name || 'Door Elevation'}`}
                      loading="lazy"
                      style={{
                        maxHeight: '100%',
                        maxWidth: '100%',
                        width: 'auto',
                        height: 'auto',
                        objectFit: 'contain',
                        display: 'block',
                        borderRadius: 2,
                        filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.12))',
                        transition: 'transform 0.4s ease',
                      }}
                    />
                  </div>
                  <div style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{rel.code}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-gold-dark)', fontWeight: 500, letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                      View <ArrowUpRight size={11} />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
