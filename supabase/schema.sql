-- ==============================================================================
-- NEW IKON DOORS — SUPABASE DATABASE SCHEMA
-- ==============================================================================
-- Run this script in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- It creates all required tables, indexes, constraints, and Row Level Security policies.

-- 1. Admin Users
CREATE TABLE IF NOT EXISTS public.admin_users (
  id BIGSERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Collections
CREATE TABLE IF NOT EXISTS public.collections (
  id BIGSERIAL PRIMARY KEY,
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Products
CREATE TABLE IF NOT EXISTS public.products (
  id BIGSERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT DEFAULT '',
  collection_id BIGINT REFERENCES public.collections(id) ON DELETE SET NULL,
  short_description TEXT DEFAULT '',
  description TEXT DEFAULT '',
  image TEXT DEFAULT '',
  lifestyle_image TEXT DEFAULT '',
  lifestyle_title TEXT DEFAULT '',
  specs JSONB DEFAULT '{}'::jsonb,
  features JSONB DEFAULT '[]'::jsonb,
  applications TEXT DEFAULT '',
  available_sizes TEXT DEFAULT '',
  material TEXT DEFAULT '',
  finish TEXT DEFAULT '',
  featured INTEGER DEFAULT 0,
  published INTEGER DEFAULT 1,
  seo_title TEXT DEFAULT '',
  seo_description TEXT DEFAULT '',
  slug TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Product Images (Multi-angle & detail gallery)
CREATE TABLE IF NOT EXISTS public.product_images (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary INTEGER DEFAULT 0,
  alt_text TEXT DEFAULT '',
  display_order INTEGER DEFAULT 0
);

-- 5. Branches (Showrooms & Factory)
CREATE TABLE IF NOT EXISTS public.branches (
  id BIGSERIAL PRIMARY KEY,
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
  latitude NUMERIC DEFAULT 0,
  longitude NUMERIC DEFAULT 0,
  image TEXT DEFAULT '',
  highlights JSONB DEFAULT '[]'::jsonb,
  published INTEGER DEFAULT 1,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Testimonials
CREATE TABLE IF NOT EXISTS public.testimonials (
  id BIGSERIAL PRIMARY KEY,
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Enquiries & Quote Requests
CREATE TABLE IF NOT EXISTS public.enquiries (
  id BIGSERIAL PRIMARY KEY,
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Catalogue
CREATE TABLE IF NOT EXISTS public.catalogue (
  id BIGSERIAL PRIMARY KEY,
  title TEXT DEFAULT 'New Ikon Doors Catalogue',
  version TEXT DEFAULT '1.0',
  file_url TEXT DEFAULT '',
  file_size TEXT DEFAULT '',
  active INTEGER DEFAULT 1,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Site Settings
CREATE TABLE IF NOT EXISTS public.site_settings (
  id BIGSERIAL PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Homepage Content
CREATE TABLE IF NOT EXISTS public.homepage_content (
  id BIGSERIAL PRIMARY KEY,
  section_key TEXT UNIQUE NOT NULL,
  content JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Sessions (Admin Token Storage)
CREATE TABLE IF NOT EXISTS public.sessions (
  id TEXT PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES public.admin_users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- 12. Audit Log
CREATE TABLE IF NOT EXISTS public.audit_log (
  id BIGSERIAL PRIMARY KEY,
  action TEXT NOT NULL,
  entity_type TEXT DEFAULT '',
  entity_id TEXT DEFAULT '',
  details TEXT DEFAULT '',
  user_id BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_products_collection ON public.products(collection_id);
CREATE INDEX IF NOT EXISTS idx_products_code ON public.products(code);
CREATE INDEX IF NOT EXISTS idx_products_published ON public.products(published);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured);
CREATE INDEX IF NOT EXISTS idx_collections_slug ON public.collections(slug);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON public.enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_created ON public.enquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON public.sessions(expires_at);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalogue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Public READ access for live site
DROP POLICY IF EXISTS "Public can view published collections" ON public.collections;
CREATE POLICY "Public can view published collections" ON public.collections FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view published products" ON public.products;
CREATE POLICY "Public can view published products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view product images" ON public.product_images;
CREATE POLICY "Public can view product images" ON public.product_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view published branches" ON public.branches;
CREATE POLICY "Public can view published branches" ON public.branches FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view published testimonials" ON public.testimonials;
CREATE POLICY "Public can view published testimonials" ON public.testimonials FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view active catalogue" ON public.catalogue;
CREATE POLICY "Public can view active catalogue" ON public.catalogue FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view site settings" ON public.site_settings;
CREATE POLICY "Public can view site settings" ON public.site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view homepage content" ON public.homepage_content;
CREATE POLICY "Public can view homepage content" ON public.homepage_content FOR SELECT USING (true);

-- Public INSERT for customer enquiries / quote requests
DROP POLICY IF EXISTS "Public can submit enquiries" ON public.enquiries;
CREATE POLICY "Public can submit enquiries" ON public.enquiries FOR INSERT WITH CHECK (true);

-- Service Role / Admin full access for all operations
DROP POLICY IF EXISTS "Service role full access on collections" ON public.collections;
CREATE POLICY "Service role full access on collections" ON public.collections FOR ALL USING (true);

DROP POLICY IF EXISTS "Service role full access on products" ON public.products;
CREATE POLICY "Service role full access on products" ON public.products FOR ALL USING (true);

DROP POLICY IF EXISTS "Service role full access on enquiries" ON public.enquiries;
CREATE POLICY "Service role full access on enquiries" ON public.enquiries FOR ALL USING (true);

DROP POLICY IF EXISTS "Service role full access on branches" ON public.branches;
CREATE POLICY "Service role full access on branches" ON public.branches FOR ALL USING (true);

DROP POLICY IF EXISTS "Service role full access on testimonials" ON public.testimonials;
CREATE POLICY "Service role full access on testimonials" ON public.testimonials FOR ALL USING (true);

DROP POLICY IF EXISTS "Service role full access on catalogue" ON public.catalogue;
CREATE POLICY "Service role full access on catalogue" ON public.catalogue FOR ALL USING (true);

DROP POLICY IF EXISTS "Service role full access on site_settings" ON public.site_settings;
CREATE POLICY "Service role full access on site_settings" ON public.site_settings FOR ALL USING (true);

DROP POLICY IF EXISTS "Service role full access on homepage_content" ON public.homepage_content;
CREATE POLICY "Service role full access on homepage_content" ON public.homepage_content FOR ALL USING (true);

DROP POLICY IF EXISTS "Service role full access on admin_users" ON public.admin_users;
CREATE POLICY "Service role full access on admin_users" ON public.admin_users FOR ALL USING (true);

DROP POLICY IF EXISTS "Service role full access on sessions" ON public.sessions;
CREATE POLICY "Service role full access on sessions" ON public.sessions FOR ALL USING (true);

DROP POLICY IF EXISTS "Service role full access on audit_log" ON public.audit_log;
CREATE POLICY "Service role full access on audit_log" ON public.audit_log FOR ALL USING (true);
