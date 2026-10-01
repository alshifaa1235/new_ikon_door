// ==============================================================================
// NEW IKON DOORS — CLIENT API & DATABASE SERVICE
// ==============================================================================
// Dual-mode architecture:
// 1. Direct Supabase Client + PostgreSQL RLS (when configured)
// 2. Resilient static fallback to embedded verified New Ikon Doors data
import companyData from '../data/company.json';
import productsData from '../data/products.json';
import testimonialsData from '../data/testimonials.json';
import { supabase, isSupabaseConfigured, authService, storageService, sanitizeError } from './supabaseClient';

const BASE = '';

// Helper to normalize product codes for flexible matching
function normalizeCode(str = '') {
  return String(str).toUpperCase().replace(/[^A-Z0-9]/g, '');
}

// Fallback collections resolver
function getFallbackCollections() {
  return (productsData.collections || []).map((c, i) => ({
    id: i + 1,
    name: c.name,
    slug: c.slug,
    description: c.description || '',
    category: c.category || '',
    tagline: c.tagline || '',
    cover_image: c.hero_image ? (c.hero_image.startsWith('/') || c.hero_image.startsWith('http') ? c.hero_image : `/doors/${c.hero_image}`) : '',
    hero_image: c.hero_image ? (c.hero_image.startsWith('/') || c.hero_image.startsWith('http') ? c.hero_image : `/doors/${c.hero_image}`) : '',
    material: c.material || '',
    finish: c.finish || '',
    thickness: c.thickness || '',
    application: c.application || '',
    published: c.published !== false,
    featured: Boolean(c.featured),
    sort_order: c.display_order || i,
    product_count: c.products ? c.products.length : 0
  }));
}

// Fallback collection detail resolver
function getFallbackCollection(slug) {
  const col = (productsData.collections || []).find(c => c.slug === slug);
  if (!col) return null;
  const colHero = col.hero_image ? (col.hero_image.startsWith('/') || col.hero_image.startsWith('http') ? col.hero_image : `/doors/${col.hero_image}`) : '';
  return {
    ...col,
    cover_image: colHero,
    hero_image: colHero,
    products: (col.products || []).map(p => formatProduct(p, col))
  };
}

// Format product record consistently
function formatProduct(p, col = null) {
  let specs = p.specs || {};
  let features = p.features || [];
  if (typeof specs === 'string') {
    try { specs = JSON.parse(specs); } catch { specs = {}; }
  }
  if (typeof features === 'string') {
    try { features = JSON.parse(features); } catch { features = []; }
  }

  const primaryImg = p.primary_image || p.image || '';
  const cleanImg = primaryImg ? (primaryImg.startsWith('/') || primaryImg.startsWith('http') ? primaryImg : `/doors/${primaryImg}`) : '';

  return {
    ...p,
    id: p.id,
    code: p.product_code || p.code || '',
    product_code: p.product_code || p.code || '',
    name: p.name || `Door ${p.product_code || p.code}`,
    slug: p.slug || (p.code ? p.code.toLowerCase().replace(/[^a-z0-9]+/g, '-') : ''),
    collection_id: p.collection_id || (col ? col.id : null),
    collection_slug: p.collection_slug || (col ? col.slug : ''),
    collection_name: p.collection_name || (col ? col.name : ''),
    primary_image: cleanImg,
    image: cleanImg,
    lifestyle_image: p.lifestyle_image ? (p.lifestyle_image.startsWith('/') || p.lifestyle_image.startsWith('http') ? p.lifestyle_image : `/doors/${p.lifestyle_image}`) : '',
    specs,
    features,
    published: p.published !== false && p.published !== 0,
    featured: Boolean(p.featured)
  };
}

// Fallback product resolver
function getFallbackProduct(codeSlug) {
  const cleanTarget = normalizeCode(decodeURIComponent(codeSlug));
  for (const col of (productsData.collections || [])) {
    const found = (col.products || []).find(p => normalizeCode(p.code) === cleanTarget);
    if (found) {
      const related = (col.products || [])
        .filter(p => normalizeCode(p.code) !== cleanTarget)
        .slice(0, 4)
        .map(p => formatProduct(p, col));
      return {
        ...formatProduct(found, col),
        related
      };
    }
  }
  return null;
}

// Fallback verified USPs
const fallbackUsps = [
  {
    id: 1,
    title: 'In-House CNC Precision',
    description: 'Computer numerical control routing and vacuum-press membrane bonding for crisp geometric motifs and structural consistency.',
    icon: 'Cpu',
    verified: true,
    published: true,
    sort_order: 1
  },
  {
    id: 2,
    title: 'Water & Moisture Resistance',
    description: 'Multi-layer protective polymer coats and WPVC compositions engineered to endure humid regional climates.',
    icon: 'Droplets',
    verified: true,
    published: true,
    sort_order: 2
  },
  {
    id: 3,
    title: 'Architectural Customization',
    description: 'Custom door dimensions, distinct wood-grain tones, authentic marble veining, and metallic stainless steel inlays.',
    icon: 'Layers',
    verified: true,
    published: true,
    sort_order: 3
  },
  {
    id: 4,
    title: 'Wholesale Group Synergies',
    description: 'Direct coordination with sister divisions Classic Ply & Lam and Royal Lam & Ply for consolidated trade supply.',
    icon: 'ShieldCheck',
    verified: true,
    published: true,
    sort_order: 4
  }
];

export const api = {
  // ── COLLECTIONS ──
  async getCollections() {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('collections')
          .select('*, products(id)')
          .eq('published', true)
          .order('sort_order', { ascending: true });

        if (!error && data && data.length > 0) {
          return data.map(c => ({
            ...c,
            product_count: c.products ? c.products.length : 0
          }));
        }
      } catch (e) {
        console.warn('Supabase getCollections fallback:', e);
      }
    }
    return getFallbackCollections();
  },

  async getCollection(slug) {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: col, error } = await supabase
          .from('collections')
          .select('*')
          .eq('slug', slug)
          .single();

        if (!error && col) {
          const { data: prods } = await supabase
            .from('products')
            .select('*')
            .eq('collection_id', col.id)
            .eq('published', true)
            .order('sort_order', { ascending: true });

          return {
            ...col,
            products: (prods || []).map(p => formatProduct(p, col))
          };
        }
      } catch (e) {
        console.warn('Supabase getCollection fallback:', e);
      }
    }
    return getFallbackCollection(slug);
  },

  // ── PRODUCTS ──
  async getProducts(params = {}) {
    if (isSupabaseConfigured() && supabase) {
      try {
        let q = supabase
          .from('products')
          .select('*, collections(name, slug)')
          .eq('published', true);

        if (params.featured === '1') {
          q = q.eq('featured', true);
        }
        if (params.search) {
          const s = `%${params.search.trim()}%`;
          q = q.or(`product_code.ilike.${s},name.ilike.${s},description.ilike.${s}`);
        }
        if (params.limit) {
          q = q.limit(parseInt(params.limit, 10));
        }
        q = q.order('sort_order', { ascending: true });

        const { data, error } = await q;
        if (!error && data) {
          return data.map(p => ({
            ...formatProduct(p),
            collection_name: p.collections?.name || '',
            collection_slug: p.collections?.slug || ''
          }));
        }
      } catch (e) {
        console.warn('Supabase getProducts fallback:', e);
      }
    }

    // Static fallback
    const all = (productsData.collections || []).flatMap(c => (c.products || []).map(p => formatProduct(p, c)));
    if (params.search) {
      const q = params.search.toLowerCase();
      return all.filter(p => p.code.toLowerCase().includes(q) || p.collection_name.toLowerCase().includes(q));
    }
    if (params.featured === '1') {
      const feats = all.filter(p => p.featured);
      return feats.slice(0, parseInt(params.limit) || 8);
    }
    if (params.limit) {
      return all.slice(0, parseInt(params.limit));
    }
    return all;
  },

  async getProduct(codeSlug) {
    if (isSupabaseConfigured() && supabase) {
      try {
        const clean = decodeURIComponent(codeSlug).trim();
        let { data, error } = await supabase
          .from('products')
          .select('*, collections(*)')
          .or(`product_code.eq.${clean},code.eq.${clean},slug.eq.${clean.toLowerCase()}`)
          .single();

        if (data) {
          let related = [];
          if (data.collection_id) {
            const { data: rel } = await supabase
              .from('products')
              .select('*')
              .eq('collection_id', data.collection_id)
              .neq('id', data.id)
              .eq('published', true)
              .limit(4);
            related = (rel || []).map(r => formatProduct(r, data.collections));
          }

          return {
            ...formatProduct(data, data.collections),
            collection_name: data.collections?.name || '',
            collection_slug: data.collections?.slug || '',
            related
          };
        }
      } catch (e) {
        console.warn('Supabase getProduct fallback:', e);
      }
    }
    return getFallbackProduct(codeSlug);
  },

  async getFeaturedProducts(limit = 8) {
    return this.getProducts({ featured: '1', limit });
  },

  async searchProducts(query) {
    return this.getProducts({ search: query });
  },

  // ── BRANCHES ──
  async getBranches() {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('branches')
          .select('*')
          .eq('published', true)
          .order('sort_order', { ascending: true });

        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (e) {
        console.warn('Supabase getBranches fallback:', e);
      }
    }
    return companyData.branches || [];
  },

  // ── TESTIMONIALS ──
  async getTestimonials() {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('testimonials')
          .select('*')
          .eq('published', true)
          .order('sort_order', { ascending: true });

        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (e) {
        console.warn('Supabase getTestimonials fallback:', e);
      }
    }
    return testimonialsData || [];
  },

  // ── USPs ──
  async getUsps() {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('usps')
          .select('*')
          .eq('published', true)
          .eq('verified', true)
          .order('sort_order', { ascending: true });

        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (e) {
        console.warn('Supabase getUsps fallback:', e);
      }
    }
    return fallbackUsps;
  },

  // ── CATALOGUE ──
  async getCatalogue() {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('catalogue')
          .select('*')
          .eq('published', true)
          .order('id', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          return {
            ...data,
            file_url: data.pdf_url || data.file_url || '/catalogue/NEW_IKON_DOORS.pdf'
          };
        }
      } catch (e) {
        console.warn('Supabase getCatalogue fallback:', e);
      }
    }
    return {
      title: 'New Ikon Doors Official Catalogue',
      pdf_url: '/catalogue/NEW_IKON_DOORS.pdf',
      file_url: '/catalogue/NEW_IKON_DOORS.pdf',
      version: '2026.1',
      published: true
    };
  },

  // ── SITE SETTINGS ──
  async getSettings() {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          return data;
        }
      } catch (e) {
        console.warn('Supabase getSettings fallback:', e);
      }
    }
    return {
      company_name: companyData.name || 'New Ikon Doors',
      tagline: companyData.tagline || 'Elevate Your Space • Upgrade Your Entrance',
      phone: companyData.phone || '+91 98424 45353',
      phone_alt: companyData.phoneAlt || '+91 98424 43353',
      whatsapp: companyData.whatsapp || '9842445353',
      email: companyData.email || 'abbas43353@gmail.com',
      address: companyData.address || 'Plot No. 45 C/A1, Thanjavur Road, Near Mariyamman Kovil Bus Stop, Tharanallur, Trichy - 620008, Tamil Nadu, India',
      specialization: companyData.specialization || 'Dealers in PVC, Teak, Rubber Wood, Mica, Plywoods',
      machinery: companyData.machinery || 'High-Precision CNC Automated Routing & Vacuum Membrane Technology'
    };
  },

  async getHomepage() {
    return {};
  },

  // ── ENQUIRIES (Public submission) ──
  async submitEnquiry(data) {
    if (!data.name || (!data.phone && !data.email)) {
      throw new Error('Please provide your name and at least one contact method (phone or email).');
    }

    if (isSupabaseConfigured() && supabase) {
      const { data: record, error } = await supabase
        .from('enquiries')
        .insert([{
          name: data.name.trim(),
          company: data.company || '',
          phone: data.phone || '',
          whatsapp: data.whatsapp || '',
          email: data.email || '',
          location: data.location || '',
          customer_type: data.customer_type || '',
          requirement: data.requirement || '',
          collection: data.collection || '',
          product_code: data.product_code || '',
          quantity: data.quantity || '',
          message: data.message || '',
          status: 'NEW'
        }])
        .select()
        .single();

      if (error) throw new Error(sanitizeError(error));
      return { success: true, id: record?.id };
    }

    // Serverless endpoint or memory fallback
    const res = await fetch('/api/enquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // ── AUTHENTICATION ──
  async login(email, password) {
    return authService.signIn(email, password);
  },

  async logout() {
    return authService.signOut();
  },

  async me() {
    return authService.getCurrentUser();
  },

  // ── ADMIN PRIVILEGED CRUD ──
  admin: {
    // Products
    async getProducts() {
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase
          .from('products')
          .select('*, collections(name, slug)')
          .order('sort_order', { ascending: true });
        if (error) throw new Error(sanitizeError(error));
        return (data || []).map(p => formatProduct(p));
      }
      const res = await fetch('/api/admin/products');
      if (res.ok) return res.json();
      return (productsData.collections || []).flatMap(c => (c.products || []).map(p => formatProduct(p, c)));
    },

    async createProduct(prod) {
      if (isSupabaseConfigured() && supabase) {
        const code = (prod.product_code || prod.code || '').trim();
        const slug = prod.slug || code.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const { data, error } = await supabase
          .from('products')
          .insert([{
            ...prod,
            product_code: code,
            code: code,
            slug,
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();
        if (error) throw new Error(sanitizeError(error));
        return data;
      }
      const res = await fetch('/api/admin/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(prod) });
      return res.json();
    },

    async updateProduct(id, prod) {
      if (isSupabaseConfigured() && supabase) {
        const updatePayload = { ...prod, updated_at: new Date().toISOString() };
        if (prod.product_code) updatePayload.code = prod.product_code;
        const { data, error } = await supabase
          .from('products')
          .update(updatePayload)
          .eq('id', id)
          .select()
          .single();
        if (error) throw new Error(sanitizeError(error));
        return data;
      }
      const res = await fetch(`/api/admin/products/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(prod) });
      return res.json();
    },

    async deleteProduct(id) {
      if (isSupabaseConfigured() && supabase) {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) throw new Error(sanitizeError(error));
        return { success: true };
      }
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      return res.json();
    },

    // Collections
    async getCollections() {
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase
          .from('collections')
          .select('*, products(id)')
          .order('sort_order', { ascending: true });
        if (error) throw new Error(sanitizeError(error));
        return (data || []).map(c => ({ ...c, product_count: c.products ? c.products.length : 0 }));
      }
      return getFallbackCollections();
    },

    async createCollection(col) {
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase
          .from('collections')
          .insert([{ ...col, updated_at: new Date().toISOString() }])
          .select()
          .single();
        if (error) throw new Error(sanitizeError(error));
        return data;
      }
      const res = await fetch('/api/admin/collections', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(col) });
      return res.json();
    },

    async updateCollection(id, col) {
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase
          .from('collections')
          .update({ ...col, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();
        if (error) throw new Error(sanitizeError(error));
        return data;
      }
      const res = await fetch(`/api/admin/collections/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(col) });
      return res.json();
    },

    async deleteCollection(id) {
      if (isSupabaseConfigured() && supabase) {
        const { error } = await supabase.from('collections').delete().eq('id', id);
        if (error) throw new Error(sanitizeError(error));
        return { success: true };
      }
      const res = await fetch(`/api/admin/collections/${id}`, { method: 'DELETE' });
      return res.json();
    },

    // Branches
    async getBranches() {
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase.from('branches').select('*').order('sort_order', { ascending: true });
        if (error) throw new Error(sanitizeError(error));
        return data || [];
      }
      return companyData.branches || [];
    },

    async updateBranch(id, branch) {
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase
          .from('branches')
          .update({ ...branch, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();
        if (error) throw new Error(sanitizeError(error));
        return data;
      }
      const res = await fetch(`/api/admin/branches/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(branch) });
      return res.json();
    },

    async createBranch(branch) {
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase.from('branches').insert([branch]).select().single();
        if (error) throw new Error(sanitizeError(error));
        return data;
      }
      const res = await fetch('/api/admin/branches', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(branch) });
      return res.json();
    },

    async deleteBranch(id) {
      if (isSupabaseConfigured() && supabase) {
        const { error } = await supabase.from('branches').delete().eq('id', id);
        if (error) throw new Error(sanitizeError(error));
        return { success: true };
      }
      const res = await fetch(`/api/admin/branches/${id}`, { method: 'DELETE' });
      return res.json();
    },

    // Testimonials
    async getTestimonials() {
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase.from('testimonials').select('*').order('sort_order', { ascending: true });
        if (error) throw new Error(sanitizeError(error));
        return data || [];
      }
      return testimonialsData || [];
    },

    async createTestimonial(t) {
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase.from('testimonials').insert([t]).select().single();
        if (error) throw new Error(sanitizeError(error));
        return data;
      }
      const res = await fetch('/api/admin/testimonials', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(t) });
      return res.json();
    },

    async updateTestimonial(id, t) {
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase.from('testimonials').update(t).eq('id', id).select().single();
        if (error) throw new Error(sanitizeError(error));
        return data;
      }
      const res = await fetch(`/api/admin/testimonials/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(t) });
      return res.json();
    },

    async deleteTestimonial(id) {
      if (isSupabaseConfigured() && supabase) {
        const { error } = await supabase.from('testimonials').delete().eq('id', id);
        if (error) throw new Error(sanitizeError(error));
        return { success: true };
      }
      const res = await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' });
      return res.json();
    },

    // USPs
    async getUsps() {
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase.from('usps').select('*').order('sort_order', { ascending: true });
        if (error) throw new Error(sanitizeError(error));
        return data || [];
      }
      return fallbackUsps;
    },

    async createUsp(u) {
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase.from('usps').insert([u]).select().single();
        if (error) throw new Error(sanitizeError(error));
        return data;
      }
      return { success: true };
    },

    async updateUsp(id, u) {
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase.from('usps').update({ ...u, updated_at: new Date().toISOString() }).eq('id', id).select().single();
        if (error) throw new Error(sanitizeError(error));
        return data;
      }
      return { success: true };
    },

    async deleteUsp(id) {
      if (isSupabaseConfigured() && supabase) {
        const { error } = await supabase.from('usps').delete().eq('id', id);
        if (error) throw new Error(sanitizeError(error));
        return { success: true };
      }
      return { success: true };
    },

    // Catalogue
    async getCatalogue() {
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase.from('catalogue').select('*').order('id', { ascending: false });
        if (error) throw new Error(sanitizeError(error));
        return data || [];
      }
      return [{ title: 'New Ikon Doors Official Catalogue', file_url: '/catalogue/NEW_IKON_DOORS.pdf', version: '2026.1', published: true }];
    },

    async updateCatalogue(cat) {
      if (isSupabaseConfigured() && supabase) {
        // Mark all older records inactive, insert new active version
        await supabase.from('catalogue').update({ published: false, active: false }).neq('id', 0);
        const { data, error } = await supabase.from('catalogue').insert([{
          title: cat.title || 'New Ikon Doors Official Catalogue',
          pdf_url: cat.pdf_url || cat.file_url,
          file_url: cat.pdf_url || cat.file_url,
          version: cat.version || '1.0',
          file_size: cat.file_size || '',
          published: true,
          active: true
        }]).select().single();
        if (error) throw new Error(sanitizeError(error));
        return data;
      }
      const res = await fetch('/api/admin/catalogue', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cat) });
      return res.json();
    },

    // Settings
    async getSettings() {
      return api.getSettings();
    },

    async updateSettings(settings) {
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase.from('site_settings').upsert({
          id: 1,
          ...settings,
          updated_at: new Date().toISOString()
        }).select().single();
        if (error) throw new Error(sanitizeError(error));
        return data;
      }
      const res = await fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) });
      return res.json();
    },

    // Enquiries
    async getEnquiries(status = null) {
      if (isSupabaseConfigured() && supabase) {
        let q = supabase.from('enquiries').select('*').order('created_at', { ascending: false });
        if (status) q = q.eq('status', status.toUpperCase());
        const { data, error } = await q;
        if (error) throw new Error(sanitizeError(error));
        return data || [];
      }
      const res = await fetch(`/api/admin/enquiries${status ? '?status=' + status : ''}`);
      if (res.ok) return res.json();
      return [];
    },

    async updateEnquiry(id, data) {
      if (isSupabaseConfigured() && supabase) {
        const { data: record, error } = await supabase
          .from('enquiries')
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();
        if (error) throw new Error(sanitizeError(error));
        return record;
      }
      const res = await fetch(`/api/admin/enquiries/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      return res.json();
    },

    async deleteEnquiry(id) {
      if (isSupabaseConfigured() && supabase) {
        const { error } = await supabase.from('enquiries').delete().eq('id', id);
        if (error) throw new Error(sanitizeError(error));
        return { success: true };
      }
      const res = await fetch(`/api/admin/enquiries/${id}`, { method: 'DELETE' });
      return res.json();
    },

    // File upload
    async uploadFile(bucket, file, folder = '') {
      return storageService.uploadFile(bucket, file, folder);
    },

    // Dashboard Stats
    async getDashboard() {
      if (isSupabaseConfigured() && supabase) {
        try {
          const [prods, cols, branches, tests, cat, enqs] = await Promise.all([
            supabase.from('products').select('id, published', { count: 'exact' }),
            supabase.from('collections').select('id', { count: 'exact' }),
            supabase.from('branches').select('id', { count: 'exact' }),
            supabase.from('testimonials').select('id', { count: 'exact' }),
            supabase.from('catalogue').select('id, title, version, updated_at').order('id', { ascending: false }).limit(1).maybeSingle(),
            supabase.from('enquiries').select('id, status', { count: 'exact' })
          ]);

          const totalProds = prods.data?.length || 0;
          const publishedProds = prods.data?.filter(p => p.published).length || 0;

          return {
            total_products: totalProds,
            published_products: publishedProds,
            total_collections: cols.data?.length || 0,
            total_branches: branches.data?.length || 3,
            total_testimonials: tests.data?.length || 3,
            total_enquiries: enqs.data?.length || 0,
            new_enquiries: enqs.data?.filter(e => e.status === 'NEW').length || 0,
            current_catalogue: cat.data || { title: 'New Ikon Doors Official Catalogue', version: '2026.1' }
          };
        } catch (e) {
          console.warn('Dashboard stats fallback:', e);
        }
      }

      const totalDoors = (productsData.collections || []).reduce((acc, c) => acc + (c.products ? c.products.length : 0), 0);
      return {
        total_products: totalDoors,
        published_products: totalDoors,
        total_collections: (productsData.collections || []).length,
        total_branches: (companyData.branches || []).length,
        total_testimonials: (testimonialsData || []).length,
        total_enquiries: 0,
        new_enquiries: 0,
        current_catalogue: { title: 'New Ikon Doors Official Catalogue', version: '2026.1' }
      };
    }
  }
};
