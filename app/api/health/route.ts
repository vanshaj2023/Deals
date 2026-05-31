import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongoose';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDB();
    return NextResponse.json({ ok: true, db: 'connected', ts: new Date().toISOString() });
  } catch {
    return NextResponse.json({ ok: false, db: 'error' }, { status: 503 });
  }
}
