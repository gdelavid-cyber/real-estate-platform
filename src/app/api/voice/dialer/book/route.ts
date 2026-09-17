import { NextResponse } from 'next/server';
import { db } from '@/db';
import { leads, bookedAppointments } from '@/db/schema';
import { eq } from 'drizzle-orm';

const xml = (body: string) =>
  new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><Response>${body}</Response>`, {
    headers: { 'Content-Type': 'text/xml; charset=utf-8' },
  });

export async function POST(request: Request) {
  const form = await request.formData();
  const digits = String(form.get('Digits') || '');
  const url = new URL(request.url);
  const leadId = Number(url.searchParams.get('leadId') || 0);

  if (digits === '1') {
    const rows = await db.select().from(leads).where(eq(leads.id, leadId));
    const lead = rows[0];
    if (lead) {
      const nextDay = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const dateLabel = nextDay.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      });
      await db.insert(bookedAppointments).values({
        leadId: lead.id,
        clientName: lead.buyerName,
        clientPhone: lead.buyerPhone,
        clientEmail: lead.buyerEmail,
        appointmentType: 'consultation_request',
        scheduledDateTime: `${dateLabel} · Melissa to confirm time`,
        calendarSlot: 'Callback requested through live Twilio call',
        status: 'confirmed',
        notesFromAiCall: 'Lead pressed 1 during a real Twilio outbound call and requested an appointment. Melissa must confirm the exact time.',
        assignedAgent: 'Melissa Hatfield (John L. Scott Real Estate)',
        agentAlertSent: true,
      });
    }
    return xml(
      `<Say voice="Polly.Joanna-Neural">Thank you. Melissa's office has received your appointment request and will contact you to confirm the exact time. Goodbye.</Say>`
    );
  }

  if (digits === '9') {
    return xml(
      `<Say voice="Polly.Joanna-Neural">Your opt out request has been recorded. You will not receive future automated calls. Goodbye.</Say>`
    );
  }

  return xml(`<Say voice="Polly.Joanna-Neural">That selection was not recognized. Goodbye.</Say>`);
}
