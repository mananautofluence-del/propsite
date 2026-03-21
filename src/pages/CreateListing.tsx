import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Listing, PropertyCategory, AIQuestion, PROPERTY_CATEGORIES, AMENITIES, TEMPLATES, ACCENT_COLORS, ROOM_TAGS } from '@/lib/types';
import { calculateQualityScore, formatPrice, formatPricePreview } from '@/lib/mock-data';
import { Upload, X, Star, GripVertical, ChevronRight, ChevronLeft, Check, Copy, MessageCircle, ExternalLink, Plus, Sparkles, Image, Tag, Video, MapPin, CalendarDays, TrendingDown, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

const WIZARD_STEPS = ['Photos', 'Details', 'Template', 'Done'];

const AI_QUESTIONS: AIQuestion[] = [
  { field: 'transaction_type', question: 'Sale or rent?', options: [{ label: 'For Sale', value: 'sale' }, { label: 'For Rent', value: 'rent' }, { label: 'For Lease', value: 'lease' }] },
  { field: 'price_negotiable', question: 'Is the price negotiable?', options: [{ label: 'Yes', value: 'true' }, { label: 'No', value: 'false' }] },
  { field: 'furnishing_status', question: 'Is the flat furnished?', options: [{ label: 'Unfurnished', value: 'unfurnished' }, { label: 'Semi-Furnished', value: 'semi-furnished' }, { label: 'Fully Furnished', value: 'fully-furnished' }] },
  { field: 'possession_status', question: 'Ready to move in?', options: [{ label: 'Ready Possession', value: 'ready' }, { label: 'Under Construction', value: 'under-construction' }, { label: 'Nearing Possession', value: 'nearing' }] },
  { field: 'parking_car', question: 'Car parking available?', options: [{ label: 'None', value: '0' }, { label: '1 Slot', value: '1' }, { label: '2 Slots', value: '2' }, { label: '3+', value: '3' }] },
];

function generateSlug(headline: string): string {
  return headline.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.random().toString(36).slice(2, 6);
}

export default function CreateListingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname.includes('/dashboard');
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [photoTags, setPhotoTags] = useState<Record<number, string>>({});
  const [heroIndex, setHeroIndex] = useState(0);
  const [publishing, setPublishing] = useState(false);
  const [brokerNotes, setBrokerNotes] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiQuestions, setShowAiQuestions] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [missingQuestions, setMissingQuestions] = useState<AIQuestion[]>([]);
  const [listing, setListing] = useState<Partial<Listing>>({
    property_category: 'residential',
    amenities: [],
    ai_highlights: ['', '', '', '', ''],
    ai_neighbourhood_highlights: [],
    parking_car: 0,
    parking_two_wheeler: 0,
    balcony_count: 0,
    bathroom_count: 1,
    has_servant_room: false,
    has_study_room: false,
    has_pooja_room: false,
    has_store_room: false,
    show_broker_card: true,
    is_corner_unit: false,
    is_main_road_facing: false,
    has_three_phase_power: false,
    is_midc_plot: false,
    has_na_order: false,
    is_clear_title: true,
    lead_capture_enabled: false,
    template: 'blanc',
    accent_color: '#1A5C3A',
  });
  const [selectedTemplate, setSelectedTemplate] = useState('blanc');
  const [selectedAccent, setSelectedAccent] = useState('#1A5C3A');
  const [publishedSlug, setPublishedSlug] = useState('');
  const [expandedAddons, setExpandedAddons] = useState<Record<string, boolean>>({});
  const [urgencyEnabled, setUrgencyEnabled] = useState(false);
  const [expiryEnabled, setExpiryEnabled] = useState(false);

  const qualityScore = calculateQualityScore(listing, photoUrls.length);

  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files);
    setPhotoFiles(prev => [...prev, ...newFiles]);
    const newUrls = (newFiles || []).map(f => URL.createObjectURL(f));
    setPhotoUrls(prev => [...prev, ...newUrls]);
  };

  const removePhoto = (idx: number) => {
    setPhotoUrls(prev => prev.filter((_, i) => i !== idx));
    setPhotoFiles(prev => prev.filter((_, i) => i !== idx));
    if (heroIndex === idx) setHeroIndex(0);
    else if (heroIndex > idx) setHeroIndex(heroIndex - 1);
  };

  const simulateAI = async () => {
    setIsAiLoading(true);
    try {
      const apiKey = import.meta.env.VITE_CLAUDE_API_KEY;
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1024,
          messages: [{
            role: 'user',
            content: `You are an expert Indian real estate listing assistant. Extract property details from this broker message and return ONLY raw JSON, no explanation, no markdown, no code blocks.

Indian formats: 32L = 3200000, 3.2Cr = 32000000
Terms: carpet area, BHK, ready possession, OC received, RERA

Broker message: "${brokerNotes}"

Return ONLY this JSON (null for unknown):
{"headline":"compelling headline max 70 chars","property_type":"Apartment","transaction_type":"sale","price":null,"monthly_rent":null,"price_negotiable":null,"bhk_config":null,"carpet_area":null,"builtup_area":null,"floor_number":null,"total_floors":null,"property_age":null,"possession_status":null,"building_name":null,"locality":null,"city":null,"pincode":null,"facing_direction":null,"parking_car":0,"parking_two_wheeler":0,"furnishing_status":null,"balcony_count":0,"bathroom_count":1,"has_servant_room":false,"has_study_room":false,"has_pooja_room":false,"has_store_room":false,"amenities":[],"ai_description":"120-140 word premium description for affluent Indian buyers","ai_highlights":["h1","h2","h3","h4","h5"],"rera_number":null,"ai_neighbourhood_highlights":[],"missing_questions":[]}`
          }]
        })
      });
      if (!response.ok) {
        const errText = await response.text();
        throw new Error('Claude failed: ' + response.status + ' - ' + errText);
      }
      const data = await response.json();
      const text = data.content?.[0]?.text || '';
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const aiData = JSON.parse(cleaned);

      const safeData = {
        ...aiData,
        amenities: Array.isArray(aiData.amenities) ? aiData.amenities : [],
        ai_highlights: Array.isArray(aiData.ai_highlights) ? aiData.ai_highlights : ['', '', '', '', ''],
        ai_neighbourhood_highlights: Array.isArray(aiData.ai_neighbourhood_highlights) ? aiData.ai_neighbourhood_highlights : [],
        missing_questions: Array.isArray(aiData.missing_questions) ? aiData.missing_questions : [],
      };
      setListing(prev => ({ ...prev, ...safeData }));

      const missing = (aiData.missing_questions || [])
        .slice(0, 4)
        .map((q: any) => {
          const fallback = AI_QUESTIONS.find(fq => fq.field === q?.field);
          return fallback || q;
        })
        .filter((q: any) => q && typeof q.question === 'string' && Array.isArray(q.options) && q.options.length > 0);
      const fallbackQuestions = AI_QUESTIONS.filter(q => {
        const val = (aiData as any)[q.field];
        return val === null || val === undefined || val === '';
      }).slice(0, 4);

      const questions = missing.length > 0 ? missing : fallbackQuestions;

      setIsAiLoading(false);
      if (questions.length > 0) {
        setMissingQuestions(questions);
        setCurrentQ(0);
        setShowAiQuestions(true);
      } else {
        setStep(1);
      }
    } catch (err: any) {
      console.error('AI error:', err);
      toast.error(err.message || 'AI generation failed. Please try again.');
      setIsAiLoading(false);
    }
  };

  const answerQuestion = (field: string, value: string) => {
    const parsed = field === 'price_negotiable' ? value === 'true' : field === 'parking_car' ? parseInt(value) : value;
    setListing(prev => ({ ...prev, [field]: parsed }));
    setTimeout(() => {
      if (currentQ < missingQuestions.length - 1) {
        setCurrentQ(prev => prev + 1);
      } else {
        setShowAiQuestions(false);
        setStep(1);
      }
    }, 300);
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      // Upload photos to storage
      const uploadedPhotos: { url: string; storage_path: string; room_tag: string }[] = [];
      for (let i = 0; i < photoFiles.length; i++) {
        const file = photoFiles[i];
        const ext = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
        const userId = user?.id || 'temp';
        const filePath = `${userId}/${fileName}`;

        const { error: uploadErr } = await supabase.storage
          .from('listing-photos')
          .upload(filePath, file, { cacheControl: '3600', upsert: false });

        if (uploadErr) {
          console.error('Upload error:', uploadErr);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('listing-photos')
          .getPublicUrl(filePath);

        uploadedPhotos.push({
          url: publicUrl,
          storage_path: filePath,
          room_tag: photoTags[i] || 'general'
        });
      }

      // Generate slug
      const locality = (listing.locality || 'property').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const bhk = (listing.bhk_config || 'listing').toLowerCase().replace(/\s+/g, '-');
      const randomChars = Math.random().toString(36).substring(2, 6);
      const slug = `${locality}-${bhk}-${randomChars}`;

      // Build listing data (remove non-DB fields)
      const { photos: _p, ...listingForDb } = listing as any;
      delete listingForDb.missing_questions;

      const { data: saved, error: saveErr } = await supabase
        .from('listings')
        .insert({
          ...listingForDb,
          user_id: user?.id || null,
          temp_token: user ? null : `temp_${Date.now()}`,
          slug,
          status: 'live',
          listing_quality_score: qualityScore,
        })
        .select()
        .single();

      if (saveErr) throw saveErr;

      // Save photos
      if (uploadedPhotos.length > 0 && saved) {
        const photoRows = (uploadedPhotos || []).map((photo, index) => ({
          listing_id: saved.id,
          url: photo.url,
          storage_path: photo.storage_path,
          order_index: index,
          is_hero: index === heroIndex,
          room_tag: photo.room_tag,
        }));
        await supabase.from('listing_photos').insert(photoRows);
      }

      setPublishedSlug(slug);
      setStep(3);
      toast.success('Listing published!');
    } catch (err: any) {
      console.error('Publish error:', err);
      toast.error(err.message || 'Failed to publish listing');
    } finally {
      setPublishing(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setListing(prev => ({ ...prev, [field]: value }));
  };

  const toggleAddon = (key: string) => {
    setExpandedAddons(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const addHighlight = () => {
    const current = listing.ai_highlights || [];
    if (current.length < 8) {
      updateField('ai_highlights', [...current, '']);
    }
  };

  const removeHighlight = (idx: number) => {
    const current = listing.ai_highlights || [];
    if (current.length > 1) {
      updateField('ai_highlights', current.filter((_, i) => i !== idx));
    }
  };

  // AI Loading Screen
  if (isAiLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="w-3 h-3 rounded-full bg-primary animate-pulse-soft mx-auto mb-4" />
          <div className="font-display text-xl font-medium text-text-1 mb-2">Reading your notes...</div>
          <div className="text-xs text-text-3">AI is extracting property details</div>
        </div>
      </div>
    );
  }

  // AI Questions Screen
  if (showAiQuestions && missingQuestions.length > 0) {
    const q = missingQuestions[currentQ];
    return (
      <div className="min-h-screen bg-surface flex flex-col">
        <div className="flex items-center justify-center gap-2 pt-8 pb-4">
          {(missingQuestions || []).map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i <= currentQ ? 'bg-primary' : 'bg-border'}`} />
          ))}
        </div>
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-md text-center"
            style={{ animation: 'fade-up 0.4s cubic-bezier(0.16,1,0.3,1) forwards' }}
          >
            <h2 className="font-display text-2xl font-medium text-text-1 mb-8">{q?.question || 'One quick detail to continue'}</h2>
            <div className="space-y-3">
              {((q?.options) || []).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => answerQuestion(q.field, opt.value)}
                  className="w-full h-12 bg-surface border border-border rounded-lg text-sm font-medium text-text-1 hover:border-primary hover:bg-[hsl(var(--green-light))] active:scale-[0.97] transition-all"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {!isDashboard && <Navbar />}

      {/* Progress Bar */}
      <div className="h-0.5 bg-border">
        <div className="h-full bg-primary transition-all duration-500" style={{ width: `${((step + 1) / WIZARD_STEPS.length) * 100}%` }} />
      </div>

      {/* Step Indicators */}
      <div className="container py-4">
        <div className="flex items-center gap-2 text-2xs text-text-3">
          {(WIZARD_STEPS || []).map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className={i <= step ? 'text-primary font-medium' : ''}>{s}</span>
              {i < WIZARD_STEPS.length - 1 && <ChevronRight size={12} />}
            </div>
          ))}
        </div>
      </div>

      <div className="container pb-20">
        {/* STEP 0: Photos & Notes */}
        {step === 0 && (
          <div className="grid lg:grid-cols-[60%_40%] gap-6">
            <div>
              <h2 className="text-h3 text-text-1 mb-4">Add photos</h2>
              {photoUrls.length === 0 ? (
                <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary hover:bg-[hsl(var(--green-light))]/30 transition-colors">
                  <Upload size={24} className="text-text-3 mb-2" />
                  <span className="text-sm text-text-2">Tap to add photos</span>
                  <span className="text-2xs text-text-3 mt-1">JPG, PNG up to 10MB each</span>
                  <input type="file" multiple accept="image/*" onChange={handlePhotos} className="hidden" />
                </label>
              ) : (
                <div>
                  {/* FIX 7: Photo thumbnails — just the photo */}
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mb-3">
                    {(photoUrls || []).map((url, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-md overflow-hidden border border-border group">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        {i === heroIndex && (
                          <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-[9px] font-medium px-1.5 py-0.5 rounded">Hero</div>
                        )}
                        <div className="absolute top-1 right-1 flex gap-0.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setHeroIndex(i)} className="w-5 h-5 bg-surface rounded flex items-center justify-center">
                            <Star size={10} className={i === heroIndex ? 'text-primary fill-primary' : 'text-text-2'} />
                          </button>
                          <button onClick={() => removePhoto(i)} className="w-5 h-5 bg-surface rounded flex items-center justify-center">
                            <X size={10} className="text-destructive" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <label className="w-20 h-20 rounded-md border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                      <Plus size={20} className="text-text-3" />
                      <input type="file" multiple accept="image/*" onChange={handlePhotos} className="hidden" />
                    </label>
                  </div>
                </div>
              )}
            </div>
            <div>
              <h2 className="text-h3 text-text-1 mb-4">Describe the property</h2>
              <textarea
                value={brokerNotes}
                onChange={e => {
                  setBrokerNotes(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
                className="input-base w-full min-h-[120px] py-3"
                style={{ resize: 'vertical' }}
                placeholder="3BHK Worli 14th floor sea view ₹3.2cr 2 parking ready possession. Or paste your WhatsApp message."
              />
              <p className="text-2xs text-text-3 mt-1">Write in English, Hindi, or Hinglish</p>
            </div>
          </div>
        )}

        {/* STEP 1: Details */}
        {step === 1 && (
          <div className="space-y-6">
            {/* AI Banner */}
            <div className="bg-[hsl(var(--green-light))] border border-primary/20 rounded-lg px-4 py-3 flex items-center gap-2">
              <Sparkles size={16} className="text-primary" />
              <span className="text-xs font-medium text-primary">✦ AI filled 18 fields — review below</span>
            </div>

            {/* Quality Score */}
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="h-1 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${qualityScore}%` }} />
                </div>
              </div>
              <span className="text-xs font-medium text-text-1 shrink-0">Listing strength: {qualityScore}%</span>
              {qualityScore < 90 && <span className="text-2xs text-text-3 shrink-0 hidden sm:block">Add a floor plan to reach {Math.min(100, qualityScore + 15)}%</span>}
            </div>

            {/* FIX 8: Property Category — clear selection state */}
            <div>
              <div className="text-label text-text-3 mb-3">Property Category</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {(PROPERTY_CATEGORIES || []).map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => updateField('property_category', cat.value)}
                    className={`relative card-base p-3 text-center transition-all duration-150 ${
                      listing.property_category === cat.value
                        ? 'bg-[hsl(var(--green-light))] border-2 border-primary'
                        : 'hover:bg-surface-2 cursor-pointer'
                    }`}
                  >
                    {listing.property_category === cat.value && (
                      <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                        <Check size={10} className="text-primary-foreground" />
                      </div>
                    )}
                    <div className="text-xl mb-1">{cat.icon}</div>
                    <div className={`text-2xs font-medium ${listing.property_category === cat.value ? 'text-primary' : 'text-text-1'}`}>{cat.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Basic Details */}
            <FieldSection title="BASIC DETAILS">
              <FieldRow>
                <Field label="Headline" full>
                  <input value={listing.headline || ''} onChange={e => updateField('headline', e.target.value)} className="input-base w-full" />
                </Field>
              </FieldRow>
              <FieldRow>
                <Field label="Property Type" ai>
                  <input value={listing.property_type || ''} onChange={e => updateField('property_type', e.target.value)} className="input-base w-full" />
                </Field>
                <Field label="Transaction Type">
                  <div className="flex gap-2">
                    {(['sale', 'rent', 'lease'] || []).map(t => (
                      <button key={t} onClick={() => updateField('transaction_type', t)}
                        className={`flex-1 h-9 rounded-md text-xs font-medium transition-all ${listing.transaction_type === t ? 'bg-primary text-primary-foreground' : 'bg-surface border border-border text-text-2'}`}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </button>
                    ))}
                  </div>
                </Field>
              </FieldRow>
              <FieldRow>
                {/* FIX 11: Price with live formatted preview */}
                <Field label="Price" ai>
                  <input type="number" value={listing.price || ''} onChange={e => updateField('price', Number(e.target.value))} className="input-base w-full" />
                  {listing.price ? (
                    <div className="text-xs text-text-3 mt-1">{formatPricePreview(listing.price, listing.transaction_type)}</div>
                  ) : null}
                </Field>
                <Field label="Negotiable">
                  <div className="flex gap-2">
                    {([true, false] || []).map(v => (
                      <button key={String(v)} onClick={() => updateField('price_negotiable', v)}
                        className={`flex-1 h-9 rounded-md text-xs font-medium transition-all ${listing.price_negotiable === v ? 'bg-primary text-primary-foreground' : 'bg-surface border border-border text-text-2'}`}>
                        {v ? 'Yes' : 'No'}
                      </button>
                    ))}
                  </div>
                </Field>
              </FieldRow>
              {listing.transaction_type === 'rent' && (
                <FieldRow>
                  <Field label="Monthly Rent">
                    <input type="number" value={listing.monthly_rent || ''} onChange={e => updateField('monthly_rent', Number(e.target.value))} className="input-base w-full" />
                  </Field>
                  <Field label="Security Deposit">
                    <input type="number" value={listing.security_deposit || ''} onChange={e => updateField('security_deposit', Number(e.target.value))} className="input-base w-full" />
                  </Field>
                </FieldRow>
              )}
            </FieldSection>

            {/* Residential Fields */}
            {listing.property_category === 'residential' && (
              <FieldSection title="PROPERTY DETAILS">
                <FieldRow>
                  <Field label="BHK Config" ai><input value={listing.bhk_config || ''} onChange={e => updateField('bhk_config', e.target.value)} className="input-base w-full" /></Field>
                  <Field label="Carpet Area (sq ft)" ai><input type="number" value={listing.carpet_area || ''} onChange={e => updateField('carpet_area', Number(e.target.value))} className="input-base w-full" /></Field>
                </FieldRow>
                <FieldRow>
                  <Field label="Built-up Area" optional><input type="number" value={listing.builtup_area || ''} onChange={e => updateField('builtup_area', Number(e.target.value))} className="input-base w-full" /></Field>
                  <Field label="Super Built-up" optional><input type="number" value={listing.super_builtup_area || ''} onChange={e => updateField('super_builtup_area', Number(e.target.value))} className="input-base w-full" /></Field>
                </FieldRow>
                <FieldRow>
                  <Field label="Floor" ai><input type="number" value={listing.floor_number || ''} onChange={e => updateField('floor_number', Number(e.target.value))} className="input-base w-full" /></Field>
                  <Field label="Total Floors"><input type="number" value={listing.total_floors || ''} onChange={e => updateField('total_floors', Number(e.target.value))} className="input-base w-full" /></Field>
                </FieldRow>
                <FieldRow>
                  <Field label="Property Age" optional><input value={listing.property_age || ''} onChange={e => updateField('property_age', e.target.value)} className="input-base w-full" /></Field>
                  <Field label="Possession"><input value={listing.possession_status || ''} onChange={e => updateField('possession_status', e.target.value as any)} className="input-base w-full" /></Field>
                </FieldRow>
                <FieldRow>
                  <Field label="RERA Number" optional><input value={listing.rera_number || ''} onChange={e => updateField('rera_number', e.target.value)} className="input-base w-full" /></Field>
                  <Field label="Facing Direction" optional><input value={listing.facing_direction || ''} onChange={e => updateField('facing_direction', e.target.value)} className="input-base w-full" /></Field>
                </FieldRow>
              </FieldSection>
            )}

            {/* Commercial Office Fields */}
            {listing.property_category === 'commercial_office' && (
              <FieldSection title="OFFICE DETAILS">
                <FieldRow>
                  <Field label="Carpet Area (sq ft)"><input type="number" value={listing.carpet_area || ''} onChange={e => updateField('carpet_area', Number(e.target.value))} className="input-base w-full" /></Field>
                  <Field label="Workstation Capacity"><input type="number" value={listing.workstation_capacity || ''} onChange={e => updateField('workstation_capacity', Number(e.target.value))} className="input-base w-full" /></Field>
                </FieldRow>
                <FieldRow>
                  <Field label="Cabin Count"><input type="number" value={listing.cabin_count || ''} onChange={e => updateField('cabin_count', Number(e.target.value))} className="input-base w-full" /></Field>
                  <Field label="Meeting Rooms"><input type="number" value={listing.meeting_rooms || ''} onChange={e => updateField('meeting_rooms', Number(e.target.value))} className="input-base w-full" /></Field>
                </FieldRow>
                <FieldRow>
                  <Field label="Office Furnishing">
                    <select value={listing.office_furnishing || ''} onChange={e => updateField('office_furnishing', e.target.value)} className="input-base w-full">
                      <option value="">Select</option>
                      <option value="bare-shell">Bare Shell</option>
                      <option value="warm-shell">Warm Shell</option>
                      <option value="fully-furnished">Fully Furnished</option>
                    </select>
                  </Field>
                  <Field label="Building Grade">
                    <select value={listing.building_grade || ''} onChange={e => updateField('building_grade', e.target.value)} className="input-base w-full">
                      <option value="">Select</option>
                      <option value="A">Grade A</option>
                      <option value="B">Grade B</option>
                      <option value="C">Grade C</option>
                    </select>
                  </Field>
                </FieldRow>
                <FieldRow>
                  <Field label="Power Backup (KVA)"><input type="number" value={listing.power_backup_kva || ''} onChange={e => updateField('power_backup_kva', Number(e.target.value))} className="input-base w-full" /></Field>
                  <Field label="AC Type"><input value={listing.ac_type || ''} onChange={e => updateField('ac_type', e.target.value)} className="input-base w-full" /></Field>
                </FieldRow>
                <FieldRow>
                  <Field label="CAM Charges (₹/month)"><input type="number" value={listing.cam_charges || ''} onChange={e => updateField('cam_charges', Number(e.target.value))} className="input-base w-full" /></Field>
                  <Field label="Lock-in Period"><input value={listing.lock_in_period || ''} onChange={e => updateField('lock_in_period', e.target.value)} className="input-base w-full" /></Field>
                </FieldRow>
              </FieldSection>
            )}

            {/* Commercial Shop Fields */}
            {listing.property_category === 'commercial_shop' && (
              <FieldSection title="SHOP DETAILS">
                <FieldRow>
                  <Field label="Carpet Area (sq ft)"><input type="number" value={listing.carpet_area || ''} onChange={e => updateField('carpet_area', Number(e.target.value))} className="input-base w-full" /></Field>
                  <Field label="Frontage Width (ft)"><input type="number" value={listing.frontage_width || ''} onChange={e => updateField('frontage_width', Number(e.target.value))} className="input-base w-full" /></Field>
                </FieldRow>
                <FieldRow>
                  <Field label="Unit Height (ft)"><input type="number" value={listing.unit_height || ''} onChange={e => updateField('unit_height', Number(e.target.value))} className="input-base w-full" /></Field>
                  <Field label="Power Load (KW)"><input type="number" value={listing.power_load_kw || ''} onChange={e => updateField('power_load_kw', Number(e.target.value))} className="input-base w-full" /></Field>
                </FieldRow>
                <FieldRow>
                  <Field label="Complex/Mall Name"><input value={listing.building_name || ''} onChange={e => updateField('building_name', e.target.value)} className="input-base w-full" /></Field>
                  <Field label="Current Status">
                    <select value={listing.current_status || ''} onChange={e => updateField('current_status', e.target.value)} className="input-base w-full">
                      <option value="">Select</option>
                      <option value="vacant">Vacant</option>
                      <option value="tenanted">Tenanted</option>
                    </select>
                  </Field>
                </FieldRow>
                <div className="flex flex-wrap gap-4">
                  <ToggleField label="Corner Unit" checked={listing.is_corner_unit || false} onChange={v => updateField('is_corner_unit', v)} />
                  <ToggleField label="Main Road Facing" checked={listing.is_main_road_facing || false} onChange={v => updateField('is_main_road_facing', v)} />
                </div>
              </FieldSection>
            )}

            {/* Warehouse Fields */}
            {listing.property_category === 'warehouse' && (
              <FieldSection title="WAREHOUSE DETAILS">
                <FieldRow>
                  <Field label="Carpet Area (sq ft)"><input type="number" value={listing.carpet_area || ''} onChange={e => updateField('carpet_area', Number(e.target.value))} className="input-base w-full" /></Field>
                  <Field label="Warehouse Height (ft) *"><input type="number" value={listing.warehouse_height || ''} onChange={e => updateField('warehouse_height', Number(e.target.value))} className="input-base w-full" /></Field>
                </FieldRow>
                <FieldRow>
                  <Field label="Loading Bays"><input type="number" value={listing.loading_bays || ''} onChange={e => updateField('loading_bays', Number(e.target.value))} className="input-base w-full" /></Field>
                  <Field label="Floor Load (kg/sqm)"><input type="number" value={listing.floor_load_capacity || ''} onChange={e => updateField('floor_load_capacity', Number(e.target.value))} className="input-base w-full" /></Field>
                </FieldRow>
                <FieldRow>
                  <Field label="Zoning Type"><input value={listing.zoning_type || ''} onChange={e => updateField('zoning_type', e.target.value)} className="input-base w-full" /></Field>
                  <Field label="Road Width (ft)"><input type="number" value={listing.road_width || ''} onChange={e => updateField('road_width', Number(e.target.value))} className="input-base w-full" /></Field>
                </FieldRow>
                <div className="flex flex-wrap gap-4">
                  <ToggleField label="3-Phase Power" checked={listing.has_three_phase_power || false} onChange={v => updateField('has_three_phase_power', v)} />
                  <ToggleField label="MIDC Plot" checked={listing.is_midc_plot || false} onChange={v => updateField('is_midc_plot', v)} />
                </div>
              </FieldSection>
            )}

            {/* Plot Fields */}
            {listing.property_category === 'plot' && (
              <FieldSection title="PLOT DETAILS">
                <FieldRow>
                  <Field label="Plot Area"><input type="number" value={listing.plot_area || ''} onChange={e => updateField('plot_area', Number(e.target.value))} className="input-base w-full" /></Field>
                  <Field label="Dimensions"><input value={listing.plot_dimensions || ''} onChange={e => updateField('plot_dimensions', e.target.value)} className="input-base w-full" placeholder="e.g. 40x60 ft" /></Field>
                </FieldRow>
                <FieldRow>
                  <Field label="Shape">
                    <select value={listing.plot_shape || ''} onChange={e => updateField('plot_shape', e.target.value)} className="input-base w-full">
                      <option value="">Select</option>
                      <option value="regular">Regular</option>
                      <option value="irregular">Irregular</option>
                      <option value="corner">Corner</option>
                    </select>
                  </Field>
                  <Field label="Road Width (ft)"><input type="number" value={listing.road_width || ''} onChange={e => updateField('road_width', Number(e.target.value))} className="input-base w-full" /></Field>
                </FieldRow>
                <FieldRow>
                  <Field label="FSI Available" optional><input type="number" step="0.1" value={listing.fsi_available || ''} onChange={e => updateField('fsi_available', Number(e.target.value))} className="input-base w-full" /></Field>
                  <Field label="Survey Number" optional><input value={listing.survey_number || ''} onChange={e => updateField('survey_number', e.target.value)} className="input-base w-full" /></Field>
                </FieldRow>
                <div className="flex flex-wrap gap-4">
                  <ToggleField label="NA Order" checked={listing.has_na_order || false} onChange={v => updateField('has_na_order', v)} />
                  <ToggleField label="Clear Title" checked={listing.is_clear_title || false} onChange={v => updateField('is_clear_title', v)} />
                </div>
              </FieldSection>
            )}

            {/* Location */}
            <FieldSection title="LOCATION">
              <FieldRow>
                <Field label="Building Name" ai><input value={listing.building_name || ''} onChange={e => updateField('building_name', e.target.value)} className="input-base w-full" /></Field>
                <Field label="Locality" ai><input value={listing.locality || ''} onChange={e => updateField('locality', e.target.value)} className="input-base w-full" /></Field>
              </FieldRow>
              <FieldRow>
                <Field label="City" ai><input value={listing.city || ''} onChange={e => updateField('city', e.target.value)} className="input-base w-full" /></Field>
                <Field label="PIN Code"><input value={listing.pincode || ''} onChange={e => updateField('pincode', e.target.value)} className="input-base w-full" /></Field>
              </FieldRow>
              <FieldRow>
                <Field label="Google Maps URL" optional full><input value={listing.google_maps_url || ''} onChange={e => updateField('google_maps_url', e.target.value)} className="input-base w-full" placeholder="https://maps.google.com/..." /></Field>
              </FieldRow>
            </FieldSection>

            {/* Rooms (residential only) */}
            {listing.property_category === 'residential' && (
              <FieldSection title="ROOMS & PARKING">
                <FieldRow>
                  <Field label="Car Parking"><input type="number" value={listing.parking_car || 0} onChange={e => updateField('parking_car', Number(e.target.value))} className="input-base w-full" /></Field>
                  <Field label="2-Wheeler Parking"><input type="number" value={listing.parking_two_wheeler || 0} onChange={e => updateField('parking_two_wheeler', Number(e.target.value))} className="input-base w-full" /></Field>
                </FieldRow>
                <FieldRow>
                  <Field label="Furnishing">
                    <select value={listing.furnishing_status || ''} onChange={e => updateField('furnishing_status', e.target.value)} className="input-base w-full">
                      <option value="">Select</option>
                      <option value="unfurnished">Unfurnished</option>
                      <option value="semi-furnished">Semi-Furnished</option>
                      <option value="fully-furnished">Fully Furnished</option>
                    </select>
                  </Field>
                  <Field label="Balconies" optional><input type="number" value={listing.balcony_count || 0} onChange={e => updateField('balcony_count', Number(e.target.value))} className="input-base w-full" /></Field>
                </FieldRow>
                <FieldRow>
                  <Field label="Bathrooms"><input type="number" value={listing.bathroom_count || 1} onChange={e => updateField('bathroom_count', Number(e.target.value))} className="input-base w-full" /></Field>
                </FieldRow>
                <div className="flex flex-wrap gap-4">
                  <ToggleField label="Servant Room" checked={listing.has_servant_room || false} onChange={v => updateField('has_servant_room', v)} />
                  <ToggleField label="Study Room" checked={listing.has_study_room || false} onChange={v => updateField('has_study_room', v)} />
                  <ToggleField label="Pooja Room" checked={listing.has_pooja_room || false} onChange={v => updateField('has_pooja_room', v)} />
                  <ToggleField label="Store Room" checked={listing.has_store_room || false} onChange={v => updateField('has_store_room', v)} />
                </div>
              </FieldSection>
            )}

            {/* Amenities */}
            <FieldSection title="AMENITIES">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {(AMENITIES || []).map(a => (
                  <label key={a} className="flex items-center gap-2 text-xs text-text-2 cursor-pointer h-8">
                    <input
                      type="checkbox"
                      checked={listing.amenities?.includes(a) || false}
                      onChange={e => {
                        const current = listing.amenities || [];
                        updateField('amenities', e.target.checked ? [...current, a] : current.filter(x => x !== a));
                      }}
                      className="accent-[hsl(var(--primary))]"
                    />
                    {a}
                  </label>
                ))}
              </div>
            </FieldSection>

            {/* FIX 9: AI Content — expandable description textarea */}
            <FieldSection title="AI CONTENT" highlight>
              <Field label="Description" ai full>
                <textarea
                  value={listing.ai_description || ''}
                  onChange={e => updateField('ai_description', e.target.value)}
                  className="input-base w-full min-h-[120px] resize-y py-3 leading-relaxed"
                  style={{ height: 'auto', overflow: 'auto' }}
                />
                <button className="text-xs text-primary mt-1 hover:underline flex items-center gap-1"><Sparkles size={12} /> Regenerate</button>
              </Field>
              {/* FIX 10: Highlights — add and remove */}
              <div>
                <div className="text-label text-text-3 mb-2">Highlights</div>
                <div className="space-y-2">
                  {(listing.ai_highlights || []).map((h, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <GripVertical size={14} className="text-text-3 shrink-0 hidden md:block" />
                      <input
                        value={h}
                        onChange={e => {
                          const hl = [...(listing.ai_highlights || [])];
                          hl[i] = e.target.value;
                          updateField('ai_highlights', hl);
                        }}
                        className="input-base flex-1 h-11"
                        placeholder={`Highlight ${i + 1}`}
                      />
                      <button
                        onClick={() => removeHighlight(i)}
                        className="w-11 h-11 shrink-0 flex items-center justify-center text-text-3 hover:text-destructive transition-colors"
                        disabled={(listing.ai_highlights || []).length <= 1}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                {(listing.ai_highlights || []).length < 8 && (
                  <button
                    onClick={addHighlight}
                    className="w-full h-9 mt-2 bg-surface-2 border border-dashed border-border-mid rounded-md text-[13px] text-text-2 hover:bg-[hsl(var(--green-light))] transition-colors flex items-center justify-center gap-1"
                  >
                    <Plus size={14} /> Add highlight
                  </button>
                )}
              </div>
            </FieldSection>

            {/* Add-on Cards */}
            <FieldSection title="ENRICH YOUR LISTING">
              <p className="text-2xs text-text-3 -mt-2 mb-3">Optional — each addition increases client engagement</p>
              
              <AddonCard icon={<Image size={14} />} label="Add floor plan image" expanded={expandedAddons['floor_plan']} onToggle={() => toggleAddon('floor_plan')}>
                <div className="flex items-center gap-2">
                  <input value={listing.floor_plan_url || ''} onChange={e => updateField('floor_plan_url', e.target.value)} className="input-base flex-1" placeholder="Upload or paste URL" />
                  <label className="btn-secondary text-2xs h-8 px-3 cursor-pointer inline-flex items-center">
                    Upload <input type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) updateField('floor_plan_url', URL.createObjectURL(e.target.files[0])); }} />
                  </label>
                </div>
              </AddonCard>

              <AddonCard icon={<Tag size={14} />} label="Tag photos by room" expanded={expandedAddons['photo_tags']} onToggle={() => toggleAddon('photo_tags')}>
                {photoUrls.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(photoUrls || []).map((url, i) => (
                      <div key={i} className="flex flex-col gap-1">
                        <img src={url} alt="" className="w-full h-16 rounded object-cover" />
                        <select value={photoTags[i] || 'general'} onChange={e => setPhotoTags(prev => ({ ...prev, [i]: e.target.value }))} className="input-base text-2xs h-7">
                          <option value="general">General</option>
                          {(ROOM_TAGS || []).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-xs text-text-3">Add photos first</p>}
              </AddonCard>

              <AddonCard icon={<Video size={14} />} label="Add virtual tour/video" expanded={expandedAddons['virtual_tour']} onToggle={() => toggleAddon('virtual_tour')}>
                <input value={listing.virtual_tour_url || ''} onChange={e => updateField('virtual_tour_url', e.target.value)} className="input-base w-full" placeholder="YouTube, Matterport, or video URL" />
              </AddonCard>

              <AddonCard icon={<MapPin size={14} />} label="Neighbourhood highlights" expanded={expandedAddons['neighbourhood']} onToggle={() => toggleAddon('neighbourhood')}>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {(listing.ai_neighbourhood_highlights || []).map((h, i) => (
                    <div key={i} className="flex items-center gap-1 bg-surface-2 rounded px-2 py-1 text-xs text-text-1">
                      {h}
                      <button onClick={() => updateField('ai_neighbourhood_highlights', (listing.ai_neighbourhood_highlights || []).filter((_, j) => j !== i))} className="text-text-3 hover:text-destructive"><X size={10} /></button>
                    </div>
                  ))}
                </div>
                {(listing.ai_neighbourhood_highlights || []).length < 6 && (
                  <input
                    className="input-base w-full"
                    placeholder="Add a highlight and press Enter"
                    onKeyDown={e => {
                      if (e.key === 'Enter' && (e.target as HTMLInputElement).value) {
                        updateField('ai_neighbourhood_highlights', [...(listing.ai_neighbourhood_highlights || []), (e.target as HTMLInputElement).value]);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                )}
              </AddonCard>

              <AddonCard icon={<CalendarDays size={14} />} label="Add open house timing" expanded={expandedAddons['open_house']} onToggle={() => toggleAddon('open_house')}>
                <FieldRow>
                  <Field label="Date"><input type="date" value={listing.open_house_date || ''} onChange={e => updateField('open_house_date', e.target.value)} className="input-base w-full" /></Field>
                  <Field label="Time">
                    <div className="flex gap-1.5">
                      <input value={listing.open_house_time_start || ''} onChange={e => updateField('open_house_time_start', e.target.value)} className="input-base flex-1" placeholder="10:00 AM" />
                      <span className="text-xs text-text-3 self-center">to</span>
                      <input value={listing.open_house_time_end || ''} onChange={e => updateField('open_house_time_end', e.target.value)} className="input-base flex-1" placeholder="1:00 PM" />
                    </div>
                  </Field>
                </FieldRow>
              </AddonCard>

              <AddonCard icon={<TrendingDown size={14} />} label="Price history note" expanded={expandedAddons['price_history']} onToggle={() => toggleAddon('price_history')}>
                <input value={listing.price_history_note || ''} onChange={e => updateField('price_history_note', e.target.value)} className="input-base w-full" placeholder="e.g. Reduced from ₹3.5 Cr" maxLength={60} />
              </AddonCard>

              <AddonCard icon={<FileText size={14} />} label="Broker's personal note" expanded={expandedAddons['broker_note']} onToggle={() => toggleAddon('broker_note')}>
                <textarea value={listing.broker_personal_note || ''} onChange={e => updateField('broker_personal_note', e.target.value)} className="input-base w-full h-16 resize-none py-2" placeholder="Your personal recommendation..." maxLength={150} />
              </AddonCard>
            </FieldSection>

            {/* FIX 14: Listing Settings — clean toggle rows */}
            <FieldSection title="LISTING SETTINGS">
              <div className="py-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <ToggleField label="Urgency badge" checked={urgencyEnabled} onChange={v => { setUrgencyEnabled(v); if (!v) updateField('urgency_badge', ''); }} />
                  <span className="text-[10px] text-text-3">Optional</span>
                </div>
                {urgencyEnabled && (
                  <div className="mt-2">
                    <input
                      value={listing.urgency_badge || ''}
                      onChange={e => updateField('urgency_badge', e.target.value)}
                      className="input-base w-full"
                      placeholder="e.g. Only 2 units left · Price just reduced"
                    />
                    {listing.urgency_badge && (
                      <div className="mt-2">
                        <span className="inline-flex items-center bg-[hsl(var(--amber-light))] text-[hsl(var(--amber))] text-[11px] font-medium px-2 py-0.5 rounded">
                          ⚡ {listing.urgency_badge}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="py-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <ToggleField label="Link expires on" checked={expiryEnabled} onChange={v => { setExpiryEnabled(v); if (!v) updateField('expiry_date', ''); }} />
                  <span className="text-[10px] text-text-3">Optional</span>
                </div>
                {expiryEnabled && (
                  <div className="mt-2">
                    <input type="date" value={listing.expiry_date || ''} onChange={e => updateField('expiry_date', e.target.value)} className="input-base w-full" />
                    <p className="text-[11px] text-text-3 mt-1">Clients see a graceful page with your contact after this date.</p>
                  </div>
                )}
              </div>
            </FieldSection>

            {/* Broker Details */}
            <FieldSection title="BROKER DETAILS">
              <FieldRow>
                <Field label="Name"><input value={listing.broker_name || ''} onChange={e => updateField('broker_name', e.target.value)} className="input-base w-full" /></Field>
                <Field label="Phone"><input value={listing.broker_phone || ''} onChange={e => updateField('broker_phone', e.target.value)} className="input-base w-full" /></Field>
              </FieldRow>
              <FieldRow>
                <Field label="WhatsApp"><input value={listing.broker_whatsapp || ''} onChange={e => updateField('broker_whatsapp', e.target.value)} className="input-base w-full" /></Field>
                <Field label="Agency"><input value={listing.broker_agency || ''} onChange={e => updateField('broker_agency', e.target.value)} className="input-base w-full" /></Field>
              </FieldRow>
              <ToggleField label="Show broker card on listing" checked={listing.show_broker_card ?? true} onChange={v => updateField('show_broker_card', v)} />
            </FieldSection>
          </div>
        )}

        {/* STEP 2: Template */}
        {step === 2 && (
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-h3 text-text-1 mb-4">Choose a template</h2>
            <div className="grid grid-cols-5 gap-3">
              {(TEMPLATES || []).map(t => (
                <button key={t.id} onClick={() => { setSelectedTemplate(t.id); updateField('template', t.id); }}
                  className={`card-base p-3 text-center transition-all ${selectedTemplate === t.id ? 'border-2 border-primary' : ''}`}>
                  <div className="w-full h-24 bg-surface-2 rounded-md mb-2" />
                  <div className="text-xs font-medium text-text-1">{t.name}</div>
                  <div className="text-2xs text-text-3">{t.desc}</div>
                </button>
              ))}
            </div>

            <div>
              <div className="text-label text-text-3 mb-3">Accent Colour</div>
              <div className="flex gap-2">
                {(ACCENT_COLORS || []).map(c => (
                  <button key={c} onClick={() => { setSelectedAccent(c); updateField('accent_color', c); }}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${selectedAccent === c ? 'border-text-1 scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>

            <ToggleField label="Enable lead capture (Pro only)" checked={listing.lead_capture_enabled || false} onChange={v => updateField('lead_capture_enabled', v)} />
          </div>
        )}

        {/* STEP 3: Published */}
        {step === 3 && (
          <div className="max-w-md mx-auto text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[hsl(var(--green-light))] flex items-center justify-center">
              <Check size={32} className="text-primary" />
            </div>
            <h2 className="font-display text-[28px] font-medium text-text-1 mb-2">Listing published!</h2>
            <p className="text-sm text-text-2 mb-6">Your property page is live and ready to share</p>

            <div className="flex items-center gap-2 mb-6">
              <input readOnly value={`propsite.app/l/${publishedSlug}`} className="input-base flex-1 text-xs text-center" />
              <button className="btn-primary h-9 px-3 flex items-center gap-1"><Copy size={14} /> Copy</button>
            </div>

            <div className="flex flex-wrap justify-center gap-2 mb-8">
              <button className="btn-primary flex items-center gap-1.5"><MessageCircle size={14} /> Share on WhatsApp</button>
              <button className="btn-secondary flex items-center gap-1.5"><Copy size={14} /> Copy Link</button>
              <button onClick={() => navigate(`/l/${publishedSlug}`)} className="btn-ghost flex items-center gap-1.5"><ExternalLink size={14} /> View Listing</button>
            </div>

            {!isDashboard && (
              <div className="card-base bg-[hsl(var(--green-light))] border-primary/20 p-4 text-left">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-medium text-text-1 mb-1">Save this listing permanently</div>
                    <p className="text-xs text-text-2">Create a free account to get analytics, manage listings, and never lose your work.</p>
                    <button onClick={() => navigate('/signup')} className="btn-primary mt-3 text-xs">Create free account →</button>
                  </div>
                  <button className="text-text-3 hover:text-text-1"><X size={16} /></button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        {step < 3 && (
          <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border px-4 py-3 flex items-center justify-between safe-bottom z-40 md:static md:mt-6 md:border-0 md:bg-transparent md:px-0 md:py-0">
            {step > 0 ? (
              <button onClick={() => setStep(step - 1)} className="btn-ghost flex items-center gap-1"><ChevronLeft size={14} /> Back</button>
            ) : <div />}
            {step === 0 && (
              <button onClick={simulateAI} className="btn-primary flex items-center gap-1" disabled={photoUrls.length === 0 && !brokerNotes}>
                <Sparkles size={14} /> Continue with AI
              </button>
            )}
            {step === 1 && (
              <button onClick={() => setStep(2)} className="btn-primary flex items-center gap-1">
                Choose Template <ChevronRight size={14} />
              </button>
            )}
            {step === 2 && (
              <button onClick={handlePublish} disabled={publishing} className="btn-primary flex items-center gap-1">
                {publishing ? 'Publishing...' : 'Publish Listing'} {!publishing && <Check size={14} />}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper Components
function FieldSection({ title, children, highlight }: { title: string; children: React.ReactNode; highlight?: boolean }) {
  return (
    <div className={`${highlight ? 'bg-[hsl(var(--green-light))]/50 -mx-4 px-4 py-5 rounded-lg' : ''}`}>
      <div className="text-label text-text-3 mb-4">{title}</div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{children}</div>;
}

// FIX 12: Field with optional label support
function Field({ label, children, ai, full, optional }: { label: string; children: React.ReactNode; ai?: boolean; full?: boolean; optional?: boolean }) {
  return (
    <div className={full ? 'md:col-span-2' : ''}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <label className="text-label text-text-3">{label}</label>
          {optional && <span className="text-[10px] text-text-3 normal-case tracking-normal">Optional</span>}
        </div>
        {ai && <span className="text-2xs text-primary bg-[hsl(var(--green-light))] px-1.5 py-0.5 rounded">✦ AI</span>}
      </div>
      {children}
    </div>
  );
}

function ToggleField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <div
        className={`w-9 h-5 rounded-full transition-colors relative ${checked ? 'bg-primary' : 'bg-border-mid'}`}
        onClick={() => onChange(!checked)}
      >
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-surface shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </div>
      <span className="text-xs text-text-2">{label}</span>
    </label>
  );
}

function AddonCard({ icon, label, expanded, onToggle, children }: { icon: React.ReactNode; label: string; expanded?: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button onClick={onToggle} className="w-full h-11 px-3 flex items-center gap-2.5 hover:bg-surface-2/50 transition-colors">
        <span className="text-primary">{icon}</span>
        <span className="text-[13px] font-medium text-text-1 flex-1 text-left">{label}</span>
        <span className="text-2xs text-text-3">Optional</span>
        <ChevronRight size={14} className={`text-text-3 transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </button>
      {expanded && (
        <div className="px-3 pb-3 pt-1 bg-background border-t border-border">
          {children}
        </div>
      )}
    </div>
  );
}
