'use client';

import React, { useState } from 'react';
import {
  Database,
  PhoneIncoming,
  PhoneCall,
  Plus,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { OutreachMessage } from '@/db/schema';
import { CallTransferRecord } from './CallTransferDrawer';

export interface LeadRecord {
  id: number;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerBudget: string;
  buyerSource: string;
  matchedPropertyId: number;
  stage: string;
  aiAgentNode: string;
  intentScore: number;
  outreachHistory: OutreachMessage[];
  buyerNotes: string;
  lastContactedAt: string;
}

interface PropertyItem {
  id: number;
  title: string;
  address: string;
  price: string;
  sellerName: string;
  sellerPhone: string;
  sellerBottomLine: string;
  agentAssigned: string;
}

interface SwarmCommandCenterProps {
  properties: PropertyItem[];
  leads: LeadRecord[];
  callTransfers: CallTransferRecord[];
  onAddLead: (lead: Record<string, unknown>) => Promise<boolean>;
  onBuyerContact: (leadId: number) => Promise<void>;
  onOpenTransferDossier: (transfer: CallTransferRecord) => void;
}

export default function SwarmCommandCenter({
  properties,
  leads,
  callTransfers,
  onAddLead,
  onBuyerContact,
  onOpenTransferDossier,
}: SwarmCommandCenterProps) {
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    buyerName: '',
    buyerEmail: '',
    buyerPhone: '',
    buyerBudget: '',
    buyerSource: 'Referral',
    matchedPropertyId: properties[0]?.id || 0,
    intentScore: 50,
    buyerNotes: '',
  });

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    const ok = await onAddLead(form);
    setSaving(false);
    if (ok) {
      setShowForm(false);
      setForm({
        buyerName: '',
        buyerEmail: '',
        buyerPhone: '',
        buyerBudget: '',
        buyerSource: 'Referral',
        matchedPropertyId: properties[0]?.id || 0,
        intentScore: 50,
        buyerNotes: '',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-[#121721] border border-white/10 text-white flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#D4AF37]">Verified CRM pipeline</span>
          <h3 className="font-display text-2xl text-white mt-1">Real leads only</h3>
          <p className="text-xs text-slate-300 mt-2 max-w-2xl">
            Add opted-in leads from referrals, open houses, phone calls, or approved portal integrations. No contacts are fabricated or scraped without authorization.
          </p>
        </div>
        <button
          onClick={() => setShowForm((value) => !value)}
          className="px-4 py-2.5 rounded-xl bg-[#D4AF37] text-[#0A0D12] font-semibold text-xs flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add real lead
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="p-6 rounded-3xl bg-[#121721] border border-[#D4AF37]/30 grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            ['buyerName', 'Buyer name', 'Full legal or preferred name'],
            ['buyerEmail', 'Email', 'buyer@example.com'],
            ['buyerPhone', 'Phone', '+1 253 ...'],
            ['buyerBudget', 'Budget / approval', '$450,000 pre-approved'],
          ].map(([key, label, placeholder]) => (
            <label key={key} className="text-xs text-slate-300">
              <span className="block mb-1">{label}</span>
              <input
                required={['buyerName', 'buyerEmail', 'buyerPhone'].includes(key)}
                value={String(form[key as keyof typeof form])}
                onChange={(event) => setForm({ ...form, [key]: event.target.value })}
                placeholder={placeholder}
                className="w-full bg-[#0A0D12] border border-white/15 rounded-xl px-3 py-2 text-white"
              />
            </label>
          ))}
          <label className="text-xs text-slate-300">
            <span className="block mb-1">Source</span>
            <select
              value={form.buyerSource}
              onChange={(event) => setForm({ ...form, buyerSource: event.target.value })}
              className="w-full bg-[#0A0D12] border border-white/15 rounded-xl px-3 py-2 text-white"
            >
              <option>Referral</option><option>Open house</option><option>Phone inquiry</option>
              <option>Zillow lead</option><option>Redfin lead</option><option>HomeSpotter lead</option>
              <option>Brokerage website</option>
            </select>
          </label>
          <label className="text-xs text-slate-300">
            <span className="block mb-1">Linked listing</span>
            <select
              value={form.matchedPropertyId}
              onChange={(event) => setForm({ ...form, matchedPropertyId: Number(event.target.value) })}
              className="w-full bg-[#0A0D12] border border-white/15 rounded-xl px-3 py-2 text-white"
            >
              <option value={0}>Not linked yet</option>
              {properties.map((property) => <option key={property.id} value={property.id}>{property.title}</option>)}
            </select>
          </label>
          <label className="md:col-span-2 text-xs text-slate-300">
            <span className="block mb-1">Notes</span>
            <textarea
              value={form.buyerNotes}
              onChange={(event) => setForm({ ...form, buyerNotes: event.target.value })}
              className="w-full bg-[#0A0D12] border border-white/15 rounded-xl p-3 text-white"
            />
          </label>
          <div className="md:col-span-2 flex justify-end">
            <button disabled={saving} className="px-5 py-2.5 rounded-xl bg-[#D4AF37] text-[#0A0D12] font-semibold text-xs">
              {saving ? 'Saving…' : 'Save CRM lead'}
            </button>
          </div>
        </form>
      )}

      {!leads.length ? (
        <div className="p-12 rounded-3xl bg-white border border-dashed border-[rgba(139,125,107,0.3)] text-center">
          <Database className="w-8 h-8 text-neutral-400 mx-auto" />
          <h4 className="font-semibold text-[#1A1A1A] mt-3">No leads yet</h4>
          <p className="text-sm text-neutral-500 mt-1">Add the first real lead or connect an approved lead source.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {leads.map((lead) => {
            const transfer = callTransfers.find((item) => item.leadId === lead.id);
            return (
              <div key={lead.id} className="p-5 rounded-3xl bg-white border border-[rgba(139,125,107,0.2)] flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-neutral-100 flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <strong>{lead.buyerName}</strong>
                    <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-100">{lead.stage}</span>
                    <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#8B6E00]">Agent score {lead.intentScore}/100</span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">{lead.buyerEmail} · {lead.buyerPhone} · {lead.buyerSource}</p>
                  {lead.buyerNotes && <p className="text-xs text-neutral-600 mt-2">{lead.buyerNotes}</p>}
                </div>
                <div className="flex items-center gap-2">
                  {transfer ? (
                    <button onClick={() => onOpenTransferDossier(transfer)} className="px-4 py-2.5 rounded-xl bg-[#1A1A1A] text-white text-xs font-semibold flex items-center gap-1.5">
                      <PhoneCall className="w-3.5 h-3.5" /> Open call sheet
                    </button>
                  ) : (
                    <button onClick={() => onBuyerContact(lead.id)} className="px-4 py-2.5 rounded-xl border border-[rgba(139,125,107,0.25)] text-xs font-semibold flex items-center gap-1.5">
                      <PhoneIncoming className="w-3.5 h-3.5 text-[#D4AF37]" /> Record buyer contact
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="p-4 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/25 text-xs text-neutral-700 flex gap-2">
        <ShieldCheck className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
        Meta CAPI feedback should only be sent for real, consented leads after Melissa reviews their quality.
      </div>
    </div>
  );
}
