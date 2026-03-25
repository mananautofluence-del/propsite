import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { PresentationPhoto, GenerativePresentation, ThemeConfig } from '@/lib/presentationTypes';
import { Camera, Loader2, Sparkles, X, Plus, Upload, ChevronRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import ThemeSelectionStep from '@/components/ThemeSelectionStep';

export default function CreatePresentation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialListingId = searchParams.get('listing_id');

  const [step, setStep] = useState<1 | 2 | 3>(1); // 1=theme, 2=details, 3=generating
  const [selectedTheme, setSelectedTheme] = useState<ThemeConfig | null>(null);
  
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  const [description, setDescription] = useState('');
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
    if (!description.trim()) { toast.error('Add property description'); return; }
    if (!selectedTheme) { toast.error('Select a theme first'); return; }
    setStep(3);
    setGenerationStatus('Processing photos...');

    try {
      const CLAUDE_KEY = import.meta.env.VITE_CLAUDE_API_KEY;
      if (!CLAUDE_KEY) throw new Error('Claude API key not found. Set VITE_CLAUDE_API_KEY.');

      // Upload photos
      const taggedPhotos: PresentationPhoto[] = [];
      const semanticTags = ['cover', 'exterior', 'interior', 'lifestyle', 'amenity', 'detail', 'view', 'night'];
      for (let i = 0; i < photos.length; i++) {
        const file = photos[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${i}.${fileExt}`;
        const filePath = `${user?.id}/${fileName}`;
        const { error } = await supabase.storage.from('listing-photos').upload(filePath, file);
        let publicUrl = '';
        if (!error) { const { data: { publicUrl: url } } = supabase.storage.from('listing-photos').getPublicUrl(filePath); publicUrl = url; }
        else { publicUrl = photoPreviewUrls[i] || ''; }
        const tag = i < semanticTags.length ? semanticTags[i] : `photo_${i}`;
        taggedPhotos.push({ url: publicUrl, tag, orderIndex: i });
      }

      const photoTagList = taggedPhotos.map((p, i) => `photo ${i + 1}: tag="${p.tag}"`).join(', ');

      setGenerationStatus('AI is composing your presentation...');

      const SYSTEM_PROMPT = `You are an elite real estate presentation director for PropSite.
Generate a GenerativePresentation JSON object.

CRITICAL OUTPUT RULE:
Return ONLY raw valid JSON. No markdown. No code fences.
No explanation. Start with { and end with }.

SLIDE COUNT: Generate exactly 6 to 8 slides. Never fewer than 6.

AVAILABLE LAYOUTS — you MUST only use these exact strings:
"cover-editorial"              → Big headline left, property image right. USE AS SLIDE 1 ALWAYS.
"stats-two-col"                → Two giant statistics side by side. No image. Use for key numbers.
"content-image-bottom"         → Headline+body top-left, image top-right, 3 feature columns bottom.
"headline-two-images"          → Headline+body text top, two photos side by side below.
"headline-numbered-list"       → Headline+body left, numbered items 01/02/03 stacked right.
"headline-two-col-images"      → Headline left, two images with captions stacked right.
"images-top-headline-bottom"   → Two photos on top, headline+body below.
"centered-numbered-cols"       → Centered large headline, three numbered columns below.
"image-left-headline-numbered" → Single image left, headline + two numbered points right.
"headline-2x2-numbered"        → Headline top, 2x2 grid of four numbered features below.
"headline-2img-2numbered"      → Headline + two numbered points left, two stacked images right.
"two-images-headline-numbered" → Two images left side, headline + numbered points right.
"contact-split"                → Contact details with vertical divider. USE AS LAST SLIDE ALWAYS.

LAYOUT SELECTION RULES:
- "cover-editorial" MUST be slide 1
- "contact-split" MUST be the last slide
- NEVER use the same layout twice in one presentation
- Pick layouts that match the volume of data:
  · Has 2 key numbers (area + price, BHK + floor)? → use "stats-two-col"
  · Has 3+ features/amenities? → use "headline-numbered-list" or "headline-2x2-numbered"
  · Has 4+ photos? → use "headline-two-images" || "two-images-headline-numbered"
  · Has long description? → use "content-image-bottom"
  · Has short description? → use "centered-numbered-cols" to fill space elegantly

CONTENT RULES:

agencyName: The broker's agency name. Shown in header of every slide.

headline:
  On "cover-editorial" → 2-4 words, poetic and evocative. NOT descriptive.
    WRONG: "3 BHK Apartment For Sale In Bandra"
    RIGHT: "Your Next Chapter" or "Life, Elevated"
  All other layouts → 5-8 words, elegant but descriptive.

bodyText: 2-3 natural sentences. NOT bullet points. NOT marketing clichés.
  Write like a confident, calm estate agent. No exclamation marks.

numberedItems: For all numbered layouts.
  Each item has: number ("01"), title (3-5 words bold), body (1-2 sentences)
  Maximum 4 items per slide. Minimum 2.

stats: For "stats-two-col" ONLY. Exactly 2 stats.
  value: short — "3,200" not "3200 sq ft"
  label: headline for the number — "Square Feet of Space"
  description: one calm sentence explaining what this means

imageTags: Use ONLY the exact tag strings provided to you.
  Slides with no photos (stats-two-col, contact-split): use []
  Image slides: pick from the available tags list
  CRITICAL: Never use the same photo tag twice in one 
  imageTags array. For two-image layouts you MUST provide 
  two different tags. If only one photo exists, use 
  single-image layouts only.

contactInfo on "contact-split":
  Fill name, phone, agency, rera from what the broker provided.
  tagline: 4-6 word specialty description.
  Include website if it was given.

SELECTED THEME — apply EXACTLY, do not invent or change any values:
${JSON.stringify(selectedTheme, null, 2)}`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': CLAUDE_KEY, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514', max_tokens: 8000, system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: `Design a property presentation.\n\nProperty: "${description}"\n\nBroker: ${brokerProfile.fullName || 'N/A'}\nPhone: ${brokerProfile.phone || 'N/A'}\nAgency: ${brokerProfile.agencyName || 'N/A'}\nRERA: ${brokerProfile.reraNumber || 'N/A'}\n\nYou have ${taggedPhotos.length} photos. Use these EXACT tags in imageTags: ${photoTagList}. For cover use: ["cover"]. For remaining photos use the specific photo tags provided. ONLY use tags from the list above.\n\nReturn ONLY valid JSON.` }]
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
        created_at: new Date().toISOString(), status: 'live',
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
      <div style={{ minHeight: '100vh', backgroundColor: '#F7F7F7', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid #E5E5E5', borderTopColor: '#111111', animation: 'spin 1s linear infinite', marginBottom: 24 }} />
        <p style={{ color: '#111111', fontSize: 18, fontWeight: 600, fontFamily: '"Playfair Display", serif', textAlign: 'center', marginBottom: 8 }}>{generationStatus}</p>
        <p style={{ color: '#111111', fontSize: 13, fontFamily: '"DM Sans",sans-serif', opacity: 0.6 }}>This takes 10-20 seconds</p>
        <div style={{ width: 240, height: 3, backgroundColor: '#E5E5E5', marginTop: 24, overflow: 'hidden', borderRadius: 2 }}>
          <div style={{ height: '100%', backgroundColor: '#111111', animation: 'progress 15s ease-in-out forwards' }} />
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes progress{0%{width:0%}100%{width:95%}}`}</style>
      </div>
    );
  }

  // === STEP 1: THEME SELECTION ===
  if (step === 1) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F7F7F7', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{
          padding: '14px 20px',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #EBEBEB',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          position: 'sticky',
          top: 0,
          zIndex: 20,
        }}>
          <button
            onClick={() => navigate('/dashboard/presentations')}
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              color: '#555555', fontSize: '14px', fontWeight: 500,
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: '"DM Sans", sans-serif',
              padding: '6px 8px', borderRadius: '8px',
            }}
          >
            ← Back
          </button>
          <div style={{
            flex: 1, textAlign: 'center',
            fontSize: '15px', fontWeight: 700,
            color: '#111111', fontFamily: '"DM Sans", sans-serif',
          }}>
            Create Presentation
          </div>
          {/* Step indicator */}
          <div style={{
            fontSize: '12px', color: '#AAAAAA',
            fontFamily: '"DM Sans", sans-serif',
            width: '60px', textAlign: 'right',
          }}>
            Step 1/2
          </div>
        </div>

        {/* Theme cards scroll area */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <ThemeSelectionStep
            selectedTheme={selectedTheme}
            onThemeSelect={(t) => setSelectedTheme(t)}
          />
        </div>

        {/* Fixed bottom button — always visible */}
        <div style={{
          position: 'fixed',
          bottom: 0, left: 0, right: 0,
          padding: '16px 20px 36px 20px',
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid #EBEBEB',
          zIndex: 30,
        }}>
          <button
            onClick={() => {
              if (!selectedTheme) { toast.error('Please pick a style first'); return; }
              setStep(2);
            }}
            style={{
              width: '100%',
              height: '52px',
              borderRadius: '14px',
              border: 'none',
              cursor: selectedTheme ? 'pointer' : 'not-allowed',
              backgroundColor: selectedTheme ? '#111111' : '#DDDDDD',
              color: '#FFFFFF',
              fontSize: '16px',
              fontWeight: 700,
              fontFamily: '"DM Sans", sans-serif',
              letterSpacing: '0.2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'background-color 0.15s ease',
            }}
          >
            {selectedTheme ? (
              <>
                <span style={{
                  display: 'inline-block',
                  width: '10px', height: '10px',
                  borderRadius: '50%',
                  backgroundColor: selectedTheme.accentColor,
                  marginRight: '4px',
                }} />
                Continue with {selectedTheme.headingFont.split(' ')[0]} style →
              </>
            ) : (
              'Select a style to continue'
            )}
          </button>
        </div>
      </div>
    );
  }

  // === STEP 2: PROPERTY DETAILS ===
  return (
    <div className="min-h-screen bg-white font-sans flex flex-col pb-24">
      <div className="px-5 py-4 border-b border-[#EBEBEB] bg-white sticky top-0 md:top-14 z-20">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setStep(1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100"><ArrowLeft size={18} /></button>
            <div>
              <h1 className="text-[20px] font-bold text-[#111111]">Property Details</h1>
              <p className="text-[13px] text-[#888888]">We'll handle the design layout</p>
            </div>
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
          <p className="text-[11px] text-[#AAAAAA] mt-1.5">✦ AI will compose cinematic slides and copy</p>
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
        {/* Generate */}
        <button onClick={handleGenerate}
          disabled={!description.trim()}
          className="w-full bg-[#1A5C3A] hover:bg-[#14482D] disabled:opacity-40 disabled:cursor-not-allowed text-white text-[16px] font-bold h-[52px] rounded-[14px] flex items-center justify-center gap-2 transition-colors shadow-lg shadow-[#1A5C3A]/20">
          <Sparkles size={18} /> Generate Presentation
        </button>
      </div>
    </div>
  );
}
