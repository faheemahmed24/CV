import { auth0, isAuth0Configured } from '@/lib/auth0';
import { NextResponse } from 'next/server';

export const GET = (req: Request) => {
  if (!isAuth0Configured) {
    return NextResponse.json({ error: 'Auth0 is not configured' }, { status: 500 });
  }
  return auth0.middleware(req);
};

export const POST = (req: Request) => {
  if (!isAuth0Configured) {
    return NextResponse.json({ error: 'Auth0 is not configured' }, { status: 500 });
  }
  return auth0.middleware(req);
};
