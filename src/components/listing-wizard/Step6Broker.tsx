import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useListingStore } from '@/src/store/useListingStore';
import FormStep from '../FormStep';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { UploadCloud, X } from 'lucide-react';
import { useAuth } from '@/src/contexts/AuthContext';
import { uploadFile, uploadFiles } from '@/src/lib/storage';
import { db, auth } from '@/src/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function Step6Broker() {
  const { data, updateData, prevStep, reset } = useListingStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { user, signIn } = useAuth();
  const navigate = useNavigate();

  const isValid = data.brokerName.trim() !== '' && data.brokerPhone.trim() !== '';

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      updateData({ brokerPhoto: e.target.files[0] });
    }
  };

  const removePhoto = () => {
    updateData({ brokerPhoto: null });
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    let currentUser = user;
    if (!currentUser) {
      try {
        await signIn();
        // After signIn, we need to get the current user from auth since context might not have updated yet
        currentUser = auth.currentUser;
        if (!currentUser) return;
      } catch (error) {
        console.error('Sign in failed:', error);
        setSubmitError('Sign in failed. Please try again.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      // 1. Upload images
      const imageUrls = await uploadFiles(data.images, `listings/${currentUser.uid}`);
      
      // 2. Upload broker photo if exists
      let brokerPhotoUrl = null;
      if (data.brokerPhoto) {
        brokerPhotoUrl = await uploadFile(data.brokerPhoto, `brokers/${currentUser.uid}`);
      }

      // 3. Save to Firestore
      const listingData = {
        title: data.title,
        propertyType: data.propertyType,
        configuration: data.configuration,
        carpetArea: data.carpetArea,
        price: data.price,
        city: data.city,
        locality: data.locality,
        possessionStatus: data.possessionStatus,
        images: imageUrls,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        parking: data.parking,
        floorNumber: data.floorNumber,
        totalFloors: data.totalFloors,
        furnishingStatus: data.furnishingStatus,
        highlights: data.highlights,
        locationAdvantages: data.locationAdvantages,
        mapLink: data.mapLink,
        brokerName: data.brokerName,
        brokerPhone: data.brokerPhone,
        brokerCompany: data.brokerCompany,
        brokerWhatsapp: data.brokerWhatsapp,
        brokerPhotoUrl: brokerPhotoUrl,
        ownerId: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'active'
      };

      const docRef = await addDoc(collection(db, 'listings'), listingData);
      
      reset();
      navigate(`/listing/${docRef.id}`);
    } catch (error: any) {
      console.error('Error creating listing:', error);
      setSubmitError(error.message || 'Failed to create listing. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormStep
      title="Broker Information"
      description="Add your contact details so buyers can reach you."
      onNext={handleSubmit}
      onPrev={prevStep}
      isLastStep
      isValid={isValid}
      isSubmitting={isSubmitting}
      nextLabel={isSubmitting ? 'Generating...' : (user ? 'Generate Page' : 'Sign in to Generate')}
    >
      <div className="space-y-6">
        {submitError && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm">
            {submitError}
          </div>
        )}
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
            className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            checked={data.brokerWhatsapp}
            onChange={(e) => updateData({ brokerWhatsapp: e.target.checked })}
          />
          <Label htmlFor="whatsapp" className="font-normal cursor-pointer">
            Enable WhatsApp contact on this number
          </Label>
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-200">
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
          <p className="text-xs text-slate-500">
            A professional photo builds trust with buyers.
          </p>
        </div>
      </div>
    </FormStep>
  );
}
