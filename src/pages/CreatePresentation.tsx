import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { Upload, ChevronRight, Check, Image as ImageIcon, Sparkles, Building2, Wallet } from 'lucide-react';
import EditorPanel from '@/components/presentation/EditorPanel';
import StageCanvas from '@/components/presentation/StageCanvas';
import type { PresentationData, ThemeKey } from '@/lib/presentationState';

type WizardStep = 'upload' | 'details' | 'theme' | 'editor';

export default function CreatePresentation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<WizardStep>('upload');
  const [isGenerating, setIsGenerating] = useState(false);
  const [presentationId, setPresentationId] = useState<string | null>(null);

  // Wizard State
  const [photos, setPhotos] = useState<{ url: string; tag: string }[]>([]);
  const [details, setDetails] = useState({
    title: '', location: '', price: '', propertyType: 'Apartment', bedrooms: '', bathrooms: '', area: '',
  });
  const [selectedTheme, setSelectedTheme] = useState<ThemeKey>('signature');

  // Editor State
  const [presentationData, setPresentationData] = useState<PresentationData | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // In a real app, upload to Supabase storage. Here we just mock local URLs for the UI UX
    if (e.target.files && e.target.files.length > 0) {
      const newPhotos = Array.from(e.target.files).map(f => ({
        url: URL.createObjectURL(f),
        tag: '' // mandatory tagging will be checked before next step
      }));
      setPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  const handleUpdateTag = (index: number, tag: string) => {
    const updated = [...photos];
    updated[index].tag = tag;
    setPhotos(updated);
  };

  const nextFromUpload = () => {
    if (photos.length === 0) return toast.error('Upload at least one photo');
    if (photos.some(p => !p.tag)) return toast.error('Please tag all photos');
    setStep('details');
  };

  const nextFromDetails = () => {
    if (!details.title || !details.location || !details.price) return toast.error('Please fill required fields (Title, Location, Price)');
    setStep('theme');
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // 1. Check credits (TEMPORARILY BYPASSED FOR TESTING)
      /*
      const { data: profile } = await supabase.from('profiles').select('credits_remaining').eq('id', user?.id).single();
      if ((profile?.credits_remaining || 0) < 5) {
        toast.error('Insufficient credits. Need 5 credits to generate.');
        setIsGenerating(false);
        return;
      }
      */

      // 2. Call AI API (Mocked for Vite environment, replace with strict JSON API route later)
      // await fetch('/api/generate-deck', { method: 'POST', body: JSON.stringify({...}) })
      await new Promise(res => setTimeout(res, 2500)); // Simulate AI generation

      // 3. Deduct credits (TEMPORARILY BYPASSED FOR TESTING)
      // await supabase.rpc('deduct_credits' as any, { amount: 5 });

      // 4. Initialize Editor Data
      const mockData: PresentationData = {
        title: details.title,
        subtitle: 'An exceptional property opportunity',
        location: details.location,
        price: details.price,
        propertyType: details.propertyType,
        bedrooms: details.bedrooms || '3',
        bathrooms: details.bathrooms || '2',
        area: details.area || '2000 sq ft',
        lotSize: '0.5 Acres',
        yearBuilt: '2020',
        parking: '2 Spaces',
        description: `This stunning ${details.propertyType} located in ${details.location} offers unparalleled luxury...`,
        features: ['High Ceilings', 'Smart Home Tech', 'Premium Finishes', 'Panoramic Views'],
        brokerName: 'Alex Mercer',
        brokerTitle: 'Senior Vice President',
        brokerAgency: 'PropSite Elite',
        brokerPhone: '+1 (555) 012-3456',
        brokerEmail: 'alex@propsite.com',
        brokerRera: 'RERA-12345678',
      };
      
      setPresentationData(mockData);
      toast.success('Generated successfully!');
      setStep('editor');
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate presentation');
    } finally {
      setIsGenerating(false);
    }
  };

  // --------------------------------------------------------------------------------
  // RENDER HELPERS
  // --------------------------------------------------------------------------------

  // STEP 1: UPLOAD & TAG
  if (step === 'upload') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center py-10 px-4 font-sans">
        <div className="w-full max-w-xl">
          <div className="mb-8">
            <h1 className="text-2xl font-bold font-display text-text-1">Upload & Tag Photos</h1>
            <p className="text-sm text-text-2 mt-1">Our AI needs properly tagged photos to generate the right slides.</p>
          </div>

          <div className="bg-white border border-border p-6 rounded-2xl shadow-sm mb-6">
            <label className="border-2 border-dashed border-border hover:border-primary bg-surface transition-colors rounded-xl h-32 flex flex-col items-center justify-center cursor-pointer mb-6">
              <Upload size={24} className="text-text-3 mb-2" />
              <span className="text-sm font-medium text-text-1">Tap to Upload Photos</span>
              <span className="text-xs text-text-3 mt-1">JPG, PNG up to 10MB</span>
              <input type="file" multiple accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </label>

            {photos.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-text-1 border-b pb-2">Mandatory Tagging</h3>
                {photos.map((p, i) => (
                  <div key={i} className="flex items-center gap-4 bg-surface p-3 rounded-xl border border-border">
                    <img src={p.url} alt="" className="w-16 h-16 object-cover rounded-lg" />
                    <div className="flex-1">
                      <select 
                        value={p.tag}
                        onChange={(e) => handleUpdateTag(i, e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-border bg-white text-sm focus:outline-none focus:border-primary"
                      >
                        <option value="" disabled>Select Tag...</option>
                        <option value="hero">Hero Exterior</option>
                        <option value="living_room">Living Room</option>
                        <option value="bedroom">Master Bedroom</option>
                        <option value="kitchen">Kitchen</option>
                        <option value="bathroom">Bathroom</option>
                        <option value="amenity">Amenity / View</option>
                        <option value="floorplan">Floorplan</option>
                      </select>
                    </div>
                    {p.tag && <Check size={18} className="text-green-500" />}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button onClick={nextFromUpload} className="btn-primary flex items-center gap-2 h-11 px-6">
              Next Step <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STEP 2: DETAILS
  if (step === 'details') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center py-10 px-4 font-sans">
        <div className="w-full max-w-xl">
          <div className="flex items-center gap-2 mb-8 cursor-pointer w-max" onClick={() => setStep('upload')}>
            <ChevronRight size={16} className="rotate-180 text-text-3" />
            <span className="text-sm font-medium text-text-2">Back to Photos</span>
          </div>
          
          <div className="mb-8">
            <h1 className="text-2xl font-bold font-display text-text-1">Property Details</h1>
            <p className="text-sm text-text-2 mt-1">Help the AI craft the perfect narrative.</p>
          </div>

          <div className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-5 mb-6">
            <div>
              <label className="block text-xs font-semibold text-text-2 uppercase tracking-wider mb-2">Property Title *</label>
              <input type="text" value={details.title} onChange={e => setDetails(p => ({...p, title: e.target.value}))} placeholder="e.g. The Sapphire Penthouse" className="w-full h-11 px-4 rounded-xl border border-border bg-surface focus:outline-none focus:border-primary transition-colors text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-2 uppercase tracking-wider mb-2">Location *</label>
              <input type="text" value={details.location} onChange={e => setDetails(p => ({...p, location: e.target.value}))} placeholder="e.g. Bandra West, Mumbai" className="w-full h-11 px-4 rounded-xl border border-border bg-surface focus:outline-none focus:border-primary transition-colors text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-2 uppercase tracking-wider mb-2">Price *</label>
                <input type="text" value={details.price} onChange={e => setDetails(p => ({...p, price: e.target.value}))} placeholder="e.g. ₹ 85 Cr" className="w-full h-11 px-4 rounded-xl border border-border bg-surface focus:outline-none focus:border-primary transition-colors text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-2 uppercase tracking-wider mb-2">Type</label>
                <select value={details.propertyType} onChange={e => setDetails(p => ({...p, propertyType: e.target.value}))} className="w-full h-11 px-4 rounded-xl border border-border bg-surface focus:outline-none focus:border-primary transition-colors text-sm">
                  <option>Apartment</option>
                  <option>Villa</option>
                  <option>Penthouse</option>
                  <option>Commercial</option>
                  <option>Plot</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 border-t pt-5">
              <div>
                <label className="block text-[10px] font-semibold text-text-3 uppercase tracking-wider mb-1">Beds</label>
                <input type="text" value={details.bedrooms} onChange={e => setDetails(p => ({...p, bedrooms: e.target.value}))} placeholder="e.g. 4" className="w-full h-10 px-3 rounded-lg border border-border bg-surface focus:outline-none focus:border-primary text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-text-3 uppercase tracking-wider mb-1">Baths</label>
                <input type="text" value={details.bathrooms} onChange={e => setDetails(p => ({...p, bathrooms: e.target.value}))} placeholder="e.g. 5" className="w-full h-10 px-3 rounded-lg border border-border bg-surface focus:outline-none focus:border-primary text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-text-3 uppercase tracking-wider mb-1">Area</label>
                <input type="text" value={details.area} onChange={e => setDetails(p => ({...p, area: e.target.value}))} placeholder="e.g. 4500" className="w-full h-10 px-3 rounded-lg border border-border bg-surface focus:outline-none focus:border-primary text-sm" />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs text-text-3 font-medium">* Required fields</span>
            <button onClick={nextFromDetails} className="btn-primary flex items-center gap-2 h-11 px-6">
              Next Step <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STEP 3: THEME & PAYMENT
  if (step === 'theme') {
    const themes: { id: ThemeKey; name: string; desc: string }[] = [
      { id: 'signature', name: 'Signature', desc: 'Minimalist & Clean. Perfect for modern residential.' },
      { id: 'penthouse', name: 'Penthouse', desc: 'Dark & Moody. High-end luxury properties.' },
      { id: 'corporate', name: 'Corporate', desc: 'Structured & Blue. Commercial & office spaces.' },
      { id: 'highstreet', name: 'High Street', desc: 'Vibrant & Earthy. Retail & boutique spaces.' },
      { id: 'logistics', name: 'Logistics', desc: 'Industrial & Bold. Warehouses & factories.' },
      { id: 'estate', name: 'Estate', desc: 'Nature & Green. Plots, lands & farmhouses.' },
    ];

    return (
      <div className="min-h-screen bg-background flex flex-col items-center py-10 px-4 font-sans">
        <div className="w-full max-w-xl">
          <div className="flex items-center gap-2 mb-8 cursor-pointer w-max" onClick={() => setStep('details')}>
            <ChevronRight size={16} className="rotate-180 text-text-3" />
            <span className="text-sm font-medium text-text-2">Back to Details</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold font-display text-text-1">Choose Design Language</h1>
            <p className="text-sm text-text-2 mt-1">Select the aesthetic that best suits the property.</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            {themes.map(t => (
              <div 
                key={t.id} 
                onClick={() => setSelectedTheme(t.id)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedTheme === t.id ? 'border-primary bg-primary/5 shadow-md' : 'border-border bg-white hover:border-text-3'}`}
              >
                <h3 className="text-sm font-bold text-text-1 flex justify-between items-center mb-1">
                  {t.name} {selectedTheme === t.id && <Check size={16} className="text-primary" />}
                </h3>
                <p className="text-[11px] text-text-2 leading-tight">{t.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-[#1A1A1A] text-white p-6 rounded-2xl flex flex-col items-center text-center shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-purple-500" />
            <Sparkles size={28} className="text-primary mb-3" />
            <h2 className="text-lg font-bold font-display mb-1">Generate with Anti-Gravity AI</h2>
            <p className="text-xs opacity-70 mb-6 max-w-xs">Our AI will write sales copy, structure your slides, and map your tags to the chosen design theme automatically.</p>
            
            <button 
              onClick={handleGenerate} 
              disabled={isGenerating}
              className="bg-primary hover:bg-primary-hover text-white h-12 px-8 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 w-full transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
            >
              {isGenerating ? (
                <span className="animate-pulse">Crafting Presentation...</span>
              ) : (
                <>Generate Presentation <span className="opacity-50 text-xs ml-1">• Free (Testing)</span></>
              )}
            </button>
            <div className="flex items-center gap-1 mt-4 text-[10px] opacity-50 font-medium">
              <Wallet size={12} /> Credit system bypassed for testing
            </div>
          </div>
        </div>
      </div>
    );
  }

  // STEP 4: EDITOR VIEW (Integrated Mobile & Desktop views)
  if (step === 'editor' && presentationData) {
    return (
      <div className="flex flex-col md:flex-row h-screen w-full bg-background overflow-hidden relative font-sans">
        {/* Mobile: Viewport strictly stacks vertically with StageCanvas sticky at top */}
        <div className="md:hidden flex flex-col w-full h-full">
          <div className="w-full h-[40vh] sticky top-0 z-10 shadow-md">
             <StageCanvas 
               data={presentationData} 
               themeId={selectedTheme} 
               activeSlide={activeSlide} 
               onSlideChange={setActiveSlide} 
             />
          </div>
          <div className="flex-1 overflow-y-auto bg-surface relative z-0 pb-10">
             <EditorPanel 
               data={presentationData} 
               onChange={setPresentationData} 
               themeId={selectedTheme} 
               onThemeChange={setSelectedTheme} 
               activeSlide={activeSlide} 
               onSlideChange={setActiveSlide} 
             />
          </div>
        </div>

        {/* Desktop: Standard side-by-side view */}
        <div className="hidden md:flex flex-row w-full h-full">
          <div className="w-[350px] lg:w-[400px] h-full border-r border-border bg-surface shrink-0 z-10 overflow-hidden flex flex-col">
            <EditorPanel 
               data={presentationData} 
               onChange={setPresentationData} 
               themeId={selectedTheme} 
               onThemeChange={setSelectedTheme} 
               activeSlide={activeSlide} 
               onSlideChange={setActiveSlide} 
            />
          </div>
          <div className="flex-1 h-full bg-surface-2 p-8 overflow-hidden">
            <StageCanvas 
               data={presentationData} 
               themeId={selectedTheme} 
               activeSlide={activeSlide} 
               onSlideChange={setActiveSlide} 
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
}
