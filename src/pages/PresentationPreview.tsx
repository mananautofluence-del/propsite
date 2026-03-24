import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Presentation, PageType } from '@/lib/presentationTypes';
import { ArrowLeft, Download, MessageCircle, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { createRoot } from 'react-dom/client';

// Lazy loading themes to avoid circular dependencies
import PenthouseTheme from '@/components/themes/PenthouseTheme';
import SignatureTheme from '@/components/themes/SignatureTheme';
import EstateTheme from '@/components/themes/EstateTheme';
import CorporateTheme from '@/components/themes/CorporateTheme';
import HighStreetTheme from '@/components/themes/HighStreetTheme';
import LogisticsTheme from '@/components/themes/LogisticsTheme';

function getThemeComponent(themeName: string) {
  switch (themeName) {
    case 'penthouse': return PenthouseTheme;
    case 'signature': return SignatureTheme;
    case 'estate': return EstateTheme;
    case 'corporate': return CorporateTheme;
    case 'highstreet': return HighStreetTheme;
    case 'logistics': return LogisticsTheme;
    default: return SignatureTheme;
  }
}

export default function PresentationPreview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePageIdx, setActivePageIdx] = useState(0);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    supabase.from('presentations').select('*').eq('id', id).single().then(({ data, error }) => {
      if (error || !data) {
        toast.error('Presentation not found');
        navigate('/dashboard/presentations');
      } else {
        setPresentation(data as Presentation);
      }
      setLoading(false);
    });
  }, [id, navigate]);

  if (loading || !presentation) {
    return <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-4 text-[#888888]"><Loader2 className="animate-spin mr-2" /> Loading preview...</div>;
  }

  const pages = presentation.pages;
  const activePage = pages[activePageIdx];
  const ThemeComponent = getThemeComponent(presentation.theme);
  
  // Reconstruct photos array for the theme
  const photos = presentation.photo_urls.map((url, i) => ({
    url,
    tag: presentation.photo_tags[i] as any,
    orderIndex: i
  }));

  const handleExportPDF = async () => {
    setExporting(true);
    toast.info('Generating high-quality PDF. This may take a minute...');
    
    try {
      const pageTypes = presentation.pages;
      
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.top = '-9999px';
      container.style.left = '-9999px';
      container.style.width = '1080px';
      container.style.height = '1080px';
      container.style.overflow = 'hidden';
      document.body.appendChild(container);

      // Square A-format approximation: 210x210mm
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [210, 210] });

      for (let i = 0; i < pageTypes.length; i++) {
        const pageType = pageTypes[i];
        
        const rootContainer = document.createElement('div');
        container.appendChild(rootContainer);
        const root = createRoot(rootContainer);
        
        // Wait for rendering and image loading
        await new Promise<void>(resolve => {
          root.render(
            <ThemeComponent 
              content={presentation.content} 
              pageType={pageType} 
              photos={photos} 
              format={presentation.format} 
            />
          );
          setTimeout(resolve, 800);
        });

        const canvas = await html2canvas(container, {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          backgroundColor: null,
          width: 1080,
          height: 1080,
          logging: false
        });

        if (i > 0) pdf.addPage([210, 210]);
        
        const imgData = canvas.toDataURL('image/jpeg', 0.92);
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 210);
        
        root.unmount();
        container.innerHTML = ''; // clear for next page
      }

      document.body.removeChild(container);

      const filename = (presentation.title || 'Presentation')
        .replace(/[^a-zA-Z0-9]/g, '_')
        .toLowerCase() + '_propsite.pdf';
      
      pdf.save(filename);
      toast.success('PDF downloaded successfully!');
      
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF');
    } finally {
      setExporting(false);
    }
  };

  const shareOnWhatsApp = async () => {
    await handleExportPDF();
    const text = "Here's the property presentation: ";
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans flex flex-col pt-14 pb-24 md:pt-0 md:pb-0">
      
      {/* Top Header */}
      <div className="h-[52px] bg-white border-b border-[#EBEBEB] px-4 flex items-center justify-between sticky top-[56px] md:top-0 z-20">
        <button onClick={() => navigate('/dashboard/presentations')} className="text-[#888888] flex items-center text-[14px] hover:text-[#111111]">
          <ArrowLeft size={16} className="mr-1" /> Back
        </button>
        <div className="text-[14px] font-semibold text-[#111111] capitalize">
          {presentation.theme} Preview
        </div>
        <button 
          onClick={handleExportPDF} 
          disabled={exporting}
          className="bg-[#1A5C3A] text-white rounded-lg h-9 px-4 text-[13px] font-semibold flex items-center gap-1.5 disabled:opacity-50"
        >
          {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} 
          <span className="hidden sm:inline">Download PDF</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-[600px] mx-auto p-5 flex flex-col">
        
        {/* Thumbnails Strip */}
        <div className="flex overflow-x-auto gap-3 py-3 px-1 mb-4 hide-scrollbar">
          {pages.map((p, i) => (
            <button
              key={p}
              onClick={() => setActivePageIdx(i)}
              className="flex flex-col items-center gap-1.5 shrink-0"
            >
              <div 
                className={`w-[60px] h-[60px] rounded-lg bg-white overflow-hidden flex items-center justify-center transition-all ${activePageIdx === i ? 'border-2 border-[#1A5C3A] shadow-sm' : 'border border-[#EBEBEB] opacity-70'}`}
              >
                <div style={{ transform: 'scale(0.055)', transformOrigin: 'top left', width: '1080px', height: '1080px', pointerEvents: 'none' }}>
                  <ThemeComponent content={presentation.content} pageType={p} photos={photos} format={presentation.format} />
                </div>
              </div>
              <span className={`text-[10px] uppercase tracking-wide ${activePageIdx === i ? 'font-bold text-[#1A5C3A]' : 'font-semibold text-[#888888]'}`}>{p}</span>
            </button>
          ))}
        </div>

        {/* Active Page Preview Viewer */}
        <div className="relative w-full aspect-square rounded-[16px] overflow-hidden bg-white shadow-[0_8px_32px_rgba(0,0,0,0.15)] mb-6 touch-pan-y">
          
          <button 
            disabled={activePageIdx === 0} 
            onClick={() => setActivePageIdx(i => i - 1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/20 hover:bg-black/40 text-white rounded-full flex items-center justify-center z-10 disabled:opacity-0 transition-all backdrop-blur-sm"
          >
            <ChevronLeft size={24} />
          </button>
          
          <button 
            disabled={activePageIdx === pages.length - 1} 
            onClick={() => setActivePageIdx(i => i + 1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/20 hover:bg-black/40 text-white rounded-full flex items-center justify-center z-10 disabled:opacity-0 transition-all backdrop-blur-sm"
          >
            <ChevronRight size={24} />
          </button>

          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <div 
              style={{
                position: 'absolute', top: 0, left: 0, width: '1080px', height: '1080px',
                transform: 'scale(var(--scale-factor))', 
                transformOrigin: 'top left',
                pointerEvents: 'none'
              }}
              // CSS variable technique to dynamically scale down the 1080px content to match the container width
              ref={(node) => {
                if (node && node.parentElement) {
                  const scale = node.parentElement.clientWidth / 1080;
                  node.style.setProperty('--scale-factor', scale.toString());
                  // Add window resize listener
                  const onResize = () => {
                    const newScale = node.parentElement?.clientWidth ? node.parentElement.clientWidth / 1080 : scale;
                    node.style.setProperty('--scale-factor', newScale.toString());
                  };
                  window.addEventListener('resize', onResize);
                  return () => window.removeEventListener('resize', onResize);
                }
              }}
            >
              <ThemeComponent content={presentation.content} pageType={activePage} photos={photos} format={presentation.format} />
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Fixed Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-[72px] bg-white border-t border-[#EBEBEB] px-5 flex items-center justify-center gap-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] z-30 md:relative md:z-auto">
        <div className="max-w-[600px] w-full flex gap-3">
          <button 
            onClick={shareOnWhatsApp}
            disabled={exporting}
            className="flex-1 bg-white border-[1.5px] border-[#1A5C3A] text-[#1A5C3A] rounded-[12px] h-[46px] flex items-center justify-center gap-2 font-semibold text-[15px] hover:bg-[#F2F8F4] transition-colors disabled:opacity-50"
          >
            <MessageCircle size={18} /> Share on WhatsApp
          </button>
          <button 
            onClick={handleExportPDF}
            disabled={exporting}
            className="flex-1 bg-[#1A5C3A] text-white rounded-[12px] h-[46px] flex items-center justify-center gap-2 font-bold text-[15px] hover:bg-[#14482D] transition-colors disabled:opacity-50"
          >
            {exporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />} 
            Download PDF
          </button>
        </div>
      </div>
      
    </div>
  );
}
