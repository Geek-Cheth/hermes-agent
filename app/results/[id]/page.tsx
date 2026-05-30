'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { OutputPanel } from '@/components/OutputPanel';
import { PostCards } from '@/components/PostCards';
import { ProgressTracker } from '@/components/ProgressTracker';
import { Run } from '@/lib/types';

type Tab = 'research' | 'landing' | 'posts' | 'agent';

export default function ResultsPage({ params }: { params: { id: string } }) {
  const [run, setRun] = useState<Run | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('research');

  const fetchRun = useCallback(async () => {
    try {
      const res = await fetch(`/api/runs/${params.id}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Failed to load run');
      }
      const data = (await res.json()) as Run;
      setRun(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchRun();
  }, [fetchRun]);

  const runStatus = run?.status;

  useEffect(() => {
    if (runStatus !== 'running') return;
    const interval = setInterval(fetchRun, 5000);
    return () => clearInterval(interval);
  }, [runStatus, fetchRun]);

  const tabs: { id: Tab; label: string; available: boolean }[] = [
    { id: 'research', label: 'Research', available: !!run?.competitors_md },
    { id: 'landing', label: 'Landing', available: !!run?.landing_html },
    { id: 'posts', label: 'Posts', available: !!run?.posts_md },
    { id: 'agent', label: 'AI Prompts', available: !!run?.agent_prompts_md },
  ];

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="max-w-4xl mx-auto px-6 py-10">
          <p className="text-[#71717a]">Loading results...</p>
        </main>
      </>
    );
  }

  if (error || !run) {
    return (
      <>
        <Navbar />
        <main className="max-w-4xl mx-auto px-6 py-10">
          <p className="text-red-400">{error ?? 'Run not found'}</p>
          <Link href="/" className="mt-4 inline-block text-[#71717a] hover:text-[#fafafa]">
            ← Back
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-10">
        <Link href="/history" className="text-[#71717a] hover:text-[#fafafa] text-sm mb-4 inline-block">
          ← History
        </Link>

        <h1 className="text-3xl font-bold mb-2">Results</h1>
        <p className="text-[#71717a] mb-2 italic line-clamp-2">&ldquo;{run.idea}&rdquo;</p>
        <p className="text-sm text-[#71717a] mb-6">
          <span
            className={`capitalize font-medium ${
              run.status === 'complete'
                ? 'text-emerald-400'
                : run.status === 'error'
                  ? 'text-red-400'
                  : 'text-sky-400'
            }`}
          >
            {run.status}
          </span>
          {run.completed_at && (
            <> · {new Date(run.completed_at).toLocaleString()}</>
          )}
        </p>

        {run.status === 'running' && (
          <div className="mb-6 space-y-4">
            <p className="text-amber-400 text-sm">Agent still running...</p>
            <ProgressTracker tasks={run.tasks} />
            <Link
              href={`/?resume=${params.id}`}
              className="inline-block bg-sky-500 text-black px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-sky-400 transition-colors"
            >
              Resume run →
            </Link>
          </div>
        )}

        <div className="flex gap-2 mb-6 flex-wrap border-b border-[#262626] pb-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => t.available && setTab(t.id)}
              disabled={!t.available}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t.id
                  ? 'bg-[#fafafa] text-black'
                  : t.available
                    ? 'text-[#71717a] hover:text-[#fafafa] hover:bg-[#1a1a1a]'
                    : 'text-[#404040] cursor-not-allowed'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div>
          {tab === 'research' && run.competitors_md && (
            <OutputPanel title="Competitor Research" content={run.competitors_md} />
          )}
          {tab === 'landing' && run.landing_html && (
            <OutputPanel
              title="Landing Page"
              content={run.landing_html}
              language="preview"
              previewUrl={`/api/preview/${params.id}`}
            />
          )}
          {tab === 'posts' && run.posts_md && <PostCards postsMd={run.posts_md} />}
          {tab === 'agent' && run.agent_prompts_md && (
            <OutputPanel
              title="AI Agent Prompts"
              content={run.agent_prompts_md}
              language="markdown"
            />
          )}
        </div>
      </main>
    </>
  );
}
