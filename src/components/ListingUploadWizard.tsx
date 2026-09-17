'use client';

import React, { useState } from 'react';
import {
  UploadCloud,
  ImagePlus,
  X,
  CheckCircle2,
  Building2,
  Sparkles,
  Link2,
  Trash2,
  Loader2,
} from 'lucide-react';

interface SimpleProperty {
  id: number;
  title: string;
  address: string;
  price: string;
  heroPhotoUrl: string;
  galleryPhotos: { url: string }[];
}

interface ListingUploadWizardProps {
  properties: SimpleProperty[];
  onAddListing: (payload: Record<string, unknown>) => Promise<boolean>;
}

interface PendingPhoto {
  url: string;
  label: string;
  isUpload?: boolean;
}

export default function ListingUploadWizard({
  properties,
  onAddListing,
}: ListingUploadWizardProps) {
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [cityState, setCityState] = useState('');
  const [price, setPrice] = useState('');
  const [beds, setBeds] = useState('5');
  const [baths, setBaths] = useState('5.5');
  const [sqft, setSqft] = useState('6000');
  const [sellerName, setSellerName] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');
  const [sellerEmail, setSellerEmail] = useState('');
  const [sellerMotivation, setSellerMotivation] = useState('');
  const [sellerBottomLine, setSellerBottomLine] = useState('');
  const [highlights, setHighlights] = useState('');
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const addUrlPhotos = () => {
    const lines = photoUrlInput
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    const newPhotos: PendingPhoto[] = lines.map((line) => {
      const [url, label] = line.split('|').map((s) => s?.trim() || '');
      return { url, label: label || '' };
    });
    setPhotos((prev) => [...prev, ...newPhotos]);
    setPhotoUrlInput('');
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .slice(0, 12 - photos.length)
      .forEach((file) => {
        if (file.size > 4_500_000) return; // keep DB payloads sane
        const reader = new FileReader();
        reader.onload = () => {
          setPhotos((prev) => [
            ...prev,
            { url: String(reader.result), label: '', isUpload: true },
          ]);
        };
        reader.readAsDataURL(file);
      });
  };

  const removePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const reset = () => {
    setTitle('');
    setAddress('');
    setCityState('');
    setPrice('');
    setSellerName('');
    setSellerPhone('');
    setSellerEmail('');
    setSellerMotivation('');
    setSellerBottomLine('');
    setHighlights('');
    setPhotos([]);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !address.trim() || !price.trim() || photos.length === 0) {
      return;
    }
    setIsSubmitting(true);
    const ok = await onAddListing({
      title,
      address,
      cityState,
      price,
      beds: Number(beds),
      baths,
      sqft: Number(sqft),
      sellerName,
      sellerPhone,
      sellerEmail,
      sellerMotivation,
      sellerBottomLine: sellerBottomLine || price,
      highlights: highlights
        .split('\n')
        .map((h) => h.trim())
        .filter(Boolean),
      photos: photos.map((p) => ({ url: p.url, label: p.label })),
    });
    setIsSubmitting(false);
    if (ok) {
      setSuccess(true);
      setTimeout(reset, 2200);
    }
  };

  const inputClass =
    'w-full bg-[#0A0D12] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#D4AF37] transition';
  const labelClass =
    'block text-[11px] font-mono-code uppercase tracking-wider text-slate-400 mb-1.5';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* LEFT: Upload form */}
      <form
        onSubmit={handleSubmit}
        className="lg:col-span-8 bg-[#121721] border border-white/10 rounded-2xl p-6 md:p-7 space-y-6"
      >
        <div className="flex items-center gap-2.5 border-b border-white/10 pb-4">
          <div className="w-9 h-9 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
            <UploadCloud className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="font-display text-xl font-bold text-white">
              Upload a listing you're working on
            </h3>
            <p className="text-xs text-slate-400">
              Add the property once — Cinema Studio and the marketing swarm take
              over autonomously.
            </p>
          </div>
        </div>

        {/* Property basics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={labelClass}>Listing Title *</label>
            <input
              className={inputClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Villa Serena // Coastal Modern Masterpiece"
              required
            />
          </div>
          <div>
            <label className={labelClass}>Street Address *</label>
            <input
              className={inputClass}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="1200 Cliffside Drive"
              required
            />
          </div>
          <div>
            <label className={labelClass}>City, State</label>
            <input
              className={inputClass}
              value={cityState}
              onChange={(e) => setCityState(e.target.value)}
              placeholder="Malibu, CA 90265"
            />
          </div>
          <div>
            <label className={labelClass}>List Price *</label>
            <input
              className={inputClass}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="$12,900,000"
              required
            />
          </div>
          <div>
            <label className={labelClass}>Confidential Seller Bottom Line</label>
            <input
              className={inputClass}
              value={sellerBottomLine}
              onChange={(e) => setSellerBottomLine(e.target.value)}
              placeholder="$11,750,000 (agent-only)"
            />
          </div>
          <div>
            <label className={labelClass}>Beds</label>
            <input
              className={inputClass}
              value={beds}
              onChange={(e) => setBeds(e.target.value)}
              type="number"
              min={1}
            />
          </div>
          <div>
            <label className={labelClass}>Baths</label>
            <input
              className={inputClass}
              value={baths}
              onChange={(e) => setBaths(e.target.value)}
              placeholder="5.5"
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Interior Sq Ft</label>
            <input
              className={inputClass}
              value={sqft}
              onChange={(e) => setSqft(e.target.value)}
              type="number"
              min={500}
            />
          </div>
        </div>

        {/* Seller intel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Seller Name</label>
            <input
              className={inputClass}
              value={sellerName}
              onChange={(e) => setSellerName(e.target.value)}
              placeholder="e.g. Daniel & Iris Whitmore"
            />
          </div>
          <div>
            <label className={labelClass}>Seller Phone</label>
            <input
              className={inputClass}
              value={sellerPhone}
              onChange={(e) => setSellerPhone(e.target.value)}
              placeholder="+1 (310) 555-0142"
            />
          </div>
          <div>
            <label className={labelClass}>Seller Email</label>
            <input
              className={inputClass}
              value={sellerEmail}
              onChange={(e) => setSellerEmail(e.target.value)}
              placeholder="seller@trust.com"
            />
          </div>
          <div>
            <label className={labelClass}>Seller Motivation (agent-only)</label>
            <input
              className={inputClass}
              value={sellerMotivation}
              onChange={(e) => setSellerMotivation(e.target.value)}
              placeholder="Relocating, 1031 deadline, etc."
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>
              Key Highlights (one per line, used in films & ads)
            </label>
            <textarea
              className={inputClass}
              rows={3}
              value={highlights}
              onChange={(e) => setHighlights(e.target.value)}
              placeholder={
                '270° ocean views\nTemperature-controlled wine room\n6-car gallery garage'
              }
            />
          </div>
        </div>

        {/* Photo uploads */}
        <div className="space-y-3">
          <label className={labelClass}>
            Property Photos * (upload files or paste image URLs — first photo is
            the hero)
          </label>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleFiles(e.dataTransfer.files);
            }}
            className={`rounded-xl border-2 border-dashed p-6 text-center transition ${
              dragOver
                ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                : 'border-white/15 bg-[#0A0D12] hover:border-white/30'
            }`}
          >
            <ImagePlus className="w-7 h-7 text-[#D4AF37] mx-auto mb-2" />
            <p className="text-xs text-slate-300">
              Drag & drop photos here, or{' '}
              <label className="text-[#D4AF37] font-semibold underline cursor-pointer">
                browse files
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                />
              </label>
            </p>
            <p className="text-[10px] text-slate-500 mt-1">
              JPG/PNG up to ~4.5MB each, max 12 photos
            </p>
          </div>

          <div className="flex items-start gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-1.5 text-[10px] font-mono-code text-slate-500 mb-1">
                <Link2 className="w-3 h-3" />
                Or paste URLs — one per line. Optional: add{' '}
                <code className="text-[#D4AF37]">| Room Name</code> after a URL
              </div>
              <textarea
                className={inputClass}
                rows={2}
                value={photoUrlInput}
                onChange={(e) => setPhotoUrlInput(e.target.value)}
                placeholder={
                  'https://images.unsplash.com/... | Infinity Pool\nhttps://images.unsplash.com/... | Chef Kitchen'
                }
              />
            </div>
            <button
              type="button"
              onClick={addUrlPhotos}
              className="mt-5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white cursor-pointer whitespace-nowrap"
            >
              Add URLs
            </button>
          </div>

          {photos.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
              {photos.map((photo, idx) => (
                <div
                  key={idx}
                  className="relative group aspect-[4/3] rounded-lg overflow-hidden border border-white/10"
                >
                  <img
                    src={photo.url}
                    alt={photo.label || `Photo ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-1 left-1 text-[9px] font-mono-code bg-black/80 text-[#D4AF37] px-1.5 py-0.5 rounded">
                    {idx === 0 ? 'HERO' : `#${idx + 1}`}
                  </span>
                  {photo.isUpload && (
                    <span className="absolute bottom-1 left-1 text-[8px] font-mono-code bg-emerald-500/90 text-[#0A0D12] px-1 rounded">
                      UPLOADED
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="absolute top-1 right-1 w-5 h-5 rounded bg-black/75 text-white opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting || success}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#0A0D12] font-bold text-sm flex items-center gap-2 shadow-lg shadow-[#D4AF37]/20 cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading listing...
              </>
            ) : success ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Listing live — studio & swarm ready
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Upload Listing & Arm the System
              </>
            )}
          </button>
          <button
            type="button"
            onClick={reset}
            className="px-4 py-3 rounded-xl bg-white/5 text-xs text-slate-300 hover:bg-white/10 cursor-pointer"
          >
            Clear form
          </button>
        </div>
      </form>

      {/* RIGHT: Active portfolio */}
      <div className="lg:col-span-4 space-y-4">
        <div className="bg-[#121721] border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-4 h-4 text-[#D4AF37]" />
            <h4 className="font-semibold text-sm text-white">
              Your active listings ({properties.length})
            </h4>
          </div>
          <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
            {properties.map((prop) => (
              <div
                key={prop.id}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-[#0A0D12] border border-white/10"
              >
                <img
                  src={prop.heroPhotoUrl}
                  alt={prop.title}
                  className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">
                    {prop.title}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {prop.address}
                  </p>
                  <p className="text-[11px] text-[#D4AF37] font-mono-code mt-0.5">
                    {prop.price} · {prop.galleryPhotos?.length || 0} photos
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#121721] to-[#1A1710] border border-[#D4AF37]/30 rounded-2xl p-5 space-y-2">
          <Trash2 className="hidden" />
          <h4 className="text-xs font-mono-code text-[#D4AF37] uppercase tracking-widest">
            What happens after upload
          </h4>
          <div className="text-[11px] text-slate-300 pb-2 border-b border-white/10 font-mono-code">
            Listing Broker: <span className="text-white font-semibold">Melissa Hatfield</span> (John L. Scott Real Estate)
          </div>
          <ol className="text-xs text-slate-300 space-y-2 leading-relaxed list-decimal list-inside">
            <li>Cinema Studio auto-cuts a graded 16:9 hero film + 9:16 reels.</li>
            <li>Marketing team builds the full campaign: ads, emails, social, PR.</li>
            <li>Scraper swarm finds & contacts matched cash buyers.</li>
            <li>On buyer contact, seller terms are pulled and the call transfers directly to Melissa (253-514-7676).</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
