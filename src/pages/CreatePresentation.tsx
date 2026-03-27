import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Camera, X, Plus, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const PRESENTON_URL = import.meta.env.VITE_PRESENTON_URL || 'https://manan345345435-propsite.hf.space';

const THEMES = [
  { label: 'Signature Aura', value: 'faint_yellow' },
  { label: 'Midnight Estate', value: 'dark' },
  { label: 'Editorial Cream', value: 'cream' },
  { label: 'Glass & Steel', value: 'royal_blue' },
];

const SLIDE_COUNTS = [3, 4, 5, 6];

export default function CreatePresentation() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'FORM' | 'LOADING' | 'RESULT'>('FORM');

  // Form State
  const [propertyText, setPropertyText] = useState('');
  const [price, setPrice] = useState('');
  const [bhk, setBhk] = useState('');
  const [amenities, setAmenities] = useState('');
  const [brokerName, setBrokerName] = useState('');
  const [brokerPhone, setBrokerPhone] = useState('');
  const [brokerAgency, setBrokerAgency] = useState('');
  const [reraNumber, setReraNumber] = useState('');

  // Photos State
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

  // Generation Settings
  const [theme, setTheme] = useState('cream');
  const [slides, setSlides] = useState(6);

  // Result State
  const [presentationId, setPresentationId] = useState<string | null>(null);
  const [presentationData, setPresentationData] = useState<any | null>(null);
  const [editorUrl, setEditorUrl] = useState('');
  const [pptxUrl, setPptxUrl] = useState('');

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

      if (uploadErr) continue;
      const { data: { publicUrl } } = supabase.storage
        .from('listing-photos')
        .getPublicUrl(filePath);
      urls.push(publicUrl);
    }
    return urls;
  }

  const generatePresentation = async () => {
    if (!propertyText.trim()) {
      toast.error('Please provide property details');
      return;
    }

    setStep('LOADING');
    try {
      const uploadedPhotoUrls = await uploadPhotos();

      const prompt = `Create a professional real estate property presentation for Indian real estate brokers.

Property Details:
${propertyText}
${price ? `Price: ${price}` : ''}
${bhk ? `Config: ${bhk}` : ''}
${amenities ? `Amenities: ${amenities}` : ''}

Broker: ${brokerName}
Phone: ${brokerPhone}  
Agency: ${brokerAgency}
RERA: ${reraNumber}

Property Photos:
${uploadedPhotoUrls.join('\n')}

Requirements:
- Elegant, clean and professional design
- Include slides for: property overview, key highlights, features and amenities, location advantages, photo showcase, contact details
- Keep text concise and impactful
- Use Indian price formatting (Lakhs/Crores)
- Tone: confident, trustworthy, premium
- NO stock images. ONLY use provided photos.`;

      const formData = new FormData();
      formData.append('content', prompt);
      formData.append('language', 'English');
      formData.append('n_slides', slides.toString());
      formData.append('theme', theme);
      
      images.forEach((img) => {
        formData.append('images', img.file);
      });

      console.log('=== Sending to Presenton (FormData) ===');

      const res = await fetch(`${PRESENTON_URL}/api/v1/ppt/presentation/generate`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error('Generation failed:', res.status, errText);
        throw new Error(`Generation failed: ${res.status}`);
      }

      const data = await res.json();
      console.log('=== Generate API response ===', JSON.stringify(data));

      const presId = 
        data?.presentation_id || 
        data?.id || 
        data?.presentationId;

      if (!presId) {
        throw new Error('No ID returned: ' + JSON.stringify(data));
      }

      // Build the editor URL from edit_path field
      // Presenton returns: edit_path = "/presentation?id=UUID"
      const editPath = data?.edit_path || data?.editPath || '';
      const editorUrl = editPath.startsWith('http') 
        ? editPath 
        : `${PRESENTON_URL}${editPath || `/presentation?id=${presId}`}`;

      // Build direct PPTX download URL from path field  
      // Presenton returns: path = "/static/user_data/UUID/filename.pptx"
      const pptxPath = data?.path || data?.file_path || '';
      const pptxUrl = pptxPath.startsWith('http')
        ? pptxPath
        : `${PRESENTON_URL}${pptxPath}`;

      console.log('Editor URL:', editorUrl);
      console.log('PPTX URL:', pptxUrl);

      // Save to Supabase
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        try {
          await supabase.from('presentations' as any).insert({
            user_id: userData.user.id,
            title: propertyText.split('\n')[0].slice(0, 60),
            presentation_id: presId,
            presenton_url: PRESENTON_URL,
            created_at: new Date().toISOString()
          });
        } catch (e) {
          console.log('Supabase error:', e);
        }
      }

      setEditorUrl(editorUrl);
      setPptxUrl(pptxUrl);
      setPresentationId(presId);
      setStep('RESULT');
      toast.success('Presentation Ready!');
    } catch (err: any) {
      console.error('Generation error:', err);
      toast.error(err.message || 'Failed to generate. Please try again.');
      setStep('FORM');
    }
  };

  // ─── RESULT SCREEN ───
  if (step === 'RESULT') {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#F7F7F7',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
        fontFamily: 'DM Sans, sans-serif',
      }}>
        {/* Success icon */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          backgroundColor: '#F0FBF4',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 24,
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
            stroke="#1A5C3A" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 22, fontWeight: 700, color: '#111',
          marginBottom: 8, textAlign: 'center',
        }}>
          Presentation Ready!
        </h1>
        <p style={{
          fontSize: 14, color: '#888', textAlign: 'center',
          marginBottom: 40, maxWidth: 320, lineHeight: 1.5,
        }}>
          Your AI-generated property presentation is ready.
          Open the editor to view, edit slides, and download.
        </p>

        {/* Primary CTA */}
        <button
          onClick={() => window.open(editorUrl, '_blank')}
          style={{
            width: '100%', maxWidth: 400, height: 56,
            backgroundColor: '#1A5C3A', color: '#FFFFFF',
            borderRadius: 14, border: 'none', cursor: 'pointer',
            fontSize: 16, fontWeight: 700,
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 8,
            marginBottom: 12,
          }}
        >
          Open Editor & Download →
        </button>

        {/* Direct PPTX download */}
        {pptxUrl && (
          <button
            onClick={async () => {
              try {
                const r = await fetch(pptxUrl);
                if (r.ok) {
                  const blob = await r.blob();
                  const a = document.createElement('a');
                  a.href = URL.createObjectURL(blob);
                  a.download = 'property-presentation.pptx';
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                } else {
                  window.open(pptxUrl, '_blank');
                }
              } catch {
                window.open(pptxUrl, '_blank');
              }
            }}
            style={{
              width: '100%', maxWidth: 400, height: 48,
              backgroundColor: 'white', color: '#1A5C3A',
              borderRadius: 14, border: '2px solid #1A5C3A',
              cursor: 'pointer', fontSize: 15, fontWeight: 600,
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 8,
              marginBottom: 32,
            }}
          >
            ⬇ Download PPTX Directly
          </button>
        )}

        {/* Create another */}
        <button
          onClick={() => {
            setStep('FORM');
            setPropertyText('');
            setEditorUrl('');
            setPptxUrl('');
            setPresentationId('');
          }}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#1A5C3A', fontSize: 14, textDecoration: 'underline',
          }}
        >
          ← Create Another Presentation
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] font-sans">
      {/* STEP 1: FORM */}
      {step === 'FORM' && (
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
            </div>

            {/* Details Section */}
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
                <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price (e.g. ₹3.5 Cr)" className="flex-1 bg-[#F7F7F7] border border-transparent rounded-[12px] h-11 px-3.5 text-[14px] focus:outline-none focus:border-[#111111] focus:bg-white transition-colors" />
                <input value={bhk} onChange={(e) => setBhk(e.target.value)} placeholder="Config (e.g. 3 BHK)" className="flex-1 bg-[#F7F7F7] border border-transparent rounded-[12px] h-11 px-3.5 text-[14px] focus:outline-none focus:border-[#111111] focus:bg-white transition-colors" />
              </div>
              <input value={amenities} onChange={(e) => setAmenities(e.target.value)} placeholder="Amenities (Pool, Gym, Parking...)" className="w-full bg-[#F7F7F7] border border-transparent rounded-[12px] h-11 px-3.5 text-[14px] focus:outline-none focus:border-[#111111] focus:bg-white transition-colors" />
            </div>

            {/* Broker Section */}
            <div className="bg-white p-5 rounded-[16px] border border-[#EBEBEB] shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <h2 className="text-[15px] font-semibold text-[#111111]">Broker Contact Slide</h2>
                <Sparkles size={14} className="text-[#1A5C3A]" />
              </div>
              <input value={brokerName} onChange={(e) => setBrokerName(e.target.value)} placeholder="Agent Name" className="w-full bg-[#F7F7F7] border border-transparent rounded-[12px] h-11 px-3.5 text-[14px] focus:outline-none focus:border-[#111111] focus:bg-white transition-colors" />
              <div className="flex gap-3">
                <input value={brokerPhone} onChange={(e) => setBrokerPhone(e.target.value)} placeholder="Phone Number" className="flex-1 bg-[#F7F7F7] border border-transparent rounded-[12px] h-11 px-3.5 text-[14px] focus:outline-none focus:border-[#111111] focus:bg-white transition-colors" />
                <input value={brokerAgency} onChange={(e) => setBrokerAgency(e.target.value)} placeholder="Agency Name" className="flex-1 bg-[#F7F7F7] border border-transparent rounded-[12px] h-11 px-3.5 text-[14px] focus:outline-none focus:border-[#111111] focus:bg-white transition-colors" />
              </div>
              <input value={reraNumber} onChange={(e) => setReraNumber(e.target.value)} placeholder="RERA Number" className="w-full bg-[#F7F7F7] border border-transparent rounded-[12px] h-11 px-3.5 text-[14px] focus:outline-none focus:border-[#111111] focus:bg-white transition-colors" />
            </div>

            {/* Options */}
            <div className="px-1">
              <label className="text-[14px] font-semibold text-[#111111] block mb-3">Studio Theme</label>
              <div className="flex flex-wrap gap-2">
                {THEMES.map(t => (
                  <button key={t.value} onClick={() => setTheme(t.value)} className={`h-10 px-4 rounded-full text-[13px] font-medium border transition-colors ${theme === t.value ? 'bg-[#1A5C3A] text-white border-[#1A5C3A]' : 'bg-white text-[#555555] border-[#EBEBEB] hover:bg-gray-50'}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-1 mb-6">
              <label className="text-[14px] font-semibold text-[#111111] block mb-3">Slide Count</label>
              <div className="flex gap-2">
                {SLIDE_COUNTS.map(c => (
                  <button key={c} onClick={() => setSlides(c)} className={`h-10 px-6 rounded-full text-[13px] font-medium border transition-colors ${slides === c ? 'bg-[#1A5C3A] text-white border-[#1A5C3A]' : 'bg-white text-[#555555] border-[#EBEBEB] hover:bg-gray-50'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={generatePresentation}
            className="w-full h-[56px] bg-[#1A5C3A] text-white rounded-[16px] font-bold text-[16px] flex items-center justify-center gap-2 hover:bg-[#14482D] transition-all mt-8 shadow-md"
          >
            Generate Presentation &rarr;
          </button>
        </div>
      )}

      {/* STEP 2: LOADING */}
      {step === 'LOADING' && (
        <div className="min-h-screen bg-[#F7F7F7] flex flex-col items-center justify-center p-6 text-center">
          <div className="relative mb-8">
            <Loader2 className="w-16 h-16 animate-spin text-[#1A5C3A]" />
          </div>
          <h2 className="text-[20px] font-bold text-[#111111] mb-2">Generating your presentation...</h2>
          <p className="text-[14px] text-[#888888] mb-12">This takes 20–30 seconds</p>

          <div className="w-full max-w-[280px] h-1.5 bg-[#EBEBEB] rounded-full overflow-hidden absolute bottom-20">
            <div className="h-full bg-[#1A5C3A] animate-[loading_20s_ease-in-out_infinite]" style={{ width: '40%' }}></div>
          </div>
          <style>{`
            @keyframes loading {
              0% { width: 0%; }
              50% { width: 70%; }
              100% { width: 95%; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
