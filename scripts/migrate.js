const { Pool } = require("pg");

const rawUrl = process.env.DATABASE_URL || "postgresql://postgres.bygahwgkcitvwceviocl:Import671_gdd@aws-0-us-east-2.pooler.supabase.com:6543/postgres";
const cleanUrl = rawUrl.replace(/([?&])sslmode=[^&]+(&|$)/, "$1").replace(/[?&]$/, "");

const pool = new Pool({
  connectionString: cleanUrl,
  ssl: { rejectUnauthorized: false },
});

const DDL = `
CREATE TABLE IF NOT EXISTS properties (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  address TEXT NOT NULL,
  city_state TEXT NOT NULL,
  price TEXT NOT NULL,
  beds INTEGER NOT NULL,
  baths TEXT NOT NULL,
  sqft INTEGER NOT NULL,
  hero_photo_url TEXT NOT NULL,
  gallery_photos JSONB NOT NULL,
  seller_name TEXT NOT NULL,
  seller_phone TEXT NOT NULL,
  seller_email TEXT NOT NULL,
  seller_motivation TEXT NOT NULL,
  seller_bottom_line TEXT NOT NULL,
  property_highlights JSONB NOT NULL,
  agent_assigned TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_phone TEXT NOT NULL,
  buyer_budget TEXT NOT NULL,
  buyer_source TEXT NOT NULL,
  matched_property_id INTEGER NOT NULL,
  stage TEXT NOT NULL,
  ai_agent_node TEXT NOT NULL,
  intent_score INTEGER NOT NULL,
  outreach_history JSONB NOT NULL,
  buyer_notes TEXT NOT NULL,
  last_contacted_at TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS call_transfers (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER NOT NULL,
  property_id INTEGER NOT NULL,
  buyer_name TEXT NOT NULL,
  buyer_phone TEXT NOT NULL,
  buyer_pre_approval_amount TEXT NOT NULL,
  buyer_target_move_in TEXT NOT NULL,
  seller_name TEXT NOT NULL,
  seller_phone TEXT NOT NULL,
  seller_email TEXT NOT NULL,
  seller_bottom_line_price TEXT NOT NULL,
  seller_motivation_notes TEXT NOT NULL,
  assigned_agent_name TEXT NOT NULL,
  assigned_agent_phone TEXT NOT NULL,
  transfer_status TEXT NOT NULL,
  ai_summary TEXT NOT NULL,
  transcript_snippet TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS video_projects (
  id SERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL,
  project_name TEXT NOT NULL,
  aspect_ratio TEXT NOT NULL,
  cinema_style TEXT,
  music_track TEXT NOT NULL,
  voiceover_style TEXT NOT NULL,
  ai_script TEXT NOT NULL,
  clips JSONB NOT NULL,
  render_status TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_records (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  related_property_title TEXT NOT NULL,
  client_name TEXT NOT NULL,
  confidential_notes TEXT NOT NULL,
  financial_figure TEXT NOT NULL,
  priority TEXT NOT NULL,
  is_client_hidden BOOLEAN NOT NULL DEFAULT true,
  updated_at_label TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id SERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL,
  property_title TEXT NOT NULL,
  campaign_name TEXT NOT NULL,
  cinema_style TEXT NOT NULL,
  status TEXT NOT NULL,
  strategy TEXT NOT NULL,
  creative_assets JSONB NOT NULL,
  activity_log JSONB NOT NULL,
  metrics JSONB NOT NULL,
  scraped_lead_ids JSONB NOT NULL,
  cycles_run INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'agent',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS platform_settings (
  id SERIAL PRIMARY KEY,
  monetization_enabled BOOLEAN NOT NULL DEFAULT false,
  starter_price TEXT NOT NULL DEFAULT '$97',
  pro_price TEXT NOT NULL DEFAULT '$297',
  elite_price TEXT NOT NULL DEFAULT '$697',
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  plan TEXT NOT NULL,
  amount TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS signed_documents (
  id SERIAL PRIMARY KEY,
  property_id INTEGER,
  document_type TEXT NOT NULL,
  title TEXT NOT NULL,
  property_address TEXT NOT NULL,
  purchase_price TEXT NOT NULL,
  buyer_name TEXT NOT NULL,
  seller_name TEXT NOT NULL,
  broker_name TEXT NOT NULL DEFAULT 'Melissa Hatfield',
  brokerage TEXT NOT NULL DEFAULT 'John L. Scott Real Estate',
  status TEXT NOT NULL DEFAULT 'draft',
  document_content TEXT NOT NULL,
  signatures JSONB NOT NULL DEFAULT '[]'::jsonb,
  certificate_id TEXT NOT NULL,
  security_hash TEXT NOT NULL,
  is_mobile_executed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  executed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS client_relationships (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  relationship_type TEXT NOT NULL DEFAULT 'past_buyer',
  home_address TEXT,
  home_purchase_date TEXT,
  purchase_price TEXT,
  birthday TEXT,
  preferred_channel TEXT DEFAULT 'email_sms',
  tags JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  last_touch_at TEXT DEFAULT 'Recently',
  auto_pilot_followups BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS holiday_campaigns (
  id SERIAL PRIMARY KEY,
  event_name TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  scheduled_date TEXT NOT NULL,
  audience_segment TEXT NOT NULL DEFAULT 'all_clients',
  subject TEXT NOT NULL,
  email_body TEXT NOT NULL,
  sender_name TEXT NOT NULL DEFAULT 'Melissa Hatfield',
  sender_brokerage TEXT NOT NULL DEFAULT 'John L. Scott Real Estate',
  sender_phone TEXT NOT NULL DEFAULT '(253) 514-7676',
  status TEXT NOT NULL DEFAULT 'active',
  sent_count INTEGER DEFAULT 0,
  open_rate TEXT DEFAULT '74%',
  is_auto_pilot BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mass_emails (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_content TEXT NOT NULL,
  target_group TEXT NOT NULL,
  recipient_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  template_type TEXT NOT NULL DEFAULT 'luxury_newsletter',
  metrics JSONB DEFAULT '{"opens":0,"clicks":0,"replies":0}'::jsonb,
  sent_at TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_memory_nodes (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  key_title TEXT NOT NULL,
  insight TEXT NOT NULL,
  confidence_score INTEGER NOT NULL DEFAULT 95,
  times_applied INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_earnings (
  id SERIAL PRIMARY KEY,
  deal_title TEXT NOT NULL,
  property_address TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_role TEXT NOT NULL DEFAULT 'seller',
  sale_price_number INTEGER NOT NULL,
  sale_price_formatted TEXT NOT NULL,
  commission_rate_pct TEXT NOT NULL DEFAULT '2.5%',
  gross_commission INTEGER NOT NULL,
  net_agent_payout INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'closed',
  close_date TEXT NOT NULL,
  payout_date TEXT,
  broker_split_ratio TEXT DEFAULT '80/20 Split',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_emails (
  id SERIAL PRIMARY KEY,
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  sender_role TEXT NOT NULL DEFAULT 'client',
  subject TEXT NOT NULL,
  preview_text TEXT NOT NULL,
  full_body TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'client_update',
  priority TEXT NOT NULL DEFAULT 'normal',
  is_read BOOLEAN NOT NULL DEFAULT false,
  received_at TEXT NOT NULL,
  read_aloud_summary TEXT NOT NULL,
  suggested_reply TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS market_advisories (
  id SERIAL PRIMARY KEY,
  region TEXT NOT NULL,
  market_timing_score INTEGER NOT NULL DEFAULT 92,
  market_sentiment TEXT NOT NULL DEFAULT 'strong_sellers_market',
  seller_advice_headline TEXT NOT NULL,
  is_good_time_to_sell BOOLEAN NOT NULL DEFAULT true,
  average_days_on_market INTEGER NOT NULL DEFAULT 14,
  inventory_months TEXT NOT NULL DEFAULT '1.6 Months (Ultra Low)',
  median_price_formatted TEXT NOT NULL DEFAULT '$585,000',
  yoy_appreciation TEXT NOT NULL DEFAULT '+6.4%',
  interest_rate_climate TEXT NOT NULL DEFAULT '6.25% Stable Conventional / 5.85% FHA',
  spoken_briefing_script TEXT NOT NULL,
  best_listing_window TEXT NOT NULL DEFAULT 'Next 14 to 30 Days before seasonal listing surge',
  updated_at_label TEXT DEFAULT 'Updated Today (Live MLS Feeds)',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS meta_capi_events (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER,
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_phone TEXT NOT NULL,
  event_name TEXT NOT NULL DEFAULT 'Lead',
  quality_rating TEXT NOT NULL,
  quality_score INTEGER NOT NULL DEFAULT 90,
  agent_feedback TEXT,
  estimated_deal_value INTEGER DEFAULT 500000,
  currency TEXT DEFAULT 'USD',
  pixel_id TEXT NOT NULL,
  event_id TEXT NOT NULL,
  meta_api_status TEXT NOT NULL DEFAULT 'not_sent',
  fb_event_response JSONB,
  dispatched_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_dialer_campaigns (
  id SERIAL PRIMARY KEY,
  campaign_name TEXT NOT NULL,
  target_audience TEXT NOT NULL,
  scheduled_days JSONB NOT NULL,
  time_window TEXT NOT NULL DEFAULT '10:00 AM - 12:30 PM & 4:30 PM - 7:00 PM',
  dialer_speed TEXT NOT NULL DEFAULT 'smart_adaptive',
  voice_persona TEXT NOT NULL DEFAULT 'Melissa Hatfield Real Estate Concierge (Warm & Professional)',
  call_objective TEXT NOT NULL DEFAULT 'book_showing_or_consultation',
  status TEXT NOT NULL DEFAULT 'active',
  calls_placed_count INTEGER NOT NULL DEFAULT 0,
  answered_count INTEGER NOT NULL DEFAULT 0,
  appointments_booked_count INTEGER NOT NULL DEFAULT 0,
  last_run_at TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS booked_appointments (
  id SERIAL PRIMARY KEY,
  dialer_campaign_id INTEGER,
  lead_id INTEGER,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_email TEXT NOT NULL,
  appointment_type TEXT NOT NULL DEFAULT 'property_showing',
  property_address TEXT,
  scheduled_date_time TEXT NOT NULL,
  calendar_slot TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed',
  notes_from_ai_call TEXT,
  assigned_agent TEXT NOT NULL DEFAULT 'Melissa Hatfield (John L. Scott Real Estate)',
  agent_alert_sent BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
`;

async function run() {
  console.log("Connecting to database...");
  const client = await pool.connect();
  try {
    console.log("Running DDL statements...");
    await client.query(DDL);
    console.log("Tables created successfully!");

    const settingsCount = await client.query("SELECT COUNT(*) FROM platform_settings");
    if (parseInt(settingsCount.rows[0].count, 10) === 0) {
      console.log("Seeding platform settings...");
      await client.query("INSERT INTO platform_settings (monetization_enabled, starter_price, pro_price, elite_price) VALUES (false, '$97', '$297', '$697')");
    }

    const advCount = await client.query("SELECT COUNT(*) FROM market_advisories");
    if (parseInt(advCount.rows[0].count, 10) === 0) {
      console.log("Seeding market advisory...");
      await client.query(`INSERT INTO market_advisories (
        region, market_timing_score, market_sentiment, seller_advice_headline,
        is_good_time_to_sell, average_days_on_market, inventory_months,
        median_price_formatted, yoy_appreciation, interest_rate_climate,
        spoken_briefing_script, best_listing_window
      ) VALUES (
        'Pierce County / Puyallup', 94, 'strong_sellers_market',
        'Historic Low Inventory Creates Massive Seller Advantage Across Pierce County',
        true, 11, '1.4 Months (Severely Constrained)', '$595,000', '+7.2%',
        '6.25% Stable Conventional / 5.85% FHA',
        'Attention Puyallup homeowners: inventory remains at near-record lows with qualified buyers waiting. Homes priced strategically under market average receive multiple offers within the first 10 days.',
        'Next 14 to 28 Days'
      )`);
    }

    console.log("All migrations and seeding verified!");
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((e) => {
  console.error("Migration error:", e);
  process.exit(1);
});
