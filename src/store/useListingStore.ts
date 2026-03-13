import { create } from 'zustand';

export interface ListingData {
  title: string;
  propertyType: string;
  configuration: string;
  carpetArea: string;
  price: string;
  city: string;
  locality: string;
  possessionStatus: string;
  images: File[];
  bedrooms: string;
  bathrooms: string;
  parking: string;
  floorNumber: string;
  totalFloors: string;
  furnishingStatus: string;
  highlights: string[];
  locationAdvantages: string[];
  mapLink: string;
  brokerName: string;
  brokerPhone: string;
  brokerCompany: string;
  brokerWhatsapp: boolean;
  brokerPhoto: File | null;
}

const initialData: ListingData = {
  title: '',
  propertyType: 'Apartment',
  configuration: '',
  carpetArea: '',
  price: '',
  city: '',
  locality: '',
  possessionStatus: 'Ready to Move',
  images: [],
  bedrooms: '',
  bathrooms: '',
  parking: '',
  floorNumber: '',
  totalFloors: '',
  furnishingStatus: 'Unfurnished',
  highlights: [],
  locationAdvantages: [],
  mapLink: '',
  brokerName: '',
  brokerPhone: '',
  brokerCompany: '',
  brokerWhatsapp: true,
  brokerPhoto: null,
};

interface ListingStore {
  step: number;
  data: ListingData;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateData: (data: Partial<ListingData>) => void;
  reset: () => void;
}

export const useListingStore = create<ListingStore>((set) => ({
  step: 1,
  data: initialData,
  setStep: (step) => set({ step }),
  nextStep: () => set((state) => ({ step: Math.min(state.step + 1, 6) })),
  prevStep: () => set((state) => ({ step: Math.max(state.step - 1, 1) })),
  updateData: (newData) => set((state) => ({ data: { ...state.data, ...newData } })),
  reset: () => set({ step: 1, data: initialData }),
}));
