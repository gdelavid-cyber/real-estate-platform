'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  BrainCircuit,
  Calculator,
  FileSignature,
  TrendingUp,
  Sliders,
  CheckCircle2,
  ShieldCheck,
  Terminal,
  Copy,
  Check,
  Zap,
  Volume2,
  Building2,
  DollarSign,
  Layers,
} from 'lucide-react';

interface PersonalExecutiveCommandProps {
  onLaunchAssistantWithPrompt: (prompt: string) => void;
}

const PRESET_TIERS = [
  {
    label: 'Starter / Residential ($285K)',
    name: '2404 14th St SW // Suburban Craftsman',
    asking: 285000,
    target: 270000,
    bottom: 272000,
    arv: 315000,
    lease: 24000,
  },
  {
    label: 'Mid-Market Family ($650K)',
    name: '8812 Evergreen Ridge // Modern Ranch',
    asking: 650000,
    target: 620000,
    bottom: 625000,
    arv: 710000,
    lease: 45600,
  },
  {
    label: 'Executive Luxury ($1.45M)',
    name: '420 Soundview Crest // Puget Sound View Home',
    asking: 1450000,
    target: 1380000,
    bottom: 1390000,
    arv: 1590000,
    lease: 96000,
  },
  {
    label: 'Trophy Estate ($14.85M)',
    name: 'Villa Lumina // Bel-Air Sanctuary',
    asking: 14850000,
    target: 14100000,
    bottom: 14200000,
    arv: 16800000,
    lease: 1140000,
  },
];

function formatCurrency(n: number): string {
  if (Math.abs(n) >= 1_000_000) {
    const m = n / 1_000_000;
    return `${m >= 0 ? '+' : '-'}$${Math.abs(m).toFixed(2)}M`;
  }
  if (Math.abs(n) >= 1_000) {
    const k = n / 1_000;
    return `${k >= 0 ? '+' : '-'}$${Math.abs(k).toFixed(0)}K`;
  }
  return `${n >= 0 ? '+' : '-'}$${Math.abs(n).toLocaleString()}`;
}

export default function PersonalExecutiveCommand({
  onLaunchAssistantWithPrompt,
}: PersonalExecutiveCommandProps) {
  // Interactive Deal Underwriting & ROI Calculator State
  const [propertyName, setPropertyName] = useState(
    '2404 14th St SW // Suburban Craftsman'
  );
  const [askingPrice, setAskingPrice] = useState<number>(285000);
  const [myTargetOffer, setMyTargetOffer] = useState<number>(270000);
  const [sellerConfidentialBottom, setSellerConfidentialBottom] =
    useState<number>(272000);
  const [estimatedResaleOrARV, setEstimatedResaleOrARV] =
    useState<number>(315000);
  const [annualLuxuryLeaseIncome, setAnnualLuxuryLeaseIncome] =
    useState<number>(24000);
  const [copiedLOI, setCopiedLOI] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<number>(0);

  // Real-time calculated metrics
  const instantEquityCapture = estimatedResaleOrARV - myTargetOffer;
  const discountFromAskingPct = askingPrice > 0
    ? (((askingPrice - myTargetOffer) / askingPrice) * 100).toFixed(1)
    : '0.0';
  const netOperatingIncome = annualLuxuryLeaseIncome * 0.82; // 18% op-ex allowance
  const capRatePct = myTargetOffer > 0
    ? ((netOperatingIncome / myTargetOffer) * 100).toFixed(2)
    : '0.00';
  const deltaFromSellerBottom = myTargetOffer - sellerConfidentialBottom;

  // Dynamic earnest money (approx 3% of offer, min $2,500)
  const dynamicEarnestDeposit = Math.max(
    2500,
    Math.round((myTargetOffer * 0.03) / 500) * 500
  );

  const applyPreset = (idx: number) => {
    const p = PRESET_TIERS[idx];
    if (!p) return;
    setSelectedPreset(idx);
    setPropertyName(p.name);
    setAskingPrice(p.asking);
    setMyTargetOffer(p.target);
    setSellerConfidentialBottom(p.bottom);
    setEstimatedResaleOrARV(p.arv);
    setAnnualLuxuryLeaseIncome(p.lease);
  };

  const handleAskingChange = (val: number) => {
    setAskingPrice(val);
    // If target offer is unadjusted or higher, proportionally sync
    if (myTargetOffer > val) {
      setMyTargetOffer(Math.round(val * 0.95));
      setSellerConfidentialBottom(Math.round(val * 0.96));
      setEstimatedResaleOrARV(Math.round(val * 1.12));
      setAnnualLuxuryLeaseIncome(Math.round(val * 0.08));
    }
  };

  const acceptanceProb = deltaFromSellerBottom >= 0
    ? Math.min(99, 92 + Math.round((deltaFromSellerBottom / Math.max(1, myTargetOffer)) * 100))
    : Math.max(45, 90 - Math.round((Math.abs(deltaFromSellerBottom) / Math.max(1, sellerConfidentialBottom)) * 250));

  const generatedLOIText = `CONFIDENTIAL LETTER OF INTENT (LOI) — REAL ESTATE ACQUISITION
Property: ${propertyName}
Listing & Transaction Broker: Melissa Hatfield, REALTOR® / Broker (John L. Scott Real Estate)
Direct Contact: (253) 514-7676 | Office: (253) 841-7000 | melissafh@johnlscott.com
Buyer Entity: Verified Principal Client Entity (c/o Melissa Hatfield · John L. Scott Real Estate)
Offer Purchase Price: $${myTargetOffer.toLocaleString()} USD
Earnest Money Deposit: $${dynamicEarnestDeposit.toLocaleString()} within 24 hours of mutual execution
Closing Timeline: 14-21 Calendar Days (Expedited Escrow)
Special Conditions:
1. Seller delivers clear marketable title free of encumbrances.
2. Property conveyed in turnkey condition with all verified fixtures.
3. Confidential negotiation terms strictly non-disclosable on public MLS registries.`;

  const handleCopyLOI = () => {
    navigator.clipboard.writeText(generatedLOIText);
    setCopiedLOI(true);
    setTimeout(() => setCopiedLOI(false), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Personal OS Banner */}
      <div className="p-7 rounded-3xl bg-gradient-to-r from-[#111723] via-[#1B1726] to-[#111723] border border-[#D4AF37]/40 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-[#D4AF37]/10 blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#F3E5AB] font-mono-code text-xs flex items-center gap-1.5">
                <BrainCircuit className="w-3.5 h-3.5 text-[#D4AF37]" />
                DEEP REASONING + REALTIME VOICE PERSONAL ENGINE
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono-code text-xs">
                ALL PRICE TIERS ($200K – $25M+)
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/10 text-slate-200 font-mono-code text-[11px]">
                BROKER: MELISSA HATFIELD (JOHN L. SCOTT)
              </span>
            </div>

            <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
              Your Personal Next-Gen Real Estate Executive Command
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              Underwrite acquisitions across every residential price tier — from $200,000 starter homes and suburban residences to multi-million luxury estates. Compare your target offer against the seller&apos;s confidential bottom-line reserve and generate binding Letters of Intent in one click.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                onLaunchAssistantWithPrompt(
                  `Run a deep underwriting & negotiation strategy for ${propertyName} at my target offer of $${myTargetOffer.toLocaleString()} vs the seller's confidential bottom line of $${sellerConfidentialBottom.toLocaleString()}. Represented by Melissa Hatfield (John L. Scott Real Estate).`
                )
              }
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-[#0A0D12] font-bold text-xs flex items-center gap-2.5 shadow-xl shadow-[#D4AF37]/25 hover:scale-105 transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch Deep Deal Analysis</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Price-Tier Presets */}
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="text-xs font-mono-code text-slate-400 mr-2 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-[#D4AF37]" />
          QUICK PRICE TIERS:
        </span>
        {PRESET_TIERS.map((tier, idx) => (
          <button
            key={tier.label}
            onClick={() => applyPreset(idx)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer border ${
              selectedPreset === idx
                ? 'bg-[#D4AF37] text-[#0A0D12] border-[#D4AF37] shadow-md font-bold'
                : 'bg-[#121721] text-slate-300 border-white/10 hover:border-[#D4AF37]/50 hover:text-white'
            }`}
          >
            {tier.label}
          </button>
        ))}
      </div>

      {/* Main Split Workspace: Deal Underwriter + Strategy & LOI Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT 7 COLS: Interactive Personal Offer & Cap-Rate Underwriter */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#121721] border border-white/10 space-y-6">
          <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-4 gap-2">
            <div className="flex items-center gap-2.5">
              <Calculator className="w-5 h-5 text-[#D4AF37]" />
              <h3 className="font-display text-2xl font-bold text-white">
                Interactive Personal Offer & Equity Underwriter
              </h3>
            </div>
            <span className="font-mono-code text-xs text-emerald-400">
              SCALE: $200,000 – $25,000,000+
            </span>
          </div>

          {/* Property Name Input */}
          <div>
            <label className="block text-[11px] font-mono-code uppercase tracking-wider text-slate-400 mb-1.5">
              Property Headline / Address
            </label>
            <input
              type="text"
              value={propertyName}
              onChange={(e) => setPropertyName(e.target.value)}
              placeholder="e.g. 2404 14th St SW // 4-Bed Craftsman"
              className="w-full bg-[#0A0D12] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#D4AF37] font-medium"
            />
          </div>

          {/* Sliders & Numerical Inputs */}
          <div className="space-y-5">
            {/* 1. Asking Price */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-slate-400 font-medium">
                  Public Asking Price
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-[11px]">$</span>
                  <input
                    type="number"
                    min={100000}
                    max={30000000}
                    step={5000}
                    value={askingPrice}
                    onChange={(e) => handleAskingChange(Number(e.target.value))}
                    className="bg-[#0A0D12] border border-white/15 rounded px-2 py-0.5 text-xs text-white font-mono-code w-28 text-right focus:outline-none focus:border-[#D4AF37]"
                  />
                  <span className="font-mono-code font-bold text-white min-w-[90px] text-right">
                    ${askingPrice.toLocaleString()}
                  </span>
                </div>
              </div>
              <input
                type="range"
                min={200000}
                max={25000000}
                step={askingPrice < 1000000 ? 5000 : 25000}
                value={askingPrice}
                onChange={(e) => handleAskingChange(Number(e.target.value))}
                className="w-full accent-[#D4AF37] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono-code text-slate-500 mt-0.5">
                <span>$200K</span>
                <span>$1M</span>
                <span>$5M</span>
                <span>$15M</span>
                <span>$25M</span>
              </div>
            </div>

            {/* 2. Target Offer */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-[#D4AF37] font-semibold">
                  Your Personal Target Offer Price
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-[11px]">$</span>
                  <input
                    type="number"
                    min={100000}
                    max={25000000}
                    step={5000}
                    value={myTargetOffer}
                    onChange={(e) => setMyTargetOffer(Number(e.target.value))}
                    className="bg-[#0A0D12] border border-[#D4AF37]/40 rounded px-2 py-0.5 text-xs text-[#D4AF37] font-mono-code w-28 text-right focus:outline-none focus:border-[#D4AF37]"
                  />
                  <span className="font-mono-code font-bold text-[#D4AF37] text-sm sm:text-base">
                    ${myTargetOffer.toLocaleString()} ({discountFromAskingPct}% Below Ask)
                  </span>
                </div>
              </div>
              <input
                type="range"
                min={200000}
                max={25000000}
                step={myTargetOffer < 1000000 ? 5000 : 25000}
                value={myTargetOffer}
                onChange={(e) => setMyTargetOffer(Number(e.target.value))}
                className="w-full accent-[#D4AF37] cursor-pointer"
              />
            </div>

            {/* 3. Seller Confidential Bottom Line */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-emerald-400 font-semibold">
                  Auto-Extracted Seller Confidential Bottom Line
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-[11px]">$</span>
                  <input
                    type="number"
                    min={100000}
                    max={25000000}
                    step={5000}
                    value={sellerConfidentialBottom}
                    onChange={(e) => setSellerConfidentialBottom(Number(e.target.value))}
                    className="bg-[#0A0D12] border border-emerald-500/40 rounded px-2 py-0.5 text-xs text-emerald-400 font-mono-code w-28 text-right focus:outline-none focus:border-emerald-400"
                  />
                  <span className="font-mono-code font-bold text-emerald-400">
                    ${sellerConfidentialBottom.toLocaleString()}
                  </span>
                </div>
              </div>
              <input
                type="range"
                min={200000}
                max={25000000}
                step={sellerConfidentialBottom < 1000000 ? 5000 : 25000}
                value={sellerConfidentialBottom}
                onChange={(e) =>
                  setSellerConfidentialBottom(Number(e.target.value))
                }
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

            {/* 4. Projected ARV / Post-Close Valuation */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-slate-400">
                  Projected Post-Close Valuation / ARV
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-[11px]">$</span>
                  <input
                    type="number"
                    min={100000}
                    max={30000000}
                    step={5000}
                    value={estimatedResaleOrARV}
                    onChange={(e) => setEstimatedResaleOrARV(Number(e.target.value))}
                    className="bg-[#0A0D12] border border-white/15 rounded px-2 py-0.5 text-xs text-white font-mono-code w-28 text-right focus:outline-none focus:border-[#D4AF37]"
                  />
                  <span className="font-mono-code font-bold text-white">
                    ${estimatedResaleOrARV.toLocaleString()}
                  </span>
                </div>
              </div>
              <input
                type="range"
                min={200000}
                max={30000000}
                step={estimatedResaleOrARV < 1000000 ? 5000 : 25000}
                value={estimatedResaleOrARV}
                onChange={(e) =>
                  setEstimatedResaleOrARV(Number(e.target.value))
                }
                className="w-full accent-[#D4AF37] cursor-pointer"
              />
            </div>
          </div>

          {/* 4 Instant Output KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-4 rounded-xl bg-[#0A0D12] border border-white/10">
              <span className="font-mono-code text-[10px] uppercase text-slate-400 block">
                Instant Equity Captured
              </span>
              <span className={`font-display text-xl font-bold mt-1 block ${instantEquityCapture >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {formatCurrency(instantEquityCapture)}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#0A0D12] border border-white/10">
              <span className="font-mono-code text-[10px] uppercase text-slate-400 block">
                Estimated Cap Rate
              </span>
              <span className="font-display text-xl font-bold text-[#D4AF37] mt-1 block">
                {capRatePct}%
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#0A0D12] border border-white/10">
              <span className="font-mono-code text-[10px] uppercase text-slate-400 block">
                Spread vs Seller Floor
              </span>
              <span
                className={`font-display text-xl font-bold mt-1 block ${
                  deltaFromSellerBottom >= 0
                    ? 'text-emerald-400'
                    : 'text-amber-400'
                }`}
              >
                {deltaFromSellerBottom >= 0
                  ? `${formatCurrency(deltaFromSellerBottom)} Above`
                  : `${formatCurrency(deltaFromSellerBottom)} Below`}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#0A0D12] border border-white/10">
              <span className="font-mono-code text-[10px] uppercase text-slate-400 block">
                Offer Acceptance Score
              </span>
              <span className="font-display text-xl font-bold text-white mt-1 block">
                {acceptanceProb}% / 100
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT 5 COLS: Strategic Verdict & 1-Click LOI Artifact */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#121721] border border-[#D4AF37]/30 flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono-code text-xs text-[#D4AF37] flex items-center gap-1.5">
                <BrainCircuit className="w-4 h-4" />
                PERSONAL DEAL VERDICT
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono-code text-[10px]">
                REASONING TRACE VERIFIED
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#0A0D12] border border-white/10 space-y-2">
              <div className="text-xs font-mono-code text-slate-400">
                &lt;thinking_trace&gt;
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Evaluating target offer of{' '}
                <strong className="text-[#D4AF37]">
                  ${myTargetOffer.toLocaleString()}
                </strong>{' '}
                for <em>{propertyName}</em> vs. confidential bottom line of{' '}
                <strong className="text-emerald-400">
                  ${sellerConfidentialBottom.toLocaleString()}
                </strong>{' '}
                ({deltaFromSellerBottom >= 0
                  ? `$${deltaFromSellerBottom.toLocaleString()} over floor`
                  : `$${Math.abs(deltaFromSellerBottom).toLocaleString()} under floor`}).
                Represented by Melissa Hatfield (John L. Scott Real Estate). Projected equity capture: <strong className="text-white">${instantEquityCapture.toLocaleString()}</strong>.
                By structuring a 24-hour ${dynamicEarnestDeposit.toLocaleString()} earnest deposit with pre-approved verification, estimated acceptance probability is <strong className="text-emerald-400">{acceptanceProb}%</strong>.
              </p>
              <div className="text-xs font-mono-code text-slate-400">
                &lt;/thinking_trace&gt;
              </div>
            </div>

            {/* Auto-Generated Binding LOI Artifact */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono-code text-xs text-white flex items-center gap-1.5">
                  <FileSignature className="w-4 h-4 text-[#D4AF37]" />
                  Instant Binding Letter of Intent (LOI)
                </span>
                <button
                  onClick={handleCopyLOI}
                  className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/15 text-xs text-white flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedLOI ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied LOI</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy LOI</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-3.5 rounded-xl bg-[#0A0D12] border border-white/10 font-mono-code text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                {generatedLOIText}
              </pre>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() =>
                onLaunchAssistantWithPrompt(
                  `Finalize this LOI for ${propertyName} at $${myTargetOffer.toLocaleString()} (Asking: $${askingPrice.toLocaleString()}, Floor: $${sellerConfidentialBottom.toLocaleString()}) and instruct Handoff-Apex to notify the listing agent immediately. Broker: Melissa Hatfield, REALTOR® / Broker (John L. Scott Real Estate · 253-514-7676).`
                )
              }
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#0A0D12] font-bold text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer hover:opacity-95 transition"
            >
              <Zap className="w-4 h-4" />
              <span>Execute LOI & Dispatch via Personal AI Assistant</span>
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('documents');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 border border-white/10 transition cursor-pointer"
            >
              <FileSignature className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Pull Out for Mobile E-Signature in Document Suite</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
