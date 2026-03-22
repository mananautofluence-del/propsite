import React from 'react';
import { SafeImage } from '../pages/PublicListing';

interface WhatsAppStoryTemplateProps {
  listing: any;
  photos: any[];
  broker: {
    name: string;
    agency: string;
    avatar_url: string;
    rera_number: string;
  };
  templateRef: React.RefObject<HTMLDivElement>;
}

export const WhatsAppStoryTemplate: React.FC<WhatsAppStoryTemplateProps> = ({ 
  listing, 
  photos, 
  broker,
  templateRef 
}) => {
  const topPhotos = photos.slice(0, 3);
  
  return (
    <div 
      ref={templateRef}
      style={{ width: '1080px', height: '1920px' }}
      className="fixed -left-[4000px] top-0 bg-white flex flex-col font-sans overflow-hidden"
    >
      {/* Top Section: Photo Grid (60% height) */}
      <div className="h-[60%] w-full p-8 grid grid-rows-[70%_30%] gap-4">
        {/* Main Hero */}
        <div className="rounded-[40px] overflow-hidden shadow-lg border-4 border-white">
          <img 
            src={topPhotos[0]?.url} 
            className="w-full h-full object-cover" 
            alt="Hero"
          />
        </div>
        
        {/* Sub Photos */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-[32px] overflow-hidden shadow-md border-4 border-white">
            <img 
              src={topPhotos[1]?.url || topPhotos[0]?.url} 
              className="w-full h-full object-cover" 
              alt="Photo 2"
            />
          </div>
          <div className="rounded-[32px] overflow-hidden shadow-md border-4 border-white">
            <img 
              src={topPhotos[2]?.url || topPhotos[0]?.url} 
              className="w-full h-full object-cover" 
              alt="Photo 3"
            />
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 px-12 pt-4 relative">
        {/* Price Pill Overlap */}
        <div className="absolute -top-12 left-12 flex items-center gap-4">
           <div className="bg-[#1A5C3A] text-white px-10 py-5 rounded-full text-5xl font-bold shadow-xl">
             {listing.price > 0 
               ? (listing.price >= 10000000 ? `₹${(listing.price/10000000).toFixed(2)} Cr` : `₹${(listing.price/100000).toFixed(2)} L`)
               : listing.monthly_rent > 0 ? `₹${listing.monthly_rent.toLocaleString()}/mo` : 'Price on Request'}
           </div>
           {listing.price_negotiable && (
             <div className="bg-[#EAF3ED] text-[#1A5C3A] px-8 py-4 rounded-full text-3xl font-semibold border-2 border-[#1A5C3A]/20">
               Negotiable
             </div>
           )}
        </div>

        {/* Headline */}
        <h1 className="text-7xl font-bold text-[#111111] mt-16 leading-tight tracking-tight mb-8">
          {listing.headline}
        </h1>

        {/* Spec Chips */}
        <div className="flex flex-wrap gap-4 mb-12">
          {[
            listing.bhk_config,
            listing.carpet_area ? `${listing.carpet_area} sq ft` : null,
            listing.locality,
            listing.furnishing_status
          ].filter(Boolean).map((spec, i) => (
            <span key={i} className="bg-[#F5F5F5] text-[#333333] text-4xl font-semibold px-10 py-5 rounded-full border-2 border-[#EFEFEF]">
              {spec}
            </span>
          ))}
        </div>

        {/* Broker Card Footer */}
        <div className="mt-12 bg-white border-[6px] border-[#F5F5F5] rounded-[60px] p-12 flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-10">
            {broker.avatar_url ? (
              <img src={broker.avatar_url} className="w-32 h-32 rounded-full object-cover border-4 border-[#1A5C3A]/10" alt="Broker" />
            ) : (
              <div className="w-32 h-32 rounded-full bg-[#EAF3ED] flex items-center justify-center text-[#1A5C3A] text-5xl font-bold">
                {broker.name[0]}
              </div>
            )}
            <div>
              <div className="text-5xl font-bold text-[#111111] mb-2">{broker.name}</div>
              <div className="text-3xl font-semibold text-[#888888]">{broker.agency}</div>
              {broker.rera_number && (
                <div className="mt-3 text-2xl font-bold text-[#1A5C3A] bg-[#EAF3ED] px-4 py-2 rounded-full inline-block">
                  RERA: {broker.rera_number}
                </div>
              )}
            </div>
          </div>
          <div className="bg-[#1A5C3A] text-white px-10 py-6 rounded-3xl text-3xl font-bold text-center">
            REPLY TO STORY<br/><span className="text-2xl opacity-80 underline">BOOK A VISIT</span>
          </div>
        </div>
      </div>
    </div>
  );
};
