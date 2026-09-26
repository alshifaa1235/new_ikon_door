// API client for New Ikon Doors with resilient static fallback
import companyData from '../data/company.json';
import productsData from '../data/products.json';
import testimonialsData from '../data/testimonials.json';

const BASE = '';

async function request(path, options = {}) {
  const token = localStorage.getItem('nid_token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { cache: 'no-store', ...options, headers });
  const data = await res.json();
  if (!res.ok) throw { status: res.status, ...data };
  return data;
}

// Helper to normalize product codes for flexible matching
function normalizeCode(str = '') {
  return str.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

// Fallback resolver functions
function getFallbackCollections() {
  return productsData.collections.map(c => ({
    ...c,
    product_count: c.products ? c.products.length : 0
  }));
}

function getFallbackCollection(slug) {
  const col = productsData.collections.find(c => c.slug === slug);
  if (!col) return null;
  return {
    ...col,
    products: col.products || []
  };
}

function getFallbackProduct(codeSlug) {
  const cleanTarget = normalizeCode(decodeURIComponent(codeSlug));
  for (const col of productsData.collections) {
    const found = (col.products || []).find(p => normalizeCode(p.code) === cleanTarget);
    if (found) {
      const related = (col.products || [])
        .filter(p => normalizeCode(p.code) !== cleanTarget)
        .slice(0, 4)
        .map(p => ({
          ...p,
          collection_slug: col.slug,
          collection_name: col.name
        }));
      return {
        ...found,
        collection_id: col.slug,
        collection_slug: col.slug,
        collection_name: col.name,
        related
      };
    }
  }
  return null;
}

// ---- Public API ----
export const api = {
  // Collections
  getCollections: () => request('/api/collections').catch(() => getFallbackCollections()),
  getCollection: (slug) => request(`/api/collections/${slug}`).catch(() => getFallbackCollection(slug)),

  // Products
  getProducts: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/api/products${q ? '?' + q : ''}`).catch(() => {
      const all = productsData.collections.flatMap(c => (c.products || []).map(p => ({
        ...p,
        collection_slug: c.slug,
        collection_name: c.name
      })));
      const limit = parseInt(params.limit) || 0;
      return limit ? all.slice(0, limit) : all;
    });
  },
  getProduct: (codeSlug) => request(`/api/products/${encodeURIComponent(codeSlug)}`).catch(() => getFallbackProduct(codeSlug)),
  getFeaturedProducts: (limit = 8) => request(`/api/products?featured=1&limit=${limit}`).catch(() => {
    const featured = productsData.collections.flatMap(c => (c.products || []).map(p => ({
      ...p,
      collection_slug: c.slug,
      collection_name: c.name
    }))).slice(0, limit);
    return featured;
  }),
  searchProducts: (query) => request(`/api/products?search=${encodeURIComponent(query)}`).catch(() => {
    const q = query.toLowerCase();
    return productsData.collections.flatMap(c => (c.products || []).map(p => ({
      ...p,
      collection_slug: c.slug,
      collection_name: c.name
    }))).filter(p => (p.code && p.code.toLowerCase().includes(q)) || (p.collection_name && p.collection_name.toLowerCase().includes(q)));
  }),

  // Branches
  getBranches: () => request('/api/branches').catch(() => companyData.branches || []),

  // Testimonials
  getTestimonials: () => request('/api/testimonials').catch(() => testimonialsData || []),

  // Catalogue
  getCatalogue: () => request('/api/catalogue').catch(() => ({
    title: 'New Ikon Doors Catalogue',
    file_url: '/catalogue/NEW_IKON_DOORS.pdf',
    active: 1
  })),

  // Homepage
  getHomepage: () => request('/api/homepage').catch(() => ({})),

  // Settings
  getSettings: () => request('/api/settings').catch(() => ({
    company_name: companyData.name,
    tagline: companyData.tagline,
    phone: companyData.phone,
    phone_alt: companyData.phoneAlt,
    whatsapp: companyData.whatsapp,
    email: companyData.email,
    address: companyData.address,
    specialization: companyData.specialization,
    machinery: companyData.machinery
  })),

  // Enquiry submission
  submitEnquiry: (data) => request('/api/enquiries', { method: 'POST', body: JSON.stringify(data) }),

  // ---- Auth ----
  login: (username, password) => request('/api/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  me: () => request('/api/auth/me'),

  // ---- Admin ----
  admin: {
    getDashboard: () => request('/api/admin/dashboard'),
    getProducts: () => request('/api/admin/products'),
    createProduct: (data) => request('/api/admin/products', { method: 'POST', body: JSON.stringify(data) }),
    updateProduct: (id, data) => request(`/api/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteProduct: (id) => request(`/api/admin/products/${id}`, { method: 'DELETE' }),
    getCollections: () => request('/api/admin/collections'),
    createCollection: (data) => request('/api/admin/collections', { method: 'POST', body: JSON.stringify(data) }),
    updateCollection: (id, data) => request(`/api/admin/collections/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteCollection: (id) => request(`/api/admin/collections/${id}`, { method: 'DELETE' }),
    getEnquiries: (status) => request(`/api/admin/enquiries${status ? '?status=' + status : ''}`),
    updateEnquiry: (id, data) => request(`/api/admin/enquiries/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteEnquiry: (id) => request(`/api/admin/enquiries/${id}`, { method: 'DELETE' }),
    getBranches: () => request('/api/admin/branches'),
    createBranch: (data) => request('/api/admin/branches', { method: 'POST', body: JSON.stringify(data) }),
    updateBranch: (id, data) => request(`/api/admin/branches/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteBranch: (id) => request(`/api/admin/branches/${id}`, { method: 'DELETE' }),
    getTestimonials: () => request('/api/admin/testimonials'),
    createTestimonial: (data) => request('/api/admin/testimonials', { method: 'POST', body: JSON.stringify(data) }),
    updateTestimonial: (id, data) => request(`/api/admin/testimonials/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteTestimonial: (id) => request(`/api/admin/testimonials/${id}`, { method: 'DELETE' }),
    uploadImage: (filename, base64) => request('/api/admin/upload', { method: 'POST', body: JSON.stringify({ filename, base64 }) }),
    getCatalogue: () => request('/api/admin/catalogue'),
    updateCatalogue: (data) => request('/api/admin/catalogue', { method: 'PUT', body: JSON.stringify(data) }),
    getHomepage: () => request('/api/admin/homepage'),
    updateHomepage: (data) => request('/api/admin/homepage', { method: 'PUT', body: JSON.stringify(data) }),
    getSettings: () => request('/api/admin/settings'),
    updateSettings: (data) => request('/api/admin/settings', { method: 'PUT', body: JSON.stringify(data) }),
  }
};
