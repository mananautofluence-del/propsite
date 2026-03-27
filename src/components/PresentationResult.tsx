import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, FileDown, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

interface EditData {
  title: string;
  content: string;
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
  useEffect(() => {
    console.log('Full presentation data:', JSON.stringify(presentationData, null, 2));
  }, [presentationData]);

  const slides = 
    presentationData?.slides || 
    presentationData?.presentation?.slides || 
    presentationData?.data?.slides || 
    [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [editData, setEditData] = useState<EditData>({ title: '', content: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState<'pptx' | 'pdf' | null>(null);

  // Touch / Swipe
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const slideContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentSlide = slides[currentIndex];
    if (currentSlide) {
      setEditData({
        title: currentSlide.name || currentSlide.title || currentSlide.heading || '',
        content: currentSlide.content || currentSlide.description || currentSlide.body || ''
      });
    }
  }, [currentIndex, slides]);

  const currentSlide = slides[currentIndex] || {};

  const goNext = () => setCurrentIndex(i => Math.min(i + 1, slides.length - 1));
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

  const imgUrl = 
    currentSlide.images?.[0]?.url || 
    currentSlide.image?.url || 
    currentSlide.image_url || 
    currentSlide.thumbnail || 
    null;

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
            name: editData.title,
            title: editData.title,
            content: editData.content,
            description: editData.content,
          }),
        }
      );
      if (!res.ok) throw new Error('Save failed');
      
      // Update local slide object so it reflects visually without refetch
      currentSlide.name = editData.title;
      currentSlide.title = editData.title;
      currentSlide.content = editData.content;
      currentSlide.description = editData.content;
      
      toast.success('Saved!');
    } catch {
      toast.error('Could not save. Try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Ensure download URLs are exactly as requested:
  // 1. /export?format=pptx
  // 2. /download?format=pptx
  // 3. /download
  const handleDownload = async (format: 'pptx' | 'pdf') => {
    setIsDownloading(format);
    console.log('=== Download attempt ===', { format, presentationId, presenton_url });
    console.log('=== Presentation data for download ===', JSON.stringify(presentationData));

    try {
      let blob: Blob | null = null;

      // Attempt 1: /export?format=
      try {
        const r1 = await fetch(`${presenton_url}/api/v1/ppt/presentation/${presentationId}/export?format=${format}`);
        console.log('Export endpoint status:', r1.status);
        if (r1.ok) blob = await r1.blob();
      } catch (e) { console.log('Export fetch error:', e); }

      // Attempt 2: /download?format=
      if (!blob || blob.size === 0) {
        try {
          const r2 = await fetch(`${presenton_url}/api/v1/ppt/presentation/${presentationId}/download?format=${format}`);
          console.log('Download endpoint status:', r2.status);
          if (r2.ok) blob = await r2.blob();
        } catch (e) { console.log('Download fetch error:', e); }
      }

      // Attempt 3: /download (no query param)
      if (!blob || blob.size === 0) {
        try {
          const r3 = await fetch(`${presenton_url}/api/v1/ppt/presentation/${presentationId}/download`);
          console.log('Download (no param) endpoint status:', r3.status);
          if (r3.ok) blob = await r3.blob();
        } catch (e) { console.log('Download (no param) fetch error:', e); }
      }

      if (blob && blob.size > 0 && blob.type !== 'application/json') { // Ensure not JSON error
        triggerDownload(blob, `presentation.${format}`);
        toast.success(`${format.toUpperCase()} downloaded!`);
      } else {
        console.log('All blob attempts failed, falling back to window.open');
        const fallbackUrl = `${presenton_url}/api/v1/ppt/presentation/${presentationId}/export?format=${format}`;
        window.open(fallbackUrl, '_blank');
        toast.success(`Opening ${format.toUpperCase()} download...`);
      }
    } catch (err) {
      console.error('Download error:', err);
      toast.error(`Download failed. Please try again.`);
    } finally {
      setIsDownloading(null);
    }
  };

  if (!slides.length) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] flex flex-col pt-10 px-4">
        <button onClick={onCreateAnother} className="w-9 h-9 mb-4 flex items-center justify-center rounded-full hover:bg-gray-200 bg-white shadow-sm transition-colors">
          <ArrowLeft size={20} className="text-[#111]" />
        </button>
        <div className="flex-1 flex flex-col items-center justify-center">
          <p className="text-[#888] text-sm mb-4">No slides found in presentation data.</p>
          <pre className="text-xs text-left bg-gray-100 p-4 rounded max-w-full overflow-x-auto">
            {JSON.stringify(presentationData || {}, null, 2).slice(0, 500)}
          </pre>
        </div>
      </div>
    );
  }

  const currentTitle = editData.title || currentSlide?.name || currentSlide?.title || currentSlide?.heading || 'Slide';
  const currentContent = editData.content || currentSlide?.content || currentSlide?.description || currentSlide?.body || '';

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
          style={{ 
            paddingTop: '56.25%', 
            background: imgUrl ? 'transparent' : 'linear-gradient(135deg, #1A5C3A, #0d3320)' 
          }}
        >
          <div className="absolute inset-0">
            {imgUrl && (
              <>
                <img
                  src={imgUrl}
                  alt={currentTitle}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              </>
            )}

            {/* Slide content overlay */}
            <div className="absolute inset-0 flex flex-col justify-between p-4">
              <span className="text-[13px] font-medium text-white/60">
                {String(currentIndex + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
              </span>
              
              <div className="mt-auto">
                <h2 className="text-[18px] font-bold text-white mb-1.5 leading-snug">
                  {currentTitle}
                </h2>
                {currentContent && (
                  <p className="text-[13px] text-white/80 leading-relaxed line-clamp-2">
                    {currentContent}
                  </p>
                )}
              </div>
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
            {currentIndex < slides.length - 1 && (
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
          {slides.map((_, i) => (
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
                value={editData.title}
                onChange={e => setEditData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full h-10 px-3 bg-[#F7F7F7] border border-transparent rounded-xl text-[14px] text-[#111] focus:outline-none focus:border-[#1A5C3A] focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="text-[12px] font-medium text-[#888] block mb-1">Description</label>
              <textarea
                value={editData.content}
                onChange={e => setEditData(prev => ({ ...prev, content: e.target.value }))}
                className="w-full px-3 py-2.5 bg-[#F7F7F7] border border-transparent rounded-xl text-[14px] text-[#111] focus:outline-none focus:border-[#1A5C3A] focus:bg-white transition-colors"
                style={{ minHeight: '72px', resize: 'vertical' }}
              />
            </div>
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
