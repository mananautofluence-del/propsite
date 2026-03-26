import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, FileDown, ExternalLink, FileType2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const THEMES = [
  { label: 'Warm', value: 'edge-yellow' },
  { label: 'Dark', value: 'professional-dark' },
  { label: 'Light', value: 'light-rose' },
  { label: 'Blue', value: 'professional-blue' },
];

const SLIDE_COUNTS = [6, 7, 8];

export default function CreatePresentation() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'A' | 'B' | 'C'>('A');
  const [propertyText, setPropertyText] = useState('');
  const [theme, setTheme] = useState('edge-yellow');
  const [slides, setSlides] = useState(7);
  
  const [result, setResult] = useState<{ downloadUrl: string; editUrl: string; presentationId: string } | null>(null);
  const [isPdfLoading, setIsPdfLoading] = useState(false);

  async function generatePresentation(format: 'pptx' | 'pdf') {
    const prompt = `Create a professional real estate property presentation for Indian real estate brokers.\n\nProperty Details:\n${propertyText}\n\nRequirements:\n- Elegant, clean and professional design\n- Include slides for: property overview, key highlights, features and amenities, location advantages, photo showcase, contact details\n- Keep text concise and impactful\n- Use Indian price formatting (Lakhs/Crores)\n- Tone: confident, trustworthy, premium`;

    const key = import.meta.env.VITE_PRESENTON_KEY;
    if (!key) throw new Error('Presenton API Key is missing from .env');

    const res = await fetch('https://api.presenton.ai/api/v1/ppt/presentation/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        content: prompt,
        n_slides: slides,
        language: 'English',
        theme: theme,
        export_as: format,
      })
    });

    if (!res.ok) {
      console.error(await res.text());
      throw new Error('Generation failed via Presenton API');
    }

    const data = await res.json();
    return {
      downloadUrl: data.path,
      editUrl: data.edit_path,
      presentationId: data.presentation_id,
    };
  }

  const handleGenerateClick = async () => {
    if (!propertyText.trim()) {
      toast.error('Please enter property details');
      return;
    }
    setStep('B');
    try {
      const resp = await generatePresentation('pptx');
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
    } catch (err: any) {
      toast.error(err.message || 'Generation failed');
      setStep('A');
    }
  };

  const handleDownloadPptx = async () => {
    if (!result?.downloadUrl) return;
    try {
      const res = await fetch(result.downloadUrl);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `property-presentation.pptx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error('Failed to download PPTX');
    }
  };

  const handleDownloadPdf = async () => {
    setIsPdfLoading(true);
    toast.info('Requesting PDF render...');
    try {
      // Re-run the API just for the PDF export format string as requested
      const resp = await generatePresentation('pdf');
      const res = await fetch(resp.downloadUrl);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `property-presentation.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('PDF Downloaded');
    } catch (err: any) {
      toast.error(err.message || 'Failed to download PDF');
    } finally {
      setIsPdfLoading(false);
    }
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
            <h2 className="text-[20px] font-bold text-[#111111] mb-2">Building your presentation...</h2>
            <p className="text-[14px] text-[#888888]">This takes about 30 seconds</p>
          </div>
        )}

        {step === 'C' && (
          <div className="flex-1 flex flex-col p-6 items-center justify-center">
            <div className="w-16 h-16 bg-[#1A5C3A] rounded-[20px] flex items-center justify-center mb-6 shadow-sm">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            
            <h2 className="text-[22px] font-bold text-[#111111] mb-10 text-center">
              Your Presentation is Ready!
            </h2>

            <div className="w-full flex flex-col gap-3 mb-10">
              <button
                onClick={handleDownloadPptx}
                className="w-full h-[52px] bg-[#111111] text-white rounded-[14px] font-semibold text-[15px] flex items-center justify-center gap-2 hover:bg-[#333333] transition-colors shadow-sm"
              >
                <FileType2 size={18} />
                Download PPTX
              </button>
              
              <button
                onClick={() => window.open(result?.editUrl, '_blank')}
                className="w-full h-[52px] bg-white text-[#111111] border-2 border-[#EBEBEB] rounded-[14px] font-semibold text-[15px] flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
              >
                <ExternalLink size={18} />
                Edit Online
              </button>

              <button
                onClick={handleDownloadPdf}
                disabled={isPdfLoading}
                className="w-full h-[52px] bg-white text-[#111111] border-2 border-[#EBEBEB] rounded-[14px] font-semibold text-[15px] flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {isPdfLoading ? <Loader2 size={18} className="animate-spin" /> : <FileDown size={18} />}
                {isPdfLoading ? 'Generating PDF...' : 'Download PDF'}
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
