import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { listRunsByUser } from '@/lib/supabase';
import { Navbar } from '@/components/Navbar';
import { RunHistoryList } from '@/components/RunHistoryList';
import { Run } from '@/lib/types';

export default async function HistoryPage() {
  const { userId } = await auth();
  if (!userId) return null;

  let runs: Run[] = [];
  let error: string | null = null;

  try {
    runs = await listRunsByUser(userId);
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load history';
  }

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[40px] font-bold leading-[48px] tracking-[-0.5px] mb-1">History</h1>
            <p className="text-[#71717a]">Your past agent runs</p>
          </div>
          <Link
            href="/"
            className="bg-white text-black px-5 py-2 rounded-full text-sm font-semibold tracking-[-0.04px] hover:bg-zinc-200 transition-colors"
          >
            New run
          </Link>
        </div>

        {error && (
          <p className="text-red-400 bg-red-950/30 border border-red-900/50 rounded-lg p-4 mb-6">
            {error}
          </p>
        )}

        {!error && <RunHistoryList initialRuns={runs} />}
      </main>
    </>
  );
}
