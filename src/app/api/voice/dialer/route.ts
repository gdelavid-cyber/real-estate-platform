import { NextResponse } from 'next/server';

const xml = (body: string) =>
  new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><Response>${body}</Response>`, {
    headers: { 'Content-Type': 'text/xml; charset=utf-8' },
  });

export async function POST(request: Request) {
  const url = new URL(request.url);
  const leadId = url.searchParams.get('leadId') || '';
  const action = `/api/voice/dialer/book?leadId=${encodeURIComponent(leadId)}`;

  return xml(
    `<Say voice="Polly.Joanna-Neural">Hello. This is Melissa Hatfield's real estate office at John L. Scott Real Estate. You previously requested real estate information. Press 1 to request a showing or consultation with Melissa. Press 9 to opt out of future calls.</Say>` +
      `<Gather input="dtmf" numDigits="1" timeout="8" action="${action}" method="POST" />` +
      `<Say voice="Polly.Joanna-Neural">We did not receive a selection. You may call Melissa directly at 253 514 7676. Goodbye.</Say>`
  );
}
