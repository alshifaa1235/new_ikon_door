import React, { useState, useEffect, useRef } from 'react';
import { useNav } from '../App';
import { useSite } from '../context/SiteContext';
import { setSEO } from '../services/seo';
import { ArrowRight, MessageSquare, Phone } from 'lucide-react';

// ── Intersection Observer Hook ──
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { el.classList.add('revealed'); obs.unobserve(el); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return ref;
}

function RevealDiv({ className = 'reveal', delay = 0, children, style = {} }) {
  const ref = useReveal();
  return <div ref={ref} className={className} style={{ transitionDelay: `${delay}s`, ...style }}>{children}</div>;
}

export default function HomePage() {
  const { navigate } = useNav();
  const { collections: siteCollections, homepageContent, settings } = useSite();
  const [heroLoaded, setHeroLoaded] = useState(false);

  useEffect(() => {
    setSEO({
      title: 'New Ikon Doors | Architectural Door Manufacturer & Wholesaler in Trichy',
      description: 'New Ikon Doors: Precision architectural door manufacturing in Trichy, Tamil Nadu. Wholesalers & manufacturers of UV Membrane, Marble Membrane, Steel Patti, Teak, and WPVC Doors.',
      canonical: '/'
    });
    setTimeout(() => setHeroLoaded(true), 100);
  }, []);

  const collections = siteCollections || [];
  const editorialCollections = collections.slice(0, 4);

  const heroBadge = homepageContent?.hero_badge || homepageContent?.hero?.badge || 'New Ikon Doors • Manufacturing & Wholesale HQ';
  const heroTitle = homepageContent?.hero_title || homepageContent?.hero?.title || 'Doors that define the space.';
  const heroSubtitle = homepageContent?.hero_subtitle || homepageContent?.hero?.subtitle || '';
  const heroDesc = homepageContent?.hero_description || homepageContent?.hero?.description || 'Engineered with CNC precision, kiln-seasoned hardwood cores, and vacuum-bonded membrane technology. Wholesale door manufacturer and supplier in Trichy, Tamil Nadu.';
  const introStatement = homepageContent?.intro_statement || homepageContent?.intro?.statement || 'Premium doors designed to become part of the architecture.';
  const introDesc = homepageContent?.intro_description || homepageContent?.intro?.description || 'New Ikon Doors combines advanced CNC routing technology with traditional timber craftsmanship. Dealers in PVC, Teak, Rubber Wood, Mica, and Plywoods — serving architects, builders, and interior designers across Tamil Nadu.';

  const phone = settings?.phone || '+91 98424 45353';
  const whatsapp = (settings?.whatsapp || '919842445353').replace(/[^0-9]/g, '');

  return (
    <div>
      {/* ════════════════════════════════════════
          1. CINEMATIC HERO
          ════════════════════════════════════════ */}
      <section style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: '#0a0a0a',
      }}>
        {/* Video Background */}
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
        }}>
          <video
            autoPlay muted loop playsInline
            poster="/hero_door_poster.jpg"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: heroLoaded ? 0.55 : 0,
              transition: 'opacity 1.2s ease',
            }}
          >
            <source src="/hero_door_opening.webm" type="video/webm" />
            <source src="/hero_door_opening.mp4" type="video/mp4" />
          </video>
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)',
          }} />
        </div>

        {/* Hero Content */}
        <div className="container" style={{
          position: 'relative',
          zIndex: 2,
          textAlign: 'center',
          maxWidth: 800,
          paddingTop: 'calc(var(--topbar-height) + var(--nav-height))',
        }}>
          <div style={{
            opacity: heroLoaded ? 1 : 0,
            transform: heroLoaded ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s',
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.4rem 1.2rem',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid rgba(184,151,108,0.35)',
              background: 'rgba(184,151,108,0.08)',
              marginBottom: '2rem',
              fontSize: '0.72rem',
              fontWeight: 600,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--color-gold-light)',
            }}>
              {heroBadge}
            </div>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: 500,
            lineHeight: 1.08,
            color: '#fff',
            letterSpacing: '0.02em',
            marginBottom: '1.5rem',
            opacity: heroLoaded ? 1 : 0,
            transform: heroLoaded ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 0.5s',
          }}>
            {heroTitle}
            {heroSubtitle && heroSubtitle.trim() && heroSubtitle.trim() !== heroDesc.trim() && heroSubtitle.trim() !== heroTitle.trim() && (
              <>
                <br />
                <span style={{ fontSize: 'clamp(1.35rem, 3.2vw, 2.4rem)', color: 'rgba(255,255,255,0.85)', display: 'block', marginTop: '0.4rem', fontWeight: 400 }}>
                  {heroSubtitle}
                </span>
              </>
            )}
          </h1>

          <p style={{
            fontSize: 'clamp(0.95rem, 1.5vw, 1.15rem)',
            color: 'rgba(255,255,255,0.7)',
            lineHeight: 1.7,
            maxWidth: 580,
            margin: '0 auto 2.5rem',
            opacity: heroLoaded ? 1 : 0,
            transform: heroLoaded ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 0.7s',
          }}>
            {heroDesc}
          </p>

          <div style={{
            display: 'flex',
            gap: '0.85rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
            opacity: heroLoaded ? 1 : 0,
            transform: heroLoaded ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 0.9s',
          }}>
            <a
              href="/collections"
              className="btn btn-gold btn-lg"
              onClick={(e) => { e.preventDefault(); navigate('/collections'); }}
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
            >
              Explore Collections <ArrowRight size={15} />
            </a>
            <a
              href="/request-quote"
              className="btn btn-outline-light btn-lg"
              onClick={(e) => { e.preventDefault(); navigate('/request-quote'); }}
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
            >
              Request a Quote
            </a>
          </div>
        </div>

      </section>

      {/* ════════════════════════════════════════
          2. EDITORIAL INTRODUCTION
          ════════════════════════════════════════ */}
      <section className="section-py" style={{ background: 'var(--bg-primary)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: 800 }}>
          <RevealDiv>
            <div className="section-eyebrow" style={{ justifyContent: 'center' }}>The New Ikon Difference</div>
          </RevealDiv>
          <RevealDiv delay={0.1}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.6rem, 3.5vw, 2.6rem)',
              fontWeight: 500,
              lineHeight: 1.25,
              color: 'var(--text-primary)',
              letterSpacing: '0.02em',
              marginBottom: '1.5rem',
            }}>
              {introStatement}
            </h2>
          </RevealDiv>
          <RevealDiv delay={0.2}>
            <p className="section-desc" style={{ margin: '0 auto 2rem', textAlign: 'center' }}>
              {introDesc}
            </p>
          </RevealDiv>
          <RevealDiv delay={0.3}>
            <button className="btn btn-ghost" onClick={() => navigate('/about')}>
              Discover New Ikon <ArrowRight size={14} />
            </button>
          </RevealDiv>
        </div>
      </section>

      {/* ════════════════════════════════════════
          3. SHOWROOM DEPARTMENTS (Collections)
          ════════════════════════════════════════ */}
      <section style={{ background: 'var(--bg-secondary)', paddingTop: 'clamp(3rem, 6vw, 5rem)', paddingBottom: 'clamp(3rem, 6vw, 5rem)' }}>
        <div className="container">
          <RevealDiv>
            <div className="section-eyebrow">Our Collections</div>
            <h2 className="section-title">Step into the showroom.</h2>
            <p className="section-desc" style={{ marginBottom: '3rem' }}>
              Over 130 door elevations across {collections.length || 10} curated collections, from UV high-gloss to solid teak.
            </p>
          </RevealDiv>

          {/* Large alternating collection blocks */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(2rem, 5vw, 4rem)' }}>
            {editorialCollections.map((col, i) => {
              const isReversed = i % 2 === 1;
              return (
                <RevealDiv
                  key={col.slug || i}
                  delay={i * 0.1}
                  className={`editorial-grid ${isReversed ? 'is-reversed' : ''}`}
                >
                  {/* Image */}
                  <a
                    href={`/collections/${col.slug}`}
                    onClick={(e) => { e.preventDefault(); navigate(`/collections/${col.slug}`); }}
                    className="card-image-zoom editorial-img-col"
                    style={{
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      height: 'clamp(400px, 46vw, 520px)',
                      background: 'radial-gradient(circle at center, #24221f 0%, #0f0e0d 100%)',
                      border: '1px solid rgba(184, 151, 108, 0.25)',
                      boxShadow: '0 16px 36px rgba(0,0,0,0.14)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '1.25rem',
                      textDecoration: 'none',
                    }}
                  >
                    <img
                      src={col.hero_image || `/doors/lifestyle_page_${String(i + 3).padStart(2, '0')}.jpg`}
                      alt={`New Ikon ${col.name} Collection`}
                      loading="lazy"
                      style={{
                        maxHeight: '100%',
                        maxWidth: '100%',
                        width: 'auto',
                        height: 'auto',
                        objectFit: 'contain',
                        display: 'block',
                        filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.75)) drop-shadow(0 0 15px rgba(184,134,11,0.18))',
                        transition: 'transform 0.4s ease',
                      }}
                    />
                  </a>

                  {/* Text */}
                  <div className="editorial-txt-col" style={{ padding: 'clamp(0.5rem, 2vw, 1.5rem) 0' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--color-gold-dark)', marginBottom: '0.75rem' }}>
                      {col.category || 'Door Collection'}
                    </div>
                    <h3 style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'clamp(1.5rem, 2.8vw, 2.2rem)',
                      fontWeight: 500,
                      lineHeight: 1.2,
                      marginBottom: '1rem',
                      letterSpacing: '0.01em',
                    }}>
                      {col.name}
                    </h3>
                    <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem', maxWidth: 450 }}>
                      {col.description || col.tagline || ''}
                    </p>
                    <a
                      href={`/collections/${col.slug}`}
                      className="btn btn-dark"
                      onClick={(e) => { e.preventDefault(); navigate(`/collections/${col.slug}`); }}
                      style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                    >
                      Explore Collection <ArrowRight size={14} />
                    </a>
                  </div>
                </RevealDiv>
              );
            })}
          </div>

          {/* View All */}
          <RevealDiv style={{ textAlign: 'center', marginTop: '3rem' }}>
            <a
              href="/collections"
              className="btn btn-outline"
              onClick={(e) => { e.preventDefault(); navigate('/collections'); }}
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
            >
              View All {collections.length || 10} Collections <ArrowRight size={14} />
            </a>
          </RevealDiv>
        </div>
      </section>

      {/* ════════════════════════════════════════
          10. FINAL CONVERSION CTA
          ════════════════════════════════════════ */}
      <section className="section-py" style={{ background: 'var(--bg-primary)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: 650 }}>
          <RevealDiv>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
              fontWeight: 500,
              letterSpacing: '0.02em',
              lineHeight: 1.2,
              marginBottom: '1rem',
            }}>
              Looking for the right door?
            </h2>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '2.5rem' }}>
              Let's talk about your project. Whether you're an architect specifying doors for a villa or a builder ordering in bulk — we're here to help in Trichy and across Tamil Nadu.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a
                href="/request-quote"
                className="btn btn-dark btn-lg"
                onClick={(e) => { e.preventDefault(); navigate('/request-quote'); }}
                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
              >
                Request a Quote <ArrowRight size={15} />
              </a>
              <a
                href={`https://wa.me/${whatsapp}?text=${encodeURIComponent("Hi New Ikon Doors, I'm interested in your door collections.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-lg"
                style={{ textDecoration: 'none', color: 'var(--text-primary)' }}
              >
                <MessageSquare size={15} /> WhatsApp Us
              </a>
            </div>
            <div style={{ marginTop: '2rem', fontSize: '0.82rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              <Phone size={13} style={{ flexShrink: 0 }} />
              <span>Or call us directly: <strong style={{ color: 'var(--text-primary)' }}>{phone}</strong></span>
            </div>
          </RevealDiv>
        </div>
      </section>
    </div>
  );
}
