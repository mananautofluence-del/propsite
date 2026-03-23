import React from 'react';

export const WhatsAppStoryTemplate = ({ listing, photos, broker, templateRef }: any) => {
  // STRICT NULL CHECK: Prevents White Screen of Death
  if (!listing || !broker || !photos || photos.length === 0) {
    return <div ref={templateRef} className="absolute -left-[9999px] opacity-0 pointer-events-none" />;
  }

  const topPhotos = photos.slice(0, 3);
  const priceLabel = listing.price > 0 
    ? (listing.price >= 10000000 ? `₹${(listing.price / 10000000).toFixed(2)} Cr` : `₹${listing.price.toLocaleString('en-IN')}`)
    : 'Price on Request';

  return (
    <div 
      ref={templateRef} 
      className="absolute -left-[9999px] top-0 bg-white w-[1080px] h-[1920px] flex flex-col pointer-events-none"
      style={{ zIndex: -9999 }}
    >
      {/* Photos (Top 60%) */}
      <div className="h-[60%] w-full flex flex-col gap-4 p-8 bg-[#FAFAFA]">
        <div className="w-full h-[70%] rounded-3xl overflow-hidden shadow-lg">
          <img src={topPhotos[0]?.url} className="w-full h-full object-cover" alt="Hero" crossOrigin="anonymous" />
        </div>
        <div className="w-full h-[30%] flex gap-4">
          {topPhotos[1] && (
            <div className="w-1/2 h-full rounded-3xl overflow-hidden shadow-md">
              <img src={topPhotos[1].url} className="w-full h-full object-cover" crossOrigin="anonymous" />
            </div>
          )}
          {topPhotos[2] && (
            <div className="w-1/2 h-full rounded-3xl overflow-hidden shadow-md">
              <img src={topPhotos[2].url} className="w-full h-full object-cover" crossOrigin="anonymous" />
            </div>
          )}
        </div>
      </div>

      {/* Details (Middle 25%) */}
      <div className="h-[25%] px-12 py-8 flex flex-col justify-center">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-[52px] font-bold text-[#1A5C3A] font-sans">{priceLabel}</span>
          {listing.price_negotiable && (
            <span className="bg-[#EAF3ED] text-[#1A5C3A] text-[28px] font-semibold px-6 py-2 rounded-full">Negotiable</span>
          )}
        </div>
        <h1 className="text-[64px] font-bold text-[#111111] leading-tight mb-6" style={{ fontFamily: '"Playfair Display", serif' }}>
          {listing.headline}
        </h1>
        <div className="flex flex-wrap gap-4">
          {[listing.bhk_config, listing.locality, listing.carpet_area ? `${listing.carpet_area} sq ft` : null]
            .filter(Boolean)
            .map((chip, i) => (
              <span key={i} className="bg-[#F5F5F5] text-[#333333] text-[32px] px-8 py-3 rounded-2xl font-medium">
                {chip}
              </span>
          ))}
        </div>
      </div>

      {/* Broker Footer (Bottom 15%) */}
      <div className="h-[15%] bg-[#1A5C3A] w-full px-12 flex items-center justify-between mt-auto">
        <div className="flex items-center gap-6">
          {broker.avatar_url ? (
            <img src={broker.avatar_url} className="w-[140px] h-[140px] rounded-full object-cover border-4 border-white" crossOrigin="anonymous" />
          ) : (
            <div className="w-[140px] h-[140px] rounded-full bg-white flex items-center justify-center text-[#1A5C3A] text-[64px] font-bold">
              {broker.name?.[0] || 'B'}
            </div>
          )}
          <div className="text-white">
            <div className="text-[48px] font-bold mb-1">{broker.name}</div>
            <div className="text-[28px] text-white/80">{broker.agency || 'Real Estate Broker'}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="bg-white text-[#1A5C3A] text-[36px] font-bold px-10 py-5 rounded-3xl shadow-xl">
            Reply to Book Visit ➔
          </div>
        </div>
      </div>
    </div>
  );
};
