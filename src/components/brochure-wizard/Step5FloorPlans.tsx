import React, { useState } from 'react';
import { useBrochureStore } from '@/src/store/useBrochureStore';
import FormStep from '../FormStep';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { UploadCloud, X, Plus } from 'lucide-react';

export default function Step5FloorPlans() {
  const { data, updateData, nextStep, prevStep } = useBrochureStore();
  const [currentLabel, setCurrentLabel] = useState('');
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  const handleAddPlan = () => {
    if (currentLabel.trim() && currentFile) {
      updateData({ 
        floorPlans: [...data.floorPlans, { label: currentLabel.trim(), file: currentFile }] 
      });
      setCurrentLabel('');
      setCurrentFile(null);
    }
  };

  const removePlan = (index: number) => {
    const newPlans = [...data.floorPlans];
    newPlans.splice(index, 1);
    updateData({ floorPlans: newPlans });
  };

  return (
    <FormStep
      title="Floor Plans"
      description="Upload floor plan images and label them (e.g., 2 BHK 850 sqft)."
      onNext={nextStep}
      onPrev={prevStep}
    >
      <div className="space-y-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-semibold text-slate-900">Add New Floor Plan</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Plan Label</Label>
              <Input 
                placeholder="e.g. 3 BHK Premium" 
                value={currentLabel}
                onChange={(e) => setCurrentLabel(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Image File</Label>
              <div className="relative h-12 rounded-xl border border-slate-200 flex items-center px-4 bg-slate-50 hover:bg-slate-100 cursor-pointer overflow-hidden">
                <input 
                  type="file" 
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setCurrentFile(e.target.files[0]);
                    }
                  }}
                />
                <span className="text-sm text-slate-600 truncate">
                  {currentFile ? currentFile.name : 'Choose image...'}
                </span>
                <UploadCloud className="w-4 h-4 ml-auto text-slate-400" />
              </div>
            </div>
          </div>
          
          <Button 
            onClick={handleAddPlan} 
            disabled={!currentLabel.trim() || !currentFile}
            className="w-full sm:w-auto"
            variant="secondary"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Floor Plan
          </Button>
        </div>

        {data.floorPlans.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium text-slate-700">Added Floor Plans ({data.floorPlans.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.floorPlans.map((plan, index) => (
                <div key={index} className="relative group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="aspect-[4/3] bg-slate-100 relative">
                    <img 
                      src={URL.createObjectURL(plan.file)} 
                      alt={plan.label}
                      className="w-full h-full object-contain p-2"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => removePlan(index)}
                        className="bg-white text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="p-3 border-t border-slate-200 text-center">
                    <span className="font-medium text-slate-900 text-sm">{plan.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </FormStep>
  );
}
