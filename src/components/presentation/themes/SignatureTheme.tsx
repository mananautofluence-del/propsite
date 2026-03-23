import { Phone, Mail, Award, QrCode, Ruler, MapPin, BedDouble, Calendar, Car, Dumbbell, Waves, ShieldCheck, Wifi, TreePine, Wine, Navigation } from 'lucide-react';
import type { PresentationData, SlideType, AspectRatio } from '@/lib/presentationState';
import type { ThemeImages } from '@/lib/themeImages';

interface Props { data: PresentationData; slideType: SlideType; aspect: AspectRatio; images: ThemeImages; }

const t = {
  bg: '#FFFFFF', fg: '#111111', accent: '#1A5C3A', muted: '#F5F5F5', border: '#EFEFEF',
  font: "'Inter', system-ui, sans-serif",
};

const SignatureTheme = ({ data, slideType, aspect, images }: Props) => {
  const isP = aspect === 'portrait';

  const Cover = () => (
    <div className="relative w-full h-full" style={{ background: t.bg }}>
      <img src={images.hero} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute top-10 right-10 px-5 py-2.5 text-xs font-semibold tracking-widest uppercase" style={{ background: t.accent, color: '#fff', borderRadius: '8px', fontFamily: t.font }}>Exclusive</div>
      <div className="absolute bottom-0 left-0 right-0 p-14">
        <div className={`flex ${isP ? 'flex-col gap-4' : 'items-end justify-between'}`}>
          <div>
            <h1 className={`${isP ? 'text-4xl' : 'text-6xl'} font-extrabold leading-tight mb-2`} style={{ fontFamily: t.font, color: '#fff' }}>{data.title}</h1>
            <p className="text-xl opacity-70 mb-1" style={{ fontFamily: t.font, color: '#fff' }}>{data.subtitle}</p>
            <p className="text-sm tracking-widest uppercase opacity-50" style={{ fontFamily: t.font, color: '#fff' }}>{data.location}</p>
          </div>
          <div className={isP ? '' : 'text-right'}>
            <p className="text-4xl font-extrabold" style={{ color: t.accent, fontFamily: t.font }}>{data.price}</p>
            <p className="text-sm opacity-60 mt-1" style={{ color: '#fff' }}>{data.propertyType}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const Overview = () => (
    <div className={`w-full h-full flex ${isP ? 'flex-col' : ''}`} style={{ background: t.bg, color: t.fg }}>
      <div className={`${isP ? 'flex-1 p-8' : 'w-1/2 h-full flex flex-col justify-center px-14'}`}>
        <p className="text-xs font-semibold tracking-[0.3em] uppercase mb-4" style={{ color: t.accent }}>Property Overview</p>
        <h2 className="text-4xl font-extrabold mb-6" style={{ fontFamily: t.font }}>{data.title}</h2>
        <p className="text-sm leading-relaxed opacity-60 mb-10" style={{ fontFamily: t.font }}>{data.description}</p>
        <div className="grid grid-cols-3 gap-6">
          {[
            { label: 'Bedrooms', value: data.bedrooms },
            { label: 'Bathrooms', value: data.bathrooms },
            { label: 'Lot Size', value: data.lotSize },
          ].map(item => (
            <div key={item.label} className="text-center" style={{ borderRadius: '8px' }}>
              <p className="text-3xl font-extrabold mb-1" style={{ color: t.accent }}>{item.value}</p>
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
    <div className={`w-full h-full flex ${isP ? 'flex-col' : ''}`} style={{ background: t.bg, color: t.fg }}>
      <div className={`${isP ? 'h-2/5' : 'w-1/2 h-full'}`}>
        <img src={images.interior} alt="" className="w-full h-full object-cover" />
      </div>
      <div className={`${isP ? 'flex-1 p-8' : 'w-1/2 h-full flex flex-col justify-center px-14'}`}>
        <p className="text-xs font-semibold tracking-[0.3em] uppercase mb-4" style={{ color: t.accent }}>Key Features</p>
        <h2 className="text-3xl font-extrabold mb-8" style={{ fontFamily: t.font }}>What Sets It Apart</h2>
        <div className="space-y-5">
          {data.features.map((feat, i) => (
            <div key={i} className="flex items-center gap-4 pb-5" style={{ borderBottom: `1px solid ${t.border}` }}>
              <div className="w-10 h-10 flex items-center justify-center shrink-0" style={{ background: t.accent, borderRadius: '8px' }}>
                <Ruler size={18} color="#fff" />
              </div>
              <p className="text-base font-medium" style={{ fontFamily: t.font }}>{feat}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const Specs = () => (
    <div className={`w-full h-full flex ${isP ? 'flex-col' : ''}`} style={{ background: t.bg, color: t.fg }}>
      <div className={`${isP ? 'h-2/5' : 'w-1/2 h-full'}`}>
        <img src={images.interior} alt="" className="w-full h-full object-cover" />
      </div>
      <div className={`${isP ? 'flex-1 p-8' : 'w-1/2 h-full flex flex-col justify-center px-14'}`}>
        <p className="text-xs font-semibold tracking-[0.3em] uppercase mb-4" style={{ color: t.accent }}>Specifications</p>
        <h2 className="text-3xl font-extrabold mb-8" style={{ fontFamily: t.font }}>Key Details</h2>
        <div className="space-y-5">
          {[
            { icon: Ruler, label: 'Total Area', value: data.area },
            { icon: MapPin, label: 'Location', value: data.location },
            { icon: BedDouble, label: 'Bedrooms', value: data.bedrooms },
            { icon: Calendar, label: 'Year Built', value: data.yearBuilt },
            { icon: Car, label: 'Parking', value: data.parking },
          ].map(spec => (
            <div key={spec.label} className="flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center shrink-0" style={{ background: t.accent, borderRadius: '8px' }}>
                <spec.icon size={18} color="#fff" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest opacity-40 mb-0.5">{spec.label}</p>
                <p className="text-base font-semibold">{spec.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const Amenities = () => {
    const amenities = [
      { icon: Dumbbell, label: 'Fitness Center' },
      { icon: Waves, label: 'Swimming Pool' },
      { icon: ShieldCheck, label: '24/7 Security' },
      { icon: Wifi, label: 'Smart Home' },
      { icon: TreePine, label: 'Landscaped Garden' },
      { icon: Wine, label: 'Wine Cellar' },
    ];
    return (
      <div className="w-full h-full p-14 flex flex-col justify-center" style={{ background: t.bg, color: t.fg }}>
        <p className="text-xs font-semibold tracking-[0.3em] uppercase mb-4" style={{ color: t.accent }}>Amenities</p>
        <h2 className="text-3xl font-extrabold mb-10" style={{ fontFamily: t.font }}>Premium Facilities</h2>
        <div className="grid grid-cols-3 gap-5">
          {amenities.map(({ icon: Icon, label }) => (
            <div key={label} className="text-center p-6" style={{ background: t.muted, borderRadius: '8px' }}>
              <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3" style={{ background: t.accent, borderRadius: '8px' }}>
                <Icon size={24} color="#fff" />
              </div>
              <p className="text-sm font-semibold">{label}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const Gallery = () => (
    <div className="w-full h-full p-10 flex flex-col" style={{ background: t.bg, color: t.fg }}>
      <p className="text-xs font-semibold tracking-[0.3em] uppercase mb-2" style={{ color: t.accent }}>Gallery</p>
      <h2 className="text-3xl font-extrabold mb-6" style={{ fontFamily: t.font }}>A Visual Tour</h2>
      <div className={`flex-1 grid ${isP ? 'grid-cols-1 grid-rows-3' : 'grid-cols-3'} gap-4`}>
        {[images.gallery1, images.gallery2, images.gallery3].map((img, i) => (
          <div key={i} className="overflow-hidden" style={{ borderRadius: '8px' }}>
            <img src={img} alt="" className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    </div>
  );

  const Location = () => (
    <div className={`w-full h-full flex ${isP ? 'flex-col' : ''}`} style={{ background: t.bg, color: t.fg }}>
      <div className={`${isP ? 'h-1/2' : 'w-1/2 h-full'} flex items-center justify-center`} style={{ background: t.muted }}>
        <div className="text-center opacity-30">
          <MapPin size={64} style={{ color: t.accent }} className="mx-auto mb-3" />
          <p className="text-sm">Interactive Map</p>
        </div>
      </div>
      <div className={`${isP ? 'flex-1 p-8' : 'w-1/2 h-full flex flex-col justify-center px-14'}`}>
        <p className="text-xs font-semibold tracking-[0.3em] uppercase mb-4" style={{ color: t.accent }}>Location</p>
        <h2 className="text-3xl font-extrabold mb-6" style={{ fontFamily: t.font }}>{data.location}</h2>
        <div className="space-y-4">
          {['5 min to Beach', '10 min to Airport', 'Walking to Downtown', 'Near Top Schools'].map(item => (
            <div key={item} className="flex items-center gap-3 pb-3" style={{ borderBottom: `1px solid ${t.border}` }}>
              <Navigation size={14} style={{ color: t.accent }} />
              <p className="text-sm">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const Contact = () => (
    <div className={`w-full h-full flex ${isP ? 'flex-col' : ''}`} style={{ background: t.bg, color: t.fg }}>
      <div className={`${isP ? 'flex-1 p-8' : 'w-3/5 h-full flex flex-col justify-center px-14'}`}>
        <p className="text-xs font-semibold tracking-[0.3em] uppercase mb-4" style={{ color: t.accent }}>Your Advisor</p>
        <h2 className="text-5xl font-extrabold mb-2" style={{ fontFamily: t.font }}>{data.brokerName}</h2>
        <p className="text-lg opacity-50 mb-10">{data.brokerTitle}</p>
        <div className="space-y-5">
          {[
            { icon: Award, text: data.brokerAgency },
            { icon: Phone, text: data.brokerPhone },
            { icon: Mail, text: data.brokerEmail },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-4">
              <Icon size={20} style={{ color: t.accent }} />
              <span className="text-base">{text}</span>
            </div>
          ))}
        </div>
        <div className="mt-10 inline-flex items-center gap-2 px-4 py-2 text-xs tracking-widest uppercase opacity-40" style={{ border: `1px solid ${t.border}`, borderRadius: '8px' }}>{data.brokerRera}</div>
      </div>
      {!isP && (
        <div className="w-2/5 h-full flex flex-col items-center justify-center gap-8">
          <div className="w-52 h-52 overflow-hidden" style={{ borderRadius: '8px', border: `3px solid ${t.accent}` }}>
            <img src={images.broker} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="w-32 h-32 flex items-center justify-center" style={{ background: t.muted, borderRadius: '8px' }}>
            <QrCode size={64} style={{ color: t.fg, opacity: 0.2 }} />
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

export default SignatureTheme;
