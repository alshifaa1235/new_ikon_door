import fs from 'fs';
import path from 'path';
import { getDb, hashPassword, verifyPassword, createSession, validateSession, deleteSession, logAudit,
  getAllCollections, getCollectionBySlug, getProductsByCollection, getProductByCode, getProductByIdentifier,
  getFeaturedProducts, getAllProducts, searchProducts, getBranches, getTestimonials, getActiveCatalogue,
  getHomepageContent, getSiteSettings, getEnquiries, getDashboardStats, syncDbToJson } from './db.js';

// --- Helper to parse JSON safely ---
function safeJson(val, fallback) {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  try { return JSON.parse(val); } catch (e) { return fallback; }
}

function formatProduct(p, col = null) {
  const specs = safeJson(p.specs, {});
  const features = safeJson(p.features, []);
  if (p.material && !specs['Material']) specs['Material'] = p.material;
  if (p.finish && !specs['Surface Finish']) specs['Surface Finish'] = p.finish;
  if (p.available_sizes && !specs['Standard Sizes']) specs['Standard Sizes'] = p.available_sizes;
  if (p.applications && !specs['Application']) specs['Application'] = p.applications;

  return {
    ...p,
    collection_id: p.collection_id || (col ? col.id : null),
    collection_slug: p.collection_slug || (col ? col.slug : ''),
    collection_name: p.collection_name || (col ? col.name : ''),
    specs,
    features
  };
}

// --- Middleware-style API handler for Vite dev server ---
export function createApiHandler() {
  const db = getDb();

  return async function handleApiRequest(req, res) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const path = url.pathname;
    const method = req.method;

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

    // Parse JSON body for POST/PUT
    let body = {};
    if (method === 'POST' || method === 'PUT') {
      try {
        body = await parseBody(req);
      } catch (e) {
        return json(res, 400, { error: 'Invalid JSON body' });
      }
    }

    // Session helper
    const getSession = () => {
      const auth = req.headers.authorization;
      if (auth?.startsWith('Bearer ')) return validateSession(auth.slice(7));
      return null;
    };

    const requireAuth = () => {
      const session = getSession();
      if (!session) { json(res, 401, { error: 'Unauthorized' }); return null; }
      return session;
    };

    try {
      // ============================
      // PUBLIC API ROUTES
      // ============================

      // --- Health Check ---
      if (path === '/api/health' && method === 'GET') {
        return json(res, 200, { status: 'ok', service: 'new-ikon-doors' });
      }

      // --- Collections ---
      if (path === '/api/collections' && method === 'GET') {
        return json(res, 200, getAllCollections(true));
      }

      if (path.match(/^\/api\/collections\/([^/]+)$/) && method === 'GET') {
        const slug = path.split('/')[3];
        const col = getCollectionBySlug(slug);
        if (!col) return json(res, 404, { error: 'Collection not found' });
        const rawProducts = getProductsByCollection(col.id, true);
        const products = rawProducts.map(p => formatProduct(p, col));
        return json(res, 200, { ...col, products });
      }

      // --- Products ---
      if (path === '/api/products' && method === 'GET') {
        const search = url.searchParams.get('search');
        const collection = url.searchParams.get('collection');
        const featured = url.searchParams.get('featured');
        const limit = parseInt(url.searchParams.get('limit')) || 0;

        let prods = [];
        if (search) prods = searchProducts(search);
        else if (featured === '1') prods = getFeaturedProducts(limit || 8);
        else if (collection) {
          const col = getCollectionBySlug(collection);
          if (!col) return json(res, 200, []);
          prods = getProductsByCollection(col.id, true).map(p => formatProduct(p, col));
          return json(res, 200, prods);
        } else {
          prods = getAllProducts(true);
        }
        const formatted = prods.map(p => formatProduct(p));
        return json(res, 200, limit ? formatted.slice(0, limit) : formatted);
      }

      if (path.match(/^\/api\/products\/([^/]+)$/) && method === 'GET') {
        const rawCode = path.split('/api/products/')[1];
        const product = getProductByIdentifier(rawCode);
        if (!product) return json(res, 404, { error: 'Product not found' });

        // Get related products from same collection
        const related = product.collection_id
          ? db.prepare('SELECT p.*, c.slug as collection_slug, c.name as collection_name FROM products p LEFT JOIN collections c ON p.collection_id = c.id WHERE p.collection_id = ? AND p.code != ? AND p.published = 1 ORDER BY RANDOM() LIMIT 6').all(product.collection_id, product.code)
          : [];

        const formattedProduct = formatProduct(product);
        return json(res, 200, {
          ...formattedProduct,
          related: related.map(r => formatProduct(r))
        });
      }

      // --- Branches ---
      if (path === '/api/branches' && method === 'GET') {
        const branches = getBranches(true);
        return json(res, 200, branches.map(b => ({ ...b, highlights: JSON.parse(b.highlights || '[]') })));
      }

      // --- Testimonials ---
      if (path === '/api/testimonials' && method === 'GET') {
        return json(res, 200, getTestimonials(true));
      }

      // --- Catalogue ---
      if (path === '/api/catalogue' && method === 'GET') {
        return json(res, 200, getActiveCatalogue() || {});
      }

      // --- Homepage Content ---
      if (path === '/api/homepage' && method === 'GET') {
        return json(res, 200, getHomepageContent());
      }

      // --- Site Settings ---
      if (path === '/api/settings' && method === 'GET') {
        return json(res, 200, getSiteSettings());
      }

      // --- Enquiry Submission (public) ---
      if (path === '/api/enquiries' && method === 'POST') {
        const { name, company, phone, whatsapp, email, location, customer_type, requirement, collection, product_code, quantity, message } = body;
        if (!name || (!phone && !email)) return json(res, 400, { error: 'Name and contact (phone or email) required' });

        db.prepare(`INSERT INTO enquiries (name, company, phone, whatsapp, email, location, customer_type, requirement, collection, product_code, quantity, message, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'NEW')
        `).run(name, company || '', phone || '', whatsapp || '', email || '', location || '', customer_type || '', requirement || '', collection || '', product_code || '', quantity || '', message || '');

        logAudit('ENQUIRY_SUBMITTED', 'enquiry', '', `From: ${name}`, null);
        return json(res, 201, { success: true, message: 'Enquiry submitted successfully' });
      }

      // ============================
      // AUTH ROUTES
      // ============================

      if (path === '/api/auth/login' && method === 'POST') {
        const { username, password } = body;
        if (!username || !password) return json(res, 400, { error: 'Username and password required' });

        const user = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username);
        if (!user || !verifyPassword(password, user.password_hash)) {
          return json(res, 401, { error: 'Invalid credentials' });
        }

        const session = createSession(user.id);
        logAudit('LOGIN', 'admin_user', String(user.id), `User ${username} logged in`, user.id);
        return json(res, 200, { token: session.id, expires: session.expires, user: { id: user.id, username: user.username, displayName: user.display_name } });
      }

      if (path === '/api/auth/logout' && method === 'POST') {
        const auth = req.headers.authorization;
        if (auth?.startsWith('Bearer ')) deleteSession(auth.slice(7));
        return json(res, 200, { success: true });
      }

      if (path === '/api/auth/me' && method === 'GET') {
        const session = getSession();
        if (!session) return json(res, 401, { error: 'Not authenticated' });
        return json(res, 200, { id: session.user_id, username: session.username, displayName: session.display_name });
      }

      // ============================
      // ADMIN API ROUTES
      // ============================

      // --- Dashboard ---
      if (path === '/api/admin/dashboard' && method === 'GET') {
        if (!requireAuth()) return;
        return json(res, 200, getDashboardStats());
      }

      // --- Admin Products ---
      if (path === '/api/admin/products' && method === 'GET') {
        if (!requireAuth()) return;
        const all = getAllProducts(false);
        return json(res, 200, all.map(p => formatProduct(p)));
      }

      if (path === '/api/admin/products' && method === 'POST') {
        const session = requireAuth();
        if (!session) return;
        const { code, name, collection_id, short_description, description, image, specs, features, applications, available_sizes, material, finish, featured, published } = body;
        if (!code) return json(res, 400, { error: 'Product code is required' });

        const slug = code.trim().replace(/\s+/g, '-');
        let initialSpecs = specs && typeof specs === 'object' ? { ...specs } : {};
        if (material) initialSpecs['Material'] = material;
        if (finish) initialSpecs['Surface Finish'] = finish;
        if (available_sizes) initialSpecs['Standard Sizes'] = available_sizes;
        if (applications) initialSpecs['Application'] = applications;

        const featuresArray = Array.isArray(features) ? features : (typeof features === 'string' ? features.split('\n').filter(Boolean) : []);

        db.prepare(`INSERT INTO products (code, name, collection_id, short_description, description, image, specs, features, applications, available_sizes, material, finish, featured, published, slug)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(code.trim(), name || `Door ${code.trim()}`, collection_id ? parseInt(collection_id) : null, short_description || '', description || '', image || '', JSON.stringify(initialSpecs), JSON.stringify(featuresArray), applications || '', available_sizes || '', material || '', finish || '', featured ? 1 : 0, published !== undefined ? (published ? 1 : 0) : 1, slug);

        logAudit('PRODUCT_CREATED', 'product', code, `Created product ${code}`, session.user_id);
        syncDbToJson();
        return json(res, 201, { success: true });
      }

      if (path.match(/^\/api\/admin\/products\/(\d+)$/) && method === 'PUT') {
        const session = requireAuth();
        if (!session) return;
        const id = path.split('/').pop();
        const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
        if (!existing) return json(res, 404, { error: 'Product not found' });

        const {
          code = existing.code,
          name = existing.name,
          collection_id = existing.collection_id,
          short_description = existing.short_description,
          description = existing.description,
          image = existing.image,
          specs,
          features,
          applications = existing.applications,
          available_sizes = existing.available_sizes,
          material = existing.material,
          finish = existing.finish,
          featured = existing.featured,
          published = existing.published,
          seo_title = existing.seo_title,
          seo_description = existing.seo_description
        } = body;

        let mergedSpecs = safeJson(existing.specs, {});
        if (specs && typeof specs === 'object') {
          mergedSpecs = { ...mergedSpecs, ...specs };
        }
        if (material) mergedSpecs['Material'] = material;
        if (finish) mergedSpecs['Surface Finish'] = finish;
        if (available_sizes) mergedSpecs['Standard Sizes'] = available_sizes;
        if (applications) mergedSpecs['Application'] = applications;

        let mergedFeatures = features !== undefined
          ? (Array.isArray(features) ? features : (typeof features === 'string' ? features.split('\n').filter(Boolean) : []))
          : safeJson(existing.features, []);

        const slug = (code || '').trim().replace(/\s+/g, '-');

        db.prepare(`UPDATE products SET code=?, name=?, collection_id=?, short_description=?, description=?, image=?, specs=?, features=?, applications=?, available_sizes=?, material=?, finish=?, featured=?, published=?, seo_title=?, seo_description=?, slug=?, updated_at=datetime('now') WHERE id=?`)
          .run(code.trim(), name || `Door ${code.trim()}`, collection_id ? parseInt(collection_id) : null, short_description || '', description || '', image || '', JSON.stringify(mergedSpecs), JSON.stringify(mergedFeatures), applications || '', available_sizes || '', material || '', finish || '', featured ? 1 : 0, published !== undefined ? (published ? 1 : 0) : 1, seo_title || '', seo_description || '', slug, id);

        logAudit('PRODUCT_UPDATED', 'product', id, `Updated product ${code}`, session.user_id);
        syncDbToJson();
        return json(res, 200, { success: true });
      }

      if (path.match(/^\/api\/admin\/products\/(\d+)$/) && method === 'DELETE') {
        const session = requireAuth();
        if (!session) return;
        const id = path.split('/').pop();
        db.prepare('DELETE FROM products WHERE id = ?').run(id);
        logAudit('PRODUCT_DELETED', 'product', id, '', session.user_id);
        syncDbToJson();
        return json(res, 200, { success: true });
      }

      // --- Admin Collections ---
      if (path === '/api/admin/collections' && method === 'GET') {
        if (!requireAuth()) return;
        return json(res, 200, getAllCollections(false));
      }

      if (path === '/api/admin/collections' && method === 'POST') {
        const session = requireAuth();
        if (!session) return;
        const { slug, name, category, description, tagline, hero_image, material, finish, thickness, application, featured, published, display_order } = body;
        if (!slug || !name) return json(res, 400, { error: 'Slug and name required' });

        db.prepare(`INSERT INTO collections (slug, name, category, description, tagline, hero_image, material, finish, thickness, application, featured, published, display_order)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(slug.trim(), name.trim(), category || '', description || '', tagline || '', hero_image || '', material || '', finish || '', thickness || '', application || '', featured ? 1 : 0, published !== undefined ? (published ? 1 : 0) : 1, display_order || 0);

        logAudit('COLLECTION_CREATED', 'collection', slug, `Created collection ${name}`, session.user_id);
        syncDbToJson();
        return json(res, 201, { success: true });
      }

      if (path.match(/^\/api\/admin\/collections\/(\d+)$/) && method === 'PUT') {
        const session = requireAuth();
        if (!session) return;
        const id = path.split('/').pop();
        const existing = db.prepare('SELECT * FROM collections WHERE id = ?').get(id);
        if (!existing) return json(res, 404, { error: 'Collection not found' });

        const {
          slug = existing.slug,
          name = existing.name,
          category = existing.category,
          description = existing.description,
          tagline = existing.tagline,
          hero_image = existing.hero_image,
          material = existing.material,
          finish = existing.finish,
          thickness = existing.thickness,
          application = existing.application,
          featured = existing.featured,
          published = existing.published,
          display_order = existing.display_order
        } = body;

        db.prepare(`UPDATE collections SET slug=?, name=?, category=?, description=?, tagline=?, hero_image=?, material=?, finish=?, thickness=?, application=?, featured=?, published=?, display_order=?, updated_at=datetime('now') WHERE id=?`)
          .run(slug.trim(), name.trim(), category || '', description || '', tagline || '', hero_image || '', material || '', finish || '', thickness || '', application || '', featured ? 1 : 0, published !== undefined ? (published ? 1 : 0) : 1, display_order || 0, id);

        logAudit('COLLECTION_UPDATED', 'collection', id, `Updated collection ${name}`, session.user_id);
        syncDbToJson();
        return json(res, 200, { success: true });
      }

      if (path.match(/^\/api\/admin\/collections\/(\d+)$/) && method === 'DELETE') {
        const session = requireAuth();
        if (!session) return;
        const id = path.split('/').pop();
        db.prepare('DELETE FROM collections WHERE id = ?').run(id);
        logAudit('COLLECTION_DELETED', 'collection', id, '', session.user_id);
        syncDbToJson();
        return json(res, 200, { success: true });
      }

      // --- Admin Enquiries ---
      if (path === '/api/admin/enquiries' && method === 'GET') {
        if (!requireAuth()) return;
        const status = url.searchParams.get('status');
        return json(res, 200, getEnquiries(status));
      }

      if (path.match(/^\/api\/admin\/enquiries\/(\d+)$/) && method === 'PUT') {
        const session = requireAuth();
        if (!session) return;
        const id = path.split('/').pop();
        const { status, internal_notes } = body;

        if (status) db.prepare("UPDATE enquiries SET status=?, updated_at=datetime('now') WHERE id=?").run(status, id);
        if (internal_notes !== undefined) db.prepare("UPDATE enquiries SET internal_notes=?, updated_at=datetime('now') WHERE id=?").run(internal_notes, id);

        logAudit('ENQUIRY_UPDATED', 'enquiry', id, `Status: ${status}`, session.user_id);
        return json(res, 200, { success: true });
      }

      if (path.match(/^\/api\/admin\/enquiries\/(\d+)$/) && method === 'DELETE') {
        const session = requireAuth();
        if (!session) return;
        const id = path.split('/').pop();
        db.prepare('DELETE FROM enquiries WHERE id = ?').run(id);
        return json(res, 200, { success: true });
      }

      // --- Admin Branches ---
      if (path === '/api/admin/branches' && method === 'GET') {
        if (!requireAuth()) return;
        const branches = getBranches(false);
        return json(res, 200, branches.map(b => ({ ...b, highlights: safeJson(b.highlights, []) })));
      }

      if (path.match(/^\/api\/admin\/branches\/(\d+)$/) && method === 'PUT') {
        const session = requireAuth();
        if (!session) return;
        const id = path.split('/').pop();
        const existing = db.prepare('SELECT * FROM branches WHERE id = ?').get(id);
        if (!existing) return json(res, 404, { error: 'Branch not found' });

        const {
          name = existing.name,
          category = existing.category,
          badge = existing.badge,
          description = existing.description,
          phone = existing.phone,
          phone_alt = existing.phone_alt,
          address = existing.address,
          timings = existing.timings,
          map_url = existing.map_url,
          image = existing.image,
          highlights,
          published = existing.published,
          display_order = existing.display_order
        } = body;

        const highlightsArr = highlights !== undefined
          ? (Array.isArray(highlights) ? highlights : (typeof highlights === 'string' ? highlights.split('\n').filter(Boolean) : []))
          : safeJson(existing.highlights, []);

        db.prepare(`UPDATE branches SET name=?, category=?, badge=?, description=?, phone=?, phone_alt=?, address=?, timings=?, map_url=?, image=?, highlights=?, published=?, display_order=?, updated_at=datetime('now') WHERE id=?`)
          .run(name, category || '', badge || '', description || '', phone || '', phone_alt || '', address || '', timings || '', map_url || '', image || '', JSON.stringify(highlightsArr), published !== undefined ? (published ? 1 : 0) : 1, display_order || 0, id);

        logAudit('BRANCH_UPDATED', 'branch', id, `Updated ${name}`, session.user_id);
        syncDbToJson();
        return json(res, 200, { success: true });
      }

      if (path === '/api/admin/branches' && method === 'POST') {
        const session = requireAuth();
        if (!session) return;
        const { name, category, badge, description, phone, phone_alt, address, timings, map_url, image, highlights, published, display_order } = body;
        if (!name) return json(res, 400, { error: 'Branch name is required' });

        const highlightsArr = Array.isArray(highlights) ? highlights : (typeof highlights === 'string' ? highlights.split('\n').filter(Boolean) : []);

        const result = db.prepare(`INSERT INTO branches (name, category, badge, description, phone, phone_alt, address, timings, map_url, image, highlights, published, display_order)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(name, category || 'Showroom', badge || '', description || '', phone || '', phone_alt || '', address || '', timings || '', map_url || '', image || '', JSON.stringify(highlightsArr), published !== undefined ? (published ? 1 : 0) : 1, display_order || 0);

        logAudit('BRANCH_CREATED', 'branch', String(result.lastInsertRowid), `Created branch ${name}`, session.user_id);
        syncDbToJson();
        return json(res, 201, { success: true, id: result.lastInsertRowid });
      }

      if (path.match(/^\/api\/admin\/branches\/(\d+)$/) && method === 'DELETE') {
        const session = requireAuth();
        if (!session) return;
        const id = path.split('/').pop();
        db.prepare('DELETE FROM branches WHERE id = ?').run(id);
        logAudit('BRANCH_DELETED', 'branch', id, '', session.user_id);
        syncDbToJson();
        return json(res, 200, { success: true });
      }

      // --- Admin Testimonials ---
      if (path === '/api/admin/testimonials' && method === 'GET') {
        if (!requireAuth()) return;
        return json(res, 200, getTestimonials(false));
      }

      if (path === '/api/admin/testimonials' && method === 'POST') {
        const session = requireAuth();
        if (!session) return;
        const { name, role, company, location, quote, rating, project, photo, video_url, published } = body;
        if (!name || !quote) return json(res, 400, { error: 'Name and quote required' });

        db.prepare(`INSERT INTO testimonials (name, role, company, location, quote, rating, project, photo, video_url, published)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(name, role || '', company || '', location || '', quote, rating || 5, project || '', photo || '', video_url || '', published ? 1 : 0);

        logAudit('TESTIMONIAL_CREATED', 'testimonial', '', `From ${name}`, session.user_id);
        syncDbToJson();
        return json(res, 201, { success: true });
      }

      if (path.match(/^\/api\/admin\/testimonials\/(\d+)$/) && method === 'PUT') {
        const session = requireAuth();
        if (!session) return;
        const id = path.split('/').pop();
        const existing = db.prepare('SELECT * FROM testimonials WHERE id = ?').get(id);
        if (!existing) return json(res, 404, { error: 'Testimonial not found' });

        const {
          name = existing.name,
          role = existing.role,
          company = existing.company,
          location = existing.location,
          quote = existing.quote,
          rating = existing.rating,
          project = existing.project,
          photo = existing.photo,
          video_url = existing.video_url,
          published = existing.published,
          display_order = existing.display_order
        } = body;

        db.prepare(`UPDATE testimonials SET name=?, role=?, company=?, location=?, quote=?, rating=?, project=?, photo=?, video_url=?, published=?, display_order=?, updated_at=datetime('now') WHERE id=?`)
          .run(name, role || '', company || '', location || '', quote, rating || 5, project || '', photo || '', video_url || '', published !== undefined ? (published ? 1 : 0) : 1, display_order || 0, id);

        logAudit('TESTIMONIAL_UPDATED', 'testimonial', id, '', session.user_id);
        syncDbToJson();
        return json(res, 200, { success: true });
      }

      if (path.match(/^\/api\/admin\/testimonials\/(\d+)$/) && method === 'DELETE') {
        const session = requireAuth();
        if (!session) return;
        const id = path.split('/').pop();
        db.prepare('DELETE FROM testimonials WHERE id = ?').run(id);
        syncDbToJson();
        return json(res, 200, { success: true });
      }

      // --- Admin Catalogue ---
      if (path === '/api/admin/catalogue' && method === 'GET') {
        if (!requireAuth()) return;
        return json(res, 200, db.prepare('SELECT * FROM catalogue ORDER BY id DESC').all());
      }

      if (path === '/api/admin/catalogue' && method === 'PUT') {
        const session = requireAuth();
        if (!session) return;
        const { title, version, file_url } = body;
        db.prepare('UPDATE catalogue SET active = 0').run();
        db.prepare(`INSERT INTO catalogue (title, version, file_url, active) VALUES (?, ?, ?, 1)`)
          .run(title || 'New Ikon Doors Catalogue', version || '', file_url || '/catalogue/NEW_IKON_DOORS.pdf');
        logAudit('CATALOGUE_UPDATED', 'catalogue', '', `Version: ${version}`, session.user_id);
        syncDbToJson();
        return json(res, 200, { success: true });
      }

      // --- Admin Homepage Content ---
      if (path === '/api/admin/homepage' && method === 'GET') {
        if (!requireAuth()) return;
        return json(res, 200, getHomepageContent());
      }

      if (path === '/api/admin/homepage' && method === 'PUT') {
        const session = requireAuth();
        if (!session) return;
        for (const [key, value] of Object.entries(body)) {
          db.prepare(`INSERT OR REPLACE INTO homepage_content (section_key, content, updated_at) VALUES (?, ?, datetime('now'))`)
            .run(key, JSON.stringify(value));
        }
        logAudit('HOMEPAGE_UPDATED', 'homepage', '', '', session.user_id);
        syncDbToJson();
        return json(res, 200, { success: true });
      }

      // --- Admin Settings ---
      if (path === '/api/admin/settings' && method === 'GET') {
        if (!requireAuth()) return;
        return json(res, 200, getSiteSettings());
      }

      if (path === '/api/admin/settings' && method === 'PUT') {
        const session = requireAuth();
        if (!session) return;
        for (const [key, value] of Object.entries(body)) {
          db.prepare(`INSERT OR REPLACE INTO site_settings (setting_key, setting_value, updated_at) VALUES (?, ?, datetime('now'))`)
            .run(key, String(value));
        }
        logAudit('SETTINGS_UPDATED', 'settings', '', '', session.user_id);
        syncDbToJson();
        return json(res, 200, { success: true });
      }

      // --- Admin Password Change ---
      if (path === '/api/admin/change-password' && method === 'POST') {
        const session = requireAuth();
        if (!session) return;
        const { current_password, new_password } = body;
        if (!current_password || !new_password) return json(res, 400, { error: 'Both passwords required' });

        const user = db.prepare('SELECT * FROM admin_users WHERE id = ?').get(session.user_id);
        if (!verifyPassword(current_password, user.password_hash)) {
          return json(res, 400, { error: 'Current password incorrect' });
        }

        const newHash = hashPassword(new_password);
        db.prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?').run(newHash, session.user_id);
        logAudit('PASSWORD_CHANGED', 'admin_user', String(session.user_id), '', session.user_id);
        return json(res, 200, { success: true });
      }

      // --- Admin Image Upload ---
      if (path === '/api/admin/upload' && method === 'POST') {
        const session = requireAuth();
        if (!session) return;
        const { filename, base64 } = body;
        if (!base64) return json(res, 400, { error: 'No image data provided' });

        const uploadsDir = path.resolve(process.cwd(), 'public/uploads');
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

        const ext = (filename && filename.includes('.')) ? filename.split('.').pop().toLowerCase() : 'jpg';
        const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'svg'].includes(ext) ? ext : 'jpg';
        const cleanBase = (filename ? filename.replace(/\.[^.]+$/, '') : 'door').replace(/[^a-zA-Z0-9_-]/g, '_');
        const cleanName = `${Date.now()}-${cleanBase}.${safeExt}`;
        const filePath = path.join(uploadsDir, cleanName);

        const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
        fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

        logAudit('IMAGE_UPLOADED', 'asset', cleanName, `Uploaded ${cleanName}`, session.user_id);
        return json(res, 200, { success: true, url: `/uploads/${cleanName}` });
      }

      // --- 404 ---
      return json(res, 404, { error: 'API endpoint not found' });

    } catch (err) {
      console.error('[API Error]', err);
      return json(res, 500, { error: 'Internal server error' });
    }
  };
}

// --- Helpers ---
function json(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

async function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); }
      catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}
