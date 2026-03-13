import React, { useEffect } from 'react';
import { useBrochureStore } from '@/src/store/useBrochureStore';
import ProgressBar from '@/src/components/ProgressBar';
import Step1ProjectInfo from '@/src/components/brochure-wizard/Step1ProjectInfo';
import Step2Media from '@/src/components/brochure-wizard/Step2Media';
import Step3ProjectDetails from '@/src/components/brochure-wizard/Step3ProjectDetails';
import Step4Amenities from '@/src/components/brochure-wizard/Step4Amenities';
import Step5FloorPlans from '@/src/components/brochure-wizard/Step5FloorPlans';
import Step6LocationAndBroker from '@/src/components/brochure-wizard/Step6LocationAndBroker';

export default function CreateBrochure() {
  const { step, reset } = useBrochureStore();

  // Reset store when component mounts
  useEffect(() => {
    reset();
  }, [reset]);

  const renderStep = () => {
    switch (step) {
      case 1: return <Step1ProjectInfo />;
      case 2: return <Step2Media />;
      case 3: return <Step3ProjectDetails />;
      case 4: return <Step4Amenities />;
      case 5: return <Step5FloorPlans />;
      case 6: return <Step6LocationAndBroker />;
      default: return <Step1ProjectInfo />;
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
