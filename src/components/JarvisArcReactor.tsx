'use client';

import React, { useEffect, useRef } from 'react';

export type ReactorPhase =
  | 'offline'
  | 'connecting'
  | 'ready'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'error';

interface JarvisArcReactorProps {
  phase: ReactorPhase;
  size?: number; // size in px (e.g. 48 for icon, 200 for HUD orb)
  signalLevel?: number; // 0.0 to 1.0 (audio/signal level)
  className?: string;
  onClick?: () => void;
}

export default function JarvisArcReactor({
  phase,
  size = 56,
  signalLevel = 0.2,
  className = '',
  onClick,
}: JarvisArcReactorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);
  const phaseAngleRef = useRef(0);
  const radarAngleRef = useRef(0);
  const meshAngleRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle HiDPI displays
    const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;

    let running = true;

    // Phase-specific configuration
    const getPhaseParams = () => {
      switch (phase) {
        case 'listening':
          return {
            spinSpeed: 1.6,
            radarSpeed: 3.2,
            primaryColor: '#00f0ff',
            hotColor: '#d6ffff',
            glowColor: 'rgba(0, 240, 255, 0.45)',
            pulseFreq: 4.5,
          };
        case 'thinking':
          return {
            spinSpeed: 3.2,
            radarSpeed: 5.5,
            primaryColor: '#00e5ff',
            hotColor: '#ffffff',
            glowColor: 'rgba(212, 175, 55, 0.5)',
            pulseFreq: 7.0,
          };
        case 'speaking':
          return {
            spinSpeed: 1.8,
            radarSpeed: 2.8,
            primaryColor: '#38bdf8',
            hotColor: '#e0f2fe',
            glowColor: 'rgba(56, 189, 248, 0.5)',
            pulseFreq: 5.0,
          };
        case 'connecting':
          return {
            spinSpeed: 1.2,
            radarSpeed: 2.0,
            primaryColor: '#f59e0b',
            hotColor: '#fef3c7',
            glowColor: 'rgba(245, 158, 11, 0.4)',
            pulseFreq: 3.0,
          };
        case 'error':
          return {
            spinSpeed: 0.6,
            radarSpeed: 1.0,
            primaryColor: '#ef4444',
            hotColor: '#fee2e2',
            glowColor: 'rgba(239, 68, 68, 0.4)',
            pulseFreq: 2.0,
          };
        case 'offline':
          return {
            spinSpeed: 0.05,
            radarSpeed: 0.2,
            primaryColor: '#64748b',
            hotColor: '#94a3b8',
            glowColor: 'rgba(100, 116, 139, 0.2)',
            pulseFreq: 0.5,
          };
        case 'ready':
        default:
          return {
            spinSpeed: 0.35,
            radarSpeed: 1.2,
            primaryColor: '#00e5ff',
            hotColor: '#c9fdff',
            glowColor: 'rgba(0, 229, 255, 0.35)',
            pulseFreq: 2.0,
          };
      }
    };

    const render = (time: number) => {
      if (!running) return;
      if (lastTimeRef.current === null) lastTimeRef.current = time;
      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = time;

      const params = getPhaseParams();
      const levelBoost = signalLevel * 0.5;

      phaseAngleRef.current += dt * (params.spinSpeed + levelBoost);
      radarAngleRef.current += dt * (params.radarSpeed + levelBoost);
      meshAngleRef.current -= dt * (params.spinSpeed * 0.7);

      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;
      const r = (Math.min(width, height) / 2) * 0.88;

      ctx.clearRect(0, 0, width, height);

      // Heartbeat pulse factor
      const pulse = 0.5 + 0.5 * Math.sin(time * 0.001 * params.pulseFreq);
      const pulseScale = 1 + pulse * 0.04 + signalLevel * 0.08;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(pulseScale, pulseScale);

      // 1. Ambient Glow Field
      const ambientGrad = ctx.createRadialGradient(0, 0, r * 0.1, 0, 0, r * 1.1);
      ambientGrad.addColorStop(0, params.glowColor);
      ambientGrad.addColorStop(0.5, 'rgba(0, 229, 255, 0.06)');
      ambientGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = ambientGrad;
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.15, 0, Math.PI * 2);
      ctx.fill();

      // 2. Rotating Radar Sweep Wedge
      ctx.save();
      ctx.rotate(radarAngleRef.current);
      const sweepGrad = ctx.createConicGradient(-Math.PI / 2, 0, 0);
      sweepGrad.addColorStop(0, 'rgba(0, 229, 255, 0)');
      sweepGrad.addColorStop(0.7, 'rgba(0, 229, 255, 0.01)');
      sweepGrad.addColorStop(0.92, 'rgba(0, 229, 255, 0.12)');
      sweepGrad.addColorStop(1, params.primaryColor);

      ctx.fillStyle = sweepGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, r * 0.95, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // 3. Outermost Segmented Coordinate Ring
      ctx.save();
      ctx.rotate(phaseAngleRef.current * 0.5);
      ctx.strokeStyle = params.primaryColor;
      ctx.lineWidth = Math.max(1, 1.5 * dpr);
      ctx.shadowColor = params.primaryColor;
      ctx.shadowBlur = 6 * dpr;

      // 4 primary notched arcs
      const segments = 4;
      const segArc = (Math.PI * 2) / segments;
      for (let i = 0; i < segments; i++) {
        const start = i * segArc + 0.15;
        const end = (i + 1) * segArc - 0.15;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.94, start, end);
        ctx.stroke();

        // Corner notch ticks
        const notchAngle = start - 0.05;
        const nx = Math.cos(notchAngle) * (r * 0.94);
        const ny = Math.sin(notchAngle) * (r * 0.94);
        ctx.fillStyle = params.hotColor;
        ctx.beginPath();
        ctx.arc(nx, ny, 1.8 * dpr, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 4. Counter-rotating inner dashed coordinate ring
      ctx.save();
      ctx.rotate(meshAngleRef.current);
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.45)';
      ctx.lineWidth = Math.max(0.8, 1 * dpr);
      ctx.setLineDash([4 * dpr, 6 * dpr]);
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.78, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // 5. Hairline circles
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.3)';
      ctx.lineWidth = 0.8 * dpr;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.62, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(0, 229, 255, 0.2)';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.46, 0, Math.PI * 2);
      ctx.stroke();

      // 6. Textured Core Disc / Polar Mesh
      ctx.save();
      ctx.rotate(phaseAngleRef.current);
      const spokes = 12;
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.22)';
      ctx.lineWidth = 0.75 * dpr;
      for (let i = 0; i < spokes; i++) {
        const angle = (i * Math.PI * 2) / spokes;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * (r * 0.25), Math.sin(angle) * (r * 0.25));
        ctx.lineTo(Math.cos(angle) * (r * 0.58), Math.sin(angle) * (r * 0.58));
        ctx.stroke();
      }
      ctx.restore();

      // 7. Core Heartbeat Disc
      const coreR = r * (0.28 + pulse * 0.05 + signalLevel * 0.06);
      const coreGrad = ctx.createRadialGradient(0, 0, coreR * 0.1, 0, 0, coreR);
      coreGrad.addColorStop(0, params.hotColor);
      coreGrad.addColorStop(0.45, params.primaryColor);
      coreGrad.addColorStop(1, 'rgba(0, 229, 255, 0.1)');

      ctx.fillStyle = coreGrad;
      ctx.shadowColor = params.primaryColor;
      ctx.shadowBlur = 12 * dpr;
      ctx.beginPath();
      ctx.arc(0, 0, coreR, 0, Math.PI * 2);
      ctx.fill();

      // Core brightest filament center
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, coreR * 0.35, 0, Math.PI * 2);
      ctx.fill();

      // 8. Outer Shimmer Dust Motifs (6 orbiting particles)
      const motes = 6;
      for (let i = 0; i < motes; i++) {
        const mAngle = phaseAngleRef.current * 0.8 + (i * Math.PI * 2) / motes;
        const mDist = r * (0.98 + 0.05 * Math.sin(time * 0.003 + i));
        const mx = Math.cos(mAngle) * mDist;
        const my = Math.sin(mAngle) * mDist;

        ctx.fillStyle = params.hotColor;
        ctx.shadowColor = params.hotColor;
        ctx.shadowBlur = 4 * dpr;
        ctx.beginPath();
        ctx.arc(mx, my, (0.8 + 0.5 * Math.sin(time * 0.005 + i)) * dpr, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);

    return () => {
      running = false;
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [phase, size, signalLevel]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
      className={`select-none pointer-events-auto ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    />
  );
}
