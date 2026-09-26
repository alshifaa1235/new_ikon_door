import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('\x1b[31m[Error] SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) environment variables are required.\x1b[0m');
  console.log('\nUsage:');
  console.log('  SUPABASE_URL=https://xyz.supabase.co SUPABASE_SERVICE_ROLE_KEY=your_key node scripts/seed-supabase.js\n');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

async function seed() {
  console.log('\x1b[36m[Supabase Seed] Connecting to Supabase at:', supabaseUrl, '\x1b[0m\n');

  // 1. Seed Collections & Products
  const productsJsonPath = path.join(ROOT, 'src', 'data', 'products.json');
  if (fs.existsSync(productsJsonPath)) {
    const raw = JSON.parse(fs.readFileSync(productsJsonPath, 'utf8'));
    const collections = raw.collections || [];

    console.log(`[Collections] Found ${collections.length} collections to process.`);
    for (let i = 0; i < collections.length; i++) {
      const c = collections[i];
      const { data: colData, error: colErr } = await supabase
        .from('collections')
        .upsert({
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
          display_order: i,
          seo_title: c.seo_title || `${c.name} | New Ikon Doors`,
          seo_description: c.seo_description || c.description || ''
        }, { onConflict: 'slug' })
        .select('id')
        .single();

      if (colErr) {
        console.error(`  ❌ Failed inserting collection ${c.slug}:`, colErr.message);
        continue;
      }

      const collectionId = colData.id;
      const prods = c.products || [];

      if (prods.length > 0) {
        const prodPayloads = prods.map((p, idx) => ({
          code: p.code,
          name: p.name || p.code,
          collection_id: collectionId,
          short_description: p.short_description || '',
          description: p.description || '',
          image: p.image || '',
          lifestyle_image: p.lifestyle_image || '',
          lifestyle_title: p.lifestyle_title || '',
          specs: p.specs || {},
          features: p.features || [],
          applications: p.applications || c.application || '',
          available_sizes: p.available_sizes || '',
          material: p.material || c.material || '',
          finish: p.finish || c.finish || '',
          featured: p.featured ? 1 : (idx === 0 ? 1 : 0),
          published: 1,
          seo_title: `${p.code} - ${c.name} | New Ikon Doors`,
          seo_description: `${p.code} designer door from the ${c.name} collection by New Ikon Doors.`,
          slug: p.code.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        }));

        const { error: prodErr } = await supabase
          .from('products')
          .upsert(prodPayloads, { onConflict: 'code' });

        if (prodErr) {
          console.error(`  ❌ Failed inserting products for ${c.slug}:`, prodErr.message);
        } else {
          console.log(`  ✓ Inserted/Updated collection "${c.name}" with ${prods.length} doors.`);
        }
      }
    }
  }

  // 2. Seed Branches
  const companyJsonPath = path.join(ROOT, 'src', 'data', 'company.json');
  if (fs.existsSync(companyJsonPath)) {
    const comp = JSON.parse(fs.readFileSync(companyJsonPath, 'utf8'));
    const branches = comp.branches || [];

    console.log(`\n[Branches] Seeding ${branches.length} branches...`);
    const branchPayloads = branches.map((b, idx) => ({
      branch_id: b.id || `branch-${idx}`,
      name: b.name,
      category: b.category || '',
      badge: b.badge || '',
      description: b.description || '',
      phone: b.phone || comp.phone || '',
      phone_alt: b.phoneAlt || '',
      whatsapp: b.whatsapp || comp.whatsapp || '',
      email: b.email || comp.email || '',
      address: b.address || '',
      timings: b.timings || 'Mon - Sat: 9:30 AM - 8:00 PM',
      map_url: b.mapUrl || '',
      latitude: b.coordinates ? b.coordinates.lat : 0,
      longitude: b.coordinates ? b.coordinates.lng : 0,
      image: b.image || '',
      highlights: b.highlights || [],
      published: 1,
      display_order: idx
    }));

    const { error: branchErr } = await supabase
      .from('branches')
      .upsert(branchPayloads, { onConflict: 'branch_id' });

    if (branchErr) console.error('  ❌ Error seeding branches:', branchErr.message);
    else console.log(`  ✓ Successfully seeded ${branches.length} branches.`);

    // 3. Seed Site Settings
    console.log('\n[Settings] Seeding site settings...');
    const settings = [
      { setting_key: 'company_name', setting_value: comp.name || 'New Ikon Doors' },
      { setting_key: 'tagline', setting_value: comp.tagline || 'Crafting Impressions That Last' },
      { setting_key: 'phone', setting_value: comp.phone || '+91 99447 99988' },
      { setting_key: 'phone_alt', setting_value: comp.phoneAlt || '+91 98424 55566' },
      { setting_key: 'whatsapp', setting_value: comp.whatsapp || '+91 99447 99988' },
      { setting_key: 'email', setting_value: comp.email || 'info@newikondoors.com' },
      { setting_key: 'address', setting_value: comp.address || 'Erode, Tamil Nadu, India' },
      { setting_key: 'specialization', setting_value: comp.specialization || 'Premium Architectural & Designer Doors' },
      { setting_key: 'machinery', setting_value: comp.machinery || 'German CNC routing & hydraulic membrane pressing technology' }
    ];

    const { error: settErr } = await supabase
      .from('site_settings')
      .upsert(settings, { onConflict: 'setting_key' });

    if (settErr) console.error('  ❌ Error seeding settings:', settErr.message);
    else console.log('  ✓ Successfully seeded site settings.');
  }

  // 4. Seed Testimonials
  const testJsonPath = path.join(ROOT, 'src', 'data', 'testimonials.json');
  if (fs.existsSync(testJsonPath)) {
    const tests = JSON.parse(fs.readFileSync(testJsonPath, 'utf8'));
    console.log(`\n[Testimonials] Seeding ${tests.length} testimonials...`);
    const testPayloads = tests.map((t, idx) => ({
      name: t.name,
      role: t.role || '',
      company: t.company || '',
      location: t.location || '',
      quote: t.quote,
      rating: t.rating || 5,
      project: t.project || '',
      photo: t.photo || '',
      video_url: t.videoUrl || '',
      published: 1,
      display_order: idx
    }));

    const { error: testErr } = await supabase
      .from('testimonials')
      .upsert(testPayloads, { onConflict: 'id' });

    if (testErr) console.error('  ❌ Error seeding testimonials:', testErr.message);
    else console.log(`  ✓ Successfully seeded testimonials.`);
  }

  // 5. Seed Catalogue
  const { error: catErr } = await supabase
    .from('catalogue')
    .upsert({
      id: 1,
      title: 'New Ikon Doors Official Catalogue',
      version: '2026 Edition',
      file_url: '/catalogue/NEW_IKON_DOORS.pdf',
      file_size: '48 MB',
      active: 1
    }, { onConflict: 'id' });

  if (catErr) console.error('  ❌ Error seeding catalogue:', catErr.message);
  else console.log('  ✓ Successfully seeded digital catalogue record.');

  console.log('\n\x1b[32m✨ Supabase database seeding complete!\x1b[0m\n');
}

seed().catch(err => {
  console.error('\x1b[31m[Seed Failed]:\x1b[0m', err);
  process.exit(1);
});
