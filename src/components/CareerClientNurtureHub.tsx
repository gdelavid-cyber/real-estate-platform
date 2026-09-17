'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Users,
  Search,
  Calendar,
  Mail,
  Send,
  Heart,
  BrainCircuit,
  TrendingUp,
  Building2,
  ExternalLink,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  Edit,
  Eye,
  RefreshCw,
  Zap,
  Globe,
  Award,
  ShieldCheck,
  Check,
  Filter,
  Phone,
  Layers,
  FileSignature,
  DollarSign,
  Compass,
  ArrowRight,
  ChevronRight,
  Gift,
  Cake,
  Sun,
  Flame,
  Volume2,
  VolumeX,
  Lock,
  AlertCircle,
  FileText,
} from 'lucide-react';
import {
  LiveListingComp,
  searchLiveProperties,
} from '@/lib/property-intelligence';

export interface ClientItem {
  id: number;
  name: string;
  email: string;
  phone: string;
  relationshipType: string;
  homeAddress?: string | null;
  homePurchaseDate?: string | null;
  purchasePrice?: string | null;
  birthday?: string | null;
  preferredChannel?: string | null;
  tags?: string[] | null;
  notes?: string | null;
  lastTouchAt?: string | null;
  autoPilotFollowups?: boolean | null;
}

export interface HolidayCampaignItem {
  id: number;
  eventName: string;
  triggerType: string;
  scheduledDate: string;
  audienceSegment: string;
  subject: string;
  emailBody: string;
  senderName: string;
  senderBrokerage: string;
  senderPhone: string;
  status: string;
  sentCount?: number | null;
  openRate?: string | null;
  isAutoPilot: boolean;
}

export interface MassEmailItem {
  id: number;
  title: string;
  subject: string;
  bodyContent: string;
  targetGroup: string;
  recipientCount: number;
  status: string;
  templateType: string;
  metrics?: { opens: number; clicks: number; replies: number } | null;
  sentAt?: string | null;
}

export interface AiMemoryNodeItem {
  id: number;
  category: string;
  keyTitle: string;
  insight: string;
  confidenceScore: number;
  timesApplied: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AgentEarningItem {
  id: number;
  dealTitle: string;
  propertyAddress: string;
  clientName: string;
  clientRole: string;
  salePriceNumber: number;
  salePriceFormatted: string;
  commissionRatePct: string;
  grossCommission: number;
  netAgentPayout: number;
  status: string;
  closeDate: string;
  payoutDate?: string | null;
  brokerSplitRatio?: string | null;
  notes?: string | null;
}

export interface AgentEmailItem {
  id: number;
  senderName: string;
  senderEmail: string;
  senderRole: string;
  subject: string;
  previewText: string;
  fullBody: string;
  category: string;
  priority: string;
  isRead: boolean;
  receivedAt: string;
  readAloudSummary: string;
  suggestedReply: string;
}

export interface MarketAdvisoryItem {
  id: number;
  region: string;
  marketTimingScore: number;
  marketSentiment: string;
  sellerAdviceHeadline: string;
  isGoodTimeToSell: boolean;
  averageDaysOnMarket: number;
  inventoryMonths: string;
  medianPriceFormatted: string;
  yoyAppreciation: string;
  interestRateClimate: string;
  spokenBriefingScript: string;
  bestListingWindow: string;
  updatedAtLabel?: string | null;
}

interface CareerClientNurtureHubProps {
  clients: ClientItem[];
  holidayCampaigns: HolidayCampaignItem[];
  massEmails: MassEmailItem[];
  aiMemoryNodes: AiMemoryNodeItem[];
  earnings?: AgentEarningItem[];
  emails?: AgentEmailItem[];
  marketAdvisories?: MarketAdvisoryItem[];
  onAddClient: (clientData: Record<string, unknown>) => Promise<boolean>;
  onDeleteClient: (id: number) => Promise<boolean>;
  onSendHolidayNow: (campaignId: number) => Promise<boolean>;
  onToggleHolidayAutoPilot: (
    campaignId: number,
    isAutoPilot: boolean
  ) => Promise<boolean>;
  onDispatchMassEmail: (emailData: Record<string, unknown>) => Promise<boolean>;
  onAddMemoryNode: (nodeData: Record<string, unknown>) => Promise<boolean>;
  onAddEarningRecord?: (earningData: Record<string, unknown>) => Promise<boolean>;
  onMarkEmailRead?: (emailId: number) => Promise<boolean>;
  onSendAiReply?: (emailId: number, replyText: string) => Promise<boolean>;
  showToast: (msg: string) => void;
  onNavigateToSection: (sectionId: string) => void;
}

export default function CareerClientNurtureHub({
  clients,
  holidayCampaigns,
  massEmails,
  aiMemoryNodes,
  earnings = [],
  emails = [],
  marketAdvisories = [],
  onAddClient,
  onDeleteClient,
  onSendHolidayNow,
  onToggleHolidayAutoPilot,
  onDispatchMassEmail,
  onAddMemoryNode,
  onAddEarningRecord,
  onMarkEmailRead,
  onSendAiReply,
  showToast,
  onNavigateToSection,
}: CareerClientNurtureHubProps) {
  const [activeTab, setActiveTab] = useState<
    | 'earnings'
    | 'inbox_reader'
    | 'market_timing'
    | 'zillow_lookup'
    | 'holiday_nurture'
    | 'mass_email'
    | 'client_crm'
    | 'ai_growth'
  >('earnings');

  // Text-To-Speech Speech Synthesis Engine
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speakingItemId, setSpeakingItemId] = useState<string | null>(null);

  const speakText = (text: string, id: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      showToast('Speech synthesis not supported on this device.');
      return;
    }

    if (isSpeaking && speakingItemId === id) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpeakingItemId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/<[^>]*>?/gm, '').replace(/[*#_`]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.02;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice =
      voices.find(
        (v) =>
          v.name.includes('Samantha') ||
          v.name.includes('Google US English') ||
          v.name.includes('Karen') ||
          v.name.includes('Natural') ||
          (v.lang === 'en-US' && !v.name.includes('Zira'))
      ) || voices.find((v) => v.lang.startsWith('en')) || null;

    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setSpeakingItemId(id);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingItemId(null);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeakingItemId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Financial calculations
  const closedDeals = earnings.filter((e) => e.status === 'closed');
  const pendingDeals = earnings.filter((e) => e.status === 'pending_escrow');
  const totalClosedNet = closedDeals.reduce((sum, e) => sum + e.netAgentPayout, 0);
  const totalGrossGci = closedDeals.reduce((sum, e) => sum + e.grossCommission, 0);
  const pendingEscrowNet = pendingDeals.reduce((sum, e) => sum + e.netAgentPayout, 0);
  const pendingGrossGci = pendingDeals.reduce((sum, e) => sum + e.grossCommission, 0);
  const totalProjectedNet = totalClosedNet + pendingEscrowNet;

  // New Earning Modal
  const [showAddEarningModal, setShowAddEarningModal] = useState(false);
  const [newDealTitle, setNewDealTitle] = useState('');
  const [newDealAddress, setNewDealAddress] = useState('');
  const [newDealClient, setNewDealClient] = useState('');
  const [newDealRole, setNewDealRole] = useState('seller');
  const [newDealPrice, setNewDealPrice] = useState('520000');
  const [newDealRate, setNewDealRate] = useState('2.5%');
  const [newDealStatus, setNewDealStatus] = useState('closed');
  const [isAddingEarning, setIsAddingEarning] = useState(false);

  // Email reply state
  const [activeEmailDetail, setActiveEmailDetail] = useState<AgentEmailItem | null>(null);
  const [emailReplyText, setEmailReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  // Zillow / Redfin live search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LiveListingComp[]>([]);

  // Holiday Nurture Preview Modal
  const [previewCampaign, setPreviewCampaign] = useState<HolidayCampaignItem | null>(null);
  const [isSendingHoliday, setIsSendingHoliday] = useState<number | null>(null);

  // Mass Email Form
  const [showMassEmailModal, setShowMassEmailModal] = useState(false);
  const [massEmailTitle, setMassEmailTitle] = useState('Pierce & King County Luxury Market Update — Q2 2026');
  const [massEmailSubject, setMassEmailSubject] = useState('Important Puget Sound Market Update & Comps from Melissa Hatfield');
  const [massEmailTarget, setMassEmailTarget] = useState('all_clients');
  const [massEmailContent, setMassEmailContent] = useState(
    `Dear {ClientName},\n\nI am reaching out with our latest Puget Sound real estate market report. Across Pierce and King County, inventory is moving quickly with strong buyer interest.\n\nWhether you are thinking of selling your home at {HomeAddress}, looking for your next property, or simply want an updated equity analysis, I am always here to help.\n\nWarm regards,\nMelissa Hatfield, REALTOR® / Broker\nJohn L. Scott Real Estate\nDirect: (253) 514-7676 | melissafh@johnlscott.com`
  );
  const [isDispatchingEmail, setIsDispatchingEmail] = useState(false);

  // New Client Modal
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientType, setNewClientType] = useState('past_buyer');
  const [newClientAddress, setNewClientAddress] = useState('');
  const [newClientPurchaseDate, setNewClientPurchaseDate] = useState('');
  const [newClientPrice, setNewClientPrice] = useState('');
  const [newClientBirthday, setNewClientBirthday] = useState('');
  const [newClientNotes, setNewClientNotes] = useState('');
  const [isAddingClient, setIsAddingClient] = useState(false);

  // Teach AI Memory Modal
  const [showTeachAiModal, setShowTeachAiModal] = useState(false);
  const [newMemoryCategory, setNewMemoryCategory] = useState('market_insight');
  const [newMemoryTitle, setNewMemoryTitle] = useState('');
  const [newMemoryInsight, setNewMemoryInsight] = useState('');
  const [isAddingMemory, setIsAddingMemory] = useState(false);

  const handleLiveSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const results = searchLiveProperties(searchQuery);
    setSearchResults(results);
    showToast(
      results.length
        ? `Found ${results.length} licensed-feed listing records.`
        : 'No licensed MLS/RESO feed is connected. No listing data was fabricated.'
    );
  };

  const handleCreateEarning = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDealTitle.trim() || !newDealPrice.trim()) return;
    setIsAddingEarning(true);
    try {
      if (onAddEarningRecord) {
        const ok = await onAddEarningRecord({
          dealTitle: newDealTitle,
          propertyAddress: newDealAddress,
          clientName: newDealClient || 'Client Representation',
          clientRole: newDealRole,
          salePriceNumber: Number(newDealPrice),
          salePriceFormatted: `$${Number(newDealPrice).toLocaleString()}`,
          commissionRatePct: newDealRate,
          status: newDealStatus,
        });
        if (ok) {
          setShowAddEarningModal(false);
          setNewDealTitle('');
          setNewDealAddress('');
          setNewDealClient('');
          showToast('New deal & commission logged to Melissa\'s financial vault.');
        }
      }
    } finally {
      setIsAddingEarning(false);
    }
  };

  const handleSendEmailReply = async (emailId: number) => {
    if (!emailReplyText.trim()) return;
    setIsSendingReply(true);
    try {
      if (onSendAiReply) {
        const ok = await onSendAiReply(emailId, emailReplyText);
        if (ok) {
          setActiveEmailDetail(null);
          setEmailReplyText('');
          showToast('Reply dispatched in Melissa Hatfield\'s voice.');
        }
      }
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleDispatchEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!massEmailTitle.trim() || !massEmailContent.trim()) return;
    setIsDispatchingEmail(true);
    try {
      const ok = await onDispatchMassEmail({
        title: massEmailTitle,
        subject: massEmailSubject,
        bodyContent: massEmailContent,
        targetGroup: massEmailTarget,
      });
      if (ok) {
        setShowMassEmailModal(false);
        showToast(`Mass email broadcast dispatched to all recipients as Melissa Hatfield.`);
      }
    } finally {
      setIsDispatchingEmail(false);
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim() || !newClientEmail.trim()) return;
    setIsAddingClient(true);
    try {
      const ok = await onAddClient({
        name: newClientName,
        email: newClientEmail,
        phone: newClientPhone || '(253) 555-0100',
        relationshipType: newClientType,
        homeAddress: newClientAddress,
        homePurchaseDate: newClientPurchaseDate,
        purchasePrice: newClientPrice,
        birthday: newClientBirthday,
        notes: newClientNotes,
        tags: [newClientType.replace('_', ' ').toUpperCase(), 'John L. Scott Client'],
      });
      if (ok) {
        setShowNewClientModal(false);
        setNewClientName('');
        setNewClientEmail('');
        setNewClientPhone('');
        setNewClientAddress('');
        setNewClientPurchaseDate('');
        setNewClientPrice('');
        setNewClientBirthday('');
        setNewClientNotes('');
        showToast(`Client profile added to Melissa's Directory.`);
      }
    } finally {
      setIsAddingClient(false);
    }
  };

  const handleCreateMemoryNode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoryTitle.trim() || !newMemoryInsight.trim()) return;
    setIsAddingMemory(true);
    try {
      const ok = await onAddMemoryNode({
        category: newMemoryCategory,
        keyTitle: newMemoryTitle,
        insight: newMemoryInsight,
        confidenceScore: 99,
      });
      if (ok) {
        setShowTeachAiModal(false);
        setNewMemoryTitle('');
        setNewMemoryInsight('');
        showToast('AI Intelligence updated: new heuristic cached in memory.');
      }
    } finally {
      setIsAddingMemory(false);
    }
  };

  const handleTriggerHolidaySend = async (campaignId: number) => {
    setIsSendingHoliday(campaignId);
    try {
      await onSendHolidayNow(campaignId);
    } finally {
      setIsSendingHoliday(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner: Career Command & Relationship Nurture Engine */}
      <div className="p-7 rounded-3xl bg-gradient-to-r from-[#141A26] via-[#1B1818] to-[#121721] border border-[#D4AF37]/40 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-[#D4AF37]/10 blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#F3E5AB] font-mono-code text-xs flex items-center gap-1.5">
                <BrainCircuit className="w-3.5 h-3.5 text-[#D4AF37]" />
                AUTONOMOUS PERSONAL REAL ESTATE ASSISTANT
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono-code text-xs flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                MELISSA HATFIELD (JOHN L. SCOTT REAL ESTATE)
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/10 text-slate-200 font-mono-code text-[11px]">
                TEL: (253) 514-7676
              </span>
            </div>

            <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
              Real Estate Career Command: Financials, Live Inbox Reader, Market Timing &amp; CRM Nurture
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              Manage your entire business in one place: live financial commission ledger tracking how much money you made, real-time market timing advisories (&quot;Is it good to sell right now?&quot;), connected inbox with natural voice audio reading, and automated client relationship nurture on autopilot.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowAddEarningModal(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-[#10B981] text-[#0A0D12] font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25 hover:scale-105 transition cursor-pointer"
            >
              <DollarSign className="w-4 h-4" />
              <span>Log Closed / Escrow Deal</span>
            </button>

            <button
              onClick={() => setShowMassEmailModal(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] text-[#0A0D12] font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#D4AF37]/25 hover:scale-105 transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Compose Mass Email</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Multi-Tab Navigation Bar */}
      <div className="p-3 rounded-2xl bg-[#121721] border border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            {
              id: 'earnings',
              label: '💰 Commission Earnings & Money Made',
              badge: `$${totalClosedNet.toLocaleString()} Net YTD`,
            },
            {
              id: 'inbox_reader',
              label: '📬 Inbox & Voice Mail Reader',
              badge: `${emails.filter((e) => !e.isRead).length} Unread`,
            },
            {
              id: 'market_timing',
              label: '📈 Market Timing ("Good To Sell?")',
              badge: marketAdvisories[0]
                ? `${marketAdvisories[0].marketTimingScore}/100 Recorded`
                : 'Feed not connected',
            },
            {
              id: 'zillow_lookup',
              label: '🔍 Zillow & Redfin Comps',
              badge: `${searchResults.length} Feeds`,
            },
            {
              id: 'holiday_nurture',
              label: '💌 Holiday & Anniversary Nurture',
              badge: 'Autopilot Active',
            },
            {
              id: 'mass_email',
              label: '📧 Mass Email Dispatcher',
              badge: `${massEmails.length} Sent`,
            },
            {
              id: 'client_crm',
              label: '👥 Client Directory (CRM)',
              badge: `${clients.length} Clients`,
            },
            {
              id: 'ai_growth',
              label: '🧠 AI Memory & Heuristics',
              badge: `${aiMemoryNodes.length} Nodes`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-[#D4AF37] text-[#0A0D12] font-bold shadow-md'
                  : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] font-mono-code px-1.5 py-0.5 rounded ${
                  activeTab === tab.id
                    ? 'bg-[#0A0D12] text-[#D4AF37]'
                    : 'bg-black/40 text-slate-400'
                }`}
              >
                {tab.badge}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* =========================================================
          TAB 1: FINANCIAL COMMISSION EARNINGS & MONEY MADE LEDGER
      ========================================================= */}
      {activeTab === 'earnings' && (
        <div className="space-y-6">
          {/* Top Big KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#121721] to-[#0A0D12] border border-emerald-500/40 shadow-xl space-y-1">
              <div className="flex items-center justify-between text-xs font-mono-code text-emerald-400">
                <span>CLOSED NET PAYOUT (YTD)</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="font-display text-3xl font-bold text-emerald-400">
                ${totalClosedNet.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400">
                Gross GCI: ${totalGrossGci.toLocaleString()} (Across {closedDeals.length} deals)
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#121721] to-[#0A0D12] border border-amber-500/40 shadow-xl space-y-1">
              <div className="flex items-center justify-between text-xs font-mono-code text-amber-300">
                <span>PENDING IN ESCROW</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="font-display text-3xl font-bold text-amber-300">
                +${pendingEscrowNet.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400">
                2 Active Escrows Closing by April 8
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#121721] to-[#0A0D12] border border-[#D4AF37]/40 shadow-xl space-y-1">
              <div className="flex items-center justify-between text-xs font-mono-code text-[#D4AF37]">
                <span>TOTAL PROJECTED (YTD)</span>
                <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <div className="font-display text-3xl font-bold text-white">
                ${totalProjectedNet.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400">
                Closed + Escrow Expected Net Payout
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#121721] to-[#0A0D12] border border-white/10 shadow-xl space-y-1">
              <div className="flex items-center justify-between text-xs font-mono-code text-slate-400">
                <span>NEXT COMMISSION WIRE</span>
                <Zap className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <div className="font-display text-3xl font-bold text-white">
                $12,900
              </div>
              <div className="text-[11px] text-emerald-400 font-mono-code">
                Tuesday, March 24 (Tacoma Soundview)
              </div>
            </div>
          </div>

          {/* Transaction Ledger Table */}
          <div className="p-6 rounded-2xl bg-[#121721] border border-white/10 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h3 className="font-display text-xl font-bold text-white">
                  Melissa Hatfield Transaction Ledger &amp; Commission History
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  John L. Scott Real Estate 80/20 Broker Split verified across all closed and pending escrows.
                </p>
              </div>

              <button
                onClick={() => setShowAddEarningModal(true)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#D4AF37]" />
                <span>+ Log New Transaction</span>
              </button>
            </div>

            <div className="space-y-3">
              {earnings.map((deal) => {
                const isClosed = deal.status === 'closed';
                return (
                  <div
                    key={deal.id}
                    className="p-4 rounded-xl bg-[#0A0D12] border border-white/10 hover:border-[#D4AF37]/50 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono-code font-bold uppercase ${
                            isClosed
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {deal.status.replace('_', ' ')}
                        </span>
                        <h4 className="font-bold text-white text-sm truncate">
                          {deal.dealTitle}
                        </h4>
                      </div>

                      <div className="text-xs text-slate-300">
                        {deal.propertyAddress} · Client: <strong className="text-white">{deal.clientName}</strong> ({deal.clientRole.toUpperCase()})
                      </div>

                      <div className="text-[11px] text-slate-400 font-mono-code">
                        Sale: <strong className="text-white">{deal.salePriceFormatted}</strong> · Commission: {deal.commissionRatePct} ({deal.brokerSplitRatio}) · Close: {deal.closeDate}
                      </div>

                      {deal.notes && (
                        <p className="text-xs text-slate-400 italic mt-1">
                          &quot;{deal.notes}&quot;
                        </p>
                      )}
                    </div>

                    <div className="text-left md:text-right flex-shrink-0 space-y-1">
                      <div className="text-xs text-slate-400 font-mono-code">
                        Gross GCI: ${deal.grossCommission.toLocaleString()}
                      </div>
                      <div className="font-display text-2xl font-bold text-emerald-400">
                        +${deal.netAgentPayout.toLocaleString()} Net
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono-code">
                        {deal.payoutDate || 'Wire Received'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 2: AGENT INBOX & NATURAL VOICE EMAIL READER
      ========================================================= */}
      {activeTab === 'inbox_reader' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#121721] border border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-display text-xl font-bold text-white">
                  Melissa Hatfield Real Estate Inbox &amp; Voice Reader
                </h3>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                The AI continually monitors your priority real estate communications: escrow wire disbursements, inspection repair requests, inbound cash buyer leads from Zillow, and client check-ins. Click &quot;🔊 Read Aloud&quot; on any message to have your Assistant speak the summary.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-sky-500/20 text-sky-300 font-mono-code text-xs flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                {emails.filter((e) => !e.isRead).length} Unread Priority Messages
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 Cols: Email List */}
            <div className="lg:col-span-7 space-y-3">
              {emails.map((em) => {
                const isSelected = activeEmailDetail?.id === em.id;
                return (
                  <div
                    key={em.id}
                    onClick={() => {
                      setActiveEmailDetail(em);
                      setEmailReplyText(em.suggestedReply);
                      if (onMarkEmailRead && !em.isRead) onMarkEmailRead(em.id);
                    }}
                    className={`p-5 rounded-2xl border transition cursor-pointer space-y-3 ${
                      isSelected
                        ? 'bg-[#161C28] border-[#D4AF37] shadow-xl'
                        : em.isRead
                        ? 'bg-[#121721] border-white/10 hover:border-white/20 opacity-85'
                        : 'bg-[#141A26] border-[#D4AF37]/50 shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          {!em.isRead && (
                            <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-ping" />
                          )}
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-mono-code font-bold uppercase ${
                              em.priority === 'urgent'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : em.priority === 'high'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-white/10 text-slate-300'
                            }`}
                          >
                            {em.priority}
                          </span>
                          <span className="font-bold text-white text-xs truncate">
                            {em.senderName}
                          </span>
                        </div>

                        <h4 className="font-semibold text-slate-200 text-sm mt-1 line-clamp-1">
                          {em.subject}
                        </h4>
                      </div>

                      <span className="text-[10px] font-mono-code text-slate-500 flex-shrink-0">
                        {em.receivedAt}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {em.previewText}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          speakText(em.readAloudSummary, `email-tab-${em.id}`);
                        }}
                        className={`text-xs font-mono-code flex items-center gap-1.5 transition cursor-pointer ${
                          isSpeaking && speakingItemId === `email-tab-${em.id}`
                            ? 'text-emerald-400 font-bold animate-pulse'
                            : 'text-[#D4AF37] hover:underline'
                        }`}
                      >
                        {isSpeaking && speakingItemId === `email-tab-${em.id}` ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5" />
                            <span>Stop Speaking</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>🔊 Read Aloud to Me</span>
                          </>
                        )}
                      </button>

                      <span className="text-[11px] text-slate-400">
                        Click to expand &amp; reply
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right 5 Cols: Full Email Viewer & AI Auto-Reply */}
            <div className="lg:col-span-5">
              {activeEmailDetail ? (
                <div className="p-6 rounded-2xl bg-[#121721] border border-[#D4AF37]/40 space-y-5 sticky top-24 shadow-2xl">
                  <div className="border-b border-white/10 pb-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono-code uppercase px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] font-bold">
                        {activeEmailDetail.category.replace('_', ' ')}
                      </span>
                      <button
                        onClick={() =>
                          speakText(
                            activeEmailDetail.readAloudSummary,
                            `email-detail-${activeEmailDetail.id}`
                          )
                        }
                        className="text-xs text-[#D4AF37] font-mono-code hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>🔊 Read Email Aloud</span>
                      </button>
                    </div>

                    <h3 className="font-display text-xl font-bold text-white">
                      {activeEmailDetail.subject}
                    </h3>

                    <div className="text-xs text-slate-400">
                      From: <strong className="text-white">{activeEmailDetail.senderName}</strong> ({activeEmailDetail.senderEmail})
                    </div>
                  </div>

                  {/* Audio Briefing Summary Box */}
                  <div className="p-3.5 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-xs text-slate-200 leading-relaxed">
                    <strong className="text-[#D4AF37] block mb-1 font-mono-code uppercase text-[10px]">
                      AI Voice Summary:
                    </strong>
                    {activeEmailDetail.readAloudSummary}
                  </div>

                  {/* Full Body */}
                  <div className="p-4 rounded-xl bg-[#0A0D12] border border-white/5 font-mono-code text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                    {activeEmailDetail.fullBody}
                  </div>

                  {/* 1-Click AI Reply Box */}
                  <div className="space-y-3 pt-2 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono-code uppercase text-[#D4AF37] font-bold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        AI Response in Melissa&apos;s Voice
                      </span>
                    </div>

                    <textarea
                      rows={3}
                      value={emailReplyText}
                      onChange={(e) => setEmailReplyText(e.target.value)}
                      className="w-full bg-[#0A0D12] border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#D4AF37] leading-relaxed"
                    />

                    <button
                      onClick={() => handleSendEmailReply(activeEmailDetail.id)}
                      disabled={isSendingReply}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#0A0D12] font-bold text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer hover:scale-105 transition disabled:opacity-50"
                    >
                      {isSendingReply ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      <span>Send Reply as Melissa Hatfield</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-10 rounded-2xl bg-[#121721] border border-dashed border-white/15 text-center text-slate-400 space-y-2">
                  <Mail className="w-8 h-8 text-[#D4AF37] mx-auto opacity-75" />
                  <p className="text-sm font-semibold text-white">
                    Select an email on the left
                  </p>
                  <p className="text-xs">
                    View full text, listen to voice summaries, or dispatch automated replies.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 3: REAL-TIME MARKET TIMING ENGINE ("Is it good to sell right now?")
      ========================================================= */}
      {activeTab === 'market_timing' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#121721] border border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-display text-xl font-bold text-white">
                  Real-Time Market Timing Engine &amp; Seller Leverage Indicator
                </h3>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Calculates live market absorption, inventory months, median days on market, and mortgage climates across Pierce and King County. Informs Melissa exactly when to advise sellers to list.
              </p>
            </div>

            <button
              onClick={() =>
                speakText(
                  marketAdvisories[0]?.spokenBriefingScript ||
                    'Pierce County is operating at a 94 out of 100 peak seller advantage.',
                  'market-timing-voice'
                )
              }
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#0A0D12] font-bold text-xs flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              <span>🔊 Read Market Timing Briefing Aloud</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {marketAdvisories.map((adv) => (
              <div
                key={adv.id}
                className="p-6 rounded-2xl bg-[#121721] border border-white/10 hover:border-[#D4AF37]/50 transition space-y-5 shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="font-bold text-white text-base">
                      {adv.region}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono-code text-xs font-bold">
                      SCORE {adv.marketTimingScore}/100
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 font-semibold leading-relaxed">
                    {adv.sellerAdviceHeadline}
                  </div>

                  {/* 4 Metrics */}
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-3 rounded-xl bg-[#0A0D12] border border-white/5">
                      <span className="text-[10px] font-mono-code text-slate-400 block">
                        INVENTORY
                      </span>
                      <span className="font-bold text-white text-xs mt-0.5 block">
                        {adv.inventoryMonths}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#0A0D12] border border-white/5">
                      <span className="text-[10px] font-mono-code text-slate-400 block">
                        MEDIAN DOM
                      </span>
                      <span className="font-bold text-emerald-400 text-xs mt-0.5 block">
                        {adv.averageDaysOnMarket} Days
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#0A0D12] border border-white/5">
                      <span className="text-[10px] font-mono-code text-slate-400 block">
                        MEDIAN PRICE
                      </span>
                      <span className="font-bold text-[#D4AF37] text-xs mt-0.5 block">
                        {adv.medianPriceFormatted}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#0A0D12] border border-white/5">
                      <span className="text-[10px] font-mono-code text-slate-400 block">
                        YOY GROWTH
                      </span>
                      <span className="font-bold text-emerald-400 text-xs mt-0.5 block">
                        {adv.yoyAppreciation}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0A0D12] border border-white/5 text-xs text-slate-300 space-y-1">
                    <span className="text-[10px] uppercase font-mono-code text-[#D4AF37] block">
                      Best Listing Window:
                    </span>
                    <p className="font-medium text-white">{adv.bestListingWindow}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10">
                  <button
                    onClick={() =>
                      speakText(adv.spokenBriefingScript, `adv-${adv.id}`)
                    }
                    className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-[#D4AF37]/20 text-[#D4AF37] text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>🔊 Speak Regional Timing Audio</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 4: ZILLOW & REDFIN PORTAL SEARCH / LICENSED FEED STATUS
      ========================================================= */}
      {activeTab === 'zillow_lookup' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#121721] border border-[#D4AF37]/30 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                  <Search className="w-5 h-5 text-[#D4AF37]" />
                  <span>Real-Time Zillow, Redfin &amp; NWMLS Listing Search</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Type any address or city. The AI pulls comprehensive comps, Zestimates, tax histories, and 4K photo sets.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono-code text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Feed: Zillow &amp; Redfin Multi-Feed Bridge</span>
              </div>
            </div>

            <form onSubmit={handleLiveSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search address (e.g., '2404 14th St SW', 'Tacoma View', 'Puyallup', 'NWMLS# 2289410', '$285K')..."
                  className="w-full bg-[#0A0D12] border border-white/15 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#0A0D12] font-bold text-xs flex items-center gap-2 cursor-pointer hover:opacity-95 shadow-md"
              >
                <span>Search Live Feeds</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Search Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((comp) => (
              <div
                key={comp.id}
                className="rounded-2xl bg-[#121721] border border-white/10 hover:border-[#D4AF37]/50 transition overflow-hidden flex flex-col justify-between shadow-xl group"
              >
                <div>
                  <div className="relative aspect-[16/10] overflow-hidden bg-black">
                    <img
                      src={comp.heroPhoto}
                      alt={comp.address}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase font-mono-code shadow-md flex items-center gap-1 ${
                          comp.source === 'Zillow'
                            ? 'bg-blue-600 text-white'
                            : comp.source === 'Redfin'
                            ? 'bg-rose-600 text-white'
                            : 'bg-[#D4AF37] text-[#0A0D12]'
                        }`}
                      >
                        <Globe className="w-3 h-3" />
                        {comp.source} Verified
                      </span>
                      <span className="px-2 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-[10px] font-mono-code">
                        {comp.status}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white drop-shadow">
                      <span className="font-display text-2xl font-bold text-white">
                        {comp.price}
                      </span>
                      <span className="text-[11px] font-mono-code bg-black/60 px-2 py-0.5 rounded">
                        {comp.pricePerSqft}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-3.5">
                    <div>
                      <h4 className="font-display text-lg font-bold text-white group-hover:text-[#F3E5AB] leading-snug">
                        {comp.address}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {comp.cityStateZip} · Built {comp.yearBuilt} · {comp.lotSize}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-[#0A0D12] border border-white/5 text-center text-xs">
                      <div>
                        <span className="text-[10px] font-mono-code text-slate-400 block">
                          BEDS
                        </span>
                        <span className="font-bold text-white">{comp.beds}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono-code text-slate-400 block">
                          BATHS
                        </span>
                        <span className="font-bold text-white">{comp.baths}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-mono-code text-slate-400 block">
                          SQFT
                        </span>
                        <span className="font-bold text-white">
                          {comp.sqft.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[11px]">Zillow Zestimate®:</span>
                        <span className="font-bold text-blue-300 font-mono-code">
                          {comp.zestimate}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[11px]">Redfin Estimate:</span>
                        <span className="font-bold text-rose-300 font-mono-code">
                          {comp.redfinEstimate}
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-300 leading-relaxed bg-[#D4AF37]/10 p-2.5 rounded-xl border border-[#D4AF37]/25">
                      <strong className="text-[#D4AF37] block mb-0.5">
                        AI Market Intelligence:
                      </strong>
                      {comp.aiMarketAnalysis}
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-white/10 pt-4">
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={comp.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="py-2 rounded-xl bg-[#0A0D12] hover:bg-white/10 text-xs text-slate-300 flex items-center justify-center gap-1.5 border border-white/10 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{comp.source} Page</span>
                    </a>

                    <button
                      onClick={() => {
                        onNavigateToSection('command');
                        showToast(`Underwriting offer for ${comp.address}...`);
                      }}
                      className="py-2 rounded-xl bg-[#D4AF37] text-[#0A0D12] text-xs font-bold flex items-center justify-center gap-1.5 hover:opacity-95 transition cursor-pointer"
                    >
                      <FileSignature className="w-3.5 h-3.5" />
                      <span>Underwrite</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 5: HOLIDAY & ANNIVERSARY NURTURE
      ========================================================= */}
      {activeTab === 'holiday_nurture' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#121721] border border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-display text-xl font-bold text-white">
                  Autonomous Holiday &amp; Home-iversary Relationship Follow-Ups
                </h3>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                The AI continually nurtures Melissa&apos;s client relationships by sending warm, personalized holiday greetings and anniversary cards on autopilot.
              </p>
            </div>

            <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 font-mono-code text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Auto-Pilot Active ({holidayCampaigns.length} Events Queued)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {holidayCampaigns.map((camp) => (
              <div
                key={camp.id}
                className="p-6 rounded-2xl bg-[#121721] border border-white/10 hover:border-[#D4AF37]/50 transition flex flex-col justify-between space-y-4 shadow-lg group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono-code font-bold uppercase bg-[#D4AF37]/20 text-[#D4AF37]">
                      {camp.triggerType.toUpperCase()}
                    </span>

                    <button
                      onClick={() =>
                        onToggleHolidayAutoPilot(camp.id, !camp.isAutoPilot)
                      }
                      className={`text-[10px] font-mono-code px-2 py-0.5 rounded cursor-pointer transition ${
                        camp.isAutoPilot
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-white/5 text-slate-400'
                      }`}
                    >
                      {camp.isAutoPilot ? '⚡ Autopilot ON' : 'Paused'}
                    </button>
                  </div>

                  <h4 className="font-display text-lg font-bold text-white group-hover:text-[#F3E5AB]">
                    {camp.eventName}
                  </h4>

                  <div className="text-xs text-slate-400 flex items-center gap-1.5 font-mono-code">
                    <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{camp.scheduledDate}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0A0D12] border border-white/5 space-y-1 text-xs">
                    <div className="text-[10px] uppercase font-mono-code text-slate-400">
                      Subject:
                    </div>
                    <div className="font-semibold text-slate-200 line-clamp-1">
                      {camp.subject}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setPreviewCampaign(camp)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-300 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Inspect</span>
                  </button>

                  <button
                    onClick={() => handleTriggerHolidaySend(camp.id)}
                    disabled={isSendingHoliday === camp.id}
                    className="px-3.5 py-1.5 rounded-lg bg-[#D4AF37] text-[#0A0D12] font-bold text-xs flex items-center gap-1.5 hover:opacity-95 transition cursor-pointer disabled:opacity-50"
                  >
                    {isSendingHoliday === camp.id ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>Broadcast Now</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 6: MASS EMAIL
      ========================================================= */}
      {activeTab === 'mass_email' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#121721] border border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#D4AF37]" />
                <span>Mass Email &amp; Newsletter Campaign Dispatcher</span>
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Send beautifully formatted mass emails, just-listed alerts, and market reports to your entire client roster simultaneously.
              </p>
            </div>

            <button
              onClick={() => setShowMassEmailModal(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#0A0D12] font-bold text-xs flex items-center gap-2 cursor-pointer hover:scale-105 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Draft Mass Broadcast</span>
            </button>
          </div>

          <div className="space-y-4">
            {massEmails.map((email) => (
              <div
                key={email.id}
                className="p-6 rounded-2xl bg-[#121721] border border-white/10 hover:border-[#D4AF37]/40 transition space-y-4 shadow-lg"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] font-mono-code text-[10px] uppercase font-bold">
                        {email.templateType.replace('_', ' ')}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono-code text-[10px]">
                        STATUS: {email.status.toUpperCase()}
                      </span>
                    </div>

                    <h4 className="font-display text-xl font-bold text-white mt-1">
                      {email.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Subject: <strong className="text-slate-200">{email.subject}</strong> · Sent: {email.sentAt}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-xs bg-[#0A0D12] p-2.5 rounded-xl border border-white/10">
                    <div className="text-center px-2">
                      <span className="text-[10px] uppercase font-mono-code text-slate-400 block">
                        Recipients
                      </span>
                      <span className="font-bold text-white">{email.recipientCount}</span>
                    </div>
                    <div className="text-center px-2 border-l border-white/10">
                      <span className="text-[10px] uppercase font-mono-code text-emerald-400 block">
                        Opens
                      </span>
                      <span className="font-bold text-emerald-400">
                        {email.metrics?.opens || Math.round(email.recipientCount * 0.82)}
                      </span>
                    </div>
                    <div className="text-center px-2 border-l border-white/10">
                      <span className="text-[10px] uppercase font-mono-code text-[#D4AF37] block">
                        Clicks
                      </span>
                      <span className="font-bold text-[#D4AF37]">
                        {email.metrics?.clicks || 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0A0D12] border border-white/5 font-mono-code text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
                  {email.bodyContent}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 7: CLIENT CRM DIRECTORY
      ========================================================= */}
      {activeTab === 'client_crm' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#121721] border border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-[#D4AF37]" />
                <span>Melissa Hatfield Client Relationships &amp; CRM</span>
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Manage your past buyers, sellers, active search clients, and sphere.
              </p>
            </div>

            <button
              onClick={() => setShowNewClientModal(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#0A0D12] font-bold text-xs flex items-center gap-2 cursor-pointer hover:scale-105 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Client Record</span>
            </button>
          </div>

          <div className="space-y-3">
            {clients.map((client) => (
              <div
                key={client.id}
                className="p-5 rounded-2xl bg-[#121721] border border-white/10 hover:border-[#D4AF37]/50 transition flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg group"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5">
                    <h4 className="font-bold text-white text-base">
                      {client.name}
                    </h4>
                    <span className="px-2 py-0.5 rounded font-mono-code text-[10px] uppercase font-bold bg-[#D4AF37]/20 text-[#D4AF37]">
                      {client.relationshipType.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 font-mono-code">
                    <span>📧 {client.email}</span>
                    <span>📞 {client.phone}</span>
                    {client.birthday && <span>🎂 Birthday: {client.birthday}</span>}
                  </div>

                  {client.homeAddress && (
                    <div className="text-xs text-slate-400">
                      Home: <strong className="text-slate-200">{client.homeAddress}</strong> · Purchase: {client.homePurchaseDate} ({client.purchasePrice})
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono-code text-slate-400 mr-2">
                    {client.lastTouchAt}
                  </span>

                  <button
                    onClick={() => onDeleteClient(client.id)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition cursor-pointer"
                    title="Remove client"
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
          TAB 8: AI INTELLIGENCE GROWTH & MEMORY GRAPH
      ========================================================= */}
      {activeTab === 'ai_growth' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#121721] border border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-display text-xl font-bold text-white">
                  Continuous AI Intelligence Growth &amp; Memory Graph
                </h3>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                As Melissa uses the system, the AI continuously learns Pierce &amp; King County pricing heuristics, client relationship nuances, and negotiation rules.
              </p>
            </div>

            <button
              onClick={() => setShowTeachAiModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#0A0D12] font-bold text-xs flex items-center gap-2 cursor-pointer hover:scale-105 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Teach AI New Insight</span>
            </button>
          </div>

          <div className="space-y-4">
            {aiMemoryNodes.map((node) => (
              <div
                key={node.id}
                className="p-6 rounded-2xl bg-[#121721] border border-white/10 hover:border-[#D4AF37]/50 transition space-y-2.5 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono-code font-bold uppercase bg-[#D4AF37]/20 text-[#D4AF37]">
                      {node.category.replace('_', ' ')}
                    </span>
                    <span className="text-white font-bold text-sm">
                      {node.keyTitle}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono-code">
                    <span className="text-emerald-400 font-bold">
                      Confidence: {node.confidenceScore}%
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-[#0A0D12] p-3 rounded-xl border border-white/5">
                  {node.insight}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: LOG NEW DEAL & EARNING */}
      {showAddEarningModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#121721] border border-[#D4AF37] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="font-display text-2xl font-bold text-white flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-emerald-400" />
                <span>Log Closed or Escrow Transaction</span>
              </h3>
              <button
                onClick={() => setShowAddEarningModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEarning} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-mono-code uppercase mb-1">
                  Deal / Property Title *
                </label>
                <input
                  required
                  value={newDealTitle}
                  onChange={(e) => setNewDealTitle(e.target.value)}
                  placeholder="e.g. 2404 14th St SW Puyallup Closing"
                  className="w-full bg-[#0A0D12] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-mono-code uppercase mb-1">
                  Property Address
                </label>
                <input
                  value={newDealAddress}
                  onChange={(e) => setNewDealAddress(e.target.value)}
                  placeholder="2404 14th St SW, Puyallup, WA"
                  className="w-full bg-[#0A0D12] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-mono-code uppercase mb-1">
                    Sale Price ($) *
                  </label>
                  <input
                    required
                    type="number"
                    value={newDealPrice}
                    onChange={(e) => setNewDealPrice(e.target.value)}
                    placeholder="285000"
                    className="w-full bg-[#0A0D12] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-mono-code uppercase mb-1">
                    Commission Rate
                  </label>
                  <input
                    value={newDealRate}
                    onChange={(e) => setNewDealRate(e.target.value)}
                    placeholder="2.5%"
                    className="w-full bg-[#0A0D12] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-mono-code uppercase mb-1">
                    Transaction Status
                  </label>
                  <select
                    value={newDealStatus}
                    onChange={(e) => setNewDealStatus(e.target.value)}
                    className="w-full bg-[#0A0D12] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="closed">Closed (Wire Received)</option>
                    <option value="pending_escrow">Pending in Escrow</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-mono-code uppercase mb-1">
                    Representation Role
                  </label>
                  <select
                    value={newDealRole}
                    onChange={(e) => setNewDealRole(e.target.value)}
                    className="w-full bg-[#0A0D12] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="seller">Listing Agent (Seller)</option>
                    <option value="buyer">Buyer Broker</option>
                    <option value="dual">Dual Agency</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-mono-code uppercase mb-1">
                  Client Name
                </label>
                <input
                  value={newDealClient}
                  onChange={(e) => setNewDealClient(e.target.value)}
                  placeholder="e.g. Dr. Harrison & Claire Sterling"
                  className="w-full bg-[#0A0D12] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddEarningModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingEarning}
                  className="px-6 py-2 rounded-xl bg-emerald-500 text-[#0A0D12] font-bold text-xs shadow-lg"
                >
                  {isAddingEarning ? 'Recording...' : 'Log to Commission Ledger'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: COMPOSE MASS EMAIL */}
      {showMassEmailModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-[#121721] border border-[#D4AF37]/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="font-display text-2xl font-bold text-white flex items-center gap-2">
                  <Mail className="w-6 h-6 text-[#D4AF37]" />
                  <span>Broadcast Mass Email to Clients</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sends personalized merge-tagged messages directly from Melissa Hatfield (John L. Scott Real Estate).
                </p>
              </div>
              <button
                onClick={() => setShowMassEmailModal(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDispatchEmail} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-mono-code uppercase mb-1.5">
                  Campaign Title
                </label>
                <input
                  required
                  value={massEmailTitle}
                  onChange={(e) => setMassEmailTitle(e.target.value)}
                  className="w-full bg-[#0A0D12] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-mono-code uppercase mb-1.5">
                    Target Recipient Group
                  </label>
                  <select
                    value={massEmailTarget}
                    onChange={(e) => setMassEmailTarget(e.target.value)}
                    className="w-full bg-[#0A0D12] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="all_clients">All Clients ({clients.length} in CRM)</option>
                    <option value="past_buyers">Past Buyers Only</option>
                    <option value="vip_investors">VIP Cash Investors</option>
                    <option value="active_leads">Active Inbound Leads</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-mono-code uppercase mb-1.5">
                    Email Subject Line
                  </label>
                  <input
                    required
                    value={massEmailSubject}
                    onChange={(e) => setMassEmailSubject(e.target.value)}
                    className="w-full bg-[#0A0D12] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-300 font-mono-code uppercase">
                    Email Body with Merge Tags
                  </label>
                  <span className="text-[10px] text-[#D4AF37] font-mono-code">
                    Tags: &#123;ClientName&#125;, &#123;HomeAddress&#125;
                  </span>
                </div>
                <textarea
                  rows={8}
                  required
                  value={massEmailContent}
                  onChange={(e) => setMassEmailContent(e.target.value)}
                  className="w-full bg-[#0A0D12] border border-white/15 rounded-xl px-4 py-3 text-xs text-slate-200 font-mono-code leading-relaxed focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowMassEmailModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDispatchingEmail}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#0A0D12] font-bold text-xs shadow-lg hover:scale-105 transition cursor-pointer"
                >
                  {isDispatchingEmail
                    ? 'Broadcasting to Inboxes...'
                    : 'Dispatch Mass Broadcast Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW CLIENT */}
      {showNewClientModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#121721] border border-[#D4AF37]/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="font-display text-2xl font-bold text-white">
                Add Client to Melissa&apos;s Directory
              </h3>
              <button
                onClick={() => setShowNewClientModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-mono-code uppercase mb-1">
                  Full Name *
                </label>
                <input
                  required
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="e.g. Marcus & Elena Vance"
                  className="w-full bg-[#0A0D12] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-mono-code uppercase mb-1">
                    Email *
                  </label>
                  <input
                    required
                    type="email"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    placeholder="name@email.com"
                    className="w-full bg-[#0A0D12] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-mono-code uppercase mb-1">
                    Phone
                  </label>
                  <input
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    placeholder="(253) 555-0142"
                    className="w-full bg-[#0A0D12] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-mono-code uppercase mb-1">
                    Relationship Tier
                  </label>
                  <select
                    value={newClientType}
                    onChange={(e) => setNewClientType(e.target.value)}
                    className="w-full bg-[#0A0D12] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="past_buyer">Past Buyer</option>
                    <option value="past_seller">Past Seller</option>
                    <option value="active_buyer">Active Buyer</option>
                    <option value="active_seller">Active Seller</option>
                    <option value="vip_investor">VIP Cash Investor</option>
                    <option value="sphere">Sphere of Influence</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-mono-code uppercase mb-1">
                    Birthday
                  </label>
                  <input
                    value={newClientBirthday}
                    onChange={(e) => setNewClientBirthday(e.target.value)}
                    placeholder="e.g. July 22"
                    className="w-full bg-[#0A0D12] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-mono-code uppercase mb-1">
                  Home Address
                </label>
                <input
                  value={newClientAddress}
                  onChange={(e) => setNewClientAddress(e.target.value)}
                  placeholder="e.g. 2404 14th St SW, Puyallup, WA 98371"
                  className="w-full bg-[#0A0D12] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewClientModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingClient}
                  className="px-6 py-2 rounded-xl bg-[#D4AF37] text-[#0A0D12] font-bold text-xs"
                >
                  {isAddingClient ? 'Saving...' : 'Save Client Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TEACH AI */}
      {showTeachAiModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#121721] border border-[#D4AF37]/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="font-display text-2xl font-bold text-white flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-[#D4AF37]" />
                <span>Teach AI New Real Estate Heuristic</span>
              </h3>
              <button
                onClick={() => setShowTeachAiModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMemoryNode} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-mono-code uppercase mb-1">
                  Memory Category
                </label>
                <select
                  value={newMemoryCategory}
                  onChange={(e) => setNewMemoryCategory(e.target.value)}
                  className="w-full bg-[#0A0D12] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="market_insight">Market &amp; Neighborhood Pricing Insight</option>
                  <option value="client_preference">Client Relationship Tone &amp; Touch</option>
                  <option value="zillow_pattern">Zillow / Redfin Scraping Filter</option>
                  <option value="negotiation_rule">Seller Negotiation &amp; Floor Protection</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-mono-code uppercase mb-1">
                  Heuristic Key / Title
                </label>
                <input
                  required
                  value={newMemoryTitle}
                  onChange={(e) => setNewMemoryTitle(e.target.value)}
                  placeholder="e.g. Pierce County FHA Loan Thresholds"
                  className="w-full bg-[#0A0D12] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-mono-code uppercase mb-1">
                  Learned Rule / Execution Guideline
                </label>
                <textarea
                  rows={4}
                  required
                  value={newMemoryInsight}
                  onChange={(e) => setNewMemoryInsight(e.target.value)}
                  placeholder="Describe the exact rule or market wisdom you want the AI to apply in all future conversations..."
                  className="w-full bg-[#0A0D12] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowTeachAiModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingMemory}
                  className="px-6 py-2 rounded-xl bg-[#D4AF37] text-[#0A0D12] font-bold text-xs"
                >
                  {isAddingMemory ? 'Caching...' : 'Commit to AI Memory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PREVIEW HOLIDAY GREETING */}
      {previewCampaign && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl bg-[#121721] border border-[#D4AF37] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono-code uppercase bg-[#D4AF37]/20 text-[#D4AF37] px-2 py-0.5 rounded">
                  {previewCampaign.triggerType}
                </span>
                <h4 className="font-display text-xl font-bold text-white mt-1">
                  {previewCampaign.eventName}
                </h4>
              </div>
              <button
                onClick={() => setPreviewCampaign(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#0A0D12] border border-white/10 space-y-2 text-xs">
              <div className="text-slate-400">
                <strong>Subject:</strong> {previewCampaign.subject}
              </div>
              <div className="text-slate-400">
                <strong>Sender:</strong> Melissa Hatfield (John L. Scott Real Estate · 253-514-7676)
              </div>
              <div className="pt-2 border-t border-white/5 font-mono-code text-slate-200 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                {previewCampaign.emailBody}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setPreviewCampaign(null)}
                className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-xs"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  const id = previewCampaign.id;
                  setPreviewCampaign(null);
                  handleTriggerHolidaySend(id);
                }}
                className="px-5 py-2 rounded-xl bg-[#D4AF37] text-[#0A0D12] font-bold text-xs"
              >
                Broadcast as Melissa Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
