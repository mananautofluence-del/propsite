// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import satori from "https://esm.sh/satori@0.10.11";
import { Resvg, initWasm } from "https://esm.sh/@resvg/resvg-wasm@3.1.4";

// Initialize WASM for Resvg (required in Edge Runtime)
const resvgWasm = fetch("https://unpkg.com/@resvg/resvg-wasm@3.1.4/index_bg.wasm");
let wasmInitPromise: Promise<void> | null = null;
const initWasmOnce = async () => {
  if (!wasmInitPromise) {
    wasmInitPromise = resvgWasm.then((res) => initWasm(res)).catch((e) => {
      console.error("WASM init failed", e);
      throw e;
    });
  }
  return wasmInitPromise;
};

// Fetch Fonts
const fontRegularUrl = "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-400-normal.woff";
const fontBoldUrl = "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-700-normal.woff";

let _fontRegularBuffer: ArrayBuffer | null = null;
let _fontBoldBuffer: ArrayBuffer | null = null;

async function getFonts() {
  if (!_fontRegularBuffer || !_fontBoldBuffer) {
    const [regRes, boldRes] = await Promise.all([
      fetch(fontRegularUrl),
      fetch(fontBoldUrl),
    ]);
    _fontRegularBuffer = await regRes.arrayBuffer();
    _fontBoldBuffer = await boldRes.arrayBuffer();
  }
  return { fontRegular: _fontRegularBuffer, fontBold: _fontBoldBuffer };
}

serve(async (req: Request) => {
  try {
    const url = new URL(req.url);
    const listingId = url.searchParams.get("listing_id");

    if (!listingId) {
      return new Response("Missing listing_id", { status: 400 });
    }

    // Initialize Supabase Client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch Listing Data
    const { data: listing, error } = await supabase
      .from("listings")
      .select("headline, locality, city, price, monthly_rent, transaction_type, bhk_config, carpet_area, furnishing_status")
      .eq("id", listingId)
      .single();

    if (error || !listing) {
      return new Response("Listing not found", { status: 404 });
    }

    // Fetch Hero Photo
    const { data: photos } = await supabase
      .from("listing_photos")
      .select("url, is_hero")
      .eq("listing_id", listingId)
      .order("order_index");

    let heroUrl = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"; // Fallback hero
    if (photos && photos.length > 0) {
      const heroPhoto = photos.find((p: any) => p.is_hero) || photos[0];
      heroUrl = heroPhoto.url;
    }

    // Format Data
    let displayPrice = "";
    if (listing.price && listing.price > 0) {
      if (listing.price >= 10000000) {
        displayPrice = `₹${(listing.price / 10000000).toFixed(2).replace(/\.00$/, "").replace(/0$/, "")} Cr`;
      } else if (listing.price >= 100000) {
        displayPrice = `₹${(listing.price / 100000).toFixed(2).replace(/\.00$/, "").replace(/0$/, "")} L`;
      } else {
        displayPrice = `₹${listing.price.toLocaleString("en-IN")}`;
      }
    } else if (listing.monthly_rent && listing.monthly_rent > 0) {
      displayPrice = `₹${listing.monthly_rent.toLocaleString("en-IN")}/mo`;
    } else {
      displayPrice = "Price on Request";
    }

    const { fontRegular, fontBold } = await getFonts();
    await initWasmOnce();

    // Satori SVG Generation (React Element syntax simulation via object literal)
    const svg = await satori(
      {
        type: "div",
        props: {
          style: {
            display: "flex",
            width: "1200px",
            height: "630px",
            backgroundColor: "#ffffff",
            backgroundImage: `url(${heroUrl})`,
            backgroundSize: "1200px 630px",
            backgroundPosition: "center",
            fontFamily: "Inter",
            position: "relative",
          },
          children: [
            {
              type: "div",
              props: {
                style: {
                  position: "absolute",
                  bottom: 0,
                  left: "90px",
                  right: "90px",
                  height: "300px",
                  backgroundColor: "#ffffff",
                  borderTopLeftRadius: "32px",
                  borderTopRightRadius: "32px",
                  display: "flex",
                  flexDirection: "column",
                  padding: "40px",
                  boxShadow: "0 -10px 40px rgba(0, 0, 0, 0.1)",
                },
                children: [
                  // Top PIN + Locality
                  {
                    type: "div",
                    props: {
                      style: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" },
                      children: [
                        {
                          type: "div",
                          props: {
                            style: { color: "#ef4444", fontSize: "20px", display: "flex" },
                            children: "📍",
                          },
                        },
                        {
                          type: "div",
                          props: {
                            style: {
                              fontSize: "18px",
                              color: "#888888",
                              fontWeight: 700,
                              letterSpacing: "0.1em",
                              textTransform: "uppercase",
                            },
                            children: `${listing.locality}, ${listing.city}`,
                          },
                        },
                      ],
                    },
                  },
                  // Middle: Title
                  {
                    type: "div",
                    props: {
                      style: {
                        fontSize: "46px",
                        fontWeight: 700,
                        color: "#111111",
                        lineHeight: 1.2,
                        marginBottom: "16px",
                        width: "100%",
                      },
                      children: listing.headline?.length > 45 ? listing.headline.slice(0, 45) + "..." : listing.headline,
                    },
                  },
                  // Price row
                  {
                    type: "div",
                    props: {
                      style: { display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" },
                      children: [
                        {
                          type: "div",
                          props: {
                            style: {
                              fontSize: "42px",
                              fontWeight: 700,
                              color: "#1A5C3A",
                            },
                            children: displayPrice,
                          },
                        },
                        {
                          type: "div",
                          props: {
                            style: {
                              backgroundColor: "#EAF3ED",
                              color: "#1A5C3A",
                              padding: "6px 16px",
                              borderRadius: "40px",
                              fontSize: "16px",
                              fontWeight: 700,
                            },
                            children: "Negotiable",
                          },
                        },
                      ],
                    },
                  },
                  // Bottom Chips
                  {
                    type: "div",
                    props: {
                      style: { display: "flex", gap: "12px", width: "100%", alignItems: "center" },
                      children: [
                        listing.bhk_config && {
                          type: "div",
                          props: {
                            style: {
                              backgroundColor: "#F5F5F5",
                              color: "#333333",
                              padding: "10px 20px",
                              borderRadius: "40px",
                              fontSize: "20px",
                              fontWeight: 500,
                            },
                            children: listing.bhk_config,
                          },
                        },
                        listing.carpet_area && {
                          type: "div",
                          props: {
                            style: {
                              backgroundColor: "#F5F5F5",
                              color: "#333333",
                              padding: "10px 20px",
                              borderRadius: "40px",
                              fontSize: "20px",
                              fontWeight: 500,
                            },
                            children: `${listing.carpet_area} sq ft`,
                          },
                        },
                        listing.furnishing_status && {
                          type: "div",
                          props: {
                            style: {
                              backgroundColor: "#F5F5F5",
                              color: "#333333",
                              padding: "10px 20px",
                              borderRadius: "40px",
                              fontSize: "20px",
                              fontWeight: 500,
                            },
                            children: String(listing.furnishing_status).replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                          },
                        },
                      ].filter(Boolean),
                    },
                  },
                ],
              },
            },
          ],
        },
      },
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: "Inter",
            data: fontRegular,
            weight: 400,
            style: "normal",
          },
          {
            name: "Inter",
            data: fontBold,
            weight: 700,
            style: "normal",
          },
        ],
      }
    );

    // Render SVG precisely to PNG
    const resvg = new Resvg(svg, {
      fitTo: {
        mode: "width",
        value: 1200,
      },
      font: {
        loadSystemFonts: false,
      },
    });

    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    return new Response(pngBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err: any) {
    console.error("OG Image Generater Error:", err);
    return new Response("Internal Server Error: " + err.message, { status: 500 });
  }
});
