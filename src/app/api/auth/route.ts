import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, sessions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import {
  hashPassword,
  verifyPassword,
  generateToken,
  getSessionUser,
  ensureSeededAuth,
} from '@/lib/auth-server';

function setSessionCookie(res: NextResponse, token: string) {
  res.cookies.set('personal_session', token, {
    httpOnly: true,
    path: '/',
    maxAge: 30 * 24 * 60 * 60,
    sameSite: 'lax',
  });
  return res;
}

export async function GET(request: Request) {
  try {
    await ensureSeededAuth();
    const user = await getSessionUser(request);
    return NextResponse.json({ user });
  } catch (error) {
    console.error('GET /api/auth error:', error);
    return NextResponse.json({ user: null });
  }
}

export async function POST(request: Request) {
  try {
    await ensureSeededAuth();
    const body = await request.json();
    const { action } = body;

    if (action === 'register') {
      const { name, email, password } = body as {
        name: string;
        email: string;
        password: string;
      };
      if (!name?.trim() || !email?.trim() || !password || password.length < 6) {
        return NextResponse.json(
          { error: 'Name, valid email and 6+ character password required.' },
          { status: 400 }
        );
      }
      const normalizedEmail = email.trim().toLowerCase();
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.email, normalizedEmail));
      if (existing.length > 0) {
        return NextResponse.json(
          { error: 'An account with this email already exists. Please log in.' },
          { status: 400 }
        );
      }
      const created = await db
        .insert(users)
        .values({
          name: name.trim(),
          email: normalizedEmail,
          passwordHash: hashPassword(password),
          role: 'agent',
        })
        .returning();
      const user = created[0];
      const token = generateToken();
      await db.insert(sessions).values({
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
      const res = NextResponse.json({
        success: true,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      });
      return setSessionCookie(res, token);
    }

    if (action === 'login') {
      const { email, password } = body as { email: string; password: string };
      if (!email?.trim() || !password) {
        return NextResponse.json(
          { error: 'Email and password required.' },
          { status: 400 }
        );
      }
      const normalizedEmail = email.trim().toLowerCase();
      const rows = await db
        .select()
        .from(users)
        .where(eq(users.email, normalizedEmail));
      if (rows.length === 0) {
        return NextResponse.json(
          { error: 'No account found for this email.' },
          { status: 401 }
        );
      }
      const user = rows[0];
      if (!verifyPassword(password, user.passwordHash)) {
        return NextResponse.json(
          { error: 'Incorrect password.' },
          { status: 401 }
        );
      }
      const token = generateToken();
      await db.insert(sessions).values({
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
      const res = NextResponse.json({
        success: true,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      });
      return setSessionCookie(res, token);
    }

    if (action === 'logout') {
      const cookieHeader = request.headers.get('cookie') || '';
      const match = cookieHeader.match(/personal_session=([^;]+)/);
      if (match?.[1]) {
        await db.delete(sessions).where(eq(sessions.token, match[1]));
      }
      const res = NextResponse.json({ success: true });
      res.cookies.set('personal_session', '', { path: '/', maxAge: 0 });
      return res;
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('POST /api/auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed.' },
      { status: 500 }
    );
  }
}
