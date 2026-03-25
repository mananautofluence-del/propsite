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

      const SYSTEM_PROMPT = `You are an elite real estate presentation director.
Generate a GenerativePresentation JSON for PropSite.

CRITICAL OUTPUT RULE:
Return ONLY raw valid JSON. No markdown. No code fences.
No explanation. Start with { end with }.

SLIDE COUNT: Generate exactly 6 to 8 slides.

AVAILABLE LAYOUTS (pick based on data, never repeat):
"cover-editorial" — Large headline left, property image right. ALWAYS slide 1.
"stats-two-col" — Two giant statistics. Use when you have 2 key numbers.
"content-image-bottom" — Headline+text top-left, image top-right, 3 features bottom.
"headline-two-images" — Headline+body top, two photos below side by side.
"headline-numbered-list" — Headline+body left, 3 numbered points right.
"headline-two-col-images" — Headline left, 2 images with captions right.
"images-top-headline-bottom" — 2 photos top, headline+body bottom.
"centered-numbered-cols" — Centered headline, 3 numbered columns below.
"image-left-headline-numbered" — Image left, headline + 2 numbered right.
"headline-body-image-numbered" — Complex layout: headline+body+image left, 2 numbered right.
"headline-2x2-numbered" — Headline top, 2x2 grid of 4 features below.
"headline-2img-2numbered" — Headline+2numbered left, 2 stacked images right.
"two-images-headline-numbered" — 2 images left, headline+2numbered right.
"image-top-headline-numbered" — Image+2numbered top, headline+body bottom.
"contact-split" — Contact slide with vertical divider. ALWAYS last slide.

SELECTION RULES:
- cover-editorial: ALWAYS first
- contact-split: ALWAYS last
- Use stats-two-col when property has clear metrics (area + BHK, or price + size)
- Use numbered layouts when you have 2-4 distinct features/points
- Use image-heavy layouts when 4+ photos provided
- Vary layouts — no two consecutive slides same family

CONTENT RULES:

agencyName: broker's agency name (shown in header of every slide)

headline:
  cover-editorial → 2-4 words MAX. Poetic.
    REJECT: '3 BHK Luxury Apartment For Sale'
    ACCEPT: 'Your Next Chapter' or 'Where Life Begins'
  All other slides → 4-8 words, descriptive but elegant

bodyText: Write naturally. NOT marketing speak. NOT lists.
  2-4 sentences max. Clear and confident.

stats: For stats-two-col layout only.
  Exactly 2 stats.
  value: short and bold — '3,000' not '3000 sq ft'
  label: headline for the stat — 'Square Feet of Space'
  description: 1-2 sentence explanation

numberedItems: For numbered layouts.
  number: '01', '02', '03', '04' (never more than 4)
  title: 3-5 words, bold
  body: 1-2 sentences, clear

imageTags: ONLY use exact tags provided to you.
  cover-editorial → ['cover']
  image layouts → use whichever tags exist
  stats-two-col, centered-numbered-cols, contact-split → [] (no image)

contactInfo: Always on contact-split.
  Include website if provided.
  tagline: 3-5 words about specialty.

SELECTED THEME (apply exactly, no changes):
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
      <div style={{ minHeight: '100vh', backgroundColor: '#0A0A0A', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid #222', borderTopColor: '#C9A84C', animation: 'spin 1s linear infinite', marginBottom: 24 }} />
        <p style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 600, fontFamily: '"Playfair Display", serif', textAlign: 'center', marginBottom: 8 }}>{generationStatus}</p>
        <p style={{ color: '#555', fontSize: 13, fontFamily: '"DM Sans",sans-serif' }}>This takes 10-20 seconds</p>
        <div style={{ width: 240, height: 3, backgroundColor: '#222', marginTop: 24, overflow: 'hidden', borderRadius: 2 }}>
          <div style={{ height: '100%', backgroundColor: '#C9A84C', animation: 'progress 15s ease-in-out forwards' }} />
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes progress{0%{width:0%}100%{width:95%}}`}</style>
      </div>
    );
  }

  // === STEP 1: THEME SELECTION ===
  if (step === 1) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex flex-col">
        <div className="px-5 py-4 bg-white border-b border-[#EBEBEB] sticky top-0 z-20">
          <div className="max-w-2xl mx-auto flex gap-4 items-center">
            <button onClick={() => navigate('/dashboard/presentations')} className="flex items-center gap-2 text-[14px] text-[#555] hover:text-black font-medium"><ArrowLeft size={16} /> Back</button>
            <div className="flex-1 text-center font-bold text-[#111] text-[15px]">Create Presentation</div>
            <div className="w-[60px]" />
          </div>
        </div>
        <ThemeSelectionStep selectedTheme={selectedTheme} onThemeSelect={(t) => { setSelectedTheme(t); setStep(2); }} />
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
