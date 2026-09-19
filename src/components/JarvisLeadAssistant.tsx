'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  CircleStop,
  Expand,
  GripVertical,
  Mic,
  MicOff,
  Minus,
  Radio,
  Send,
  Shrink,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  Sliders,
} from 'lucide-react';
import JarvisArcReactor, { ReactorPhase } from './JarvisArcReactor';
import JarvisDecodeText from './JarvisDecodeText';
import {
  duckAudio,
  playSfx,
  startAmbientHum,
  stopAmbientHum,
  unlockAudio,
} from '@/lib/jarvis-sfx';

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

const statusLabel: Record<ReactorPhase, string> = {
  offline: 'OFFLINE',
  connecting: 'INITIALISING BRIDGE',
  ready: 'STANDBY — SAY “HEY JARVIS”',
  listening: 'LISTENING',
  thinking: 'PROCESSING DIRECTIVE',
  speaking: 'RESPONDING',
  error: 'SYSTEM ANOMALY',
};

const getEffectiveBridgeUrl = () => {
  if (process.env.NEXT_PUBLIC_JARVIS_BRIDGE_URL) {
    return process.env.NEXT_PUBLIC_JARVIS_BRIDGE_URL;
  }
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'ws://localhost:8787';
    }
  }
  return '';
};

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
  const [phase, setPhase] = useState<ReactorPhase>('ready');
  const [isLiveBridge, setIsLiveBridge] = useState(false);
  const [bridgeUrl, setBridgeUrl] = useState('');
  const [input, setInput] = useState('');
  const [ambientEnabled, setAmbientEnabled] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [wakeEnabled, setWakeEnabled] = useState(false);
  const [activeTools, setActiveTools] = useState<string[]>([]);
  const [signalLevel, setSignalLevel] = useState(0.18);
  const [servers, setServers] = useState<string[]>([]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'J.A.R.V.I.S. online. Standing by for Washington State real estate operations, pipeline prioritization, and deal structuring.',
    },
  ]);

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
  const signalAnimRef = useRef<number | null>(null);

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
            'Washington State real estate copilot — assist licensed broker, never act as substitute licensee.',
            'Two-party consent state: RCW 9.73.030 mandatory disclosure before any call recording.',
            'Strict adherence to Federal and Washington Fair Housing laws (RCW 49.60). Never evaluate or comment on demographic compositions, protected classes, or prohibited neighborhood classifications.',
            'Always format key information with numbers and addresses first, followed by concise commercial context.',
            'Never commit the agent or send binding proposals/contracts without explicit licensee confirmation.',
          ],
          pipeline: {
            totalLeads: leads.length,
            highIntentCount: leads.filter((l) => l.intentScore >= 75).length,
            priorityLeads: priorityLeads.map((lead) => ({
              id: lead.id,
              name: lead.buyerName,
              score: lead.intentScore,
              stage: lead.stage,
              budget: lead.buyerBudget,
              phone: lead.buyerPhone,
              lastContact: lead.lastContactedAt,
            })),
          },
          inventory: {
            totalProperties: properties.length,
            activeCount: properties.filter((p) => p.status === 'Active').length,
            listings: properties.slice(0, 5).map((prop) => ({
              id: prop.id,
              title: prop.title,
              address: `${prop.address}, ${prop.cityState}`,
              price: prop.price,
              status: prop.status,
            })),
          },
          clients: {
            totalClients: clients.length,
            recent: clients.slice(0, 5).map((c) => ({
              id: c.id,
              name: c.name,
              type: c.relationshipType,
              lastTouch: c.lastTouchAt,
            })),
          },
        },
        null,
        2
      ),
    [leads, priorityLeads, properties, clients]
  );

  // Animate simulated live audio signal level based on phase
  useEffect(() => {
    let t = 0;
    const updateSignal = () => {
      t += 0.05;
      let base = 0.15;
      if (phase === 'listening') {
        base = 0.45 + Math.sin(t * 8) * 0.25 + Math.sin(t * 13) * 0.15;
      } else if (phase === 'speaking') {
        base = 0.55 + Math.sin(t * 6) * 0.3;
      } else if (phase === 'thinking') {
        base = 0.75 + Math.sin(t * 12) * 0.15;
      } else {
        base = 0.12 + Math.sin(t * 1.5) * 0.04;
      }
      setSignalLevel(Math.max(0.04, Math.min(1.0, base)));
      signalAnimRef.current = requestAnimationFrame(updateSignal);
    };
    signalAnimRef.current = requestAnimationFrame(updateSignal);
    return () => {
      if (signalAnimRef.current) cancelAnimationFrame(signalAnimRef.current);
    };
  }, [phase]);

  // Authentic British Voice Synthesis with Ducking
  const speak = (rawText: string) => {
    if (!voiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    setPhase('speaking');
    duckAudio(true);

    const clean = rawText
      .replace(/[*_~`#>-]/g, ' ')
      .replace(/https?:\/\/\S+/g, 'link')
      .replace(/\s+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.pitch = 0.92;
    utterance.rate = 0.94;

    const voices = window.speechSynthesis.getVoices();
    const britishMaleVoice = voices.find(
      (v) =>
        (v.lang === 'en-GB' || v.lang.startsWith('en-GB') || v.lang === 'en_GB') &&
        /daniel|george|oliver|arthur|uk.*male|male/i.test(v.name)
    );
    const anyBritishVoice = voices.find(
      (v) => v.lang === 'en-GB' || v.lang.startsWith('en-GB') || v.lang === 'en_GB'
    );
    const fallbackVoice = voices.find((v) => v.lang.startsWith('en') && /male/i.test(v.name));

    utterance.voice = britishMaleVoice || anyBritishVoice || fallbackVoice || null;

    utterance.onend = () => {
      duckAudio(false);
      setPhase(socketRef.current?.readyState === WebSocket.OPEN ? 'ready' : 'ready');
    };

    utterance.onerror = () => {
      duckAudio(false);
      setPhase('ready');
    };

    window.speechSynthesis.speak(utterance);
  };

  // Connect to local Claude Agent SDK WebSocket bridge on port 8787
  const connect = () => {
    const url = getEffectiveBridgeUrl();
    setBridgeUrl(url);
    if (!url) {
      setIsLiveBridge(false);
      setPhase('ready');
      return;
    }

    try {
      const socket = new WebSocket(url);
      socketRef.current = socket;
      setPhase('connecting');

      socket.onopen = () => {
        setIsLiveBridge(true);
        setPhase('ready');
        playSfx('boot');
      };

      socket.onclose = () => {
        setIsLiveBridge(false);
        setPhase('ready');
        if (reconnectRef.current) clearTimeout(reconnectRef.current);
        reconnectRef.current = window.setTimeout(connect, 6000);
      };

      socket.onerror = () => {
        setIsLiveBridge(false);
        setPhase('ready');
      };

      socket.onmessage = (event) => {
        try {
          const frame: BridgeFrame = JSON.parse(event.data);
          if (frame.servers) {
            setServers(
              frame.servers.map((s) => (typeof s === 'string' ? s : s?.name || 'mcp-tool'))
            );
          }
          if (frame.name) {
            setActiveTools((prev) => Array.from(new Set([...prev, frame.name!])));
            playSfx('tool');
          }
          if (frame.type === 'tool_use' && frame.name) {
            setActiveTools((prev) => Array.from(new Set([...prev, frame.name!])));
            playSfx('tool');
          }
          if (frame.type === 'delta' && frame.delta && pendingRef.current) {
            pendingRef.current.text += frame.delta;
            const current = pendingRef.current;
            setMessages((items) => {
              const idx = items.findIndex((m) => m.id === current.id);
              const updated: Message = {
                id: current.id,
                role: 'assistant',
                text: current.text,
                tools: current.tools,
              };
              if (idx === -1) return [...items, updated];
              const next = [...items];
              next[idx] = updated;
              return next;
            });
          }
          if (frame.type === 'turn_complete') {
            const completed = pendingRef.current;
            pendingRef.current = null;
            setActiveTools([]);
            playSfx('done');
            if (completed?.text) {
              speak(completed.text);
            } else {
              setPhase('ready');
            }
          }
        } catch {}
      };
    } catch {
      setIsLiveBridge(false);
      setPhase('ready');
    }
  };

  useEffect(() => {
    connect();
    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      socketRef.current?.close();
      recognitionRef.current?.stop?.();
      window.speechSynthesis?.cancel();
      stopAmbientHum();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  // Ambient Hum Toggle
  const toggleAmbient = () => {
    unlockAudio();
    if (ambientEnabled) {
      stopAmbientHum();
      setAmbientEnabled(false);
    } else {
      startAmbientHum();
      setAmbientEnabled(true);
    }
  };

  const ask = async (raw: string) => {
    const text = raw.trim();
    if (!text) return;
    unlockAudio();

    const socket = socketRef.current;
    const userMsgId = crypto.randomUUID();
    setMessages((items) => [...items, { id: userMsgId, role: 'user', text }]);
    setInput('');
    setPhase('thinking');

    // 1. If WebSocket bridge is live, dispatch to Claude Agent SDK
    if (socket && socket.readyState === WebSocket.OPEN) {
      const id = crypto.randomUUID();
      pendingRef.current = { id, text: '', tools: [] };
      socket.send(
        JSON.stringify({
          type: 'ask',
          id,
          text: [
            'You are JARVIS, the floating AI assistant for licensed real estate broker Melissa Hatfield in Washington State.',
            'Tone: "Handled. Here\'s what you need to know." Numbers and addresses first, context second. Spoken replies under 30 seconds.',
            'Guardrails: Assistant only, never substitute licensee. Comply with Fair Housing, WA RCW 9.73.030 two-party consent, and never auto-send client communications without approval.',
            'Use the following live application context:',
            crmContext,
            `Agent request: ${text}`,
          ].join('\n\n'),
        })
      );
      return;
    }

    // 2. Direct engine fallback via /api/assistant
    const pendingId = crypto.randomUUID();
    try {
      let parsedContext = {};
      try {
        parsedContext = JSON.parse(crmContext);
      } catch {}

      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          crmContext: parsedContext,
        }),
      });

      const data = await response.json();
      const reply = data.reply || data.error || 'Directive processed with no text output.';
      setMessages((items) => [
        ...items,
        { id: pendingId, role: data.reply ? 'assistant' : 'system', text: reply },
      ]);
      playSfx('done');
      if (data.reply) {
        speak(data.reply);
      } else {
        setPhase('ready');
      }
    } catch (err: any) {
      playSfx('error');
      setMessages((items) => [
        ...items,
        {
          id: pendingId,
          role: 'system',
          text: `JARVIS Subsystem Anomaly: ${err?.message || err}`,
        },
      ]);
      setPhase('error');
      setTimeout(() => setPhase('ready'), 3000);
    }
  };

  useEffect(() => {
    if (!externalPrompt) return;
    setOpen(true);
    unlockAudio();
    playSfx('wake');
    ask(externalPrompt);
    onClearExternalPrompt?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalPrompt]);

  const interrupt = () => {
    socketRef.current?.send(JSON.stringify({ type: 'interrupt' }));
    window.speechSynthesis?.cancel();
    duckAudio(false);
    pendingRef.current = null;
    setActiveTools([]);
    playSfx('done');
    setPhase('ready');
  };

  const startListening = () => {
    unlockAudio();
    const Recognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Recognition) {
      setMessages((items) => [
        ...items,
        {
          id: crypto.randomUUID(),
          role: 'system',
          text: 'Voice recognition module requires Chrome, Edge, or Safari.',
        },
      ]);
      playSfx('error');
      return;
    }

    if (phase === 'speaking' || phase === 'thinking') interrupt();

    playSfx('listen');
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
        if (wakeMatch?.[1]) {
          playSfx('wake');
          ask(wakeMatch[1]);
        }
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
        setPhase('ready');
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  // Dragging and viewport boundary calculations
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

  // 1. COLLAPSED FLOATING ARC REACTOR BUTTON
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
          unlockAudio();
          playSfx('wake');
          setOpen(true);
          setMinimized(false);
        }}
        className={`fixed z-50 flex items-center gap-3 pl-2.5 pr-5 py-2.5 rounded-full bg-[#030910]/95 backdrop-blur-xl border border-[#00e5ff]/40 jarvis-glow-box shadow-2xl hover:scale-[1.03] transition-transform cursor-grab active:cursor-grabbing touch-none select-none ${
          position
            ? ''
            : 'right-4 sm:right-6 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] sm:bottom-6'
        }`}
        title="Activate J.A.R.V.I.S. Real Estate Copilot"
      >
        <div className="relative w-12 h-12 flex items-center justify-center">
          <JarvisArcReactor phase={phase} size={48} signalLevel={signalLevel} />
        </div>
        <div className="text-left font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-bold tracking-[0.24em] text-[#00e5ff] drop-shadow-[0_0_8px_#00e5ff]">
              J.A.R.V.I.S.
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] animate-ping" />
          </div>
          <span className="block text-[9px] uppercase tracking-widest text-cyan-200/60 mt-0.5">
            {phase === 'ready' ? 'COPILOT ONLINE' : statusLabel[phase]}
          </span>
        </div>
        <Sparkles className="w-4 h-4 text-[#00e5ff]/80" />
      </button>
    );
  }

  // 2. MINIMIZED STATE CAPSULE
  if (minimized) {
    return (
      <div
        ref={widgetRef as React.Ref<HTMLDivElement>}
        style={floatingStyle}
        onPointerDown={beginDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        className={`fixed z-50 flex items-center gap-2.5 p-2 pr-3 rounded-full bg-[#02070e]/95 backdrop-blur-xl border border-[#00e5ff]/35 shadow-2xl jarvis-glow-box cursor-grab active:cursor-grabbing touch-none select-none ${
          position
            ? ''
            : 'right-4 sm:right-6 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] sm:bottom-6'
        }`}
      >
        <GripVertical className="w-4 h-4 text-cyan-500/40" />
        <JarvisArcReactor phase={phase} size={36} signalLevel={signalLevel} />
        <button
          onClick={() => {
            unlockAudio();
            playSfx('wake');
            setMinimized(false);
          }}
          className="px-2 text-left cursor-pointer font-mono"
          title="Restore J.A.R.V.I.S. HUD"
        >
          <strong className="block text-xs text-[#00e5ff] tracking-widest">J.A.R.V.I.S.</strong>
          <span className="block text-[9px] uppercase tracking-wider text-cyan-300/60">
            {statusLabel[phase]}
          </span>
        </button>
        <button
          onClick={() => {
            setOpen(false);
            setMinimized(false);
          }}
          className="p-1.5 rounded-full bg-white/5 text-cyan-400/60 hover:text-cyan-200 hover:bg-white/10"
          title="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // 3. FULL HOLOGRAPHIC JARVIS HUD
  return (
    <div
      ref={widgetRef as React.Ref<HTMLDivElement>}
      style={floatingStyle}
      className={`fixed z-50 jarvis-hud-wrap bg-[#02070e]/95 backdrop-blur-2xl border border-[#00e5ff]/40 jarvis-glow-box rounded-3xl shadow-2xl shadow-cyan-950/80 overflow-hidden flex flex-col transition-[width,height] duration-300 jarvis-scanlines ${
        position
          ? ''
          : 'right-3 sm:right-6 bottom-[calc(5.1rem+env(safe-area-inset-bottom))] sm:bottom-6'
      } ${
        expanded
          ? 'w-[calc(100vw-1.5rem)] sm:w-[820px] h-[calc(100dvh-6.5rem)] sm:h-[780px]'
          : 'w-[calc(100vw-1.5rem)] sm:w-[540px] h-[min(680px,calc(100dvh-6.5rem))]'
      }`}
    >
      {/* Iron Man HUD 4-Corner Accents */}
      <div className="jarvis-corner jarvis-corner-tl" />
      <div className="jarvis-corner jarvis-corner-tr" />
      <div className="jarvis-corner jarvis-corner-bl" />
      <div className="jarvis-corner jarvis-corner-br" />

      {/* Top Header / Status Chrome */}
      <div
        onPointerDown={beginDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        className="px-5 py-3.5 bg-[#030d17]/80 border-b border-[#00e5ff]/20 flex items-center justify-between gap-3 cursor-grab active:cursor-grabbing touch-none select-none z-10"
      >
        <div className="flex items-center gap-3 min-w-0 pointer-events-none">
          <GripVertical className="w-4 h-4 text-cyan-500/40 flex-shrink-0" />
          <div className="min-w-0 font-mono">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-[0.32em] text-[#00e5ff] drop-shadow-[0_0_10px_#00e5ff]">
                J.A.R.V.I.S.
              </span>
              <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#00e5ff]/10 border border-[#00e5ff]/30 text-cyan-300 font-sans">
                WA COPILOT
              </span>
            </div>
            <p className="text-[9px] text-cyan-200/50 tracking-widest truncate mt-0.5">
              JUST A RATHER VERY INTELLIGENT SYSTEM
            </p>
          </div>
        </div>

        {/* HUD Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleAmbient}
            className={`p-2 rounded-xl transition ${
              ambientEnabled
                ? 'bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/40 shadow-[0_0_8px_#00e5ff]'
                : 'bg-white/5 text-cyan-400/50 hover:bg-white/10 hover:text-cyan-200'
            }`}
            title={ambientEnabled ? 'Disable Reactor Ambient Drone' : 'Enable Reactor Ambient Drone'}
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setVoiceEnabled((v) => !v)}
            className="p-2 rounded-xl bg-white/5 text-cyan-400/70 hover:bg-white/10 hover:text-cyan-200 transition"
            title={voiceEnabled ? 'Mute Speech' : 'Unmute Speech'}
          >
            {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setMinimized(true)}
            className="p-2 rounded-xl bg-white/5 text-cyan-400/70 hover:bg-white/10 hover:text-cyan-200 transition"
            title="Minimize"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="hidden sm:block p-2 rounded-xl bg-white/5 text-cyan-400/70 hover:bg-white/10 hover:text-cyan-200 transition"
            title={expanded ? 'Restore' : 'Expand'}
          >
            {expanded ? <Shrink className="w-3.5 h-3.5" /> : <Expand className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setOpen(false)}
            className="p-2 rounded-xl bg-white/5 text-cyan-400/70 hover:bg-white/10 hover:text-cyan-200 transition"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Holographic Arc Reactor Core Stage */}
      <div className="relative px-6 py-4 bg-gradient-to-b from-[#03111f]/90 via-[#010811]/90 to-[#020912]/90 border-b border-[#00e5ff]/15 flex items-center justify-between">
        {/* Left Telemetry Rail: Subsystems */}
        <div className="hidden sm:flex flex-col gap-1.5 font-mono text-[9px] text-cyan-200/60 uppercase tracking-widest">
          <span className="text-[8px] text-cyan-400/40 tracking-[0.25em] mb-0.5">SYSTEMS</span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] shadow-[0_0_6px_#00e5ff]" />
            <span>CRM CORE</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] shadow-[0_0_6px_#00e5ff]" />
            <span>WA MLS COMPS</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff] shadow-[0_0_6px_#00e5ff]" />
            <span>RCW 9.73 GUARD</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isLiveBridge ? 'bg-[#22c55e] shadow-[0_0_6px_#22c55e]' : 'bg-cyan-500/40'
              }`}
            />
            <span>{isLiveBridge ? 'BRIDGE 8787' : 'IN-APP AI'}</span>
          </div>
        </div>

        {/* Center: Live Arc Reactor with Pulse */}
        <div className="flex flex-col items-center justify-center flex-1">
          <JarvisArcReactor
            phase={phase}
            size={expanded ? 116 : 84}
            signalLevel={signalLevel}
            onClick={phase === 'speaking' || phase === 'thinking' ? interrupt : startListening}
          />
          <div className="mt-2 text-center font-mono">
            <div className="flex items-center justify-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  phase === 'listening'
                    ? 'bg-[#00f0ff] animate-ping'
                    : phase === 'thinking'
                    ? 'bg-[#d4af37] animate-pulse'
                    : phase === 'error'
                    ? 'bg-red-500'
                    : 'bg-[#00e5ff]'
                } shadow-[0_0_8px_currentColor]`}
              />
              <span className="text-[10px] font-semibold tracking-[0.22em] text-cyan-200">
                {statusLabel[phase]}
              </span>
            </div>
            {activeTools.length > 0 && (
              <div className="mt-1 text-[9px] uppercase tracking-widest text-[#00e5ff] animate-pulse flex items-center justify-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-[#00e5ff]" />
                ACCESSING: {activeTools.join(', ')}
              </div>
            )}
          </div>
        </div>

        {/* Right Telemetry Rail: Signal Meter */}
        <div className="flex flex-col items-end gap-1 font-mono text-[9px] text-cyan-200/60 uppercase tracking-widest">
          <span className="text-[8px] text-cyan-400/40 tracking-[0.25em]">SIGNAL</span>
          <div className="jarvis-signal-meter">
            <div
              className="jarvis-signal-fill"
              style={{ height: `${Math.round(signalLevel * 100)}%` }}
            />
          </div>
          <span className="text-[10px] text-cyan-300 font-mono">
            {Math.round(signalLevel * 100).toString().padStart(3, '0')}%
          </span>
        </div>
      </div>

      {/* Real Estate Copilot Quick Directives */}
      <div className="px-4 py-2 border-b border-[#00e5ff]/10 bg-black/40 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {[
          ['Morning Briefing', 'today'],
          ['Prioritize Leads Today', 'swarm'],
          ['Draft Top Lead Follow-up', 'swarm'],
          ['Review Active Comps', 'listings'],
          ['Compliance Audit RCW', 'compliance'],
        ].map(([label, target]) => (
          <button
            key={label}
            onClick={() => {
              if (label.includes('Comps')) onNavigate(target);
              unlockAudio();
              playSfx('tool');
              ask(label);
            }}
            className="flex-shrink-0 px-3 py-1 rounded-full bg-[#00e5ff]/5 border border-[#00e5ff]/25 text-[10px] font-mono tracking-wider text-cyan-300 hover:bg-[#00e5ff]/15 hover:border-[#00e5ff]/60 hover:text-white transition whitespace-nowrap cursor-pointer"
          >
            {label}
          </button>
        ))}
      </div>

      {/* Main Conversation Transcript */}
      <div ref={messagesRef} className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 font-mono">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[90%] p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                message.role === 'user'
                  ? 'bg-cyan-500/20 border border-cyan-400/40 text-cyan-100 rounded-br-none shadow-[0_0_12px_rgba(0,229,255,0.1)]'
                  : message.role === 'system'
                  ? 'bg-amber-500/10 border border-amber-500/30 text-amber-200'
                  : 'bg-[#05111d]/90 border border-[#00e5ff]/25 text-cyan-100/90 rounded-bl-none shadow-[0_0_15px_rgba(0,229,255,0.08)]'
              }`}
            >
              <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest opacity-60 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00e5ff]" />
                <span>{message.role === 'user' ? 'AGENT' : 'JARVIS'}</span>
              </div>
              {message.role === 'assistant' ? (
                <JarvisDecodeText text={message.text} />
              ) : (
                message.text
              )}
              {!!message.tools?.length && (
                <div className="mt-2 pt-2 border-t border-[#00e5ff]/15 text-[9px] uppercase tracking-widest text-[#00e5ff]">
                  SYSTEM ROUTE: {message.tools.join(' · ')}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input Console Bar */}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          ask(input);
        }}
        className="p-3 border-t border-[#00e5ff]/20 bg-[#020a13]/90 flex items-center gap-2 z-10"
      >
        <button
          type="button"
          onClick={phase === 'listening' ? () => recognitionRef.current?.stop?.() : startListening}
          className={`p-3 rounded-xl transition ${
            phase === 'listening'
              ? 'bg-[#00e5ff] text-[#02070e] animate-pulse shadow-[0_0_15px_#00e5ff]'
              : 'bg-white/5 text-cyan-300 hover:bg-white/10 hover:text-white border border-[#00e5ff]/20'
          }`}
          title={phase === 'listening' ? 'Stop Listening' : 'Voice Input (Say "Hey Jarvis")'}
        >
          {phase === 'listening' ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask J.A.R.V.I.S. to analyze leads, structure deals, or draft responses…"
          className="flex-1 min-w-0 bg-black/40 border border-[#00e5ff]/25 rounded-xl px-3.5 py-3 text-xs font-mono text-cyan-100 placeholder:text-cyan-500/40 focus:outline-none focus:border-[#00e5ff] focus:shadow-[0_0_10px_rgba(0,229,255,0.3)] transition"
        />

        {(phase === 'thinking' || phase === 'speaking') && (
          <button
            type="button"
            onClick={interrupt}
            className="p-3 rounded-xl bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30 transition cursor-pointer"
            title="Interrupt JARVIS"
          >
            <CircleStop className="w-4 h-4" />
          </button>
        )}

        <button
          type="submit"
          disabled={!input.trim()}
          className="p-3 rounded-xl bg-[#00e5ff] text-[#02070e] font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-cyan-300 hover:shadow-[0_0_12px_#00e5ff] transition cursor-pointer"
          title="Transmit directive"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Footer Status Line */}
      <div className="px-4 py-1.5 bg-[#01060c] border-t border-[#00e5ff]/10 flex items-center justify-between font-mono text-[9px] text-cyan-400/50">
        <span>VOICE: BRITISH MALE · RCW 9.73.030 ENFORCED</span>
        <label className="flex items-center gap-1.5 cursor-pointer text-cyan-300 hover:text-cyan-100">
          <input
            type="checkbox"
            checked={wakeEnabled}
            onChange={(e) => setWakeEnabled(e.target.checked)}
            className="accent-[#00e5ff]"
          />
          “Hey Jarvis” wake mode
        </label>
      </div>
    </div>
  );
}
