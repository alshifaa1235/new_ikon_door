import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

let client = null;

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseKey);
}

export function getSupabase() {
  if (!isSupabaseConfigured()) return null;
  if (!client) {
    client = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });
  }
  return client;
}

// ---- Collections ----
export async function sbGetAllCollections(publishedOnly = true) {
  const sb = getSupabase();
  if (!sb) return null;
  let q = sb.from('collections').select('*, products(id)').order('display_order', { ascending: true });
  if (publishedOnly) q = q.eq('published', 1);
  const { data, error } = await q;
  if (error) { console.error('[Supabase] getAllCollections error:', error); return null; }
  return (data || []).map(c => ({
    ...c,
    product_count: c.products ? c.products.length : 0
  }));
}

export async function sbGetCollectionBySlug(slug) {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from('collections').select('*').eq('slug', slug).single();
  if (error || !data) return null;
  return data;
}

// ---- Products ----
export async function sbGetProductsByCollection(collectionId, publishedOnly = true) {
  const sb = getSupabase();
  if (!sb) return null;
  let q = sb.from('products').select('*').eq('collection_id', collectionId);
  if (publishedOnly) q = q.eq('published', 1);
  const { data, error } = await q;
  if (error) return null;
  return data || [];
}

export async function sbGetProductByCode(code) {
  const sb = getSupabase();
  if (!sb) return null;
  const cleanCode = code.toUpperCase().replace(/[^A-Z0-9]/g, '');
  // Try exact match first
  let { data, error } = await sb.from('products').select('*, collections(*)').eq('code', code).single();
  if (!data) {
    // Try case-insensitive ilike
    const res = await sb.from('products').select('*, collections(*)').ilike('code', cleanCode).limit(1);
    data = res.data && res.data[0] ? res.data[0] : null;
  }
  if (!data) return null;

  // Fetch related products from same collection
  let related = [];
  if (data.collection_id) {
    const { data: relData } = await sb.from('products')
      .select('*')
      .eq('collection_id', data.collection_id)
      .neq('id', data.id)
      .limit(4);
    related = relData || [];
  }

  return {
    ...data,
    collection_name: data.collections ? data.collections.name : '',
    collection_slug: data.collections ? data.collections.slug : '',
    related
  };
}

export async function sbGetFeaturedProducts(limit = 8) {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from('products')
    .select('*, collections(name, slug)')
    .eq('published', 1)
    .eq('featured', 1)
    .limit(limit);
  if (error) return null;
  return (data || []).map(p => ({
    ...p,
    collection_name: p.collections ? p.collections.name : '',
    collection_slug: p.collections ? p.collections.slug : ''
  }));
}

export async function sbGetAllProducts(publishedOnly = true) {
  const sb = getSupabase();
  if (!sb) return null;
  let q = sb.from('products').select('*, collections(name, slug)');
  if (publishedOnly) q = q.eq('published', 1);
  const { data, error } = await q;
  if (error) return null;
  return (data || []).map(p => ({
    ...p,
    collection_name: p.collections ? p.collections.name : '',
    collection_slug: p.collections ? p.collections.slug : ''
  }));
}

export async function sbSearchProducts(query) {
  const sb = getSupabase();
  if (!sb) return null;
  const q = `%${query.trim()}%`;
  const { data, error } = await sb.from('products')
    .select('*, collections(name, slug)')
    .eq('published', 1)
    .or(`code.ilike.${q},name.ilike.${q},description.ilike.${q}`)
    .limit(20);
  if (error) return null;
  return (data || []).map(p => ({
    ...p,
    collection_name: p.collections ? p.collections.name : '',
    collection_slug: p.collections ? p.collections.slug : ''
  }));
}

// ---- Branches ----
export async function sbGetBranches(publishedOnly = true) {
  const sb = getSupabase();
  if (!sb) return null;
  let q = sb.from('branches').select('*').order('display_order', { ascending: true });
  if (publishedOnly) q = q.eq('published', 1);
  const { data, error } = await q;
  if (error) return null;
  return data || [];
}

// ---- Testimonials ----
export async function sbGetTestimonials(publishedOnly = true) {
  const sb = getSupabase();
  if (!sb) return null;
  let q = sb.from('testimonials').select('*').order('display_order', { ascending: true });
  if (publishedOnly) q = q.eq('published', 1);
  const { data, error } = await q;
  if (error) return null;
  return data || [];
}

// ---- Catalogue ----
export async function sbGetCatalogue() {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.from('catalogue').select('*').eq('active', 1).order('id', { ascending: false }).limit(1).single();
  return data || null;
}

// ---- Site Settings ----
export async function sbGetSiteSettings() {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.from('site_settings').select('*');
  if (!data) return null;
  const obj = {};
  data.forEach(item => { obj[item.setting_key] = item.setting_value; });
  return obj;
}

// ---- Enquiries ----
export async function sbCreateEnquiry(data) {
  const sb = getSupabase();
  if (!sb) return null;
  const { data: record, error } = await sb.from('enquiries').insert({
    name: data.name,
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
  }).select().single();

  if (error) {
    console.error('[Supabase] createEnquiry error:', error);
    return null;
  }
  return record;
}

export async function sbGetEnquiries(status = null) {
  const sb = getSupabase();
  if (!sb) return null;
  let q = sb.from('enquiries').select('*').order('created_at', { ascending: false });
  if (status) q = q.eq('status', status.toUpperCase());
  const { data, error } = await q;
  if (error) return null;
  return data || [];
}

export async function sbUpdateEnquiry(id, status, notes = null) {
  const sb = getSupabase();
  if (!sb) return null;
  const update = { status, updated_at: new Date().toISOString() };
  if (notes !== null) update.internal_notes = notes;
  const { data, error } = await sb.from('enquiries').update(update).eq('id', id).select().single();
  if (error) return null;
  return data;
}

export async function sbDeleteEnquiry(id) {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb.from('enquiries').delete().eq('id', id);
  return !error;
}

// ---- USPs ----
export async function sbGetUsps(publishedOnly = true) {
  const sb = getSupabase();
  if (!sb) return null;
  let q = sb.from('usps').select('*').order('sort_order', { ascending: true });
  if (publishedOnly) q = q.eq('published', true).eq('verified', true);
  const { data, error } = await q;
  if (error) return null;
  return data || [];
}

