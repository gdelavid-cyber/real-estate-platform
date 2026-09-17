'use client';

import React, { useState } from 'react';
import {
  Phone,
  Heart,
  BedDouble,
  Bath,
  Maximize,
  MapPin,
  Search,
  Send,
  Shield,
  Film,
  Megaphone,
  Radar,
  Sparkles,
  Building2,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

interface LandingProperty {
  id: number;
  title: string;
  address: string;
  cityState: string;
  price: string;
  beds: number;
  baths: string;
  sqft: number;
  heroPhotoUrl: string;
}

interface LandingPageProps {
  properties: LandingProperty[];
  onRegister: () => void;
  onBookCall: () => void;
  onEnterWorkspace: () => void;
  hasAccess: boolean;
  showToast: (msg: string) => void;
}

const STATS = [
  { value: '2.4k', label: 'Listings Marketed' },
  { value: '98%', label: 'Client Satisfaction' },
  { value: '$4.2B', label: 'Volume Facilitated' },
];

const ABOUT_CARDS = [
  {
    icon: Film,
    title: 'Cinematic Films',
    body: 'Turn still photos into graded 16:9 and 9:16 tours with autonomous camera blocking and narration.',
  },
  {
    icon: Megaphone,
    title: 'AI Marketing Team',
    body: 'A six-specialist luxury campaign engine that writes ads, email, social, and PR on its own.',
  },
  {
    icon: Radar,
    title: 'Buyer Swarm',
    body: 'Continuously scrapes high-net-worth buyers, scores intent, and bridges warm calls to you.',
  },
];

const STEPS = [
  {
    n: '01',
    icon: Building2,
    title: 'Upload Your Listing',
    body: 'Add photos, seller intel, and pricing once. The system arms every channel instantly.',
  },
  {
    n: '02',
    icon: Film,
    title: 'Cinema Auto-Cut',
    body: 'AI Director grades frames, assigns motion, writes voiceover, and renders 4K films.',
  },
  {
    n: '03',
    icon: Megaphone,
    title: 'Promote Autonomously',
    body: 'Marketing team + scraper swarm launch email, reels, ads, and whisper networks.',
  },
  {
    n: '04',
    icon: Phone,
    title: 'Close the Call',
    body: 'When a buyer replies, seller terms are pulled and the live call transfers to you.',
  },
];

export default function LandingPage({
  properties,
  onRegister,
  onBookCall,
  onEnterWorkspace,
  hasAccess,
  showToast,
}: LandingPageProps) {
  const [location, setLocation] = useState('');
  const [type, setType] = useState('Any Type');
  const [price, setPrice] = useState('Any Price');
  const [wishlist, setWishlist] = useState<Record<number, boolean>>({});
  const [lead, setLead] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const featured = (properties.length ? properties : []).slice(0, 6);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(
      `Searching ${type} in ${location || 'all markets'} · ${price}`
    );
  };

  const handleLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead.name.trim() || !lead.email.trim()) {
      showToast('Please add your name and email.');
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    setSubmitting(false);
    setLead({ name: '', email: '', phone: '', message: '' });
    showToast('Request received — we will be in touch shortly.');
  };

  const inputClass =
    'w-full bg-transparent border-0 border-b border-[rgba(139,125,107,0.25)] px-0 py-3 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#D4AF37] transition placeholder:text-neutral-400';

  return (
    <>
      {/* ==================== HERO — 2 COLUMN ==================== */}
      <section id="overview" className="pt-28 pb-24 px-6 md:px-12 bg-[#FDFCF9]">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[rgba(139,125,107,0.25)] shadow-xs mb-5">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
              <span className="text-[10px] uppercase tracking-[0.16em] text-[#1A1A1A] font-semibold">
                Melissa Hatfield · REALTOR® / Broker · John L. Scott Real Estate
              </span>
            </div>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[1.02] tracking-[-0.04em] text-[#1A1A1A]">
              Your personal{' '}
              <span className="italic font-medium text-neutral-400">
                real estate
              </span>{' '}
              intelligence.
            </h1>
            <p className="mt-6 text-lg text-neutral-600 leading-relaxed max-w-lg">
              Represented by Melissa Hatfield at John L. Scott Real Estate. Upload a listing once —
              an autonomous cinema studio, marketing salesforce, and buyer swarm promote your property,
              find qualified buyers, and transfer them live to Melissa with seller terms already pulled.
            </p>

            {/* Direct Broker Contact Bar */}
            <div className="mt-6 p-4 rounded-xl bg-white border border-[rgba(139,125,107,0.2)] flex flex-wrap items-center gap-4 text-xs text-[#1A1A1A]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-semibold">Direct Mobile:</span>
                <a href="tel:2535147676" className="font-bold text-[#1A1A1A] hover:text-[#D4AF37] underline">
                  (253) 514-7676
                </a>
              </div>
              <div className="text-neutral-300 hidden sm:inline">|</div>
              <div>
                <span className="text-neutral-500">Office:</span>{' '}
                <a href="tel:2538417000" className="text-[#1A1A1A] hover:text-[#D4AF37]">
                  (253) 841-7000
                </a>
              </div>
              <div className="text-neutral-300 hidden sm:inline">|</div>
              <div>
                <a href="mailto:melissafh@johnlscott.com" className="text-[#D4AF37] hover:underline font-medium">
                  melissafh@johnlscott.com
                </a>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {hasAccess ? (
                <button
                  onClick={onEnterWorkspace}
                  className="bg-[#1A1A1A] text-white px-7 py-3 rounded-sm text-sm font-medium hover:opacity-90 hover:scale-[1.02] transition cursor-pointer"
                >
                  Enter Workspace
                </button>
              ) : (
                <button
                  onClick={onRegister}
                  className="bg-[#1A1A1A] text-white px-7 py-3 rounded-sm text-sm font-medium hover:opacity-90 hover:scale-[1.02] transition cursor-pointer"
                >
                  Admin / Agent Login
                </button>
              )}
              <a
                href="tel:2535147676"
                className="inline-flex items-center gap-2 border border-[rgba(139,125,107,0.25)] bg-white text-[#1A1A1A] px-7 py-3 rounded-sm text-sm font-medium hover:opacity-90 hover:scale-[1.02] transition cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
                Call Melissa (253-514-7676)
              </a>
            </div>
          </div>

          {/* Right — image + floating search */}
          <div className="relative">
            <div className="img-scale aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
              <img
                src={
                  featured[0]?.heroPhotoUrl ||
                  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=85'
                }
                alt="Featured estate"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Floating search bar — overlaps hero image */}
            <form
              onSubmit={handleSearch}
              className="absolute left-1/2 -translate-x-1/2 -bottom-8 w-[90%] bg-white p-6 rounded-2xl shadow-xl border border-[rgba(139,125,107,0.2)]"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-0 lg:divide-x lg:divide-[rgba(139,125,107,0.2)] items-stretch">
                {/* Segment 1 — Location */}
                <label className="lg:px-5 flex flex-col justify-center gap-1.5 cursor-pointer">
                  <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-medium">
                    Location
                  </span>
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City or zip"
                    className="text-sm font-bold text-[#1A1A1A] bg-transparent focus:outline-none placeholder:text-neutral-400 placeholder:font-medium"
                  />
                </label>

                {/* Segment 2 — Type */}
                <label className="lg:px-5 flex flex-col justify-center gap-1.5 cursor-pointer">
                  <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-medium">
                    Type
                  </span>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="text-sm font-bold text-[#1A1A1A] bg-transparent focus:outline-none appearance-none cursor-pointer"
                  >
                    <option>Any Type</option>
                    <option>Estate</option>
                    <option>Penthouse</option>
                    <option>Waterfront</option>
                    <option>Pocket Listing</option>
                  </select>
                </label>

                {/* Segment 3 — Price */}
                <label className="lg:px-5 flex flex-col justify-center gap-1.5 cursor-pointer">
                  <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-medium">
                    Price
                  </span>
                  <select
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="text-sm font-bold text-[#1A1A1A] bg-transparent focus:outline-none appearance-none cursor-pointer"
                  >
                    <option>Any Price</option>
                    <option>$1M – $5M</option>
                    <option>$5M – $15M</option>
                    <option>$15M+</option>
                  </select>
                </label>

                {/* Segment 4 — Primary search button */}
                <div className="lg:pl-5 flex">
                  <button
                    type="submit"
                    className="w-full bg-[#1A1A1A] text-white h-12 lg:h-full min-h-[48px] rounded-xl flex items-center justify-center gap-2 text-sm font-medium hover:opacity-90 hover:scale-[1.02] transition cursor-pointer"
                  >
                    <Search className="w-4 h-4" />
                    Search
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ==================== ABOUT & STATISTICS ==================== */}
      <section id="about" className="pt-28 pb-24 px-6 md:px-12 bg-[#FDFCF9] border-t border-[rgba(139,125,107,0.2)]">
        <div className="max-w-[1400px] mx-auto">
          {/* Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-16">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="font-display text-4xl md:text-5xl font-bold text-[#1A1A1A] tracking-[-0.03em]">
                  {s.value}
                </p>
                <p className="mt-2 text-[10px] uppercase tracking-[0.22em] text-neutral-400 font-medium">
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {/* 3-column cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ABOUT_CARDS.map((card) => (
              <div
                key={card.title}
                className="group p-8 border border-[rgba(139,125,107,0.2)] rounded-3xl bg-white transition hover:shadow-lg"
              >
                <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center text-[#1A1A1A] group-hover:bg-[#1A1A1A] group-hover:text-[#FDFCF9] transition-colors duration-300">
                  <card.icon className="w-5 h-5" />
                </div>
                <h3 className="mt-6 font-display text-xl font-bold text-[#1A1A1A]">
                  {card.title}
                </h3>
                <p className="mt-3 text-neutral-600 leading-relaxed text-[15px]">
                  {card.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== FEATURED PROPERTIES ==================== */}
      <section id="properties" className="pt-28 pb-24 px-6 md:px-12 bg-[#FDFCF9] border-t border-[rgba(139,125,107,0.2)]">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
            <div>
              <div className="w-12 h-0.5 bg-[#D4AF37] mb-6" />
              <h2 className="font-display text-4xl md:text-5xl tracking-[-0.03em] text-[#1A1A1A]">
                Featured Properties
              </h2>
            </div>
            <button
              onClick={hasAccess ? onEnterWorkspace : onRegister}
              className="text-sm font-medium text-[#1A1A1A] flex items-center gap-2 hover:opacity-70 transition cursor-pointer"
            >
              View all listings <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {(featured.length
              ? featured
              : Array.from({ length: 6 }).map((_, i) => ({
                  id: i,
                  title: 'Coming Soon Estate',
                  address: 'Private Address',
                  cityState: 'On File',
                  price: '—',
                  beds: 5,
                  baths: '5.5',
                  sqft: 6000,
                  heroPhotoUrl:
                    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
                }))
            ).map((prop, idx) => (
              <article
                key={prop.id}
                className="group bg-white border border-[rgba(139,125,107,0.2)] rounded-3xl overflow-hidden transition hover:shadow-xl"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={prop.heroPhotoUrl}
                    alt={prop.title}
                    className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                  />
                  {/* Wishlist */}
                  <button
                    onClick={() =>
                      setWishlist((w) => ({ ...w, [prop.id]: !w[prop.id] }))
                    }
                    className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer"
                    style={{
                      background: 'rgba(255,255,255,0.55)',
                      backdropFilter: 'blur(10px)',
                    }}
                    aria-label="Save listing"
                  >
                    <Heart
                      className="w-4 h-4"
                      fill={wishlist[prop.id] ? '#D4AF37' : 'none'}
                      color={wishlist[prop.id] ? '#D4AF37' : '#1A1A1A'}
                    />
                  </button>
                  {/* Badge */}
                  {idx < 2 && (
                    <span className="absolute bottom-4 left-4 px-3 py-1.5 rounded-sm bg-white text-[10px] uppercase tracking-[0.16em] font-semibold text-[#1A1A1A]">
                      New Listing
                    </span>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="font-display text-xl font-bold text-[#1A1A1A] leading-snug">
                    {prop.title.split('//')[0].trim()}
                  </h3>
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-neutral-500">
                    <MapPin className="w-3.5 h-3.5" />
                    {prop.address}
                    {prop.cityState ? `, ${prop.cityState}` : ''}
                  </p>
                  <p className="mt-3 font-display text-xl font-bold text-[#1A1A1A]">
                    {prop.price}
                  </p>

                  {/* Property Specs Bar */}
                  <div className="mt-5 flex flex-row items-center gap-6 border-t border-[rgba(139,125,107,0.2)] pt-4">
                    <span className="flex items-center gap-1.5 text-sm text-neutral-500">
                      <BedDouble className="w-4 h-4" strokeWidth={1.75} />
                      {prop.beds} Beds
                    </span>
                    <span className="flex items-center gap-1.5 text-sm text-neutral-500">
                      <Bath className="w-4 h-4" strokeWidth={1.75} />
                      {prop.baths} Baths
                    </span>
                    <span className="flex items-center gap-1.5 text-sm text-neutral-500">
                      <Maximize className="w-4 h-4" strokeWidth={1.75} />
                      {prop.sqft.toLocaleString()} sqft
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section id="process" className="pt-28 pb-24 px-6 md:px-12 bg-[#FDFCF9] border-t border-[rgba(139,125,107,0.2)]">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-14 max-w-xl">
            <div className="w-12 h-0.5 bg-[#D4AF37] mb-6" />
            <h2 className="font-display text-4xl md:text-5xl tracking-[-0.03em] text-[#1A1A1A]">
              How it works
            </h2>
            <p className="mt-4 text-neutral-600 text-lg leading-relaxed">
              Four steps from still photos to a warm call with the seller dossier
              already on your screen.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map((step) => (
              <div
                key={step.n}
                className="relative bg-neutral-50 p-10 rounded-2xl overflow-hidden"
              >
                <span className="absolute top-6 right-6 font-display text-6xl font-bold text-[#1A1A1A] opacity-10 leading-none">
                  {step.n}
                </span>
                <div className="relative">
                  <step.icon className="w-7 h-7 text-[#D4AF37]" />
                  <h4 className="mt-6 font-display text-xl font-bold text-[#1A1A1A]">
                    {step.title}
                  </h4>
                  <p className="mt-3 text-sm text-neutral-600 leading-relaxed">
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CTA LEAD CAPTURE ==================== */}
      <section
        id="contact"
        className="relative py-28 px-6 md:px-12 overflow-hidden"
        style={{ background: '#1A1A1A' }}
      >
        {/* Subtle radial dot grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(253,252,249,0.9) 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        />

        <div className="relative max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[#FDFCF9] text-[10px] uppercase tracking-[0.2em] mb-4">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
              Listing &amp; Buyer Inquiries
            </div>
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl tracking-[-0.03em] text-white leading-[1.05]">
              Represented by Melissa Hatfield
            </h2>
            <p className="mt-4 text-sm font-mono-code uppercase tracking-[0.2em] text-[#D4AF37]">
              REALTOR® / Broker · John L. Scott Real Estate
            </p>
            <p className="mt-5 text-base sm:text-lg text-white/70 leading-relaxed max-w-md">
              Whether you are preparing to list your property or looking for off-market buyer representation,
              our autonomous cinema studio, 6-specialist marketing engine, and live call bridge ensure
              your listing receives top-tier luxury exposure.
            </p>

            {/* Official Broker Card */}
            <div className="mt-8 p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <div className="text-white font-bold text-lg font-display">
                    John L. Scott Real Estate
                  </div>
                  <div className="text-xs text-[#D4AF37] font-medium">
                    Melissa Hatfield, REALTOR® / Broker
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-white/50 uppercase tracking-widest font-mono-code">
                  <span>REALTOR®</span> · <span>MLS</span> · <span>EHO</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-white/80">
                <div>
                  <span className="text-white/40 block text-[10px] uppercase tracking-wider">Direct Mobile</span>
                  <a href="tel:2535147676" className="font-bold text-white hover:text-[#D4AF37] text-sm">
                    253-514-7676
                  </a>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px] uppercase tracking-wider">Office Direct</span>
                  <a href="tel:2538417000" className="font-bold text-white hover:text-[#D4AF37] text-sm">
                    253-841-7000
                  </a>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px] uppercase tracking-wider">Email</span>
                  <a href="mailto:melissafh@johnlscott.com" className="hover:text-[#D4AF37] underline text-xs">
                    melissafh@johnlscott.com
                  </a>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px] uppercase tracking-wider">Website</span>
                  <a
                    href="https://www.melissafh.johnlscott.com"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[#D4AF37] underline text-xs"
                  >
                    www.melissafh.johnlscott.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* White form card */}
          <form
            onSubmit={handleLead}
            className="bg-white p-8 sm:p-10 rounded-3xl shadow-2xl"
          >
            <div className="mb-4">
              <h3 className="font-display text-2xl font-bold text-[#1A1A1A]">
                Request a Consultation
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Direct message to Melissa Hatfield &amp; John L. Scott Real Estate.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.18em] text-neutral-400 mb-1.5">
                  Your Full Name
                </label>
                <input
                  className={inputClass}
                  value={lead.name}
                  onChange={(e) => setLead({ ...lead, name: e.target.value })}
                  placeholder="e.g. David &amp; Claire Sterling"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.18em] text-neutral-400 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  className={inputClass}
                  value={lead.email}
                  onChange={(e) => setLead({ ...lead, email: e.target.value })}
                  placeholder="name@email.com"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.18em] text-neutral-400 mb-1.5">
                  Phone Number
                </label>
                <input
                  className={inputClass}
                  value={lead.phone}
                  onChange={(e) => setLead({ ...lead, phone: e.target.value })}
                  placeholder="253-555-0199"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.18em] text-neutral-400 mb-1.5">
                  Property or Question
                </label>
                <textarea
                  rows={3}
                  className={inputClass + ' resize-none'}
                  value={lead.message}
                  onChange={(e) =>
                    setLead({ ...lead, message: e.target.value })
                  }
                  placeholder="I would like to list my property with custom 4K cinema films and autonomous marketing..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="group w-full bg-[#1A1A1A] text-white py-3.5 rounded-sm text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition cursor-pointer disabled:opacity-60"
              >
                {submitting ? 'Submitting…' : 'Send to Melissa Hatfield'}
                <Send className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5" />
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
