import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const productsData = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/products.json'), 'utf8'));
const companyData = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/company.json'), 'utf8'));
const testimonialsData = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/testimonials.json'), 'utf8'));

function escapeSql(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  if (typeof val === 'number') return String(val);
  if (typeof val === 'object') {
    return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
  }
  return `'${String(val).replace(/'/g, "''")}'`;
}

let sql = `-- ==============================================================================
-- NEW IKON DOORS — SEED DATA SCRIPT
-- ==============================================================================
-- Automatically generated seed script populating all verified New Ikon Doors content:
-- - 10 Curated Door Collections
-- - 130+ Catalogue Door Models with full technical specs
-- - 3 Trichy Showroom & Manufacturing Branches
-- - Genuine Architect & Contractor Testimonials
-- - 4 Verified Architectural USPs
-- - Official Digital Catalogue
-- - Verified Corporate Site Settings
-- ==============================================================================

`;

// 1. Collections
sql += `-- 1. Collections\n`;
sql += `INSERT INTO public.collections (id, name, slug, description, category, tagline, cover_image, hero_image, material, finish, thickness, application, published, featured, sort_order, display_order, seo_title, seo_description)\nVALUES\n`;

const colValues = productsData.collections.map((col, idx) => {
  const id = idx + 1;
  const name = col.name || '';
  const slug = col.slug || '';
  const description = col.description || '';
  const category = col.category || '';
  const tagline = col.tagline || '';
  const coverImage = col.hero_image ? `/doors/${col.hero_image}` : '';
  const heroImage = coverImage;
  const material = col.material || '';
  const finish = col.finish || '';
  const thickness = col.thickness || '';
  const application = col.application || '';
  const published = col.published !== false;
  const featured = Boolean(col.featured);
  const sortOrder = col.display_order ?? idx;
  const seoTitle = `${name} | New Ikon Doors Trichy`;
  const seoDesc = description.slice(0, 155);

  return `  (${id}, ${escapeSql(name)}, ${escapeSql(slug)}, ${escapeSql(description)}, ${escapeSql(category)}, ${escapeSql(tagline)}, ${escapeSql(coverImage)}, ${escapeSql(heroImage)}, ${escapeSql(material)}, ${escapeSql(finish)}, ${escapeSql(thickness)}, ${escapeSql(application)}, ${escapeSql(published)}, ${escapeSql(featured)}, ${sortOrder}, ${sortOrder}, ${escapeSql(seoTitle)}, ${escapeSql(seoDesc)})`;
});

sql += colValues.join(',\n') + '\n';
sql += `ON CONFLICT (slug) DO UPDATE SET\n`;
sql += `  name = EXCLUDED.name,\n  description = EXCLUDED.description,\n  cover_image = EXCLUDED.cover_image,\n  hero_image = EXCLUDED.hero_image,\n  material = EXCLUDED.material,\n  finish = EXCLUDED.finish,\n  thickness = EXCLUDED.thickness,\n  application = EXCLUDED.application,\n  published = EXCLUDED.published,\n  sort_order = EXCLUDED.sort_order,\n  updated_at = NOW();\n\n`;

// 2. Products
sql += `-- 2. Products (130+ Elevations)\n`;
sql += `INSERT INTO public.products (name, slug, product_code, code, collection_id, description, short_description, primary_image, image, gallery_images, features, applications, available_sizes, material, finish, specs, lifestyle_image, lifestyle_title, published, featured, sort_order, seo_title, seo_description)\nVALUES\n`;

const prodValues = [];
let prodSort = 0;

productsData.collections.forEach((col, cIdx) => {
  const colId = cIdx + 1;
  (col.products || []).forEach((prod) => {
    prodSort++;
    const code = (prod.code || `NIK-${prodSort}`).trim();
    const cleanSlug = code.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const name = prod.name ? `${prod.name} (${code})` : `Door ${code}`;
    const desc = prod.description || prod.short_description || `${col.name} - Model ${code}`;
    const shortDesc = prod.short_description || '';
    const primaryImg = prod.image ? (prod.image.startsWith('/') ? prod.image : `/doors/${prod.image}`) : '';
    const lifestyleImg = prod.lifestyle_image ? (prod.lifestyle_image.startsWith('/') ? prod.lifestyle_image : `/doors/${prod.lifestyle_image}`) : '';
    const lifestyleTitle = prod.lifestyle_title || '';
    const material = prod.material || col.material || '';
    const finish = prod.finish || col.finish || '';
    const sizes = prod.available_sizes || '81" x 30", 81" x 32", 81" x 36", 84" x 36", 84" x 38"';
    const applications = prod.applications || col.application || '';
    const specs = prod.specs || {};
    const features = Array.isArray(prod.features) ? prod.features : [];
    const published = prod.published !== false;
    const featured = Boolean(prod.featured);
    const seoTitle = `${name} | New Ikon Doors`;
    const seoDesc = `Explore ${name} by New Ikon Doors Trichy. ${material}. ${sizes}. Direct wholesale supply.`;

    prodValues.push(`  (${escapeSql(name)}, ${escapeSql(cleanSlug)}, ${escapeSql(code)}, ${escapeSql(code)}, ${colId}, ${escapeSql(desc)}, ${escapeSql(shortDesc)}, ${escapeSql(primaryImg)}, ${escapeSql(primaryImg)}, '[]'::jsonb, ${escapeSql(features)}, ${escapeSql(applications)}, ${escapeSql(sizes)}, ${escapeSql(material)}, ${escapeSql(finish)}, ${escapeSql(specs)}, ${escapeSql(lifestyleImg)}, ${escapeSql(lifestyleTitle)}, ${escapeSql(published)}, ${escapeSql(featured)}, ${prodSort}, ${escapeSql(seoTitle)}, ${escapeSql(seoDesc)})`);
  });
});

sql += prodValues.join(',\n') + '\n';
sql += `ON CONFLICT (product_code) DO UPDATE SET\n`;
sql += `  name = EXCLUDED.name,\n  slug = EXCLUDED.slug,\n  code = EXCLUDED.code,\n  collection_id = EXCLUDED.collection_id,\n  description = EXCLUDED.description,\n  primary_image = EXCLUDED.primary_image,\n  image = EXCLUDED.image,\n  material = EXCLUDED.material,\n  finish = EXCLUDED.finish,\n  available_sizes = EXCLUDED.available_sizes,\n  specs = EXCLUDED.specs,\n  published = EXCLUDED.published,\n  sort_order = EXCLUDED.sort_order,\n  updated_at = NOW();\n\n`;

// 3. Branches
sql += `-- 3. Branches (Verified Trichy Headquarters & Divisions)\n`;
sql += `INSERT INTO public.branches (name, category, badge, description, address, phone, phone_alt, whatsapp, maps_url, map_url, image_url, image, opening_hours, timings, highlights, published, sort_order, display_order)\nVALUES\n`;

const branchValues = (companyData.branches || []).map((b, idx) => {
  const name = b.name || '';
  const category = b.category || 'Showroom';
  const badge = b.badge || '';
  const desc = b.description || b.desc || '';
  const address = b.address || '';
  const phone = b.phone || '+91 98424 45353';
  const phoneAlt = b.phoneAlt || '';
  const whatsapp = companyData.whatsapp || '9842445353';
  const mapsUrl = b.mapUrl || 'https://www.google.com/maps/dir/?api=1&destination=New+Ikon+Doors+%26+Ply,+Thanjavur+Road,+Trichy';
  const img = b.image || '';
  const hours = b.timings || 'Mon - Sat: 9:00 AM - 8:30 PM';
  const highlights = b.highlights || [];
  const published = b.published !== false;
  const sort = idx;

  return `  (${escapeSql(name)}, ${escapeSql(category)}, ${escapeSql(badge)}, ${escapeSql(desc)}, ${escapeSql(address)}, ${escapeSql(phone)}, ${escapeSql(phoneAlt)}, ${escapeSql(whatsapp)}, ${escapeSql(mapsUrl)}, ${escapeSql(mapsUrl)}, ${escapeSql(img)}, ${escapeSql(img)}, ${escapeSql(hours)}, ${escapeSql(hours)}, ${escapeSql(highlights)}, ${escapeSql(published)}, ${sort}, ${sort})`;
});

sql += branchValues.join(',\n') + ';\n\n';

// 4. Testimonials
sql += `-- 4. Genuine Testimonials\n`;
sql += `INSERT INTO public.testimonials (customer_name, name, company, designation, role, location, content, quote, image_url, photo, rating, project, published, sort_order, display_order)\nVALUES\n`;

const testValues = testimonialsData.map((t, idx) => {
  const name = t.name || '';
  const role = t.role || '';
  const content = t.quote || '';
  const rating = t.rating || 5;
  const project = t.project || '';
  const published = t.published !== false;
  const sort = idx;

  return `  (${escapeSql(name)}, ${escapeSql(name)}, ${escapeSql(t.company || '')}, ${escapeSql(role)}, ${escapeSql(role)}, ${escapeSql(t.location || '')}, ${escapeSql(content)}, ${escapeSql(content)}, ${escapeSql(t.photo || '')}, ${escapeSql(t.photo || '')}, ${rating}, ${escapeSql(project)}, ${escapeSql(published)}, ${sort}, ${sort})`;
});

sql += testValues.join(',\n') + ';\n\n';

// 5. USPs
sql += `-- 5. Verified USPs (Supported by New Ikon Technical Specs)\n`;
sql += `INSERT INTO public.usps (title, description, icon, verified, published, sort_order)\nVALUES\n`;
const usps = [
  {
    title: 'In-House CNC Precision',
    description: 'Computer numerical control routing and vacuum-press membrane bonding for crisp geometric motifs and structural consistency.',
    icon: 'Cpu',
    verified: true,
    published: true,
    sort_order: 1
  },
  {
    title: 'Water & Moisture Resistance',
    description: 'Multi-layer protective polymer coats and WPVC compositions engineered to endure humid regional climates.',
    icon: 'Droplets',
    verified: true,
    published: true,
    sort_order: 2
  },
  {
    title: 'Architectural Customization',
    description: 'Custom door dimensions, distinct wood-grain tones, authentic marble veining, and metallic stainless steel inlays.',
    icon: 'Layers',
    verified: true,
    published: true,
    sort_order: 3
  },
  {
    title: 'Wholesale Group Synergies',
    description: 'Direct coordination with sister divisions Classic Ply & Lam and Royal Lam & Ply for consolidated trade supply.',
    icon: 'ShieldCheck',
    verified: true,
    published: true,
    sort_order: 4
  }
];

sql += usps.map(u => `  (${escapeSql(u.title)}, ${escapeSql(u.description)}, ${escapeSql(u.icon)}, ${escapeSql(u.verified)}, ${escapeSql(u.published)}, ${u.sort_order})`).join(',\n') + ';\n\n';

// 6. Catalogue
sql += `-- 6. Digital Catalogue\n`;
sql += `INSERT INTO public.catalogue (title, pdf_url, file_url, version, file_size, published, active)\nVALUES\n`;
sql += `  ('New Ikon Doors Official Catalogue', '/catalogue/NEW_IKON_DOORS.pdf', '/catalogue/NEW_IKON_DOORS.pdf', '2026.1', '9.0 MB', true, true);\n\n`;

// 7. Site Settings
sql += `-- 7. Verified Corporate Site Settings\n`;
sql += `INSERT INTO public.site_settings (company_name, logo_url, phone, phone_alt, whatsapp, email, address, specialization, machinery, social_links)\nVALUES\n`;
sql += `  (${escapeSql(companyData.name || 'New Ikon Doors')},\n`;
sql += `   '/new_ikon_logo_white.png',\n`;
sql += `   ${escapeSql(companyData.phone || '+91 98424 45353')},\n`;
sql += `   ${escapeSql(companyData.phoneAlt || '+91 98424 43353')},\n`;
sql += `   ${escapeSql(companyData.whatsapp || '9842445353')},\n`;
sql += `   ${escapeSql(companyData.email || 'abbas43353@gmail.com')},\n`;
sql += `   ${escapeSql(companyData.address || 'Plot No. 45 C/A1, Thanjavur Road, Near Mariyamman Kovil Bus Stop, Tharanallur, Trichy - 620008, Tamil Nadu, India')},\n`;
sql += `   ${escapeSql(companyData.specialization || 'Dealers in PVC, Teak, Rubber Wood, Mica, Plywoods')},\n`;
sql += `   ${escapeSql(companyData.machinery || 'High-Precision CNC Automated Routing & Vacuum Membrane Technology')},\n`;
sql += `   '{"instagram":"https://instagram.com/newikondoors","whatsapp":"https://wa.me/919842445353"}'::jsonb);\n\n`;

// Reset sequences
sql += `-- Synchronize sequences\n`;
sql += `SELECT setval('collections_id_seq', (SELECT COALESCE(MAX(id), 1) FROM collections));\n`;
sql += `SELECT setval('products_id_seq', (SELECT COALESCE(MAX(id), 1) FROM products));\n`;
sql += `SELECT setval('branches_id_seq', (SELECT COALESCE(MAX(id), 1) FROM branches));\n`;
sql += `SELECT setval('testimonials_id_seq', (SELECT COALESCE(MAX(id), 1) FROM testimonials));\n`;
sql += `SELECT setval('usps_id_seq', (SELECT COALESCE(MAX(id), 1) FROM usps));\n`;
sql += `SELECT setval('catalogue_id_seq', (SELECT COALESCE(MAX(id), 1) FROM catalogue));\n`;
sql += `SELECT setval('site_settings_id_seq', (SELECT COALESCE(MAX(id), 1) FROM site_settings));\n`;

fs.writeFileSync(path.join(ROOT, 'supabase/seed.sql'), sql, 'utf8');
console.log(`[Seed Generator] Generated supabase/seed.sql with ${productsData.collections.length} collections and ${prodValues.length} products.`);
