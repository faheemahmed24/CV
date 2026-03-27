import { auth0 } from '@/lib/auth0';
import { NextResponse } from 'next/server';

// This is a mock database for now. In a real Cloudflare D1 environment,
// you would use `process.env.DB` to access your D1 binding.
// Example: const db = process.env.DB;

export async function GET() {
  const session = await auth0.getSession();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Mock fetching from D1
  // const { results } = await db.prepare('SELECT * FROM resumes WHERE userId = ? ORDER BY updatedAt DESC').bind(session.user.sub).all();
  
  return NextResponse.json([]);
}

export async function POST(req: Request) {
  const session = await auth0.getSession();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { id, name, data } = body;

  // Mock saving to D1
  /*
  await db.prepare('INSERT OR REPLACE INTO resumes (id, userId, name, data, updatedAt) VALUES (?, ?, ?, ?, ?)')
    .bind(id, session.user.sub, name, JSON.stringify(data), new Date().toISOString())
    .run();
  */

  return NextResponse.json({ success: true });
}
