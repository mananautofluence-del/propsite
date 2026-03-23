import { Phone, Mail, Award, QrCode, Store, Users, Eye, TrendingUp, Ruler, Clock, MapPin, Navigation } from 'lucide-react';
import type { PresentationData, SlideType, AspectRatio } from '@/lib/presentationState';
import type { ThemeImages } from '@/lib/themeImages';

interface Props { data: PresentationData; slideType: SlideType; aspect: AspectRatio; images: ThemeImages; }

const h = {
  bg: '#FBF7F0', fg: '#1A1A1A', accent: '#C4715B', muted: '#F3EDE4', border: '#E8DFD2',
  headFont: "'Inter', system-ui, sans-serif",
  bodyFont: "'Inter', system-ui, sans-serif",
};

const HighStreetTheme = ({ data, slideType, aspect, images }: Props) => {
  const isP = aspect === 'portrait';

  const Cover = () => (
    <div className="relative w-full h-full" style={{ background: h.bg }}>
      <div className="absolute top-0 right-0 w-3/5 h-full">
        <img src={images.hero} alt="" className="w-full h-full object-cover" />
      </div>
      <div className="absolute top-0 left-0 w-2/5 h-full flex flex-col justify-between p-12" style={{ background: h.bg }}>
        <div>
          <p className="text-xs tracking-[0.4em] uppercase mb-2" style={{ color: h.accent, fontFamily: h.bodyFont }}>{data.propertyType}</p>
          <div className="w-12 h-[1px] mt-2" style={{ background: h.accent }} />
        </div>
        <div>
          <h1 className={`${isP ? 'text-3xl' : 'text-5xl'} font-extrabold leading-none mb-4`} style={{ fontFamily: h.headFont, color: h.fg }}>{data.title}</h1>
          <p className="text-lg italic opacity-60 mb-6" style={{ fontFamily: h.bodyFont, color: h.fg }}>{data.subtitle}</p>
          <p className="text-4xl font-extrabold" style={{ color: h.accent, fontFamily: h.headFont }}>{data.price}</p>
        </div>
        <p className="text-xs tracking-widest uppercase opacity-40" style={{ fontFamily: h.bodyFont }}>{data.location}</p>
      </div>
    </div>
  );

  const Overview = () => (
    <div className={`w-full h-full flex ${isP ? 'flex-col' : ''}`} style={{ background: h.bg, color: h.fg }}>
      <div className={`${isP ? 'flex-1 p-8' : 'w-1/2 h-full flex flex-col justify-center px-14'}`}>
        <p className="text-xs tracking-[0.4em] uppercase mb-4 italic" style={{ color: h.accent }}>The Space</p>
        <h2 className="text-4xl font-extrabold mb-6" style={{ fontFamily: h.headFont }}>{data.title}</h2>
        <p className="text-sm leading-relaxed opacity-60 mb-8" style={{ fontFamily: h.bodyFont }}>{data.description}</p>
        <div className="flex gap-8">
          {[
            { label: 'Frontage', value: data.lotSize },
            { label: 'Area', value: data.area },
            { label: 'Type', value: data.propertyType },
          ].map(item => (
            <div key={item.label} className="border-l-2 pl-4" style={{ borderColor: h.accent }}>
              <p className="text-2xl font-extrabold" style={{ color: h.accent }}>{item.value}</p>
              <p className="text-[10px] uppercase tracking-widest opacity-40">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
      <div className={`${isP ? 'h-2/5' : 'w-1/2 h-full'}`}>
        <img src={images.bedroom} alt="" className="w-full h-full object-cover" />
      </div>
    </div>
  );

  const Features = () => (
    <div className="w-full h-full p-14 flex flex-col justify-center" style={{ background: h.bg, color: h.fg }}>
      <p className="text-xs tracking-[0.4em] uppercase italic mb-4" style={{ color: h.accent }}>Why This Space</p>
      <h2 className="text-4xl font-extrabold mb-10" style={{ fontFamily: h.headFont }}>Key Highlights</h2>
      <div className="grid grid-cols-2 gap-x-12 gap-y-6">
        {data.features.map((feat, i) => (
          <div key={i} className="flex items-start gap-4 pb-6" style={{ borderBottom: `1px solid ${h.border}` }}>
            <div className="w-2 h-2 rounded-full mt-2 shrink-0" style={{ background: h.accent }} />
            <p className="text-lg" style={{ fontFamily: h.bodyFont }}>{feat}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const Specs = () => (
    <div className={`w-full h-full flex ${isP ? 'flex-col' : ''}`} style={{ background: h.bg, color: h.fg }}>
      <div className={`${isP ? 'h-2/5' : 'w-1/2 h-full'}`}>
        <img src={images.interior} alt="" className="w-full h-full object-cover" />
      </div>
      <div className={`${isP ? 'flex-1 p-8' : 'w-1/2 h-full flex flex-col justify-center px-14'}`}>
        <p className="text-xs tracking-[0.4em] uppercase italic mb-4" style={{ color: h.accent }}>Details</p>
        <h2 className="text-3xl font-extrabold mb-8" style={{ fontFamily: h.headFont }}>Space Specifications</h2>
        <div className="space-y-4">
          {[
            { label: 'Total Area', value: data.area },
            { label: 'Frontage', value: data.lotSize },
            { label: 'Year Built', value: data.yearBuilt },
            { label: 'Parking', value: data.parking },
          ].map(spec => (
            <div key={spec.label} className="flex justify-between items-center pb-4" style={{ borderBottom: `1px solid ${h.border}` }}>
              <span className="text-sm uppercase tracking-widest opacity-50">{spec.label}</span>
              <span className="text-lg font-bold" style={{ color: h.accent }}>{spec.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const Amenities = () => {
    const amenities = [
      { icon: Store, label: 'Street Level' },
      { icon: Users, label: 'High Footfall' },
      { icon: Eye, label: 'Corner Visibility' },
      { icon: TrendingUp, label: 'Growth Area' },
      { icon: Ruler, label: 'Double Height' },
      { icon: Clock, label: '24/7 Access' },
    ];
    return (
      <div className="w-full h-full p-14 flex flex-col justify-center" style={{ background: h.bg, color: h.fg }}>
        <p className="text-xs tracking-[0.4em] uppercase italic mb-4" style={{ color: h.accent }}>Features</p>
        <h2 className="text-3xl font-extrabold mb-10" style={{ fontFamily: h.headFont }}>Retail Advantages</h2>
        <div className="grid grid-cols-3 gap-6">
          {amenities.map(({ icon: Icon, label }) => (
            <div key={label} className="text-center p-6" style={{ border: `1px solid ${h.border}`, borderRadius: '2px' }}>
              <Icon size={28} style={{ color: h.accent }} className="mx-auto mb-3" />
              <p className="text-sm font-semibold" style={{ fontFamily: h.bodyFont }}>{label}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const Gallery = () => (
    <div className="w-full h-full p-6" style={{ background: h.bg, color: h.fg }}>
      <div className={`w-full h-full grid ${isP ? 'grid-rows-3' : 'grid-cols-[2fr_1fr] grid-rows-2'} gap-3`}>
        <div className={`${isP ? '' : 'row-span-2'} overflow-hidden`} style={{ borderRadius: '2px' }}>
          <img src={images.gallery1} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="overflow-hidden" style={{ borderRadius: '2px' }}>
          <img src={images.gallery2} alt="" className="w-full h-full object-cover" />
        </div>
        {!isP && (
          <div className="overflow-hidden" style={{ borderRadius: '2px' }}>
            <img src={images.gallery3} alt="" className="w-full h-full object-cover" />
          </div>
        )}
      </div>
    </div>
  );

  const Location = () => (
    <div className={`w-full h-full flex ${isP ? 'flex-col' : ''}`} style={{ background: h.bg, color: h.fg }}>
      <div className={`${isP ? 'h-1/2' : 'w-1/2 h-full'} flex items-center justify-center`} style={{ background: h.muted }}>
        <div className="text-center opacity-30">
          <MapPin size={64} style={{ color: h.accent }} className="mx-auto mb-3" />
          <p className="text-sm italic">Street Map</p>
        </div>
      </div>
      <div className={`${isP ? 'flex-1 p-8' : 'w-1/2 h-full flex flex-col justify-center px-14'}`}>
        <p className="text-xs tracking-[0.4em] uppercase italic mb-4" style={{ color: h.accent }}>Location</p>
        <h2 className="text-3xl font-extrabold mb-6" style={{ fontFamily: h.headFont }}>{data.location}</h2>
        <div className="space-y-4">
          {['Prime Shopping District', 'Metro: 3 min walk', 'Parking Complex Adjacent', 'Luxury Hotels Nearby'].map(item => (
            <div key={item} className="flex items-center gap-3 pb-3" style={{ borderBottom: `1px solid ${h.border}` }}>
              <Navigation size={14} style={{ color: h.accent }} />
              <p className="text-sm">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const Contact = () => (
    <div className={`w-full h-full flex ${isP ? 'flex-col' : ''}`} style={{ background: h.bg, color: h.fg }}>
      <div className={`${isP ? 'flex-1 p-8' : 'w-3/5 h-full flex flex-col justify-center px-14'}`}>
        <p className="text-xs tracking-[0.4em] uppercase italic mb-4" style={{ color: h.accent }}>Let's Connect</p>
        <h2 className="text-5xl font-extrabold mb-2" style={{ fontFamily: h.headFont }}>{data.brokerName}</h2>
        <p className="text-lg italic opacity-50 mb-10">{data.brokerTitle}</p>
        <div className="space-y-5">
          {[
            { icon: Award, text: data.brokerAgency },
            { icon: Phone, text: data.brokerPhone },
            { icon: Mail, text: data.brokerEmail },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-4">
              <Icon size={20} style={{ color: h.accent }} />
              <span className="text-base">{text}</span>
            </div>
          ))}
        </div>
        <p className="mt-8 text-xs opacity-30 tracking-widest uppercase">{data.brokerRera}</p>
      </div>
      {!isP && (
        <div className="w-2/5 h-full flex flex-col items-center justify-center gap-8" style={{ background: h.muted }}>
          <div className="w-48 h-48 overflow-hidden" style={{ borderRadius: '2px' }}>
            <img src={images.broker} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="w-28 h-28 flex items-center justify-center" style={{ border: `1px solid ${h.border}`, borderRadius: '2px' }}>
            <QrCode size={56} style={{ color: h.fg, opacity: 0.2 }} />
          </div>
        </div>
      )}
    </div>
  );

  const slides: Record<SlideType, () => JSX.Element> = {
    cover: Cover, overview: Overview, features: Features, gallery: Gallery,
    specs: Specs, amenities: Amenities, location: Location, contact: Contact,
  };
  return slides[slideType]();
};

export default HighStreetTheme;
