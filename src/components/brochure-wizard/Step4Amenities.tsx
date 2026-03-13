import React from 'react';
import { useBrochureStore } from '@/src/store/useBrochureStore';
import FormStep from '../FormStep';
import { cn } from '@/src/lib/utils';
import { Check } from 'lucide-react';

const COMMON_AMENITIES = [
  'Swimming Pool', 'Gymnasium', 'Clubhouse', 'Landscaped Garden', 
  'Kids Play Area', 'Jogging Track', 'Tennis Court', 'Badminton Court',
  'Indoor Games', 'Multipurpose Hall', 'Yoga Deck', '24/7 Security',
  'Power Backup', 'CCTV Surveillance', 'Amphitheatre', 'Spa & Sauna'
];

export default function Step4Amenities() {
  const { data, updateData, nextStep, prevStep } = useBrochureStore();

  const toggleAmenity = (amenity: string) => {
    const current = data.amenities;
    if (current.includes(amenity)) {
      updateData({ amenities: current.filter(a => a !== amenity) });
    } else {
      updateData({ amenities: [...current, amenity] });
    }
  };

  return (
    <FormStep
      title="Amenities"
      description="Select the amenities available in the project."
      onNext={nextStep}
      onPrev={prevStep}
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {COMMON_AMENITIES.map((amenity) => {
          const isSelected = data.amenities.includes(amenity);
          return (
            <button
              key={amenity}
              onClick={() => toggleAmenity(amenity)}
              className={cn(
                "relative flex flex-col items-center justify-center p-4 rounded-xl border-2 text-center transition-all duration-200 h-24",
                isSelected 
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700" 
                  : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-slate-50"
              )}
            >
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                </div>
              )}
              <span className="text-sm font-medium leading-tight">{amenity}</span>
            </button>
          );
        })}
      </div>
    </FormStep>
  );
}
