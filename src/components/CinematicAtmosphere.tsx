'use client';

import React, { useEffect, useRef, useState } from 'react';

const VIDEO_SRC =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260520_133010_cb9c806d-bc9d-47f1-ac4c-b1759134ec8b.mp4';

/**
 * Fixed cinematic video backdrop.
 *
 * The film plays muted and looped behind the entire interface, tinted toward
 * the near-black canvas so glass panels and Inter typography stay legible.
 * If the video cannot autoplay (or is blocked) a gradient scene takes over.
 */
export default function CinematicAtmosphere() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const play = async () => {
      try {
        await video.play();
        if (reduced) video.pause();
      } catch {
        // Autoplay refused — the gradient scene is shown instead.
        setFailed(true);
      }
    };
    play();

    // Pause while the tab is hidden to save battery on phones.
    const onVisibility = () => {
      if (document.hidden) {
        video.pause();
      } else if (!reduced) {
        video.play().catch(() => setFailed(true));
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="cinematic-atmosphere fixed inset-0 z-0 overflow-hidden pointer-events-none"
    >
      {!failed && (
        <video
          ref={videoRef}
          className="atmos-video"
          src={VIDEO_SRC}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onError={() => setFailed(true)}
        />
      )}

      {failed && <div className="atmos-fallback" />}

      <div className="atmos-tint" />
      <div className="atmos-vignette" />
      <div className="cinematic-grain" />
    </div>
  );
}
