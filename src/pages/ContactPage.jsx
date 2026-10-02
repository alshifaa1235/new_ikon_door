import React, { useState, useEffect } from 'react';
import { useNav } from '../App';
import { useSite } from '../context/SiteContext';
import { api } from '../services/api';
import { setSEO } from '../services/seo';
import { Phone, Mail, MapPin, MessageSquare, Clock, Send, Check, ChevronRight } from 'lucide-react';

export default function ContactPage() {
  const { navigate } = useNav();
  const { settings } = useSite();
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '', customer_type: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const phone = settings?.phone || '+91 98424 45353';
  const email = settings?.email || 'abbas43353@gmail.com';
  const whatsapp = (settings?.whatsapp || '919842445353').replace(/[^0-9]/g, '');
  const address = settings?.address || 'Plot No. 45 C/A1, Thanjavur Road, Near Mariyamman Kovil Bus Stop, Tharanallur, Trichy - 620008, Tamil Nadu';
  const timings = settings?.timings || 'Mon – Sat: 9:00 AM – 8:30 PM';

  useEffect(() => {
    setSEO({
      title: 'Contact New Ikon Doors | Trichy',
      description: `Contact New Ikon Doors in Trichy, Tamil Nadu. Visit our showroom on Tanjore Road, call ${phone}, or send an enquiry for architectural doors.`,
      canonical: '/contact',
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
            'name': 'Contact',
            'item': 'https://www.newikondoors.co.in/contact'
          }
        ]
      }
    });
  }, [phone]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.submitEnquiry({ ...form, requirement: 'General Enquiry' });
      setSubmitted(true);
      const msg = `*New Ikon Doors - Website Enquiry*\n\n*Name:* ${form.name}\n*Phone:* ${form.phone}\n${form.email ? `*Email:* ${form.email}\n` : ''}${form.customer_type ? `*Customer Type:* ${form.customer_type}\n` : ''}\n*Message:* ${form.message || 'General project enquiry'}`;
      window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
    } catch { alert(`Failed to submit. Please try again or call us directly at ${phone}.`); }
    setSubmitting(false);
  };

  return (
    <div style={{ paddingTop: 'calc(var(--topbar-height) + var(--nav-height))' }}>
      <section style={{ background: 'var(--bg-dark)', color: 'var(--text-inverse)', padding: 'clamp(3rem, 6vw, 5rem) 0', textAlign: 'center' }}>
        <div className="container">
          {/* Breadcrumbs */}
          <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginBottom: '1.25rem' }}>
            <a href="/" onClick={e => { e.preventDefault(); navigate('/'); }} style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Home</a>
            <ChevronRight size={12} />
            <span style={{ color: '#fff' }}>Contact</span>
          </nav>

          <div className="section-eyebrow" style={{ justifyContent: 'center', color: 'var(--color-gold-light)' }}>Contact</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 500, letterSpacing: '0.02em', marginBottom: '1rem' }}>
            Contact New Ikon Doors
          </h1>
          <p style={{ color: 'var(--text-inverse-muted)', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
            Visit our manufacturing showroom on Tanjore Road, call our sales team, or submit an architectural project enquiry.
          </p>
        </div>
      </section>

      <section className="section-py" style={{ background: 'var(--bg-primary)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
            {/* Contact Info */}
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 500, marginBottom: '1.5rem' }}>New Ikon Doors & Ply</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <MapPin size={18} style={{ color: 'var(--color-gold)', flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.2rem' }}>Showroom Address</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{address}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <Phone size={18} style={{ color: 'var(--color-gold)', flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.2rem' }}>Phone Numbers</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{phone}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <Mail size={18} style={{ color: 'var(--color-gold)', flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.2rem' }}>Email</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{email}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <Clock size={18} style={{ color: 'var(--color-gold)', flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.2rem' }}>Business Hours</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{timings}</div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="btn btn-gold btn-sm" style={{ textDecoration: 'none' }}>
                  <MessageSquare size={14} /> WhatsApp
                </a>
                <a href={`tel:${phone.replace(/[^0-9+]/g, '')}`} className="btn btn-outline btn-sm" style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>
                  <Phone size={14} /> Call Now
                </a>
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=New+Ikon+Doors+%26+Ply,+Thanjavur+Road,+Trichy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                  style={{ textDecoration: 'none', color: 'var(--text-primary)' }}
                >
                  <MapPin size={14} /> Directions
                </a>
              </div>
            </div>

            {/* Contact Form */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '2rem' }}>
              {submitted ? (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--color-gold-subtle)', color: 'var(--color-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                    <Check size={24} />
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: '0.5rem' }}>Message sent!</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Our team will get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 500, marginBottom: '1.5rem' }}>Send us a message</h3>
                  {[
                    { key: 'name', label: 'Name', type: 'text', required: true },
                    { key: 'email', label: 'Email', type: 'email' },
                    { key: 'phone', label: 'Phone', type: 'tel', required: true },
                  ].map(f => (
                    <div key={f.key} style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{f.label}{f.required && ' *'}</label>
                      <input
                        type={f.type}
                        value={form[f.key]}
                        onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                        required={f.required}
                        style={{
                          width: '100%',
                          padding: '0.7rem 0.85rem',
                          border: '1px solid var(--border-light)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.9rem',
                          fontFamily: 'var(--font-sans)',
                          background: 'var(--bg-primary)',
                          transition: 'border-color 0.2s',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                        onFocus={e => e.target.style.borderColor = 'var(--color-gold)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border-light)'}
                      />
                    </div>
                  ))}
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>I am a</label>
                    <select
                      value={form.customer_type}
                      onChange={e => setForm({ ...form, customer_type: e.target.value })}
                      style={{ width: '100%', padding: '0.7rem 0.85rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', fontFamily: 'var(--font-sans)', background: 'var(--bg-primary)', outline: 'none', boxSizing: 'border-box' }}
                    >
                      <option value="">Select...</option>
                      <option value="Homeowner">Homeowner</option>
                      <option value="Architect">Architect</option>
                      <option value="Builder">Builder</option>
                      <option value="Dealer">Dealer</option>
                      <option value="Interior Designer">Interior Designer</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Message</label>
                    <textarea
                      value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      rows={4}
                      style={{ width: '100%', padding: '0.7rem 0.85rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', fontFamily: 'var(--font-sans)', background: 'var(--bg-primary)', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                      onFocus={e => e.target.style.borderColor = 'var(--color-gold)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border-light)'}
                    />
                  </div>
                  <button type="submit" className="btn btn-gold" disabled={submitting} style={{ width: '100%' }}>
                    {submitting ? 'Sending...' : <><Send size={14} /> Send Message</>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
