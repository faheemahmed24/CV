import { auth0 } from '@/lib/auth0';
import { NextResponse } from 'next/server';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth0.getSession();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  // Mock deleting from D1
  // await db.prepare('DELETE FROM resumes WHERE id = ? AND userId = ?').bind(id, session.user.sub).run();

  return NextResponse.json({ success: true });
}
