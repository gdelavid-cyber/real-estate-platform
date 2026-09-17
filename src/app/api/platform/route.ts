import { NextResponse } from 'next/server';
import { db } from '@/db';
import {
  platformSettings,
  subscriptions,
  users,
} from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getSessionUser, ensureSeededAuth } from '@/lib/auth-server';

async function ensureSettings() {
  const rows = await db.select().from(platformSettings);
  if (rows.length === 0) {
    const created = await db
      .insert(platformSettings)
      .values({
        monetizationEnabled: false,
        starterPrice: '$97',
        proPrice: '$297',
        elitePrice: '$697',
      })
      .returning();
    return created[0];
  }
  return rows[0];
}

function priceToNumber(price: string): number {
  const n = parseFloat(price.replace(/[^0-9.]/g, ''));
  return isNaN(n) ? 0 : n;
}

export async function GET(request: Request) {
  try {
    await ensureSeededAuth();
    const settings = await ensureSettings();
    const user = await getSessionUser(request);

    let mySubscription: (typeof subscriptions.$inferSelect) | null = null;
    if (user) {
      const subs = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, user.id))
        .orderBy(desc(subscriptions.id));
      const active = subs.find((s) => s.status === 'active');
      mySubscription = active || subs[0] || null;
    }

    // Admin-only data
    let adminData: {
      users: { id: number; name: string; email: string; role: string; createdAt: Date | null }[];
      subscriptions: (typeof subscriptions.$inferSelect)[];
      mrr: number;
      totalRevenue: number;
      activeCount: number;
    } | null = null;

    if (user?.role === 'admin') {
      const allUsers = await db.select().from(users).orderBy(desc(users.id));
      const allSubs = await db
        .select()
        .from(subscriptions)
        .orderBy(desc(subscriptions.id));
      const activeSubs = allSubs.filter((s) => s.status === 'active');
      const mrr = activeSubs.reduce((sum, s) => sum + priceToNumber(s.amount), 0);
      adminData = {
        users: allUsers.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          createdAt: u.createdAt,
        })),
        subscriptions: allSubs,
        mrr,
        totalRevenue: mrr,
        activeCount: activeSubs.length,
      };
    }

    return NextResponse.json({
      settings: {
        monetizationEnabled: settings.monetizationEnabled,
        starterPrice: settings.starterPrice,
        proPrice: settings.proPrice,
        elitePrice: settings.elitePrice,
      },
      mySubscription,
      adminData,
    });
  } catch (error) {
    console.error('GET /api/platform error:', error);
    return NextResponse.json(
      { error: 'Failed to load platform data' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await ensureSeededAuth();
    await ensureSettings();
    const user = await getSessionUser(request);
    const body = await request.json();
    const { action } = body;

    if (action === 'toggle_monetization') {
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Admin only.' }, { status: 403 });
      }
      const { enabled } = body as { enabled: boolean };
      const rows = await db.select().from(platformSettings);
      await db
        .update(platformSettings)
        .set({ monetizationEnabled: !!enabled, updatedAt: new Date() })
        .where(eq(platformSettings.id, rows[0].id));
      return NextResponse.json({ success: true, monetizationEnabled: !!enabled });
    }

    if (action === 'update_pricing') {
      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Admin only.' }, { status: 403 });
      }
      const { starterPrice, proPrice, elitePrice } = body as {
        starterPrice: string;
        proPrice: string;
        elitePrice: string;
      };
      const rows = await db.select().from(platformSettings);
      await db
        .update(platformSettings)
        .set({
          starterPrice: starterPrice || '$97',
          proPrice: proPrice || '$297',
          elitePrice: elitePrice || '$697',
          updatedAt: new Date(),
        })
        .where(eq(platformSettings.id, rows[0].id));
      return NextResponse.json({ success: true });
    }

    if (action === 'subscribe') {
      return NextResponse.json(
        {
          error:
            'Billing is not configured. Connect Stripe Checkout and verified Stripe webhooks before accepting subscriptions.',
        },
        { status: 503 }
      );
    }

    if (action === 'cancel_subscription') {
      if (!user) {
        return NextResponse.json({ error: 'Not logged in.' }, { status: 401 });
      }
      const existing = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, user.id));
      for (const sub of existing) {
        if (sub.status === 'active') {
          await db
            .update(subscriptions)
            .set({ status: 'canceled' })
            .where(eq(subscriptions.id, sub.id));
        }
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('POST /api/platform error:', error);
    return NextResponse.json(
      { error: 'Platform action failed.' },
      { status: 500 }
    );
  }
}
