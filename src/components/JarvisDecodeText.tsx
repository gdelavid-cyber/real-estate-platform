'use client';

import React, { useEffect, useRef, useState } from 'react';

const GLYPHS = '/\\|<>[]{}=+*#%&$0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const GHOST = 16;
const FRAME_MS = 38;
const MIN_RATE = 120;
const MAX_LAG_MS = 400;

function scramble(s: string, seed: number) {
  let out = '';
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === ' ' || c === '\n' || c === '\t') {
      out += c;
      continue;
    }
    out += GLYPHS[(seed * 7919 + i * 104729 + c.charCodeAt(0)) % GLYPHS.length];
  }
  return out;
}

interface JarvisDecodeTextProps {
  text: string;
  className?: string;
}

export default function JarvisDecodeText({ text, className = '' }: JarvisDecodeTextProps) {
  const settled = useRef(0);
  const raf = useRef(0);
  const latest = useRef(text);
  const [tick, bump] = useState(0);

  useEffect(() => {
    latest.current = text;

    if (raf.current || settled.current >= text.length) return;

    let prev = performance.now();
    let painted = 0;

    const step = (now: number) => {
      const dt = Math.min(now - prev, 120) / 1000;
      prev = now;

      const target = latest.current.length;
      const rate = Math.max(MIN_RATE, (target - settled.current) / (MAX_LAG_MS / 1000));
      settled.current = Math.min(target, settled.current + rate * dt);

      if (now - painted >= FRAME_MS) {
        painted = now;
        bump((n) => n + 1);
      }

      if (settled.current < latest.current.length) {
        raf.current = requestAnimationFrame(step);
      } else {
        raf.current = 0;
        bump((n) => n + 1);
      }
    };
    raf.current = requestAnimationFrame(step);
  }, [text]);

  useEffect(
    () => () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = 0;
    },
    []
  );

  const n = Math.floor(settled.current);
  if (n >= text.length) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className}>
      {text.slice(0, n)}
      <span className="text-[#00e5ff] opacity-80 font-mono select-none">
        {scramble(text.slice(n, n + GHOST), tick)}
      </span>
      <span className="opacity-0 select-none">{text.slice(n + GHOST)}</span>
    </span>
  );
}
