'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Sparkles,
  Menu,
  X,
  PhoneIncoming,
  Cpu,
  LogIn,
  LogOut,
  ShieldCheck,
  Phone,
} from 'lucide-react';
import SwarmCommandCenter, { LeadRecord } from '@/components/SwarmCommandCenter';
import VideoStudioWorkspace from '@/components/VideoStudioWorkspace';
import CallTransferDrawer, {
  CallTransferRecord,
} from '@/components/CallTransferDrawer';
import PrivateAgentHub, {
  AgentRecordItem,
} from '@/components/PrivateAgentHub';
import PersonalExecutiveCommand from '@/components/PersonalExecutiveCommand';
import JarvisLeadAssistant from '@/components/JarvisLeadAssistant';
import ListingUploadWizard from '@/components/ListingUploadWizard';
import MarketingTeam, { CampaignRecord } from '@/components/MarketingTeam';
import AuthModal, { AuthUser } from '@/components/AuthModal';
import PricingGate from '@/components/PricingGate';
import AdminRevenuePanel from '@/components/AdminRevenuePanel';
import LandingPage from '@/components/LandingPage';
import DocumentSigningSuite, {
  SignedDocumentItem,
} from '@/components/DocumentSigningSuite';
import CareerClientNurtureHub, {
  ClientItem,
  HolidayCampaignItem,
  MassEmailItem,
  AiMemoryNodeItem,
  AgentEarningItem,
  AgentEmailItem,
  MarketAdvisoryItem,
} from '@/components/CareerClientNurtureHub';
import MetaCapiDialerHub, {
  MetaCapiEventItem,
  AiDialerCampaignItem,
  BookedAppointmentItem,
} from '@/components/MetaCapiDialerHub';
import MobileQuickDock from '@/components/MobileQuickDock';
import ProactiveCommandCenter, { IntegrationStatus } from '@/components/ProactiveCommandCenter';
import { GalleryPhoto, VideoClipConfig, SignerAuditLog } from '@/db/schema';
import { workspaceMenuDescription } from '@/lib/workspace-menu';

interface PropertyRecord {
  id: number;
  title: string;
  address: string;
  cityState: string;
  price: string;
  beds: number;
  baths: string;
  sqft: number;
  heroPhotoUrl: string;
  galleryPhotos: GalleryPhoto[];
  sellerName: string;
  sellerPhone: string;
  sellerEmail: string;
  sellerMotivation: string;
  sellerBottomLine: string;
  propertyHighlights: string[];
  agentAssigned: string;
  status: string;
}

interface PlatformAdminData {
  users: {
    id: number;
    name: string;
    email: string;
    role: string;
    createdAt: string | null;
  }[];
  subscriptions: {
    id: number;
    userEmail: string;
    userName: string;
    plan: string;
    amount: string;
    status: string;
    createdAt: string | null;
  }[];
  mrr: number;
  totalRevenue: number;
  activeCount: number;
}

const LANDING_NAV = [
  { id: 'overview', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'properties', label: 'Properties' },
  { id: 'process', label: 'Process' },
  { id: 'contact', label: 'Contact' },
];

const WORKSPACE_NAV = [
  { id: 'today', label: 'Today' },
  { id: 'listings', label: 'Listings' },
  { id: 'command', label: 'Deal Desk' },
  { id: 'video', label: 'Cinema' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'swarm', label: 'Swarm' },
  { id: 'call-bridge', label: 'Calls' },
  { id: 'meta-dialer', label: 'Meta CAPI & Dialer' },
  { id: 'documents', label: 'E-Sign' },
  { id: 'nurture', label: 'CRM & Comps' },
  { id: 'hub', label: 'Hub' },
];

export default function PersonalRealEstatePlatform() {
  const [properties, setProperties] = useState<PropertyRecord[]>([]);
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [callTransfers, setCallTransfers] = useState<CallTransferRecord[]>([]);
  const [agentRecords, setAgentRecords] = useState<AgentRecordItem[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>([]);
  const [videoProjects, setVideoProjects] = useState<Array<{ id: number; propertyId: number; renderStatus: string }>>([]);
  const [documents, setDocuments] = useState<SignedDocumentItem[]>([]);
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [holidayCampaigns, setHolidayCampaigns] = useState<HolidayCampaignItem[]>([]);
  const [massEmails, setMassEmails] = useState<MassEmailItem[]>([]);
  const [aiMemoryNodes, setAiMemoryNodes] = useState<AiMemoryNodeItem[]>([]);
  const [earnings, setEarnings] = useState<AgentEarningItem[]>([]);
  const [emails, setEmails] = useState<AgentEmailItem[]>([]);
  const [marketAdvisories, setMarketAdvisories] = useState<MarketAdvisoryItem[]>([]);
  const [metaCapiEvents, setMetaCapiEvents] = useState<MetaCapiEventItem[]>([]);
  const [dialerCampaigns, setDialerCampaigns] = useState<AiDialerCampaignItem[]>([]);
  const [bookedAppointments, setBookedAppointments] = useState<BookedAppointmentItem[]>([]);
  const [activeTransferModal, setActiveTransferModal] =
    useState<CallTransferRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [assistantPrompt, setAssistantPrompt] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [activeWorkspaceSection, setActiveWorkspaceSection] = useState('today');
  const [integrations, setIntegrations] = useState<IntegrationStatus>({
    metaCapi: false,
    twilioDialer: false,
    emailDelivery: false,
    openCode: false,
    listingFeed: false,
    premiumVoice: false,
  });

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [monetizationEnabled, setMonetizationEnabled] = useState(false);
  const [prices, setPrices] = useState({
    starter: '$97',
    pro: '$297',
    elite: '$697',
  });
  const [mySubscription, setMySubscription] = useState<{
    plan: string;
    amount: string;
    status: string;
  } | null>(null);
  const [adminData, setAdminData] = useState<PlatformAdminData | null>(null);

  const isAdmin = currentUser?.role === 'admin';
  const hasActiveSub = mySubscription?.status === 'active';
  const hasAccess = !monetizationEnabled || isAdmin || hasActiveSub;

  const navItems = showWorkspace && hasAccess
    ? isAdmin
      ? [...WORKSPACE_NAV, { id: 'admin', label: 'Admin' }]
      : WORKSPACE_NAV
    : LANDING_NAV;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const fetchPlatformData = async () => {
    try {
      const res = await fetch('/api/swarm');
      const data = await res.json();
      if (data.properties) setProperties(data.properties);
      if (data.leads) setLeads(data.leads);
      if (data.callTransfers) setCallTransfers(data.callTransfers);
      if (data.videoProjects) setVideoProjects(data.videoProjects);
      if (data.agentRecords) setAgentRecords(data.agentRecords);
      if (data.campaigns) setCampaigns(data.campaigns);
      if (data.documents) setDocuments(data.documents);
      if (data.clients) setClients(data.clients);
      if (data.holidayCampaigns) setHolidayCampaigns(data.holidayCampaigns);
      if (data.massEmails) setMassEmails(data.massEmails);
      if (data.aiMemoryNodes) setAiMemoryNodes(data.aiMemoryNodes);
      if (data.earnings) setEarnings(data.earnings);
      if (data.emails) setEmails(data.emails);
      if (data.marketAdvisories) setMarketAdvisories(data.marketAdvisories);
      if (data.metaCapiEvents) setMetaCapiEvents(data.metaCapiEvents);
      if (data.dialerCampaigns) setDialerCampaigns(data.dialerCampaigns);
      if (data.bookedAppointments) setBookedAppointments(data.bookedAppointments);
      if (data.integrations) setIntegrations(data.integrations);
    } catch (err) {
      console.error('Failed to fetch platform data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAuth = async () => {
    try {
      const res = await fetch('/api/auth');
      const data = await res.json();
      setCurrentUser(data.user || null);
    } catch {
      setCurrentUser(null);
    } finally {
      setAuthLoading(false);
    }
  };

  const fetchPlatformConfig = async () => {
    try {
      const res = await fetch('/api/platform');
      const data = await res.json();
      if (data.settings) {
        setMonetizationEnabled(!!data.settings.monetizationEnabled);
        setPrices({
          starter: data.settings.starterPrice,
          pro: data.settings.proPrice,
          elite: data.settings.elitePrice,
        });
      }
      setMySubscription(data.mySubscription || null);
      setAdminData(data.adminData || null);
    } catch (err) {
      console.error('Failed to fetch platform config:', err);
    }
  };

  useEffect(() => {
    fetchPlatformData();
    fetchAuth();
    fetchPlatformConfig();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const isWorkspaceSection =
      WORKSPACE_NAV.some((item) => item.id === id) || id === 'admin';

    if (showWorkspace && isWorkspaceSection) {
      setActiveWorkspaceSection(id);
      return;
    }

    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLogout = async () => {
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    });
    setCurrentUser(null);
    setMySubscription(null);
    setAdminData(null);
    setShowWorkspace(false);
    await fetchPlatformConfig();
    showToast('Logged out.');
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Cancel your subscription? You will lose access immediately.'))
      return;
    const res = await fetch('/api/platform', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'cancel_subscription' }),
    });
    const data = await res.json();
    if (data.success) {
      showToast('Subscription canceled.');
      setShowWorkspace(false);
      await fetchPlatformConfig();
    }
  };

  const handleAddListing = async (payload: Record<string, unknown>) => {
    const res = await fetch('/api/swarm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add_listing', ...payload }),
    });
    const data = await res.json();
    if (data.success) {
      showToast('Listing uploaded — Cinema Studio & marketing swarm are ready.');
      await fetchPlatformData();
      return true;
    }
    showToast(data.error || 'Could not upload listing.');
    return false;
  };

  const handleLaunchCampaign = async (
    propertyId: number,
    cinemaStyle: string
  ) => {
    const res = await fetch('/api/swarm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'launch_campaign',
        propertyId,
        cinemaStyle,
      }),
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message);
      await fetchPlatformData();
      return true;
    }
    return false;
  };

  const handleCampaignPulse = async (campaignId: number) => {
    const res = await fetch('/api/swarm', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: 'campaign_pulse', campaignId }),
    });
    const data = await res.json();
    if (data.success) {
      showToast('Autonomous cycle complete.');
      await fetchPlatformData();
      return true;
    }
    return false;
  };

  const handleRunScraperSwarm = async (propertyId: number) => {
    const res = await fetch('/api/swarm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'run_scraper_swarm', propertyId }),
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message);
      await fetchPlatformData();
    }
  };

  const handleAddLead = async (leadData: Record<string, unknown>) => {
    const res = await fetch('/api/swarm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add_lead', ...leadData }),
    });
    const data = await res.json();
    if (data.success) {
      showToast('Real CRM lead saved.');
      await fetchPlatformData();
      return true;
    }
    showToast(data.error || 'Could not save the lead.');
    return false;
  };

  const handleBuyerContact = async (leadId: number) => {
    const res = await fetch('/api/swarm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'record_buyer_contact', leadId }),
    });
    const data = await res.json();
    if (data.success) {
      showToast('Buyer contacted! Seller info grabbed & call transfer ready.');
      await fetchPlatformData();
      if (data.transfer) setActiveTransferModal(data.transfer);
    }
  };

  const handleUpdateTransferStatus = async (
    transferId: number,
    newStatus: string
  ) => {
    const res = await fetch('/api/swarm', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transferId, status: newStatus }),
    });
    const data = await res.json();
    if (data.success) {
      showToast(
        newStatus === 'closed_deal'
          ? 'Deal closed & archived.'
          : 'Live call bridge established.'
      );
      await fetchPlatformData();
      if (data.transfer) setActiveTransferModal(data.transfer);
    }
  };

  const handleSaveVideoProject = async (projectData: {
    propertyId: number;
    projectName: string;
    aspectRatio: '16:9' | '9:16';
    cinemaStyle: string;
    musicTrack: string;
    voiceoverStyle: string;
    aiScript: string;
    clips: VideoClipConfig[];
  }) => {
    await fetch('/api/swarm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'save_video_project', ...projectData }),
    });
    showToast('4K film saved — ready to attach to any campaign.');
  };

  const handleAddAgentRecord = async (newRecord: {
    title: string;
    category: string;
    relatedPropertyTitle: string;
    clientName: string;
    confidentialNotes: string;
    financialFigure: string;
    priority: string;
  }) => {
    const res = await fetch('/api/swarm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add_agent_record', ...newRecord }),
    });
    const data = await res.json();
    if (data.success) {
      showToast('Private record saved (hidden from clients).');
      await fetchPlatformData();
    }
  };

  const handleDeleteAgentRecord = async (id: number) => {
    const res = await fetch('/api/swarm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_agent_record', id }),
    });
    const data = await res.json();
    if (data.success) {
      showToast('Private record removed.');
      await fetchPlatformData();
    }
  };

  const handleCreateDocument = async (docData: Record<string, unknown>) => {
    const res = await fetch('/api/swarm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create_document', ...docData }),
    });
    const data = await res.json();
    if (data.success) {
      await fetchPlatformData();
      return true;
    }
    showToast(data.error || 'Could not draft document.');
    return false;
  };

  const handleSignDocument = async (
    documentId: number,
    signatureData: SignerAuditLog
  ) => {
    const res = await fetch('/api/swarm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'sign_document',
        documentId,
        signatureData,
      }),
    });
    const data = await res.json();
    if (data.success) {
      await fetchPlatformData();
      return true;
    }
    showToast(data.error || 'Could not verify electronic signature.');
    return false;
  };

  const handleDeleteDocument = async (id: number) => {
    const res = await fetch('/api/swarm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_document', id }),
    });
    const data = await res.json();
    if (data.success) {
      showToast('Contract removed from vault.');
      await fetchPlatformData();
      return true;
    }
    return false;
  };

  const handleAddClient = async (clientData: Record<string, unknown>) => {
    const res = await fetch('/api/swarm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create_client', ...clientData }),
    });
    const data = await res.json();
    if (data.success) {
      await fetchPlatformData();
      return true;
    }
    showToast(data.error || 'Could not save client record.');
    return false;
  };

  const handleDeleteClient = async (id: number) => {
    const res = await fetch('/api/swarm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_client', id }),
    });
    const data = await res.json();
    if (data.success) {
      showToast('Client profile removed.');
      await fetchPlatformData();
      return true;
    }
    return false;
  };

  const handleSendHolidayNow = async (campaignId: number) => {
    const res = await fetch('/api/swarm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'send_holiday_now', campaignId }),
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message || 'Holiday greetings broadcasted as Melissa Hatfield.');
      await fetchPlatformData();
      return true;
    }
    showToast(data.error || 'Could not send greeting.');
    return false;
  };

  const handleToggleHolidayAutoPilot = async (
    campaignId: number,
    isAutoPilot: boolean
  ) => {
    const res = await fetch('/api/swarm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'toggle_holiday_autopilot',
        campaignId,
        isAutoPilot,
      }),
    });
    const data = await res.json();
    if (data.success) {
      showToast(
        isAutoPilot ? 'Autopilot armed for this event.' : 'Autopilot paused.'
      );
      await fetchPlatformData();
      return true;
    }
    return false;
  };

  const handleDispatchMassEmail = async (emailData: Record<string, unknown>) => {
    const res = await fetch('/api/swarm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'dispatch_mass_email', ...emailData }),
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message || 'Mass email broadcast dispatched.');
      await fetchPlatformData();
      return true;
    }
    showToast(data.error || 'Could not dispatch mass email.');
    return false;
  };

  const handleAddMemoryNode = async (nodeData: Record<string, unknown>) => {
    const res = await fetch('/api/swarm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create_ai_memory_node', ...nodeData }),
    });
    const data = await res.json();
    if (data.success) {
      await fetchPlatformData();
      return true;
    }
    return false;
  };

  const handleMarkEmailRead = async (emailId: number) => {
    const res = await fetch('/api/swarm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'mark_email_read', emailId }),
    });
    const data = await res.json();
    if (data.success) {
      await fetchPlatformData();
      return true;
    }
    return false;
  };

  const handleSendAiReply = async (emailId: number, replyText: string) => {
    const res = await fetch('/api/swarm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'send_ai_reply', emailId, replyText }),
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message || 'Reply sent.');
      await fetchPlatformData();
      return true;
    }
    showToast(data.error || 'Could not send reply.');
    return false;
  };

  const handleAddEarningRecord = async (earningData: Record<string, unknown>) => {
    const res = await fetch('/api/swarm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add_earning_record', ...earningData }),
    });
    const data = await res.json();
    if (data.success) {
      showToast('Transaction logged to commission ledger.');
      await fetchPlatformData();
      return true;
    }
    showToast(data.error || 'Could not record transaction.');
    return false;
  };

  const handleSendToMetaCapi = async (capiData: Record<string, unknown>) => {
    const res = await fetch('/api/swarm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'send_to_meta_capi', ...capiData }),
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message || 'Meta CAPI feedback dispatched to Pixel.');
      await fetchPlatformData();
      return true;
    }
    showToast(data.error || 'Failed to dispatch Meta CAPI event.');
    return false;
  };

  const handleCreateDialerCampaign = async (campaignData: Record<string, unknown>) => {
    const res = await fetch('/api/swarm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create_dialer_campaign', ...campaignData }),
    });
    const data = await res.json();
    if (data.success) {
      showToast('AI Voice Dialer campaign configured & scheduled.');
      await fetchPlatformData();
      return true;
    }
    showToast(data.error || 'Could not create dialer campaign.');
    return false;
  };

  const handleRunDialerWave = async (campaignId: number, selectedDay: string) => {
    const res = await fetch('/api/swarm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'run_dialer_wave', dialerCampaignId: campaignId, selectedDay }),
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message || 'Dialer wave executed.');
      await fetchPlatformData();
      return true;
    }
    showToast(data.error || 'Failed to execute dialer wave.');
    return false;
  };

  const handleDeleteDialerCampaign = async (id: number) => {
    const res = await fetch('/api/swarm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_dialer_campaign', id }),
    });
    const data = await res.json();
    if (data.success) {
      showToast('Dialer schedule removed.');
      await fetchPlatformData();
      return true;
    }
    return false;
  };

  const handleDeleteAppointment = async (id: number) => {
    const res = await fetch('/api/swarm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_booked_appointment', id }),
    });
    const data = await res.json();
    if (data.success) {
      showToast('Appointment removed.');
      await fetchPlatformData();
      return true;
    }
    return false;
  };

  const pendingRingingTransfer =
    callTransfers.find((t) => t.transferStatus === 'incoming_ringing') ||
    callTransfers[0];

  const enterWorkspace = () => {
    if (!hasAccess) {
      setAuthModalOpen(true);
      return;
    }
    setActiveWorkspaceSection('today');
    setShowWorkspace(true);
  };

  return (
    <div className="min-h-screen relative isolate overflow-x-clip bg-[#FDFCF9] text-[#1A1A1A] antialiased pb-[5.5rem] md:pb-0">
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-white border border-[rgba(139,125,107,0.2)] text-[#1A1A1A] px-5 py-3 rounded-sm shadow-2xl flex items-center gap-2.5 max-w-[90vw]">
          <Sparkles className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* ==================== STICKY NAV ==================== */}
      <header
        className={`fixed top-0 inset-x-0 z-50 h-20 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-[10px] border-b border-[rgba(139,125,107,0.2)] shadow-sm'
            : 'bg-white/95 backdrop-blur-[10px]'
        }`}
      >
        <div className="h-full max-w-[1400px] mx-auto px-6 md:px-10 flex items-center justify-between gap-4">
          {/* Left logo & John L. Scott branding */}
          <button
            onClick={() => {
              setShowWorkspace(false);
              scrollToSection('overview');
            }}
            className="flex items-center gap-3 cursor-pointer text-left"
          >
            <span className="w-3 h-3 bg-[#1A1A1A] rounded-[2px]" />
            <div>
              <span className="brand-script text-[24px] sm:text-[28px] block leading-none">
                Your personal real estate
              </span>
              <span className="text-[9px] font-mono-code tracking-[0.18em] text-[#D4AF37] block mt-0.5">
                John L. Scott Real Estate · Melissa Hatfield
              </span>
            </div>
          </button>

          {/* Center links */}
          <nav className="hidden lg:flex items-center gap-9">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (
                    WORKSPACE_NAV.some((w) => w.id === item.id) ||
                    item.id === 'admin'
                  ) {
                    setActiveWorkspaceSection(item.id);
                    setShowWorkspace(true);
                    setMobileMenuOpen(false);
                  } else {
                    setShowWorkspace(false);
                    scrollToSection(item.id);
                  }
                }}
                className="landing-nav-link cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right CTAs */}
          <div className="flex items-center gap-3 sm:gap-5">
            {hasAccess && pendingRingingTransfer && showWorkspace && (
              <button
                onClick={() => setActiveTransferModal(pendingRingingTransfer)}
                className="hidden md:flex items-center gap-2 text-xs font-medium text-[#1A1A1A] cursor-pointer hover:opacity-70"
              >
                <PhoneIncoming className="w-3.5 h-3.5 text-[#D4AF37]" />
                Buyer on line
              </button>
            )}

            <a
              href="tel:2535147676"
              className="hidden sm:flex items-center gap-2 text-xs font-semibold text-[#1A1A1A] hover:text-[#D4AF37] transition cursor-pointer px-3 py-1.5 rounded-full border border-[rgba(139,125,107,0.2)] bg-neutral-50"
              title="Direct Mobile to Melissa Hatfield"
            >
              <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
              (253) 514-7676
            </a>

            {!authLoading &&
              (currentUser ? (
                <div className="flex items-center gap-2">
                  {hasAccess && (
                    <button
                      onClick={() => {
                        if (showWorkspace) {
                          setShowWorkspace(false);
                          scrollToSection('overview');
                        } else {
                          enterWorkspace();
                        }
                      }}
                      className="hidden sm:inline-flex bg-[#1A1A1A] text-white px-5 py-2.5 rounded-sm text-sm font-medium hover:opacity-90 hover:scale-[1.02] transition cursor-pointer"
                    >
                      {showWorkspace ? 'Landing' : 'Workspace'}
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="p-2 text-neutral-500 hover:text-[#1A1A1A] cursor-pointer"
                    title="Log out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="bg-[#1A1A1A] text-white px-6 py-2.5 rounded-sm text-sm font-medium hover:opacity-90 hover:scale-[1.02] transition cursor-pointer"
                >
                  Register
                </button>
              ))}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#1A1A1A] cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="lg:hidden bg-white border-t border-[rgba(139,125,107,0.2)] px-6 py-4 grid grid-cols-2 gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (
                    WORKSPACE_NAV.some((w) => w.id === item.id) ||
                    item.id === 'admin'
                  ) {
                    setActiveWorkspaceSection(item.id);
                    setShowWorkspace(true);
                    setMobileMenuOpen(false);
                  } else {
                    setShowWorkspace(false);
                    scrollToSection(item.id);
                  }
                }}
                className="px-3 py-3 text-left text-sm text-[#1A1A1A] hover:bg-neutral-50 rounded-sm cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </nav>
        )}
      </header>

      {/* Mode strip for subscribers/admin */}
      {(isAdmin || hasActiveSub || monetizationEnabled) && (
        <div className="pt-20">
          <div className="px-6 py-2.5 text-center border-b border-[rgba(139,125,107,0.2)] bg-white">
            <span className="text-[10px] uppercase tracking-[0.18em] text-neutral-400">
              {!monetizationEnabled ? (
                <>
                  Personal Mode
                  {isAdmin && ' · Admin can switch on subscriptions anytime'}
                </>
              ) : isAdmin ? (
                <>Subscription Mode Live · Full admin access</>
              ) : hasActiveSub ? (
                <>
                  {mySubscription?.plan} Active · {mySubscription?.amount}/mo
                  <button
                    onClick={handleCancelSubscription}
                    className="ml-3 underline cursor-pointer hover:opacity-100 opacity-70"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>Subscription Mode · Register to unlock workspace</>
              )}
            </span>
          </div>
        </div>
      )}

      {/* ==================== LANDING ==================== */}
      {!showWorkspace && (
        <div className={!isAdmin && !hasActiveSub && !monetizationEnabled ? 'pt-20' : ''}>
          <LandingPage
            properties={properties}
            onRegister={() => setAuthModalOpen(true)}
            onBookCall={() => scrollToSection('contact')}
            onEnterWorkspace={enterWorkspace}
            hasAccess={hasAccess}
            showToast={showToast}
          />
        </div>
      )}

      {/* ==================== WORKSPACE ==================== */}
      {showWorkspace && hasAccess && (
        <div className="workspace-shell">
          <aside className="workspace-sidebar">
            <div className="workspace-sidebar-brand">
              <div className="workspace-sidebar-kicker">Private workspace</div>
              <h2>Melissa&apos;s Command Center</h2>
              <p>Choose a tool. Stay on one screen.</p>
            </div>

            <label className="workspace-select-label" htmlFor="workspace-section-select">
              Jump to section
            </label>
            <select
              id="workspace-section-select"
              value={activeWorkspaceSection}
              onChange={(event) => setActiveWorkspaceSection(event.target.value)}
              className="workspace-section-select"
            >
              {isAdmin && <option value="admin">★ Admin &amp; Revenue</option>}
              {WORKSPACE_NAV.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>

            <div className="workspace-sidebar-menu">
              <div className="workspace-menu-title">Workspace tools</div>
              {isAdmin && (
                <button
                  onClick={() => setActiveWorkspaceSection('admin')}
                  className={`workspace-menu-item ${activeWorkspaceSection === 'admin' ? 'is-active' : ''}`}
                >
                  <span className="workspace-menu-number">★</span>
                  <span><strong>Admin &amp; Revenue</strong><small>Subscriptions and settings</small></span>
                </button>
              )}
              {WORKSPACE_NAV.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => setActiveWorkspaceSection(item.id)}
                  className={`workspace-menu-item ${activeWorkspaceSection === item.id ? 'is-active' : ''}`}
                >
                  <span className="workspace-menu-number">{String(index + 1).padStart(2, '0')}</span>
                  <span><strong>{item.label}</strong><small>{workspaceMenuDescription(item.id)}</small></span>
                </button>
              ))}
            </div>

            <div className="workspace-sidebar-footer">
              <div className="workspace-owner-dot" />
              <div><strong>Melissa Hatfield</strong><span>John L. Scott Real Estate</span></div>
            </div>
          </aside>

          <div className="workspace-stage">
          <SectionShell
            id="today"
            hidden={activeWorkspaceSection !== 'today'}
            step="00"
            eyebrow="Proactive Assistant"
            title="Today: priorities before you ask"
            description="A ranked command briefing generated from verified leads, inbox records, documents, commissions, campaigns, client touchpoints, and provider connections."
          >
            <ProactiveCommandCenter
              properties={properties}
              leads={leads}
              emails={emails}
              documents={documents}
              campaigns={campaigns}
              videoProjects={videoProjects}
              clients={clients}
              earnings={earnings}
              integrations={integrations}
              onNavigate={scrollToSection}
              onAskAssistant={(prompt) => setAssistantPrompt(prompt)}
            />
          </SectionShell>

          {isAdmin && (
            <SectionShell
              id="admin"
              hidden={activeWorkspaceSection !== 'admin'}
              step="★"
              eyebrow="Owner Control"
              title="Subscription switch & revenue"
              description="Test in personal mode, then flip one switch to sell subscriptions to other agents."
            >
              <AdminRevenuePanel
                monetizationEnabled={monetizationEnabled}
                starterPrice={prices.starter}
                proPrice={prices.pro}
                elitePrice={prices.elite}
                adminData={adminData}
                onChanged={fetchPlatformConfig}
                showToast={showToast}
              />
            </SectionShell>
          )}

          <SectionShell
            id="listings"
            hidden={activeWorkspaceSection !== 'listings'}
            step="01"
            eyebrow="Your Inventory"
            title="Upload the listings you're working on"
            description="Add property details, seller intelligence, and photos. Cinema Studio and the marketing swarm take over from here."
          >
            {isLoading ? (
              <LoadingState />
            ) : (
              <ListingUploadWizard
                properties={properties}
                onAddListing={handleAddListing}
              />
            )}
          </SectionShell>

          <SectionShell
            id="command"
            hidden={activeWorkspaceSection !== 'command'}
            step="02"
            eyebrow="Deal Desk"
            title="Underwrite offers & generate LOIs"
            description="Compare your offer against the extracted seller bottom line and draft a binding letter of intent."
          >
            <PersonalExecutiveCommand
              onLaunchAssistantWithPrompt={(prompt) => setAssistantPrompt(prompt)}
            />
          </SectionShell>

          <SectionShell
            id="video"
            hidden={activeWorkspaceSection !== 'video'}
            step="03"
            eyebrow="Cinema Studio"
            title="Build cinematic listing storyboards"
            description="Arrange listing photos, motion styles, captions, music direction, and narration into an editable project. Connect a rendering provider before exporting an actual MP4 film."
          >
            {isLoading ? (
              <LoadingState />
            ) : (
              <VideoStudioWorkspace
                properties={properties}
                onSaveProject={handleSaveVideoProject}
              />
            )}
          </SectionShell>

          <SectionShell
            id="marketing"
            hidden={activeWorkspaceSection !== 'marketing'}
            step="04"
            eyebrow="Marketing Team"
            title="Trigger a full high-end campaign"
            description="A six-specialist team takes any listing to market — creative, email, social, ads, PR, and continuous buyer scraping."
          >
            {isLoading ? (
              <LoadingState />
            ) : (
              <MarketingTeam
                properties={properties}
                campaigns={campaigns}
                onLaunch={handleLaunchCampaign}
                onPulse={handleCampaignPulse}
              />
            )}
          </SectionShell>

          <SectionShell
            id="swarm"
            hidden={activeWorkspaceSection !== 'swarm'}
            step="05"
            eyebrow="Buyer Swarm"
            title="Scrape, contact & qualify buyers"
            description="AI nodes scan luxury registries, deliver personalized reels, and push high-intent buyers toward the call bridge."
          >
            {isLoading ? (
              <LoadingState />
            ) : (
              <SwarmCommandCenter
                properties={properties}
                leads={leads}
                callTransfers={callTransfers}
                onAddLead={handleAddLead}
                onBuyerContact={handleBuyerContact}
                onOpenTransferDossier={(transfer) =>
                  setActiveTransferModal(transfer)
                }
              />
            )}
          </SectionShell>

          <SectionShell
            id="call-bridge"
            hidden={activeWorkspaceSection !== 'call-bridge'}
            step="06"
            eyebrow="Call Bridge"
            title="Grab the seller's bottom line & bridge the call"
            description="When a buyer reaches out, confidential seller terms are pulled and the live call transfers to you."
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 p-8 rounded-3xl bg-white border border-[rgba(139,125,107,0.2)] space-y-5">
                <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-neutral-400">
                  <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-ping" />
                  Buyer on inbound line
                </span>
                <h3 className="font-display text-2xl font-bold text-[#1A1A1A]">
                  Instant seller extraction + live bridge
                </h3>
                {pendingRingingTransfer ? (
                  <div className="p-4 rounded-2xl bg-neutral-50 border border-[rgba(139,125,107,0.2)] grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] uppercase tracking-[0.16em] text-neutral-400">
                        Buyer
                      </span>
                      <div className="font-semibold text-[#1A1A1A] mt-0.5">
                        {pendingRingingTransfer.buyerName}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {pendingRingingTransfer.buyerPreApprovalAmount}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-[0.16em] text-neutral-400">
                        Seller bottom line
                      </span>
                      <div className="font-semibold text-[#D4AF37] mt-0.5">
                        {pendingRingingTransfer.sellerBottomLinePrice}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {pendingRingingTransfer.sellerName}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-neutral-500">
                    Trigger a buyer contact in the Swarm section to see the bridge.
                  </p>
                )}
                {pendingRingingTransfer && (
                  <button
                    onClick={() => setActiveTransferModal(pendingRingingTransfer)}
                    className="bg-[#1A1A1A] text-white px-6 py-3 rounded-sm text-sm font-medium hover:opacity-90 transition cursor-pointer"
                  >
                    Open call transfer & dossier
                  </button>
                )}
              </div>

              <div className="p-6 rounded-3xl bg-white border border-[rgba(139,125,107,0.2)] space-y-3">
                <span className="text-[10px] uppercase tracking-[0.18em] text-neutral-400">
                  Transfer log
                </span>
                <h4 className="font-display text-xl font-bold text-[#1A1A1A]">
                  Recent warm transfers
                </h4>
                <div className="space-y-3">
                  {callTransfers.slice(0, 3).map((tr) => (
                    <button
                      key={tr.id}
                      onClick={() => setActiveTransferModal(tr)}
                      className="w-full text-left p-3.5 rounded-2xl bg-neutral-50 border border-[rgba(139,125,107,0.2)] hover:border-[#D4AF37] transition cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#1A1A1A]">
                          {tr.buyerName}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-neutral-400">
                          {tr.transferStatus}
                        </span>
                      </div>
                      <div className="text-xs text-[#D4AF37] mt-1">
                        Floor: {tr.sellerBottomLinePrice}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </SectionShell>

          <SectionShell
            id="meta-dialer"
            hidden={activeWorkspaceSection !== 'meta-dialer'}
            step="07"
            eyebrow="Conversion API & AI Voice Dialer"
            title="Meta Pixel CAPI Feedback & Day-Scheduled AI Voice Dialer"
            description="Grade CRM lead quality and transmit verified conversion events to the Meta Conversions API to train your Pixel algorithm for better buyer targeting. Deploy scheduled AI Voice Dialers on custom days and times to call leads and book appointments automatically on Melissa's calendar."
          >
            {isLoading ? (
              <LoadingState />
            ) : (
              <MetaCapiDialerHub
                leads={leads}
                metaCapiEvents={metaCapiEvents}
                dialerCampaigns={dialerCampaigns}
                bookedAppointments={bookedAppointments}
                onSendToMetaCapi={handleSendToMetaCapi}
                onCreateDialerCampaign={handleCreateDialerCampaign}
                onRunDialerWave={handleRunDialerWave}
                onDeleteDialerCampaign={handleDeleteDialerCampaign}
                onDeleteAppointment={handleDeleteAppointment}
                showToast={showToast}
                onNavigateToSection={scrollToSection}
              />
            )}
          </SectionShell>

          <SectionShell
            id="documents"
            hidden={activeWorkspaceSection !== 'documents'}
            step="08"
            eyebrow="Legal Documents & E-Sign"
            title="Real Estate Contracts & Automated Mobile Signing Suite"
            description="Pull out purchase agreements (Form 21), exclusive listing contracts, inspection addenda, financing waivers, and wire receipts. Execute legally-binding electronic signatures with touch/stylus drawing on mobile phones or instant QR signing links."
          >
            {isLoading ? (
              <LoadingState />
            ) : (
              <DocumentSigningSuite
                properties={properties}
                documents={documents}
                onCreateDocument={handleCreateDocument}
                onSignDocument={handleSignDocument}
                onDeleteDocument={handleDeleteDocument}
                showToast={showToast}
              />
            )}
          </SectionShell>

          <SectionShell
            id="nurture"
            hidden={activeWorkspaceSection !== 'nurture'}
            step="09"
            eyebrow="Career CRM, Portal Search & Nurture"
            title="Portal Search, Client Follow-Ups & Email Workflows"
            description="Launch exact searches on Zillow and Redfin, display licensed MLS results after a RESO feed is connected, manage client milestones, and send emails only through a configured delivery provider."
          >
            {isLoading ? (
              <LoadingState />
            ) : (
              <CareerClientNurtureHub
                clients={clients}
                holidayCampaigns={holidayCampaigns}
                massEmails={massEmails}
                aiMemoryNodes={aiMemoryNodes}
                earnings={earnings}
                emails={emails}
                marketAdvisories={marketAdvisories}
                onAddClient={handleAddClient}
                onDeleteClient={handleDeleteClient}
                onSendHolidayNow={handleSendHolidayNow}
                onToggleHolidayAutoPilot={handleToggleHolidayAutoPilot}
                onDispatchMassEmail={handleDispatchMassEmail}
                onAddMemoryNode={handleAddMemoryNode}
                onAddEarningRecord={handleAddEarningRecord}
                onMarkEmailRead={handleMarkEmailRead}
                onSendAiReply={handleSendAiReply}
                showToast={showToast}
                onNavigateToSection={scrollToSection}
              />
            )}
          </SectionShell>

          <SectionShell
            id="hub"
            hidden={activeWorkspaceSection !== 'hub'}
            step="10"
            eyebrow="Private Hub"
            title="Agent-only organizer, invisible to clients"
            description="Store seller bottom lines, off-market terms, and commissions where buyers and sellers never see them."
          >
            <PrivateAgentHub
              records={agentRecords}
              onAddRecord={handleAddAgentRecord}
              onDeleteRecord={handleDeleteAgentRecord}
            />
          </SectionShell>
          </div>
        </div>
      )}

      {/* Pricing gate when monetization is on and user has no access */}
      {showWorkspace && !hasAccess && (
        <section id="pricing" className="pt-28 pb-24 px-6 md:px-12 bg-[#FDFCF9]">
          <PricingGate
            starterPrice={prices.starter}
            proPrice={prices.pro}
            elitePrice={prices.elite}
            currentUser={currentUser}
            onRequireLogin={() => setAuthModalOpen(true)}
            onSubscribed={async () => {
              await fetchPlatformConfig();
              await fetchPlatformData();
              showToast('Welcome aboard! Workspace unlocked.');
              setShowWorkspace(true);
            }}
          />
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-[rgba(139,125,107,0.2)] py-14 px-6 md:px-12 bg-[#FDFCF9]">
        <div className="max-w-[1400px] mx-auto space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-[rgba(139,125,107,0.15)]">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 bg-[#1A1A1A] rounded-[2px]" />
                <span className="brand-script text-[28px]">
                  Your personal real estate
                </span>
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                John L. Scott Real Estate · Melissa Hatfield, REALTOR® / Broker
              </div>
            </div>

            <div className="flex flex-wrap gap-6 text-xs text-neutral-600">
              <a href="tel:2535147676" className="hover:text-[#D4AF37] font-semibold">
                Mobile: 253-514-7676
              </a>
              <a href="tel:2538417000" className="hover:text-[#D4AF37]">
                Office: 253-841-7000
              </a>
              <a href="mailto:melissafh@johnlscott.com" className="hover:text-[#D4AF37]">
                melissafh@johnlscott.com
              </a>
              <a
                href="https://www.melissafh.johnlscott.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#D4AF37]"
              >
                www.melissafh.johnlscott.com
              </a>
            </div>

            <div className="flex flex-wrap gap-5">
              {LANDING_NAV.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setShowWorkspace(false);
                    scrollToSection(item.id);
                  }}
                  className="text-xs text-neutral-500 hover:text-[#1A1A1A] transition cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-400">
            <div>
              © {new Date().getFullYear()} John L. Scott Real Estate · Melissa Hatfield. All rights reserved.
            </div>
            <div className="flex items-center gap-3 font-mono-code uppercase text-[10px]">
              <span>REALTOR®</span>
              <span>·</span>
              <span>MLS Member</span>
              <span>·</span>
              <span>Equal Housing Opportunity</span>
            </div>
          </div>
        </div>
      </footer>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={async (user) => {
          setCurrentUser(user);
          await fetchPlatformConfig();
          await fetchPlatformData();
          showToast(`Welcome, ${user.name.split(' ')[0]}!`);
        }}
      />

      {showWorkspace && hasAccess && (
        <JarvisLeadAssistant
          leads={leads}
          properties={properties}
          clients={clients}
          onNavigate={scrollToSection}
          externalPrompt={assistantPrompt}
          onClearExternalPrompt={() => setAssistantPrompt(null)}
        />
      )}

      <CallTransferDrawer
        transfer={activeTransferModal}
        isOpen={!!activeTransferModal}
        onClose={() => setActiveTransferModal(null)}
        onUpdateStatus={handleUpdateTransferStatus}
      />

      {showWorkspace && hasAccess && (
        <MobileQuickDock
          onNavigate={(id) => {
            setShowWorkspace(true);
            scrollToSection(id);
          }}
          onOpenMenu={() => setMobileMenuOpen(true)}
        />
      )}
    </div>
  );
}

function SectionShell({
  id,
  hidden = false,
  step,
  eyebrow,
  title,
  description,
  children,
}: {
  id: string;
  hidden?: boolean;
  step: string;
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={`workspace-panel ${hidden ? 'hidden' : ''}`}
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
          <div>
            <div className="w-12 h-0.5 bg-[#D4AF37] mb-6" />
            <h2 className="font-display text-4xl md:text-5xl tracking-[-0.03em] text-[#1A1A1A] leading-[1.05]">
              {title}
            </h2>
          </div>
          <div>
            <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.16em] text-neutral-400 mb-4">
              <span className="text-[#D4AF37]">{step}</span>
              <span>/</span>
              <span>{eyebrow}</span>
            </div>
            <p className="text-neutral-600 text-lg leading-relaxed">{description}</p>
          </div>
        </div>
        {children}
      </div>
    </section>
  );
}

function LoadingState() {
  return (
    <div className="h-64 flex flex-col items-center justify-center gap-3">
      <Cpu className="w-8 h-8 text-[#D4AF37] animate-spin" />
      <p className="text-[10px] uppercase tracking-[0.18em] text-neutral-400">
        Loading...
      </p>
    </div>
  );
}
