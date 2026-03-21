-- Allow listing owners to read sessions for their listings (dashboard activity feed)
CREATE POLICY "own listing sessions read"
ON public.listing_sessions
FOR SELECT
USING (
  listing_id IN (SELECT id FROM public.listings WHERE user_id = auth.uid())
);
