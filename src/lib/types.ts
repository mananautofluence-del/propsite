export type PropertyCategory = 'residential' | 'commercial_office' | 'commercial_shop' | 'warehouse' | 'plot' | 'building' | 'whole_building';
export type TransactionType = 'sale' | 'rent' | 'lease';
export type ListingStatus = 'draft' | 'live' | 'expired';
export type FurnishingStatus = 'unfurnished' | 'semi-furnished' | 'fully-furnished';
export type PossessionStatus = 'ready' | 'under-construction' | 'nearing';
export type OfficeFurnishing = 'bare-shell' | 'warm-shell' | 'fully-furnished';
export type BuildingGrade = 'A' | 'B' | 'C';
export type PlotShape = 'regular' | 'irregular' | 'corner';

export interface ListingPhoto {
  id: string;
  listing_id: string;
  url: string;
  storage_path: string;
  order_index: number;
  is_hero: boolean;
  room_tag: string;
  created_at: string;
}

export interface Listing {
  id: string;
  user_id?: string;
  temp_token?: string;
  slug: string;
  status: ListingStatus;
  template: string;
  accent_color: string;
  headline?: string;
  property_type?: string;
  property_category: PropertyCategory;
  transaction_type?: TransactionType;
  price?: number;
  price_negotiable: boolean;
  monthly_rent?: number;
  security_deposit?: number;
  bhk_config?: string;
  carpet_area?: number;
  builtup_area?: number;
  super_builtup_area?: number;
  floor_number?: number;
  total_floors?: number;
  property_age?: string;
  possession_status?: PossessionStatus;
  possession_date?: string;
  rera_number?: string;
  building_name?: string;
  locality?: string;
  city?: string;
  pincode?: string;
  facing_direction?: string;
  google_maps_url?: string;
  parking_car: number;
  parking_two_wheeler: number;
  furnishing_status?: FurnishingStatus;
  balcony_count: number;
  bathroom_count: number;
  has_servant_room: boolean;
  has_study_room: boolean;
  has_pooja_room: boolean;
  has_store_room: boolean;
  amenities: string[];
  ai_description?: string;
  ai_highlights: string[];
  broker_notes?: string;
  broker_name?: string;
  broker_phone?: string;
  broker_whatsapp?: string;
  broker_agency?: string;
  broker_rera?: string;
  broker_avatar_url?: string;
  broker_logo_url?: string;
  show_broker_card: boolean;
  expiry_date?: string;
  urgency_badge?: string;
  lead_capture_enabled: boolean;
  total_views: number;
  total_sessions: number;
  avg_time_seconds: number;
  whatsapp_clicks: number;
  contact_clicks: number;
  photos: ListingPhoto[];
  // Commercial
  cam_charges?: number;
  lock_in_period?: string;
  workstation_capacity?: number;
  cabin_count?: number;
  meeting_rooms?: number;
  office_furnishing?: OfficeFurnishing;
  building_grade?: BuildingGrade;
  ac_type?: string;
  power_backup_kva?: number;
  frontage_width?: number;
  unit_height?: number;
  is_corner_unit: boolean;
  is_main_road_facing: boolean;
  current_status?: string;
  power_load_kw?: number;
  // Warehouse
  warehouse_height?: number;
  loading_bays?: number;
  floor_load_capacity?: number;
  has_three_phase_power: boolean;
  is_midc_plot: boolean;
  zoning_type?: string;
  // Plot
  plot_area?: number;
  plot_dimensions?: string;
  plot_shape?: PlotShape;
  road_width?: number;
  road_type?: string;
  has_na_order: boolean;
  fsi_available?: number;
  survey_number?: string;
  is_clear_title: boolean;
  // Add-ons
  floor_plan_url?: string;
  virtual_tour_url?: string;
  price_history_note?: string;
  open_house_date?: string;
  open_house_time_start?: string;
  open_house_time_end?: string;
  broker_personal_note?: string;
  listing_quality_score: number;
  ai_neighbourhood_highlights: string[];
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  agency_name?: string;
  rera_number?: string;
  bio?: string;
  city?: string;
  avatar_url?: string;
  logo_url?: string;
  tagline?: string;
  username?: string;
  plan: string;
  credits_remaining: number;
  listings_used_this_month: number;
  onboarding_complete: boolean;
}

export interface Collection {
  id: string;
  user_id: string;
  slug: string;
  title: string;
  description?: string;
  listing_ids: string[];
  status: string;
  expiry_date?: string;
  total_views: number;
  created_at: string;
}

export interface WizardState {
  step: number;
  photos: File[];
  photoUrls: string[];
  photoPreviews: string[];
  photoTags: Record<string, string>;
  brokerNotes: string;
  listing: Partial<Listing>;
  aiQuestions: AIQuestion[];
  currentQuestion: number;
  isAiLoading: boolean;
  aiFieldsCount: number;
  selectedTemplate: string;
  selectedAccent: string;
}

export interface AIQuestion {
  field: string;
  question: string;
  options: { label: string; value: string }[];
}

export const ROOM_TAGS = ['Living Room', 'Kitchen', 'Master Bedroom', 'Master Bed', 'Bedroom', 'Bathroom', 'Balcony', 'View', 'Building', 'Other'] as const;

export const PROPERTY_CATEGORIES: { value: PropertyCategory; label: string; icon: string }[] = [
  { value: 'residential', label: 'Residential', icon: '🏠' },
  { value: 'commercial_office', label: 'Commercial Office', icon: '🏢' },
  { value: 'commercial_shop', label: 'Commercial Shop', icon: '🏪' },
  { value: 'warehouse', label: 'Warehouse / Industrial', icon: '🏭' },
  { value: 'plot', label: 'Plot / Land', icon: '📐' },
  { value: 'whole_building', label: 'Whole Building', icon: '🏗️' },
  { value: 'building', label: 'Whole Building', icon: '🏗️' },
];

export const AMENITIES = [
  'Lift', 'Power Backup', '24x7 Water', 'Security/CCTV', 'Gated Community', 'Visitor Parking',
  'Swimming Pool', 'Gymnasium', 'Clubhouse', 'Kids Play Area', 'Jogging Track', 'Tennis Court',
  'Badminton Court', 'Indoor Games', 'Library', 'Community Hall', 'Amphitheatre', 'Shopping Centre',
  'School', 'Hospital Nearby', 'Metro Nearby', 'Vastu Compliant', 'Rainwater Harvesting', 'Solar Panels',
  'EV Charging', 'Pet Friendly', 'Intercom', 'Gas Pipeline', 'Maintenance Staff', 'Guard',
  'Video Door Phone', 'Fire Safety', 'Earthquake Resistant',
];

export const TEMPLATES = [
  { id: 'blanc', name: 'Blanc', desc: 'Clean minimal white' },
  { id: 'aura', name: 'Aura', desc: 'Warm editorial' },
  { id: 'edge', name: 'Edge', desc: 'Bold modern' },
  { id: 'grove', name: 'Grove', desc: 'Natural green tones' },
  { id: 'slate', name: 'Slate', desc: 'Sophisticated dark' },
];

export const ACCENT_COLORS = ['#1A5C3A', '#2C5282', '#744210', '#702459', '#1A202C', '#234E52', '#7B341E', '#553C9A'];
