interface Env {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_PUBLISHABLE_KEY: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { env, params, next } = context;
  const slug = params.slug as string;

  // Fetch the generic index.html
  const response = await next();
  
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("text/html")) {
    return response;
  }

  const supabaseUrl = env.VITE_SUPABASE_URL || "https://mtyzpfqzqynkavpzpaxm.supabase.co";
  const supabaseKey = env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10eXpwZnF6cXlua2F2cHpwYXhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwNjk1NTIsImV4cCI6MjA4OTY0NTU1Mn0.PiO5Tw1lG7Y91YgPcJkVh1JjWbjHmDSntZxcWAWEpi4";

  try {
    const apiRes = await fetch(`${supabaseUrl}/rest/v1/listings?slug=eq.${slug}&select=*`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    if (apiRes.ok) {
      const listings = (await apiRes.json()) as any[];
      if (listings && Array.isArray(listings) && listings.length > 0) {
        const listing = listings[0];
        
        const photoRes = await fetch(`${supabaseUrl}/rest/v1/listing_photos?listing_id=eq.${listing.id}&order=order_index.asc&select=*`, {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        });
        
        let heroPhotoUrl = "";
        if (photoRes.ok) {
          const photos = (await photoRes.json()) as any[];
          const heroPhoto = Array.isArray(photos) ? (photos.find(p => p.is_hero) || photos[0]) : null;
          if (heroPhoto) heroPhotoUrl = heroPhoto.url;
        }

        const title = listing.headline || 'PropSite Listing';
        const desc = (listing.ai_description || 'View this premium property on PropSite.').slice(0, 150);
        const image = heroPhotoUrl;

        let rewriter = new HTMLRewriter()
          .on('title', { element(e) { e.setInnerContent(title); } })
          .on('meta[property="og:title"], meta[name="twitter:title"]', { 
            element(e) { e.setAttribute("content", title); } 
          })
          .on('meta[property="og:description"], meta[name="twitter:description"]', { 
            element(e) { e.setAttribute("content", desc); } 
          });

        if (image) {
          rewriter = rewriter.on('head', {
            element(e) {
              e.append(`<meta property="og:image" content="${image}" />`, { html: true });
              e.append(`<meta name="twitter:image" content="${image}" />`, { html: true });
            }
          });
        }

        return rewriter.transform(response);
      }
    }
  } catch (err) {
    // Silently fail and return the original generic HTML
    console.error("Error fetching listing for OG tags:", err);
  }

  return response;
};
