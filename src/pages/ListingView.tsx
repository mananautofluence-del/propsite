import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { MapPin, Bed, Bath, Car, Maximize, Home, Check, Phone, MessageCircle, Share2, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function ListingView() {
  const { id } = useParams();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'listings', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setListing({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching listing:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Listing Not Found</h2>
        <p className="text-slate-500 mb-6">The property you are looking for does not exist or has been removed.</p>
        <Link to="/">
          <Button>Return Home</Button>
        </Link>
      </div>
    );
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing.title,
          text: `Check out this property: ${listing.title} in ${listing.locality}, ${listing.city}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const whatsappMessage = encodeURIComponent(`Hi ${listing.brokerName}, I'm interested in your property listing: ${listing.title}. Can we connect?`);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Top Nav */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="font-medium">Back</span>
          </Link>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" /> Share
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Header */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold uppercase tracking-wider">
                  {listing.propertyType}
                </span>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold uppercase tracking-wider">
                  {listing.possessionStatus}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">{listing.title}</h1>
              <div className="flex items-center text-slate-500">
                <MapPin className="w-5 h-5 mr-1" />
                <span>{listing.locality}, {listing.city}</span>
              </div>
            </div>

            {/* Image Gallery */}
            {listing.images && listing.images.length > 0 && (
              <div className="space-y-4">
                <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-200">
                  <img 
                    src={listing.images[activeImage]} 
                    alt={listing.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                {listing.images.length > 1 && (
                  <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
                    {listing.images.map((img: string, idx: number) => (
                      <button 
                        key={idx}
                        onClick={() => setActiveImage(idx)}
                        className={`relative flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden snap-start transition-all ${activeImage === idx ? 'ring-2 ring-indigo-600 ring-offset-2' : 'opacity-70 hover:opacity-100'}`}
                      >
                        <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {listing.bedrooms && (
                <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-center">
                  <Bed className="w-6 h-6 text-indigo-500 mb-2" />
                  <span className="text-lg font-semibold text-slate-900">{listing.bedrooms}</span>
                  <span className="text-xs text-slate-500 uppercase tracking-wider">Beds</span>
                </div>
              )}
              {listing.bathrooms && (
                <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-center">
                  <Bath className="w-6 h-6 text-indigo-500 mb-2" />
                  <span className="text-lg font-semibold text-slate-900">{listing.bathrooms}</span>
                  <span className="text-xs text-slate-500 uppercase tracking-wider">Baths</span>
                </div>
              )}
              {listing.carpetArea && (
                <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-center">
                  <Maximize className="w-6 h-6 text-indigo-500 mb-2" />
                  <span className="text-lg font-semibold text-slate-900">{listing.carpetArea}</span>
                  <span className="text-xs text-slate-500 uppercase tracking-wider">Area</span>
                </div>
              )}
              {listing.parking && (
                <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-center">
                  <Car className="w-6 h-6 text-indigo-500 mb-2" />
                  <span className="text-lg font-semibold text-slate-900">{listing.parking}</span>
                  <span className="text-xs text-slate-500 uppercase tracking-wider">Parking</span>
                </div>
              )}
            </div>

            {/* Details Grid */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Property Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Configuration</span>
                  <span className="font-medium text-slate-900">{listing.configuration || '-'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Furnishing</span>
                  <span className="font-medium text-slate-900">{listing.furnishingStatus || '-'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Floor</span>
                  <span className="font-medium text-slate-900">{listing.floorNumber ? `${listing.floorNumber} of ${listing.totalFloors}` : '-'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Possession</span>
                  <span className="font-medium text-slate-900">{listing.possessionStatus || '-'}</span>
                </div>
              </div>
            </div>

            {/* Highlights */}
            {listing.highlights && listing.highlights.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Highlights</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {listing.highlights.map((highlight: string, idx: number) => (
                    <div key={idx} className="flex items-start">
                      <Check className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location Advantages */}
            {listing.locationAdvantages && listing.locationAdvantages.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Location Advantages</h2>
                <div className="space-y-4">
                  {listing.locationAdvantages.map((adv: string, idx: number) => (
                    <div key={idx} className="flex items-center p-4 bg-slate-50 rounded-xl">
                      <MapPin className="w-5 h-5 text-indigo-500 mr-3 flex-shrink-0" />
                      <span className="text-slate-700">{adv}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Sidebar / Contact Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="mb-6">
                <p className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-1">Asking Price</p>
                <p className="text-3xl font-bold text-slate-900">{listing.price}</p>
              </div>

              <div className="border-t border-slate-200 pt-6 mb-6">
                <p className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-4">Contact Broker</p>
                <div className="flex items-center mb-6">
                  {listing.brokerPhotoUrl ? (
                    <img src={listing.brokerPhotoUrl} alt={listing.brokerName} className="w-16 h-16 rounded-full object-cover mr-4 border border-slate-200" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl mr-4">
                      {listing.brokerName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{listing.brokerName}</h3>
                    {listing.brokerCompany && <p className="text-slate-500 text-sm">{listing.brokerCompany}</p>}
                  </div>
                </div>

                <div className="space-y-3">
                  <a href={`tel:${listing.brokerPhone}`} className="w-full">
                    <Button className="w-full h-14 text-base">
                      <Phone className="w-5 h-5 mr-2" /> Call Now
                    </Button>
                  </a>
                  {listing.brokerWhatsapp && (
                    <a 
                      href={`https://wa.me/${listing.brokerPhone.replace(/[^0-9]/g, '')}?text=${whatsappMessage}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full"
                    >
                      <Button variant="outline" className="w-full h-14 text-base border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800">
                        <MessageCircle className="w-5 h-5 mr-2" /> WhatsApp
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
