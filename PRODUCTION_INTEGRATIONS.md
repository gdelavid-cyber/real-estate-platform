# Production Integration Checklist

The application now refuses to claim that an external action succeeded unless its provider confirms the request.

## Already real

- PostgreSQL persistence through Drizzle ORM
- Owner/agent authentication and HTTP-only sessions
- Listing and CRM data entry
- Commission ledger calculations from entered transactions
- Contract document storage and signature capture
- Private records
- Meta CAPI payload hashing and dispatch code
- Twilio outbound call dispatch and callback endpoints
- Resend delivery code
- OpenCode server bridge
- Optional ElevenLabs neural voice proxy

## Credentials and approvals required before external features are live

### Supabase

- `DATABASE_URL`

### Meta Conversions API

Create a Pixel/Dataset in Meta Events Manager and generate a Conversions API access token.

- `META_PIXEL_ID`
- `META_CAPI_ACCESS_TOKEN`
- `META_TEST_EVENT_CODE` (optional during testing)

The app SHA-256 hashes normalized email and phone values before transmission. Obtain appropriate consent and comply with Meta's Business Tools Terms and applicable privacy laws.

### Twilio outbound calling

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`
- `NEXT_PUBLIC_APP_URL`

Use only opted-in contacts. Configure calling hours, maintain internal Do-Not-Call suppression, identify the caller, and comply with TCPA/state rules. The app creates appointments only after a real caller presses 1 during the Twilio call.

### Resend email

- `RESEND_API_KEY`
- `VERIFIED_FROM_EMAIL`

Verify the sending domain in Resend. Only clients with email addresses in the selected CRM segment are sent messages. Add unsubscribe management before broad marketing campaigns.

### OpenCode

Run a secured OpenCode server:

```bash
OPENCODE_SERVER_PASSWORD='long-random-password' opencode serve --hostname 0.0.0.0 --port 4096
```

Expose it securely over HTTPS and set:

- `OPENCODE_SERVER_URL`
- `OPENCODE_SERVER_USERNAME` (defaults to `opencode`)
- `OPENCODE_SERVER_PASSWORD`

The assistant verifies `/global/health`, creates a real OpenCode session, and waits for the real response. It does not simulate task completion.

### Live MLS/listing data

Zillow does not offer a general public live-listing API. Redfin and HomeSpotter data should not be scraped without permission. Obtain an approved RESO Web API feed through NWMLS/your brokerage and a provider such as Bridge Interactive, Trestle, Spark, or MLS Grid.

- `RESO_WEB_API_URL`
- `RESO_ACCESS_TOKEN`

Until this is connected, the app displays no fabricated listings and sends users to the portal search pages instead.

### Premium voice (optional)

- `ELEVENLABS_API_KEY`
- `ELEVENLABS_VOICE_ID`
- `ELEVENLABS_MODEL_ID`

Without these, the assistant uses the best natural voice installed on the device.

## Before accepting real users

- Replace the temporary admin password.
- Add privacy policy, terms, consent language, and unsubscribe handling.
- Have Washington real-estate counsel review document templates and e-sign workflow.
- Add Stripe Checkout and webhook verification before charging subscriptions.
- Add error monitoring and encrypted backups.
- Test Meta with `META_TEST_EVENT_CODE` before production events.
- Test Twilio only with verified opted-in test numbers before launching a campaign.
