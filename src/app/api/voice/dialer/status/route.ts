import { NextResponse } from 'next/server';
import { db } from '@/db';
import { aiDialerCampaigns } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  const form = await request.formData();
  const callStatus = String(form.get('CallStatus') || 'unknown');
  const url = new URL(request.url);
  const campaignId = Number(url.searchParams.get('campaignId') || 0);

  if (campaignId && callStatus === 'answered') {
    const rows = await db
      .select()
      .from(aiDialerCampaigns)
      .where(eq(aiDialerCampaigns.id, campaignId));
    if (rows[0]) {
      await db
        .update(aiDialerCampaigns)
        .set({ answeredCount: rows[0].answeredCount + 1 })
        .where(eq(aiDialerCampaigns.id, campaignId));
    }
  }

  return NextResponse.json({ received: true });
}
