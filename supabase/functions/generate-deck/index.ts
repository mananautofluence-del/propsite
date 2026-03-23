// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { details, tags, themeId } = await req.json()

    // Mock API token grab (In real prod, use Deno.env.get('OPENAI_API_KEY'))
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    // We are simulating the "cost-saving AI generation strategy".
    // 1. Avoid image vision processing (We don't send image URLs to GPT-4V, just text tags).
    // 2. We use a cheaper text-based model (e.g., gpt-3.5-turbo or 4o-mini).
    
    // This prompt enforces strict JSON schema adherence mapped perfectly to `PresentationData`
    const systemPrompt = `You are a world-class real estate copywriter.
    Create a highly premium, structured pitch deck for a ${details.propertyType} based ONLY on these details and image tags.
    DO NOT hallucinate excessive features not implied by the provided data.
    
    Input Details: ${JSON.stringify(details)}
    Image Tags Available: ${JSON.stringify(tags)}
    Target Theme Aesthetic: ${themeId}

    Return EXACTLY a JSON object matching this TypeScript interface (no markdown formatting, just pure JSON):
    {
      "title": "string (premium sounding)",
      "subtitle": "string (catchy one liner)",
      "location": "string",
      "price": "string",
      "propertyType": "string",
      "bedrooms": "string",
      "bathrooms": "string",
      "area": "string",
      "lotSize": "string",
      "yearBuilt": "string",
      "parking": "string",
      "description": "string (2-3 sentences of compelling luxury copy)",
      "features": ["string (max 6 key features)"]
    }`;

    let generatedData = {};

    if (openAIApiKey) {
      // Real API Call
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini', // Cost saving model
          messages: [{ role: 'user', content: systemPrompt }],
          response_format: { type: 'json_object' }
        }),
      });
      
      const data = await response.json();
      generatedData = JSON.parse(data.choices[0].message.content);
    } else {
      // Fallback Mock generation if no key exists yet
      generatedData = {
        title: `The ${details.title || 'Residences'} Collection`,
        subtitle: 'An exceptional property opportunity curated for you',
        location: details.location || 'Prime Location',
        price: details.price || 'Price on Request',
        propertyType: details.propertyType || 'Property',
        bedrooms: details.bedrooms || '-',
        bathrooms: details.bathrooms || '-',
        area: details.area || '-',
        lotSize: details.lotSize || '-',
        yearBuilt: details.yearBuilt || '-',
        parking: details.parking || '-',
        description: `This stunning ${details.propertyType} located in ${details.location} offers unparalleled luxury. Surrounded by premium amenities, it represents the epitome of modern living.`,
        features: tags.length > 0 ? tags.map((t: string) => `Premium ${t.replace('_', ' ')}`) : ['High Ceilings', 'Smart Home Tech', 'Premium Finishes', 'Panoramic Views']
      };
    }

    // Append Broker info identically as passed, since AI doesn't need to invent it
    const finalData = {
      ...generatedData,
      brokerName: details.brokerName || 'Alex Mercer',
      brokerTitle: details.brokerTitle || 'Senior Vice President',
      brokerAgency: details.brokerAgency || 'PropSite Elite',
      brokerPhone: details.brokerPhone || '+1 (555) 012-3456',
      brokerEmail: details.brokerEmail || 'alex@propsite.com',
      brokerRera: details.brokerRera || 'RERA-12345678',
    };

    return new Response(JSON.stringify(finalData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
