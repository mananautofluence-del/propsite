CREATE TABLE IF NOT EXISTS presentations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id uuid REFERENCES listings(id) ON DELETE SET NULL,
  title text NOT NULL DEFAULT '',
  theme text NOT NULL DEFAULT 'signature',
  format text NOT NULL DEFAULT 'square',
  content jsonb NOT NULL DEFAULT '{}',
  photo_urls text[] NOT NULL DEFAULT '{}',
  photo_tags text[] NOT NULL DEFAULT '{}',
  pages text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft',
  pdf_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE presentations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own presentations"
ON presentations FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
