import React from 'react';
import { useNav } from '../App';
import { useSite } from '../context/SiteContext';
import { ArrowRight, Phone, Mail, MapPin, MessageSquare } from 'lucide-react';

const FALLBACK_COLLECTIONS = [
  { label: 'UV Membrane Doors', slug: 'uv-membrane' },
  { label: 'Marble Membrane Doors', slug: 'marble-membrane' },
  { label: 'Steel Patti Doors', slug: 'steel-patti' },
  { label: 'Mica Laminate Doors', slug: 'mica-doors' },
  { label: 'Plain Membrane Doors', slug: 'plain-membrane' },
  { label: 'Micro Coating Doors', slug: 'micro-coating' },
  { label: 'WPVC Digital Doors', slug: 'wpvc-digital' },
  { label: 'Rubber Wood Doors', slug: 'rubber-wood' },
  { label: '3D Membrane Doors', slug: '3d-membrane' },
  { label: 'Kumil Membrane Doors', slug: 'kumil-membrane' },
];

const FOOTER_LINKS = [
  { label: 'About', path: '/about' },
  { label: 'Testimonials', path: '/testimonials' },
  { label: 'Branches', path: '/branches' },
  { label: 'Catalogue', path: '/catalogue' },
  { label: 'Contact', path: '/contact' },
  { label: 'Request Quote', path: '/request-quote' },
];

export default function Footer() {
  const { navigate } = useNav();
  const { settings, collections } = useSite();
  const year = new Date().getFullYear();

  const phone = settings?.phone || '+91 98424 45353';
  const email = settings?.email || 'abbas43353@gmail.com';
  const whatsapp = (settings?.whatsapp || '919842445353').replace(/[^0-9]/g, '');
  const address = settings?.address || 'Plot No. 45 C/A1, Thanjavur Road, Near Mariyamman Kovil Bus Stop, Tharanallur, Trichy - 620008';
  const timings = settings?.timings || 'Mon – Sat: 9:00 AM – 8:30 PM';
  const hqCity = settings?.hq_city || 'Trichy, Tamil Nadu';
  const specialization = settings?.specialization || 'Dealers in PVC, Teak, Rubber Wood, Mica, and Plywoods. High-precision CNC automated routing & vacuum membrane technology.';

  const displayCollections = (collections && collections.length > 0)
    ? collections.map(c => ({
        label: c.name?.endsWith('Doors') ? c.name : `${c.name} Doors`,
        slug: c.slug
      }))
    : FALLBACK_COLLECTIONS;

  const Link = ({ path, children, style = {} }) => (
    <a
      href={path}
      onClick={e => { e.preventDefault(); navigate(path); }}
      style={{
        color: 'var(--text-inverse-muted)',
        textDecoration: 'none',
        fontSize: '0.88rem',
        transition: 'color 0.2s',
        display: 'block',
        lineHeight: 2,
        ...style,
      }}
      onMouseEnter={e => e.currentTarget.style.color = '#fff'}
      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-inverse-muted)'}
    >
      {children}
    </a>
  );

  return (
    <footer style={{ background: 'var(--bg-dark)', color: 'var(--text-inverse)' }}>
      {/* Pre-footer CTA */}
      <div style={{
        background: 'var(--bg-dark-surface)',
        borderBottom: '1px solid var(--border-dark)',
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
          padding: '2.5rem clamp(1.25rem, 4vw, 2.5rem)',
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)', fontWeight: 500, letterSpacing: '0.02em', marginBottom: '0.3rem' }}>
              Ready to elevate your space?
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-inverse-muted)' }}>
              Explore 130+ door elevations or speak to our design team.
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn btn-gold" onClick={() => navigate('/request-quote')}>
              Request Quote <ArrowRight size={14} />
            </button>
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-light"
              style={{ textDecoration: 'none' }}
            >
              <MessageSquare size={14} /> WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Grid */}
      <div className="container" style={{ padding: '3.5rem clamp(1.25rem, 4vw, 2.5rem) 2rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2.5rem',
        }}>
          {/* Brand Column */}
          <div style={{ maxWidth: 300 }}>
            <img src="/new_ikon_logo_white.png" alt="New Ikon Doors" width={158} height={38} style={{ height: 38, width: 158, aspectRatio: '158 / 38', marginBottom: '0.75rem', opacity: 0.95, objectFit: 'contain' }} />
            {settings?.tagline && (
              <p style={{ fontSize: '0.82rem', color: 'var(--color-gold-light)', letterSpacing: '0.03em', marginBottom: '0.85rem', fontWeight: 500 }}>
                {settings.tagline}
              </p>
            )}
            <p style={{ fontSize: '0.85rem', color: 'var(--text-inverse-muted)', lineHeight: 1.7, marginBottom: '1.25rem' }}>
              {specialization}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-inverse-muted)' }}>
              <Phone size={13} /> {phone}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-inverse-muted)', marginTop: '0.35rem' }}>
              <Mail size={13} /> {email}
            </div>
          </div>

          {/* Collections */}
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--color-gold-light)', marginBottom: '1rem' }}>
              Collections
            </div>
            {displayCollections.map(col => (
              <Link key={col.slug} path={`/collections/${col.slug}`}>{col.label}</Link>
            ))}
          </div>

          {/* Company */}
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--color-gold-light)', marginBottom: '1rem' }}>
              Company
            </div>
            {FOOTER_LINKS.map(link => (
              <Link key={link.path} path={link.path}>{link.label}</Link>
            ))}
          </div>

          {/* Showroom */}
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--color-gold-light)', marginBottom: '1rem' }}>
              Visit Our Showroom
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-inverse-muted)', lineHeight: 1.7, marginBottom: '0.75rem' }}>
              <MapPin size={14} style={{ flexShrink: 0, marginTop: 4 }} />
              <span>{address}</span>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-inverse-muted)' }}>
              {timings}
            </div>
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=New+Ikon+Doors+%26+Ply,+Thanjavur+Road,+Trichy"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: 'var(--color-gold)', textDecoration: 'none', marginTop: '0.5rem', fontWeight: 600, letterSpacing: '0.04em' }}
            >
              Get Directions <ArrowRight size={12} />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{
        borderTop: '1px solid var(--border-dark)',
        padding: '1.25rem clamp(1.25rem, 4vw, 2.5rem)',
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-inverse-muted)' }}>
            © {year} New Ikon Doors & Ply. All rights reserved.
          </div>
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)' }}>
            Manufacturing & Wholesale HQ — {hqCity}
          </div>
        </div>
      </div>
    </footer>
  );
}
