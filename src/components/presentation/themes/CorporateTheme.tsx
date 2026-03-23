import { Phone, Mail, Award, QrCode, Building2, Zap, Train, ShieldCheck, Wifi, Leaf, MapPin, Navigation } from 'lucide-react';
import type { PresentationData, SlideType, AspectRatio } from '@/lib/presentationState';
import type { ThemeImages } from '@/lib/themeImages';

interface Props { data: PresentationData; slideType: SlideType; aspect: AspectRatio; images: ThemeImages; }

const c = {
  bg: '#0F172A', fg: '#F8FAFC', accent: '#3B82F6', muted: '#1E293B', border: '#334155',
  headFont: "'Roboto', 'Helvetica Neue', sans-serif",
  bodyFont: "'Roboto', 'Helvetica Neue', sans-serif",
};

const CorporateTheme = ({ data, slideType, aspect, images }: Props) => {
  const isP = aspect === 'portrait';

  const Cover = () => (
    <div className="relative w-full h-full" style={{ background: c.bg }}>
      <img src={images.hero} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-[#0F172A]/80 to-transparent" />
      <div className="absolute top-0 left-0 w-2 h-full" style={{ background: c.accent }} />
      <div className="absolute inset-0 flex flex-col justify-end p-14">
        <p className="text-xs font-bold tracking-[0.5em] uppercase mb-6" style={{ color: c.accent, fontFamily: c.bodyFont }}>{data.propertyType}</p>
        <h1 className={`${isP ? 'text-4xl' : 'text-6xl'} font-black uppercase leading-none mb-4`} style={{ fontFamily: c.headFont, color: c.fg }}>{data.title}</h1>
        <p className="text-xl opacity-60 mb-8" style={{ fontFamily: c.bodyFont, color: c.fg }}>{data.subtitle}</p>
        <div className="flex gap-6">
          <div className="px-6 py-3 font-bold text-2xl" style={{ background: c.accent, color: '#fff', fontFamily: c.headFont }}>{data.price}</div>
          <div className="px-6 py-3 border text-sm flex items-center gap-2" style={{ borderColor: c.border, color: c.fg, fontFamily: c.bodyFont }}>
            <MapPin size={14} /> {data.location}
          </div>
        </div>
      </div>
    </div>
  );

  const Overview = () => (
    <div className="w-full h-full flex flex-col" style={{ background: c.bg, color: c.fg }}>
      <div className="h-2" style={{ background: c.accent }} />
      <div className={`flex-1 flex ${isP ? 'flex-col' : ''} p-12 gap-10`}>
        <div className={isP ? '' : 'w-1/2'}>
          <p className="text-xs font-bold tracking-[0.4em] uppercase mb-3" style={{ color: c.accent }}>Executive Summary</p>
          <h2 className="text-4xl font-black uppercase mb-6" style={{ fontFamily: c.headFont }}>{data.title}</h2>
          <p className="text-sm leading-relaxed opacity-60" style={{ fontFamily: c.bodyFont }}>{data.description}</p>
        </div>
        <div className={`${isP ? '' : 'w-1/2'} grid grid-cols-2 gap-3`}>
          {[
            { label: 'TOTAL AREA', value: data.area },
            { label: 'YEAR BUILT', value: data.yearBuilt },
            { label: 'PARKING', value: data.parking },
            { label: 'FLOOR PLATE', value: data.lotSize },
          ].map(item => (
            <div key={item.label} className="p-5" style={{ background: c.muted, borderLeft: `3px solid ${c.accent}` }}>
              <p className="text-[10px] font-bold tracking-widest opacity-40 mb-1" style={{ fontFamily: c.bodyFont }}>{item.label}</p>
              <p className="text-xl font-bold" style={{ fontFamily: c.headFont }}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const Features = () => (
    <div className={`w-full h-full flex ${isP ? 'flex-col' : ''}`} style={{ background: c.bg, color: c.fg }}>
      <div className={`${isP ? 'h-2/5' : 'w-1/2 h-full'} relative`}>
        <img src={images.interior} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${c.accent}20, transparent)` }} />
      </div>
      <div className={`${isP ? 'flex-1 p-8' : 'w-1/2 h-full flex flex-col justify-center px-12'}`}>
        <p className="text-xs font-bold tracking-[0.4em] uppercase mb-3" style={{ color: c.accent }}>Key Performance Metrics</p>
        <h2 className="text-3xl font-black uppercase mb-8" style={{ fontFamily: c.headFont }}>Core Features</h2>
        <div className="space-y-4">
          {data.features.map((feat, i) => (
            <div key={i} className="flex items-center gap-4 p-4" style={{ background: c.muted, borderRadius: '6px' }}>
              <div className="w-8 h-8 flex items-center justify-center shrink-0" style={{ background: c.accent, borderRadius: '6px' }}>
                <Zap size={16} color="#fff" />
              </div>
              <p className="text-sm font-medium" style={{ fontFamily: c.bodyFont }}>{feat}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const Specs = () => (
    <div className="w-full h-full p-12 flex flex-col" style={{ background: c.bg, color: c.fg }}>
      <p className="text-xs font-bold tracking-[0.4em] uppercase mb-3" style={{ color: c.accent }}>Technical Data Sheet</p>
      <h2 className="text-3xl font-black uppercase mb-8" style={{ fontFamily: c.headFont }}>Building Specifications</h2>
      <div className="flex-1">
        <table className="w-full text-sm" style={{ fontFamily: c.bodyFont }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${c.accent}` }}>
              <th className="text-left py-3 text-xs tracking-widest uppercase opacity-50">Parameter</th>
              <th className="text-right py-3 text-xs tracking-widest uppercase opacity-50">Value</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Total Area', data.area], ['Floor Plate', data.lotSize], ['Year Built', data.yearBuilt],
              ['Parking Bays', data.parking], ['Bathrooms', data.bathrooms], ['Property Type', data.propertyType],
            ].map(([label, value]) => (
              <tr key={label} style={{ borderBottom: `1px solid ${c.border}` }}>
                <td className="py-4 font-medium">{label}</td>
                <td className="py-4 text-right font-bold" style={{ color: c.accent }}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const Amenities = () => {
    const amenities = [
      { icon: Building2, label: 'Business Center' },
      { icon: ShieldCheck, label: 'Access Control' },
      { icon: Wifi, label: 'Fiber Optic' },
      { icon: Zap, label: '100% Backup' },
      { icon: Leaf, label: 'LEED Certified' },
      { icon: Train, label: 'Metro Access' },
    ];
    return (
      <div className="w-full h-full p-12 flex flex-col" style={{ background: c.bg, color: c.fg }}>
        <p className="text-xs font-bold tracking-[0.4em] uppercase mb-3" style={{ color: c.accent }}>Building Amenities</p>
        <h2 className="text-3xl font-black uppercase mb-8" style={{ fontFamily: c.headFont }}>World-Class Infrastructure</h2>
        <div className="flex-1 grid grid-cols-3 gap-4">
          {amenities.map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center justify-center p-6" style={{ background: c.muted, borderRadius: '6px', border: `1px solid ${c.border}` }}>
              <div className="w-12 h-12 flex items-center justify-center mb-3" style={{ background: c.accent, borderRadius: '6px' }}>
                <Icon size={24} color="#fff" />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ fontFamily: c.bodyFont }}>{label}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const Gallery = () => (
    <div className="w-full h-full p-8 flex flex-col" style={{ background: c.bg, color: c.fg }}>
      <div className="h-1 w-20 mb-4" style={{ background: c.accent }} />
      <h2 className="text-2xl font-black uppercase mb-6" style={{ fontFamily: c.headFont }}>Facility Gallery</h2>
      <div className={`flex-1 grid ${isP ? 'grid-cols-1 grid-rows-4' : 'grid-cols-4'} gap-3`}>
        {[images.gallery1, images.gallery2, images.gallery3, images.gallery4].map((img, i) => (
          <div key={i} className="overflow-hidden" style={{ borderRadius: '6px' }}>
            <img src={img} alt="" className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    </div>
  );

  const Location = () => (
    <div className={`w-full h-full flex ${isP ? 'flex-col' : ''}`} style={{ background: c.bg, color: c.fg }}>
      <div className={`${isP ? 'h-1/2' : 'w-1/2 h-full'} flex items-center justify-center`} style={{ background: c.muted }}>
        <div className="text-center opacity-30">
          <MapPin size={64} style={{ color: c.accent }} className="mx-auto mb-3" />
          <p className="text-sm uppercase tracking-widest" style={{ fontFamily: c.bodyFont }}>Transit Map</p>
        </div>
      </div>
      <div className={`${isP ? 'flex-1 p-8' : 'w-1/2 h-full flex flex-col justify-center px-12'}`}>
        <p className="text-xs font-bold tracking-[0.4em] uppercase mb-3" style={{ color: c.accent }}>Strategic Location</p>
        <h2 className="text-3xl font-black uppercase mb-6" style={{ fontFamily: c.headFont }}>{data.location}</h2>
        <div className="space-y-3">
          {['CBD: 2 min drive', 'Metro Station: 200m walk', 'Airport: 25 min', 'Major Highway: Direct Access'].map(item => (
            <div key={item} className="flex items-center gap-3 p-3" style={{ background: c.muted, borderRadius: '6px' }}>
              <Navigation size={14} style={{ color: c.accent }} />
              <p className="text-sm font-medium" style={{ fontFamily: c.bodyFont }}>{item}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const Contact = () => (
    <div className="w-full h-full" style={{ background: c.bg, color: c.fg }}>
      <div className="h-2" style={{ background: c.accent }} />
      <div className={`flex ${isP ? 'flex-col' : ''} h-full p-12 gap-10`}>
        <div className={isP ? '' : 'w-3/5 flex flex-col justify-center'}>
          <p className="text-xs font-bold tracking-[0.4em] uppercase mb-3" style={{ color: c.accent }}>Get In Touch</p>
          <h2 className="text-4xl font-black uppercase mb-2" style={{ fontFamily: c.headFont }}>{data.brokerName}</h2>
          <p className="text-base opacity-50 mb-8" style={{ fontFamily: c.bodyFont }}>{data.brokerTitle}</p>
          <div className="space-y-3">
            {[
              { icon: Award, text: data.brokerAgency },
              { icon: Phone, text: data.brokerPhone },
              { icon: Mail, text: data.brokerEmail },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 p-3" style={{ background: c.muted, borderRadius: '6px' }}>
                <Icon size={18} style={{ color: c.accent }} />
                <span className="text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs opacity-30 tracking-widest uppercase">{data.brokerRera}</p>
        </div>
        {!isP && (
          <div className="w-2/5 flex flex-col items-center justify-center gap-8">
            <div className="w-48 h-48 overflow-hidden" style={{ borderRadius: '6px', border: `3px solid ${c.accent}` }}>
              <img src={images.broker} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="w-28 h-28 flex items-center justify-center" style={{ background: c.muted, borderRadius: '6px' }}>
              <QrCode size={56} style={{ color: c.fg, opacity: 0.2 }} />
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

export default CorporateTheme;
