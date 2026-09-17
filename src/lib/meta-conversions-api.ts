import crypto from 'crypto';

export interface MetaCapiEventPayload {
  eventName: 'Lead' | 'QualifiedLead' | 'HighQualityLead' | 'Schedule';
  email: string;
  phone: string;
  name?: string;
  value?: number;
  currency?: string;
  sourceUrl?: string;
  qualityRating: 'high_quality' | 'verified_cash' | 'unqualified' | 'spam';
  qualityScore: number;
  agentFeedback?: string;
}

export interface MetaCapiResponse {
  success: true;
  status: 'sent_to_meta';
  eventId: string;
  pixelId: string;
  eventsReceived: number;
  fbTraceId?: string;
  message: string;
  payloadSent: unknown;
}

const sha256 = (value: string) =>
  crypto.createHash('sha256').update(value).digest('hex');

const normalizeEmail = (email: string) => email.trim().toLowerCase();
const normalizePhone = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  return digits.startsWith('1') ? digits : `1${digits}`;
};

/** Sends a real server-side event. It never returns a fake success. */
export async function sendLeadToMetaPixelCapi(
  input: MetaCapiEventPayload
): Promise<MetaCapiResponse> {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  const testEventCode = process.env.META_TEST_EVENT_CODE;

  if (!pixelId || !accessToken) {
    throw new Error(
      'Meta CAPI is not configured. Add META_PIXEL_ID and META_CAPI_ACCESS_TOKEN in Vercel.'
    );
  }
  if (!input.email && !input.phone) {
    throw new Error('Meta CAPI requires an email or phone for event matching.');
  }

  const eventId = crypto.randomUUID();
  const parts = (input.name || '').trim().split(/\s+/);
  const firstName = parts[0] || '';
  const lastName = parts.slice(1).join(' ');

  const userData: Record<string, string[]> = {};
  if (input.email) userData.em = [sha256(normalizeEmail(input.email))];
  if (input.phone) userData.ph = [sha256(normalizePhone(input.phone))];
  if (firstName) userData.fn = [sha256(firstName.toLowerCase())];
  if (lastName) userData.ln = [sha256(lastName.toLowerCase())];

  const payload = {
    data: [
      {
        event_name: input.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: 'website',
        event_source_url: input.sourceUrl || process.env.NEXT_PUBLIC_APP_URL,
        user_data: userData,
        custom_data: {
          currency: input.currency || 'USD',
          value: input.value || 0,
          lead_quality: input.qualityRating,
          quality_score: input.qualityScore,
          brokerage: 'John L. Scott Real Estate',
          agent_assigned: 'Melissa Hatfield',
          agent_feedback: input.agentFeedback || '',
        },
      },
    ],
    ...(testEventCode ? { test_event_code: testEventCode } : {}),
  };

  const response = await fetch(
    `https://graph.facebook.com/v24.0/${encodeURIComponent(pixelId)}/events`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    }
  );
  const result = await response.json();

  if (!response.ok || result.error) {
    throw new Error(
      result.error?.message || `Meta CAPI rejected the event (${response.status}).`
    );
  }

  return {
    success: true,
    status: 'sent_to_meta',
    eventId,
    pixelId,
    eventsReceived: Number(result.events_received || 0),
    fbTraceId: result.fbtrace_id,
    message: `Meta accepted ${result.events_received || 0} event(s).`,
    payloadSent: payload,
  };
}
