import React from 'react';
import { Button } from './ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface FormStepProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  onNext?: () => void;
  onPrev?: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  nextLabel?: string;
  isValid?: boolean;
}

export default function FormStep({
  title,
  description,
  children,
  onNext,
  onPrev,
  isFirstStep,
  isLastStep,
  nextLabel = 'Continue',
  isValid = true,
}: FormStepProps) {
  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-4rem)] bg-slate-50">
      <div className="flex-1 w-full max-w-2xl mx-auto px-4 py-8 sm:px-6 md:py-12 flex flex-col">
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{title}</h2>
          {description && <p className="mt-2 text-slate-500">{description}</p>}
        </div>
        
        <div className="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
          {children}
        </div>
      </div>

      <div className="sticky bottom-0 w-full bg-white border-t border-slate-200 p-4 sm:px-6 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          {!isFirstStep ? (
            <Button 
              variant="outline" 
              onClick={onPrev}
              className="w-full sm:w-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          ) : (
            <div /> // Spacer
          )}
          
          <Button 
            onClick={onNext} 
            disabled={!isValid}
            className="w-full sm:w-auto min-w-[140px]"
          >
            {isLastStep ? 'Generate Page' : nextLabel}
            {!isLastStep && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
