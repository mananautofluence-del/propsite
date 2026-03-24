import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { PresentationTheme, PresentationFormat, PresentationContent, PresentationPhoto } from '@/lib/presentationTypes';
import { CheckCircle2, ChevronRight, Image as ImageIcon, Loader2, Sparkles, X, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function CreatePresentation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialListingId = searchParams.get('listing_id');

  const [step, setStep] = useState<1 | 2>(1);
  const [format, setFormat] = useState<PresentationFormat>('square');
  const [theme, setTheme] = useState<PresentationTheme | 'auto'>('signature');
  
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  
  const [brokerProfile, setBrokerProfile] = useState<{
    fullName: string; phone: string; agencyName: string; reraNumber: string;
  }>({
    fullName: '', phone: '', agencyName: '', reraNumber: ''
  });
  const [isEditProfile, setIsEditProfile] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('');

  // Pre-fill if listing_id is provided
  useEffect(() => {
    if (!user) return;
    
    // Load broker profile
    supabase.from('profiles').select('*').eq('id', user.id).single().then(({ data }) => {
      if (data) {
        setBrokerProfile({
          fullName: data.full_name || '',
          phone: data.phone || '',
          agencyName: data.agency_name || '',
          reraNumber: data.rera_number || ''
        });
        setProfileLoaded(true);
      }
    });

    // If listing ID was passed, pre-load its data
    if (initialListingId) {
      supabase.from('listings').select('*, listing_photos(url)').eq('id', initialListingId).single().then(({ data }) => {
        if (data) {
          const desc = `${data.headline || ''}\n${data.ai_description || ''}\n${data.locality || ''}, ${data.city || ''}\n${data.price ? `₹${data.price}` : ''}`;
          setDescription(desc);
          
          if (data.listing_photos && data.listing_photos.length > 0) {
            // Ideally we'd convert these URLs to files or handle URL uploads, 
            // but for simplicity we'll just leave them for now and require upload, 
            // or fetch as blobs. 
            // Actually, for AI creation, we might need actual base64 files. Let's just set description for now.
          }
        }
      });
    }
  }, [user, initialListingId]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter(f => f.type.startsWith('image/') && f.size <= 10 * 1024 * 1024);
      setPhotos(prev => [...prev, ...newFiles].slice(0, 20)); // Max 20
      
      const newUrls = newFiles.map(f => URL.createObjectURL(f));
      setPhotoPreviewUrls(prev => [...prev, ...newUrls].slice(0, 20));
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Convert File to Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = error => reject(error);
    });
  };

  const handleGenerate = async () => {
    if (photos.length === 0 && !description.trim()) {
      toast.error('Please add photos or a description');
      return;
    }
    
    setIsGenerating(true);
    setGenerationStatus('Reading your property details...');
    
    try {
      const CLAUDE_KEY = import.meta.env.VITE_CLAUDE_API_KEY;
      if (!CLAUDE_KEY) throw new Error("Claude API key not found");

      // 1. Tag photos
      setGenerationStatus('Tagging your photos...');
      const taggedPhotos: PresentationPhoto[] = [];
      const uploadedUrls: string[] = [];
      
      // We need to upload photos to Supabase Storage first so they have public URLs
      for (let i = 0; i < photos.length; i++) {
        const file = photos[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user?.id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('listing-photos')
          .upload(filePath, file);
          
        if (uploadError) throw new Error('Failed to upload photos');
        
        const { data: { publicUrl } } = supabase.storage
          .from('listing-photos')
          .getPublicUrl(filePath);
          
        uploadedUrls.push(publicUrl);
        
        // AI Tagging (if Claude available, else basic fallback)
        let tag: PresentationPhoto['tag'] = 'other';
        if (i === 0) {
          tag = 'cover'; // First photo is always cover
        } else {
          try {
            const base64 = await fileToBase64(file);
            const response = await fetch('https://api.anthropic.com/v1/messages', {
              method: 'POST',
              headers: {
                'x-api-key': CLAUDE_KEY,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                model: 'claude-3-7-sonnet-latest',
                max_tokens: 100,
                messages: [{
                  role: 'user',
                  content: [
                    { type: 'image', source: { type: 'base64', media_type: file.type, data: base64 } },
                    { type: 'text', text: 'Tag this property photo with ONE word only. Choose from: cover, living, bedroom, kitchen, bathroom, balcony, exterior, amenity, floorplan, other. Return only the single word tag, nothing else.' }
                  ]
                }]
              })
            });
            const result = await response.json();
            const aiTag = result.content?.[0]?.text?.trim().toLowerCase();
            const validTags = ['cover', 'living', 'bedroom', 'kitchen', 'bathroom', 'balcony', 'exterior', 'amenity', 'floorplan', 'other'];
            if (validTags.includes(aiTag)) {
              tag = aiTag as PresentationPhoto['tag'];
            }
          } catch (e) {
            console.error('AI tagging failed, using fallback', e);
          }
        }
        
        taggedPhotos.push({ url: publicUrl, tag, orderIndex: i });
      }

      // 2. Generate Content
      setGenerationStatus('Crafting premium descriptions...');
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': CLAUDE_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'claude-3-7-sonnet-latest',
          max_tokens: 2000,
          system: "You are a luxury Indian real estate copywriter. You write compelling, premium property presentations for high-net-worth buyers. You understand Indian property terminology: carpet area, BHK, lakh, crore, possession, OC, RERA. Return only valid JSON. No markdown, no explanation, just raw JSON.",
          messages: [{
            role: 'user',
            content: `Generate complete presentation content for this Indian property. Return ONLY this JSON structure with no other text:
{
  "headline": "4-6 word compelling headline",
  "subheadline": "property type + key feature",
  "tagline": "one aspirational sentence",
  "description": "exactly 55-65 words, premium tone, no clichés, focus on lifestyle",
  "price": "formatted price",
  "priceNote": "Negotiable or On Request or empty string",
  "locality": "neighbourhood name",
  "city": "city name",
  "locationDisplay": "Neighbourhood, City",
  "propertyType": "Apartment/Villa/Office/Shop/Warehouse/Plot",
  "bhkConfig": "3 BHK or empty",
  "carpetArea": "1,850 sq ft or empty",
  "builtupArea": "2,200 sq ft or empty",
  "floorNumber": "14th Floor or empty",
  "totalFloors": "42 Floors or empty",
  "parking": "2 Covered or empty",
  "furnishing": "Fully Furnished / Semi-Furnished / Unfurnished or empty",
  "possession": "Ready Possession / Dec 2025 or empty",
  "facing": "Sea Facing / East Facing or empty",
  "age": "New Construction / 5 Years Old or empty",
  "bathrooms": "3 or empty",
  "highlights": ["exact 5 highlights, each max 10 words", "highlight 2", "highlight 3", "highlight 4", "highlight 5"],
  "amenities": ["up to 8 amenities", "Swimming Pool"],
  "nearby": ["up to 5 landmarks", "BKC: 10 min"],
  "brokerName": "from description or empty",
  "brokerPhone": "from description or empty",
  "brokerAgency": "from description or empty",
  "brokerRera": "from description or empty",
  "suggestedTheme": "penthouse/signature/estate/corporate/highstreet/logistics",
  "designRationale": "one sentence why you picked this theme"
}

Theme rules: penthouse (luxury apts), signature (standard apts), estate (villas/plots), corporate (offices), highstreet (retail), logistics (industrial).

Property description: "${description}"
Broker details if provided: "${JSON.stringify(brokerProfile)}"`
          }]
        })
      });

      const result = await response.json();
      const rawText = result.content?.[0]?.text || '{}';
      const cleanJson = rawText.replace(/```json|```/g, '').trim();
      const contentData = JSON.parse(cleanJson) as PresentationContent;
      
      // Override broker profile if provided manually
      if (brokerProfile.fullName) contentData.brokerName = brokerProfile.fullName;
      if (brokerProfile.phone) contentData.brokerPhone = brokerProfile.phone;
      if (brokerProfile.agencyName) contentData.brokerAgency = brokerProfile.agencyName;
      if (brokerProfile.reraNumber) contentData.brokerRera = brokerProfile.reraNumber;

      const finalTheme = theme === 'auto' ? (contentData.suggestedTheme || 'signature') : theme;

      // 3. Save to Supabase
      setGenerationStatus('Putting it all together...');
      const { data: newPresentation, error: insertError } = await supabase.from('presentations' as any)
        .insert({
          user_id: user?.id,
          listing_id: initialListingId || null,
          title: contentData.headline || 'Property Presentation',
          theme: finalTheme,
          format: format,
          content: contentData,
          photo_urls: taggedPhotos.map(p => p.url),
          photo_tags: taggedPhotos.map(p => p.tag),
          pages: ['cover','overview','highlights','gallery','specs','amenities','location','contact'],
          status: 'live'
        })
        .select()
        .single();

      if (insertError) throw insertError;

      toast.success('Presentation created successfully!');
      navigate(`/dashboard/presentations/${newPresentation.id}`);
      
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to generate presentation: ' + error.message);
      setIsGenerating(false);
    }
  };

  // Rendering logic for Theme Previews
  const renderThemePreview = (id: string, name: string, desc: string, previewContent: React.ReactNode) => {
    const isSelected = theme === id;
    return (
      <div key={id} className="mb-4">
        <div 
          onClick={() => setTheme(id as any)}
          className="w-full aspect-square rounded-[16px] overflow-hidden border-[2.5px] transition-all cursor-pointer relative bg-white"
          style={{ 
            borderColor: isSelected ? '#1A5C3A' : 'transparent',
            boxShadow: isSelected ? '0 0 0 4px #EAF3ED' : 'none'
          }}
        >
          {/* CSS Transform Scaling trick for 1080x1080 -> width of container */}
          <div style={{ width: '100%', paddingBottom: '100%', position: 'relative' }}>
            <div 
              style={{
                position: 'absolute', top: 0, left: 0, width: '1080px', height: '1080px',
                transform: 'scale(0.15)', // Approximate, will be relative
                transformOrigin: 'top left',
                pointerEvents: 'none'
              }}
              className="origin-top-left"
            >
              {previewContent}
            </div>
          </div>
        </div>
        <div className="mt-2 text-center md:text-left">
          <div className="font-sans text-[14px] font-bold text-[#111111]">{name}</div>
          <div className="font-sans text-[12px] text-[#888888]">{desc}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col pb-24">
      
      {/* Loading Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-md z-50 flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full border-[3px] border-[#EBEBEB] border-t-[#1A5C3A] animate-spin mb-6"></div>
          <p className="text-[16px] text-[#555555] font-medium min-w-[200px] text-center">{generationStatus}</p>
          <div className="w-[240px] h-1 bg-[#EBEBEB] mt-6 overflow-hidden">
            <div className="h-full bg-[#1A5C3A] animate-[progress_8s_ease-in-out_forwards]"></div>
          </div>
          <style>{`@keyframes progress { 0% { width: 0% } 100% { width: 90% } }`}</style>
        </div>
      )}

      {/* Step Indicator */}
      <div className="px-5 py-4 border-b border-[#EBEBEB] flex items-center justify-center gap-3 md:gap-6 bg-white sticky top-0 md:top-14 z-20">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold ${step >= 1 ? 'bg-[#1A5C3A] text-white' : 'border border-[#EBEBEB] text-[#555555]'}`}>
            {step > 1 ? <CheckCircle2 size={14} /> : '1'}
          </div>
          <span className={`text-[13px] font-medium ${step >= 1 ? 'text-[#111111]' : 'text-[#888888]'}`}>Style</span>
        </div>
        <div className={`h-[1px] w-8 md:w-16 ${step > 1 ? 'bg-[#1A5C3A]' : 'bg-[#EBEBEB]'}`}></div>
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold ${step >= 2 ? 'bg-[#1A5C3A] text-white' : 'border border-[#EBEBEB] text-[#555555]'}`}>
            2
          </div>
          <span className={`text-[13px] font-medium ${step >= 2 ? 'text-[#111111]' : 'text-[#888888]'}`}>Content</span>
        </div>
        <div className="h-[1px] w-8 md:w-16 bg-[#EBEBEB]"></div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full border border-[#EBEBEB] flex items-center justify-center text-[12px] font-bold text-[#555555]">
            3
          </div>
          <span className="text-[13px] font-medium text-[#888888] hidden sm:inline">Preview</span>
        </div>
      </div>

      <div className="flex-1 max-w-2xl mx-auto w-full">
        {step === 1 ? (
          /* STEP 1: CHOOSE STYLE */
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="p-5 md:pt-8 md:px-5 pb-4">
              <h1 className="font-display text-[24px] font-bold text-[#111111] mb-1">Choose Your Style</h1>
              <p className="text-[14px] text-[#888888]">AI will automatically pick the best style for your property — or choose manually below</p>
            </div>

            <div className="px-5 mb-6">
              <div className="text-[13px] font-semibold text-[#111111] mb-2.5">Page Format</div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setFormat('square')}
                  className={`flex-1 h-[52px] rounded-[10px] flex flex-col items-center justify-center transition-all ${format === 'square' ? 'bg-[#1A5C3A] text-white' : 'bg-white border border-[#EBEBEB] text-[#555555]'}`}
                >
                  <span className="text-[13px] font-semibold">Square (Mobile)</span>
                  <span className={`text-[11px] ${format === 'square' ? 'text-white/80' : 'text-[#888888]'}`}>Best for WhatsApp</span>
                </button>
                <button 
                  onClick={() => setFormat('landscape')}
                  className={`flex-1 h-[52px] rounded-[10px] flex flex-col items-center justify-center transition-all ${format === 'landscape' ? 'bg-[#1A5C3A] text-white' : 'bg-white border border-[#EBEBEB] text-[#555555]'}`}
                >
                  <span className="text-[13px] font-semibold">Landscape</span>
                  <span className={`text-[11px] ${format === 'landscape' ? 'text-white/80' : 'text-[#888888]'}`}>Best for Desktop</span>
                </button>
              </div>
            </div>

            <div className="px-5 grid grid-cols-2 gap-3 mb-12">
              {renderThemePreview('penthouse', 'Penthouse', 'Dark luxury · Gold accents', (
                <div className="w-full h-full bg-[#0A0A0A] relative flex flex-col justify-end">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,169,110,0.2)_0%,transparent_70%)]"></div>
                  <div className="absolute top-10 right-10 bg-[rgba(201,169,110,0.15)] border border-[rgba(201,169,110,0.3)] text-[#C9A96E] text-[18px] uppercase tracking-[0.3em] px-5 py-2">Exclusive</div>
                  <div className="bg-[rgba(10,10,10,0.7)] backdrop-blur-[20px] border-t-[4px] border-[#C9A96E] p-12 w-full relative z-10">
                    <div style={{ fontFamily: 'Playfair Display, serif' }} className="text-[#F0EDE8] text-[72px] leading-tight">Luxury Sea-View<br/>Penthouse</div>
                    <div style={{ fontFamily: 'Playfair Display, serif' }} className="text-[#C9A96E] text-[56px] mt-4 font-bold">₹8.5 Cr</div>
                    <div className="text-[#F0EDE8]/50 text-[24px] mt-2 font-sans tracking-tight">Worli, Mumbai</div>
                  </div>
                </div>
              ))}
              
              {renderThemePreview('signature', 'Signature', 'Clean white · Professional', (
                <div className="w-full h-full bg-[#FFFFFF] relative flex flex-col">
                  <div className="h-[55%] w-full bg-gradient-to-b from-[#E8F0EB] to-[#C5D9CB] relative">
                    <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute top-10 right-0 bg-[#1A5C3A] text-white text-[18px] uppercase tracking-[0.2em] px-6 py-2 rounded-l-2xl font-bold">Exclusive</div>
                  </div>
                  <div className="p-10 bg-white">
                     <div className="text-[#1A5C3A] text-[20px] uppercase font-bold tracking-widest mb-2">Bandra West, Mumbai</div>
                     <div className="text-[#111111] text-[64px] font-extrabold leading-tight">Premium 3 BHK<br/>Apartment</div>
                     <div className="text-[#1A5C3A] text-[56px] mt-4 font-bold">₹2.5 Cr</div>
                  </div>
                </div>
              ))}

              {renderThemePreview('estate', 'Estate', 'Warm earth · Timeless', (
                <div className="w-full h-full bg-[#F5F0E8] relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-[#C5D4B5] via-[#8FAD7A] to-[#F5F0E8] opacity-80"></div>
                  <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#3D3425]/90 to-transparent"></div>
                  <div className="absolute bottom-0 p-12 w-full">
                    <div className="text-[#6B8F71] text-[20px] uppercase tracking-widest font-bold mb-2">Lonavala, Pune</div>
                    <div className="text-white text-[64px] font-semibold leading-tight mb-4">Private Villa with<br/>Expansive Garden</div>
                    <div className="inline-block bg-[#6B8F71] text-white px-5 py-2 rounded-full text-[20px] font-medium mb-4">Premium Plot</div>
                    <div className="text-[#6B8F71] text-[48px] font-bold">₹1.8 Cr</div>
                  </div>
                </div>
              ))}

              {renderThemePreview('corporate', 'Corporate', 'Navy blue · Business grade', (
                <div className="w-full h-full bg-[#0F172A] relative flex items-end">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A5F] to-[#0F172A] opacity-25"></div>
                  <div className="absolute left-0 top-0 bottom-0 w-[6px] bg-[#3B82F6]"></div>
                  <div className="p-12 pl-16">
                    <div className="text-[#3B82F6] text-[20px] uppercase tracking-widest font-bold mb-3">Commercial Office</div>
                    <div className="text-[#F8FAFC] text-[68px] font-black uppercase leading-none mb-6">Grade A<br/>Office Space</div>
                    <div className="inline-block bg-[#3B82F6] text-white px-6 py-3 font-bold text-[32px] mb-4">₹45,000/mo</div>
                    <div className="text-[#F8FAFC]/70 border border-[#334155] px-4 py-2 inline-block text-[20px]">BKC, Mumbai</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="sticky bottom-16 md:bottom-0 left-0 right-0 bg-white border-t border-[#EBEBEB] p-4 flex items-center justify-between z-30 px-5 md:px-8 shadow-[0_-4px_16px_rgba(0,0,0,0.05)] mt-8 -mx-5 md:-mx-5">
              <button 
                onClick={() => { setTheme('auto'); setStep(2); }}
                className="text-[#1A5C3A] text-[13px] font-semibold hover:underline"
              >
                Let AI choose automatically
              </button>
              <button 
                onClick={() => setStep(2)}
                className="bg-[#1A5C3A] text-white text-[15px] font-semibold px-6 h-[46px] rounded-[12px] hover:bg-[#14482D] transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        ) : (
          /* STEP 2: ADD CONTENT */
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 p-5 pb-32">
            
            {/* Photos */}
            <div className="mb-8">
              <h2 className="font-display text-[16px] font-bold text-[#111111] mb-1">Property Photos</h2>
              <p className="text-[13px] text-[#888888] mb-4">First photo becomes the cover. Add up to 20.</p>
              
              <input type="file" multiple accept="image/jpeg,image/png" className="hidden" ref={fileInputRef} onChange={handlePhotoUpload} />
              
              {photos.length === 0 ? (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-[180px] rounded-[16px] border-2 border-dashed border-[#DDDDDD] bg-[#FAFAFA] hover:bg-[#F0F0F0] hover:border-[#CCCCCC] transition-colors flex flex-col items-center justify-center cursor-pointer"
                >
                  <ImageIcon size={28} className="text-[#BBBBBB] mb-2" />
                  <div className="text-[15px] font-medium text-[#888888]">Tap to upload photos</div>
                  <div className="text-[12px] text-[#BBBBBB] mt-1">JPG or PNG, up to 10MB each</div>
                </button>
              ) : (
                <>
                  <div className="flex overflow-x-auto gap-2.5 pb-2 -mx-5 px-5 hide-scrollbar">
                    {photoPreviewUrls.map((url, i) => (
                      <div key={i} className="relative w-[120px] h-[120px] shrink-0">
                        <img src={url} alt="" className="w-full h-full object-cover rounded-[12px]" />
                        {i === 0 && (
                          <div className="absolute top-0 left-0 bg-[#1A5C3A] text-white text-[9px] font-bold px-2 py-1 rounded-br-[8px]">
                            Cover
                          </div>
                        )}
                        <button 
                          onClick={() => removePhoto(i)}
                          className="absolute top-2 right-2 w-5 h-5 bg-white text-[#111111] rounded-full flex items-center justify-center hover:bg-gray-200"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-[120px] h-[120px] shrink-0 border-2 border-dashed border-[#DDDDDD] rounded-[12px] flex items-center justify-center hover:bg-[#FAFAFA]"
                    >
                      <Plus size={24} className="text-[#BBBBBB]" />
                    </button>
                  </div>
                  <div className="text-[#1A5C3A] text-[12px] mt-2 font-medium">✦ AI will tag each photo automatically</div>
                </>
              )}
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="font-display text-[16px] font-bold text-[#111111] mb-1">Describe Your Property</h2>
              <p className="text-[13px] text-[#888888] mb-4">Paste your WhatsApp message or type anything you know</p>
              
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Example — just type naturally:&#10;&#10;3BHK flat, 14th floor, Worli&#10;Sea view from living room and master bedroom&#10;1,850 sq ft carpet area&#10;Price ₹6.5 crore, little negotiable&#10;2 car parks, semi-furnished&#10;Ready possession, OC received&#10;Building: Lodha World Towers"
                className="w-full min-h-[220px] border border-[#E5E5E5] rounded-[14px] p-4 text-[15px] font-sans text-[#111111] leading-relaxed resize-y focus:outline-none focus:border-[#1A5C3A] focus:ring-1 focus:ring-[#1A5C3A]"
              ></textarea>
            </div>

            {/* Broker Details */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-[14px] font-semibold text-[#111111]">Your Details (for contact page)</h2>
                <button onClick={() => setIsEditProfile(!isEditProfile)} className="text-[13px] font-medium text-[#1A5C3A] hover:underline">
                  Edit
                </button>
              </div>
              
              {(!profileLoaded || isEditProfile || !brokerProfile.fullName) ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-8">
                  <input type="text" placeholder="Your Name" value={brokerProfile.fullName} onChange={e => setBrokerProfile({...brokerProfile, fullName: e.target.value})} className="h-11 border border-[#E5E5E5] rounded-[10px] px-3.5 text-[14px]" />
                  <input type="tel" placeholder="Phone Number" value={brokerProfile.phone} onChange={e => setBrokerProfile({...brokerProfile, phone: e.target.value})} className="h-11 border border-[#E5E5E5] rounded-[10px] px-3.5 text-[14px]" />
                  <input type="text" placeholder="Agency Name" value={brokerProfile.agencyName} onChange={e => setBrokerProfile({...brokerProfile, agencyName: e.target.value})} className="h-11 border border-[#E5E5E5] rounded-[10px] px-3.5 text-[14px]" />
                  <input type="text" placeholder="RERA Number" value={brokerProfile.reraNumber} onChange={e => setBrokerProfile({...brokerProfile, reraNumber: e.target.value})} className="h-11 border border-[#E5E5E5] rounded-[10px] px-3.5 text-[14px]" />
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 mb-8">
                  <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-full px-3 py-1.5 text-[12px] text-[#555555] font-medium">{brokerProfile.fullName}</div>
                  {brokerProfile.agencyName && <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-full px-3 py-1.5 text-[12px] text-[#555555] font-medium">{brokerProfile.agencyName}</div>}
                  {brokerProfile.phone && <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-full px-3 py-1.5 text-[12px] text-[#555555] font-medium">{brokerProfile.phone}</div>}
                </div>
              )}
            </div>

            {/* Bottom Sticky Action Bar */}
            <div className="sticky bottom-16 md:bottom-0 left-0 right-0 bg-white border-t border-[#EBEBEB] p-3 flex items-center justify-between px-5 md:px-8 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] z-30 mt-8 -mx-5 md:-mx-5">
              <button 
                onClick={() => setStep(1)}
                className="text-[#888888] text-[15px] font-medium h-[46px] px-4 -ml-4"
              >
                ← Back
              </button>
              <button 
                onClick={handleGenerate}
                disabled={photos.length === 0 && !description.trim()}
                className="bg-[#1A5C3A] text-white text-[15px] font-bold px-7 h-[50px] rounded-[12px] flex items-center gap-2 hover:bg-[#14482D] transition-colors disabled:opacity-50"
              >
                Generate with AI <Sparkles size={16} />
              </button>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}
