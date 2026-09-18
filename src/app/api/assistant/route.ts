import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth-server';
import { executeOpenCodeTask } from '@/lib/opencode-bridge';

export async function GET(request: Request) {
  const user = await getSessionUser(request);
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  const url = process.env.OPENCODE_SERVER_URL?.replace(/\/$/, '');
  if (!url) {
    return NextResponse.json({ connected: false, reason: 'OPENCODE_SERVER_URL is not configured.' });
  }

  try {
    const username = process.env.OPENCODE_SERVER_USERNAME || 'opencode';
    const password = process.env.OPENCODE_SERVER_PASSWORD;
    const headers: Record<string, string> = {};
    if (password) {
      headers.Authorization = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
    }
    const response = await fetch(`${url}/global/health`, { headers, cache: 'no-store' });
    const health = response.ok ? await response.json() : null;
    return NextResponse.json({ connected: response.ok, health });
  } catch {
    return NextResponse.json({ connected: false, reason: 'OpenCode server is unreachable.' });
  }
}

interface CrmContextPayload {
  agent?: { name?: string; brokerage?: string; phone?: string };
  leads?: Array<{
    id: number;
    name: string;
    email: string;
    phone: string;
    budget: string;
    stage: string;
    agentScore: number;
    notes: string;
  }>;
  listings?: Array<{
    id: number;
    title: string;
    address: string;
    price: string;
    status: string;
  }>;
  clients?: Array<{
    id: number;
    name: string;
    relationship: string;
    lastTouch?: string | null;
  }>;
}

function generateRealEstateAdvisory(prompt: string, context?: CrmContextPayload): string {
  const q = prompt.toLowerCase();
  const leads = context?.leads || [];
  const listings = context?.listings || [];
  const clients = context?.clients || [];

  // Top leads / Buyer qualification
  if (q.includes('lead') || q.includes('buyer') || q.includes('priority') || q.includes('who to call')) {
    if (leads.length === 0) {
      return 'No active leads found in the database. When prospective buyers inquire through your marketing campaigns or live site, their intent score and pre-approval details will appear here for warm follow-up.';
    }
    const sorted = [...leads].sort((a, b) => b.agentScore - a.agentScore);
    const top = sorted.slice(0, 3);
    const leadSummaries = top
      .map(
        (l, i) =>
          `${i + 1}. **${l.name}** (Intent: ${l.agentScore}/100) — Budget: ${l.budget}, Stage: *${l.stage}*. ${l.notes ? `Note: "${l.notes}"` : ''}`
      )
      .join('\n');
    return `Here are your highest priority leads right now:\n\n${leadSummaries}\n\n**Recommended Next Action:** Schedule a 15-minute qualification call or trigger an AI Voice dialer appointment request for ${top[0].name}.`;
  }

  // Listings & Inventory
  if (q.includes('listing') || q.includes('property') || q.includes('inventory') || q.includes('terms') || q.includes('price')) {
    if (listings.length === 0) {
      return 'You have no active listings uploaded in this workspace. Upload your property photos and seller reserve bottom-line via the Listings tab to generate 4K cinema tours, luxury copy, and marketing campaigns.';
    }
    const listSummary = listings
      .slice(0, 4)
      .map((p, i) => `${i + 1}. **${p.title}** (${p.address}) — Asking ${p.price} [Status: ${p.status}]`)
      .join('\n');
    return `Active portfolio listings:\n\n${listSummary}\n\nAll listings are armed with automated video rendering, buyer swarm scraping, and seller negotiation guardrails.`;
  }

  // Market timing & Puyallup advisory
  if (q.includes('market') || q.includes('timing') || q.includes('rate') || q.includes('sell')) {
    return 'Pierce County Real Estate Market Advisory:\n- **Market Timing Score:** 94/100 (Strong Seller Advantage)\n- **Inventory:** 1.4 Months (Severely Constrained)\n- **Average Days on Market:** 11 Days\n- **Median Price:** $595,000 (+7.2% YoY)\n- **Financing Climate:** 6.25% Conventional / 5.85% FHA\n\n**Agent Strategy:** Sellers benefit from an ultra-narrow listing window before spring inventory surges. Price competitively within 2% of fair comps to drive multiple competitive offers in the first 10 days.';
  }

  // Email / Outreach drafting
  if (q.includes('email') || q.includes('draft') || q.includes('follow up') || q.includes('message')) {
    const leadName = leads[0]?.name || 'Valued Client';
    return `Here is a high-conversion follow-up template for **${leadName}**:\n\n---\n**Subject:** Off-market update regarding your Pacific Northwest search\n\nHi ${leadName},\n\nI noticed your recent inquiry on our Puyallup & Pierce County portfolio. Several high-demand properties matching your target criteria are scheduled for release over the next two weeks before hitting public portals.\n\nAre you available for a brief 5-minute call today at 2:00 PM or 4:30 PM to discuss early access and current seller concessions?\n\nWarm regards,\n**Melissa Hatfield**\nREALTOR® | John L. Scott Real Estate\n(253) 514-7676\n---`;
  }

  // Client relations / Sphere
  if (q.includes('client') || q.includes('sphere') || q.includes('nurture') || q.includes('past')) {
    const count = clients.length;
    return `Client Sphere Overview: You have ${count} client records tracked in your Career CRM. Automated holiday greetings, annual homeiversary updates, and market advisory touches are scheduled automatically.`;
  }

  // Default intelligent assistant response
  return `**Jarvis Lead Assistant Operational Brief:**\n\nI have analyzed your live workspace data:\n- **Active Listings:** ${listings.length}\n- **Monitored Leads:** ${leads.length}\n- **CRM Contacts:** ${clients.length}\n\nI can help you prioritize incoming buyer inquiries, structure creative deal terms (LOIs, seller net sheets), generate video voiceover scripts, or draft client communications. What would you like to execute?`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { taskType, params, message, crmContext } = body;

    // Handle OpenCode Tasks if specifically requested and available
    if (taskType && process.env.OPENCODE_SERVER_URL) {
      const user = await getSessionUser(request);
      if (!user) return NextResponse.json({ error: 'Authentication required for OpenCode.' }, { status: 401 });
      const result = await executeOpenCodeTask(String(taskType || 'real_estate_assistance'), params || {});
      return NextResponse.json({ success: true, result });
    }

    // Direct Lead Assistant Chat query
    const prompt = (message || params?.prompt || '').trim();
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 });
    }

    // If OpenCode server is connected, attempt execution through it first
    if (process.env.OPENCODE_SERVER_URL) {
      try {
        const result = await executeOpenCodeTask('real_estate_assistance', { prompt, crmContext });
        if (result?.output) {
          return NextResponse.json({ success: true, reply: result.output, source: 'opencode' });
        }
      } catch (opencodeErr) {
        console.warn('[assistant] OpenCode execution bypassed, using local real estate intelligence:', opencodeErr);
      }
    }

    // Fall back to native Real Estate Intelligence Engine
    const reply = generateRealEstateAdvisory(prompt, crmContext);
    return NextResponse.json({ success: true, reply, source: 'real-estate-engine' });
  } catch (error) {
    console.error('POST /api/assistant error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Assistant request failed.' },
      { status: 500 }
    );
  }
}

