-- 1. Create the table
CREATE TABLE IF NOT EXISTS white_labeled_links (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    original_listing_id uuid REFERENCES listings(id) ON DELETE CASCADE,
    partner_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    UNIQUE(original_listing_id, partner_user_id)
);

-- 2. Enable RLS
ALTER TABLE white_labeled_links ENABLE ROW LEVEL SECURITY;

-- 3. Create Policies
CREATE POLICY "Anyone can read white_labeled_links" 
ON white_labeled_links FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert white_labeled_links" 
ON white_labeled_links FOR INSERT 
WITH CHECK (auth.uid() = partner_user_id);

-- 4. Create the RPC function for credit deduction and link generation
CREATE OR REPLACE FUNCTION generate_cobroke_link(p_listing_id uuid, p_partner_id uuid)
RETURNS json AS $$
DECLARE
    v_credits int;
    v_exists boolean;
BEGIN
    -- Check if link already exists
    SELECT EXISTS (
        SELECT 1 FROM white_labeled_links 
        WHERE original_listing_id = p_listing_id AND partner_user_id = p_partner_id
    ) INTO v_exists;

    IF v_exists THEN
        RETURN json_build_object('success', true, 'message', 'Link already exists');
    END IF;

    -- Get current credits
    SELECT credits_remaining INTO v_credits FROM profiles WHERE id = p_partner_id;
    
    IF v_credits IS NULL OR v_credits < 1 THEN
        RETURN json_build_object('success', false, 'message', 'Insufficient credits');
    END IF;

    -- Deduct credit
    UPDATE profiles 
    SET credits_remaining = credits_remaining - 1 
    WHERE id = p_partner_id;

    -- Insert link
    INSERT INTO white_labeled_links (original_listing_id, partner_user_id)
    VALUES (p_listing_id, p_partner_id);

    RETURN json_build_object('success', true, 'message', 'Link generated successfully');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
