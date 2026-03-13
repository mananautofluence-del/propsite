import React from 'react';
import { useBrochureStore } from '@/src/store/useBrochureStore';
import FormStep from '../FormStep';
import ImageUploader from '../ImageUploader';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { UploadCloud, X } from 'lucide-react';

export default function Step2Media() {
  const { data, updateData, nextStep, prevStep } = useBrochureStore();

  const isValid = data.heroImage !== null;

  const handleHeroUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      updateData({ heroImage: e.target.files[0] });
    }
  };

  const removeHero = () => {
    updateData({ heroImage: null });
  };

  return (
    <FormStep
      title="Media Upload"
      description="Add high-quality visuals for the project. A hero image is required."
      onNext={nextStep}
      onPrev={prevStep}
      isValid={isValid}
    >
      <div className="space-y-8">
        <div className="space-y-3">
          <Label>Hero Image *</Label>
          {data.heroImage ? (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-slate-200 group">
              <img 
                src={URL.createObjectURL(data.heroImage)} 
                alt="Hero" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={removeHero}
                  className="bg-white text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="relative w-full aspect-video rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleHeroUpload}
              />
              <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
              <p className="text-sm font-medium text-slate-600">Upload Hero Image</p>
            </div>
          )}
        </div>

        <div className="space-y-3 pt-6 border-t border-slate-200">
          <Label>Gallery Images (Optional)</Label>
          <ImageUploader 
            images={data.galleryImages} 
            onChange={(images) => updateData({ galleryImages: images })} 
            maxFiles={10}
          />
        </div>

        <div className="space-y-2 pt-6 border-t border-slate-200">
          <Label htmlFor="videoUrl">Video Tour URL (Optional)</Label>
          <Input 
            id="videoUrl" 
            placeholder="e.g. YouTube or Vimeo link" 
            value={data.videoUrl}
            onChange={(e) => updateData({ videoUrl: e.target.value })}
          />
        </div>
      </div>
    </FormStep>
  );
}
