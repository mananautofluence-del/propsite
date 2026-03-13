import React, { useState } from 'react';
import { useBrochureStore } from '@/src/store/useBrochureStore';
import FormStep from '../FormStep';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { UploadCloud, X, Plus, MapPin } from 'lucide-react';

export default function Step6LocationAndBroker() {
  const { data, updateData, prevStep } = useBrochureStore();
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = data.brokerName.trim() !== '' && data.brokerPhone.trim() !== '';

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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      updateData({ brokerPhoto: e.target.files[0] });
    }
  };

  const removePhoto = () => {
    updateData({ brokerPhoto: null });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // TODO: Implement Firebase upload and save logic
      console.log('Submitting data:', data);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      alert('Brochure created successfully! (Mock)');
    } catch (error) {
      console.error('Error creating brochure:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormStep
      title="Location & Contact"
      description="Add location advantages, map link, and your contact details."
      onNext={handleSubmit}
      onPrev={prevStep}
      isLastStep
      isValid={isValid && !isSubmitting}
      nextLabel={isSubmitting ? 'Generating...' : 'Generate Brochure'}
    >
      <div className="space-y-10">
        {/* Location Advantages */}
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-900 text-lg">Location Advantages</h3>
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
                  <MapPin className="w-5 h-5 text-emerald-500" />
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
          </div>

          <div className="space-y-2 pt-4">
            <Label htmlFor="mapLink">Google Maps Link (Optional)</Label>
            <Input 
              id="mapLink" 
              placeholder="Paste Google Maps URL here" 
              value={data.mapLink}
              onChange={(e) => updateData({ mapLink: e.target.value })}
            />
          </div>
        </div>

        {/* Broker Information */}
        <div className="space-y-6 pt-8 border-t border-slate-200">
          <h3 className="font-semibold text-slate-900 text-lg">Broker Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="brokerName">Your Name *</Label>
              <Input 
                id="brokerName" 
                placeholder="e.g. John Doe" 
                value={data.brokerName}
                onChange={(e) => updateData({ brokerName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brokerPhone">Phone Number *</Label>
              <Input 
                id="brokerPhone" 
                placeholder="e.g. +91 9876543210" 
                value={data.brokerPhone}
                onChange={(e) => updateData({ brokerPhone: e.target.value })}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="brokerCompany">Company Name (Optional)</Label>
              <Input 
                id="brokerCompany" 
                placeholder="e.g. Dream Homes Realty" 
                value={data.brokerCompany}
                onChange={(e) => updateData({ brokerCompany: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-200">
            <input 
              type="checkbox" 
              id="whatsapp" 
              className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              checked={data.brokerWhatsapp}
              onChange={(e) => updateData({ brokerWhatsapp: e.target.checked })}
            />
            <Label htmlFor="whatsapp" className="font-normal cursor-pointer">
              Enable WhatsApp contact on this number
            </Label>
          </div>

          <div className="space-y-3 pt-4">
            <Label>Profile Photo (Optional)</Label>
            
            {data.brokerPhoto ? (
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-slate-200 group">
                <img 
                  src={URL.createObjectURL(data.brokerPhoto)} 
                  alt="Broker" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={removePhoto}
                    className="bg-white text-red-500 p-1.5 rounded-full hover:bg-red-50 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative w-24 h-24 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handlePhotoUpload}
                />
                <UploadCloud className="w-6 h-6 text-slate-400" />
              </div>
            )}
          </div>
        </div>
      </div>
    </FormStep>
  );
}
