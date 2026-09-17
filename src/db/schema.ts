import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  jsonb,
  boolean,
} from 'drizzle-orm/pg-core';

export interface GalleryPhoto {
  id: string;
  url: string;
  roomType: string;
  caption: string;
  defaultMotion: 'ken_burns_zoom_in' | 'drone_pan_right' | 'cinematic_dolly_up' | 'orbital_reveal';
}

export interface OutreachMessage {
  id: string;
  timestamp: string;
  channel: 'AI Scraper' | 'AI Email' | 'AI SMS' | 'AI Voice Inbound';
  sender: string;
  message: string;
}

export interface VideoClipConfig {
  id: string;
  photoUrl: string;
  roomName: string;
  durationSec: number;
  cameraMotion: 'ken_burns_zoom_in' | 'drone_pan_right' | 'cinematic_dolly_up' | 'orbital_reveal';
  highlightCaption: string;
}

export interface CampaignAsset {
  id: string;
  channel: string;
  specialist: string;
  title: string;
  content: string;
  status: 'completed' | 'in_progress' | 'queued';
}

export interface CampaignActivity {
  id: string;
  offset: string;
  specialist: string;
  message: string;
}

export interface CampaignMetrics {
  impressions: number;
  emailOpens: number;
  emailReplies: number;
  reelViews: number;
  hotLeads: number;
  toursBooked: number;
  offersGenerated: number;
}

export const properties = pgTable('properties', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  address: text('address').notNull(),
  cityState: text('city_state').notNull(),
  price: text('price').notNull(),
  beds: integer('beds').notNull(),
  baths: text('baths').notNull(),
  sqft: integer('sqft').notNull(),
  heroPhotoUrl: text('hero_photo_url').notNull(),
  galleryPhotos: jsonb('gallery_photos').$type<GalleryPhoto[]>().notNull(),
  sellerName: text('seller_name').notNull(),
  sellerPhone: text('seller_phone').notNull(),
  sellerEmail: text('seller_email').notNull(),
  sellerMotivation: text('seller_motivation').notNull(),
  sellerBottomLine: text('seller_bottom_line').notNull(),
  propertyHighlights: jsonb('property_highlights').$type<string[]>().notNull(),
  agentAssigned: text('agent_assigned').notNull(),
  status: text('status').notNull().default('active'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const leads = pgTable('leads', {
  id: serial('id').primaryKey(),
  buyerName: text('buyer_name').notNull(),
  buyerEmail: text('buyer_email').notNull(),
  buyerPhone: text('buyer_phone').notNull(),
  buyerBudget: text('buyer_budget').notNull(),
  buyerSource: text('buyer_source').notNull(),
  matchedPropertyId: integer('matched_property_id').notNull(),
  stage: text('stage').notNull(),
  aiAgentNode: text('ai_agent_node').notNull(),
  intentScore: integer('intent_score').notNull(),
  outreachHistory: jsonb('outreach_history').$type<OutreachMessage[]>().notNull(),
  buyerNotes: text('buyer_notes').notNull(),
  lastContactedAt: text('last_contacted_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const callTransfers = pgTable('call_transfers', {
  id: serial('id').primaryKey(),
  leadId: integer('lead_id').notNull(),
  propertyId: integer('property_id').notNull(),
  buyerName: text('buyer_name').notNull(),
  buyerPhone: text('buyer_phone').notNull(),
  buyerPreApprovalAmount: text('buyer_pre_approval_amount').notNull(),
  buyerTargetMoveIn: text('buyer_target_move_in').notNull(),
  sellerName: text('seller_name').notNull(),
  sellerPhone: text('seller_phone').notNull(),
  sellerEmail: text('seller_email').notNull(),
  sellerBottomLinePrice: text('seller_bottom_line_price').notNull(),
  sellerMotivationNotes: text('seller_motivation_notes').notNull(),
  assignedAgentName: text('assigned_agent_name').notNull(),
  assignedAgentPhone: text('assigned_agent_phone').notNull(),
  transferStatus: text('transfer_status').notNull(),
  aiSummary: text('ai_summary').notNull(),
  transcriptSnippet: text('transcript_snippet').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const videoProjects = pgTable('video_projects', {
  id: serial('id').primaryKey(),
  propertyId: integer('property_id').notNull(),
  projectName: text('project_name').notNull(),
  aspectRatio: text('aspect_ratio').notNull(),
  cinemaStyle: text('cinema_style'),
  musicTrack: text('music_track').notNull(),
  voiceoverStyle: text('voiceover_style').notNull(),
  aiScript: text('ai_script').notNull(),
  clips: jsonb('clips').$type<VideoClipConfig[]>().notNull(),
  renderStatus: text('render_status').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// STRICTLY AGENT-ONLY PRIVATE HUB RECORDS (Never visible to clients)
export const agentRecords = pgTable('agent_records', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  relatedPropertyTitle: text('related_property_title').notNull(),
  clientName: text('client_name').notNull(),
  confidentialNotes: text('confidential_notes').notNull(),
  financialFigure: text('financial_figure').notNull(),
  priority: text('priority').notNull(),
  isClientHidden: boolean('is_client_hidden').notNull().default(true),
  updatedAtLabel: text('updated_at_label').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// AUTONOMOUS SALESFORCE-STYLE AI MARKETING CAMPAIGNS
export const marketingCampaigns = pgTable('marketing_campaigns', {
  id: serial('id').primaryKey(),
  propertyId: integer('property_id').notNull(),
  propertyTitle: text('property_title').notNull(),
  campaignName: text('campaign_name').notNull(),
  cinemaStyle: text('cinema_style').notNull(),
  status: text('status').notNull(), // 'active' | 'paused'
  strategy: text('strategy').notNull(),
  creativeAssets: jsonb('creative_assets').$type<CampaignAsset[]>().notNull(),
  activityLog: jsonb('activity_log').$type<CampaignActivity[]>().notNull(),
  metrics: jsonb('metrics').$type<CampaignMetrics>().notNull(),
  scrapedLeadIds: jsonb('scraped_lead_ids').$type<number[]>().notNull(),
  cyclesRun: integer('cycles_run').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// ============ AUTH + SUBSCRIPTION REVENUE ENGINE ============

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull().default('agent'), // 'admin' | 'agent'
  createdAt: timestamp('created_at').defaultNow(),
});

export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  token: text('token').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const platformSettings = pgTable('platform_settings', {
  id: serial('id').primaryKey(),
  monetizationEnabled: boolean('monetization_enabled').notNull().default(false),
  starterPrice: text('starter_price').notNull().default('$97'),
  proPrice: text('pro_price').notNull().default('$297'),
  elitePrice: text('elite_price').notNull().default('$697'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  userEmail: text('user_email').notNull(),
  userName: text('user_name').notNull(),
  plan: text('plan').notNull(), // 'starter' | 'pro' | 'elite'
  amount: text('amount').notNull(),
  status: text('status').notNull().default('active'), // 'active' | 'canceled'
  createdAt: timestamp('created_at').defaultNow(),
});

export interface SignerAuditLog {
  signerName: string;
  signerEmail: string;
  signerRole: 'buyer' | 'seller' | 'broker';
  signatureDataUrl?: string;
  signedAt: string;
  ipAddress: string;
  deviceType: string;
  securityHash: string;
}

// REAL ESTATE DOCUMENTS & MOBILE AUTOMATED SIGNING VAULT
export const signedDocuments = pgTable('signed_documents', {
  id: serial('id').primaryKey(),
  propertyId: integer('property_id'),
  documentType: text('document_type').notNull(), // 'psa' | 'listing_agreement' | 'inspection_addendum' | 'seller_disclosure' | 'financing_addendum' | 'earnest_money' | 'agency_disclosure' | 'loi'
  title: text('title').notNull(),
  propertyAddress: text('property_address').notNull(),
  purchasePrice: text('purchase_price').notNull(),
  buyerName: text('buyer_name').notNull(),
  sellerName: text('seller_name').notNull(),
  brokerName: text('broker_name').notNull().default('Melissa Hatfield'),
  brokerage: text('brokerage').notNull().default('John L. Scott Real Estate'),
  status: text('status').notNull().default('draft'), // 'draft' | 'pending_signature' | 'partially_signed' | 'fully_executed'
  documentContent: text('document_content').notNull(),
  signatures: jsonb('signatures').$type<SignerAuditLog[]>().notNull().default([]),
  certificateId: text('certificate_id').notNull(),
  securityHash: text('security_hash').notNull(),
  isMobileExecuted: boolean('is_mobile_executed').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
  executedAt: timestamp('executed_at'),
});

// CLIENT RELATIONSHIPS & CRM DIRECTORY
export const clientRelationships = pgTable('client_relationships', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  relationshipType: text('relationship_type').notNull().default('past_buyer'), // 'past_buyer' | 'past_seller' | 'active_buyer' | 'active_seller' | 'vip_investor' | 'sphere'
  homeAddress: text('home_address'),
  homePurchaseDate: text('home_purchase_date'),
  purchasePrice: text('purchase_price'),
  birthday: text('birthday'),
  preferredChannel: text('preferred_channel').default('email_sms'),
  tags: jsonb('tags').$type<string[]>().default([]),
  notes: text('notes'),
  lastTouchAt: text('last_touch_at').default('Recently'),
  autoPilotFollowups: boolean('auto_pilot_followups').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// AUTOMATED HOLIDAY & LIFECYCLE NURTURE CAMPAIGNS
export const holidayCampaigns = pgTable('holiday_campaigns', {
  id: serial('id').primaryKey(),
  eventName: text('event_name').notNull(),
  triggerType: text('trigger_type').notNull(), // 'holiday' | 'homeiversary' | 'birthday' | 'market_update'
  scheduledDate: text('scheduled_date').notNull(),
  audienceSegment: text('audience_segment').notNull().default('all_clients'),
  subject: text('subject').notNull(),
  emailBody: text('email_body').notNull(),
  senderName: text('sender_name').notNull().default('Melissa Hatfield'),
  senderBrokerage: text('sender_brokerage').notNull().default('John L. Scott Real Estate'),
  senderPhone: text('sender_phone').notNull().default('(253) 514-7676'),
  status: text('status').notNull().default('active'), // 'active' | 'scheduled' | 'sent'
  sentCount: integer('sent_count').default(0),
  openRate: text('open_rate').default('74%'),
  isAutoPilot: boolean('is_auto_pilot').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// MASS EMAIL DISPATCHES & BROADCASTS
export const massEmails = pgTable('mass_emails', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  subject: text('subject').notNull(),
  bodyContent: text('body_content').notNull(),
  targetGroup: text('target_group').notNull(), // 'all_clients' | 'past_buyers' | 'vip_investors' | 'active_leads' | 'pierce_county_sphere'
  recipientCount: integer('recipient_count').notNull().default(0),
  status: text('status').notNull().default('draft'), // 'draft' | 'sending' | 'sent'
  templateType: text('template_type').notNull().default('luxury_newsletter'),
  metrics: jsonb('metrics').$type<{ opens: number; clicks: number; replies: number }>().default({ opens: 0, clicks: 0, replies: 0 }),
  sentAt: text('sent_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// AI INTELLIGENCE & LEARNING MEMORY NODES
export const aiMemoryNodes = pgTable('ai_memory_nodes', {
  id: serial('id').primaryKey(),
  category: text('category').notNull(), // 'market_insight' | 'client_preference' | 'zillow_pattern' | 'pricing_heuristic' | 'negotiation_rule'
  keyTitle: text('key_title').notNull(),
  insight: text('insight').notNull(),
  confidenceScore: integer('confidence_score').notNull().default(95),
  timesApplied: integer('times_applied').notNull().default(1),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// AGENT FINANCIAL EARNINGS, COMMISSIONS & ESCROW PIPELINE
export const agentEarnings = pgTable('agent_earnings', {
  id: serial('id').primaryKey(),
  dealTitle: text('deal_title').notNull(),
  propertyAddress: text('property_address').notNull(),
  clientName: text('client_name').notNull(),
  clientRole: text('client_role').notNull().default('seller'), // 'seller' | 'buyer' | 'dual'
  salePriceNumber: integer('sale_price_number').notNull(),
  salePriceFormatted: text('sale_price_formatted').notNull(),
  commissionRatePct: text('commission_rate_pct').notNull().default('2.5%'),
  grossCommission: integer('gross_commission').notNull(),
  netAgentPayout: integer('net_agent_payout').notNull(),
  status: text('status').notNull().default('closed'), // 'closed' | 'pending_escrow' | 'projected_q2'
  closeDate: text('close_date').notNull(),
  payoutDate: text('payout_date'),
  brokerSplitRatio: text('broker_split_ratio').default('80/20 Split'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// AGENT EMAIL INBOX & SPOKEN VOICE AUDIO SUMMARIES
export const agentEmails = pgTable('agent_emails', {
  id: serial('id').primaryKey(),
  senderName: text('sender_name').notNull(),
  senderEmail: text('sender_email').notNull(),
  senderRole: text('sender_role').notNull().default('client'), // 'escrow' | 'inspector' | 'buyer' | 'seller' | 'zillow_lead'
  subject: text('subject').notNull(),
  previewText: text('preview_text').notNull(),
  fullBody: text('full_body').notNull(),
  category: text('category').notNull().default('client_update'), // 'escrow_title' | 'inspection_counter' | 'lead_inquiry' | 'client_update' | 'appraisal'
  priority: text('priority').notNull().default('normal'), // 'urgent' | 'high' | 'normal'
  isRead: boolean('is_read').notNull().default(false),
  receivedAt: text('received_at').notNull(),
  readAloudSummary: text('read_aloud_summary').notNull(),
  suggestedReply: text('suggested_reply').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// REAL-TIME MARKET TIMING & ADVISORY INDICATORS ("Is it good to sell right now?")
export const marketAdvisories = pgTable('market_advisories', {
  id: serial('id').primaryKey(),
  region: text('region').notNull(), // 'Pierce County / Puyallup' | 'Tacoma & Puget Sound' | 'King County / Bellevue'
  marketTimingScore: integer('market_timing_score').notNull().default(92), // 0-100 (100 = Peak Seller Advantage)
  marketSentiment: text('market_sentiment').notNull().default('strong_sellers_market'), // 'strong_sellers_market' | 'moderate_sellers' | 'balanced'
  sellerAdviceHeadline: text('seller_advice_headline').notNull(),
  isGoodTimeToSell: boolean('is_good_time_to_sell').notNull().default(true),
  averageDaysOnMarket: integer('average_days_on_market').notNull().default(14),
  inventoryMonths: text('inventory_months').notNull().default('1.6 Months (Ultra Low)'),
  medianPriceFormatted: text('median_price_formatted').notNull().default('$585,000'),
  yoyAppreciation: text('yoy_appreciation').notNull().default('+6.4%'),
  interestRateClimate: text('interest_rate_climate').notNull().default('6.25% Stable Conventional / 5.85% FHA'),
  spokenBriefingScript: text('spoken_briefing_script').notNull(),
  bestListingWindow: text('best_listing_window').notNull().default('Next 14 to 30 Days before seasonal listing surge'),
  updatedAtLabel: text('updated_at_label').default('Updated Today (Live MLS Feeds)'),
  createdAt: timestamp('created_at').defaultNow(),
});

// META CONVERSIONS API (CAPI) & PIXEL TELEMETRY LOGS
export const metaCapiEvents = pgTable('meta_capi_events', {
  id: serial('id').primaryKey(),
  leadId: integer('lead_id'),
  buyerName: text('buyer_name').notNull(),
  buyerEmail: text('buyer_email').notNull(),
  buyerPhone: text('buyer_phone').notNull(),
  eventName: text('event_name').notNull().default('Lead'), // 'Lead' | 'QualifiedLead' | 'HighQualityLead' | 'Schedule' | 'InitiateCheckout'
  qualityRating: text('quality_rating').notNull(), // 'high_quality' | 'verified_cash' | 'unqualified' | 'spam'
  qualityScore: integer('quality_score').notNull().default(90),
  agentFeedback: text('agent_feedback'),
  estimatedDealValue: integer('estimated_deal_value').default(500000),
  currency: text('currency').default('USD'),
  pixelId: text('pixel_id').notNull(),
  eventId: text('event_id').notNull(),
  metaApiStatus: text('meta_api_status').notNull().default('not_sent'), // 'sent_to_meta' | 'rejected' | 'not_sent'
  fbEventResponse: jsonb('fb_event_response'),
  dispatchedAt: timestamp('dispatched_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

// AI VOICE DIALER CAMPAIGNS & CALL APPOINTMENT BOOKING
export const aiDialerCampaigns = pgTable('ai_dialer_campaigns', {
  id: serial('id').primaryKey(),
  campaignName: text('campaign_name').notNull(),
  targetAudience: text('target_audience').notNull(), // 'new_zillow_leads' | 'past_client_anniversaries' | 'homeowners_sphere' | 'unresponsive_buyers'
  scheduledDays: jsonb('scheduled_days').$type<string[]>().notNull(), // e.g. ['Tuesday', 'Thursday', 'Saturday']
  timeWindow: text('time_window').notNull().default('10:00 AM - 12:30 PM & 4:30 PM - 7:00 PM'), // peak conversion calling hours
  dialerSpeed: text('dialer_speed').notNull().default('smart_adaptive'), // 'smart_adaptive' | 'predictive' | 'power'
  voicePersona: text('voice_persona').notNull().default('Melissa Hatfield Real Estate Concierge (Warm & Professional)'),
  callObjective: text('call_objective').notNull().default('book_showing_or_consultation'), // 'book_showing_or_consultation' | 'qualify_cash_budget' | 'homeiversary_greeting'
  status: text('status').notNull().default('active'), // 'active' | 'scheduled' | 'paused' | 'completed'
  callsPlacedCount: integer('calls_placed_count').notNull().default(0),
  answeredCount: integer('answered_count').notNull().default(0),
  appointmentsBookedCount: integer('appointments_booked_count').notNull().default(0),
  lastRunAt: text('last_run_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// DIALER APPOINTMENTS BOOKED AUTOMATICALLY INTO CALENDAR
export const bookedAppointments = pgTable('booked_appointments', {
  id: serial('id').primaryKey(),
  dialerCampaignId: integer('dialer_campaign_id'),
  leadId: integer('lead_id'),
  clientName: text('client_name').notNull(),
  clientPhone: text('client_phone').notNull(),
  clientEmail: text('client_email').notNull(),
  appointmentType: text('appointment_type').notNull().default('property_showing'), // 'property_showing' | 'listing_consultation' | 'valuation_review'
  propertyAddress: text('property_address'),
  scheduledDateTime: text('scheduled_date_time').notNull(),
  calendarSlot: text('calendar_slot').notNull(),
  status: text('status').notNull().default('confirmed'), // 'confirmed' | 'reminded' | 'completed' | 'rescheduled'
  notesFromAiCall: text('notes_from_ai_call'),
  assignedAgent: text('assigned_agent').notNull().default('Melissa Hatfield (John L. Scott Real Estate)'),
  agentAlertSent: boolean('agent_alert_sent').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
});
