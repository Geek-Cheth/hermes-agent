'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Logo } from '@/components/Logo';

const ROTATING_WORDS = [
  'competitor research',
  'a landing page',
  'launch posts',
  'AI agent prompts',
];

const FEATURES = [
  {
    title: 'Competitor Research',
    desc: 'Live web search across your market. Rivals, gaps, positioning angles.',
  },
  {
    title: 'Landing Page',
    desc: 'Full HTML page, previewed live. Waitlist form included, ready to ship.',
  },
  {
    title: 'Launch Posts',
    desc: 'Product Hunt, X, LinkedIn, HN — each tuned to the platform.',
  },
  {
    title: 'AI Agent Prompts',
    desc: 'System prompts for support bots, sales assistants, onboarding flows.',
  },
];

function RotatingText() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % ROTATING_WORDS.length);
        setVisible(true);
      }, 300);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className="text-[#5c7cfa] inline-block"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
      }}
    >
      {ROTATING_WORDS[index]}
    </span>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#fafafa] font-sans">

      {/* Nav */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo withWordmark href="/" />
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="text-sm text-[#a1a1aa] hover:text-[#fafafa] transition-colors px-3 py-1.5"
            >
              Login
            </Link>
            <Link
              href="/sign-up"
              className="text-sm bg-[#fafafa] text-[#0a0a0a] px-5 py-2 rounded-full font-semibold hover:bg-zinc-200 transition-colors border border-[#fafafa]"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-20 pb-8 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1
            className="font-bold text-[#fafafa] text-center mb-6"
            style={{
              fontSize: 'clamp(40px, 6vw, 60px)',
              lineHeight: '1.1',
              letterSpacing: '-1px',
            }}
          >
            The AI launch kit for
            <br />
            <RotatingText />
          </h1>

          <p
            className="text-[#a1a1aa] text-center max-w-xl mx-auto mb-8"
            style={{ fontSize: '20px', fontWeight: 500, letterSpacing: '0.1px', lineHeight: '28px' }}
          >
            Describe your startup idea. StartupForge runs four AI tasks —
            all streaming live, one approval at a time.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
            <Link
              href="/sign-up"
              className="w-full sm:w-auto bg-[#fafafa] text-[#0a0a0a] px-8 py-3 rounded-full text-sm font-semibold hover:bg-zinc-200 transition-colors border border-[#fafafa]"
            >
              Get started
            </Link>
            <Link
              href="/sign-in"
              className="w-full sm:w-auto bg-transparent text-[#fafafa] px-8 py-3 rounded-full text-sm font-semibold hover:bg-white/[0.05] transition-colors border border-white/20"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Product visual */}
      <section className="px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl overflow-hidden border border-white/[0.08] bg-[#111111] p-8">
            <div className="bg-[#1a1a1a] rounded-xl border border-white/[0.08] p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-zinc-700" />
                <div className="w-2 h-2 rounded-full bg-zinc-700" />
                <div className="w-2 h-2 rounded-full bg-zinc-700" />
              </div>
              <div className="space-y-3">
                {['Competitor Research', 'Landing Page', 'Launch Posts', 'AI Agent Prompts'].map((step, i) => (
                  <div key={step} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i === 1 ? 'bg-[#5c7cfa] text-white' : i < 1 ? 'bg-[#fafafa] text-[#0a0a0a]' : 'bg-zinc-800 text-zinc-500'}`}>
                      {i < 1 ? '✓' : i + 1}
                    </div>
                    <div className={`flex-1 h-2 rounded-full ${i < 1 ? 'bg-[#fafafa]' : i === 1 ? 'bg-[#5c7cfa]/20' : 'bg-zinc-800'}`} style={{ width: i === 1 ? '60%' : '100%' }} />
                    <span className={`text-xs font-medium ${i === 1 ? 'text-[#5c7cfa]' : i < 1 ? 'text-[#fafafa]' : 'text-zinc-600'}`}>
                      {i === 1 ? 'running…' : i < 1 ? 'done' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-white/[0.06] py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-[#71717a] mb-4 text-center">What it builds</p>
          <h2
            className="font-bold text-[#fafafa] text-center mb-14"
            style={{ fontSize: 'clamp(28px, 4vw, 40px)', letterSpacing: '-0.5px', lineHeight: '1.2' }}
          >
            Four outputs. Zero busywork.
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => (
              <div key={f.title} className="border border-white/[0.08] rounded-2xl p-6 hover:border-white/20 transition-colors">
                <div className="w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center mb-4">
                  <span className="text-xs font-bold text-[#71717a]">0{i + 1}</span>
                </div>
                <h3 className="font-semibold text-[#fafafa] text-sm mb-2">{f.title}</h3>
                <p className="text-[#a1a1aa] text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-white/[0.06] py-24 px-6 bg-[#111111]">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-[#71717a] mb-4 text-center">How it works</p>
          <h2
            className="font-bold text-[#fafafa] text-center mb-14"
            style={{ fontSize: 'clamp(28px, 4vw, 40px)', letterSpacing: '-0.5px', lineHeight: '1.2' }}
          >
            Submit once. Review at each step.
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { n: '01', t: 'Describe your idea', d: 'One sentence. No deck needed.' },
              { n: '02', t: 'Watch it stream', d: 'Every line generated live — no black box.' },
              { n: '03', t: 'Approve & continue', d: 'Review output before the next task starts.' },
              { n: '04', t: 'Export everything', d: 'Download the page, copy posts, use prompts.' },
            ].map((h) => (
              <div key={h.n}>
                <span className="text-xs font-mono text-[#71717a] mb-3 block">{h.n}</span>
                <h3 className="font-semibold text-[#fafafa] text-sm mb-2">{h.t}</h3>
                <p className="text-[#a1a1aa] text-xs leading-relaxed">{h.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/[0.06] py-28 px-6 text-center">
        <div className="max-w-xl mx-auto">
          <h2
            className="font-bold text-[#fafafa] mb-4"
            style={{ fontSize: 'clamp(28px, 4vw, 44px)', letterSpacing: '-0.5px', lineHeight: '1.15' }}
          >
            Your idea deserves a launch kit.
          </h2>
          <p className="text-[#a1a1aa] mb-8 text-lg">No credit card. Takes 2 minutes.</p>
          <Link
            href="/sign-up"
            className="inline-block bg-[#fafafa] text-[#0a0a0a] px-10 py-3.5 rounded-full text-sm font-semibold hover:bg-zinc-200 transition-colors border border-[#fafafa]"
          >
            Get started free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-[#71717a]">
          <Logo withWordmark href="/" markSize={16} />
          <span>Built with Hermes Agent</span>
        </div>
      </footer>
    </div>
  );
}
