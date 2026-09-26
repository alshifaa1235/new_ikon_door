import React, { useState, useEffect } from 'react';
import { useNav } from '../App';
import { useSite } from '../context/SiteContext';
import { api } from '../services/api';
import { setSEO } from '../services/seo';
import { ArrowRight, Check, Phone, MessageSquare, X, Send } from 'lucide-react';

export default function RequestQuotePage() {
  const { navigate, quoteProducts, removeFromQuote } = useNav();
  const { settings, collections: siteCollections } = useSite();
  const [localCollections, setLocalCollections] = useState([]);
  const [form, setForm] = useState({
    name: '', company: '', email: '', phone: '', whatsapp: '',
    location: '', customer_type: '', requirement: '',
    collection: '', product_code: '', quantity: '', message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const phone = settings?.phone || '+91 98424 45353';
  const rawWhatsapp = (settings?.whatsapp || '919842445353').replace(/[^0-9]/g, '');
  const collections = (siteCollections && siteCollections.length > 0) ? siteCollections : localCollections;

  useEffect(() => {
    setSEO({
      title: 'Request a Wholesale Quote | New Ikon Doors Trichy',
      description: 'Request direct factory wholesale pricing for New Ikon Doors in Trichy, Tamil Nadu. Custom sizing and bulk trade quotes for architects, builders, and dealers.',
      canonical: '/request-quote',
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
            'name': 'Request Quote',
            'item': 'https://newikondoors.com/request-quote'
          }
        ]
      }
    });
    api.getCollections().then(setLocalCollections).catch(() => {});
  }, []);

  // Pre-fill product codes from quote cart
  useEffect(() => {
    if (quoteProducts.length > 0) {
      setForm(f => ({
        ...f,
        product_code: quoteProducts.map(p => p.code).join(', '),
        collection: quoteProducts[0]?.collection_name || quoteProducts[0]?.name || ''
      }));
    }
  }, [quoteProducts]);

  const formatWhatsAppMessage = (data) => {
    let msg = `*NEW QUOTE REQUEST - New Ikon Doors*\n`;
    msg += `------------------------------------\n`;
    msg += `*Name:* ${data.name || 'Not provided'}\n`;
    if (data.company) msg += `*Company / Project:* ${data.company}\n`;
    msg += `*Phone:* ${data.phone || 'Not provided'}\n`;
    if (data.whatsapp) msg += `*WhatsApp:* ${data.whatsapp}\n`;
    if (data.email) msg += `*Email:* ${data.email}\n`;
    if (data.location) msg += `*Location:* ${data.location}\n`;
    if (data.customer_type) msg += `*Customer Type:* ${data.customer_type}\n`;
    if (data.collection) msg += `*Collection:* ${data.collection}\n`;
    if (data.product_code) msg += `*Door Model(s):* ${data.product_code}\n`;
    if (data.quantity) msg += `*Quantity:* ${data.quantity}\n`;
    if (data.message) msg += `*Requirements:* ${data.message}\n`;
    msg += `------------------------------------\n`;
    msg += `_Sent via New Ikon Doors Website_`;
    return msg;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // 1. Submit to backend / admin panel
      await api.submitEnquiry({ ...form, requirement: form.requirement || 'Quote Request' });
      setSubmitted(true);

      // 2. Redirect to WhatsApp with formatted quote message
      const text = formatWhatsAppMessage(form);
      const whatsappUrl = `https://wa.me/${rawWhatsapp}?text=${encodeURIComponent(text)}`;
      
      // Open WhatsApp in new tab; fallback to location href if popup blocked
      const win = window.open(whatsappUrl, '_blank');
      if (!win || win.closed || typeof win.closed === 'undefined') {
        window.location.href = whatsappUrl;
      }
    } catch {
      alert(`Failed to submit quote request. Please call or WhatsApp us directly at ${phone}.`);
    }
    setSubmitting(false);
  };

  if (submitted) {
    const text = formatWhatsAppMessage(form);
    const whatsappUrl = `https://wa.me/${rawWhatsapp}?text=${encodeURIComponent(text)}`;
    return (
      <div style={{ paddingTop: 'calc(var(--topbar-height) + var(--nav-height))', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: 520, padding: '2rem' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--color-gold-subtle)', color: 'var(--color-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <Check size={32} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 500, marginBottom: '0.75rem' }}>Quote Request Sent!</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1rem' }}>
            Thank you, <strong>{form.name}</strong>. Your enquiry has been registered in our admin system and directed to our sales team.
          </p>
          <p style={{ fontSize: '0.88rem', color: 'var(--color-gold-dark)', marginBottom: '2rem', fontWeight: 500 }}>
            WhatsApp chat has been initiated. If WhatsApp didn't open automatically, please click below:
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-gold"
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <MessageSquare size={16} /> Open in WhatsApp
            </a>
            <a
              href="/collections"
              className="btn btn-outline"
              onClick={(e) => { e.preventDefault(); navigate('/collections'); }}
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
            >
              Continue Browsing <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 'calc(var(--topbar-height) + var(--nav-height))' }}>
      <section style={{ background: 'var(--bg-dark)', color: 'var(--text-inverse)', padding: 'clamp(3rem, 6vw, 5rem) 0', textAlign: 'center' }}>
        <div className="container">
          <div className="section-eyebrow" style={{ justifyContent: 'center', color: 'var(--color-gold-light)' }}>Wholesale Enquiries</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 500, letterSpacing: '0.02em', marginBottom: '1rem' }}>
            Request a Wholesale Quote
          </h1>
          <p style={{ color: 'var(--text-inverse-muted)', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
            Direct factory wholesale pricing for architects, builders, developers, and dealers across Tamil Nadu.
          </p>
        </div>
      </section>

      <section className="section-py" style={{ background: 'var(--bg-primary)' }}>
        <div className="container" style={{ maxWidth: 720 }}>
          {/* Selected products from cart */}
          {quoteProducts.length > 0 && (
            <div style={{ marginBottom: '2rem', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-gold-dark)', marginBottom: '0.75rem' }}>
                Selected Products ({quoteProducts.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {quoteProducts.map((p, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-pill)',
                    background: 'var(--bg-secondary)', border: '1px solid var(--border-light)',
                    fontSize: '0.82rem', fontWeight: 500,
                  }}>
                    {p.code}
                    <button onClick={() => removeFromQuote(p.code)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--text-muted)', display: 'flex' }}>
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              {[
                { key: 'name', label: 'Full Name', type: 'text', required: true },
                { key: 'company', label: 'Company / Project Name', type: 'text' },
                { key: 'phone', label: 'Phone', type: 'tel', required: true },
                { key: 'whatsapp', label: 'WhatsApp Number', type: 'tel' },
                { key: 'email', label: 'Email', type: 'email' },
                { key: 'location', label: 'City / Location', type: 'text' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.3rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {f.label}{f.required && ' *'}
                  </label>
                  <input
                    type={f.type} value={form[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    required={f.required}
                    style={{ width: '100%', padding: '0.65rem 0.8rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', fontSize: '0.88rem', fontFamily: 'var(--font-sans)', background: 'var(--bg-primary)', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = 'var(--color-gold)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border-light)'}
                  />
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.3rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>I am a</label>
                <select value={form.customer_type} onChange={e => setForm({ ...form, customer_type: e.target.value })} style={{ width: '100%', padding: '0.65rem 0.8rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', fontSize: '0.88rem', fontFamily: 'var(--font-sans)', background: 'var(--bg-primary)', outline: 'none', boxSizing: 'border-box' }}>
                  <option value="">Select...</option>
                  <option>Homeowner</option><option>Architect</option><option>Builder</option><option>Dealer</option><option>Interior Designer</option><option>Other</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.3rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Collection</label>
                <select value={form.collection} onChange={e => setForm({ ...form, collection: e.target.value })} style={{ width: '100%', padding: '0.65rem 0.8rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', fontSize: '0.88rem', fontFamily: 'var(--font-sans)', background: 'var(--bg-primary)', outline: 'none', boxSizing: 'border-box' }}>
                  <option value="">Any / All</option>
                  {collections.map(c => <option key={c.slug} value={c.name}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.3rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Product Code(s)</label>
                <input type="text" value={form.product_code} onChange={e => setForm({ ...form, product_code: e.target.value })} placeholder="e.g. UV - 01, MG - 03" style={{ width: '100%', padding: '0.65rem 0.8rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', fontSize: '0.88rem', fontFamily: 'var(--font-sans)', background: 'var(--bg-primary)', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.3rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Quantity</label>
                <input type="text" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} placeholder="e.g. 10 doors" style={{ width: '100%', padding: '0.65rem 0.8rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', fontSize: '0.88rem', fontFamily: 'var(--font-sans)', background: 'var(--bg-primary)', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.3rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Additional Details</label>
              <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={4} placeholder="Custom sizes, preferred finishes, project timeline..." style={{ width: '100%', padding: '0.65rem 0.8rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', fontSize: '0.88rem', fontFamily: 'var(--font-sans)', background: 'var(--bg-primary)', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
            </div>

            <button type="submit" className="btn btn-gold btn-lg" disabled={submitting} style={{ width: '100%' }}>
              {submitting ? 'Submitting...' : <><Send size={15} /> Submit Quote Request</>}
            </button>

            <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Or call us: <strong style={{ color: 'var(--text-primary)' }}>{phone}</strong>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
