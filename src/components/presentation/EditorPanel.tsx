import { useState } from 'react';
import {
  ChevronDown,
  Upload,
  Image,
  Sparkles,
  FileText,
  Palette,
  Zap,
  GripVertical,
  Download,
  Type,
  User,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { PresentationData, ThemeKey } from '@/lib/presentationState';
import { SLIDE_TYPES, SLIDE_LABELS } from '@/lib/presentationState';
import { generateDeck } from '@/lib/exportPptx';
import { toast } from 'sonner';

const themeOptions: { id: ThemeKey; name: string; subtitle: string; colors: { bg: string; fg: string; accent: string } }[] = [
  { id: 'signature', name: 'PropSite Signature', subtitle: 'Universal · Clean', colors: { bg: '#FFFFFF', fg: '#111111', accent: '#1A5C3A' } },
  { id: 'penthouse', name: 'The Penthouse', subtitle: 'Ultra-Luxury', colors: { bg: '#0A0A0A', fg: '#F0EDE8', accent: '#C9A96E' } },
  { id: 'corporate', name: 'Corporate HQ', subtitle: 'Commercial Office', colors: { bg: '#0F172A', fg: '#F8FAFC', accent: '#3B82F6' } },
  { id: 'highstreet', name: 'High Street', subtitle: 'Retail · Showroom', colors: { bg: '#FBF7F0', fg: '#1A1A1A', accent: '#C4715B' } },
  { id: 'logistics', name: 'The Logistics', subtitle: 'Industrial · Warehouse', colors: { bg: '#E5E5E5', fg: '#1A1A1A', accent: '#F59E0B' } },
  { id: 'estate', name: 'The Estate', subtitle: 'Plot · Land · Villa', colors: { bg: '#F5F0E8', fg: '#3D3425', accent: '#6B8F71' } },
];

interface Props {
  data: PresentationData;
  onChange: (data: PresentationData) => void;
  themeId: ThemeKey;
  onThemeChange: (id: ThemeKey) => void;
  activeSlide: number;
  onSlideChange: (i: number) => void;
}

const Section = ({
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
        className="w-full flex items-center gap-3 px-4 lg:px-5 py-3.5 lg:py-4 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors"
      >
        <Icon size={16} className="text-primary shrink-0" />
        <span className="flex-1 text-left">{title}</span>
        <ChevronDown size={14} className={`text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-4 lg:px-5 pb-4 lg:pb-5">{children}</div>}
    </div>
  );
};

const EditorPanel = ({ data, onChange, themeId, onThemeChange, activeSlide, onSlideChange }: Props) => {
  const update = (key: keyof PresentationData, value: string) => {
    onChange({ ...data, [key]: value });
  };

  const updateFeature = (index: number, value: string) => {
    const features = [...data.features];
    features[index] = value;
    onChange({ ...data, features });
  };

  const [isExporting, setIsExporting] = useState(false);
  const handleExportPptx = async () => {
    setIsExporting(true);
    try {
      await generateDeck(data, themeId);
      toast.success('Presentation exported successfully!');
    } catch (err) {
      toast.error('Failed to export presentation');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      className="w-full h-[50vh] lg:h-screen flex flex-col border-b lg:border-b-0 lg:border-r"
      style={{ background: 'hsl(var(--cockpit-bg))', borderColor: 'hsl(var(--cockpit-border))' }}
    >
      {/* Header */}
      <div className="px-4 lg:px-5 py-4 lg:py-5 border-b border-border shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap size={16} className="text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground tracking-tight">PropSite AI</h1>
            <p className="text-[11px] text-muted-foreground">Pitch Deck Builder</p>
          </div>
        </div>
        <div className="mt-3 bg-blue-500/10 border border-blue-500/20 rounded-md p-2 flex items-start gap-2">
          <Zap size={14} className="text-blue-500 shrink-0 mt-0.5" />
          <p className="text-[10px] sm:text-[11px] text-blue-500/90 leading-tight">
            <strong>AI Generated Content.</strong> Please review all details and copy before sharing with clients.
          </p>
        </div>
      </div>

      {/* Scrollable sections */}
      <div className="flex-1 overflow-y-auto cockpit-scroll">
        <Section icon={Image} title="Property Data & Photos" defaultOpen>
          <div className="border-2 border-dashed border-border rounded-lg p-5 lg:p-6 text-center hover:border-primary/40 transition-colors cursor-pointer group mb-4">
            <Upload size={24} className="mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
            <p className="text-sm font-medium text-foreground mb-1">Drop photos here</p>
            <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB each</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {['Hero', 'Interior', 'Pool'].map((label) => (
              <div key={label} className="aspect-square rounded-md bg-muted overflow-hidden relative group cursor-pointer">
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors" />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-foreground/60 to-transparent p-1.5">
                  <p className="text-[10px] font-medium text-white">{label}</p>
                </div>
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Image size={16} className="text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section icon={Type} title="Property Details" defaultOpen>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Title</label>
              <Input value={data.title} onChange={(e) => update('title', e.target.value)} className="h-11 lg:h-9 text-base lg:text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Subtitle</label>
              <Input value={data.subtitle} onChange={(e) => update('subtitle', e.target.value)} className="h-11 lg:h-9 text-base lg:text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Price</label>
                <Input value={data.price} onChange={(e) => update('price', e.target.value)} className="h-11 lg:h-9 text-base lg:text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Area</label>
                <Input value={data.area} onChange={(e) => update('area', e.target.value)} className="h-11 lg:h-9 text-base lg:text-sm" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Location</label>
              <Input value={data.location} onChange={(e) => update('location', e.target.value)} className="h-11 lg:h-9 text-base lg:text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description</label>
              <Textarea value={data.description} onChange={(e) => update('description', e.target.value)} className="text-base lg:text-sm min-h-[80px]" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Features</label>
              {data.features.map((feat, i) => (
                <Input key={i} value={feat} onChange={(e) => updateFeature(i, e.target.value)} className="h-11 lg:h-9 text-base lg:text-sm mb-2" />
              ))}
            </div>
          </div>
        </Section>

        <Section icon={User} title="Broker Information">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Name</label>
              <Input value={data.brokerName} onChange={(e) => update('brokerName', e.target.value)} className="h-11 lg:h-9 text-base lg:text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Title</label>
              <Input value={data.brokerTitle} onChange={(e) => update('brokerTitle', e.target.value)} className="h-11 lg:h-9 text-base lg:text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Agency</label>
              <Input value={data.brokerAgency} onChange={(e) => update('brokerAgency', e.target.value)} className="h-11 lg:h-9 text-base lg:text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Phone</label>
                <Input value={data.brokerPhone} onChange={(e) => update('brokerPhone', e.target.value)} className="h-11 lg:h-9 text-base lg:text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label>
                <Input value={data.brokerEmail} onChange={(e) => update('brokerEmail', e.target.value)} className="h-11 lg:h-9 text-base lg:text-sm" />
              </div>
            </div>
          </div>
        </Section>

        <Section icon={FileText} title="Slide Outline" defaultOpen>
          <div className="space-y-1.5">
            {SLIDE_TYPES.map((st, i) => (
              <button
                key={st}
                onClick={() => onSlideChange(i)}
                className={`w-full flex items-center gap-3 px-3 py-3 lg:py-2.5 rounded-lg text-sm transition-all ${
                  activeSlide === i ? 'bg-primary/10 text-primary font-semibold' : 'text-foreground hover:bg-muted'
                }`}
              >
                <GripVertical size={14} className="text-muted-foreground shrink-0 cursor-grab" />
                <span className="w-5 h-5 rounded-md bg-muted flex items-center justify-center text-[11px] font-bold text-muted-foreground shrink-0">{i + 1}</span>
                <span className="flex-1 text-left">{SLIDE_LABELS[st]}</span>
              </button>
            ))}
          </div>
        </Section>

        <Section icon={Palette} title="Theme Engine" defaultOpen>
          <div className="grid grid-cols-2 gap-3">
            {themeOptions.map((theme) => (
              <button
                key={theme.id}
                onClick={() => onThemeChange(theme.id)}
                className={`group relative rounded-xl overflow-hidden transition-all ${
                  themeId === theme.id
                    ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                    : 'ring-1 ring-border hover:ring-primary/40'
                }`}
              >
                <div className="h-14 p-3 flex flex-col justify-end" style={{ background: theme.colors.bg }}>
                  <div className="w-10 h-1 rounded-full mb-1" style={{ background: theme.colors.accent }} />
                  <div className="w-16 h-1 rounded-full opacity-30" style={{ background: theme.colors.fg }} />
                </div>
                <div className="p-2 bg-card">
                  <p className="text-[11px] font-semibold text-foreground truncate">{theme.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{theme.subtitle}</p>
                </div>
              </button>
            ))}
          </div>
        </Section>
      </div>

      {/* Export bar */}
      <div className="p-3 lg:p-4 border-t border-border shrink-0 space-y-2">
        <button className="w-full py-3.5 lg:py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg active:scale-[0.98]">
          <Sparkles size={18} />
          Generate PDF
          <span className="ml-1 px-2 py-0.5 rounded-md bg-primary-foreground/20 text-[11px] font-semibold">5 Credits</span>
        </button>
        <button 
          onClick={handleExportPptx}
          disabled={isExporting}
          className="w-full py-3 lg:py-3 rounded-xl border border-border text-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:bg-muted transition-colors active:scale-[0.98] disabled:opacity-50"
        >
          <Download size={16} />
          {isExporting ? 'Exporting...' : 'Download PPTX'}
        </button>
      </div>
    </div>
  );
};

export default EditorPanel;
