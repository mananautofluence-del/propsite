const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { broker_notes, photo_urls } = await req.json();

    if (!broker_notes || broker_notes.trim().length < 5) {
      return new Response(JSON.stringify({ error: 'Please describe the property' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'AI service not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const prompt = `You are an expert Indian real estate listing assistant. Extract property details from this broker message and return ONLY a valid JSON object, no explanation, no markdown.

Indian number formats: 32L = ₹32 Lakh = 3200000, 3.2Cr = ₹3.2 Crore = 32000000.
Indian terms: carpet area, BHK, ready possession, OC received, RERA, semi-furnished, fully furnished.

Broker message: "${broker_notes}"

Return this exact JSON structure (use null for unknown fields):
{
  "headline": "compelling listing headline max 70 chars",
  "property_type": "Apartment or Villa or Plot or Office or Shop or Warehouse or Studio or Penthouse",
  "transaction_type": "sale or rent or lease or null",
  "price": null,
  "monthly_rent": null,
  "price_negotiable": null,
  "bhk_config": "1 RK or 1 BHK or 2 BHK or 3 BHK or 4 BHK or 4+ BHK or Studio or null",
  "carpet_area": null,
  "builtup_area": null,
  "floor_number": null,
  "total_floors": null,
  "property_age": null,
  "possession_status": "Ready to Move or Under Construction or Nearing Possession or null",
  "building_name": null,
  "locality": null,
  "city": null,
  "pincode": null,
  "facing_direction": null,
  "parking_car": 0,
  "parking_two_wheeler": 0,
  "furnishing_status": "unfurnished or semi-furnished or fully-furnished or null",
  "balcony_count": 0,
  "bathroom_count": 1,
  "has_servant_room": false,
  "has_study_room": false,
  "has_pooja_room": false,
  "has_store_room": false,
  "amenities": [],
  "ai_description": "120-140 word premium property description for affluent Indian buyers",
  "ai_highlights": ["5 specific key highlights as short phrases"],
  "rera_number": null,
  "ai_neighbourhood_highlights": [],
  "missing_questions": []
}

IMPORTANT: Only add a field to missing_questions if its extracted value is strictly null. If you extracted ANY value — even a guess — do NOT include it. Maximum 4 questions. Priority: transaction_type, price_negotiable, furnishing_status, possession_status, parking_car.
Each missing_questions item: {"field":"field_name","question":"Question?","options":[{"label":"Display","value":"stored_value"}]}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a JSON-only assistant. Return ONLY valid JSON, no markdown, no explanation.' },
          { role: 'user', content: prompt }
        ],
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('AI Gateway error:', response.status, err);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limited, please try again in a moment' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      return new Response(JSON.stringify({ error: 'AI generation failed' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const result = JSON.parse(cleaned);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Generate listing error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate listing details' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
