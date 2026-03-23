export interface PresentationData {
  title: string;
  subtitle: string;
  price: string;
  location: string;
  propertyType: string;
  area: string;
  bedrooms: string;
  bathrooms: string;
  yearBuilt: string;
  parking: string;
  lotSize: string;
  description: string;
  features: string[];
  brokerName: string;
  brokerTitle: string;
  brokerAgency: string;
  brokerPhone: string;
  brokerEmail: string;
  brokerRera: string;
}

export type ThemeKey = 'penthouse' | 'corporate' | 'highstreet' | 'logistics' | 'estate' | 'signature';

export type AspectRatio = 'landscape' | 'portrait';

export const SLIDE_TYPES = [
  'cover',
  'overview',
  'features',
  'gallery',
  'specs',
  'amenities',
  'location',
  'contact',
] as const;

export type SlideType = (typeof SLIDE_TYPES)[number];

export const SLIDE_LABELS: Record<SlideType, string> = {
  cover: 'Cover',
  overview: 'Overview',
  features: 'Key Features',
  gallery: 'Gallery',
  specs: 'Specs / Floorplan',
  amenities: 'Amenities',
  location: 'Location',
  contact: 'Contact / CTA',
};

export const defaultPresentation: PresentationData = {
  title: 'Villa Serenità',
  subtitle: 'A Mediterranean Masterpiece',
  price: '$8,750,000',
  location: "Côte d'Azur, France",
  propertyType: 'Luxury Residential Villa',
  area: '12,500 sq ft',
  bedrooms: '6',
  bathrooms: '7',
  yearBuilt: '2022',
  parking: '4-Car Garage',
  lotSize: '2.5 Acres',
  description:
    'Nestled along the sun-drenched coastline of the French Riviera, this extraordinary Mediterranean estate offers an unparalleled living experience. Spanning over 12,500 square feet across meticulously landscaped grounds, every detail has been crafted to perfection.',
  features: [
    'Italian Marble Throughout',
    'Private Infinity Pool',
    'Smart Home Automation',
    'Wine Cellar & Tasting Room',
  ],
  brokerName: 'Alexander Beaumont',
  brokerTitle: 'Senior Luxury Property Advisor',
  brokerAgency: 'PropSite International Realty',
  brokerPhone: '+33 6 12 34 56 78',
  brokerEmail: 'alexander@propsite.com',
  brokerRera: 'RERA/2024/FR-001847',
};

// Theme-specific mock data overrides
export const themeMockData: Record<ThemeKey, Partial<PresentationData>> = {
  penthouse: {
    title: 'The Obsidian Penthouse',
    subtitle: 'Crown Jewel of the Skyline',
    price: '$12,500,000',
    location: 'Manhattan, New York',
    propertyType: 'Ultra-Luxury Penthouse',
    area: '8,200 sq ft',
    bedrooms: '4',
    bathrooms: '5',
    yearBuilt: '2024',
    parking: 'Private Underground',
    lotSize: 'N/A',
    description:
      'Perched 67 floors above the glittering Manhattan skyline, this penthouse represents the absolute pinnacle of urban luxury. Floor-to-ceiling windows frame 360° panoramic views while bespoke finishes define every surface.',
    features: [
      'Italian Marble Throughout',
      'Private Infinity Pool',
      'Smart Home Automation',
      'Wine Cellar & Tasting Room',
    ],
  },
  corporate: {
    title: 'Meridian Business Tower',
    subtitle: 'Grade A+ Commercial Office',
    price: '$45,000/month',
    location: 'Financial District, Singapore',
    propertyType: 'Commercial Office Space',
    area: '25,000 sq ft',
    bedrooms: 'N/A',
    bathrooms: '8',
    yearBuilt: '2023',
    parking: '50 Dedicated Bays',
    lotSize: 'Full Floor Plate',
    description:
      'LEED Platinum-certified Grade A+ office space with 100% power backup, fiber optic connectivity, and a transit score of 98. Ideal for Fortune 500 headquarters.',
    features: [
      'LEED Platinum Certified',
      '100% Power Backup',
      'Transit Score: 98',
      'Floor Load: 150 PSF',
    ],
  },
  highstreet: {
    title: 'Boutique on Fifth',
    subtitle: 'Prime Retail Frontage',
    price: '$18,000/month',
    location: 'Fifth Avenue, New York',
    propertyType: 'Retail / Showroom',
    area: '4,500 sq ft',
    bedrooms: 'N/A',
    bathrooms: '2',
    yearBuilt: '2021',
    parking: 'Valet Available',
    lotSize: '60ft Frontage',
    description:
      'Corner-positioned retail space with 60ft of premium frontage on one of the world\'s most prestigious shopping boulevards. Average daily footfall exceeds 15,000.',
    features: [
      '60ft Premium Frontage',
      'Avg Footfall: 15,000/day',
      'Corner Visibility',
      'Double Height Ceiling',
    ],
  },
  logistics: {
    title: 'Apex Logistics Hub',
    subtitle: 'Industrial Grade Warehouse',
    price: '$2,800,000',
    location: 'Port of Rotterdam, Netherlands',
    propertyType: 'Industrial / Warehouse',
    area: '85,000 sq ft',
    bedrooms: 'N/A',
    bathrooms: '4',
    yearBuilt: '2023',
    parking: 'Truck Yard',
    lotSize: '5 Acres',
    description:
      'State-of-the-art logistics facility with 12 docking bays, 12m eaves height, and 5 tons/sqm floor load capacity. Direct highway access and rail siding available.',
    features: [
      'Floor Load: 5 Tons/Sqm',
      '12 Docking Bays',
      'Eaves Height: 12m',
      'Rail Siding Access',
    ],
  },
  estate: {
    title: 'Serenity Estates',
    subtitle: 'Lakefront Villa Plot',
    price: '$1,250,000',
    location: 'Lake Como, Italy',
    propertyType: 'Villa Plot / Land',
    area: '5 Acres',
    bedrooms: 'N/A',
    bathrooms: 'N/A',
    yearBuilt: 'N/A',
    parking: 'Custom',
    lotSize: '5 Acres',
    description:
      'An expansive 5-acre lakefront plot with approved FSI, gated access, and breathtaking panoramic views. Perfect for a bespoke villa or boutique resort development.',
    features: [
      'FSI Available: 1.5',
      'Gated Community Access',
      'Lake Facing',
      'Approved Building Plans',
    ],
  },
  signature: {},
};
