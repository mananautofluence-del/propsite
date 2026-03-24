export type SlideLayout =
  | 'hero-cinematic'
  | 'hero-editorial'
  | 'bento-grid-features'
  | 'magazine-split'
  | 'stats-monumental'
  | 'vision-quote'
  | 'gallery-masonry'
  | 'contact-minimal';

export interface ThemeConfig {
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  headingFont: string;
  bodyFont: string;
}

export interface BentoBox {
  icon: string;
  title: string;
  description: string;
  size: 'large' | 'small';
}

export interface SlideData {
  id: string;
  layout: SlideLayout;
  eyebrow?: string;
  headline?: string;
  subheadline?: string;
  bodyText?: string;
  pullQuote?: string;
  bulletPoints?: string[];
  bentoBoxes?: BentoBox[];
  stats?: { label: string; value: string; unit?: string }[];
  imageTags: string[];
  contactInfo?: {
    name: string;
    phone: string;
    agency: string;
    rera: string;
    tagline?: string;
  };
}

export interface GenerativePresentation {
  theme: ThemeConfig;
  slides: SlideData[];
}

export interface PresentationPhoto {
  url: string;
  tag: string;
  orderIndex: number;
}

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
