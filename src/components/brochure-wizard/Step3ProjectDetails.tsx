import React from 'react';
import { useBrochureStore } from '@/src/store/useBrochureStore';
import FormStep from '../FormStep';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

export default function Step3ProjectDetails() {
  const { data, updateData, nextStep, prevStep } = useBrochureStore();

  return (
    <FormStep
      title="Project Details"
      description="Add specifications and key metrics for the project."
      onNext={nextStep}
      onPrev={prevStep}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="configurations">Configurations Available</Label>
          <Input 
            id="configurations" 
            placeholder="e.g. 2, 3 & 4 BHK" 
            value={data.configurations}
            onChange={(e) => updateData({ configurations: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="startingPrice">Starting Price</Label>
          <Input 
            id="startingPrice" 
            placeholder="e.g. ₹ 2.5 Cr onwards" 
            value={data.startingPrice}
            onChange={(e) => updateData({ startingPrice: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="landParcel">Land Parcel Size</Label>
          <Input 
            id="landParcel" 
            placeholder="e.g. 5 Acres" 
            value={data.landParcel}
            onChange={(e) => updateData({ landParcel: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="towerCount">Tower Count</Label>
          <Input 
            id="towerCount" 
            placeholder="e.g. 3 Towers" 
            value={data.towerCount}
            onChange={(e) => updateData({ towerCount: e.target.value })}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="possessionDate">Possession Date</Label>
          <Input 
            id="possessionDate" 
            placeholder="e.g. December 2026" 
            value={data.possessionDate}
            onChange={(e) => updateData({ possessionDate: e.target.value })}
          />
        </div>
      </div>
    </FormStep>
  );
}
