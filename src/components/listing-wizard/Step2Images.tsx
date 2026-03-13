import React from 'react';
import { useListingStore } from '@/src/store/useListingStore';
import FormStep from '../FormStep';
import ImageUploader from '../ImageUploader';

export default function Step2Images() {
  const { data, updateData, nextStep, prevStep } = useListingStore();

  const isValid = data.images.length > 0;

  return (
    <FormStep
      title="Upload Property Images"
      description="Add high-quality photos to make your listing stand out. The first image will be the cover."
      onNext={nextStep}
      onPrev={prevStep}
      isValid={isValid}
    >
      <div className="space-y-6">
        <ImageUploader 
          images={data.images} 
          onChange={(images) => updateData({ images })} 
          maxFiles={15}
        />
      </div>
    </FormStep>
  );
}
