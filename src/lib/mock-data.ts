import { Listing, ListingPhoto, Collection, Profile } from './types';

const demoPhotos: ListingPhoto[] = [
  { id: '1', listing_id: 'demo-1', url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop', storage_path: '', order_index: 0, is_hero: true, room_tag: 'Building', created_at: '' },
  { id: '2', listing_id: 'demo-1', url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop', storage_path: '', order_index: 1, is_hero: false, room_tag: 'Living Room', created_at: '' },
  { id: '3', listing_id: 'demo-1', url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop', storage_path: '', order_index: 2, is_hero: false, room_tag: 'Kitchen', created_at: '' },
  { id: '4', listing_id: 'demo-1', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop', storage_path: '', order_index: 3, is_hero: false, room_tag: 'Master Bed', created_at: '' },
  { id: '5', listing_id: 'demo-1', url: 'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800&h=600&fit=crop', storage_path: '', order_index: 4, is_hero: false, room_tag: 'Balcony', created_at: '' },
];

export const demoListing: Listing = {
  id: 'demo-1',
  slug: 'prestige-towers-3bhk-worli',
  status: 'live',
  template: 'blanc',
  accent_color: '#1A5C3A',
  headline: 'Sea-Facing 3BHK at Prestige Towers, Worli',
  property_type: 'Apartment',
  property_category: 'residential',
  transaction_type: 'sale',
  price: 32000000,
  price_negotiable: true,
  bhk_config: '3 BHK',
  carpet_area: 1450,
  builtup_area: 1820,
  super_builtup_area: 2100,
  floor_number: 14,
  total_floors: 32,
  property_age: '2 years',
  possession_status: 'ready',
  rera_number: 'P51800012345',
  building_name: 'Prestige Towers',
  locality: 'Worli',
  city: 'Mumbai',
  pincode: '400018',
  facing_direction: 'West',
  google_maps_url: 'https://maps.google.com/?q=Worli+Mumbai',
  parking_car: 2,
  parking_two_wheeler: 1,
  furnishing_status: 'semi-furnished',
  balcony_count: 2,
  bathroom_count: 3,
  has_servant_room: true,
  has_study_room: false,
  has_pooja_room: true,
  has_store_room: false,
  amenities: ['Lift', 'Power Backup', '24x7 Water', 'Security/CCTV', 'Gated Community', 'Swimming Pool', 'Gymnasium', 'Clubhouse', 'Kids Play Area', 'Jogging Track', 'Fire Safety'],
  ai_description: 'An exceptional sea-facing residence on the 14th floor of the prestigious Prestige Towers in Worli. This 3BHK apartment offers panoramic Arabian Sea views from its expansive living area and two private balconies. The semi-furnished unit features Italian marble flooring, modular kitchen with Bosch appliances, and VRV air conditioning throughout. The master suite includes a walk-in wardrobe and en-suite bathroom with rain shower. A dedicated servant quarter adds to the convenience. Located in one of South Mumbai\'s most sought-after addresses, residents enjoy world-class amenities including an infinity pool, state-of-the-art gymnasium, and 24-hour concierge service.',
  ai_highlights: ['Unobstructed sea view from 14th floor', 'Italian marble flooring throughout', 'Modular kitchen with premium appliances', '2 covered car parks + visitor parking', 'OC received, ready to move in'],
  broker_notes: '',
  broker_name: 'Rahul Mehta',
  broker_phone: '9876543210',
  broker_whatsapp: '9876543210',
  broker_agency: 'Mehta Realtors',
  broker_rera: 'A51800045678',
  show_broker_card: true,
  urgency_badge: 'Only 2 units left in this tower',
  lead_capture_enabled: false,
  total_views: 247,
  total_sessions: 89,
  avg_time_seconds: 194,
  whatsapp_clicks: 34,
  contact_clicks: 12,
  photos: demoPhotos,
  is_corner_unit: false,
  is_main_road_facing: false,
  has_three_phase_power: false,
  is_midc_plot: false,
  has_na_order: false,
  is_clear_title: true,
  listing_quality_score: 82,
  ai_neighbourhood_highlights: ['Worli Sea Face promenade 2 min walk', 'Bandra-Worli Sea Link access', 'Premium dining at Koishii & Estella'],
  created_at: '2026-03-15T10:00:00Z',
  updated_at: '2026-03-15T10:00:00Z',
};

export const demoListings: Listing[] = [
  demoListing,
  {
    ...demoListing,
    id: 'demo-2',
    slug: 'oberoi-sky-2bhk-andheri',
    headline: 'Premium 2BHK at Oberoi Sky, Andheri West',
    price: 18500000,
    bhk_config: '2 BHK',
    carpet_area: 980,
    locality: 'Andheri West',
    floor_number: 22,
    total_views: 156,
    whatsapp_clicks: 18,
    status: 'live',
    photos: [{ ...demoPhotos[0], id: '10', url: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=600&fit=crop' }],
  },
  {
    ...demoListing,
    id: 'demo-3',
    slug: 'lodha-world-4bhk-lower-parel',
    headline: 'Luxurious 4BHK at Lodha World Crest',
    price: 75000000,
    bhk_config: '4 BHK',
    carpet_area: 2800,
    locality: 'Lower Parel',
    floor_number: 38,
    total_views: 89,
    whatsapp_clicks: 7,
    status: 'draft',
    photos: [{ ...demoPhotos[0], id: '20', url: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=600&fit=crop' }],
  },
];

export const demoProfile: Profile = {
  id: 'demo-user',
  full_name: 'Rahul Mehta',
  email: 'rahul@mehtarealtors.com',
  phone: '9876543210',
  whatsapp: '9876543210',
  agency_name: 'Mehta Realtors',
  rera_number: 'A51800045678',
  bio: 'Specializing in luxury properties across South Mumbai with 12 years of experience.',
  city: 'Mumbai',
  plan: 'pro',
  credits_remaining: 47,
  listings_used_this_month: 8,
  onboarding_complete: true,
};

export const demoCollections: Collection[] = [
  {
    id: 'col-1',
    user_id: 'demo-user',
    slug: 'south-mumbai-3bhk-options',
    title: 'South Mumbai 3BHK Options',
    description: 'Curated 3BHK apartments in premium South Mumbai locations',
    listing_ids: ['demo-1', 'demo-3'],
    status: 'live',
    total_views: 67,
    created_at: '2026-03-18T10:00:00Z',
  },
];

// FIX 15: Updated formatPrice with transaction type support
export function formatPrice(price?: number, transactionType?: string): string {
  if (!price || price === 0) return '';
  const n = Number(price);
  let formatted: string;
  if (n >= 10000000) {
    formatted = `₹${(n / 10000000).toFixed(1).replace(/\.0$/, '')} Cr`;
  } else if (n >= 100000) {
    formatted = `₹${(n / 100000).toFixed(1).replace(/\.0$/, '')} L`;
  } else {
    formatted = `₹${n.toLocaleString('en-IN')}`;
  }
  if (transactionType === 'rent') formatted += '/mo';
  return formatted;
}

// FIX 11: Live price format preview
export function formatPricePreview(value: number | undefined, transactionType?: string): string {
  if (!value || value === 0) return '';
  const n = Number(value);
  let result: string;
  if (n >= 10000000) {
    result = `= ₹${(n / 10000000).toFixed(1)} Crore`;
  } else if (n >= 100000) {
    result = `= ₹${(n / 100000).toFixed(1)} Lakh`;
  } else {
    result = `= ₹${n.toLocaleString('en-IN')}`;
  }
  if (transactionType === 'rent') result += '/month';
  return result;
}

export function calculateQualityScore(listing: Partial<Listing>, photoCount: number): number {
  let score = 0;
  const fields = ['headline', 'property_type', 'price', 'bhk_config', 'carpet_area', 'floor_number', 'total_floors', 'possession_status', 'building_name', 'locality', 'city', 'furnishing_status', 'bathroom_count', 'parking_car', 'facing_direction', 'ai_description'];
  const filled = fields.filter(f => (listing as any)[f] != null && (listing as any)[f] !== '' && (listing as any)[f] !== 0).length;
  score += Math.round((filled / fields.length) * 40);
  score += Math.min(20, photoCount * 4);
  const addons = ['floor_plan_url', 'virtual_tour_url', 'ai_neighbourhood_highlights', 'price_history_note', 'open_house_date', 'broker_personal_note'];
  const addFilled = addons.filter(f => {
    const val = (listing as any)[f];
    return val != null && val !== '' && (!Array.isArray(val) || val.length > 0);
  }).length;
  score += Math.round((addFilled / addons.length) * 40);
  return Math.min(100, score);
}
