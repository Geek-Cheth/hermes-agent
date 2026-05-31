'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Run } from '@/lib/types';

const STATUS_DOT: Record<Run['status'], string> = {
  complete: 'bg-emerald-400',
  running: 'bg-sky-400 animate-pulse',
  error: 'bg-red-400',
};

const STATUS_LABEL: Record<Run['status'], string> = {
  complete: 'Complete',
  running: 'Running',
  error: 'Error',
};

const CARD_ACCENT: Record<Run['status'], string> = {
  complete: 'border-l-emerald-500/40',
  running: 'border-l-sky-500/40',
  error: 'border-l-red-500/40',
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    + ' · '
    + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function truncate(text: string, max = 120) {
  if (text.length <= max) return text;
  return text.slice(0, max).trim() + '…';
}

interface RunHistoryListProps {
  initialRuns: Run[];
}

export function RunHistoryList({ initialRuns }: RunHistoryListProps) {
  const [runs, setRuns] = useState(initialRuns);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(run: Run) {
    const confirmed = window.confirm(
      `Delete this run?\n\n"${truncate(run.idea, 80)}"\n\nThis cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingId(run.id);
    setError(null);

    try {
      const res = await fetch(`/api/runs/${run.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Failed to delete run');
      }
      setRuns((prev) => prev.filter((r) => r.id !== run.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete run');
    } finally {
      setDeletingId(null);
    }
  }

  if (runs.length === 0) {
    return (
      <div className="text-center py-16 border border-white/[0.07] rounded-2xl bg-[#111111]">
        <p className="text-[#71717a] mb-4">No runs yet.</p>
        <Link
          href="/"
          className="inline-block bg-white text-black px-6 py-2 rounded-full text-sm font-semibold tracking-[-0.04px] hover:bg-zinc-200 transition-colors"
        >
          Start your first run
        </Link>
      </div>
    );
  }

  return (
    <>
      {error && (
        <p className="text-red-400 bg-red-950/30 border border-red-900/50 rounded-lg p-4 mb-6">
          {error}
        </p>
      )}

      <div className="divide-y divide-white/[0.04]">
        {runs.map((run) => (
          <article
            key={run.id}
            className={`group flex items-start gap-4 py-5 border-l-2 pl-4 transition-colors hover:border-l-white/30 ${CARD_ACCENT[run.status]}`}
          >
            <div className="flex-1 min-w-0">
              <p className="text-[#fafafa] text-[15px] font-medium leading-snug mb-2">
                {truncate(run.idea)}
              </p>
              <div className="flex items-center gap-3 text-xs text-[#71717a]">
                <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${STATUS_DOT[run.status]}`} />
                <span>{STATUS_LABEL[run.status]}</span>
                <span className="text-white/[0.08]">·</span>
                <span>{formatDate(run.created_at)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 pt-0.5">
              {run.status === 'running' && (
                <Link
                  href={`/dashboard?resume=${run.id}`}
                  className="text-xs text-sky-400 hover:text-sky-300 font-medium transition-colors"
                >
                  Resume
                </Link>
              )}
              <Link
                href={`/results/${run.id}`}
                className="text-xs text-[#71717a] hover:text-[#fafafa] px-3 py-1.5 rounded-full border border-white/[0.06] hover:border-white/20 transition-colors"
              >
                View
              </Link>
              <button
                type="button"
                onClick={() => handleDelete(run)}
                disabled={deletingId === run.id}
                className="text-xs text-[#52525b] hover:text-red-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {deletingId === run.id ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
