import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StoredPresentation, SlideData, ThemeConfig, PresentationPhoto, GenerativePresentation, SlideLayout } from '@/lib/presentationTypes';
import { ArrowLeft, Download, ChevronLeft, ChevronRight, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { createRoot } from 'react-dom/client';

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

const LAYOUTS: { id: SlideLayout; label: string }[] = [
  { id: 'hero-cover', label: '🖼 Cover' },
  { id: 'split-left-image', label: '◧ Split L' },
  { id: 'split-right-image', label: '◨ Split R' },
  { id: 'features-grid', label: '⊞ Grid' },
  { id: 'full-gallery', label: '🔲 Gallery' },
  { id: 'contact-card', label: '👤 Contact' },
];

const THEME_PRESETS: (ThemeConfig & { name: string })[] = [
  { name: 'Kashmir Forest', backgroundColor: '#1C2B1E', textColor: '#F2EDE4', accentColor: '#8B6E4E', headingFont: 'Cormorant Garamond', bodyFont: 'DM Sans' },
  { name: 'Penthouse Gold', backgroundColor: '#0D0D0D', textColor: '#F5F0E8', accentColor: '#C9A84C', headingFont: 'Playfair Display', bodyFont: 'Plus Jakarta Sans' },
  { name: 'Alpine Cream', backgroundColor: '#F2EDE4', textColor: '#1C2635', accentColor: '#5B7B5E', headingFont: 'DM Serif Display', bodyFont: 'DM Sans' },
  { name: 'Ocean Cerulean', backgroundColor: '#0A1628', textColor: '#F0F4F8', accentColor: '#2D8B9F', headingFont: 'Fraunces', bodyFont: 'Outfit' },
  { name: 'Terracotta Sun', backgroundColor: '#FAF6F0', textColor: '#2C1810', accentColor: '#C4714A', headingFont: 'Libre Baskerville', bodyFont: 'Jost' },
  { name: 'Midnight Sage', backgroundColor: '#0F1A14', textColor: '#E8F0EB', accentColor: '#4A7C59', headingFont: 'Cormorant Garamond', bodyFont: 'DM Sans' },
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

  // Editor state
  const [presentationData, setPresentationData] = useState<GenerativePresentation | null>(null);
  const [editingSlideIndex, setEditingSlideIndex] = useState<number | null>(null);
  const [showThemeEditor, setShowThemeEditor] = useState(false);
  const [showRegenSheet, setShowRegenSheet] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenInstruction, setRegenInstruction] = useState('');
  const [isRewriting, setIsRewriting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalJson, setOriginalJson] = useState('');

  // Load from localStorage
  useEffect(() => {
    try {
      const all = JSON.parse(localStorage.getItem('propsite_presentations') || '[]');
      const found = all.find((p: any) => p.id === id);
      if (found) {
        setStored(found);
        setPresentationData(found.presentation);
        setOriginalJson(JSON.stringify(found.presentation));
      } else {
        toast.error('Presentation not found');
        navigate('/dashboard/presentations');
      }
    } catch { toast.error('Load failed'); navigate('/dashboard/presentations'); }
    setLoading(false);
  }, [id, navigate]);

  // Google Fonts injection
  useEffect(() => {
    if (!presentationData?.theme) return;
    const { headingFont, bodyFont } = presentationData.theme;
    const fonts = [...new Set([headingFont, bodyFont])].filter(Boolean);
    const families = fonts.map(f => f.replace(/ /g, '+')).join('&family=');
    const linkId = 'dynamic-google-fonts';
    let link = document.getElementById(linkId) as HTMLLinkElement | null;
    if (!link) { link = document.createElement('link'); link.id = linkId; link.rel = 'stylesheet'; document.head.appendChild(link); }
    link.href = `https://fonts.googleapis.com/css2?family=${families}:wght@400;500;600;700;800&display=swap`;
  }, [presentationData?.theme]);

  // Scale preview
  useEffect(() => {
    const handleResize = () => {
      const c = document.getElementById('preview-frame');
      if (c?.parentElement) c.style.setProperty('--preview-scale', (c.parentElement.clientWidth / 1080).toString());
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeSlideIdx]);

  // Lock body scroll when sheets are open
  useEffect(() => {
    const anyOpen = editingSlideIndex !== null || showThemeEditor || showRegenSheet;
    document.body.style.overflow = anyOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [editingSlideIndex, showThemeEditor, showRegenSheet]);

  // Track changes
  useEffect(() => {
    if (presentationData && originalJson) {
      setHasChanges(JSON.stringify(presentationData) !== originalJson);
    }
  }, [presentationData, originalJson]);

  // Persist changes to localStorage
  const saveToStorage = () => {
    if (!stored || !presentationData) return;
    const all = JSON.parse(localStorage.getItem('propsite_presentations') || '[]');
    const idx = all.findIndex((p: any) => p.id === stored.id);
    if (idx >= 0) {
      all[idx] = { ...all[idx], presentation: presentationData, title: presentationData.slides[0]?.headline || all[idx].title };
      localStorage.setItem('propsite_presentations', JSON.stringify(all));
    }
  };

  useEffect(() => { if (hasChanges) saveToStorage(); }, [presentationData]);

  const photos: PresentationPhoto[] = (stored?.photo_urls || []).map((url, i) => ({
    url, tag: stored?.photo_tags?.[i] || 'other', orderIndex: i
  }));

  // === SLIDE UPDATE HELPERS ===
  const updateSlide = (index: number, updates: Partial<SlideData>) => {
    if (!presentationData) return;
    setPresentationData(prev => prev ? ({
      ...prev, slides: prev.slides.map((s, i) => i === index ? { ...s, ...updates } : s)
    }) : prev);
  };

  const updateTheme = (updates: Partial<ThemeConfig>) => {
    if (!presentationData) return;
    setPresentationData(prev => prev ? ({ ...prev, theme: { ...prev.theme, ...updates } }) : prev);
  };

  // === AI REWRITE SINGLE SLIDE ===
  const rewriteSlide = async (index: number) => {
    if (!presentationData) return;
    const CLAUDE_KEY = import.meta.env.VITE_CLAUDE_API_KEY;
    if (!CLAUDE_KEY) { toast.error('No API key'); return; }
    setIsRewriting(true); haptic();
    try {
      const slide = presentationData.slides[index];
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': CLAUDE_KEY, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514', max_tokens: 2000,
          system: 'You are a luxury real estate copywriter. Rewrite ONLY the text fields of this slide JSON to be more evocative, sensory, and premium. Keep the same layout, id, and imageTags. Output ONLY the updated SlideData JSON object. No markdown, no explanation.',
          messages: [{ role: 'user', content: JSON.stringify(slide) }]
        })
      });
      const result = await res.json();
      const raw = result.content?.[0]?.text || '';
      const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const newSlide = JSON.parse(clean) as SlideData;
      updateSlide(index, { headline: newSlide.headline, subheadline: newSlide.subheadline, bodyText: newSlide.bodyText, bulletPoints: newSlide.bulletPoints, stats: newSlide.stats });
      toast.success('Slide rewritten!');
    } catch (e) { toast.error('Rewrite failed. Try again.'); }
    setIsRewriting(false);
  };

  // === REGENERATE ALL ===
  const regenerateAll = async () => {
    if (!stored) return;
    const CLAUDE_KEY = import.meta.env.VITE_CLAUDE_API_KEY;
    if (!CLAUDE_KEY) { toast.error('No API key'); return; }
    setIsRegenerating(true); setShowRegenSheet(false); haptic();
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': CLAUDE_KEY, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514', max_tokens: 4000,
          system: `You are a luxury real estate Art Director. Regenerate the presentation JSON. The user has requested these changes: "${regenInstruction}". Incorporate them while keeping property facts accurate. Output ONLY valid JSON matching GenerativePresentation interface. No markdown.
Interface: { theme: { backgroundColor, textColor, accentColor, headingFont, bodyFont }, slides: [{ id, layout, headline?, subheadline?, bodyText?, bulletPoints?, stats?, imageTags, contactInfo? }] }
Generate 5-6 slides. First=hero-cover, Last=contact-card.`,
          messages: [{ role: 'user', content: `Original presentation:\n${JSON.stringify(presentationData)}\n\nChanges requested: ${regenInstruction}` }]
        })
      });
      const result = await res.json();
      const raw = result.content?.[0]?.text || '';
      const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const newPres = JSON.parse(clean) as GenerativePresentation;
      if (newPres.theme && newPres.slides?.length) {
        setPresentationData(newPres);
        setActiveSlideIdx(0);
        toast.success('Presentation regenerated!');
      } else throw new Error('Invalid');
    } catch { toast.error('Regeneration failed. Try again.'); }
    setIsRegenerating(false); setRegenInstruction('');
  };

  // === PDF EXPORT ===
  const handleExportPDF = async () => {
    if (!presentationData) return;
    setExporting(true); toast.info('Generating PDF...');
    try {
      const { theme, slides } = presentationData;
      const pdf = new jsPDF({ orientation: 'p', unit: 'px', format: [1080, 1080] });
      for (let i = 0; i < slides.length; i++) {
        if (i > 0) pdf.addPage([1080, 1080]);
        const SlideBlock = getSlideComponent(slides[i].layout);
        const offscreen = document.createElement('div');
        offscreen.style.cssText = 'position:fixed;left:-9999px;top:0;width:1080px;height:1080px';
        document.body.appendChild(offscreen);
        const root = createRoot(offscreen);
        await new Promise<void>(r => { root.render(<SlideBlock data={slides[i]} theme={theme} photos={photos} />); setTimeout(r, 800); });
        const canvas = await html2canvas(offscreen, { width: 1080, height: 1080, scale: 2, useCORS: true, allowTaint: true, logging: false });
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, 1080, 1080);
        root.unmount(); document.body.removeChild(offscreen);
      }
      pdf.save(`${stored?.title || 'presentation'}.pdf`);
      toast.success('PDF downloaded!');
    } catch { toast.error('PDF export failed'); }
    setExporting(false);
  };

  if (loading || !presentationData) {
    return <div style={{ minHeight: '100vh', background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', color: '#888' }}><Loader2 className="animate-spin" style={{ marginRight: 8 }} /> Loading...</div>;
  }

  const { theme, slides } = presentationData;
  const activeSlide = slides[activeSlideIdx] || slides[0];
  const SlideBlock = getSlideComponent(activeSlide.layout);
  const editSlide = editingSlideIndex !== null ? slides[editingSlideIndex] : null;

  // === BOTTOM SHEET WRAPPER ===
  const BottomSheet = ({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) => {
    if (!open) return null;
    return (
      <>
        <div onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 999 }} />
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#1A1A1A',
          borderRadius: '20px 20px 0 0', padding: '24px 20px 40px', zIndex: 1000,
          maxHeight: '75vh', overflowY: 'auto', WebkitOverflowScrolling: 'touch',
          transform: 'translateY(0)', transition: 'transform 0.3s ease'
        }}>
          {/* Drag handle */}
          <div style={{ width: 36, height: 4, backgroundColor: '#444', borderRadius: 999, margin: '0 auto 20px' }} />
          {children}
        </div>
      </>
    );
  };

  const SectionLabel = ({ text }: { text: string }) => (
    <div style={{ fontSize: 11, color: '#666', letterSpacing: '1.5px', textTransform: 'uppercase' as const, marginBottom: 8, marginTop: 20, fontFamily: 'Inter, sans-serif' }}>{text}</div>
  );

  const inputStyle: React.CSSProperties = {
    width: '100%', backgroundColor: '#2A2A2A', color: '#FFFFFF',
    border: '1px solid #333', borderRadius: 10, padding: 12,
    fontSize: 16, lineHeight: 1.5, fontFamily: '"DM Sans", sans-serif',
    boxSizing: 'border-box', outline: 'none', resize: 'vertical' as const
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F5F5F5', display: 'flex', flexDirection: 'column', fontFamily: '"DM Sans", Inter, sans-serif' }}>

      {/* ═══ HEADER ═══ */}
      <div style={{
        backgroundColor: '#FFFFFF', borderBottom: '1px solid #EBEBEB',
        padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 30
      }}>
        <button onClick={() => navigate('/dashboard/presentations')} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, color: '#555', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>
          <ArrowLeft size={16} /> Back
        </button>

        {/* Slide counter (Feature 5) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: theme.headingFont, fontSize: 15, fontWeight: 600, color: '#111', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {stored?.title || 'Presentation'}
          </span>
          <span style={{ backgroundColor: '#F0F0F0', borderRadius: 999, padding: '3px 10px', fontSize: 12, color: '#555', fontWeight: 600 }}>
            {activeSlideIdx + 1}/{slides.length}
          </span>
        </div>

        <button onClick={handleExportPDF} disabled={exporting}
          style={{ background: '#1A5C3A', color: '#fff', fontSize: 13, fontWeight: 600, height: 32, padding: '0 14px', borderRadius: 8, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, opacity: exporting ? 0.5 : 1, position: 'relative' }}>
          {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
          PDF
          {hasChanges && <div style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: '50%', backgroundColor: '#EF4444' }} />}
        </button>
      </div>

      {/* ═══ GLOBAL TOOLBAR (Feature 1) ═══ */}
      <div style={{ display: 'flex', gap: 8, padding: '12px 16px', justifyContent: 'center' }}>
        <button onClick={() => { haptic(); setShowThemeEditor(true); }}
          style={{ backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 999, padding: '8px 16px', fontSize: 13, border: '1px solid rgba(0,0,0,0.08)', cursor: 'pointer', fontWeight: 500 }}>
          🎨 Theme
        </button>
        <button onClick={() => { haptic(); setShowRegenSheet(true); }}
          style={{ backgroundColor: 'rgba(0,0,0,0.06)', borderRadius: 999, padding: '8px 16px', fontSize: 13, border: '1px solid rgba(0,0,0,0.08)', cursor: 'pointer', fontWeight: 500 }}>
          ✨ Regenerate
        </button>
      </div>

      {/* ═══ MAIN PREVIEW ═══ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 16px 16px', gap: 16 }}>
        {/* Slide Canvas with FAB */}
        <div style={{ width: '100%', maxWidth: 540, margin: '0 auto', position: 'relative' }}>
          <div style={{ width: '100%', aspectRatio: '1 / 1', position: 'relative', overflow: 'hidden', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
            <div id="preview-frame" style={{
              position: 'absolute', top: 0, left: 0, width: 1080, height: 1080,
              transform: 'scale(var(--preview-scale, 0.5))', transformOrigin: 'top left', pointerEvents: 'none'
            }}>
              <SlideBlock data={activeSlide} theme={theme} photos={photos} />
            </div>
          </div>

          {/* FAB Edit Button (Feature 1) */}
          <button onClick={() => { haptic(); setEditingSlideIndex(activeSlideIdx); }}
            style={{
              position: 'absolute', bottom: 16, right: 16, width: 44, height: 44,
              borderRadius: '50%', backgroundColor: theme.accentColor, opacity: 0.9,
              border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)', zIndex: 10
            }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              <path d="m15 5 4 4" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => { haptic(); setActiveSlideIdx(Math.max(0, activeSlideIdx - 1)); }}
            disabled={activeSlideIdx === 0}
            style={{ width: 40, height: 40, borderRadius: '50%', background: '#fff', border: '1px solid #EBEBEB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: activeSlideIdx === 0 ? 0.3 : 1, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <ChevronLeft size={18} />
          </button>
          <div style={{ display: 'flex', gap: 6 }}>
            {slides.map((_, i) => (
              <button key={i} onClick={() => { haptic(); setActiveSlideIdx(i); }}
                style={{ width: activeSlideIdx === i ? 24 : 8, height: 8, borderRadius: 4, backgroundColor: activeSlideIdx === i ? theme.accentColor : '#DDDCDC', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }} />
            ))}
          </div>
          <button onClick={() => { haptic(); setActiveSlideIdx(Math.min(slides.length - 1, activeSlideIdx + 1)); }}
            disabled={activeSlideIdx === slides.length - 1}
            style={{ width: 40, height: 40, borderRadius: '50%', background: '#fff', border: '1px solid #EBEBEB', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: activeSlideIdx === slides.length - 1 ? 0.3 : 1, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Thumbnails */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '4px 0', maxWidth: '100%', WebkitOverflowScrolling: 'touch' }}>
          {slides.map((slide, i) => {
            const Tb = getSlideComponent(slide.layout);
            return (
              <button key={i} onClick={() => { haptic(); setActiveSlideIdx(i); }}
                style={{ flexShrink: 0, width: 64, height: 64, borderRadius: 8, overflow: 'hidden', border: activeSlideIdx === i ? `2px solid ${theme.accentColor}` : '2px solid #EBEBEB', cursor: 'pointer', opacity: activeSlideIdx === i ? 1 : 0.6, transition: 'all 0.2s', background: 'none', padding: 0 }}>
                <div style={{ transform: 'scale(0.0593)', transformOrigin: 'top left', width: 1080, height: 1080, pointerEvents: 'none' }}>
                  <Tb data={slide} theme={theme} photos={photos} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══ REGENERATING OVERLAY ═══ */}
      {isRegenerating && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 2000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid #333', borderTopColor: theme.accentColor, animation: 'spin 1s linear infinite' }} />
          <div style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 600, fontFamily: theme.headingFont }}>Reimagining your presentation...</div>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      )}

      {/* ═══ FEATURE 2: EDIT BOTTOM SHEET ═══ */}
      <BottomSheet open={editingSlideIndex !== null} onClose={() => setEditingSlideIndex(null)}>
        {editSlide && editingSlideIndex !== null && (
          <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 600 }}>Edit Slide {editingSlideIndex + 1}</div>
              <button onClick={() => setEditingSlideIndex(null)} style={{ width: 32, height: 32, borderRadius: 8, background: '#333', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} color="#888" />
              </button>
            </div>

            {/* Section B: Text Edits */}
            <SectionLabel text="Content" />
            {editSlide.headline !== undefined && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Headline</div>
                <textarea rows={1} style={inputStyle} value={editSlide.headline || ''}
                  onChange={e => updateSlide(editingSlideIndex, { headline: e.target.value })} />
              </div>
            )}
            {editSlide.subheadline !== undefined && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Subheadline</div>
                <textarea rows={1} style={inputStyle} value={editSlide.subheadline || ''}
                  onChange={e => updateSlide(editingSlideIndex, { subheadline: e.target.value })} />
              </div>
            )}
            {editSlide.bodyText !== undefined && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Body Text</div>
                <textarea rows={3} style={inputStyle} value={editSlide.bodyText || ''}
                  onChange={e => updateSlide(editingSlideIndex, { bodyText: e.target.value })} />
              </div>
            )}

            {/* Bullet Points */}
            {editSlide.bulletPoints && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Bullet Points</div>
                {editSlide.bulletPoints.map((bp, bpIdx) => (
                  <div key={bpIdx} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                    <input style={{ ...inputStyle, flex: 1 }} value={bp}
                      onChange={e => {
                        const newBp = [...(editSlide.bulletPoints || [])];
                        newBp[bpIdx] = e.target.value;
                        updateSlide(editingSlideIndex, { bulletPoints: newBp });
                      }} />
                    <button onClick={() => {
                      haptic();
                      const newBp = (editSlide.bulletPoints || []).filter((_, j) => j !== bpIdx);
                      updateSlide(editingSlideIndex, { bulletPoints: newBp });
                    }} style={{ width: 44, height: 44, borderRadius: 10, background: '#2A2A2A', border: '1px solid #333', color: '#888', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                  </div>
                ))}
                <button onClick={() => {
                  haptic();
                  updateSlide(editingSlideIndex, { bulletPoints: [...(editSlide.bulletPoints || []), ''] });
                }} style={{ width: '100%', padding: '10px', borderRadius: 10, background: '#2A2A2A', border: '1px solid #333', color: theme.accentColor, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                  + Add Point
                </button>
              </div>
            )}

            {/* Section C: Layout Selector */}
            <SectionLabel text="Layout" />
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, WebkitOverflowScrolling: 'touch' }}>
              {LAYOUTS.map(l => (
                <button key={l.id} onClick={() => { haptic(); updateSlide(editingSlideIndex, { layout: l.id }); }}
                  style={{
                    flexShrink: 0, padding: '10px 16px', borderRadius: 999, fontSize: 13, cursor: 'pointer', border: 'none', fontWeight: 500,
                    backgroundColor: editSlide.layout === l.id ? theme.accentColor : '#2A2A2A',
                    color: editSlide.layout === l.id ? '#FFFFFF' : '#888',
                  }}>
                  {l.label}
                </button>
              ))}
            </div>

            {/* Section D: Photo Selector */}
            {photos.length > 0 && (
              <>
                <SectionLabel text="Photos" />
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, WebkitOverflowScrolling: 'touch' }}>
                  {photos.map((photo, pi) => {
                    const isSelected = (editSlide.imageTags || []).includes(photo.tag);
                    return (
                      <button key={pi} onClick={() => {
                        haptic();
                        const tags = editSlide.imageTags || [];
                        const newTags = isSelected ? tags.filter(t => t !== photo.tag) : [...tags, photo.tag];
                        updateSlide(editingSlideIndex, { imageTags: newTags });
                      }} style={{
                        flexShrink: 0, width: 60, height: 60, borderRadius: 8, overflow: 'hidden',
                        border: isSelected ? `2px solid ${theme.accentColor}` : '2px solid #333',
                        position: 'relative', padding: 0, cursor: 'pointer', background: 'none'
                      }}>
                        <img src={photo.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        {isSelected && (
                          <div style={{ position: 'absolute', top: 2, right: 2, width: 18, height: 18, borderRadius: '50%', backgroundColor: theme.accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* Section E: AI Rewrite */}
            <button onClick={() => { haptic(); rewriteSlide(editingSlideIndex); }} disabled={isRewriting}
              style={{
                width: '100%', marginTop: 24, padding: 16, borderRadius: 12,
                backgroundColor: isRewriting ? '#333' : theme.accentColor,
                color: '#FFFFFF', fontSize: 16, fontWeight: 600, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
              }}>
              {isRewriting ? <><Loader2 size={16} className="animate-spin" /> Rewriting...</> : '✨ AI Rewrite This Slide'}
            </button>
          </div>
        )}
      </BottomSheet>

      {/* ═══ FEATURE 3: REGENERATE SHEET ═══ */}
      <BottomSheet open={showRegenSheet} onClose={() => setShowRegenSheet(false)}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 600 }}>Regenerate Presentation</div>
          <button onClick={() => setShowRegenSheet(false)} style={{ width: 32, height: 32, borderRadius: 8, background: '#333', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} color="#888" />
          </button>
        </div>
        <textarea rows={4} style={{ ...inputStyle, marginBottom: 16 }} value={regenInstruction}
          onChange={e => setRegenInstruction(e.target.value)}
          placeholder={"Describe what to change...\n\ne.g. 'Make it more luxurious'\n'Add a slide about location'\n'Change theme to dark and moody'"} />
        <button onClick={() => { haptic(); regenerateAll(); }} disabled={!regenInstruction.trim()}
          style={{
            width: '100%', padding: 16, borderRadius: 12,
            backgroundColor: !regenInstruction.trim() ? '#333' : theme.accentColor,
            color: '#FFFFFF', fontSize: 16, fontWeight: 600, border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: !regenInstruction.trim() ? 0.5 : 1
          }}>
          🔄 Regenerate All Slides
        </button>
      </BottomSheet>

      {/* ═══ FEATURE 4: THEME EDITOR ═══ */}
      <BottomSheet open={showThemeEditor} onClose={() => setShowThemeEditor(false)}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 600 }}>Theme Editor</div>
          <button onClick={() => setShowThemeEditor(false)} style={{ width: 32, height: 32, borderRadius: 8, background: '#333', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} color="#888" />
          </button>
        </div>

        {/* Presets */}
        <SectionLabel text="Quick Presets" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
          {THEME_PRESETS.map((preset, i) => {
            const isActive = theme.backgroundColor === preset.backgroundColor && theme.accentColor === preset.accentColor;
            return (
              <button key={i} onClick={() => {
                haptic();
                updateTheme({ backgroundColor: preset.backgroundColor, textColor: preset.textColor, accentColor: preset.accentColor, headingFont: preset.headingFont, bodyFont: preset.bodyFont });
              }} style={{
                background: '#2A2A2A', borderRadius: 12, overflow: 'hidden', cursor: 'pointer', padding: 0,
                border: isActive ? `2px solid ${preset.accentColor}` : '2px solid #333'
              }}>
                <div style={{ height: 48, background: `linear-gradient(135deg, ${preset.backgroundColor} 0%, ${preset.accentColor} 100%)` }} />
                <div style={{ padding: '8px 6px', fontSize: 11, color: '#CCC', fontWeight: 500, textAlign: 'center' }}>
                  {preset.name}
                  {isActive && ' ✓'}
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom Colors */}
        <SectionLabel text="Custom Colors" />
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          {[
            { label: 'BG', key: 'backgroundColor' as const, val: theme.backgroundColor },
            { label: 'Text', key: 'textColor' as const, val: theme.textColor },
            { label: 'Accent', key: 'accentColor' as const, val: theme.accentColor },
          ].map(c => (
            <div key={c.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <label style={{ position: 'relative', cursor: 'pointer' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: c.val, border: '2px solid #444' }} />
                <input type="color" value={c.val} onChange={e => { haptic(); updateTheme({ [c.key]: e.target.value }); }}
                  style={{ position: 'absolute', opacity: 0, width: 44, height: 44, top: 0, left: 0, cursor: 'pointer' }} />
              </label>
              <span style={{ fontSize: 10, color: '#888' }}>{c.label}</span>
            </div>
          ))}
        </div>

        {/* Heading Fonts */}
        <SectionLabel text="Heading Font" />
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 12, WebkitOverflowScrolling: 'touch' }}>
          {HEADING_FONTS.map(f => (
            <button key={f} onClick={() => { haptic(); updateTheme({ headingFont: f }); }}
              style={{
                flexShrink: 0, padding: '8px 14px', borderRadius: 999, fontSize: 13, cursor: 'pointer', border: 'none',
                backgroundColor: theme.headingFont === f ? theme.accentColor : '#2A2A2A',
                color: theme.headingFont === f ? '#fff' : '#888', fontFamily: f, fontWeight: 600
              }}>
              {f.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Body Fonts */}
        <SectionLabel text="Body Font" />
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          {BODY_FONTS.map(f => (
            <button key={f} onClick={() => { haptic(); updateTheme({ bodyFont: f }); }}
              style={{
                flexShrink: 0, padding: '8px 14px', borderRadius: 999, fontSize: 13, cursor: 'pointer', border: 'none',
                backgroundColor: theme.bodyFont === f ? theme.accentColor : '#2A2A2A',
                color: theme.bodyFont === f ? '#fff' : '#888', fontFamily: f
              }}>
              {f.split(' ')[0]}
            </button>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
}
