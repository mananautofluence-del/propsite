import React, { useEffect } from 'react';
import { useListingStore } from '@/src/store/useListingStore';
import ProgressBar from '@/src/components/ProgressBar';
import Step1BasicInfo from '@/src/components/listing-wizard/Step1BasicInfo';
import Step2Images from '@/src/components/listing-wizard/Step2Images';
import Step3Details from '@/src/components/listing-wizard/Step3Details';
import Step4Highlights from '@/src/components/listing-wizard/Step4Highlights';
import Step5Location from '@/src/components/listing-wizard/Step5Location';
import Step6Broker from '@/src/components/listing-wizard/Step6Broker';

export default function CreateListing() {
  const { step, reset } = useListingStore();

  // Reset store when component mounts
  useEffect(() => {
    reset();
  }, [reset]);

  const renderStep = () => {
    switch (step) {
      case 1: return <Step1BasicInfo />;
      case 2: return <Step2Images />;
      case 3: return <Step3Details />;
      case 4: return <Step4Highlights />;
      case 5: return <Step5Location />;
      case 6: return <Step6Broker />;
      default: return <Step1BasicInfo />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <ProgressBar currentStep={step} totalSteps={6} />
      <div className="flex-1">
        {renderStep()}
      </div>
    </div>
  );
}
