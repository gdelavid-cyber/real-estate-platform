'use client';

import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  BrainCircuit,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  FileSignature,
  Inbox,
  Link2,
  Megaphone,
  PhoneCall,
  Radio,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Video,
} from 'lucide-react';

interface SignalLead {
  id: number;
  buyerName: string;
  stage: string;
  intentScore: number;
  lastContactedAt: string;
}

interface SignalEmail {
  id: number;
  senderName: string;
  subject: string;
  priority: string;
  isRead: boolean;
}

interface SignalDocument {
  id: number;
  title: string;
  status: string;
  propertyAddress: string;
}

interface SignalCampaign {
  id: number;
  propertyId: number;
  status: string;
}

interface SignalVideo {
  id: number;
  propertyId: number;
  renderStatus: string;
}

interface SignalProperty {
  id: number;
  title: string;
  price: string;
}

interface SignalClient {
  id: number;
  name: string;
  relationshipType: string;
  lastTouchAt?: string | null;
  homePurchaseDate?: string | null;
  autoPilotFollowups?: boolean | null;
}

interface SignalEarning {
  id: number;
  dealTitle: string;
  status: string;
  netAgentPayout: number;
  closeDate: string;
}

export interface IntegrationStatus {
  metaCapi: boolean;
  twilioDialer: boolean;
  emailDelivery: boolean;
  openCode: boolean;
  listingFeed: boolean;
  premiumVoice: boolean;
}

interface ProactiveCommandCenterProps {
  properties: SignalProperty[];
  leads: SignalLead[];
  emails: SignalEmail[];
  documents: SignalDocument[];
  campaigns: SignalCampaign[];
  videoProjects: SignalVideo[];
  clients: SignalClient[];
  earnings: SignalEarning[];
  integrations: IntegrationStatus;
  onNavigate: (sectionId: string) => void;
  onAskAssistant: (prompt: string) => void;
}

type Priority = 'critical' | 'high' | 'medium' | 'ready';

interface NextAction {
  id: string;
  priority: Priority;
  title: string;
  reason: string;
  action: string;
  target: string;
  prompt: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const priorityStyle: Record<Priority, string> = {
  critical: 'border-red-500/40 bg-red-500/10 text-red-300',
  high: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
  medium: 'border-sky-500/30 bg-sky-500/10 text-sky-200',
  ready: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
};

export default function ProactiveCommandCenter({
  properties,
  leads,
  emails,
  documents,
  campaigns,
  videoProjects,
  clients,
  earnings,
  integrations,
  onNavigate,
  onAskAssistant,
}: ProactiveCommandCenterProps) {
  const [completed, setCompleted] = useState<string[]>([]);

  const actions = useMemo(() => {
    const result: NextAction[] = [];
    const urgentEmails = emails.filter(
      (email) => !email.isRead && ['urgent', 'high'].includes(email.priority)
    );
    const hotLeads = leads.filter(
      (lead) => lead.intentScore >= 80 && !['closed', 'transferred_closed'].includes(lead.stage)
    );
    const unsigned = documents.filter(
      (document) => !['fully_executed', 'executed'].includes(document.status)
    );
    const pendingEarnings = earnings.filter((earning) => earning.status === 'pending_escrow');
    const staleClients = clients.filter((client) => {
      const value = (client.lastTouchAt || '').toLowerCase();
      return !value || value.includes('never') || value.includes('month');
    });
    const campaignPropertyIds = new Set(campaigns.map((campaign) => campaign.propertyId));
    const videoPropertyIds = new Set(videoProjects.map((video) => video.propertyId));
    const missingCampaign = properties.filter((property) => !campaignPropertyIds.has(property.id));
    const missingVideo = properties.filter((property) => !videoPropertyIds.has(property.id));

    if (urgentEmails.length) {
      result.push({
        id: 'urgent-email',
        priority: 'critical',
        title: `${urgentEmails.length} priority email${urgentEmails.length === 1 ? '' : 's'} need review`,
        reason: urgentEmails.slice(0, 2).map((email) => `${email.senderName}: ${email.subject}`).join(' · '),
        action: 'Review inbox',
        target: 'nurture',
        prompt: 'Summarize my unread high-priority emails and suggest replies without sending them.',
        Icon: Inbox,
      });
    }

    if (hotLeads.length) {
      result.push({
        id: 'hot-leads',
        priority: 'critical',
        title: `${hotLeads.length} high-intent lead${hotLeads.length === 1 ? '' : 's'} should be contacted`,
        reason: hotLeads.slice(0, 3).map((lead) => `${lead.buyerName} (${lead.intentScore}/100)`).join(' · '),
        action: 'Open buyer pipeline',
        target: 'swarm',
        prompt: 'Prioritize my high-intent leads and draft the next follow-up for each one.',
        Icon: Target,
      });
    }

    if (unsigned.length) {
      result.push({
        id: 'unsigned-docs',
        priority: 'high',
        title: `${unsigned.length} document${unsigned.length === 1 ? '' : 's'} await signatures`,
        reason: unsigned.slice(0, 2).map((document) => document.title).join(' · '),
        action: 'Open e-sign vault',
        target: 'documents',
        prompt: 'Show me which documents are missing signatures and what the next legal step is.',
        Icon: FileSignature,
      });
    }

    if (pendingEarnings.length) {
      const total = pendingEarnings.reduce(
        (sum, earning) => sum + (earning.netAgentPayout || 0),
        0
      );
      result.push({
        id: 'pending-earnings',
        priority: 'high',
        title: `$${total.toLocaleString()} in recorded net commissions are pending`,
        reason: pendingEarnings.slice(0, 2).map((earning) => `${earning.dealTitle} · ${earning.closeDate}`).join(' · '),
        action: 'Review commission ledger',
        target: 'nurture',
        prompt: 'Review my pending commissions and identify any missing closing or payout information.',
        Icon: CircleDollarSign,
      });
    }

    if (missingVideo.length) {
      result.push({
        id: 'missing-video',
        priority: 'medium',
        title: `${missingVideo.length} listing${missingVideo.length === 1 ? '' : 's'} have no saved cinema project`,
        reason: missingVideo.slice(0, 3).map((property) => property.title).join(' · '),
        action: 'Open cinema studio',
        target: 'video',
        prompt: 'Tell me which listing should receive a video first and why.',
        Icon: Video,
      });
    }

    if (missingCampaign.length) {
      result.push({
        id: 'missing-campaign',
        priority: 'medium',
        title: `${missingCampaign.length} listing${missingCampaign.length === 1 ? '' : 's'} have no campaign`,
        reason: missingCampaign.slice(0, 3).map((property) => property.title).join(' · '),
        action: 'Build campaigns',
        target: 'marketing',
        prompt: 'Prioritize listings without marketing campaigns and prepare an approval checklist.',
        Icon: Megaphone,
      });
    }

    if (staleClients.length) {
      result.push({
        id: 'stale-clients',
        priority: 'medium',
        title: `${staleClients.length} client relationship${staleClients.length === 1 ? '' : 's'} need a touchpoint`,
        reason: staleClients.slice(0, 3).map((client) => client.name).join(' · '),
        action: 'Open CRM',
        target: 'nurture',
        prompt: 'Draft personal check-ins for clients with overdue touchpoints. Do not send without approval.',
        Icon: Users,
      });
    }

    const missing = Object.entries(integrations)
      .filter(([, value]) => !value)
      .map(([key]) => key);
    if (missing.length) {
      result.push({
        id: 'integration-readiness',
        priority: 'ready',
        title: `${missing.length} production integration${missing.length === 1 ? '' : 's'} still need connection`,
        reason: missing.join(' · '),
        action: 'Review integration setup',
        target: 'admin',
        prompt: 'Explain which production integrations are disconnected and give me the exact setup order.',
        Icon: Link2,
      });
    }

    if (!result.length) {
      result.push({
        id: 'all-clear',
        priority: 'ready',
        title: 'No urgent items detected',
        reason: 'Your recorded leads, documents, campaigns, and client touchpoints are current.',
        action: 'Ask for a daily briefing',
        target: 'nurture',
        prompt: 'Give me a concise daily briefing based only on verified workspace records.',
        Icon: CheckCircle2,
      });
    }

    return result;
  }, [properties, leads, emails, documents, campaigns, videoProjects, clients, earnings, integrations]);

  const visible = actions.filter((action) => !completed.includes(action.id));
  const closedNet = earnings
    .filter((earning) => earning.status === 'closed')
    .reduce((sum, earning) => sum + (earning.netAgentPayout || 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_.65fr] gap-5">
        <div className="p-6 md:p-8 rounded-3xl bg-[#121721] border border-[#D4AF37]/40 text-white shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-[0.18em] text-[#D4AF37] font-semibold">
                Proactive command briefing
              </span>
              <h3 className="font-display text-3xl text-white mt-2">
                Here&apos;s what needs attention now.
              </h3>
              <p className="text-sm text-slate-300 mt-3 max-w-2xl leading-relaxed">
                The Assistant watches verified workspace signals and ranks the next best actions. Nothing is sent, called, published, or signed without the required provider and approval.
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center">
              <BrainCircuit className="w-6 h-6 text-[#D4AF37]" />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-7">
            {[
              { label: 'Open actions', value: visible.length, Icon: AlertCircle },
              { label: 'Hot leads', value: leads.filter((lead) => lead.intentScore >= 80).length, Icon: Target },
              { label: 'Unread email', value: emails.filter((email) => !email.isRead).length, Icon: Inbox },
              { label: 'Closed net', value: `$${closedNet.toLocaleString()}`, Icon: CircleDollarSign },
            ].map((item) => (
              <div key={item.label} className="p-3 rounded-2xl bg-black/20 border border-white/10">
                <item.Icon className="w-4 h-4 text-[#D4AF37]" />
                <strong className="block text-lg mt-2">{item.value}</strong>
                <span className="text-[10px] uppercase tracking-wider text-slate-400">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-[rgba(139,125,107,0.2)]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
            <h4 className="font-semibold text-[#1A1A1A]">Automation guardrails</h4>
          </div>
          <div className="space-y-3 mt-4 text-xs text-neutral-600">
            <p><strong className="text-[#1A1A1A]">Recommend automatically:</strong> always allowed.</p>
            <p><strong className="text-[#1A1A1A]">Draft automatically:</strong> allowed for review.</p>
            <p><strong className="text-[#1A1A1A]">Send or call:</strong> requires provider, consent, and approval.</p>
            <p><strong className="text-[#1A1A1A]">Sign or publish:</strong> always requires explicit human confirmation.</p>
          </div>
          <button
            onClick={() => onAskAssistant('Give me my complete proactive briefing and walk me through the first action.')}
            className="mt-5 w-full px-4 py-3 rounded-xl bg-[#1A1A1A] text-white text-xs font-semibold flex items-center justify-center gap-2 hover:opacity-90 cursor-pointer"
          >
            <Radio className="w-4 h-4 text-[#D4AF37]" />
            Talk through my day
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-2xl text-[#1A1A1A]">Next best actions</h3>
          <span className="text-[10px] uppercase tracking-widest text-neutral-400">
            Recomputed from live workspace state
          </span>
        </div>

        {visible.map((action, index) => (
          <div
            key={action.id}
            className="p-5 rounded-3xl bg-white border border-[rgba(139,125,107,0.2)] flex flex-col lg:flex-row lg:items-center gap-4"
          >
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center ${priorityStyle[action.priority]}`}>
                <action.Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-semibold text-[#D4AF37]">#{index + 1}</span>
                  <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${priorityStyle[action.priority]}`}>
                    {action.priority}
                  </span>
                </div>
                <h4 className="font-semibold text-[#1A1A1A] mt-1">{action.title}</h4>
                <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{action.reason}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => onAskAssistant(action.prompt)}
                className="px-4 py-2.5 rounded-xl border border-[rgba(139,125,107,0.25)] text-xs font-semibold text-[#1A1A1A] flex items-center gap-1.5 hover:border-[#D4AF37] cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                Ask Assistant
              </button>
              <button
                onClick={() => onNavigate(action.target)}
                className="px-4 py-2.5 rounded-xl bg-[#1A1A1A] text-white text-xs font-semibold flex items-center gap-1.5 hover:opacity-90 cursor-pointer"
              >
                {action.action}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setCompleted((items) => [...items, action.id])}
                className="p-2.5 rounded-xl bg-neutral-100 text-neutral-500 hover:text-[#1A1A1A] cursor-pointer"
                title="Mark reviewed"
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
