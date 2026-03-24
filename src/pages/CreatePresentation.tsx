import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { PresentationPhoto, GenerativePresentation, ThemeConfig } from '@/lib/presentationTypes';
import { Camera, Loader2, Sparkles, X, Plus, Upload, ArrowLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import ThemeSelectionStep from '@/components/ThemeSelectionStep';

export default function CreatePresentation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialListingId = searchParams.get('listing_id');

  // Flow: step 1 = description/photos, step 2 = theme, step 3 = generating
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<ThemeConfig | null>(null);
  const [brokerProfile, setBrokerProfile] = useState<{
    fullName: string; phone: string; agencyName: string; reraNumber: string;
  }>({ fullName: '', phone: '', agencyName: '', reraNumber: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [generationStatus, setGenerationStatus] = useState('');

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => {
      if (data) setBrokerProfile({ fullName: data.full_name || '', phone: data.phone || '', agencyName: data.agency_name || '', reraNumber: data.rera_number || '' });
    });
    if (initialListingId) {
      supabase.from('listings').select('*, listing_photos(url)').eq('id', initialListingId).single().then(({ data }) => {
        if (data) setDescription(`${data.headline || ''}\n${data.ai_description || ''}\n${data.locality || ''}, ${data.city || ''}\n${data.price ? `₹${data.price}` : ''}`);
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
  const removePhoto = (i: number) => { setPhotos(p => p.filter((_, j) => j !== i)); setPhotoPreviewUrls(p => p.filter((_, j) => j !== i)); };

  const handleGenerate = async () => {
    if (!selectedTheme) { toast.error('Pick a theme'); return; }
    if (!description.trim()) { toast.error('Add property description'); return; }
    setStep(3);
    setGenerationStatus('Processing photos...');

    try {
      const CLAUDE_KEY = import.meta.env.VITE_CLAUDE_API_KEY;
      if (!CLAUDE_KEY) throw new Error('Claude API key not found. Set VITE_CLAUDE_API_KEY.');

      // Upload photos
      const taggedPhotos: PresentationPhoto[] = [];
      const SMART_TAGS = ['cover', 'exterior', 'living', 'bedroom', 'kitchen', 'bathroom', 'balcony', 'amenity'];
      for (let i = 0; i < photos.length; i++) {
        const file = photos[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${i}.${fileExt}`;
        const filePath = `${user?.id}/${fileName}`;
        const { error } = await supabase.storage.from('listing-photos').upload(filePath, file);
        let publicUrl = '';
        if (!error) { const { data: { publicUrl: url } } = supabase.storage.from('listing-photos').getPublicUrl(filePath); publicUrl = url; }
        else { publicUrl = photoPreviewUrls[i] || ''; }
        taggedPhotos.push({ url: publicUrl, tag: i < SMART_TAGS.length ? SMART_TAGS[i] : 'other', orderIndex: i });
      }

      setGenerationStatus('AI is composing your presentation...');

      const SYSTEM_PROMPT = `You are an elite layout director for a luxury real estate app. The user has selected a visual theme (provided below). Read their property data carefully and compose a GenerativePresentation JSON.

OUTPUT: Return ONLY valid JSON. No markdown. No code fences. No explanation.

interface GenerativePresentation {
  theme: { backgroundColor: string; textColor: string; accentColor: string; headingFont: string; bodyFont: string; };
  slides: Array<{
    id: string;
    layout: "hero-cinematic" | "hero-editorial" | "bento-grid-features" | "magazine-split" | "stats-monumental" | "vision-quote" | "gallery-masonry" | "contact-minimal";
    eyebrow?: string; headline?: string; subheadline?: string; bodyText?: string; pullQuote?: string;
    bulletPoints?: string[];
    bentoBoxes?: Array<{ icon: string; title: string; description: string; size: "large" | "small" }>;
    stats?: Array<{ label: string; value: string; unit?: string }>;
    imageTags: string[];
    contactInfo?: { name: string; phone: string; agency: string; rera: string; tagline?: string };
  }>;
}

LAYOUT SELECTION INTELLIGENCE:
→ Long description (200+ words): Use magazine-split for narrative + bento-grid-features for amenities.
→ Short description (under 100 words): Use vision-quote for breathing room + stats-monumental for data.
→ ALWAYS start with hero-cinematic OR hero-editorial. Never both.
  hero-cinematic for dramatic properties (mountains, heritage, night photography).
  hero-editorial for clean/modern properties (apartments, new construction).
→ ALWAYS end with contact-minimal.
→ For 5+ photos: include gallery-masonry. Under 3 photos: skip it.
→ NEVER use the same layout twice. Only one hero layout total.

CONTENT RULES:
→ eyebrow: Always fill. Format: 'CITY · PROPERTY TYPE' e.g. 'KASHMIR · MOUNTAIN ESTATE'
→ headline: Maximum 6 words. Poetic, not descriptive. BAD: '3 BHK Luxury Apartment'. GOOD: 'Where Silence Has An Address'
→ pullQuote (vision-quote only): 10-18 words, first-person buyer fantasy.
→ bentoBoxes: 5-6 boxes. Mix 1 large + rest small. Titles are EXPERIENCES not features.
  BAD title: 'Swimming Pool'. GOOD: 'Infinity Edge'. GOOD description: 'Suspended over the valley. Heated. Open at dawn.'
→ stats: Premium labels. BAD: { label: 'Area', value: '3000' }. GOOD: { label: 'LIVING CANVAS', value: '3,000', unit: 'SQ FT' }
→ imageTags: hero-cinematic → ['cover','exterior']. magazine-split → ['exterior','living']. gallery-masonry → ['pool','bonfire','garden']. stats-monumental → []. vision-quote → []. contact-minimal → [].

SELECTED THEME — APPLY STRICTLY:
${JSON.stringify(selectedTheme, null, 2)}

Generate 5-7 slides. Each slide is a new scene. Never generate a slide with empty headline AND empty bodyText.`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': CLAUDE_KEY, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514', max_tokens: 4000, system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: `Design a property presentation.\n\nProperty: "${description}"\n\nBroker: ${brokerProfile.fullName || 'N/A'}\nPhone: ${brokerProfile.phone || 'N/A'}\nAgency: ${brokerProfile.agencyName || 'N/A'}\nRERA: ${brokerProfile.reraNumber || 'N/A'}\n\nAvailable photo tags: ${taggedPhotos.map(p => p.tag).join(', ') || 'cover'}\n\nReturn ONLY valid JSON.` }]
        })
      });

      if (!response.ok) throw new Error(`Claude API failed (${response.status}): ${await response.text()}`);

      const result = await response.json();
      const rawText = result.content?.[0]?.text || '';
      const cleanJson = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      let presentation: GenerativePresentation;
      try { presentation = JSON.parse(cleanJson); } catch { throw new Error('AI returned invalid JSON. Try again.'); }
      if (!presentation.theme || !presentation.slides?.length) throw new Error('AI returned incomplete data.');

      setGenerationStatus('Saving...');
      const presId = crypto.randomUUID();
      const stored = {
        id: presId, user_id: user?.id || null,
        title: presentation.slides[0]?.headline || 'Presentation',
        presentation, photo_urls: taggedPhotos.map(p => p.url),
        photo_tags: taggedPhotos.map(p => p.tag),
        created_at: new Date().toISOString(), status: 'live'
      };
      const existing = JSON.parse(localStorage.getItem('propsite_presentations') || '[]');
      existing.push(stored);
      localStorage.setItem('propsite_presentations', JSON.stringify(existing));
      toast.success('Presentation created!');
      navigate(`/dashboard/presentations/${presId}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Generation failed');
      setStep(2);
    }
  };

  // === STEP 3: GENERATING ===
  if (step === 3) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0A0A0A', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid #222', borderTopColor: selectedTheme?.accentColor || '#C9A84C', animation: 'spin 1s linear infinite', marginBottom: 24 }} />
        <p style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 600, fontFamily: selectedTheme?.headingFont || 'Playfair Display', textAlign: 'center', marginBottom: 8 }}>{generationStatus}</p>
        <p style={{ color: '#555', fontSize: 13, fontFamily: '"DM Sans",sans-serif' }}>This takes 10-20 seconds</p>
        <div style={{ width: 240, height: 3, backgroundColor: '#222', marginTop: 24, overflow: 'hidden', borderRadius: 2 }}>
          <div style={{ height: '100%', backgroundColor: selectedTheme?.accentColor || '#C9A84C', animation: 'progress 15s ease-in-out forwards' }} />
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes progress{0%{width:0%}100%{width:95%}}`}</style>
      </div>
    );
  }

  // === STEP 2: THEME SELECTION ===
  if (step === 2) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0A0A0A', display: 'flex', flexDirection: 'column' }}>
        {/* Back nav */}
        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => setStep(1)} style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#888', fontSize: 14, background: 'none', border: 'none', cursor: 'pointer' }}>
            <ArrowLeft size={16} /> Back
          </button>
        </div>
        <ThemeSelectionStep selectedTheme={selectedTheme} onThemeSelect={setSelectedTheme} />
        {/* Generate button */}
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px 20px 32px', background: 'linear-gradient(to top, #0A0A0A 70%, transparent)', zIndex: 10 }}>
          <button onClick={handleGenerate} disabled={!selectedTheme}
            style={{
              width: '100%', height: 56, borderRadius: 14, border: 'none', cursor: 'pointer',
              backgroundColor: selectedTheme ? selectedTheme.accentColor : '#333',
              color: '#FFFFFF', fontSize: 16, fontWeight: 700, letterSpacing: '0.5px',
              opacity: selectedTheme ? 1 : 0.4,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontFamily: '"DM Sans",sans-serif',
              boxShadow: selectedTheme ? `0 8px 24px ${selectedTheme.accentColor}44` : 'none'
            }}>
            <Sparkles size={18} /> Generate Presentation
          </button>
        </div>
      </div>
    );
  }

  // === STEP 1: PROPERTY DETAILS ===
  return (
    <div className="min-h-screen bg-white font-sans flex flex-col pb-24">
      <div className="px-5 py-4 border-b border-[#EBEBEB] bg-white sticky top-0 md:top-14 z-20">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-bold text-[#111111]">Create Presentation</h1>
            <p className="text-[13px] text-[#888888]">Step 1: Property details & photos</p>
          </div>
          <Sparkles size={20} className="text-[#1A5C3A]" />
        </div>
      </div>
      <div className="flex-1 max-w-2xl mx-auto w-full p-5 space-y-8">
        {/* Photos */}
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
                    {i === 0 && <div className="absolute top-1.5 left-1.5 bg-[#1A5C3A] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">Cover</div>}
                    <button onClick={() => removePhoto(i)} className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
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
        {/* Description */}
        <div>
          <h2 className="text-[16px] font-bold text-[#111111] mb-3">Property Description</h2>
          <textarea value={description} onChange={e => setDescription(e.target.value)}
            className="w-full min-h-[180px] border border-[#DDDCDC] rounded-xl px-4 py-3 text-[14px] text-[#111111] focus:outline-none focus:border-[#1A5C3A] focus:ring-1 focus:ring-[#1A5C3A] resize-y leading-relaxed"
            placeholder={"Describe your property in detail:\n\n• Location, floor, facing\n• BHK, carpet area, price\n• Furnishing, parking, possession\n• Key features — sea view, terrace, etc.\n• Amenities — gym, pool, security"} />
          <p className="text-[11px] text-[#AAAAAA] mt-1.5">✦ AI will compose cinematic slides from this</p>
        </div>
        {/* Broker */}
        <div>
          <h2 className="text-[16px] font-bold text-[#111111] mb-3">Your Details (Contact Slide)</h2>
          <div className="grid grid-cols-2 gap-3">
            <input value={brokerProfile.fullName} onChange={e => setBrokerProfile(p => ({ ...p, fullName: e.target.value }))} className="border border-[#DDDCDC] rounded-lg h-11 px-3 text-[14px] focus:outline-none focus:border-[#1A5C3A]" placeholder="Your Name" />
            <input value={brokerProfile.phone} onChange={e => setBrokerProfile(p => ({ ...p, phone: e.target.value }))} className="border border-[#DDDCDC] rounded-lg h-11 px-3 text-[14px] focus:outline-none focus:border-[#1A5C3A]" placeholder="Phone" />
            <input value={brokerProfile.agencyName} onChange={e => setBrokerProfile(p => ({ ...p, agencyName: e.target.value }))} className="border border-[#DDDCDC] rounded-lg h-11 px-3 text-[14px] focus:outline-none focus:border-[#1A5C3A]" placeholder="Agency Name" />
            <input value={brokerProfile.reraNumber} onChange={e => setBrokerProfile(p => ({ ...p, reraNumber: e.target.value }))} className="border border-[#DDDCDC] rounded-lg h-11 px-3 text-[14px] focus:outline-none focus:border-[#1A5C3A]" placeholder="RERA Number" />
          </div>
        </div>
        {/* Next */}
        <button onClick={() => { if (!description.trim()) { toast.error('Add a description'); return; } setStep(2); }}
          disabled={!description.trim()}
          className="w-full bg-[#1A5C3A] hover:bg-[#14482D] disabled:opacity-40 disabled:cursor-not-allowed text-white text-[16px] font-bold h-[52px] rounded-[14px] flex items-center justify-center gap-2 transition-colors shadow-lg shadow-[#1A5C3A]/20">
          Choose Visual Identity <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
