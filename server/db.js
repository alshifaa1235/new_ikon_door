import { DatabaseSync } from 'node:sqlite';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash, randomBytes } from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_DIR = join(__dirname, '..', 'data');
const DB_PATH = join(DATA_DIR, 'new_ikon_doors.db');

// Ensure data directory exists
if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

// --- Password hashing (SHA-256 + salt for simplicity, no native addon needed) ---
export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = createHash('sha256').update(salt + password).digest('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  const check = createHash('sha256').update(salt + password).digest('hex');
  return check === hash;
}

// --- Database Initialization ---
let db;

export function getDb() {
  if (db) return db;
  db = new DatabaseSync(DB_PATH);
  db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA foreign_keys = ON');
  createTables();
  seedIfEmpty();
  return db;
}

// Ensure database is initialized upon import
getDb();

function createTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      display_name TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS collections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      category TEXT DEFAULT '',
      description TEXT DEFAULT '',
      tagline TEXT DEFAULT '',
      material TEXT DEFAULT '',
      finish TEXT DEFAULT '',
      thickness TEXT DEFAULT '',
      application TEXT DEFAULT '',
      hero_image TEXT DEFAULT '',
      thumbnail TEXT DEFAULT '',
      featured INTEGER DEFAULT 0,
      published INTEGER DEFAULT 1,
      display_order INTEGER DEFAULT 0,
      seo_title TEXT DEFAULT '',
      seo_description TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT DEFAULT '',
      collection_id INTEGER,
      short_description TEXT DEFAULT '',
      description TEXT DEFAULT '',
      image TEXT DEFAULT '',
      lifestyle_image TEXT DEFAULT '',
      lifestyle_title TEXT DEFAULT '',
      specs TEXT DEFAULT '{}',
      features TEXT DEFAULT '[]',
      applications TEXT DEFAULT '',
      available_sizes TEXT DEFAULT '',
      material TEXT DEFAULT '',
      finish TEXT DEFAULT '',
      featured INTEGER DEFAULT 0,
      published INTEGER DEFAULT 1,
      seo_title TEXT DEFAULT '',
      seo_description TEXT DEFAULT '',
      slug TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS product_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      image_url TEXT NOT NULL,
      is_primary INTEGER DEFAULT 0,
      alt_text TEXT DEFAULT '',
      display_order INTEGER DEFAULT 0,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS branches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      branch_id TEXT UNIQUE,
      name TEXT NOT NULL,
      category TEXT DEFAULT '',
      badge TEXT DEFAULT '',
      description TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      phone_alt TEXT DEFAULT '',
      whatsapp TEXT DEFAULT '',
      email TEXT DEFAULT '',
      address TEXT DEFAULT '',
      timings TEXT DEFAULT '',
      map_url TEXT DEFAULT '',
      latitude REAL DEFAULT 0,
      longitude REAL DEFAULT 0,
      image TEXT DEFAULT '',
      highlights TEXT DEFAULT '[]',
      published INTEGER DEFAULT 1,
      display_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS testimonials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT DEFAULT '',
      company TEXT DEFAULT '',
      location TEXT DEFAULT '',
      quote TEXT NOT NULL,
      rating INTEGER DEFAULT 5,
      project TEXT DEFAULT '',
      photo TEXT DEFAULT '',
      video_url TEXT DEFAULT '',
      company_logo TEXT DEFAULT '',
      published INTEGER DEFAULT 1,
      display_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS enquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      company TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      whatsapp TEXT DEFAULT '',
      email TEXT DEFAULT '',
      location TEXT DEFAULT '',
      customer_type TEXT DEFAULT '',
      requirement TEXT DEFAULT '',
      collection TEXT DEFAULT '',
      product_code TEXT DEFAULT '',
      quantity TEXT DEFAULT '',
      message TEXT DEFAULT '',
      status TEXT DEFAULT 'NEW',
      internal_notes TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS catalogue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT DEFAULT 'New Ikon Doors Catalogue',
      version TEXT DEFAULT '1.0',
      file_url TEXT DEFAULT '',
      file_size TEXT DEFAULT '',
      active INTEGER DEFAULT 1,
      published_at TEXT DEFAULT (datetime('now')),
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS homepage_content (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      section_key TEXT UNIQUE NOT NULL,
      content TEXT DEFAULT '{}',
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      setting_key TEXT UNIQUE NOT NULL,
      setting_value TEXT DEFAULT '',
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      expires_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      entity_type TEXT DEFAULT '',
      entity_id TEXT DEFAULT '',
      details TEXT DEFAULT '',
      user_id INTEGER,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_products_collection ON products(collection_id);
    CREATE INDEX IF NOT EXISTS idx_products_code ON products(code);
    CREATE INDEX IF NOT EXISTS idx_products_published ON products(published);
    CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
    CREATE INDEX IF NOT EXISTS idx_collections_slug ON collections(slug);
    CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);
    CREATE INDEX IF NOT EXISTS idx_enquiries_created ON enquiries(created_at);
    CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
  `);
}

function seedIfEmpty() {
  const count = db.prepare('SELECT COUNT(*) as c FROM collections').get();
  if (count.c > 0) return; // Already seeded

  console.log('[DB] Seeding database from verified JSON files...');

  // --- Seed collections & products from products.json ---
  const productsJsonPath = join(__dirname, '..', 'src', 'data', 'products.json');
  if (existsSync(productsJsonPath)) {
    const data = JSON.parse(readFileSync(productsJsonPath, 'utf-8'));

    const insertCollection = db.prepare(`
      INSERT INTO collections (slug, name, category, description, tagline, material, finish, thickness, application, hero_image, display_order, published)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);

    const insertProduct = db.prepare(`
      INSERT INTO products (code, name, collection_id, image, lifestyle_image, lifestyle_title, specs, material, finish, available_sizes, slug, featured, published)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);

    const insertProductImage = db.prepare(`
      INSERT INTO product_images (product_id, image_url, is_primary, display_order)
      VALUES (?, ?, ?, ?)
    `);

    data.collections.forEach((col, idx) => {
      insertCollection.run(
        col.slug,
        col.name || col.slug,
        col.category || '',
        col.description || '',
        col.tagline || '',
        col.material || '',
        col.finish || '',
        col.thickness || '',
        col.application || '',
        col.hero_image ? `/doors/${col.hero_image}` : '',
        idx
      );

      const colRow = db.prepare('SELECT id FROM collections WHERE slug = ?').get(col.slug);
      const colId = colRow.id;

      (col.products || []).forEach((prod, pidx) => {
        const codeSlug = prod.code.replace(/\s+/g, '-');
        const imagePath = prod.image ? `/doors/${prod.image}` : '';
        const lifestylePath = prod.lifestyle_image ? `/doors/${prod.lifestyle_image}` : '';
        const specsJson = JSON.stringify(prod.specs || {});
        const sizes = prod.specs?.['Standard Sizes'] || '';
        const material = prod.specs?.['Material'] || '';
        const finish = prod.specs?.['Surface Finish'] || '';

        insertProduct.run(
          prod.code,
          prod.collection || col.name || '',
          colId,
          imagePath,
          lifestylePath,
          prod.lifestyle_title || '',
          specsJson,
          material,
          finish,
          sizes,
          codeSlug,
          pidx < 2 ? 1 : 0
        );

        // Get auto-increment product id
        const prodRow = db.prepare('SELECT id FROM products WHERE code = ?').get(prod.code);
        if (prodRow && imagePath) {
          insertProductImage.run(prodRow.id, imagePath, 1, 0);
        }
      });
    });
    console.log(`[DB] Seeded ${data.collections.length} collections, ${data.allProducts?.length || 0} products.`);
  }

  // --- Seed branches from company.json ---
  const companyPath = join(__dirname, '..', 'src', 'data', 'company.json');
  if (existsSync(companyPath)) {
    const company = JSON.parse(readFileSync(companyPath, 'utf-8'));

    const insertBranch = db.prepare(`
      INSERT INTO branches (branch_id, name, category, badge, description, phone, phone_alt, address, timings, map_url, highlights, display_order, published)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);

    (company.branches || []).forEach((b, idx) => {
      insertBranch.run(
        b.id, b.name, b.category || '', b.badge || '', b.desc || '',
        b.phone || '', b.phoneAlt || '', b.address || '', b.timings || '',
        b.mapUrl || '', JSON.stringify(b.highlights || []), idx
      );
    });

    // Seed site settings
    const insertSetting = db.prepare(`
      INSERT OR IGNORE INTO site_settings (setting_key, setting_value) VALUES (?, ?)
    `);
    insertSetting.run('company_name', company.name || 'New Ikon Doors');
    insertSetting.run('tagline', company.tagline || '');
    insertSetting.run('phone', company.phone || '');
    insertSetting.run('phone_alt', company.phoneAlt || '');
    insertSetting.run('whatsapp', company.whatsapp || '');
    insertSetting.run('email', company.email || '');
    insertSetting.run('address', company.address || '');
    insertSetting.run('specialization', company.specialization || '');
    insertSetting.run('machinery', company.machinery || '');
    console.log(`[DB] Seeded ${company.branches?.length || 0} branches and site settings.`);
  }

  // --- Seed testimonials ---
  const testimonialsPath = join(__dirname, '..', 'src', 'data', 'testimonials.json');
  if (existsSync(testimonialsPath)) {
    const testimonials = JSON.parse(readFileSync(testimonialsPath, 'utf-8'));
    const insertTestimonial = db.prepare(`
      INSERT INTO testimonials (name, role, quote, rating, project, display_order, published)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `);
    testimonials.forEach((t, idx) => {
      insertTestimonial.run(t.name, t.role || '', t.quote, t.rating || 5, t.project || '', idx);
    });
    console.log(`[DB] Seeded ${testimonials.length} testimonials.`);
  }

  // --- Seed catalogue ---
  const insertCatalogue = db.prepare(`
    INSERT INTO catalogue (title, version, file_url, active) VALUES (?, ?, ?, 1)
  `);
  insertCatalogue.run('New Ikon Doors Catalogue', '2024', '/catalogue/NEW_IKON_DOORS.pdf');

  // --- Create default admin user ---
  const adminHash = hashPassword('newikon2024');
  db.prepare(`
    INSERT OR IGNORE INTO admin_users (username, password_hash, display_name)
    VALUES ('admin', ?, 'Administrator')
  `).run(adminHash);
  console.log('[DB] Default admin user created (admin / newikon2024).');

  // --- Seed homepage content defaults ---
  const insertHomepage = db.prepare(`
    INSERT OR IGNORE INTO homepage_content (section_key, content) VALUES (?, ?)
  `);
  insertHomepage.run('hero', JSON.stringify({
    title: 'Doors that define the space.',
    subtitle: 'Engineered with computerized CNC precision, kiln-seasoned hardwood cores, and vacuum-bonded membrane technology.',
    badge: 'New Ikon Doors • Trichy',
    cta_primary: 'Explore Collections',
    cta_secondary: 'Request a Quote'
  }));
  insertHomepage.run('intro', JSON.stringify({
    statement: 'Premium doors designed to become part of the architecture.',
    description: 'New Ikon Doors combines advanced CNC routing technology with traditional timber craftsmanship to create doors that elevate every space they enter.',
    cta: 'Discover New Ikon'
  }));
  insertHomepage.run('trust_stats', JSON.stringify([
    { value: '130+', label: 'Catalogue Elevations' },
    { value: '3', label: 'Trichy Group Divisions' },
    { value: '10', label: 'Door Collections' }
  ]));

  console.log('[DB] Database seeding complete.');
}

// --- Query Helpers ---
export function getAllCollections(publishedOnly = true) {
  const sql = publishedOnly
    ? 'SELECT * FROM collections WHERE published = 1 ORDER BY display_order, name'
    : 'SELECT * FROM collections ORDER BY display_order, name';
  return db.prepare(sql).all();
}

export function getCollectionBySlug(slug) {
  return db.prepare('SELECT * FROM collections WHERE slug = ?').get(slug);
}

export function getProductsByCollection(collectionId, publishedOnly = true) {
  const sql = publishedOnly
    ? 'SELECT * FROM products WHERE collection_id = ? AND published = 1 ORDER BY code'
    : 'SELECT * FROM products WHERE collection_id = ? ORDER BY code';
  return db.prepare(sql).all(collectionId);
}

export function getProductByCode(code) {
  return db.prepare('SELECT p.*, c.slug as collection_slug, c.name as collection_name FROM products p LEFT JOIN collections c ON p.collection_id = c.id WHERE p.code = ?').get(code);
}

export function getProductByIdentifier(identifier) {
  if (!identifier) return null;
  const decoded = decodeURIComponent(identifier).trim();

  // 1. Direct code match (exact)
  let prod = db.prepare('SELECT p.*, c.slug as collection_slug, c.name as collection_name FROM products p LEFT JOIN collections c ON p.collection_id = c.id WHERE p.code = ?').get(decoded);
  if (prod) return prod;

  // 2. Direct slug match (exact)
  prod = db.prepare('SELECT p.*, c.slug as collection_slug, c.name as collection_name FROM products p LEFT JOIN collections c ON p.collection_id = c.id WHERE p.slug = ?').get(decoded);
  if (prod) return prod;

  // 3. Variations of spaces and dashes
  const normalizedSpaces = decoded.replace(/-+/g, ' ').trim();
  const normalizedDashes = decoded.replace(/\s+/g, '-').trim();
  const spacedDash = decoded.replace(/-+/g, ' - ').replace(/\s+/g, ' ').trim();

  for (const alt of [normalizedSpaces, normalizedDashes, spacedDash]) {
    prod = db.prepare('SELECT p.*, c.slug as collection_slug, c.name as collection_name FROM products p LEFT JOIN collections c ON p.collection_id = c.id WHERE p.code = ? OR p.slug = ?').get(alt, alt);
    if (prod) return prod;
  }

  // 4. Normalized alphanumeric match
  const alphaNum = decoded.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (alphaNum) {
    const all = db.prepare('SELECT p.*, c.slug as collection_slug, c.name as collection_name FROM products p LEFT JOIN collections c ON p.collection_id = c.id').all();
    const found = all.find(p => {
      const pNorm = (p.code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
      const sNorm = (p.slug || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
      return pNorm === alphaNum || sNorm === alphaNum;
    });
    if (found) return found;
  }

  return null;
}

export function getFeaturedProducts(limit = 8) {
  return db.prepare('SELECT p.*, c.slug as collection_slug, c.name as collection_name FROM products p LEFT JOIN collections c ON p.collection_id = c.id WHERE p.featured = 1 AND p.published = 1 ORDER BY p.code LIMIT ?').all(limit);
}

export function getAllProducts(publishedOnly = true) {
  const sql = publishedOnly
    ? 'SELECT p.*, c.slug as collection_slug, c.name as collection_name FROM products p LEFT JOIN collections c ON p.collection_id = c.id WHERE p.published = 1 ORDER BY p.code'
    : 'SELECT p.*, c.slug as collection_slug, c.name as collection_name FROM products p LEFT JOIN collections c ON p.collection_id = c.id ORDER BY p.code';
  return db.prepare(sql).all();
}

export function searchProducts(query) {
  const like = `%${query}%`;
  return db.prepare(`
    SELECT p.*, c.slug as collection_slug, c.name as collection_name
    FROM products p LEFT JOIN collections c ON p.collection_id = c.id
    WHERE (p.code LIKE ? OR p.name LIKE ? OR c.name LIKE ?) AND p.published = 1
    ORDER BY p.code
  `).all(like, like, like);
}

export function getBranches(publishedOnly = true) {
  const sql = publishedOnly
    ? 'SELECT * FROM branches WHERE published = 1 ORDER BY display_order'
    : 'SELECT * FROM branches ORDER BY display_order';
  return db.prepare(sql).all();
}

export function getTestimonials(publishedOnly = true) {
  const sql = publishedOnly
    ? 'SELECT * FROM testimonials WHERE published = 1 ORDER BY display_order'
    : 'SELECT * FROM testimonials ORDER BY display_order';
  return db.prepare(sql).all();
}

export function getActiveCatalogue() {
  return db.prepare('SELECT * FROM catalogue WHERE active = 1 ORDER BY id DESC LIMIT 1').get();
}

export function getHomepageContent() {
  const rows = db.prepare('SELECT section_key, content FROM homepage_content').all();
  const result = {};
  rows.forEach(r => { result[r.section_key] = JSON.parse(r.content); });
  return result;
}

export function getSiteSettings() {
  const rows = db.prepare('SELECT setting_key, setting_value FROM site_settings').all();
  const result = {};
  rows.forEach(r => { result[r.setting_key] = r.setting_value; });
  return result;
}

export function getEnquiries(status = null) {
  if (status && status !== 'ALL') {
    return db.prepare('SELECT * FROM enquiries WHERE status = ? ORDER BY created_at DESC').all(status);
  }
  return db.prepare('SELECT * FROM enquiries ORDER BY created_at DESC').all();
}

export function getDashboardStats() {
  const totalProducts = db.prepare('SELECT COUNT(*) as c FROM products').get().c;
  const totalCollections = db.prepare('SELECT COUNT(*) as c FROM collections').get().c;
  const totalEnquiries = db.prepare('SELECT COUNT(*) as c FROM enquiries').get().c;
  const totalBranches = db.prepare('SELECT COUNT(*) as c FROM branches').get().c;
  const totalTestimonials = db.prepare('SELECT COUNT(*) as c FROM testimonials').get().c;
  const newEnquiries = db.prepare("SELECT COUNT(*) as c FROM enquiries WHERE status = 'NEW'").get().c;
  const publishedProducts = db.prepare('SELECT COUNT(*) as c FROM products WHERE published = 1').get().c;
  const featuredProducts = db.prepare('SELECT COUNT(*) as c FROM products WHERE featured = 1').get().c;
  const recentEnquiries = db.prepare('SELECT * FROM enquiries ORDER BY created_at DESC LIMIT 10').all();

  return {
    totalProducts, products_count: totalProducts,
    totalCollections, collections_count: totalCollections,
    totalEnquiries, enquiries_count: totalEnquiries,
    totalBranches,
    totalTestimonials,
    newEnquiries, new_enquiries: newEnquiries,
    publishedProducts,
    featuredProducts,
    recentEnquiries, recent_enquiries: recentEnquiries
  };
}

export function syncDbToJson() {
  try {
    const collections = db.prepare('SELECT * FROM collections ORDER BY display_order, name').all();
    const allProducts = [];

    const collectionsWithProducts = collections.map(col => {
      const prods = db.prepare('SELECT p.*, c.slug as collection_slug, c.name as collection_name FROM products p LEFT JOIN collections c ON p.collection_id = c.id WHERE p.collection_id = ? ORDER BY p.code').all(col.id);

      const parsedProds = prods.map(p => {
        let specs = {};
        try { specs = typeof p.specs === 'string' ? JSON.parse(p.specs || '{}') : (p.specs || {}); } catch (e) { specs = {}; }
        let features = [];
        try { features = typeof p.features === 'string' ? JSON.parse(p.features || '[]') : (p.features || []); } catch (e) { features = []; }

        const item = {
          id: p.code ? p.code.replace(/[^A-Z0-9]/gi, '_') : String(p.id),
          collection: col.name,
          collection_id: col.id,
          collection_slug: col.slug,
          code: p.code,
          name: p.name || `Door ${p.code}`,
          image: p.image ? p.image.replace(/^\/doors\//, '') : '',
          lifestyle_image: p.lifestyle_image ? p.lifestyle_image.replace(/^\/doors\//, '') : '',
          lifestyle_title: p.lifestyle_title || '',
          short_description: p.short_description || '',
          description: p.description || '',
          material: p.material || specs['Material'] || '',
          finish: p.finish || specs['Surface Finish'] || '',
          available_sizes: p.available_sizes || specs['Standard Sizes'] || '',
          applications: p.applications || specs['Application'] || '',
          specs,
          features,
          featured: p.featured === 1,
          published: p.published === 1
        };
        allProducts.push(item);
        return item;
      });

      return {
        slug: col.slug,
        name: col.name,
        category: col.category,
        description: col.description,
        tagline: col.tagline,
        material: col.material,
        finish: col.finish,
        thickness: col.thickness,
        application: col.application,
        hero_image: col.hero_image ? col.hero_image.replace(/^\/doors\//, '') : '',
        featured: col.featured === 1,
        published: col.published === 1,
        display_order: col.display_order,
        products: parsedProds
      };
    });

    const productsJsonPath = join(__dirname, '..', 'src', 'data', 'products.json');
    writeFileSync(productsJsonPath, JSON.stringify({
      collections: collectionsWithProducts,
      allProducts
    }, null, 2), 'utf-8');

    // Sync company.json
    const settings = getSiteSettings();
    const branches = db.prepare('SELECT * FROM branches ORDER BY display_order').all().map(b => {
      let highlights = [];
      try { highlights = typeof b.highlights === 'string' ? JSON.parse(b.highlights || '[]') : (b.highlights || []); } catch(e) {}
      return {
        id: b.branch_id || String(b.id),
        name: b.name,
        category: b.category,
        badge: b.badge,
        desc: b.description,
        description: b.description,
        phone: b.phone,
        phoneAlt: b.phone_alt,
        address: b.address,
        timings: b.timings,
        mapUrl: b.map_url,
        image: b.image,
        highlights,
        published: b.published === 1,
        display_order: b.display_order
      };
    });

    const companyJson = {
      name: settings.company_name || 'New Ikon Doors',
      tagline: settings.tagline || 'Elevate Your Space • Upgrade Your Entrance',
      phone: settings.phone || '+91 98424 45353',
      phoneAlt: settings.phone_alt || '+91 98424 43353',
      whatsapp: settings.whatsapp || '9842445353',
      email: settings.email || 'abbas43353@gmail.com',
      address: settings.address || '',
      specialization: settings.specialization || '',
      machinery: settings.machinery || '',
      branches
    };
    const companyJsonPath = join(__dirname, '..', 'src', 'data', 'company.json');
    writeFileSync(companyJsonPath, JSON.stringify(companyJson, null, 2), 'utf-8');

    // Sync testimonials.json
    const testimonials = db.prepare('SELECT * FROM testimonials ORDER BY display_order').all().map(t => ({
      id: t.id,
      name: t.name,
      role: t.role,
      company: t.company,
      location: t.location,
      quote: t.quote,
      rating: t.rating,
      project: t.project,
      photo: t.photo,
      video_url: t.video_url,
      published: t.published === 1,
      display_order: t.display_order
    }));
    const testimonialsJsonPath = join(__dirname, '..', 'src', 'data', 'testimonials.json');
    writeFileSync(testimonialsJsonPath, JSON.stringify(testimonials, null, 2), 'utf-8');

    console.log('[DB Sync] Synchronized database changes to JSON data files.');
  } catch (err) {
    console.error('[DB Sync Error]', err);
  }
}

// --- Session Management ---
export function createSession(userId) {
  const id = randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  db.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)').run(id, userId, expires);
  return { id, expires };
}

export function validateSession(sessionId) {
  if (!sessionId) return null;
  const session = db.prepare("SELECT s.*, u.username, u.display_name FROM sessions s JOIN admin_users u ON s.user_id = u.id WHERE s.id = ? AND s.expires_at > datetime('now')").get(sessionId);
  return session || null;
}

export function deleteSession(sessionId) {
  db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
}

// --- Audit Logging ---
export function logAudit(action, entityType, entityId, details, userId) {
  db.prepare('INSERT INTO audit_log (action, entity_type, entity_id, details, user_id) VALUES (?, ?, ?, ?, ?)').run(action, entityType, entityId || '', details || '', userId || null);
}
