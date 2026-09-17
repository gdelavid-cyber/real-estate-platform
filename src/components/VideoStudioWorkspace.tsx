'use client';

import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Smartphone,
  Monitor,
  Sparkles,
  Plus,
  Wand2,
  Volume2,
  CheckCircle2,
  Camera,
  RefreshCw,
  Clapperboard,
  Palette,
  Zap,
} from 'lucide-react';
import { GalleryPhoto, VideoClipConfig } from '@/db/schema';

interface PropertyItem {
  id: number;
  title: string;
  address: string;
  cityState: string;
  price: string;
  beds: number;
  baths: string;
  sqft: number;
  heroPhotoUrl: string;
  galleryPhotos: GalleryPhoto[];
}

interface VideoStudioWorkspaceProps {
  properties: PropertyItem[];
  onSaveProject: (projectData: {
    propertyId: number;
    projectName: string;
    aspectRatio: '16:9' | '9:16';
    cinemaStyle: string;
    musicTrack: string;
    voiceoverStyle: string;
    aiScript: string;
    clips: VideoClipConfig[];
  }) => Promise<void>;
}

const CINEMA_STYLES: {
  id: string;
  name: string;
  tagline: string;
  grade: string;
  captionAccent: string;
  musicTrack: string;
  voiceoverStyle: string;
  pace: number;
  swatch: string;
}[] = [
  {
    id: 'twilight-gold',
    name: 'Twilight Cinematic Gold',
    tagline: 'Amber hour drama · high-end blockbuster',
    grade:
      'bg-gradient-to-tr from-[#1c1206]/45 via-[#D4AF37]/10 to-[#2b1a05]/30 mix-blend-overlay',
    captionAccent: 'text-[#F3E5AB]',
    musicTrack: 'Orchestral Luxury Strings',
    voiceoverStyle: 'Cinema Trailer Deep',
    pace: 4.5,
    swatch: 'from-amber-600 to-[#D4AF37]',
  },
  {
    id: 'ad-editorial',
    name: 'Architectural Digest Editorial',
    tagline: 'Soft daylight · gallery restraint',
    grade: 'bg-gradient-to-tr from-[#2a2113]/25 via-white/5 to-[#D4AF37]/10 mix-blend-overlay',
    captionAccent: 'text-white',
    musicTrack: 'Minimalist Acoustic Horizon',
    voiceoverStyle: 'Architectural Digest Narrator',
    pace: 5,
    swatch: 'from-stone-300 to-amber-200',
  },
  {
    id: 'modern-minimal',
    name: 'Modern Minimal Gallery',
    tagline: 'Clean whites · spa-like calm',
    grade: 'bg-white/10 mix-blend-soft-light',
    captionAccent: 'text-white',
    musicTrack: 'Modern Architectural Chill',
    voiceoverStyle: 'Warm Lifestyle Curator',
    pace: 4,
    swatch: 'from-slate-100 to-slate-300',
  },
  {
    id: 'urban-pulse',
    name: 'Urban Penthouse Pulse',
    tagline: 'Neon night · skyline energy',
    grade:
      'bg-gradient-to-br from-[#06283d]/40 via-transparent to-[#D4AF37]/15 mix-blend-overlay',
    captionAccent: 'text-sky-200',
    musicTrack: 'Dramatic Penthouse Pulse',
    voiceoverStyle: 'Energetic Luxury Broker',
    pace: 3,
    swatch: 'from-sky-600 to-fuchsia-500',
  },
  {
    id: 'tropical-luxe',
    name: 'Tropical Resort Lifestyle',
    tagline: 'Ocean teal · golden leisure',
    grade:
      'bg-gradient-to-tr from-[#04303a]/40 via-transparent to-[#f0b45a]/20 mix-blend-overlay',
    captionAccent: 'text-amber-100',
    musicTrack: 'Modern Architectural Chill',
    voiceoverStyle: 'Warm Lifestyle Curator',
    pace: 4.5,
    swatch: 'from-teal-400 to-amber-300',
  },
];

const CAMERA_MOTIONS: {
  value: VideoClipConfig['cameraMotion'];
  label: string;
  desc: string;
}[] = [
  { value: 'ken_burns_zoom_in', label: 'Ken Burns Push-In', desc: 'Slow push toward focal point' },
  { value: 'drone_pan_right', label: 'Drone Glide Right', desc: 'Lateral tracking sweep' },
  { value: 'cinematic_dolly_up', label: 'Vertical Crane Elevate', desc: 'Reveals ceiling height' },
  { value: 'orbital_reveal', label: '3D Orbital Parallax', desc: 'Rotational depth reveal' },
];

function pickMotion(roomType: string, idx: number): VideoClipConfig['cameraMotion'] {
  const t = roomType.toLowerCase();
  if (
    t.includes('exterior') ||
    t.includes('facade') ||
    t.includes('dock') ||
    t.includes('pool') ||
    t.includes('courtyard') ||
    t.includes('terrace')
  )
    return 'drone_pan_right';
  if (t.includes('kitchen') || t.includes('bath')) return 'cinematic_dolly_up';
  if (t.includes('suite') || t.includes('bedroom') || t.includes('salon') || t.includes('loft'))
    return 'orbital_reveal';
  const cycle: VideoClipConfig['cameraMotion'][] = [
    'ken_burns_zoom_in',
    'drone_pan_right',
    'cinematic_dolly_up',
    'orbital_reveal',
  ];
  return cycle[idx % cycle.length];
}

function buildScript(prop: PropertyItem, styleName: string): string {
  const highlights = (prop as unknown as { propertyHighlights?: string[] }).propertyHighlights;
  const top = Array.isArray(highlights) ? highlights.slice(0, 3).join('. ') : '';
  return `${styleName.split(' ')[0]} opening: "Welcome to ${prop.title}." \n\nSet at ${prop.address}, ${prop.cityState}, this ${prop.beds}-bedroom, ${prop.baths}-bath, ${prop.sqft.toLocaleString()} sq ft residence is offered at ${prop.price}. ${top ? top + '. ' : ''}Every frame moves from architectural scale to human detail — light, material, horizon — closing on twilight and a single line: "By introduction only. Private showings this week."`;
}

export default function VideoStudioWorkspace({
  properties,
  onSaveProject,
}: VideoStudioWorkspaceProps) {
  const [selectedPropId, setSelectedPropId] = useState<number>(
    properties[0]?.id || 1
  );
  const currentProperty =
    properties.find((p) => p.id === selectedPropId) || properties[0];

  const [styleId, setStyleId] = useState('twilight-gold');
  const style = CINEMA_STYLES.find((s) => s.id === styleId)!;

  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [clips, setClips] = useState<VideoClipConfig[]>([]);
  const [activeClipIndex, setActiveClipIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [musicTrack, setMusicTrack] = useState(style.musicTrack);
  const [voiceoverStyle, setVoiceoverStyle] = useState(style.voiceoverStyle);
  const [aiScript, setAiScript] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [renderSuccess, setRenderSuccess] = useState(false);
  const [autoCutLog, setAutoCutLog] = useState<string[]>([]);

  const buildClipsForProperty = (
    prop: PropertyItem | undefined,
    pace: number
  ): VideoClipConfig[] => {
    if (!prop?.galleryPhotos) return [];
    return prop.galleryPhotos.map((photo, idx) => ({
      id: `clip-${idx + 1}`,
      photoUrl: photo.url,
      roomName: photo.roomType,
      durationSec: pace,
      cameraMotion: pickMotion(photo.roomType, idx),
      highlightCaption: photo.caption,
    }));
  };

  // Load property
  useEffect(() => {
    if (currentProperty) {
      setClips(buildClipsForProperty(currentProperty, style.pace));
      setActiveClipIndex(0);
      setAiScript(buildScript(currentProperty, style.name));
      setRenderSuccess(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPropId, properties]);

  // Apply style changes autonomously
  useEffect(() => {
    setMusicTrack(style.musicTrack);
    setVoiceoverStyle(style.voiceoverStyle);
    setClips((prev) =>
      prev.map((c, idx) => ({
        ...c,
        durationSec: style.pace,
        cameraMotion: pickMotion(c.roomName, idx),
      }))
    );
    if (currentProperty) setAiScript(buildScript(currentProperty, style.name));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [styleId]);

  // Auto-advance scenes
  useEffect(() => {
    if (!isPlaying || clips.length === 0) return;
    const currentClip = clips[activeClipIndex] || clips[0];
    const timer = setTimeout(() => {
      setActiveClipIndex((prev) => (prev + 1) % clips.length);
    }, (currentClip?.durationSec || 4) * 1000);
    return () => clearTimeout(timer);
  }, [isPlaying, activeClipIndex, clips]);

  const activeClip = clips[activeClipIndex] || clips[0];

  const handleAutoCut = () => {
    if (!currentProperty) return;
    const newClips = buildClipsForProperty(currentProperty, style.pace);
    setClips(newClips);
    setActiveClipIndex(0);
    setIsPlaying(true);
    setAiScript(buildScript(currentProperty, style.name));
    setAutoCutLog([
      `AI Director selected "${style.name}" grade + pacing (${style.pace}s scenes)`,
      `Analyzed ${newClips.length} photos — room type detected, camera vectors assigned`,
      `Score locked: ${style.musicTrack} · Voice: ${style.voiceoverStyle}`,
      'Lower-thirds & cinematic lower-third captions composed for every scene',
      `Deliverables queued: 16:9 hero film + three 9:16 social cutdowns`,
    ]);
    setRenderSuccess(false);
  };

  const handleUpdateClipMotion = (
    idx: number,
    motion: VideoClipConfig['cameraMotion']
  ) => {
    setClips((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, cameraMotion: motion } : c))
    );
  };

  const handleAddCustomPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoUrl.trim()) return;
    const newClip: VideoClipConfig = {
      id: `clip-custom-${Date.now()}`,
      photoUrl: newPhotoUrl.trim(),
      roomName: newRoomName.trim() || 'Architectural Feature Space',
      durationSec: style.pace,
      cameraMotion: 'ken_burns_zoom_in',
      highlightCaption: `${newRoomName || 'Custom Feature'} // Luxury finish`,
    };
    setClips((prev) => [...prev, newClip]);
    setActiveClipIndex(clips.length);
    setNewPhotoUrl('');
    setNewRoomName('');
  };

  const handleRenderVideo = async () => {
    if (!currentProperty) return;
    setIsRendering(true);
    setRenderSuccess(false);
    setRenderProgress(10);
    const interval = setInterval(() => {
      setRenderProgress((prev) => (prev >= 92 ? 92 : prev + 16));
    }, 320);

    await onSaveProject({
      propertyId: currentProperty.id,
      projectName: `${currentProperty.title} — ${style.name} (${aspectRatio})`,
      aspectRatio,
      cinemaStyle: styleId,
      musicTrack,
      voiceoverStyle,
      aiScript,
      clips,
    });

    clearInterval(interval);
    setRenderProgress(100);
    setIsRendering(false);
    setRenderSuccess(true);
  };

  return (
    <div className="space-y-6">
      {/* Control bar */}
      <div className="p-5 rounded-2xl bg-[#121721] border border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-[11px] font-mono-code uppercase tracking-wider text-[#D4AF37] mb-1">
              Listing
            </label>
            <select
              value={selectedPropId}
              onChange={(e) => setSelectedPropId(Number(e.target.value))}
              className="bg-[#0A0D12] border border-white/15 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
            >
              {properties.map((prop) => (
                <option key={prop.id} value={prop.id}>
                  {prop.title} ({prop.price})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-mono-code uppercase tracking-wider text-slate-400 mb-1">
              Format
            </label>
            <div className="flex items-center bg-[#0A0D12] p-1 rounded-lg border border-white/10">
              <button
                onClick={() => setAspectRatio('16:9')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                  aspectRatio === '16:9'
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#0A0D12]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" /> 16:9
              </button>
              <button
                onClick={() => setAspectRatio('9:16')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                  aspectRatio === '9:16'
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#0A0D12]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" /> 9:16
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {renderSuccess && (
            <span className="text-xs font-mono-code text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4" />
              Cinema project saved
            </span>
          )}
          <button
            onClick={handleRenderVideo}
            disabled={isRendering || clips.length === 0}
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#0A0D12] font-bold text-sm flex items-center gap-2 shadow-lg shadow-[#D4AF37]/20 cursor-pointer disabled:opacity-60"
          >
            {isRendering ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Saving project ({renderProgress}%)
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                Save Cinema Project
              </>
            )}
          </button>
        </div>
      </div>

      {/* Professional style picker */}
      <div className="p-5 rounded-2xl bg-[#121721] border border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-4 h-4 text-[#D4AF37]" />
          <h4 className="text-sm font-semibold text-white">
            Professional cinematic styles
          </h4>
          <span className="text-[11px] text-slate-500">
            — each re-grades, re-scores, re-voices and re-cuts the whole film
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {CINEMA_STYLES.map((s) => (
            <button
              key={s.id}
              onClick={() => setStyleId(s.id)}
              className={`text-left p-3.5 rounded-xl border transition cursor-pointer ${
                styleId === s.id
                  ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                  : 'border-white/10 bg-[#0A0D12] hover:border-white/25'
              }`}
            >
              <div
                className={`w-full h-10 rounded-lg bg-gradient-to-br ${s.swatch} mb-2.5 shadow-inner`}
              />
              <p className="text-xs font-bold text-white leading-tight">
                {s.name}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">{s.tagline}</p>
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={handleAutoCut}
            className="px-5 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-[#0A0D12] font-bold text-xs flex items-center gap-2 cursor-pointer"
          >
            <Clapperboard className="w-4 h-4" />
            Autonomous AI Director — Auto-Cut This Listing
          </button>
          <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#D4AF37]" />
            One click: scene detection, camera blocking, score, narration, captions
          </span>
        </div>

        {autoCutLog.length > 0 && (
          <div className="mt-4 rounded-xl bg-[#0A0D12] border border-emerald-500/30 p-4 space-y-1.5">
            {autoCutLog.map((line, i) => (
              <p
                key={i}
                className="text-[11px] font-mono-code text-emerald-300 flex items-start gap-2"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                {line}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Viewport */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center bg-[#0D1118] border border-white/10 rounded-2xl p-6 min-h-[520px]">
          <div
            className={`relative overflow-hidden rounded-xl border border-[#D4AF37]/40 shadow-2xl bg-black transition-all duration-500 ${
              aspectRatio === '16:9'
                ? 'w-full aspect-video max-w-2xl'
                : 'w-[310px] aspect-[9/16] max-h-[520px]'
            }`}
          >
            {activeClip && (
              <>
                <img
                  key={`${activeClip.id}-${activeClip.cameraMotion}-${styleId}`}
                  src={activeClip.photoUrl}
                  alt={activeClip.roomName}
                  className={`w-full h-full object-cover motion-${activeClip.cameraMotion}`}
                />
                {/* Professional color grade */}
                <div className={`absolute inset-0 pointer-events-none ${style.grade}`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/40 pointer-events-none" />

                <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                  <div className="flex items-center gap-2 bg-black/65 backdrop-blur-md px-3 py-1 rounded-full border border-white/15">
                    <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-ping" />
                    <span className="font-mono-code text-[11px] uppercase tracking-widest text-white">
                      {currentProperty?.title.split('//')[0]}
                    </span>
                  </div>
                  <span className="font-mono-code text-[11px] px-2.5 py-1 rounded bg-[#D4AF37]/90 text-[#0A0D12] font-bold">
                    {style.name.split(' ')[0].toUpperCase()} · {aspectRatio}
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 space-y-1.5 pointer-events-none">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#D4AF37] text-[#0A0D12] font-mono-code text-[10px] font-bold uppercase">
                      Scene {activeClipIndex + 1}/{clips.length}
                    </span>
                    <span
                      className={`font-mono-code text-xs ${style.captionAccent}`}
                    >
                      {activeClip.cameraMotion.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <h3 className="font-display text-xl md:text-2xl font-bold text-white drop-shadow">
                    {activeClip.roomName}
                  </h3>
                  <p className="text-xs text-slate-200 line-clamp-2 drop-shadow">
                    {activeClip.highlightCaption}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Scrubber */}
          <div className="w-full max-w-2xl mt-5 flex items-center justify-between gap-4 bg-[#121721] px-4 py-3 rounded-xl border border-white/10">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 rounded-lg bg-[#D4AF37] text-[#0A0D12] flex items-center justify-center hover:opacity-90 cursor-pointer"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 fill-current" />
              )}
            </button>
            <div className="flex-1 flex items-center gap-2 overflow-x-auto py-1">
              {clips.map((clip, idx) => (
                <button
                  key={clip.id}
                  onClick={() => {
                    setActiveClipIndex(idx);
                    setIsPlaying(false);
                  }}
                  className={`relative flex-shrink-0 w-16 h-10 rounded-md overflow-hidden border-2 transition cursor-pointer ${
                    idx === activeClipIndex
                      ? 'border-[#D4AF37] scale-105'
                      : 'border-white/15 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={clip.photoUrl}
                    alt={clip.roomName}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-0.5 right-1 text-[9px] font-mono-code bg-black/80 px-1 rounded text-white">
                    {idx + 1}
                  </span>
                </button>
              ))}
            </div>
            <span className="text-right font-mono-code text-xs text-slate-400 whitespace-nowrap">
              {clips.reduce((sum, c) => sum + c.durationSec, 0)}s
            </span>
          </div>
        </div>

        {/* Inspector */}
        <div className="lg:col-span-5 space-y-5">
          {activeClip && (
            <div className="p-5 rounded-xl bg-[#121721] border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-[#D4AF37]" />
                  <h4 className="font-semibold text-sm text-white">
                    Scene #{activeClipIndex + 1} camera vector
                  </h4>
                </div>
                <span className="font-mono-code text-xs text-[#D4AF37] truncate max-w-[180px]">
                  {activeClip.roomName}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {CAMERA_MOTIONS.map((motion) => (
                  <button
                    key={motion.value}
                    onClick={() =>
                      handleUpdateClipMotion(activeClipIndex, motion.value)
                    }
                    className={`p-3 rounded-lg border text-left transition cursor-pointer ${
                      activeClip.cameraMotion === motion.value
                        ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-white'
                        : 'bg-[#0A0D12] border-white/10 text-slate-300 hover:border-white/25'
                    }`}
                  >
                    <div className="font-semibold text-xs text-[#D4AF37]">
                      {motion.label}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {motion.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <form
            onSubmit={handleAddCustomPhoto}
            className="p-5 rounded-xl bg-[#121721] border border-white/10 space-y-3"
          >
            <div className="flex items-center gap-2 text-xs font-mono-code text-emerald-400">
              <Plus className="w-4 h-4" />
              <span>ADD A PHOTO TO THE TIMELINE</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input
                type="text"
                placeholder="Room title (e.g. Wine Vault)"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                className="bg-[#0A0D12] border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              />
              <input
                type="url"
                placeholder="Image URL (https://...)"
                value={newPhotoUrl}
                onChange={(e) => setNewPhotoUrl(e.target.value)}
                className="bg-[#0A0D12] border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold cursor-pointer"
            >
              + Append photo clip
            </button>
          </form>

          <div className="p-5 rounded-xl bg-[#121721] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono-code text-[#D4AF37]">
                <Volume2 className="w-4 h-4" />
                <span>AI NARRATION & SCORE</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-mono-code">
                Auto-synced to style
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Narrator voice
                </label>
                <select
                  value={voiceoverStyle}
                  onChange={(e) => setVoiceoverStyle(e.target.value)}
                  className="w-full bg-[#0A0D12] border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white"
                >
                  <option>Architectural Digest Narrator</option>
                  <option>Energetic Luxury Broker</option>
                  <option>Warm Lifestyle Curator</option>
                  <option>Cinema Trailer Deep</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Score
                </label>
                <select
                  value={musicTrack}
                  onChange={(e) => setMusicTrack(e.target.value)}
                  className="w-full bg-[#0A0D12] border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white"
                >
                  <option>Orchestral Luxury Strings</option>
                  <option>Modern Architectural Chill</option>
                  <option>Dramatic Penthouse Pulse</option>
                  <option>Minimalist Acoustic Horizon</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                AI-generated narration script
              </label>
              <textarea
                rows={4}
                value={aiScript}
                onChange={(e) => setAiScript(e.target.value)}
                className="w-full bg-[#0A0D12] border border-white/15 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
