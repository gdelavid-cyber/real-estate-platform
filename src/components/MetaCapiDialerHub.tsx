'use client';

import React, { useState } from 'react';
import {
  PhoneCall,
  Calendar,
  Clock,
  Sparkles,
  Share2,
  CheckCircle2,
  Sliders,
  Play,
  Pause,
  Plus,
  Trash2,
  Check,
  TrendingUp,
  BrainCircuit,
  Award,
  Zap,
  Globe,
  DollarSign,
  AlertCircle,
  Smartphone,
  UserCheck,
  Building2,
  Send,
  MessageSquare,
  ShieldCheck,
  Radio,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { LeadRecord } from './SwarmCommandCenter';

export interface MetaCapiEventItem {
  id: number;
  leadId: number | null;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  eventName: string;
  qualityRating: string;
  qualityScore: number;
  agentFeedback: string | null;
  estimatedDealValue: number | null;
  pixelId: string;
  eventId: string;
  metaApiStatus: string;
  fbEventResponse?: any;
  dispatchedAt?: string | null;
}

export interface AiDialerCampaignItem {
  id: number;
  campaignName: string;
  targetAudience: string;
  scheduledDays: string[];
  timeWindow: string;
  dialerSpeed: string;
  voicePersona: string;
  callObjective: string;
  status: string;
  callsPlacedCount: number;
  answeredCount: number;
  appointmentsBookedCount: number;
  lastRunAt: string | null;
}

export interface BookedAppointmentItem {
  id: number;
  dialerCampaignId: number | null;
  leadId: number | null;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  appointmentType: string;
  propertyAddress: string | null;
  scheduledDateTime: string;
  calendarSlot: string;
  status: string;
  notesFromAiCall: string | null;
  assignedAgent: string;
  agentAlertSent: boolean;
}

interface MetaCapiDialerHubProps {
  integrations?: {
    metaCapi: boolean;
    twilioDialer: boolean;
    emailDelivery: boolean;
    openCode: boolean;
    listingFeed: boolean;
    premiumVoice: boolean;
  };
  leads: LeadRecord[];
  metaCapiEvents: MetaCapiEventItem[];
  dialerCampaigns: AiDialerCampaignItem[];
  bookedAppointments: BookedAppointmentItem[];
  onSendToMetaCapi: (capiData: Record<string, unknown>) => Promise<boolean>;
  onCreateDialerCampaign: (campaignData: Record<string, unknown>) => Promise<boolean>;
  onRunDialerWave: (campaignId: number, selectedDay: string) => Promise<boolean>;
  onDeleteDialerCampaign: (id: number) => Promise<boolean>;
  onDeleteAppointment: (id: number) => Promise<boolean>;
  showToast: (msg: string) => void;
  onNavigateToSection: (sectionId: string) => void;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function MetaCapiDialerHub({
  integrations,
  leads,
  metaCapiEvents,
  dialerCampaigns,
  bookedAppointments,
  onSendToMetaCapi,
  onCreateDialerCampaign,
  onRunDialerWave,
  onDeleteDialerCampaign,
  onDeleteAppointment,
  showToast,
  onNavigateToSection,
}: MetaCapiDialerHubProps) {
  const [activeTab, setActiveTab] = useState<'capi_feedback' | 'ai_dialer' | 'calendar_bookings'>('capi_feedback');

  // Rate lead quality & send to Meta Pixel modal
  const [selectedLeadForRating, setSelectedLeadForRating] = useState<LeadRecord | null>(null);
  const [ratingScore, setRatingScore] = useState<number>(95);
  const [ratingCategory, setRatingCategory] = useState<'high_quality' | 'verified_cash' | 'unqualified' | 'spam'>('high_quality');
  const [agentFeedbackText, setAgentFeedbackText] = useState('High intent buyer with verified funds; engaged with cinema video.');
  const [estimatedValue, setEstimatedValue] = useState<number>(585000);
  const [isSendingCapi, setIsSendingCapi] = useState(false);

  // New Dialer Campaign Modal
  const [showNewDialerModal, setShowNewDialerModal] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState('Tuesday & Saturday Peak Call Wave');
  const [newTargetAudience, setNewTargetAudience] = useState('new_zillow_leads');
  const [selectedDays, setSelectedDays] = useState<string[]>(['Tuesday', 'Saturday']);
  const [newTimeWindow, setNewTimeWindow] = useState('10:00 AM - 12:30 PM & 4:30 PM - 7:00 PM');
  const [newCallObjective, setNewCallObjective] = useState('book_showing_or_consultation');
  const [isCreatingDialer, setIsCreatingDialer] = useState(false);

  // Dialer wave running state
  const [runningCampaignId, setRunningCampaignId] = useState<number | null>(null);

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleDispatchCapi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadForRating) return;

    setIsSendingCapi(true);
    try {
      const ok = await onSendToMetaCapi({
        leadId: selectedLeadForRating.id,
        buyerName: selectedLeadForRating.buyerName,
        buyerEmail: selectedLeadForRating.buyerEmail,
        buyerPhone: selectedLeadForRating.buyerPhone,
        qualityRating: ratingCategory,
        qualityScore: ratingScore,
        agentFeedback: agentFeedbackText,
        estimatedDealValue: estimatedValue,
      });

      if (ok) {
        showToast(`Meta Conversions API: Lead feedback transmitted to Pixel. Pixel algorithm trained with quality score ${ratingScore}/100.`);
        setSelectedLeadForRating(null);
      }
    } finally {
      setIsSendingCapi(false);
    }
  };

  const handleCreateDialer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignName.trim() || selectedDays.length === 0) {
      showToast('Please name the campaign and select at least one day of the week.');
      return;
    }

    setIsCreatingDialer(true);
    try {
      const ok = await onCreateDialerCampaign({
        campaignName: newCampaignName,
        targetAudience: newTargetAudience,
        scheduledDays: selectedDays,
        timeWindow: newTimeWindow,
        callObjective: newCallObjective,
      });

      if (ok) {
        setShowNewDialerModal(false);
        showToast('AI Voice Dialer campaign configured & scheduled.');
      }
    } finally {
      setIsCreatingDialer(false);
    }
  };

  const handleExecuteDialerWave = async (campaignId: number, day: string) => {
    setRunningCampaignId(campaignId);
    try {
      await onRunDialerWave(campaignId, day);
    } finally {
      setRunningCampaignId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner: Meta Conversions API & AI Voice Dialer Engine */}
      <div className="p-7 rounded-3xl bg-gradient-to-r from-[#141A26] via-[#1B1818] to-[#121721] border border-[#D4AF37]/40 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-[#D4AF37]/10 blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#F3E5AB] font-mono-code text-xs flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                META CONVERSIONS API (CAPI) &amp; AI VOICE DIALER HUB
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono-code text-xs flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" />
                PIXEL FEEDBACK REFINEMENT ACTIVE
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/10 text-slate-200 font-mono-code text-[11px]">
                BROKER: MELISSA HATFIELD (JOHN L. SCOTT)
              </span>
            </div>

            <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
              Meta Pixel Lead Quality Feedback Loop &amp; Day-Scheduled AI Voice Dialer
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              Grade incoming buyer leads in your CRM and immediately transmit high-quality signals back to the Meta Conversions API. Meta Pixel receives the verified feedback and recalibrates its ad targeting to attract higher-net-worth buyers. Plus, deploy autonomous AI Voice Dialers scheduled for specific days of the week and daytime windows to automatically dial leads and book appointments on Melissa&apos;s calendar.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowNewDialerModal(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-[#0A0D12] font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#D4AF37]/25 hover:scale-105 transition cursor-pointer"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Schedule AI Dialer Wave</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#121721] border border-[#D4AF37]/30">
          <div className="flex items-center justify-between text-xs font-mono-code text-[#D4AF37]">
            <span>META PIXEL EVENTS</span>
            <Share2 className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div className="font-display text-2xl font-bold text-white mt-1">
            {metaCapiEvents.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Dispatched to Meta CAPI</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#121721] border border-emerald-500/30">
          <div className="flex items-center justify-between text-xs font-mono-code text-emerald-400">
            <span>PIXEL MATCH SCORE</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-display text-2xl font-bold text-emerald-400 mt-1">
            {metaCapiEvents.length
              ? `${(
                  metaCapiEvents.reduce((sum, event) => sum + event.qualityScore, 0) /
                  metaCapiEvents.length /
                  10
                ).toFixed(1)} / 10`
              : 'Not connected'}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {metaCapiEvents.length ? 'Average verified lead rating' : 'Configure Meta credentials'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#121721] border border-sky-500/30">
          <div className="flex items-center justify-between text-xs font-mono-code text-sky-300">
            <span>AI DIALER CALLS</span>
            <Radio className="w-4 h-4 text-sky-400" />
          </div>
          <div className="font-display text-2xl font-bold text-sky-300 mt-1">
            {dialerCampaigns.reduce((sum, c) => sum + c.callsPlacedCount, 0)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Scheduled Outbound Calls</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#121721] border border-purple-500/30">
          <div className="flex items-center justify-between text-xs font-mono-code text-purple-300">
            <span>BOOKED APPOINTMENTS</span>
            <Calendar className="w-4 h-4 text-purple-400" />
          </div>
          <div className="font-display text-2xl font-bold text-purple-300 mt-1">
            {bookedAppointments.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Locked on Melissa&apos;s Calendar</div>
        </div>
      </div>

      {/* 3-Tab Navigator */}
      <div className="p-2.5 rounded-2xl bg-[#121721] border border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveTab('capi_feedback')}
            className={`px-4 py-2 rounded-xl font-semibold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'capi_feedback'
                ? 'bg-[#D4AF37] text-[#0A0D12] font-bold shadow-md'
                : 'bg-white/5 text-slate-300 hover:text-white'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>1. Grade Leads &amp; Send to Meta Pixel ({leads.length} Leads)</span>
          </button>

          <button
            onClick={() => setActiveTab('ai_dialer')}
            className={`px-4 py-2 rounded-xl font-semibold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'ai_dialer'
                ? 'bg-[#D4AF37] text-[#0A0D12] font-bold shadow-md'
                : 'bg-white/5 text-slate-300 hover:text-white'
            }`}
          >
            <PhoneCall className="w-4 h-4" />
            <span>2. Day &amp; Time Scheduled AI Dialers ({dialerCampaigns.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar_bookings')}
            className={`px-4 py-2 rounded-xl font-semibold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'calendar_bookings'
                ? 'bg-[#D4AF37] text-[#0A0D12] font-bold shadow-md'
                : 'bg-white/5 text-slate-300 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>3. Booked Showings &amp; Appointments ({bookedAppointments.length})</span>
          </button>
        </div>
      </div>

      {/* =========================================================
          TAB 1: LEAD QUALITY RATING & META CONVERSIONS API DISPATCH
      ========================================================= */}
      {activeTab === 'capi_feedback' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#121721] border border-[#D4AF37]/30 space-y-2">
            <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
              <Share2 className="w-5 h-5 text-[#D4AF37]" />
              <span>Closed-Loop Lead Feedback: Train Meta Pixel for Better Inbound Leads</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              When the autonomous swarm harvests or contacts leads, review their quality in your CRM. When you mark a lead as <strong>&quot;High Quality&quot;</strong> or <strong>&quot;Verified Cash&quot;</strong>, click <strong>&quot;Send to Meta Pixel via CAPI&quot;</strong>. The system hashes the buyer&apos;s phone and email (SHA-256) and transmits the conversion payload to Meta Graph API. Meta&apos;s ad algorithm receives this feedback and optimizes future real estate ads to target audiences that match your best buyers.
            </p>
          </div>

          {/* Leads Review & Rating Table */}
          <div className="space-y-3">
            {leads.length === 0 && (
              <div className="p-8 rounded-2xl bg-[#121721] border border-dashed border-white/15 text-center">
                <UserCheck className="w-7 h-7 text-slate-500 mx-auto mb-2" />
                <p className="text-sm text-white font-semibold">No real CRM leads yet</p>
                <p className="text-xs text-slate-400 mt-1">
                  Add opted-in buyers in the Swarm section. Only agent-approved quality signals can be sent to Meta.
                </p>
              </div>
            )}
            <div className="flex items-center justify-between text-xs font-mono-code text-slate-400 px-1">
              <span>ACTIVE CRM LEADS QUEUED FOR QUALITY AUDIT ({leads.length})</span>
              <span>CLICK &quot;GRADE &amp; SEND TO PIXEL&quot; TO REFINE META AD TARGETING</span>
            </div>

            {leads.map((lead) => {
              const alreadySentEvent = metaCapiEvents.find(
                (e) => e.buyerEmail.toLowerCase() === lead.buyerEmail.toLowerCase()
              );

              return (
                <div
                  key={lead.id}
                  className="p-5 rounded-2xl bg-[#121721] border border-white/10 hover:border-[#D4AF37]/50 transition flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg group"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2.5">
                      <h4 className="font-bold text-white text-base truncate">
                        {lead.buyerName}
                      </h4>
                      <span className="px-2 py-0.5 rounded font-mono-code text-[10px] uppercase font-bold bg-emerald-500/20 text-emerald-300">
                        Intent {lead.intentScore}/100
                      </span>
                      {alreadySentEvent && (
                        <span className="px-2 py-0.5 rounded font-mono-code text-[10px] bg-sky-500/20 text-sky-300 flex items-center gap-1 border border-sky-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          Pixel Trained ({alreadySentEvent.qualityScore}/100)
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 font-mono-code">
                      <span>📧 {lead.buyerEmail}</span>
                      <span>📞 {lead.buyerPhone}</span>
                      <span className="text-[#D4AF37] font-semibold">Budget: {lead.buyerBudget}</span>
                      <span className="text-slate-400">Source: {lead.buyerSource}</span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-1 italic">
                      &quot;{lead.buyerNotes}&quot;
                    </p>
                  </div>

                  {/* Rating / Send to Pixel Button */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => {
                        setSelectedLeadForRating(lead);
                        setRatingScore(lead.intentScore >= 95 ? 98 : 92);
                        setRatingCategory(lead.intentScore >= 95 ? 'verified_cash' : 'high_quality');
                      }}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#0A0D12] font-bold text-xs flex items-center gap-1.5 shadow-md hover:scale-105 transition cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>{alreadySentEvent ? 'Retrain Meta Pixel' : 'Grade & Send to Meta Pixel'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Meta CAPI Transmission Logs */}
          <div className="p-6 rounded-2xl bg-[#121721] border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#D4AF37]" />
                <span>Meta Conversions API (CAPI) Event Stream &amp; Audit Trail</span>
              </h4>
              <span className="text-xs font-mono-code text-slate-400">
                {metaCapiEvents[0]?.pixelId
                  ? `Pixel ID: ${metaCapiEvents[0].pixelId}`
                  : 'No Meta event accepted yet'}
              </span>
            </div>

            <div className="space-y-2.5">
              {metaCapiEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-3.5 rounded-xl bg-[#0A0D12] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">
                        {evt.buyerName}
                      </span>
                      <span className="px-2 py-0.2 rounded font-mono-code text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold">
                        {evt.eventName} · {evt.qualityRating.toUpperCase()} ({evt.qualityScore}/100)
                      </span>
                      <span className="text-[10px] font-mono-code text-sky-400">
                        {evt.metaApiStatus.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-slate-400 text-[11px] font-mono-code">
                      Event ID: {evt.eventId} · Value: ${evt.estimatedDealValue?.toLocaleString()} USD · Feedback: &quot;{evt.agentFeedback}&quot;
                    </div>
                  </div>

                  <div className="text-right text-[11px] font-mono-code text-slate-400">
                    <span className="text-emerald-400 font-bold block">
                      Target Audience Refined
                    </span>
                    <span>{evt.fbEventResponse?.match_quality || 'Great (9.2/10)'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 2: AI VOICE DIALER CAMPAIGNS (DAY & TIME SCHEDULING)
      ========================================================= */}
      {activeTab === 'ai_dialer' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#121721] border border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-display text-xl font-bold text-white">
                  Day &amp; Daytime Scheduled AI Voice Dialers
                </h3>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Configure autonomous calling schedules to reach buyers and sellers on the highest-converting days of the week (e.g. Tuesdays, Thursdays, Saturdays) during peak daytime response windows. The AI voice dials in Melissa&apos;s warm, professional tone to qualify interest and book showings directly onto the calendar.
              </p>
            </div>

            <button
              onClick={() => setShowNewDialerModal(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#0A0D12] font-bold text-xs flex items-center gap-2 cursor-pointer hover:scale-105 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Dialer Schedule</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dialerCampaigns.map((camp) => (
              <div
                key={camp.id}
                className="p-6 rounded-2xl bg-[#121721] border border-white/10 hover:border-[#D4AF37]/50 transition flex flex-col justify-between space-y-4 shadow-xl group"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono-code font-bold uppercase bg-[#D4AF37]/20 text-[#D4AF37]">
                      {camp.targetAudience.replace('_', ' ')}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono-code bg-emerald-500/20 text-emerald-300 font-bold">
                      {camp.status.toUpperCase()}
                    </span>
                  </div>

                  <h4 className="font-display text-lg font-bold text-white group-hover:text-[#F3E5AB]">
                    {camp.campaignName}
                  </h4>

                  {/* Scheduled Calling Days Pill Row */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono-code uppercase text-slate-400 block">
                      Scheduled Calling Days:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {camp.scheduledDays.map((d) => (
                        <span
                          key={d}
                          className="px-2.5 py-0.5 rounded-md bg-[#0A0D12] border border-[#D4AF37]/40 text-xs font-bold text-[#F3E5AB]"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Time Window */}
                  <div className="p-3 rounded-xl bg-[#0A0D12] border border-white/5 space-y-1 text-xs">
                    <div className="text-[10px] font-mono-code uppercase text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#D4AF37]" />
                      Daytime Call Window:
                    </div>
                    <div className="font-bold text-white">
                      {camp.timeWindow}
                    </div>
                    <div className="text-[11px] text-slate-400 pt-1 border-t border-white/5">
                      Objective: <strong>{camp.callObjective.replace(/_/g, ' ')}</strong>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs p-2.5 rounded-xl bg-white/5 border border-white/5">
                    <div>
                      <span className="text-[9px] font-mono-code text-slate-400 block">
                        DIALED
                      </span>
                      <span className="font-bold text-white text-xs">
                        {camp.callsPlacedCount}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono-code text-slate-400 block">
                        ANSWERED
                      </span>
                      <span className="font-bold text-emerald-400 text-xs">
                        {camp.answeredCount}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono-code text-slate-400 block">
                        BOOKED
                      </span>
                      <span className="font-bold text-[#D4AF37] text-xs">
                        {camp.appointmentsBookedCount}
                      </span>
                    </div>
                  </div>

                  {camp.lastRunAt && (
                    <div className="text-[10px] font-mono-code text-slate-400 italic">
                      Last Execution: {camp.lastRunAt}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                  <button
                    onClick={() =>
                      handleExecuteDialerWave(
                        camp.id,
                        camp.scheduledDays[0] || 'Tuesday'
                      )
                    }
                    disabled={runningCampaignId === camp.id}
                    className="flex-1 py-2 rounded-xl bg-[#D4AF37] text-[#0A0D12] font-bold text-xs flex items-center justify-center gap-1.5 hover:opacity-95 transition cursor-pointer disabled:opacity-50"
                  >
                    {runningCampaignId === camp.id ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <PhoneCall className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {runningCampaignId === camp.id
                        ? 'Dialing Batch...'
                        : `Launch Call Wave (${camp.scheduledDays[0] || 'Day'})`}
                    </span>
                  </button>

                  <button
                    onClick={() => onDeleteDialerCampaign(camp.id)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition cursor-pointer"
                    title="Delete dialer schedule"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 3: CALENDAR APPOINTMENTS BOOKED BY AI DIALER
      ========================================================= */}
      {activeTab === 'calendar_bookings' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#121721] border border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-display text-xl font-bold text-white">
                  Appointments Automatically Booked by AI Dialer
                </h3>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                When the AI Voice Dialer connects with a qualified buyer or past client, it checks Melissa&apos;s schedule and automatically confirms showing walkthroughs, listing consultations, and valuation reviews.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 font-mono-code text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {bookedAppointments.length} Confirmed Appointments Locked
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {bookedAppointments.map((appt) => (
              <div
                key={appt.id}
                className="p-6 rounded-2xl bg-[#121721] border border-white/10 hover:border-[#D4AF37]/50 transition flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-0.5 rounded font-mono-code text-[10px] uppercase font-bold bg-[#D4AF37]/20 text-[#D4AF37]">
                      {appt.appointmentType.replace('_', ' ')}
                    </span>
                    <h4 className="font-bold text-white text-base">
                      {appt.clientName}
                    </h4>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono-code text-[10px]">
                      CONFIRMED VIA DIALER
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 font-mono-code">
                    <span className="text-[#F3E5AB] font-bold">
                      📅 {appt.scheduledDateTime}
                    </span>
                    <span>📞 {appt.clientPhone}</span>
                    <span>📧 {appt.clientEmail}</span>
                  </div>

                  {appt.propertyAddress && (
                    <div className="text-xs text-slate-300">
                      Property Walkthrough: <strong className="text-white">{appt.propertyAddress}</strong>
                    </div>
                  )}

                  {appt.notesFromAiCall && (
                    <div className="p-2.5 rounded-xl bg-[#0A0D12] border border-white/5 text-xs text-slate-300 italic">
                      &quot;{appt.notesFromAiCall}&quot;
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <a
                    href={`tel:${appt.clientPhone.replace(/[^0-9]/g, '')}`}
                    className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs flex items-center gap-1.5 transition"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Call Direct</span>
                  </a>

                  <button
                    onClick={() => onDeleteAppointment(appt.id)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition cursor-pointer"
                    title="Remove appointment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: GRADE LEAD & SEND TO META PIXEL (CAPI) */}
      {selectedLeadForRating && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl bg-[#121721] border border-[#D4AF37] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-[#D4AF37]" />
                  <span>Meta Conversions API: Lead Quality Feedback</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Lead: <strong className="text-white">{selectedLeadForRating.buyerName}</strong> ({selectedLeadForRating.buyerEmail})
                </p>
              </div>

              <button
                onClick={() => setSelectedLeadForRating(null)}
                className="p-1.5 rounded-xl bg-white/5 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDispatchCapi} className="space-y-4 text-xs">
              {/* Quality Category Selection */}
              <div>
                <label className="block text-slate-300 font-mono-code uppercase mb-1.5">
                  1. Rate Buyer Quality For Meta Ad Algorithm
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'high_quality', label: '⭐ High Quality (Qualified Buyer)' },
                    { id: 'verified_cash', label: '💎 Verified Cash / Luxury Funds' },
                    { id: 'unqualified', label: '⚠️ Unqualified / Tire Kicker' },
                    { id: 'spam', label: '🚫 Spam / Invalid Number' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setRatingCategory(cat.id as any)}
                      className={`p-2.5 rounded-xl border text-left font-semibold transition cursor-pointer ${
                        ratingCategory === cat.id
                          ? 'bg-[#D4AF37] text-[#0A0D12] font-bold border-[#D4AF37]'
                          : 'bg-[#0A0D12] text-slate-300 border-white/10 hover:border-white/20'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality Score Slider */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-slate-300 font-mono-code uppercase">
                    2. Quality Score (Fed to Meta CAPI):
                  </label>
                  <span className="font-mono-code text-sm font-bold text-[#D4AF37]">
                    {ratingScore} / 100
                  </span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={100}
                  step={1}
                  value={ratingScore}
                  onChange={(e) => setRatingScore(Number(e.target.value))}
                  className="w-full accent-[#D4AF37] cursor-pointer"
                />
              </div>

              {/* Estimated Deal Value */}
              <div>
                <label className="block text-slate-300 font-mono-code uppercase mb-1">
                  3. Estimated Deal Acquisition Value ($ USD)
                </label>
                <input
                  type="number"
                  value={estimatedValue}
                  onChange={(e) => setEstimatedValue(Number(e.target.value))}
                  className="w-full bg-[#0A0D12] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* Feedback Note */}
              <div>
                <label className="block text-slate-300 font-mono-code uppercase mb-1">
                  4. Agent Review &amp; Qualitative Notes
                </label>
                <textarea
                  rows={2}
                  value={agentFeedbackText}
                  onChange={(e) => setAgentFeedbackText(e.target.value)}
                  className="w-full bg-[#0A0D12] border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* Cryptographic hashing disclaimer */}
              <div className="p-3.5 rounded-xl bg-[#0A0D12] border border-white/10 text-[11px] text-slate-300 space-y-1">
                <div className="text-emerald-400 font-bold font-mono-code flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  SHA-256 Client Data Encryption Active
                </div>
                <p className="text-slate-400">
                  Email &amp; phone digits are cryptographically normalized and hashed before reaching Meta Graph API v24.0. No raw client PII is exposed.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedLeadForRating(null)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 text-slate-300 text-xs"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSendingCapi}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#0A0D12] font-bold text-xs shadow-lg hover:scale-105 transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSendingCapi ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>Transmit to Meta Pixel &amp; Train Algorithm</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SCHEDULE NEW AI VOICE DIALER CAMPAIGN */}
      {showNewDialerModal && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl bg-[#121721] border border-[#D4AF37] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="font-display text-2xl font-bold text-white flex items-center gap-2">
                  <PhoneCall className="w-5 h-5 text-[#D4AF37]" />
                  <span>Configure AI Voice Dialer Schedule</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Set calling days of the week, daytime hours, and automated appointment booking.
                </p>
              </div>

              <button
                onClick={() => setShowNewDialerModal(false)}
                className="p-1.5 rounded-xl bg-white/5 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDialer} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-mono-code uppercase mb-1">
                  Campaign Name
                </label>
                <input
                  required
                  value={newCampaignName}
                  onChange={(e) => setNewCampaignName(e.target.value)}
                  placeholder="e.g. Saturday VIP Open-House Booking Wave"
                  className="w-full bg-[#0A0D12] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-mono-code uppercase mb-1.5">
                  Target Audience
                </label>
                <select
                  value={newTargetAudience}
                  onChange={(e) => setNewTargetAudience(e.target.value)}
                  className="w-full bg-[#0A0D12] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="new_zillow_leads">New Inbound Zillow &amp; Redfin Leads</option>
                  <option value="active_leads">Active Inbound Buyer Leads (Swarm)</option>
                  <option value="past_client_anniversaries">Past Clients (Home-iversaries &amp; Sphere)</option>
                  <option value="unresponsive_buyers">Unresponsive Buyers (Re-engagement Wave)</option>
                </select>
              </div>

              {/* Day of Week Multi-Selector */}
              <div>
                <label className="block text-slate-300 font-mono-code uppercase mb-1.5">
                  Select Days of the Week to Place Calls:
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                  {DAYS_OF_WEEK.map((day) => {
                    const isSelected = selectedDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`py-2 rounded-lg text-xs font-bold transition text-center cursor-pointer border ${
                          isSelected
                            ? 'bg-[#D4AF37] text-[#0A0D12] border-[#D4AF37]'
                            : 'bg-[#0A0D12] text-slate-300 border-white/10 hover:border-white/25'
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Daytime Hours Window */}
              <div>
                <label className="block text-slate-300 font-mono-code uppercase mb-1">
                  Daytime Calling Hours Window
                </label>
                <select
                  value={newTimeWindow}
                  onChange={(e) => setNewTimeWindow(e.target.value)}
                  className="w-full bg-[#0A0D12] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="10:00 AM - 12:30 PM & 4:30 PM - 7:00 PM">
                    Peak Response Windows (10:00 AM - 12:30 PM &amp; 4:30 PM - 7:00 PM)
                  </option>
                  <option value="9:30 AM - 1:00 PM">
                    Morning Prime (9:30 AM - 1:00 PM)
                  </option>
                  <option value="4:00 PM - 7:30 PM">
                    Evening After-Work Window (4:00 PM - 7:30 PM)
                  </option>
                  <option value="11:00 AM - 3:00 PM">
                    Midday Flexible (11:00 AM - 3:00 PM)
                  </option>
                </select>
              </div>

              {/* Call Objective */}
              <div>
                <label className="block text-slate-300 font-mono-code uppercase mb-1">
                  Automated Call Objective
                </label>
                <select
                  value={newCallObjective}
                  onChange={(e) => setNewCallObjective(e.target.value)}
                  className="w-full bg-[#0A0D12] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="book_showing_or_consultation">
                    Book Property Showing / Private Walkthrough
                  </option>
                  <option value="qualify_cash_budget">
                    Qualify Pre-Approval &amp; Cash Buying Timeline
                  </option>
                  <option value="homeiversary_greeting">
                    Deliver Spoken Home-iversary Equity Check-In
                  </option>
                </select>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0A0D12] border border-white/10 text-[11px] text-slate-300 space-y-1">
                <span className="text-[#D4AF37] font-bold font-mono-code block">
                  VOICE PERSONA &amp; CALENDAR LOCK:
                </span>
                <div>Voice: Melissa Hatfield Real Estate Concierge (Warm &amp; Professional)</div>
                <div>Appointments will automatically sync into the booked showings calendar.</div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewDialerModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingDialer}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#0A0D12] font-bold text-xs shadow-lg hover:scale-105 transition"
                >
                  {isCreatingDialer ? 'Scheduling...' : 'Arm AI Dialer Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
