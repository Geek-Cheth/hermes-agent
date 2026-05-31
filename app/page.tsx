'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

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
      className="text-[#3b5bdb] inline-block"
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
    <div className="min-h-screen bg-white text-black font-sans">

      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-black/[0.06]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center">
              <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5">
                <path d="M3 10.5L7 3.5L11 10.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-tight">StartupForge</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="text-sm text-[#565656] hover:text-black transition-colors px-3 py-1.5"
            >
              Login
            </Link>
            <Link
              href="/sign-up"
              className="text-sm bg-black text-white px-5 py-2 rounded-full font-semibold hover:bg-zinc-800 transition-colors border border-black"
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
            className="font-bold text-black text-center mb-6"
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
            className="text-[#565656] text-center max-w-xl mx-auto mb-8"
            style={{ fontSize: '20px', fontWeight: 500, letterSpacing: '0.1px', lineHeight: '28px' }}
          >
            Describe your startup idea. StartupForge runs four AI tasks —
            all streaming live, one approval at a time.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
            <Link
              href="/sign-up"
              className="w-full sm:w-auto bg-black text-white px-8 py-3 rounded-full text-sm font-semibold hover:bg-zinc-800 transition-colors border border-black"
            >
              Get started
            </Link>
            <Link
              href="/sign-in"
              className="w-full sm:w-auto bg-white text-black px-8 py-3 rounded-full text-sm font-semibold hover:bg-zinc-50 transition-colors border border-black"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Product visual */}
      <section className="px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl overflow-hidden border border-black/10 bg-[#f4f5fb] p-8">
            <div className="bg-white rounded-xl border border-black/[0.08] p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-zinc-200" />
                <div className="w-2 h-2 rounded-full bg-zinc-200" />
                <div className="w-2 h-2 rounded-full bg-zinc-200" />
              </div>
              <div className="space-y-3">
                {['Competitor Research', 'Landing Page', 'Launch Posts', 'AI Agent Prompts'].map((step, i) => (
                  <div key={step} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i === 1 ? 'bg-[#3b5bdb] text-white' : i < 1 ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-400'}`}>
                      {i < 1 ? '✓' : i + 1}
                    </div>
                    <div className={`flex-1 h-2 rounded-full ${i < 1 ? 'bg-black' : i === 1 ? 'bg-[#3b5bdb]/20' : 'bg-zinc-100'}`} style={{ width: i === 1 ? '60%' : '100%' }} />
                    <span className={`text-xs font-medium ${i === 1 ? 'text-[#3b5bdb]' : i < 1 ? 'text-black' : 'text-zinc-300'}`}>
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
      <section className="border-t border-black/[0.06] py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-[#a0a0a0] mb-4 text-center">What it builds</p>
          <h2
            className="font-bold text-black text-center mb-14"
            style={{ fontSize: 'clamp(28px, 4vw, 40px)', letterSpacing: '-0.5px', lineHeight: '1.2' }}
          >
            Four outputs. Zero busywork.
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => (
              <div key={f.title} className="border border-black/[0.08] rounded-2xl p-6 hover:border-black/20 transition-colors">
                <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center mb-4">
                  <span className="text-xs font-bold text-black/40">0{i + 1}</span>
                </div>
                <h3 className="font-semibold text-black text-sm mb-2">{f.title}</h3>
                <p className="text-[#565656] text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-black/[0.06] py-24 px-6 bg-[#f8f9ff]">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-[#a0a0a0] mb-4 text-center">How it works</p>
          <h2
            className="font-bold text-black text-center mb-14"
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
                <span className="text-xs font-mono text-[#a0a0a0] mb-3 block">{h.n}</span>
                <h3 className="font-semibold text-black text-sm mb-2">{h.t}</h3>
                <p className="text-[#565656] text-xs leading-relaxed">{h.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-black/[0.06] py-28 px-6 text-center">
        <div className="max-w-xl mx-auto">
          <h2
            className="font-bold text-black mb-4"
            style={{ fontSize: 'clamp(28px, 4vw, 44px)', letterSpacing: '-0.5px', lineHeight: '1.15' }}
          >
            Your idea deserves a launch kit.
          </h2>
          <p className="text-[#565656] mb-8 text-lg">No credit card. Takes 2 minutes.</p>
          <Link
            href="/sign-up"
            className="inline-block bg-black text-white px-10 py-3.5 rounded-full text-sm font-semibold hover:bg-zinc-800 transition-colors border border-black"
          >
            Get started free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/[0.06] py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-[#a0a0a0]">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-black flex items-center justify-center">
              <svg viewBox="0 0 10 10" fill="none" className="w-2.5 h-2.5">
                <path d="M2 7.5L5 2.5L8 7.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span>StartupForge</span>
          </div>
          <span>Built with Hermes Agent</span>
        </div>
      </footer>
    </div>
  );
}
