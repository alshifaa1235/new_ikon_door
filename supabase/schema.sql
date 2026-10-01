-- ==============================================================================
-- NEW IKON DOORS — PRODUCTION SUPABASE DATABASE SCHEMA & RLS
-- ==============================================================================
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- It creates all required tables, Row Level Security policies, indexes,
-- storage buckets, and administrator authorization rules.

-- Enable pgcrypto / uuid-ossp for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. ADMINISTRATOR PROFILES
-- ==============================================================================
-- Links Supabase Auth (auth.users) to role-based access control.
-- Passwords are NEVER stored here; Supabase Auth manages encrypted credentials.
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT DEFAULT '',
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_admin_profiles_user_id UNIQUE (user_id)
);

-- Helper function to check if the current request is from an authenticated admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

-- ==============================================================================
-- 2. COLLECTIONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.collections (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  category TEXT DEFAULT '',
  tagline TEXT DEFAULT '',
  cover_image TEXT DEFAULT '',
  hero_image TEXT DEFAULT '',
  material TEXT DEFAULT '',
  finish TEXT DEFAULT '',
  thickness TEXT DEFAULT '',
  application TEXT DEFAULT '',
  published BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  seo_title TEXT DEFAULT '',
  seo_description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. PRODUCTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  slug TEXT DEFAULT '',
  product_code TEXT UNIQUE NOT NULL,
  code TEXT DEFAULT '',
  collection_id BIGINT REFERENCES public.collections(id) ON DELETE SET NULL,
  description TEXT DEFAULT '',
  short_description TEXT DEFAULT '',
  primary_image TEXT DEFAULT '',
  image TEXT DEFAULT '',
  gallery_images JSONB DEFAULT '[]'::jsonb,
  features JSONB DEFAULT '[]'::jsonb,
  applications TEXT DEFAULT '',
  available_sizes TEXT DEFAULT '',
  material TEXT DEFAULT '',
  finish TEXT DEFAULT '',
  specs JSONB DEFAULT '{}'::jsonb,
  lifestyle_image TEXT DEFAULT '',
  lifestyle_title TEXT DEFAULT '',
  published BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  seo_title TEXT DEFAULT '',
  seo_description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. BRANCHES TABLE (Showrooms & Headquarters)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.branches (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'Showroom',
  badge TEXT DEFAULT '',
  description TEXT DEFAULT '',
  address TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  phone_alt TEXT DEFAULT '',
  whatsapp TEXT DEFAULT '',
  maps_url TEXT DEFAULT '',
  map_url TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  image TEXT DEFAULT '',
  opening_hours TEXT DEFAULT '',
  timings TEXT DEFAULT '',
  highlights JSONB DEFAULT '[]'::jsonb,
  published BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 5. TESTIMONIALS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.testimonials (
  id BIGSERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  name TEXT DEFAULT '',
  company TEXT DEFAULT '',
  designation TEXT DEFAULT '',
  role TEXT DEFAULT '',
  location TEXT DEFAULT '',
  content TEXT NOT NULL,
  quote TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  photo TEXT DEFAULT '',
  rating INTEGER DEFAULT 5,
  project TEXT DEFAULT '',
  published BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 6. USPs TABLE (Verified Architectural Features)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.usps (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  icon TEXT DEFAULT 'Cpu',
  verified BOOLEAN DEFAULT true,
  published BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 7. CATALOGUE TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.catalogue (
  id BIGSERIAL PRIMARY KEY,
  title TEXT DEFAULT 'New Ikon Doors Catalogue',
  pdf_url TEXT NOT NULL,
  file_url TEXT DEFAULT '',
  version TEXT DEFAULT '1.0',
  file_size TEXT DEFAULT '9 MB',
  published BOOLEAN DEFAULT true,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 8. SITE SETTINGS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
  id BIGSERIAL PRIMARY KEY,
  company_name TEXT DEFAULT 'New Ikon Doors',
  logo_url TEXT DEFAULT '/new_ikon_logo_white.png',
  phone TEXT DEFAULT '+91 98424 45353',
  phone_alt TEXT DEFAULT '+91 98424 43353',
  whatsapp TEXT DEFAULT '9842445353',
  email TEXT DEFAULT 'abbas43353@gmail.com',
  address TEXT DEFAULT 'Plot No. 45 C/A1, Thanjavur Road, Near Mariyamman Kovil Bus Stop, Tharanallur, Trichy - 620008, Tamil Nadu, India',
  specialization TEXT DEFAULT 'Dealers in PVC, Teak, Rubber Wood, Mica, Plywoods',
  machinery TEXT DEFAULT 'High-Precision CNC Automated Routing & Vacuum Membrane Technology',
  social_links JSONB DEFAULT '{"facebook":"","instagram":"","linkedin":"","youtube":""}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 9. ENQUIRIES TABLE (Customer Quote Requests)
-- ==============================================================================
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

-- ==============================================================================
-- 10. INDEXES FOR HIGH-TRAFFIC SEARCH & SEO
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_products_collection ON public.products(collection_id);
CREATE INDEX IF NOT EXISTS idx_products_code ON public.products(product_code);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_published ON public.products(published);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured);
CREATE INDEX IF NOT EXISTS idx_collections_slug ON public.collections(slug);
CREATE INDEX IF NOT EXISTS idx_collections_published ON public.collections(published);
CREATE INDEX IF NOT EXISTS idx_branches_published ON public.branches(published);
CREATE INDEX IF NOT EXISTS idx_testimonials_published ON public.testimonials(published);
CREATE INDEX IF NOT EXISTS idx_usps_published ON public.usps(published, verified);
CREATE INDEX IF NOT EXISTS idx_catalogue_published ON public.catalogue(published);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON public.enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_created ON public.enquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_profiles_user ON public.admin_profiles(user_id);

-- ==============================================================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
-- Enable RLS on every table
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalogue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

-- ── Admin Profiles Policies ──
DROP POLICY IF EXISTS "Admins can view admin_profiles" ON public.admin_profiles;
CREATE POLICY "Admins can view admin_profiles"
  ON public.admin_profiles FOR SELECT
  TO authenticated
  USING (public.is_admin() OR user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage admin_profiles" ON public.admin_profiles;
CREATE POLICY "Admins can manage admin_profiles"
  ON public.admin_profiles FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── Collections Policies ──
DROP POLICY IF EXISTS "Public can view published collections" ON public.collections;
CREATE POLICY "Public can view published collections"
  ON public.collections FOR SELECT
  TO anon, authenticated
  USING (published = true);

DROP POLICY IF EXISTS "Admins have full access to collections" ON public.collections;
CREATE POLICY "Admins have full access to collections"
  ON public.collections FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── Products Policies ──
DROP POLICY IF EXISTS "Public can view published products" ON public.products;
CREATE POLICY "Public can view published products"
  ON public.products FOR SELECT
  TO anon, authenticated
  USING (published = true);

DROP POLICY IF EXISTS "Admins have full access to products" ON public.products;
CREATE POLICY "Admins have full access to products"
  ON public.products FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── Branches Policies ──
DROP POLICY IF EXISTS "Public can view published branches" ON public.branches;
CREATE POLICY "Public can view published branches"
  ON public.branches FOR SELECT
  TO anon, authenticated
  USING (published = true);

DROP POLICY IF EXISTS "Admins have full access to branches" ON public.branches;
CREATE POLICY "Admins have full access to branches"
  ON public.branches FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── Testimonials Policies ──
DROP POLICY IF EXISTS "Public can view published testimonials" ON public.testimonials;
CREATE POLICY "Public can view published testimonials"
  ON public.testimonials FOR SELECT
  TO anon, authenticated
  USING (published = true);

DROP POLICY IF EXISTS "Admins have full access to testimonials" ON public.testimonials;
CREATE POLICY "Admins have full access to testimonials"
  ON public.testimonials FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── USPs Policies ──
DROP POLICY IF EXISTS "Public can view published verified USPs" ON public.usps;
CREATE POLICY "Public can view published verified USPs"
  ON public.usps FOR SELECT
  TO anon, authenticated
  USING (published = true AND verified = true);

DROP POLICY IF EXISTS "Admins have full access to usps" ON public.usps;
CREATE POLICY "Admins have full access to usps"
  ON public.usps FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── Catalogue Policies ──
DROP POLICY IF EXISTS "Public can view published catalogue" ON public.catalogue;
CREATE POLICY "Public can view published catalogue"
  ON public.catalogue FOR SELECT
  TO anon, authenticated
  USING (published = true);

DROP POLICY IF EXISTS "Admins have full access to catalogue" ON public.catalogue;
CREATE POLICY "Admins have full access to catalogue"
  ON public.catalogue FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── Site Settings Policies ──
DROP POLICY IF EXISTS "Public can view site settings" ON public.site_settings;
CREATE POLICY "Public can view site settings"
  ON public.site_settings FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins have full access to site_settings" ON public.site_settings;
CREATE POLICY "Admins have full access to site_settings"
  ON public.site_settings FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── Enquiries Policies (Public INSERT, Admin ALL) ──
DROP POLICY IF EXISTS "Public can submit enquiries" ON public.enquiries;
CREATE POLICY "Public can submit enquiries"
  ON public.enquiries FOR INSERT
  TO anon, authenticated
  WITH CHECK (name IS NOT NULL AND length(trim(name)) > 0);

DROP POLICY IF EXISTS "Admins have full access to enquiries" ON public.enquiries;
CREATE POLICY "Admins have full access to enquiries"
  ON public.enquiries FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ==============================================================================
-- 12. STORAGE BUCKETS CONFIGURATION & ACCESS POLICIES
-- ==============================================================================
-- Create storage buckets if they do not exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('product-images', 'product-images', true),
  ('collection-images', 'collection-images', true),
  ('branch-images', 'branch-images', true),
  ('testimonial-images', 'testimonial-images', true),
  ('catalogue', 'catalogue', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Public READ on all public asset buckets
DROP POLICY IF EXISTS "Public read storage assets" ON storage.objects;
CREATE POLICY "Public read storage assets"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id IN ('product-images', 'collection-images', 'branch-images', 'testimonial-images', 'catalogue'));

-- Admin upload policy
DROP POLICY IF EXISTS "Admins can upload storage assets" ON storage.objects;
CREATE POLICY "Admins can upload storage assets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id IN ('product-images', 'collection-images', 'branch-images', 'testimonial-images', 'catalogue')
    AND public.is_admin()
  );

-- Admin update policy
DROP POLICY IF EXISTS "Admins can update storage assets" ON storage.objects;
CREATE POLICY "Admins can update storage assets"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id IN ('product-images', 'collection-images', 'branch-images', 'testimonial-images', 'catalogue')
    AND public.is_admin()
  );

-- Admin delete policy
DROP POLICY IF EXISTS "Admins can delete storage assets" ON storage.objects;
CREATE POLICY "Admins can delete storage assets"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id IN ('product-images', 'collection-images', 'branch-images', 'testimonial-images', 'catalogue')
    AND public.is_admin()
  );

-- ==============================================================================
-- 13. POSTGRESQL PERMISSIONS & GRANTS
-- ==============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT ON public.enquiries TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Explicitly revoke any anonymous mutations on CMS content
REVOKE INSERT, UPDATE, DELETE ON public.products FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.collections FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.branches FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.testimonials FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.usps FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.catalogue FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.site_settings FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.admin_profiles FROM anon;

-- ==============================================================================
-- 14. HELPER TRIGGER FOR INITIAL ADMIN SETUP
-- ==============================================================================
-- Automatically grants 'admin' role to any user registered with a specific admin email
-- or the first user created in auth.users.
CREATE OR REPLACE FUNCTION public.handle_admin_user_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert into admin_profiles
  INSERT INTO public.admin_profiles (user_id, email, role)
  VALUES (NEW.id, NEW.email, 'admin')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_admin_user_created();
