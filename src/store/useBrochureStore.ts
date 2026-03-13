import { create } from 'zustand';

export interface BrochureData {
  projectName: string;
  developerName: string;
  city: string;
  locality: string;
  tagline: string;
  heroImage: File | null;
  galleryImages: File[];
  videoUrl: string;
  configurations: string;
  startingPrice: string;
  landParcel: string;
  towerCount: string;
  possessionDate: string;
  amenities: string[];
  floorPlans: { label: string; file: File }[];
  locationAdvantages: string[];
  mapLink: string;
  brokerName: string;
  brokerPhone: string;
  brokerCompany: string;
  brokerWhatsapp: boolean;
  brokerPhoto: File | null;
}

const initialData: BrochureData = {
  projectName: '',
  developerName: '',
  city: '',
  locality: '',
  tagline: '',
  heroImage: null,
  galleryImages: [],
  videoUrl: '',
  configurations: '',
  startingPrice: '',
  landParcel: '',
  towerCount: '',
  possessionDate: '',
  amenities: [],
  floorPlans: [],
  locationAdvantages: [],
  mapLink: '',
  brokerName: '',
  brokerPhone: '',
  brokerCompany: '',
  brokerWhatsapp: true,
  brokerPhoto: null,
};

interface BrochureStore {
  step: number;
  data: BrochureData;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateData: (data: Partial<BrochureData>) => void;
  reset: () => void;
}

export const useBrochureStore = create<BrochureStore>((set) => ({
  step: 1,
  data: initialData,
  setStep: (step) => set({ step }),
  nextStep: () => set((state) => ({ step: Math.min(state.step + 1, 6) })),
  prevStep: () => set((state) => ({ step: Math.max(state.step - 1, 1) })),
  updateData: (newData) => set((state) => ({ data: { ...state.data, ...newData } })),
  reset: () => set({ step: 1, data: initialData }),
}));
