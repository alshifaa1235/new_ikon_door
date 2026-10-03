import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = 'https://uljnepjfruqvglphsnth.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsam5lcGpmcnVxdmdscGhzbnRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0OTE0NjAsImV4cCI6MjEwNjA2NzQ2MH0.LHPWCpvYKN5ZuWR_Gf1433oiBv6c85Bq_-ik6CbOgjg';
const supabase = createClient(supabaseUrl, supabaseKey);

async function runSync() {
  console.log('--- Connecting to Supabase as Admin ---');
  const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'admin@newikondoors.com',
    password: 'abbas@786'
  });
  if (authErr) {
    console.error('Auth error:', authErr);
    process.exit(1);
  }
  console.log('Logged in as:', auth.user.email);

  const productsJson = JSON.parse(fs.readFileSync('src/data/products.json', 'utf8'));
  const collectionsData = productsJson.collections;
  const productsData = productsJson.products;

  console.log(`Loaded ${collectionsData.length} collections and ${productsData.length} products from products.json`);

  // 1. Sync Collections
  console.log('\n--- Syncing Collections ---');
  const { data: existingCols, error: colFetchErr } = await supabase.from('collections').select('*');
  if (colFetchErr) {
    console.error('Error fetching collections:', colFetchErr);
  }

  const colMap = new Map(); // slug -> id
  for (const c of existingCols || []) {
    colMap.set(c.slug, c.id);
  }

  for (const col of collectionsData) {
    const existingId = colMap.get(col.slug);
    const payload = {
      name: col.name,
      slug: col.slug,
      category: col.category,
      tagline: col.tagline,
      description: col.description,
      material: col.material,
      finish: col.finish,
      thickness: col.thickness,
      application: col.application,
      hero_image: col.hero_image,
      cover_image: col.hero_image,
      sort_order: col.sort_order,
      display_order: col.sort_order,
      published: true,
      featured: Boolean(col.sort_order <= 4),
      updated_at: new Date().toISOString()
    };

    if (existingId) {
      console.log(`Updating collection: ${col.name} (ID: ${existingId})`);
      const { error: updErr } = await supabase.from('collections').update(payload).eq('id', existingId);
      if (updErr) console.error(`Error updating collection ${col.slug}:`, updErr.message);
    } else {
      console.log(`Inserting new collection: ${col.name}`);
      payload.created_at = new Date().toISOString();
      const { data: insData, error: insErr } = await supabase.from('collections').insert([payload]).select().single();
      if (insErr) {
        console.error(`Error inserting collection ${col.slug}:`, insErr.message);
      } else if (insData) {
        colMap.set(col.slug, insData.id);
      }
    }
  }

  // Refresh colMap
  const { data: refreshedCols } = await supabase.from('collections').select('*');
  for (const c of refreshedCols || []) {
    colMap.set(c.slug, c.id);
    console.log(`Collection [${c.id}] ${c.slug}: ${c.name}`);
  }

  // 2. Fetch Existing Products in DB
  console.log('\n--- Fetching Existing DB Products ---');
  let allDbProducts = [];
  let page = 0;
  while (true) {
    const { data: pBatch, error: pErr } = await supabase
      .from('products')
      .select('id, code, product_code, slug, collection_id')
      .range(page * 1000, (page + 1) * 1000 - 1);
    if (pErr || !pBatch || pBatch.length === 0) break;
    allDbProducts = allDbProducts.concat(pBatch);
    if (pBatch.length < 1000) break;
    page++;
  }
  console.log(`Found ${allDbProducts.length} existing products in database.`);

  const dbCodeMap = new Map(); // normalized code -> db product
  for (const p of allDbProducts) {
    const norm = (p.code || p.product_code || '').trim().toUpperCase();
    if (norm) dbCodeMap.set(norm, p);
  }

  // 3. Upsert Products
  console.log('\n--- Upserting 360 Products ---');
  let updatedCount = 0;
  let insertedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < productsData.length; i++) {
    const prod = productsData[i];
    const colId = colMap.get(prod.collection_slug) || prod.collection_id;
    const normCode = prod.code.trim().toUpperCase();
    const existing = dbCodeMap.get(normCode);

    const payload = {
      name: prod.name,
      code: prod.code,
      product_code: prod.code,
      slug: prod.code.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      collection_id: colId,
      description: prod.description || '',
      short_description: prod.short_description || '',
      primary_image: prod.image,
      image: prod.image,
      lifestyle_image: prod.lifestyle_image || '',
      lifestyle_title: prod.lifestyle_title || '',
      material: prod.material || '',
      finish: prod.finish || '',
      available_sizes: prod.available_sizes || '',
      applications: prod.applications || '',
      specs: prod.specs || {},
      features: prod.features || [],
      gallery_images: [prod.image],
      published: true,
      featured: Boolean(prod.featured),
      sort_order: prod.sort_order || (i + 1),
      updated_at: new Date().toISOString()
    };

    if (existing) {
      const { error: uErr } = await supabase.from('products').update(payload).eq('id', existing.id);
      if (uErr) {
        console.error(`Error updating product ${prod.code}:`, uErr.message);
        errorCount++;
      } else {
        updatedCount++;
      }
    } else {
      payload.created_at = new Date().toISOString();
      const { error: iErr } = await supabase.from('products').insert([payload]);
      if (iErr) {
        console.error(`Error inserting product ${prod.code}:`, iErr.message);
        errorCount++;
      } else {
        insertedCount++;
      }
    }

    if ((i + 1) % 50 === 0 || i === productsData.length - 1) {
      console.log(`Progress: ${i + 1}/${productsData.length} (Updated: ${updatedCount}, Inserted: ${insertedCount}, Errors: ${errorCount})`);
    }
  }

  // 4. Verify Final State
  console.log('\n--- Final Verification ---');
  const { data: finalCols } = await supabase.from('collections').select('id, slug, name');
  const { data: finalProds } = await supabase.from('products').select('id, code, collection_id');
  for (const c of finalCols || []) {
    const pForC = (finalProds || []).filter(p => p.collection_id === c.id);
    console.log(`Collection ${c.name} (${c.slug}, ID: ${c.id}): ${pForC.length} doors`);
  }

  console.log('\nSYNC COMPLETE!');
}

runSync().catch(console.error);
