import { addWaitlistEntry } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

async function parseBody(request: NextRequest): Promise<{
  email: string;
  source?: string;
  runId?: string;
}> {
  const contentType = request.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    const body = await request.json();
    return {
      email: typeof body.email === 'string' ? body.email : '',
      source: typeof body.source === 'string' ? body.source : undefined,
      runId:
        typeof body.run_id === 'string'
          ? body.run_id
          : typeof body.runId === 'string'
            ? body.runId
            : undefined,
    };
  }

  if (
    contentType.includes('application/x-www-form-urlencoded') ||
    contentType.includes('multipart/form-data')
  ) {
    const form = await request.formData();
    const email = form.get('email');
    const source = form.get('source');
    const runId = form.get('run_id') ?? form.get('runId');
    return {
      email: typeof email === 'string' ? email : '',
      source: typeof source === 'string' ? source : undefined,
      runId: typeof runId === 'string' ? runId : undefined,
    };
  }

  try {
    const body = await request.json();
    return {
      email: typeof body.email === 'string' ? body.email : '',
      source: typeof body.source === 'string' ? body.source : undefined,
      runId: typeof body.run_id === 'string' ? body.run_id : undefined,
    };
  } catch {
    return { email: '' };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, source, runId } = await parseBody(request);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      const isForm = (request.headers.get('content-type') ?? '').includes(
        'form'
      );
      if (isForm) {
        return new NextResponse(
          '<html><body><p>Valid email is required.</p></body></html>',
          { status: 400, headers: { 'Content-Type': 'text/html' } }
        );
      }
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    await addWaitlistEntry(email, source, runId);

    const isForm = (request.headers.get('content-type') ?? '').includes('form');
    if (isForm) {
      return new NextResponse(
        '<html><body style="font-family:sans-serif;text-align:center;padding:48px;background:#0a0a0a;color:#fafafa"><h1>You\'re on the list!</h1><p>Thanks for joining the waitlist.</p></body></html>',
        { status: 200, headers: { 'Content-Type': 'text/html' } }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to join waitlist';
    const status = message.includes('already') ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
