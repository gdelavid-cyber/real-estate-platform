import { db } from '@/db';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await db.execute(sql`select 1`);
    return Response.json({
      ok: true,
      database: 'connected',
      integrations: {
        metaCapi: Boolean(process.env.META_PIXEL_ID && process.env.META_CAPI_ACCESS_TOKEN),
        twilioDialer: Boolean(
          process.env.TWILIO_ACCOUNT_SID &&
            process.env.TWILIO_AUTH_TOKEN &&
            process.env.TWILIO_PHONE_NUMBER &&
            process.env.NEXT_PUBLIC_APP_URL
        ),
        emailDelivery: Boolean(process.env.RESEND_API_KEY && process.env.VERIFIED_FROM_EMAIL),
        jarvisLeadAssistant: Boolean(process.env.NEXT_PUBLIC_JARVIS_BRIDGE_URL),
        openCode: Boolean(process.env.OPENCODE_SERVER_URL),
        licensedListingFeed: Boolean(
          process.env.RESO_WEB_API_URL && process.env.RESO_ACCESS_TOKEN
        ),
        premiumVoice: Boolean(
          process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_VOICE_ID
        ),
        stripeBilling: Boolean(
          process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET
        ),
      },
    });
  } catch {
    return Response.json(
      { ok: false, database: 'disconnected' },
      { status: 500 }
    );
  }
}
