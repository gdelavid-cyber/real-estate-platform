'use client';

import React, { useState } from 'react';
import {
  PhoneIncoming,
  PhoneCall,
  CheckCircle2,
  UserCheck,
  Building2,
  ShieldAlert,
  Lock,
  Sparkles,
  Volume2,
  ArrowRight,
  X,
  Copy,
  Check,
} from 'lucide-react';

export interface CallTransferRecord {
  id: number;
  leadId: number;
  propertyId: number;
  buyerName: string;
  buyerPhone: string;
  buyerPreApprovalAmount: string;
  buyerTargetMoveIn: string;
  sellerName: string;
  sellerPhone: string;
  sellerEmail: string;
  sellerBottomLinePrice: string;
  sellerMotivationNotes: string;
  assignedAgentName: string;
  assignedAgentPhone: string;
  transferStatus: string; // 'incoming_ringing' | 'agent_accepted' | 'live_warm_transfer' | 'closed_deal'
  aiSummary: string;
  transcriptSnippet: string;
  createdAt?: string;
}

interface CallTransferDrawerProps {
  transfer: CallTransferRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (transferId: number, newStatus: string) => Promise<void>;
}

export default function CallTransferDrawer({
  transfer,
  isOpen,
  onClose,
  onUpdateStatus,
}: CallTransferDrawerProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen || !transfer) return null;

  const handleCopy = (label: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(transfer.id, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const isRinging = transfer.transferStatus === 'incoming_ringing';
  const isLive =
    transfer.transferStatus === 'agent_accepted' ||
    transfer.transferStatus === 'live_warm_transfer';
  const isClosed = transfer.transferStatus === 'closed_deal';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#0D1118] border-l border-[#D4AF37]/30 h-full flex flex-col shadow-2xl overflow-hidden">
        {/* Top Ambient Alert Header */}
        <div
          className={`px-6 py-4 flex items-center justify-between border-b ${
            isRinging
              ? 'bg-gradient-to-r from-[#D4AF37]/25 via-[#10B981]/20 to-[#0D1118] border-[#D4AF37]/40'
              : isClosed
              ? 'bg-[#10B981]/15 border-[#10B981]/30'
              : 'bg-[#121721] border-white/10'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isRinging
                  ? 'bg-[#D4AF37] text-[#0A0D12] animate-pulse'
                  : isClosed
                  ? 'bg-[#10B981] text-[#0A0D12]'
                  : 'bg-[#10B981]/20 text-[#10B981]'
              }`}
            >
              {isRinging ? (
                <PhoneIncoming className="w-5 h-5" />
              ) : isClosed ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <PhoneCall className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono-code text-[11px] uppercase tracking-widest px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
                  AI Swarm Handoff-Apex
                </span>
                <span className="font-mono-code text-xs text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  {isRinging
                    ? 'BUYER ON LINE // WARM TRANSFER READY'
                    : isClosed
                    ? 'DEAL CLOSED BY AGENT'
                    : 'AGENT ON LIVE CALL BRIDGE'}
                </span>
              </div>
              <h2 className="font-display text-xl font-semibold text-white mt-0.5">
                Live Closing Dossier & Seller Data Bridge
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Live Voice Waveform & AI Bridge Transcript */}
          <div className="p-4 rounded-xl bg-[#121721] border border-[#D4AF37]/25 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono-code text-[#D4AF37]">
                <Volume2 className="w-4 h-4" />
                <span>AI VOICE SWARM BRIDGE // LIVE STREAM</span>
              </div>
              {/* Simulated Audio Waveform */}
              <div className="flex items-center gap-1 h-5">
                {[40, 85, 60, 95, 45, 75, 90, 50, 80, 65, 95, 55].map(
                  (height, idx) => (
                    <span
                      key={idx}
                      style={{ height: `${isClosed ? 20 : height}%` }}
                      className={`w-1 rounded-full transition-all duration-300 ${
                        isClosed
                          ? 'bg-slate-600'
                          : idx % 2 === 0
                          ? 'bg-[#D4AF37]'
                          : 'bg-[#10B981]'
                      }`}
                    />
                  )
                )}
              </div>
            </div>

            <p className="text-sm text-slate-200 italic bg-[#0A0D12]/80 p-3 rounded-lg border border-white/5 leading-relaxed">
              {transfer.transcriptSnippet}
            </p>

            <div className="text-xs text-slate-400 flex items-center justify-between pt-1">
              <span>
                Bridging to Agent:{' '}
                <strong className="text-white">
                  {transfer.assignedAgentName}
                </strong>
              </span>
              <span className="font-mono-code text-emerald-400">
                Latency: 18ms // Whisper Mode Active
              </span>
            </div>
          </div>

          {/* Side-by-side Buyer Profile + Extracted Seller Confidential Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* BUYER CARD (Inbound Contact) */}
            <div className="p-5 rounded-xl bg-[#121721] border border-emerald-500/30 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span className="font-mono-code text-xs uppercase tracking-wider text-emerald-400">
                    1. Qualified Buyer (On Line)
                  </span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono-code">
                  Intent 99/100
                </span>
              </div>

              <div className="space-y-2.5 text-sm">
                <div>
                  <span className="text-xs text-slate-400 block">
                    Buyer Full Name
                  </span>
                  <span className="font-semibold text-white text-base">
                    {transfer.buyerName}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block">
                      Direct Phone
                    </span>
                    <span className="font-mono-code text-slate-200">
                      {transfer.buyerPhone}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy('buyerPhone', transfer.buyerPhone)}
                    className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-300"
                    title="Copy Buyer Phone"
                  >
                    {copiedField === 'buyerPhone' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <div>
                  <span className="text-xs text-slate-400 block">
                    Verified Financial Capability
                  </span>
                  <span className="text-emerald-400 font-semibold">
                    {transfer.buyerPreApprovalAmount}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-slate-400 block">
                    Target Move-In / Closing Window
                  </span>
                  <span className="text-slate-200">
                    {transfer.buyerTargetMoveIn}
                  </span>
                </div>
              </div>
            </div>

            {/* SELLER CONFIDENTIAL DOSSIER (Automatically Grabbed by AI Swarm) */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-[#121721] to-[#191512] border border-[#D4AF37]/40 space-y-4">
              <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-3">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#D4AF37]" />
                  <span className="font-mono-code text-xs uppercase tracking-wider text-[#D4AF37]">
                    2. Seller Data (Auto-Extracted)
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] font-mono-code">
                  CONFIDENTIAL
                </span>
              </div>

              <div className="space-y-2.5 text-sm">
                <div>
                  <span className="text-xs text-slate-400 block">
                    Seller / Trust Entity
                  </span>
                  <span className="font-semibold text-white text-base">
                    {transfer.sellerName}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block">
                      Seller Direct Contact
                    </span>
                    <span className="font-mono-code text-slate-200">
                      {transfer.sellerPhone}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      handleCopy('sellerPhone', transfer.sellerPhone)
                    }
                    className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-300"
                    title="Copy Seller Phone"
                  >
                    {copiedField === 'sellerPhone' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <div>
                  <span className="text-xs text-slate-400 block">
                    Confidential Seller Bottom Line
                  </span>
                  <span className="text-[#D4AF37] font-bold text-base">
                    {transfer.sellerBottomLinePrice}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-slate-400 block">
                    Seller Motivation & Closing Leverage
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed bg-[#0A0D12]/60 p-2 rounded border border-white/5">
                    {transfer.sellerMotivationNotes}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Brokerage & Listing Agent Representation Card */}
          <div className="p-4 rounded-xl bg-[#121721] border border-[#D4AF37]/30 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] font-display font-bold text-base">
                JLS
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold text-sm">Melissa Hatfield</span>
                  <span className="text-[10px] font-mono-code px-1.5 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37]">
                    REALTOR® / Broker
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  John L. Scott Real Estate · Mobile: 253-514-7676 · Office: 253-841-7000
                </div>
              </div>
            </div>
            <div className="text-xs text-slate-300 font-mono-code flex items-center gap-3">
              <a
                href="mailto:melissafh@johnlscott.com"
                className="hover:text-[#D4AF37] underline"
              >
                melissafh@johnlscott.com
              </a>
              <a
                href="https://www.melissafh.johnlscott.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#D4AF37] underline"
              >
                www.melissafh.johnlscott.com
              </a>
            </div>
          </div>

          {/* AI Swarm Deal Synthesis & Closing Strategy */}
          <div className="p-4 rounded-xl bg-[#121721] border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono-code text-[#D4AF37]">
              <Sparkles className="w-4 h-4" />
              <span>AI CLOSING BRIEF FOR AGENT ({transfer.assignedAgentName || 'Melissa Hatfield · John L. Scott Real Estate'})</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {transfer.aiSummary}
            </p>
          </div>
        </div>

        {/* Sticky Bottom Action Bar for Real Estate Agent */}
        <div className="p-5 bg-[#0A0D12] border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            Exclusive Listing Broker:{' '}
            <span className="text-white font-medium">
              Melissa Hatfield (John L. Scott Real Estate · 253-514-7676)
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isRinging && (
              <button
                onClick={() => handleStatusChange('live_warm_transfer')}
                disabled={isUpdating}
                className="px-5 py-2.5 rounded-lg bg-[#10B981] hover:bg-[#059669] text-[#0A0D12] font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Accept Warm Transfer & Bridge Call</span>
              </button>
            )}

            {isLive && (
              <button
                onClick={() => handleStatusChange('closed_deal')}
                disabled={isUpdating}
                className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] hover:opacity-95 text-[#0A0D12] font-bold text-sm flex items-center gap-2 shadow-lg shadow-[#D4AF37]/20 transition cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Finalize Terms & Mark Deal Under Contract</span>
              </button>
            )}

            {isClosed && (
              <span className="px-4 py-2 rounded-lg bg-[#10B981]/20 border border-[#10B981]/40 text-emerald-400 font-mono-code text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                DEAL FINALIZED & LOGGED TO CRM
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
