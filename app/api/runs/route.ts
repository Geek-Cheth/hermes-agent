import { auth } from '@clerk/nextjs/server';
import { listRunsByUser } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const runs = await listRunsByUser(userId);
    return NextResponse.json({ runs });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to list runs';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
