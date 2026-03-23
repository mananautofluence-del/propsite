-- PROP SITE FULL SCHEMA RECOVERY SCRIPT
-- This script restores the entire database structure for PropSite.
-- WARNING: This may OVERWRITE existing tables if they have the same name.
-- Use this if your site is broken due to missing tables or policies.

-- 1. Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users PRIMARY KEY,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  whatsapp text,
  agency_name text,
  rera_number text,
  bio text,
  city text,
  avatar_url text,
  logo_url text,
  tagline text,
  username text UNIQUE,
  plan text DEFAULT 'free',
  plan_expires_at timestamptz,
  credits_remaining integer DEFAULT 3,
  listings_used_this_month integer DEFAULT 0,
  onboarding_complete boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 2. Listings table
CREATE TABLE IF NOT EXISTS public.listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  temp_token text,
  slug text UNIQUE NOT NULL,
  status text DEFAULT 'draft',
  template text DEFAULT 'blanc',
  accent_color text DEFAULT '#1A5C3A',
  headline text,
  property_type text,
  property_category text DEFAULT 'residential',
  transaction_type text,
  price numeric,
  price_negotiable boolean DEFAULT false,
  monthly_rent numeric,
  security_deposit numeric,
  bhk_config text,
  carpet_area numeric,
  builtup_area numeric,
  super_builtup_area numeric,
  floor_number integer,
  total_floors integer,
  property_age text,
  possession_status text,
  possession_date date,
  rera_number text,
  building_name text,
  locality text,
  city text,
  pincode text,
  facing_direction text,
  google_maps_url text,
  parking_car integer DEFAULT 0,
  parking_two_wheeler integer DEFAULT 0,
  furnishing_status text,
  balcony_count integer DEFAULT 0,
  bathroom_count integer DEFAULT 1,
  has_servant_room boolean DEFAULT false,
  has_study_room boolean DEFAULT false,
  has_pooja_room boolean DEFAULT false,
  has_store_room boolean DEFAULT false,
  amenities text[] DEFAULT '{}',
  ai_description text,
  ai_highlights text[],
  ai_neighbourhood_highlights text[],
  broker_notes text,
  broker_name text,
  broker_phone text,
  broker_whatsapp text,
  broker_agency text,
  broker_rera text,
  broker_avatar_url text,
  broker_logo_url text,
  show_broker_card boolean DEFAULT true,
  expiry_date date,
  urgency_badge text,
  lead_capture_enabled boolean DEFAULT false,
  total_views integer DEFAULT 0,
  total_sessions integer DEFAULT 0,
  avg_time_seconds integer DEFAULT 0,
  whatsapp_clicks integer DEFAULT 0,
  contact_clicks integer DEFAULT 0,
  cam_charges numeric,
  lock_in_period text,
  workstation_capacity integer,
  cabin_count integer,
  meeting_rooms integer,
  office_furnishing text,
  building_grade text,
  ac_type text,
  power_backup_kva integer,
  frontage_width numeric,
  unit_height numeric,
  is_corner_unit boolean DEFAULT false,
  is_main_road_facing boolean DEFAULT false,
  current_status text,
  power_load_kw numeric,
  warehouse_height numeric,
  loading_bays integer,
  floor_load_capacity numeric,
  has_three_phase_power boolean DEFAULT false,
  is_midc_plot boolean DEFAULT false,
  zoning_type text,
  plot_area numeric,
  plot_dimensions text,
  plot_shape text,
  road_width numeric,
  road_type text,
  has_na_order boolean DEFAULT false,
  fsi_available numeric,
  survey_number text,
  is_clear_title boolean DEFAULT true,
  floor_plan_url text,
  virtual_tour_url text,
  price_history_note text,
  open_house_date date,
  open_house_time_start text,
  open_house_time_end text,
  broker_personal_note text,
  listing_quality_score integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Photos
CREATE TABLE IF NOT EXISTS public.listing_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES public.listings(id) ON DELETE CASCADE,
  url text NOT NULL,
  storage_path text NOT NULL,
  order_index integer DEFAULT 0,
  is_hero boolean DEFAULT false,
  room_tag text DEFAULT 'general',
  created_at timestamptz DEFAULT now()
);

-- 4. Co-Broke Links
CREATE TABLE IF NOT EXISTS public.white_labeled_links (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    original_listing_id uuid REFERENCES public.listings(id) ON DELETE CASCADE,
    partner_user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    UNIQUE(original_listing_id, partner_user_id)
);

-- 5. Sessions & Events (Optional but useful for stats)
CREATE TABLE IF NOT EXISTS public.listing_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES public.listings(id) ON DELETE CASCADE,
  session_id text UNIQUE NOT NULL,
  device_type text,
  city text,
  started_at timestamptz DEFAULT now(),
  last_ping_at timestamptz DEFAULT now(),
  duration_seconds integer DEFAULT 0,
  photos_viewed integer DEFAULT 0,
  whatsapp_clicked boolean DEFAULT false,
  contact_clicked boolean DEFAULT false,
  is_hot_lead boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.listing_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES public.listings(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  event_type text NOT NULL,
  device_type text,
  city text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- 6. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.white_labeled_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_events ENABLE ROW LEVEL SECURITY;

-- 7. Policies (Re-create safely)
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Anyone can read white_labeled_links" ON white_labeled_links;
    CREATE POLICY "Anyone can read white_labeled_links" ON white_labeled_links FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "Authenticated users can insert white_labeled_links" ON white_labeled_links;
    CREATE POLICY "Authenticated users can insert white_labeled_links" ON white_labeled_links FOR INSERT WITH CHECK (auth.uid() = partner_user_id);

    DROP POLICY IF EXISTS "public live listings" ON listings;
    CREATE POLICY "public live listings" ON listings FOR SELECT USING (status = 'live');

    DROP POLICY IF EXISTS "own listings" ON listings;
    CREATE POLICY "own listings" ON listings FOR ALL USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "own profile" ON profiles;
    CREATE POLICY "own profile" ON profiles FOR ALL USING (auth.uid() = id);

    DROP POLICY IF EXISTS "insert own profile" ON profiles;
    CREATE POLICY "insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

    DROP POLICY IF EXISTS "public photos" ON listing_photos;
    CREATE POLICY "public photos" ON listing_photos FOR SELECT USING (true);
END $$;

-- 8. Functions
CREATE OR REPLACE FUNCTION public.generate_cobroke_link(p_listing_id uuid, p_partner_id uuid)
RETURNS json AS $$
DECLARE
    v_credits int;
    v_exists boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM white_labeled_links 
        WHERE original_listing_id = p_listing_id AND partner_user_id = p_partner_id
    ) INTO v_exists;

    IF v_exists THEN
        RETURN json_build_object('success', true, 'message', 'Link already exists');
    END IF;

    SELECT credits_remaining INTO v_credits FROM public.profiles WHERE id = p_partner_id;
    
    IF v_credits IS NULL OR v_credits < 1 THEN
        RETURN json_build_object('success', false, 'message', 'Insufficient credits');
    END IF;

    UPDATE public.profiles 
    SET credits_remaining = credits_remaining - 1 
    WHERE id = p_partner_id;

    INSERT INTO white_labeled_links (original_listing_id, partner_user_id)
    VALUES (p_listing_id, p_partner_id);

    RETURN json_build_object('success', true, 'message', 'Link generated successfully');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
