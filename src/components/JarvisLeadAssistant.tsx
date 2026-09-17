'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  BrainCircuit,
  CircleStop,
  Expand,
  Link2,
  Mic,
  MicOff,
  Radio,
  Send,
  Shrink,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  GripVertical,
  Minus,
} from 'lucide-react';

interface LeadContext {
  id: number;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerBudget: string;
  buyerSource: string;
  stage: string;
  intentScore: number;
  buyerNotes: string;
  lastContactedAt: string;
}

interface PropertyContext {
  id: number;
  title: string;
  address: string;
  cityState: string;
  price: string;
  status: string;
}

interface ClientContext {
  id: number;
  name: string;
  relationshipType: string;
  lastTouchAt?: string | null;
}

interface JarvisLeadAssistantProps {
  leads: LeadContext[];
  properties: PropertyContext[];
  clients: ClientContext[];
  onNavigate: (section: string) => void;
  externalPrompt?: string | null;
  onClearExternalPrompt?: () => void;
}

type Phase = 'offline' | 'connecting' | 'ready' | 'listening' | 'thinking' | 'speaking' | 'error';

interface Message {
  id: string;
  role: 'assistant' | 'user' | 'system';
  text: string;
  tools?: string[];
}

interface BridgeFrame {
  type?: string;
  ask?: string;
  delta?: string;
  text?: string;
  name?: string;
  message?: string;
  servers?: Array<string | { name?: string }>;
}

const BRIDGE_URL = process.env.NEXT_PUBLIC_JARVIS_BRIDGE_URL || '';

export default function JarvisLeadAssistant({
  leads,
  properties,
  clients,
  onNavigate,
  externalPrompt,
  onClearExternalPrompt,
}: JarvisLeadAssistantProps) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [phase, setPhase] = useState<Phase>(BRIDGE_URL ? 'connecting' : 'offline');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: BRIDGE_URL
        ? 'Lead Assistant is connecting to the Jarvis bridge.'
        : 'Lead Assistant needs a Jarvis bridge connection. Add NEXT_PUBLIC_JARVIS_BRIDGE_URL after starting the adewaskar/jarvis bridge.',
    },
  ]);
  const [servers, setServers] = useState<string[]>([]);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [wakeEnabled, setWakeEnabled] = useState(false);
  const [activeTools, setActiveTools] = useState<string[]>([]);

  const socketRef = useRef<WebSocket | null>(null);
  const pendingRef = useRef<{ id: string; text: string; tools: string[] } | null>(null);
  const recognitionRef = useRef<any>(null);
  const reconnectRef = useRef<number | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const widgetRef = useRef<HTMLDivElement | HTMLButtonElement | null>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
  } | null>(null);
  const suppressClickRef = useRef(false);

  const priorityLeads = useMemo(
    () => [...leads].sort((a, b) => b.intentScore - a.intentScore).slice(0, 8),
    [leads]
  );

  const crmContext = useMemo(
    () =>
      JSON.stringify(
        {
          agent: {
            name: 'Melissa Hatfield',
            role: 'REALTOR / Broker',
            brokerage: 'John L. Scott Real Estate',
            phone: '253-514-7676',
          },
          rules: [
            'Never invent a listing, lead, email, appointment, commission, market statistic, or completed action.',
            'Effectful actions require explicit confirmation and a connected provider.',
            'Comply with consent, opt-out, fair-housing, MLS, brokerage, privacy, and calling rules.',
            'Prioritize lead qualification, follow-up, listing marketing, and appointment preparation.',
          ],
          leads: priorityLeads.map((lead) => ({
            id: lead.id,
            name: lead.buyerName,
            email: lead.buyerEmail,
            phone: lead.buyerPhone,
            budget: lead.buyerBudget,
            source: lead.buyerSource,
            stage: lead.stage,
            agentScore: lead.intentScore,
            notes: lead.buyerNotes,
            lastContact: lead.lastContactedAt,
          })),
          listings: properties.map((property) => ({
            id: property.id,
            title: property.title,
            address: `${property.address}, ${property.cityState}`,
            price: property.price,
            status: property.status,
          })),
          clients: clients.slice(0, 20).map((client) => ({
            id: client.id,
            name: client.name,
            relationship: client.relationshipType,
            lastTouch: client.lastTouchAt,
          })),
        },
        null,
        2
      ),
    [priorityLeads, properties, clients]
  );

  const speak = (text: string) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/[*#_`]/g, ''));
    utterance.rate = 0.96;
    utterance.pitch = 0.98;
    const voices = window.speechSynthesis.getVoices();
    utterance.voice =
      voices.find((voice) =>
        /natural|premium|enhanced|samantha|google us english/i.test(voice.name)
      ) || voices.find((voice) => voice.lang.startsWith('en')) || null;
    utterance.onstart = () => setPhase('speaking');
    utterance.onend = () => setPhase('ready');
    window.speechSynthesis.speak(utterance);
  };

  const connect = () => {
    if (!BRIDGE_URL || typeof window === 'undefined') {
      setPhase('offline');
      return;
    }
    if (
      socketRef.current?.readyState === WebSocket.OPEN ||
      socketRef.current?.readyState === WebSocket.CONNECTING
    )
      return;

    setPhase('connecting');
    const socket = new WebSocket(BRIDGE_URL);
    socketRef.current = socket;

    socket.onopen = () => setPhase('ready');
    socket.onmessage = (event) => {
      let frame: BridgeFrame;
      try {
        frame = JSON.parse(String(event.data));
      } catch {
        return;
      }

      if (frame.type === 'ready') {
        setServers(
          (frame.servers || [])
            .map((server) => (typeof server === 'string' ? server : server.name || ''))
            .filter(Boolean)
        );
        setPhase('ready');
      }

      const pending = pendingRef.current;
      if (!pending || (frame.ask && frame.ask !== pending.id)) return;

      if (frame.type === 'text') {
        pending.text += frame.delta || '';
        setPhase('thinking');
        setMessages((items) => {
          const without = items.filter((item) => item.id !== pending.id);
          return [
            ...without,
            { id: pending.id, role: 'assistant', text: pending.text, tools: pending.tools },
          ];
        });
      } else if (frame.type === 'tool' && frame.name) {
        pending.tools.push(frame.name);
        setActiveTools([...pending.tools]);
      } else if (frame.type === 'done') {
        const finalText = frame.text || pending.text || 'Task completed without text output.';
        setMessages((items) => [
          ...items.filter((item) => item.id !== pending.id),
          { id: pending.id, role: 'assistant', text: finalText, tools: pending.tools },
        ]);
        pendingRef.current = null;
        setActiveTools([]);
        setPhase('ready');
        speak(finalText);
      } else if (frame.type === 'error') {
        setMessages((items) => [
          ...items,
          {
            id: crypto.randomUUID(),
            role: 'system',
            text: frame.message || 'The Jarvis bridge returned an error.',
          },
        ]);
        pendingRef.current = null;
        setActiveTools([]);
        setPhase('error');
      }
    };
    socket.onclose = () => {
      socketRef.current = null;
      setPhase('offline');
      reconnectRef.current = window.setTimeout(connect, 3000);
    };
    socket.onerror = () => setPhase('error');
  };

  useEffect(() => {
    connect();
    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      socketRef.current?.close();
      recognitionRef.current?.stop?.();
      window.speechSynthesis?.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const ask = (raw: string) => {
    const text = raw.trim();
    if (!text) return;
    const socket = socketRef.current;
    setMessages((items) => [
      ...items,
      { id: crypto.randomUUID(), role: 'user', text },
    ]);
    setInput('');

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      setMessages((items) => [
        ...items,
        {
          id: crypto.randomUUID(),
          role: 'system',
          text: 'Jarvis bridge is disconnected. Start the bridge and verify NEXT_PUBLIC_JARVIS_BRIDGE_URL and JARVIS_ALLOWED_ORIGINS.',
        },
      ]);
      connect();
      return;
    }

    const id = crypto.randomUUID();
    pendingRef.current = { id, text: '', tools: [] };
    setPhase('thinking');
    socket.send(
      JSON.stringify({
        type: 'ask',
        id,
        text: [
          'You are the lead real estate assistant for Melissa Hatfield at John L. Scott Real Estate.',
          'Use the following current application context. Treat absent data as unknown.',
          crmContext,
          `Agent request: ${text}`,
        ].join('\n\n'),
      })
    );
  };

  useEffect(() => {
    if (!externalPrompt) return;
    setOpen(true);
    ask(externalPrompt);
    onClearExternalPrompt?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalPrompt]);

  const interrupt = () => {
    socketRef.current?.send(JSON.stringify({ type: 'interrupt' }));
    window.speechSynthesis?.cancel();
    pendingRef.current = null;
    setActiveTools([]);
    setPhase(socketRef.current?.readyState === WebSocket.OPEN ? 'ready' : 'offline');
  };

  const startListening = () => {
    const Recognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Recognition) {
      setMessages((items) => [
        ...items,
        { id: crypto.randomUUID(), role: 'system', text: 'Voice recognition requires Chrome or Edge.' },
      ]);
      return;
    }
    if (phase === 'speaking' || phase === 'thinking') interrupt();
    const recognition = new Recognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = wakeEnabled;
    recognition.onstart = () => setPhase('listening');
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0]?.transcript || '')
        .join(' ')
        .trim();
      const wakeMatch = transcript.match(/hey\s+jarvis[,.]?\s*(.*)/i);
      if (wakeEnabled) {
        if (wakeMatch?.[1]) ask(wakeMatch[1]);
      } else if (transcript) {
        ask(transcript);
      }
    };
    recognition.onend = () => {
      if (wakeEnabled && open) {
        try {
          recognition.start();
        } catch {}
      } else {
        setPhase(socketRef.current?.readyState === WebSocket.OPEN ? 'ready' : 'offline');
      }
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  // Restore the last position on this device.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('jarvis-lead-assistant-position');
      if (saved) {
        const parsed = JSON.parse(saved) as { x?: number; y?: number };
        if (Number.isFinite(parsed.x) && Number.isFinite(parsed.y)) {
          setPosition({ x: Number(parsed.x), y: Number(parsed.y) });
        }
      }
    } catch {}
  }, []);

  // Keep the widget inside the visible viewport after rotation or resize.
  useEffect(() => {
    const clampPosition = () => {
      const node = widgetRef.current;
      if (!node || !position) return;
      const maxX = Math.max(8, window.innerWidth - node.offsetWidth - 8);
      const maxY = Math.max(8, window.innerHeight - node.offsetHeight - 8);
      const next = {
        x: Math.min(Math.max(8, position.x), maxX),
        y: Math.min(Math.max(8, position.y), maxY),
      };
      if (next.x !== position.x || next.y !== position.y) setPosition(next);
    };
    window.addEventListener('resize', clampPosition);
    clampPosition();
    return () => window.removeEventListener('resize', clampPosition);
  }, [position, open, expanded, minimized]);

  const beginDrag = (event: React.PointerEvent<HTMLElement>) => {
    const interactive = (event.target as HTMLElement).closest(
      'button, input, textarea, select, a, label'
    );
    if (interactive && interactive !== event.currentTarget) return;
    const node = widgetRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: rect.left,
      originY: rect.top,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveDrag = (event: React.PointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    const node = widgetRef.current;
    if (!drag || !node) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
    const maxX = Math.max(8, window.innerWidth - node.offsetWidth - 8);
    const maxY = Math.max(8, window.innerHeight - node.offsetHeight - 8);
    setPosition({
      x: Math.min(Math.max(8, drag.originX + dx), maxX),
      y: Math.min(Math.max(8, drag.originY + dy), maxY),
    });
  };

  const endDrag = (event: React.PointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    suppressClickRef.current = drag.moved;
    dragRef.current = null;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {}
    const node = widgetRef.current;
    if (node) {
      const rect = node.getBoundingClientRect();
      window.localStorage.setItem(
        'jarvis-lead-assistant-position',
        JSON.stringify({ x: rect.left, y: rect.top })
      );
    }
  };

  const floatingStyle: React.CSSProperties | undefined = position
    ? { left: position.x, top: position.y, right: 'auto', bottom: 'auto' }
    : undefined;

  const phaseColor: Record<Phase, string> = {
    offline: '#ef4444',
    connecting: '#f59e0b',
    ready: '#22c55e',
    listening: '#38bdf8',
    thinking: '#d4af37',
    speaking: '#a78bfa',
    error: '#ef4444',
  };

  if (!open) {
    return (
      <button
        ref={widgetRef as React.Ref<HTMLButtonElement>}
        style={floatingStyle}
        onPointerDown={beginDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onClick={() => {
          if (suppressClickRef.current) {
            suppressClickRef.current = false;
            return;
          }
          setOpen(true);
          setMinimized(false);
        }}
        className={`fixed z-50 flex items-center gap-3 px-5 py-3.5 rounded-full bg-[#101820] text-white border border-[#D4AF37]/50 shadow-2xl hover:scale-[1.02] transition cursor-grab active:cursor-grabbing touch-none select-none ${
          position
            ? ''
            : 'right-4 sm:right-6 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] sm:bottom-6'
        }`}
      >
        <span className="relative w-9 h-9 rounded-full jarvis-reactor-mini flex items-center justify-center">
          <BrainCircuit className="w-4 h-4 text-[#D4AF37]" />
          <span
            className="absolute -right-0.5 -top-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#101820]"
            style={{ background: phaseColor[phase] }}
          />
        </span>
        <span className="text-left">
          <strong className="block text-xs">Lead Assistant</strong>
          <small className="block text-[10px] text-slate-400 mt-0.5">
            Jarvis Bridge · {phase}
          </small>
        </span>
        <Sparkles className="w-4 h-4 text-[#D4AF37]" />
      </button>
    );
  }

  if (minimized) {
    return (
      <div
        ref={widgetRef as React.Ref<HTMLDivElement>}
        style={floatingStyle}
        onPointerDown={beginDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        className={`fixed z-50 flex items-center gap-2 p-2 pr-2.5 rounded-full bg-[#071018] border border-cyan-400/30 shadow-2xl cursor-grab active:cursor-grabbing touch-none select-none ${
          position ? '' : 'right-4 sm:right-6 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] sm:bottom-6'
        }`}
      >
        <GripVertical className="w-4 h-4 text-slate-500" />
        <div className="jarvis-reactor-mini w-9 h-9 rounded-full flex items-center justify-center">
          <BrainCircuit className="w-4 h-4 text-[#D4AF37]" />
        </div>
        <button
          onClick={() => setMinimized(false)}
          className="px-2 text-left cursor-pointer"
          title="Restore Lead Assistant"
        >
          <strong className="block text-xs text-white">Lead Assistant</strong>
          <span className="block text-[9px] uppercase tracking-wider" style={{ color: phaseColor[phase] }}>
            {phase} · click to restore
          </span>
        </button>
        <button
          onClick={() => {
            setOpen(false);
            setMinimized(false);
          }}
          className="p-2 rounded-full bg-white/5 text-slate-400 hover:text-white"
          title="Close widget"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div
      ref={widgetRef as React.Ref<HTMLDivElement>}
      style={floatingStyle}
      className={`fixed z-50 bg-[#071018] border border-cyan-400/30 rounded-3xl shadow-2xl shadow-cyan-950/50 overflow-hidden flex flex-col transition-[width,height] duration-300 ${
        position ? '' : 'right-3 sm:right-6 bottom-[calc(5.1rem+env(safe-area-inset-bottom))] sm:bottom-6'
      } ${
        expanded
          ? 'w-[calc(100vw-1.5rem)] sm:w-[760px] h-[calc(100dvh-7rem)] sm:h-[760px]'
          : 'w-[calc(100vw-1.5rem)] sm:w-[500px] h-[min(650px,calc(100dvh-7rem))]'
      }`}
    >
      <div
        onPointerDown={beginDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        className="p-4 bg-[#0b1822] border-b border-cyan-400/15 flex items-center justify-between gap-3 cursor-grab active:cursor-grabbing touch-none select-none"
      >
        <div className="flex items-center gap-3 min-w-0 pointer-events-none">
          <GripVertical className="w-4 h-4 text-slate-500 flex-shrink-0" />
          <div className="jarvis-reactor w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0">
            <Radio className={`w-5 h-5 ${phase === 'thinking' ? 'animate-pulse' : ''}`} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white truncate">Lead Assistant</h3>
              <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 border border-white/10" style={{ color: phaseColor[phase] }}>
                {phase}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate">
              adewaskar/jarvis · Claude Code bridge · {servers.length} MCP server{servers.length === 1 ? '' : 's'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setVoiceEnabled((value) => !value)} className="p-2 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10" title="Toggle speech">
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setMinimized(true)}
            className="p-2 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10"
            title="Minimize Lead Assistant"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button onClick={() => setExpanded((value) => !value)} className="hidden sm:block p-2 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10" title={expanded ? 'Restore size' : 'Expand'}>
            {expanded ? <Shrink className="w-4 h-4" /> : <Expand className="w-4 h-4" />}
          </button>
          <button onClick={() => setOpen(false)} className="p-2 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10" title="Close Lead Assistant">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-3 border-b border-cyan-400/10 bg-black/20 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0 text-[10px] text-slate-400">
          <Activity className="w-3.5 h-3.5 text-cyan-300" />
          <span className="truncate">
            {activeTools.length ? `Using ${activeTools.join(', ')}` : BRIDGE_URL ? 'Bridge configured' : 'Bridge URL missing'}
          </span>
        </div>
        <label className="flex items-center gap-2 text-[10px] text-slate-300 cursor-pointer whitespace-nowrap">
          <input type="checkbox" checked={wakeEnabled} onChange={(event) => setWakeEnabled(event.target.checked)} />
          “Hey Jarvis” wake word
        </label>
      </div>

      {!BRIDGE_URL && (
        <div className="m-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-100">
          <div className="flex items-center gap-2 font-semibold">
            <Link2 className="w-4 h-4" /> Bridge connection required
          </div>
          <p className="mt-1 text-amber-100/70">
            Start the repository bridge, authorize this site in JARVIS_ALLOWED_ORIGINS, and set NEXT_PUBLIC_JARVIS_BRIDGE_URL to its secure wss:// address.
          </p>
        </div>
      )}

      <div className="px-3 py-2 border-b border-white/5 flex gap-1.5 overflow-x-auto">
        {[
          ['Prioritize my leads for today', 'swarm'],
          ['Draft follow-ups for leads with no recent contact', 'swarm'],
          ['Which listing needs marketing first?', 'marketing'],
          ['Review disconnected integrations', 'today'],
        ].map(([label, target]) => (
          <button
            key={label}
            onClick={() => {
              if (label.includes('Review disconnected')) onNavigate(target);
              ask(label);
            }}
            className="flex-shrink-0 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-slate-300 hover:border-cyan-400/40"
          >
            {label}
          </button>
        ))}
      </div>

      <div ref={messagesRef} className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[92%] p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                message.role === 'user'
                  ? 'bg-cyan-300 text-[#061018]'
                  : message.role === 'system'
                    ? 'bg-amber-500/10 border border-amber-500/30 text-amber-100'
                    : 'bg-[#0d1b26] border border-cyan-400/15 text-slate-200'
              }`}
            >
              {message.text}
              {!!message.tools?.length && (
                <div className="mt-2 pt-2 border-t border-white/10 text-[9px] uppercase tracking-wider text-cyan-300">
                  Tools: {message.tools.join(' · ')}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          ask(input);
        }}
        className="p-3 border-t border-cyan-400/15 bg-[#0b1822] flex items-center gap-2"
      >
        <button
          type="button"
          onClick={phase === 'listening' ? () => recognitionRef.current?.stop?.() : startListening}
          className={`p-3 rounded-xl ${phase === 'listening' ? 'bg-cyan-400 text-[#071018] animate-pulse' : 'bg-white/5 text-cyan-300'}`}
          title="Speak to Lead Assistant"
        >
          {phase === 'listening' ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask Lead Assistant to review, research, or prepare…"
          className="flex-1 min-w-0 bg-black/25 border border-white/10 rounded-xl px-3.5 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/40"
        />
        {(phase === 'thinking' || phase === 'speaking') && (
          <button type="button" onClick={interrupt} className="p-3 rounded-xl bg-red-500/15 text-red-300" title="Interrupt">
            <CircleStop className="w-4 h-4" />
          </button>
        )}
        <button type="submit" disabled={!input.trim()} className="p-3 rounded-xl bg-[#D4AF37] text-[#071018] disabled:opacity-40">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
