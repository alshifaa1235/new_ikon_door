import React, { useEffect } from 'react';
import { useNav } from '../App';
import { useSite } from '../context/SiteContext';
import { setSEO } from '../services/seo';
import { Cpu, Droplets, ShieldCheck, Layers, ArrowRight, MessageSquare, Phone, ChevronRight } from 'lucide-react';

export default function AboutPage() {
  const { navigate } = useNav();
  const { settings, collections, usps } = useSite();

  const getUspIcon = (iconName) => {
    switch (iconName) {
      case 'Droplets': return <Droplets size={28} />;
      case 'Layers': return <Layers size={28} />;
      case 'ShieldCheck': return <ShieldCheck size={28} />;
      case 'Cpu':
      default: return <Cpu size={28} />;
    }
  };

  useEffect(() => {
    setSEO({
      title: 'About New Ikon Doors | Door Manufacturer in Trichy',
      description: 'Learn about New Ikon Doors & Ply in Trichy, Tamil Nadu. Automated CNC routing, vacuum membrane fusion, kiln-seasoned hardwood cores, and wholesale distribution.',
      canonical: '/about',
      structuredData: {
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
            'name': 'About',
            'item': 'https://www.newikondoors.co.in/about'
          }
        ]
      }
    });
  }, []);

  return (
    <div style={{ paddingTop: 'calc(var(--topbar-height) + var(--nav-height))' }}>
      {/* Hero */}
      <section style={{ background: 'var(--bg-dark)', color: 'var(--text-inverse)', padding: 'clamp(4rem, 8vw, 6rem) 0', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: 700 }}>
          {/* Breadcrumbs */}
          <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginBottom: '1.25rem' }}>
            <a href="/" onClick={e => { e.preventDefault(); navigate('/'); }} style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Home</a>
            <ChevronRight size={12} />
            <span style={{ color: '#fff' }}>About</span>
          </nav>

          <div className="section-eyebrow" style={{ justifyContent: 'center', color: 'var(--color-gold-light)' }}>About New Ikon</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 500, letterSpacing: '0.02em', marginBottom: '1.25rem' }}>
            About New Ikon Doors
          </h1>
          <p style={{ color: 'var(--text-inverse-muted)', lineHeight: 1.75, fontSize: '1.05rem' }}>
            {settings.specialization || 'Dealers in PVC, Teak, Rubber Wood, Mica, Plywoods'}. {settings.machinery || 'High-Precision CNC Automated Routing & Vacuum Membrane Technology'}.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="section-py" style={{ background: 'var(--bg-primary)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'clamp(2rem, 4vw, 4rem)', alignItems: 'center' }}>
            <div className="card-image-zoom" style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', aspectRatio: '4/3' }}>
              <img src="/doors/doors_manufacturing_plant.jpg" alt="New Ikon Doors manufacturing plant and CNC routing facility in Trichy" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <div className="section-eyebrow">Our Heritage</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 500, marginBottom: '1.25rem', letterSpacing: '0.02em' }}>
                Manufacturing & wholesale HQ — {settings?.hq_city || 'Trichy, Tamil Nadu'}.
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: '1.25rem' }}>
                New Ikon Doors & Ply is a manufacturing and wholesale headquarters specializing in premium door solutions. Our in-house facility utilizes computerized CNC routing and vacuum-bonded membrane technology to produce doors with architectural precision and lasting quality.
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: '1.75rem' }}>
                With over 130 catalogue elevations across {collections?.length || 10} curated collections — from UV high-gloss membrane to solid teak — we serve architects, builders, dealers, and interior designers across Tamil Nadu and beyond.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <a
                  href="/collections"
                  className="btn btn-dark"
                  onClick={(e) => { e.preventDefault(); navigate('/collections'); }}
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                >
                  Explore Collections <ArrowRight size={14} />
                </a>
                <a
                  href="/contact"
                  className="btn btn-outline"
                  onClick={(e) => { e.preventDefault(); navigate('/contact'); }}
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                >
                  Contact Showroom Team
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section-py" style={{ background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 3rem' }}>
            <div className="section-eyebrow" style={{ justifyContent: 'center' }}>Why New Ikon</div>
            <h2 className="section-title">Quality. Design. Material. Range.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {(usps || []).map((f, i) => (
              <div key={f.id || i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '2rem 1.75rem' }}>
                <div style={{ color: 'var(--color-gold)', marginBottom: '1.25rem' }}>{getUspIcon(f.icon)}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 500, marginBottom: '0.65rem', letterSpacing: '0.01em' }}>{f.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>{f.description || f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Group Divisions */}
      <section className="section-py" style={{ background: 'var(--bg-dark)', color: 'var(--text-inverse)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: 700 }}>
          <div className="section-eyebrow" style={{ justifyContent: 'center', color: 'var(--color-gold-light)' }}>Our Group</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 500, letterSpacing: '0.02em', marginBottom: '1.5rem' }}>
            Three divisions. One group.
          </h2>
          <p style={{ color: 'var(--text-inverse-muted)', lineHeight: 1.75, marginBottom: '2.5rem' }}>
            New Ikon Doors & Ply works in direct coordination with Classic Ply & Lam (wholesale plywoods & substrates) and Royal Lam & Ply (laminates, WPVC & edge banding) for comprehensive trade supply across Tamil Nadu.
          </p>
          <a
            href="/branches"
            className="btn btn-gold"
            onClick={(e) => { e.preventDefault(); navigate('/branches'); }}
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
          >
            Visit Our Branches <ArrowRight size={14} />
          </a>
        </div>
      </section>

      {/* CTA */}
      <section className="section-py" style={{ background: 'var(--bg-primary)', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: 600 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 500, marginBottom: '1rem' }}>
            Let's discuss your project.
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.7 }}>
            Whether you're an architect, builder, or interior designer — our Trichy team is here to assist with technical specs and wholesale orders.
          </p>
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
