import { auth0 } from '@/lib/auth0';
import { NextResponse } from 'next/server';

// Cloudflare D1 binding
const getDb = () => {
  // @ts-ignore - DB is injected by Cloudflare at runtime
  return process.env.DB;
};

export async function GET() {
  const session = await auth0.getSession();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  if (!db) {
    console.warn('⚠️ Cloudflare D1 (DB) is not configured. Returning empty list.');
    return NextResponse.json([]);
  }

  try {
    const { results } = await db.prepare('SELECT * FROM resumes WHERE userId = ? ORDER BY updatedAt DESC')
      .bind(session.user.sub)
      .all();
    
    return NextResponse.json(results || []);
  } catch (error) {
    console.error('❌ Error fetching from D1:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth0.getSession();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  if (!db) {
    console.warn('⚠️ Cloudflare D1 (DB) is not configured. Save skipped.');
    return NextResponse.json({ success: true, message: 'DB not configured, data not saved' });
  }

  try {
    const body = await req.json();
    const { id, name, data } = body;

    if (!id || !name || !data) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await db.prepare('INSERT OR REPLACE INTO resumes (id, userId, name, data, updatedAt) VALUES (?, ?, ?, ?, ?)')
      .bind(id, session.user.sub, name, JSON.stringify(data), new Date().toISOString())
      .run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error saving to D1:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
