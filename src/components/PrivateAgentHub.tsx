'use client';

import React, { useState } from 'react';
import {
  Lock,
  EyeOff,
  Eye,
  ShieldCheck,
  Plus,
  Trash2,
  FolderKanban,
  FileText,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Search,
  Sparkles,
  UserCheck,
  KeyRound,
} from 'lucide-react';

export interface AgentRecordItem {
  id: number;
  title: string;
  category: string;
  relatedPropertyTitle: string;
  clientName: string;
  confidentialNotes: string;
  financialFigure: string;
  priority: string;
  isClientHidden: boolean;
  updatedAtLabel: string;
}

interface PrivateAgentHubProps {
  records: AgentRecordItem[];
  onAddRecord: (newRecord: {
    title: string;
    category: string;
    relatedPropertyTitle: string;
    clientName: string;
    confidentialNotes: string;
    financialFigure: string;
    priority: string;
  }) => Promise<void>;
  onDeleteRecord: (id: number) => Promise<void>;
}

export default function PrivateAgentHub({
  records,
  onAddRecord,
  onDeleteRecord,
}: PrivateAgentHubProps) {
  const [simulateClientView, setSimulateClientView] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showNewModal, setShowNewModal] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Seller Confidential');
  const [relatedPropertyTitle, setRelatedPropertyTitle] = useState(
    'Villa Lumina // Bel-Air Glass Sanctuary'
  );
  const [clientName, setClientName] = useState('');
  const [confidentialNotes, setConfidentialNotes] = useState('');
  const [financialFigure, setFinancialFigure] = useState('');
  const [priority, setPriority] = useState('CRITICAL');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !confidentialNotes.trim()) return;
    setIsSubmitting(true);
    try {
      await onAddRecord({
        title,
        category,
        relatedPropertyTitle,
        clientName: clientName || 'Confidential Client Entity',
        confidentialNotes,
        financialFigure: financialFigure || 'Confidential Terms',
        priority,
      });
      setTitle('');
      setConfidentialNotes('');
      setFinancialFigure('');
      setClientName('');
      setShowNewModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    'ALL',
    'Seller Confidential',
    'Buyer Proof of Funds',
    'Commission & Escrow',
    'Pocket Listing Strategy',
  ];

  const filteredRecords = records.filter((rec) => {
    const matchesCat =
      selectedCategory === 'ALL' || rec.category === selectedCategory;
    const matchesSearch =
      rec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.confidentialNotes.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Security & Client-Visibility Shield Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#141A26] via-[#1B1818] to-[#121721] border border-[#D4AF37]/40 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] shadow-lg">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono-code text-[11px] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                STRICTLY AGENT-ONLY WORKSPACE // CLIENT-INVISIBLE
              </span>
              <span className="font-mono-code text-xs text-[#D4AF37]">
                Owner: Melissa Hatfield, REALTOR® / Broker · John L. Scott Real Estate (253-514-7676)
              </span>
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-white mt-1">
              Private Real Estate Agent Hub & Confidential Record Organizer
            </h2>
            <p className="text-xs text-slate-300 mt-0.5 max-w-3xl">
              This encrypted organizer stores your private seller bottom-line figures, off-market pocket agreements, verified buyer liquidity letters, and commission splits. Clients viewing public listings or AI video tours can never access or view this hub.
            </p>
          </div>
        </div>

        {/* Interactive Client Visibility Simulator Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSimulateClientView(!simulateClientView)}
            className={`px-4 py-2.5 rounded-xl font-mono-code text-xs font-bold flex items-center gap-2 border transition cursor-pointer ${
              simulateClientView
                ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                : 'bg-[#0A0D12] border-white/15 text-slate-300 hover:border-[#D4AF37]'
            }`}
          >
            {simulateClientView ? (
              <>
                <Eye className="w-4 h-4 text-amber-400" />
                <span>Simulating Public Client View (Records Hidden)</span>
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4 text-emerald-400" />
                <span>Test What Clients See (Verify Privacy Shield)</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              const el = document.getElementById('documents');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-4 py-2.5 rounded-xl bg-[#0A0D12] border border-[#D4AF37]/50 text-[#F3E5AB] hover:text-white font-mono-code text-xs flex items-center gap-2 transition cursor-pointer"
          >
            <FileText className="w-4 h-4 text-[#D4AF37]" />
            <span>Document Vault &amp; E-Sign</span>
          </button>

          <button
            onClick={() => setShowNewModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#0A0D12] font-bold text-xs flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Private Agent Record</span>
          </button>
        </div>
      </div>

      {/* If simulating what a client sees, show the Privacy Shield Lockout State */}
      {simulateClientView ? (
        <div className="p-12 rounded-2xl bg-[#0D1118] border border-amber-500/30 text-center max-w-2xl mx-auto my-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <Lock className="w-8 h-8" />
          </div>
          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-mono-code text-xs">
            CLIENT PRIVACY SHIELD VERIFIED
          </span>
          <h3 className="font-display text-2xl font-bold text-white">
            Zero Confidential Agent Records Exposed to Public / Client View
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            When a buyer or seller views your shared property links or 4K video tours, all {records.length} confidential records (seller bottom-line prices, Zurich relocation notes, and brokerage commissions) are completely invisible.
          </p>
          <button
            onClick={() => setSimulateClientView(false)}
            className="px-5 py-2.5 rounded-xl bg-[#D4AF37] text-[#0A0D12] font-bold text-xs cursor-pointer"
          >
            Return to Agent-Only Organizer View
          </button>
        </div>
      ) : (
        <>
          {/* Filter & Search Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-[#121721] p-4 rounded-xl border border-white/10">
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#D4AF37] text-[#0A0D12]'
                      : 'bg-[#0A0D12] text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative min-w-[260px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search confidential notes, seller bottom line..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0A0D12] border border-white/15 rounded-lg pl-9 pr-4 py-1.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          {/* Grid of Confidential Agent Records */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredRecords.map((rec) => (
              <div
                key={rec.id}
                className="p-6 rounded-2xl bg-[#121721] border border-white/10 hover:border-[#D4AF37]/40 transition flex flex-col justify-between space-y-4 relative group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded bg-[#D4AF37]/15 text-[#D4AF37] font-mono-code text-[11px] font-semibold">
                        {rec.category}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded font-mono-code text-[10px] font-bold ${
                          rec.priority === 'CRITICAL'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {rec.priority}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono-code text-slate-400 flex items-center gap-1">
                        <EyeOff className="w-3.5 h-3.5 text-[#D4AF37]" />
                        Agent Eyes Only
                      </span>
                      <button
                        onClick={() => onDeleteRecord(rec.id)}
                        className="p-1.5 rounded bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition cursor-pointer"
                        title="Delete Confidential Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-display text-xl font-bold text-white">
                    {rec.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 font-mono-code">
                    <span>
                      Client Entity:{' '}
                      <strong className="text-white">{rec.clientName}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Key Figure:{' '}
                      <strong className="text-[#D4AF37]">
                        {rec.financialFigure}
                      </strong>
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0A0D12] border border-white/5 text-xs text-slate-200 leading-relaxed">
                    {rec.confidentialNotes}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono-code text-slate-400">
                  <span>Listing: {rec.relatedPropertyTitle}</span>
                  <span>Updated: {rec.updatedAtLabel}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modal to Add New Confidential Agent Record */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <form
            onSubmit={handleCreate}
            className="w-full max-w-lg bg-[#121721] border border-[#D4AF37]/40 rounded-2xl p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="font-display text-xl font-bold text-white">
                  New Private Agent Record (Client-Invisible)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Record Title / Dossier Headline
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Seller Verbal Authorization for $270K Cash Close (or $1.4M Floor)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#0A0D12] border border-white/15 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#0A0D12] border border-white/15 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option>Seller Confidential</option>
                    <option>Buyer Proof of Funds</option>
                    <option>Commission & Escrow</option>
                    <option>Pocket Listing Strategy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">
                    Key Financial Figure / Floor
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. $272,000 Net Floor (or $14.2M)"
                    value={financialFigure}
                    onChange={(e) => setFinancialFigure(e.target.value)}
                    className="w-full bg-[#0A0D12] border border-white/15 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">
                    Client / Trust Entity
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Marcus & Elena Vance"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-[#0A0D12] border border-white/15 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">
                    Priority Level
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-[#0A0D12] border border-white/15 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="NORMAL">NORMAL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Confidential Agent Notes (Never Shared with Clients)
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Enter private negotiation leverage, seller bottom line, or commission instructions..."
                  value={confidentialNotes}
                  onChange={(e) => setConfidentialNotes(e.target.value)}
                  className="w-full bg-[#0A0D12] border border-white/15 rounded-lg p-3 text-xs text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="px-4 py-2 rounded-lg bg-white/5 text-xs text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-lg bg-[#D4AF37] text-[#0A0D12] font-bold text-xs cursor-pointer"
              >
                {isSubmitting ? 'Saving...' : 'Save Confidential Record'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
