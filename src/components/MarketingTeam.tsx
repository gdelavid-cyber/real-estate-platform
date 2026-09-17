'use client';

import React, { useState } from 'react';
import {
  Megaphone,
  Play,
  Rocket,
  Copy,
  Check,
  Users,
  BarChart3,
  Activity,
  ChevronDown,
  ChevronRight,
  Loader2,
  Radar,
  Award,
} from 'lucide-react';
import {
  CampaignAsset,
  CampaignActivity,
  CampaignMetrics,
} from '@/db/schema';

interface MarketingProperty {
  id: number;
  title: string;
  address: string;
  price: string;
  heroPhotoUrl: string;
}

export interface CampaignRecord {
  id: number;
  propertyId: number;
  propertyTitle: string;
  campaignName: string;
  cinemaStyle: string;
  status: string;
  strategy: string;
  creativeAssets: CampaignAsset[];
  activityLog: CampaignActivity[];
  metrics: CampaignMetrics;
  scrapedLeadIds: number[];
  cyclesRun: number;
}

interface MarketingTeamProps {
  properties: MarketingProperty[];
  campaigns: CampaignRecord[];
  onLaunch: (propertyId: number, cinemaStyle: string) => Promise<boolean>;
  onPulse: (campaignId: number) => Promise<boolean>;
}

const CINEMA_STYLES = [
  { id: 'twilight-gold', name: 'Twilight Cinematic Gold' },
  { id: 'ad-editorial', name: 'Architectural Digest Editorial' },
  { id: 'modern-minimal', name: 'Modern Minimal Gallery' },
  { id: 'urban-pulse', name: 'Urban Penthouse Pulse' },
  { id: 'tropical-luxe', name: 'Tropical Resort Lifestyle' },
];

const TEAM = [
  { name: 'Elena Voss', role: 'Creative Director', exp: '20 yrs, 3 Cannes Property Lions' },
  { name: 'Margaret Chen', role: 'Email & CRM Director', exp: 'Ex-Sotheby’s luxury nurture' },
  { name: 'Diego Ramirez', role: 'Social / Reels Director', exp: '1.2B organic views across listings' },
  { name: 'Priya Nair', role: 'Paid Media Strategist', exp: '$40M managed in HNW ad spend' },
  { name: 'Jonathan Ashe', role: 'PR & Pocket Network Lead', exp: '140-broker whisper network' },
  { name: 'Scraper-Alpha', role: 'Buyer Intelligence Node', exp: 'Teamed swarm: 1,240 profiles/day' },
];

export default function MarketingTeam({
  properties,
  campaigns,
  onLaunch,
  onPulse,
}: MarketingTeamProps) {
  const [selectedPropertyId, setSelectedPropertyId] = useState<number>(
    properties[0]?.id || 1
  );
  const [selectedStyle, setSelectedStyle] = useState('twilight-gold');
  const [launching, setLaunching] = useState(false);
  const [pulsingId, setPulsingId] = useState<number | null>(null);
  const [expandedCampaign, setExpandedCampaign] = useState<number | null>(
    null
  );
  const [expandedAssets, setExpandedAssets] = useState<Record<number, string | null>>({});
  const [copiedAsset, setCopiedAsset] = useState<string | null>(null);

  const handleLaunch = async () => {
    setLaunching(true);
    await onLaunch(selectedPropertyId, selectedStyle);
    setLaunching(false);
  };

  const handlePulse = async (id: number) => {
    setPulsingId(id);
    await onPulse(id);
    setPulsingId(null);
  };

  const copyAsset = (key: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedAsset(key);
    setTimeout(() => setCopiedAsset(null), 2000);
  };

  const fmt = (n: number) => n.toLocaleString();

  return (
    <div className="space-y-8">
      {/* Launch deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-[#121721] border border-[#D4AF37]/30 rounded-2xl p-6 md:p-7 space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
              <Megaphone className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-white">
                Trigger the autonomous marketing team
              </h3>
              <p className="text-xs text-slate-400">
                One trigger launches the complete veteran-agency playbook — film,
                ads, email, social, PR and buyer scraping run on their own.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono-code uppercase tracking-wider text-slate-400 mb-1.5">
                Listing to promote
              </label>
              <select
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(Number(e.target.value))}
                className="w-full bg-[#0A0D12] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.price})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-mono-code uppercase tracking-wider text-slate-400 mb-1.5">
                Cinema grade & brand style
              </label>
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="w-full bg-[#0A0D12] border border-white/15 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
              >
                {CINEMA_STYLES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Team roster */}
          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono-code uppercase tracking-wider text-[#D4AF37] mb-2.5">
              <Users className="w-3.5 h-3.5" />
              The team assigned to your listing
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {TEAM.map((member) => (
                <div
                  key={member.name}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[#0A0D12] border border-white/10"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#D4AF37]/40 to-[#9A7B2C]/40 border border-[#D4AF37]/40 flex items-center justify-center text-[11px] font-bold text-[#F3E5AB] flex-shrink-0">
                    {member.name
                      .split(' ')
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white">{member.name}</p>
                    <p className="text-[11px] text-[#D4AF37]">{member.role}</p>
                    <p className="text-[10px] text-slate-500 truncate">{member.exp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleLaunch}
            disabled={launching || properties.length === 0}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#0A0D12] font-bold text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-[#D4AF37]/25 cursor-pointer disabled:opacity-60"
          >
            {launching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Team is building the campaign...
              </>
            ) : (
              <>
                <Rocket className="w-4 h-4" />
                Launch Full Autonomous Campaign
              </>
            )}
          </button>
        </div>

        {/* Playbook card */}
        <div className="lg:col-span-5 bg-[#121721] border border-white/10 rounded-2xl p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-4 h-4 text-[#D4AF37]" />
            <h4 className="font-semibold text-sm text-white">
              The battle-tested playbook
            </h4>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Forged from thousands of luxury launches — including the failed
            campaigns that taught us what never to do again. The system leads
            with scarcity and cinematic emotion, never price; whispers to the
            CRM before going public; retargets only 10-second viewers; and never
            exposes seller terms outside the private vault.
          </p>
          <div className="space-y-2 text-xs text-slate-300 flex-1">
            {[
              'T+0 — Hero film + 9:16 cutdowns rendered in the chosen grade',
              'T+45m — Personalized email to every liquidity-verified buyer',
              'T+1h — Reels posted at proven HNW time windows',
              'T+1h — Meta + Google luxury audiences live, A/B tested',
              'T+2h — 140-broker whisper network + press teasers',
              'Ongoing — Scraper finds new buyers; replies scored 24/7',
              'On contact — Seller vault opens, warm call transfers to you',
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] text-[10px] font-mono-code flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active campaigns */}
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#D4AF37]" />
          <h3 className="font-display text-2xl font-bold text-white">
            Live campaign war room
          </h3>
          <span className="font-mono-code text-xs text-slate-400">
            {campaigns.length} autonomous campaign{campaigns.length === 1 ? '' : 's'} running
          </span>
        </div>

        {campaigns.length === 0 && (
          <div className="p-10 rounded-2xl bg-[#121721] border border-dashed border-white/15 text-center">
            <Radar className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400">
              No campaigns yet. Choose a listing above and launch the team.
            </p>
          </div>
        )}

        <div className="space-y-5">
          {campaigns.map((campaign) => {
            const prop = properties.find((p) => p.id === campaign.propertyId);
            const isOpen = expandedCampaign === campaign.id;
            return (
              <div
                key={campaign.id}
                className="rounded-2xl bg-[#121721] border border-white/10 overflow-hidden"
              >
                {/* Campaign header + metrics */}
                <div className="p-5 md:p-6 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {prop && (
                      <img
                        src={prop.heroPhotoUrl}
                        alt={campaign.propertyTitle}
                        className="w-16 h-16 rounded-xl object-cover border border-white/10"
                      />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span className="font-mono-code text-[10px] uppercase tracking-widest text-emerald-400">
                          Active · {campaign.cyclesRun} autonomous cycles run
                        </span>
                      </div>
                      <h4 className="font-display text-lg font-bold text-white mt-0.5">
                        {campaign.campaignName}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono-code">
                        Grade: {campaign.cinemaStyle} ·{' '}
                        {campaign.scrapedLeadIds.length} buyers found & contacted
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePulse(campaign.id)}
                      disabled={pulsingId === campaign.id}
                      className="px-4 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#0A0D12] font-bold text-xs flex items-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {pulsingId === campaign.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Play className="w-3.5 h-3.5" />
                      )}
                      Run Next Autonomous Cycle (+24h)
                    </button>
                    <button
                      onClick={() =>
                        setExpandedCampaign(isOpen ? null : campaign.id)
                      }
                      className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      {isOpen ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                      {isOpen ? 'Hide brief' : 'View assets & logs'}
                    </button>
                  </div>
                </div>

                {/* Metrics strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-px bg-white/10 border-t border-white/10">
                  {[
                    { label: 'Impressions', value: fmt(campaign.metrics.impressions) },
                    { label: 'Reel Views', value: fmt(campaign.metrics.reelViews) },
                    { label: 'Email Opens', value: fmt(campaign.metrics.emailOpens) },
                    { label: 'Replies', value: fmt(campaign.metrics.emailReplies) },
                    { label: 'Hot Leads', value: fmt(campaign.metrics.hotLeads) },
                    { label: 'Tours Booked', value: fmt(campaign.metrics.toursBooked) },
                    { label: 'Offers', value: fmt(campaign.metrics.offersGenerated) },
                  ].map((metric) => (
                    <div key={metric.label} className="bg-[#0D1118] px-3 py-3 text-center">
                      <p className="font-display text-lg font-bold text-white">
                        {metric.value}
                      </p>
                      <p className="text-[10px] font-mono-code uppercase text-slate-500 tracking-wide">
                        {metric.label}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Expanded detail: assets + activity */}
                {isOpen && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-5 md:p-6 border-t border-white/10">
                    {/* Creative assets */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <BarChart3 className="w-4 h-4 text-[#D4AF37]" />
                        <h5 className="font-semibold text-sm text-white">
                          Delivered creative assets ({campaign.creativeAssets.length})
                        </h5>
                      </div>
                      <div className="space-y-2.5">
                        {campaign.creativeAssets.map((asset) => {
                          const key = `${campaign.id}-${asset.id}`;
                          const open = expandedAssets[campaign.id] === asset.id;
                          return (
                            <div
                              key={asset.id}
                              className="rounded-xl bg-[#0A0D12] border border-white/10 overflow-hidden"
                            >
                              <button
                                onClick={() =>
                                  setExpandedAssets((prev) => ({
                                    ...prev,
                                    [campaign.id]: open ? null : asset.id,
                                  }))
                                }
                                className="w-full px-3.5 py-2.5 flex items-center justify-between text-left cursor-pointer"
                              >
                                <div>
                                  <p className="text-xs font-bold text-white">
                                    {asset.title}
                                  </p>
                                  <p className="text-[10px] text-[#D4AF37] font-mono-code">
                                    {asset.channel} · {asset.specialist}
                                  </p>
                                </div>
                                {open ? (
                                  <ChevronDown className="w-4 h-4 text-slate-400" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-slate-400" />
                                )}
                              </button>
                              {open && (
                                <div className="px-3.5 pb-3 space-y-2">
                                  <pre className="whitespace-pre-wrap text-[11px] text-slate-300 leading-relaxed font-sans bg-[#0D1118] border border-white/5 rounded-lg p-3">
                                    {asset.content}
                                  </pre>
                                  <button
                                    onClick={() => copyAsset(key, asset.content)}
                                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-[11px] text-white flex items-center gap-1.5 cursor-pointer"
                                  >
                                    {copiedAsset === key ? (
                                      <>
                                        <Check className="w-3 h-3 text-emerald-400" />
                                        Copied
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3 h-3" />
                                        Copy asset
                                      </>
                                    )}
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Activity timeline */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Activity className="w-4 h-4 text-emerald-400" />
                        <h5 className="font-semibold text-sm text-white">
                          Autonomous team activity
                        </h5>
                      </div>
                      <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                        {[...campaign.activityLog].reverse().map((log, idx) => (
                          <div key={log.id} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <span
                                className={`w-2.5 h-2.5 rounded-full mt-1.5 ${
                                  idx === 0 ? 'bg-emerald-400 animate-ping' : 'bg-[#D4AF37]'
                                }`}
                              />
                              {idx < campaign.activityLog.length - 1 && (
                                <span className="w-px flex-1 bg-white/10 mt-1" />
                              )}
                            </div>
                            <div className="pb-1">
                              <p className="text-[10px] font-mono-code text-slate-500">
                                {log.offset} · {log.specialist}
                              </p>
                              <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
                                {log.message}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
