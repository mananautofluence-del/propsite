import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, FileType2 } from 'lucide-react';
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
  const [propertyText, setPropertyText] = useState('');
  const [theme, setTheme] = useState('edge-yellow');
  const [slides, setSlides] = useState(7);
  
  const [result, setResult] = useState<{ downloadUrl: string; editUrl: string; presentationId: string } | null>(null);

  async function generatePresentation() {
    const prompt = `Create a professional real estate property presentation for Indian real estate brokers.\n\nProperty Details:\n${propertyText}\n\nRequirements:\n- Elegant, clean and professional design\n- Include slides for: property overview, key highlights, features and amenities, location advantages, photo showcase, contact details\n- Keep text concise and impactful\n- Use Indian price formatting (Lakhs/Crores)\n- Tone: confident, trustworthy, premium`;

    const apiUrl = import.meta.env.VITE_PRESENTON_API_URL;
    if (!apiUrl) throw new Error('VITE_PRESENTON_API_URL is missing from .env');

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
      toast.error('Please enter property details');
      return;
    }
    setStep('B');
    try {
      const resp = await generatePresentation();
      setResult(resp);

      // Save to Supabase using the 'content' JSONB field to hold the extra data
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        await supabase.from('presentations').insert({
          user_id: userData.user.id,
          title: propertyText.slice(0, 60),
          theme: theme,
          content: {
            presentation_id: resp.presentationId,
            edit_url: resp.editUrl,
            download_url: resp.downloadUrl
          }
        });
      }
      
      setStep('C');
      toast.success('Presentation ready!');
      
      // Auto-trigger download
      if (resp.downloadUrl) {
        const fullUrl = resp.downloadUrl.startsWith('http') 
          ? resp.downloadUrl 
          : `${import.meta.env.VITE_PRESENTON_API_URL}${resp.downloadUrl}`;
        const a = document.createElement('a');
        a.href = fullUrl;
        a.download = `property-presentation.pptx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err: any) {
      toast.error(err.message || 'Luxury servers are warming up. Please try again in 30 seconds.');
      setStep('A');
    }
  };

  const handleDownloadPptx = () => {
    if (!result?.downloadUrl) return;
    const fullUrl = result.downloadUrl.startsWith('http') 
      ? result.downloadUrl 
      : `${import.meta.env.VITE_PRESENTON_API_URL}${result.downloadUrl}`;
    const a = document.createElement('a');
    a.href = fullUrl;
    a.download = `property-presentation.pptx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] font-sans pb-10">
      <div className="max-w-[390px] w-full mx-auto bg-[#F7F7F7] min-h-screen relative flex flex-col">
        {step === 'A' && (
          <div className="flex flex-col flex-1 p-6">
            <header className="flex items-center gap-4 mb-8">
              <button onClick={() => navigate('/dashboard/presentations')} className="w-10 h-10 bg-white border border-[#EBEBEB] flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors shrink-0">
                <ArrowLeft size={20} className="text-[#111111]" />
              </button>
              <h1 className="text-[20px] font-bold text-[#111111]">Create Presentation</h1>
            </header>

            <div className="flex-1 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-semibold text-[#111111]">Property Details</label>
                <textarea
                  value={propertyText}
                  onChange={(e) => setPropertyText(e.target.value)}
                  placeholder="Paste anything — address, price, BHK, amenities, location. AI will sort it out."
                  className="w-full bg-white border border-[#EBEBEB] rounded-[14px] p-4 text-[15px] text-[#111111] placeholder:text-[#888888] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111]"
                  style={{ minHeight: '160px', resize: 'vertical' }}
                />
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-[14px] font-semibold text-[#111111]">Theme</label>
                <div className="flex gap-2">
                  {THEMES.map(t => (
                    <button
                      key={t.value}
                      onClick={() => setTheme(t.value)}
                      className={`flex-1 h-10 rounded-full text-[13px] font-medium border transition-colors ${theme === t.value ? 'bg-[#111111] text-white border-[#111111]' : 'bg-white text-[#555555] border-[#EBEBEB] hover:bg-gray-50'}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 mb-8">
                <label className="text-[14px] font-semibold text-[#111111]">Slides Count</label>
                <div className="flex gap-2">
                  {SLIDE_COUNTS.map(c => (
                    <button
                      key={c}
                      onClick={() => setSlides(c)}
                      className={`h-10 px-6 rounded-full text-[13px] font-medium border transition-colors ${slides === c ? 'bg-[#111111] text-white border-[#111111]' : 'bg-white text-[#555555] border-[#EBEBEB] hover:bg-gray-50'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerateClick}
              className="w-full h-[52px] bg-[#111111] text-white rounded-[14px] font-semibold text-[16px] flex items-center justify-center gap-2 hover:bg-[#333333] transition-colors mt-auto shrink-0 shadow-sm"
            >
              Generate Presentation &rarr;
            </button>
          </div>
        )}

        {step === 'B' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#111111] mb-6" />
            <h2 className="text-[20px] font-bold text-[#111111] mb-2">Activating AI Art Director...</h2>
            <p className="text-[14px] text-[#888888]">Engineering your 16:9 luxury deck. This may take 30-60 seconds.</p>
          </div>
        )}

        {step === 'C' && (
          <div className="flex-1 flex flex-col p-6 items-center justify-center">
            <div className="w-24 h-24 bg-[#111111] rounded-full flex items-center justify-center mb-8 shadow-md">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            
            <h2 className="text-[26px] font-bold text-[#111111] mb-12 text-center">
              Your Presentation is Ready!
            </h2>

            <div className="w-full flex flex-col gap-3 mb-12">
              <button
                onClick={handleDownloadPptx}
                className="w-full h-[56px] bg-[#111111] text-white rounded-[14px] font-semibold text-[16px] flex items-center justify-center gap-2 hover:bg-[#333333] transition-colors shadow-sm"
              >
                <FileType2 size={20} />
                Download Editable PPTX
              </button>
            </div>

            <button
              onClick={() => {
                setPropertyText('');
                setResult(null);
                setStep('A');
              }}
              className="text-[14px] font-medium text-[#888888] underline underline-offset-4 hover:text-[#111111] transition-colors"
            >
              Create Another
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
