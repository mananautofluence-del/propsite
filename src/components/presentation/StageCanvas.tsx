import { useRef, useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Monitor, Smartphone } from 'lucide-react';
import type { PresentationData, ThemeKey, SlideType, AspectRatio } from '@/lib/presentationState';
import { SLIDE_TYPES, SLIDE_LABELS } from '@/lib/presentationState';
import { themeImages } from '@/lib/themeImages';
import PenthouseTheme from './themes/PenthouseTheme';
import CorporateTheme from './themes/CorporateTheme';
import HighStreetTheme from './themes/HighStreetTheme';
import LogisticsTheme from './themes/LogisticsTheme';
import EstateTheme from './themes/EstateTheme';
import SignatureTheme from './themes/SignatureTheme';

const LANDSCAPE_W = 1920;
const LANDSCAPE_H = 1080;
const PORTRAIT_W = 1080;
const PORTRAIT_H = 1920;

interface Props {
  data: PresentationData;
  themeId: ThemeKey;
  activeSlide: number;
  onSlideChange: (i: number) => void;
}

interface ThemeComponentProps {
  data: PresentationData;
  slideType: SlideType;
  aspect: AspectRatio;
  images: ReturnType<typeof themeImages extends Record<string, infer V> ? () => V : never>;
}

const themeComponentMap: Record<ThemeKey, React.ComponentType<any>> = {
  penthouse: PenthouseTheme,
  corporate: CorporateTheme,
  highstreet: HighStreetTheme,
  logistics: LogisticsTheme,
  estate: EstateTheme,
  signature: SignatureTheme,
};

const StageCanvas = ({ data, themeId, activeSlide, onSlideChange }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const [aspect, setAspect] = useState<AspectRatio>('landscape');

  const slideW = aspect === 'landscape' ? LANDSCAPE_W : PORTRAIT_W;
  const slideH = aspect === 'landscape' ? LANDSCAPE_H : PORTRAIT_H;

  const computeScale = useCallback(() => {
    if (!containerRef.current) return;
    const { clientWidth: cw, clientHeight: ch } = containerRef.current;
    const pad = 80;
    const s = Math.min((cw - pad) / slideW, (ch - pad) / slideH);
    setScale(Math.max(s, 0.1));
  }, [slideW, slideH]);

  useEffect(() => {
    computeScale();
    window.addEventListener('resize', computeScale);
    return () => window.removeEventListener('resize', computeScale);
  }, [computeScale]);

  const ThemeComponent = themeComponentMap[themeId];
  const currentSlideType = SLIDE_TYPES[activeSlide];
  const images = themeImages[themeId];
  const canPrev = activeSlide > 0;
  const canNext = activeSlide < SLIDE_TYPES.length - 1;

  return (
    <div className="flex-1 flex flex-col h-[50vh] lg:h-screen overflow-hidden" style={{ background: 'hsl(var(--stage-bg))' }}>
      {/* Format toggle bar */}
      <div className="shrink-0 flex items-center justify-center gap-2 py-2.5 lg:py-3 border-b border-border bg-card/50 backdrop-blur-sm">
        <button
          onClick={() => setAspect('landscape')}
          className={`flex items-center gap-1.5 px-3 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all ${
            aspect === 'landscape' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <Monitor size={14} />
          <span className="hidden sm:inline">Landscape</span>
          <span className="text-[10px] opacity-70">16:9</span>
        </button>
        <button
          onClick={() => setAspect('portrait')}
          className={`flex items-center gap-1.5 px-3 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all ${
            aspect === 'portrait' ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <Smartphone size={14} />
          <span className="hidden sm:inline">Portrait</span>
          <span className="text-[10px] opacity-70">9:16</span>
        </button>
      </div>

      {/* Canvas area */}
      <div ref={containerRef} className="relative flex-1 flex items-center justify-center overflow-hidden">
        {/* Nav arrows */}
        <button
          onClick={() => canPrev && onSlideChange(activeSlide - 1)}
          disabled={!canPrev}
          className="absolute left-2 lg:left-4 z-20 w-9 h-9 lg:w-11 lg:h-11 rounded-full bg-card shadow-lg flex items-center justify-center transition-all hover:shadow-xl disabled:opacity-20"
        >
          <ChevronLeft size={20} className="text-foreground" />
        </button>
        <button
          onClick={() => canNext && onSlideChange(activeSlide + 1)}
          disabled={!canNext}
          className="absolute right-2 lg:right-4 z-20 w-9 h-9 lg:w-11 lg:h-11 rounded-full bg-card shadow-lg flex items-center justify-center transition-all hover:shadow-xl disabled:opacity-20"
        >
          <ChevronRight size={20} className="text-foreground" />
        </button>

        {/* Scaled slide */}
        <div
          style={{
            width: slideW,
            height: slideH,
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            boxShadow: '0 25px 60px -12px rgba(0,0,0,0.25)',
            borderRadius: 8,
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          <ThemeComponent data={data} slideType={currentSlideType} aspect={aspect} images={images} />
        </div>
      </div>

      {/* Slide pagination */}
      <div className="shrink-0 flex items-center justify-center gap-0.5 lg:gap-1 py-2.5 lg:py-3 border-t border-border bg-card/50 backdrop-blur-sm overflow-x-auto px-2">
        {SLIDE_TYPES.map((st, i) => (
          <button
            key={st}
            onClick={() => onSlideChange(i)}
            className={`px-2 lg:px-3 py-1.5 rounded-md text-[10px] lg:text-xs font-medium transition-all whitespace-nowrap ${
              activeSlide === i
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {SLIDE_LABELS[st]}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StageCanvas;
