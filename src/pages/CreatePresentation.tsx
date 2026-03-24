import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { PresentationPhoto, GenerativePresentation } from '@/lib/presentationTypes';
import { Camera, Loader2, Sparkles, X, Plus, Upload } from 'lucide-react';
import { toast } from 'sonner';

export default function CreatePresentation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialListingId = searchParams.get('listing_id');

  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  const [description, setDescription] = useState('');

  const [brokerProfile, setBrokerProfile] = useState<{
    fullName: string; phone: string; agencyName: string; reraNumber: string;
  }>({ fullName: '', phone: '', agencyName: '', reraNumber: '' });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('');

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => {
      if (data) {
        setBrokerProfile({
          fullName: data.full_name || '',
          phone: data.phone || '',
          agencyName: data.agency_name || '',
          reraNumber: data.rera_number || ''
        });
      }
    });
    if (initialListingId) {
      supabase.from('listings').select('*, listing_photos(url)').eq('id', initialListingId).single().then(({ data }) => {
        if (data) {
          setDescription(`${data.headline || ''}\n${data.ai_description || ''}\n${data.locality || ''}, ${data.city || ''}\n${data.price ? `₹${data.price}` : ''}`);
        }
      });
    }
  }, [user, initialListingId]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter(f => f.type.startsWith('image/') && f.size <= 10 * 1024 * 1024);
      setPhotos(prev => [...prev, ...newFiles].slice(0, 20));
      setPhotoPreviewUrls(prev => [...prev, ...newFiles.map(f => URL.createObjectURL(f))].slice(0, 20));
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = error => reject(error);
    });
  };

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast.error('Please add a property description');
      return;
    }

    setIsGenerating(true);
    setGenerationStatus('Reading your property details...');

    try {
      const CLAUDE_KEY = import.meta.env.VITE_CLAUDE_API_KEY;
      if (!CLAUDE_KEY) throw new Error('Claude API key not found. Set VITE_CLAUDE_API_KEY in your .env file.');

      // 1. Upload photos & AI-tag them
      setGenerationStatus('Processing photos...');
      const taggedPhotos: PresentationPhoto[] = [];
      const SMART_TAGS = ['cover', 'living', 'bedroom', 'kitchen', 'bathroom', 'balcony', 'exterior', 'amenity'];

      for (let i = 0; i < photos.length; i++) {
        const file = photos[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${i}.${fileExt}`;
        const filePath = `${user?.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('listing-photos')
          .upload(filePath, file);

        let publicUrl = '';
        if (!uploadError) {
          const { data: { publicUrl: url } } = supabase.storage
            .from('listing-photos')
            .getPublicUrl(filePath);
          publicUrl = url;
        } else {
          publicUrl = photoPreviewUrls[i] || '';
        }

        // Smart sequential tagging — no AI call needed, instant
        const tag = i < SMART_TAGS.length ? SMART_TAGS[i] : 'other';
        taggedPhotos.push({ url: publicUrl, tag, orderIndex: i });
      }

      // 2. Generate Presentation with Claude Art Director
      setGenerationStatus('AI is designing your slides...');

      const SYSTEM_PROMPT = `You are a luxury Indian real estate Art Director. You read property descriptions and design stunning visual presentations.

OUTPUT: Return ONLY a valid JSON object matching this exact TypeScript interface (no markdown, no explanation, JUST the JSON):

interface GenerativePresentation {
  theme: {
    backgroundColor: string;  // Hex like "#0A0A0A"
    textColor: string;         // Hex like "#F0EDE8"
    accentColor: string;       // Hex like "#C9A96E"
    headingFont: string;       // Google Font name like "Playfair Display"
    bodyFont: string;          // Google Font name like "Inter"
  };
  slides: Array<{
    id: string;                 // Unique like "slide-1"
    layout: "hero-cover" | "split-left-image" | "split-right-image" | "features-grid" | "full-gallery" | "contact-card";
    headline?: string;
    subheadline?: string;
    bodyText?: string;
    bulletPoints?: string[];
    stats?: Array<{ label: string; value: string }>;
    imageTags: string[];       // Which photo tags to use: ["cover"], ["living", "kitchen"], etc
    contactInfo?: { name: string; phone: string; agency: string; rera: string };
  }>;
}

RULES:
1. Generate between 4-8 slides based on how much content the user provides. NEVER generate empty slides.
2. First slide MUST be "hero-cover" layout. Last slide MUST be "contact-card" layout.
3. Pick theme colors + Google Fonts that match the property's vibe:
   - Luxury penthouse (₹5Cr+) → Dark backgrounds (#0A0A0A), gold accents (#C9A96E), Playfair Display
   - Standard apartments → Clean white (#FFFFFF), green accents (#1A5C3A), Inter font
   - Villas/plots → Warm cream (#F5F0E8), sage accents (#6B8F71), Cormorant Garamond
   - Commercial → Navy (#0F172A), blue accents (#3B82F6), bold Inter
4. Distribute imageTags logically: hero gets "cover", overview gets "living", specs gets "bedroom"/"kitchen", gallery gets multiple tags.
5. Keep text premium and concise. Headlines max 6 words. Body text max 60 words.
6. stats should have max 4 items with short labels and values (e.g., {label: "Area", value: "2,400 sq ft"}).
7. bulletPoints should have 4-6 items max, each under 10 words.`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': CLAUDE_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4000,
          system: SYSTEM_PROMPT,
          messages: [{
            role: 'user',
            content: `Design a property presentation for this listing.

Property description: "${description}"

Broker: ${brokerProfile.fullName || 'Not provided'}
Phone: ${brokerProfile.phone || 'Not provided'}
Agency: ${brokerProfile.agencyName || 'Not provided'}
RERA: ${brokerProfile.reraNumber || 'Not provided'}

Available photo tags: ${taggedPhotos.map(p => p.tag).join(', ') || 'cover'}

Return ONLY valid JSON. No markdown. No \`\`\`json blocks. Just the raw JSON object.`
          }]
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Claude API failed (${response.status}): ${errText}`);
      }

      const result = await response.json();
      const rawText = result.content?.[0]?.text || '';
      console.log('CLAUDE RAW JSON:', rawText);

      // Clean and parse
      const cleanJson = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      let presentation: GenerativePresentation;
      try {
        presentation = JSON.parse(cleanJson);
      } catch (parseErr) {
        console.error('JSON parse failed:', cleanJson);
        throw new Error('AI returned invalid JSON. Please try again.');
      }

      // Validate
      if (!presentation.theme || !presentation.slides || presentation.slides.length === 0) {
        throw new Error('AI returned incomplete data. Please try again.');
      }

      // 3. Save to localStorage
      setGenerationStatus('Saving your presentation...');
      const presentationId = crypto.randomUUID();
      const stored = {
        id: presentationId,
        user_id: user?.id || null,
        title: presentation.slides[0]?.headline || 'Property Presentation',
        presentation: presentation,
        photo_urls: taggedPhotos.map(p => p.url),
        photo_tags: taggedPhotos.map(p => p.tag),
        created_at: new Date().toISOString(),
        status: 'live'
      };

      const existing = JSON.parse(localStorage.getItem('propsite_presentations') || '[]');
      existing.push(stored);
      localStorage.setItem('propsite_presentations', JSON.stringify(existing));

      toast.success('Presentation created!');
      navigate(`/dashboard/presentations/${presentationId}`);

    } catch (error: any) {
      console.error('Generation error:', error);
      toast.error(error.message || 'Failed to generate presentation');
      setIsGenerating(false);
    }
  };

  // === RENDER ===

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 font-sans">
        <div className="w-12 h-12 rounded-full border-[3px] border-[#EBEBEB] border-t-[#1A5C3A] animate-spin mb-6" />
        <p className="text-[16px] text-[#555555] font-medium text-center">{generationStatus}</p>
        <div className="w-[240px] h-1 bg-[#EBEBEB] mt-6 overflow-hidden">
          <div className="h-full bg-[#1A5C3A] animate-[progress_12s_ease-in-out_forwards]" />
        </div>
        <style>{`@keyframes progress { 0% { width: 0% } 100% { width: 95% } }`}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col pb-24">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#EBEBEB] bg-white sticky top-0 md:top-14 z-20">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-bold text-[#111111]">Create Presentation</h1>
            <p className="text-[13px] text-[#888888]">AI will design your slides automatically</p>
          </div>
          <Sparkles size={20} className="text-[#1A5C3A]" />
        </div>
      </div>

      <div className="flex-1 max-w-2xl mx-auto w-full p-5 space-y-8">

        {/* PHOTOS */}
        <div>
          <h2 className="text-[16px] font-bold text-[#111111] mb-3 flex items-center gap-2">
            <Camera size={18} className="text-[#1A5C3A]" /> Property Photos
          </h2>
          {photoPreviewUrls.length === 0 ? (
            <label className="flex flex-col items-center justify-center h-[160px] border-2 border-dashed border-[#DDDCDC] rounded-2xl cursor-pointer hover:border-[#1A5C3A] hover:bg-[#F6FAF7] transition-colors">
              <Upload size={28} className="text-[#BBBBBB] mb-2" />
              <span className="text-[14px] font-medium text-[#555555]">Upload property photos</span>
              <span className="text-[12px] text-[#AAAAAA] mt-1">JPG, PNG up to 10MB</span>
              <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
          ) : (
            <div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-2">
                {photoPreviewUrls.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    {i === 0 && (
                      <div className="absolute top-1.5 left-1.5 bg-[#1A5C3A] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">Cover</div>
                    )}
                    <button onClick={() => removePhoto(i)} className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <label className="aspect-square rounded-xl border-2 border-dashed border-[#DDDCDC] flex items-center justify-center cursor-pointer hover:border-[#1A5C3A] transition-colors">
                  <Plus size={20} className="text-[#BBBBBB]" />
                  <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* DESCRIPTION */}
        <div>
          <h2 className="text-[16px] font-bold text-[#111111] mb-3">Property Description</h2>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full min-h-[180px] border border-[#DDDCDC] rounded-xl px-4 py-3 text-[14px] text-[#111111] focus:outline-none focus:border-[#1A5C3A] focus:ring-1 focus:ring-[#1A5C3A] resize-y leading-relaxed"
            placeholder={"Describe your property in detail:\n\n• Location, floor, facing\n• BHK, carpet area, price\n• Furnishing, parking, possession\n• Key features — sea view, terrace, etc.\n• Amenities — gym, pool, security\n\nExample: Luxurious 3BHK sea-facing flat in Worli,\n14th floor, 2400 sqft carpet, ₹5.2Cr negotiable,\n2 parking, fully furnished, ready possession"}
          />
          <p className="text-[11px] text-[#AAAAAA] mt-1.5">✦ AI will auto-design slides, colors, and fonts based on this</p>
        </div>

        {/* BROKER PROFILE */}
        <div>
          <h2 className="text-[16px] font-bold text-[#111111] mb-3">Your Details (Contact Slide)</h2>
          <div className="grid grid-cols-2 gap-3">
            <input value={brokerProfile.fullName} onChange={e => setBrokerProfile(p => ({ ...p, fullName: e.target.value }))}
              className="border border-[#DDDCDC] rounded-lg h-11 px-3 text-[14px] focus:outline-none focus:border-[#1A5C3A]" placeholder="Your Name" />
            <input value={brokerProfile.phone} onChange={e => setBrokerProfile(p => ({ ...p, phone: e.target.value }))}
              className="border border-[#DDDCDC] rounded-lg h-11 px-3 text-[14px] focus:outline-none focus:border-[#1A5C3A]" placeholder="Phone" />
            <input value={brokerProfile.agencyName} onChange={e => setBrokerProfile(p => ({ ...p, agencyName: e.target.value }))}
              className="border border-[#DDDCDC] rounded-lg h-11 px-3 text-[14px] focus:outline-none focus:border-[#1A5C3A]" placeholder="Agency Name" />
            <input value={brokerProfile.reraNumber} onChange={e => setBrokerProfile(p => ({ ...p, reraNumber: e.target.value }))}
              className="border border-[#DDDCDC] rounded-lg h-11 px-3 text-[14px] focus:outline-none focus:border-[#1A5C3A]" placeholder="RERA Number" />
          </div>
        </div>

        {/* GENERATE BUTTON */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !description.trim()}
          className="w-full bg-[#1A5C3A] hover:bg-[#14482D] disabled:opacity-40 disabled:cursor-not-allowed text-white text-[16px] font-bold h-[52px] rounded-[14px] flex items-center justify-center gap-2 transition-colors shadow-lg shadow-[#1A5C3A]/20"
        >
          <Sparkles size={18} /> Generate with AI
        </button>
      </div>
    </div>
  );
}
