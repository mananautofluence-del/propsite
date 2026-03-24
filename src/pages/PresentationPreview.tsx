import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StoredPresentation, SlideData, ThemeConfig, PresentationPhoto } from '@/lib/presentationTypes';
import { ArrowLeft, Download, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { createRoot } from 'react-dom/client';

// Slide blocks
import HeroCover from '@/components/presentation-blocks/HeroCover';
import SplitLeftImage from '@/components/presentation-blocks/SplitLeftImage';
import SplitRightImage from '@/components/presentation-blocks/SplitRightImage';
import FeaturesGrid from '@/components/presentation-blocks/FeaturesGrid';
import FullGallery from '@/components/presentation-blocks/FullGallery';
import ContactCard from '@/components/presentation-blocks/ContactCard';

function getSlideComponent(layout: string) {
  switch (layout) {
    case 'hero-cover': return HeroCover;
    case 'split-left-image': return SplitLeftImage;
    case 'split-right-image': return SplitRightImage;
    case 'features-grid': return FeaturesGrid;
    case 'full-gallery': return FullGallery;
    case 'contact-card': return ContactCard;
    default: return SplitLeftImage;
  }
}

export default function PresentationPreview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [stored, setStored] = useState<StoredPresentation | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [exporting, setExporting] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const all = JSON.parse(localStorage.getItem('propsite_presentations') || '[]');
      const found = all.find((p: any) => p.id === id);
      if (found) {
        setStored(found);
      } else {
        toast.error('Presentation not found');
        navigate('/dashboard/presentations');
      }
    } catch (e) {
      console.error('Failed to load presentation:', e);
      toast.error('Presentation not found');
      navigate('/dashboard/presentations');
    }
    setLoading(false);
  }, [id, navigate]);

  // Dynamic Google Fonts injection
  useEffect(() => {
    if (!stored?.presentation?.theme) return;
    const { headingFont, bodyFont } = stored.presentation.theme;
    const fonts = [...new Set([headingFont, bodyFont])].filter(Boolean);
    const families = fonts.map(f => f.replace(/ /g, '+')).join('&family=');
    const linkId = 'dynamic-google-fonts';
    let link = document.getElementById(linkId) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    link.href = `https://fonts.googleapis.com/css2?family=${families}:wght@400;500;600;700;800&display=swap`;
  }, [stored]);

  // Scale the preview container
  useEffect(() => {
    const handleResize = () => {
      const container = document.getElementById('preview-frame');
      if (container?.parentElement) {
        const scale = container.parentElement.clientWidth / 1080;
        container.style.setProperty('--preview-scale', scale.toString());
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeSlideIdx]);

  // Build photos array
  const photos: PresentationPhoto[] = (stored?.photo_urls || []).map((url, i) => ({
    url,
    tag: stored?.photo_tags?.[i] || 'other',
    orderIndex: i
  }));

  // PDF Export
  const handleExportPDF = async () => {
    if (!stored?.presentation) return;
    setExporting(true);
    toast.info('Generating PDF...');

    try {
      const { theme, slides } = stored.presentation;
      const pdf = new jsPDF({ orientation: 'p', unit: 'px', format: [1080, 1080] });

      for (let i = 0; i < slides.length; i++) {
        if (i > 0) pdf.addPage([1080, 1080]);

        const slide = slides[i];
        const SlideBlock = getSlideComponent(slide.layout);

        const offscreen = document.createElement('div');
        offscreen.style.position = 'fixed';
        offscreen.style.left = '-9999px';
        offscreen.style.top = '0';
        offscreen.style.width = '1080px';
        offscreen.style.height = '1080px';
        document.body.appendChild(offscreen);

        const root = createRoot(offscreen);
        await new Promise<void>(resolve => {
          root.render(<SlideBlock data={slide} theme={theme} photos={photos} />);
          setTimeout(resolve, 800);
        });

        const canvas = await html2canvas(offscreen, {
          width: 1080, height: 1080, scale: 2,
          useCORS: true, allowTaint: true, logging: false
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.92);
        pdf.addImage(imgData, 'JPEG', 0, 0, 1080, 1080);

        root.unmount();
        document.body.removeChild(offscreen);
      }

      pdf.save(`${stored.title || 'presentation'}.pdf`);
      toast.success('PDF downloaded!');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to export PDF');
    }
    setExporting(false);
  };

  // Loading state
  if (loading || !stored?.presentation) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-4">
        <Loader2 className="animate-spin mr-2 text-[#888888]" /> Loading preview...
      </div>
    );
  }

  const { theme, slides } = stored.presentation;
  const activeSlide = slides[activeSlideIdx] || slides[0];
  const SlideBlock = getSlideComponent(activeSlide.layout);

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col font-sans">
      {/* Top Bar */}
      <div className="bg-white border-b border-[#EBEBEB] px-4 md:px-8 h-14 flex items-center justify-between sticky top-0 md:top-14 z-30">
        <button onClick={() => navigate('/dashboard/presentations')} className="flex items-center gap-1 text-[14px] text-[#555555] font-medium hover:text-[#111111] transition-colors">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="text-[14px] font-semibold text-[#111111]">
          {stored.title || 'Presentation'} — Slide {activeSlideIdx + 1}/{slides.length}
        </div>
        <button
          onClick={handleExportPDF}
          disabled={exporting}
          className="bg-[#1A5C3A] hover:bg-[#14482D] disabled:opacity-50 text-white text-[13px] font-semibold h-8 px-4 rounded-lg flex items-center gap-1.5 transition-colors"
        >
          {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
          {exporting ? 'Exporting...' : 'PDF'}
        </button>
      </div>

      {/* Main Preview */}
      <div className="flex-1 flex flex-col items-center p-4 md:p-8 gap-4 md:gap-6">
        {/* Slide Canvas */}
        <div className="w-full max-w-[600px] mx-auto">
          <div style={{ width: '100%', aspectRatio: '1 / 1', position: 'relative', overflow: 'hidden', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
            <div
              id="preview-frame"
              style={{
                position: 'absolute', top: 0, left: 0,
                width: 1080, height: 1080,
                transform: 'scale(var(--preview-scale, 0.5))',
                transformOrigin: 'top left',
                pointerEvents: 'none'
              }}
            >
              <SlideBlock data={activeSlide} theme={theme} photos={photos} />
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveSlideIdx(Math.max(0, activeSlideIdx - 1))}
            disabled={activeSlideIdx === 0}
            className="w-10 h-10 rounded-full bg-white border border-[#EBEBEB] disabled:opacity-30 flex items-center justify-center hover:bg-[#F5F5F5] transition-colors shadow-sm"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Dot Indicators */}
          <div className="flex gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveSlideIdx(i)}
                className="transition-all"
                style={{
                  width: activeSlideIdx === i ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: activeSlideIdx === i ? theme.accentColor : '#DDDCDC'
                }}
              />
            ))}
          </div>

          <button
            onClick={() => setActiveSlideIdx(Math.min(slides.length - 1, activeSlideIdx + 1))}
            disabled={activeSlideIdx === slides.length - 1}
            className="w-10 h-10 rounded-full bg-white border border-[#EBEBEB] disabled:opacity-30 flex items-center justify-center hover:bg-[#F5F5F5] transition-colors shadow-sm"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Thumbnail Strip */}
        <div className="flex gap-2 overflow-x-auto py-1 px-1 max-w-full">
          {slides.map((slide, i) => {
            const ThumbBlock = getSlideComponent(slide.layout);
            return (
              <button
                key={i}
                onClick={() => setActiveSlideIdx(i)}
                className={`flex-shrink-0 w-[72px] h-[72px] rounded-lg overflow-hidden border-2 transition-all ${
                  activeSlideIdx === i ? 'border-[#1A5C3A] shadow-md' : 'border-[#EBEBEB] opacity-60 hover:opacity-100'
                }`}
              >
                <div style={{ 
                  transform: 'scale(0.0667)', transformOrigin: 'top left', 
                  width: 1080, height: 1080, pointerEvents: 'none' 
                }}>
                  <ThumbBlock data={slide} theme={theme} photos={photos} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
