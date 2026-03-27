import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, FileDown, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

interface SlideImage {
  url?: string;
}

interface Slide {
  id: string;
  slide_number: number;
  title: string;
  description: string;
  bullet_points: string[];
  image?: SlideImage;
  image_url?: string;
}

interface PresentationResultProps {
  presentationId: string;
  presentationData: any;
  presenton_url: string;
  onCreateAnother: () => void;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function PresentationResult({
  presentationId,
  presentationData,
  presenton_url,
  onCreateAnother,
}: PresentationResultProps) {
  const slides: Slide[] = presentationData?.slides || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [editedSlides, setEditedSlides] = useState<Slide[]>([...slides]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState<'pptx' | 'pdf' | null>(null);

  // Touch / Swipe
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const slideContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEditedSlides([...slides]);
  }, [presentationData]);

  const currentSlide = editedSlides[currentIndex];

  const goNext = () => setCurrentIndex(i => Math.min(i + 1, editedSlides.length - 1));
  const goPrev = () => setCurrentIndex(i => Math.max(i - 1, 0));

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].screenX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
  };

  const getSlideImageUrl = (slide: Slide) => {
    return slide.image?.url || slide.image_url || null;
  };

  const updateSlideField = (field: keyof Slide, value: any) => {
    setEditedSlides(prev => {
      const copy = [...prev];
      copy[currentIndex] = { ...copy[currentIndex], [field]: value };
      return copy;
    });
  };

  const updateBulletPoint = (bulletIndex: number, value: string) => {
    setEditedSlides(prev => {
      const copy = [...prev];
      const bullets = [...(copy[currentIndex].bullet_points || [])];
      bullets[bulletIndex] = value;
      copy[currentIndex] = { ...copy[currentIndex], bullet_points: bullets };
      return copy;
    });
  };

  const saveSlideChanges = async () => {
    if (!currentSlide?.id) return;
    setIsSaving(true);
    try {
      const res = await fetch(
        `${presenton_url}/api/v1/ppt/presentation/${presentationId}/slides/${currentSlide.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: currentSlide.title,
            description: currentSlide.description,
            bullet_points: currentSlide.bullet_points,
          }),
        }
      );
      if (!res.ok) throw new Error('Save failed');
      toast.success('Saved!');
    } catch {
      toast.error('Could not save. Try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = async (format: 'pptx' | 'pdf') => {
    setIsDownloading(format);
    try {
      let blob: Blob | null = null;
      // Try export endpoint first
      const r1 = await fetch(
        `${presenton_url}/api/v1/ppt/presentation/${presentationId}/export?format=${format}`
      );
      if (r1.ok) {
        blob = await r1.blob();
      } else {
        // Fallback to download endpoint
        const r2 = await fetch(
          `${presenton_url}/api/v1/ppt/presentation/${presentationId}/download?format=${format}`
        );
        if (r2.ok) {
          blob = await r2.blob();
        }
      }
      if (blob && blob.size > 0) {
        triggerDownload(blob, `presentation.${format}`);
        toast.success(`${format.toUpperCase()} downloaded!`);
      } else {
        throw new Error('Empty response');
      }
    } catch {
      toast.error(`Download failed. Please try again.`);
    } finally {
      setIsDownloading(null);
    }
  };

  if (!editedSlides.length) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <p className="text-[#888] text-sm">No slides found.</p>
      </div>
    );
  }

  const imgUrl = getSlideImageUrl(currentSlide);

  return (
    <div className="min-h-screen bg-[#F7F7F7] font-['DM_Sans',sans-serif] flex flex-col pb-[100px]">
      {/* ── TOP BAR ── */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#EBEBEB] flex items-center justify-between px-4 h-[56px]">
        <button
          onClick={onCreateAnother}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#F7F7F7] transition-colors"
        >
          <ArrowLeft size={20} className="text-[#111]" />
        </button>
        <h1 className="text-[16px] font-bold text-[#111]">Your Presentation</h1>
        <button
          onClick={() => handleDownload('pptx')}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#F7F7F7] transition-colors"
        >
          <FileDown size={20} className="text-[#111]" />
        </button>
      </header>

      {/* ── SLIDE VIEWER ── */}
      <div className="px-4 pt-4">
        <div
          ref={slideContainerRef}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative w-full rounded-2xl overflow-hidden shadow-sm border border-[#EBEBEB] bg-white"
          style={{ paddingTop: '56.25%' }}
        >
          <div className="absolute inset-0">
            {imgUrl ? (
              <>
                <img
                  src={imgUrl}
                  alt={currentSlide.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#1A5C3A] to-[#0D3320]" />
            )}

            {/* Slide content overlay */}
            <div className="absolute inset-0 flex flex-col justify-end p-5">
              <span className="text-[11px] font-bold text-white/50 tracking-widest uppercase mb-2">
                {String(currentIndex + 1).padStart(2, '0')} / {String(editedSlides.length).padStart(2, '0')}
              </span>
              <h2 className="text-[20px] font-bold text-white leading-tight mb-1.5">
                {currentSlide.title}
              </h2>
              {currentSlide.description && (
                <p className="text-[14px] text-white/85 leading-relaxed line-clamp-3">
                  {currentSlide.description}
                </p>
              )}
              {currentSlide.bullet_points?.length > 0 && !currentSlide.description && (
                <ul className="mt-1 space-y-0.5">
                  {currentSlide.bullet_points.slice(0, 3).map((bp, i) => (
                    <li key={i} className="text-[13px] text-white/80">• {bp}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Prev / Next arrows */}
            {currentIndex > 0 && (
              <button
                onClick={goPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
              >
                <ChevronLeft size={18} className="text-[#111]" />
              </button>
            )}
            {currentIndex < editedSlides.length - 1 && (
              <button
                onClick={goNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
              >
                <ChevronRight size={18} className="text-[#111]" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation dots */}
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {editedSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`rounded-full transition-all duration-200 ${
                i === currentIndex
                  ? 'w-6 h-2 bg-[#1A5C3A]'
                  : 'w-2 h-2 bg-[#D1D1D1] hover:bg-[#999]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* ── EDIT PANEL ── */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-bold text-[#111]">
              Edit Slide {currentIndex + 1}
            </h3>
            <button
              onClick={saveSlideChanges}
              disabled={isSaving}
              className="h-8 px-3 bg-[#1A5C3A] text-white text-[12px] font-semibold rounded-lg flex items-center gap-1.5 hover:bg-[#14482D] transition-colors disabled:opacity-60"
            >
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <label className="text-[12px] font-medium text-[#888] block mb-1">Slide Title</label>
              <input
                value={currentSlide.title || ''}
                onChange={e => updateSlideField('title', e.target.value)}
                className="w-full h-10 px-3 bg-[#F7F7F7] border border-transparent rounded-xl text-[14px] text-[#111] focus:outline-none focus:border-[#1A5C3A] focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="text-[12px] font-medium text-[#888] block mb-1">Description</label>
              <textarea
                value={currentSlide.description || ''}
                onChange={e => updateSlideField('description', e.target.value)}
                className="w-full px-3 py-2.5 bg-[#F7F7F7] border border-transparent rounded-xl text-[14px] text-[#111] focus:outline-none focus:border-[#1A5C3A] focus:bg-white transition-colors"
                style={{ minHeight: '72px', resize: 'vertical' }}
              />
            </div>

            {currentSlide.bullet_points?.length > 0 && (
              <div>
                <label className="text-[12px] font-medium text-[#888] block mb-1">Key Points</label>
                <div className="flex flex-col gap-2">
                  {currentSlide.bullet_points.map((bp, i) => (
                    <input
                      key={i}
                      value={bp}
                      onChange={e => updateBulletPoint(i, e.target.value)}
                      className="w-full h-10 px-3 bg-[#F7F7F7] border border-transparent rounded-xl text-[14px] text-[#111] focus:outline-none focus:border-[#1A5C3A] focus:bg-white transition-colors"
                      placeholder={`Point ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── DOWNLOAD BAR ── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[#EBEBEB]" style={{ padding: '16px 20px 32px' }}>
        <div className="flex gap-3 max-w-[480px] mx-auto">
          <button
            onClick={() => handleDownload('pptx')}
            disabled={!!isDownloading}
            className="flex-1 h-[48px] bg-[#1A5C3A] text-white rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 active:scale-[0.97] transition-all disabled:opacity-60"
          >
            {isDownloading === 'pptx' ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <FileDown size={18} />
            )}
            ⬇ PPTX
          </button>
          <button
            onClick={() => handleDownload('pdf')}
            disabled={!!isDownloading}
            className="flex-1 h-[48px] bg-white border-2 border-[#1A5C3A] text-[#1A5C3A] rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 active:scale-[0.97] transition-all disabled:opacity-60"
          >
            {isDownloading === 'pdf' ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <FileDown size={18} />
            )}
            ⬇ PDF
          </button>
        </div>
      </div>
    </div>
  );
}
