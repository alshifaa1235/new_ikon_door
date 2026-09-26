import React, { useState, useEffect, useRef } from 'react';
import { useNav } from '../App';
import { useSite } from '../context/SiteContext';
import { Menu, X, Phone, ChevronDown, ShoppingBag, ArrowRight } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Collections', path: '/collections', hasDropdown: true },
  { label: 'About', path: '/about' },
  { label: 'Testimonials', path: '/testimonials' },
  { label: 'Branches', path: '/branches' },
  { label: 'Catalogue', path: '/catalogue' },
  { label: 'Contact', path: '/contact' },
];

export default function Navbar({ currentPage, quoteCount }) {
  const { navigate, openQuote } = useNav();
  const { settings, collections } = useSite();
  const collectionLinks = collections && collections.length > 0
    ? collections.map(c => ({ label: c.name || c.slug, slug: c.slug }))
    : [
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
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // Close dropdown on click outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleNav = (path) => {
    navigate(path);
    setMobileOpen(false);
    setDropdownOpen(false);
  };

  const isHome = currentPage === 'home';
  const isTransparent = isHome && !scrolled;

  return (
    <>
      {/* ── Top Contact Bar ── */}
      <div style={{
        background: 'var(--bg-dark)',
        color: 'var(--text-inverse-muted)',
        fontSize: '0.72rem',
        fontWeight: 500,
        letterSpacing: '0.04em',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 'var(--topbar-height)',
        zIndex: 1001,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2rem',
        transform: scrolled ? 'translateY(-100%)' : 'translateY(0)',
        transition: 'transform 0.35s var(--ease-out-expo)',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Phone size={11} /> {settings.phone || '+91 98424 45353'}
        </span>
        <span className="hide-mobile" style={{ color: 'var(--color-gold-light)' }}>•</span>
        <span className="hide-mobile">{settings.company_name ? `${settings.company_name} — ` : ''}Manufacturing & Wholesale HQ — {settings.hq_city || 'Trichy, Tamil Nadu'}</span>
        <span className="hide-mobile" style={{ color: 'var(--color-gold-light)' }}>•</span>
        <span className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {settings.timings || 'Mon–Sat: 9AM – 8:30PM'}
        </span>
      </div>

      {/* ── Main Navigation ── */}
      <header style={{
        position: 'fixed',
        top: scrolled ? 0 : 'var(--topbar-height)',
        left: 0,
        right: 0,
        height: scrolled ? 'var(--nav-height-scrolled)' : 'var(--nav-height)',
        zIndex: 1000,
        background: isTransparent ? 'transparent' : '#fff',
        borderBottom: isTransparent ? 'none' : '1px solid var(--border-subtle)',
        transition: 'all 0.4s var(--ease-out-expo)',
        backdropFilter: !isTransparent ? 'blur(12px)' : 'none',
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '100%',
        }}>
          {/* Logo */}
          <a
            href="/"
            onClick={(e) => { e.preventDefault(); handleNav('/'); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              textDecoration: 'none',
              color: isTransparent ? '#fff' : 'var(--text-primary)',
              transition: 'color 0.3s',
            }}
          >
            <img
              src={isTransparent ? '/new_ikon_logo_white.png' : '/new_ikon_logo.png'}
              alt="New Ikon Doors"
              width={166}
              height={40}
              style={{ height: scrolled ? 36 : 42, width: 'auto', transition: 'height 0.3s', objectFit: 'contain' }}
            />
          </a>

          {/* Desktop Navigation */}
          <nav className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
            {NAV_LINKS.map(link => (
              <div
                key={link.path}
                ref={link.hasDropdown ? dropdownRef : null}
                style={{ position: 'relative' }}
                onMouseEnter={() => link.hasDropdown && setDropdownOpen(true)}
                onMouseLeave={() => link.hasDropdown && setDropdownOpen(false)}
              >
                <a
                  href={link.path}
                  onClick={(e) => {
                    e.preventDefault();
                    if (link.hasDropdown) { handleNav(link.path); }
                    else handleNav(link.path);
                  }}
                  style={{
                    padding: '0.5rem 0.85rem',
                    fontSize: '0.78rem',
                    fontWeight: 500,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: isTransparent ? 'rgba(255,255,255,0.85)' : 'var(--text-secondary)',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    position: 'relative',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = isTransparent ? '#fff' : 'var(--text-primary)'}
                  onMouseLeave={e => e.currentTarget.style.color = isTransparent ? 'rgba(255,255,255,0.85)' : 'var(--text-secondary)'}
                >
                  {link.label}
                  {link.hasDropdown && <ChevronDown size={13} style={{ transition: 'transform 0.3s', transform: dropdownOpen ? 'rotate(180deg)' : 'none' }} />}
                </a>

                {/* Dropdown */}
                {link.hasDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    minWidth: 260,
                    background: '#fff',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    border: '1px solid var(--border-subtle)',
                    padding: '0.5rem 0',
                    opacity: dropdownOpen ? 1 : 0,
                    pointerEvents: dropdownOpen ? 'auto' : 'none',
                    transform: dropdownOpen ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(-8px)',
                    transition: 'opacity 0.25s ease, transform 0.25s ease',
                    zIndex: 100,
                  }}>
                    {collectionLinks.map(col => (
                      <a
                        key={col.slug}
                        href={`/collections/${col.slug}`}
                        onClick={(e) => { e.preventDefault(); handleNav(`/collections/${col.slug}`); }}
                        style={{
                          display: 'block',
                          padding: '0.55rem 1.25rem',
                          fontSize: '0.82rem',
                          color: 'var(--text-secondary)',
                          textDecoration: 'none',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                      >
                        {col.label}
                      </a>
                    ))}
                    <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '0.35rem 0' }} />
                    <a
                      href="/collections"
                      onClick={(e) => { e.preventDefault(); handleNav('/collections'); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.55rem 1.25rem',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: 'var(--color-gold-dark)',
                        textDecoration: 'none',
                        letterSpacing: '0.04em',
                      }}
                    >
                      View All Collections <ArrowRight size={13} />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Quote Badge */}
            {quoteCount > 0 && (
              <button
                onClick={openQuote}
                style={{
                  position: 'relative',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: isTransparent ? '#fff' : 'var(--text-primary)',
                  padding: '0.4rem',
                }}
              >
                <ShoppingBag size={20} />
                <span style={{
                  position: 'absolute',
                  top: -2,
                  right: -4,
                  background: 'var(--color-gold)',
                  color: '#fff',
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>{quoteCount}</span>
              </button>
            )}

            {/* CTA */}
            <button
              className="btn btn-gold btn-sm hide-mobile"
              onClick={() => handleNav('/request-quote')}
              style={{ fontSize: '0.72rem', padding: '0.6rem 1.3rem' }}
            >
              Request Quote
            </button>

            {/* Mobile Toggle */}
            <button
              className="hide-desktop"
              onClick={() => setMobileOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: isTransparent ? '#fff' : 'var(--text-primary)',
                padding: '0.4rem',
              }}
              aria-label="Open Menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Drawer ── */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        pointerEvents: mobileOpen ? 'auto' : 'none',
      }}>
        {/* Backdrop */}
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            opacity: mobileOpen ? 1 : 0,
            transition: 'opacity 0.3s',
          }}
        />

        {/* Drawer Panel */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '85%',
          maxWidth: 380,
          height: '100%',
          background: '#fff',
          transform: mobileOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.4s var(--ease-out-expo)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
        }}>
          {/* Drawer Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
          }}>
            <img src="/new_ikon_logo.png" alt="New Ikon Doors" width={150} height={36} style={{ height: 36, width: 'auto', objectFit: 'contain' }} />
            <button
              onClick={() => setMobileOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.3rem' }}
              aria-label="Close Menu"
            >
              <X size={22} />
            </button>
          </div>

          {/* Drawer Links */}
          <nav style={{ flex: 1, padding: '1rem 0' }}>
            {NAV_LINKS.map(link => (
              <a
                key={link.path}
                href={link.path}
                onClick={(e) => { e.preventDefault(); handleNav(link.path); }}
                style={{
                  display: 'block',
                  padding: '0.9rem 1.75rem',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  textDecoration: 'none',
                  borderBottom: '1px solid var(--border-subtle)',
                  letterSpacing: '0.04em',
                }}
              >
                {link.label}
              </a>
            ))}

            {/* Collection Sub-links */}
            <div style={{ padding: '0.75rem 1.75rem 0.5rem', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
              Door Collections
            </div>
            {collectionLinks.map(col => (
              <a
                key={col.slug}
                href={`/collections/${col.slug}`}
                onClick={(e) => { e.preventDefault(); handleNav(`/collections/${col.slug}`); }}
                style={{
                  display: 'block',
                  padding: '0.6rem 2rem',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                }}
              >
                {col.label}
              </a>
            ))}
          </nav>

          {/* Drawer Footer */}
          <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
            <button
              className="btn btn-gold"
              onClick={() => handleNav('/request-quote')}
              style={{ width: '100%', marginBottom: '0.75rem' }}
            >
              Request a Quote
            </button>
            <a
              href={`https://wa.me/91${(settings.whatsapp || '9842445353').replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
              style={{ width: '100%', textDecoration: 'none', color: 'var(--text-primary)' }}
            >
              WhatsApp Us
            </a>
            <div style={{ marginTop: '1.25rem', fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              <Phone size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              {settings.phone || '+91 98424 45353'}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
