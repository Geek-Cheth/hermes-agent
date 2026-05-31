'use client';

import { motion } from 'framer-motion';

interface IdeaFormProps {
  idea: string;
  onIdeaChange: (value: string) => void;
  onRun: () => void;
  isRunning: boolean;
  disabled?: boolean;
}

const TEMPLATES: { label: string; idea: string }[] = [
  {
    label: 'AI contract review',
    idea: 'An AI tool for freelancers that reviews any client contract in under 60 seconds — highlights risky clauses, suggests plain-English rewrites, and flags missing IP or payment terms. Priced per review, no subscription.',
  },
  {
    label: 'Food truck ops',
    idea: 'Dead-simple inventory and invoicing app built specifically for food truck owners. Tracks ingredient usage per menu item, generates end-of-day cash reconciliation, and handles sales tax by location automatically.',
  },
  {
    label: 'Job autofill',
    idea: 'Browser extension that converts any job posting into a tailored resume and cover letter, then auto-fills the application form. Learns your tone from past applications. Targets people applying to 10+ jobs per week.',
  },
  {
    label: 'Mod marketplace',
    idea: 'A monetization platform for indie game mod creators — handles licensing, payment splits with the original game dev, and DMCA takedown management. Think Gumroad, but built specifically for the modding ecosystem.',
  },
  {
    label: 'WhatsApp credit',
    idea: 'Micro-lending for informal market traders in Nigeria and Ghana, operated entirely through WhatsApp. Borrow, repay, and build a verifiable credit history via chat — no app install, no bank account required.',
  },
  {
    label: 'Founding stack',
    idea: 'A Stripe Atlas alternative for founders in Southeast Asia and Africa. Company formation in Delaware or Singapore, a US business bank account, and local tax compliance guidance — all from a single dashboard for $99.',
  },
];

export function IdeaForm({
  idea,
  onIdeaChange,
  onRun,
  isRunning,
  disabled,
}: IdeaFormProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <textarea
        className="w-full bg-[#111111] border border-white/[0.07] rounded-2xl p-4 h-32 text-lg text-[#fafafa] placeholder:text-[#71717a] focus:outline-none focus:ring-2 focus:ring-white/10 disabled:opacity-50"
        placeholder="Describe your startup idea in one or two sentences..."
        value={idea}
        onChange={(e) => onIdeaChange(e.target.value)}
        disabled={isRunning || disabled}
      />

      <div className="mt-3 mb-4">
        <p className="text-[10px] uppercase tracking-[0.12em] text-[#52525b] mb-2">
          Try a template
        </p>
        <div className="flex flex-wrap gap-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.label}
              type="button"
              disabled={isRunning || disabled}
              onClick={() => onIdeaChange(t.idea)}
              className="text-xs text-[#71717a] border border-white/[0.07] rounded-full px-3 py-1 hover:border-white/20 hover:text-[#fafafa] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onRun}
        disabled={!idea.trim() || isRunning || disabled}
        className="w-full bg-white text-black py-3 rounded-full text-base font-semibold tracking-[-0.04px] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-200 transition-colors"
      >
        {isRunning ? 'Agent running...' : 'Run agent'}
      </button>
    </motion.div>
  );
}
