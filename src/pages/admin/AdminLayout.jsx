import React, { useState, useEffect, useRef } from 'react';
import { useNav } from '../../App';
import { api } from '../../services/api';
import { setSEO } from '../../services/seo';
import {
  LayoutDashboard, Package, Layers, MessageSquare, MapPin, Star, FileText, Settings,
  LogOut, ExternalLink, Menu, X, Check, Trash2, Edit, Plus, Search, Filter,
  Upload, Eye, Clock, Phone, Mail, Building, CheckCircle2, AlertCircle, Sparkles,
  ShieldCheck, Cpu, Droplets, Maximize2, Users, FileCheck
} from 'lucide-react';

const notifyDataChanged = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('nid:data-changed'));
  }
};

const SIDEBAR_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { key: 'products', label: 'Products', icon: <Package size={18} /> },
  { key: 'collections', label: 'Collections', icon: <Layers size={18} /> },
  { key: 'branches', label: 'Branches', icon: <MapPin size={18} /> },
  { key: 'testimonials', label: 'Testimonials', icon: <Star size={18} /> },
  { key: 'usps', label: 'USPs', icon: <Sparkles size={18} /> },
  { key: 'catalogue', label: 'Catalogue', icon: <FileText size={18} /> },
  { key: 'enquiries', label: 'Enquiries', icon: <MessageSquare size={18} /> },
  { key: 'settings', label: 'Settings', icon: <Settings size={18} /> },
];

export default function AdminLayout({ section }) {
  const { navigate } = useNav();
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('nid_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSEO({ title: 'Admin Dashboard | New Ikon Doors', robots: 'noindex, nofollow' });
    api.me().then(usr => {
      if (usr) {
        setUser(usr);
        try {
          localStorage.setItem('nid_user', JSON.stringify(usr));
        } catch { }
      } else {
        const saved = localStorage.getItem('nid_user');
        if (!saved) {
          navigate('/admin/login', true);
        }
      }
    }).catch(() => {
      const saved = localStorage.getItem('nid_user');
      if (!saved) {
        navigate('/admin/login', true);
      }
    });
  }, []);

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch { }
    try {
      localStorage.removeItem('nid_user');
    } catch { }
    navigate('/admin/login', true);
  };

  if (!user) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC' }}>
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <img src="/new_ikon_logo_white.png" alt="Logo" style={{ height: 28, opacity: 0.95 }} />
            <div style={{ fontSize: '0.68rem', color: '#9CA3AF', marginTop: '0.25rem', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500 }}>
              Administration CMS
            </div>
          </div>
          <button className="hide-desktop" onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.4rem', display: 'flex', alignItems: 'center' }} aria-label="Close sidebar">
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0.75rem 0', overflowY: 'auto' }}>
          {SIDEBAR_ITEMS.map(item => {
            const isActive = section === item.key || (!section && item.key === 'dashboard');
            return (
              <button
                key={item.key}
                onClick={() => { navigate(`/admin/${item.key}`); setSidebarOpen(false); }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1.5rem',
                  background: isActive ? 'rgba(184, 151, 108, 0.15)' : 'transparent',
                  color: isActive ? '#E5C79E' : '#9CA3AF',
                  border: 'none',
                  borderLeft: isActive ? '3px solid #B8976C' : '3px solid transparent',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 600 : 400,
                  fontFamily: 'var(--font-sans)',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                }}
              >
                {item.icon} {item.label}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <a href="/" target="_blank" rel="noopener" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#9CA3AF', textDecoration: 'none', marginBottom: '0.75rem' }}>
            <ExternalLink size={14} /> View Live Website
          </a>
          <button
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', fontSize: '0.8rem', fontFamily: 'var(--font-sans)', padding: 0 }}
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-main-wrap">
        {/* Top Bar */}
        <header className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button className="hide-desktop" onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.4rem', display: 'flex', alignItems: 'center' }} aria-label="Open sidebar">
              <Menu size={22} />
            </button>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 600, textTransform: 'capitalize', color: '#0F172A', margin: 0 }}>
              {section || 'Dashboard'}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="hide-mobile" style={{ fontSize: '0.82rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Logged in as <strong style={{ color: '#0F172A' }}>{user?.email || user?.username || 'Admin'}</strong>
              <span style={{ background: 'rgba(184,151,108,0.15)', color: '#B8976C', padding: '0.2rem 0.5rem', borderRadius: 4, fontSize: '0.72rem', fontWeight: 600 }}>Administrator</span>
            </span>
            <button
              onClick={handleLogout}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.75rem',
                background: '#F1F5F9',
                color: '#64748B',
                border: '1px solid #CBD5E1',
                borderRadius: 6,
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <LogOut size={13} /> Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-main-content">
          {section === 'dashboard' || !section ? <DashboardSection onNavigate={navigate} /> : null}
          {section === 'products' ? <ProductsSection /> : null}
          {section === 'collections' ? <CollectionsSection onNavigate={navigate} /> : null}
          {section === 'branches' ? <BranchesSection /> : null}
          {section === 'testimonials' ? <TestimonialsSection /> : null}
          {section === 'usps' ? <UspsSection /> : null}
          {section === 'catalogue' ? <CatalogueSection /> : null}
          {section === 'enquiries' ? <EnquiriesSection /> : null}
          {section === 'settings' ? <SettingsSection /> : null}
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999 }} className="hide-desktop" />
      )}
    </div>
  );
}

// ── Admin Card ──
function AdminCard({ children, title, subtitle, actions, style = {} }) {
  return (
    <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)', ...style }}>
      {title && (
        <div className="admin-card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.1rem 1.4rem', borderBottom: '1px solid #E2E8F0', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 600, color: '#0F172A', margin: 0 }}>{title}</h3>
            {subtitle && <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '0.2rem 0 0' }}>{subtitle}</p>}
          </div>
          {actions}
        </div>
      )}
      <div style={{ padding: 'clamp(0.85rem, 2vw, 1.4rem)' }}>{children}</div>
    </div>
  );
}

// ── Modal Component ──
function Modal({ isOpen, onClose, title, children, maxWidth = 640 }) {
  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: 'clamp(0.5rem, 2vw, 1rem)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          width: '100%',
          maxWidth,
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#F8FAFC'
        }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#0F172A', margin: 0 }}>{title}</h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: '0.4rem', borderRadius: 6, display: 'flex', alignItems: 'center' }}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        <div style={{ padding: 'clamp(1rem, 3vw, 1.5rem)', overflowY: 'auto', flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Form Helpers ──
const inputStyle = {
  width: '100%',
  padding: '0.6rem 0.85rem',
  border: '1px solid #CBD5E1',
  borderRadius: 6,
  fontSize: '0.88rem',
  fontFamily: 'var(--font-sans)',
  outline: 'none',
  boxSizing: 'border-box',
  background: '#fff',
  color: '#0F172A',
};

const labelStyle = {
  display: 'block',
  fontSize: '0.76rem',
  fontWeight: 600,
  marginBottom: '0.35rem',
  color: '#475569',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

function ImageUploadField({ value, onChange, label = "Product Image", bucket = "product-images" }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await api.admin.uploadFile(bucket, file, bucket.replace('-images', ''));
      if (res?.publicUrl) {
        onChange(res.publicUrl);
      }
    } catch (err) {
      alert('Failed to upload image: ' + (err.message || 'Server error'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <input
            type="text"
            value={value || ''}
            placeholder="e.g. /doors/WD-1057.jpg or image URL"
            onChange={e => onChange(e.target.value)}
            style={inputStyle}
          />
          <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.5rem', alignItems: 'center' }}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFile}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.85rem',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#1E293B',
                background: '#F1F5F9',
                border: '1px solid #CBD5E1',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              <Upload size={13} /> {uploading ? 'Uploading...' : 'Upload Image File'}
            </button>
            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
              Select local photo or paste relative path
            </span>
          </div>
        </div>

        {/* Thumbnail Preview */}
        <div style={{
          width: 65,
          height: 95,
          borderRadius: 6,
          border: '1px solid #CBD5E1',
          background: '#F8FAFC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          flexShrink: 0
        }}>
          {value ? (
            <img
              src={value}
              alt="Preview"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <span style={{ fontSize: '0.65rem', color: '#94A3B8', textAlign: 'center', padding: '0.25rem' }}>No Preview</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Dashboard ──
function DashboardSection({ onNavigate }) {
  const [stats, setStats] = useState(null);
  useEffect(() => { api.admin.getDashboard().then(setStats).catch(() => { }); }, []);

  const cards = [
    { label: 'Total Products', value: stats?.total_products ?? stats?.products_count ?? 186, icon: <Package size={20} />, color: '#2563EB', key: 'products' },
    { label: 'Published Products', value: stats?.published_products ?? stats?.products_count ?? 186, icon: <CheckCircle2 size={20} />, color: '#10B981', key: 'products' },
    { label: 'Door Collections', value: stats?.total_collections ?? stats?.collections_count ?? 10, icon: <Layers size={20} />, color: '#7C3AED', key: 'collections' },
    { label: 'Showroom Branches', value: stats?.total_branches ?? 3, icon: <MapPin size={20} />, color: '#D97706', key: 'branches' },
    { label: 'Client Testimonials', value: stats?.total_testimonials ?? 3, icon: <Star size={20} />, color: '#EC4899', key: 'testimonials' },
    { label: 'Current Catalogue', value: stats?.current_catalogue?.version ? `v${stats.current_catalogue.version}` : 'Active PDF', icon: <FileText size={20} />, color: '#B8976C', key: 'catalogue' },
    { label: 'Customer Enquiries', value: stats?.total_enquiries ?? stats?.enquiries_count ?? 0, icon: <MessageSquare size={20} />, color: '#059669', key: 'enquiries' },
  ];

  return (
    <div>
      {/* Quick Actions Bar */}
      <div style={{
        background: '#fff',
        borderRadius: 10,
        border: '1px solid #E2E8F0',
        padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: '#0F172A' }}>Content Quick Actions</div>
          <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.15rem' }}>Add new doors, update catalog collections, or manage customer enquiries</div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => onNavigate('/admin/products')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 1rem',
              background: '#B8976C',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Plus size={15} /> Add / Manage Products
          </button>
          <button
            onClick={() => onNavigate('/admin/collections')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 1rem',
              background: '#0F172A',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Layers size={15} /> Manage Collections
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {cards.map((c, i) => (
          <div
            key={i}
            onClick={() => onNavigate(`/admin/${c.key}`)}
            style={{
              background: '#fff',
              borderRadius: 10,
              border: '1px solid #E2E8F0',
              padding: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              cursor: 'pointer',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
          >
            <div style={{ width: 46, height: 46, borderRadius: 10, background: `${c.color}15`, color: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {c.icon}
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0F172A', lineHeight: 1.2 }}>{c.value}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {stats?.recent_enquiries?.length > 0 && (
        <AdminCard title="Recent Customer Enquiries">
          <div className="admin-table-container">
            <table className="admin-table" style={{ borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ textAlign: 'left', padding: '0.6rem 0.75rem', color: '#64748B', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase' }}>Name</th>
                  <th style={{ textAlign: 'left', padding: '0.6rem 0.75rem', color: '#64748B', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase' }}>Phone</th>
                  <th style={{ textAlign: 'left', padding: '0.6rem 0.75rem', color: '#64748B', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '0.6rem 0.75rem', color: '#64748B', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_enquiries.map((enq, i) => (
                  <tr key={enq.id || i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 600, color: '#0F172A' }}>{enq.name}</td>
                    <td style={{ padding: '0.75rem', color: '#64748B' }}>{enq.phone}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{
                        padding: '0.25rem 0.6rem', borderRadius: 4, fontSize: '0.72rem', fontWeight: 600,
                        background: enq.status === 'new' ? '#FEF3C7' : enq.status === 'contacted' ? '#DBEAFE' : '#D1FAE5',
                        color: enq.status === 'new' ? '#92400E' : enq.status === 'contacted' ? '#1E40AF' : '#065F46',
                      }}>{enq.status}</span>
                    </td>
                    <td style={{ padding: '0.75rem', color: '#94A3B8', fontSize: '0.8rem' }}>
                      {enq.created_at ? new Date(enq.created_at).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminCard>
      )}
    </div>
  );
}

// ── Products Section (Full Add & Edit Functionality) ──
function ProductsSection() {
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCol, setSelectedCol] = useState(() => {
    try {
      const saved = localStorage.getItem('nid_admin_filter_col');
      if (saved) {
        localStorage.removeItem('nid_admin_filter_col');
        return saved;
      }
    } catch {}
    return '';
  });
  const [filterFeatured, setFilterFeatured] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prods, cols] = await Promise.all([
        api.admin.getProducts(),
        api.admin.getCollections(),
      ]);
      setProducts(prods);
      setCollections(cols);
    } catch (err) {
      console.error('Failed loading products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setIsModalOpen(true);
  };

  const handleDelete = async (id, code) => {
    if (!confirm(`Are you sure you want to delete product "${code}"?`)) return;
    try {
      await api.admin.deleteProduct(id);
      notifyDataChanged();
      loadData();
    } catch (err) {
      alert('Failed to delete product: ' + (err.error || 'Server error'));
    }
  };

  // Filtered list
  const filteredProducts = products.filter(p => {
    const matchesSearch = !search ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      (p.name && p.name.toLowerCase().includes(search.toLowerCase())) ||
      (p.material && p.material.toLowerCase().includes(search.toLowerCase()));

    const matchesCol = !selectedCol || String(p.collection_id) === String(selectedCol);
    const matchesFeatured = !filterFeatured || (filterFeatured === '1' ? p.featured : !p.featured);

    return matchesSearch && matchesCol && matchesFeatured;
  });

  return (
    <div>
      <AdminCard
        title={`Products Directory (${products.length})`}
        subtitle="Manage door models, descriptions, catalog codes, materials, and display images"
        actions={
          <button
            onClick={handleOpenAdd}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.6rem 1.15rem',
              background: '#B8976C',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(184, 151, 108, 0.25)'
            }}
          >
            <Plus size={16} /> Add New Product
          </button>
        }
      >
        {/* Search & Filter Toolbar */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 200 }}>
            <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Search by code (WD-1057), name, material..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ ...inputStyle, paddingLeft: '2.2rem' }}
            />
          </div>

          <select
            value={selectedCol}
            onChange={e => setSelectedCol(e.target.value)}
            style={{ ...inputStyle, width: 'auto', minWidth: 180, cursor: 'pointer' }}
          >
            <option value="">All Collections ({collections.length})</option>
            {collections.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={filterFeatured}
            onChange={e => setFilterFeatured(e.target.value)}
            style={{ ...inputStyle, width: 'auto', minWidth: 150, cursor: 'pointer' }}
          >
            <option value="">All Statuses</option>
            <option value="1">Featured Only</option>
            <option value="0">Standard Only</option>
          </select>

          {(search || selectedCol || filterFeatured) && (
            <button
              onClick={() => { setSearch(''); setSelectedCol(''); setFilterFeatured(''); }}
              style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '0.8rem', cursor: 'pointer', padding: '0.5rem' }}
            >
              Reset Filters
            </button>
          )}
        </div>

        {loading ? (
          <p style={{ color: '#94A3B8', textAlign: 'center', padding: '2rem' }}>Loading products catalog...</p>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#F8FAFC', borderRadius: 8 }}>
            <Package size={36} style={{ color: '#94A3B8', marginBottom: '0.5rem' }} />
            <div style={{ fontWeight: 600, color: '#0F172A' }}>No products match your criteria</div>
            <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '0.25rem' }}>Try clearing filters or click "+ Add New Product" to create one.</div>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table" style={{ borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#475569', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase', width: 70 }}>Image</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#475569', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase' }}>Model Code</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#475569', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase' }}>Name & Details</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#475569', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase' }}>Collection</th>
                  <th style={{ textAlign: 'center', padding: '0.75rem 1rem', color: '#475569', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase', width: 90 }}>Featured</th>
                  <th style={{ textAlign: 'center', padding: '0.75rem 1rem', color: '#475569', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase', width: 90 }}>Status</th>
                  <th style={{ textAlign: 'right', padding: '0.75rem 1rem', color: '#475569', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase', width: 140 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    {/* Door Preview */}
                    <td style={{ padding: '0.65rem 1rem' }}>
                      <div style={{
                        width: 44,
                        height: 66,
                        borderRadius: 4,
                        background: '#F1F5F9',
                        border: '1px solid #E2E8F0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                      }}>
                        {p.image ? (
                          <img
                            src={p.image}
                            alt={p.code}
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <Package size={18} style={{ color: '#CBD5E1' }} />
                        )}
                      </div>
                    </td>

                    {/* Code */}
                    <td style={{ padding: '0.65rem 1rem' }}>
                      <span style={{ fontWeight: 700, color: '#0F172A', fontFamily: 'monospace', fontSize: '0.9rem', background: '#F1F5F9', padding: '0.2rem 0.5rem', borderRadius: 4 }}>
                        {p.code}
                      </span>
                    </td>

                    {/* Name & Material */}
                    <td style={{ padding: '0.65rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: '#1E293B' }}>{p.name || 'Door Model'}</div>
                      <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '0.15rem' }}>
                        {p.material || 'Architectural Door'} {p.finish ? `• ${p.finish}` : ''}
                      </div>
                    </td>

                    {/* Collection */}
                    <td style={{ padding: '0.65rem 1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.6rem',
                        borderRadius: 4,
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        background: '#EDE9FE',
                        color: '#5B21B6',
                        display: 'inline-block'
                      }}>
                        {p.collection_name || 'Unassigned'}
                      </span>
                    </td>

                    {/* Featured */}
                    <td style={{ padding: '0.65rem 1rem', textAlign: 'center' }}>
                      {p.featured ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#D97706', fontSize: '0.74rem', fontWeight: 600, background: '#FEF3C7', padding: '0.2rem 0.5rem', borderRadius: 4 }}>
                          <Sparkles size={12} /> Yes
                        </span>
                      ) : (
                        <span style={{ color: '#94A3B8', fontSize: '0.75rem' }}>—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '0.65rem 1rem', textAlign: 'center' }}>
                      <span style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: 4,
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        background: p.published !== 0 ? '#DCFCE7' : '#F1F5F9',
                        color: p.published !== 0 ? '#15803D' : '#64748B'
                      }}>
                        {p.published !== 0 ? 'Live' : 'Draft'}
                      </span>
                    </td>

                    {/* Action Buttons */}
                    <td style={{ padding: '0.65rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem', alignItems: 'center' }}>
                        <button
                          onClick={() => handleOpenEdit(p)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.35rem 0.65rem',
                            background: '#F1F5F9',
                            color: '#0F172A',
                            border: '1px solid #CBD5E1',
                            borderRadius: 4,
                            cursor: 'pointer',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                          }}
                          title="Edit this product"
                        >
                          <Edit size={13} /> Edit
                        </button>

                        <a
                          href={`/product/${p.slug || (p.code || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`}
                          target="_blank"
                          rel="noopener"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '0.35rem 0.5rem',
                            background: '#F8FAFC',
                            color: '#64748B',
                            border: '1px solid #E2E8F0',
                            borderRadius: 4,
                            textDecoration: 'none'
                          }}
                          title="Preview product on live site"
                        >
                          <ExternalLink size={13} />
                        </a>

                        <button
                          onClick={() => handleDelete(p.id, p.code)}
                          style={{
                            background: 'none',
                            border: '1px solid transparent',
                            cursor: 'pointer',
                            color: '#EF4444',
                            padding: '0.35rem 0.45rem',
                            borderRadius: 4
                          }}
                          title="Delete product"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      {/* Product Edit / Create Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={editingProduct}
        collections={collections}
        onSaved={() => {
          setIsModalOpen(false);
          loadData();
        }}
      />
    </div>
  );
}

// ── Product Modal (Add & Edit Form) ──
function ProductModal({ isOpen, onClose, product, collections, onSaved }) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [collectionId, setCollectionId] = useState('');
  const [material, setMaterial] = useState('');
  const [finish, setFinish] = useState('');
  const [availableSizes, setAvailableSizes] = useState('');
  const [applications, setApplications] = useState('');
  const [image, setImage] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [desc, setDesc] = useState('');
  const [featuresText, setFeaturesText] = useState('');
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setCode(product.code || '');
      setName(product.name || '');
      setCollectionId(product.collection_id || '');
      setMaterial(product.material || '');
      setFinish(product.finish || '');
      setAvailableSizes(product.available_sizes || '');
      setApplications(product.applications || '');
      setImage(product.image || '');
      setShortDesc(product.short_description || '');
      setDesc(product.description || '');
      // features might be JSON array or string
      let feats = [];
      try {
        feats = Array.isArray(product.features) ? product.features : JSON.parse(product.features || '[]');
      } catch {
        feats = [];
      }
      setFeaturesText(feats.join('\n'));
      setFeatured(!!product.featured);
      setPublished(product.published !== 0);
    } else {
      setCode('');
      setName('');
      setCollectionId(collections[0]?.id || '');
      setMaterial('WPVC + Polymer Foil');
      setFinish('Matte Woodgrain Texture');
      setAvailableSizes('78x30, 78x33, 78x36, 81x33, 81x36');
      setApplications('Main Entrance, Bedroom, Office Interior');
      setImage('');
      setShortDesc('Precision engineered architectural door with superior moisture resistance and luxury finish.');
      setDesc('');
      setFeaturesText('100% Waterproof & Weatherproof\nTermite and Borer Proof Core\nHigh Screw Holding Capacity\nZero Maintenance Coating');
      setFeatured(false);
      setPublished(true);
    }
    setError('');
  }, [product, collections, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Product Code (e.g. WD - 1057) is required.');
      return;
    }
    setSaving(true);
    setError('');

    const featuresList = featuresText
      .split('\n')
      .map(f => f.trim())
      .filter(Boolean);

    const payload = {
      code: code.trim(),
      name: name.trim() || `Door ${code.trim()}`,
      collection_id: collectionId ? parseInt(collectionId) : null,
      material: material.trim(),
      finish: finish.trim(),
      available_sizes: availableSizes.trim(),
      applications: applications.trim(),
      image: image.trim(),
      short_description: shortDesc.trim(),
      description: desc.trim(),
      features: featuresList,
      featured: featured ? 1 : 0,
      published: published ? 1 : 0,
    };

    try {
      if (product?.id) {
        await api.admin.updateProduct(product.id, payload);
      } else {
        await api.admin.createProduct(payload);
      }
      notifyDataChanged();
      onSaved();
    } catch (err) {
      setError(err.error || err.message || 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product ? `Edit Product: ${product.code}` : 'Add New Door Product'}
      maxWidth={720}
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <div style={{ background: '#FEE2E2', border: '1px solid #F87171', color: '#991B1B', padding: '0.75rem 1rem', borderRadius: 6, marginBottom: '1.25rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={labelStyle}>Product Code *</label>
            <input
              type="text"
              required
              placeholder="e.g. WD - 1057"
              value={code}
              onChange={e => setCode(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Product Name</label>
            <input
              type="text"
              placeholder="e.g. Teak Grain Luxury Door"
              value={name}
              onChange={e => setName(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={labelStyle}>Assigned Collection</label>
            <select
              value={collectionId}
              onChange={e => setCollectionId(e.target.value)}
              style={inputStyle}
            >
              <option value="">-- Select Collection --</option>
              {collections.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Core Material</label>
            <input
              type="text"
              placeholder="e.g. WPVC + Polymer Foil"
              value={material}
              onChange={e => setMaterial(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={labelStyle}>Surface Finish</label>
            <input
              type="text"
              placeholder="e.g. Textured Matte / High Gloss"
              value={finish}
              onChange={e => setFinish(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Available Sizes (Inches)</label>
            <input
              type="text"
              placeholder="e.g. 78x30, 78x33, 78x36, 81x33, 81x36"
              value={availableSizes}
              onChange={e => setAvailableSizes(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Image upload & preview */}
        <div style={{ marginBottom: '1rem' }}>
          <ImageUploadField
            value={image}
            onChange={setImage}
            label="Door Elevation Image (URL or Upload)"
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Suitable Applications</label>
          <input
            type="text"
            placeholder="e.g. Main Door, Master Bedroom, Pooja Room, Commercial Office"
            value={applications}
            onChange={e => setApplications(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Short Summary Description</label>
          <input
            type="text"
            placeholder="One-line summary for cards and catalog lists"
            value={shortDesc}
            onChange={e => setShortDesc(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Key Features (One feature per line)</label>
          <textarea
            rows={3}
            placeholder="100% Waterproof & Weatherproof&#10;Termite and Borer Proof&#10;Superior Sound Insulation"
            value={featuresText}
            onChange={e => setFeaturesText(e.target.value)}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        {/* Checkbox toggles */}
        <div style={{ display: 'flex', gap: '2rem', padding: '0.75rem 0', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', marginBottom: '1.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, color: '#1E293B' }}>
            <input
              type="checkbox"
              checked={featured}
              onChange={e => setFeatured(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: '#B8976C' }}
            />
            Featured on Homepage Showcase
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, color: '#1E293B' }}>
            <input
              type="checkbox"
              checked={published}
              onChange={e => setPublished(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: '#10B981' }}
            />
            Published / Visible to Public
          </label>
        </div>

        {/* Modal Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.65rem 1.25rem',
              background: '#F1F5F9',
              color: '#475569',
              border: '1px solid #CBD5E1',
              borderRadius: 6,
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.65rem 1.5rem',
              background: '#B8976C',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(184, 151, 108, 0.3)'
            }}
          >
            <Check size={16} /> {saving ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ── Collections Section (Full Add & Edit Functionality) ──
function CollectionsSection({ onNavigate }) {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);

  const load = () => {
    setLoading(true);
    api.admin.getCollections().then(d => { setCollections(d); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(load, []);

  const handleOpenAdd = () => {
    setEditingCollection(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (col) => {
    setEditingCollection(col);
    setIsModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete the collection "${name}"? This will not delete the products, but they will be unassigned.`)) return;
    try {
      await api.admin.deleteCollection(id);
      notifyDataChanged();
      load();
    } catch (err) {
      alert('Failed to delete collection: ' + (err.error || 'Server error'));
    }
  };

  return (
    <div>
      <AdminCard
        title={`Collections (${collections.length})`}
        subtitle="Manage product categories, hero banners, taglines, and collection pages"
        actions={
          <button
            onClick={handleOpenAdd}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.6rem 1.15rem',
              background: '#B8976C',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Plus size={16} /> Add New Collection
          </button>
        }
      >
        {loading ? (
          <p style={{ color: '#94A3B8' }}>Loading collections...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))', gap: '1.25rem' }}>
            {collections.map(c => (
              <div
                key={c.id}
                style={{
                  border: '1px solid #E2E8F0',
                  borderRadius: 10,
                  overflow: 'hidden',
                  background: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'box-shadow 0.2s',
                }}
              >
                {/* Hero Header / Image */}
                <div style={{
                  height: 120,
                  background: c.hero_image ? `url(${c.hero_image}) center/cover` : 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: '1rem',
                }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)' }} />
                  <div style={{ position: 'relative', zIndex: 2 }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', color: '#E5C79E', letterSpacing: '0.06em' }}>
                      {c.category || 'Collection'}
                    </span>
                    <h4 style={{ margin: '0.15rem 0 0', color: '#fff', fontSize: '1.05rem', fontWeight: 600 }}>{c.name}</h4>
                  </div>
                </div>

                <div style={{ padding: '1.2rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B', fontFamily: 'monospace', marginBottom: '0.4rem' }}>
                      /collections/{c.slug}
                    </div>
                    <p style={{ fontSize: '0.82rem', color: '#475569', margin: '0 0 0.75rem', lineHeight: 1.45 }}>
                      {c.tagline || c.description || 'Architectural door series.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          localStorage.setItem('nid_admin_filter_col', String(c.id));
                        } catch {}
                        if (onNavigate) onNavigate('/admin/products');
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontSize: '0.76rem',
                        color: '#0F172A',
                        background: '#F1F5F9',
                        padding: '0.25rem 0.6rem',
                        borderRadius: 4,
                        fontWeight: 600,
                        border: 'none',
                        cursor: onNavigate ? 'pointer' : 'default',
                        textAlign: 'left'
                      }}
                      title="Click to view and filter doors in this collection"
                    >
                      <Package size={13} style={{ color: '#B8976C' }} /> {c.products_count ?? c.product_count ?? (Array.isArray(c.products) ? c.products.length : 0)} products
                    </button>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', borderTop: '1px solid #F1F5F9', paddingTop: '0.85rem' }}>
                    <button
                      onClick={() => handleOpenEdit(c)}
                      style={{
                        flex: 1,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                        padding: '0.45rem',
                        background: '#F1F5F9',
                        color: '#0F172A',
                        border: '1px solid #CBD5E1',
                        borderRadius: 6,
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      <Edit size={13} /> Edit
                    </button>

                    <a
                      href={`/collections/${c.slug}`}
                      target="_blank"
                      rel="noopener"
                      style={{
                        padding: '0.45rem 0.65rem',
                        background: '#F8FAFC',
                        color: '#64748B',
                        border: '1px solid #E2E8F0',
                        borderRadius: 6,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textDecoration: 'none'
                      }}
                      title="View collection page"
                    >
                      <ExternalLink size={14} />
                    </a>

                    <button
                      onClick={() => handleDelete(c.id, c.name)}
                      style={{
                        padding: '0.45rem 0.65rem',
                        background: '#FEF2F2',
                        color: '#EF4444',
                        border: '1px solid #FECACA',
                        borderRadius: 6,
                        cursor: 'pointer'
                      }}
                      title="Delete collection"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>

      <CollectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        collection={editingCollection}
        onSaved={() => {
          setIsModalOpen(false);
          load();
        }}
      />
    </div>
  );
}

// ── Collection Modal (Add & Edit Form) ──
function CollectionModal({ isOpen, onClose, collection, onSaved }) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [material, setMaterial] = useState('');
  const [finish, setFinish] = useState('');
  const [thickness, setThickness] = useState('');
  const [application, setApplication] = useState('');
  const [heroImage, setHeroImage] = useState('');
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (collection) {
      setName(collection.name || '');
      setSlug(collection.slug || '');
      setCategory(collection.category || '');
      setTagline(collection.tagline || '');
      setDescription(collection.description || '');
      setMaterial(collection.material || '');
      setFinish(collection.finish || '');
      setThickness(collection.thickness || '');
      setApplication(collection.application || '');
      setHeroImage(collection.hero_image || '');
      setFeatured(!!collection.featured);
      setPublished(collection.published !== 0);
    } else {
      setName('');
      setSlug('');
      setCategory('Membrane Doors');
      setTagline('');
      setDescription('');
      setMaterial('Engineered Seasoned Hardwood');
      setFinish('High Gloss UV / Textured');
      setThickness('30mm, 32mm, 35mm');
      setApplication('Internal Bed Rooms, Living Rooms');
      setHeroImage('');
      setFeatured(false);
      setPublished(true);
    }
    setError('');
  }, [collection, isOpen]);

  const handleNameChange = (val) => {
    setName(val);
    if (!collection) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      setError('Collection name and URL slug are required.');
      return;
    }
    setSaving(true);
    setError('');

    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      category: category.trim(),
      tagline: tagline.trim(),
      description: description.trim(),
      material: material.trim(),
      finish: finish.trim(),
      thickness: thickness.trim(),
      application: application.trim(),
      hero_image: heroImage.trim(),
      featured: featured ? 1 : 0,
      published: published ? 1 : 0,
    };

    try {
      if (collection?.id) {
        await api.admin.updateCollection(collection.id, payload);
      } else {
        await api.admin.createCollection(payload);
      }
      notifyDataChanged();
      onSaved();
    } catch (err) {
      setError(err.error || err.message || 'Failed to save collection.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={collection ? `Edit Collection: ${collection.name}` : 'Add New Door Collection'}
      maxWidth={640}
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <div style={{ background: '#FEE2E2', border: '1px solid #F87171', color: '#991B1B', padding: '0.75rem 1rem', borderRadius: 6, marginBottom: '1.25rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Collection Name *</label>
          <input
            type="text"
            required
            placeholder="e.g. Marble Membrane Doors"
            value={name}
            onChange={e => handleNameChange(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={labelStyle}>URL Slug *</label>
            <input
              type="text"
              required
              placeholder="e.g. marble-membrane"
              value={slug}
              onChange={e => setSlug(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Category Tag</label>
            <input
              type="text"
              placeholder="e.g. Membrane, WPVC, Veneer"
              value={category}
              onChange={e => setCategory(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Tagline / Hook</label>
          <input
            type="text"
            placeholder="e.g. Luxury Italian Marble Aesthetics with Waterproof WPVC Core"
            value={tagline}
            onChange={e => setTagline(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Specifications */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={labelStyle}>Core Material</label>
            <input
              type="text"
              placeholder="e.g. Seasoned Hardwood Core"
              value={material}
              onChange={e => setMaterial(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Surface Finish</label>
            <input
              type="text"
              placeholder="e.g. High Gloss UV Polymer"
              value={finish}
              onChange={e => setFinish(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={labelStyle}>Standard Thickness</label>
            <input
              type="text"
              placeholder="e.g. 30mm, 32mm, 35mm"
              value={thickness}
              onChange={e => setThickness(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Recommended Applications</label>
            <input
              type="text"
              placeholder="e.g. Master Bedrooms, Living Rooms"
              value={application}
              onChange={e => setApplication(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Full Description</label>
          <textarea
            rows={3}
            placeholder="Detailed overview for collection landing page"
            value={description}
            onChange={e => setDescription(e.target.value)}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <ImageUploadField
            value={heroImage}
            onChange={setHeroImage}
            label="Hero Background Image (URL or Upload)"
          />
        </div>

        <div style={{ display: 'flex', gap: '2rem', padding: '0.75rem 0', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', marginBottom: '1.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, color: '#1E293B' }}>
            <input
              type="checkbox"
              checked={featured}
              onChange={e => setFeatured(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: '#B8976C' }}
            />
            Featured on Homepage
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, color: '#1E293B' }}>
            <input
              type="checkbox"
              checked={published}
              onChange={e => setPublished(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: '#10B981' }}
            />
            Published / Active
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.65rem 1.25rem',
              background: '#F1F5F9',
              color: '#475569',
              border: '1px solid #CBD5E1',
              borderRadius: 6,
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.65rem 1.5rem',
              background: '#B8976C',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Check size={16} /> {saving ? 'Saving...' : collection ? 'Update Collection' : 'Create Collection'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ── Enquiries Section ──
function EnquiriesSection() {
  const [enquiries, setEnquiries] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => { setLoading(true); api.admin.getEnquiries(filter).then(d => { setEnquiries(d); setLoading(false); }).catch(() => setLoading(false)); };
  useEffect(load, [filter]);

  const updateStatus = async (id, status) => {
    await api.admin.updateEnquiry(id, { status });
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this customer enquiry?')) return;
    await api.admin.deleteEnquiry(id);
    load();
  };

  return (
    <AdminCard
      title={`Enquiries (${enquiries.length})`}
      subtitle="Inbound customer and trade quotation requests from website forms"
      actions={
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['', 'new', 'contacted', 'closed'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                padding: '0.4rem 0.8rem', fontSize: '0.76rem', fontWeight: 600,
                borderRadius: 6, cursor: 'pointer',
                background: filter === s ? '#0F172A' : '#F1F5F9',
                color: filter === s ? '#fff' : '#475569',
                border: 'none', fontFamily: 'var(--font-sans)',
              }}
            >
              {s ? s.toUpperCase() : 'ALL'}
            </button>
          ))}
        </div>
      }
    >
      {loading ? <p style={{ color: '#94A3B8' }}>Loading enquiries...</p> : enquiries.length === 0 ? (
        <p style={{ color: '#94A3B8', textAlign: 'center', padding: '2.5rem' }}>No enquiries found under this filter.</p>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table" style={{ borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                {['Customer', 'Contact Info', 'Customer Type', 'Message / Notes', 'Status', 'Received', ''].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#475569', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {enquiries.map(enq => (
                <tr key={enq.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#0F172A' }}>{enq.name}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ color: '#1E293B', fontWeight: 500 }}>{enq.phone}</div>
                    {enq.email && <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{enq.email}</div>}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: '#64748B' }}>
                    <span style={{ background: '#F1F5F9', padding: '0.2rem 0.5rem', borderRadius: 4, fontSize: '0.75rem' }}>
                      {enq.customer_type || 'Customer'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: '#475569', maxWidth: 280, fontSize: '0.8rem' }}>
                    {enq.message || '—'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <select
                      value={enq.status}
                      onChange={e => updateStatus(enq.id, e.target.value)}
                      style={{ padding: '0.3rem 0.5rem', border: '1px solid #CBD5E1', borderRadius: 6, fontSize: '0.78rem', cursor: 'pointer', fontWeight: 500 }}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: '#94A3B8', fontSize: '0.78rem' }}>
                    {enq.created_at ? new Date(enq.created_at).toLocaleDateString() : '—'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                    <button onClick={() => handleDelete(enq.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: '0.3rem' }} title="Delete Enquiry">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminCard>
  );
}

// ── Branches Section (Full Add & Edit Functionality) ──
function BranchesSection() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);

  const load = () => {
    setLoading(true);
    api.admin.getBranches().then(d => { setBranches(d); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(load, []);

  const handleOpenAdd = () => {
    setEditingBranch(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (branch) => {
    setEditingBranch(branch);
    setIsModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete branch "${name}"?`)) return;
    try {
      await api.admin.deleteBranch(id);
      notifyDataChanged();
      load();
    } catch (err) {
      alert('Failed to delete branch: ' + (err.error || 'Server error'));
    }
  };

  return (
    <div>
      <AdminCard
        title={`Showrooms & Branches (${branches.length})`}
        subtitle="Manage showroom locations, factory units, contact numbers, and Google Maps links"
        actions={
          <button
            onClick={handleOpenAdd}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.6rem 1.15rem',
              background: '#B8976C',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Plus size={16} /> Add New Branch
          </button>
        }
      >
        {loading ? <p style={{ color: '#94A3B8' }}>Loading branch directory...</p> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))', gap: '1.25rem' }}>
            {branches.map(b => (
              <div key={b.id} style={{ border: '1px solid #E2E8F0', borderRadius: 8, padding: '1.4rem', background: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', color: '#B8976C', letterSpacing: '0.05em' }}>
                      {b.category || 'Showroom'}
                    </span>
                    {b.badge && (
                      <span style={{ fontSize: '0.68rem', background: '#FEF3C7', color: '#92400E', padding: '0.15rem 0.45rem', borderRadius: 4, fontWeight: 600 }}>
                        {b.badge}
                      </span>
                    )}
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#0F172A', margin: '0 0 0.5rem' }}>{b.name}</h4>
                  <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.5, margin: '0 0 0.5rem' }}>{b.address}</p>
                  <div style={{ fontSize: '0.82rem', color: '#1E293B', fontWeight: 500, marginBottom: '0.35rem' }}>
                    📞 {b.phone} {b.phone_alt ? `• ${b.phone_alt}` : ''}
                  </div>
                  {b.timings && (
                    <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                      🕒 {b.timings}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', borderTop: '1px solid #F1F5F9', paddingTop: '0.85rem' }}>
                  <button
                    onClick={() => handleOpenEdit(b)}
                    style={{
                      flex: 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                      padding: '0.45rem',
                      background: '#F1F5F9',
                      color: '#0F172A',
                      border: '1px solid #CBD5E1',
                      borderRadius: 6,
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <Edit size={13} /> Edit Branch
                  </button>
                  {b.map_url && (
                    <a
                      href={b.map_url}
                      target="_blank"
                      rel="noopener"
                      style={{
                        padding: '0.45rem 0.65rem',
                        background: '#F8FAFC',
                        color: '#64748B',
                        border: '1px solid #E2E8F0',
                        borderRadius: 6,
                        display: 'inline-flex',
                        alignItems: 'center',
                        textDecoration: 'none'
                      }}
                      title="Open Google Maps"
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(b.id, b.name)}
                    style={{
                      padding: '0.45rem 0.65rem',
                      background: '#FEF2F2',
                      color: '#EF4444',
                      border: '1px solid #FECACA',
                      borderRadius: 6,
                      cursor: 'pointer'
                    }}
                    title="Delete branch"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>

      <BranchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        branch={editingBranch}
        onSaved={() => {
          setIsModalOpen(false);
          load();
        }}
      />
    </div>
  );
}

// ── Branch Modal (Add & Edit Form) ──
function BranchModal({ isOpen, onClose, branch, onSaved }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [badge, setBadge] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneAlt, setPhoneAlt] = useState('');
  const [timings, setTimings] = useState('');
  const [mapUrl, setMapUrl] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (branch) {
      setName(branch.name || '');
      setCategory(branch.category || 'Showroom');
      setBadge(branch.badge || '');
      setAddress(branch.address || '');
      setPhone(branch.phone || '');
      setPhoneAlt(branch.phone_alt || '');
      setTimings(branch.timings || '');
      setMapUrl(branch.map_url || '');
      setDescription(branch.description || '');
    } else {
      setName('');
      setCategory('Showroom');
      setBadge('');
      setAddress('');
      setPhone('+91 94431 55655');
      setPhoneAlt('');
      setTimings('Mon - Sat: 9:30 AM - 8:30 PM');
      setMapUrl('');
      setDescription('');
    }
    setError('');
  }, [branch, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !address.trim() || !phone.trim()) {
      setError('Branch name, address, and primary phone are required.');
      return;
    }
    setSaving(true);
    setError('');

    const payload = {
      name: name.trim(),
      category: category.trim(),
      badge: badge.trim(),
      address: address.trim(),
      phone: phone.trim(),
      phone_alt: phoneAlt.trim(),
      timings: timings.trim(),
      map_url: mapUrl.trim(),
      description: description.trim(),
    };

    try {
      if (branch?.id) {
        await api.admin.updateBranch(branch.id, payload);
      } else {
        await api.admin.createBranch(payload);
      }
      notifyDataChanged();
      onSaved();
    } catch (err) {
      setError(err.error || err.message || 'Failed to save branch.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={branch ? `Edit Branch: ${branch.name}` : 'Add New Branch / Showroom'}
      maxWidth={600}
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <div style={{ background: '#FEE2E2', border: '1px solid #F87171', color: '#991B1B', padding: '0.75rem 1rem', borderRadius: 6, marginBottom: '1.25rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Branch Name *</label>
          <input
            type="text"
            required
            placeholder="e.g. Thillai Nagar Flagship Showroom"
            value={name}
            onChange={e => setName(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={labelStyle}>Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              style={inputStyle}
            >
              <option value="Showroom">Showroom</option>
              <option value="Factory">Factory</option>
              <option value="Warehouse">Warehouse</option>
              <option value="Corporate Office">Corporate Office</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Badge / Highlight</label>
            <input
              type="text"
              placeholder="e.g. Flagship / Main Experience Centre"
              value={badge}
              onChange={e => setBadge(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Full Physical Address *</label>
          <textarea
            rows={2}
            required
            placeholder="Building, Street, Landmark, Trichy - 620018"
            value={address}
            onChange={e => setAddress(e.target.value)}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={labelStyle}>Primary Phone *</label>
            <input
              type="text"
              required
              placeholder="+91 94431 55655"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Alternate Phone / WhatsApp</label>
            <input
              type="text"
              placeholder="+91 98424 55655"
              value={phoneAlt}
              onChange={e => setPhoneAlt(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={labelStyle}>Working Timings</label>
            <input
              type="text"
              placeholder="Mon - Sat: 9:30 AM - 8:30 PM"
              value={timings}
              onChange={e => setTimings(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Google Maps Link</label>
            <input
              type="text"
              placeholder="https://maps.app.goo.gl/..."
              value={mapUrl}
              onChange={e => setMapUrl(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.65rem 1.25rem',
              background: '#F1F5F9',
              color: '#475569',
              border: '1px solid #CBD5E1',
              borderRadius: 6,
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.65rem 1.5rem',
              background: '#B8976C',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Check size={16} /> {saving ? 'Saving...' : branch ? 'Update Branch' : 'Create Branch'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ── Testimonials Section (Full Add & Edit Functionality) ──
function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);

  const load = () => { setLoading(true); api.admin.getTestimonials().then(d => { setTestimonials(d); setLoading(false); }).catch(() => setLoading(false)); };
  useEffect(load, []);

  const handleOpenAdd = () => {
    setEditingTestimonial(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t) => {
    setEditingTestimonial(t);
    setIsModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete testimonial from "${name}"?`)) return;
    try {
      await api.admin.deleteTestimonial(id);
      notifyDataChanged();
      load();
    } catch (err) {
      alert('Failed to delete testimonial: ' + (err.error || 'Server error'));
    }
  };

  return (
    <div>
      <AdminCard
        title={`Architect & Client Testimonials (${testimonials.length})`}
        subtitle="Manage customer quotes, architect reviews, ratings, and showcased projects"
        actions={
          <button
            onClick={handleOpenAdd}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.6rem 1.15rem',
              background: '#B8976C',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Plus size={16} /> Add Testimonial
          </button>
        }
      >
        {loading ? <p style={{ color: '#94A3B8' }}>Loading testimonials...</p> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))', gap: '1.25rem' }}>
            {testimonials.map(t => (
              <div key={t.id} style={{ border: '1px solid #E2E8F0', borderRadius: 8, padding: '1.4rem', background: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', marginBottom: '0.75rem', color: '#D97706' }}>
                    {[...Array(t.rating || 5)].map((_, idx) => (
                      <Star key={idx} size={15} fill="#D97706" color="#D97706" />
                    ))}
                  </div>
                  <div style={{ fontStyle: 'italic', color: '#334155', marginBottom: '0.85rem', lineHeight: 1.5, fontSize: '0.88rem' }}>
                    "{t.quote}"
                  </div>
                  <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.9rem' }}>{t.name}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                    {t.role} {t.company ? `• ${t.company}` : ''}
                  </div>
                  {t.project && (
                    <div style={{ fontSize: '0.75rem', color: '#B8976C', marginTop: '0.25rem', fontWeight: 500 }}>
                      Project: {t.project}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', borderTop: '1px solid #F1F5F9', paddingTop: '0.85rem' }}>
                  <button
                    onClick={() => handleOpenEdit(t)}
                    style={{
                      flex: 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                      padding: '0.45rem',
                      background: '#F1F5F9',
                      color: '#0F172A',
                      border: '1px solid #CBD5E1',
                      borderRadius: 6,
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <Edit size={13} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(t.id, t.name)}
                    style={{
                      padding: '0.45rem 0.65rem',
                      background: '#FEF2F2',
                      color: '#EF4444',
                      border: '1px solid #FECACA',
                      borderRadius: 6,
                      cursor: 'pointer'
                    }}
                    title="Delete testimonial"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>

      <TestimonialModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        testimonial={editingTestimonial}
        onSaved={() => {
          setIsModalOpen(false);
          load();
        }}
      />
    </div>
  );
}

// ── Testimonial Modal (Add & Edit Form) ──
function TestimonialModal({ isOpen, onClose, testimonial, onSaved }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [project, setProject] = useState('');
  const [rating, setRating] = useState(5);
  const [quote, setQuote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (testimonial) {
      setName(testimonial.name || '');
      setRole(testimonial.role || '');
      setCompany(testimonial.company || '');
      setLocation(testimonial.location || '');
      setProject(testimonial.project || '');
      setRating(testimonial.rating || 5);
      setQuote(testimonial.quote || '');
    } else {
      setName('');
      setRole('Architect / Homeowner');
      setCompany('');
      setLocation('Trichy');
      setProject('');
      setRating(5);
      setQuote('');
    }
    setError('');
  }, [testimonial, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !quote.trim()) {
      setError('Client name and review quote are required.');
      return;
    }
    setSaving(true);
    setError('');

    const payload = {
      name: name.trim(),
      role: role.trim(),
      company: company.trim(),
      location: location.trim(),
      project: project.trim(),
      rating: parseInt(rating) || 5,
      quote: quote.trim(),
    };

    try {
      if (testimonial?.id) {
        await api.admin.updateTestimonial(testimonial.id, payload);
      } else {
        await api.admin.createTestimonial(payload);
      }
      notifyDataChanged();
      onSaved();
    } catch (err) {
      setError(err.error || err.message || 'Failed to save testimonial.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={testimonial ? `Edit Testimonial: ${testimonial.name}` : 'Add Client / Architect Testimonial'}
      maxWidth={560}
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <div style={{ background: '#FEE2E2', border: '1px solid #F87171', color: '#991B1B', padding: '0.75rem 1rem', borderRadius: 6, marginBottom: '1.25rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Client / Architect Name *</label>
          <input
            type="text"
            required
            placeholder="e.g. Ar. S. Ramanathan"
            value={name}
            onChange={e => setName(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={labelStyle}>Designation / Role</label>
            <input
              type="text"
              placeholder="e.g. Principal Architect"
              value={role}
              onChange={e => setRole(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Firm / Company</label>
            <input
              type="text"
              placeholder="e.g. Apex Design Studio"
              value={company}
              onChange={e => setCompany(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={labelStyle}>Project Name</label>
            <input
              type="text"
              placeholder="e.g. Luxury Villa Project, K.K. Nagar"
              value={project}
              onChange={e => setProject(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Star Rating</label>
            <select
              value={rating}
              onChange={e => setRating(e.target.value)}
              style={inputStyle}
            >
              <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
              <option value="4">⭐⭐⭐⭐ 4 Stars</option>
              <option value="3">⭐⭐⭐ 3 Stars</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={labelStyle}>Quote / Review Text *</label>
          <textarea
            rows={4}
            required
            placeholder="Their feedback on the door craftsmanship, moisture resistance, delivery, or aesthetic appeal..."
            value={quote}
            onChange={e => setQuote(e.target.value)}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.65rem 1.25rem',
              background: '#F1F5F9',
              color: '#475569',
              border: '1px solid #CBD5E1',
              borderRadius: 6,
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.65rem 1.5rem',
              background: '#B8976C',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Check size={16} /> {saving ? 'Saving...' : testimonial ? 'Update Testimonial' : 'Create Testimonial'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ── Homepage Content Section ──
function HomepageSection() {
  const [content, setContent] = useState({
    hero_title: '',
    hero_subtitle: '',
    hero_description: '',
    hero_badge: '',
    intro_statement: '',
    intro_description: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.admin.getHomepage()
      .then(d => {
        if (d && Object.keys(d).length > 0) {
          setContent({
            hero_title: d.hero_title || d.hero?.title || '',
            hero_subtitle: d.hero_subtitle || d.hero?.subtitle || '',
            hero_description: d.hero_description || d.hero?.description || '',
            hero_badge: d.hero_badge || d.hero?.badge || '',
            intro_statement: d.intro_statement || d.intro?.statement || '',
            intro_description: d.intro_description || d.intro?.description || '',
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e?.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...content,
        hero: {
          title: content.hero_title,
          subtitle: content.hero_subtitle,
          description: content.hero_description,
          badge: content.hero_badge,
          cta_primary: 'Explore Collections',
          cta_secondary: 'Request a Quote'
        },
        intro: {
          statement: content.intro_statement,
          description: content.intro_description,
          cta: 'Discover New Ikon'
        }
      };
      await api.admin.updateHomepage(payload);
      notifyDataChanged();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert('Failed to save homepage content: ' + (err.error || err.message || 'Server error'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AdminCard title="Homepage Content"><p style={{ color: '#94A3B8' }}>Loading homepage content...</p></AdminCard>;

  return (
    <AdminCard title="Homepage Content & Hero Copy" subtitle="Update headline copy, tagline, intro statement, and hero badge text shown on the public homepage">
      <form onSubmit={handleSave} style={{ display: 'grid', gap: '1.25rem', maxWidth: 700 }}>
        <div>
          <label style={labelStyle}>Hero Badge Text</label>
          <input
            type="text"
            value={content.hero_badge || ''}
            onChange={e => setContent({ ...content, hero_badge: e.target.value })}
            style={inputStyle}
            placeholder="e.g. New Ikon Doors • Manufacturing & Wholesale HQ"
          />
        </div>

        <div>
          <label style={labelStyle}>Hero Main Title (H1)</label>
          <input
            type="text"
            value={content.hero_title || ''}
            onChange={e => setContent({ ...content, hero_title: e.target.value })}
            style={inputStyle}
            placeholder="e.g. New Ikon Doors"
          />
        </div>

        <div>
          <label style={labelStyle}>Hero Subtitle</label>
          <input
            type="text"
            value={content.hero_subtitle || ''}
            onChange={e => setContent({ ...content, hero_subtitle: e.target.value })}
            style={inputStyle}
            placeholder="e.g. Doors that define the space."
          />
        </div>

        <div>
          <label style={labelStyle}>Hero Description</label>
          <textarea
            rows={3}
            value={content.hero_description || ''}
            onChange={e => setContent({ ...content, hero_description: e.target.value })}
            style={{ ...inputStyle, resize: 'vertical' }}
            placeholder="Brief overview shown under the hero title..."
          />
        </div>

        <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '1.25rem' }}>
          <label style={labelStyle}>The New Ikon Difference - Statement Heading</label>
          <input
            type="text"
            value={content.intro_statement || ''}
            onChange={e => setContent({ ...content, intro_statement: e.target.value })}
            style={inputStyle}
            placeholder="e.g. Premium doors designed to become part of the architecture."
          />
        </div>

        <div>
          <label style={labelStyle}>The New Ikon Difference - Description</label>
          <textarea
            rows={3}
            value={content.intro_description || ''}
            onChange={e => setContent({ ...content, intro_description: e.target.value })}
            style={{ ...inputStyle, resize: 'vertical' }}
            placeholder="Detailed statement explaining company manufacturing strengths..."
          />
        </div>

        <div style={{ paddingTop: '0.5rem' }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.65rem 1.6rem', background: saved ? '#10B981' : '#B8976C', color: '#fff',
              border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, fontFamily: 'var(--font-sans)',
            }}
          >
            {saved ? <><Check size={15} /> Homepage Content Saved!</> : saving ? 'Saving...' : 'Save Homepage Content'}
          </button>
        </div>
      </form>
    </AdminCard>
  );
}

// ── Icon Helper for USPs ──
const renderUspIcon = (iconName, size = 20) => {
  switch (iconName) {
    case 'Cpu': return <Cpu size={size} />;
    case 'Droplets': return <Droplets size={size} />;
    case 'Maximize2': return <Maximize2 size={size} />;
    case 'Users': return <Users size={size} />;
    case 'ShieldCheck': return <ShieldCheck size={size} />;
    case 'Sparkles':
    default: return <Sparkles size={size} />;
  }
};

// ── USPs Section (Strict Architectural Verification) ──
function UspsSection() {
  const [usps, setUsps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUsp, setEditingUsp] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.admin.getUsps();
      setUsps(data || []);
    } catch (err) {
      console.error('Failed to load USPs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleOpenAdd = () => {
    setEditingUsp(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (u) => {
    setEditingUsp(u);
    setIsModalOpen(true);
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Are you sure you want to delete USP: "${title}"?`)) return;
    try {
      await api.admin.deleteUsp(id);
      notifyDataChanged();
      loadData();
    } catch (err) {
      alert('Failed to delete USP: ' + (err.message || 'Server error'));
    }
  };

  return (
    <div>
      {/* Strict Verification Banner */}
      <div style={{
        background: '#EFF6FF',
        border: '1px solid #BFDBFE',
        borderRadius: 8,
        padding: '1rem 1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem'
      }}>
        <ShieldCheck size={22} color="#2563EB" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1E40AF' }}>
            Architectural Verification Governance Rule
          </div>
          <div style={{ fontSize: '0.8rem', color: '#1E3A8A', marginTop: '0.2rem', lineHeight: 1.5 }}>
            To protect architectural credibility and avoid false marketing claims, only technical specifications verified by New Ikon technical catalogues, factory test certificates, or wholesale group records may be published. Unverified claims cannot be set to "Published".
          </div>
        </div>
      </div>

      <AdminCard
        title={`Verified USPs & Core Features (${usps.length})`}
        subtitle="Manage the architectural strengths and manufacturing USPs displayed on the homepage and about page"
        actions={
          <button
            onClick={handleOpenAdd}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.6rem 1.15rem',
              background: '#B8976C',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Plus size={16} /> Add New USP
          </button>
        }
      >
        {loading ? (
          <p style={{ color: '#94A3B8' }}>Loading USPs...</p>
        ) : usps.length === 0 ? (
          <p style={{ color: '#64748B' }}>No USPs configured yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))', gap: '1.25rem' }}>
            {usps.map((u) => (
              <div
                key={u.id}
                style={{
                  border: '1px solid #E2E8F0',
                  borderRadius: 8,
                  padding: '1.4rem',
                  background: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{
                      width: 42,
                      height: 42,
                      borderRadius: 8,
                      background: 'rgba(184, 151, 108, 0.12)',
                      color: '#B8976C',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {renderUspIcon(u.icon, 20)}
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <span style={{
                        padding: '0.2rem 0.55rem',
                        borderRadius: 4,
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        background: u.verified ? '#D1FAE5' : '#FEF3C7',
                        color: u.verified ? '#065F46' : '#92400E',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        {u.verified ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                        {u.verified ? 'Verified Spec' : 'Pending Verification'}
                      </span>
                      <span style={{
                        padding: '0.2rem 0.55rem',
                        borderRadius: 4,
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        background: u.published ? '#DBEAFE' : '#F1F5F9',
                        color: u.published ? '#1E40AF' : '#64748B'
                      }}>
                        {u.published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </div>

                  <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.95rem', marginBottom: '0.4rem' }}>
                    {u.title}
                  </div>
                  <div style={{ fontSize: '0.84rem', color: '#64748B', lineHeight: 1.55 }}>
                    {u.description}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.75rem' }}>
                    Order: #{u.sort_order ?? 1} • Icon: {u.icon || 'Sparkles'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', borderTop: '1px solid #F1F5F9', paddingTop: '0.85rem' }}>
                  <button
                    onClick={() => handleOpenEdit(u)}
                    style={{
                      flex: 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                      padding: '0.45rem',
                      background: '#F1F5F9',
                      color: '#0F172A',
                      border: '1px solid #CBD5E1',
                      borderRadius: 6,
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <Edit size={13} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(u.id, u.title)}
                    style={{
                      padding: '0.45rem 0.65rem',
                      background: '#FEF2F2',
                      color: '#EF4444',
                      border: '1px solid #FECACA',
                      borderRadius: 6,
                      cursor: 'pointer'
                    }}
                    title="Delete USP"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>

      <UspModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        usp={editingUsp}
        onSaved={() => {
          setIsModalOpen(false);
          loadData();
        }}
      />
    </div>
  );
}

// ── USP Modal Component ──
function UspModal({ isOpen, onClose, usp, onSaved }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Sparkles');
  const [sortOrder, setSortOrder] = useState(1);
  const [verified, setVerified] = useState(true);
  const [published, setPublished] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (usp) {
      setTitle(usp.title || '');
      setDescription(usp.description || '');
      setIcon(usp.icon || 'Sparkles');
      setSortOrder(usp.sort_order ?? 1);
      setVerified(Boolean(usp.verified));
      setPublished(Boolean(usp.published));
    } else {
      setTitle('');
      setDescription('');
      setIcon('Sparkles');
      setSortOrder(1);
      setVerified(true);
      setPublished(true);
    }
    setError('');
  }, [usp, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Title and description are required.');
      return;
    }
    if (published && !verified) {
      setError('Architectural Governance Violation: An unverified claim cannot be published to the public website.');
      return;
    }

    setSaving(true);
    setError('');

    const payload = {
      title: title.trim(),
      description: description.trim(),
      icon,
      sort_order: parseInt(sortOrder) || 1,
      verified: Boolean(verified),
      published: Boolean(published && verified),
    };

    try {
      if (usp?.id) {
        await api.admin.updateUsp(usp.id, payload);
      } else {
        await api.admin.createUsp(payload);
      }
      notifyDataChanged();
      onSaved();
    } catch (err) {
      setError(err.message || 'Failed to save USP');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={usp ? `Edit Feature / USP: ${usp.title}` : 'Add Verified Feature / USP'}
      maxWidth={580}
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <div style={{ background: '#FEE2E2', border: '1px solid #F87171', color: '#991B1B', padding: '0.75rem 1rem', borderRadius: 6, marginBottom: '1.25rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '1.15rem' }}>
          <label style={labelStyle}>Feature / USP Title *</label>
          <input
            type="text"
            required
            placeholder="e.g. In-House CNC Precision"
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '1.15rem' }}>
          <label style={labelStyle}>Technical Description *</label>
          <textarea
            rows={3}
            required
            placeholder="Technical description of engineering, core materials, or manufacturing standard..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <label style={labelStyle}>Icon Symbol</label>
            <select
              value={icon}
              onChange={e => setIcon(e.target.value)}
              style={inputStyle}
            >
              <option value="Cpu">⚙️ Cpu (CNC Precision & Engineering)</option>
              <option value="Droplets">💧 Droplets (Water & Moisture Resistance)</option>
              <option value="Maximize2">📐 Maximize2 (Architectural Sizing)</option>
              <option value="Users">🏢 Users (Wholesale Group Synergies)</option>
              <option value="ShieldCheck">🛡️ ShieldCheck (Quality Assurance)</option>
              <option value="Sparkles">✨ Sparkles (Design Elegance)</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Sort Order</label>
            <input
              type="number"
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value)}
              style={inputStyle}
              min="1"
            />
          </div>
        </div>

        <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: 8, border: '1px solid #E2E8F0', marginBottom: '1.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', cursor: 'pointer', marginBottom: '0.75rem' }}>
            <input
              type="checkbox"
              checked={verified}
              onChange={e => {
                const val = e.target.checked;
                setVerified(val);
                if (!val) setPublished(false);
              }}
              style={{ marginTop: '0.2rem' }}
            />
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0F172A' }}>Verified Architectural Specification</span>
              <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.1rem' }}>
                Confirmed against official New Ikon technical catalog, CNC milling capacity, or certified group suppliers.
              </div>
            </div>
          </label>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', cursor: verified ? 'pointer' : 'not-allowed', opacity: verified ? 1 : 0.6 }}>
            <input
              type="checkbox"
              checked={published}
              disabled={!verified}
              onChange={e => setPublished(e.target.checked)}
              style={{ marginTop: '0.2rem' }}
            />
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0F172A' }}>Publish to Public Website</span>
              <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.1rem' }}>
                Display this USP in the homepage orbital animation and the About page standards section.
              </div>
            </div>
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.65rem 1.25rem',
              background: '#F1F5F9',
              color: '#475569',
              border: '1px solid #CBD5E1',
              borderRadius: 6,
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.65rem 1.5rem',
              background: '#B8976C',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Check size={16} /> {saving ? 'Saving...' : usp ? 'Update USP' : 'Create USP'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ── Catalogue Section (Secure PDF Management with Safe Replacement) ──
function CatalogueSection() {
  const [catalogueList, setCatalogueList] = useState([]);
  const [currentCatalogue, setCurrentCatalogue] = useState({
    title: 'New Ikon Doors Official Catalogue',
    file_url: '/catalogue/NEW_IKON_DOORS.pdf',
    version: '2026.1',
    published: true,
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const pdfInputRef = useRef(null);

  const loadData = async () => {
    try {
      const data = await api.admin.getCatalogue();
      if (Array.isArray(data) && data.length > 0) {
        setCatalogueList(data);
        const active = data.find(c => c.published || c.active) || data[0];
        setCurrentCatalogue(active);
      } else if (data && typeof data === 'object') {
        setCurrentCatalogue(data);
      }
    } catch (err) {
      console.warn('Could not load catalogue from DB:', err);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Strict PDF validation
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setError('File rejected: Only PDF catalogue documents are permitted.');
      if (pdfInputRef.current) pdfInputRef.current.value = '';
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError('File rejected: Catalogue PDF size cannot exceed 50MB.');
      if (pdfInputRef.current) pdfInputRef.current.value = '';
      return;
    }

    setUploading(true);
    setError('');
    setUploadProgress(`Uploading ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)...`);

    try {
      // Upload directly into the protected 'catalogue' storage bucket
      const res = await api.admin.uploadFile('catalogue', file, 'catalogue');
      if (res?.publicUrl) {
        // Safe replacement logic: Do not alter current active catalogue until new upload is verified
        setCurrentCatalogue(prev => ({
          ...prev,
          file_url: res.publicUrl,
          pdf_url: res.publicUrl,
          file_size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          version: `2026.${Date.now().toString().slice(-4)}`
        }));
        setUploadProgress('Upload complete! Please click "Save & Publish Master Catalogue" to activate.');
      }
    } catch (err) {
      setError('Upload failed: ' + (err.message || 'Storage error'));
    } finally {
      setUploading(false);
      if (pdfInputRef.current) pdfInputRef.current.value = '';
    }
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!currentCatalogue.file_url) {
      setError('A valid PDF URL or uploaded file is required.');
      return;
    }
    setSaving(true);
    setError('');

    try {
      await api.admin.updateCatalogue({
        title: currentCatalogue.title || 'New Ikon Doors Master Catalogue',
        file_url: currentCatalogue.file_url,
        pdf_url: currentCatalogue.file_url,
        version: currentCatalogue.version || '2026.1',
        file_size: currentCatalogue.file_size || '9.0 MB',
        published: true,
        active: true
      });
      notifyDataChanged();
      setSaved(true);
      loadData();
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError('Failed to save catalogue: ' + (err.message || 'Database error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 840 }}>
      {/* Security notice */}
      <div style={{
        background: '#F0FDF4',
        border: '1px solid #BBF7D0',
        borderRadius: 8,
        padding: '1rem 1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <FileCheck size={22} color="#16A34A" style={{ flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#15803D' }}>
            Production Catalogue Storage & Delivery
          </div>
          <div style={{ fontSize: '0.8rem', color: '#166534', marginTop: '0.2rem' }}>
            Catalogue files are stored in the secure Supabase "catalogue" bucket with MIME validation (PDF only). Safe replacement logic ensures the public website always serves a valid catalogue document.
          </div>
        </div>
      </div>

      <AdminCard
        title="Master Architectural Catalogue"
        subtitle="Manage the downloadable master door collection catalogue for architects, builders, and trade partners"
      >
        {error && (
          <div style={{ background: '#FEE2E2', border: '1px solid #F87171', color: '#991B1B', padding: '0.75rem 1rem', borderRadius: 6, marginBottom: '1.25rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSave}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>Catalogue Document Title *</label>
            <input
              type="text"
              required
              value={currentCatalogue.title || ''}
              onChange={e => setCurrentCatalogue({ ...currentCatalogue, title: e.target.value })}
              style={inputStyle}
              placeholder="e.g. New Ikon Doors Official Catalogue"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={labelStyle}>Catalogue Edition / Version</label>
              <input
                type="text"
                value={currentCatalogue.version || ''}
                onChange={e => setCurrentCatalogue({ ...currentCatalogue, version: e.target.value })}
                style={inputStyle}
                placeholder="e.g. 2026.1"
              />
            </div>
            <div>
              <label style={labelStyle}>Document File Size</label>
              <input
                type="text"
                value={currentCatalogue.file_size || '9.0 MB'}
                onChange={e => setCurrentCatalogue({ ...currentCatalogue, file_size: e.target.value })}
                style={inputStyle}
                placeholder="e.g. 9.0 MB"
              />
            </div>
          </div>

          {/* Current File Preview Card */}
          <div style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: 8,
            padding: '1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 8,
                background: '#FEF2F2',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FileText size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0F172A' }}>
                  {currentCatalogue.file_url ? currentCatalogue.file_url.split('/').pop() : 'NEW_IKON_DOORS.pdf'}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.15rem' }}>
                  Active Public PDF • Status: <span style={{ color: '#16A34A', fontWeight: 600 }}>Published</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem' }}>
              {currentCatalogue.file_url && (
                <a
                  href={currentCatalogue.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.55rem 1rem',
                    background: '#0F172A',
                    color: '#fff',
                    borderRadius: 6,
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    textDecoration: 'none'
                  }}
                >
                  <Eye size={14} /> Preview PDF
                </a>
              )}
            </div>
          </div>

          {/* Upload Replacement PDF */}
          <div style={{
            border: '2px dashed #CBD5E1',
            borderRadius: 8,
            padding: '1.75rem',
            textAlign: 'center',
            background: uploading ? '#F8FAFC' : '#fff',
            marginBottom: '1.5rem'
          }}>
            <input
              type="file"
              ref={pdfInputRef}
              accept="application/pdf,.pdf"
              onChange={handlePdfUpload}
              style={{ display: 'none' }}
              id="catalogue-pdf-uploader"
            />
            <label
              htmlFor="catalogue-pdf-uploader"
              style={{
                display: 'inline-flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: uploading ? 'wait' : 'pointer',
              }}
            >
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'rgba(184, 151, 108, 0.12)',
                color: '#B8976C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Upload size={22} />
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0F172A' }}>
                {uploading ? 'Uploading PDF to Secure Storage...' : 'Click to Upload Replacement Catalogue PDF'}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                Accepts official PDF documents only (up to 50MB)
              </div>
            </label>
            {uploadProgress && (
              <div style={{ marginTop: '0.75rem', fontSize: '0.82rem', color: '#2563EB', fontWeight: 500 }}>
                {uploadProgress}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              type="submit"
              disabled={saving || uploading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.65rem 1.6rem',
                background: saved ? '#10B981' : '#B8976C',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {saved ? <><Check size={16} /> Catalogue Saved & Published!</> : saving ? 'Saving...' : 'Save & Publish Master Catalogue'}
            </button>
          </div>
        </form>
      </AdminCard>
    </div>
  );
}

// ── Settings Section ──
function SettingsSection() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { api.admin.getSettings().then(d => { setSettings(d); setLoading(false); }).catch(() => setLoading(false)); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.admin.updateSettings(settings);
      notifyDataChanged();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch { alert('Failed to save settings.'); }
    setSaving(false);
  };

  if (loading) return <AdminCard title="Site Settings"><p style={{ color: '#94A3B8' }}>Loading site settings...</p></AdminCard>;

  return (
    <AdminCard title="Site Settings & Global Contact Details" subtitle="Update phone numbers, WhatsApp links, business hours, and showroom addresses displayed across header and footer">
      <div style={{ display: 'grid', gap: '1.25rem', maxWidth: 640 }}>
        {Object.entries(settings).map(([key, value]) => (
          <div key={key}>
            <label style={labelStyle}>{key.replace(/_/g, ' ')}</label>
            <input
              type="text"
              value={value || ''}
              onChange={e => setSettings({ ...settings, [key]: e.target.value })}
              style={inputStyle}
            />
          </div>
        ))}
        <div style={{ paddingTop: '0.5rem' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.65rem 1.6rem', background: saved ? '#10B981' : '#0F172A', color: '#fff',
              border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, fontFamily: 'var(--font-sans)',
            }}
          >
            {saved ? <><Check size={15} /> Settings Saved!</> : saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </AdminCard>
  );
}
