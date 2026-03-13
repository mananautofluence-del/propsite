import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { MapPin, Check, Phone, MessageCircle, Share2, ArrowLeft, Building2, Calendar, Map, PlayCircle, Home } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function BrochureView() {
  const { id } = useParams();
  const [brochure, setBrochure] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchBrochure = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'brochures', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setBrochure({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching brochure:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrochure();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!brochure) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Brochure Not Found</h2>
        <p className="text-slate-500 mb-6">The project brochure you are looking for does not exist or has been removed.</p>
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
          title: brochure.projectName,
          text: `Check out this project: ${brochure.projectName} by ${brochure.developerName}`,
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

  const whatsappMessage = encodeURIComponent(`Hi ${brochure.brokerName}, I'm interested in the project: ${brochure.projectName}. Can we connect?`);
  
  const allImages = [brochure.heroImageUrl, ...(brochure.galleryImages || [])].filter(Boolean);

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
              <p className="text-indigo-600 font-semibold uppercase tracking-wider mb-2">
                By {brochure.developerName}
              </p>
              <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-3 tracking-tight">
                {brochure.projectName}
              </h1>
              {brochure.tagline && (
                <p className="text-xl text-slate-600 mb-4 font-medium">{brochure.tagline}</p>
              )}
              <div className="flex items-center text-slate-500">
                <MapPin className="w-5 h-5 mr-1" />
                <span>{brochure.locality}, {brochure.city}</span>
              </div>
            </div>

            {/* Image Gallery */}
            {allImages.length > 0 && (
              <div className="space-y-4">
                <div className="aspect-[21/9] w-full rounded-2xl overflow-hidden bg-slate-200 relative">
                  <img 
                    src={allImages[activeImage]} 
                    alt={brochure.projectName} 
                    className="w-full h-full object-cover"
                  />
                  {activeImage === 0 && (
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                      Hero Image
                    </div>
                  )}
                </div>
                {allImages.length > 1 && (
                  <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
                    {allImages.map((img: string, idx: number) => (
                      <button 
                        key={idx}
                        onClick={() => setActiveImage(idx)}
                        className={`relative flex-shrink-0 w-32 h-20 rounded-xl overflow-hidden snap-start transition-all ${activeImage === idx ? 'ring-2 ring-indigo-600 ring-offset-2' : 'opacity-70 hover:opacity-100'}`}
                      >
                        <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quick Project Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {brochure.configurations && (
                <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-center">
                  <Home className="w-6 h-6 text-indigo-500 mb-2" />
                  <span className="text-sm font-semibold text-slate-900">{brochure.configurations}</span>
                  <span className="text-xs text-slate-500 uppercase tracking-wider">Configs</span>
                </div>
              )}
              {brochure.landParcel && (
                <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-center">
                  <Map className="w-6 h-6 text-indigo-500 mb-2" />
                  <span className="text-sm font-semibold text-slate-900">{brochure.landParcel}</span>
                  <span className="text-xs text-slate-500 uppercase tracking-wider">Land Area</span>
                </div>
              )}
              {brochure.towerCount && (
                <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-center">
                  <Building2 className="w-6 h-6 text-indigo-500 mb-2" />
                  <span className="text-sm font-semibold text-slate-900">{brochure.towerCount}</span>
                  <span className="text-xs text-slate-500 uppercase tracking-wider">Towers</span>
                </div>
              )}
              {brochure.possessionDate && (
                <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-center">
                  <Calendar className="w-6 h-6 text-indigo-500 mb-2" />
                  <span className="text-sm font-semibold text-slate-900">{brochure.possessionDate}</span>
                  <span className="text-xs text-slate-500 uppercase tracking-wider">Possession</span>
                </div>
              )}
            </div>

            {/* Amenities */}
            {brochure.amenities && brochure.amenities.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6">World-Class Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {brochure.amenities.map((amenity: string, idx: number) => (
                    <div key={idx} className="flex items-center p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100">
                      <Check className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="text-sm font-medium">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Floor Plans */}
            {brochure.floorPlans && brochure.floorPlans.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Floor Plans</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {brochure.floorPlans.map((plan: any, idx: number) => (
                    <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
                      <div className="aspect-[4/3] bg-slate-100 p-4">
                        <img src={plan.url} alt={plan.label} className="w-full h-full object-contain" />
                      </div>
                      <div className="p-4 bg-white border-t border-slate-200 text-center font-medium text-slate-900">
                        {plan.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Video Tour */}
            {brochure.videoUrl && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 text-center">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Video Tour</h2>
                <a href={brochure.videoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-6 py-3 bg-indigo-50 text-indigo-700 rounded-xl font-medium hover:bg-indigo-100 transition-colors">
                  <PlayCircle className="w-5 h-5 mr-2" /> Watch Project Video
                </a>
              </div>
            )}

            {/* Location Advantages */}
            {brochure.locationAdvantages && brochure.locationAdvantages.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Location Advantages</h2>
                <div className="space-y-4">
                  {brochure.locationAdvantages.map((adv: string, idx: number) => (
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
                <p className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-1">Starting Price</p>
                <p className="text-3xl font-bold text-slate-900">{brochure.startingPrice || 'On Request'}</p>
              </div>

              <div className="border-t border-slate-200 pt-6 mb-6">
                <p className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-4">Contact Broker</p>
                <div className="flex items-center mb-6">
                  {brochure.brokerPhotoUrl ? (
                    <img src={brochure.brokerPhotoUrl} alt={brochure.brokerName} className="w-16 h-16 rounded-full object-cover mr-4 border border-slate-200" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl mr-4">
                      {brochure.brokerName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{brochure.brokerName}</h3>
                    {brochure.brokerCompany && <p className="text-slate-500 text-sm">{brochure.brokerCompany}</p>}
                  </div>
                </div>

                <div className="space-y-3">
                  <a href={`tel:${brochure.brokerPhone}`} className="w-full">
                    <Button className="w-full h-14 text-base">
                      <Phone className="w-5 h-5 mr-2" /> Call Now
                    </Button>
                  </a>
                  {brochure.brokerWhatsapp && (
                    <a 
                      href={`https://wa.me/${brochure.brokerPhone.replace(/[^0-9]/g, '')}?text=${whatsappMessage}`} 
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
