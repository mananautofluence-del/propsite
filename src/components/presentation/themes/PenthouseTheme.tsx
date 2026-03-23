import { Phone, Mail, Award, QrCode, Gem, Wifi, Wine, Waves, Shield, Sparkles, MapPin, Navigation } from 'lucide-react';
import type { PresentationData, SlideType, AspectRatio } from '@/lib/presentationState';
import type { ThemeImages } from '@/lib/themeImages';

interface Props {
  data: PresentationData;
  slideType: SlideType;
  aspect: AspectRatio;
  images: ThemeImages;
}

const s = {
  bg: '#0A0A0A',
  fg: '#F0EDE8',
  accent: '#C9A96E',
  muted: '#1A1A1A',
  border: '#2A2A2A',
  headFont: "'Playfair Display', serif",
  bodyFont: "'Inter', system-ui, sans-serif",
};

const PenthouseTheme = ({ data, slideType, aspect, images }: Props) => {
  const isP = aspect === 'portrait';

  const Cover = () => (
    <div className="relative w-full h-full overflow-hidden" style={{ background: s.bg }}>
      <img src={images.hero} alt="Property" className="absolute inset-0 w-full h-full object-cover opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
      {/* Glassmorphic badge */}
      <div
        className="absolute top-8 right-8 px-6 py-3 text-xs font-semibold tracking-[0.4em] uppercase"
        style={{ background: 'rgba(201,169,110,0.15)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: `1px solid ${s.accent}40`, color: s.accent, fontFamily: s.bodyFont }}
      >
        Exclusive Listing
      </div>
      {/* Overlapping glassmorphic text block */}
      <div className="absolute bottom-0 left-0 right-0 p-12">
        <div
          className="p-10"
          style={{ background: 'rgba(10,10,10,0.6)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)', borderTop: `2px solid ${s.accent}` }}
        >
          <p className="text-sm tracking-[0.5em] uppercase mb-4" style={{ color: s.accent, fontFamily: s.bodyFont }}>{data.location}</p>
          <h1 className={`${isP ? 'text-5xl' : 'text-7xl'} leading-none mb-4`} style={{ fontFamily: s.headFont, color: s.fg }}>{data.title}</h1>
          <p className="text-xl opacity-60 mb-6" style={{ fontFamily: s.bodyFont, color: s.fg }}>{data.subtitle}</p>
          <div className="flex items-end justify-between">
            <p className="text-4xl font-bold" style={{ fontFamily: s.headFont, color: s.accent }}>{data.price}</p>
            <p className="text-sm opacity-40" style={{ fontFamily: s.bodyFont, color: s.fg }}>{data.propertyType}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const Overview = () => (
    <div className={`w-full h-full flex ${isP ? 'flex-col' : ''}`} style={{ background: s.bg, color: s.fg }}>
      <div className={`${isP ? 'h-2/5' : 'w-1/2 h-full'} relative`}>
        <img src={images.bedroom} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: isP ? 'linear-gradient(to bottom, transparent, #0A0A0A)' : 'linear-gradient(to right, transparent, #0A0A0A)' }} />
      </div>
      <div className={`${isP ? 'flex-1 p-8' : 'w-1/2 h-full flex flex-col justify-center px-14'}`}>
        <div className="w-16 h-[2px] mb-6" style={{ background: s.accent }} />
        <h2 className="text-4xl mb-6" style={{ fontFamily: s.headFont }}>{data.title}</h2>
        <p className="text-base leading-relaxed opacity-60 mb-10" style={{ fontFamily: s.bodyFont }}>{data.description}</p>
        <div className="grid grid-cols-3 gap-6">
          {[
            { label: 'Bedrooms', value: data.bedrooms },
            { label: 'Bathrooms', value: data.bathrooms },
            { label: 'Area', value: data.area },
          ].map(item => (
            <div key={item.label} className="text-center border-t pt-4" style={{ borderColor: s.border }}>
              <p className="text-3xl mb-1" style={{ fontFamily: s.headFont, color: s.accent }}>{item.value}</p>
              <p className="text-xs uppercase tracking-widest opacity-40" style={{ fontFamily: s.bodyFont }}>{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const Features = () => (
    <div className={`w-full h-full flex ${isP ? 'flex-col' : ''}`} style={{ background: s.bg, color: s.fg }}>
      <div className={`${isP ? 'h-2/5' : 'w-1/2 h-full'} relative overflow-hidden`}>
        <img src={images.interior} alt="" className="w-full h-full object-cover" />
      </div>
      <div className={`${isP ? 'flex-1 p-8' : 'w-1/2 h-full flex flex-col justify-center px-14'}`}>
        <p className="text-xs tracking-[0.5em] uppercase mb-4" style={{ color: s.accent, fontFamily: s.bodyFont }}>Signature Features</p>
        <h2 className="text-4xl mb-10" style={{ fontFamily: s.headFont }}>Unmatched Luxury</h2>
        <div className="space-y-6">
          {data.features.map((feat, i) => (
            <div key={i} className="flex items-center gap-5 pb-6" style={{ borderBottom: `1px solid ${s.border}` }}>
              <div className="w-10 h-10 flex items-center justify-center shrink-0" style={{ border: `1px solid ${s.accent}` }}>
                <Gem size={18} style={{ color: s.accent }} />
              </div>
              <p className="text-lg" style={{ fontFamily: s.bodyFont }}>{feat}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const Specs = () => (
    <div className="w-full h-full flex flex-col justify-center px-16" style={{ background: s.bg, color: s.fg }}>
      <p className="text-xs tracking-[0.5em] uppercase mb-4" style={{ color: s.accent, fontFamily: s.bodyFont }}>Technical Specifications</p>
      <h2 className="text-4xl mb-10" style={{ fontFamily: s.headFont }}>Floorplan & Specs</h2>
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Total Area', value: data.area },
          { label: 'Year Built', value: data.yearBuilt },
          { label: 'Parking', value: data.parking },
          { label: 'Lot Size', value: data.lotSize },
          { label: 'Bedrooms', value: data.bedrooms },
          { label: 'Bathrooms', value: data.bathrooms },
        ].map(spec => (
          <div key={spec.label} className="p-5" style={{ background: s.muted, borderLeft: `3px solid ${s.accent}` }}>
            <p className="text-xs uppercase tracking-widest opacity-40 mb-1" style={{ fontFamily: s.bodyFont }}>{spec.label}</p>
            <p className="text-xl font-semibold" style={{ fontFamily: s.headFont }}>{spec.value}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const Amenities = () => {
    const amenities = [
      { icon: Waves, label: 'Infinity Pool' },
      { icon: Wine, label: 'Wine Cellar' },
      { icon: Shield, label: '24/7 Security' },
      { icon: Wifi, label: 'Smart Home' },
      { icon: Sparkles, label: 'Spa & Sauna' },
      { icon: Gem, label: 'Concierge' },
    ];
    return (
      <div className="w-full h-full flex flex-col justify-center px-16" style={{ background: s.bg, color: s.fg }}>
        <p className="text-xs tracking-[0.5em] uppercase mb-4" style={{ color: s.accent, fontFamily: s.bodyFont }}>World-Class Amenities</p>
        <h2 className="text-4xl mb-10" style={{ fontFamily: s.headFont }}>Lifestyle Elevated</h2>
        <div className="grid grid-cols-3 gap-6">
          {amenities.map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center text-center p-6" style={{ background: s.muted, border: `1px solid ${s.border}` }}>
              <Icon size={28} style={{ color: s.accent }} className="mb-3" />
              <p className="text-sm" style={{ fontFamily: s.bodyFont }}>{label}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const Gallery = () => (
    <div className="w-full h-full p-8 flex flex-col" style={{ background: s.bg, color: s.fg }}>
      <p className="text-xs tracking-[0.5em] uppercase mb-2" style={{ color: s.accent, fontFamily: s.bodyFont }}>Gallery</p>
      <h2 className="text-3xl mb-6" style={{ fontFamily: s.headFont }}>Visual Experience</h2>
      <div className={`flex-1 grid ${isP ? 'grid-cols-1 grid-rows-3' : 'grid-cols-3'} gap-3`}>
        {[images.gallery1, images.gallery2, images.gallery3].map((img, i) => (
          <div key={i} className="relative overflow-hidden group">
            <img src={img} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 border" style={{ borderColor: `${s.accent}30` }} />
          </div>
        ))}
      </div>
    </div>
  );

  const Location = () => (
    <div className={`w-full h-full flex ${isP ? 'flex-col' : ''}`} style={{ background: s.bg, color: s.fg }}>
      <div className={`${isP ? 'h-1/2' : 'w-1/2 h-full'} flex items-center justify-center`} style={{ background: s.muted }}>
        <div className="text-center opacity-30">
          <MapPin size={64} style={{ color: s.accent }} className="mx-auto mb-3" />
          <p className="text-sm" style={{ fontFamily: s.bodyFont }}>Interactive Map</p>
        </div>
      </div>
      <div className={`${isP ? 'flex-1 p-8' : 'w-1/2 h-full flex flex-col justify-center px-14'}`}>
        <p className="text-xs tracking-[0.5em] uppercase mb-4" style={{ color: s.accent, fontFamily: s.bodyFont }}>Location</p>
        <h2 className="text-4xl mb-6" style={{ fontFamily: s.headFont }}>{data.location}</h2>
        <div className="space-y-4">
          {['5 min to Private Beach', '10 min to International Airport', '2 min to Marina', 'Walking distance to Fine Dining'].map(item => (
            <div key={item} className="flex items-center gap-3 pb-4" style={{ borderBottom: `1px solid ${s.border}` }}>
              <Navigation size={14} style={{ color: s.accent }} />
              <p className="text-sm" style={{ fontFamily: s.bodyFont }}>{item}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const Contact = () => (
    <div className="w-full h-full flex" style={{ background: s.bg, color: s.fg }}>
      <div className={`${isP ? 'w-full' : 'w-3/5'} h-full flex flex-col justify-center px-14`}>
        <div className="w-16 h-[2px] mb-8" style={{ background: s.accent }} />
        <p className="text-xs tracking-[0.5em] uppercase mb-4" style={{ color: s.accent, fontFamily: s.bodyFont }}>Your Private Advisor</p>
        <h2 className="text-5xl mb-2" style={{ fontFamily: s.headFont }}>{data.brokerName}</h2>
        <p className="text-lg opacity-50 mb-10" style={{ fontFamily: s.bodyFont }}>{data.brokerTitle}</p>
        <div className="space-y-5">
          {[
            { icon: Award, text: data.brokerAgency },
            { icon: Phone, text: data.brokerPhone },
            { icon: Mail, text: data.brokerEmail },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-4">
              <Icon size={20} style={{ color: s.accent }} />
              <span className="text-base" style={{ fontFamily: s.bodyFont }}>{text}</span>
            </div>
          ))}
        </div>
        <p className="mt-8 text-xs opacity-30 tracking-widest uppercase" style={{ fontFamily: s.bodyFont }}>{data.brokerRera}</p>
      </div>
      {!isP && (
        <div className="w-2/5 h-full flex flex-col items-center justify-center gap-8">
          <div className="w-52 h-52 overflow-hidden" style={{ border: `3px solid ${s.accent}` }}>
            <img src={images.broker} alt="Broker" className="w-full h-full object-cover" />
          </div>
          <div className="w-32 h-32 flex items-center justify-center" style={{ background: s.muted, border: `1px solid ${s.border}` }}>
            <QrCode size={64} style={{ color: s.fg, opacity: 0.25 }} />
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

export default PenthouseTheme;
