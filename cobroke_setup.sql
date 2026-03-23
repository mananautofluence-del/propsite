-- CLEAN CO-BROKE SETUP SCRIPT
-- Please CLEAR your Supabase SQL editor completely before running this.

-- Create table
CREATE TABLE IF NOT EXISTS public.white_labeled_links (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    original_listing_id uuid,
    partner_user_id uuid,
    created_at timestamptz DEFAULT now(),
    UNIQUE(original_listing_id, partner_user_id)
);

-- Add constraints safely
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_original_listing') THEN
        ALTER TABLE white_labeled_links 
        ADD CONSTRAINT fk_original_listing 
        FOREIGN KEY (original_listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_partner_user') THEN
        ALTER TABLE white_labeled_links 
        ADD CONSTRAINT fk_partner_user 
        FOREIGN KEY (partner_user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Enable RLS
ALTER TABLE white_labeled_links ENABLE ROW LEVEL SECURITY;

-- Create Policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can read white_labeled_links' AND tablename = 'white_labeled_links') THEN
        CREATE POLICY "Anyone can read white_labeled_links" 
        ON white_labeled_links FOR SELECT 
        USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can insert white_labeled_links' AND tablename = 'white_labeled_links') THEN
        CREATE POLICY "Authenticated users can insert white_labeled_links" 
        ON white_labeled_links FOR INSERT 
        WITH CHECK (auth.uid() = partner_user_id);
    END IF;
END $$;

-- Create RPC function
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
