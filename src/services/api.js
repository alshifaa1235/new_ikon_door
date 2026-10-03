// ==============================================================================
// NEW IKON DOORS — CLIENT API & DATABASE SERVICE
// ==============================================================================
// 100% Unified Cloud PostgreSQL Architecture (Supabase):
// Single source of truth across all devices, browsers, and platforms.
// Zero local-storage or device-specific persistence for CMS content.
// ==============================================================================

import { supabase, isSupabaseConfigured, authService, storageService, sanitizeError } from './supabaseClient.js';

// Clear any legacy client-side localStorage overrides from earlier versions
// to ensure every device (PC, phone, tablet) renders the live production DB.
if (typeof window !== 'undefined') {
  try {
    const legacyKeys = [
      'nid_crm_products_edits', 'nid_crm_products_new', 'nid_crm_products_deleted',
      'nid_crm_collections_edits', 'nid_crm_collections_new', 'nid_crm_collections_deleted',
      'nid_crm_branches_edits', 'nid_crm_branches_new', 'nid_crm_branches_deleted',
      'nid_crm_testimonials_edits', 'nid_crm_testimonials_new', 'nid_crm_testimonials_deleted',
      'nid_crm_usps_edits', 'nid_crm_usps_new', 'nid_crm_usps_deleted',
      'nid_crm_catalogue', 'nid_crm_settings', 'nid_enquiries'
    ];
    legacyKeys.forEach(k => localStorage.removeItem(k));
  } catch { }
}

// Cache-busting version — increment when images are replaced to force fresh downloads
const IMAGE_VERSION = 'v3';
export function bustCache(url) {
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
    } catch { }
  }
}

// Format product record consistently
export function formatProduct(p, col = null) {
  if (!p) return null;
  let specs = p.specs || {};
  let features = p.features || [];
  let gallery = p.gallery_images || [];
  if (typeof specs === 'string') {
    try { specs = JSON.parse(specs); } catch { specs = {}; }
  }
  if (typeof features === 'string') {
    try { features = JSON.parse(features); } catch { features = []; }
  }
  if (typeof gallery === 'string') {
    try { gallery = JSON.parse(gallery); } catch { gallery = []; }
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
    gallery_images: gallery,
    lifestyle_image: p.lifestyle_image ? bustCache(p.lifestyle_image.startsWith('/') || p.lifestyle_image.startsWith('http') || p.lifestyle_image.startsWith('data:') ? p.lifestyle_image : `/doors/${p.lifestyle_image}`) : '',
    lifestyle_title: p.lifestyle_title || '',
    specs,
    features,
    published: p.published !== false && p.published !== 0,
    featured: Boolean(p.featured),
    sort_order: p.sort_order !== undefined ? Number(p.sort_order) : 99,
  };
}

// Fallback USPs in case table is temporarily unreachable
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

// Fallback settings
const fallbackSettings = {
  id: 1,
  company_name: 'New Ikon Doors',
  tagline: 'Elevate Your Space • Upgrade Your Entrance',
  phone: '+91 98424 45353',
  phone_alt: '+91 98424 43353',
  whatsapp: '9842445353',
  email: 'abbas43353@gmail.com',
  address: 'Plot No. 45 C/A1, Thanjavur Road, Near Mariyamman Kovil Bus Stop, Tharanallur, Trichy - 620008, Tamil Nadu, India',
  specialization: 'Dealers in PVC, Teak, Rubber Wood, Mica, Plywoods',
  machinery: 'High-Precision CNC Automated Routing & Vacuum Membrane Technology',
};

// Aliases for backwards compatibility with any remaining imports
export const getMergedSettings = () => fallbackSettings;
export const getMergedCollections = () => [];
export const getMergedProducts = () => [];

// ──────────────────────────────────────────────────────────────────────────────
// PUBLIC & ADMIN API (100% Shared Cloud PostgreSQL)
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

        if (!error && data) {
          return data.map(c => ({
            ...c,
            product_count: c.products ? c.products.length : 0
          }));
        }
        if (error) console.error('getCollections error:', error);
      } catch (e) {
        console.error('getCollections exception:', e);
      }
    }
    return [];
  },

  async getCollection(slug) {
    if (isSupabaseConfigured() && supabase) {
      try {
        const clean = decodeURIComponent(slug).trim();
        let query = supabase.from('collections').select('*');
        if (!isNaN(clean)) {
          query = query.or(`slug.eq.${clean},id.eq.${clean}`);
        } else {
          query = query.eq('slug', clean);
        }
        const { data: col, error } = await query.maybeSingle();

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
        console.error('getCollection exception:', e);
      }
    }
    return null;
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
          q = q.or(`product_code.ilike.${s},code.ilike.${s},name.ilike.${s},description.ilike.${s}`);
        }
        if (params.collection_id) {
          q = q.eq('collection_id', params.collection_id);
        }
        if (params.collection_slug) {
          q = q.eq('collections.slug', params.collection_slug);
        }
        q = q.order('sort_order', { ascending: true });
        if (params.limit) {
          q = q.limit(parseInt(params.limit, 10));
        }

        const { data, error } = await q;
        if (!error && data) {
          return data.map(p => ({
            ...formatProduct(p),
            collection_name: p.collections?.name || '',
            collection_slug: p.collections?.slug || ''
          }));
        }
        if (error) console.error('getProducts error:', error);
      } catch (e) {
        console.error('getProducts exception:', e);
      }
    }
    return [];
  },

  async getProduct(codeSlug) {
    if (isSupabaseConfigured() && supabase) {
      try {
        const clean = decodeURIComponent(codeSlug).trim();
        let q = supabase
          .from('products')
          .select('*, collections(*)');
        if (!isNaN(clean)) {
          q = q.or(`id.eq.${clean},product_code.eq.${clean},code.eq.${clean},slug.eq.${clean.toLowerCase()}`);
        } else {
          q = q.or(`product_code.eq.${clean},code.eq.${clean},slug.eq.${clean.toLowerCase()}`);
        }
        const { data, error } = await q.maybeSingle();

        if (!error && data) {
          let related = [];
          if (data.collection_id) {
            const { data: rel } = await supabase
              .from('products')
              .select('*')
              .eq('collection_id', data.collection_id)
              .neq('id', data.id)
              .eq('published', true)
              .order('sort_order', { ascending: true })
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
        console.error('getProduct exception:', e);
      }
    }
    return null;
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

        if (!error && data) return data;
        if (error) console.error('getBranches error:', error);
      } catch (e) {
        console.error('getBranches exception:', e);
      }
    }
    return [];
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

        if (!error && data) return data;
        if (error) console.error('getTestimonials error:', error);
      } catch (e) {
        console.error('getTestimonials exception:', e);
      }
    }
    return [];
  },

  // ── USPs ──
  async getUsps() {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('usps')
          .select('*')
          .eq('published', true)
          .order('sort_order', { ascending: true });

        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.error('getUsps exception:', e);
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
        console.error('getCatalogue exception:', e);
      }
    }
    return {
      title: 'New Ikon Doors Official Catalogue',
      file_url: '/catalogue/NEW_IKON_DOORS.pdf',
      pdf_url: '/catalogue/NEW_IKON_DOORS.pdf',
      version: '2026.1',
      file_size: '9.0 MB',
      active: true,
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

        if (!error && data) return { ...fallbackSettings, ...data };
      } catch (e) {
        console.error('getSettings exception:', e);
      }
    }
    return fallbackSettings;
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
      notifyDataChanged();
      return { success: true, id: record?.id };
    }

    throw new Error('Database service unavailable.');
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

  // ── ADMIN PRIVILEGED CRUD (Direct Supabase PostgreSQL) ──
  admin: {
    // Products
    async getProducts() {
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase
          .from('products')
          .select('*, collections(name, slug)')
          .order('sort_order', { ascending: true });
        if (!error && data) return data.map(p => formatProduct(p));
        if (error) throw new Error(sanitizeError(error));
      }
      return [];
    },

    async createProduct(prod) {
      const code = (prod.product_code || prod.code || '').trim();
      const slug = prod.slug || code.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const payload = {
        name: prod.name || `Door ${code}`,
        code,
        product_code: code,
        slug,
        collection_id: prod.collection_id ? Number(prod.collection_id) : null,
        description: prod.description || '',
        short_description: prod.short_description || '',
        primary_image: prod.primary_image || prod.image || '',
        image: prod.primary_image || prod.image || '',
        lifestyle_image: prod.lifestyle_image || '',
        lifestyle_title: prod.lifestyle_title || '',
        material: prod.material || '',
        finish: prod.finish || '',
        available_sizes: prod.available_sizes || '',
        applications: prod.applications || '',
        specs: typeof prod.specs === 'object' ? prod.specs : {},
        features: Array.isArray(prod.features) ? prod.features : [],
        gallery_images: Array.isArray(prod.gallery_images) ? prod.gallery_images : [],
        published: prod.published !== false && prod.published !== 0,
        featured: Boolean(prod.featured),
        sort_order: prod.sort_order !== undefined ? Number(prod.sort_order) : 99,
        seo_title: prod.seo_title || '',
        seo_description: prod.seo_description || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('products')
        .insert([payload])
        .select()
        .single();

      if (error) throw new Error(sanitizeError(error));
      notifyDataChanged();
      return formatProduct(data);
    },

    async updateProduct(id, prod) {
      const updatePayload = {
        ...prod,
        updated_at: new Date().toISOString()
      };
      delete updatePayload.id;
      delete updatePayload.collections;
      delete updatePayload.collection_name;
      delete updatePayload.collection_slug;
      if (updatePayload.collection_id) updatePayload.collection_id = Number(updatePayload.collection_id);
      if (updatePayload.sort_order !== undefined) updatePayload.sort_order = Number(updatePayload.sort_order);
      if (prod.product_code) updatePayload.code = prod.product_code;
      if (prod.primary_image) updatePayload.image = prod.primary_image;

      const { data, error } = await supabase
        .from('products')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(sanitizeError(error));
      notifyDataChanged();
      return formatProduct(data);
    },

    async deleteProduct(id) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw new Error(sanitizeError(error));
      notifyDataChanged();
      return { success: true };
    },

    // Collections
    async getCollections() {
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase
          .from('collections')
          .select('*, products(id)')
          .order('sort_order', { ascending: true });
        if (!error && data) return data.map(c => ({ ...c, product_count: c.products ? c.products.length : 0 }));
        if (error) throw new Error(sanitizeError(error));
      }
      return [];
    },

    async createCollection(col) {
      const payload = {
        name: col.name || 'New Collection',
        slug: col.slug || (col.name ? col.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : `col-${Date.now()}`),
        description: col.description || '',
        category: col.category || '',
        tagline: col.tagline || '',
        cover_image: col.cover_image || col.hero_image || '',
        hero_image: col.hero_image || col.cover_image || '',
        material: col.material || '',
        finish: col.finish || '',
        thickness: col.thickness || '',
        application: col.application || '',
        published: col.published !== false,
        featured: Boolean(col.featured),
        sort_order: col.sort_order !== undefined ? Number(col.sort_order) : 99,
        display_order: col.sort_order !== undefined ? Number(col.sort_order) : 99,
        seo_title: col.seo_title || '',
        seo_description: col.seo_description || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('collections')
        .insert([payload])
        .select()
        .single();

      if (error) throw new Error(sanitizeError(error));
      notifyDataChanged();
      return data;
    },

    async updateCollection(id, col) {
      const updatePayload = {
        ...col,
        updated_at: new Date().toISOString()
      };
      delete updatePayload.id;
      delete updatePayload.products;
      delete updatePayload.product_count;
      if (updatePayload.sort_order !== undefined) {
        updatePayload.sort_order = Number(updatePayload.sort_order);
        updatePayload.display_order = updatePayload.sort_order;
      }

      const { data, error } = await supabase
        .from('collections')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(sanitizeError(error));
      notifyDataChanged();
      return data;
    },

    async deleteCollection(id) {
      const { error } = await supabase.from('collections').delete().eq('id', id);
      if (error) throw new Error(sanitizeError(error));
      notifyDataChanged();
      return { success: true };
    },

    // Branches
    async getBranches() {
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase
          .from('branches')
          .select('*')
          .order('sort_order', { ascending: true });
        if (!error && data) return data;
        if (error) throw new Error(sanitizeError(error));
      }
      return [];
    },

    async createBranch(branch) {
      const payload = {
        name: branch.name || 'New Branch',
        category: branch.category || 'Showroom & Retail Display',
        badge: branch.badge || '',
        description: branch.description || '',
        address: branch.address || '',
        phone: branch.phone || '',
        phone_alt: branch.phone_alt || '',
        whatsapp: branch.whatsapp || '',
        maps_url: branch.maps_url || branch.map_url || '',
        map_url: branch.map_url || branch.maps_url || '',
        image_url: branch.image_url || branch.image || '',
        image: branch.image || branch.image_url || '',
        opening_hours: branch.opening_hours || branch.timings || '',
        timings: branch.timings || branch.opening_hours || '',
        highlights: Array.isArray(branch.highlights) ? branch.highlights : [],
        published: branch.published !== false,
        sort_order: branch.sort_order !== undefined ? Number(branch.sort_order) : 99,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('branches')
        .insert([payload])
        .select()
        .single();

      if (error) throw new Error(sanitizeError(error));
      notifyDataChanged();
      return data;
    },

    async updateBranch(id, branch) {
      const updatePayload = { ...branch, updated_at: new Date().toISOString() };
      delete updatePayload.id;
      if (updatePayload.sort_order !== undefined) updatePayload.sort_order = Number(updatePayload.sort_order);

      const { data, error } = await supabase
        .from('branches')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(sanitizeError(error));
      notifyDataChanged();
      return data;
    },

    async deleteBranch(id) {
      const { error } = await supabase.from('branches').delete().eq('id', id);
      if (error) throw new Error(sanitizeError(error));
      notifyDataChanged();
      return { success: true };
    },

    // Testimonials
    async getTestimonials() {
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase
          .from('testimonials')
          .select('*')
          .order('sort_order', { ascending: true });
        if (!error && data) return data;
        if (error) throw new Error(sanitizeError(error));
      }
      return [];
    },

    async createTestimonial(t) {
      const payload = {
        customer_name: t.customer_name || t.name || 'Valued Client',
        name: t.name || t.customer_name || 'Valued Client',
        company: t.company || '',
        designation: t.designation || t.role || '',
        role: t.role || t.designation || '',
        location: t.location || 'Trichy',
        content: t.content || t.quote || '',
        quote: t.quote || t.content || '',
        image_url: t.image_url || t.photo || '',
        photo: t.photo || t.image_url || '',
        rating: t.rating ? Number(t.rating) : 5,
        project: t.project || '',
        published: t.published !== false,
        sort_order: t.sort_order !== undefined ? Number(t.sort_order) : 99,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('testimonials')
        .insert([payload])
        .select()
        .single();

      if (error) throw new Error(sanitizeError(error));
      notifyDataChanged();
      return data;
    },

    async updateTestimonial(id, t) {
      const updatePayload = { ...t, updated_at: new Date().toISOString() };
      delete updatePayload.id;
      if (updatePayload.rating !== undefined) updatePayload.rating = Number(updatePayload.rating);
      if (updatePayload.sort_order !== undefined) updatePayload.sort_order = Number(updatePayload.sort_order);

      const { data, error } = await supabase
        .from('testimonials')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(sanitizeError(error));
      notifyDataChanged();
      return data;
    },

    async deleteTestimonial(id) {
      const { error } = await supabase.from('testimonials').delete().eq('id', id);
      if (error) throw new Error(sanitizeError(error));
      notifyDataChanged();
      return { success: true };
    },

    // USPs
    async getUsps() {
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase
          .from('usps')
          .select('*')
          .order('sort_order', { ascending: true });
        if (!error && data) return data;
      }
      return fallbackUsps;
    },

    async createUsp(u) {
      const payload = {
        title: u.title || 'Architectural Advantage',
        description: u.description || '',
        icon: u.icon || 'Cpu',
        verified: u.verified !== false,
        published: u.published !== false,
        sort_order: u.sort_order !== undefined ? Number(u.sort_order) : 99,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('usps')
        .insert([payload])
        .select()
        .single();

      if (error) throw new Error(sanitizeError(error));
      notifyDataChanged();
      return data;
    },

    async updateUsp(id, u) {
      const updatePayload = { ...u, updated_at: new Date().toISOString() };
      delete updatePayload.id;
      if (updatePayload.sort_order !== undefined) updatePayload.sort_order = Number(updatePayload.sort_order);

      const { data, error } = await supabase
        .from('usps')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(sanitizeError(error));
      notifyDataChanged();
      return data;
    },

    async deleteUsp(id) {
      const { error } = await supabase.from('usps').delete().eq('id', id);
      if (error) throw new Error(sanitizeError(error));
      notifyDataChanged();
      return { success: true };
    },

    // Catalogue
    async getCatalogue() {
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase
          .from('catalogue')
          .select('*')
          .order('id', { ascending: false });
        if (!error && data && data.length > 0) return data;
      }
      return [await api.getCatalogue()];
    },

    async updateCatalogue(cat) {
      const payload = {
        title: cat.title || 'New Ikon Doors Official Catalogue',
        pdf_url: cat.pdf_url || cat.file_url || '/catalogue/NEW_IKON_DOORS.pdf',
        file_url: cat.pdf_url || cat.file_url || '/catalogue/NEW_IKON_DOORS.pdf',
        version: cat.version || '2026.1',
        file_size: cat.file_size || '9.0 MB',
        published: true,
        active: true,
        updated_at: new Date().toISOString()
      };

      if (isSupabaseConfigured() && supabase) {
        await supabase.from('catalogue').update({ published: false, active: false }).neq('id', 0);
        const { data, error } = await supabase.from('catalogue').insert([payload]).select().single();
        if (error) throw new Error(sanitizeError(error));
        notifyDataChanged();
        return data;
      }
      return payload;
    },

    // Settings
    async getSettings() {
      return api.getSettings();
    },

    async updateSettings(settings) {
      if (isSupabaseConfigured() && supabase) {
        const payload = {
          id: 1,
          ...settings,
          updated_at: new Date().toISOString()
        };
        const { data, error } = await supabase
          .from('site_settings')
          .upsert(payload)
          .select()
          .single();

        if (error) throw new Error(sanitizeError(error));
        notifyDataChanged();
        return data || payload;
      }
      return settings;
    },

    // Enquiries
    async getEnquiries(status = null) {
      if (isSupabaseConfigured() && supabase) {
        let q = supabase.from('enquiries').select('*').order('created_at', { ascending: false });
        if (status) q = q.eq('status', status.toUpperCase());
        const { data, error } = await q;
        if (!error && data) return data;
        if (error) throw new Error(sanitizeError(error));
      }
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
        notifyDataChanged();
        return record;
      }
      return data;
    },

    async deleteEnquiry(id) {
      if (isSupabaseConfigured() && supabase) {
        const { error } = await supabase.from('enquiries').delete().eq('id', id);
        if (error) throw new Error(sanitizeError(error));
        notifyDataChanged();
      }
      return { success: true };
    },

    // File upload (Supabase Cloud Storage)
    async uploadFile(bucket, file, folder = '') {
      return storageService.uploadFile(bucket, file, folder);
    },

    // Dashboard Stats (Direct counts from shared Supabase database)
    async getDashboard() {
      if (isSupabaseConfigured() && supabase) {
        const [pRes, cRes, bRes, tRes, eRes, catRes] = await Promise.allSettled([
          supabase.from('products').select('id, published'),
          supabase.from('collections').select('id'),
          supabase.from('branches').select('id'),
          supabase.from('testimonials').select('id'),
          supabase.from('enquiries').select('id, status'),
          supabase.from('catalogue').select('*').order('id', { ascending: false }).limit(1).maybeSingle()
        ]);

        const prods = pRes.status === 'fulfilled' && pRes.value.data ? pRes.value.data : [];
        const cols = cRes.status === 'fulfilled' && cRes.value.data ? cRes.value.data : [];
        const branches = bRes.status === 'fulfilled' && bRes.value.data ? bRes.value.data : [];
        const tests = tRes.status === 'fulfilled' && tRes.value.data ? tRes.value.data : [];
        const enqs = eRes.status === 'fulfilled' && eRes.value.data ? eRes.value.data : [];
        const cat = catRes.status === 'fulfilled' && catRes.value.data ? catRes.value.data : null;

        return {
          total_products: prods.length,
          published_products: prods.filter(p => p.published).length,
          total_collections: cols.length,
          total_branches: branches.length,
          total_testimonials: tests.length,
          total_enquiries: enqs.length,
          new_enquiries: enqs.filter(e => e.status === 'NEW').length,
          current_catalogue: cat || {
            title: 'New Ikon Doors Official Catalogue',
            file_url: '/catalogue/NEW_IKON_DOORS.pdf',
            version: '2026.1'
          }
        };
      }

      return {
        total_products: 0,
        published_products: 0,
        total_collections: 0,
        total_branches: 0,
        total_testimonials: 0,
        total_enquiries: 0,
        new_enquiries: 0,
        current_catalogue: null
      };
    },

    // Reset method (noop in pure cloud database)
    resetToDefaults() {
      notifyDataChanged();
      return true;
    }
  }
};
