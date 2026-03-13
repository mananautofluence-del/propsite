import { Link } from 'react-router-dom';
import { Home as HomeIcon, Building, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
      <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
          Create Beautiful <br className="hidden sm:block" />
          <span className="text-indigo-600">Property Pages</span> in Seconds
        </h1>
        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
          Turn messy property messages into clean, shareable pages. Impress buyers and close deals faster.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
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
          className="group relative bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:shadow-md hover:emerald-200 transition-all duration-300 flex flex-col items-start text-left overflow-hidden"
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
    </div>
  );
}
