import React, { useState } from 'react';
import { useListingStore } from '@/src/store/useListingStore';
import FormStep from '../FormStep';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Plus, X } from 'lucide-react';

export default function Step4Highlights() {
  const { data, updateData, nextStep, prevStep } = useListingStore();
  const [inputValue, setInputValue] = useState('');

  const addHighlight = () => {
    if (inputValue.trim()) {
      updateData({ highlights: [...data.highlights, inputValue.trim()] });
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addHighlight();
    }
  };

  const removeHighlight = (index: number) => {
    const newHighlights = [...data.highlights];
    newHighlights.splice(index, 1);
    updateData({ highlights: newHighlights });
  };

  return (
    <FormStep
      title="Property Highlights"
      description="Add key selling points as bullet points (e.g., Sea view, Corner apartment)."
      onNext={nextStep}
      onPrev={prevStep}
    >
      <div className="space-y-6">
        <div className="flex gap-2">
          <Input 
            placeholder="Add a highlight..." 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button type="button" onClick={addHighlight} variant="secondary">
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        <div className="space-y-3">
          {data.highlights.map((highlight, index) => (
            <div key={index} className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                <span className="text-slate-700">{highlight}</span>
              </div>
              <button 
                onClick={() => removeHighlight(index)}
                className="text-slate-400 hover:text-red-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
          {data.highlights.length === 0 && (
            <p className="text-center text-slate-500 py-8 border-2 border-dashed border-slate-200 rounded-xl">
              No highlights added yet.
            </p>
          )}
        </div>
      </div>
    </FormStep>
  );
}
