import { Phone, Mail, Award, QrCode, Trees, Mountain, Fence, Droplets, Sun, Flower2, MapPin, Navigation } from 'lucide-react';
import type { PresentationData, SlideType, AspectRatio } from '@/lib/presentationState';
import type { ThemeImages } from '@/lib/themeImages';

interface Props { data: PresentationData; slideType: SlideType; aspect: AspectRatio; images: ThemeImages; }

const e = {
  bg: '#F5F0E8', fg: '#3D3425', accent: '#6B8F71', muted: '#EBE4D8', border: '#D4CABC',
  headFont: "'Inter', system-ui, sans-serif",
  bodyFont: "'Inter', system-ui, sans-serif",
};

const EstateTheme = ({ data, slideType, aspect, images }: Props) => {
  const isP = aspect === 'portrait';

  const Cover = () => (
    <div className="relative w-full h-full" style={{ background: e.bg }}>
      <img src={images.hero} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#3D3425]/90 via-[#3D3425]/30 to-transparent" />
      <div className="absolute top-8 right-8 px-6 py-3 text-xs font-semibold tracking-[0.3em] uppercase" style={{ background: e.accent, color: '#fff', borderRadius: '999px', fontFamily: e.bodyFont }}>Premium Plot</div>
      <div className="absolute bottom-0 left-0 right-0 p-12">
        <p className="text-sm tracking-widest uppercase mb-3" style={{ color: e.accent, fontFamily: e.bodyFont }}>{data.location}</p>
        <h1 className={`${isP ? 'text-4xl' : 'text-6xl'} leading-tight mb-3`} style={{ fontFamily: e.headFont, fontWeight: 600, color: '#fff' }}>{data.title}</h1>
        <p className="text-xl opacity-70 mb-4" style={{ fontFamily: e.bodyFont, color: '#fff' }}>{data.subtitle}</p>
        <p className="text-3xl font-semibold" style={{ color: e.accent, fontFamily: e.headFont }}>{data.price}</p>
      </div>
    </div>
  );

  const Overview = () => (
    <div className={`w-full h-full flex ${isP ? 'flex-col' : ''}`} style={{ background: e.bg, color: e.fg }}>
      <div className={`${isP ? 'flex-1 p-8' : 'w-1/2 h-full flex flex-col justify-center px-14'}`}>
        <p className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: e.accent }}>About This Property</p>
        <h2 className="text-4xl mb-6" style={{ fontFamily: e.headFont, fontWeight: 600 }}>{data.title}</h2>
        <p className="text-sm leading-relaxed opacity-60 mb-8" style={{ fontFamily: e.bodyFont }}>{data.description}</p>
        <div className="flex gap-6">
          {[
            { label: 'Area', value: data.area },
            { label: 'Lot', value: data.lotSize },
            { label: 'Type', value: data.propertyType },
          ].map(item => (
            <div key={item.label} className="text-center p-4" style={{ background: e.muted, borderRadius: '16px' }}>
              <p className="text-xl font-semibold" style={{ color: e.accent }}>{item.value}</p>
              <p className="text-[10px] uppercase tracking-widest opacity-40 mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
      <div className={`${isP ? 'h-2/5' : 'w-1/2 h-full'} p-6`}>
        <div className="w-full h-full overflow-hidden" style={{ borderRadius: '16px' }}>
          <img src={images.bedroom} alt="" className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  );

  const Features = () => (
    <div className="w-full h-full p-14 flex flex-col justify-center" style={{ background: e.bg, color: e.fg }}>
      <p className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: e.accent }}>Highlights</p>
      <h2 className="text-4xl mb-10" style={{ fontFamily: e.headFont, fontWeight: 600 }}>Natural Advantages</h2>
      <div className={`grid ${isP ? 'grid-cols-1' : 'grid-cols-2'} gap-5`}>
        {data.features.map((feat, i) => (
          <div key={i} className="flex items-center gap-4 p-5" style={{ background: e.muted, borderRadius: '16px' }}>
            <div className="w-10 h-10 flex items-center justify-center shrink-0" style={{ background: e.accent, borderRadius: '12px' }}>
              <Trees size={18} color="#fff" />
            </div>
            <p className="text-base" style={{ fontFamily: e.bodyFont }}>{feat}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const Specs = () => (
    <div className="w-full h-full p-14 flex flex-col justify-center" style={{ background: e.bg, color: e.fg }}>
      <p className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: e.accent }}>Land Details</p>
      <h2 className="text-4xl mb-10" style={{ fontFamily: e.headFont, fontWeight: 600 }}>Plot Specifications</h2>
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Total Area', value: data.area },
          { label: 'Lot Size', value: data.lotSize },
          { label: 'Year', value: data.yearBuilt },
          { label: 'Parking', value: data.parking },
          { label: 'Bedrooms', value: data.bedrooms },
          { label: 'Bathrooms', value: data.bathrooms },
        ].map(spec => (
          <div key={spec.label} className="p-5" style={{ background: e.muted, borderRadius: '16px' }}>
            <p className="text-[10px] uppercase tracking-widest opacity-40 mb-1">{spec.label}</p>
            <p className="text-xl font-semibold" style={{ color: e.accent }}>{spec.value}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const Amenities = () => {
    const amenities = [
      { icon: Trees, label: 'Landscaped Gardens' },
      { icon: Mountain, label: 'Mountain View' },
      { icon: Fence, label: 'Gated Access' },
      { icon: Droplets, label: 'Water Supply' },
      { icon: Sun, label: 'South Facing' },
      { icon: Flower2, label: 'Botanical Park' },
    ];
    return (
      <div className="w-full h-full p-14 flex flex-col justify-center" style={{ background: e.bg, color: e.fg }}>
        <p className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: e.accent }}>Surroundings</p>
        <h2 className="text-3xl mb-10" style={{ fontFamily: e.headFont, fontWeight: 600 }}>Natural Amenities</h2>
        <div className="grid grid-cols-3 gap-5">
          {amenities.map(({ icon: Icon, label }) => (
            <div key={label} className="text-center p-6" style={{ background: e.muted, borderRadius: '16px' }}>
              <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3" style={{ background: e.accent, borderRadius: '12px' }}>
                <Icon size={24} color="#fff" />
              </div>
              <p className="text-sm font-medium">{label}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const Gallery = () => (
    <div className="w-full h-full p-8 flex flex-col" style={{ background: e.bg, color: e.fg }}>
      <p className="text-xs tracking-[0.3em] uppercase mb-2" style={{ color: e.accent }}>Gallery</p>
      <h2 className="text-3xl mb-6" style={{ fontFamily: e.headFont, fontWeight: 600 }}>Scenic Views</h2>
      <div className={`flex-1 grid ${isP ? 'grid-cols-1 grid-rows-3' : 'grid-cols-2 grid-rows-2'} gap-4`}>
        {[images.gallery1, images.gallery2, images.gallery3, images.gallery4].slice(0, isP ? 3 : 4).map((img, i) => (
          <div key={i} className={`overflow-hidden ${i === 0 && !isP ? 'col-span-2' : ''}`} style={{ borderRadius: '16px' }}>
            <img src={img} alt="" className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    </div>
  );

  const Location = () => (
    <div className={`w-full h-full flex ${isP ? 'flex-col' : ''}`} style={{ background: e.bg, color: e.fg }}>
      <div className={`${isP ? 'h-1/2' : 'w-1/2 h-full'} p-6`}>
        <div className="w-full h-full flex items-center justify-center" style={{ background: e.muted, borderRadius: '16px' }}>
          <div className="text-center opacity-30">
            <MapPin size={64} style={{ color: e.accent }} className="mx-auto mb-3" />
            <p className="text-sm">Aerial View</p>
          </div>
        </div>
      </div>
      <div className={`${isP ? 'flex-1 p-8' : 'w-1/2 h-full flex flex-col justify-center px-14'}`}>
        <p className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: e.accent }}>Location</p>
        <h2 className="text-3xl mb-6" style={{ fontFamily: e.headFont, fontWeight: 600 }}>{data.location}</h2>
        <div className="space-y-3">
          {['Lake: 500m walk', 'Town Center: 10 min', 'Airport: 45 min', 'Nature Reserve: Adjacent'].map(item => (
            <div key={item} className="flex items-center gap-3 p-3" style={{ background: e.muted, borderRadius: '12px' }}>
              <Navigation size={14} style={{ color: e.accent }} />
              <p className="text-sm">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const Contact = () => (
    <div className={`w-full h-full flex ${isP ? 'flex-col' : ''}`} style={{ background: e.bg, color: e.fg }}>
      <div className={`${isP ? 'flex-1 p-8' : 'w-3/5 h-full flex flex-col justify-center px-14'}`}>
        <p className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: e.accent }}>Your Advisor</p>
        <h2 className="text-5xl mb-2" style={{ fontFamily: e.headFont, fontWeight: 600 }}>{data.brokerName}</h2>
        <p className="text-lg opacity-50 mb-10">{data.brokerTitle}</p>
        <div className="space-y-4">
          {[
            { icon: Award, text: data.brokerAgency },
            { icon: Phone, text: data.brokerPhone },
            { icon: Mail, text: data.brokerEmail },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-4">
              <div className="w-8 h-8 flex items-center justify-center" style={{ background: e.accent, borderRadius: '10px' }}>
                <Icon size={16} color="#fff" />
              </div>
              <span className="text-base">{text}</span>
            </div>
          ))}
        </div>
        <p className="mt-8 text-xs opacity-30 tracking-widest uppercase">{data.brokerRera}</p>
      </div>
      {!isP && (
        <div className="w-2/5 h-full flex flex-col items-center justify-center gap-8 p-8">
          <div className="w-48 h-48 overflow-hidden" style={{ borderRadius: '16px' }}>
            <img src={images.broker} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="w-28 h-28 flex items-center justify-center" style={{ background: e.muted, borderRadius: '16px' }}>
            <QrCode size={56} style={{ color: e.fg, opacity: 0.2 }} />
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

export default EstateTheme;
