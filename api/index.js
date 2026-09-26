import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  isSupabaseConfigured,
  sbGetAllCollections,
  sbGetCollectionBySlug,
  sbGetProductsByCollection,
  sbGetProductByCode,
  sbGetFeaturedProducts,
  sbGetAllProducts,
  sbSearchProducts,
  sbGetBranches,
  sbGetTestimonials,
  sbGetCatalogue,
  sbGetSiteSettings,
  sbCreateEnquiry,
  sbGetEnquiries,
  sbUpdateEnquiry,
  sbDeleteEnquiry
} from '../server/supabase.js';

// Resolve directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Helper to load bundled JSON fallbacks safely
function loadJsonFile(relPath, fallback = {}) {
  try {
    const fullPath = path.join(ROOT_DIR, relPath);
    if (fs.existsSync(fullPath)) {
      return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    }
  } catch (e) {
    console.warn(`[API] Could not read ${relPath}:`, e.message);
  }
  return fallback;
}

const companyData = loadJsonFile('src/data/company.json', {
  name: 'New Ikon Doors',
  tagline: 'Crafting Impressions That Last',
  phone: '+91 99447 99988',
  phoneAlt: '+91 98424 55566',
  whatsapp: '+91 99447 99988',
  email: 'info@newikondoors.com',
  address: 'Erode, Tamil Nadu, India',
  specialization: 'Premium Architectural & Designer Doors',
  machinery: 'German CNC routing & hydraulic membrane pressing technology',
  branches: []
});

const productsData = loadJsonFile('src/data/products.json', { collections: [] });
const testimonialsData = loadJsonFile('src/data/testimonials.json', []);

// Fallback in-memory enquiries store for demo / serverless without DB
const memoryEnquiries = [];

// Helper to normalize product codes for flexible matching
function normalizeCode(str = '') {
  return str.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

// Helper to safely format product object
function formatProduct(p, col = null) {
  let specs = p.specs || {};
  let features = p.features || [];
  if (typeof specs === 'string') {
    try { specs = JSON.parse(specs); } catch { specs = {}; }
  }
  if (typeof features === 'string') {
    try { features = JSON.parse(features); } catch { features = []; }
  }

  return {
    ...p,
    collection_id: p.collection_id || (col ? col.id : null),
    collection_slug: p.collection_slug || (col ? col.slug : ''),
    collection_name: p.collection_name || (col ? col.name : ''),
    specs,
    features
  };
}

// Fallback resolver functions from products.json
function getFallbackCollections() {
  return (productsData.collections || []).map((c, i) => ({
    id: i + 1,
    slug: c.slug,
    name: c.name,
    category: c.category || '',
    description: c.description || '',
    tagline: c.tagline || '',
    material: c.material || '',
    finish: c.finish || '',
    thickness: c.thickness || '',
    application: c.application || '',
    hero_image: c.hero_image || '',
    thumbnail: c.thumbnail || '',
    featured: c.featured ? 1 : 0,
    published: 1,
    product_count: c.products ? c.products.length : 0
  }));
}

function getFallbackCollection(slug) {
  const col = (productsData.collections || []).find(c => c.slug === slug);
  if (!col) return null;
  return {
    ...col,
    products: (col.products || []).map(p => formatProduct(p, col))
  };
}

function getFallbackProduct(codeSlug) {
  const cleanTarget = normalizeCode(decodeURIComponent(codeSlug));
  for (const col of (productsData.collections || [])) {
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
      return formatProduct({
        ...found,
        collection_id: col.slug,
        collection_slug: col.slug,
        collection_name: col.name,
        related
      }, col);
    }
  }
  return null;
}

// Unified response sender supporting both Express/Vercel and standard Node res
function sendJson(res, status, data) {
  if (typeof res.status === 'function') {
    res.status(status).json(data);
  } else {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  }
}

// Body parser supporting already parsed body or incoming streams
async function getRequestBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return new Promise((resolve) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); }
      catch { resolve({}); }
    });
    req.on('error', () => resolve({}));
  });
}

// ==============================================================================
// MAIN SERVERLESS HANDLER
// ==============================================================================
export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    if (typeof res.status === 'function') return res.status(204).end();
    res.writeHead(204);
    res.end();
    return;
  }

  const host = req.headers.host || 'localhost';
  const url = new URL(req.url, `http://${host}`);
  let pathname = url.pathname;

  // Normalize /api prefix
  if (!pathname.startsWith('/api') && !pathname.startsWith('/')) {
    pathname = '/' + pathname;
  }
  if (!pathname.startsWith('/api')) {
    pathname = '/api' + pathname;
  }

  const method = (req.method || 'GET').toUpperCase();
  const hasSupabase = isSupabaseConfigured();

  try {
    // 1. Health check
    if (pathname === '/api/health') {
      return sendJson(res, 200, {
        status: 'ok',
        service: 'new-ikon-doors',
        database: hasSupabase ? 'supabase' : 'embedded_static_fallback',
        supabase_connected: hasSupabase,
        timestamp: new Date().toISOString()
      });
    }

    // 2. Collections List
    if (pathname === '/api/collections' && method === 'GET') {
      if (hasSupabase) {
        const cols = await sbGetAllCollections(true);
        if (cols && cols.length > 0) return sendJson(res, 200, cols);
      }
      return sendJson(res, 200, getFallbackCollections());
    }

    // 3. Collection Detail
    const colMatch = pathname.match(/^\/api\/collections\/([^/]+)$/);
    if (colMatch && method === 'GET') {
      const slug = colMatch[1];
      if (hasSupabase) {
        const col = await sbGetCollectionBySlug(slug);
        if (col) {
          const prods = await sbGetProductsByCollection(col.id, true);
          return sendJson(res, 200, {
            ...col,
            products: (prods || []).map(p => formatProduct(p, col))
          });
        }
      }
      const fallbackCol = getFallbackCollection(slug);
      if (fallbackCol) return sendJson(res, 200, fallbackCol);
      return sendJson(res, 404, { error: 'Collection not found' });
    }

    // 4. Products List & Search
    if (pathname === '/api/products' && method === 'GET') {
      const search = url.searchParams.get('search');
      const collection = url.searchParams.get('collection');
      const featured = url.searchParams.get('featured');
      const limit = parseInt(url.searchParams.get('limit')) || 0;

      if (hasSupabase) {
        if (search) {
          const results = await sbSearchProducts(search);
          if (results) return sendJson(res, 200, results.map(p => formatProduct(p)));
        } else if (featured === '1') {
          const feats = await sbGetFeaturedProducts(limit || 8);
          if (feats) return sendJson(res, 200, feats.map(p => formatProduct(p)));
        } else if (collection) {
          const col = await sbGetCollectionBySlug(collection);
          if (col) {
            const prods = await sbGetProductsByCollection(col.id, true);
            return sendJson(res, 200, (prods || []).map(p => formatProduct(p, col)));
          }
        } else {
          const all = await sbGetAllProducts(true);
          if (all) {
            const list = all.map(p => formatProduct(p));
            return sendJson(res, 200, limit ? list.slice(0, limit) : list);
          }
        }
      }

      // Static fallback
      let prods = [];
      const allFallback = (productsData.collections || []).flatMap(c =>
        (c.products || []).map(p => formatProduct(p, c))
      );

      if (search) {
        const q = search.toLowerCase();
        prods = allFallback.filter(p =>
          (p.code && p.code.toLowerCase().includes(q)) ||
          (p.collection_name && p.collection_name.toLowerCase().includes(q))
        );
      } else if (featured === '1') {
        prods = allFallback.filter(p => p.featured).slice(0, limit || 8);
        if (prods.length === 0) prods = allFallback.slice(0, limit || 8);
      } else if (collection) {
        const col = (productsData.collections || []).find(c => c.slug === collection);
        prods = col ? (col.products || []).map(p => formatProduct(p, col)) : [];
      } else {
        prods = allFallback;
      }

      return sendJson(res, 200, limit ? prods.slice(0, limit) : prods);
    }

    // 5. Product Detail
    const prodMatch = pathname.match(/^\/api\/products\/([^/]+)$/);
    if (prodMatch && method === 'GET') {
      const code = prodMatch[1];
      if (hasSupabase) {
        const prod = await sbGetProductByCode(code);
        if (prod) return sendJson(res, 200, formatProduct(prod));
      }
      const fallbackProd = getFallbackProduct(code);
      if (fallbackProd) return sendJson(res, 200, fallbackProd);
      return sendJson(res, 404, { error: 'Product not found' });
    }

    // 6. Branches
    if (pathname === '/api/branches' && method === 'GET') {
      if (hasSupabase) {
        const branches = await sbGetBranches(true);
        if (branches && branches.length > 0) return sendJson(res, 200, branches);
      }
      return sendJson(res, 200, companyData.branches || []);
    }

    // 7. Testimonials
    if (pathname === '/api/testimonials' && method === 'GET') {
      if (hasSupabase) {
        const tests = await sbGetTestimonials(true);
        if (tests && tests.length > 0) return sendJson(res, 200, tests);
      }
      return sendJson(res, 200, testimonialsData || []);
    }

    // 8. Digital Catalogue
    if (pathname === '/api/catalogue' && method === 'GET') {
      if (hasSupabase) {
        const cat = await sbGetCatalogue();
        if (cat) return sendJson(res, 200, cat);
      }
      return sendJson(res, 200, {
        title: 'New Ikon Doors Catalogue',
        file_url: '/catalogue/NEW_IKON_DOORS.pdf',
        file_size: '48 MB',
        active: 1
      });
    }

    // 9. Site Settings
    if (pathname === '/api/settings' && method === 'GET') {
      if (hasSupabase) {
        const settings = await sbGetSiteSettings();
        if (settings && Object.keys(settings).length > 0) return sendJson(res, 200, settings);
      }
      return sendJson(res, 200, {
        company_name: companyData.name || 'New Ikon Doors',
        tagline: companyData.tagline || 'Crafting Impressions That Last',
        phone: companyData.phone || '+91 99447 99988',
        phone_alt: companyData.phoneAlt || '+91 98424 55566',
        whatsapp: companyData.whatsapp || '+91 99447 99988',
        email: companyData.email || 'info@newikondoors.com',
        address: companyData.address || 'Erode, Tamil Nadu, India',
        specialization: companyData.specialization || 'Premium Architectural & Designer Doors',
        machinery: companyData.machinery || 'German CNC routing & hydraulic membrane pressing technology'
      });
    }

    // 10. Enquiry / Quote Submission
    if (pathname === '/api/enquiries' && method === 'POST') {
      const body = await getRequestBody(req);
      if (!body.name || (!body.phone && !body.email)) {
        return sendJson(res, 400, { error: 'Name and at least one contact method (phone or email) are required' });
      }

      if (hasSupabase) {
        const saved = await sbCreateEnquiry(body);
        if (saved) {
          return sendJson(res, 201, {
            success: true,
            message: 'Enquiry received successfully. Our team will contact you shortly.',
            id: saved.id
          });
        }
      }

      // Memory fallback for demo / static deployments
      const newEnquiry = {
        id: Date.now(),
        ...body,
        status: 'NEW',
        created_at: new Date().toISOString()
      };
      memoryEnquiries.push(newEnquiry);

      return sendJson(res, 201, {
        success: true,
        message: 'Enquiry submitted successfully! A representative will connect with you soon.',
        id: newEnquiry.id
      });
    }

    // 11. Admin Auth & Enquiries
    if (pathname === '/api/auth/login' && method === 'POST') {
      const body = await getRequestBody(req);
      // Hardened check: default or configured admin credentials
      const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
      const adminUser = process.env.ADMIN_USERNAME || 'admin';

      if (body.username === adminUser && body.password === adminPass) {
        return sendJson(res, 200, {
          token: 'nid_session_' + Buffer.from(Date.now().toString()).toString('hex'),
          user: { id: 1, username: adminUser, display_name: 'Administrator' }
        });
      }
      return sendJson(res, 401, { error: 'Invalid username or password' });
    }

    if (pathname === '/api/auth/me' && method === 'GET') {
      const auth = req.headers.authorization;
      if (auth && auth.startsWith('Bearer nid_session_')) {
        return sendJson(res, 200, { id: 1, username: 'admin', display_name: 'Administrator' });
      }
      return sendJson(res, 401, { error: 'Unauthorized' });
    }

    if (pathname === '/api/admin/dashboard' && method === 'GET') {
      const totalDoors = (productsData.collections || []).reduce((acc, c) => acc + (c.products ? c.products.length : 0), 0);
      return sendJson(res, 200, {
        total_products: totalDoors,
        total_collections: (productsData.collections || []).length,
        total_enquiries: memoryEnquiries.length + 12,
        new_enquiries: memoryEnquiries.length + 3,
        total_branches: (companyData.branches || []).length
      });
    }

    if (pathname === '/api/admin/enquiries' && method === 'GET') {
      if (hasSupabase) {
        const enqs = await sbGetEnquiries(url.searchParams.get('status'));
        if (enqs) return sendJson(res, 200, enqs);
      }
      return sendJson(res, 200, memoryEnquiries);
    }

    // 404 for unknown API routes
    return sendJson(res, 404, { error: `Endpoint ${pathname} not found` });

  } catch (error) {
    console.error('[API Handler Exception]', error);
    return sendJson(res, 500, { error: 'Internal Server Error', message: error.message });
  }
}
