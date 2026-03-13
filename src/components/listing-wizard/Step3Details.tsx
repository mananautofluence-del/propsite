import React from 'react';
import { useListingStore } from '@/src/store/useListingStore';
import FormStep from '../FormStep';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select } from '../ui/select';

export default function Step3Details() {
  const { data, updateData, nextStep, prevStep } = useListingStore();

  return (
    <FormStep
      title="Property Details"
      description="Add specific details about the property layout and amenities."
      onNext={nextStep}
      onPrev={prevStep}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="bedrooms">Bedrooms</Label>
          <Input 
            id="bedrooms" 
            type="number"
            placeholder="e.g. 2" 
            value={data.bedrooms}
            onChange={(e) => updateData({ bedrooms: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bathrooms">Bathrooms</Label>
          <Input 
            id="bathrooms" 
            type="number"
            placeholder="e.g. 2" 
            value={data.bathrooms}
            onChange={(e) => updateData({ bathrooms: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="parking">Parking</Label>
          <Input 
            id="parking" 
            placeholder="e.g. 1 Covered" 
            value={data.parking}
            onChange={(e) => updateData({ parking: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="furnishingStatus">Furnishing Status</Label>
          <Select 
            id="furnishingStatus"
            value={data.furnishingStatus}
            onChange={(e) => updateData({ furnishingStatus: e.target.value })}
          >
            <option value="Unfurnished">Unfurnished</option>
            <option value="Semi-Furnished">Semi-Furnished</option>
            <option value="Fully Furnished">Fully Furnished</option>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="floorNumber">Floor Number</Label>
          <Input 
            id="floorNumber" 
            placeholder="e.g. 5" 
            value={data.floorNumber}
            onChange={(e) => updateData({ floorNumber: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="totalFloors">Total Floors</Label>
          <Input 
            id="totalFloors" 
            placeholder="e.g. 12" 
            value={data.totalFloors}
            onChange={(e) => updateData({ totalFloors: e.target.value })}
          />
        </div>
      </div>
    </FormStep>
  );
}
