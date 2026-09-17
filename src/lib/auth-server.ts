import crypto from 'crypto';
import { db } from '@/db';
import { users, sessions } from '@/db/schema';
import { eq } from 'drizzle-orm';

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
    .toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(':');
    if (!salt || !hash) return false;
    const check = crypto
      .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
      .toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(check));
  } catch {
    return false;
  }
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function getTokenFromCookieHeader(
  cookieHeader: string | null
): string | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(';').map((p) => p.trim());
  for (const part of parts) {
    if (part.startsWith('personal_session=')) {
      return part.slice('personal_session='.length);
    }
  }
  return null;
}

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export async function getSessionUser(
  request: Request
): Promise<SessionUser | null> {
  const token = getTokenFromCookieHeader(request.headers.get('cookie'));
  if (!token) return null;
  const rows = await db
    .select()
    .from(sessions)
    .where(eq(sessions.token, token));
  if (rows.length === 0) return null;
  const session = rows[0];
  if (new Date(session.expiresAt) < new Date()) {
    await db.delete(sessions).where(eq(sessions.token, token));
    return null;
  }
  const userRows = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userId));
  if (userRows.length === 0) return null;
  const u = userRows[0];
  return { id: u.id, name: u.name, email: u.email, role: u.role };
}

/**
 * Seeds the owner account on first run.
 *
 * In production the password MUST come from ADMIN_PASSWORD — if it is missing
 * we skip seeding entirely rather than falling back to a known default, so a
 * weak credential can never be created on a live deployment.
 */
export async function ensureSeededAuth() {
  const existing = await db.select().from(users);
  if (existing.length > 0) return;

  const adminEmail = process.env.ADMIN_EMAIL ?? 'melissafh@johnlscott.com';
  const adminPassword =
    process.env.NODE_ENV === 'production'
      ? process.env.ADMIN_PASSWORD
      : process.env.ADMIN_PASSWORD ?? 'admin123';

  if (!adminPassword) {
    console.warn(
      '[auth] ADMIN_PASSWORD is not set — skipping owner seed. ' +
        'Set ADMIN_EMAIL and ADMIN_PASSWORD to create your login.'
    );
    return;
  }

  // onConflictDoNothing guards against duplicate admins when concurrent
  // requests hit this seeder at the same time.
  await db
    .insert(users)
    .values({
      name: 'Melissa Hatfield',
      email: adminEmail,
      passwordHash: hashPassword(adminPassword),
      role: 'admin',
    })
    .onConflictDoNothing();
}
