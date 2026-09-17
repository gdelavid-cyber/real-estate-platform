import { NextResponse } from 'next/server';

/**
 * Optional premium voice proxy.
 * Set ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID in production to enable
 * natural neural speech without exposing credentials to the browser.
 * Without those variables, the client falls back to the device voice engine.
 */
export async function POST(request: Request) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;
  const modelId = process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2';

  if (!apiKey || !voiceId) {
    return NextResponse.json(
      { available: false, error: 'Premium voice is not configured.' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const text = String(body.text || '').trim();

    if (!text) {
      return NextResponse.json({ error: 'Text is required.' }, { status: 400 });
    }

    // Keep accidental long reads from creating an unexpectedly expensive call.
    const safeText = text.slice(0, 7000);
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text: safeText,
          model_id: modelId,
          voice_settings: {
            stability: 0.48,
            similarity_boost: 0.78,
            style: 0.18,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { available: false, error: 'Premium voice provider returned an error.' },
        { status: 502 }
      );
    }

    return new NextResponse(await response.arrayBuffer(), {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Voice proxy error:', error);
    return NextResponse.json(
      { available: false, error: 'Premium voice request failed.' },
      { status: 502 }
    );
  }
}
