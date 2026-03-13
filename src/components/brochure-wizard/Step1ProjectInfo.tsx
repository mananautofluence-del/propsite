import React from 'react';
import { useBrochureStore } from '@/src/store/useBrochureStore';
import FormStep from '../FormStep';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

export default function Step1ProjectInfo() {
  const { data, updateData, nextStep } = useBrochureStore();

  const isValid = data.projectName.trim() !== '' && data.developerName.trim() !== '' && data.city.trim() !== '' && data.locality.trim() !== '';

  return (
    <FormStep
      title="Project Information"
      description="Start with the core details of the new development."
      onNext={nextStep}
      isFirstStep
      isValid={isValid}
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="projectName">Project Name *</Label>
          <Input 
            id="projectName" 
            placeholder="e.g. Lodha Bellissimo" 
            value={data.projectName}
            onChange={(e) => updateData({ projectName: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="developerName">Developer Name *</Label>
          <Input 
            id="developerName" 
            placeholder="e.g. Lodha Group" 
            value={data.developerName}
            onChange={(e) => updateData({ developerName: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input 
              id="city" 
              placeholder="e.g. Mumbai" 
              value={data.city}
              onChange={(e) => updateData({ city: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="locality">Locality *</Label>
            <Input 
              id="locality" 
              placeholder="e.g. Mahalaxmi" 
              value={data.locality}
              onChange={(e) => updateData({ locality: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tagline">Project Tagline (Optional)</Label>
          <Input 
            id="tagline" 
            placeholder="e.g. Luxury Living Redefined" 
            value={data.tagline}
            onChange={(e) => updateData({ tagline: e.target.value })}
          />
        </div>
      </div>
    </FormStep>
  );
}
