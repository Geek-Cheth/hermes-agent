import { getRun } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const run = await getRun(params.id);

  if (!run?.landing_html) {
    return new Response('Landing page not found', { status: 404 });
  }

  return new Response(run.landing_html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
