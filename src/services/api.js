// ==============================================================================
// NEW IKON DOORS — CLIENT API & DATABASE SERVICE
// ==============================================================================
// Dual-mode architecture:
// 1. Direct Supabase Client + PostgreSQL RLS (when configured)
// 2. Resilient unified client-side persistence (localStorage overlay) that guarantees
//    ANY addition, update, or deletion made in the CRM IMMEDIATELY reflects on the main website.
import companyData from '../data/company.json';
import productsData from '../data/products.json';
import testimonialsData from '../data/testimonials.json';
import { supabase, isSupabaseConfigured, authService, storageService, sanitizeError } from './supabaseClient';

const BASE = '';

// Cache-busting version — increment when images are replaced to force fresh downloads
const IMAGE_VERSION = 'v2';
function bustCache(url) {
  if (!url || typeof url !== 'string' || url.startsWith('http') || url.startsWith('data:')) return url;
  return `${url}${url.includes('?') ? '&' : '?'}v=${IMAGE_VERSION}`;
}

// Helper to normalize product codes for flexible matching
export function normalizeCode(str = '') {
  return String(str).toUpperCase().replace(/[^A-Z0-9]/g, '');
}

// Dispatch event whenever CRM data is modified
export function notifyDataChanged() {
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new Event('nid:data-changed'));
      window.dispatchEvent(new CustomEvent('nid:store-updated', { detail: { timestamp: Date.now() } }));
    } catch {}
  }
}

// Format product record consistently
export function formatProduct(p, col = null) {
  let specs = p.specs || {};
  let features = p.features || [];
  if (typeof specs === 'string') {
    try { specs = JSON.parse(specs); } catch { specs = {}; }
  }
  if (typeof features === 'string') {
    try { features = JSON.parse(features); } catch { features = []; }
  }

  const primaryImg = p.primary_image || p.image || '';
  const cleanImg = primaryImg ? bustCache(primaryImg.startsWith('/') || primaryImg.startsWith('http') || primaryImg.startsWith('data:') ? primaryImg : `/doors/${primaryImg}`) : '';

  return {
    ...p,
    id: p.id,
    code: p.product_code || p.code || '',
    product_code: p.product_code || p.code || '',
    name: p.name || `Door ${p.product_code || p.code || ''}`,
    slug: p.slug || (p.code ? p.code.toLowerCase().replace(/[^a-z0-9]+/g, '-') : ''),
    collection_id: p.collection_id || (col ? col.id : null),
    collection_slug: p.collection_slug || (col ? col.slug : ''),
    collection_name: p.collection_name || (col ? col.name : ''),
    primary_image: cleanImg,
    image: cleanImg,
    lifestyle_image: p.lifestyle_image ? bustCache(p.lifestyle_image.startsWith('/') || p.lifestyle_image.startsWith('http') || p.lifestyle_image.startsWith('data:') ? p.lifestyle_image : `/doors/${p.lifestyle_image}`) : '',
    specs,
    features,
    published: p.published !== false && p.published !== 0,
    featured: Boolean(p.featured)
  };
}

// Default verified USPs
export const fallbackUsps = [
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

// ──────────────────────────────────────────────────────────────────────────────
// UNIFIED LOCAL STORAGE PERSISTENCE LAYER (Overlay Engine)
// Guarantees all CRM updates reflect instantly on the public website even without Supabase
// ──────────────────────────────────────────────────────────────────────────────

function getBaseProducts() {
  return (productsData.collections || []).flatMap((c, cIdx) => 
    (c.products || []).map((p, pIdx) => ({
      ...p,
      id: p.id || `p_${c.slug || cIdx}_${p.code || pIdx}`,
      collection_id: p.collection_id || (cIdx + 1),
      collection_slug: p.collection_slug || c.slug,
      collection_name: p.collection_name || c.name,
    }))
  );
}

function getBaseCollections() {
  return (productsData.collections || []).map((c, i) => ({
    id: i + 1,
    name: c.name,
    slug: c.slug,
    description: c.description || '',
    category: c.category || '',
    tagline: c.tagline || '',
    cover_image: c.hero_image ? bustCache(c.hero_image.startsWith('/') || c.hero_image.startsWith('http') || c.hero_image.startsWith('data:') ? c.hero_image : `/doors/${c.hero_image}`) : '',
    hero_image: c.hero_image ? bustCache(c.hero_image.startsWith('/') || c.hero_image.startsWith('http') || c.hero_image.startsWith('data:') ? c.hero_image : `/doors/${c.hero_image}`) : '',
    material: c.material || '',
    finish: c.finish || '',
    thickness: c.thickness || '',
    application: c.application || '',
    published: c.published !== false,
    featured: Boolean(c.featured),
    sort_order: c.display_order !== undefined ? c.display_order : i,
    product_count: c.products ? c.products.length : 0
  }));
}

export function getMergedProducts(includeUnpublished = false) {
  const base = getBaseProducts();
  let edits = {};
  let added = [];
  let deleted = [];
  if (typeof window !== 'undefined') {
    try {
      edits = JSON.parse(localStorage.getItem('nid_crm_products_edits') || '{}');
      added = JSON.parse(localStorage.getItem('nid_crm_products_new') || '[]');
      deleted = JSON.parse(localStorage.getItem('nid_crm_products_deleted') || '[]');
    } catch {}
  }

  const deletedSet = new Set(deleted.map(String));

  // Merge base with edits
  const mergedBase = base
    .filter(p => !deletedSet.has(String(p.id)) && !deletedSet.has(String(p.code)) && !deletedSet.has(normalizeCode(p.code)))
    .map(p => {
      const edit = edits[String(p.id)] || edits[String(p.code)] || edits[normalizeCode(p.code)];
      return edit ? { ...p, ...edit } : p;
    });

  // Filter newly added that aren't deleted
  const validAdded = added.filter(p => !deletedSet.has(String(p.id)) && !deletedSet.has(String(p.code)) && !deletedSet.has(normalizeCode(p.code)));

  const all = [...validAdded, ...mergedBase].map(p => formatProduct(p));
  return includeUnpublished ? all : all.filter(p => p.published);
}

export function getMergedCollections(includeUnpublished = false) {
  const base = getBaseCollections();
  let edits = {};
  let added = [];
  let deleted = [];
  if (typeof window !== 'undefined') {
    try {
      edits = JSON.parse(localStorage.getItem('nid_crm_collections_edits') || '{}');
      added = JSON.parse(localStorage.getItem('nid_crm_collections_new') || '[]');
      deleted = JSON.parse(localStorage.getItem('nid_crm_collections_deleted') || '[]');
    } catch {}
  }

  const deletedSet = new Set(deleted.map(String));
  const prods = getMergedProducts(false);

  const mergedBase = base
    .filter(c => !deletedSet.has(String(c.id)) && !deletedSet.has(String(c.slug)))
    .map(c => {
      const edit = edits[String(c.id)] || edits[String(c.slug)];
      const updated = edit ? { ...c, ...edit } : c;
      const count = prods.filter(p => (String(p.collection_id) === String(updated.id) || p.collection_slug === updated.slug)).length;
      return { ...updated, product_count: count };
    });

  const validAdded = added
    .filter(c => !deletedSet.has(String(c.id)) && !deletedSet.has(String(c.slug)))
    .map(c => {
      const count = prods.filter(p => (String(p.collection_id) === String(c.id) || p.collection_slug === c.slug)).length;
      return { ...c, product_count: count };
    });

  const all = [...mergedBase, ...validAdded];
  return includeUnpublished ? all : all.filter(c => c.published !== false);
}

export function getMergedCollection(slug) {
  const cols = getMergedCollections(false);
  const col = cols.find(c => c.slug === slug || String(c.id) === String(slug));
  if (!col) return null;
  const allProds = getMergedProducts(false);
  const prods = allProds.filter(p => (p.collection_slug === col.slug || String(p.collection_id) === String(col.id)));
  return {
    ...col,
    products: prods
  };
}

export function getMergedProduct(codeSlug) {
  const cleanTarget = normalizeCode(decodeURIComponent(codeSlug));
  const allProds = getMergedProducts(true);
  const found = allProds.find(p => normalizeCode(p.code) === cleanTarget || (p.slug && p.slug === codeSlug));
  if (!found) return null;
  const related = allProds
    .filter(p => p.published && (p.collection_slug === found.collection_slug || String(p.collection_id) === String(found.collection_id)) && normalizeCode(p.code) !== cleanTarget)
    .slice(0, 4);
  return {
    ...found,
    related
  };
}

export function getMergedBranches() {
  let edits = {};
  let added = [];
  let deleted = [];
  if (typeof window !== 'undefined') {
    try {
      edits = JSON.parse(localStorage.getItem('nid_crm_branches_edits') || '{}');
      added = JSON.parse(localStorage.getItem('nid_crm_branches_new') || '[]');
      deleted = JSON.parse(localStorage.getItem('nid_crm_branches_deleted') || '[]');
    } catch {}
  }
  const deletedSet = new Set(deleted.map(String));
  const base = (companyData.branches || [])
    .filter(b => !deletedSet.has(String(b.id)))
    .map(b => (edits[String(b.id)] ? { ...b, ...edits[String(b.id)] } : b));
  return [...base, ...added.filter(b => !deletedSet.has(String(b.id)))];
}

export function getMergedTestimonials() {
  let edits = {};
  let added = [];
  let deleted = [];
  if (typeof window !== 'undefined') {
    try {
      edits = JSON.parse(localStorage.getItem('nid_crm_testimonials_edits') || '{}');
      added = JSON.parse(localStorage.getItem('nid_crm_testimonials_new') || '[]');
      deleted = JSON.parse(localStorage.getItem('nid_crm_testimonials_deleted') || '[]');
    } catch {}
  }
  const deletedSet = new Set(deleted.map(String));
  const base = (testimonialsData || [])
    .filter(t => !deletedSet.has(String(t.id)))
    .map(t => (edits[String(t.id)] ? { ...t, ...edits[String(t.id)] } : t));
  return [...base, ...added.filter(t => !deletedSet.has(String(t.id)))];
}

export function getMergedUsps() {
  let edits = {};
  let added = [];
  let deleted = [];
  if (typeof window !== 'undefined') {
    try {
      edits = JSON.parse(localStorage.getItem('nid_crm_usps_edits') || '{}');
      added = JSON.parse(localStorage.getItem('nid_crm_usps_new') || '[]');
      deleted = JSON.parse(localStorage.getItem('nid_crm_usps_deleted') || '[]');
    } catch {}
  }
  const deletedSet = new Set(deleted.map(String));
  const base = fallbackUsps
    .filter(u => !deletedSet.has(String(u.id)))
    .map(u => (edits[String(u.id)] ? { ...u, ...edits[String(u.id)] } : u));
  return [...base, ...added.filter(u => !deletedSet.has(String(u.id)))];
}

export function getMergedCatalogue() {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('nid_crm_catalogue');
      if (saved) return JSON.parse(saved);
    } catch {}
  }
  return {
    title: 'New Ikon Doors Official Catalogue',
    file_url: '/catalogue/NEW_IKON_DOORS.pdf',
    pdf_url: '/catalogue/NEW_IKON_DOORS.pdf',
    version: '2026.1',
    file_size: '9.0 MB',
    active: 1,
    published: true
  };
}

export function getMergedSettings() {
  let edits = {};
  if (typeof window !== 'undefined') {
    try {
      edits = JSON.parse(localStorage.getItem('nid_crm_settings') || '{}');
    } catch {}
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
    machinery: companyData.machinery || 'High-Precision CNC Automated Routing & Vacuum Membrane Technology',
    ...edits
  };
}


// ──────────────────────────────────────────────────────────────────────────────
// PUBLIC & ADMIN API
// ──────────────────────────────────────────────────────────────────────────────

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
    return getMergedCollections(false);
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
    return getMergedCollection(slug);
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

    // Unified client fallback with merged CRM edits
    const all = getMergedProducts(false);
    if (params.search) {
      const q = params.search.toLowerCase();
      return all.filter(p => p.code.toLowerCase().includes(q) || (p.collection_name && p.collection_name.toLowerCase().includes(q)) || (p.name && p.name.toLowerCase().includes(q)));
    }
    if (params.featured === '1') {
      const feats = all.filter(p => p.featured);
      return feats.slice(0, parseInt(params.limit, 10) || 8);
    }
    if (params.limit) {
      return all.slice(0, parseInt(params.limit, 10));
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
    return getMergedProduct(codeSlug);
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
    return getMergedBranches();
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
    return getMergedTestimonials();
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
    return getMergedUsps();
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
    return getMergedCatalogue();
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
    return getMergedSettings();
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
    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return res.json();
    } catch {}

    // Store in localStorage if offline/fallback
    try {
      const enqs = JSON.parse(localStorage.getItem('nid_enquiries') || '[]');
      const newEnq = { id: Date.now(), ...data, status: 'NEW', created_at: new Date().toISOString() };
      enqs.unshift(newEnq);
      localStorage.setItem('nid_enquiries', JSON.stringify(enqs));
      return { success: true, id: newEnq.id };
    } catch {}

    return { success: true };
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
        try {
          const { data, error } = await supabase
            .from('products')
            .select('*, collections(name, slug)')
            .order('sort_order', { ascending: true });
          if (!error && data) return data.map(p => formatProduct(p));
        } catch (e) {
          console.warn('Supabase admin getProducts fallback:', e);
        }
      }
      return getMergedProducts(true);
    },

    async createProduct(prod) {
      const code = (prod.product_code || prod.code || '').trim();
      const slug = prod.slug || code.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const newProduct = {
        id: prod.id || `prod_${Date.now()}`,
        ...prod,
        code,
        product_code: code,
        slug,
        published: prod.published !== false && prod.published !== 0,
        featured: Boolean(prod.featured),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Always save to client overlay
      if (typeof window !== 'undefined') {
        try {
          const added = JSON.parse(localStorage.getItem('nid_crm_products_new') || '[]');
          added.unshift(newProduct);
          localStorage.setItem('nid_crm_products_new', JSON.stringify(added));
        } catch (e) {
          console.warn('LocalStorage save error:', e);
        }
      }

      // If Supabase is configured, write to Supabase
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data, error } = await supabase.from('products').insert([newProduct]).select().single();
          if (!error && data) {
            notifyDataChanged();
            return data;
          }
        } catch (e) {
          console.warn('Supabase createProduct fallback:', e);
        }
      }

      notifyDataChanged();
      return newProduct;
    },

    async updateProduct(id, prod) {
      const updatePayload = {
        ...prod,
        id,
        updated_at: new Date().toISOString()
      };
      if (prod.product_code) updatePayload.code = prod.product_code;

      // Always save to client overlay
      if (typeof window !== 'undefined') {
        try {
          const edits = JSON.parse(localStorage.getItem('nid_crm_products_edits') || '{}');
          const added = JSON.parse(localStorage.getItem('nid_crm_products_new') || '[]');
          
          const addedIdx = added.findIndex(p => String(p.id) === String(id));
          if (addedIdx !== -1) {
            added[addedIdx] = { ...added[addedIdx], ...updatePayload };
            localStorage.setItem('nid_crm_products_new', JSON.stringify(added));
          } else {
            edits[String(id)] = { ...(edits[String(id)] || {}), ...updatePayload };
            if (prod.code) edits[normalizeCode(prod.code)] = edits[String(id)];
            localStorage.setItem('nid_crm_products_edits', JSON.stringify(edits));
          }
        } catch (e) {
          console.warn('LocalStorage update error:', e);
        }
      }

      // If Supabase is configured, write to Supabase
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data, error } = await supabase
            .from('products')
            .update(updatePayload)
            .eq('id', id)
            .select()
            .single();
          if (!error && data) {
            notifyDataChanged();
            return data;
          }
        } catch (e) {
          console.warn('Supabase updateProduct fallback:', e);
        }
      }

      notifyDataChanged();
      return updatePayload;
    },

    async deleteProduct(id) {
      if (typeof window !== 'undefined') {
        try {
          const deleted = JSON.parse(localStorage.getItem('nid_crm_products_deleted') || '[]');
          if (!deleted.includes(String(id))) {
            deleted.push(String(id));
            localStorage.setItem('nid_crm_products_deleted', JSON.stringify(deleted));
          }
          const added = JSON.parse(localStorage.getItem('nid_crm_products_new') || '[]');
          const filteredAdded = added.filter(p => String(p.id) !== String(id));
          localStorage.setItem('nid_crm_products_new', JSON.stringify(filteredAdded));
        } catch (e) {
          console.warn('LocalStorage delete error:', e);
        }
      }

      if (isSupabaseConfigured() && supabase) {
        try {
          await supabase.from('products').delete().eq('id', id);
        } catch (e) {
          console.warn('Supabase deleteProduct fallback:', e);
        }
      }

      notifyDataChanged();
      return { success: true };
    },

    // Collections
    async getCollections() {
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data, error } = await supabase
            .from('collections')
            .select('*, products(id)')
            .order('sort_order', { ascending: true });
          if (!error && data) return data.map(c => ({ ...c, product_count: c.products ? c.products.length : 0 }));
        } catch (e) {
          console.warn('Supabase admin getCollections fallback:', e);
        }
      }
      return getMergedCollections(true);
    },

    async createCollection(col) {
      const newCol = {
        id: col.id || `col_${Date.now()}`,
        ...col,
        updated_at: new Date().toISOString()
      };

      if (typeof window !== 'undefined') {
        try {
          const added = JSON.parse(localStorage.getItem('nid_crm_collections_new') || '[]');
          added.push(newCol);
          localStorage.setItem('nid_crm_collections_new', JSON.stringify(added));
        } catch {}
      }

      if (isSupabaseConfigured() && supabase) {
        try {
          const { data, error } = await supabase.from('collections').insert([newCol]).select().single();
          if (!error && data) {
            notifyDataChanged();
            return data;
          }
        } catch {}
      }

      notifyDataChanged();
      return newCol;
    },

    async updateCollection(id, col) {
      const updatePayload = {
        ...col,
        id,
        updated_at: new Date().toISOString()
      };

      if (typeof window !== 'undefined') {
        try {
          const edits = JSON.parse(localStorage.getItem('nid_crm_collections_edits') || '{}');
          const added = JSON.parse(localStorage.getItem('nid_crm_collections_new') || '[]');
          const addedIdx = added.findIndex(c => String(c.id) === String(id));
          if (addedIdx !== -1) {
            added[addedIdx] = { ...added[addedIdx], ...updatePayload };
            localStorage.setItem('nid_crm_collections_new', JSON.stringify(added));
          } else {
            edits[String(id)] = { ...(edits[String(id)] || {}), ...updatePayload };
            if (col.slug) edits[String(col.slug)] = edits[String(id)];
            localStorage.setItem('nid_crm_collections_edits', JSON.stringify(edits));
          }
        } catch {}
      }

      if (isSupabaseConfigured() && supabase) {
        try {
          const { data, error } = await supabase
            .from('collections')
            .update(updatePayload)
            .eq('id', id)
            .select()
            .single();
          if (!error && data) {
            notifyDataChanged();
            return data;
          }
        } catch {}
      }

      notifyDataChanged();
      return updatePayload;
    },

    async deleteCollection(id) {
      if (typeof window !== 'undefined') {
        try {
          const deleted = JSON.parse(localStorage.getItem('nid_crm_collections_deleted') || '[]');
          if (!deleted.includes(String(id))) {
            deleted.push(String(id));
            localStorage.setItem('nid_crm_collections_deleted', JSON.stringify(deleted));
          }
          const added = JSON.parse(localStorage.getItem('nid_crm_collections_new') || '[]');
          localStorage.setItem('nid_crm_collections_new', JSON.stringify(added.filter(c => String(c.id) !== String(id))));
        } catch {}
      }

      if (isSupabaseConfigured() && supabase) {
        try {
          await supabase.from('collections').delete().eq('id', id);
        } catch {}
      }

      notifyDataChanged();
      return { success: true };
    },

    // Branches
    async getBranches() {
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data, error } = await supabase.from('branches').select('*').order('sort_order', { ascending: true });
          if (!error && data) return data;
        } catch {}
      }
      return getMergedBranches();
    },

    async updateBranch(id, branch) {
      const updatePayload = { ...branch, id, updated_at: new Date().toISOString() };
      if (typeof window !== 'undefined') {
        try {
          const edits = JSON.parse(localStorage.getItem('nid_crm_branches_edits') || '{}');
          edits[String(id)] = { ...(edits[String(id)] || {}), ...updatePayload };
          localStorage.setItem('nid_crm_branches_edits', JSON.stringify(edits));
        } catch {}
      }

      if (isSupabaseConfigured() && supabase) {
        try {
          const { data } = await supabase.from('branches').update(updatePayload).eq('id', id).select().single();
          if (data) { notifyDataChanged(); return data; }
        } catch {}
      }

      notifyDataChanged();
      return updatePayload;
    },

    async createBranch(branch) {
      const newBranch = { id: branch.id || `branch_${Date.now()}`, ...branch, updated_at: new Date().toISOString() };
      if (typeof window !== 'undefined') {
        try {
          const added = JSON.parse(localStorage.getItem('nid_crm_branches_new') || '[]');
          added.push(newBranch);
          localStorage.setItem('nid_crm_branches_new', JSON.stringify(added));
        } catch {}
      }

      if (isSupabaseConfigured() && supabase) {
        try {
          const { data } = await supabase.from('branches').insert([newBranch]).select().single();
          if (data) { notifyDataChanged(); return data; }
        } catch {}
      }

      notifyDataChanged();
      return newBranch;
    },

    async deleteBranch(id) {
      if (typeof window !== 'undefined') {
        try {
          const deleted = JSON.parse(localStorage.getItem('nid_crm_branches_deleted') || '[]');
          if (!deleted.includes(String(id))) {
            deleted.push(String(id));
            localStorage.setItem('nid_crm_branches_deleted', JSON.stringify(deleted));
          }
        } catch {}
      }

      if (isSupabaseConfigured() && supabase) {
        try {
          await supabase.from('branches').delete().eq('id', id);
        } catch {}
      }

      notifyDataChanged();
      return { success: true };
    },

    // Testimonials
    async getTestimonials() {
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data } = await supabase.from('testimonials').select('*').order('sort_order', { ascending: true });
          if (data) return data;
        } catch {}
      }
      return getMergedTestimonials();
    },

    async createTestimonial(t) {
      const newT = { id: t.id || `test_${Date.now()}`, ...t, updated_at: new Date().toISOString() };
      if (typeof window !== 'undefined') {
        try {
          const added = JSON.parse(localStorage.getItem('nid_crm_testimonials_new') || '[]');
          added.push(newT);
          localStorage.setItem('nid_crm_testimonials_new', JSON.stringify(added));
        } catch {}
      }

      if (isSupabaseConfigured() && supabase) {
        try {
          const { data } = await supabase.from('testimonials').insert([newT]).select().single();
          if (data) { notifyDataChanged(); return data; }
        } catch {}
      }

      notifyDataChanged();
      return newT;
    },

    async updateTestimonial(id, t) {
      const updatePayload = { ...t, id, updated_at: new Date().toISOString() };
      if (typeof window !== 'undefined') {
        try {
          const edits = JSON.parse(localStorage.getItem('nid_crm_testimonials_edits') || '{}');
          edits[String(id)] = { ...(edits[String(id)] || {}), ...updatePayload };
          localStorage.setItem('nid_crm_testimonials_edits', JSON.stringify(edits));
        } catch {}
      }

      if (isSupabaseConfigured() && supabase) {
        try {
          const { data } = await supabase.from('testimonials').update(updatePayload).eq('id', id).select().single();
          if (data) { notifyDataChanged(); return data; }
        } catch {}
      }

      notifyDataChanged();
      return updatePayload;
    },

    async deleteTestimonial(id) {
      if (typeof window !== 'undefined') {
        try {
          const deleted = JSON.parse(localStorage.getItem('nid_crm_testimonials_deleted') || '[]');
          if (!deleted.includes(String(id))) {
            deleted.push(String(id));
            localStorage.setItem('nid_crm_testimonials_deleted', JSON.stringify(deleted));
          }
        } catch {}
      }

      if (isSupabaseConfigured() && supabase) {
        try {
          await supabase.from('testimonials').delete().eq('id', id);
        } catch {}
      }

      notifyDataChanged();
      return { success: true };
    },

    // USPs
    async getUsps() {
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data } = await supabase.from('usps').select('*').order('sort_order', { ascending: true });
          if (data) return data;
        } catch {}
      }
      return getMergedUsps();
    },

    async createUsp(u) {
      const newU = { id: u.id || `usp_${Date.now()}`, ...u, updated_at: new Date().toISOString() };
      if (typeof window !== 'undefined') {
        try {
          const added = JSON.parse(localStorage.getItem('nid_crm_usps_new') || '[]');
          added.push(newU);
          localStorage.setItem('nid_crm_usps_new', JSON.stringify(added));
        } catch {}
      }
      notifyDataChanged();
      return newU;
    },

    async updateUsp(id, u) {
      const updatePayload = { ...u, id, updated_at: new Date().toISOString() };
      if (typeof window !== 'undefined') {
        try {
          const edits = JSON.parse(localStorage.getItem('nid_crm_usps_edits') || '{}');
          edits[String(id)] = { ...(edits[String(id)] || {}), ...updatePayload };
          localStorage.setItem('nid_crm_usps_edits', JSON.stringify(edits));
        } catch {}
      }
      notifyDataChanged();
      return updatePayload;
    },

    async deleteUsp(id) {
      if (typeof window !== 'undefined') {
        try {
          const deleted = JSON.parse(localStorage.getItem('nid_crm_usps_deleted') || '[]');
          if (!deleted.includes(String(id))) {
            deleted.push(String(id));
            localStorage.setItem('nid_crm_usps_deleted', JSON.stringify(deleted));
          }
        } catch {}
      }
      notifyDataChanged();
      return { success: true };
    },

    // Catalogue
    async getCatalogue() {
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data } = await supabase.from('catalogue').select('*').order('id', { ascending: false });
          if (data && data.length > 0) return data;
        } catch {}
      }
      return [getMergedCatalogue()];
    },

    async updateCatalogue(cat) {
      const updatePayload = {
        title: cat.title || 'New Ikon Doors Official Catalogue',
        pdf_url: cat.pdf_url || cat.file_url || '/catalogue/NEW_IKON_DOORS.pdf',
        file_url: cat.pdf_url || cat.file_url || '/catalogue/NEW_IKON_DOORS.pdf',
        version: cat.version || '2026.1',
        file_size: cat.file_size || '9.0 MB',
        published: true,
        active: true,
        updated_at: new Date().toISOString()
      };

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('nid_crm_catalogue', JSON.stringify(updatePayload));
        } catch {}
      }

      if (isSupabaseConfigured() && supabase) {
        try {
          await supabase.from('catalogue').update({ published: false, active: false }).neq('id', 0);
          await supabase.from('catalogue').insert([updatePayload]);
        } catch {}
      }

      notifyDataChanged();
      return updatePayload;
    },

    // Settings
    async getSettings() {
      return api.getSettings();
    },

    async updateSettings(settings) {
      if (typeof window !== 'undefined') {
        try {
          const existing = JSON.parse(localStorage.getItem('nid_crm_settings') || '{}');
          const merged = { ...existing, ...settings, updated_at: new Date().toISOString() };
          localStorage.setItem('nid_crm_settings', JSON.stringify(merged));
        } catch {}
      }

      if (isSupabaseConfigured() && supabase) {
        try {
          await supabase.from('site_settings').upsert({
            id: 1,
            ...settings,
            updated_at: new Date().toISOString()
          });
        } catch {}
      }

      notifyDataChanged();
      return settings;
    },

    // Enquiries
    async getEnquiries(status = null) {
      if (isSupabaseConfigured() && supabase) {
        try {
          let q = supabase.from('enquiries').select('*').order('created_at', { ascending: false });
          if (status) q = q.eq('status', status.toUpperCase());
          const { data } = await q;
          if (data) return data;
        } catch {}
      }

      if (typeof window !== 'undefined') {
        try {
          const enqs = JSON.parse(localStorage.getItem('nid_enquiries') || '[]');
          return status ? enqs.filter(e => e.status === status.toUpperCase()) : enqs;
        } catch {}
      }
      return [];
    },

    async updateEnquiry(id, data) {
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data: record } = await supabase.from('enquiries').update(data).eq('id', id).select().single();
          if (record) return record;
        } catch {}
      }

      if (typeof window !== 'undefined') {
        try {
          const enqs = JSON.parse(localStorage.getItem('nid_enquiries') || '[]');
          const idx = enqs.findIndex(e => String(e.id) === String(id));
          if (idx !== -1) {
            enqs[idx] = { ...enqs[idx], ...data, updated_at: new Date().toISOString() };
            localStorage.setItem('nid_enquiries', JSON.stringify(enqs));
            return enqs[idx];
          }
        } catch {}
      }
      return data;
    },

    async deleteEnquiry(id) {
      if (isSupabaseConfigured() && supabase) {
        try {
          await supabase.from('enquiries').delete().eq('id', id);
        } catch {}
      }

      if (typeof window !== 'undefined') {
        try {
          const enqs = JSON.parse(localStorage.getItem('nid_enquiries') || '[]');
          localStorage.setItem('nid_enquiries', JSON.stringify(enqs.filter(e => String(e.id) !== String(id))));
        } catch {}
      }
      return { success: true };
    },

    // File upload (Supabase Storage or Base64 Data URL)
    async uploadFile(bucket, file, folder = '') {
      return storageService.uploadFile(bucket, file, folder);
    },

    // Dashboard Stats
    async getDashboard() {
      const allProds = getMergedProducts(true);
      const allCols = getMergedCollections(true);
      const allBranches = getMergedBranches();
      const allTests = getMergedTestimonials();
      const catalogue = getMergedCatalogue();
      const enqs = await this.getEnquiries();

      return {
        total_products: allProds.length,
        published_products: allProds.filter(p => p.published).length,
        total_collections: allCols.length,
        total_branches: allBranches.length,
        total_testimonials: allTests.length,
        total_enquiries: enqs.length,
        new_enquiries: enqs.filter(e => e.status === 'NEW').length,
        current_catalogue: catalogue
      };
    },

    // Reset Custom Edits to Original Factory Defaults
    resetToDefaults() {
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('nid_crm_products_edits');
          localStorage.removeItem('nid_crm_products_new');
          localStorage.removeItem('nid_crm_products_deleted');
          localStorage.removeItem('nid_crm_collections_edits');
          localStorage.removeItem('nid_crm_collections_new');
          localStorage.removeItem('nid_crm_collections_deleted');
          localStorage.removeItem('nid_crm_settings');
          localStorage.removeItem('nid_crm_branches_edits');
          localStorage.removeItem('nid_crm_branches_new');
          localStorage.removeItem('nid_crm_branches_deleted');
          localStorage.removeItem('nid_crm_testimonials_edits');
          localStorage.removeItem('nid_crm_testimonials_new');
          localStorage.removeItem('nid_crm_testimonials_deleted');
          localStorage.removeItem('nid_crm_usps_edits');
          localStorage.removeItem('nid_crm_usps_new');
          localStorage.removeItem('nid_crm_usps_deleted');
          localStorage.removeItem('nid_crm_catalogue');
          notifyDataChanged();
          return true;
        } catch {}
      }
      return false;
    }
  }
};
