import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Building, FileText, Plus, MapPin, Calendar, ArrowRight, Trash2 } from 'lucide-react';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [listings, setListings] = useState<any[]>([]);
  const [brochures, setBrochures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'listings' | 'brochures'>('listings');

  const fetchData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch Listings
      const listingsQuery = query(
        collection(db, 'listings'),
        where('ownerId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const listingsSnapshot = await getDocs(listingsQuery);
      const listingsData = listingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setListings(listingsData);

      // Fetch Brochures
      const brochuresQuery = query(
        collection(db, 'brochures'),
        where('ownerId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const brochuresSnapshot = await getDocs(brochuresQuery);
      const brochuresData = brochuresSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBrochures(brochuresData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchData();
    }
  }, [user, authLoading]);

  const handleDeleteListing = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await deleteDoc(doc(db, 'listings', id));
        setListings(listings.filter(listing => listing.id !== id));
      } catch (error) {
        console.error('Error deleting listing:', error);
        alert('Failed to delete listing.');
      }
    }
  };

  const handleDeleteBrochure = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this brochure?')) {
      try {
        await deleteDoc(doc(db, 'brochures', id));
        setBrochures(brochures.filter(brochure => brochure.id !== id));
      } catch (error) {
        console.error('Error deleting brochure:', error);
        alert('Failed to delete brochure.');
      }
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Sign In Required</h2>
        <p className="text-slate-500 mb-6 text-center max-w-md">Please sign in to view your dashboard and manage your property listings and brochures.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500 mt-1">Manage your property listings and project brochures.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/create-listing">
              <Button variant="outline" className="bg-white">
                <Plus className="w-4 h-4 mr-2" /> New Listing
              </Button>
            </Link>
            <Link to="/create-brochure">
              <Button>
                <Plus className="w-4 h-4 mr-2" /> New Brochure
              </Button>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-slate-200/50 p-1 rounded-xl w-full max-w-md mb-8">
          <button
            onClick={() => setActiveTab('listings')}
            className={`flex-1 flex items-center justify-center py-2.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'listings' 
                ? 'bg-white text-indigo-700 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Building className="w-4 h-4 mr-2" />
            Listings ({listings.length})
          </button>
          <button
            onClick={() => setActiveTab('brochures')}
            className={`flex-1 flex items-center justify-center py-2.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'brochures' 
                ? 'bg-white text-indigo-700 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <FileText className="w-4 h-4 mr-2" />
            Brochures ({brochures.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === 'listings' ? (
          listings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <div key={listing.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col relative group">
                  <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleDeleteListing(listing.id)}
                      className="bg-white/90 backdrop-blur-sm p-2 rounded-full text-red-600 hover:bg-red-50 hover:text-red-700 shadow-sm"
                      title="Delete Listing"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="aspect-[4/3] bg-slate-100 relative">
                    {listing.heroImageUrl ? (
                      <img src={listing.heroImageUrl} alt={listing.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Building className="w-12 h-12" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-semibold text-slate-700">
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
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 border-dashed">
              <Building className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No listings yet</h3>
              <p className="text-slate-500 mb-6 max-w-sm mx-auto">You haven't created any property listings yet. Create your first listing to get started.</p>
              <Link to="/create-listing">
                <Button>Create Listing</Button>
              </Link>
            </div>
          )
        ) : (
          brochures.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {brochures.map((brochure) => (
                <div key={brochure.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col relative group">
                  <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleDeleteBrochure(brochure.id)}
                      className="bg-white/90 backdrop-blur-sm p-2 rounded-full text-red-600 hover:bg-red-50 hover:text-red-700 shadow-sm"
                      title="Delete Brochure"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="aspect-[4/3] bg-slate-100 relative">
                    {brochure.heroImageUrl ? (
                      <img src={brochure.heroImageUrl} alt={brochure.projectName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <FileText className="w-12 h-12" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-indigo-600 text-white px-2.5 py-1 rounded-full text-xs font-semibold">
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
                      <Link to={`/brochure/${brochure.id}`} className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center">
                        View <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 border-dashed">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No brochures yet</h3>
              <p className="text-slate-500 mb-6 max-w-sm mx-auto">You haven't created any project brochures yet. Create your first brochure to showcase a project.</p>
              <Link to="/create-brochure">
                <Button>Create Brochure</Button>
              </Link>
            </div>
          )
        )}

      </div>
    </div>
  );
}
