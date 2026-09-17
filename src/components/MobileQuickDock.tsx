'use client';

import React from 'react';
import {
  Home,
  UploadCloud,
  Clapperboard,
  FileSignature,
  Megaphone,
  Menu,
} from 'lucide-react';

interface MobileQuickDockProps {
  onNavigate: (target: string) => void;
  onOpenMenu: () => void;
}

const ITEMS = [
  { target: 'overview', label: 'Home', Icon: Home },
  { target: 'listings', label: 'Listings', Icon: UploadCloud },
  { target: 'marketing', label: 'Swarm', Icon: Megaphone },
  { target: 'meta-dialer', label: 'Dialer', Icon: FileSignature },
  { target: 'documents', label: 'E-Sign', Icon: Clapperboard },
];

export default function MobileQuickDock({
  onNavigate,
  onOpenMenu,
}: MobileQuickDockProps) {
  return (
    <nav
      aria-label="Mobile quick navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 px-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-2"
      style={{
        background:
          'linear-gradient(to top, rgba(253,252,249,0.95), rgba(253,252,249,0.6), transparent)',
      }}
    >
      <div
        className="max-w-lg mx-auto grid grid-cols-6 rounded-2xl overflow-hidden shadow-lg"
        style={{
          background: 'rgba(253, 252, 249, 0.92)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(139, 125, 107, 0.2)',
        }}
      >
        {ITEMS.map(({ target, label, Icon }) => (
          <button
            key={target}
            onClick={() => onNavigate(target)}
            className="min-h-[57px] py-2 flex flex-col items-center justify-center gap-1 transition cursor-pointer"
            style={{ color: 'rgba(26,26,26,0.6)' }}
          >
            <Icon className="w-4 h-4" />
            <span
              className="text-[9px] font-medium uppercase truncate px-0.5"
              style={{ letterSpacing: '0.12em' }}
            >
              {label}
            </span>
          </button>
        ))}
        <button
          onClick={onOpenMenu}
          className="min-h-[57px] py-2 flex flex-col items-center justify-center gap-1 transition cursor-pointer"
          style={{
            color: 'rgba(26,26,26,0.6)',
            borderLeft: '1px solid rgba(139, 125, 107, 0.2)',
          }}
        >
          <Menu className="w-4 h-4" />
          <span
            className="text-[9px] font-medium uppercase"
            style={{ letterSpacing: '0.12em' }}
          >
            More
          </span>
        </button>
      </div>
    </nav>
  );
}
