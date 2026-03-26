import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, FileType2, FileDown, Camera, X, Plus, Sparkles, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const HUGGINGFACE_URL = 'https://manan345345435-propsite.hf.space';

const THEMES = [
  { label: 'Signature Aura', value: 'faint_yellow' },
  { label: 'Midnight Estate', value: 'dark' },
  { label: 'Editorial Cream', value: 'cream' },
  { label: 'Glass & Steel', value: 'royal_blue' },
];

const SLIDE_COUNTS = [3, 4, 5];

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
  const [theme, setTheme] = useState('cream');
  const [slides, setSlides] = useState(5);
  
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
    // Build photo URLs first
    const uploadedPhotoUrls = await uploadPhotos();

    // Build the prompt
    let prompt = `Create a professional luxury real estate property presentation for Indian real estate brokers.\n\n`;
    prompt += `Property Details:\n${propertyText}\n\n`;
    if (price) prompt += `Price: ${price}\n`;
    if (bhk) prompt += `Configuration: ${bhk}\n`;
    if (amenities) prompt += `Key Amenities: ${amenities}\n\n`;

    if (brokerName || brokerPhone || brokerAgency) {
      prompt += `Broker Contact (MUST appear on contact slide):\n`;
      if (brokerName) prompt += `Name: ${brokerName}\n`;
      if (brokerPhone) prompt += `Phone: ${brokerPhone}\n`;
      if (brokerAgency) prompt += `Agency: ${brokerAgency}\n`;
      prompt += '\n';
    }

    if (uploadedPhotoUrls.length > 0) {
      prompt += `Property Photos (embed these in slides):\n`;
      prompt += uploadedPhotoUrls.join('\n') + '\n\n';
    }

    prompt += `Requirements:
- Elegant, premium luxury design
- Slides: property overview, key highlights, amenities, photo showcase, contact details
- Keep text concise and highly impactful
- Use Indian price formatting (Lakhs/Crores)
- Tone: confident, premium, trustworthy
- This is a high-value property for discerning buyers
- STRICT RULE: DO NOT search for, generate, or add any stock images (no Pexels). ONLY use the images provided in the "Property Photos" section above.`;

    toast.info('Activating AI Art Director (Speed Mode)...');

    const res = await fetch(
      `${HUGGINGFACE_URL}/api/v1/ppt/presentation/generate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: prompt,
          n_slides: slides,
          language: 'English',
          theme: theme,
          export_as: 'pptx',
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error('Presenton error:', res.status, errText);
      
      if (res.status === 503 || res.status === 502) {
        throw new Error('Server is warming up. Please try again in 30 seconds.');
      }
      if (res.status === 429) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      }
      throw new Error(`Generation failed (${res.status}). Please try again.`);
    }

    const data = await res.json();
    console.log('Presenton response:', data);

    // Handle both absolute and relative paths in response
    const rawPath = data.path || data.file_path || '';
    const downloadUrl = rawPath.startsWith('http') 
      ? rawPath 
      : `${HUGGINGFACE_URL}${rawPath}`;

    const rawEditPath = data.edit_path || '';
    const editUrl = rawEditPath.startsWith('http')
      ? rawEditPath
      : `${HUGGINGFACE_URL}${rawEditPath}`;

    return {
      downloadUrl,
      editUrl,
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
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error(
          'Request timed out. The server may be waking up — please try again.'
        )), 120000) // 2 minute timeout
      );

      const resp = await Promise.race([
        generatePresentation(),
        timeoutPromise
      ]) as { downloadUrl: string; editUrl: string; presentationId: string };

      setResult(resp);

      // Save to Supabase
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user && resp.presentationId) {
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

  const handleDownloadPptx = async () => {
    if (!result?.downloadUrl) return;
    try {
      toast.info('Downloading your presentation...');
      // Fetch as blob to handle CORS properly
      const response = await fetch(result.downloadUrl);
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `property-presentation-${Date.now()}.pptx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Downloaded!');
    } catch (err) {
      console.error('Download error:', err);
      // Fallback: direct link
      window.open(result.downloadUrl, '_blank');
    }
  };

  const handleDownloadPdf = async () => {
    if (!result?.downloadUrl) return;
    try {
      toast.info('Downloading presentation (PDF attempt by system)...');
      window.open(result.downloadUrl, '_blank');
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] font-sans">
      {/* FORM PHASE */}
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

          {/* External Workspace Portal to bypass X-Frame-Options */}
          <div className="flex-1 w-full bg-[#EAEAEA] flex items-center justify-center p-6 bg-cover bg-center" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #F7F7F7 0%, #EAEAEA 100%)' }}>
            <div className="bg-white p-8 rounded-[24px] max-w-md w-full text-center shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-[#EBEBEB]">
              <div className="w-20 h-20 bg-[#F2F8F4] rounded-[20px] flex items-center justify-center mx-auto mb-6 text-[#1A5C3A] shadow-sm">
                <Sparkles size={36} />
              </div>
              <h2 className="text-[22px] font-bold text-[#111111] mb-2">Your Luxury Deck is Ready</h2>
              <p className="text-[14px] text-[#888888] mb-8 leading-relaxed">
                The AI Art Director has finished composing your presentation. We've prepared a secure external studio for you to make live edits.
              </p>
              
              {result.editUrl ? (
                <button
                  onClick={() => {
                    if (result.editUrl) {
                      window.open(result.editUrl, '_blank');
                    } else {
                      // Fallback: open Presenton dashboard
                      window.open(
                        `${HUGGINGFACE_URL}/presentation/${result.presentationId}`,
                        '_blank'
                      );
                    }
                  }}
                  className="w-full h-[56px] relative overflow-hidden bg-[#1A5C3A] text-white rounded-[16px] font-bold text-[16px] flex items-center justify-center gap-2 hover:bg-[#14482D] transition-all shadow-md active:scale-[0.98]"
                >
                  Enter Studio <ExternalLink size={18} />
                </button>
              ) : (
                <button disabled className="w-full h-[56px] bg-gray-100 text-[#888888] rounded-[16px] font-bold text-[16px] cursor-not-allowed">
                  Generating Links...
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
