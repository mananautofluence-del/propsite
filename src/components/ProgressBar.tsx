import React from 'react';
import { cn } from '@/src/lib/utils';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export default function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const percentage = Math.round(((currentStep - 1) / (totalSteps - 1)) * 100);

  return (
    <div className="w-full bg-white border-b border-slate-200 sticky top-16 z-40">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-xs font-semibold text-indigo-600">
            {percentage}% Completed
          </span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-600 transition-all duration-500 ease-in-out rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
