'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Run } from '@/lib/types';

function StatusBadge({ status }: { status: Run['status'] }) {
  const styles = {
    complete: 'bg-emerald-950 text-emerald-400 border-emerald-800',
    running: 'bg-sky-950 text-sky-400 border-sky-800',
    error: 'bg-red-950 text-red-400 border-red-800',
  };
  return (
    <span
      className={`text-xs font-medium px-2 py-0.5 rounded-full border capitalize ${styles[status]}`}
    >
      {status}
    </span>
  );
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
      <div className="text-center py-16 border border-[#262626] rounded-xl bg-[#111111]">
        <p className="text-[#71717a] mb-4">No runs yet.</p>
        <Link
          href="/"
          className="inline-block bg-white text-black px-6 py-2 rounded-xl font-medium hover:bg-zinc-200"
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

      <div className="grid gap-4">
        {runs.map((run) => (
          <article
            key={run.id}
            className="bg-[#111111] border border-[#262626] rounded-xl p-5 hover:border-[#404040] transition-colors"
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <p className="text-[#fafafa] font-medium flex-1">
                {truncate(run.idea)}
              </p>
              <StatusBadge status={run.status} />
            </div>
            <div className="flex items-center justify-between text-sm gap-4 flex-wrap">
              <span className="text-[#71717a]">
                {new Date(run.created_at).toLocaleString()}
              </span>
              <div className="flex items-center gap-4">
                {run.status === 'running' && (
                  <Link
                    href={`/?resume=${run.id}`}
                    className="text-sky-400 hover:text-sky-300 font-medium"
                  >
                    Resume →
                  </Link>
                )}
                <Link
                  href={`/results/${run.id}`}
                  className="text-[#fafafa] hover:underline font-medium"
                >
                  View →
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(run)}
                  disabled={deletingId === run.id}
                  className="text-red-400/80 hover:text-red-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deletingId === run.id ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
