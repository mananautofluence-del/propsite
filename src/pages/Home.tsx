import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Home as HomeIcon, Building, ArrowRight, MapPin, Calendar, FileText } from 'lucide-react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export default function Home() {
  const [recentListings, setRecentListings] = useState<any[]>([]);
  const [recentBrochures, setRecentBrochures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentData = async () => {
      setLoading(true);
      try {
        // Fetch recent listings
        const listingsQuery = query(
          collection(db, 'listings'),
          orderBy('createdAt', 'desc'),
          limit(3)
        );
        const listingsSnapshot = await getDocs(listingsQuery);
        setRecentListings(listingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Fetch recent brochures
        const brochuresQuery = query(
          collection(db, 'brochures'),
          orderBy('createdAt', 'desc'),
          limit(3)
        );
        const brochuresSnapshot = await getDocs(brochuresQuery);
        setRecentBrochures(brochuresSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Error fetching recent data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentData();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
          Create Beautiful <br className="hidden sm:block" />
          <span className="text-indigo-600">Property Pages</span> in Seconds
        </h1>
        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
          Turn messy property messages into clean, shareable pages. Impress buyers and close deals faster.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl mb-24">
        {/* Create Listing Card */}
        <Link 
          to="/create-listing"
          className="group relative bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:shadow-md hover:border-indigo-200 transition-all duration-300 flex flex-col items-start text-left overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110" />
          
          <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
            <HomeIcon className="w-7 h-7" />
          </div>
          
          <h3 className="text-2xl font-bold text-slate-900 mb-3">Create Listing</h3>
          <p className="text-slate-600 mb-8 flex-grow">
            Perfect for individual apartments, villas, and resale properties.
          </p>
          
          <ul className="space-y-2 mb-8 text-sm text-slate-500 w-full">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" /> Image gallery
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" /> Property details
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" /> Location advantages
            </li>
          </ul>
          
          <div className="mt-auto flex items-center text-indigo-600 font-medium group-hover:gap-2 transition-all">
            Start Listing <ArrowRight className="w-5 h-5 ml-1" />
          </div>
        </Link>

        {/* Create Brochure Card */}
        <Link 
          to="/create-brochure"
          className="group relative bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:shadow-md hover:border-emerald-200 transition-all duration-300 flex flex-col items-start text-left overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110" />
          
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
            <Building className="w-7 h-7" />
          </div>
          
          <h3 className="text-2xl font-bold text-slate-900 mb-3">Create Project Brochure</h3>
          <p className="text-slate-600 mb-8 flex-grow">
            Ideal for new residential developments and large projects.
          </p>
          
          <ul className="space-y-2 mb-8 text-sm text-slate-500 w-full">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Floor plans
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Amenities grid
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Project overview
            </li>
          </ul>
          
          <div className="mt-auto flex items-center text-emerald-600 font-medium group-hover:gap-2 transition-all">
            Start Brochure <ArrowRight className="w-5 h-5 ml-1" />
          </div>
        </Link>
      </div>

      {/* Recent Activity Section */}
      {!loading && (recentListings.length > 0 || recentBrochures.length > 0) && (
        <div className="w-full">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Recently Added Properties</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Explore the latest listings and project brochures created on PropSite.</p>
          </div>

          {recentListings.length > 0 && (
            <div className="mb-16">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-900 flex items-center">
                  <HomeIcon className="w-6 h-6 mr-2 text-indigo-600" /> Latest Listings
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentListings.map((listing) => (
                  <div key={listing.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                    <div className="aspect-[4/3] bg-slate-100 relative">
                      {listing.heroImageUrl ? (
                        <img src={listing.heroImageUrl} alt={listing.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <Building className="w-12 h-12" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-semibold text-slate-700">
                        {listing.propertyType}
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-grow">
                      <h3 className="font-bold text-lg text-slate-900 mb-1 line-clamp-1">{listing.title}</h3>
                      <p className="text-indigo-600 font-semibold mb-3">{listing.price}</p>
                      <div className="flex items-center text-slate-500 text-sm mb-4">
                        <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span className="line-clamp-1">{listing.locality}, {listing.city}</span>
                      </div>
                      <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center text-slate-400 text-xs">
                          <Calendar className="w-3 h-3 mr-1" />
                          {listing.createdAt?.toDate ? new Date(listing.createdAt.toDate()).toLocaleDateString() : 'Recently'}
                        </div>
                        <Link to={`/listing/${listing.id}`} className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center">
                          View <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {recentBrochures.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-900 flex items-center">
                  <FileText className="w-6 h-6 mr-2 text-emerald-600" /> Latest Brochures
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentBrochures.map((brochure) => (
                  <div key={brochure.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                    <div className="aspect-[4/3] bg-slate-100 relative">
                      {brochure.heroImageUrl ? (
                        <img src={brochure.heroImageUrl} alt={brochure.projectName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <FileText className="w-12 h-12" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3 bg-emerald-600 text-white px-2.5 py-1 rounded-full text-xs font-semibold">
                        Brochure
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-grow">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">{brochure.developerName}</p>
                      <h3 className="font-bold text-lg text-slate-900 mb-3 line-clamp-1">{brochure.projectName}</h3>
                      <div className="flex items-center text-slate-500 text-sm mb-4">
                        <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span className="line-clamp-1">{brochure.locality}, {brochure.city}</span>
                      </div>
                      <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center text-slate-400 text-xs">
                          <Calendar className="w-3 h-3 mr-1" />
                          {brochure.createdAt?.toDate ? new Date(brochure.createdAt.toDate()).toLocaleDateString() : 'Recently'}
                        </div>
                        <Link to={`/brochure/${brochure.id}`} className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center">
                          View <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
