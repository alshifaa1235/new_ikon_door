import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// Load environment variables from .env if present
function loadEnv() {
  const envPath = path.join(ROOT, '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
}

loadEnv();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('[Seed] Notice: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) are not set in environment.');
  console.log('[Seed] To seed your remote Supabase instance, either:');
  console.log('       1. Copy supabase/schema.sql and supabase/seed.sql into your Supabase Dashboard -> SQL Editor and Run.');
  console.log('       2. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env and run: node scripts/seed_supabase.js');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

const productsData = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/products.json'), 'utf8'));
const companyData = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/company.json'), 'utf8'));
const testimonialsData = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/testimonials.json'), 'utf8'));

async function seed() {
  console.log(`[Seed] Connecting to Supabase at ${supabaseUrl}...`);

  // 1. Collections
  console.log('[Seed] Seeding collections...');
  const collectionsToInsert = productsData.collections.map((col, idx) => ({
    name: col.name || '',
    slug: col.slug || '',
    description: col.description || '',
    category: col.category || '',
    tagline: col.tagline || '',
    cover_image: col.hero_image ? `/doors/${col.hero_image}` : '',
    hero_image: col.hero_image ? `/doors/${col.hero_image}` : '',
    material: col.material || '',
    finish: col.finish || '',
    thickness: col.thickness || '',
    application: col.application || '',
    published: col.published !== false,
    featured: Boolean(col.featured),
    sort_order: col.display_order ?? idx,
    display_order: col.display_order ?? idx,
    seo_title: `${col.name} | New Ikon Doors Trichy`,
    seo_description: (col.description || '').slice(0, 155)
  }));

  const { data: insertedCollections, error: colErr } = await supabase
    .from('collections')
    .upsert(collectionsToInsert, { onConflict: 'slug' })
    .select();

  if (colErr) {
    console.error('[Seed] Collections error:', colErr.message);
  } else {
    console.log(`[Seed] Successfully seeded ${insertedCollections?.length || collectionsToInsert.length} collections.`);
  }

  // Map collection slug to database ID
  const colMap = {};
  if (insertedCollections) {
    insertedCollections.forEach(c => { colMap[c.slug] = c.id; });
  }

  // 2. Products
  console.log('[Seed] Seeding products...');
  const productsToInsert = [];
  let prodSort = 0;

  for (const col of productsData.collections) {
    const colId = colMap[col.slug] || null;
    for (const prod of (col.products || [])) {
      prodSort++;
      const code = (prod.code || `NIK-${prodSort}`).trim();
      const cleanSlug = code.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const name = prod.name ? `${prod.name} (${code})` : `Door ${code}`;
      const desc = prod.description || prod.short_description || `${col.name} - Model ${code}`;
      const primaryImg = prod.image ? (prod.image.startsWith('/') ? prod.image : `/doors/${prod.image}`) : '';
      const lifestyleImg = prod.lifestyle_image ? (prod.lifestyle_image.startsWith('/') ? prod.lifestyle_image : `/doors/${prod.lifestyle_image}`) : '';

      productsToInsert.push({
        name,
        slug: cleanSlug,
        product_code: code,
        code: code,
        collection_id: colId,
        description: desc,
        short_description: prod.short_description || '',
        primary_image: primaryImg,
        image: primaryImg,
        gallery_images: [],
        features: Array.isArray(prod.features) ? prod.features : [],
        applications: prod.applications || col.application || '',
        available_sizes: prod.available_sizes || '81" x 30", 81" x 32", 81" x 36", 84" x 36", 84" x 38"',
        material: prod.material || col.material || '',
        finish: prod.finish || col.finish || '',
        specs: prod.specs || {},
        lifestyle_image: lifestyleImg,
        lifestyle_title: prod.lifestyle_title || '',
        published: prod.published !== false,
        featured: Boolean(prod.featured),
        sort_order: prodSort,
        seo_title: `${name} | New Ikon Doors`,
        seo_description: `Explore ${name} by New Ikon Doors Trichy.`
      });
    }
  }

  // Insert products in batches of 50
  for (let i = 0; i < productsToInsert.length; i += 50) {
    const batch = productsToInsert.slice(i, i + 50);
    const { error: prodErr } = await supabase
      .from('products')
      .upsert(batch, { onConflict: 'product_code' });
    if (prodErr) console.error(`[Seed] Products batch ${i}-${i + 50} error:`, prodErr.message);
  }
  console.log(`[Seed] Successfully processed ${productsToInsert.length} products.`);

  // 3. Branches
  console.log('[Seed] Seeding branches...');
  const branchesToInsert = (companyData.branches || []).map((b, idx) => ({
    name: b.name || '',
    category: b.category || 'Showroom',
    badge: b.badge || '',
    description: b.description || b.desc || '',
    address: b.address || '',
    phone: b.phone || '+91 98424 45353',
    phone_alt: b.phoneAlt || '',
    whatsapp: companyData.whatsapp || '9842445353',
    maps_url: b.mapUrl || '',
    map_url: b.mapUrl || '',
    image_url: b.image || '',
    image: b.image || '',
    opening_hours: b.timings || 'Mon - Sat: 9:00 AM - 8:30 PM',
    timings: b.timings || 'Mon - Sat: 9:00 AM - 8:30 PM',
    highlights: b.highlights || [],
    published: b.published !== false,
    sort_order: idx,
    display_order: idx
  }));

  const { error: bErr } = await supabase.from('branches').upsert(branchesToInsert);
  if (bErr) console.error('[Seed] Branches error:', bErr.message);
  else console.log(`[Seed] Seeded ${branchesToInsert.length} branches.`);

  // 4. Testimonials
  console.log('[Seed] Seeding testimonials...');
  const testsToInsert = testimonialsData.map((t, idx) => ({
    customer_name: t.name || '',
    name: t.name || '',
    company: t.company || '',
    designation: t.role || '',
    role: t.role || '',
    location: t.location || '',
    content: t.quote || '',
    quote: t.quote || '',
    image_url: t.photo || '',
    photo: t.photo || '',
    rating: t.rating || 5,
    project: t.project || '',
    published: t.published !== false,
    sort_order: idx,
    display_order: idx
  }));

  const { error: tErr } = await supabase.from('testimonials').upsert(testsToInsert);
  if (tErr) console.error('[Seed] Testimonials error:', tErr.message);
  else console.log(`[Seed] Seeded ${testsToInsert.length} testimonials.`);

  // 5. USPs
  console.log('[Seed] Seeding USPs...');
  const usps = [
    { title: 'In-House CNC Precision', description: 'Computer numerical control routing and vacuum-press membrane bonding for crisp geometric motifs and structural consistency.', icon: 'Cpu', verified: true, published: true, sort_order: 1 },
    { title: 'Water & Moisture Resistance', description: 'Multi-layer protective polymer coats and WPVC compositions engineered to endure humid regional climates.', icon: 'Droplets', verified: true, published: true, sort_order: 2 },
    { title: 'Architectural Customization', description: 'Custom door dimensions, distinct wood-grain tones, authentic marble veining, and metallic stainless steel inlays.', icon: 'Layers', verified: true, published: true, sort_order: 3 },
    { title: 'Wholesale Group Synergies', description: 'Direct coordination with sister divisions Classic Ply & Lam and Royal Lam & Ply for consolidated trade supply.', icon: 'ShieldCheck', verified: true, published: true, sort_order: 4 }
  ];
  const { error: uErr } = await supabase.from('usps').upsert(usps);
  if (uErr) console.error('[Seed] USPs error:', uErr.message);
  else console.log(`[Seed] Seeded ${usps.length} USPs.`);

  // 6. Catalogue
  console.log('[Seed] Seeding catalogue...');
  const { error: cErr } = await supabase.from('catalogue').upsert([{
    title: 'New Ikon Doors Official Catalogue',
    pdf_url: '/catalogue/NEW_IKON_DOORS.pdf',
    file_url: '/catalogue/NEW_IKON_DOORS.pdf',
    version: '2026.1',
    file_size: '9.0 MB',
    published: true,
    active: true
  }]);
  if (cErr) console.error('[Seed] Catalogue error:', cErr.message);
  else console.log('[Seed] Seeded catalogue.');

  // 7. Site Settings
  console.log('[Seed] Seeding site_settings...');
  const { error: sErr } = await supabase.from('site_settings').upsert([{
    company_name: companyData.name || 'New Ikon Doors',
    logo_url: '/new_ikon_logo_white.png',
    phone: companyData.phone || '+91 98424 45353',
    phone_alt: companyData.phoneAlt || '+91 98424 43353',
    whatsapp: companyData.whatsapp || '9842445353',
    email: companyData.email || 'abbas43353@gmail.com',
    address: companyData.address || 'Plot No. 45 C/A1, Thanjavur Road, Near Mariyamman Kovil Bus Stop, Tharanallur, Trichy - 620008, Tamil Nadu, India',
    specialization: companyData.specialization || 'Dealers in PVC, Teak, Rubber Wood, Mica, Plywoods',
    machinery: companyData.machinery || 'High-Precision CNC Automated Routing & Vacuum Membrane Technology',
    social_links: { instagram: 'https://instagram.com/newikondoors', whatsapp: 'https://wa.me/919842445353' }
  }]);
  if (sErr) console.error('[Seed] Site settings error:', sErr.message);
  else console.log('[Seed] Seeded site settings.');

  console.log('[Seed] Migration finished successfully!');
}

seed().catch(err => {
  console.error('[Seed] Unexpected error:', err);
  process.exit(1);
});
