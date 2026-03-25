export type SlideLayout =
  | 'cover-editorial'        // Slide 1: Large serif headline left, rounded image right
  | 'stats-two-col'          // Slide 2: Two giant numbers with ruled separators
  | 'content-image-bottom'   // Slide 3: Headline+text top, image right, 3-col features bottom
  | 'headline-two-images'    // Slide 4: Headline+body top, two equal rounded images below
  | 'headline-numbered-list' // Slide 5: Headline left, numbered items 01/02/03 right
  | 'headline-two-col-images'// Slide 6: Headline left, two stacked images right with captions
  | 'images-top-headline-bottom' // Slide 7: Two images top, headline + body bottom
  | 'centered-numbered-cols' // Slide 8: Centered big title, 3 numbered columns below
  | 'image-left-headline-numbered' // Slide 9: Rounded image left, headline+2 numbered right
  | 'headline-body-image-numbered' // Slide 10: Headline+body top-left, image bottom-left, 2 numbered right
  | 'headline-2x2-numbered'  // Slide 11: Headline+body top, 2x2 numbered grid below
  | 'headline-2img-2numbered'// Slide 12: Headline+2numbered left, 2 stacked images right
  | 'two-images-headline-numbered' // Slide 13: 2 images left, headline+2numbered+body right
  | 'image-top-headline-numbered'  // Slide 14: Image+2numbered top, headline+body bottom
  | 'contact-split'          // Slide 15: Headline+body+CTA left, vertical rule, contact right

export interface ThemeConfig {
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  headingFont: string;
  bodyFont: string;
}

export interface NumberedItem {
  number: string;   // '01', '02', '03', '04'
  title: string;    // Bold label
  body: string;     // Description text
}

export interface SlideData {
  id: string;
  layout: SlideLayout;
  pageNumber: number;
  agencyName?: string;
  headline?: string;
  subheadline?: string;
  bodyText?: string;
  stats?: { value: string; label: string; description?: string }[];
  numberedItems?: NumberedItem[];
  imageTags: string[];
  contactInfo?: {
    name: string;
    phone: string;
    email?: string;
    website?: string;
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
  dimension?: string;
}
