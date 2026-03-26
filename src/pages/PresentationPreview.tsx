import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { useParams, useNavigate } from 'react-router-dom';
import { StoredPresentation, SlideData, ThemeConfig, PresentationPhoto, GenerativePresentation, SlideLayout } from '@/lib/presentationTypes';
import { ArrowLeft, Download, ChevronLeft, ChevronRight, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import * as htmlToImage from 'html-to-image';
import { supabase } from '@/integrations/supabase/client';

import CoverEditorial from '@/components/presentation-blocks/CoverEditorial';
import StatsTwoCol from '@/components/presentation-blocks/StatsTwoCol';
import ContentImageBottom from '@/components/presentation-blocks/ContentImageBottom';
import HeadlineTwoImages from '@/components/presentation-blocks/HeadlineTwoImages';
import HeadlineNumberedList from '@/components/presentation-blocks/HeadlineNumberedList';
import HeadlineTwoColImages from '@/components/presentation-blocks/HeadlineTwoColImages';
import ImagesTopHeadlineBottom from '@/components/presentation-blocks/ImagesTopHeadlineBottom';
import CenteredNumberedCols from '@/components/presentation-blocks/CenteredNumberedCols';
import ImageLeftHeadlineNumbered from '@/components/presentation-blocks/ImageLeftHeadlineNumbered';
import HeadlineBodyImageNumbered from '@/components/presentation-blocks/HeadlineBodyImageNumbered';
import Headline2x2Numbered from '@/components/presentation-blocks/Headline2x2Numbered';
import Headline2Img2Numbered from '@/components/presentation-blocks/Headline2Img2Numbered';
import TwoImagesHeadlineNumbered from '@/components/presentation-blocks/TwoImagesHeadlineNumbered';
import ImageTopHeadlineNumbered from '@/components/presentation-blocks/ImageTopHeadlineNumbered';
import ContactSplit from '@/components/presentation-blocks/ContactSplit';

const LAYOUT_MIGRATION: Record<string, string> = {
  'hero-cinematic': 'cover-editorial', 'hero-editorial': 'cover-editorial',
  'bento-grid-features': 'headline-2x2-numbered', 'magazine-split': 'content-image-bottom',
  'stats-monumental': 'stats-two-col', 'vision-quote': 'stats-two-col', 
  'gallery-masonry': 'two-images-headline-numbered', 'contact-minimal': 'contact-split',
};

function migrateLayout(layout: string): string { return LAYOUT_MIGRATION[layout] || layout; }

function getSlideComponent(layout: SlideLayout) {
  const map: Record<string, React.ComponentType<any>> = {
    'cover-editorial': CoverEditorial,
    'stats-two-col': StatsTwoCol,
    'content-image-bottom': ContentImageBottom,
    'headline-two-images': HeadlineTwoImages,
    'headline-numbered-list': HeadlineNumberedList,
    'headline-two-col-images': HeadlineTwoColImages,
    'images-top-headline-bottom': ImagesTopHeadlineBottom,
    'centered-numbered-cols': CenteredNumberedCols,
    'image-left-headline-numbered': ImageLeftHeadlineNumbered,
    'headline-body-image-numbered': HeadlineBodyImageNumbered,
    'headline-2x2-numbered': Headline2x2Numbered,
    'headline-2img-2numbered': Headline2Img2Numbered,
    'two-images-headline-numbered': TwoImagesHeadlineNumbered,
    'image-top-headline-numbered': ImageTopHeadlineNumbered,
    'contact-split': ContactSplit,
  };
  return map[layout] || CoverEditorial;
}

function migratePresentation(pres: any): GenerativePresentation {
  const theme = pres.theme || { backgroundColor: '#F2EDE4', textColor: '#1C2B1E', accentColor: '#8B6E4E', headingFont: 'Cormorant Garamond', bodyFont: 'DM Sans' };
  const slides = (pres.slides || []).map((s: any, i: number) => ({ ...s, id: s.id || `slide-${i}`, layout: migrateLayout(s.layout || 'cover-editorial'), imageTags: s.imageTags || [], eyebrow: s.eyebrow || '' }));
  return { theme, slides };
}

const LAYOUTS: { id: SlideLayout; label: string }[] = [
  { id: 'cover-editorial', label: 'Cover' },
  { id: 'stats-two-col', label: 'Stats' },
  { id: 'content-image-bottom', label: 'Content + Image' },
  { id: 'headline-two-images', label: 'Headline + 2 Img' },
  { id: 'headline-numbered-list', label: 'Numbered List' },
  { id: 'headline-two-col-images', label: '2 Col Images' },
  { id: 'images-top-headline-bottom', label: 'Images Top' },
  { id: 'centered-numbered-cols', label: 'Centered Cols' },
  { id: 'image-left-headline-numbered', label: 'Image Left' },
  { id: 'headline-body-image-numbered', label: 'Complex Grid' },
  { id: 'headline-2x2-numbered', label: '2x2 Grid' },
  { id: 'headline-2img-2numbered', label: '2 Img 2 Nums' },
  { id: 'two-images-headline-numbered', label: '2 Img Left' },
  { id: 'image-top-headline-numbered', label: 'Image Top' },
  { id: 'contact-split', label: 'Contact' },
];

const THEME_PRESETS: (ThemeConfig & { name: string })[] = [
  { name: 'Classic Warm', backgroundColor: '#F5F0E8', textColor: '#1A1A1A', accentColor: '#8B7355', headingFont: 'Cormorant Garamond', bodyFont: 'DM Sans' },
  { name: 'Modern Dark', backgroundColor: '#111111', textColor: '#F5F0E8', accentColor: '#C9A84C', headingFont: 'Playfair Display', bodyFont: 'Plus Jakarta Sans' },
  { name: 'Clean White', backgroundColor: '#FFFFFF', textColor: '#111111', accentColor: '#333333', headingFont: 'DM Serif Display', bodyFont: 'Outfit' },
  { name: 'Coastal Warm', backgroundColor: '#FDF8F2', textColor: '#1A2C3D', accentColor: '#C4714A', headingFont: 'Fraunces', bodyFont: 'Jost' },
];
const HEADING_FONTS = ['Cormorant Garamond', 'Playfair Display', 'DM Serif Display', 'Fraunces', 'Libre Baskerville'];
const BODY_FONTS = ['DM Sans', 'Plus Jakarta Sans', 'Outfit', 'Jost', 'Inter'];
const haptic = () => { if (navigator.vibrate) navigator.vibrate(10); };

export default function PresentationPreview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [stored, setStored] = useState<StoredPresentation | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [presentationData, setPresentationData] = useState<GenerativePresentation | null>(null);
  const [editingSlideIndex, setEditingSlideIndex] = useState<number | null>(null);
  const [showThemeEditor, setShowThemeEditor] = useState(false);
  const [showRegenSheet, setShowRegenSheet] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenInstruction, setRegenInstruction] = useState('');
  const [isRewriting, setIsRewriting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalJson, setOriginalJson] = useState('');
  const [fontsLoaded, setFontsLoaded] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const slideInnerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    try {
      const all = JSON.parse(localStorage.getItem('propsite_presentations') || '[]');
      const found = all.find((p: any) => p.id === id);
      if (found) {
        const migrated = migratePresentation(found.presentation);
        setStored(found); setPresentationData(migrated); setOriginalJson(JSON.stringify(migrated));
      } else { toast.error('Not found'); navigate('/dashboard/presentations'); }
    } catch { navigate('/dashboard/presentations'); }
    setLoading(false);
  }, [id, navigate]);

  useEffect(() => {
    if (!presentationData?.theme) return;
    setFontsLoaded(false);
    const { headingFont, bodyFont } = presentationData.theme;
    const families = [...new Set([headingFont, bodyFont])].filter(Boolean).map(f => f.replace(/ /g, '+')).join('&family=');
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${families}:wght@400;500;600;700;800&display=swap`;
    link.onload = () => { document.fonts.ready.then(() => setFontsLoaded(true)); };
    document.head.appendChild(link);
    const timer = setTimeout(() => setFontsLoaded(true), 3000);
    return () => clearTimeout(timer);
  }, [presentationData?.theme]);

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const w = containerRef.current.offsetWidth;
        setScale(w / 1456);
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => { document.body.style.overflow = (editingSlideIndex !== null || showThemeEditor || showRegenSheet) ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [editingSlideIndex, showThemeEditor, showRegenSheet]);
  useEffect(() => { if (presentationData && originalJson) setHasChanges(JSON.stringify(presentationData) !== originalJson); }, [presentationData, originalJson]);
  useEffect(() => {
    if (!stored || !presentationData || !hasChanges) return;
    const all = JSON.parse(localStorage.getItem('propsite_presentations') || '[]');
    const idx = all.findIndex((p: any) => p.id === stored.id);
    if (idx >= 0) { all[idx] = { ...all[idx], presentation: presentationData, title: presentationData.slides[0]?.headline || all[idx].title }; localStorage.setItem('propsite_presentations', JSON.stringify(all)); }
  }, [presentationData]);

  const photos: PresentationPhoto[] = (stored?.photo_urls || []).map((url, i) => ({ url, tag: stored?.photo_tags?.[i] || 'other', orderIndex: i }));

  const updateSlide = (index: number, updates: Partial<SlideData>) => { setPresentationData(prev => prev ? ({ ...prev, slides: prev.slides.map((s, i) => i === index ? { ...s, ...updates } : s) }) : prev); };
  const updateTheme = (updates: Partial<ThemeConfig>) => { setPresentationData(prev => prev ? ({ ...prev, theme: { ...prev.theme, ...updates } }) : prev); };

  const rewriteSlide = async (index: number) => {
    const K = import.meta.env.VITE_CLAUDE_API_KEY; if (!K || !presentationData) return;
    setIsRewriting(true); haptic();
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'x-api-key': K, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true', 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 2000, system: 'Rewrite ONLY text fields of this slide JSON to be more evocative and premium. Keep layout, id, imageTags. Output ONLY the JSON.', messages: [{ role: 'user', content: JSON.stringify(presentationData.slides[index]) }] }) });
      const d = await r.json(); const t = (d.content?.[0]?.text || '').replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const ns = JSON.parse(t) as SlideData;
      updateSlide(index, { headline: ns.headline, subheadline: ns.subheadline, bodyText: ns.bodyText });
      toast.success('Rewritten!');
    } catch { toast.error('Rewrite failed'); }
    setIsRewriting(false);
  };

  const regenerateAll = async () => {
    const K = import.meta.env.VITE_CLAUDE_API_KEY; if (!K) return;
    setIsRegenerating(true); setShowRegenSheet(false); haptic();
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'x-api-key': K, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true', 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 8000,
          system: `Regenerate this presentation. User wants: "${regenInstruction}". Keep property facts. Output ONLY valid JSON: { theme: ThemeConfig, slides: SlideData[] }. Layouts from presentationTypes ONLY. 6-8 slides. VARY layouts. Never repeat same layout consecutively.`,
          messages: [{ role: 'user', content: JSON.stringify(presentationData) }] }) });
      const d = await r.json(); const t = (d.content?.[0]?.text || '').replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const np = JSON.parse(t) as GenerativePresentation;
      if (np.theme && np.slides?.length) { setPresentationData(np); setActiveSlideIdx(0); toast.success('Regenerated!'); } else throw 0;
    } catch { toast.error('Failed'); }
    setIsRegenerating(false); setRegenInstruction('');
  };

  const handleExportPDF = async () => {
    if (!presentationData || !stored) return;
    setExporting(true);
    toast.info('Exporting PDF...');

    try {
      const { theme, slides } = presentationData;

      // Fonts are already loaded in the document from
      // the existing useEffect. This resolves instantly.
      await document.fonts.ready;

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [1456, 816],
        compress: true,
      });

      for (let i = 0; i < slides.length; i++) {
        if (i > 0) pdf.addPage([1456, 816], 'landscape');

        // Create a clean container OUTSIDE the React tree
        // position:fixed, off-screen, no parent overflow:hidden
        const container = document.createElement('div');
        container.style.cssText = [
          'position:fixed',
          'top:0',
          'left:0',
          'width:1456px',
          'height:816px',
          'overflow:visible',
          'z-index:-1',        // behind everything, not visible
          'opacity:0',         // invisible but still renders
          'pointer-events:none',
        ].join(';');
        document.body.appendChild(container);

        // Render this specific slide into the container
        const slideRoot = createRoot(container);
        const SlideComp = getSlideComponent(slides[i].layout);

        await new Promise<void>(resolve => {
          slideRoot.render(
            React.createElement(SlideComp, {
              data: slides[i],
              theme,
              photos,
              pageNumber: i + 1,
            })
          );
          // Fonts already loaded = fast paint
          // 600ms is enough for images to load from cache/browser
          setTimeout(resolve, 600);
        });

        // Wait for any images in this slide
        const imgs = Array.from(container.querySelectorAll('img'));
        await Promise.all(imgs.map(img => {
          if (img.complete && img.naturalWidth > 0) return Promise.resolve();
          return new Promise<void>(res => {
            const t = setTimeout(res, 4000);
            img.onload = () => { clearTimeout(t); res(); };
            img.onerror = () => { clearTimeout(t); res(); };
          });
        }));

        // One frame to ensure paint
        await new Promise(r => requestAnimationFrame(r));

        // Capture — container is at position fixed top:0 left:0
        // so x:0 y:0 maps exactly to the slide content
        const dataUrl = await htmlToImage.toJpeg(container, {
          quality: 0.95,
          width: 1456,
          height: 816,
          backgroundColor: theme.backgroundColor,
          pixelRatio: 1,
          skipFonts: false,
        });

        pdf.addImage(dataUrl, 'JPEG', 0, 0, 1456, 816);

        // Clean up
        slideRoot.unmount();
        document.body.removeChild(container);
      }

      const filename = (stored.title || 'presentation')
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase();
      pdf.save(`${filename}.pdf`);
      toast.success('PDF downloaded!');

    } catch (err: any) {
      console.error('Export error:', err);
      toast.error('Export failed: ' + (err.message || 'Try again'));
    }

    setExporting(false);
  };

  if (loading || !presentationData) return <div style={{ minHeight: '100vh', background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter,sans-serif', color: '#888' }}><Loader2 className="animate-spin" style={{ marginRight: 8 }} /> Loading...</div>;

  const { theme, slides } = presentationData;
  const activeSlide = slides[activeSlideIdx] || slides[0];
  const SB = getSlideComponent(activeSlide.layout);
  const es = editingSlideIndex !== null ? slides[editingSlideIndex] : null;
  const inputStyle: React.CSSProperties = { width: '100%', backgroundColor: '#2A2A2A', color: '#FFF', border: '1px solid #333', borderRadius: 10, padding: 12, fontSize: 16, lineHeight: 1.5, fontFamily: '"DM Sans",sans-serif', boxSizing: 'border-box', outline: 'none', resize: 'vertical' };

  const Sheet = ({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) => {
    if (!open) return null;
    return (<>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 999 }} />
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#1A1A1A', borderRadius: '20px 20px 0 0', padding: '24px 20px 40px', zIndex: 1000, maxHeight: '75vh', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <div style={{ width: 36, height: 4, backgroundColor: '#444', borderRadius: 999, margin: '0 auto 20px' }} />
        {children}
      </div>
    </>);
  };
  const SL = ({ t }: { t: string }) => <div style={{ fontSize: 11, color: '#666', letterSpacing: '1.5px', textTransform: 'uppercase' as const, marginBottom: 8, marginTop: 20 }}>{t}</div>;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F5F5F5', display: 'flex', flexDirection: 'column', fontFamily: '"DM Sans",Inter,sans-serif' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#FFF', borderBottom: '1px solid #EBEBEB', padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 30 }}>
        <button onClick={() => navigate('/dashboard/presentations')} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, color: '#555', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}><ArrowLeft size={16} /> Back</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: theme.headingFont, fontSize: 15, fontWeight: 600, color: '#111', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stored?.title || 'Presentation'}</span>
          <span style={{ backgroundColor: '#F0F0F0', borderRadius: 999, padding: '3px 10px', fontSize: 12, color: '#555', fontWeight: 600 }}>{activeSlideIdx + 1}/{slides.length}</span>
        </div>
        <button onClick={() => { haptic(); handleExportPDF(); }} disabled={exporting} style={{ background: '#1A5C3A', color: '#fff', fontSize: 13, fontWeight: 600, height: 32, padding: '0 14px', borderRadius: 8, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, opacity: exporting ? 0.5 : 1, position: 'relative' }}>
          {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} Export
          {hasChanges && <div style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: '50%', backgroundColor: '#EF4444' }} />}
        </button>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 8, padding: '12px 16px', justifyContent: 'center' }}>
        <button onClick={() => { haptic(); setShowThemeEditor(true); }} style={{ backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 999, padding: '8px 16px', fontSize: 13, border: '1px solid rgba(0,0,0,0.08)', cursor: 'pointer', fontWeight: 500 }}>🎨 Theme</button>
        <button onClick={() => { haptic(); setShowRegenSheet(true); }} style={{ backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 999, padding: '8px 16px', fontSize: 13, border: '1px solid rgba(0,0,0,0.08)', cursor: 'pointer', fontWeight: 500 }}>✨ Regenerate</button>
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 16px 16px', gap: 16 }}>
        <div style={{ width: '100%', maxWidth: 800, margin: '0 auto', position: 'relative' }}>
          <div style={{
            width: '100%',
            paddingTop: '56.04%',
            position: 'relative',
            borderRadius: 12,
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            opacity: fontsLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}>
            <div ref={containerRef} style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              overflow: 'hidden',
            }}>
              <div
                ref={slideInnerRef}
                style={{
                  width: '1456px', height: '816px',
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left',
                  position: 'absolute', top: 0, left: 0,
                }}
              >
                <SB data={activeSlide} theme={theme} photos={photos} pageNumber={activeSlideIdx + 1} />
              </div>
            </div>
          </div>
          <button onClick={() => { haptic(); setEditingSlideIndex(activeSlideIdx); }} style={{ position: 'absolute', bottom: 16, right: 16, width: 44, height: 44, borderRadius: '50%', backgroundColor: theme.accentColor, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', zIndex: 10 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
          </button>
        </div>

        {/* Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => { haptic(); setActiveSlideIdx(Math.max(0, activeSlideIdx - 1)); }} disabled={activeSlideIdx === 0} style={{ width: 40, height: 40, borderRadius: '50%', background: '#fff', border: '1px solid #EBEBEB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: activeSlideIdx === 0 ? 0.3 : 1 }}><ChevronLeft size={18} /></button>
          <div style={{ display: 'flex', gap: 6 }}>{slides.map((_, i) => <button key={i} onClick={() => { haptic(); setActiveSlideIdx(i); }} style={{ width: activeSlideIdx === i ? 24 : 8, height: 8, borderRadius: 4, backgroundColor: activeSlideIdx === i ? theme.accentColor : '#DDD', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }} />)}</div>
          <button onClick={() => { haptic(); setActiveSlideIdx(Math.min(slides.length - 1, activeSlideIdx + 1)); }} disabled={activeSlideIdx === slides.length - 1} style={{ width: 40, height: 40, borderRadius: '50%', background: '#fff', border: '1px solid #EBEBEB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: activeSlideIdx === slides.length - 1 ? 0.3 : 1 }}><ChevronRight size={18} /></button>
        </div>

        {/* Thumbs flex wrap, not scaled down layout */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '4px 0', maxWidth: '100%', WebkitOverflowScrolling: 'touch' }}>
          {slides.map((s, i) => { const T = getSlideComponent(s.layout); return (
            <button key={i} onClick={() => { haptic(); setActiveSlideIdx(i); }} style={{ flexShrink: 0, width: 145, height: 81, borderRadius: 8, overflow: 'hidden', border: activeSlideIdx === i ? `2px solid ${theme.accentColor}` : '2px solid #EBEBEB', cursor: 'pointer', opacity: activeSlideIdx === i ? 1 : 0.6, background: 'none', padding: 0, position: 'relative' }}>
              <div style={{ transform: `scale(${145/1456})`, transformOrigin: 'top left', width: 1456, height: 816, pointerEvents: 'none', position: 'absolute', top: 0, left: 0 }}><T data={s} theme={theme} photos={photos} pageNumber={i + 1} /></div>
            </button>); })}
        </div>
      </div>

      {/* Regen overlay */}
      {isRegenerating && <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 2000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}><div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid #333', borderTopColor: theme.accentColor, animation: 'spin 1s linear infinite' }} /><div style={{ color: '#FFF', fontSize: 18, fontWeight: 600, fontFamily: theme.headingFont }}>Reimagining...</div><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>}

      {/* Edit Sheet */}
      <Sheet open={editingSlideIndex !== null} onClose={() => setEditingSlideIndex(null)}>
        {es && editingSlideIndex !== null && <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ color: '#FFF', fontSize: 18, fontWeight: 600 }}>Edit Slide {editingSlideIndex + 1}</div>
            <button onClick={() => setEditingSlideIndex(null)} style={{ width: 32, height: 32, borderRadius: 8, background: '#333', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} color="#888" /></button>
          </div>
          <SL t="Content" />
          {es.headline !== undefined && <div style={{ marginBottom: 12 }}><div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Headline</div><textarea rows={2} style={inputStyle} value={es.headline || ''} onChange={e => updateSlide(editingSlideIndex, { headline: e.target.value })} /></div>}
          {es.bodyText !== undefined && <div style={{ marginBottom: 12 }}><div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Body</div><textarea rows={3} style={inputStyle} value={es.bodyText || ''} onChange={e => updateSlide(editingSlideIndex, { bodyText: e.target.value })} /></div>}
          {es.stats && <div style={{ marginBottom: 12 }}><div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Stats</div>
            {es.stats.map((st, si) => <div key={si} style={{ display: 'flex', gap: 8, marginBottom: 8, flexDirection: 'column', background: '#222', padding: 12, borderRadius: 8 }}>
              <input style={inputStyle} placeholder={"Value e.g. '30M'"} value={st.value} onChange={e => { const n = [...(es.stats || [])]; n[si].value = e.target.value; updateSlide(editingSlideIndex, { stats: n }); }} />
              <input style={inputStyle} placeholder="Label" value={st.label} onChange={e => { const n = [...(es.stats || [])]; n[si].label = e.target.value; updateSlide(editingSlideIndex, { stats: n }); }} />
            </div>)}
          </div>}
          <SL t="Layout" />
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, WebkitOverflowScrolling: 'touch' }}>
            {LAYOUTS.map(l => <button key={l.id} onClick={() => { haptic(); updateSlide(editingSlideIndex, { layout: l.id }); }} style={{ flexShrink: 0, padding: '10px 16px', borderRadius: 999, fontSize: 13, cursor: 'pointer', border: 'none', fontWeight: 500, backgroundColor: es.layout === l.id ? theme.accentColor : '#2A2A2A', color: es.layout === l.id ? '#FFF' : '#888' }}>{l.label}</button>)}
          </div>
          {photos.length > 0 && <><SL t="Photos" /><div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, WebkitOverflowScrolling: 'touch' }}>
            {photos.map((p, pi) => { const sel = (es.imageTags || []).includes(p.tag); return (
              <button key={pi} onClick={() => { haptic(); const tags = es.imageTags || []; updateSlide(editingSlideIndex, { imageTags: sel ? tags.filter(t => t !== p.tag) : [...tags, p.tag] }); }} style={{ flexShrink: 0, width: 60, height: 60, borderRadius: 8, overflow: 'hidden', border: sel ? `2px solid ${theme.accentColor}` : '2px solid #333', position: 'relative', padding: 0, cursor: 'pointer', background: 'none' }}>
                <img src={p.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {sel && <div style={{ position: 'absolute', top: 2, right: 2, width: 18, height: 18, borderRadius: '50%', backgroundColor: theme.accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg></div>}
              </button>); })}
          </div></>}
          <button onClick={() => { haptic(); rewriteSlide(editingSlideIndex); }} disabled={isRewriting} style={{ width: '100%', marginTop: 24, padding: 16, borderRadius: 12, backgroundColor: isRewriting ? '#333' : theme.accentColor, color: '#FFF', fontSize: 16, fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {isRewriting ? <><Loader2 size={16} className="animate-spin" /> Rewriting...</> : '✨ AI Rewrite'}
          </button>
        </div>}
      </Sheet>

      {/* Regen Sheet */}
      <Sheet open={showRegenSheet} onClose={() => setShowRegenSheet(false)}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}><div style={{ color: '#FFF', fontSize: 18, fontWeight: 600 }}>Regenerate</div><button onClick={() => setShowRegenSheet(false)} style={{ width: 32, height: 32, borderRadius: 8, background: '#333', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} color="#888" /></button></div>
        <textarea rows={4} style={{ ...inputStyle, marginBottom: 16 }} value={regenInstruction} onChange={e => setRegenInstruction(e.target.value)} placeholder={"e.g. 'Make it darker and more luxurious'\n'Add a stats slide'\n'Change to editorial style'"} />
        <button onClick={() => { haptic(); regenerateAll(); }} disabled={!regenInstruction.trim()} style={{ width: '100%', padding: 16, borderRadius: 12, backgroundColor: !regenInstruction.trim() ? '#333' : theme.accentColor, color: '#FFF', fontSize: 16, fontWeight: 600, border: 'none', cursor: 'pointer', opacity: !regenInstruction.trim() ? 0.5 : 1 }}>🔄 Regenerate</button>
      </Sheet>

      {/* Theme Sheet */}
      <Sheet open={showThemeEditor} onClose={() => setShowThemeEditor(false)}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}><div style={{ color: '#FFF', fontSize: 18, fontWeight: 600 }}>Theme</div><button onClick={() => setShowThemeEditor(false)} style={{ width: 32, height: 32, borderRadius: 8, background: '#333', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} color="#888" /></button></div>
        <SL t="Presets" />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
          {THEME_PRESETS.map((p, i) => { const a = theme.backgroundColor === p.backgroundColor && theme.accentColor === p.accentColor; return (
            <button key={i} onClick={() => { haptic(); updateTheme(p); }} style={{ width: 'calc(50% - 5px)', background: '#2A2A2A', borderRadius: 12, overflow: 'hidden', cursor: 'pointer', padding: 0, border: a ? `2px solid ${p.accentColor}` : '2px solid #333' }}>
              <div style={{ height: 48, background: `linear-gradient(135deg,${p.backgroundColor} 0%,${p.accentColor} 100%)` }} />
              <div style={{ padding: '8px 6px', fontSize: 12, color: '#CCC', fontWeight: 500, textAlign: 'center' }}>{p.name}{a ? ' ✓' : ''}</div>
            </button>); })}
        </div>
        <SL t="Colors" />
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          {([['BG', 'backgroundColor', theme.backgroundColor], ['Text', 'textColor', theme.textColor], ['Accent', 'accentColor', theme.accentColor]] as const).map(([l, k, v]) => (
            <div key={k} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <label style={{ position: 'relative', cursor: 'pointer' }}><div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: v, border: '2px solid #444' }} /><input type="color" value={v} onChange={e => { haptic(); updateTheme({ [k]: e.target.value }); }} style={{ position: 'absolute', opacity: 0, width: 44, height: 44, top: 0, left: 0, cursor: 'pointer' }} /></label>
              <span style={{ fontSize: 10, color: '#888' }}>{l}</span>
            </div>))}
        </div>
        <SL t="Heading Font" />
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 12, WebkitOverflowScrolling: 'touch' }}>{HEADING_FONTS.map(f => <button key={f} onClick={() => { haptic(); updateTheme({ headingFont: f }); }} style={{ flexShrink: 0, padding: '8px 14px', borderRadius: 999, fontSize: 13, cursor: 'pointer', border: 'none', backgroundColor: theme.headingFont === f ? theme.accentColor : '#2A2A2A', color: theme.headingFont === f ? '#fff' : '#888', fontFamily: f, fontWeight: 600 }}>{f.split(' ')[0]}</button>)}</div>
        <SL t="Body Font" />
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>{BODY_FONTS.map(f => <button key={f} onClick={() => { haptic(); updateTheme({ bodyFont: f }); }} style={{ flexShrink: 0, padding: '8px 14px', borderRadius: 999, fontSize: 13, cursor: 'pointer', border: 'none', backgroundColor: theme.bodyFont === f ? theme.accentColor : '#2A2A2A', color: theme.bodyFont === f ? '#fff' : '#888', fontFamily: f }}>{f.split(' ')[0]}</button>)}</div>
      </Sheet>
    </div>
  );
}
