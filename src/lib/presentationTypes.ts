export type PresentationTheme = 
  'penthouse' | 'signature' | 'estate' | 
  'corporate' | 'highstreet' | 'logistics';

export type PresentationFormat = 'square' | 'landscape';

export type PageType = 
  'cover' | 'overview' | 'highlights' | 
  'gallery' | 'specs' | 'amenities' | 
  'location' | 'contact';

export interface PresentationContent {
  // Core property
  headline: string;        // Bold 4-6 word title
  subheadline: string;     // Property type + key feature  
  tagline: string;         // One aspirational sentence
  description: string;     // 60 word premium description
  
  // Pricing
  price: string;           // Formatted: ₹X.X Cr or ₹XX L
  priceNote: string;       // "Negotiable" or "" 
  
  // Location
  locality: string;
  city: string;
  locationDisplay: string; // "Bandra West, Mumbai"
  
  // Specs
  propertyType: string;
  bhkConfig: string;       // "3 BHK" or ""
  carpetArea: string;      // "2,400 sq ft" or ""
  builtupArea: string;
  floorNumber: string;     // "14th Floor" or ""
  totalFloors: string;
  parking: string;         // "2 Covered" or ""
  furnishing: string;      // "Fully Furnished" or ""
  possession: string;      // "Ready Possession" or ""
  facing: string;          // "Sea Facing" or ""
  age: string;             // "New Construction" or ""
  bathrooms: string;
  
  // Highlights (5 key selling points)
  highlights: string[];    // exactly 5 strings
  
  // Amenities (up to 8)
  amenities: string[];
  
  // Nearby locations
  nearby: string[];        // ["Metro 5 min", "Airport 25 min"]
  
  // Broker
  brokerName: string;
  brokerPhone: string;
  brokerAgency: string;
  brokerRera: string;
  
  // AI metadata
  suggestedTheme: PresentationTheme;
  designRationale: string; // Why AI picked this theme
}

export interface PresentationPhoto {
  url: string;
  tag: 'cover' | 'living' | 'bedroom' | 'kitchen' | 
       'bathroom' | 'balcony' | 'exterior' | 
       'amenity' | 'floorplan' | 'other';
  orderIndex: number;
}

export interface Presentation {
  id: string;
  user_id: string;
  title: string;
  theme: PresentationTheme;
  format: PresentationFormat;
  content: PresentationContent;
  photo_urls: string[];
  photo_tags: string[];
  pages: PageType[];
  created_at: string;
  listing_id?: string | null;
  status?: string;
  pdf_url?: string;
}
