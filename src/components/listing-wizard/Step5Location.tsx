import React, { useState } from 'react';
import { useListingStore } from '@/src/store/useListingStore';
import FormStep from '../FormStep';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Plus, X, MapPin } from 'lucide-react';

export default function Step5Location() {
  const { data, updateData, nextStep, prevStep } = useListingStore();
  const [inputValue, setInputValue] = useState('');

  const addAdvantage = () => {
    if (inputValue.trim()) {
      updateData({ locationAdvantages: [...data.locationAdvantages, inputValue.trim()] });
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addAdvantage();
    }
  };

  const removeAdvantage = (index: number) => {
    const newAdvantages = [...data.locationAdvantages];
    newAdvantages.splice(index, 1);
    updateData({ locationAdvantages: newAdvantages });
  };

  return (
    <FormStep
      title="Location Advantages"
      description="List nearby landmarks, schools, hospitals, or transit options."
      onNext={nextStep}
      onPrev={prevStep}
    >
      <div className="space-y-8">
        <div className="space-y-4">
          <Label>Nearby Landmarks</Label>
          <div className="flex gap-2">
            <Input 
              placeholder="e.g. 5 mins to Metro Station" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button type="button" onClick={addAdvantage} variant="secondary">
              <Plus className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-3">
            {data.locationAdvantages.map((adv, index) => (
              <div key={index} className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-indigo-500" />
                  <span className="text-slate-700">{adv}</span>
                </div>
                <button 
                  onClick={() => removeAdvantage(index)}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
            {data.locationAdvantages.length === 0 && (
              <p className="text-center text-slate-500 py-8 border-2 border-dashed border-slate-200 rounded-xl">
                No location advantages added yet.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2 pt-6 border-t border-slate-200">
          <Label htmlFor="mapLink">Google Maps Link (Optional)</Label>
          <Input 
            id="mapLink" 
            placeholder="Paste Google Maps URL here" 
            value={data.mapLink}
            onChange={(e) => updateData({ mapLink: e.target.value })}
          />
          <p className="text-xs text-slate-500">
            This will embed a map on your property page.
          </p>
        </div>
      </div>
    </FormStep>
  );
}
