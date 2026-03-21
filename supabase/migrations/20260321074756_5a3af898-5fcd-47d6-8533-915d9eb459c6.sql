
-- Profiles table
CREATE TABLE public.profiles (
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

-- Listings table
CREATE TABLE public.listings (
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
  -- Commercial/Industrial/Plot fields
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

-- Listing photos
CREATE TABLE public.listing_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES public.listings(id) ON DELETE CASCADE,
  url text NOT NULL,
  storage_path text NOT NULL,
  order_index integer DEFAULT 0,
  is_hero boolean DEFAULT false,
  room_tag text DEFAULT 'general',
  created_at timestamptz DEFAULT now()
);

-- Listing sessions
CREATE TABLE public.listing_sessions (
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

-- Listing events
CREATE TABLE public.listing_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES public.listings(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  event_type text NOT NULL,
  device_type text,
  city text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Collections
CREATE TABLE public.collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  temp_token text,
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  listing_ids text[] NOT NULL,
  listing_order integer[] DEFAULT '{}',
  status text DEFAULT 'live',
  expiry_date date,
  total_views integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Leads
CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES public.listings(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id text,
  name text,
  phone text,
  email text,
  contacted boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Notifications
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Credits transactions
CREATE TABLE public.credits_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  amount_paid numeric,
  razorpay_payment_id text,
  credits_added integer,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credits_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "own listings" ON public.listings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "public live listings" ON public.listings FOR SELECT USING (status = 'live');
CREATE POLICY "temp listings" ON public.listings FOR SELECT USING (temp_token IS NOT NULL);
CREATE POLICY "anon insert listings" ON public.listings FOR INSERT WITH CHECK (true);
CREATE POLICY "own photos" ON public.listing_photos FOR ALL USING (listing_id IN (SELECT id FROM public.listings WHERE user_id = auth.uid()));
CREATE POLICY "public photos" ON public.listing_photos FOR SELECT USING (listing_id IN (SELECT id FROM public.listings WHERE status = 'live'));
CREATE POLICY "anon insert photos" ON public.listing_photos FOR INSERT WITH CHECK (true);
CREATE POLICY "public insert events" ON public.listing_events FOR INSERT WITH CHECK (true);
CREATE POLICY "public insert sessions" ON public.listing_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "public update sessions" ON public.listing_sessions FOR UPDATE USING (true);
CREATE POLICY "read own events" ON public.listing_events FOR SELECT USING (listing_id IN (SELECT id FROM public.listings WHERE user_id = auth.uid()));
CREATE POLICY "own collections" ON public.collections FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "public collections" ON public.collections FOR SELECT USING (status = 'live');
CREATE POLICY "own leads" ON public.leads FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own credits" ON public.credits_transactions FOR ALL USING (auth.uid() = user_id);

-- Profile insert policy for new signups
CREATE POLICY "insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Storage bucket for listing photos
INSERT INTO storage.buckets (id, name, public) VALUES ('listing-photos', 'listing-photos', true);

CREATE POLICY "Public read listing photos" ON storage.objects FOR SELECT USING (bucket_id = 'listing-photos');
CREATE POLICY "Anyone can upload listing photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'listing-photos');
CREATE POLICY "Users can delete own listing photos" ON storage.objects FOR DELETE USING (bucket_id = 'listing-photos');

-- Increment views function
CREATE OR REPLACE FUNCTION public.increment_views(p_listing_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE listings SET total_views = total_views + 1 WHERE id = p_listing_id;
$$;

-- Auto-create profile on signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
