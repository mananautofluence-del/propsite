import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { session_id, listing_id, event_type, device_type, city, duration_seconds } = await req.json();

    if (event_type === 'ping') {
      // Update session duration
      const { data: session } = await supabase
        .from('listing_sessions')
        .select('whatsapp_clicked, contact_clicked')
        .eq('session_id', session_id)
        .single();

      const isHotLead = (duration_seconds || 0) > 300 && (session?.whatsapp_clicked || session?.contact_clicked);

      await supabase.from('listing_sessions')
        .update({ last_ping_at: new Date().toISOString(), duration_seconds, is_hot_lead: isHotLead })
        .eq('session_id', session_id);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Insert event
    await supabase.from('listing_events').insert({
      session_id, listing_id, event_type, device_type, city
    });

    if (event_type === 'page_view') {
      // Upsert session
      await supabase.from('listing_sessions').upsert({
        session_id, listing_id, device_type,
        started_at: new Date().toISOString(),
        last_ping_at: new Date().toISOString()
      }, { onConflict: 'session_id' });

      // Increment views
      await supabase.rpc('increment_views', { p_listing_id: listing_id });
    }

    if (event_type === 'whatsapp_click') {
      await supabase.from('listing_sessions')
        .update({ whatsapp_clicked: true })
        .eq('session_id', session_id);
    }

    if (event_type === 'call_click') {
      await supabase.from('listing_sessions')
        .update({ contact_clicked: true })
        .eq('session_id', session_id);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Track event error:', error);
    return new Response(JSON.stringify({ error: 'Failed to track event' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
