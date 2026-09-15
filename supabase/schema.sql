-- ==============================================================================
-- SkillScale / Project Nexa Complete Supabase SQL Schema & Policies
-- Run this entire script in your Supabase SQL Editor.
-- It is completely idempotent (safe to re-run multiple times).
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. TABLES DEFINITION
-- ==============================================================================

-- PROFILES: synced from auth.users via trigger
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  provider TEXT DEFAULT 'password',
  role TEXT DEFAULT 'customer',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ADMINS: designates verified admin accounts
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'admin',
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCTS: digital ebooks, guides, and developer kits
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  creator TEXT DEFAULT 'SkillScale Studio',
  category TEXT DEFAULT 'Guides',
  short_description TEXT DEFAULT '',
  description TEXT DEFAULT '',
  price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  compare_at_price NUMERIC(10,2),
  rating NUMERIC(3,2) DEFAULT 5.0,
  reviews INTEGER DEFAULT 0,
  sales INTEGER DEFAULT 0,
  inventory INTEGER,
  format TEXT DEFAULT 'Digital download',
  image TEXT DEFAULT '/products/design-system.png', -- Supports direct Google Drive links (https://lh3.googleusercontent.com/d/... or drive.google.com/file/d/...), external CDN URLs, or local paths
  image_alt TEXT DEFAULT '',
  badge TEXT DEFAULT '',
  portrait BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT true,
  license TEXT DEFAULT 'Personal use',
  requirements TEXT DEFAULT 'None',
  features JSONB DEFAULT '[]'::jsonb,
  file_url TEXT,
  file_size TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ORDERS: customer transactions initiated via Razorpay checkout
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW(),
  total NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  status TEXT DEFAULT 'Processing',
  items JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PURCHASES: fulfilled entitlements and signed download paths for users
CREATE TABLE IF NOT EXISTS public.purchases (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id TEXT NOT NULL,
  title TEXT NOT NULL,
  author TEXT,
  format TEXT,
  download_url TEXT DEFAULT '',
  storage_path TEXT,
  price NUMERIC(10,2) DEFAULT 0.00,
  cover_image TEXT,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- WISHLIST: user book bookmarks
CREATE TABLE IF NOT EXISTS public.wishlist (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, book_id)
);

-- CMS DOCUMENTS: published and draft landing page storefront content
CREATE TABLE IF NOT EXISTS public.cms_documents (
  id TEXT PRIMARY KEY,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- CMS REVISIONS: version history of published content
CREATE TABLE IF NOT EXISTS public.cms_revisions (
  id TEXT PRIMARY KEY,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_published ON public.products(published);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON public.purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON public.wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_cms_revisions_created_at ON public.cms_revisions(created_at DESC);

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_revisions ENABLE ROW LEVEL SECURITY;

-- Helper function: check if currently authenticated user is an active admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins
    WHERE id = auth.uid() AND enabled = true
  );
$$;

-- PROFILES POLICIES
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users and trigger can insert profiles" ON public.profiles;
CREATE POLICY "Users and trigger can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id OR public.is_admin() OR auth.uid() IS NULL);

-- ADMINS POLICIES
DROP POLICY IF EXISTS "Users can check their own admin status" ON public.admins;
CREATE POLICY "Users can check their own admin status"
  ON public.admins FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage admins" ON public.admins;
CREATE POLICY "Admins can manage admins"
  ON public.admins FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- PRODUCTS POLICIES
DROP POLICY IF EXISTS "Public can view published products" ON public.products;
CREATE POLICY "Public can view published products"
  ON public.products FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow product modifications" ON public.products;
CREATE POLICY "Allow product modifications"
  ON public.products FOR ALL
  USING (true)
  WITH CHECK (true);

-- ORDERS POLICIES
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
CREATE POLICY "Users can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users and admin can update orders" ON public.orders;
CREATE POLICY "Users and admin can update orders"
  ON public.orders FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin());

-- PURCHASES POLICIES
DROP POLICY IF EXISTS "Users can view their own purchases" ON public.purchases;
CREATE POLICY "Users can view their own purchases"
  ON public.purchases FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins and service role can manage purchases" ON public.purchases;
CREATE POLICY "Admins and service role can manage purchases"
  ON public.purchases FOR ALL
  USING (public.is_admin() OR auth.uid() IS NULL)
  WITH CHECK (public.is_admin() OR auth.uid() IS NULL);

-- WISHLIST POLICIES
DROP POLICY IF EXISTS "Users can view their own wishlist" ON public.wishlist;
CREATE POLICY "Users can view their own wishlist"
  ON public.wishlist FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can add to wishlist" ON public.wishlist;
CREATE POLICY "Users can add to wishlist"
  ON public.wishlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove from wishlist" ON public.wishlist;
CREATE POLICY "Users can remove from wishlist"
  ON public.wishlist FOR DELETE
  USING (auth.uid() = user_id);

-- CMS DOCUMENTS POLICIES
DROP POLICY IF EXISTS "Public can view cms documents" ON public.cms_documents;
CREATE POLICY "Public can view cms documents"
  ON public.cms_documents FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can modify cms documents" ON public.cms_documents;
CREATE POLICY "Admins can modify cms documents"
  ON public.cms_documents FOR ALL
  USING (true)
  WITH CHECK (true);

-- CMS REVISIONS POLICIES
DROP POLICY IF EXISTS "Public can view cms revisions" ON public.cms_revisions;
CREATE POLICY "Public can view cms revisions"
  ON public.cms_revisions FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can insert cms revisions" ON public.cms_revisions;
CREATE POLICY "Admins can insert cms revisions"
  ON public.cms_revisions FOR INSERT
  WITH CHECK (true);

-- ==============================================================================
-- 5. REALTIME REPLICATION
-- ==============================================================================
-- Enable Realtime broadcasting on tables that use live subscriptions
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.cms_documents;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;

-- ==============================================================================
-- 6. GOTRUE USER SIGNUP TRIGGER (handle_new_user)
-- Fixed GoTrue column names:
--   new.raw_app_meta_data  (not app_metadata)
--   new.raw_user_meta_data (not user_metadata)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_name text;
  user_avatar text;
  user_provider text;
  is_admin_user boolean;
BEGIN
  -- Extract name from raw_user_meta_data (fallback to email prefix or 'Reader')
  user_name := coalesce(
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'full_name',
    split_part(new.email, '@', 1),
    'Reader'
  );

  -- Extract avatar URL if present
  user_avatar := coalesce(
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'picture',
    null
  );

  -- Extract provider from raw_app_meta_data (default to 'password')
  user_provider := coalesce(
    new.raw_app_meta_data->>'provider',
    'password'
  );

  -- Check if user is in designated admin list
  is_admin_user := lower(coalesce(new.email, '')) IN (
    'portfolio.ankit.in@gmail.com',
    'ankit.portfolio.in@gmail.com',
    'digitalankit21@gmail.com'
  );

  -- Insert or update user profile in public.profiles
  INSERT INTO public.profiles (
    id,
    email,
    name,
    avatar_url,
    provider,
    role,
    joined_at,
    updated_at
  )
  VALUES (
    new.id,
    coalesce(new.email, ''),
    user_name,
    user_avatar,
    user_provider,
    CASE WHEN is_admin_user THEN 'admin' ELSE 'customer' END,
    coalesce(new.created_at, now()),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = coalesce(EXCLUDED.name, public.profiles.name),
    avatar_url = coalesce(EXCLUDED.avatar_url, public.profiles.avatar_url),
    provider = coalesce(EXCLUDED.provider, public.profiles.provider),
    updated_at = now();

  -- If designated admin, also ensure public.admins has an enabled record
  IF is_admin_user THEN
    INSERT INTO public.admins (id, email, role, enabled)
    VALUES (new.id, coalesce(new.email, ''), 'admin', true)
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      enabled = true;
  END IF;

  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user trigger error: %', SQLERRM;
    RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 7. STORAGE BUCKET CONFIGURATION
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('ebooks', 'ebooks', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public access to ebooks bucket" ON storage.objects;
CREATE POLICY "Public access to ebooks bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'ebooks');

DROP POLICY IF EXISTS "Allow file uploads to ebooks bucket" ON storage.objects;
CREATE POLICY "Allow file uploads to ebooks bucket"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'ebooks');
