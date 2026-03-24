// === Gamma-Style Generative Presentation Type System ===

export type SlideLayout =
  | 'hero-cover'
  | 'split-left-image'
  | 'split-right-image'
  | 'features-grid'
  | 'full-gallery'
  | 'contact-card';

export interface ThemeConfig {
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  headingFont: string;
  bodyFont: string;
}

export interface SlideData {
  id: string;
  layout: SlideLayout;
  headline?: string;
  subheadline?: string;
  bodyText?: string;
  bulletPoints?: string[];
  stats?: { label: string; value: string }[];
  imageTags: string[];
  contactInfo?: {
    name: string;
    phone: string;
    agency: string;
    rera: string;
  };
}

export interface GenerativePresentation {
  theme: ThemeConfig;
  slides: SlideData[];
}

// Photo type (unchanged)
export interface PresentationPhoto {
  url: string;
  tag: string;
  orderIndex: number;
}

// Stored presentation shape (localStorage)
export interface StoredPresentation {
  id: string;
  user_id: string | null;
  title: string;
  presentation: GenerativePresentation;
  photo_urls: string[];
  photo_tags: string[];
  created_at: string;
  status: string;
}
