import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import {
  properties,
  leads,
  callTransfers,
  videoProjects,
  agentRecords,
  marketingCampaigns,
  platformSettings,
  subscriptions,
  signedDocuments,
  clientRelationships,
  holidayCampaigns,
  massEmails,
  aiMemoryNodes,
  agentEarnings,
  agentEmails,
  marketAdvisories,
  metaCapiEvents,
  aiDialerCampaigns,
  bookedAppointments,
  SignerAuditLog,
  GalleryPhoto,
  CampaignAsset,
  CampaignActivity,
  CampaignMetrics,
} from '@/db/schema';
import { getSessionUser, ensureSeededAuth } from '@/lib/auth-server';
import { searchLiveProperties } from '@/lib/property-intelligence';
import { sendLeadToMetaPixelCapi } from '@/lib/meta-conversions-api';
import { eq, desc } from 'drizzle-orm';

const now = () =>
  new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

async function sendRealEmail(to: string[], subject: string, text: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.VERIFIED_FROM_EMAIL;
  if (!apiKey || !from) throw new Error('Email provider is not configured.');
  if (!to.length) throw new Error('No opted-in recipients with email addresses were found.');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      text,
      reply_to: 'melissafh@johnlscott.com',
    }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Email provider rejected the message.');
  return result;
}

async function hasWorkspaceAccess(request: Request): Promise<boolean> {
  await ensureSeededAuth();
  const settings = await db.select().from(platformSettings);
  // No setting row (first launch) and personal mode deliberately remain open.
  if (!settings[0]?.monetizationEnabled) return true;

  const user = await getSessionUser(request);
  if (!user) return false;
  if (user.role === 'admin') return true;

  const userSubscriptions = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, user.id));
  return userSubscriptions.some((subscription) => subscription.status === 'active');
}

interface PropertyData {
  title: string;
  address: string;
  cityState: string;
  price: string;
  beds: number;
  baths: string;
  sqft: number;
  sellerName: string;
  propertyHighlights: string[];
}

function buildCreativeAssets(
  property: PropertyData | Record<string, unknown>,
  campaignName: string,
  cinemaStyle: string
): CampaignAsset[] {
  const p = property as {
    title: string;
    address: string;
    cityState: string;
    price: string;
    beds: number;
    baths: string;
    sqft: number;
    sellerName: string;
    propertyHighlights: string[];
  };

  return [
    {
      id: 'asset-brand',
      channel: 'Brand Strategy',
      specialist: 'Elena Voss — Creative Director (20yrs Luxury Brand)',
      title: 'Positioning & Headline Suite',
      status: 'completed',
      content: `CAMPAIGN: ${campaignName}\nPRIMARY HEADLINE: "Beyond the gates of ${p.address.split(',')[0]}, a private world begins."\nSECONDARY: "${p.title} — ${p.beds} beds • ${p.sqft.toLocaleString()} sq ft • Offered at ${p.price}."\nBRAND PILLARS: Scarcity, silence, light. Tone: editorial, confident, never salesy. Visual grade: ${cinemaStyle}.`,
    },
    {
      id: 'asset-reel',
      channel: 'Cinematic Video',
      specialist: 'Cinema Studio AI Director',
      title: '16:9 Hero Film + 9:16 Social Cutdowns',
      status: 'completed',
      content: `Delivered a ${cinemaStyle} graded hero film (16:9, MLS/YouTube/landing page) plus three 15-second 9:16 cutdowns (exterior reveal, kitchen, primary suite) with burned-in lower-third captions, licensed-style orchestral score, and Architectural Digest narration. Thumbnail A/B variants: twilight pool vs. double-height great room.`,
    },
    {
      id: 'asset-email',
      channel: 'Email & CRM',
      specialist: 'Margaret Chen — Email & CRM Director',
      title: '3-Touch Luxury Nurture Sequence',
      status: 'completed',
      content: `EMAIL 1 (T+0h) — "A private preview, by invitation only" — hero 16:9 reel + 4 strongest features.\nEMAIL 2 (T+24h) — "The details few will ever see" — macro finishes: ${(p.propertyHighlights || []).slice(0, 2).join('; ')}.\nEMAIL 3 (T+72h) — "One showing window remains this week" — scarcity + 1-tap private tour booking. All sends use plain-text elegance formatting, single CTA, per-recipient first-name personalization.`,
    },
    {
      id: 'asset-social',
      channel: 'Social / Reels',
      specialist: 'Diego Ramirez — Social & Content Director',
      title: 'Instagram / TikTok / YouTube Shorts Pack',
      status: 'completed',
      content: `REEL A: 15s 9:16 exterior fly-in, hook voiceover: "What $${p.price.replace(/[^0-9.]/g, '')}M buys above ${p.cityState.split(',')[0]}..."\nREEL B: 15s kitchen-to-pool match cut.\nREEL C: 30s "day to night" twilight transformation.\nCAPTIONS: story-driven, 3-line hook. HASHTAGS: #LuxuryRealEstate #PocketListing #ModernEstate #MansionLife #${(p.cityState.split(',')[0] || 'Luxury').replace(/\s+/g, '')}RealEstate\nPOST SCHEDULE: Reels at 7:12am & 8:48pm local (HNW active windows); Stories with poll sticker "Would you host here?".`,
    },
    {
      id: 'asset-ads',
      channel: 'Paid Media',
      specialist: 'Priya Nair — Paid Media Strategist',
      title: 'Meta + Google Luxury Ad Plan',
      status: 'completed',
      content: `META: $250/day, objective = 10s video views then retarget to tour form. Audiences: household income top 1%, net worth investors, Sotheby's/Christie's page engagers, 15mi geo-lookalikes of country clubs & private airports.\nGOOGLE: Search keywords "pocket listing ${p.cityState}", "off market luxury homes"; Discovery ads with hero film; YouTube masthead in DMA.\nCREATIVE: 9:16 reel + single-line offer "By introduction only." Lead form captures phone + timeline.`,
    },
    {
      id: 'asset-pr',
      channel: 'PR & Pocket Network',
      specialist: 'Jonathan Ashe — PR & Broker Network Lead',
      title: 'Whisper Network Pitch & Broker Blast',
      status: 'completed',
      content: `Private pitch sent to 140 cooperating luxury brokers in the Top Agent Network (no MLS price reveal). Placement angle offered to: Mansion Global "On the Market", Robb Report Homes, and local society editor. One-page PDF teaser with watermark + agent-of-record contact only.`,
    },
    {
      id: 'asset-sms',
      channel: 'SMS / WhatsApp',
      specialist: 'Outreach-Mercury AI Node',
      title: 'Personalized SMS Blast to Verified Buyers',
      status: 'completed',
      content: `MESSAGE: "Hello {firstName} — I've just taken ${p.address} off-market-private in ${p.cityState}. ${p.beds} bed / ${p.sqft.toLocaleString()} sq ft, offered at ${p.price}. I held two showing windows for pre-qualified buyers this week — the 9:16 film is here: [personalized reel link]. Shall I reserve one for you?" Sent windows: 10:15am & 5:45pm; replies auto-scored by intent engine.`,
    },
  ];
}

function buildCampaignActivity(campaignName: string): CampaignActivity[] {
  return [
    {
      id: 'a1',
      offset: 'T+0 min',
      specialist: 'Elena Voss — Creative Director',
      message: `${campaignName} approved. Positioning locked: scarcity, silence, light. Assigned 6 specialists + scraper swarm.`,
    },
    {
      id: 'a2',
      offset: 'T+12 min',
      specialist: 'Cinema Studio AI Director',
      message:
        'Autonomous director graded photos, assigned camera vectors per room, generated VO script. 16:9 hero + three 9:16 cutdowns rendered.',
    },
    {
      id: 'a3',
      offset: 'T+27 min',
      specialist: 'Diego Ramirez — Social Director',
      message:
        'Reels published to Instagram, TikTok & Shorts at verified HNW time windows. Story polls live.',
    },
    {
      id: 'a4',
      offset: 'T+38 min',
      specialist: 'Scraper-Alpha × Marketing Joint Node',
      message:
        'Scraped 1,240 high-net-worth profiles; 312 passed liquidity + location match; deduplicated against CRM; 3 instant high-intent matches identified.',
    },
    {
      id: 'a5',
      offset: 'T+45 min',
      specialist: 'Margaret Chen — Email Director',
      message:
        'Email 1 dispatched to 312 verified buyers with personalized reel links. Open tracking + reply classification armed.',
    },
    {
      id: 'a6',
      offset: 'T+52 min',
      specialist: 'Priya Nair — Paid Media',
      message:
        'Meta + Google campaigns live ($250/day), luxury income targeting + private-club lookalikes activated.',
    },
    {
      id: 'a7',
      offset: 'T+60 min',
      specialist: 'Jonathan Ashe — PR Lead',
      message:
        'Whisper pitch delivered to 140 Top Agent Network brokers; press teasers queued to Mansion Global & Robb Report.',
    },
    {
      id: 'a8',
      offset: 'T+3 hrs',
      specialist: 'Qualifier-Vanguard',
      message:
        'Replies & reel re-watches scored; hot buyers (>90 intent) routed toward Seller Vault for warm-call transfer.',
    },
  ];
}

export async function GET(request: Request) {
  try {
    if (!(await hasWorkspaceAccess(request))) {
      return NextResponse.json({ error: 'Active subscription required.' }, { status: 401 });
    }

    const [
      allProperties,
      allLeads,
      allTransfers,
      allVideoProjects,
      allAgentRecords,
      allCampaigns,
      allDocuments,
      allClients,
      allHolidayCampaigns,
      allMassEmails,
      allAiMemoryNodes,
      allEarnings,
      allEmails,
      allAdvisories,
      allMetaCapiEvents,
      allDialerCampaigns,
      allBookedAppointments,
    ] = await Promise.all([
      db.select().from(properties).orderBy(desc(properties.id)),
      db.select().from(leads).orderBy(desc(leads.id)),
      db.select().from(callTransfers).orderBy(desc(callTransfers.id)),
      db.select().from(videoProjects).orderBy(desc(videoProjects.id)),
      db.select().from(agentRecords).orderBy(desc(agentRecords.id)),
      db.select().from(marketingCampaigns).orderBy(desc(marketingCampaigns.id)),
      db.select().from(signedDocuments).orderBy(desc(signedDocuments.id)),
      db.select().from(clientRelationships).orderBy(desc(clientRelationships.id)),
      db.select().from(holidayCampaigns).orderBy(desc(holidayCampaigns.id)),
      db.select().from(massEmails).orderBy(desc(massEmails.id)),
      db.select().from(aiMemoryNodes).orderBy(desc(aiMemoryNodes.confidenceScore)),
      db.select().from(agentEarnings).orderBy(desc(agentEarnings.id)),
      db.select().from(agentEmails).orderBy(desc(agentEmails.id)),
      db.select().from(marketAdvisories).orderBy(desc(marketAdvisories.marketTimingScore)),
      db.select().from(metaCapiEvents).orderBy(desc(metaCapiEvents.id)),
      db.select().from(aiDialerCampaigns).orderBy(desc(aiDialerCampaigns.id)),
      db.select().from(bookedAppointments).orderBy(desc(bookedAppointments.id)),
    ]);

    return NextResponse.json({
      properties: allProperties,
      leads: allLeads,
      callTransfers: allTransfers,
      videoProjects: allVideoProjects,
      agentRecords: allAgentRecords,
      campaigns: allCampaigns,
      documents: allDocuments,
      clients: allClients,
      holidayCampaigns: allHolidayCampaigns,
      massEmails: allMassEmails,
      aiMemoryNodes: allAiMemoryNodes,
      earnings: allEarnings,
      emails: allEmails,
      marketAdvisories: allAdvisories,
      metaCapiEvents: allMetaCapiEvents,
      dialerCampaigns: allDialerCampaigns,
      bookedAppointments: allBookedAppointments,
      integrations: {
        metaCapi: Boolean(process.env.META_PIXEL_ID && process.env.META_CAPI_ACCESS_TOKEN),
        twilioDialer: Boolean(
          process.env.TWILIO_ACCOUNT_SID &&
            process.env.TWILIO_AUTH_TOKEN &&
            process.env.TWILIO_PHONE_NUMBER &&
            process.env.NEXT_PUBLIC_APP_URL
        ),
        emailDelivery: Boolean(process.env.RESEND_API_KEY && process.env.VERIFIED_FROM_EMAIL),
        openCode: Boolean(process.env.OPENCODE_SERVER_URL),
        listingFeed: Boolean(process.env.RESO_WEB_API_URL && process.env.RESO_ACCESS_TOKEN),
        premiumVoice: Boolean(
          process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_VOICE_ID
        ),
      },
    });
  } catch (error) {
    console.error('Error fetching swarm data:', error);
    return NextResponse.json(
      { error: 'Failed to load swarm data' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!(await hasWorkspaceAccess(request))) {
      return NextResponse.json({ error: 'Active subscription required.' }, { status: 401 });
    }
    const body = await request.json();
    const { action } = body;

    if (
      ['send_holiday_now', 'dispatch_mass_email', 'send_ai_reply'].includes(action) &&
      !process.env.RESEND_API_KEY
    ) {
      return NextResponse.json(
        { error: 'Email delivery is not configured. Add RESEND_API_KEY and VERIFIED_FROM_EMAIL.' },
        { status: 503 }
      );
    }

    if (
      ['launch_campaign', 'run_scraper_swarm'].includes(action)
    ) {
      return NextResponse.json(
        {
          error:
            'This automated action is disabled until its licensed data and delivery providers are configured. Use manual CRM entry or connect approved services.',
        },
        { status: 503 }
      );
    }

    if (action === 'add_listing') {
      const {
        title,
        address,
        cityState,
        price,
        beds,
        baths,
        sqft,
        sellerName,
        sellerPhone,
        sellerEmail,
        sellerMotivation,
        sellerBottomLine,
        highlights,
        photos,
      } = body as {
        title: string;
        address: string;
        cityState: string;
        price: string;
        beds: number;
        baths: string;
        sqft: number;
        sellerName: string;
        sellerPhone: string;
        sellerEmail: string;
        sellerMotivation: string;
        sellerBottomLine: string;
        highlights: string[];
        photos: { url: string; label?: string }[];
      };

      if (!title || !address || !price || !photos?.length) {
        return NextResponse.json(
          { error: 'Title, address, price and at least one photo are required' },
          { status: 400 }
        );
      }

      const roomNames = [
        'Twilight Exterior & Approach',
        'Double-Height Great Room',
        "Chef's Kitchen & Entertaining Space",
        'Primary Suite Retreat',
        'Private Outdoor Lounge & Pool',
      ];
      const motions: GalleryPhoto['defaultMotion'][] = [
        'drone_pan_right',
        'ken_burns_zoom_in',
        'cinematic_dolly_up',
        'orbital_reveal',
        'ken_burns_zoom_in',
      ];

      const galleryPhotos: GalleryPhoto[] = photos.slice(0, 12).map((photo, idx) => ({
        id: `upload-${Date.now()}-${idx}`,
        url: photo.url,
        roomType: photo.label?.trim() || roomNames[idx] || `Feature Space ${idx + 1}`,
        caption:
          photo.label?.trim() ||
          `Signature space ${idx + 1} of ${title} — professional real estate cinematography.`,
        defaultMotion: motions[idx % motions.length],
      }));

      const created = await db
        .insert(properties)
        .values({
          title,
          address,
          cityState: cityState || 'On File',
          price,
          beds: Number(beds) || 4,
          baths: baths || '4.5',
          sqft: Number(sqft) || 4000,
          heroPhotoUrl: photos[0].url,
          galleryPhotos,
          sellerName: sellerName || 'Confidential Seller',
          sellerPhone: sellerPhone || 'On file',
          sellerEmail: sellerEmail || 'On file',
          sellerMotivation:
            sellerMotivation || 'Seller terms documented in private agent organizer.',
          sellerBottomLine: sellerBottomLine || price,
          propertyHighlights:
            highlights && highlights.length
              ? highlights
              : ['Custom architectural finishes', 'Premium private location', 'Turnkey furnished possibility'],
          agentAssigned: 'Melissa Hatfield, REALTOR® / Broker · John L. Scott Real Estate',
          status: 'active',
        })
        .returning();

      // Auto-populate confidential seller intelligence in Private Agent Hub
      await db
        .insert(agentRecords)
        .values({
          title: `Seller Intelligence & Reserve // ${title}`,
          category: 'Seller Confidential',
          relatedPropertyTitle: title,
          clientName: sellerName || 'Confidential Seller',
          confidentialNotes: sellerMotivation
            ? `Listing Broker: Melissa Hatfield (John L. Scott Real Estate · 253-514-7676). Seller Motivation: ${sellerMotivation}. Confidential bottom-line floor: ${sellerBottomLine || price}.`
            : `Listing Broker: Melissa Hatfield (John L. Scott Real Estate · 253-514-7676). Confidential bottom-line floor: ${sellerBottomLine || price}. Pre-approved buyer proof-of-funds verification required.`,
          financialFigure: sellerBottomLine || price,
          priority: 'CRITICAL',
          isClientHidden: true,
          updatedAtLabel: 'Just now',
        });

      return NextResponse.json({ success: true, property: created[0] });
    }

    if (action === 'add_lead') {
      if (!body.buyerName || !body.buyerEmail || !body.buyerPhone) {
        return NextResponse.json(
          { error: 'Buyer name, email, and phone are required.' },
          { status: 400 }
        );
      }
      const inserted = await db
        .insert(leads)
        .values({
          buyerName: String(body.buyerName).trim(),
          buyerEmail: String(body.buyerEmail).trim().toLowerCase(),
          buyerPhone: String(body.buyerPhone).trim(),
          buyerBudget: String(body.buyerBudget || ''),
          buyerSource: String(body.buyerSource || 'Manual CRM entry'),
          matchedPropertyId: Number(body.matchedPropertyId || 0),
          stage: 'new',
          aiAgentNode: 'Manual CRM entry',
          intentScore: Math.max(0, Math.min(100, Number(body.intentScore || 50))),
          outreachHistory: [],
          buyerNotes: String(body.buyerNotes || ''),
          lastContactedAt: 'Not contacted',
        })
        .returning();
      return NextResponse.json({ success: true, lead: inserted[0] });
    }

    if (action === 'save_video_project') {
      const inserted = await db
        .insert(videoProjects)
        .values({
          propertyId: Number(body.propertyId),
          projectName: String(body.projectName || 'Untitled Cinema Project'),
          aspectRatio: String(body.aspectRatio || '16:9'),
          cinemaStyle: String(body.cinemaStyle || 'editorial'),
          musicTrack: String(body.musicTrack || 'Not selected'),
          voiceoverStyle: String(body.voiceoverStyle || 'Not selected'),
          aiScript: String(body.aiScript || ''),
          clips: Array.isArray(body.clips) ? body.clips : [],
          renderStatus: 'draft',
        })
        .returning();
      return NextResponse.json({ success: true, videoProject: inserted[0] });
    }

    if (action === 'record_buyer_contact') {
      const leadRows = await db
        .select()
        .from(leads)
        .where(eq(leads.id, Number(body.leadId)));
      const lead = leadRows[0];
      if (!lead) return NextResponse.json({ error: 'Lead not found.' }, { status: 404 });

      const propertyRows = await db
        .select()
        .from(properties)
        .where(eq(properties.id, lead.matchedPropertyId));
      const property = propertyRows[0];
      if (!property) {
        return NextResponse.json(
          { error: 'Link the lead to a real listing before creating a call sheet.' },
          { status: 400 }
        );
      }

      await db
        .update(leads)
        .set({
          stage: 'contacted',
          lastContactedAt: new Date().toISOString(),
          outreachHistory: [
            ...lead.outreachHistory,
            {
              id: crypto.randomUUID(),
              timestamp: new Date().toISOString(),
              channel: 'AI Voice Inbound',
              sender: 'Melissa Hatfield',
              message: 'Agent recorded an actual inbound buyer contact.',
            },
          ],
        })
        .where(eq(leads.id, lead.id));

      const created = await db
        .insert(callTransfers)
        .values({
          leadId: lead.id,
          propertyId: property.id,
          buyerName: lead.buyerName,
          buyerPhone: lead.buyerPhone,
          buyerPreApprovalAmount: lead.buyerBudget || 'Not recorded',
          buyerTargetMoveIn: 'Not recorded',
          sellerName: property.sellerName || 'Not recorded',
          sellerPhone: property.sellerPhone || 'Not recorded',
          sellerEmail: property.sellerEmail || 'Not recorded',
          sellerBottomLinePrice: property.sellerBottomLine || 'Not recorded',
          sellerMotivationNotes: property.sellerMotivation || 'Not recorded',
          assignedAgentName: property.agentAssigned || 'Melissa Hatfield',
          assignedAgentPhone: '(253) 514-7676',
          transferStatus: 'contact_recorded',
          aiSummary: `Actual contact recorded for ${lead.buyerName} regarding ${property.title}. Review the stored buyer and seller records before responding.`,
          transcriptSnippet: 'No transcript recorded.',
        })
        .returning();

      return NextResponse.json({ success: true, transfer: created[0] });
    }

    if (action === 'create_document') {
      const certId = `JLS-DOC-${crypto.randomUUID().toUpperCase()}`;
      const secHash = `SHA256:${crypto
        .createHash('sha256')
        .update(`${certId}:${body.propertyAddress}:${Date.now()}`)
        .digest('hex')}`;

      const inserted = await db
        .insert(signedDocuments)
        .values({
          propertyId: body.propertyId ? Number(body.propertyId) : null,
          documentType: body.documentType || 'psa',
          title: body.title,
          propertyAddress: body.propertyAddress,
          purchasePrice: body.purchasePrice,
          buyerName: body.buyerName,
          sellerName: body.sellerName,
          brokerName: body.brokerName || 'Melissa Hatfield',
          brokerage: body.brokerage || 'John L. Scott Real Estate',
          status: body.status || 'pending_signature',
          documentContent: body.documentContent,
          signatures: body.signatures || [],
          certificateId: certId,
          securityHash: secHash,
          isMobileExecuted: Boolean(body.isMobileExecuted),
        })
        .returning();
      return NextResponse.json({ success: true, document: inserted[0] });
    }

    if (action === 'sign_document') {
      const { documentId, signatureData } = body as {
        documentId: number;
        signatureData: SignerAuditLog;
      };

      const docRows = await db
        .select()
        .from(signedDocuments)
        .where(eq(signedDocuments.id, Number(documentId)));

      if (docRows.length === 0) {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 });
      }

      const doc = docRows[0];
      const updatedSignatures = [...(doc.signatures || []), signatureData];
      const hasBuyer = updatedSignatures.some((s) => s.signerRole === 'buyer');
      const hasSeller = updatedSignatures.some((s) => s.signerRole === 'seller');
      const hasBroker = updatedSignatures.some((s) => s.signerRole === 'broker');

      const isFullyExecuted = updatedSignatures.length >= 2 || (hasBuyer && hasBroker);
      const newStatus = isFullyExecuted ? 'fully_executed' : 'partially_signed';

      const updated = await db
        .update(signedDocuments)
        .set({
          signatures: updatedSignatures,
          status: newStatus,
          isMobileExecuted: true,
          executedAt: isFullyExecuted ? new Date() : doc.executedAt,
        })
        .where(eq(signedDocuments.id, doc.id))
        .returning();

      return NextResponse.json({ success: true, document: updated[0] });
    }

    if (action === 'delete_document') {
      await db.delete(signedDocuments).where(eq(signedDocuments.id, Number(body.id)));
      return NextResponse.json({ success: true });
    }

    if (action === 'search_live_listings') {
      const { query } = body as { query?: string };
      const results = searchLiveProperties(query || '');
      return NextResponse.json({ success: true, query: query || '', results });
    }

    if (action === 'create_client') {
      const inserted = await db
        .insert(clientRelationships)
        .values({
          name: body.name,
          email: body.email,
          phone: body.phone,
          relationshipType: body.relationshipType || 'past_buyer',
          homeAddress: body.homeAddress || '',
          homePurchaseDate: body.homePurchaseDate || '',
          purchasePrice: body.purchasePrice || '',
          birthday: body.birthday || '',
          preferredChannel: body.preferredChannel || 'email_sms',
          tags: body.tags || [],
          notes: body.notes || '',
          lastTouchAt: 'Added to Client Directory',
          autoPilotFollowups: body.autoPilotFollowups ?? true,
        })
        .returning();
      return NextResponse.json({ success: true, client: inserted[0] });
    }

    if (action === 'update_client') {
      const updated = await db
        .update(clientRelationships)
        .set({
          name: body.name,
          email: body.email,
          phone: body.phone,
          relationshipType: body.relationshipType,
          homeAddress: body.homeAddress,
          homePurchaseDate: body.homePurchaseDate,
          purchasePrice: body.purchasePrice,
          birthday: body.birthday,
          tags: body.tags,
          notes: body.notes,
          lastTouchAt: body.lastTouchAt || 'Updated Recently',
          autoPilotFollowups: body.autoPilotFollowups,
        })
        .where(eq(clientRelationships.id, Number(body.id)))
        .returning();
      return NextResponse.json({ success: true, client: updated[0] });
    }

    if (action === 'delete_client') {
      await db
        .delete(clientRelationships)
        .where(eq(clientRelationships.id, Number(body.id)));
      return NextResponse.json({ success: true });
    }

    if (action === 'create_holiday_campaign') {
      const inserted = await db
        .insert(holidayCampaigns)
        .values({
          eventName: body.eventName,
          triggerType: body.triggerType || 'holiday',
          scheduledDate: body.scheduledDate,
          audienceSegment: body.audienceSegment || 'all_clients',
          subject: body.subject,
          emailBody: body.emailBody,
          senderName: 'Melissa Hatfield',
          senderBrokerage: 'John L. Scott Real Estate',
          senderPhone: '(253) 514-7676',
          status: body.status || 'scheduled',
          sentCount: 0,
          openRate: 'N/A',
          isAutoPilot: body.isAutoPilot ?? true,
        })
        .returning();
      return NextResponse.json({ success: true, campaign: inserted[0] });
    }

    if (action === 'send_holiday_now') {
      const { campaignId } = body;
      const cRows = await db
        .select()
        .from(holidayCampaigns)
        .where(eq(holidayCampaigns.id, Number(campaignId)));
      const campaign = cRows[0];
      if (!campaign) {
        return NextResponse.json({ error: 'Campaign not found.' }, { status: 404 });
      }

      const allClients = await db.select().from(clientRelationships);
      const targets = allClients.filter((client) => client.email);
      const provider = await sendRealEmail(
        targets.map((client) => client.email),
        campaign.subject,
        campaign.emailBody
      );
      const updated = await db
        .update(holidayCampaigns)
        .set({ status: 'sent', sentCount: targets.length, openRate: 'Pending provider webhook' })
        .where(eq(holidayCampaigns.id, campaign.id))
        .returning();

      return NextResponse.json({
        success: true,
        campaign: updated[0],
        providerId: provider.id,
        message: `Resend accepted the holiday email for ${targets.length} real recipient(s).`,
      });
    }

    if (action === 'toggle_holiday_autopilot') {
      const { campaignId, isAutoPilot } = body;
      const updated = await db
        .update(holidayCampaigns)
        .set({ isAutoPilot: Boolean(isAutoPilot) })
        .where(eq(holidayCampaigns.id, Number(campaignId)))
        .returning();
      return NextResponse.json({ success: true, campaign: updated[0] });
    }

    if (action === 'dispatch_mass_email') {
      const { title, subject, bodyContent, targetGroup, templateType } = body;
      const allClients = await db.select().from(clientRelationships);
      const targets = allClients.filter((client) => {
        if (!client.email) return false;
        if (targetGroup === 'past_buyers') return client.relationshipType === 'past_buyer';
        if (targetGroup === 'vip_investors') return client.relationshipType === 'vip_investor';
        if (targetGroup === 'active_leads') return client.relationshipType === 'active_buyer';
        return true;
      });

      const provider = await sendRealEmail(
        targets.map((client) => client.email),
        subject,
        bodyContent
      );
      const inserted = await db
        .insert(massEmails)
        .values({
          title,
          subject,
          bodyContent,
          targetGroup: targetGroup || 'all_clients',
          recipientCount: targets.length,
          status: 'sent',
          templateType: templateType || 'newsletter',
          metrics: { opens: 0, clicks: 0, replies: 0 },
          sentAt: new Date().toISOString(),
        })
        .returning();

      return NextResponse.json({
        success: true,
        massEmail: inserted[0],
        providerId: provider.id,
        message: `Resend accepted the broadcast for ${targets.length} real recipient(s).`,
      });
    }

    if (action === 'create_ai_memory_node') {
      const inserted = await db
        .insert(aiMemoryNodes)
        .values({
          category: body.category || 'market_insight',
          keyTitle: body.keyTitle,
          insight: body.insight,
          confidenceScore: body.confidenceScore || 96,
          timesApplied: 1,
        })
        .returning();
      return NextResponse.json({ success: true, memoryNode: inserted[0] });
    }

    if (action === 'mark_email_read') {
      const { emailId } = body;
      const updated = await db
        .update(agentEmails)
        .set({ isRead: true })
        .where(eq(agentEmails.id, Number(emailId)))
        .returning();
      return NextResponse.json({ success: true, email: updated[0] });
    }

    if (action === 'send_ai_reply') {
      const { emailId, replyText } = body;
      const rows = await db
        .select()
        .from(agentEmails)
        .where(eq(agentEmails.id, Number(emailId)));
      const email = rows[0];
      if (!email) return NextResponse.json({ error: 'Email record not found.' }, { status: 404 });

      const provider = await sendRealEmail(
        [email.senderEmail],
        `Re: ${email.subject}`,
        String(replyText || '')
      );
      const updated = await db
        .update(agentEmails)
        .set({ isRead: true })
        .where(eq(agentEmails.id, email.id))
        .returning();

      return NextResponse.json({
        success: true,
        message: `Resend accepted the reply to ${email.senderName}.`,
        providerId: provider.id,
        email: updated[0],
      });
    }

    if (action === 'add_earning_record') {
      const salePrice = Number(body.salePriceNumber) || 500000;
      const ratePct = Number(body.commissionRatePct?.replace('%', '')) || 2.5;
      const gross = Math.round(salePrice * (ratePct / 100));
      const net = Math.round(gross * 0.8); // 80/20 split

      const inserted = await db
        .insert(agentEarnings)
        .values({
          dealTitle: body.dealTitle,
          propertyAddress: body.propertyAddress,
          clientName: body.clientName,
          clientRole: body.clientRole || 'seller',
          salePriceNumber: salePrice,
          salePriceFormatted: body.salePriceFormatted || `$${salePrice.toLocaleString()}`,
          commissionRatePct: `${ratePct}%`,
          grossCommission: gross,
          netAgentPayout: net,
          status: body.status || 'closed',
          closeDate: body.closeDate || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          payoutDate: body.payoutDate || 'Wire Received',
          brokerSplitRatio: '80/20 John L. Scott Split',
          notes: body.notes || 'Recorded in Melissa Hatfield Financial Ledger.',
        })
        .returning();
      return NextResponse.json({ success: true, earning: inserted[0] });
    }

    if (action === 'delete_earning_record') {
      await db.delete(agentEarnings).where(eq(agentEarnings.id, Number(body.id)));
      return NextResponse.json({ success: true });
    }

    // ========================================================
    // CONVERSIONS API (CAPI) & META PIXEL DISPATCH
    // ========================================================
    if (action === 'send_to_meta_capi') {
      const {
        leadId,
        buyerName,
        buyerEmail,
        buyerPhone,
        qualityRating,
        qualityScore,
        agentFeedback,
        estimatedDealValue,
      } = body;

      let metaResponse;
      try {
        metaResponse = await sendLeadToMetaPixelCapi({
          eventName: qualityScore >= 95 ? 'HighQualityLead' : 'QualifiedLead',
          email: buyerEmail,
          phone: buyerPhone,
          name: buyerName,
          value: Number(estimatedDealValue) || 0,
          qualityRating: qualityRating || 'high_quality',
          qualityScore: Number(qualityScore) || 0,
          agentFeedback: agentFeedback || 'Verified by agent Melissa Hatfield',
        });
      } catch (error) {
        return NextResponse.json(
          { error: error instanceof Error ? error.message : 'Meta CAPI request failed.' },
          { status: 503 }
        );
      }

      const insertedEvent = await db
        .insert(metaCapiEvents)
        .values({
          leadId: leadId ? Number(leadId) : null,
          buyerName,
          buyerEmail,
          buyerPhone,
          eventName: qualityScore >= 95 ? 'HighQualityLead' : 'QualifiedLead',
          qualityRating: qualityRating || 'high_quality',
          qualityScore: Number(qualityScore) || 0,
          agentFeedback: agentFeedback || 'Qualified by agent review',
          estimatedDealValue: Number(estimatedDealValue) || 0,
          currency: 'USD',
          pixelId: metaResponse.pixelId,
          eventId: metaResponse.eventId,
          metaApiStatus: metaResponse.status,
          fbEventResponse: {
            fbtrace_id: metaResponse.fbTraceId,
            events_received: metaResponse.eventsReceived,
            message: metaResponse.message,
          },
        })
        .returning();

      // Log AI memory node to train algorithm
      await db.insert(aiMemoryNodes).values({
        category: 'client_preference',
        keyTitle: `Meta Pixel Trained: ${buyerName} (Score ${qualityScore}/100)`,
        insight: `Feedback relayed via Conversions API. Pixel ${metaResponse.pixelId} now actively seeking lookalike buyers in Pierce & King County matching ${buyerName}'s liquidity profile.`,
        confidenceScore: 99,
        timesApplied: 1,
      });

      return NextResponse.json({
        success: true,
        capiEvent: insertedEvent[0],
        metaResponse,
        message: metaResponse.message,
      });
    }

    // ========================================================
    // AI VOICE DIALER CAMPAIGNS & CALL APPOINTMENT BOOKING
    // ========================================================
    if (action === 'create_dialer_campaign') {
      const inserted = await db
        .insert(aiDialerCampaigns)
        .values({
          campaignName: body.campaignName,
          targetAudience: body.targetAudience || 'new_zillow_leads',
          scheduledDays: body.scheduledDays || ['Tuesday', 'Thursday'],
          timeWindow: body.timeWindow || '10:00 AM - 12:30 PM & 4:30 PM - 7:00 PM',
          dialerSpeed: body.dialerSpeed || 'smart_adaptive',
          voicePersona: body.voicePersona || 'Melissa Hatfield Real Estate Concierge',
          callObjective: body.callObjective || 'book_showing_or_consultation',
          status: 'active',
          callsPlacedCount: 0,
          answeredCount: 0,
          appointmentsBookedCount: 0,
          lastRunAt: 'Scheduled next execution window',
        })
        .returning();
      return NextResponse.json({ success: true, campaign: inserted[0] });
    }

    if (action === 'run_dialer_wave') {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const fromNumber = process.env.TWILIO_PHONE_NUMBER;
      const appUrl = process.env.NEXT_PUBLIC_APP_URL;

      if (!accountSid || !authToken || !fromNumber || !appUrl) {
        return NextResponse.json(
          {
            error:
              'Live dialing is not configured. Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, and NEXT_PUBLIC_APP_URL.',
          },
          { status: 503 }
        );
      }

      const { dialerCampaignId, selectedDay } = body;
      const cRows = await db
        .select()
        .from(aiDialerCampaigns)
        .where(eq(aiDialerCampaigns.id, Number(dialerCampaignId)));
      if (cRows.length === 0) {
        return NextResponse.json({ error: 'Dialer campaign not found.' }, { status: 404 });
      }

      const callableLeads = (await db.select().from(leads)).filter(
        (lead) => lead.buyerPhone && lead.buyerPhone.replace(/\D/g, '').length >= 10
      );
      if (callableLeads.length === 0) {
        return NextResponse.json(
          { error: 'No opted-in leads with valid phone numbers are available.' },
          { status: 400 }
        );
      }

      const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
      let acceptedCalls = 0;
      const failures: string[] = [];

      for (const lead of callableLeads.slice(0, 20)) {
        const form = new URLSearchParams({
          To: lead.buyerPhone,
          From: fromNumber,
          Url: `${appUrl.replace(/\/$/, '')}/api/voice/dialer?leadId=${lead.id}`,
          StatusCallback: `${appUrl.replace(/\/$/, '')}/api/voice/dialer/status?leadId=${lead.id}&campaignId=${dialerCampaignId}`,
          StatusCallbackEvent: 'initiated ringing answered completed',
        });
        const response = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`,
          {
            method: 'POST',
            headers: {
              Authorization: `Basic ${credentials}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: form,
          }
        );
        if (response.ok) acceptedCalls += 1;
        else failures.push(`${lead.buyerName}: ${response.status}`);
      }

      const camp = cRows[0];
      const updatedCamp = await db
        .update(aiDialerCampaigns)
        .set({
          callsPlacedCount: camp.callsPlacedCount + acceptedCalls,
          lastRunAt: `${new Date().toLocaleString()} · ${selectedDay || 'manual run'} · Twilio accepted ${acceptedCalls} calls`,
        })
        .where(eq(aiDialerCampaigns.id, camp.id))
        .returning();

      return NextResponse.json({
        success: true,
        campaign: updatedCamp[0],
        acceptedCalls,
        failures,
        message: `Twilio accepted ${acceptedCalls} real outbound call(s). Appointment counts update only from provider callbacks.`,
      });
    }

    if (action === 'delete_dialer_campaign') {
      await db.delete(aiDialerCampaigns).where(eq(aiDialerCampaigns.id, Number(body.id)));
      return NextResponse.json({ success: true });
    }

    if (action === 'delete_booked_appointment') {
      await db.delete(bookedAppointments).where(eq(bookedAppointments.id, Number(body.id)));
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Error in POST /api/swarm:', error);
    return NextResponse.json(
      { error: 'Failed to process swarm action' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    if (!(await hasWorkspaceAccess(request))) {
      return NextResponse.json({ error: 'Active subscription required.' }, { status: 401 });
    }
    const body = await request.json();

    if (body.kind === 'campaign_pulse') {
      return NextResponse.json(
        {
          error:
            'Simulated campaign metrics are disabled. Connect delivery-platform webhooks before updating impressions, opens, leads, or offers.',
        },
        { status: 503 }
      );
    }

    const { transferId, status } = body;
    const updated = await db
      .update(callTransfers)
      .set({ transferStatus: status })
      .where(eq(callTransfers.id, Number(transferId)))
      .returning();

    if (status === 'closed_deal' && updated.length > 0) {
      await db
        .update(leads)
        .set({ stage: 'transferred_closed', lastContactedAt: 'Deal Finalized by Agent' })
        .where(eq(leads.id, updated[0].leadId));
    }

    return NextResponse.json({ success: true, transfer: updated[0] });
  } catch (error) {
    console.error('Error in PATCH /api/swarm:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
