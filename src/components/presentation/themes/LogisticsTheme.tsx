import { Phone, Mail, Award, QrCode, Truck, Container, Gauge, ArrowUpDown, Warehouse, Forklift, MapPin, Navigation } from 'lucide-react';
import type { PresentationData, SlideType, AspectRatio } from '@/lib/presentationState';
import type { ThemeImages } from '@/lib/themeImages';

interface Props { data: PresentationData; slideType: SlideType; aspect: AspectRatio; images: ThemeImages; }

const l = {
  bg: '#E5E5E5', fg: '#1A1A1A', accent: '#F59E0B', muted: '#D4D4D4', border: '#A3A3A3',
  headFont: "'Inter', system-ui, sans-serif",
  monoFont: "'JetBrains Mono', monospace",
};

const LogisticsTheme = ({ data, slideType, aspect, images }: Props) => {
  const isP = aspect === 'portrait';

  const Cover = () => (
    <div className="relative w-full h-full" style={{ background: l.fg }}>
      <img src={images.hero} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
      <div className="absolute top-0 left-0 right-0 h-3" style={{ background: `repeating-linear-gradient(90deg, ${l.accent} 0px, ${l.accent} 30px, ${l.fg} 30px, ${l.fg} 60px)` }} />
      <div className="absolute inset-0 flex flex-col justify-end p-12">
        <p className="text-xs font-bold tracking-[0.5em] uppercase mb-4" style={{ color: l.accent, fontFamily: l.monoFont }}>INDUSTRIAL FACILITY</p>
        <h1 className={`${isP ? 'text-4xl' : 'text-6xl'} font-black uppercase leading-none mb-4`} style={{ fontFamily: l.headFont, color: '#fff' }}>{data.title}</h1>
        <div className="flex gap-4 mt-4">
          <div className="px-5 py-3 font-bold" style={{ background: l.accent, color: l.fg, fontFamily: l.monoFont }}>{data.price}</div>
          <div className="px-5 py-3 font-mono text-sm" style={{ border: `2px solid ${l.accent}`, color: l.accent, fontFamily: l.monoFont }}>{data.area}</div>
        </div>
      </div>
    </div>
  );

  const Overview = () => (
    <div className="w-full h-full p-12 flex flex-col" style={{ background: l.bg, color: l.fg }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-2 h-8" style={{ background: l.accent }} />
        <h2 className="text-3xl font-black uppercase" style={{ fontFamily: l.headFont }}>Facility Overview</h2>
      </div>
      <div className={`flex-1 flex ${isP ? 'flex-col' : ''} gap-8`}>
        <div className={isP ? '' : 'w-1/2'}>
          <p className="text-sm leading-relaxed opacity-70 mb-6" style={{ fontFamily: l.monoFont }}>{data.description}</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'AREA', value: data.area },
              { label: 'LOT', value: data.lotSize },
              { label: 'YEAR', value: data.yearBuilt },
              { label: 'PARKING', value: data.parking },
            ].map(item => (
              <div key={item.label} className="p-4" style={{ background: '#fff', borderLeft: `4px solid ${l.accent}` }}>
                <p className="text-[10px] font-bold tracking-widest opacity-40" style={{ fontFamily: l.monoFont }}>{item.label}</p>
                <p className="text-lg font-black" style={{ fontFamily: l.monoFont }}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className={`${isP ? 'h-48' : 'w-1/2 h-full'}`}>
          <img src={images.hero} alt="" className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  );

  const Features = () => (
    <div className="w-full h-full p-12 flex flex-col justify-center" style={{ background: l.bg, color: l.fg }}>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-2 h-8" style={{ background: l.accent }} />
        <h2 className="text-3xl font-black uppercase" style={{ fontFamily: l.headFont }}>Technical Specs</h2>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {data.features.map((feat, i) => (
          <div key={i} className="p-5 flex items-center gap-4" style={{ background: '#fff', borderBottom: `3px solid ${l.accent}` }}>
            <div className="w-10 h-10 flex items-center justify-center shrink-0" style={{ background: l.accent }}>
              <Gauge size={20} style={{ color: l.fg }} />
            </div>
            <p className="text-sm font-bold" style={{ fontFamily: l.monoFont }}>{feat}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const Specs = () => (
    <div className="w-full h-full p-12 flex flex-col" style={{ background: l.bg, color: l.fg }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-2 h-8" style={{ background: l.accent }} />
        <h2 className="text-3xl font-black uppercase" style={{ fontFamily: l.headFont }}>Spec Sheet</h2>
      </div>
      <div className="flex-1">
        <div className="w-full" style={{ fontFamily: l.monoFont }}>
          {[
            ['PARAMETER', 'VALUE'],
            ['Total Area', data.area],
            ['Lot Size', data.lotSize],
            ['Year Built', data.yearBuilt],
            ['Parking', data.parking],
            ['Bathrooms', data.bathrooms],
            ['Type', data.propertyType],
          ].map(([label, value], i) => (
            <div key={label} className="flex" style={{ background: i === 0 ? l.accent : i % 2 === 0 ? '#fff' : l.muted, color: l.fg }}>
              <div className="w-1/2 px-5 py-3 text-xs font-bold uppercase tracking-widest" style={{ fontWeight: i === 0 ? 900 : 500 }}>{label}</div>
              <div className="w-1/2 px-5 py-3 text-sm font-bold">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const Amenities = () => {
    const amenities = [
      { icon: Truck, label: 'Loading Bays' },
      { icon: Container, label: 'Container Yard' },
      { icon: ArrowUpDown, label: 'Goods Lift' },
      { icon: Warehouse, label: 'Cold Storage' },
      { icon: Forklift, label: 'Forklift Access' },
      { icon: Gauge, label: 'Power: 500KVA' },
    ];
    return (
      <div className="w-full h-full p-12 flex flex-col justify-center" style={{ background: l.bg, color: l.fg }}>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-2 h-8" style={{ background: l.accent }} />
          <h2 className="text-3xl font-black uppercase" style={{ fontFamily: l.headFont }}>Facility Features</h2>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {amenities.map(({ icon: Icon, label }) => (
            <div key={label} className="p-5 text-center" style={{ background: '#fff', borderTop: `3px solid ${l.accent}` }}>
              <Icon size={28} style={{ color: l.accent }} className="mx-auto mb-3" />
              <p className="text-xs font-bold uppercase tracking-widest" style={{ fontFamily: l.monoFont }}>{label}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const Gallery = () => (
    <div className="w-full h-full p-6" style={{ background: l.bg }}>
      <div className={`w-full h-full grid ${isP ? 'grid-cols-1 grid-rows-3' : 'grid-cols-3'} gap-2`}>
        {[images.gallery1, images.gallery2, images.gallery3].map((img, i) => (
          <div key={i} className="overflow-hidden relative">
            <img src={img} alt="" className="w-full h-full object-cover" />
            <div className="absolute top-2 left-2 px-2 py-1 text-[10px] font-bold" style={{ background: l.accent, color: l.fg, fontFamily: l.monoFont }}>IMG-{String(i + 1).padStart(3, '0')}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const Location = () => (
    <div className={`w-full h-full flex ${isP ? 'flex-col' : ''}`} style={{ background: l.bg, color: l.fg }}>
      <div className={`${isP ? 'h-1/2' : 'w-1/2 h-full'} flex items-center justify-center`} style={{ background: l.muted }}>
        <div className="text-center opacity-30">
          <MapPin size={64} style={{ color: l.accent }} className="mx-auto mb-3" />
          <p className="text-sm font-bold uppercase tracking-widest" style={{ fontFamily: l.monoFont }}>Logistics Map</p>
        </div>
      </div>
      <div className={`${isP ? 'flex-1 p-8' : 'w-1/2 h-full flex flex-col justify-center px-12'}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2 h-6" style={{ background: l.accent }} />
          <h2 className="text-2xl font-black uppercase">{data.location}</h2>
        </div>
        <div className="space-y-3">
          {['Highway: Direct Access', 'Port: 5 km', 'Rail Siding: On-site', 'Airport: 30 min'].map(item => (
            <div key={item} className="flex items-center gap-3 p-3" style={{ background: '#fff' }}>
              <Navigation size={14} style={{ color: l.accent }} />
              <p className="text-sm font-bold" style={{ fontFamily: l.monoFont }}>{item}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const Contact = () => (
    <div className="w-full h-full" style={{ background: l.bg, color: l.fg }}>
      <div className="h-3" style={{ background: `repeating-linear-gradient(90deg, ${l.accent} 0px, ${l.accent} 30px, ${l.fg} 30px, ${l.fg} 60px)` }} />
      <div className={`flex ${isP ? 'flex-col' : ''} h-full p-12 gap-8`}>
        <div className={isP ? '' : 'w-3/5 flex flex-col justify-center'}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-6" style={{ background: l.accent }} />
            <p className="text-xs font-bold tracking-widest uppercase" style={{ fontFamily: l.monoFont }}>Contact</p>
          </div>
          <h2 className="text-4xl font-black uppercase mb-2" style={{ fontFamily: l.headFont }}>{data.brokerName}</h2>
          <p className="text-sm opacity-50 mb-8" style={{ fontFamily: l.monoFont }}>{data.brokerTitle}</p>
          <div className="space-y-3">
            {[
              { icon: Award, text: data.brokerAgency },
              { icon: Phone, text: data.brokerPhone },
              { icon: Mail, text: data.brokerEmail },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 p-3" style={{ background: '#fff' }}>
                <Icon size={18} style={{ color: l.accent }} />
                <span className="text-sm font-bold" style={{ fontFamily: l.monoFont }}>{text}</span>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs opacity-30 tracking-widest uppercase" style={{ fontFamily: l.monoFont }}>{data.brokerRera}</p>
        </div>
        {!isP && (
          <div className="w-2/5 flex flex-col items-center justify-center gap-6">
            <div className="w-44 h-44 overflow-hidden">
              <img src={images.broker} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="w-28 h-28 flex items-center justify-center" style={{ background: '#fff', border: `2px solid ${l.border}` }}>
              <QrCode size={56} style={{ color: l.fg, opacity: 0.2 }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const slides: Record<SlideType, () => JSX.Element> = {
    cover: Cover, overview: Overview, features: Features, gallery: Gallery,
    specs: Specs, amenities: Amenities, location: Location, contact: Contact,
  };
  return slides[slideType]();
};

export default LogisticsTheme;
