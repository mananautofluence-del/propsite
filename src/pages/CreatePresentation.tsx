import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, FileType2, FileDown, Camera, X, Plus, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const THEMES = [
  { label: 'Signature Aura', value: 'edge-yellow' },
  { label: 'Midnight Estate', value: 'professional-dark' },
  { label: 'Editorial Cream', value: 'light-rose' },
  { label: 'Glass & Steel', value: 'professional-blue' },
];

const SLIDE_COUNTS = [6, 7, 8];

export default function CreatePresentation() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'A' | 'B' | 'C'>('A');
  
  // Feature-rich Form State
  const [propertyText, setPropertyText] = useState('');
  const [price, setPrice] = useState('');
  const [bhk, setBhk] = useState('');
  const [amenities, setAmenities] = useState('');
  const [brokerName, setBrokerName] = useState('');
  const [brokerPhone, setBrokerPhone] = useState('');
  const [brokerAgency, setBrokerAgency] = useState('');

  // Photos State
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

  // Generation Settings
  const [theme, setTheme] = useState('edge-yellow');
  const [slides, setSlides] = useState(7);
  
  const [result, setResult] = useState<{ downloadUrl: string; editUrl: string; presentationId: string } | null>(null);

  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files);
    setPhotoFiles(prev => [...prev, ...newFiles]);
    const newUrls = newFiles.map(f => URL.createObjectURL(f));
    setPhotoUrls(prev => [...prev, ...newUrls]);
  };

  const removePhoto = (idx: number) => {
    setPhotoUrls(prev => prev.filter((_, i) => i !== idx));
    setPhotoFiles(prev => prev.filter((_, i) => i !== idx));
  };

  async function uploadPhotos() {
    if (photoFiles.length === 0) return [];
    toast.info('Uploading property photos...');
    const urls: string[] = [];
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id || 'temp';

    for (const file of photoFiles) {
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
      const filePath = `presentations/${userId}/${fileName}`;

      const { error: uploadErr } = await supabase.storage
        .from('listing-photos')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadErr) {
        console.error('Photo upload error:', uploadErr);
        continue;
      }
      const { data: { publicUrl } } = supabase.storage
        .from('listing-photos')
        .getPublicUrl(filePath);
      urls.push(publicUrl);
    }
    return urls;
  }

  async function generatePresentation() {
    // 1. Upload photos first
    const uploadedPhotoUrls = await uploadPhotos();

    // 2. Build the comprehensive Prompt
    let prompt = `Create a professional real estate property presentation for Indian real estate brokers.\n\n`;
    prompt += `Property Details & Address:\n${propertyText}\n\n`;
    if (price) prompt += `Price: ${price}\n`;
    if (bhk) prompt += `Configuration: ${bhk}\n`;
    if (amenities) prompt += `Key Amenities: ${amenities}\n\n`;
    
    if (brokerName || brokerPhone || brokerAgency) {
      prompt += `Broker Contact Information (MUST BE RENDERED ON THE CONTACT SLIDE):\n`;
      if (brokerName) prompt += `Name: ${brokerName}\n`;
      if (brokerPhone) prompt += `Phone: ${brokerPhone}\n`;
      if (brokerAgency) prompt += `Agency: ${brokerAgency}\n`;
      prompt += `\n`;
    }

    if (uploadedPhotoUrls.length > 0) {
      prompt += `Property Photos (Use these exact image URLs seamlessly in the presentation slides):\n`;
      prompt += uploadedPhotoUrls.join('\n') + `\n\n`;
    }

    prompt += `Requirements:\n- Elegant, clean and luxury design\n- Include slides for: property overview, key highlights, amenities, photo showcase, contact details\n- Keep text concise and highly impactful\n- Use Indian price formatting (Lakhs/Crores)\n- Tone: confident, premium, trustworthy`;

    const apiUrl = import.meta.env.VITE_PRESENTON_API_URL || 'https://presenton-production-4e76.up.railway.app';
    if (!apiUrl) throw new Error('VITE_PRESENTON_API_URL is missing from .env');

    toast.info('Activating AI Editor...');

    const res = await fetch(`${apiUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: prompt,
        n_slides: slides,
        language: 'English',
        template: 'modern',
        theme: theme,
        export_as: 'pptx',
      })
    });

    if (!res.ok) {
      throw new Error('Luxury servers are warming up. Please try again in 30 seconds.');
    }

    const data = await res.json();
    return {
      downloadUrl: data.path || data.downloadUrl,
      editUrl: data.edit_path || '',
      presentationId: data.presentation_id || '',
    };
  }

  const handleGenerateClick = async () => {
    if (!propertyText.trim()) {
      toast.error('Please provide some property details to begin.');
      return;
    }
    setStep('B');
    try {
      const resp = await generatePresentation();
      setResult(resp);

      // Save to Supabase
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        await supabase.from('presentations' as any).insert({
          user_id: userData.user.id,
          title: propertyText.slice(0, 50) || 'Luxury Presentation',
          theme: theme,
          content: {
            presentation_id: resp.presentationId,
            edit_url: resp.editUrl,
            download_url: resp.downloadUrl
          }
        });
      }
      
      setStep('C');
      toast.success('In-App Studio Ready!');
    } catch (err: any) {
      toast.error(err.message || 'Luxury servers are warming up. Please try again in 30 seconds.');
      setStep('A');
    }
  };

  const constructDownloadUrl = (url: string) => {
    if (!url) return '';
    const apiUrl = import.meta.env.VITE_PRESENTON_API_URL || 'https://presenton-production-4e76.up.railway.app';
    return url.startsWith('http') ? url : `${apiUrl}${url}`;
  };

  const handleDownloadPptx = () => {
    if (!result?.downloadUrl) return;
    const a = document.createElement('a');
    a.href = constructDownloadUrl(result.downloadUrl);
    a.download = `property-presentation.pptx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadPdf = () => {
    if (!result?.downloadUrl) return;
    // Assuming the proxy can also return a PDF format if we replaced the extension
    // Because we export as pptx natively, we'll download the PPTX or prompt an editor save
    toast.info('Downloading presentation format...');
    const a = document.createElement('a');
    a.href = constructDownloadUrl(result.downloadUrl);
    a.download = `property-presentation`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] font-sans">
      {/* FORM PHASE (Centered Mobile-First Logic) */}
      {step === 'A' && (
        <div className="max-w-[480px] w-full mx-auto p-4 md:p-6 pb-20">
          <header className="flex items-center gap-4 mb-8">
            <button onClick={() => navigate('/dashboard/presentations')} className="w-10 h-10 bg-white border border-[#EBEBEB] flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors shrink-0">
              <ArrowLeft size={20} className="text-[#111111]" />
            </button>
            <h1 className="text-[20px] font-bold text-[#111111]">Design Presentation</h1>
          </header>

          <div className="flex flex-col gap-6">
            
            {/* Photos Section */}
            <div className="bg-white p-5 rounded-[16px] border border-[#EBEBEB] shadow-sm">
              <h2 className="text-[15px] font-semibold text-[#111111] mb-1">Add Photos</h2>
              <p className="text-[13px] text-[#888888] mb-4">High-res images make the best slides</p>
              
              {photoUrls.length === 0 ? (
                <label className="flex flex-col items-center justify-center h-[140px] border-2 border-dashed border-[#EBEBEB] rounded-[12px] cursor-pointer hover:border-[#111111] hover:bg-gray-50 transition-colors">
                  <Camera size={28} className="text-[#CCCCCC] mb-2" />
                  <span className="text-[14px] font-medium text-[#111111]">Upload Images</span>
                  <input type="file" multiple accept="image/*" onChange={handlePhotos} className="hidden" />
                </label>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {photoUrls.map((url, i) => (
                    <div key={i} className="relative aspect-square rounded-[10px] overflow-hidden group">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => removePhoto(i)} className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center opacity-100 hover:bg-black transition-colors">
                        <X size={12} className="text-white" />
                      </button>
                    </div>
                  ))}
                  <label className="aspect-square rounded-[10px] border-2 border-dashed border-[#EBEBEB] flex items-center justify-center cursor-pointer hover:border-[#111111] bg-gray-50 transition-colors">
                    <Plus size={20} className="text-[#888888]" />
                    <input type="file" multiple accept="image/*" onChange={handlePhotos} className="hidden" />
                  </label>
                </div>
              )}
            </div>

            {/* Property Details Section */}
            <div className="bg-white p-5 rounded-[16px] border border-[#EBEBEB] shadow-sm flex flex-col gap-4">
              <h2 className="text-[15px] font-semibold text-[#111111]">Property Details</h2>
              <textarea
                value={propertyText}
                onChange={(e) => setPropertyText(e.target.value)}
                placeholder="About the property, address, standout features..."
                className="w-full bg-[#F7F7F7] border border-transparent rounded-[12px] p-3.5 text-[14px] text-[#111111] placeholder:text-[#888888] focus:outline-none focus:border-[#111111] focus:bg-white transition-colors"
                style={{ minHeight: '100px', resize: 'vertical' }}
              />
              <div className="flex gap-3">
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Price (e.g. ₹3.5 Cr)"
                  className="flex-1 bg-[#F7F7F7] border border-transparent rounded-[12px] h-11 px-3.5 text-[14px] focus:outline-none focus:border-[#111111] focus:bg-white transition-colors"
                />
                <input
                  value={bhk}
                  onChange={(e) => setBhk(e.target.value)}
                  placeholder="Config (e.g. 3 BHK)"
                  className="flex-1 bg-[#F7F7F7] border border-transparent rounded-[12px] h-11 px-3.5 text-[14px] focus:outline-none focus:border-[#111111] focus:bg-white transition-colors"
                />
              </div>
              <input
                value={amenities}
                onChange={(e) => setAmenities(e.target.value)}
                placeholder="Amenities (Pool, Gym, Parking...)"
                className="w-full bg-[#F7F7F7] border border-transparent rounded-[12px] h-11 px-3.5 text-[14px] focus:outline-none focus:border-[#111111] focus:bg-white transition-colors"
              />
            </div>

            {/* Broker Agent Details */}
            <div className="bg-white p-5 rounded-[16px] border border-[#EBEBEB] shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <h2 className="text-[15px] font-semibold text-[#111111]">Broker Contact Slide</h2>
                <Sparkles size={14} className="text-[#1A5C3A]" />
              </div>
              <input
                value={brokerName}
                onChange={(e) => setBrokerName(e.target.value)}
                placeholder="Agent Name"
                className="w-full bg-[#F7F7F7] border border-transparent rounded-[12px] h-11 px-3.5 text-[14px] focus:outline-none focus:border-[#111111] focus:bg-white transition-colors"
              />
              <div className="flex gap-3">
                <input
                  value={brokerPhone}
                  onChange={(e) => setBrokerPhone(e.target.value)}
                  placeholder="Phone Number"
                  className="flex-1 bg-[#F7F7F7] border border-transparent rounded-[12px] h-11 px-3.5 text-[14px] focus:outline-none focus:border-[#111111] focus:bg-white transition-colors"
                />
                <input
                  value={brokerAgency}
                  onChange={(e) => setBrokerAgency(e.target.value)}
                  placeholder="Agency Name"
                  className="flex-1 bg-[#F7F7F7] border border-transparent rounded-[12px] h-11 px-3.5 text-[14px] focus:outline-none focus:border-[#111111] focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* AI Theme Selectors */}
            <div className="px-1">
              <label className="text-[14px] font-semibold text-[#111111] block mb-3">Studio Theme</label>
              <div className="flex flex-wrap gap-2">
                {THEMES.map(t => (
                  <button
                    key={t.value}
                    onClick={() => setTheme(t.value)}
                    className={`h-10 px-4 rounded-full text-[13px] font-medium border transition-colors ${theme === t.value ? 'bg-[#1A5C3A] text-white border-[#1A5C3A]' : 'bg-white text-[#555555] border-[#EBEBEB] hover:bg-gray-50'}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-1 mb-6">
              <label className="text-[14px] font-semibold text-[#111111] block mb-3">Slide Count</label>
              <div className="flex gap-2">
                {SLIDE_COUNTS.map(c => (
                  <button
                    key={c}
                    onClick={() => setSlides(c)}
                    className={`h-10 px-6 rounded-full text-[13px] font-medium border transition-colors ${slides === c ? 'bg-[#1A5C3A] text-white border-[#1A5C3A]' : 'bg-white text-[#555555] border-[#EBEBEB] hover:bg-gray-50'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerateClick}
            className="w-full h-[56px] relative overflow-hidden bg-[#1A5C3A] text-white rounded-[16px] font-bold text-[16px] flex items-center justify-center gap-2 hover:bg-[#14482D] transition-all mt-8 shadow-md hover:shadow-lg active:scale-[0.98]"
          >
            Launch Studio Generator &rarr;
          </button>
        </div>
      )}

      {/* LOADING PHASE */}
      {step === 'B' && (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#1A5C3A] mb-6" />
          <h2 className="text-[20px] font-bold text-[#111111] mb-2">Activating AI Art Director...</h2>
          <p className="text-[14px] text-[#888888]">Engineering your luxury deck. This takes about 30-60 seconds.</p>
        </div>
      )}

      {/* STUDIO PREVIEW PHASE (In-App Editor) */}
      {step === 'C' && result && (
        <div className="flex flex-col h-screen overflow-hidden bg-[#F7F7F7]">
          {/* Studio Header */}
          <header className="h-[64px] shrink-0 bg-white border-b border-[#EBEBEB] flex items-center justify-between px-6 shadow-sm z-10 w-full">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/dashboard/presentations')} className="w-9 h-9 border border-[#EBEBEB] flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors">
                <ArrowLeft size={18} className="text-[#111111]" />
              </button>
              <h1 className="text-[16px] font-bold text-[#111111] hidden sm:block">Presentation Studio</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadPdf}
                className="h-10 px-4 bg-white border-2 border-[#1A5C3A] text-[#1A5C3A] rounded-[10px] font-semibold text-[13px] flex items-center justify-center gap-2 hover:bg-[#F2F8F4] transition-colors shadow-sm"
              >
                <FileDown size={16} />
                <span className="hidden sm:inline">Export PDF</span>
              </button>
              <button
                onClick={handleDownloadPptx}
                className="h-10 px-5 bg-[#1A5C3A] text-white rounded-[10px] font-semibold text-[13px] flex items-center justify-center gap-2 hover:bg-[#14482D] transition-colors shadow-sm"
              >
                <FileType2 size={16} />
                <span className="hidden sm:inline">Export PPTX</span>
                <span className="sm:hidden">PPTX</span>
              </button>
            </div>
          </header>

          {/* Iframe Workspace */}
          <div className="flex-1 w-full bg-[#EAEAEA] relative overflow-hidden">
            {result.editUrl ? (
              <iframe 
                src={result.editUrl} 
                className="w-full h-full border-none"
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                title="Presenton Editor Studio"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-20 h-20 bg-white rounded-[20px] flex items-center justify-center mb-6 shadow-sm text-[#1A5C3A]">
                  <Sparkles size={32} />
                </div>
                <h2 className="text-[20px] font-bold text-[#111111] mb-2">Editor Initializing...</h2>
                <p className="text-[14px] text-[#888888]">We couldn't load the direct web iframe, but your presentation is ready.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
