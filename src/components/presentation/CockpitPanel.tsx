import { useState } from 'react';
import {
  ChevronDown,
  Upload,
  GripVertical,
  Image,
  Sparkles,
  FileText,
  Palette,
  Zap,
} from 'lucide-react';
import { ThemeId, themes } from '@/lib/themes';
import { slideOrder } from '@/lib/mockData';

interface Props {
  themeId: ThemeId;
  onThemeChange: (id: ThemeId) => void;
  activeSlide: number;
  onSlideChange: (i: number) => void;
}

const AccordionSection = ({
  icon: Icon,
  title,
  defaultOpen = false,
  children,
}: {
  icon: React.ElementType;
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors"
      >
        <Icon size={16} className="text-primary shrink-0" />
        <span className="flex-1 text-left">{title}</span>
        <ChevronDown
          size={14}
          className={`text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
};

const CockpitPanel = ({ themeId, onThemeChange, activeSlide, onSlideChange }: Props) => {
  return (
    <div
      className="w-[350px] shrink-0 h-screen flex flex-col border-r"
      style={{
        background: 'hsl(var(--cockpit-bg))',
        borderColor: 'hsl(var(--cockpit-border))',
      }}
    >
      {/* Header */}
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap size={16} className="text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground tracking-tight">PropSite AI</h1>
            <p className="text-[11px] text-muted-foreground">Pitch Deck Builder</p>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto cockpit-scroll">
        <AccordionSection icon={Image} title="Property Data & Photos" defaultOpen>
          {/* Photo upload zone */}
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/40 transition-colors cursor-pointer group">
            <Upload
              size={28}
              className="mx-auto mb-3 text-muted-foreground group-hover:text-primary transition-colors"
            />
            <p className="text-sm font-medium text-foreground mb-1">
              Drop photos here
            </p>
            <p className="text-xs text-muted-foreground">
              PNG, JPG up to 10MB each
            </p>
          </div>

          {/* Mock uploaded photos */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            {['Hero', 'Interior', 'Pool'].map((label, i) => (
              <div
                key={label}
                className="aspect-square rounded-md bg-muted overflow-hidden relative group cursor-pointer"
              >
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors" />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-foreground/60 to-transparent p-1.5">
                  <p className="text-[10px] font-medium" style={{ color: '#fff' }}>
                    {label}
                  </p>
                </div>
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Image size={16} className="text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </AccordionSection>

        <AccordionSection icon={FileText} title="Slide Outline" defaultOpen>
          <div className="space-y-1.5">
            {slideOrder.map((slide, i) => (
              <button
                key={slide.id}
                onClick={() => onSlideChange(i)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  activeSlide === i
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <GripVertical size={14} className="text-muted-foreground shrink-0 cursor-grab" />
                <span className="w-5 h-5 rounded-md bg-muted flex items-center justify-center text-[11px] font-bold text-muted-foreground shrink-0">
                  {i + 1}
                </span>
                <span className="flex-1 text-left">{slide.label}</span>
              </button>
            ))}
          </div>
        </AccordionSection>

        <AccordionSection icon={Palette} title="Theme Engine" defaultOpen>
          <div className="grid grid-cols-2 gap-3">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => onThemeChange(theme.id)}
                className={`group relative rounded-xl overflow-hidden transition-all ${
                  themeId === theme.id
                    ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                    : 'ring-1 ring-border hover:ring-primary/40'
                }`}
              >
                {/* Theme preview mini */}
                <div
                  className="h-16 p-3 flex flex-col justify-end"
                  style={{ background: theme.preview.bg }}
                >
                  <div
                    className="w-12 h-1 rounded-full mb-1.5"
                    style={{ background: theme.preview.accent }}
                  />
                  <div
                    className="w-20 h-1 rounded-full opacity-30"
                    style={{ background: theme.preview.fg }}
                  />
                </div>
                <div className="p-2.5 bg-card">
                  <p className="text-[11px] font-semibold text-foreground truncate">
                    {theme.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {theme.subtitle}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </AccordionSection>
      </div>

      {/* Generate button */}
      <div className="p-4 border-t border-border">
        <button className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2.5 hover:opacity-90 transition-opacity shadow-lg">
          <Sparkles size={18} />
          Generate 10-Page PDF
          <span className="ml-1 px-2 py-0.5 rounded-md bg-primary-foreground/20 text-[11px] font-semibold">
            5 Credits
          </span>
        </button>
      </div>
    </div>
  );
};

export default CockpitPanel;
