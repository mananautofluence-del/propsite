import React from 'react';
import { useListingStore } from '@/src/store/useListingStore';
import FormStep from '../FormStep';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select } from '../ui/select';

export default function Step1BasicInfo() {
  const { data, updateData, nextStep } = useListingStore();

  const isValid = data.title.trim() !== '' && data.price.trim() !== '' && data.city.trim() !== '' && data.locality.trim() !== '';

  return (
    <FormStep
      title="Basic Property Information"
      description="Let's start with the essential details of the property."
      onNext={nextStep}
      isFirstStep
      isValid={isValid}
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Property Title *</Label>
          <Input 
            id="title" 
            placeholder="e.g. Sunrise Heights 2BHK" 
            value={data.title}
            onChange={(e) => updateData({ title: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="propertyType">Property Type</Label>
            <Select 
              id="propertyType"
              value={data.propertyType}
              onChange={(e) => updateData({ propertyType: e.target.value })}
            >
              <option value="Apartment">Apartment</option>
              <option value="Villa">Villa</option>
              <option value="Independent House">Independent House</option>
              <option value="Plot">Plot</option>
              <option value="Commercial">Commercial</option>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="configuration">Configuration</Label>
            <Input 
              id="configuration" 
              placeholder="e.g. 2 BHK, 3 BHK" 
              value={data.configuration}
              onChange={(e) => updateData({ configuration: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="carpetArea">Carpet Area</Label>
            <Input 
              id="carpetArea" 
              placeholder="e.g. 850 sqft" 
              value={data.carpetArea}
              onChange={(e) => updateData({ carpetArea: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price *</Label>
            <Input 
              id="price" 
              placeholder="e.g. ₹ 1.65 Cr" 
              value={data.price}
              onChange={(e) => updateData({ price: e.target.value })}
            />
          </div>

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
              placeholder="e.g. Bhandup West" 
              value={data.locality}
              onChange={(e) => updateData({ locality: e.target.value })}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="possessionStatus">Possession Status</Label>
            <Select 
              id="possessionStatus"
              value={data.possessionStatus}
              onChange={(e) => updateData({ possessionStatus: e.target.value })}
            >
              <option value="Ready to Move">Ready to Move</option>
              <option value="Under Construction">Under Construction</option>
            </Select>
          </div>
        </div>
      </div>
    </FormStep>
  );
}
