// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { slides } = await req.json();
    // slides is an array of { html: string, backgroundColor: string }
    // Each html is a self-contained HTML document for one slide

    // Use Browserless (free tier available) OR Deno's built-in screenshot
    // We use a simple fetch to a headless Chrome service
    // For Supabase Edge Functions, we use the puppeteer-core approach
    // via a remote browser endpoint

    const BROWSERLESS_TOKEN = Deno.env.get('BROWSERLESS_TOKEN');
    
    const slideImages: string[] = [];

    for (const slide of slides) {
      if (BROWSERLESS_TOKEN) {
        // Production: use Browserless.io (free tier: 1000 units/month)
        const response = await fetch(
          `https://chrome.browserless.io/screenshot?token=${BROWSERLESS_TOKEN}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              html: slide.html,
              options: {
                type: 'jpeg',
                quality: 95,
                clip: { x: 0, y: 0, width: 1456, height: 816 },
              },
              viewport: {
                width: 1456,
                height: 816,
                deviceScaleFactor: 1,
              },
              gotoOptions: {
                waitUntil: 'networkidle2',
                timeout: 30000,
              },
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Screenshot failed: ${await response.text()}`);
        }

        const imageBuffer = await response.arrayBuffer();
        
        // Safely convert to base64 without blowing the V8 call stack
        const bytes = new Uint8Array(imageBuffer);
        let binary = '';
        for (let j = 0; j < bytes.byteLength; j++) {
          binary += String.fromCharCode(bytes[j]);
        }
        const base64 = btoa(binary);
        slideImages.push(`data:image/jpeg;base64,${base64}`);
      } else {
        // Fallback: return placeholder so client knows token is missing
        slideImages.push('NO_TOKEN');
      }
    }

    return new Response(
      JSON.stringify({ images: slideImages }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Export error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
