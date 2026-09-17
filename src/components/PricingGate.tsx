'use client';

import React, { useState } from 'react';
import { Check, Lock, Loader2, Crown } from 'lucide-react';
import { AuthUser } from './AuthModal';

interface PricingGateProps {
  starterPrice: string;
  proPrice: string;
  elitePrice: string;
  currentUser: AuthUser | null;
  onRequireLogin: () => void;
  onSubscribed: () => void;
}

export default function PricingGate({
  starterPrice,
  proPrice,
  elitePrice,
  currentUser,
  onRequireLogin,
  onSubscribed,
}: PricingGateProps) {
  const [subscribingPlan, setSubscribingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async (plan: string) => {
    if (!currentUser) {
      onRequireLogin();
      return;
    }
    setError(null);
    setSubscribingPlan(plan);
    try {
      const res = await fetch('/api/platform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'subscribe', plan }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || 'Subscription failed.');
        return;
      }
      onSubscribed();
    } catch {
      setError('Could not reach the server.');
    } finally {
      setSubscribingPlan(null);
    }
  };

  const plans = [
    {
      id: 'starter',
      name: 'Solo Agent',
      price: starterPrice,
      tagline: 'For one agent getting started',
      features: [
        'Upload up to 5 active listings',
        'AI Cinema Studio auto-cut films (16:9 + 9:16)',
        'Buyer scraping swarm + outreach',
        'Call bridge with seller vault',
        'Personal AI assistant',
      ],
      highlight: false,
    },
    {
      id: 'pro',
      name: 'Top Producer',
      price: proPrice,
      tagline: 'For high-volume closers',
      features: [
        'Unlimited listings',
        'Full autonomous marketing team + war room',
        'Priority scraper + 24h campaign cycles',
        'Deal desk with LOI generator',
        'Private hub + OpenCode assistant',
      ],
      highlight: true,
    },
    {
      id: 'elite',
      name: 'Brokerage Elite',
      price: elitePrice,
      tagline: 'For teams & brokerages',
      features: [
        'Everything in Top Producer',
        'Multi-agent seats (up to 10)',
        'White-label cinematic branding',
        'Dedicated pocket-network PR blasts',
        'Priority support + onboarding call',
      ],
      highlight: false,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#121721] border border-[#D4AF37]/40 text-[11px] font-mono-code text-[#F3E5AB]">
          <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
          SUBSCRIPTION REQUIRED
        </span>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-4">
          Unlock the complete autonomous system
        </h2>
        <p className="text-slate-400 mt-2 max-w-2xl mx-auto text-sm leading-relaxed">
          {currentUser
            ? `Hi ${currentUser.name.split(' ')[0]} — pick a plan to activate your workspace instantly.`
            : 'Create your agent account and pick a plan to activate your workspace instantly.'}
        </p>
      </div>

      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2.5 mb-6 text-center max-w-xl mx-auto">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-2xl p-6 flex flex-col ${
              plan.highlight
                ? 'bg-gradient-to-b from-[#1B1818] to-[#121721] border-2 border-[#D4AF37] shadow-2xl shadow-[#D4AF37]/10'
                : 'bg-[#121721] border border-white/10'
            }`}
          >
            {plan.highlight && (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono-code font-bold text-[#0A0D12] bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] px-2.5 py-1 rounded-full w-fit mb-3">
                <Crown className="w-3 h-3" /> MOST POPULAR
              </span>
            )}
            <h3 className="font-display text-xl font-bold text-white">
              {plan.name}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">{plan.tagline}</p>
            <p className="mt-3 mb-5">
              <span className="font-display text-4xl font-bold text-[#D4AF37]">
                {plan.price}
              </span>
              <span className="text-xs text-slate-400"> /month</span>
            </p>
            <ul className="space-y-2.5 flex-1 mb-6">
              {plan.features.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSubscribe(plan.id)}
              disabled={subscribingPlan !== null}
              className={`w-full py-3 rounded-xl font-bold text-sm cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 ${
                plan.highlight
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#0A0D12]'
                  : 'bg-white/10 hover:bg-white/15 text-white'
              }`}
            >
              {subscribingPlan === plan.id && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              {currentUser ? 'Subscribe Now' : 'Sign Up & Subscribe'}
            </button>
          </div>
        ))}
      </div>

      <p className="text-center text-[11px] text-slate-500 mt-6">
        Billing is not connected yet. Plans cannot be activated until Stripe Checkout and verified webhooks are configured.
      </p>
    </div>
  );
}
