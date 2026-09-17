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

export async function POST(request: Request) {
  const user = await getSessionUser(request);
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  try {
    const { taskType, params } = await request.json();
    const result = await executeOpenCodeTask(String(taskType || 'real_estate_assistance'), params || {});
    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'OpenCode task failed.' },
      { status: 503 }
    );
  }
}
