'use client';

import React, { useState } from 'react';
import {
  Power,
  DollarSign,
  Users,
  CreditCard,
  Save,
  Loader2,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

interface AdminSubscription {
  id: number;
  userEmail: string;
  userName: string;
  plan: string;
  amount: string;
  status: string;
  createdAt: string | null;
}

interface AdminUserRow {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string | null;
}

interface AdminRevenuePanelProps {
  monetizationEnabled: boolean;
  starterPrice: string;
  proPrice: string;
  elitePrice: string;
  adminData: {
    users: AdminUserRow[];
    subscriptions: AdminSubscription[];
    mrr: number;
    totalRevenue: number;
    activeCount: number;
  } | null;
  onChanged: () => void;
  showToast: (msg: string) => void;
}

export default function AdminRevenuePanel({
  monetizationEnabled,
  starterPrice,
  proPrice,
  elitePrice,
  adminData,
  onChanged,
  showToast,
}: AdminRevenuePanelProps) {
  const [toggling, setToggling] = useState(false);
  const [saving, setSaving] = useState(false);
  const [starter, setStarter] = useState(starterPrice);
  const [pro, setPro] = useState(proPrice);
  const [elite, setElite] = useState(elitePrice);

  const handleToggle = async () => {
    setToggling(true);
    try {
      const res = await fetch('/api/platform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_monetization',
          enabled: !monetizationEnabled,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(
          !monetizationEnabled
            ? 'Subscriptions are LIVE — agents must subscribe to enter.'
            : 'Back to Personal Mode — full access, no paywall.'
        );
        onChanged();
      }
    } finally {
      setToggling(false);
    }
  };

  const handleSavePricing = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/platform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_pricing',
          starterPrice: starter,
          proPrice: pro,
          elitePrice: elite,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Pricing updated across the platform.');
        onChanged();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* The big switch */}
      <div
        className={`p-6 md:p-7 rounded-2xl border-2 flex flex-col md:flex-row md:items-center justify-between gap-5 ${
          monetizationEnabled
            ? 'bg-gradient-to-r from-[#0E2A1F] via-[#121721] to-[#121721] border-emerald-400/50'
            : 'bg-gradient-to-r from-[#1B1818] via-[#121721] to-[#121721] border-[#D4AF37]/40'
        }`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
              monetizationEnabled
                ? 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-400'
                : 'bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37]'
            }`}
          >
            <Power className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[10px] font-mono-code font-bold text-white flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#D4AF37]" /> ADMIN ONLY
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono-code font-bold ${
                  monetizationEnabled
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-[#D4AF37]/20 text-[#F3E5AB]'
                }`}
              >
                {monetizationEnabled
                  ? '● SUBSCRIPTION MODE — REVENUE ON'
                  : '● PERSONAL MODE — PRIVATE USE'}
              </span>
            </div>
            <h3 className="font-display text-2xl font-bold text-white mt-2">
              {monetizationEnabled
                ? 'You are selling subscriptions'
                : 'Personal use — flip the switch when ready'}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              {monetizationEnabled
                ? 'Other agents now hit the paywall and must subscribe to access the system. Turn it off anytime to return to private personal use.'
                : 'Right now the system is 100% yours. Test everything, and whenever you like — from anywhere — switch on subscriptions to start collecting monthly revenue from other agents.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggle}
          disabled={toggling}
          className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm cursor-pointer disabled:opacity-60 whitespace-nowrap ${
            monetizationEnabled
              ? 'bg-white/10 hover:bg-white/15 text-white border border-white/20'
              : 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-[#06281C] shadow-xl shadow-emerald-500/20'
          }`}
        >
          {toggling ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <span
              className={`relative w-12 h-7 rounded-full transition ${
                monetizationEnabled ? 'bg-emerald-500' : 'bg-[#0A0D12]/40'
              }`}
            >
              <span
                className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${
                  monetizationEnabled ? 'left-6' : 'left-1'
                }`}
              />
            </span>
          )}
          {monetizationEnabled ? 'Switch OFF' : 'Switch ON — Go Live'}
        </button>
      </div>

      {/* Revenue stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: DollarSign,
            label: 'Monthly Recurring Revenue',
            value: `$${(adminData?.mrr || 0).toLocaleString()}`,
          },
          {
            icon: CreditCard,
            label: 'Active Subscriptions',
            value: String(adminData?.activeCount || 0),
          },
          {
            icon: Users,
            label: 'Registered Agents',
            value: String(
              adminData?.users.filter((u) => u.role !== 'admin').length || 0
            ),
          },
          {
            icon: TrendingUp,
            label: 'Total Transactions',
            value: String(adminData?.subscriptions.length || 0),
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-5 rounded-2xl bg-[#121721] border border-white/10"
          >
            <stat.icon className="w-5 h-5 text-[#D4AF37] mb-2" />
            <p className="font-display text-2xl font-bold text-white">
              {stat.value}
            </p>
            <p className="text-[11px] font-mono-code uppercase text-slate-500 tracking-wide">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Pricing editor */}
        <div className="p-6 rounded-2xl bg-[#121721] border border-white/10">
          <h4 className="font-semibold text-sm text-white mb-1">
            Subscription pricing
          </h4>
          <p className="text-xs text-slate-400 mb-4">
            Changes apply instantly to the paywall.
          </p>
          <div className="space-y-3">
            {[
              { label: 'Solo Agent (Starter)', value: starter, set: setStarter },
              { label: 'Top Producer (Pro)', value: pro, set: setPro },
              { label: 'Brokerage Elite', value: elite, set: setElite },
            ].map((row) => (
              <div key={row.label} className="flex items-center gap-3">
                <span className="text-xs text-slate-300 w-40 flex-shrink-0">
                  {row.label}
                </span>
                <input
                  value={row.value}
                  onChange={(e) => row.set(e.target.value)}
                  className="flex-1 bg-[#0A0D12] border border-white/15 rounded-lg px-3 py-2 text-sm text-[#D4AF37] font-mono-code focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            ))}
          </div>
          <button
            onClick={handleSavePricing}
            disabled={saving}
            className="mt-4 px-5 py-2.5 rounded-xl bg-[#D4AF37] text-[#0A0D12] font-bold text-xs flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            Save Pricing
          </button>
        </div>

        {/* Subscribers */}
        <div className="p-6 rounded-2xl bg-[#121721] border border-white/10">
          <h4 className="font-semibold text-sm text-white mb-1">
            Paying subscribers
          </h4>
          <p className="text-xs text-slate-400 mb-4">
            Every agent subscription, live.
          </p>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {!adminData?.subscriptions.length && (
              <p className="text-xs text-slate-500">
                No subscribers yet — flip the switch and share your link.
              </p>
            )}
            {adminData?.subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center justify-between p-3 rounded-xl bg-[#0A0D12] border border-white/10"
              >
                <div>
                  <p className="text-xs font-bold text-white">{sub.userName}</p>
                  <p className="text-[11px] text-slate-400">{sub.userEmail}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono-code text-[#D4AF37] font-bold">
                    {sub.plan.toUpperCase()} · {sub.amount}
                  </p>
                  <p
                    className={`text-[10px] font-mono-code ${
                      sub.status === 'active'
                        ? 'text-emerald-400'
                        : 'text-slate-500'
                    }`}
                  >
                    {sub.status.toUpperCase()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
