'use client';

import { motion } from 'framer-motion';

interface IdeaFormProps {
  idea: string;
  onIdeaChange: (value: string) => void;
  onRun: () => void;
  isRunning: boolean;
  disabled?: boolean;
}

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
        className="w-full bg-[#111111] border border-[#262626] rounded-xl p-4 h-32 text-lg text-[#fafafa] placeholder:text-[#71717a] focus:outline-none focus:ring-2 focus:ring-white/10 disabled:opacity-50"
        placeholder="e.g. A tool that turns Notion pages into beautiful email newsletters..."
        value={idea}
        onChange={(e) => onIdeaChange(e.target.value)}
        disabled={isRunning || disabled}
      />

      <button
        onClick={onRun}
        disabled={!idea.trim() || isRunning || disabled}
        className="mt-4 w-full bg-white text-black py-3 rounded-xl text-lg font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-200 transition-colors"
      >
        {isRunning ? 'Agent running...' : 'Run agent'}
      </button>
    </motion.div>
  );
}
